document.addEventListener('DOMContentLoaded', () => {

    // --- URL Helper function ---
    const MAIN_REPO_URL = 'https://bryancontador.github.io/';
    
    function getAbsoluteUrl(path) {
        if (!path) return '';
        if (path.startsWith('http')) return path; // Already absolute
        return MAIN_REPO_URL + path;
    }

    // ==========================================================================
    //  TASKBAR CLOCK LOGIC
    // ==========================================================================
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        
        document.getElementById('clock').textContent = `${hours}:${minutes} ${ampm}`;
    }

    setInterval(updateClock, 1000);
    updateClock(); // Run immediately on load

    // ==========================================================================
    // DYNAMIC DESKTOP ICON GENERATION FROM DATA.JS
    // ==========================================================================
// ==========================================================================
    // DYNAMIC DESKTOP & START MENU GENERATION FROM DATA.JS
    // ==========================================================================
    const desktopContainer = document.getElementById('desktop-icons-container');
    const startMenuApps = document.getElementById('start-menu-apps');

    // Map your character IDs from data.js to your custom icon filenames
    //CUSTOM ICONS
    const customCharacterIcons = {
        'sunshine': 'resources/Menu/sunshine_48x48x32.png',
        'jamol': 'resources/Menu/jamol_48x48x32.png',
        'berkut': 'resources/Menu/berkut_48x48x32.png',
        'persona': 'resources/Menu/persona_48x48x32.png',
        'demon_girl': 'resources/Menu/demon_48x48x32.png',
        'misc': 'resources/Menu/others-48x48x32.png'
    }; 

    if (typeof galleryData !== 'undefined' && galleryData.categories) {
        galleryData.categories.forEach(character => {
            const iconSrc = customCharacterIcons[character.id] || "resources/Menu/directory_closed.png";

            // 1. Create Desktop Icon
            const iconDiv = document.createElement('div');
            iconDiv.className = 'desktop-icon';
            iconDiv.dataset.app = character.id; 
            
            // Set the small icon to be used for the window title bar & taskbar
            iconDiv.dataset.smallIcon = 'resources/Menu/small-folder_16x32.png';
            iconDiv.innerHTML = `<img src="${iconSrc}" alt="${character.name}"><span>${character.name}</span>`;
            desktopContainer.appendChild(iconDiv);

            // 2. Create Start Menu Item
            const smItem = document.createElement('div');
            smItem.className = 'sm-left-item';
            smItem.dataset.app = character.id;
            smItem.dataset.smallIcon = 'resources/Menu/small-folder_16x32.png';
            smItem.innerHTML = `
                <img src="${iconSrc}" alt="${character.name}">
                <div class="sm-item-text">
                    <strong>${character.name}</strong>
                    <span>Folder</span>
                </div>
            `;
            startMenuApps.appendChild(smItem);
        });
    }

    // Attach click events to all Start Menu Application buttons
    document.querySelectorAll('.sm-left-item, .sm-right-item').forEach(item => {
        item.addEventListener('click', () => {
            const appId = item.dataset.app;
            const title = item.querySelector('strong') ? item.querySelector('strong').textContent : item.querySelector('span').textContent;
            const iconSrc = item.dataset.smallIcon || item.querySelector('img').src;
            
            // Close start menu
            startMenu.classList.remove('show');
            startButton.classList.remove('active');
            
            openWindow(appId, title, iconSrc);
        });
    });

    // ==========================================================================
    // UPDATE DOUBLE-CLICK LOGIC
    // ==========================================================================
    const allIcons = document.querySelectorAll('.desktop-icon');

    allIcons.forEach(icon => {
        // Selection highlight
        icon.addEventListener('click', (e) => {
            e.stopPropagation(); 
            allIcons.forEach(i => i.classList.remove('selected'));
            icon.classList.add('selected');
        });

        // Double click to open
        icon.addEventListener('dblclick', () => {
            const appId = icon.dataset.app;
            const title = icon.querySelector('span').textContent;
            // NEW: Use the small icon data attribute! If it's missing, fallback to the large image.
            const iconSrc = icon.dataset.smallIcon || icon.querySelector('img').src;
            
            openWindow(appId, title, iconSrc);
        });

        // Mobile tap support
        let lastTap = 0;
        icon.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 500 && tapLength > 0) {
                const appId = icon.dataset.app;
                const title = icon.querySelector('span').textContent;
                // Use the small icon data attribute here too!
                const iconSrc = icon.dataset.smallIcon || icon.querySelector('img').src;
                
                openWindow(appId, title, iconSrc);
                e.preventDefault();
            }
            lastTap = currentTime;
        });
    });

    // Clicking empty desktop clears selection
    document.getElementById('desktop').addEventListener('click', () => {
        allIcons.forEach(i => i.classList.remove('selected'));
    });

    // ==========================================================================
    // WINDOW MANAGER SYSTEM
    // ==========================================================================
    let highestZIndex = 100;
    const desktopEl = document.getElementById('desktop');
    const taskbarTasksEl = document.getElementById('taskbar-tasks');
    const windowTemplate = document.getElementById('window-template');
    const openWindows = {};

    function openWindow(appId, title, iconSrc) {
        // Bring to front if already open
        if (openWindows[appId]) {
            focusWindow(openWindows[appId].windowEl, openWindows[appId].taskbarEl);
            return;
        }

        // Clone template
        const windowNode = windowTemplate.content.cloneNode(true);
        const windowEl = windowNode.querySelector('.xp-window');
        
        windowEl.id = `window-${appId}`;
        windowEl.querySelector('.window-title').textContent = title;
        windowEl.querySelector('.window-icon').src = iconSrc;
        
        populateWindowContent(appId, windowEl.querySelector('.window-content'));

        // Offset positions slightly
        const offset = Object.keys(openWindows).length * 20;
        if (window.innerWidth > 768) {
            windowEl.style.top = `${10 + offset}px`;
            windowEl.style.left = `${10 + offset}px`;
        }

        // Create Taskbar Button
        const taskbarBtn = document.createElement('div');
        taskbarBtn.className = 'taskbar-item';
        taskbarBtn.innerHTML = `<img src="${iconSrc}" alt=""> <span>${title}</span>`;
        taskbarTasksEl.appendChild(taskbarBtn);

        // Store reference
        openWindows[appId] = { windowEl, taskbarEl: taskbarBtn };
        desktopEl.appendChild(windowEl);
        focusWindow(windowEl, taskbarBtn);

        // --- WINDOW LISTENERS ---
        windowEl.addEventListener('mousedown', () => focusWindow(windowEl, taskbarBtn));
        windowEl.addEventListener('touchstart', () => focusWindow(windowEl, taskbarBtn), {passive: true});

        taskbarBtn.addEventListener('click', () => {
            if (windowEl.style.display === 'none') {
                windowEl.style.display = 'flex';
                focusWindow(windowEl, taskbarBtn);
            } else if (windowEl.style.zIndex == highestZIndex) {
                windowEl.style.display = 'none';
                taskbarBtn.classList.remove('active');
            } else {
                focusWindow(windowEl, taskbarBtn);
            }
        });

        // Close Button
        windowEl.querySelector('.btn-close').addEventListener('click', () => {
            windowEl.remove();
            taskbarBtn.remove();
            delete openWindows[appId];
        });

        // Minimize Button
        windowEl.querySelector('.btn-minimize').addEventListener('click', () => {
            windowEl.style.display = 'none';
            taskbarBtn.classList.remove('active');
        });

        // Maximize Logic
        let isMaximized = false;
        let prevTop, prevLeft, prevWidth, prevHeight;
        const btnMaximize = windowEl.querySelector('.btn-maximize');
        const titleBar = windowEl.querySelector('.title-bar');

        // ==========================================================================
        // WINDOW RESIZING SYSTEM
        // ==========================================================================
        function makeResizable(windowEl, taskbarBtn) {
            if (windowEl.classList.contains('xp-dialog-window')) return;

            const directions = ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'];
            const MIN_WIDTH = 250;
            const MIN_HEIGHT = 150;

            directions.forEach(dir => {
                const handle = document.createElement('div');
                handle.className = `resize-handle rh-${dir}`;
                handle.dataset.direction = dir;
                windowEl.appendChild(handle);

                handle.addEventListener('mousedown', initResizeMouse);
                handle.addEventListener('touchstart', initResizeTouch, { passive: false });
            });

            function initResizeMouse(e) {
                if (windowEl.classList.contains('maximized')) return;
                if (e.button !== 0) return; // Left mouse button only
                e.preventDefault();
                e.stopPropagation();

                focusWindow(windowEl, taskbarBtn);

                const dir = e.currentTarget.dataset.direction;
                startResizing(e.clientX, e.clientY, dir);
            }

            function initResizeTouch(e) {
                if (windowEl.classList.contains('maximized')) return;
                if (e.touches.length !== 1) return;
                e.preventDefault();
                e.stopPropagation();

                focusWindow(windowEl, taskbarBtn);

                const dir = e.currentTarget.dataset.direction;
                startResizing(e.touches[0].clientX, e.touches[0].clientY, dir);
            }

            function startResizing(startX, startY, dir) {
                const initialLeft = windowEl.offsetLeft;
                const initialTop = windowEl.offsetTop;
                const initialWidth = windowEl.offsetWidth;
                const initialHeight = windowEl.offsetHeight;
                const initialRight = initialLeft + initialWidth;
                const initialBottom = initialTop + initialHeight;

                const cursorMap = {
                    'n': 'ns-resize', 's': 'ns-resize',
                    'e': 'ew-resize', 'w': 'ew-resize',
                    'nw': 'nwse-resize', 'se': 'nwse-resize',
                    'ne': 'nesw-resize', 'sw': 'nesw-resize'
                };

                const prevCursor = document.body.style.cursor;
                document.body.style.cursor = cursorMap[dir] || 'default';

                let rafId = null;

                function doResize(clientX, clientY) {
                    const deltaX = clientX - startX;
                    const deltaY = clientY - startY;

                    let newLeft = initialLeft;
                    let newTop = initialTop;
                    let newWidth = initialWidth;
                    let newHeight = initialHeight;

                    // Horizontal component
                    if (dir.includes('e')) {
                        const maxAllowedWidth = Math.max(MIN_WIDTH, window.innerWidth - initialLeft);
                        newWidth = initialWidth + deltaX;
                        if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH;
                        if (newWidth > maxAllowedWidth) newWidth = maxAllowedWidth;
                    } else if (dir.includes('w')) {
                        let targetLeft = initialLeft + deltaX;
                        if (targetLeft < 0) targetLeft = 0;
                        const maxLeft = initialRight - MIN_WIDTH;
                        if (targetLeft > maxLeft) targetLeft = maxLeft;
                        newLeft = targetLeft;
                        newWidth = initialRight - newLeft;
                    }

                    // Vertical component
                    if (dir.includes('s')) {
                        const maxAllowedHeight = Math.max(MIN_HEIGHT, window.innerHeight - 30 - initialTop);
                        newHeight = initialHeight + deltaY;
                        if (newHeight < MIN_HEIGHT) newHeight = MIN_HEIGHT;
                        if (newHeight > maxAllowedHeight) newHeight = maxAllowedHeight;
                    } else if (dir.includes('n')) {
                        let targetTop = initialTop + deltaY;
                        if (targetTop < 0) targetTop = 0;
                        const maxTop = initialBottom - MIN_HEIGHT;
                        if (targetTop > maxTop) targetTop = maxTop;
                        newTop = targetTop;
                        newHeight = initialBottom - newTop;
                    }

                    windowEl.style.left = `${newLeft}px`;
                    windowEl.style.top = `${newTop}px`;
                    windowEl.style.width = `${newWidth}px`;
                    windowEl.style.height = `${newHeight}px`;
                }

                function onMouseMove(e) {
                    e.preventDefault();
                    if (rafId) cancelAnimationFrame(rafId);
                    rafId = requestAnimationFrame(() => doResize(e.clientX, e.clientY));
                }

                function onTouchMove(e) {
                    if (e.touches.length !== 1) return;
                    e.preventDefault();
                    if (rafId) cancelAnimationFrame(rafId);
                    rafId = requestAnimationFrame(() => doResize(e.touches[0].clientX, e.touches[0].clientY));
                }

                function stopResizing() {
                    if (rafId) cancelAnimationFrame(rafId);
                    document.removeEventListener('mousemove', onMouseMove);
                    document.removeEventListener('mouseup', stopResizing);
                    document.removeEventListener('touchmove', onTouchMove);
                    document.removeEventListener('touchend', stopResizing);
                    document.removeEventListener('touchcancel', stopResizing);
                    document.body.style.cursor = prevCursor;
                }

                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', stopResizing);
                document.addEventListener('touchmove', onTouchMove, { passive: false });
                document.addEventListener('touchend', stopResizing);
                document.addEventListener('touchcancel', stopResizing);
            }
        }

        function toggleMaximize() {
            if (!isMaximized) {
                prevTop = windowEl.style.top;
                prevLeft = windowEl.style.left;
                prevWidth = windowEl.style.width || (windowEl.offsetWidth + 'px');
                prevHeight = windowEl.style.height || (windowEl.offsetHeight + 'px');
                windowEl.classList.add('maximized');
                isMaximized = true;
            } else {
                windowEl.classList.remove('maximized');
                windowEl.style.top = prevTop;
                windowEl.style.left = prevLeft;
                windowEl.style.width = prevWidth || '600px';
                windowEl.style.height = prevHeight || '450px';
                isMaximized = false;

                // Ensure restored window fits current viewport
                if (window.innerWidth > 768) {
                    if (windowEl.offsetWidth > window.innerWidth) {
                        windowEl.style.width = window.innerWidth + 'px';
                    }
                    const maxAllowedH = window.innerHeight - 30;
                    if (windowEl.offsetHeight > maxAllowedH) {
                        windowEl.style.height = maxAllowedH + 'px';
                    }

                    const clamped = getClampedPosition(windowEl.offsetTop, windowEl.offsetLeft, windowEl.offsetWidth);
                    windowEl.style.top = clamped.top + "px";
                    windowEl.style.left = clamped.left + "px";
                }
            }
        }

        btnMaximize.addEventListener('click', toggleMaximize);
        titleBar.addEventListener('dblclick', toggleMaximize);

        // Make draggable
        makeDraggable(windowEl, titleBar);

        // Make resizable
        if (appId !== 'About Icons') {
            makeResizable(windowEl, taskbarBtn);
        }
    }

    function focusWindow(windowEl, taskbarEl) {
        highestZIndex++;
        windowEl.style.zIndex = highestZIndex;
        windowEl.style.display = 'flex';
        document.querySelectorAll('.taskbar-item').forEach(item => item.classList.remove('active'));
        taskbarEl.classList.add('active');
    }

    // ==========================================================================
    // WINDOW POSITION CLAMPING HELPER
    // ==========================================================================
    function getClampedPosition(top, left, width) {
        let clampedTop = top;
        let clampedLeft = left;

        // BOUNDARY CHECK: Top ceiling
        if (clampedTop < 0) clampedTop = 0;

        // BOUNDARY CHECK: Bottom floor (Keep title bar accessible above taskbar)
        // 60 = 30px taskbar + 30px safe space for the title bar
        const maxTop = Math.max(0, window.innerHeight - 60);
        if (clampedTop > maxTop) clampedTop = maxTop;

        // BOUNDARY CHECK: Left edge
        if (clampedLeft < 0) clampedLeft = 0;

        // BOUNDARY CHECK: Right edge (accounts for window's actual width)
        const maxLeft = Math.max(0, window.innerWidth - width);
        if (clampedLeft > maxLeft) clampedLeft = maxLeft;

        return { top: clampedTop, left: clampedLeft };
    }

    // Keep open windows within bounds if the viewport changes size
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) return; // Mobile layout uses CSS 100vw rules
        Object.values(openWindows).forEach(({ windowEl }) => {
            if (windowEl.classList.contains('maximized') || windowEl.style.display === 'none') return;
            const clamped = getClampedPosition(windowEl.offsetTop, windowEl.offsetLeft, windowEl.offsetWidth);
            windowEl.style.top = clamped.top + "px";
            windowEl.style.left = clamped.left + "px";
        });
    });

    function makeDraggable(windowEl, dragHandle) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        dragHandle.onmousedown = dragMouseDown;
        dragHandle.ontouchstart = dragTouchStart;

        function dragMouseDown(e) {
            if (windowEl.classList.contains('maximized')) return;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function dragTouchStart(e) {
            if (windowEl.classList.contains('maximized')) return;
            pos3 = e.touches[0].clientX;
            pos4 = e.touches[0].clientY;
            document.ontouchend = closeDragElement;
            document.ontouchmove = elementTouchDrag;
        }

        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            const newTop = windowEl.offsetTop - pos2;
            const newLeft = windowEl.offsetLeft - pos1;

            const clamped = getClampedPosition(newTop, newLeft, windowEl.offsetWidth);

            windowEl.style.top = clamped.top + "px";
            windowEl.style.left = clamped.left + "px";
        }

        function elementTouchDrag(e) {
            pos1 = pos3 - e.touches[0].clientX;
            pos2 = pos4 - e.touches[0].clientY;
            pos3 = e.touches[0].clientX;
            pos4 = e.touches[0].clientY;
            
            const newTop = windowEl.offsetTop - pos2;
            const newLeft = windowEl.offsetLeft - pos1;

            const clamped = getClampedPosition(newTop, newLeft, windowEl.offsetWidth);

            windowEl.style.top = clamped.top + "px";
            windowEl.style.left = clamped.left + "px";
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
            document.ontouchend = null;
            document.ontouchmove = null;
        }
    }

// ==========================================================================
    // CONTENT INJECTOR
    // ==========================================================================
    
    // Hash function needed for the Run command (Secret Input)
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Secret destinations map (copied from script.js)
    const SECRET_DESTINATIONS = {
        "3cc93b2a02bca5ed6dfd9626007d0c37acc72e87fe3887923ee8de4a52dbb14d": 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08": "sketches.html",
        "0832c0adf05418144b7b5f01e14600782ba7a302a606b49e3bf26214b765c176": "surprise.html"
    };

    function populateWindowContent(appId, contentContainer) {
        contentContainer.innerHTML = ''; 

        // 1. ABOUT APP
        if (appId === 'about') {
            contentContainer.innerHTML = `
                <div class="xp-about-layout">
                    <img src="resources/Menu/logoXP_bc.png" alt="Benjamin Counter">
                    <h2>Benjamin Counter</h2>
                    <p>Welcome to my portfolio, here you will find my latest artwork and creative projects.</p>
                    <p>Created and maintained by Bryan Benjamin Counter. This platform serves as a digital portfolio for my projects and artwork.
                    For inquiries, collaborations, or suggestions to improve the site, please use the contact details listed below.</p>
                    <p>Discord: bryancontador</p>
                    <p>Email: bryan.virtuales@gmail.com</p>
                    <a href="https://github.com/BryanContador" target="_blank" style="color: blue;">GitHub Profile</a> | 
                    <a href="https://x.com/BejaminCounter" target="_blank" style="color: blue;">Twitter/X</a>
                </div>
            `;
            return;
        }

        // 2. GIFTS & FANART APP
        if (appId === 'fanart') {
            const gridWrapper = document.createElement('div');
            gridWrapper.className = 'xp-main-area';
            gridWrapper.innerHTML = `<h2 style="margin-bottom: 15px;">Gifts & Fanart</h2>`;

            const grid = document.createElement('div');
            grid.className = 'xp-gallery-grid';

            const imageArray = galleryData.fanart.filter(item => item.type === 'image');
            imageArray.forEach((item, index) => {
                const thumb = createThumbnailElement(item, imageArray, index);
                grid.appendChild(thumb);
            });

            gridWrapper.appendChild(grid);
            contentContainer.appendChild(gridWrapper);
            return;
        }

        // 3. RUN... (CMD) APP
        if (appId === 'cmd') {
            contentContainer.innerHTML = `
                <div class="xp-run-layout">
                    <img src="resources/Menu/CMD_image2.png" alt="Run">
                    <div class="xp-run-content">
                        <p>Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.</p>
                        <div class="xp-run-input-group">
                            <strong>Open:</strong>
                            <input type="text" id="run-command-input" autocomplete="off">
                        </div>
                    </div>
                </div>
            `;

            const runInput = contentContainer.querySelector('#run-command-input');
            setTimeout(() => runInput.focus(), 100); // Auto focus input

            runInput.addEventListener('input', async (e) => {
                const val = e.target.value.trim(); 
                if (val.length === 0) { e.target.style.backgroundColor = ''; return; }
                
                const currentHash = await sha256(val);
                if (SECRET_DESTINATIONS[currentHash]) {
                    e.target.style.backgroundColor = '#d4ffd4'; // Light green success
                    setTimeout(() => {
                        window.location.href = SECRET_DESTINATIONS[currentHash];
                    }, 300); 
                } else {
                    e.target.style.backgroundColor = '';
                }
            });
            return;
        }

        // 4. NOTEPAD APP
        if (appId === 'notepad') {
            contentContainer.innerHTML = `
                <textarea id="notepad-textarea" class="xp-notepad-textarea" spellcheck="false" placeholder="Type here..."></textarea>
            `;
            
            const textarea = contentContainer.querySelector('#notepad-textarea');
            // Load saved notes
            const savedNote = localStorage.getItem('xp-notepad-data');
            if (savedNote) textarea.value = savedNote;

            // Save notes as you type
            textarea.addEventListener('input', (e) => {
                localStorage.setItem('xp-notepad-data', e.target.value);
            });
            
            setTimeout(() => textarea.focus(), 100);
            return;
        }

        // 5. ABOUT ICONS APP
        if (appId === 'About Icons') {
            const windowEl = contentContainer.closest('.xp-window');
            if (windowEl && window.innerWidth > 768) {
                windowEl.classList.add('xp-dialog-window');
                windowEl.style.width = '420px';
                windowEl.style.height = 'auto';
            }

            contentContainer.innerHTML = `
                <div class="xp-about-icons-content">
                    <p>The majority of the icons used in this project were extracted directly from an official Windows XP ISO, and converted into PNG format. I do not claim ownership of these assets; all associated rights and copyrights belong to Microsoft Corporation.</p>
                    <p>All original content (including artwork, descriptions, and other text) is Copyright &copy; 2026 Benjamin Counter. All Rights Reserved. Protected under the laws of Mexico and international copyright treaties</p>
                    <div class="xp-about-icons-actions">
                        <button class="xp-btn" id="about-icons-ok-btn">OK</button>
                    </div>
                </div>
            `;

            const okBtn = contentContainer.querySelector('#about-icons-ok-btn');
            if (okBtn) {
                okBtn.addEventListener('click', () => {
                    const win = contentContainer.closest('.xp-window');
                    if (win) {
                        const closeBtn = win.querySelector('.btn-close');
                        if (closeBtn) closeBtn.click();
                    }
                });
            }
            return;
        }
        
        // 6. CHARACTER & PROJECT FOLDERS
        const characterData = galleryData.categories.find(c => c.id === appId);
        if (characterData) {
            let sidebarInfo = '';
            
            // Adjust sidebar based on if it's a Project or a Character
            if (characterData.isProject) {
                sidebarInfo = `<p><strong>Description:</strong><br>${characterData.desc || 'Project folder.'}</p>`;
            } else {
                sidebarInfo = `
                    <p><strong>Bio:</strong><br>${characterData.bio || 'No bio available.'}</p><br>
                    <p><strong>Lore:</strong><br>${characterData.lore || 'No story available.'}</p>
                `;
            }

            contentContainer.innerHTML = `
                <div class="xp-explorer-layout">
                    <div class="xp-sidebar">
                        <img src="${getAbsoluteUrl(characterData.profileImage || characterData.thumb || 'resources/logo.png')}" alt="${characterData.name}">
                        <h3>${characterData.name}</h3>
                        ${sidebarInfo}
                    </div>
                    <div class="xp-main-area">
                        <h2 style="margin-bottom: 15px;">${characterData.name} Gallery</h2>
                        <div class="xp-gallery-grid" id="grid-${appId}"></div>
                    </div>
                </div>
            `;

            const charGrid = contentContainer.querySelector(`#grid-${appId}`);
            const rawArray = galleryData[characterData.galleryKey];

            if (rawArray && rawArray.length > 0) {
                const imageArray = rawArray.filter(item => item.type === 'image');
                imageArray.forEach((item, index) => {
                    const thumb = createThumbnailElement(item, imageArray, index);
                    charGrid.appendChild(thumb);
                });
            } else {
                charGrid.innerHTML = "<p>No artworks found in this folder.</p>";
            }
        }

        // 7. UPDATES.DOC APP (GitHub Commit Tracker)
        if (appId === 'updates') {
            contentContainer.innerHTML = `
                <div class="xp-doc-layout">
                    <div class="xp-doc-page">
                        <div class="xp-doc-header">
                            <img src="resources/Menu/Updates.png" alt="UPDATES.doc">
                            <div>
                                <h2>UPDATES</h2>
                                <p>Project changelog: <a href="https://github.com/BryanContador/winxp-portfolio" target="_blank" style="color: #0055ea;">BryanContador/winxp-portfolio</a></p>
                            </div>
                        </div>
                        <div class="xp-doc-body" id="updates-doc-body">
                            <p style="color: #555;">Contacting GitHub API for latest revision...</p>
                        </div>
                        <div class="xp-doc-footer">
                            <span style="color: #777; font-size: 10px;">Commits may take a few minutes to update.</span>
                            <button class="xp-btn" id="updates-refresh-btn">Check for Updates</button>
                        </div>
                    </div>
                </div>
            `;

            const bodyEl = contentContainer.querySelector('#updates-doc-body');
            const refreshBtn = contentContainer.querySelector('#updates-refresh-btn');

            function escapeHtml(str) {
                if (!str) return '';
                return str
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
            }

            function fetchLatestCommit() {
                bodyEl.innerHTML = `<p style="color: #555;">Contacting GitHub API for latest revision...</p>`;
                
                const username = 'BryanContador';
                const repo = 'winxp-portfolio';

                // Fetch the latest commit from the default branch
                fetch(`https://api.github.com/repos/${username}/${repo}/commits?per_page=1`)
                    .then(response => {
                        if (!response.ok) throw new Error("Branch not found or API limit reached");
                        return response.json();
                    })
                    .then(data => {
                        const commitObj = Array.isArray(data) ? data[0] : data;
                        if (!commitObj || !commitObj.commit) {
                            throw new Error("No commit data found");
                        }

                        const dateObj = new Date(commitObj.commit.author.date);
                        const options = { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric', 
                            hour: '2-digit', 
                            minute: '2-digit',
                            second: '2-digit'
                        };
                        const commitDate = dateObj.toLocaleString(undefined, options);
                        const commitMessage = commitObj.commit.message;
                        const commitUrl = commitObj.html_url;
                        const commitHash = commitObj.sha.substring(0, 7);
                        const authorName = commitObj.commit.author.name || username;

                        bodyEl.innerHTML = `
                            <p><strong>Status:</strong> Synchronized with repository.</p>
                            <div class="xp-commit-card">
                                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                                    <strong>Last commit: <a href="${commitUrl}" target="_blank" style="color: #0055ea; font-family: monospace;">[${commitHash}]</a></strong>
                                    <span style="font-size: 10px; color: #555;">Author: ${escapeHtml(authorName)}</span>
                                </div>
                                <div class="xp-commit-message">${escapeHtml(commitMessage)}</div>
                                <div style="font-size: 10px; color: #555; text-align: right;">
                                    Committed on: <strong>${commitDate}</strong>
                                </div>
                            </div>
                            <p style="margin-top: 10px; font-size: 11px;">
                                View full history and source files on <a href="https://github.com/${username}/${repo}" target="_blank" style="color: #0055ea;">GitHub</a>.
                            </p>
                        `;
                    })
                    .catch(error => {
                        console.error('Error fetching last commit:', error);
                        bodyEl.innerHTML = `
                            <div style="padding: 10px; background: #fff2f2; border: 1px solid #d99; border-radius: 3px; color: #900;">
                                <strong>Notice:</strong> Latest update data currently unavailable.<br>
                                <span style="font-size: 10px; color: #666;">(GitHub API hourly rate limit may be reached or network is offline)</span>
                            </div>
                            <p style="margin-top: 10px;">
                                You can view updates directly on <a href="https://github.com/${username}/${repo}/commits" target="_blank" style="color: #0055ea;">GitHub Commits</a>.
                            </p>
                        `;
                    });
            }

            fetchLatestCommit();

            if (refreshBtn) {
                refreshBtn.addEventListener('click', fetchLatestCommit);
            }

            return;
        }
    }

    function createThumbnailElement(itemData, currentArray, currentIndex) {
        const wrapper = document.createElement('div');
        wrapper.className = 'xp-thumbnail';
        
        const img = document.createElement('img');
        img.src = getAbsoluteUrl(itemData.thumb || 'resources/logo.png');
        img.loading = "lazy";
        
        const label = document.createElement('span');
        label.textContent = itemData.title || 'Untitled';

        wrapper.appendChild(img);
        wrapper.appendChild(label);

        // Double click launches the Picture Viewer
        wrapper.addEventListener('dblclick', () => openPictureViewer(currentArray, currentIndex));

        let lastTap = 0;
        wrapper.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 500 && tapLength > 0) {
                openPictureViewer(currentArray, currentIndex);
                e.preventDefault();
            }
            lastTap = currentTime;
        });

        return wrapper;
    }

    // ==========================================================================
    // WINDOWS PICTURE AND FAX VIEWER (With Zoom, Alt, and Blur Flash Fix)
    // ==========================================================================
    let viewerCurrentArray = [];
    let viewerCurrentIndex = 0;
    let viewerAltIndex = 0; // Tracks which alt image we are on
    let viewerZoomLevel = 1; // Tracks zoom multiplier

    const MIN_ZOOM = 1;   // Default 100% fit
    const MAX_ZOOM = 4;   // Max 400% zoom (adjust to taste, e.g. 5 or 6)
    const ZOOM_STEP = 0.5;
    
    // Panning variables
    let isPanning = false, panStartX, panStartY, scrollLeft, scrollTop;

    function openPictureViewer(itemArray, startIndex) {
        viewerCurrentArray = itemArray;
        viewerCurrentIndex = startIndex;
        viewerAltIndex = 0; // Reset alt on new open
        viewerZoomLevel = 1; // Reset zoom on new open
        
        const appId = 'pictureViewer';
        const title = "Windows Picture and Fax Viewer";
        const iconSrc = "resources/Menu/image.png";
        
        openWindow(appId, title, iconSrc);
        
        const windowEl = document.getElementById(`window-${appId}`);
        if(!windowEl) return;
        const contentContainer = windowEl.querySelector('.window-content');
        
        // Inject UI if it doesn't exist
        if(!contentContainer.querySelector('.xp-picture-viewer')) {
            contentContainer.innerHTML = `
                <div class="xp-picture-viewer">
                    <div class="xp-picture-info">
                        <strong class="pv-title"></strong><br>
                        <span class="pv-desc"></span>
                    </div>
                    <div class="xp-picture-display">
                        <div class="pv-loader" style="position: absolute; color: #555; font-family: Tahoma, 'Segoe UI', Geneva, sans-serif; display: none;">Loading...</div>
                        <img class="pv-img" src="" alt="">
                        <div class="sensitive-warning">Sensitive Content - Click to View</div>
                    </div>
                    <div class="xp-picture-toolbar">
                        <button class="xp-toolbar-btn pv-prev" title="Previous Image">◄</button>
                        <button class="xp-toolbar-btn pv-next" title="Next Image">►</button>
                        <div style="width: 1px; height: 20px; background: #7f9db9; margin: 0 5px;"></div>
                        <button class="xp-toolbar-btn pv-zoom-in" title="Zoom In">＋</button>
                        <button class="xp-toolbar-btn pv-zoom-out" title="Zoom Out">－</button>
                        <button class="xp-toolbar-btn pv-zoom-reset" title="Fit to Window">▢</button>
                        <div style="width: 1px; height: 20px; background: #7f9db9; margin: 0 5px;"></div>
                        <button class="xp-toolbar-btn pv-alt" title="View Alternative" style="display:none; font-size:12px; font-weight:bold;">ALT</button>
                    </div>
                </div>
            `;
            
            // --- EVENT LISTENERS ---
            const displayArea = contentContainer.querySelector('.xp-picture-display');
            const imgEl = contentContainer.querySelector('.pv-img');
            const warningBtn = contentContainer.querySelector('.sensitive-warning');

            // Navigation
            contentContainer.querySelector('.pv-prev').addEventListener('click', () => {
                viewerCurrentIndex = (viewerCurrentIndex - 1 + viewerCurrentArray.length) % viewerCurrentArray.length;
                viewerAltIndex = 0; // Reset alt source
                viewerZoomLevel = 1; // Reset zoom
                imgEl.removeAttribute('data-revealed'); // Re-hide sensitive content
                updatePictureViewerUI();
            });
            
            contentContainer.querySelector('.pv-next').addEventListener('click', () => {
                viewerCurrentIndex = (viewerCurrentIndex + 1) % viewerCurrentArray.length;
                viewerAltIndex = 0; 
                viewerZoomLevel = 1; 
                imgEl.removeAttribute('data-revealed');
                updatePictureViewerUI();
            });

            // Alt Sources
            contentContainer.querySelector('.pv-alt').addEventListener('click', () => {
                viewerAltIndex++; 
                viewerZoomLevel = 1;
                // The bounds check for this index happens inside updatePictureViewerUI
                updatePictureViewerUI(); 
            });

            // Zoom Controls
            // Zoom In: Only increase if below MAX_ZOOM
            contentContainer.querySelector('.pv-zoom-in').addEventListener('click', () => { 
                if (viewerZoomLevel < MAX_ZOOM) {
                    viewerZoomLevel = Math.min(MAX_ZOOM, viewerZoomLevel + ZOOM_STEP);
                    applyZoom(); 
                }
            });

            // Zoom Out: Only decrease if above MIN_ZOOM
            contentContainer.querySelector('.pv-zoom-out').addEventListener('click', () => { 
                if (viewerZoomLevel > MIN_ZOOM) {
                    viewerZoomLevel = Math.max(MIN_ZOOM, viewerZoomLevel - ZOOM_STEP);
                    applyZoom(); 
                }
            });

            // Zoom Reset
            contentContainer.querySelector('.pv-zoom-reset').addEventListener('click', () => { 
                viewerZoomLevel = 1; 
                applyZoom(); 
            });

            // Sensitive Content un-blur
            warningBtn.addEventListener('click', () => {
                imgEl.classList.remove('blurred');
                warningBtn.style.display = 'none';
                imgEl.setAttribute('data-revealed', 'true');
            });

            // Panning Logic (Click and Drag when zoomed)
            // Prevent default native image dragging (ghost image)
            imgEl.setAttribute('draggable', 'false');
            imgEl.addEventListener('dragstart', (e) => e.preventDefault());

            //Start Panning on Mousedown
            displayArea.addEventListener('mousedown', (e) => {
                // Only pan if zoomed in and left mouse button is clicked
                if (viewerZoomLevel > 1 && e.button === 0) {
                    e.preventDefault(); // Prevents ghost image & text selection
                    isPanning = true;
                    panStartX = e.pageX - displayArea.offsetLeft;
                    panStartY = e.pageY - displayArea.offsetTop;
                    scrollLeft = displayArea.scrollLeft;
                    scrollTop = displayArea.scrollTop;
                }
            });

            // Move/Pan only while the button is physically held down
            displayArea.addEventListener('mousemove', (e) => {
                // Failsafe: if the user released the click anywhere, stop panning immediately
                if (!isPanning || e.buttons !== 1) {
                    isPanning = false;
                    return;
                }
                e.preventDefault();
                const x = e.pageX - displayArea.offsetLeft;
                const y = e.pageY - displayArea.offsetTop;
                const walkX = (x - panStartX);
                const walkY = (y - panStartY);
                displayArea.scrollLeft = scrollLeft - walkX;
                displayArea.scrollTop = scrollTop - walkY;
            });

            //Stop Panning on Mouseup or when mouse leaves the viewer window
            window.addEventListener('mouseup', () => {
                isPanning = false;
            });
        }
        
        updatePictureViewerUI();
    }

    function updatePictureViewerUI() {
        const windowEl = document.getElementById('window-pictureViewer');
        if(!windowEl) return;
        
        const item = viewerCurrentArray[viewerCurrentIndex];
        const imgEl = windowEl.querySelector('.pv-img');
        const warningBtn = windowEl.querySelector('.sensitive-warning');
        const altBtn = windowEl.querySelector('.pv-alt');
        const loaderText = windowEl.querySelector('.pv-loader');
        
        // Wrap the main source in getAbsoluteUrl
        let sources = [getAbsoluteUrl(item.highRes || item.thumb)];
        let sensitivities = [item.sensitive === true];

        if (item.altSources && item.altSources.length > 0) {
            item.altSources.forEach(alt => {
                if (typeof alt === 'string') {
                    // Wrap the string alt source
                    sources.push(getAbsoluteUrl(alt));
                    sensitivities.push(item.sensitive === true); 
                } else if (typeof alt === 'object') {
                    // Wrap the object alt source
                    sources.push(getAbsoluteUrl(alt.src));
                    sensitivities.push(alt.sensitive !== undefined ? alt.sensitive : item.sensitive === true);
                }
            });
        }

        // Show/Hide Alt Button
        if (sources.length > 1) {
            altBtn.style.display = 'flex';
        } else {
            altBtn.style.display = 'none';
            viewerAltIndex = 0;
        }

        // Ensure Alt index wraps around correctly
        if (viewerAltIndex >= sources.length) viewerAltIndex = 0;

        const currentSrc = sources[viewerAltIndex];
        const currentSensitive = sensitivities[viewerAltIndex];

        // Update Text
        windowEl.querySelector('.pv-title').textContent = item.title || 'Untitled';
        let descText = item.description || '';
        if (sources.length > 1) descText += ` (Showing alt ${viewerAltIndex + 1}/${sources.length})`;
        windowEl.querySelector('.pv-desc').textContent = descText;
        windowEl.querySelector('.window-title').textContent = `${item.title || 'Image'} - Windows Picture and Fax Viewer`;

        // --- INSTANT IMAGE SWAP LOGIC ---
        
        //Hide image and warning instantly, show Loading text
        imgEl.style.visibility = 'hidden'; 
        imgEl.classList.remove('blurred');
        warningBtn.style.display = 'none';
        loaderText.style.display = 'block';
        loaderText.textContent = 'Loading...';
        
        applyZoom();

        imgEl.src = currentSrc;

        imgEl.onload = () => {
            loaderText.style.display = 'none';

            if (currentSensitive && !imgEl.getAttribute('data-revealed')) {
                imgEl.classList.add('blurred');
                warningBtn.style.display = 'block';
            } else {
                imgEl.classList.remove('blurred');
            }
            
            imgEl.style.visibility = 'visible';
        };

        imgEl.onerror = () => {
            loaderText.textContent = 'Error loading image.';
        };
    }

    function applyZoom() {
        const windowEl = document.getElementById('window-pictureViewer');
        if(!windowEl) return;
        const display = windowEl.querySelector('.xp-picture-display');
        const img = windowEl.querySelector('.pv-img');
        
        if (viewerZoomLevel <= 1) {
            // Reset to fit window
            img.style.width = 'auto';
            img.style.height = 'auto';
            display.classList.remove('is-zoomed');
        } else {
            // Apply Zoom
            img.style.width = `${viewerZoomLevel * 100}%`;
            img.style.height = 'auto';
            display.classList.add('is-zoomed');
        }
    }
    // ==========================================================================
    // START MENU & AUTHENTIC SHUTDOWN SEQUENCE
    // ==========================================================================
    const startButton = document.getElementById('start-button');
    const startMenu = document.getElementById('start-menu');
    const btnStartTurnOff = document.getElementById('start-btn-turnoff');
    
    const shutdownOverlay = document.getElementById('shutdown-overlay');
    const btnTodCancel = document.getElementById('tod-cancel');
    const btnTodRestart = document.getElementById('tod-restart');
    const btnTodShutdown = document.getElementById('tod-shutdown');
    
    const logoffScreen = document.getElementById('logoff-screen');
    const taskbarElement = document.getElementById('taskbar');
    // Note: desktopContainer is already defined higher up in the file as 'desktopContainer' or 'desktopIcons'
    const desktopElement = document.getElementById('desktop-icons-container');

    // Toggle Start Menu
    if (startButton) {
        startButton.addEventListener('click', (e) => {
            e.stopPropagation();
            startMenu.classList.toggle('show');
            startButton.classList.toggle('active');
        });
    }

    // Close Start Menu when clicking anywhere else
    document.addEventListener('click', (e) => {
        if (startMenu && startButton && !startMenu.contains(e.target) && !startButton.contains(e.target)) {
            startMenu.classList.remove('show');
            startButton.classList.remove('active');
        }
    });

    // "Turn Off Computer" inside Start Menu
    if (btnStartTurnOff) {
        btnStartTurnOff.addEventListener('click', () => {
            startMenu.classList.remove('show');
            startButton.classList.remove('active');
            
            // Activate the grayscale backdrop & dialog
            if (shutdownOverlay) {
                shutdownOverlay.classList.add('show');
            } else {
                console.error("Shutdown overlay HTML missing");
            }
        });
    }

    // "Cancel" on Dialog Box
    if (btnTodCancel) {
        btnTodCancel.addEventListener('click', () => {
            shutdownOverlay.classList.remove('show');
        });
    }

    //"Restart" on Dialog Box
    if (btnTodRestart) {
        btnTodRestart.addEventListener('click', () => {
            location.reload(); 
        });
    }

    // "Turn Off" on Dialog Box
    if (btnTodShutdown) {
        btnTodShutdown.addEventListener('click', () => {
            // Fade out the overlay/dialog first
            shutdownOverlay.classList.remove('show');
            
            setTimeout(() => {
                
                //Close every open window
                Object.values(openWindows).forEach(win => {
                    win.windowEl.style.display = 'none';
                });
                
                // Hide Desktop icons after 400ms
                setTimeout(() => {
                    if (desktopElement) desktopElement.style.display = 'none';
                    
                    //Hide Taskbar after another 400ms
                    setTimeout(() => {
                        if (taskbarElement) taskbarElement.style.display = 'none';
                        
                        // Turn the background black briefly
                        document.body.style.backgroundImage = 'none';
                        document.body.style.backgroundColor = '#000';
                        
                        //Reveal the Blue "Shutting Down" screen
                        setTimeout(() => {
                            logoffScreen.classList.add('show');
                            
                            //Redirect to main site
                            setTimeout(() => {
                                window.location.href = "https://bryancontador.github.io/index.html";
                            }, 3500);
                            
                        }, 600); // Delay before blue screen appears
                        
                    }, 400); // Delay before taskbar disappears
                    
                }, 400); // Delay before icons disappear
                
            }, 500); // Wait for the grayscale dialog to disappear
        });
    }
}); 