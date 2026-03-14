/**
 * script.js — SECURE VERSION
 *
 * Security hardening applied:
 * - Smooth scroll href validated against strict allowlist regex
 *   before being passed to document.querySelector()
 * - Canvas and resize handler unchanged (no user data involved)
 */

document.addEventListener("DOMContentLoaded", () => {

  // ==========================================
  // 1. NETWORK NODES ANIMATION (HERO BACKGROUND)
  // ==========================================
  const canvas = document.getElementById('network-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height, particles;

    function init() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      particles = [];

      const particleCount = Math.floor((width * height) / 12000);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;
        this.radius = Math.random() * 1.5 + 0.5;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fill();
      }
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(56, 189, 248, ${1 - dist / 130})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    }

    init();
    animate();

    window.addEventListener('resize', () => {
      init();
    });
  }


  // ==========================================
  // 2. SCROLL REVEAL ANIMATION
  // ==========================================
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  document.querySelectorAll('section').forEach(section => {
    section.classList.add('fade-in');
    observer.observe(section);
  });


  // ==========================================
  // 3. SMOOTH SCROLLING — SECURE VERSION
  //
  // Vulnerability fixed: previously, user-controlled href values were
  // passed directly to document.querySelector() without validation.
  // A crafted href could throw exceptions or be abused as a CSS selector.
  //
  // Fix: strict regex allowlist — only simple #id-style anchors are
  // accepted. Anything else is silently ignored.
  //
  // Valid:   #about, #contact-section, #grc-lab_2
  // Blocked: #../../etc, #<img>, javascript:, data:, or any other value
  // ==========================================

  // Only allow #id selectors: must start with #, followed by a letter,
  // then optionally letters, digits, hyphens, or underscores.
  const SAFE_ANCHOR_RE = /^#[a-zA-Z][a-zA-Z0-9\-_]*$/;

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      const rawHref = this.getAttribute('href');

      // Reject anything that doesn't match the strict allowlist pattern
      if (!rawHref || !SAFE_ANCHOR_RE.test(rawHref)) return;

      // Safe to pass to querySelector — only a validated simple ID selector
      const targetElement = document.querySelector(rawHref);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

});
