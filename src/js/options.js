// JS for options.html

import {
    activateOrOpen,
    checkPerms,
    onChanged,
    requestPerms,
    saveOptions,
    showToast,
    updateManifest,
    updateOptions,
} from './export.js'

chrome.storage.onChanged.addListener(onChanged)
chrome.permissions.onAdded.addListener(onAdded)
chrome.permissions.onRemoved.addListener(onRemoved)

document.addEventListener('DOMContentLoaded', initOptions)
document.getElementById('reset-country').addEventListener('click', resetCountry)
document.getElementById('test-voice').addEventListener('click', testVoice)
document
    .querySelectorAll('#options-form input,select')
    .forEach((el) => el.addEventListener('change', saveOptions))
document
    .getElementById('options-form')
    .addEventListener('submit', (e) => e.preventDefault())
document
    .querySelectorAll('.grant-permissions')
    .forEach((el) => el.addEventListener('click', grantPerms))
document
    .querySelectorAll('.revoke-permissions')
    .forEach((el) => el.addEventListener('click', revokePerms))
document
    .querySelectorAll('.open-permissions')
    .forEach((el) => el.addEventListener('click', openPermissions))
document
    .querySelectorAll('[data-bs-toggle="tooltip"]')
    .forEach((el) => new bootstrap.Tooltip(el))

/**
 * Initialize Options
 * @function initOptions
 */
async function initOptions() {
    console.debug('initOptions')
    await setShortcuts({
        mainKey: '_execute_action',
        openHome: 'openHome',
    })
    updateManifest()
    const { options } = await chrome.storage.sync.get(['options'])
    console.debug('options:', options)
    updateOptions(options)
    await checkPerms()

    if (typeof speechSynthesis !== 'undefined') {
        console.debug('speechSynthesis')
        // Mozilla does not send onvoiceschanged on page loads nor requires it
        const voices = speechSynthesis.getVoices()
        if (voices.length) {
            addSpeechVoices(options, voices)
        } else {
            speechSynthesis.onvoiceschanged = () => {
                const voices = speechSynthesis.getVoices()
                addSpeechVoices(options, voices)
            }
        }
    }
}

function addSpeechVoices(options, voices) {
    console.debug('addSpeechVoices:', options, voices)
    const voiceSelect = document.getElementById('speechVoice')
    voices.sort((a, b) => a.lang.localeCompare(b.lang))
    voices.forEach((voice) => {
        // console.debug('voice:', voice)
        const option = document.createElement('option')
        option.textContent = `${voice.name} (${voice.lang})`
        option.value = voice.name
        voiceSelect.appendChild(option)
    })
    if (options.speechVoice) {
        voiceSelect.value = options.speechVoice
    }
}

/**
 * Reset Options Form Click Callback
 * @function resetForm
 * @param {InputEvent} event
 */
async function resetCountry(event) {
    console.log('resetCountry:', event)
    event.preventDefault()
    const countryCode = document.getElementById('countryCode')
    const countryDisplay = document.getElementById('countryDisplay')
    countryCode.value = 'N'
    countryDisplay.value = 'USA'
    countryDisplay.focus()
    // const form = document.getElementById('options-form')
    // form.submit()
    await saveOptions(event)
    showToast('Country Display and Code Reset.')
}

/**
 * Test Voice Click Callback
 * @function testVoice
 * @param {InputEvent} event
 */
async function testVoice(event) {
    console.log('testVoice:', event)
    event.preventDefault()
    const { options } = await chrome.storage.sync.get(['options'])
    const utterance = getUtterance('Voice for Speech Playback.', options)
    speechSynthesis.speak(utterance)
}

/**
 * Get Utterance
 * @param {String} text
 * @param {Object} options
 * @return {SpeechSynthesisUtterance}
 */
function getUtterance(text, options) {
    const utterance = new SpeechSynthesisUtterance(text)
    if (options.speechRate) {
        utterance.rate = options.speechRate
    }
    if (options.speechVoice) {
        speechSynthesis.getVoices().forEach((voice) => {
            // console.log('voice:', voice)
            if (voice.name === options.speechVoice) {
                // console.debug('voice set:', voice)
                utterance.voice = voice
            }
        })
    }
    return utterance
}

/**
 * Grant Permissions Click Callback
 * Move to export and use anonymous function
 * @function grantPerms
 * @param {MouseEvent} event
 */
async function grantPerms(event) {
    console.debug('grantPerms:', event)
    const button = event.target.closest('button')
    const extra = !!button.dataset.extra
    console.debug('extra:', extra)
    requestPerms(extra)
}

/**
 * Revoke Permissions Click Callback
 * @function revokePerms
 * @param {MouseEvent} event
 */
export async function revokePerms(event) {
    console.debug('revokePerms:', event)
    // const button = event.target.closest('button')
    const origins = [
        '*://registry.faa.gov/AircraftInquiry/Search/*',
        '*://wwwapps.tc.gc.ca/saf-sec-sur/2/ccarcs-riacc/*',
    ]
    try {
        await chrome.permissions.remove({
            origins: origins,
        })
        await checkPerms()
    } catch (e) {
        console.log(e)
        showToast(e.toString(), 'danger')
    }
}

/**
 * Open Permissions Page Click Callback
 * @function openPermissions
 * @param {MouseEvent} event
 */
async function openPermissions(event) {
    console.debug('openPermissions:', event)
    event.preventDefault()
    const url = chrome.runtime.getURL('/html/permissions.html')
    activateOrOpen(url)
}

/**
 * Set Keyboard Shortcuts
 * @function setShortcuts
 * @param {Object} mapping { elementID: name }
 */
async function setShortcuts(mapping) {
    const commands = await chrome.commands.getAll()
    for (const [elementID, name] of Object.entries(mapping)) {
        // console.debug(`${elementID}: ${name}`)
        const command = commands.find((x) => x.name === name)
        if (command?.shortcut) {
            console.debug(`${elementID}: ${command.shortcut}`)
            const el = document.getElementById(elementID)
            if (el) {
                el.textContent = command.shortcut
            }
        }
    }
}

/**
 * Permissions On Added Callback
 * @param permissions
 */
async function onAdded(permissions) {
    console.debug('onAdded', permissions)
    await checkPerms()
}

/**
 * Permissions On Removed Callback
 * @param permissions
 */
async function onRemoved(permissions) {
    console.debug('onRemoved', permissions)
    await checkPerms()
}
