// JS Exports

import { countryList } from './vars.js'

/**
 * Request Host Permissions
 * @function getSearchURL
 * @param {String} type
 * @param {String} value
 * @return {String}
 */
export function getSearchURL(type, value) {
    value = value.trim()
    if (type === 'registration') {
        return `https://aviation-safety.net/wikibase/dblist2.php?yr=&at=&re=${value}&pc=&op=&lo=&co=&ph=&na=&submit=Submit`
    } else if (type === 'operator') {
        value = value.replaceAll(' ', '+')
        return `https://aviation-safety.net/wikibase/dblist2.php?yr=&at=&re=&pc=&op=${value}&lo=&co=&ph=&na=&submit=Submit`
    }
}

/**
 * Request Host Permissions
 * @function requestPerms
 * @return {chrome.permissions.request}
 */
export async function requestPerms() {
    return await chrome.permissions.request({
        origins: [
            '*://*.aviation-safety.net/*',
            '*://registry.faa.gov/AircraftInquiry/Search/*',
        ],
    })
}

/**
 * Check Host Permissions
 * @function checkPerms
 * @return {Boolean}
 */
export async function checkPerms() {
    const hasPerms = await chrome.permissions.contains({
        origins: [
            '*://*.aviation-safety.net/*',
            '*://registry.faa.gov/AircraftInquiry/Search/*',
        ],
    })
    console.debug('checkPerms:', hasPerms)
    // Firefox still uses DOM Based Background Scripts
    if (typeof document === 'undefined') {
        return hasPerms
    }
    const hasPermsEl = document.querySelectorAll('.has-perms')
    const grantPermsEl = document.querySelectorAll('.grant-perms')
    if (hasPerms) {
        hasPermsEl.forEach((el) => el.classList.remove('d-none'))
        grantPermsEl.forEach((el) => el.classList.add('d-none'))
    } else {
        grantPermsEl.forEach((el) => el.classList.remove('d-none'))
        hasPermsEl.forEach((el) => el.classList.add('d-none'))
    }
    return hasPerms
}

/**
 * Save Options Callback
 * @function saveOptions
 * @param {InputEvent} event
 */
export async function saveOptions(event) {
    console.debug('saveOptions:', event)
    const { options } = await chrome.storage.sync.get(['options'])
    let key = event.target.id
    let value
    if (key === 'countryCode') {
        value = event.target.value.trim()
        console.info('Country Code:', value)
        if (value.includes('/')) {
            value = value.split('/').at(-1).trim()
            event.target.value = value
        }
        if (!countryList.includes(value)) {
            // event.target.classList.add('is-invalid')
            event.target.value = options['countryCode']
            return showToast(`Invalid Country Code: ${value}`, 'danger')
        }
    } else if (key === 'speechVoice') {
        const selectedOption = event.target.selectedOptions[0]
        console.debug('value:', selectedOption.value)
        value = selectedOption.value
    } else if (key === 'reset-country') {
        options['countryCode'] = 'N'
        key = 'countryDisplay'
        value = 'USA'
    } else if (event.target.type === 'radio') {
        key = event.target.name
        const radios = document.getElementsByName(key)
        for (const input of radios) {
            if (input.checked) {
                value = input.id
                break
            }
        }
    } else if (event.target.type === 'checkbox') {
        value = event.target.checked
    } else if (event.target.type === 'number') {
        value = event.target.value.toString()
    } else {
        value = event.target.value?.trim()
    }
    if (value !== undefined) {
        options[key] = value
        console.info(`Set: ${key}:`, value)
        await chrome.storage.sync.set({ options })
    } else {
        console.warn('No Value for key:', key)
    }
}

/**
 * Update Options based on type
 * @function initOptions
 * @param {Object} options
 */
export function updateOptions(options) {
    console.debug('updateOptions:', options)
    for (let [key, value] of Object.entries(options)) {
        if (typeof value === 'undefined') {
            console.warn('Value undefined for key:', key)
            continue
        }
        if (key.startsWith('radio')) {
            key = value
            value = true
        }
        // console.debug(`${key}: ${value}`)
        const el = document.getElementById(key)
        // console.debug('el:', el)
        if (!el) {
            continue
        }
        if (!['INPUT', 'SELECT'].includes(el.tagName)) {
            el.textContent = value.toString()
        } else if (el.type === 'checkbox') {
            el.checked = value
        } else {
            el.value = value
        }
        if (el.dataset.related) {
            hideShowElement(`#${el.dataset.related}`, value)
        }
    }
}

function hideShowElement(selector, show, speed = 'fast') {
    console.debug('hideShowElement:', selector)
    const element = $(`${selector}`)
    // console.debug('hideShowElement:', show, element)
    if (show) {
        element.show(speed)
    } else {
        element.hide(speed)
    }
}

/**
 * Activate or Open Tab from URL
 * @function activateOrOpen
 * @param {String} url
 * @param {Boolean} [open]
 * @return {Boolean}
 */
export async function activateOrOpen(url, open = true) {
    console.debug('activateOrOpen:', url)
    const tabs = await chrome.tabs.query({ currentWindow: true })
    // console.debug('tabs:', tabs)
    for (const tab of tabs) {
        if (tab.url === url) {
            console.debug('tab:', tab)
            await chrome.tabs.update(tab.id, { active: true })
            return
        }
    }
    if (open) {
        await chrome.tabs.create({ active: true, url })
    }
}

/**
 * Show Bootstrap Toast
 * @function showToast
 * @param {String} message
 * @param {String} type
 */
export function showToast(message, type = 'success') {
    console.debug(`showToast: ${type}: ${message}`)
    const clone = document.querySelector('.d-none .toast')
    const container = document.getElementById('toast-container')
    if (!clone || !container) {
        return console.warn('Missing clone or container:', clone, container)
    }
    const element = clone.cloneNode(true)
    element.querySelector('.toast-body').innerHTML = message
    element.classList.add(`text-bg-${type}`)
    container.appendChild(element)
    const toast = new bootstrap.Toast(element)
    element.addEventListener('mousemove', () => toast.hide())
    toast.show()
}
