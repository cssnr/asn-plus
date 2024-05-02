// JS for Speech

let playButton
let pauseButton

function addButtons() {
    addButtons = function () {}
    console.debug('addButtons')

    const caption = document.querySelector('span.caption')
    caption.appendChild(document.createTextNode(' '))

    playButton = document.createElement('a')
    playButton.textContent = 'Play'
    playButton.href = '#'
    playButton.addEventListener('click', playAudioClick)
    caption.appendChild(playButton)

    caption.appendChild(document.createTextNode(' '))

    pauseButton = document.createElement('a')
    pauseButton.textContent = 'Pause'
    pauseButton.href = '#'
    pauseButton.addEventListener('click', pauseAudioClick)
    caption.appendChild(pauseButton)
}

function playAudioClick(event) {
    // console.debug('playAudioClick')
    event.preventDefault()
    if (!speechSynthesis.speaking) {
        console.debug('Play Audio')
        const span = document.querySelector('[lang="en-US"]')
        const utterance = new SpeechSynthesisUtterance(span.textContent)
        utterance.addEventListener('start', onStart)
        utterance.addEventListener('resume', onResume)
        utterance.addEventListener('end', onEnd)
        // TODO: Add Speech Options
        utterance.rate = 1.3
        speechSynthesis.speak(utterance)
        console.debug('utterance:', utterance)
        event.target.textContent = 'Stop'
    } else {
        console.debug('Stop Audio')
        speechSynthesis.cancel()
        event.target.textContent = 'Play'
        pauseButton.textContent = 'Pause'
    }
}

function pauseAudioClick(event) {
    // console.debug('pauseAudioClick')
    event.preventDefault()
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
        console.debug('Pause Audio')
        speechSynthesis.pause()
        event.target.textContent = 'Resume'
    } else if (speechSynthesis.paused) {
        console.debug('Resume Audio')
        speechSynthesis.resume()
        event.target.textContent = 'Pause'
    }
}

function onStart(event) {
    console.debug('onStart', event)
}

function onResume(event) {
    console.debug('onResume', event)
}

function onEnd(event) {
    console.debug('onEnd', event)
    playButton.textContent = 'Play'
}
