/* =========================================
   1. HELPER FUNCTIONS
   ========================================= */
function getCurrentSection() {
  const sections = document.querySelectorAll("section[id]");
  let current = sections[0];

  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.3) {
      current = section;
    }
  });

  return current?.id || null;
}

// Smooth scroll helper
function smoothScrollTo(target, duration = 800) {
  const element = document.querySelector(target);
  if (!element) return;

  const start = window.scrollY;
  const end = element.getBoundingClientRect().top + start;
  const distance = end - start;
  let startTime = null;

  function animation(currentTime) {
    if (!startTime) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);

    // Ease-in-out function
    const ease = progress < 0.5
      ? 2 * progress * progress
      : -1 + (4 - 2 * progress) * progress;

    window.scrollTo(0, start + distance * ease);

    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  requestAnimationFrame(animation);
}

/* =========================================
   2. DOM ELEMENTS & UI LOGIC
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {

  // --- A. Image Zoom Modal ---
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

    modal.addEventListener('click', () => {
      modal.style.display = 'none';
      modalImg.src = '';
    });
  }

  // --- B. Dynamic Year ---
  const yearElem = document.getElementById('year');
  if (yearElem) {
    yearElem.textContent = new Date().getFullYear();
  }

  // --- C. Accessibility Tab Focus ---
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
   3. PARTICLE SYSTEM (Lightweight Canvas)
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

    // Draw lines
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

    // Draw dots
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

  // Init
  create();
  loop();

  // Resize handling
  let resizeTimeout;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resize();
      loop();
    }, 180);
  });

  // Visibility handling
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) cancelAnimationFrame(raf);
    else loop();
  });
})();

/* =========================================
   4. TERMINAL MODE SWITCHER (Logic Only)
   ========================================= */
document.addEventListener("DOMContentLoaded", () => {
  // 1. Select Elements
  const toggleBtn = document.getElementById("mode-toggle");
  const modeText = document.getElementById("mode-text");
  const styleLink = document.getElementById("main-style");
  const particles = document.getElementById("particles");

  // CRITICAL FIX: Only stop if the CSS link is missing. 
  // We DO NOT stop if the button is missing.
  if (!styleLink) return;

  // --- FUNCTIONS ---
  function enableTerminal() {
    // Point to your terminal CSS file
    styleLink.href = "./styles/style-terminal.css"; 
    document.body.classList.add("terminal-mode");
    
    // Force Black Background
    document.body.style.backgroundColor = "#000";
    document.body.style.backgroundImage = "none";
    
    // Update Button Text (Only if button exists on this page)
    if (modeText) modeText.textContent = "Normal Mode";
    
    // Hide particles (Only if particles exist)
    if (particles) particles.style.display = "none";
    
    // Save to Memory
    localStorage.setItem("theme", "terminal");
  }

  function disableTerminal() {
    styleLink.href = "./styles/style.css"; 
    document.body.classList.remove("terminal-mode");
    
    document.body.style.backgroundColor = "";
    document.body.style.backgroundImage = "";
    
    if (modeText) modeText.textContent = "Terminal Mode";
    if (particles) particles.style.display = "block";
    
    localStorage.setItem("theme", "cyber");
  }

  // --- 2. APPLY THEME ON LOAD ---
  // This runs automatically on project.html even without a button!
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "terminal") {
    enableTerminal();
  } else {
    disableTerminal();
  }

  // --- 3. BUTTON CLICK LISTENER ---
  // This only runs on index.html where the button actually exists
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      // Prevent page jump during CSS swap
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      document.body.style.minHeight = document.body.scrollHeight + 'px';

      styleLink.onload = () => {
        window.scrollTo(0, scrollY);
        document.body.style.minHeight = '';
        styleLink.onload = null;
      };

      if (document.body.classList.contains("terminal-mode")) {
        disableTerminal();
      } else {
        enableTerminal();
      }
    });
  }
});
window.addEventListener('scroll', function() {
  const nav = document.querySelector('.floating-nav');
  if (window.scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
});

/* =========================================
   AUTO-CLOSE MENU ON LINK CLICK
   ========================================= */
document.querySelectorAll('.nav-item').forEach(link => {
  link.addEventListener('click', () => {
    const navLinks = document.getElementById('terminalNav');
    const btn = document.querySelector('.hamburger-btn');

    // Remove the open class to hide the menu
    if (navLinks) {
      navLinks.classList.remove('mobile-open');
    }

    // Reset the button state
    if (btn) {
      btn.classList.remove('active');
    }
  });
});

/* =========================================
   MOBILE MENU TOGGLE
   ========================================= */
function toggleMobileMenu() {
  const navLinks = document.getElementById('terminalNav');
  const btn = document.querySelector('.hamburger-btn');
  
  if (navLinks) {
    navLinks.classList.toggle('mobile-open');
  }
  
  // Optional: Visual feedback on the button
  if (btn) {
    btn.classList.toggle('active');
  }
}