// Starfield animation JavaScript

(function() {
    const canvas = document.getElementById('starfield');
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    // Mouse tracking
    let mouse = {
        x: width / 2,
        y: height / 2,
        px: width / 2,
        py: height / 2
    };
    
    // Star settings
    let stars = [];
    const numStars = 800;
    let speed = 0.5;
    let warpMode = true;
    let rainbowMode = false;
    let hue = 0;
    
    // Star class
    class Star {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.z = Math.random() * 1000;
            this.pz = this.z;
            this.size = Math.random() * 2;
            this.color = this.getColor();
        }
        
        getColor() {
            if (rainbowMode) {
                return `hsl(${(hue + this.x * 0.1) % 360}, 70%, 80%)`;
            }
            const brightness = Math.random() * 0.5 + 0.5;
            return `rgba(255, 255, 255, ${brightness})`;
        }
        
        update() {
            // Calculate mouse influence
            const dx = mouse.x - width / 2;
            const dy = mouse.y - height / 2;
            
            // Move star based on mouse position
            this.z -= speed * (warpMode ? 3 : 1);
            
            // Add mouse-based movement
            if (warpMode) {
                this.x += dx * 0.001;
                this.y += dy * 0.001;
            } else {
                this.x += dx * 0.0002;
                this.y += dy * 0.0002;
            }
            
            // Reset star if it goes off screen or too close
            if (this.z <= 0 || this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
                this.reset();
                this.z = 1000;
            }
            
            // Update color for rainbow mode
            if (rainbowMode) {
                this.color = `hsl(${(hue + this.x * 0.1) % 360}, 70%, 80%)`;
            }
        }
        
        draw() {
            // Calculate screen position with perspective
            const sx = (this.x - width / 2) * (800 / this.z) + width / 2;
            const sy = (this.y - height / 2) * (800 / this.z) + height / 2;
            
            // Calculate size based on depth
            const size = Math.max(0.5, (1000 - this.z) / 100);
            
            // Draw star with glow effect
            ctx.beginPath();
            ctx.arc(sx, sy, size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            
            // Add glow for closer stars
            if (this.z < 500) {
                ctx.beginPath();
                ctx.arc(sx, sy, size * 2, 0, Math.PI * 2);
                const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 2);
                gradient.addColorStop(0, this.color);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.fill();
            }
            
            // Draw trail in warp mode
            if (warpMode && this.z < 800) {
                const px = (this.x - width / 2) * (800 / this.pz) + width / 2;
                const py = (this.y - height / 2) * (800 / this.pz) + height / 2;
                
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(sx, sy);
                ctx.strokeStyle = this.color;
                ctx.lineWidth = size * 0.5;
                ctx.lineCap = 'round';
                ctx.stroke();
            }
            
            this.pz = this.z;
        }
    }
    
    // Initialize stars
    function initStars() {
        stars = [];
        for (let i = 0; i < numStars; i++) {
            stars.push(new Star());
        }
    }
    
    // Animation loop
    function animate() {
        // Create fade effect
        ctx.fillStyle = 'rgba(10, 10, 26, 0.1)';
        ctx.fillRect(0, 0, width, height);
        
        // Update and draw stars
        stars.forEach(star => {
            star.update();
            star.draw();
        });
        
        // Update hue for rainbow mode
        if (rainbowMode) {
            hue = (hue + 0.5) % 360;
        }
        
        // Smooth mouse movement
        mouse.x += (mouse.px - mouse.x) * 0.1;
        mouse.y += (mouse.py - mouse.y) * 0.1;
        
        requestAnimationFrame(animate);
    }
    
    // Event listeners
    canvas.addEventListener('mousemove', (e) => {
        mouse.px = e.clientX;
        mouse.py = e.clientY;
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        mouse.px = e.touches[0].clientX;
        mouse.py = e.touches[0].clientY;
    });
    
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });
    
    // Control button handlers
    function setupControls() {
        const warpBtn = document.getElementById('warpBtn');
        const calmBtn = document.getElementById('calmBtn');
        const rainbowBtn = document.getElementById('rainbowBtn');
        
        if (warpBtn) {
            warpBtn.addEventListener('click', function() {
                warpMode = true;
                speed = 0.5;
                document.querySelectorAll('.control-btn').forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
            });
        }
        
        if (calmBtn) {
            calmBtn.addEventListener('click', function() {
                warpMode = false;
                speed = 0.2;
                document.querySelectorAll('.control-btn').forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
            });
        }
        
        if (rainbowBtn) {
            rainbowBtn.addEventListener('click', function() {
                rainbowMode = !rainbowMode;
                this.classList.toggle('active');
                if (!rainbowMode) {
                    stars.forEach(star => {
                        star.color = star.getColor();
                    });
                }
            });
        }
    }
    
    // Initialize and start
    function init() {
        initStars();
        setupControls();
        animate();
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
