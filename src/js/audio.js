// JS for Speech

/* eslint no-func-assign: "off" */
/* eslint no-unused-vars: "off" */

let playButton
let pauseButton
let options

window.addEventListener('beforeunload', beforeUnload)

function beforeUnload(event) {
    console.debug('beforeunload:', event)
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel()
    }
}

function addAudioButtons(opts) {
    addAudioButtons = function () {}
    console.debug('addAudioButtons')
    options = opts
    const caption = document.querySelector('span.caption')
    caption.appendChild(document.createTextNode(' '))

    const link = document.createElement('a')
    // link.setAttribute('style', 'color: #0669cd !important')
    link.style.textDecoration = 'none'

    playButton = link.cloneNode(true)
    playButton.id = 'play-button'
    playButton.textContent = 'Play'
    playButton.href = '#'
    playButton.addEventListener('click', playAudioClick)
    caption.appendChild(playButton)

    caption.appendChild(document.createTextNode(' '))

    pauseButton = link.cloneNode(true)
    pauseButton.id = 'pause-button'
    pauseButton.textContent = 'Pause'
    pauseButton.href = '#'
    pauseButton.addEventListener('click', pauseAudioClick)
    caption.appendChild(pauseButton)
}

function playAudioClick(event) {
    // console.debug('playAudioClick')
    event.preventDefault()
    if (!speechSynthesis.speaking) {
        // const { options } = await chrome.storage.sync.get(['options'])
        // console.debug('options:', options)
        console.debug('Play Audio')
        const span = document.querySelector('[lang="en-US"]')
        const utterance = new SpeechSynthesisUtterance(span.textContent)
        // utterance.addEventListener('start', onStart)
        // utterance.addEventListener('resume', onResume)
        utterance.addEventListener('end', onEnd)
        utterance.rate = options.speechRate
        if (options.speechVoice) {
            speechSynthesis.getVoices().forEach((voice) => {
                // console.log('voice:', voice)
                if (voice.name === options.speechVoice) {
                    // console.debug('voice set:', voice)
                    utterance.voice = voice
                }
            })
        }
        speechSynthesis.speak(utterance)
        event.target.textContent = 'Stop'
    } else {
        console.debug('Stop Audio')
        speechSynthesis.cancel()
        event.target.textContent = 'Play'
        pauseButton.textContent = 'Pause'
    }
}

function pauseAudioClick(event) {
    // console.debug('pauseAudioClick', speechSynthesis)
    event.preventDefault()
    // Chrome Voices always return false for speechSynthesis.paused
    // if (speechSynthesis.speaking && !speechSynthesis.paused) {
    if (!speechSynthesis.speaking) {
        return console.debug('not speaking')
    }
    if (event.target.textContent === 'Pause') {
        console.debug('Pause Audio')
        speechSynthesis.pause()
        event.target.textContent = 'Resume'
    } else {
        console.debug('Resume Audio')
        speechSynthesis.resume()
        event.target.textContent = 'Pause'
    }
}

// function onStart(event) {
//     console.debug('onStart', event)
// }

// function onResume(event) {
//     console.debug('onResume', event)
// }

function onEnd(event) {
    console.debug('onEnd', event)
    playButton.textContent = 'Play'
}
