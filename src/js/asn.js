// JS for ASN

function highlightTableRows() {
    const table = document.getElementsByTagName('table')
    if (!table.length) {
        return
    }
    const rows = table[0].children[0].rows
    let i = 4
    for (const tr of rows) {
        // if (tr.cells[0].tagName === 'TH') {
        //     for (const td of tr.cells) {
        //         if (td.textContent === 'fat.') {
        //             console.log(`fat. index: ${td.cellIndex}`)
        //             i = td.cellIndex
        //             break
        //         }
        //     }
        //     continue
        // }
        // if (!i) {
        //     break
        // }
        if (tr.cells[0].tagName === 'TH') {
            continue
        }
        console.log('Updating table now...')
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
    const table = document.getElementsByTagName('table')
    if (!table.length) {
        return
    }
    const rows = table[0].children[0].rows
    for (const tr of rows) {
        if (tr.innerHTML.includes('Registration:')) {
            const reg = tr.cells[1].textContent.trim()
            if (reg) {
                console.log(`reg: ${reg}`)
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
            let oper = tr.cells[1].textContent.trim()
            if (
                oper &&
                !['private', 'unreported'].includes(oper.trim().toLowerCase())
            ) {
                console.log(`oper: ${oper}`)
                oper = oper.replace(' ', '+')
                const operSearch = `<a href='https://aviation-safety.net/wikibase/dblist2.php?op=${oper}' target='_blank'>Wiki Search</a>`
                tr.cells[1].innerHTML += ` | ${operSearch}`
            }
        }
    }
}

function updateLastUpdated() {
    // Add Edit Link
    const lastupdated = document.querySelector('.lastupdated')
    if (!lastupdated.length) {
        return
    }
    const id = document.URL.split('/').at(-1).trim()
    if (isNaN(id)) {
        return
    }
    console.log(`id: ${id}`)
    lastupdated.innerHTML = `<a href='https://aviation-safety.net/wikibase/web_db_edit.php?id=${id}'>Edit ${id}</a>`
    lastupdated.style.float = 'none'
    lastupdated.style.marginLeft = '40px'
    // el.style.color = 'white'
    // Add Updated Date
    const rows = document.getElementsByClassName('updates')[0].children[0].rows
    const updated = rows[rows.length - 1].firstChild.innerText.trim()
    const times = rows.length - 1
    console.log(`updated: ${updated}`)
    lastupdated.innerHTML += ` - Updated <strong>${times}</strong> times on <strong>${updated}</strong>`
}
