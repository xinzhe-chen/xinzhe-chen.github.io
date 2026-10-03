/* The guestbook keeps the existing GitHub discussion and follows the site theme. */
(function () {
  const panel = document.getElementById('comment-panel');
  if (!panel) return;

  const status = panel.querySelector('.comment-status');
  const statusText = panel.querySelector('.comment-status__text');
  const actions = panel.querySelector('.comment-status__actions');
  const host = panel.querySelector('.giscus');
  const giscusOrigin = 'https://giscus.app';
  const theme = () => document.documentElement.dataset.theme === 'dark' ? 'transparent_dark' : 'noborder_light';
  let frame = null;
  let lastTheme = null;
  let slowTimer;

  const setState = (state) => {
    panel.dataset.state = state;
    status.hidden = state === 'ready';
    actions.hidden = state === 'loading' || state === 'ready';
    statusText.textContent = state === 'loading'
      ? 'Loading the conversation…'
      : 'The conversation could not be loaded. Please try again, or view it on GitHub.';
    if (state !== 'loading') clearTimeout(slowTimer);
  };

  const syncTheme = () => {
    const nextTheme = theme();
    if (!frame || nextTheme === lastTheme) return;
    frame.contentWindow.postMessage({ giscus: { setConfig: { theme: nextTheme } } }, giscusOrigin);
    lastTheme = nextTheme;
  };

  const frameObserver = new MutationObserver(() => {
    const mounted = host.querySelector('iframe.giscus-frame');
    if (!mounted || mounted === frame) return;
    frame = mounted;
    frame.addEventListener('load', () => {
      lastTheme = null;
      syncTheme();
    });
    frameObserver.disconnect();
  });
  frameObserver.observe(host, { childList: true });

  window.addEventListener('message', (event) => {
    if (event.origin !== giscusOrigin || !frame || event.source !== frame.contentWindow) return;
    const payload = event.data && event.data.giscus;
    if (!payload || typeof payload !== 'object') return;
    if (payload.error) {
      setState('error');
      return;
    }
    if (Number(payload.resizeHeight) > 0 || payload.discussion) {
      setState('ready');
      syncTheme();
    }
  });

  new MutationObserver(syncTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  panel.querySelector('.comment-retry').addEventListener('click', () => window.location.reload());
  setState('loading');
  slowTimer = window.setTimeout(() => {
    if (panel.dataset.state === 'loading') setState('error');
  }, 12000);

  const script = document.createElement('script');
  script.src = giscusOrigin + '/client.js';
  script.async = true;
  script.crossOrigin = 'anonymous';
  const config = {
    repo: 'xinzhe-chen/xinzhe-chen.github.io',
    'repo-id': 'R_kgDOQxBxOg',
    'category-id': 'DIC_kwDOQxBxOs4C3QW-',
    mapping: 'pathname',
    strict: '0',
    'reactions-enabled': '1',
    'emit-metadata': '1',
    'input-position': 'top',
    theme: theme(),
    lang: 'zh-CN',
  };
  for (const [key, value] of Object.entries(config)) script.setAttribute('data-' + key, value);
  script.addEventListener('error', () => setState('error'));
  panel.appendChild(script);
})();
