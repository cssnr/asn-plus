// JS Background Service Worker

import { checkPerms, getSearchURL } from './export.js'

chrome.runtime.onStartup.addListener(onStartup)
chrome.runtime.onInstalled.addListener(onInstalled)
chrome.runtime.onMessage.addListener(onMessage)
chrome.contextMenus.onClicked.addListener(onClicked)
chrome.commands.onCommand.addListener(onCommand)
chrome.storage.onChanged.addListener(onChanged)

const asnHomePageURL = 'https://aviation-safety.net/'
const uninstallURL = 'https://asn-plus.cssnr.com/uninstall/'

/**
 * On Startup Callback
 * @function onStartup
 */
async function onStartup() {
    console.log('onStartup')
    if (typeof browser !== 'undefined') {
        console.log('Firefox CTX Menu Workaround')
        const { options } = await chrome.storage.sync.get(['options'])
        console.debug('options:', options)
        if (options.contextMenu) {
            createContextMenus()
        }
    }
}

/**
 * On Installed Callback
 * @function onInstalled
 * @param {InstalledDetails} details
 */
async function onInstalled(details) {
    console.log('onInstalled:', details)
    const githubURL = 'https://github.com/cssnr/asn-plus'
    const options = await Promise.resolve(
        setDefaultOptions({
            darkMode: true,
            highlightTable: true,
            updateEntry: true,
            updateNavigation: true,
            hideHeaderImage: true,
            searchType: 'registration',
            contextMenu: true,
            showUpdate: false,
        })
    )
    console.debug('options:', options)
    if (options.contextMenu) {
        createContextMenus()
    }
    if (options.darkMode) {
        await registerDarkMode()
    }
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        const hasPerms = await checkPerms()
        console.debug('hasPerms:', hasPerms)
        if (hasPerms) {
            chrome.runtime.openOptionsPage()
        } else {
            const url = chrome.runtime.getURL('/html/oninstall.html')
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
    await chrome.runtime.setUninstallURL(uninstallURL)
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
    if (message.dark) {
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
    } else {
        console.warn('Unmatched Message:', message)
        sendResponse('NOT Handled')
    }
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
        await chrome.tabs.create({ active: true, url: asnHomePageURL })
    } else if (['registration', 'operator'].includes(ctx.menuItemId)) {
        console.debug(`${ctx.menuItemId}: ${ctx.selectionText}`)
        const url = getSearchURL(ctx.selectionText, ctx.menuItemId)
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
        await chrome.tabs.create({ active: true, url: asnHomePageURL })
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
                    console.info('Enabled contextMenu...')
                    createContextMenus()
                } else {
                    console.info('Disabled contextMenu...')
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

/**
 * Register Dark Mode Content Script, yea its that hard
 * @function registerDarkMode
 */
async function registerDarkMode() {
    const asnDark = {
        id: 'asn-dark',
        css: ['css/dark.css'],
        matches: ['*://aviation-safety.net/*'],
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
        console.log('Error scripting.registerContentScripts', e)
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
        [['selection'], 'operator', 'normal', 'Operator Search'],
        [['selection'], 'registration', 'normal', 'Registration Search'],
        [['selection'], 'separator-1', 'separator', 'separator'],
        [['selection'], 'openHome', 'normal', 'ASN Home'],
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
 * @return {Object}
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
