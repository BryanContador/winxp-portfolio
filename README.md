<div align="center">

# Benjamin Counter - Windows XP OS Portfolio

A web-based, fully functional Windows XP simulation built with Vanilla HTML, CSS, and JavaScript. This project serves as an alternative, nostalgic interface for the [Benjamin Counter Art Portfolio](https://bryancontador.github.io/).

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)

![GitHub Pages](https://img.shields.io/badge/Hosted_on-GitHub_Pages-121013?logo=github&logoColor=white)
</div>


## Features
* **Authentic UI:** A highly detailed recreation of the Windows XP "Luna" theme, including the taskbar, system tray, and Start menu.
* **Window Management:** Fully draggable, resizable, minimizable, and maximizable windows with z-index focus tracking.
* **Windows Picture and Fax Viewer:** A custom-built image viewer that supports zooming, panning, and swapping between alternative image versions, complete with a sensitive content blurring system.
* **Working Applications:** 
  * **Notepad:** A functional text editor that saves your notes locally using `localStorage`.
  * **Run (CMD):** A command prompt simulation that accepts secret SHA-256 hashed codes to trigger easter eggs.
  * **Windows Explorer:** Dynamic folders that generate galleries based on character data.
* **Boot & Shutdown Sequences:** Authentic startup and logoff animations that seamlessly transition users between this OS and the modern portfolio site.

## Architecture & Remote Data Fetching
This project is built using **Vanilla HTML5, CSS3, and JavaScript**. No external frameworks were used.

To keep the codebase clean and avoid duplicating artwork, this repository acts as a "frontend client" for the main portfolio. 
* It does **not** store any artwork locally.
* It dynamically fetches `data.js` directly from the main portfolio repository (`https://bryancontador.github.io/data.js`).
* A custom URL helper in `scriptXP.js` automatically prepends the main repository's URL to all image paths, allowing the XP OS to render the galleries remotely.

This means whenever new art is added to the main portfolio, this Windows XP site updates automatically without requiring any code changes here.

## Developer Guide: Easter Eggs (Run Command)
The "Run..." application in the Start Menu accepts secret codes. These codes are hashed using SHA-256 to hide the answers from the source code.

To add a new secret code, generate a SHA-256 hash of your secret word and add it to the `SECRET_DESTINATIONS` object in `scriptXP.js`:

```javascript
const SECRET_DESTINATIONS = {
    "3cc93b2a02bca5ed6dfd9626007d0c37acc72e87fe3887923ee8de4a52dbb14d": 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    "your_new_hash_here": "https://example.com/surprise"
};
```

## License & Usage

### The Code: Open Source
The underlying source code (HTML, CSS, JavaScript) used to build this Windows XP simulation is completely free to use. You are welcome to copy, modify, adapt, and use the code for your own projects without any restrictions.

### The Art & Content: All Rights Reserved
All artwork, illustrations, and character lore fetched and displayed by this application belong to **Benjamin Counter** and are **Copyright © 2026. All rights reserved.** You may not reproduce or distribute the artwork displayed within this simulation without explicit written permission.

## Contact
* **Main Portfolio:** [bryancontador.github.io](https://bryancontador.github.io/)
* **Email:** bryan.virtuales@gmail.com
