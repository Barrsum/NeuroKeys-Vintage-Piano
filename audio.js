// audio.js
window.AudioEngine = (function() {
    let masterVolume;
    let currentInstrument = null;
    const instruments = {};
    let isInitialized = false;

    // Piano Samples Map
    const pianoSampleMap = { 
        'A0': 'A0.mp3', 'C1': 'C1.mp3', 'D#1': 'Ds1.mp3', 'F#1': 'Fs1.mp3', 'A1': 'A1.mp3', 
        'C2': 'C2.mp3', 'D#2': 'Ds2.mp3', 'F#2': 'Fs2.mp3', 'A2': 'A2.mp3', 'C3': 'C3.mp3', 
        'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3', 'A3': 'A3.mp3', 'C4': 'C4.mp3', 'D#4': 'Ds4.mp3', 
        'F#4': 'Fs4.mp3', 'A4': 'A4.mp3', 'C5': 'C5.mp3', 'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3', 
        'A5': 'A5.mp3', 'C6': 'C6.mp3', 'D#6': 'Ds6.mp3', 'F#6': 'Fs6.mp3', 'A6': 'A6.mp3', 
        'C7': 'C7.mp3', 'D#7': 'Ds7.mp3', 'F#7': 'Fs7.mp3', 'A7': 'A7.mp3', 'C8': 'C8.mp3' 
    };

    function init(initialDb = 6) {
        masterVolume = new Tone.Volume(initialDb).toDestination();

        // 1. Setup Piano Sampler
        instruments.piano = new Tone.Sampler({ 
            urls: pianoSampleMap, 
            baseUrl: "https://tonejs.github.io/audio/salamander/", 
            release: 1 
        }).connect(masterVolume);

        // 2. Setup Synths
        instruments.synth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: 'fatsawtooth', count: 3, spread: 30 }, envelope: { attack: 0.02, decay: 0.1, sustain: 0.6, release: 0.9 } }).connect(masterVolume);
        instruments.synth.volume.value = -8;

        instruments.epiano = new Tone.PolySynth(Tone.FMSynth, { harmonicity: 3, modulationIndex: 10, oscillator: { type: "sine" }, envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 1.0 }, modulation: { type: "triangle" }, modulationEnvelope: { attack: 0.05, decay: 0.1, sustain: 0.8, release: 0.8 } }).connect(masterVolume);
        instruments.epiano.volume.value = -6;

        instruments.organ = new Tone.PolySynth(Tone.FMSynth, { harmonicity: 4, modulationIndex: 20, oscillator: {type: "sine"}, envelope: {attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.2}, modulation: {type: "sine"}, modulationEnvelope: {attack: 0.05, decay: 0.1, sustain: 1, release: 0.2} }).connect(masterVolume);
        instruments.organ.volume.value = -9;

        // PluckSynth is not Monophonic, so it stands alone.
        instruments.pluck = new Tone.PluckSynth({ attackNoise: 0.8, dampening: 5000, resonance: 0.85 }).connect(masterVolume);
        instruments.pluck.volume.value = -4;

        instruments.lead = new Tone.PolySynth(Tone.MonoSynth, { oscillator: { type: "sawtooth" }, envelope: { attack: 0.05, decay: 0.2, sustain: 0.6, release: 0.5 }, filterEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.8, baseFrequency: 300, octaves: 4 } }).connect(masterVolume);
        instruments.lead.volume.value = -8;

        instruments.bells = new Tone.PolySynth(Tone.FMSynth, { harmonicity: 8, modulationIndex: 2, oscillator : { type : "sine" }, envelope : { attack : 0.001, decay : 1.5, sustain : 0.05, release : 1.5 }, modulation : { type : "triangle" }, modulationEnvelope : { attack : 0.01, decay : 0.5, sustain : 0, release : 0.5 } }).connect(masterVolume);
        instruments.bells.volume.value = -12;

        // MembraneSynth (Drums) is not Monophonic, so it stands alone.
        instruments.drum = new Tone.MembraneSynth({ pitchDecay: 0.01, octaves: 6, oscillator: {type: "sine"}, envelope: {attack: 0.001, decay: 0.3, sustain: 0.01, release: 0.6} }).connect(masterVolume);
        instruments.drum.volume.value = -3;

        currentInstrument = instruments.piano;
        isInitialized = true;
        
        // FIX: Use the global Tone.loaded() which reliably returns a Promise!
        return Tone.loaded(); 
    }

    async function startContext() {
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }
    }

    function switchInstrument(name) {
        if (instruments[name]) currentInstrument = instruments[name];
        // If switching back to piano, we check if Tone is still loading buffers
        return false; 
    }

    function setVolume(db) {
        if (masterVolume) masterVolume.volume.value = db;
    }

    function playNote(note, instrumentName) {
        if (!isInitialized || !currentInstrument) return;
        const noteToPlay = (instrumentName === 'drum') ? 'C3' : note; 
        currentInstrument.triggerAttack(noteToPlay, Tone.now());
    }

    function stopNote(note, instrumentName) {
        if (!isInitialized || !currentInstrument) return;
        const noteToRelease = (instrumentName === 'drum') ? 'C3' : note;
        
        // Some synths (like Pluck/Membrane) auto-release.
        if (instrumentName !== 'pluck' && instrumentName !== 'drum') {
            currentInstrument.triggerRelease(noteToRelease, Tone.now() + 0.05);
        }
    }

    return { init, startContext, switchInstrument, setVolume, playNote, stopNote };
})();