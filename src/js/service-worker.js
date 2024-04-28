// JS Background Service Worker

chrome.runtime.onStartup.addListener(onStartup)
chrome.runtime.onInstalled.addListener(onInstalled)
chrome.contextMenus.onClicked.addListener(onClicked)
chrome.commands.onCommand.addListener(onCommand)
chrome.runtime.onMessage.addListener(onMessage)
chrome.storage.onChanged.addListener(onChanged)

/**
 * On Startup Callback
 * @function onStartup
 */
function onStartup() {
    console.log('onStartup')
    // if (typeof browser !== 'undefined') {
    //     console.log('FireFox Startup - Fix for Bug')
    //     const { options } = await chrome.storage.sync.get(['options'])
    //     console.debug('options:', options)
    //     if (options.contextMenu) {
    //         createContextMenus()
    //     }
    // }
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
            contextMenu: true,
            showUpdate: false,
            darkMode: true,
            searchType: 'registration',
            testInput: 'Default Value',
        })
    )
    console.debug('options:', options)
    if (options.contextMenu) {
        createContextMenus()
    }
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        const hasPerms = await chrome.permissions.contains({
            origins: [
                'http://aviation-safety.net/*',
                'https://aviation-safety.net/*',
            ],
        })
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
    await chrome.runtime.setUninstallURL(`${githubURL}/issues`)
    if (options.darkMode) {
        await registerDarkMode()
    }
}

/**
 * On Message Callback
 * @function onMessage
 * @param {Object} message
 * @param {MessageSender} sender
 * @param {Function} sendResponse
 */
function onMessage(message, sender, sendResponse) {
    console.debug('onMessage: message, sender:', message, sender, sendResponse)
    const darkCss = {
        files: ['css/dark.css'],
        target: {
            tabId: sender.tab.id,
        },
    }
    if (message.dark === 'off') {
        console.info('SW: Dark Mode OFF')
        chrome.scripting.unregisterContentScripts({ ids: ['asn-dark'] }).then()
        try {
            chrome.scripting.removeCSS(darkCss).then()
        } catch (e) {
            console.warn('e', e)
        }
    } else if (message.dark === 'on') {
        console.info('SW: Dark Mode ON')
        registerDarkMode().then()
        try {
            chrome.scripting.insertCSS(darkCss).then()
        } catch (e) {
            console.warn('e', e)
        }
    } else {
        console.log('sendResponse: not matched')
        return sendResponse('NO Action for message')
    }
    console.log('sendResponse: success')
    sendResponse('Success')
}

async function registerDarkMode() {
    const asnDark = {
        id: 'asn-dark',
        css: ['css/dark.css'],
        matches: [
            'http://aviation-safety.net/*',
            'https://aviation-safety.net/*',
        ],
        runAt: 'document_start',
    }
    try {
        await chrome.scripting.registerContentScripts([asnDark])
    } catch (e) {
        console.error('failed to register content scripts', e)
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
        const url = chrome.runtime.getURL('/html/home.html')
        await chrome.tabs.create({ active: true, url })
    } else if (ctx.menuItemId === 'showPage') {
        await chrome.windows.create({
            type: 'detached_panel',
            url: '/html/page.html',
            width: 720,
            height: 480,
        })
    } else {
        console.error(`Unknown ctx.menuItemId: ${ctx.menuItemId}`)
    }
}

/**
 * On Command Callback
 * @function onCommand
 * @param {String} command
 */
async function onCommand(command) {
    console.debug(`onCommand: ${command}`)
    if (command === 'openHome') {
        const url = chrome.runtime.getURL('/html/home.html')
        await chrome.tabs.create({ active: true, url })
    } else if (command === 'showPage') {
        await chrome.windows.create({
            type: 'detached_panel',
            url: '/html/page.html',
            width: 480,
            height: 360,
        })
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
        }
    }
}

/**
 * Create Context Menus
 * @function createContextMenus
 */
function createContextMenus() {
    console.debug('createContextMenus')
    chrome.contextMenus.removeAll()
    const ctx = ['all']
    const contexts = [
        [ctx, 'openHome', 'normal', 'Home Page'],
        [ctx, 'showPage', 'normal', 'Extension Page'],
        [ctx, 'separator-1', 'separator', 'separator'],
        [ctx, 'options', 'normal', 'Open Options'],
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
