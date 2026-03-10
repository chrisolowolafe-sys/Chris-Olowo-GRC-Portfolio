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
          
          // Adjust particle count based on screen size
          const particleCount = Math.floor((width * height) / 12000);

          for (let i = 0; i < particleCount; i++) {
              particles.push(new Particle());
          }
      }

      class Particle {
          constructor() {
              this.x = Math.random() * width;
              this.y = Math.random() * height;
              // Slow, drifting movement
              this.vx = (Math.random() - 0.5) * 0.6;
              this.vy = (Math.random() - 0.5) * 0.6;
              this.radius = Math.random() * 1.5 + 0.5;
          }

          update() {
              this.x += this.vx;
              this.y += this.vy;

              // Bounce off edges
              if (this.x < 0 || this.x > width) this.vx *= -1;
              if (this.y < 0 || this.y > height) this.vy *= -1;
          }

          draw() {
              ctx.beginPath();
              ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
              ctx.fillStyle = '#38bdf8'; // Cyber blue
              ctx.fill();
          }
      }

      function animate() {
          ctx.clearRect(0, 0, width, height);
          
          for (let i = 0; i < particles.length; i++) {
              particles[i].update();
              particles[i].draw();
              
              // Draw connecting lines
              for (let j = i + 1; j < particles.length; j++) {
                  const dx = particles[i].x - particles[j].x;
                  const dy = particles[i].y - particles[j].y;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  
                  if (dist < 130) {
                      ctx.beginPath();
                      // Opacity based on distance
                      ctx.strokeStyle = `rgba(56, 189, 248, ${1 - dist/130})`;
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

      // Handle window resize
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

  const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              // Optional: Stop observing once revealed
              // observer.unobserve(entry.target);
          }
      });
  }, observerOptions);

  // Apply fade-in class to all major sections
  document.querySelectorAll('section').forEach(section => {
      section.classList.add('fade-in');
      observer.observe(section);
  });

  // ==========================================
  // 3. SMOOTH SCROLLING FOR NAV LINKS
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const targetId = this.getAttribute('href');
          if (targetId === '#') return;
          
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
              targetElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
              });
          }
      });
  });
});
