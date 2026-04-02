// piano.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- UI Elements ---
    const piano = document.getElementById('piano');
    const instrumentSelect = document.getElementById('instrumentSelect');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const mappingIndicator = document.getElementById('mappingIndicator');

    // --- Core Data ---
    const START_NOTE = 'C3';
    const END_NOTE = 'E6';
    const SARGAM_MAP = { 'C': 'सा', 'C#': 'रे♭', 'D': 'रे', 'D#': 'ग♭', 'E': 'ग', 'F': 'म', 'F#': 'म♯', 'G': 'प', 'G#': 'ध♭', 'A': 'ध', 'A#': 'नि♭', 'B': 'नि' };
    
    // Generates the array of notes between C3 and E6
    function generateNotes() {
        const sequence =[];
        let m = Tone.Frequency(START_NOTE).toMidi();
        const eM = Tone.Frequency(END_NOTE).toMidi();
        while(m <= eM) {
            const noteName = Tone.Frequency(m, "midi").toNote();
            sequence.push({ 
                note: noteName, 
                octave: noteName.match(/\d+$/)[0], 
                baseNote: noteName.replace(/\d+$/, ''), 
                midi: m 
            });
            m++;
        }
        return sequence;
    }
    const notes = generateNotes();

    // --- Keyboard Mapping State ---
    const whiteKeyChars = "asdfghjkl;'".split('');
    const blackKeyChars = "wetyuop[]\\".split('');
    let keyboardMappingOffset = 0; // Left/Right shifts by 7 semitones
    let KEYBOARD_MAP = {};
    let NOTE_TO_KEY_MAP = {};

    // --- Initialize Audio Engine ---
    const loadPromise = window.AudioEngine.init(parseInt(volumeSlider.value));
    loadingIndicator.classList.add('visible');
    
    // Wait for the piano MP3s to download
    loadPromise.then(() => {
        loadingIndicator.classList.remove('visible');
    }).catch(err => {
        console.error("Audio Load Error:", err);
        loadingIndicator.textContent = "Audio Error!";
    });

    // --- DOM Generation ---
    function createPianoKeys() {
        piano.innerHTML = '';
        notes.forEach(noteObj => {
            const key = document.createElement('div');
            const isBlack = noteObj.note.includes('#');
            key.className = `key ${isBlack ? 'black' : 'white'}`;
            key.dataset.note = noteObj.note;

            let innerHTML = '';
            if (!isBlack) innerHTML += `<span class="label">${noteObj.note}</span>`;
            innerHTML += `<span class="sargam">${SARGAM_MAP[noteObj.baseNote] || ''}</span>`;
            innerHTML += `<span class="key-char"></span>`; // Filled dynamically based on mapping
            key.innerHTML = innerHTML;

            // Physical Events
            key.addEventListener('pointerdown', handlePointerDown);
            key.addEventListener('pointerup', handlePointerUp);
            key.addEventListener('pointerleave', handlePointerLeave);
            key.addEventListener('contextmenu', e => e.preventDefault());

            piano.appendChild(key);
        });
        positionBlackKeys();
        updateKeyboardMapping();
    }

    function positionBlackKeys() {
        const whiteKeys = piano.querySelectorAll('.key.white');
        const blackKeys = piano.querySelectorAll('.key.black');
        if (!whiteKeys.length) return;
        
        const whiteWidth = whiteKeys[0].offsetWidth;
        const blackWidth = blackKeys.length ? blackKeys[0].offsetWidth : (whiteWidth * 0.58);
        
        let aL = 0;
        notes.forEach(nO => {
            const kE = piano.querySelector(`.key[data-note="${nO.note}"]`);
            if (!kE) return;
            if (nO.note.includes('#')) {
                kE.style.left = `${aL - (blackWidth / 2)}px`;
            } else {
                aL += whiteWidth;
            }
        });
        piano.style.width = `${whiteKeys.length * whiteWidth}px`;
    }

    // --- Dynamic Mapping Logic ---
    function updateKeyboardMapping() {
        KEYBOARD_MAP = {};
        NOTE_TO_KEY_MAP = {};
        const baseMidi = Tone.Frequency("C4").toMidi() + keyboardMappingOffset;
        const findNote = (midi) => notes.find(n => n.midi === midi);

        // Map White Keys
        let currentWhiteMidi = baseMidi;
        for (let i = 0; i < whiteKeyChars.length; i++) {
            let noteInfo = null;
            let attempts = 0;
            while(attempts < 12) {
                noteInfo = findNote(currentWhiteMidi);
                if (noteInfo && !noteInfo.baseNote.includes('#')) break;
                currentWhiteMidi++;
                noteInfo = null;
                attempts++;
            }
            if (noteInfo) {
                KEYBOARD_MAP[whiteKeyChars[i]] = noteInfo.note;
                NOTE_TO_KEY_MAP[noteInfo.note] = whiteKeyChars[i];
                currentWhiteMidi++;
            } else break;
        }

        // Map Black Keys
        let currentBlackMidi = baseMidi + 1;
        for (let i = 0; i < blackKeyChars.length; i++) {
            let noteInfo = null;
            let attempts = 0;
            while(attempts < 12) {
                noteInfo = findNote(currentBlackMidi);
                if (noteInfo && noteInfo.baseNote.includes('#')) break;
                currentBlackMidi++;
                noteInfo = null;
                attempts++;
            }
            if (noteInfo) {
                KEYBOARD_MAP[blackKeyChars[i]] = noteInfo.note;
                NOTE_TO_KEY_MAP[noteInfo.note] = blackKeyChars[i];
                currentBlackMidi++;
            } else break;
        }

        // Update UI Labels
        piano.querySelectorAll('.key').forEach(keyEl => {
            const charLabel = keyEl.querySelector('.key-char');
            const mappedChar = NOTE_TO_KEY_MAP[keyEl.dataset.note];
            charLabel.textContent = mappedChar ? mappedChar.toUpperCase() : '';
            charLabel.style.display = mappedChar ? 'block' : 'none';
        });

        // Update Header Indicator
        const aKeyNoteInfo = findNote(baseMidi);
        mappingIndicator.innerHTML = `Current Map: <code>A</code> = ${aKeyNoteInfo ? aKeyNoteInfo.note : '??'}`;
    }

    // --- Audio Triggers & Interactions ---
    const activeNotes = new Set();
    
    async function initAudio() { await window.AudioEngine.startContext(); }['pointerdown', 'keydown'].forEach(ev => document.body.addEventListener(ev, initAudio, {once:true}));

    function triggerNotePlay(note, source = 'mouse') {
        if (!note || activeNotes.has(note)) return;
        activeNotes.add(note);
        window.AudioEngine.playNote(note, instrumentSelect.value);
        
        const keyEl = piano.querySelector(`.key[data-note="${note}"]`);
        if (keyEl) {
            keyEl.classList.add('active');
            if (source === 'keyboard') keyEl.classList.add('pressed-by-key');
        }
    }

    function triggerNoteStop(note) {
        if (!note || !activeNotes.has(note)) return;
        activeNotes.delete(note);
        window.AudioEngine.stopNote(note, instrumentSelect.value);
        
        const keyEl = piano.querySelector(`.key[data-note="${note}"]`);
        if (keyEl) keyEl.classList.remove('active', 'pressed-by-key');
    }

    // --- Pointer Handlers (Mouse / Touch) ---
    const pointerActive = new Map(); // Tracks pointerId -> actual note played
    
    function handlePointerDown(e) {
        e.preventDefault();
        const key = e.target.closest('.key');
        if (key) {
            key.setPointerCapture(e.pointerId);
            
            // MAGIC CHECK: Intercept normal note and request magic note
            let noteToPlay = key.dataset.note;
            if (window.MagicEngine && window.MagicEngine.isActive()) {
                noteToPlay = window.MagicEngine.getNextNote(e.pointerId) || noteToPlay;
            }
            
            pointerActive.set(e.pointerId, noteToPlay);
            triggerNotePlay(noteToPlay, 'mouse');
        }
    }
    
    function handlePointerUp(e) {
        const noteToStop = pointerActive.get(e.pointerId);
        if (noteToStop) {
            triggerNoteStop(noteToStop);
            pointerActive.delete(e.pointerId);
            try { e.target.closest('.key')?.releasePointerCapture(e.pointerId); } catch(err){}
            if (window.MagicEngine) window.MagicEngine.getReleaseNote(e.pointerId); // Cleanup magic map
        }
    }
    
    function handlePointerLeave(e) {
        const noteToStop = pointerActive.get(e.pointerId);
        if (noteToStop && e.target.closest('.key')?.dataset.note === e.target.closest('.key')?.dataset.note) {
            triggerNoteStop(noteToStop);
            pointerActive.delete(e.pointerId);
            try { e.target.closest('.key')?.releasePointerCapture(e.pointerId); } catch(err){}
            if (window.MagicEngine) window.MagicEngine.getReleaseNote(e.pointerId); // Cleanup magic map
        }
    }

    // --- Keyboard Handlers ---
    const activeKeyboardKeys = new Map(); // Tracks physical key code -> actual note played
    
    document.addEventListener('keydown', (e) => {
        if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
        
        // Handle Map Shifting
        if (e.key === 'ArrowLeft') { e.preventDefault(); keyboardMappingOffset -= 7; updateKeyboardMapping(); return; }
        if (e.key === 'ArrowRight') { e.preventDefault(); keyboardMappingOffset += 7; updateKeyboardMapping(); return; }
        
        const mappedNote = KEYBOARD_MAP[e.key.toLowerCase()];
        
        // ONLY trigger if the user pressed a valid mapped key!
        if (mappedNote && !activeKeyboardKeys.has(e.code)) {
            
            // MAGIC CHECK: Intercept normal mapped note and request magic note
            let noteToPlay = mappedNote;
            if (window.MagicEngine && window.MagicEngine.isActive()) {
                noteToPlay = window.MagicEngine.getNextNote(e.code) || mappedNote;
            }
            
            activeKeyboardKeys.set(e.code, noteToPlay);
            triggerNotePlay(noteToPlay, 'keyboard');
        }
    });

    document.addEventListener('keyup', (e) => {
        const noteToStop = activeKeyboardKeys.get(e.code);
        if (noteToStop) {
            triggerNoteStop(noteToStop);
            activeKeyboardKeys.delete(e.code);
            if (window.MagicEngine) window.MagicEngine.getReleaseNote(e.code); // Cleanup magic map
        }
    });

    // --- Control Panel Listeners ---
    volumeSlider.addEventListener('input', (e) => {
        const db = parseFloat(e.target.value);
        volumeValue.textContent = `${db >= 0 ? '+' : ''}${db} dB`;
        window.AudioEngine.setVolume(db);
    });

    instrumentSelect.addEventListener('change', (e) => {
        const isLoading = window.AudioEngine.switchInstrument(e.target.value);
        if (isLoading) loadingIndicator.classList.add('visible');
        else loadingIndicator.classList.remove('visible');
    });

    // --- Boot Sequence ---
    createPianoKeys();
    window.addEventListener('resize', positionBlackKeys);

    // EXPOSE TO MAGIC ENGINE FOR AUTOPLAY
    window.PianoUI = {
        pressKey: (note) => {
            triggerNotePlay(note, 'keyboard'); // Uses 'keyboard' styling so it glows!
        },
        releaseKey: (note) => {
            triggerNoteStop(note);
        }
    };
});