// magic.js
window.MagicEngine = (function() {
    let active = false;
    let currentSong = null;
    let currentIndex = 0;
    
    // Autoplay states
    let isAutoplaying = false;
    let autoplayTimer = null;
    const autoplaySpeed = 300; // ms per note
    
    const activeTriggers = new Map(); 

    let toggle, controls, select, progress, resetBtn, autoplayBtn;

    function init() {
        toggle = document.getElementById('magicToggle');
        controls = document.getElementById('magicControls');
        select = document.getElementById('songSelect');
        progress = document.getElementById('magicProgress');
        resetBtn = document.getElementById('magicReset');
        autoplayBtn = document.getElementById('magicAutoplay');

        // Populate dropdown
        window.MagicSongs.forEach(song => {
            const opt = document.createElement('option');
            opt.value = song.id;
            opt.textContent = song.title;
            select.appendChild(opt);
        });

        toggle.addEventListener('change', (e) => {
            active = e.target.checked;
            controls.style.display = active ? 'flex' : 'none';
            if (!active) {
                stopAutoplay();
                currentSong = null;
                select.value = "";
                updateProgress();
            }
        });

        select.addEventListener('change', (e) => {
            stopAutoplay();
            const songId = e.target.value;
            currentSong = window.MagicSongs.find(s => s.id === songId);
            currentIndex = 0;
            updateProgress();
        });

        resetBtn.addEventListener('click', () => {
            stopAutoplay();
            currentIndex = 0;
            updateProgress();
        });

        // AUTOPLAY LOGIC
        autoplayBtn.addEventListener('click', () => {
            if (!currentSong) return;
            
            // Require user to interact with page first for Web Audio API
            if (window.AudioEngine) window.AudioEngine.startContext();

            if (isAutoplaying) {
                stopAutoplay();
            } else {
                startAutoplay();
            }
        });
    }

    function startAutoplay() {
        isAutoplaying = true;
        autoplayBtn.innerHTML = '⏸ Pause';
        autoplayBtn.classList.add('playing');
        playNextAutoplayNote();
    }

    function stopAutoplay() {
        isAutoplaying = false;
        autoplayBtn.innerHTML = '▶ Autoplay';
        autoplayBtn.classList.remove('playing');
        clearTimeout(autoplayTimer);
    }

    function playNextAutoplayNote() {
        if (!active || !currentSong || !isAutoplaying) return;
        
        // Stop if we reached the end of the song
        if (currentIndex >= currentSong.notes.length) {
            stopAutoplay();
            currentIndex = 0; // Reset for next time
            updateProgress();
            return;
        }

        const note = getNextNote('autoplay_bot');
        
        // Physically press the UI key
        if (note && window.PianoUI) {
            window.PianoUI.pressKey(note);
            
            // Release the key just before the next note plays
            setTimeout(() => {
                window.PianoUI.releaseKey(note);
                getReleaseNote('autoplay_bot');
            }, autoplaySpeed - 50); 
        }

        // Schedule next note
        autoplayTimer = setTimeout(playNextAutoplayNote, autoplaySpeed);
    }

    function updateProgress() {
        if (!currentSong) {
            progress.innerHTML = `<span class="current">0</span> / 0`;
        } else {
            progress.innerHTML = `<span class="current">${currentIndex}</span> / ${currentSong.notes.length}`;
        }
    }

    function getNextNote(triggerId) {
        if (!active || !currentSong || currentSong.notes.length === 0) return null;
        
        if (currentIndex >= currentSong.notes.length) {
            currentIndex = 0; // Loop back
        }
        
        const note = currentSong.notes[currentIndex];
        currentIndex++;
        updateProgress();
        
        activeTriggers.set(triggerId, note);
        return note;
    }

    function getReleaseNote(triggerId) {
        if (!active) return null;
        const note = activeTriggers.get(triggerId);
        if (note) {
            activeTriggers.delete(triggerId);
            return note;
        }
        return null;
    }

    return { init, isActive: () => active && currentSong !== null, getNextNote, getReleaseNote };
})();

document.addEventListener('DOMContentLoaded', () => {
    window.MagicEngine.init();
});