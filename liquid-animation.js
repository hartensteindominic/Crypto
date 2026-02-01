/**
 * Liquid Animation - Immersive Visual Effects
 * Creates vibrant, liquid-style background animation
 */

class LiquidAnimation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 50;
        this.connectionDistance = 150;
        this.mouse = { x: null, y: null };
        
        this.colors = [
            '#6366f1', // Primary
            '#8b5cf6', // Secondary
            '#10b981', // Success
            '#f59e0b', // Warning
            '#ec4899'  // Pink accent
        ];

        this.init();
        this.setupEventListeners();
        this.animate();
    }

    /**
     * Initialize canvas and particles
     */
    init() {
        this.resizeCanvas();
        this.createParticles();
    }

    /**
     * Resize canvas to fill window
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * Create particle system
     */
    createParticles() {
        this.particles = [];
        
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 3 + 1,
                color: this.colors[Math.floor(Math.random() * this.colors.length)]
            });
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createParticles();
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    /**
     * Update particle positions
     */
    updateParticles() {
        for (let particle of this.particles) {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Bounce off edges
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx *= -1;
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy *= -1;
            }

            // Keep particles in bounds
            particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));

            // Mouse interaction
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    const force = (100 - distance) / 100;
                    particle.vx += (dx / distance) * force * 0.1;
                    particle.vy += (dy / distance) * force * 0.1;
                }
            }

            // Damping
            particle.vx *= 0.99;
            particle.vy *= 0.99;
        }
    }

    /**
     * Draw particles
     */
    drawParticles() {
        for (let particle of this.particles) {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = particle.color;
            this.ctx.fill();

            // Glow effect - convert hex to rgba for opacity
            const opacity40 = this.hexToRgba(particle.color, 0.25);
            const opacity0 = this.hexToRgba(particle.color, 0);
            
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.radius * 3
            );
            gradient.addColorStop(0, opacity40);
            gradient.addColorStop(1, opacity0);
            
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        }
    }

    /**
     * Convert hex color to rgba with opacity
     */
    hexToRgba(hex, alpha) {
        // Handle hex colors (e.g., #6366f1)
        if (hex.startsWith('#')) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
        // If not hex, return with default opacity
        return hex;
    }

    /**
     * Draw connections between nearby particles
     */
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.connectionDistance) {
                    const opacity = 1 - (distance / this.connectionDistance);
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.3})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }
    }

    /**
     * Draw liquid blobs
     */
    drawBlobs() {
        // Create a liquid blob effect using metaballs
        const blobCount = 5;
        const time = Date.now() * 0.001;

        for (let i = 0; i < blobCount; i++) {
            const angle = (i / blobCount) * Math.PI * 2 + time;
            const x = this.canvas.width / 2 + Math.cos(angle) * 200;
            const y = this.canvas.height / 2 + Math.sin(angle) * 150;
            const radius = 80 + Math.sin(time + i) * 30;

            const color = this.colors[i % this.colors.length];
            const colorOpacity20 = this.hexToRgba(color, 0.125);
            const colorOpacity0 = this.hexToRgba(color, 0);

            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, colorOpacity20);
            gradient.addColorStop(1, colorOpacity0);

            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        }
    }

    /**
     * Animation loop
     */
    animate() {
        // Clear canvas with slight trail effect
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw liquid blobs
        this.drawBlobs();

        // Update and draw particles
        this.updateParticles();
        this.drawConnections();
        this.drawParticles();

        requestAnimationFrame(() => this.animate());
    }
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        new LiquidAnimation('liquid-canvas');
    });
}
