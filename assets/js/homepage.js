/* Interactions for the homepage and guestbook. */
(function () {
  const root = document.documentElement;
  const navigation = document.querySelector('.site-nav');
  if (!navigation) return;
  const menu = navigation.querySelector('.site-nav__links');
  const menuButton = navigation.querySelector('.site-nav__toggle');
  const themeButton = navigation.querySelector('.site-nav__theme');
  const contact = document.querySelector('.author__urls-wrapper');
  const contactButton = contact && contact.querySelector('button');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 1024px)');
  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  let cancelScroll = null;
  let scrollQueued = false;

  function storedTheme() {
    try { return localStorage.getItem('theme'); } catch (_) { return null; }
  }

  function setTheme(dark) {
    if (dark) root.dataset.theme = 'dark';
    else root.removeAttribute('data-theme');
    themeButton.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    themeButton.setAttribute('aria-pressed', String(dark));
    document.querySelector('meta[name="theme-color"]').content = dark ? '#151b24' : '#fcfcfd';
  }

  setTheme(storedTheme() === 'dark' || ((!storedTheme() || storedTheme() === 'system') && systemTheme.matches));
  themeButton.addEventListener('click', () => {
    const dark = root.dataset.theme !== 'dark';
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (_) { /* Theme still works without storage. */ }
    setTheme(dark);
  });
  systemTheme.addEventListener('change', event => {
    if (!storedTheme() || storedTheme() === 'system') setTheme(event.matches);
  });

  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  }

  function setContact(open) {
    if (!contactButton) return;
    contact.classList.toggle('is-open', open);
    contactButton.setAttribute('aria-expanded', String(open));
    contactButton.querySelector('span').textContent = open ? '−' : '+';
  }

  menuButton.addEventListener('click', event => {
    setContact(false);
    const open = !menu.classList.contains('is-open');
    setMenu(open);
    if (open && event.detail === 0) menu.querySelector('a').focus();
  });
  if (contactButton) contactButton.addEventListener('click', event => {
    setMenu(false);
    const open = !contact.classList.contains('is-open');
    setContact(open);
    if (open && event.detail === 0) contact.querySelector('a').focus();
  });
  menu.addEventListener('click', event => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('click', event => {
    if (!navigation.contains(event.target)) setMenu(false);
    if (contact && !contact.contains(event.target)) setContact(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (menu.classList.contains('is-open')) { setMenu(false); menuButton.focus(); }
    if (contact && contact.classList.contains('is-open')) { setContact(false); contactButton.focus(); }
  });
  document.addEventListener('focusin', event => {
    if (!navigation.contains(event.target)) setMenu(false);
    if (contact && !contact.contains(event.target)) setContact(false);
  });
  desktop.addEventListener('change', () => { setMenu(false); setContact(false); });

  const copyEmail = document.querySelector('.copy-email');
  if (copyEmail) copyEmail.addEventListener('click', async () => {
    const status = document.querySelector('.contact-status');
    try {
      await navigator.clipboard.writeText(copyEmail.dataset.email);
      status.textContent = 'Email copied';
    } catch (_) {
      status.textContent = 'Select the email address to copy it.';
    }
  });

  const header = document.querySelector('.masthead');
  function offset() { return Math.round(header.getBoundingClientRect().height) + 24; }
  new ResizeObserver(() => root.style.setProperty('--masthead-offset', header.offsetHeight + 'px')).observe(header);

  const targets = Array.from(menu.querySelectorAll('a')).map(link => {
    const url = new URL(link.href);
    const local = url.origin === location.origin && url.pathname === location.pathname;
    const section = local && url.hash ? document.getElementById(decodeURIComponent(url.hash.slice(1))) : null;
    return {link, section};
  }).filter(item => item.section);

  function updateNavigation() {
    if (!targets.length) return;
    let current = targets[0];
    for (const item of targets) {
      if (item.section.getBoundingClientRect().top <= offset() + 16) current = item;
    }
    if (scrollY > 0 && scrollY + innerHeight >= root.scrollHeight - 2) current = targets[targets.length - 1];
    for (const item of targets) {
      item.link.classList.toggle('is-active', item === current);
      if (item === current) item.link.setAttribute('aria-current', 'location');
      else item.link.removeAttribute('aria-current');
    }
  }

  function scrollTo(y) {
    if (cancelScroll) cancelScroll();
    const start = scrollY;
    const delta = y - start;
    if (motion.matches || Math.abs(delta) < 2) { window.scrollTo(0, y); return Promise.resolve(true); }
    return new Promise(resolve => {
      const began = performance.now();
      const duration = Math.min(520, Math.max(220, Math.abs(delta) * 0.3));
      let frame;
      cancelScroll = () => { cancelAnimationFrame(frame); cancelScroll = null; resolve(false); };
      function step(now) {
        const t = Math.min((now - began) / duration, 1);
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        window.scrollTo(0, start + delta * eased);
        if (t < 1) frame = requestAnimationFrame(step);
        else { cancelScroll = null; resolve(true); }
      }
      frame = requestAnimationFrame(step);
    });
  }

  for (const {link, section} of targets) link.addEventListener('click', async event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setMenu(false);
    setContact(false);
    const reached = await scrollTo(Math.max(0, section.getBoundingClientRect().top + scrollY - offset()));
    if (!reached) return;
    if (location.hash !== '#' + section.id) history.pushState(null, '', '#' + section.id);
    updateNavigation();
  });
  for (const event of ['wheel', 'touchstart']) window.addEventListener(event, () => {
    if (cancelScroll) cancelScroll();
  }, {passive:true});
  window.addEventListener('keydown', event => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key) && cancelScroll) cancelScroll();
  });
  window.addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => { updateNavigation(); scrollQueued = false; });
  }, {passive:true});
  window.addEventListener('resize', updateNavigation);
  updateNavigation();

  if (!motion.matches && 'IntersectionObserver' in window) {
    const items = document.querySelectorAll('.page__content > h1, .page__content > h2, .page__content > p, .availability-note, .document-links, .publication-card, .homepage-list > li, .comment-intro, .comment-panel');
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, {threshold:0, rootMargin:'0px 0px -24px 0px'});
    let index = 0;
    for (const item of items) {
      item.classList.add('reveal-on-scroll');
      item.style.setProperty('--reveal-delay', Math.min(index++ % 3 * 45, 90) + 'ms');
      observer.observe(item);
    }
    motion.addEventListener('change', event => {
      if (event.matches) { items.forEach(item => item.classList.add('is-visible')); observer.disconnect(); }
    });
  }
})();
