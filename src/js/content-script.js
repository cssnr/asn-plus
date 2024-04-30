// JS Content Script

console.info('LOADED: content-script.js')

window.addEventListener('DOMContentLoaded', domContentLoaded)

if (!chrome.storage.onChanged.hasListener(onChanged)) {
    chrome.storage.onChanged.addListener(onChanged)
}

// ;(async () => {
//     console.info('async')
//     highlightTableRows()
//     if (document.URL.includes('aviation-safety.net/wikibase/')) {
//         updateEntryTable()
//         updateLastUpdated()
//     }
// })()

async function domContentLoaded() {
    console.info('domContentLoaded')
    const { options } = await chrome.storage.sync.get(['options'])
    console.debug('options:', options)
    processOptions(options)
}

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
                if (newValue.darkMode) {
                    const message = { dark: 'on' }
                    await chrome.runtime.sendMessage(message)
                } else {
                    const message = { dark: 'off' }
                    await chrome.runtime.sendMessage(message)
                }
            } else {
                processOptions(newValue)
            }
        }
    }
}

function processOptions(options) {
    if (options.hideHeaderImage) {
        hideHeaderImage()
    }
    if (options.updateNavigation) {
        updateNavigation()
    }
    if (options.highlightTable) {
        highlightTableRows()
    }
    if (
        options.updateEntry &&
        /^\/wikibase\/\d+/.test(window.location.pathname)
    ) {
        updateEntryTable()
        updateLastUpdated()
    }
}
