// Takes a gameplay screenshot of every activity into public/static/shots/{id}.jpg.
// The pages show them in the About section, and they are what image search indexes.
//
//   npm run shots            all activities
//   npm run shots fruit-maze just these
//
// Starts the site on a spare port, opens each activity in headless Chrome, presses
// Start, plays a few generic moves (taps, swipes, arrow keys) and captures the stage.
// Needs Google Chrome and ImageMagick (`magick`). Set CHROME if it is somewhere unusual.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createApp } from '../server.js';
import { portalCatalog } from '../src/render/portal-catalog.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'public/static/shots');
const CHROME = process.env.CHROME || [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
].find(p => fs.existsSync(p));
if (!CHROME) throw new Error('Chrome not found. Set CHROME=/path/to/chrome');

const sleep = ms => new Promise(r => setTimeout(r, ms));
const cat = portalCatalog(path.join(root, 'public/task/index.html'));
const only = process.argv.slice(2);
const ids = cat.activities.map(a => a.id).filter(id => !only.length || only.includes(id));

const server = createApp().listen(0);
await new Promise(r => server.once('listening', r));
const base = `http://127.0.0.1:${server.address().port}`;

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'fd-shots-'));
const chrome = spawn(CHROME, [
  '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--hide-scrollbars',
  '--mute-audio', '--no-first-run', '--window-size=1280,900', 'about:blank'
], { stdio: ['ignore', 'ignore', 'pipe'] });
const wsUrl = await new Promise((resolve, reject) => {
  let buf = '';
  chrome.stderr.on('data', d => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) resolve(m[1]); });
  chrome.once('exit', () => reject(new Error('Chrome exited before DevTools was ready')));
});

// Minimal Chrome DevTools Protocol client over the built-in WebSocket.
const ws = new WebSocket(wsUrl);
await new Promise(r => ws.addEventListener('open', r, { once: true }));
let seq = 0;
const waiting = new Map();
ws.addEventListener('message', e => {
  const msg = JSON.parse(e.data);
  if (msg.id && waiting.has(msg.id)) { const { resolve, reject } = waiting.get(msg.id); waiting.delete(msg.id); msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result); }
});
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
  const id = ++seq; waiting.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params, sessionId }));
});

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
const cdp = (method, params) => send(method, params, sessionId);
await cdp('Page.enable');
await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1000, deviceScaleFactor: 1.25, mobile: false });
await cdp('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
const evaluate = async expression => (await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value;

const mouse = (type, x, y, extra = {}) => cdp('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1, ...extra });
async function tap(x, y) { await mouse('mousePressed', x, y); await sleep(40); await mouse('mouseReleased', x, y); }
async function swipe(x1, y1, x2, y2) {
  await mouse('mousePressed', x1, y1);
  for (let i = 1; i <= 8; i++) { await mouse('mouseMoved', x1 + (x2 - x1) * i / 8, y1 + (y2 - y1) * i / 8); await sleep(16); }
  await mouse('mouseReleased', x2, y2);
}
async function key(k) {
  const code = { ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40 }[k];
  await cdp('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: k, code: k, windowsVirtualKeyCode: code });
  await sleep(120);
  await cdp('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code: k, windowsVirtualKeyCode: code });
}
const stageBox = () => evaluate(`(() => { const s = document.querySelector('#act-root .stage'); if (!s) return null; s.scrollIntoView({ block: 'start' }); const r = s.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; })()`);
const pressStart = () => evaluate(`(() => { const b = document.querySelector('#act-root .overlay .btn-big, #act-root .overlay .btn, #act-root .overlay button, #act-root .stage .btn-big'); if (!b || !b.offsetParent) return false; b.click(); return true; })()`);
// The sticky header would cover the top of the stage in the capture.
const hideChrome = () => evaluate(`(() => { const s = document.createElement('style'); s.textContent = '#site-header{visibility:hidden!important} .toast{display:none!important}'; document.head.appendChild(s); })()`);

// Moves per activity; `default` suits most. Each step: ['tap', fx, fy] | ['swipe', fx1, fy1, fx2, fy2] | ['key', name] | ['click', selector, nth] | ['wait', ms]
const DEFAULT_MOVES = [
  ['tap', 0.35, 0.5], ['tap', 0.6, 0.45], ['tap', 0.5, 0.65], ['tap', 0.42, 0.35], ['tap', 0.66, 0.6],
  ['swipe', 0.3, 0.6, 0.7, 0.4], ['swipe', 0.65, 0.3, 0.4, 0.7],
  ['key', 'ArrowRight'], ['key', 'ArrowDown'], ['key', 'ArrowRight'], ['wait', 900]
];
const MOVES = {
  'tower-topple': [['wait', 500], ['tap', 0.5, 0.5], ['wait', 900], ['tap', 0.5, 0.5], ['wait', 350]],
  'fruit-memory': [['tap', 0.38, 0.3], ['wait', 350], ['tap', 0.62, 0.55], ['wait', 250]],
  'fruit-slice': [['wait', 1300], ['swipe', 0.2, 0.7, 0.8, 0.3], ['wait', 500], ['swipe', 0.75, 0.65, 0.3, 0.35], ['wait', 250]],
  'sand-art': [['swipe', 0.2, 0.2, 0.8, 0.25], ['swipe', 0.8, 0.3, 0.25, 0.35], ['swipe', 0.3, 0.15, 0.7, 0.2], ['swipe', 0.45, 0.3, 0.6, 0.3], ['wait', 1800]],
  'fruit-destroy': [['wait', 700], ['tap', 0.4, 0.45], ['tap', 0.55, 0.55], ['wait', 500]],
  breathe: [['wait', 3500]],
  'smoothie-studio': [
    ['click', '.smo-fruit [data-f]', 0], ['click', '.smo-fruit [data-f]', 3], ['click', '.smo-blend'], ['wait', 1600], ['click', '.smo-pour'], ['wait', 500],
    ['click', '.smo-fruit [data-f]', 5], ['click', '.smo-fruit [data-f]', 6], ['click', '.smo-blend'], ['wait', 1600], ['click', '.smo-pour'], ['wait', 500],
    ['click', '.smo-fruit [data-f]', 2], ['click', '.smo-blend'], ['wait', 1600], ['click', '.smo-pour'], ['wait', 400], ['click', '.smo-top', 0], ['click', '.smo-top', 1], ['wait', 600]
  ],
  'sticker-scene': [
    ['click', '.st-tray [data-e]', 12], ['swipe', 0.5, 0.5, 0.14, 0.42], ['click', '.st-tray [data-e]', 13], ['swipe', 0.5, 0.5, 0.86, 0.16],
    ['click', '.st-tray [data-e]', 0], ['swipe', 0.5, 0.5, 0.36, 0.78], ['click', '.st-tray [data-e]', 2], ['swipe', 0.5, 0.5, 0.56, 0.82],
    ['click', '.st-tray [data-e]', 14], ['swipe', 0.5, 0.5, 0.74, 0.62], ['click', '.st-tray [data-e]', 17], ['swipe', 0.5, 0.5, 0.3, 0.2],
    ['click', '.st-tray [data-e]', 4], ['swipe', 0.5, 0.5, 0.2, 0.8], ['tap', 0.95, 0.4], ['wait', 500]
  ],
  'coconut-bowling': [['swipe', 0.5, 0.85, 0.5, 0.3], ['wait', 900]]
};


fs.mkdirSync(out, { recursive: true });
try {
  for (const id of ids) {
    await cdp('Page.navigate', { url: `${base}/en/${id}/` });
    await sleep(1800);
    await hideChrome();
    let started = 0;
    for (let i = 0; i < 3 && await pressStart(); i++) { started++; await sleep(500); }
    const box = await stageBox();
    if (!box) throw new Error(`${id}: no stage on the page`);
    const at = (fx, fy) => [box.x + box.width * fx, box.y + box.height * fy];
    for (const [kind, ...v] of MOVES[id] || DEFAULT_MOVES) {
      if (kind === 'tap') { await tap(...at(v[0], v[1])); await sleep(180); }
      else if (kind === 'swipe') { await swipe(...at(v[0], v[1]), ...at(v[2], v[3])); await sleep(150); }
      else if (kind === 'key') await key(v[0]);
      else if (kind === 'click') { await evaluate(`document.querySelectorAll('#act-root ${v[0]}')[${v[1] || 0}]?.click()`); await sleep(200); }
      else await sleep(v[0]);
    }
    // captureScreenshot clips in page coordinates; stageBox() is relative to the viewport.
    const view = await stageBox();
    const clip = { ...view, x: view.x + await evaluate('scrollX'), y: view.y + await evaluate('scrollY') };
    const { data } = await cdp('Page.captureScreenshot', { format: 'png', clip: { ...clip, scale: 1 } });
    const png = path.join(profile, `${id}.png`);
    fs.writeFileSync(png, Buffer.from(data, 'base64'));
    execFileSync('magick', [png, '-resize', '1200x', '-strip', '-interlace', 'JPEG', '-quality', '84', path.join(out, `${id}.jpg`)]);
    console.log(`${id}.jpg${started ? '' : '  (no Start button found)'}`);
  }
} finally {
  ws.close();
  chrome.kill();
  server.close();
  await sleep(300);
  fs.rmSync(profile, { recursive: true, force: true });
}
console.log(`${ids.length} screenshots in public/static/shots/`);
