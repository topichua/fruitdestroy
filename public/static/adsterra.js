// Adsterra banner loader. One script per visible slot, loaded one at a time because every unit
// reads the same global `atOptions` when its script executes. Nothing is refreshed or remounted.
(() => {
  const HOST = 'https://bauval.org/22/';
  const TIMEOUT_MS = 10000;
  const UNITS = {
    h468: { key: 'f687a0f43372bd05a30e21ade0b11853', width: 468, height: 60 },
    v160: { key: '21784cdb073a2c67f2e9f98f228d37f3', width: 160, height: 300 },
    m320: { key: '389eb1a5ce4159ef7a604ba9b3a725f5', width: 320, height: 50 },
  };
  const slots = [...document.querySelectorAll('.ad-slot[data-ad-unit]')];
  if (!slots.length) return;

  // Respect an explicit opt-out signal; a consent manager can also set window.fdAdsConsent = false.
  const optedOut = () => window.fdAdsConsent === false || navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';

  const cleanups = [];
  let queue = Promise.resolve();

  const settle = (slot, state) => {
    slot.dataset.adState = state;
    if (state !== 'filled') window.dispatchEvent(new Event('resize')); // slot collapsed: let the game refit
  };

  const inject = slot => new Promise(done => {
    const unit = UNITS[slot.dataset.adUnit];
    const box = slot.querySelector('.ad-slot__box');
    if (!unit || !box || !slot.isConnected || !slot.getClientRects().length) {
      delete slot.dataset.adState; // hidden at this breakpoint: stay eligible for a later scan
      return done();
    }
    slot.dataset.adState = 'loading';
    const script = document.createElement('script');
    let finished = false;
    let timer;
    let observer;
    const finish = state => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      observer?.disconnect();
      settle(slot, state);
      done();
    };
    observer = new MutationObserver(() => { if (box.querySelector('iframe')) finish('filled'); });
    observer.observe(box, { childList: true, subtree: true });
    cleanups.push(() => { observer.disconnect(); clearTimeout(timer); });
    timer = setTimeout(() => finish(box.querySelector('iframe') ? 'filled' : 'empty'), TIMEOUT_MS);
    script.onerror = () => finish('failed');
    script.onload = () => { if (box.querySelector('iframe')) finish('filled'); };
    window.atOptions = { key: unit.key, format: 'iframe', height: unit.height, width: unit.width, params: {} };
    script.async = true;
    script.src = HOST + unit.key;
    box.appendChild(script); // the invoke script inserts its iframe next to itself
  });

  const scan = () => {
    if (optedOut()) return;
    for (const slot of slots) {
      if (slot.dataset.adState || !slot.getClientRects().length) continue;
      slot.dataset.adState = 'queued';
      queue = queue.then(() => inject(slot)).catch(() => {});
    }
  };

  const start = () => {
    scan();
    for (const q of ['(min-width: 768px)', '(min-width: 1360px)']) {
      const mq = window.matchMedia(q);
      mq.addEventListener('change', scan);
      cleanups.push(() => mq.removeEventListener('change', scan));
    }
  };
  const idle = () => (window.requestIdleCallback || (cb => setTimeout(cb, 300)))(start, { timeout: 2000 });
  if (document.readyState === 'complete') idle(); else window.addEventListener('load', idle, { once: true });

  window.addEventListener('pagehide', () => cleanups.forEach(fn => fn()), { once: true });
})();
