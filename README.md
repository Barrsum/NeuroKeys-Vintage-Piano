# 🎹 NeuroKeys - Vintage Magic Piano

![License](https://img.shields.io/badge/License-MIT-blue.svg) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![Vanilla JS](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black) ![Tone.js](https://img.shields.io/badge/Audio-Tone.js-black)

**Day 03 / 30 - April Vibe Coding Challenge**

## Try the live demo - [Demo](https://neuro-keys-vintage-piano.vercel.app/)

NeuroKeys is a premium, interactive web piano built entirely in Vanilla HTML/CSS/JS. Wrapped in a stunning "Analog Amber" vintage hardware aesthetic, it features an advanced multi-instrument audio engine powered by Tone.js.

The twist? **✨ Magic Mode**. Turn it on, select a masterpiece (like *Interstellar* or *Tum Hi Ho*), and smash any keys on your keyboard. The Magic Engine intercepts your chaotic inputs and plays the correct notes in perfect pitch. Or, sit back and hit **Autoplay** to watch the piano play itself.

## Screenshots

![Project Screenshot](/home-01.png) 
![Project Screenshot](/home-02.png) 


## ✨ Features

*   **🎹 39-Key Interactive Board:** Spanning C3 to E6, fully playable via mouse clicks, touchscreens, or your physical computer keyboard.
*   **✨ The Magic Engine:** Intercepts user input to flawlessly play predefined arrays of complex songs regardless of what keys are pressed. 
*   **▶️ Autoplay Visualizer:** Watch the keys physically press and glow on their own as the engine automatically performs the selected track.
*   **📻 Analog Amber Aesthetic:** A deep, rich vintage hardware theme with glowing amber accents, realistic key-press shadows, and dynamic UI state changes.
*   **🎛️ Multi-Instrument Synth:** Powered by Tone.js, featuring 8 premium sound engines including the Salamander Grand Piano, Vintage Organ, Plucked Strings, and Warm PolySynths.
*   **🔀 Dynamic Mapping:** Use the **Left/Right Arrow Keys** to dynamically shift your computer keyboard mapping up or down the piano by 7 semitones.
*   **🎼 Triple Notation:** Every key displays its standard MIDI note (C4), its mapped computer key (A), and its Hindi Sargam notation (सा, रे, ग).

## 🛠️ Tech Stack

*   **Frontend Structure:** Pure HTML5 & CSS3 (Heavily utilizing CSS Variables for theme management and flexbox/grid for responsive layout).
*   **Application Logic:** Vanilla JavaScript (ES6+), modularized into `audio.js`, `piano.js`, `magic.js`, and `songs.js`.
*   **Audio Synthesis:** [Tone.js v14](https://tonejs.github.io/) (Web Audio API framework).

## 🚀 Getting Started

Since this project uses pure Vanilla JS and no build tools, running it is incredibly simple!

### 1. Clone the Repository
```bash
git clone https://github.com/Barrsum/NeuroKeys-Vintage-Piano.git
cd NeuroKeys-Vintage-Piano
```

### 2. Run the App
There is no `npm install` required! Simply open the `index.html` file directly in your modern web browser.
*   **Tip:** For the best experience, use an extension like VS Code Live Server to serve the files locally.

## 🛡️ Architecture Insights

NeuroKeys avoids the "spaghetti code" trap of Vanilla JS by using a strictly modular architecture:
1.  **`audio.js` (Singleton Pattern):** Wraps Tone.js, handling all polyphonic synths, sample loading, and master volume. Exposes a clean API (`playNote`, `stopNote`) to the UI.
2.  **`piano.js` (DOM Controller):** Mathematically generates the 39-key layout, aligns the black keys, and handles all physical mouse/keyboard event listeners.
3.  **`magic.js` (Interceptor Pattern):** When active, it intercepts the `pointerdown` and `keydown` events from the UI, overriding the physical note with the next sequential note from `songs.js`. It also handles the non-blocking `setTimeout` loop for the Autoplay feature.

## 👤 Author

**Ram Bapat**
*   [LinkedIn](https://www.linkedin.com/in/ram-bapat-barrsum-diamos)
*   [GitHub](https://github.com/Barrsum)

---
*Part of the April Vibe Coding Challenge.*