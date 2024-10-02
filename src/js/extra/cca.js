// JS for wwwapps.tc.gc.ca

console.log('%c RUNNING cca.js', 'color: Khaki')

const searchParams = new URLSearchParams(window.location.search)
console.debug('searchParams:', searchParams)
const tab = searchParams.get('tab')

if (tab) {
    getData()
}

function getData() {
    console.log('getData for tab:', tab)
    if (window.location.pathname.endsWith('RchSimp.aspx')) {
        console.log('STAGE 1 - Enter Registration')
        const registration = searchParams.get('registration')
        const input = document.getElementById('txtMark')
        input.value = registration
        const search = document.getElementById('btnSearch')
        search.click()
    } else if (window.location.pathname.endsWith('ADet.aspx')) {
        console.log('STAGE 2 - Gather Information')

        const parent = document.getElementById('pnlDetails')

        console.log('window.location:', window.location)
        const url = new URL(window.location)
        url.searchParams.delete('registration')
        url.searchParams.delete('tab')
        console.log(`url: ${url.href}`, url)

        const data = { tab: tab, url: url.href }

        const divs = parent.querySelectorAll('div')
        for (const div of divs) {
            // console.log('textContent', div.textContent.trim())
            if (div.textContent.trim() === 'Mark:') {
                data.registration = div.nextElementSibling.textContent.trim()
                console.log('registration:', data.registration)
            }
            if (div.textContent.trim() === 'Common Name:') {
                data.manufacturer = div.nextElementSibling.textContent.trim()
                console.log('manufacturer:', data.manufacturer)
            }
            if (div.textContent.trim() === 'Model Name:') {
                data.model = div.nextElementSibling.textContent.trim()
                console.log('model:', data.model)
            }
            if (div.textContent.trim() === 'Serial No.:') {
                data.serial = div.nextElementSibling.textContent.trim()
                console.log('serial:', data.serial)
            }
            if (div.textContent.trim() === 'Category:') {
                data.type = div.nextElementSibling.textContent.trim()
                console.log('type:', data.type)
            }
            if (div.textContent.trim() === '24 Bit Address:') {
                const value = div.nextElementSibling.textContent.trim()
                console.log('value:', value)
                data.hex = value.replace(/.*Hex=([0-9A-Fa-f]+).*/, '$1')
                console.log('hex:', data.hex)
            }
        }

        data.name = document
            .getElementById('dvOwnerName')
            .children[1].textContent.trim()

        console.log('data:', data)
        // noinspection JSIgnoredPromiseFromCall
        chrome.runtime.sendMessage({ autofill: data })
        window.close()
    }
}
