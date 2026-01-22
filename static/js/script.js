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
 * VideoDics - A 4-video comparison slider with 3 dividers (Canvas-based)
 * Renders 4 videos on a single canvas with draggable dividers
 */
class VideoDics {
    constructor(options) {
        this.container = options.container;
        this.videoConfigs = options.videos; // Array of {src, label}
        this.videos = [];
        this.canvas = null;
        this.ctx = null;
        this.sliderPositions = [0.25, 0.5, 0.75]; // Normalized positions (0-1)
        this.activeSlider = null;
        this.width = 0;
        this.height = 0;
        this.videosLoaded = 0;
        
        this._build();
    }

    _build() {
        // Create hidden video elements
        const videoContainer = document.createElement('div');
        videoContainer.style.display = 'none';
        
        this.videoConfigs.forEach((config, i) => {
            const video = document.createElement('video');
            video.src = config.src;
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.crossOrigin = 'anonymous';
            video.addEventListener('loadedmetadata', () => this._onVideoLoaded());
            videoContainer.appendChild(video);
            this.videos.push(video);
        });
        
        this.container.appendChild(videoContainer);
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.width = '100%';
        this.canvas.style.display = 'block';
        this.canvas.style.cursor = 'ew-resize';
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this._setEvents();
    }

    _onVideoLoaded() {
        this.videosLoaded++;
        if (this.videosLoaded === this.videos.length) {
            this._initCanvas();
            this._syncAndPlayVideos();
            this._startDrawLoop();
        }
    }

    _initCanvas() {
        const video = this.videos[0];
        const containerWidth = this.container.offsetWidth;
        const aspectRatio = video.videoHeight / video.videoWidth;
        
        this.width = containerWidth;
        this.height = containerWidth * aspectRatio;
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    _syncAndPlayVideos() {
        // Play all videos from the start
        this.videos.forEach(video => {
            video.currentTime = 0;
            video.play();
        });
    }

    _setEvents() {
        // Mouse/touch tracking
        const getPosition = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
            return x / rect.width; // Normalized 0-1
        };

        const findNearestSlider = (pos) => {
            let nearest = 0;
            let minDist = Math.abs(this.sliderPositions[0] - pos);
            for (let i = 1; i < this.sliderPositions.length; i++) {
                const dist = Math.abs(this.sliderPositions[i] - pos);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = i;
                }
            }
            return nearest;
        };

        const onMove = (e) => {
            e.preventDefault();
            const pos = getPosition(e);
            
            if (this.activeSlider !== null) {
                // Constrain slider position
                const minPos = this.activeSlider === 0 ? 0.02 : this.sliderPositions[this.activeSlider - 1] + 0.02;
                const maxPos = this.activeSlider === this.sliderPositions.length - 1 ? 0.98 : this.sliderPositions[this.activeSlider + 1] - 0.02;
                this.sliderPositions[this.activeSlider] = Math.max(minPos, Math.min(maxPos, pos));
            }
        };

        const onEnd = () => {
            this.activeSlider = null;
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onEnd);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onEnd);
        };

        this.canvas.addEventListener('mousedown', (e) => {
            const pos = getPosition(e);
            this.activeSlider = findNearestSlider(pos);
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onEnd);
        });

        this.canvas.addEventListener('touchstart', (e) => {
            const pos = getPosition(e);
            this.activeSlider = findNearestSlider(pos);
            document.addEventListener('touchmove', onMove, { passive: false });
            document.addEventListener('touchend', onEnd);
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this._initCanvas();
        });
    }

    _startDrawLoop() {
        const draw = () => {
            this._drawFrame();
            requestAnimationFrame(draw);
        };
        requestAnimationFrame(draw);
    }

    _drawFrame() {
        const ctx = this.ctx;
        const w = this.width;
        const h = this.height;
        const positions = [0, ...this.sliderPositions, 1];

        // Draw each video section
        for (let i = 0; i < this.videos.length; i++) {
            const video = this.videos[i];
            const startX = positions[i] * w;
            const endX = positions[i + 1] * w;
            const sectionWidth = endX - startX;

            if (sectionWidth > 0 && video.readyState >= 2) {
                // Calculate source coordinates (same position in source video)
                const srcX = positions[i] * video.videoWidth;
                const srcWidth = (positions[i + 1] - positions[i]) * video.videoWidth;

                ctx.drawImage(
                    video,
                    srcX, 0, srcWidth, video.videoHeight,  // source
                    startX, 0, sectionWidth, h              // destination
                );
            }
        }

        // Draw sliders and labels
        for (let i = 0; i < this.sliderPositions.length; i++) {
            const x = this.sliderPositions[i] * w;
            
            // Draw slider line
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3;
            ctx.stroke();

            // Draw slider handle (circle with arrows)
            const handleY = h / 2;
            const handleRadius = 15;
            
            ctx.beginPath();
            ctx.arc(x, handleY, handleRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw arrows
            ctx.beginPath();
            ctx.moveTo(x - 6, handleY);
            ctx.lineTo(x - 2, handleY - 4);
            ctx.lineTo(x - 2, handleY + 4);
            ctx.closePath();
            ctx.fillStyle = '#333';
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(x + 6, handleY);
            ctx.lineTo(x + 2, handleY - 4);
            ctx.lineTo(x + 2, handleY + 4);
            ctx.closePath();
            ctx.fill();
        }

        // Draw labels
        const labelY = h - 20;
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        
        for (let i = 0; i < this.videoConfigs.length; i++) {
            const startX = positions[i] * w;
            const endX = positions[i + 1] * w;
            const centerX = (startX + endX) / 2;
            const sectionWidth = endX - startX;
            
            if (sectionWidth > 60) { // Only draw label if section is wide enough
                const label = this.videoConfigs[i].label;
                const textWidth = ctx.measureText(label).width;
                
                // Draw label background
                ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
                ctx.fillRect(centerX - textWidth/2 - 8, labelY - 12, textWidth + 16, 20);
                
                // Draw label text
                ctx.fillStyle = '#333';
                ctx.fillText(label, centerX, labelY);
            }
        }
    }
}