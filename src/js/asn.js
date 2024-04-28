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
            if (tr.cells[0].tagName === 'TH') {
                for (const th of tr.cells) {
                    if (th.textContent.toLowerCase().includes('fat')) {
                        i = th.cellIndex
                        console.debug('fatal cell index:', th.cellIndex)
                    }
                }
                // console.debug('skipping TH row', tr)
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
        FR24: 'https://www.flightradar24.com/data/aircraft/${reg}',
        JetPhoto: 'https://www.jetphotos.com/registration/${reg}',
    }
    for (const [key, value] of Object.entries(links)) {
        if (key === 'FAA' && !reg.toUpperCase().startsWith('N')) {
            console.debug('skipping FAA link for reg', reg)
            continue
        }
        const link = document.createElement('a')
        link.href = value.replace('${reg}', reg)
        link.textContent = key
        cell.appendChild(document.createTextNode(' | '))
        cell.appendChild(link)
    }
}

function updateLastUpdated() {
    updateLastUpdated = function () {}
    console.debug('updateLastUpdated')

    // TODO: Probably best to make our own element and insert it at the desired location
    //       This also needs to have a class that is styled by Dark Mode
    const lastupdated = document.querySelector('.lastupdated')
    console.debug('lastupdated:', lastupdated)
    if (!lastupdated) {
        return console.debug('.lastupdated querySelector empty')
    }
    lastupdated.style.float = 'none'
    lastupdated.style.marginLeft = '40px'

    // Add Edit Link
    const id = parseInt(document.URL.split('/').at(-1).trim())
    console.debug('id:', id)
    if (isNaN(id)) {
        return console.debug('id isNaN:', id)
    }
    lastupdated.innerHTML = `<a href='https://aviation-safety.net/wikibase/web_db_edit.php?id=${id}'>Edit ${id}</a>`

    // Add Updated Date and Count
    const table = document.querySelector('table.updates')
    if (!table) {
        return console.debug('table.updates not found')
    }
    const updated =
        table.rows[table.rows.length - 1].cells[0].textContent.trim()
    console.debug('updated:', updated)
    const count = table.rows.length - 1
    lastupdated.innerHTML += ` - Updated <strong>${count}</strong> times on <strong>${updated}</strong>`
}
