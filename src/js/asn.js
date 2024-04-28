// JS for ASN

console.info('LOADED: asn.js')

function highlightTableRows() {
    highlightTableRows = function () {}
    console.debug('highlightTableRows')

    const table = document.getElementsByTagName('table')
    if (!table.length) {
        return console.debug('table not found')
    }

    const rows = table[0].children[0].rows
    let i = 4
    for (const tr of rows) {
        if (tr.cells[0].tagName === 'TH') {
            continue
        }
        if (
            tr.cells[i] &&
            tr.cells[i].firstChild &&
            tr.cells[i].firstChild?.data !== '0'
        ) {
            tr.style.backgroundColor = 'rgba(255,0,0,0.2)'
        }
    }
}

function updateEntryTable() {
    updateEntryTable = function () {}
    console.debug('updateEntryTable')

    const table = document.getElementsByTagName('table')
    if (!table.length) {
        return console.debug('table not found')
    }

    const rows = table[0].children[0].rows
    for (const tr of rows) {
        if (tr.innerHTML.includes('Registration:')) {
            const reg = tr.cells[1].textContent.trim()
            console.debug('reg:', reg)
            if (reg) {
                tr.cells[1].innerHTML = `<span>${reg}</span>`
                if (reg.startsWith('N')) {
                    const faaUrl = `<a href='https://registry.faa.gov/AircraftInquiry/Search/NNumberResult?nNumberTxt=${reg}' target='_blank'>FAA</a>`
                    tr.cells[1].innerHTML += ` | ${faaUrl}`
                }
                const flightAware = `<a href='https://flightaware.com/resources/registration/${reg}' target='_blank'>FA</a>`
                const fr24 = `<a href='https://flightaware.com/resources/registration/${reg}' target='_blank'>FR24</a>`
                const jetPhotos = `<a href='https://www.jetphotos.com/registration/${reg}' target='_blank'>JetPhotos</a>`
                tr.cells[1].innerHTML += ` | ${flightAware} | ${fr24} | ${jetPhotos}`
            }
        }
        if (tr.innerHTML.includes('Owner/operator:')) {
            let operator = tr.cells[1].textContent.trim()
            console.debug('operator:', operator)
            if (
                operator &&
                !['private', 'unreported'].includes(operator.toLowerCase())
            ) {
                operator = operator.replace(' ', '+')
                const link = `<a href='https://aviation-safety.net/wikibase/dblist2.php?op=${operator}' target='_blank'>Wiki Search</a>`
                tr.cells[1].innerHTML += ` | ${link}`
            }
        }
    }
}

function updateLastUpdated() {
    updateLastUpdated = function () {}
    console.debug('updateLastUpdated')

    // Add Edit Link
    const lastupdated = document.querySelector('.lastupdated')
    console.debug('lastupdated:', lastupdated)
    if (!lastupdated) {
        return console.debug('.lastupdated querySelector empty')
    }

    const id = parseInt(document.URL.split('/').at(-1).trim())
    console.debug('id:', id)
    if (isNaN(id)) {
        return console.debug('id isNaN:', id)
    }
    lastupdated.innerHTML = `<a href='https://aviation-safety.net/wikibase/web_db_edit.php?id=${id}'>Edit ${id}</a>`
    lastupdated.style.float = 'none'
    lastupdated.style.marginLeft = '40px'
    // el.style.color = 'white'

    // Add Updated Date
    const rows = document.getElementsByClassName('updates')[0].children[0].rows
    const updated = rows[rows.length - 1].firstChild.innerText.trim()
    console.debug('updated:', updated)
    const times = rows.length - 1
    lastupdated.innerHTML += ` - Updated <strong>${times}</strong> times on <strong>${updated}</strong>`
}
