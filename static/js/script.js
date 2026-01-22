class BeforeAfter {
    constructor(enteryObject) {

        const beforeAfterContainer = document.querySelector(enteryObject.id);
        const before = beforeAfterContainer.querySelector('.bal-before');
        const beforeText = beforeAfterContainer.querySelector('.bal-beforePosition');
        const afterText = beforeAfterContainer.querySelector('.bal-afterPosition');
        const handle = beforeAfterContainer.querySelector('.bal-handle');
        var widthChange = 0;

        beforeAfterContainer.querySelector('.bal-before-inset').setAttribute("style", "width: " + beforeAfterContainer.offsetWidth + "px;")
        window.onresize = function () {
            beforeAfterContainer.querySelector('.bal-before-inset').setAttribute("style", "width: " + beforeAfterContainer.offsetWidth + "px;")
        }
        before.setAttribute('style', "width: 50%;");
        handle.setAttribute('style', "left: 50%;");

        //touch screen event listener
        beforeAfterContainer.addEventListener("touchstart", (e) => {

            beforeAfterContainer.addEventListener("touchmove", (e2) => {
                let containerWidth = beforeAfterContainer.offsetWidth;
                let currentPoint = e2.changedTouches[0].clientX;

                let startOfDiv = beforeAfterContainer.offsetLeft;

                let modifiedCurrentPoint = currentPoint - startOfDiv;

                if (modifiedCurrentPoint > 10 && modifiedCurrentPoint < beforeAfterContainer.offsetWidth - 10) {
                    let newWidth = modifiedCurrentPoint * 100 / containerWidth;

                    before.setAttribute('style', "width:" + newWidth + "%;");
                    afterText.setAttribute('style', "z-index: 1;");
                    handle.setAttribute('style', "left:" + newWidth + "%;");
                }
            });
        });

        //mouse move event listener
        beforeAfterContainer.addEventListener('mousemove', (e) => {
            let containerWidth = beforeAfterContainer.offsetWidth;
            widthChange = e.offsetX;
            let newWidth = widthChange * 100 / containerWidth;

            if (e.offsetX > 10 && e.offsetX < beforeAfterContainer.offsetWidth - 10) {
                before.setAttribute('style', "width:" + newWidth + "%;");
                afterText.setAttribute('style', "z-index:" + "1;");
                handle.setAttribute('style', "left:" + newWidth + "%;");
            }
        })

    }
}

/**
 * VideoDics - A 4-video comparison slider with 3 dividers
 */
class VideoDics {
    constructor(options) {
        this.container = options.container;
        this.videos = options.videos; // Array of {src, label}
        this.videoElements = [];
        this.sliders = [];
        this.sections = [];
        this.positions = [25, 50, 75]; // Initial slider positions (%)
        this.activeSlider = null;
        
        this._build();
        this._setEvents();
    }

    _build() {
        const numVideos = this.videos.length;
        const sectionWidth = 100 / numVideos;

        // Create sections with videos
        for (let i = 0; i < numVideos; i++) {
            const section = document.createElement('div');
            section.className = 'video-dics__section';
            section.style.flex = `0 0 ${sectionWidth}%`;

            const videoContainer = document.createElement('div');
            videoContainer.className = 'video-dics__video-container';

            const video = document.createElement('video');
            video.className = 'video-dics__video';
            video.src = this.videos[i].src;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.autoplay = true;
            this.videoElements.push(video);

            const label = document.createElement('div');
            label.className = 'video-dics__label';
            label.textContent = this.videos[i].label;

            videoContainer.appendChild(video);
            videoContainer.appendChild(label);
            section.appendChild(videoContainer);
            this.container.appendChild(section);
            this.sections.push(section);

            // Add sliders between sections (not after the last one)
            if (i < numVideos - 1) {
                const slider = document.createElement('div');
                slider.className = 'video-dics__slider';
                slider.innerHTML = '<div class="video-dics__slider-handle"></div>';
                slider.dataset.index = i;
                this.container.appendChild(slider);
                this.sliders.push(slider);
            }
        }

        // Wait for videos to load then set dimensions
        this.videoElements[0].addEventListener('loadedmetadata', () => {
            this._setDimensions();
        });

        // Also try to set dimensions immediately if already loaded
        if (this.videoElements[0].readyState >= 1) {
            this._setDimensions();
        }
    }

    _setDimensions() {
        const video = this.videoElements[0];
        const aspectRatio = video.videoHeight / video.videoWidth;
        const containerWidth = this.container.offsetWidth;
        const containerHeight = containerWidth * aspectRatio;
        
        this.container.style.height = `${containerHeight}px`;

        // Set video widths to full container width and position them
        this.videoElements.forEach((v, i) => {
            v.style.width = `${containerWidth}px`;
            v.style.left = `${-i * (containerWidth / this.videos.length)}px`;
        });

        // Position sliders
        this._updateSliderPositions();
    }

    _updateSliderPositions() {
        const containerWidth = this.container.offsetWidth;
        const sectionWidth = containerWidth / this.videos.length;

        this.sliders.forEach((slider, i) => {
            const position = sectionWidth * (i + 1);
            slider.style.left = `${position}px`;
        });
    }

    _setEvents() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this._setDimensions();
        });

        // Slider drag events
        this.sliders.forEach((slider, index) => {
            const onMove = (e) => {
                if (this.activeSlider === null) return;
                
                const containerRect = this.container.getBoundingClientRect();
                const x = (e.clientX || e.touches[0].clientX) - containerRect.left;
                const containerWidth = containerRect.width;
                const sectionWidth = containerWidth / this.videos.length;

                // Calculate bounds based on neighboring sliders
                const minX = this.activeSlider === 0 ? 20 : parseFloat(this.sliders[this.activeSlider - 1].style.left) + 20;
                const maxX = this.activeSlider === this.sliders.length - 1 ? containerWidth - 20 : parseFloat(this.sliders[this.activeSlider + 1].style.left) - 20;

                const clampedX = Math.max(minX, Math.min(maxX, x));
                slider.style.left = `${clampedX}px`;

                // Update section widths
                this._updateSections();
            };

            slider.addEventListener('mousedown', (e) => {
                this.activeSlider = index;
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', () => {
                    this.activeSlider = null;
                    document.removeEventListener('mousemove', onMove);
                }, { once: true });
            });

            slider.addEventListener('touchstart', (e) => {
                this.activeSlider = index;
                document.addEventListener('touchmove', onMove);
                document.addEventListener('touchend', () => {
                    this.activeSlider = null;
                    document.removeEventListener('touchmove', onMove);
                }, { once: true });
            });
        });

        // Click to move nearest slider
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.video-dics__slider')) return;
            
            const containerRect = this.container.getBoundingClientRect();
            const x = e.clientX - containerRect.left;

            // Find nearest slider
            let nearestIndex = 0;
            let nearestDist = Infinity;
            this.sliders.forEach((slider, i) => {
                const sliderX = parseFloat(slider.style.left);
                const dist = Math.abs(sliderX - x);
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestIndex = i;
                }
            });

            // Move the nearest slider
            const containerWidth = containerRect.width;
            const minX = nearestIndex === 0 ? 20 : parseFloat(this.sliders[nearestIndex - 1].style.left) + 20;
            const maxX = nearestIndex === this.sliders.length - 1 ? containerWidth - 20 : parseFloat(this.sliders[nearestIndex + 1].style.left) - 20;
            const clampedX = Math.max(minX, Math.min(maxX, x));
            
            this.sliders[nearestIndex].style.left = `${clampedX}px`;
            this._updateSections();
        });
    }

    _updateSections() {
        const containerWidth = this.container.offsetWidth;
        const positions = [0, ...this.sliders.map(s => parseFloat(s.style.left)), containerWidth];

        this.sections.forEach((section, i) => {
            const width = positions[i + 1] - positions[i];
            section.style.flex = `0 0 ${width}px`;
            
            // Update video position
            this.videoElements[i].style.left = `${-positions[i]}px`;
        });
    }
}