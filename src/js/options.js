// JS for options.html

import {
    checkPerms,
    requestPerms,
    saveOptions,
    showToast,
    updateOptions,
} from './export.js'

chrome.storage.onChanged.addListener(onChanged)
chrome.permissions.onAdded.addListener(onAdded)

document.addEventListener('DOMContentLoaded', initOptions)
document.getElementById('grant-perms').addEventListener('click', grantPerms)
document.getElementById('reset-country').addEventListener('click', resetCountry)
document
    .querySelectorAll('#options-form input,select')
    .forEach((el) => el.addEventListener('change', saveOptions))
document
    .getElementById('options-form')
    .addEventListener('submit', (e) => e.preventDefault())
document
    .querySelectorAll('.open-oninstall')
    .forEach((el) => el.addEventListener('click', openOnInstall))
document
    .querySelectorAll('[data-bs-toggle="tooltip"]')
    .forEach((el) => new bootstrap.Tooltip(el))

const voiceSelect = document.getElementById('speechVoice')

/**
 * Initialize Options
 * @function initOptions
 */
async function initOptions() {
    console.debug('initOptions')
    const manifest = chrome.runtime.getManifest()
    document.querySelector('.version').textContent = manifest.version
    document.querySelector('[href="homepage_url"]').href = manifest.homepage_url

    await setShortcuts({
        mainKey: '_execute_action',
        openHome: 'openHome',
    })

    const { options } = await chrome.storage.sync.get(['options'])
    console.debug('options:', options)
    updateOptions(options)
    await checkPerms()

    if (typeof speechSynthesis !== 'undefined') {
        speechSynthesis.onvoiceschanged = () => {
            addSpeechVoices(options)
        }
    }
}

function addSpeechVoices(options) {
    console.debug('addSpeechVoices:', options)
    const voices = []
    speechSynthesis.getVoices().forEach((voice) => {
        // console.debug('voice:', voice)
        voices.push(voice.name)
    })
    voices.sort()
    voices.forEach((voice) => {
        const option = document.createElement('option')
        // option.textContent = `${voice.name} ${voice.lang}`
        option.textContent = voice
        option.value = voice
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
 * On Changed Callback
 * @function onChanged
 * @param {Object} changes
 * @param {String} namespace
 */
function onChanged(changes, namespace) {
    console.debug('onChanged:', changes, namespace)
    for (const [key, { newValue }] of Object.entries(changes)) {
        if (namespace === 'sync' && key === 'options') {
            console.debug('newValue:', newValue)
            updateOptions(newValue)
        }
    }
}

/**
 * Grant Permissions Click Callback
 * @function grantPerms
 * @param {MouseEvent} event
 */
async function grantPerms(event) {
    console.debug('grantPermsBtn:', event)
    await requestPerms()
    await checkPerms()
}

/**
 * Open OnInstall Page Click Callback
 * @function openOnInstall
 * @param {MouseEvent} event
 */
async function openOnInstall(event) {
    console.debug('openOnInstall:', event)
    const url = chrome.runtime.getURL('../html/oninstall.html')
    await chrome.tabs.create({ active: true, url })
    window.close()
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
