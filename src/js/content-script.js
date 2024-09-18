// JS Content Script

console.log('%cRUNNING content-script.js', 'color: Khaki')

window.addEventListener('DOMContentLoaded', domContentLoaded)

if (!chrome.storage.onChanged.hasListener(onChanged)) {
    chrome.storage.onChanged.addListener(onChanged)
}

async function domContentLoaded() {
    console.debug('domContentLoaded')
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
            }
            processOptions(newValue)
        }
    }
}

/**
 * Process Options and Execute Functions
 * @function processOptions
 * @param {Object} options
 */
function processOptions(options) {
    console.debug('processOptions:', options)
    if (options.updateNavigation) {
        updateNavigation(options)
    }
    if (options.hideHeaderImage) {
        hideHeaderImage()
    }
    if (options.increaseMaxWidth) {
        increaseMaxWidth()
    }
    if (options.highlightTable) {
        highlightTableRows()
    }
    if (options.enableKeyboard) {
        enableKeyboard()
    }
    if (options.checkUpdates) {
        // noinspection JSIgnoredPromiseFromCall
        checkSeen()
    }
    if (window.location.pathname.startsWith('/wikibase')) {
        if (options.hideEntryWarning) {
            hideEntryWarning()
        }
    }
    if (/^\/wikibase\/\d+/.test(window.location.pathname)) {
        if (options.updateEntry) {
            updateEntryTable()
            updateLastUpdated()
        }
        if (typeof speechSynthesis !== 'undefined') {
            addAudioButtons(options)
        }
        if (options.expandImages) {
            expandImages()
        }
    }
    if (window.location.pathname === '/wikibase/web_db_input.php') {
        // noinspection JSIgnoredPromiseFromCall
        enableAutoFill(options)
    }
}

async function checkSeen() {
    console.debug('%c checkSeen', 'color: Khaki')
    checkSeen = function () {}
    let { seen, unseen } = await chrome.storage.sync.get(['seen', 'unseen'])
    // console.debug('seen, unseen:', seen, unseen)
    const nodeList = document.querySelectorAll('td.list a')
    console.debug('nodeList:', nodeList)
    let sc = 0
    let uc = 0
    for (const el of nodeList) {
        // console.debug('el:', el)
        const id = el.href.split('/').pop()
        console.debug('id:', id)
        if (!seen.includes(id)) {
            seen.push(id)
            // console.debug(`%cAdding seen ID: ${id}`, 'color: Aqua')
            sc++
        }
        if (unseen.includes(id)) {
            const idx = unseen.indexOf(id)
            console.debug(
                `%cRemoving unseen ID: ${id} idx: ${idx}`,
                'color: Orange'
            )
            unseen.splice(idx, 1)
            uc++
        }
    }
    console.debug('sc:', sc)
    if (sc) {
        seen = seen.slice(-500)
        await chrome.storage.sync.set({ seen })
        console.debug('%cUpdated seen:', 'color: Lime', seen)
    }
    console.debug('uc:', uc)
    if (uc) {
        await chrome.storage.sync.set({ unseen })
        console.debug('%cUpdated unseen:', 'color: Yellow', unseen)
    }
}
