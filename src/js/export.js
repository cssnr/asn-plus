// JS Exports

/**
 * Request Host Permissions
 * @function getSearchURL
 * @param {String} value
 * @param {String} type
 * @return {String}
 */
export function getSearchURL(value, type) {
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
        origins: ['*://aviation-safety.net/*'],
    })
}

/**
 * Check Host Permissions
 * @function checkPerms
 * @return {Boolean}
 */
export async function checkPerms() {
    const hasPerms = await chrome.permissions.contains({
        origins: ['*://aviation-safety.net/*'],
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
    let value
    if (event.target.type === 'checkbox') {
        value = event.target.checked
    } else if (event.target.type === 'number') {
        value = event.target.value.toString()
    } else if (event.target.type === 'radio') {
        value = event.target.value.toString()
    } else {
        value = event.target.value
    }
    if (value !== undefined) {
        options[event.target.id] = value
        console.info(`Set: event.target.id: ${event.target.id}:`, value)
        await chrome.storage.sync.set({ options })
    } else {
        console.warn(`No Value for event.target.id: ${event.target.id}`)
    }
}

/**
 * Update Options based on typeof
 * @function initOptions
 * @param {Object} options
 */
export function updateOptions(options) {
    for (const [key, value] of Object.entries(options)) {
        const el = document.getElementById(key)
        // console.debug(`${key}: ${value}`, el)
        if (el) {
            if (typeof value === 'boolean') {
                el.checked = value
            } else if (typeof value === 'string') {
                el.value = value
            }
        }
        // el.classList.remove('is-invalid')
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
    if (clone && container) {
        const element = clone.cloneNode(true)
        element.querySelector('.toast-body').innerHTML = message
        element.classList.add(`text-bg-${type}`)
        container.appendChild(element)
        const toast = new bootstrap.Toast(element)
        element.addEventListener('mousemove', () => toast.hide())
        toast.show()
    } else {
        console.info('Missing clone or container:', clone, container)
    }
}
