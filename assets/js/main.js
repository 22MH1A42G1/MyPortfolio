(() => {
  'use strict';

  const docEl = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const menuToggle = document.getElementById('menu-toggle');
  const navLinksWrap = document.getElementById('site-nav');
  const navLinks = Array.from(document.querySelectorAll('.nav-links a'));
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const revealTargets = document.querySelectorAll('.reveal');
  const typedText = document.getElementById('typed-text');
  const parallaxEl = document.querySelector('.parallax');
  const journeySection = document.getElementById('journey');
  const highwayTrack = document.querySelector('.highway-track');
  const highwayCar = document.getElementById('highway-car');
  const journeyStops = Array.from(document.querySelectorAll('.journey-milestone'));
  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const projectCards = Array.from(document.querySelectorAll('.project-card[data-project-title]'));
  const projectModal = document.getElementById('project-modal');
  const projectModalImage = document.getElementById('project-modal-image');
  const projectModalYear = document.getElementById('project-modal-year');
  const projectModalTitle = document.getElementById('project-modal-title');
  const projectModalDescription = document.getElementById('project-modal-description');
  const projectModalTechList = document.getElementById('project-modal-tech-list');
  const projectModalRepo = document.getElementById('project-modal-repo');
  const projectModalDemo = document.getElementById('project-modal-demo');
  const projectModalCloseButtons = Array.from(document.querySelectorAll('[data-project-modal-close]'));
  const parallaxLayers = Array.from(document.querySelectorAll('.hero-content, .section > .container, .split, .skills-grid, .quick-stats'));

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const themeKey = 'portfolio-theme';
  const osPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const initialTheme = localStorage.getItem(themeKey) || (osPrefersLight ? 'light' : 'dark');

  function setTheme(theme) {
    docEl.setAttribute('data-theme', theme);
    if (themeToggle) {
      themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
    }
  }

  setTheme(initialTheme);

  themeToggle?.addEventListener('click', () => {
    const nextTheme = docEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem(themeKey, nextTheme);
  });

  menuToggle?.addEventListener('click', () => {
    const isOpen = navLinksWrap.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (navLinksWrap.classList.contains('open')) {
        navLinksWrap.classList.remove('open');
        menuToggle?.setAttribute('aria-expanded', 'false');
      }
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14 }
  );

  revealTargets.forEach((el) => revealObserver.observe(el));

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const targetId = entry.target.id;
        navLinks.forEach((link) => {
          const isMatch = link.getAttribute('href') === `#${targetId}`;
          link.classList.toggle('active', isMatch);
        });
      });
    },
    { threshold: 0.45 }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  function initParticleField() {
    if (reducedMotion || !document.body) {
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.className = 'particle-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    const particles = [];
    const particleCount = Math.min(42, Math.max(26, Math.round(window.innerWidth / 32)));
    let width = 0;
    let height = 0;
    let animationFrameId = 0;

    function resizeCanvas() {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.6);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    function createParticle(index) {
      const size = 0.8 + Math.random() * 2.6;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        speedX: -0.12 + Math.random() * 0.24,
        speedY: -0.18 + Math.random() * 0.36,
        drift: 0.4 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
        hue: index % 3 === 0 ? 215 : index % 3 === 1 ? 255 : 195,
        alpha: 0.2 + Math.random() * 0.35
      };
    }

    function populateParticles() {
      particles.length = 0;
      for (let index = 0; index < particleCount; index += 1) {
        particles.push(createParticle(index));
      }
    }

    function drawParticles(timestamp) {
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = 'lighter';

      particles.forEach((particle) => {
        particle.phase += 0.012;
        particle.x += particle.speedX + Math.sin(particle.phase) * 0.07;
        particle.y += particle.speedY + Math.cos(particle.phase * 0.8) * 0.07;

        if (particle.x < -30) particle.x = width + 30;
        if (particle.x > width + 30) particle.x = -30;
        if (particle.y < -30) particle.y = height + 30;
        if (particle.y > height + 30) particle.y = -30;

        const twinkle = 0.45 + (Math.sin(timestamp * 0.001 + particle.phase) + 1) * 0.25;
        context.beginPath();
        context.fillStyle = `hsla(${particle.hue}, 100%, 72%, ${particle.alpha * twinkle})`;
        context.shadowColor = `hsla(${particle.hue}, 100%, 72%, 0.55)`;
        context.shadowBlur = 12;
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      });

      context.shadowBlur = 0;
      animationFrameId = window.requestAnimationFrame(drawParticles);
    }

    resizeCanvas();
    populateParticles();
    animationFrameId = window.requestAnimationFrame(drawParticles);

    window.addEventListener('resize', () => {
      resizeCanvas();
      populateParticles();
    }, { passive: true });
  }

  initParticleField();

  function setProjectCardRatio(card) {
    const thumb = card.querySelector('.project-thumb');
    if (!thumb) {
      return;
    }

    const applyRatio = () => {
      if (thumb.naturalWidth && thumb.naturalHeight) {
        card.style.setProperty('--project-ratio', `${thumb.naturalWidth} / ${thumb.naturalHeight}`);
      }
    };

    if (thumb.complete) {
      applyRatio();
      return;
    }

    thumb.addEventListener('load', applyRatio, { once: true });
    thumb.addEventListener('error', () => {
      card.style.removeProperty('--project-ratio');
    }, { once: true });
  }

  projectCards.forEach((card) => setProjectCardRatio(card));

  const phrases = [
    'Full Stack Developer',
    'AWS Cloud Engineer',
    'AI and ML Enthusiast',
    'Problem Solver'
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function runTypingLoop() {
    if (!typedText || reducedMotion) {
      if (typedText) {
        typedText.textContent = phrases[0];
      }
      return;
    }

    const current = phrases[phraseIndex];
    const nextLength = deleting ? charIndex - 1 : charIndex + 1;
    typedText.textContent = current.slice(0, nextLength);
    charIndex = nextLength;

    let delay = deleting ? 42 : 86;

    if (!deleting && charIndex === current.length) {
      delay = 1350;
      deleting = true;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 280;
    }

    window.setTimeout(runTypingLoop, delay);
  }

  runTypingLoop();

  if (parallaxEl && !reducedMotion) {
    let parallaxFrameId = 0;

    const updateParallax = () => {
      const y = Math.min(window.scrollY * 0.18, 90);
      parallaxEl.style.transform = `translate3d(0, ${y}px, 0)`;

      parallaxLayers.forEach((layer, index) => {
        const rect = layer.getBoundingClientRect();
        const viewportCenter = window.innerHeight * 0.5;
        const layerCenter = rect.top + rect.height * 0.5;
        const distance = layerCenter - viewportCenter;
        const speed = 0.04 + index * 0.012;
        const offset = Math.max(Math.min(-distance * speed * 0.06, 20), -20);
        layer.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
    };

    const scheduleParallax = () => {
      if (parallaxFrameId) {
        return;
      }
      parallaxFrameId = window.requestAnimationFrame(() => {
        parallaxFrameId = 0;
        updateParallax();
      });
    };

    window.addEventListener('scroll', scheduleParallax, { passive: true });
    window.addEventListener('resize', scheduleParallax);
    updateParallax();
  }

  function initJourneyDrive() {
    if (!journeySection || !highwayTrack || !highwayCar) {
      return;
    }

    const milestoneWrap = journeySection.querySelector('.journey-milestones');

    journeyStops.forEach((stop, index) => {
      stop.style.transitionDelay = `${index * 90}ms`;
    });

    if (reducedMotion) {
      highwayCar.style.top = '1rem';
      return;
    }

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const updateDrive = () => {
      if (milestoneWrap) {
        const wrapHeight = Math.ceil(milestoneWrap.getBoundingClientRect().height);
        const trackMin = 460;
        highwayTrack.style.minHeight = `${Math.max(wrapHeight, trackMin)}px`;
      }

      const sectionRect = journeySection.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const start = viewportHeight * 0.85;
      const end = viewportHeight * 0.2;
      const rawProgress = (start - sectionRect.top) / (start - end + sectionRect.height);
      const progress = clamp(rawProgress, 0, 1);

      const usableTrack = Math.max(highwayTrack.clientHeight - highwayCar.offsetHeight - 32, 0);
      const y = 16 + usableTrack * progress;
      highwayCar.style.top = `${y}px`;

      journeyStops.forEach((stop) => {
        const stopValue = Number(stop.dataset.stop || 0);
        stop.classList.toggle('is-passed', progress >= stopValue);
      });
    };

    let rafId = 0;
    const scheduleUpdate = () => {
      if (rafId) {
        return;
      }
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        updateDrive();
      });
    };

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    updateDrive();
  }

  initJourneyDrive();

  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (event) => {
      if (reducedMotion) {
        return;
      }
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * 9;
      const rotateX = (0.5 - py) * 8;
      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  let activeProjectCard = null;

  function closeProjectModal() {
    if (!projectModal || projectModal.hidden) {
      return;
    }

    projectModal.hidden = true;
    document.body.style.overflow = '';

    if (activeProjectCard) {
      activeProjectCard.focus();
    }

    activeProjectCard = null;
  }

  function openProjectModal(card) {
    if (!projectModal || !projectModalImage || !projectModalYear || !projectModalTitle || !projectModalDescription || !projectModalTechList || !projectModalRepo || !projectModalDemo) {
      return;
    }

    const title = card.dataset.projectTitle || 'Project';
    const year = card.dataset.projectYear || '';
    const image = card.dataset.projectImage || '';
    const imageAlt = card.dataset.projectImageAlt || title;
    const description = card.dataset.projectDescription || '';
    const techItems = String(card.dataset.projectTech || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const repoUrl = card.dataset.projectRepo || '#';
    const demoUrl = card.dataset.projectDemo || '';

    projectModalImage.src = image;
    projectModalImage.alt = imageAlt;
    projectModalYear.textContent = year;
    projectModalTitle.textContent = title;
    projectModalDescription.textContent = description;
    projectModalRepo.href = repoUrl;

    projectModalTechList.replaceChildren(
      ...techItems.map((tech) => {
        const item = document.createElement('li');
        item.textContent = tech;
        return item;
      })
    );

    if (demoUrl) {
      projectModalDemo.href = demoUrl;
      projectModalDemo.classList.remove('is-disabled');
      projectModalDemo.removeAttribute('aria-disabled');
    } else {
      projectModalDemo.href = '#';
      projectModalDemo.classList.add('is-disabled');
      projectModalDemo.setAttribute('aria-disabled', 'true');
    }

    activeProjectCard = card;
    projectModal.hidden = false;
    document.body.style.overflow = 'hidden';
    projectModalCloseButtons[0]?.focus();
  }

  projectCards.forEach((card) => {
    card.addEventListener('click', () => openProjectModal(card));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openProjectModal(card);
      }
    });
  });

  projectModalCloseButtons.forEach((button) => {
    button.addEventListener('click', closeProjectModal);
  });

  projectModal?.addEventListener('click', (event) => {
    if (event.target.closest('[data-project-modal-close]')) {
      closeProjectModal();
    }
  });

  projectModalDemo?.addEventListener('click', (event) => {
    if (projectModalDemo.classList.contains('is-disabled')) {
      event.preventDefault();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && projectModal && !projectModal.hidden) {
      closeProjectModal();
    }
  });

  // Project search and sort functionality
  const projectSearch = document.getElementById('project-search');
  const projectSortDropdown = document.getElementById('project-sort-dropdown');
  let currentSortOrder = 'newest';
  let currentSearchQuery = '';

  function getProjectsGridContainer() {
    return document.querySelector('.projects-grid');
  }

  function applyFiltersAndSort() {
    const gridContainer = getProjectsGridContainer();
    if (!gridContainer) {
      return;
    }

    const query = currentSearchQuery.toLowerCase();
    let visibleCards = [];

    projectCards.forEach((card) => {
      const title = (card.dataset.projectTitle || '').toLowerCase();
      const description = (card.dataset.projectDescription || '').toLowerCase();
      const tech = (card.dataset.projectTech || '').toLowerCase();
      
      const matchesSearch = !query || title.includes(query) || description.includes(query) || tech.includes(query);
      
      if (matchesSearch) {
        card.classList.remove('hidden');
        visibleCards.push(card);
      } else {
        card.classList.add('hidden');
      }
    });

    // Sort visible cards
    visibleCards.sort((cardA, cardB) => {
      const titleA = (cardA.dataset.projectTitle || '').toLowerCase();
      const titleB = (cardB.dataset.projectTitle || '').toLowerCase();
      const yearA = parseInt(cardA.dataset.projectYear || '0');
      const yearB = parseInt(cardB.dataset.projectYear || '0');

      if (currentSortOrder === 'newest') {
        return yearB - yearA;
      } else if (currentSortOrder === 'oldest') {
        return yearA - yearB;
      } else if (currentSortOrder === 'a-z') {
        return titleA.localeCompare(titleB);
      } else if (currentSortOrder === 'z-a') {
        return titleB.localeCompare(titleA);
      }
      return 0;
    });

    // Re-append cards in sorted order
    visibleCards.forEach((card) => {
      gridContainer.appendChild(card);
    });
  }

  if (projectSearch) {
    projectSearch.addEventListener('input', (event) => {
      currentSearchQuery = event.target.value;
      applyFiltersAndSort();
    });
  }

  if (projectSortDropdown) {
    projectSortDropdown.addEventListener('change', (event) => {
      currentSortOrder = event.target.value;
      applyFiltersAndSort();
    });
  }

  const progressBars = document.querySelectorAll('.progress > span');
  const skillObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const bar = entry.target;
        bar.style.width = `${bar.dataset.width || 0}%`;
        observer.unobserve(bar);
      });
    },
    { threshold: 0.5 }
  );

  progressBars.forEach((bar) => skillObserver.observe(bar));

  function showFormStatus(message, isError = false) {
    if (!formStatus) {
      return;
    }
    formStatus.textContent = message;
    formStatus.style.color = isError ? '#ff6d86' : '';
  }

  form?.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      showFormStatus('Please complete all required fields with valid values.', true);
      return;
    }

    const data = new FormData(form);
    const message = String(data.get('message') || '').trim();
    if (message.length < 20) {
      showFormStatus('Message must be at least 20 characters.', true);
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton ? submitButton.textContent : '';

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending...';
    }

    const parseContactResponse = async (response) => {
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Unable to send your message right now.');
      }
      return payload;
    };

    const sendToEndpoint = (url) => {
      const formPayload = new FormData(form);
      return fetch(url, {
        method: 'POST',
        body: formPayload,
        headers: {
          Accept: 'application/json'
        }
      }).then(parseContactResponse);
    };

    sendToEndpoint(form.action)
      .catch(() => sendToEndpoint('https://formsubmit.co/ajax/adityaindana@gmail.com'))
      .then((payload) => {
        form.reset();
        showFormStatus(payload.message || 'Thanks for reaching out. Your message has been sent.');
      })
      .catch((error) => {
        showFormStatus(error.message || 'Unable to send your message right now. Please try again later.', true);
      })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      });
  });
})();