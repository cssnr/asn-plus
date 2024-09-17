// JS Background Service Worker

import {
    activateOrOpen,
    checkPerms,
    getSearchURL,
    githubURL,
} from './export.js'

chrome.runtime.onInstalled.addListener(onInstalled)
chrome.runtime.onStartup.addListener(onStartup)
chrome.runtime.onMessage.addListener(onMessage)
chrome.contextMenus.onClicked.addListener(onClicked)
chrome.commands.onCommand.addListener(onCommand)
chrome.storage.onChanged.addListener(onChanged)
chrome.omnibox.onInputChanged.addListener(onInputChanged)
chrome.omnibox.onInputCancelled.addListener(onInputCancelled)
chrome.omnibox.onInputEntered.addListener(onInputEntered)

const omniboxDefault = 'ASN - registration OR operator Search'
const asnHomePageURL = 'https://asn.flightsafety.org/'

chrome.alarms.onAlarm.addListener(onAlarm)
// noinspection JSIgnoredPromiseFromCall
chrome.alarms.create('checkUpdates', { periodInMinutes: 1 })

async function onAlarm(alarmInfo) {
    console.debug('onAlarm:', alarmInfo)
    // const now = Date.now()
    // console.log('now:', now)
    const { options } = await chrome.storage.sync.get(['options'])
    console.debug('checkUpdates:', options.checkUpdates)
    if (!options.checkUpdates) {
        console.debug('Skipping Updates Check')
        return
    }
    console.debug('checkFrequency:', options.checkFrequency)
    let { lastChecked } = await chrome.storage.local.get(['lastChecked'])
    console.debug('lastChecked:', lastChecked)
    const diff = alarmInfo.scheduledTime - lastChecked
    console.debug('diff:', diff)
    const last = Math.floor(diff / 1000 / 60)
    console.debug('last:', last)
    if (!diff || last >= options.checkFrequency) {
        await chrome.storage.local.set({
            lastChecked: alarmInfo.scheduledTime,
        })
        await checkUpdates(options)
    }
}

async function checkUpdates(options) {
    console.debug('%cChecking Updates Now', 'color: Lime')
    console.debug('checkURL:', options.checkURL)
}

/**
 * On Installed Callback
 * @function onInstalled
 * @param {InstalledDetails} details
 */
async function onInstalled(details) {
    console.log('onInstalled:', details)
    const options = await setDefaultOptions({
        darkMode: true,
        highlightTable: true,
        updateEntry: true,
        expandImages: true,
        hideEntryWarning: true,
        updateNavigation: true,
        hideHeaderImage: true,
        enableKeyboard: true,
        increaseMaxWidth: false,
        countryDisplay: 'USA',
        countryCode: 'N',
        searchType: 'registration',
        speechVoice: '',
        speechRate: '1.1',
        autoFill: false,
        asnUsername: '',
        asnEmail: '',
        radioBackground: 'bgPicture',
        pictureURL: 'https://images.cssnr.com/aviation',
        checkUpdates: false,
        checkURL: 'https://asn.flightsafety.org/asndb/year/2024',
        checkFrequency: '15',
        contextMenu: true,
        showUpdate: false,
    })
    console.debug('options:', options)
    if (options.contextMenu) {
        createContextMenus()
    }
    if (options.darkMode) {
        await registerDarkMode()
    }
    await registerContentScripts()
    // if (options.autoFill) {
    //     const hasPerms = await checkPerms([
    //         '*://registry.faa.gov/AircraftInquiry/Search/*',
    //     ])
    //     if (hasPerms) {
    //         await registerContentScripts()
    //     }
    // }
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        const hasPerms = await checkPerms()
        console.debug('hasPerms:', hasPerms)
        if (hasPerms) {
            chrome.runtime.openOptionsPage()
        } else {
            const url = chrome.runtime.getURL('/html/permissions.html')
            await chrome.tabs.create({ active: true, url })
        }
    } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
        if (options.showUpdate) {
            const manifest = chrome.runtime.getManifest()
            if (manifest.version !== details.previousVersion) {
                const url = `${githubURL}/releases/tag/${manifest.version}`
                await chrome.tabs.create({ active: false, url })
            }
        }
    }
    setUninstallURL()
}

/**
 * On Startup Callback
 * @function onStartup
 */
async function onStartup() {
    console.log('onStartup')
    // noinspection JSUnresolvedReference
    if (typeof browser !== 'undefined') {
        console.log('Firefox Startup Workarounds')
        const { options } = await chrome.storage.sync.get(['options'])
        console.debug('options:', options)
        if (options.contextMenu) {
            createContextMenus()
        }
        setUninstallURL()
    }
}

function setUninstallURL() {
    const manifest = chrome.runtime.getManifest()
    const url = new URL('https://asn-plus.cssnr.com/uninstall/')
    url.searchParams.append('version', manifest.version)
    chrome.runtime.setUninstallURL(url.href)
    console.debug(`setUninstallURL: ${url.href}`)
    chrome.runtime.setUninstallURL(url.href)
}

/**
 * On Message Callback
 * The sendResponse function does not work if this is an async function
 * @function onMessage
 * @param {Object} message
 * @param {MessageSender} sender
 * @param {Function} sendResponse
 */
function onMessage(message, sender, sendResponse) {
    console.debug('onMessage: message, sender:', message, sender, sendResponse)
    if (message === 'extraPerms') {
        chrome.permissions
            .contains({
                origins: [
                    '*://registry.faa.gov/AircraftInquiry/Search/*',
                    '*://wwwapps.tc.gc.ca/saf-sec-sur/2/ccarcs-riacc/*',
                ],
            })
            .then((perms) => {
                console.log('perms', perms)
                sendResponse(perms)
            })
        return true
    } else if (message === 'openOptionsPage') {
        chrome.runtime.openOptionsPage()
    } else if (message.dark) {
        const darkCss = {
            files: ['css/dark.css'],
            target: {
                tabId: sender.tab.id,
            },
        }
        console.debug(`SW: Dark Mode: ${message.dark}`, darkCss)
        if (message.dark === 'off') {
            try {
                chrome.scripting.removeCSS(darkCss)
            } catch (e) {
                console.warn('e', e)
            }
        } else if (message.dark === 'on') {
            try {
                chrome.scripting.insertCSS(darkCss)
            } catch (e) {
                console.warn('e', e)
            }
        }
        sendResponse('Success')
    } else if (message.registration) {
        console.debug('message.registration:', message.registration)
        processRegistration(message.registration, sender, sendResponse)
    } else if (message.autofill) {
        console.debug('autofill:', message.autofill)
        const tabID = parseInt(message.autofill.tab)
        console.debug('tabID:', tabID)
        chrome.tabs.sendMessage(tabID, message.autofill)
    } else {
        console.warn('Unmatched Message:', message)
        sendResponse('NOT Handled')
    }
}

function processRegistration(registration, sender, sendResponse) {
    console.debug('processRegistration', registration, sender, sendResponse)
    const value = registration.toLowerCase()
    console.debug('value', value)
    let url
    if (value.startsWith('n')) {
        url = new URL(
            'https://registry.faa.gov/AircraftInquiry/Search/NNumberResult'
        )
        url.searchParams.append('nNumberTxt', value)
        // console.log('url', url)
    } else if (value.startsWith('c')) {
        url = new URL(
            'https://wwwapps.tc.gc.ca/saf-sec-sur/2/ccarcs-riacc/RchSimp.aspx'
        )
        url.searchParams.append('registration', value)
        // console.log('url', url)
    } else {
        console.debug('Unsupported Registration.')
        sendResponse('Unsupported Registration.')
        return
    }
    url.searchParams.append('tab', sender.tab.id.toString())
    console.debug('url', url)
    chrome.tabs.create({ active: false, url: url.href })
}

/**
 * On Clicked Callback
 * @function onClicked
 * @param {OnClickData} ctx
 * @param {chrome.tabs.Tab} tab
 */
async function onClicked(ctx, tab) {
    console.debug('onClicked:', ctx, tab)
    if (ctx.menuItemId === 'options') {
        chrome.runtime.openOptionsPage()
    } else if (ctx.menuItemId === 'openHome') {
        await activateOrOpen(asnHomePageURL)
    } else if (['registration', 'operator'].includes(ctx.menuItemId)) {
        console.debug(`${ctx.menuItemId}: ${ctx.selectionText}`)
        const url = getSearchURL(ctx.menuItemId, ctx.selectionText)
        console.log('url:', url)
        await chrome.tabs.create({ active: true, url })
    } else {
        console.warn(`Unknown ctx.menuItemId: ${ctx.menuItemId}`)
    }
}

/**
 * On Command Callback
 * @function onCommand
 * @param {String} command
 */
async function onCommand(command) {
    console.debug('onCommand:', command)
    if (command === 'openHome') {
        await activateOrOpen(asnHomePageURL)
    } else {
        console.warn('Unknown command:', command)
    }
}

/**
 * On Changed Callback
 * @function onChanged
 * @param {Object} changes
 * @param {String} namespace
 */
function onChanged(changes, namespace) {
    // console.debug('onChanged:', changes, namespace)
    for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (namespace === 'sync' && key === 'options' && oldValue && newValue) {
            if (oldValue.contextMenu !== newValue.contextMenu) {
                if (newValue?.contextMenu) {
                    console.log('Enabled contextMenu...')
                    createContextMenus()
                } else {
                    console.log('Disabled contextMenu...')
                    chrome.contextMenus.removeAll()
                }
            }
            if (oldValue.darkMode !== newValue.darkMode) {
                if (newValue?.darkMode) {
                    console.debug('Register Dark Mode.')
                    registerDarkMode()
                } else {
                    console.debug('Unregister Dark Mode.')
                    chrome.scripting.unregisterContentScripts({
                        ids: ['asn-dark'],
                    })
                }
            }
        }
    }
}

async function parseInput(text) {
    console.debug('parseInput:', text)
    text = text.trim()
    const split = text.split(' ')
    const length = split.length
    let command = split.shift().toLowerCase()
    let search = split.join('')
    if (length === 1) {
        command = ''
        search = text
    }
    console.debug('command:', command)
    if (command.startsWith('r') && 'registration'.includes(command)) {
        return ['registration', search]
    } else if (command.startsWith('o') && 'operator'.includes(command)) {
        return ['operator', search]
    } else {
        search = text.replace(/ /g, '')
        let { options } = await chrome.storage.sync.get(['options'])
        return [options.searchType, search]
    }
}

/**
 * Omnibox Input Changed Callback
 * @function onInputChanged
 * @param {String} text
 * @param {Function} suggest
 */
async function onInputChanged(text, suggest) {
    console.debug('onInputChanged:', text, suggest)
    text = text.trim()
    const split = text.split(' ')
    // console.debug('split:', split)
    if (split.length) {
        let command = split.shift().toLowerCase()
        // console.debug('command:', command)
        let search = split.join('')
        console.debug('search:', search)
        if (command.startsWith('r') && 'registration'.includes(command)) {
            chrome.omnibox.setDefaultSuggestion({
                description: 'ASN - Registration Search',
            })
        } else if (command.startsWith('o') && 'operator'.includes(command)) {
            chrome.omnibox.setDefaultSuggestion({
                description: 'ASN - Operator Search',
            })
        } else {
            let { options } = await chrome.storage.sync.get(['options'])
            // search = text.replace(/\s/g, '')
            const type =
                options.searchType.charAt(0).toUpperCase() +
                options.searchType.slice(1)
            chrome.omnibox.setDefaultSuggestion({
                description: `Aviation Tools - ${type} Search`,
            })
        }
    }
}

/**
 * Omnibox Input Cancelled Callback
 * @function onInputCancelled
 */
async function onInputCancelled() {
    console.debug('onInputCancelled')
    chrome.omnibox.setDefaultSuggestion({
        description: omniboxDefault,
    })
}

/**
 * Omnibox Input Entered Callback
 * @function onInputEntered
 * @param {String} text
 */
async function onInputEntered(text) {
    console.debug('onInputEntered:', text)
    text = text.trim()
    // console.debug('text:', text)
    let [type, search] = await parseInput(text)
    console.debug('type:', type)
    console.debug('search:', search)
    let url
    if (!search) {
        url = 'https://asn.flightsafety.org/wikibase/wikisearch.php'
    } else {
        url = getSearchURL(type, search)
    }
    console.log('url:', url)
    await chrome.tabs.create({ active: true, url })
}

/**
 * Register Dark Mode Content Script, yea its that hard
 * @function registerDarkMode
 */
async function registerDarkMode() {
    const asnDark = {
        id: 'asn-dark',
        css: ['css/dark.css'],
        matches: ['*://asn.flightsafety.org/*'],
        runAt: 'document_start',
    }
    console.log('registerDarkMode', asnDark)
    // const scripts = await chrome.scripting.getRegisteredContentScripts()
    // for (const script of scripts) {
    //     if (script.id === asnDark.id) {
    //         return console.debug('darkMode already registered')
    //     }
    // }
    try {
        await chrome.scripting.registerContentScripts([asnDark])
    } catch (e) {
        console.warn('Error scripting.registerContentScripts', e)
    }
}

/**
 * Extra content-scripts have to be registered post-install in order to be an optional permission
 * @function registerDarkMode
 */
async function registerContentScripts() {
    const faa = {
        id: 'faa',
        js: ['js/extra/faa.js'],
        matches: ['*://registry.faa.gov/AircraftInquiry/Search/*'],
    }
    const cca = {
        id: 'cca',
        js: ['js/extra/cca.js'],
        matches: ['*://wwwapps.tc.gc.ca/saf-sec-sur/2/ccarcs-riacc/*'],
    }
    console.log('Register Extra Content Scripts:', faa, cca)
    try {
        await chrome.scripting.registerContentScripts([faa, cca])
    } catch (e) {
        console.warn('Error scripting.registerContentScripts', e)
    }
}

/**
 * Create Context Menus
 * @function createContextMenus
 */
function createContextMenus() {
    console.debug('createContextMenus')
    chrome.contextMenus.removeAll()
    const contexts = [
        [['selection'], 'registration', 'normal', 'Registration Search'],
        [['selection'], 'operator', 'normal', 'Operator Search'],
        [['selection'], 'separator-1', 'separator', 'separator'],
        [['selection'], 'openHome', 'normal', 'ASN Home Page'],
        [['selection'], 'options', 'normal', 'Open Options'],
    ]
    contexts.forEach((context) => {
        chrome.contextMenus.create({
            contexts: context[0],
            id: context[1],
            type: context[2],
            title: context[3],
        })
    })
}

/**
 * Set Default Options
 * @function setDefaultOptions
 * @param {Object} defaultOptions
 * @return {Promise<*|Object>}
 */
async function setDefaultOptions(defaultOptions) {
    console.log('setDefaultOptions', defaultOptions)
    let { options } = await chrome.storage.sync.get(['options'])
    options = options || {}
    let changed = false
    for (const [key, value] of Object.entries(defaultOptions)) {
        // console.log(`${key}: default: ${value} current: ${options[key]}`)
        if (options[key] === undefined) {
            changed = true
            options[key] = value
            console.log(`Set ${key}:`, value)
        }
    }
    if (changed) {
        await chrome.storage.sync.set({ options })
        console.log('changed:', options)
    }
    return options
}
