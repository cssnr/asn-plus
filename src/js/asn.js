// JS for ASN

console.info('LOADED: asn.js')

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

    for (const tr of table.rows) {
        if (tr.textContent.startsWith('Registration:')) {
            const reg = tr.cells[1].textContent.trim()
            console.debug('reg:', reg)
            if (reg) {
                const cell = tr.cells[1]
                addEntryLink(reg, cell)
            }
        }
        if (tr.textContent.startsWith('Owner/operator:')) {
            let operator = tr.cells[1].textContent.trim()
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

let playButton
let pauseButton

function onStart(event) {
    console.log('onStart', event)
}

function onResume(event) {
    console.log('onResume', event)
}

function onEnd(event) {
    console.log('onEnd', event)
}

function addButtons() {
    addButtons = function () {}
    console.debug('addButtons')
    const caption = document.querySelector('span.caption')
    caption.appendChild(document.createTextNode(' '))

    playButton = document.createElement('a')
    playButton.textContent = 'Play'
    playButton.href = '#'
    playButton.addEventListener('click', playAudioClick)
    caption.appendChild(playButton)
    caption.appendChild(document.createTextNode(' '))

    pauseButton = document.createElement('a')
    pauseButton.textContent = 'Pause'
    pauseButton.href = '#'
    pauseButton.addEventListener('click', pauseAudioClick)
    caption.appendChild(pauseButton)
}

function playAudioClick(event) {
    // console.debug('playAudioClick')
    event.preventDefault()
    if (event.target.textContent === 'Play') {
        console.debug('Play Audio')
        const span = document.querySelector('[lang="en-US"]')
        const utterance = new SpeechSynthesisUtterance(span.textContent)
        utterance.addEventListener('start', onStart)
        utterance.addEventListener('resume', onResume)
        utterance.addEventListener('end', onEnd)
        // TODO: Add Speech Options
        utterance.rate = 1.3
        speechSynthesis.speak(utterance)
        console.debug('utterance:', utterance)
        event.target.textContent = 'Stop'
    } else {
        console.debug('Stop Audio')
        speechSynthesis.cancel()
        event.target.textContent = 'Play'
        pauseButton.textContent = 'Pause'
    }
}

function pauseAudioClick(event) {
    // console.debug('pauseAudioClick')
    event.preventDefault()
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
        console.debug('Pause Audio')
        speechSynthesis.pause()
        event.target.textContent = 'Resume'
    } else if (speechSynthesis.paused) {
        console.debug('Resume Audio')
        speechSynthesis.resume()
        event.target.textContent = 'Pause'
    }
}
