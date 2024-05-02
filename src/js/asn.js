// JS for ASN

console.info('LOADED: asn.js')

const tagNames = ['INPUT', 'TEXTAREA', 'SELECT', 'OPTION']

const keyLocations = {
    KeyH: '/',
    KeyA: '/wikibase/web_db_input.php',
    KeyS: '/wikibase/wikisearch.php',
}

const navigationMenu = [
    {
        href: '/',
        text: 'Home',
    },
    {
        href: '/database/',
        text: 'Database',
    },
    {
        href: '/database/year/',
        text: 'DB',
        year: true,
    },
    {
        href: '/wikibase/',
        text: 'Wikibase',
    },
    {
        href: '/asndb/year/',
        text: 'Wiki',
        year: true,
    },
    {
        href: '/wikibase/wikisearch.php',
        text: 'Wiki Search',
    },
]

function updateNavigation() {
    updateNavigation = function () {}
    console.debug('updateNavigation')

    const div = document.querySelector('div.navigation')
    if (!div) {
        return console.debug('div.navigation not found', div)
    }

    const trail = document.getElementById('noprint')
    if (trail) {
        trail.style.display = 'none'
    }

    div.innerHTML = ''
    // div.classList.remove('navigation')
    const ul = document.createElement('ul')
    div.appendChild(ul)

    const date = new Date()
    let year = date.getFullYear()
    for (const item of navigationMenu) {
        const li = document.createElement('li')
        ul.appendChild(li)
        const a = document.createElement('a')
        if (item.year) {
            a.href = `${item.href}${year}`
            a.textContent = `${item.text} ${year}`
        } else {
            a.href = item.href
            a.textContent = item.text
        }
        li.appendChild(a)
    }
}

function hideHeaderImage() {
    hideHeaderImage = function () {}
    console.debug('hideHeaderImage')

    const headerImage = document.querySelector('div.photodisplay > img')
    if (headerImage) {
        headerImage.style.display = 'none'
    } else {
        console.debug('div.photodisplay > img not found', headerImage)
    }
}

function highlightTableRows() {
    highlightTableRows = function () {}
    console.debug('highlightTableRows')

    const tables = document.querySelectorAll('table.hp,table.list')
    if (!tables.length) {
        return console.debug('tables not found', tables)
    }

    for (const table of tables) {
        console.debug('updating table:', table)
        let fatIdx = 4
        for (const tr of table.rows) {
            if (tr.cells[0].tagName === 'TH') {
                // for (const th of tr.cells) {
                //     if (th.textContent.toLowerCase().includes('fat')) {
                //         i = th.cellIndex
                //         console.debug('fatal cell index:', th.cellIndex)
                //     }
                // }
                // console.debug('skipping TH row', tr)
                continue
            }
            const text = tr.cells[fatIdx].textContent.trim()
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
        return console.debug('table not found', table)
    }
    let registration
    let operator
    for (const tr of table.rows) {
        if (tr.textContent.startsWith('Registration:')) {
            registration = tr.cells[1].textContent.trim()
            console.debug('reg:', registration)
            if (registration) {
                const cell = tr.cells[1]
                addEntryLink(registration, cell)
            }
        }
        if (tr.textContent.startsWith('Owner/operator:')) {
            operator = tr.cells[1].textContent.trim()
            console.debug('operator:', operator)
            if (
                operator &&
                !['private', 'unreported'].includes(operator.toLowerCase())
            ) {
                const link = document.createElement('a')
                operator = operator.replaceAll(' ', '+')
                link.href = `https://aviation-safety.net/wikibase/dblist2.php?op=${operator.toString()}`
                link.textContent = 'Wiki Search'
                tr.cells[1].appendChild(document.createTextNode(' - '))
                tr.cells[1].appendChild(link)
            }
        }
        if (tr.textContent.startsWith('Location:')) {
            console.debug('location', tr.cells[1].textContent)
            const iframes = document.querySelectorAll('iframe')
            for (const el of iframes) {
                if (el.src.includes('geographical/kml_map_iframe_wiki.php')) {
                    const url = new URL(el.src)
                    let loc = url.searchParams.get('ll')
                    loc = loc.replace(',', ';')
                    console.debug('loc:', loc)
                    const name = registration || operator || 'Plane Crash'
                    const geo = `https://geohack.toolforge.org/en/${loc}_type:city?pagename=${name}`
                    const link = document.createElement('a')
                    link.target = '_blank'
                    link.rel = 'noopener'
                    link.href = geo
                    link.textContent = 'GeoHack'
                    tr.cells[1].appendChild(document.createTextNode(' - '))
                    tr.cells[1].appendChild(link)
                }
            }
        }
    }
}

function addEntryLink(reg, cell) {
    console.debug(`addEntryLink: ${reg}`, cell)
    const links = {
        FAA: `https://registry.faa.gov/AircraftInquiry/Search/NNumberResult?nNumberTxt=${reg}`,
        FA: `https://flightaware.com/resources/registration/${reg}`,
        FR24: `https://www.flightradar24.com/data/aircraft/${reg}`,
        JetPhoto: `https://www.jetphotos.com/registration/${reg}`,
    }
    for (const [key, value] of Object.entries(links)) {
        if (key === 'FAA' && !reg.toUpperCase().startsWith('N')) {
            console.debug('skipping FAA link for reg', reg)
            continue
        }
        const link = document.createElement('a')
        link.href = value
        link.textContent = key
        cell.appendChild(document.createTextNode(' | '))
        cell.appendChild(link)
    }
}

function hideEntryWarning() {
    console.debug('hideEntryWarning')
    const div = document.querySelector('div.alertbox')
    div.style.display = 'none'
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
    lastupdated.style.marginTop = '6px'

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

function enableKeyboard() {
    enableKeyboard = function () {}
    window.addEventListener('keydown', keyboardEvent)
}

function keyboardEvent(e) {
    // console.log('handleKeyboard:', e)
    if (
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.repeat ||
        tagNames.includes(e.target.tagName)
    ) {
        return
    }
    if (e.code === 'KeyB') {
        console.debug('keyboard: Back')
        history.back()
    } else if (e.code === 'KeyP') {
        console.debug('keyboard: Play')
        if (typeof speechSynthesis === 'undefined') {
            return console.debug('speechSynthesis is undefined')
        }
        if (!speechSynthesis.speaking) {
            const play = document.getElementById('play-button')
            play.click()
        } else {
            const pause = document.getElementById('pause-button')
            pause.click()
        }
    } else if (['KeyE'].includes(e.code)) {
        if (/^\/wikibase\/\d+/.test(window.location.pathname)) {
            const match = RegExp(/\d+/).exec(window.location.pathname)
            if (match) {
                const id = match[0]
                console.debug('keyboard: Edit Entry:', id)
                window.location = `https://aviation-safety.net/wikibase/web_db_edit.php?id=${id}`
            }
        }
    } else if (['KeyD', 'KeyW'].includes(e.code)) {
        const date = new Date()
        let year = date.getFullYear()
        if (e.code === 'KeyD') {
            console.debug('keyboard: Database Latest')
            window.location = `https://aviation-safety.net/database/year/${year}`
        } else if (e.code === 'KeyW') {
            console.debug('keyboard: Wiki Latest')
            window.location = `https://aviation-safety.net/asndb/year/${year}`
        }
    } else if (keyLocations[e.code]) {
        console.debug(`keyLocation: ${e.code}`, keyLocations[e.code])
        window.location = keyLocations[e.code]
    }
}
