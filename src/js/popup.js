// JS for popup.html

import {
    activateOrOpen,
    checkPerms,
    enableUnseen,
    getSearchURL,
    grantPerms,
    onChanged,
    saveOptions,
    updateManifest,
    updateOptions,
} from './export.js'

chrome.storage.onChanged.addListener(onChanged)
document.addEventListener('DOMContentLoaded', initPopup)
document.getElementById('open-unseen').addEventListener('click', openUnseen)
document.getElementById('clear-unseen').addEventListener('click', clearUnseen)
document
    .querySelectorAll('#options-form input')
    .forEach((el) => el.addEventListener('change', saveOptions))
document
    .querySelectorAll('a[href]')
    .forEach((el) => el.addEventListener('click', popupLinks))
// noinspection JSCheckFunctionSignatures
document
    .querySelectorAll('.grant-permissions')
    .forEach((el) => el.addEventListener('click', (e) => grantPerms(e, true)))
document
    .getElementsByName('searchType')
    .forEach((el) => el.addEventListener('change', updateSearchType))
document
    .getElementById('search-form')
    .addEventListener('submit', searchFormSubmit)
document
    .querySelectorAll('[data-bs-toggle="tooltip"]')
    .forEach((el) => new bootstrap.Tooltip(el))

const searchTerm = document.getElementById('searchTerm')

/**
 * Initialize Popup
 * @function initPopup
 */
async function initPopup() {
    console.debug('initPopup')
    searchTerm.focus()

    // noinspection ES6MissingAwait
    updateManifest()
    // noinspection ES6MissingAwait
    populateYearLinks()

    // checkPerms().then((hasPerms) => {
    //     if (!hasPerms) {
    //         console.log('%c Host Permissions Not Granted', 'color: Red')
    //     }
    // })

    const { options } = await chrome.storage.sync.get(['options'])
    console.debug('options:', options)
    updateOptions(options)

    document.getElementById('country-url').href =
        `https://asn.flightsafety.org/asndb/country/${options.countryCode}`
    searchTerm.placeholder = options.searchType
    document.querySelector(
        `input[name="searchType"][value="${options.searchType}"]`
    ).checked = true

    const hasPerms = await checkPerms()
    if (!hasPerms) {
        console.log('%c Host Permissions Not Granted', 'color: Red')
        return
    }

    if (options.checkUpdates) {
        chrome.storage.sync
            .get(['unseen'])
            .then((items) => enableUnseen(items.unseen))
    }
}

async function populateYearLinks() {
    console.debug('populateYearLinks')
    const url = 'https://asn.flightsafety.org/asndb/year'
    const yearView = document.getElementById('year-view')
    const yearList = document.getElementById('year-list')
    const date = new Date()
    let year = date.getFullYear()
    yearView.textContent = year.toString()
    yearView.href = `${url}/${year}`
    for (let i = 0; i < 4; i++) {
        year = year - 1
        // console.debug('i, year', i, year)
        const li = document.createElement('li')
        const a = document.createElement('a')
        a.classList.add('dropdown-item')
        a.textContent = year.toString()
        a.href = `${url}/${year}`
        a.addEventListener('click', popupLinks)
        li.appendChild(a)
        yearList.appendChild(li)
    }
}

/**
 * Popup Links Click Callback
 * Firefox requires a call to window.close()
 * @function popupLinks
 * @param {MouseEvent} event
 */
async function popupLinks(event) {
    console.debug('popupLinks:', event)
    event.preventDefault()
    const anchor = event.target.closest('a')
    const href = anchor.getAttribute('href').replace(/^\.+/g, '')
    console.debug('href:', href)
    let url
    if (anchor.href.endsWith('html/options.html')) {
        chrome.runtime.openOptionsPage()
        return window.close()
    } else if (href.startsWith('http')) {
        url = href
    } else {
        url = chrome.runtime.getURL(href)
    }
    console.debug('url:', url)
    await activateOrOpen(url)
    return window.close()
}

/**
 * Save Search Type Radio on Change Callback
 * @function updateSearchType
 * @param {SubmitEvent} event
 */
async function updateSearchType(event) {
    console.debug('defaultSearchChange:', event)
    console.debug('event.target.value:', event.target.value)
    let { options } = await chrome.storage.sync.get(['options'])
    options.searchType = event.target.value
    await chrome.storage.sync.set({ options })
    searchTerm.placeholder = options.searchType
    await searchFormSubmit(event)
}

/**
 * Search Form Submit Callback
 * @function searchFormSubmit
 * @param {SubmitEvent,InputEvent} event
 */
async function searchFormSubmit(event) {
    console.debug('searchFormSubmit:', event)
    event.preventDefault()
    // const form = event.target.form || event.target
    // console.debug('form:', form)
    // const searchType = form.elements.searchType.value.toString().trim()
    const searchType = document.querySelector(
        '[name="searchType"]:checked'
    ).value
    console.debug('searchType:', searchType)
    // console.debug('searchTerm:', searchTerm)
    let value = searchTerm.value.toString().trim()
    console.debug('value:', value)
    if (!value) {
        console.debug('return on no value entered')
        return searchTerm.focus()
    }
    const url = getSearchURL(searchType, value)
    console.debug('url:', url)
    await chrome.tabs.create({ active: true, url })
    window.close()
}

/**
 * Open Unseen Click Callback
 * @function openUnseen
 * @param {UIEvent} event
 */
async function openUnseen(event) {
    console.debug('openUnseen:', event)
    const { unseen } = await chrome.storage.sync.get(['unseen'])
    console.debug('unseen:', unseen)
    for (const id of unseen) {
        const url = `https://asn.flightsafety.org/wikibase/${id}`
        console.debug('url:', url)
        // noinspection ES6MissingAwait
        chrome.tabs.create({ active: false, url })
    }
}

/**
 * Clear Unseen Click Callback
 * @function clearUnseen
 * @param {UIEvent} event
 */
async function clearUnseen(event) {
    console.debug('clearUnseen:', event)
    await chrome.storage.sync.set({ unseen: [] })
    document.getElementById('new-incidents').classList.add('d-none')
}
