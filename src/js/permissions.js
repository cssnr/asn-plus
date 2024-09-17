// JS for permissions.html

import { checkPerms, requestPerms, updateManifest } from './export.js'

chrome.permissions.onAdded.addListener(onAdded)

document.addEventListener('DOMContentLoaded', domContentLoaded)
document.getElementById('open-options').addEventListener('click', openOptions)
document
    .querySelectorAll('.grant-permissions')
    .forEach((el) => el.addEventListener('click', grantPerms))

/**
 * DOMContentLoaded
 * @function domContentLoaded
 */
async function domContentLoaded() {
    console.debug('domContentLoaded')
    // noinspection ES6MissingAwait
    updateManifest()
    // noinspection ES6MissingAwait
    checkPerms()
}

/**
 * Grant Permissions Click Callback
 * @function grantPerms
 * @param {MouseEvent} event
 */
async function grantPerms(event) {
    console.debug('grantPerms:', event)
    const button = event.target.closest('button')
    const extra = !!button.dataset.extra
    console.debug('extra:', extra)
    // noinspection ES6MissingAwait
    requestPerms(extra)
}

/**
 * Open Options Click Callback
 * @function openOptions
 * @param {MouseEvent} event
 */
function openOptions(event) {
    console.debug('openOptions:', event)
    event.preventDefault()
    chrome.runtime.openOptionsPage()
    window.close()
}

/**
 * Permissions On Added Callback
 * @param permissions
 */
async function onAdded(permissions) {
    console.log('onAdded', permissions)
    await checkPerms()
}
