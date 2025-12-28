/* =========================================
   1. Image Zoom Modal
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    // Select all zoomable images
    const zoomImages = document.querySelectorAll('.zoom-img');
    const modal = document.getElementById('imgModal');
    const modalImg = document.getElementById('modalImg');
  
    if (modal && modalImg) {
      zoomImages.forEach(img => {
        img.addEventListener('click', () => {
          modal.style.display = 'flex';
          modalImg.src = img.src;
        });
      });
  
      // Close modal on click
      modal.addEventListener('click', () => {
        modal.style.display = 'none';
        modalImg.src = '';
      });
    }
  
    /* =========================================
       2. Dynamic Year & A11y Focus
       ========================================= */
    const yearElem = document.getElementById('year');
    if (yearElem) {
      yearElem.textContent = new Date().getFullYear();
    }
  
    // Keyboard focus outline improvement for accessibility
    const body = document.body;
    function handleFirstTab(e) {
      if (e.key === 'Tab') {
        body.classList.add('user-is-tabbing');
        window.removeEventListener('keydown', handleFirstTab);
      }
    }
    window.addEventListener('keydown', handleFirstTab);
  });
  
  /* =========================================
     3. Particle System (Lightweight Canvas)
     ========================================= */
  (function () {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
  
    const ctx = canvas.getContext('2d');
    let w = canvas.width = innerWidth;
    let h = canvas.height = innerHeight;
    const DPR = window.devicePixelRatio || 1;
    canvas.width = w * DPR; 
    canvas.height = h * DPR; 
    canvas.style.width = w + 'px'; 
    canvas.style.height = h + 'px';
    ctx.scale(DPR, DPR);
  
    const config = {
      count: Math.max(50, Math.floor((w * h) / 10000)), // scale with screen
      maxRadius: 2.2,
      speed: 0.25,
      lineDist: 140,
      color: 'rgba(14,165,233,0.95)',
      dotColor: 'rgba(14,165,233,0.16)'
    };
  
    const particles = [];
  
    function rnd(min, max) { 
      return Math.random() * (max - min) + min; 
    }
  
    function create() {
      particles.length = 0;
      for (let i = 0; i < config.count; i++) {
        particles.push({
          x: rnd(0, w),
          y: rnd(0, h),
          vx: rnd(-config.speed, config.speed),
          vy: rnd(-config.speed, config.speed),
          r: rnd(0.6, config.maxRadius),
          alpha: rnd(0.25, 0.9)
        });
      }
    }
  
    function resize() {
      w = canvas.width = innerWidth;
      h = canvas.height = innerHeight;
      canvas.width = w * DPR; 
      canvas.height = h * DPR;
      canvas.style.width = w + 'px'; 
      canvas.style.height = h + 'px';
      ctx.scale(DPR, DPR);
      create();
    }
  
    function update() {
      for (let p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      }
    }
  
    function draw() {
      ctx.clearRect(0, 0, w, h);
  
      // draw connecting lines (optimized: only check neighbors by indexing)
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < config.lineDist) {
            const alpha = (1 - (dist / config.lineDist)) * 0.12;
            ctx.strokeStyle = `rgba(14,165,233,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
  
      // draw dots
      for (let p of particles) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(14,165,233,${p.alpha * 0.25})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  
    let raf;
    function loop() {
      update();
      draw();
      raf = requestAnimationFrame(loop);
    }
  
    // init
    create();
    loop();
  
    // responsive
    let resizeTimeout;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        resize();
        loop();
      }, 180);
    });
  
    // pause when tab hidden to save CPU
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) cancelAnimationFrame(raf);
      else loop();
    });
  })();