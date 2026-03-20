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
    const onParallax = () => {
      const y = Math.min(window.scrollY * 0.18, 90);
      parallaxEl.style.transform = `translate3d(0, ${y}px, 0)`;
    };
    window.addEventListener('scroll', onParallax, { passive: true });
    onParallax();
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

    const subject = encodeURIComponent(String(data.get('subject') || 'Portfolio inquiry'));
    const body = encodeURIComponent(
      `Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\nMessage:\n${message}`
    );
    window.location.href = `mailto:adityaindana@gmail.com?subject=${subject}&body=${body}`;

    form.reset();
    showFormStatus('Thanks for reaching out. Your email app should now open.');
  });
})();