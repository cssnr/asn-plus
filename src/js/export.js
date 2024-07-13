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
        return `https://asn.flightsafety.org/wikibase/dblist2.php?yr=&at=&re=${value}&pc=&op=&lo=&co=&ph=&na=&submit=Submit`
    } else if (type === 'operator') {
        value = value.replaceAll(' ', '+')
        return `https://asn.flightsafety.org/wikibase/dblist2.php?yr=&at=&re=&pc=&op=${value}&lo=&co=&ph=&na=&submit=Submit`
    }
}

/**
 * Request Host Permissions
 * @function requestPerms
 * @param {Boolean} extra
 * @return {chrome.permissions.request}
 */
export async function requestPerms(extra = false) {
    let origins = ['*://asn.flightsafety.org/*']
    if (extra) {
        origins = [
            '*://registry.faa.gov/AircraftInquiry/Search/*',
            '*://wwwapps.tc.gc.ca/saf-sec-sur/2/ccarcs-riacc/*',
        ]
    }
    return await chrome.permissions.request({
        origins: origins,
    })
}

/**
 * Check Host Permissions
 * @function checkPerms
 * @return {Boolean}
 */
export async function checkPerms() {
    const reqPerms = await chrome.permissions.contains({
        origins: ['*://asn.flightsafety.org/*'],
    })
    updatePermsEl(reqPerms, '.has-perms', '.grant-perms')
    const extraPerms = await chrome.permissions.contains({
        origins: [
            '*://registry.faa.gov/AircraftInquiry/Search/*',
            '*://wwwapps.tc.gc.ca/saf-sec-sur/2/ccarcs-riacc/*',
        ],
    })
    updatePermsEl(extraPerms, '.extra-perms', '.extra-grant')
    return reqPerms
}

function updatePermsEl(hasPerms, has, grant) {
    console.debug('updatePermsEl:', hasPerms, has, grant)
    if (typeof document === 'undefined') {
        return console.debug('document undefined')
    }
    const hasEl = document.querySelectorAll(has)
    const grantEl = document.querySelectorAll(grant)
    if (hasPerms) {
        hasEl.forEach((el) => el.classList.remove('d-none'))
        grantEl.forEach((el) => el.classList.add('d-none'))
    } else {
        grantEl.forEach((el) => el.classList.remove('d-none'))
        hasEl.forEach((el) => el.classList.add('d-none'))
    }
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
        const number = parseFloat(event.target.value)
        let min = 0.5
        let max = 2.0
        if (!isNaN(number) && number >= min && number <= max) {
            event.target.value = number.toString()
            value = number
        } else {
            event.target.value = options[event.target.id]
            return
        }
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
        if (!el) {
            continue
        }
        if (!['INPUT', 'SELECT'].includes(el.tagName)) {
            el.textContent = value.toString()
        } else if (['checkbox', 'radio'].includes(el.type)) {
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
 * On Changed Callback
 * @function onChanged
 * @param {Object} changes
 * @param {String} namespace
 */
export function onChanged(changes, namespace) {
    console.debug('onChanged:', changes, namespace)
    for (const [key, { newValue }] of Object.entries(changes)) {
        if (namespace === 'sync' && key === 'options') {
            console.debug('newValue:', newValue)
            updateOptions(newValue)
        }
    }
}

export function updateManifest() {
    const manifest = chrome.runtime.getManifest()
    document
        .querySelectorAll('.version')
        .forEach((el) => (el.textContent = manifest.version))
    document
        .querySelectorAll('[href="homepage_url"]')
        .forEach((el) => (el.href = manifest.homepage_url))
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
