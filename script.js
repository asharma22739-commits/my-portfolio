// Wait for DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     1. Three.js Hero Scene (#bg-canvas)
     ========================================================================== */
  const canvas = document.getElementById('bg-canvas');
  if (canvas && typeof THREE !== 'undefined') {
    const heroSection = document.getElementById('home');
    const scene = new THREE.Scene();

    const getHeroSize = () => ({
      width: heroSection ? heroSection.clientWidth : window.innerWidth,
      height: heroSection ? heroSection.clientHeight : window.innerHeight
    });

    const initialSize = getHeroSize();
    const camera = new THREE.PerspectiveCamera(55, initialSize.width / initialSize.height, 0.1, 1000);
    const baseCameraZ = 6.8;
    camera.position.set(0, 0, baseCameraZ);

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(initialSize.width, initialSize.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // TorusKnot (violet wireframe)
    const knotGeo = new THREE.TorusKnotGeometry(1.9, 0.52, 120, 24);
    const knotMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.65
    });
    const knot = new THREE.Mesh(knotGeo, knotMat);
    scene.add(knot);

    // Small pulsing Icosahedron core (cyan wireframe)
    const coreGeo = new THREE.IcosahedronGeometry(0.85, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    scene.add(core);

    // 320 cyan particles
    const particleCount = 320;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 22;
      positions[i + 1] = (Math.random() - 0.5) * 22;
      positions[i + 2] = (Math.random() - 0.5) * 16;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x22d3ee,
      size: 0.05,
      transparent: true,
      opacity: 0.75
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Camera mouse tracking & scroll-driven zoom/spin
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let scrollY = window.scrollY || 0;

    window.addEventListener('mousemove', (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener('scroll', () => {
      scrollY = window.scrollY || 0;
    }, { passive: true });

    // Handle viewport resize
    window.addEventListener('resize', () => {
      const { width, height } = getHeroSize();
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

    // Motion preference check
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionQuery.matches;
    motionQuery.addEventListener('change', (e) => {
      prefersReducedMotion = e.matches;
    });

    // Animation Loop
    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);

      if (!prefersReducedMotion) {
        const elapsed = clock.getElapsedTime();

        // Mouse follower easing
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        // Camera position: mouse parallax + scroll zoom out
        camera.position.x = mouseX * 1.3;
        camera.position.y = -mouseY * 1.3;
        camera.position.z = baseCameraZ + scrollY * 0.005;
        camera.lookAt(0, 0, 0);

        // Knot spin: faster on scroll
        const knotSpeed = 0.006 + scrollY * 0.00018;
        knot.rotation.x += knotSpeed;
        knot.rotation.y += knotSpeed * 1.25;

        // Core pulse and counter-rotation
        const pulse = 1 + Math.sin(elapsed * 2.8) * 0.16;
        core.scale.set(pulse, pulse, pulse);
        core.rotation.x -= 0.008;
        core.rotation.y += 0.012;

        // Particle subtle drift
        particles.rotation.y += 0.0005;
        particles.rotation.x += 0.0002;
      }

      renderer.render(scene, camera);
    }
    animate();
  }

  /* ==========================================================================
     2. Typing Effect (#typed)
     ========================================================================== */
  const typedEl = document.getElementById('typed');
  if (typedEl) {
    const phrases = [
      'Python programs.',
      'web experiences.',
      'AI-powered projects.',
      'things that work.'
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeLoop() {
      const current = phrases[phraseIndex];
      typedEl.textContent = isDeleting ? current.substring(0, charIndex--) : current.substring(0, charIndex++);

      let delay = isDeleting ? 45 : 90;

      if (!isDeleting && charIndex > current.length) {
        delay = 1800; // Pause at end of phrase
        isDeleting = true;
      } else if (isDeleting && charIndex < 0) {
        isDeleting = false;
        charIndex = 0;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        delay = 400; // Pause before typing next phrase
      }

      setTimeout(typeLoop, delay);
    }
    typeLoop();
  }

  /* ==========================================================================
     3. Pointer Glow, Scroll Progress & Marquee Skills Track
     ========================================================================== */
  // Glow follows pointer
  const glow = document.getElementById('glow');
  if (glow) {
    window.addEventListener('pointermove', (e) => {
      glow.style.left = `${e.clientX}px`;
      glow.style.top = `${e.clientY}px`;
    });
  }

  // Scroll Progress Bar
  const progress = document.getElementById('progress');
  function updateProgress() {
    if (!progress) return;
    const scroll = window.scrollY || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const percent = height > 0 ? (scroll / height) * 100 : 0;
    progress.style.width = `${Math.min(100, Math.max(0, percent))}%`;
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // Populate Marquee Track with Skills (repeated 4 times)
  const track = document.getElementById('track');
  const skillItems = document.querySelectorAll('#skills li');
  if (track && skillItems.length > 0) {
    track.innerHTML = '';
    const skills = Array.from(skillItems).map(li => li.textContent.trim());
    for (let i = 0; i < 4; i++) {
      skills.forEach(skill => {
        const span = document.createElement('span');
        span.textContent = skill;
        track.appendChild(span);
      });
    }
  }

  /* ==========================================================================
     4. IntersectionObserver for Reveal Sections
     ========================================================================== */
  const revealSections = document.querySelectorAll('section:not(#home)');
  revealSections.forEach(sec => sec.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('section:not(#home).reveal').forEach(sec => {
    revealObserver.observe(sec);
  });

  /* ==========================================================================
     5. Projects Array & 3D Tilt Cards
     ========================================================================== */
  const projects = [
    {
      title: 'Python Programs Collection',
      description: 'Factorial, Fibonacci, Structure-to-Dictionary',
      tech: ['Python'],
      github: 'https://github.com/asharma22739-commits/python-programs',
      live: ''
    },
    {
      title: 'Messy Python Code Improvement',
      description: 'messy script refactored with AI',
      tech: ['Python', 'AI'],
      github: 'https://github.com/asharma22739-commits/messy-code-improvement',
      live: ''
    },
    {
      title: 'Bug Fixing Using Cursor AI',
      description: 'buggy program fixed with Cursor',
      tech: ['Python', 'Cursor AI'],
      github: 'https://github.com/asharma22739-commits/bug-fixing-cursor',
      live: ''
    },
    {
      title: 'Interactive Quiz Application',
      description: 'quiz with scoring',
      tech: ['HTML', 'CSS', 'JavaScript'],
      github: 'https://github.com/asharma22739-commits/quiz-app',
      live: 'https://quiz-app-phi-three-56.vercel.app/'
    },
    {
      title: 'Book Reading List Application',
      description: 'add and manage books',
      tech: ['HTML', 'CSS', 'JavaScript'],
      github: 'https://github.com/asharma22739-commits/Reading_list',
      live: 'https://reading-list-app-ten.vercel.app/'
    }
  ];

  const projectList = document.getElementById('project-list');

  function createProjectCard(proj, index) {
    const card = document.createElement('article');
    card.className = 'card';
    card.style.animationDelay = `${index * 110}ms`;

    const content = document.createElement('div');

    const title = document.createElement('h3');
    title.textContent = proj.title;
    content.appendChild(title);

    const desc = document.createElement('p');
    desc.textContent = proj.description;
    content.appendChild(desc);

    const tags = document.createElement('div');
    tags.className = 'tags';
    proj.tech.forEach(t => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = t;
      tags.appendChild(tag);
    });
    content.appendChild(tags);
    card.appendChild(content);

    const links = document.createElement('div');
    links.className = 'card-links';

    const ghLink = document.createElement('a');
    ghLink.href = proj.github;
    ghLink.className = 'btn-code';
    ghLink.target = '_blank';
    ghLink.rel = 'noopener noreferrer';
    ghLink.textContent = 'GitHub';
    links.appendChild(ghLink);

    // Live button only if live is non-empty
    if (proj.live && proj.live.trim() !== '') {
      const liveLink = document.createElement('a');
      liveLink.href = proj.live;
      liveLink.className = 'btn-live';
      liveLink.target = '_blank';
      liveLink.rel = 'noopener noreferrer';
      liveLink.textContent = 'Live Demo';
      links.appendChild(liveLink);
    }

    card.appendChild(links);

    // 3D tilt on mousemove & spotlight coordinates
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty('--mx', `${x}px`);
      card.style.setProperty('--my', `${y}px`);

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = -((y - centerY) / centerY) * 10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    // Reset on leave
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.removeProperty('--mx');
      card.style.removeProperty('--my');
    });

    return card;
  }

  /* ==========================================================================
     6. Live Search (#search)
     ========================================================================== */
  function renderProjects(query = '') {
    if (!projectList) return;
    projectList.innerHTML = '';

    const q = query.trim().toLowerCase();
    const filtered = projects.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tech.some(t => t.toLowerCase().includes(q))
    );

    if (filtered.length === 0) {
      const noResults = document.createElement('p');
      noResults.textContent = 'No projects found.';
      noResults.style.cssText = 'grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 2.5rem 1rem; font-size: 1.05rem;';
      projectList.appendChild(noResults);
      return;
    }

    filtered.forEach((proj, idx) => {
      projectList.appendChild(createProjectCard(proj, idx));
    });
  }

  renderProjects();

  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      renderProjects(e.target.value);
    });
  }

  /* ==========================================================================
     7. Theme Toggle, Hamburger Menu & Footer Year
     ========================================================================== */
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('portfolio-theme');

  // Initialize theme from localStorage
  if (savedTheme === 'light') {
    document.body.classList.add('light');
    if (themeToggle) themeToggle.textContent = 'Dark';
  } else {
    document.body.classList.remove('light');
    if (themeToggle) themeToggle.textContent = 'Light';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light');
      localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');
      themeToggle.textContent = isLight ? 'Dark' : 'Light';
    });
  }

  // Hamburger toggles #nav-links.open
  const menuBtn = document.getElementById('menu-btn');
  const navLinks = document.getElementById('nav-links');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
      });
    });
  }

  // #year = current year
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ==========================================================================
     8. AI Assistant Chatbot (Groq Powered)
     ========================================================================== */
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');
  const chatClear = document.getElementById('chat-clear');
  const chips = document.querySelectorAll('.chip');

  const initialGreeting = "Hi! I'm Ayush's AI assistant. Ask me anything about his projects, skills, education, or background!";
  let conversationHistory = [];
  let isProcessing = false;

  function appendMessage(text, sender) {
    if (!chatMessages) return null;
    const msg = document.createElement('div');
    msg.className = `msg ${sender}`;
    msg.textContent = text;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msg;
  }

  function createTypingIndicator() {
    if (!chatMessages) return null;
    const bubble = document.createElement('div');
    bubble.className = 'msg bot typing';
    bubble.setAttribute('aria-label', 'AI assistant is typing');
    bubble.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return bubble;
  }

  function clearChat() {
    if (isProcessing) return;
    conversationHistory = [];
    if (chatMessages) {
      chatMessages.innerHTML = '';
      appendMessage(initialGreeting, 'bot');
    }
    if (chatInput) {
      chatInput.value = '';
      chatInput.style.height = 'auto';
      chatInput.focus();
    }
  }

  // Initial bot greeting
  appendMessage(initialGreeting, 'bot');

  async function handleChat(messageText) {
    const text = (messageText || '').trim();
    if (!text || isProcessing) return;

    isProcessing = true;

    // Disable controls to prevent duplicate submissions
    if (chatSend) chatSend.disabled = true;
    if (chatInput) chatInput.disabled = true;
    if (chatClear) chatClear.disabled = true;
    chips.forEach(chip => { chip.disabled = true; });

    // Render user message & reset input
    appendMessage(text, 'user');
    if (chatInput) {
      chatInput.value = '';
      chatInput.style.height = 'auto';
    }

    // Record turn in session conversation history
    conversationHistory.push({ role: 'user', content: text });

    function getChatEndpoint() {
      // If frontend is opened via VS Code Live Server (typically port 5500, 5501, etc.)
      // or file:// protocol, route to the local development server at http://localhost:3000/api/chat
      const isStaticServer = (
        window.location.protocol === 'file:' ||
        (window.location.hostname === '127.0.0.1' && window.location.port !== '3000') ||
        (window.location.hostname === 'localhost' && window.location.port !== '3000' && window.location.port !== '')
      );
      if (isStaticServer) {
        return 'http://localhost:3000/api/chat';
      }
      // Same-origin for Vercel production and local dev server (port 3000)
      return '/api/chat';
    }

    // Show pulsing typing indicator
    const typingBubble = createTypingIndicator();
    const endpoint = getChatEndpoint();

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          messages: conversationHistory
        })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const errorDetail = data?.error || data?.reply || `HTTP ${res.status}`;
        console.error(`[AI Chatbot Error] ${endpoint} responded with status ${res.status}:`, errorDetail);

        let userMsg = data?.reply || data?.error;
        if (!userMsg) {
          if (res.status === 404) {
            userMsg = 'AI service endpoint not found (404). Please ensure the backend function is deployed.';
          } else {
            userMsg = 'Unable to connect to the AI assistant right now. Please try again.';
          }
        }

        if (typingBubble) {
          typingBubble.className = 'msg bot msg-error';
          typingBubble.textContent = userMsg;
        }
        // Roll back the last user message from history on error
        conversationHistory.pop();
      } else {
        const reply = data?.reply || "I didn't receive a response. Please try asking again.";
        if (typingBubble) {
          typingBubble.className = 'msg bot';
          typingBubble.textContent = reply;
        }
        conversationHistory.push({ role: 'assistant', content: reply });
      }
    } catch (err) {
      console.error(`[AI Chatbot Network Error] Failed to fetch ${endpoint}:`, err?.message || err);
      let networkMsg = 'Network error: Please check your connection and try again.';
      if (endpoint.startsWith('http://localhost:3000')) {
        networkMsg = 'Cannot connect to local backend (http://localhost:3000). When using Live Server, start the dev server with: npm run dev';
      }
      if (typingBubble) {
        typingBubble.className = 'msg bot msg-error';
        typingBubble.textContent = networkMsg;
      }
      conversationHistory.pop();
    } finally {
      isProcessing = false;
      if (chatSend) chatSend.disabled = false;
      if (chatClear) chatClear.disabled = false;
      if (chatInput) {
        chatInput.disabled = false;
        chatInput.focus();
      }
      chips.forEach(chip => { chip.disabled = false; });
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }
  }

  // Handle Send button click
  if (chatSend && chatInput) {
    chatSend.addEventListener('click', () => {
      handleChat(chatInput.value);
    });
  }

  // Handle textarea keyboard events: Enter to send, Shift+Enter for newline
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (!e.shiftKey) {
          e.preventDefault();
          handleChat(chatInput.value);
        }
      }
    });

    // Auto-expand textarea on typing up to max-height
    chatInput.addEventListener('input', () => {
      chatInput.style.height = 'auto';
      chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    });
  }

  // Handle Clear Chat button
  if (chatClear) {
    chatClear.addEventListener('click', clearChat);
  }

  // Chips trigger question
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      if (!isProcessing) {
        handleChat(chip.textContent);
      }
    });
  });
});
