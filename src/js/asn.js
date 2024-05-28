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
        link.target = '_blank'
        link.rel = 'noopener'
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

async function enableAutoFill(options) {
    enableAutoFill = function () {}
    console.debug('enableAutoFill:', options)

    const contentwrapper = document.getElementById('contentwrapper')

    if (!options.autoFill) {
        const p = document.createElement('p')
        p.textContent = 'Tip: AutoFill can be enabled on the '
        p.style.marginLeft = '40px'
        const link = getOptionsLink()
        p.appendChild(link)
        p.appendChild(document.createTextNode(' (refresh after enabling).'))
        contentwrapper.insertBefore(p, contentwrapper.children[0])
        return console.debug('AutoFill Disabled')
    }

    document.querySelector('[name="Username"]').value = options.asnUsername
    document.querySelector('[name="Email"]').value = options.asnEmail

    const date = new Date()
    document.querySelector('[name="Day"]').value = date.getDay()
    document.querySelector('[name="Month"]').value = (
        '0' + date.getMonth()
    ).slice(-2)
    document.querySelector('[name="Year"]').value = date.getFullYear()

    const extraPerms = await chrome.runtime.sendMessage('extraPerms')
    console.log('extraPerms', extraPerms)
    if (!extraPerms) {
        console.debug('Missing Extra Permissions')

        const p = document.createElement('p')
        p.textContent =
            'Auto Fill requires additional permissions. See the Popup or '
        p.style.marginLeft = '40px'

        const link = getOptionsLink()
        p.appendChild(link)
        p.appendChild(document.createTextNode(' (refresh after enabling).'))

        contentwrapper.insertBefore(p, contentwrapper.children[0])
        return
    }

    const operator = document.querySelector('[name="Operator"]')
    const clone = operator.cloneNode(true)
    clone.size = '40'
    const td = operator.parentElement
    td.textContent = ''
    td.appendChild(clone)
    const privateBtn = document.createElement('button')
    privateBtn.id = 'operator-private'
    privateBtn.textContent = 'Set Private'
    privateBtn.style.marginLeft = '10px'
    privateBtn.addEventListener('click', (e) => {
        e.preventDefault()
        clone.value = 'Private'
    })
    td.appendChild(privateBtn)

    const input = document.createElement('input')
    input.id = 'registration-autofill'
    input.type = 'text'
    input.placeholder = 'Reg: N-Number, C-Number'
    input.style.marginLeft = '40px'

    const button = document.createElement('button')
    button.id = 'button-autofill'
    button.textContent = 'Auto Fill'
    button.style.marginLeft = '10px'
    button.addEventListener('click', doAutoFill)

    const span = document.createElement('span')
    span.textContent = '(Only Works for USA/Canada N or C Numbers)'
    span.style.color = '#cc0000'
    span.style.marginLeft = '10px'
    contentwrapper.insertBefore(span, contentwrapper.children[0])
    contentwrapper.insertBefore(button, contentwrapper.children[0])
    contentwrapper.insertBefore(input, contentwrapper.children[0])

    if (!chrome.runtime.onMessage.hasListener(onMessage)) {
        console.debug('chrome.runtime.onMessage.addListener')
        chrome.runtime.onMessage.addListener(onMessage)
    }
}

function onMessage(message, sender) {
    console.log('onMessage', message, sender)
    if (message.error) {
        console.warn('ERROR:', message.error)
        return
    }
    processResponse(message)
}

function processResponse(message) {
    if (message.registration) {
        document.querySelector('[name="Registration"]').value =
            message.registration
    }
    if (message.serial) {
        document.querySelector('[name="Cn"]').value = message.serial
    }
    if (message.manufacturer || message.model) {
        document.querySelector('[name="AcType"]').value =
            `${message.manufacturer} ${message.model}`.trim()
    }
    if (message.name) {
        document.querySelector('[name="Operator"]').value = message.name
    }
    if (message.type) {
        const value = message.type.toLowerCase()
        if (value.includes('fixed wing') || value.includes('aeroplane')) {
            document.querySelector('[name="Plane_cat"]').value = 'A'
        } else if (value.includes('helicopter')) {
            document.querySelector('[name="Plane_cat"]').value = 'H'
        }
    }
    if (message.url) {
        const source = document.getElementById('source')
        const text = `${source.value}\n${message.url}\n`
        source.value = text.trim()
    }
    document.querySelector('[name="Comments"]').value =
        'Added New Incident. Auto Filled w/ ASN Plus.'
}

async function doAutoFill(event) {
    console.log('doAutoFill', event)
    event.preventDefault()

    const input = document.getElementById('registration-autofill')
    const value = input.value.trim()
    console.log('value', value)
    if (!value) {
        return console.debug('empty input')
    }

    const button = document.getElementById('button-autofill')
    button.disabled = true

    chrome.runtime.sendMessage({ registration: value })
}

/**
 * getOptionsLink
 * @param {String} text
 * @return {HTMLAnchorElement}
 */
function getOptionsLink(text = 'Options Page.') {
    const link = document.createElement('a')
    link.addEventListener('click', () => {
        chrome.runtime.sendMessage('openOptionsPage')
    })
    link.textContent = text
    return link
}
