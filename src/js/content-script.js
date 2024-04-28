// JS Content Script

;(async () => {
    // get options
    const { options } = await chrome.storage.sync.get(['options'])
    console.log('options:', options)

    if (options.darkMode) {
        console.info('CSS Activation...')
        await enableDarkMode()
    }

    console.info('JS Activation...')
    highlightTableRows()
    if (document.URL.includes('aviation-safety.net/wikibase/')) {
        updateEntryTable()
        updateLastUpdated()
    }

    console.info('Listener Activation...')
    if (!chrome.storage.onChanged.hasListener(onChanged)) {
        console.debug('Adding onChanged Listener')
        chrome.storage.onChanged.addListener(onChanged)
    }
})()

// window.addEventListener('DOMContentLoaded', domContentLoaded)
//
// async function domContentLoaded() {
//     // get options
//     const { options } = await chrome.storage.sync.get(['options'])
//     console.log('options:', options)
//
//     console.info('CSS Activation...')
//     if (options.darkMode) {
//         const href = chrome.runtime.getURL('css/dark.css')
//         $('<link/>', {
//             rel: 'stylesheet',
//             type: 'text/css',
//             href: href,
//         }).appendTo('body')
//     }
//
//     console.info('JS Activation...')
//     highlightTableRows()
//     if (document.URL.includes('aviation-safety.net/wikibase/')) {
//         updateEntryTable()
//         updateLastUpdated()
//     }
//
//     console.info('Listener Activation...')
//     if (!chrome.storage.onChanged.hasListener(onChanged)) {
//         console.debug('Adding onChanged Listener')
//         chrome.storage.onChanged.addListener(onChanged)
//     }
// }

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
                console.debug('Update Dark Mode:', oldValue, newValue)
                if (newValue.darkMode) {
                    console.log('enable dark mode')
                    await enableDarkMode()
                } else {
                    console.log('disable dark mode')
                    disableDarkMode()
                }
            }
        }
    }
}

async function enableDarkMode() {
    // console.log('enableDarkMode')
    // const message = { message: 'my eyes' }
    // // console.log('message:', message)
    // const response = await chrome.runtime.sendMessage(message)
    // console.log('response:', response)

    // const href = chrome.runtime.getURL('css/dark.css')
    // $('head').append(`<link rel="stylesheet" href="${href}" type="text/css" />`)

    // const link = document.createElement('link')
    // link.href = chrome.runtime.getURL('css/dark.css')
    // link.type = 'text/css'
    // link.rel = 'stylesheet'
    // link.id = 'dark-css-link'
    // document.head.appendChild(link)

    const href = chrome.runtime.getURL('css/dark.css')
    $('<link/>', {
        id: 'dark-css-link',
        rel: 'stylesheet',
        type: 'text/css',
        href: href,
    }).appendTo('body')
}

function disableDarkMode() {
    document.getElementById('dark-css-link')?.remove()
}
