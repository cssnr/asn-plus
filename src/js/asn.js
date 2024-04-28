// JS for ASN

console.info('LOADED: asn.js')

function highlightTableRows() {
    highlightTableRows = function () {}
    console.debug('highlightTableRows')

    const tables = document.querySelectorAll('table.hp')
    if (!tables.length) {
        return console.debug('no tables found')
    }

    for (const table of tables) {
        console.debug('updating table:', table)
        let i = 4
        for (const tr of table.rows) {
            // if (tr.rowIndex === 0) {
            if (tr.cells[0].tagName === 'TH') {
                for (const th of tr.cells) {
                    if (th.textContent.toLowerCase().includes('fat')) {
                        i = th.cellIndex
                        console.info('FATALITY CELL INDEX:', th.cellIndex)
                    }
                }
                console.debug('skipping TH row', tr)
                continue
            }
            const text = tr.cells[i].textContent.trim()
            if (text && text !== '0') {
                tr.style.backgroundColor = 'rgba(255,0,0,0.2)'
            }
        }
    }
}

function updateEntryTable() {
    updateEntryTable = function () {}
    console.debug('updateEntryTable')

    const table = document.querySelector('table')
    if (!table) {
        return console.debug('table not found')
    }

    for (const tr of table.rows) {
        if (tr.textContent.startsWith('Registration:')) {
            const reg = tr.cells[1].textContent.trim()
            console.debug('reg:', reg)
            if (!reg) {
                console.debug('registration not found')
                break
            }

            const cell = tr.cells[1]
            addEntryLink(reg, cell)
        }
        if (tr.textContent.startsWith('Owner/operator:')) {
            let operator = tr.cells[1].textContent.trim()
            console.debug('operator:', operator)
            const link = document.createElement('a')
            link.href = `https://aviation-safety.net/wikibase/dblist2.php?op=${operator}`
            link.textContent = 'Wiki Search'
            tr.cells[1].appendChild(document.createTextNode(' - '))
            tr.cells[1].appendChild(link)
        }
    }
}

function addEntryLink(reg, cell) {
    console.debug(`addEntryLink: ${reg}`, cell)
    const links = {
        FAA: 'https://registry.faa.gov/AircraftInquiry/Search/NNumberResult?nNumberTxt=${reg}',
        FA: 'https://flightaware.com/resources/registration/${reg}',
        FR24: 'https://flightaware.com/resources/registration/${reg}',
        JetPhoto: 'https://www.jetphotos.com/registration/${reg}',
    }
    for (const [key, value] of Object.entries(links)) {
        if (key === 'FAA' && !reg.toUpperCase().startsWith('N')) {
            console.debug('skipping FAA link for reg', reg)
            continue
        }
        const link = document.createElement('a')
        link.href = `${value}`
        link.textContent = key
        cell.appendChild(document.createTextNode(' | '))
        cell.appendChild(link)
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
