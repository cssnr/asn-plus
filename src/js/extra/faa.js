// JS for registry.faa.gov

console.info('LOADED: faa.js')

const searchParams = new URLSearchParams(window.location.search)
console.debug('searchParams:', searchParams)
const tab = searchParams.get('tab')

if (tab) {
    getData()
}

function getData() {
    console.log('getData for tab:', tab)
    const error = searchParams.get('error')
    if (error) {
        console.log('error:', error)
        chrome.runtime.sendMessage({ autofill: { tab: tab, error: error } })
        return
    }

    const registration = searchParams.get('nNumberTxt').toUpperCase()

    const serial = document
        .querySelector('[data-label="Serial Number"]')
        ?.textContent.trim()
    const manufacturer = document
        .querySelector('[data-label="Manufacturer Name"]')
        ?.textContent.trim()
    const model = document
        .querySelector('[data-label="Model"]')
        ?.textContent.trim()
    const name = document
        .querySelector('[data-label="Name"]')
        ?.textContent.trim()
    const type = document
        .querySelector('[data-label="Aircraft Type"]')
        ?.textContent.trim()
    const hex = document
        .querySelector('[data-label="Mode S Code (Base 16 / Hex)"]')
        ?.textContent.trim()

    const url = new URL(window.location)
    url.searchParams.delete('tab')
    console.log(`url: ${url.href}`, url)

    const data = {
        registration: registration,
        serial: serial,
        manufacturer: manufacturer,
        model: model,
        hex: hex,
        name: name,
        type: type,
        tab: tab,
        url: url.href,
    }
    console.log('data:', data)
    chrome.runtime.sendMessage({ autofill: data })
    // console.info('window.close')
    window.close()
}
