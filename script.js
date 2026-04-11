/* ═══════════════════════════════════════════════════════════
   WUNA AKHILESH PORTFOLIO — script.js
   Premium 3D Hero Engine + All Original Functionality
═══════════════════════════════════════════════════════════ */

/* ===========================
   PERFORMANCE GUARD
   Disable heavy animations on low-end devices
=========================== */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = window.matchMedia('(max-width: 768px)').matches;
const isTouchDevice = () => window.matchMedia('(pointer: coarse)').matches;
const isLowPower = navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 2;
const skipHeavy3D = prefersReducedMotion || (isMobile && isLowPower);

/* ═══════════════════════════════════════════════════════════
   THREE.JS HERO ENGINE
═══════════════════════════════════════════════════════════ */
(function initHero3D() {
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  /* --- Renderer --- */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  /* --- Scene & Camera --- */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 12);

  /* --- Colors (matching CSS --accent: #63b3ed) --- */
  const C_BLUE     = new THREE.Color(0x63b3ed);
  const C_BLUE_DIM = new THREE.Color(0x1a4a7a);
  const C_WHITE    = new THREE.Color(0xffffff);
  const C_PURPLE   = new THREE.Color(0x8b5cf6);

  /* ─── 1. TORUS KNOT — centerpiece (right side) ─── */
  const knotGeo  = new THREE.TorusKnotGeometry(2.2, 0.45, 200, 32, 2, 3);
  const knotMat  = new THREE.MeshPhongMaterial({
    color: 0x0a1628,
    emissive: 0x0d2444,
    specular: C_BLUE,
    shininess: 90,
    wireframe: false,
    transparent: true,
    opacity: 0.92,
  });
  const knotMesh = new THREE.Mesh(knotGeo, knotMat);
  knotMesh.position.set(5.5, 0.5, 0);
  scene.add(knotMesh);

  /* Wireframe overlay on knot */
  const knotWireMat = new THREE.MeshBasicMaterial({
    color: C_BLUE,
    wireframe: true,
    transparent: true,
    opacity: 0.08,
  });
  const knotWire = new THREE.Mesh(knotGeo, knotWireMat);
  knotWire.position.copy(knotMesh.position);
  scene.add(knotWire);

  /* ─── 2. OUTER RING (glowing torus) ─── */
  const ringGeo = new THREE.TorusGeometry(4, 0.02, 16, 200);
  const ringMat = new THREE.MeshBasicMaterial({ color: C_BLUE, transparent: true, opacity: 0.25 });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.position.copy(knotMesh.position);
  ringMesh.rotation.x = Math.PI / 4;
  scene.add(ringMesh);

  const ring2Geo = new THREE.TorusGeometry(5.4, 0.012, 16, 200);
  const ring2Mat = new THREE.MeshBasicMaterial({ color: C_BLUE, transparent: true, opacity: 0.1 });
  const ring2Mesh = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2Mesh.position.copy(knotMesh.position);
  ring2Mesh.rotation.x = Math.PI / 3;
  ring2Mesh.rotation.y = Math.PI / 6;
  scene.add(ring2Mesh);

  /* ─── 3. PARTICLE FIELD ─── */
  const PARTICLE_COUNT = isMobile ? 600 : 1400;
  const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
  const particleSizes     = new Float32Array(PARTICLE_COUNT);
  const particleColors    = new Float32Array(PARTICLE_COUNT * 3);

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const r = 6 + Math.random() * 12;
    const theta = Math.random() * Math.PI * 2;
    const phi = (Math.random() - 0.5) * Math.PI;

    particlePositions[i * 3]     = knotMesh.position.x + r * Math.cos(theta) * Math.cos(phi);
    particlePositions[i * 3 + 1] = r * Math.sin(phi);
    particlePositions[i * 3 + 2] = r * Math.sin(theta) * Math.cos(phi);

    particleSizes[i] = Math.random() > 0.85 ? 2.5 : 1.0;

    // Blue-ish to white spectrum
    const mix = Math.random();
    particleColors[i * 3]     = 0.38 + mix * 0.62;
    particleColors[i * 3 + 1] = 0.70 + mix * 0.30;
    particleColors[i * 3 + 2] = 0.93;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeo.setAttribute('color',    new THREE.BufferAttribute(particleColors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.06,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  /* ─── 4. FLOATING ICOSAHEDRA (depth objects) ─── */
  const floatingObjects = [];
  const icoGeo = new THREE.IcosahedronGeometry(0.18, 0);

  for (let i = 0; i < (isMobile ? 8 : 18); i++) {
    const mat = new THREE.MeshPhongMaterial({
      color: Math.random() > 0.5 ? 0x63b3ed : 0x8b5cf6,
      emissive: Math.random() > 0.5 ? 0x1a3a5c : 0x2d1b69,
      specular: 0xffffff,
      shininess: 80,
      transparent: true,
      opacity: 0.4 + Math.random() * 0.4,
    });

    const mesh = new THREE.Mesh(icoGeo, mat);

    const angle = (i / 18) * Math.PI * 2;
    const radius = 4 + Math.random() * 6;
    mesh.position.set(
      knotMesh.position.x + Math.cos(angle) * radius * 0.7,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 6
    );
    mesh.scale.setScalar(0.5 + Math.random() * 1.2);

    floatingObjects.push({
      mesh,
      speed: 0.3 + Math.random() * 0.7,
      rotAxis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
      floatOffset: Math.random() * Math.PI * 2,
      floatSpeed: 0.4 + Math.random() * 0.6,
      floatAmp: 0.3 + Math.random() * 0.5,
      originalY: mesh.position.y,
    });

    scene.add(mesh);
  }

  /* ─── 5. LIGHTS ─── */
  scene.add(new THREE.AmbientLight(0x0a0e1a, 4));

  const pointBlue = new THREE.PointLight(0x63b3ed, 8, 30);
  pointBlue.position.set(knotMesh.position.x - 3, 3, 5);
  scene.add(pointBlue);

  const pointPurple = new THREE.PointLight(0x8b5cf6, 5, 25);
  pointPurple.position.set(knotMesh.position.x + 4, -3, 3);
  scene.add(pointPurple);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  /* ─── 6. MOUSE TRACKING (parallax) ─── */
  let mouse = { x: 0, y: 0 };
  let targetRot = { x: 0, y: 0 };

  document.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth)  - 0.5;
    mouse.y = (e.clientY / window.innerHeight) - 0.5;
  }, { passive: true });

  /* ─── 7. SCROLL REVEAL — fade/zoom canvas on scroll ─── */
  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  }, { passive: true });

  /* ─── 8. RESIZE ─── */
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ─── 9. ANIMATION LOOP ─── */
  let t = 0;
  let rafId;

  function animate() {
    rafId = requestAnimationFrame(animate);
    t += 0.008;

    /* Scroll-based opacity — fade out as user scrolls */
    const heroH = window.innerHeight;
    const scrollFade = Math.max(0, 1 - (scrollY / heroH) * 1.6);
    canvas.style.opacity = scrollFade;
    if (scrollFade <= 0.01) return; // skip render when invisible

    /* Camera gentle mouse-track */
    targetRot.x += (mouse.y * 0.3 - targetRot.x) * 0.04;
    targetRot.y += (mouse.x * 0.5 - targetRot.y) * 0.04;
    camera.rotation.x = targetRot.x;
    camera.rotation.y = targetRot.y;

    /* Knot rotation */
    knotMesh.rotation.x = t * 0.18;
    knotMesh.rotation.y = t * 0.24;
    knotMesh.rotation.z = t * 0.06;
    knotWire.rotation.copy(knotMesh.rotation);

    /* Ring rotation */
    ringMesh.rotation.z = t * 0.12;
    ring2Mesh.rotation.y = t * 0.08;
    ring2Mesh.rotation.z = -t * 0.05;

    /* Particle slow drift */
    particles.rotation.y = t * 0.025;
    particles.rotation.x = t * 0.01;

    /* Floating icosahedra */
    floatingObjects.forEach((obj) => {
      obj.mesh.rotateOnAxis(obj.rotAxis, 0.006 * obj.speed);
      obj.mesh.position.y = obj.originalY + Math.sin(t * obj.floatSpeed + obj.floatOffset) * obj.floatAmp;
    });

    /* Point light pulse (heartbeat glow) */
    const glowPulse = 0.7 + 0.3 * Math.sin(t * 1.8);
    pointBlue.intensity = 8 * glowPulse;
    pointPurple.intensity = 5 * (1 - glowPulse * 0.4);

    renderer.render(scene, camera);
  }

  /* Start after a tiny delay so page content shows first */
  setTimeout(() => {
    animate();
  }, 200);

  /* Pause when tab hidden */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      animate();
    }
  });

  /* Low-power mode fallback — reduce particles */
  if (skipHeavy3D) {
    particleMat.opacity = 0.3;
    floatingObjects.forEach(o => scene.remove(o.mesh));
  }

})(); // end initHero3D

/* ═══════════════════════════════════════════════════════════
   PARALLAX — hero content on mouse move
═══════════════════════════════════════════════════════════ */
(function initParallax() {
  if (prefersReducedMotion || isMobile) return;

  const heroContent = document.getElementById('heroContent');
  if (!heroContent) return;

  const parallaxEls = heroContent.querySelectorAll('[data-parallax]');

  let mx = 0, my = 0;
  document.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth  - 0.5);
    my = (e.clientY / window.innerHeight - 0.5);
  }, { passive: true });

  let lastFrame;
  function tickParallax() {
    parallaxEls.forEach((el) => {
      const depth = parseFloat(el.getAttribute('data-parallax')) || 0.02;
      const dx = mx * depth * 40;
      const dy = my * depth * 40;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    lastFrame = requestAnimationFrame(tickParallax);
  }

  /* Only run parallax while hero is visible */
  const heroEl = document.getElementById('hero');
  const heroObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      tickParallax();
    } else {
      cancelAnimationFrame(lastFrame);
    }
  }, { threshold: 0.1 });
  if (heroEl) heroObs.observe(heroEl);

})(); // end initParallax

/* ═══════════════════════════════════════════════════════════
   FLOATING TAGS — CSS 3D parallax on mouse
═══════════════════════════════════════════════════════════ */
(function initFloatingTags() {
  if (isMobile || prefersReducedMotion) return;

  const floaters = document.querySelectorAll('.floater');
  if (!floaters.length) return;

  let mx = 0, my = 0;
  document.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth  - 0.5);
    my = (e.clientY / window.innerHeight - 0.5);
  }, { passive: true });

  function tickTags() {
    floaters.forEach((el) => {
      const depth = parseFloat(el.getAttribute('data-depth')) || 0.5;
      const dx = mx * depth * 30;
      const dy = my * depth * 20;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    requestAnimationFrame(tickTags);
  }

  tickTags();

})(); // end initFloatingTags

/* ═══════════════════════════════════════════════════════════
   CUSTOM CURSOR — DESKTOP ONLY (original logic preserved)
═══════════════════════════════════════════════════════════ */
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
const cursorToggle = document.getElementById('cursorToggle');
let mouseX = 0, mouseY = 0, curX = 0, curY = 0;
let cursorEnabled = false;

function enableCursor() {
  document.body.classList.add('cursor-active');
  cursorToggle.classList.add('active');
  cursorEnabled = true;
  document.addEventListener('mousemove', trackMouse);
  if (!animationStarted) {
    animationStarted = true;
    animateCursor();
  }
  attachHoverListeners();
}

function disableCursor() {
  document.body.classList.remove('cursor-active');
  cursorToggle.classList.remove('active');
  cursorEnabled = false;
  document.removeEventListener('mousemove', trackMouse);
}

function trackMouse(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';
}

let animationStarted = false;

function animateCursor() {
  curX += (mouseX - curX) * 0.12;
  curY += (mouseY - curY) * 0.12;
  cursor.style.left = curX + 'px';
  cursor.style.top  = curY + 'px';
  requestAnimationFrame(animateCursor);
}

function attachHoverListeners() {
  document.querySelectorAll('a, button, .pill, .project-item, .contact-card, .edu-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (!cursorEnabled) return;
      cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
      cursor.style.borderColor = 'rgba(99,179,237,0.4)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      cursor.style.borderColor = 'rgba(99,179,237,0.6)';
    });
  });
}

if (!isTouchDevice() && cursorToggle) {
  cursorToggle.addEventListener('click', () => {
    if (cursorEnabled) disableCursor();
    else enableCursor();
  });
}

/* ═══════════════════════════════════════════════════════════
   STICKY HEADER (original logic)
═══════════════════════════════════════════════════════════ */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ═══════════════════════════════════════════════════════════
   SMOOTH ANCHOR SCROLL (original logic)
═══════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ═══════════════════════════════════════════════════════════
   SCROLL REVEAL (original logic)
═══════════════════════════════════════════════════════════ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ═══════════════════════════════════════════════════════════
   COUNT-UP ANIMATION (original logic)
═══════════════════════════════════════════════════════════ */
function countUp(el) {
  const target   = parseInt(el.getAttribute('data-count'));
  const duration = 1600;
  const start    = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target;
  }
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      countUp(entry.target);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num').forEach(el => statsObserver.observe(el));

/* ═══════════════════════════════════════════════════════════
   ACTIVE NAV HIGHLIGHTING (original logic)
═══════════════════════════════════════════════════════════ */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 110) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
}, { passive: true });

/* ═══════════════════════════════════════════════════════════
   PROJECT ROW CLICK → GITHUB (original logic)
═══════════════════════════════════════════════════════════ */
document.querySelectorAll('.project-item[data-href]').forEach(item => {
  item.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' || e.target.closest('a')) return;
    window.open(item.getAttribute('data-href'), '_blank');
  });
});