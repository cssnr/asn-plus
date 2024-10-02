chrome.runtime.onMessage.addListener(onMessage)

/**
 * On Message Callback
 * @function onMessage
 * @param {Object} message
 * @param {MessageSender} sender
 * @param {Function} sendResponse
 */
function onMessage(message, sender, sendResponse) {
    console.log('%c onMessage:', 'color: Lime', message)
    try {
        if (message?.clipboard) {
            handleClipboardWrite(message.clipboard)
        } else if (message?.update) {
            const ids = handleUpdate(message.update)
            console.debug('ids:', ids)
            sendResponse({ ids: ids })
        } else {
            console.debug('non-offscreen message')
        }
    } catch (e) {
        console.error('e:', e)
    } finally {
        console.debug('window.close')
        window.close()
    }

    // switch (message.type) {
    //     case 'copy-data-to-clipboard':
    //         handleClipboardWrite(message.data)
    //         break
    //     default:
    //         console.warn(`Unexpected message type received: '${message.type}'.`)
    // }
}

function handleUpdate(text) {
    console.debug('handleUpdate:', text)
    const parser = new DOMParser()
    const htmlDocument = parser.parseFromString(text, 'text/html')
    // console.debug('htmlDocument:', htmlDocument)
    const nodeList = htmlDocument.querySelectorAll('td.list a')
    console.debug('offscreen nodeList:', nodeList)

    let array = []
    for (const el of nodeList) {
        // console.debug('el:', el)
        const id = el.href.split('/').pop()
        console.debug('id:', id)
        array.push(id)
    }
    console.debug('array:', array)
    return array

    // fetch(options.checkURL)
    //     .then((response) => {
    //         console.debug('response:', response)
    //         response.text().then((text) => {
    //             console.debug('text:', text)
    //             const parser = new DOMParser()
    //             const htmlDocument = parser.parseFromString(text, 'text/html')
    //             // console.debug('htmlDocument:', htmlDocument)
    //             const nodeList = htmlDocument.querySelectorAll('td.list a')
    //             console.debug('nodeList 1:', nodeList)
    //             sendResponse(nodeList)
    //         })
    //     })
    //     .catch((e) => {
    //         console.error('Error:', e)
    //     })
}

function handleClipboardWrite(data) {
    console.debug('handleClipboardWrite:', data)
    if (typeof data !== 'string') {
        throw new TypeError(`Value must be "string" got: "${typeof data}"`)
    }
    // const textEl = document.querySelector('#text')
    const textEl = document.createElement('textarea')
    textEl.value = data
    textEl.select()
    document.appendChild(textEl)
    document.execCommand('copy')
    console.debug('%c handleClipboardWrite: SUCCESS', 'color: Lime')
}
