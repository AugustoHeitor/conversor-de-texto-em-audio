import { createToastNotification } from './toastNotification.js';

// Capturing DOM elements.
const form = document.querySelector("form");
const textArea = document.querySelector("textarea");
const select = document.querySelector("select");
const clearTextButton = document.querySelector(".buttonClearText");
const speedButton = document.querySelector(".buttonSpeed");
const volumeInput = document.querySelector("input");
const audioBox = document.querySelector('#downloadAudio');
let imgLoader = document.querySelector('#imgLoader');

// Creating an instance of the "SpeechSynthesisUtterance" class.
const synthesizer = new SpeechSynthesisUtterance();

// Global variables.
let volume = 1;
let text = '';
let speed = 1;
let voices = [];
let convert = false

// Functions

const addVoiceOptions = () => {
    voices.forEach((voice, i) => {
        const option = document.createElement('option');
        option.innerText = `${voice.name} (${voice.lang})`;
        option.value = i;
        select.appendChild(option);
    });
}

const characterCounter = () => {
    const characterCount = document.querySelector('.counterCharacters');
    characterCount.innerText = text.length;
}

const clearText = () => {
    textArea.value = '';
    text = '';
    characterCounter();
}

const toggleMute = () => {
    const soundImage = document.querySelector("#soundImage");
    const mute = soundImage.dataset.mute;

    volume === 0 ? (
        mute === 'false' ? (
            soundImage.setAttribute('data-mute', 'true'),
            soundImage.setAttribute('src', './imgs/mute.svg')
        ) : null
    ) : (
        mute === 'true' ? (
            soundImage.setAttribute('data-mute', 'false'),
            soundImage.setAttribute('src', './imgs/sound.svg')
        ) : null
    );
}

const recordAudio = async () => {

    imgLoader.setAttribute('class', 'loader')

    let file = '';

    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });

    const audioTrack = stream.getAudioTracks()[0];

    if (audioTrack) {

        stream.getVideoTracks().forEach(track => track.stop());

        const mediaStream = new MediaStream();
        mediaStream.addTrack(audioTrack);

        const audioChunks = [];
        const mediaRecorder = new MediaRecorder(mediaStream, { bitsPerSecond: 128000 });

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                audioChunks.push(e.data);
            }
        };

        const recordingPromise = new Promise(resolve => {
            mediaRecorder.onstop = () => {
                stream.getTracks().forEach(track => track.stop());
                mediaStream.removeTrack(audioTrack);
                file = new Blob(audioChunks);
                resolve(file);
            };
        });

        mediaRecorder.start();

        synthesizer.onend = () => {
            mediaRecorder.stop(),
                convert = true,
                createToastNotification('success')
        };
        window.speechSynthesis.speak(synthesizer);

        await recordingPromise;

        createDownloadLink(file);
    } else {
        createToastNotification('error')
    }
};

const createDownloadLink = (file) => {
    const convertButton = document.querySelector('#convertButton')

    audioBox.innerHTML = '';
    convertButton.innerHTML = '';

    const imgHTML = `<img id="imgLoader" src="./imgs/load.svg">`;

    convertButton.insertAdjacentHTML('beforeend', imgHTML)

    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(file);
    anchor.download = 'audio.wav';
    anchor.innerText = 'Download Audio';

    audioBox.appendChild(anchor);
}

// Events
document.addEventListener('DOMContentLoaded', () => {
    window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();

        voices = voices.filter((voice) => voice.localService === true)

        synthesizer.voice = voices[0];
        addVoiceOptions();
    }

    textArea.addEventListener('input', (e) => {
        text = e.target.value;
        characterCounter();
    });

    clearTextButton.addEventListener('click', () => {
        window.speechSynthesis.cancel();

        clearText();
    });

    select.addEventListener('change', (option) => {
        window.speechSynthesis.cancel();

        const i = Number(option.target.value) || 0;
        console.log(voices[i])
        synthesizer.voice = voices[i];
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        convert === true ? (
            imgLoader = document.querySelector('#imgLoader'),
            imgLoader.setAttribute('class', 'loader'),
            setTimeout(() => window.location.reload(), 600)
        ) : (
            window.speechSynthesis.cancel(),
            audioBox.innerHTML = '',
            synthesizer.rate = parseFloat(speed),
            synthesizer.text = text,
            synthesizer.volume = volume,
            recordAudio()
        );
    });

    speedButton.addEventListener('click', (e) => {
        window.speechSynthesis.cancel();

        speed === 10 ? (
            speed = 1,
            speedButton.innerText = `${speed}x`
        ) : (
            speed += 1,
            speedButton.innerText = `${speed}x`
        );

    });

    volumeInput.addEventListener('input', (e) => {
        window.speechSynthesis.cancel();

        volume = Number(e.target.value);
        toggleMute();
    });
});
