// JS for options.html

import {
    activateOrOpen,
    checkPerms,
    grantPerms,
    saveOptions,
    showToast,
    updateManifest,
    updateOptions,
} from './export.js'

import { countryList } from './vars.js'

chrome.storage.onChanged.addListener(onChanged)
chrome.permissions.onAdded.addListener(onAdded)
chrome.permissions.onRemoved.addListener(onRemoved)

window.addEventListener('keydown', handleKeyboard)

document.addEventListener('DOMContentLoaded', initOptions)
document.getElementById('test-voice').addEventListener('click', testVoice)
document.getElementById('copy-support').addEventListener('click', copySupport)
document.getElementById('reset-country').addEventListener('click', resetCountry)
document
    .getElementById('reset-background')
    .addEventListener('click', resetBackground)
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

    // noinspection ES6MissingAwait
    setShortcuts('#keyboard-shortcuts')
    // noinspection ES6MissingAwait
    updateManifest()

    checkPerms().then((hasPerms) => {
        if (!hasPerms) {
            console.log('%cHost Permissions Not Granted', 'color: Red')
        }
    })

    const { options } = await chrome.storage.sync.get(['options'])
    console.debug('options:', options)
    updateOptions(options)
    setBackground(options)

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

    const ccDataList = document.getElementById('countryCodeList')
    for (const cc of countryList) {
        // console.debug('cc:', cc)
        const option = document.createElement('option')
        option.value = cc
        ccDataList.appendChild(option)
    }
}

// /**
//  * Login Background Change Callback
//  * @function loginBackgroundChange
//  * @param {InputEvent} event
//  */
// function loginBackgroundChange(event) {
//     console.debug('loginBackgroundChange:', event.target.id)
//     updateBackgroundInput(event.target.id)
// }

/**
 * Set Background
 * @function setBackground
 * @param {Object} options
 */
function setBackground(options) {
    console.debug('setBackground:', options.radioBackground, options.pictureURL)
    if (options.radioBackground === 'bgPicture') {
        const url = options.pictureURL || 'https://images.cssnr.com/aviation'
        document.body.style.background = `url('${url}') no-repeat center fixed`
        document.body.style.backgroundSize = 'cover'
    } else {
        document.body.style.cssText = ''
    }
}

function addSpeechVoices(options, voices) {
    console.debug('addSpeechVoices:', options.speechVoice, voices)
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
 * Reset Background Option Callback
 * @function resetBackground
 * @param {InputEvent} event
 */
async function resetBackground(event) {
    console.log('resetBackground:', event)
    event.preventDefault()
    const pictureURL = document.getElementById('pictureURL')
    pictureURL.value = 'https://images.cssnr.com/aviation'
    pictureURL.focus()
    // const form = document.getElementById('options-form')
    // form.submit()
    await saveOptions(event)
    showToast('Background Image URL Reset.')
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
 * Handle Keyboard Shortcuts Callback
 * @function handleKeyboard
 * @param {KeyboardEvent} e
 */
function handleKeyboard(e) {
    // console.debug('handleKeyboard:', e)
    // console.debug('type:', e.target.type)
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.repeat) {
        return
    }
    if (
        [
            'date',
            'email',
            'number',
            'password',
            'search',
            'tel',
            'text',
            'url',
        ].includes(e.target.type)
    ) {
        return
    }
    if (!document.getElementById('enableKeyboard').checked) {
        return
    }
    if (['KeyZ', 'KeyK'].includes(e.code)) {
        bootstrap.Modal.getOrCreateInstance('#keybinds-modal').toggle()
    }
}

/**
 * Copy Support/Debugging Information
 * @function copySupport
 * @param {MouseEvent} event
 */
async function copySupport(event) {
    console.debug('copySupport:', event)
    event.preventDefault()
    const manifest = chrome.runtime.getManifest()
    const { options } = await chrome.storage.sync.get(['options'])
    delete options.asnEmail
    delete options.asnUsername
    const permissions = await chrome.permissions.getAll()
    const result = [
        `${manifest.name} - ${manifest.version}`,
        navigator.userAgent,
        `permissions.origins: ${JSON.stringify(permissions.origins)}`,
        `options: ${JSON.stringify(options)}`,
    ]
    await navigator.clipboard.writeText(result.join('\n'))
    showToast('Support Information Copied.')
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
    // noinspection ES6MissingAwait
    activateOrOpen(url)
}

/**
 * Set Keyboard Shortcuts
 * @function setShortcuts
 * @param {String} selector
 */
async function setShortcuts(selector = '#keyboard-shortcuts') {
    if (!chrome.commands) {
        return console.debug('Skipping: chrome.commands')
    }
    document.getElementById('table-wrapper').classList.remove('d-none')
    const table = document.querySelector(selector)
    const tbody = table.querySelector('tbody')
    const source = tbody.querySelector('tr.d-none').cloneNode(true)
    source.classList.remove('d-none')
    const commands = await chrome.commands.getAll()
    for (const command of commands) {
        // console.debug('command:', command)
        const row = source.cloneNode(true)
        // TODO: Chrome does not parse the description for _execute_action in manifest.json
        let description = command.description
        if (!description && command.name === '_execute_action') {
            description = 'Show Popup'
        }
        row.querySelector('.description').textContent = description
        row.querySelector('kbd').textContent = command.shortcut || 'Not Set'
        tbody.appendChild(row)
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
    for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (namespace === 'sync' && key === 'options') {
            console.debug('newValue:', newValue)
            updateOptions(newValue)
            if (oldValue.radioBackground !== newValue.radioBackground) {
                setBackground(newValue)
            }
            if (oldValue.pictureURL !== newValue.pictureURL) {
                setBackground(newValue)
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
