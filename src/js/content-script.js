// JS Content Script

console.info('LOADED: content-script.js')

window.addEventListener('DOMContentLoaded', domContentLoaded)

if (!chrome.storage.onChanged.hasListener(onChanged)) {
    chrome.storage.onChanged.addListener(onChanged)
}

async function domContentLoaded() {
    console.info('domContentLoaded')
    const { options } = await chrome.storage.sync.get(['options'])
    console.debug('options:', options)
    if (options.highlightTable) {
        highlightTableRows()
    }
    if (
        options.updateEntry &&
        document.URL.includes('aviation-safety.net/wikibase/')
    ) {
        updateEntryTable()
        updateLastUpdated()
    }
}

// ;(async () => {
//     console.info('async')
//     highlightTableRows()
//     if (document.URL.includes('aviation-safety.net/wikibase/')) {
//         updateEntryTable()
//         updateLastUpdated()
//     }
// })()

/**
 * On Changed Callback
 * @function onChanged
 * @param {Object} changes
 * @param {String} namespace
 */
async function onChanged(changes, namespace) {
    console.debug('onChanged:', changes, namespace)
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (namespace === 'sync' && key === 'options') {
            if (oldValue.darkMode !== newValue.darkMode) {
                console.log('darkMode:', oldValue, newValue)
                if (newValue.darkMode) {
                    const message = { dark: 'on' }
                    await chrome.runtime.sendMessage(message)
                    // const response = await chrome.runtime.sendMessage(message)
                    // console.debug('response:', response)
                    // await enableDarkMode()
                } else {
                    const message = { dark: 'off' }
                    await chrome.runtime.sendMessage(message)
                    // const response = await chrome.runtime.sendMessage(message)
                    // console.debug('response:', response)
                    // disableDarkMode()
                }
            } else if (oldValue.highlightTable !== newValue.highlightTable) {
                console.log('highlightTable:', oldValue, newValue)
                if (newValue.highlightTable) {
                    highlightTableRows()
                }
            } else if (oldValue.updateEntry !== newValue.updateEntry) {
                console.log('updateEntry:', oldValue, newValue)
                if (
                    newValue.updateEntry &&
                    document.URL.includes('aviation-safety.net/wikibase/')
                ) {
                    updateEntryTable()
                    updateLastUpdated()
                }
            }
        }
    }
}

// async function enableDarkMode() {
//     // console.log('enableDarkMode')
//     // const message = { message: 'my eyes' }
//     // // console.log('message:', message)
//     // const response = await chrome.runtime.sendMessage(message)
//     // console.log('response:', response)
//
//     // const href = chrome.runtime.getURL('css/dark.css')
//     // $('head').append(`<link rel="stylesheet" href="${href}" type="text/css" />`)
//
//     // const link = document.createElement('link')
//     // link.href = chrome.runtime.getURL('css/dark.css')
//     // link.type = 'text/css'
//     // link.rel = 'stylesheet'
//     // link.id = 'dark-css-link'
//     // document.head.appendChild(link)
//
//     const href = chrome.runtime.getURL('css/dark.css')
//     $('<link/>', {
//         id: 'dark-css-link',
//         rel: 'stylesheet',
//         type: 'text/css',
//         href: href,
//     }).appendTo('body')
// }
//
// function disableDarkMode() {
//     document.getElementById('dark-css-link')?.remove()
// }
