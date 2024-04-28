// JS for popup.html

import { checkPerms, saveOptions, showToast, updateOptions } from './export.js'

document.addEventListener('DOMContentLoaded', initPopup)
document.getElementById('grant-perms').addEventListener('click', grantPerms)
document
    .querySelectorAll('a[href]')
    .forEach((el) => el.addEventListener('click', popupLinks))
document
    .querySelectorAll('#options-form input')
    .forEach((el) => el.addEventListener('change', saveOptions))
document
    .getElementsByName('searchType')
    .forEach((el) => el.addEventListener('change', updateSearchType))
document
    .querySelectorAll('[data-bs-toggle="tooltip"]')
    .forEach((el) => new bootstrap.Tooltip(el))

const searchForm = document.getElementById('search-form')
searchForm.addEventListener('submit', searchFormSubmit)

/**
 * Initialize Popup
 * @function initPopup
 */
async function initPopup() {
    console.debug('initPopup')
    const manifest = chrome.runtime.getManifest()
    document.querySelector('.version').textContent = manifest.version
    document.querySelector('[href="homepage_url"]').href = manifest.homepage_url

    await checkPerms()

    const { options } = await chrome.storage.sync.get(['options'])
    console.debug('options:', options)
    updateOptions(options)

    document.querySelector(
        `input[name="searchType"][value="${options.searchType}"]`
    ).checked = true

    searchForm.elements.searchTerm.focus()

    if (chrome.runtime.lastError) {
        showToast(chrome.runtime.lastError.message, 'warning')
    }

    // const platformInfo = await chrome.runtime.getPlatformInfo()
    // console.log('platformInfo:', platformInfo)

    // const tabs = await chrome.tabs.query({ highlighted: true })
    // console.log('tabs:', tabs)

    // const views = chrome.extension.getViews()
    // console.log('views:', views)
    // const result = views.find((item) => item.location.href.endsWith('html/home.html'))
    // console.log('result:', result)
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
    console.debug(`anchor.href: ${anchor.href}`, anchor)
    let url
    if (anchor.href.endsWith('html/options.html')) {
        chrome.runtime.openOptionsPage()
        return window.close()
    } else if (anchor.href.endsWith('html/page.html')) {
        await chrome.windows.create({
            type: 'detached_panel',
            url: '/html/page.html',
            width: 720,
            height: 480,
        })
        return window.close()
    } else if (
        anchor.href.startsWith('http') ||
        anchor.href.startsWith('chrome-extension')
    ) {
        // console.debug(`http or chrome-extension`)
        url = anchor.href
    } else {
        // console.debug(`else chrome.runtime.getURL`)
        url = chrome.runtime.getURL(anchor.href)
    }
    console.debug('url:', url)
    await chrome.tabs.create({ active: true, url })
    return window.close()
}

/**
 * Grant Permissions Button Click Callback
 * @function grantPerms
 * @param {Event} event
 */
function grantPerms(event) {
    console.debug('grantPerms:', event)
    chrome.permissions.request({
        origins: [
            'http://aviation-safety.net/*',
            'https://aviation-safety.net/*',
        ],
    })
    window.close()
}

/**
 * Save Search Type Radio on Change Callback
 * @function updateSearchType
 * @param {SubmitEvent} event
 */
async function updateSearchType(event) {
    console.log('defaultSearchChange')
    console.log(event)
    let { options } = await chrome.storage.sync.get(['options'])
    options.searchType = event.target.value
    console.log(`options.searchType: ${event.target.value}`)
    await chrome.storage.sync.set({ options })
    await searchFormSubmit(event)
}

/**
 * Search Form Submit Callback
 * @function searchFormSubmit
 * @param {SubmitEvent} event
 */
async function searchFormSubmit(event) {
    event.preventDefault()
    console.debug('searchFormSubmit:', event)
    // console.log('event.submitter:', event.submitter)
    const searchType = searchForm.elements.searchType.value.toString().trim()
    console.debug(`searchType: ${searchType}`)
    const value = searchForm.elements.searchTerm.value.toString().trim()
    console.debug(`value: ${value}`)
    if (!value) {
        return searchForm.elements.searchTerm.focus()
    }
    let url
    if (searchType === 'registration') {
        url = `https://aviation-safety.net/wikibase/dblist2.php?yr=&at=&re=${value}&pc=&op=&lo=&co=&ph=&na=&submit=Submit`
    } else if (searchType === 'operator') {
        url = `https://aviation-safety.net/wikibase/dblist2.php?yr=&at=&re=&pc=&op=${value}&lo=&co=&ph=&na=&submit=Submit`
    }
    console.info(`url: ${url}`)
    await chrome.tabs.create({ active: true, url })
    window.close()
}
