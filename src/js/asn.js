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
        href: '/asndb/country/',
        text: 'Wiki',
        country: true,
    },
    {
        href: '/wikibase/wikisearch.php',
        text: 'Wiki Search',
    },
]

function updateNavigation(options) {
    updateNavigation = function () {}
    console.debug('updateNavigation', options)

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
    let a
    for (const item of navigationMenu) {
        const li = document.createElement('li')
        ul.appendChild(li)
        a = document.createElement('a')
        if (item.year) {
            a.href = `${item.href}${year}`
            a.textContent = `${item.text} ${year}`
        } else if (item.country) {
            a.href = `${item.href}${options.countryCode}`
            a.textContent = `${item.text} ${options.countryDisplay}`
        } else {
            a.href = item.href
            a.textContent = item.text
        }
        li.appendChild(a)
    }
    a.style.borderRight = 'none'
    // This should be its own options or default css
    document
        .querySelectorAll('.infobox')
        .forEach((el) => (el.style.marginBottom = '12px'))
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

function increaseMaxWidth() {
    increaseMaxWidth = function () {}
    console.debug('increaseMaxWidth')

    const wrap = document.getElementById('page-wrap')
    if (!wrap) {
        return console.debug('page-wrap not found')
    }
    wrap.style.maxWidth = '100%'
    // wrap.style.margin = '5px'
    const footer = wrap.children[wrap.children.length - 1]
    if (!footer) {
        return
    }
    // console.debug('footer:', footer)
    if (footer.style.height === '175px') {
        console.debug('set footer height to 190px')
        footer.style.height = '190px'
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
            const text = tr.cells[fatIdx]?.textContent.trim()
            if (/^[0-9+ ]+$/.test(text) && text !== '0') {
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
            // console.debug('location', tr.cells[1].textContent)
            const iframes = document.querySelectorAll('iframe')
            for (const el of iframes) {
                if (el.src.includes('geographical/kml_map_iframe_wiki.php')) {
                    const url = new URL(el.src)
                    let loc = url.searchParams.get('ll')
                    loc = loc.replace(',', ';')
                    console.debug('loc:', loc)
                    const name = registration || operator || 'Plane Crash'
                    const geo = `https://geohack.toolforge.org/en/${loc}_type:event?pagename=${name}`
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

function expandImages() {
    expandImages = function () {}
    console.log('expandImages')
    const inner = document.querySelector('.innertube')
    const links = inner.querySelectorAll('a')
    const div = document.querySelectorAll('div.captionhr')[1]
    for (const link of links) {
        if (/\.(png|jpg|jpeg|gif|bmp|webp)$/i.test(link.href)) {
            console.debug('adding image:', link.href)
            const img = document.createElement('img')
            img.src = link.href
            img.style.maxWidth = '100%'
            img.style.display = 'block'
            div.parentElement.insertBefore(img, div)
        }
    }
}

function hideEntryWarning() {
    hideEntryWarning = function () {}
    console.debug('hideEntryWarning')
    const div = document.querySelector('div.alertbox')
    if (div) {
        div.style.display = 'none'
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

async function keyboardEvent(e) {
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
        console.debug('keyboard: Play/Pause')
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
    } else if (['KeyC'].includes(e.code)) {
        const { options } = await chrome.storage.sync.get(['options'])
        console.debug('keyLocation: Country:', options.countryCode)
        window.location = `https://aviation-safety.net/asndb/country/${options.countryCode}`
    } else if (keyLocations[e.code]) {
        console.debug(`keyLocation: ${e.code}`, keyLocations[e.code])
        window.location = keyLocations[e.code]
    }
}

function enableAUtoFill() {
    enableAUtoFill = function () {}
    console.debug('enableAUtoFill')

    // const innertube = document.querySelector('.innertube')
    const contentwrapper = document.getElementById('contentwrapper')

    const input = document.createElement('input')
    input.id = 'registration-autofill'
    input.type = 'text'
    input.placeholder = 'Registration: N-Number'
    input.style.marginLeft = '40px'

    const button = document.createElement('button')
    button.id = 'button-autofill'
    button.textContent = 'Auto Fill'
    button.style.marginLeft = '10px'
    button.addEventListener('click', doAutoFill)

    contentwrapper.insertBefore(button, contentwrapper.children[0])
    contentwrapper.insertBefore(input, contentwrapper.children[0])

    if (!chrome.runtime.onMessage.hasListener(onMessage)) {
        console.debug('chrome.runtime.onMessage.addListener')
        chrome.runtime.onMessage.addListener(onMessage)
    }
}

function onMessage(request, sender) {
    console.log('onMessage', request, sender)
    if (request.error) {
        console.warn('ERROR:', request.error)
        return
    }
    processResponse(request)
}

function processResponse(request) {
    if (request.registration) {
        document.querySelector('[name="Registration"]').value =
            request.registration
    }
    if (request.serial) {
        document.querySelector('[name="Cn"]').value = request.serial
    }
    if (request.manufacturer || request.model) {
        document.querySelector('[name="AcType"]').value =
            `${request.manufacturer} ${request.model}`
    }
    if (request.name) {
        document.querySelector('[name="Operator"]').value = request.name
    }

    const date = new Date()
    document.querySelector('[name="Day"]').value = date.getDay()
    document.querySelector('[name="Month"]').value = (
        '0' + date.getMonth()
    ).slice(-2)
    document.querySelector('[name="Year"]').value = date.getFullYear()

    if (request.registration) {
        const source = document.getElementById('source')
        const text =
            `${source.value}\n` +
            `https://registry.faa.gov/AircraftInquiry/Search/NNumberResult?nNumberTxt=${request.registration}\n`
        // `https://globe.adsbexchange.com/?icao=${request.hex.toLowerCase()}\n`
        source.value = text.trim()
    }
}

async function doAutoFill(event) {
    console.log('doAutoFill', event)
    const input = document.getElementById('registration-autofill')
    const button = document.getElementById('button-autofill')

    if (!input.value) {
        return console.debug('empty input')
    }
    button.disabled = true
    const value = input.value.trim()
    console.log('value', value)
    const url = `https://registry.faa.gov/AircraftInquiry/Search/NNumberResult?nNumberTxt=${value}`
    console.log('url', url)
    chrome.runtime.sendMessage({ faa: url })

    // const response = await fetch(url)
    // console.log('response:', response)
    // const text = await response.text()
    // // console.log('text:', text)
    // const parser = new DOMParser()
    // const htmlDocument = parser.parseFromString(text, 'text/html')
    // console.log('htmlDocument:', htmlDocument)
    //
    // const serial = htmlDocument.querySelector(
    //     '[data-label="Serial Number"]'
    // )?.textContent
    // const manufacturer = htmlDocument.querySelector(
    //     '[data-label="Manufacturer Name"]'
    // )?.textContent
    // const model = htmlDocument.querySelector(
    //     '[data-label="Model"]'
    // )?.textContent
    //
    // console.log('serial:', serial)
    // console.log('manufacturer:', manufacturer)
    // console.log('model:', model)
}
