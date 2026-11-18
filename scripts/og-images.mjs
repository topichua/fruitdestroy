// Builds the social preview images in public/static/og/: one per activity, plus
// activities.jpg (catalog pages) and home.jpg. Run after adding or renaming an activity:
//
//   npm run og
//
// Needs Google Chrome (renders the cards, colour emoji included) and ImageMagick
// (`magick`, converts to JPEG). Set CHROME to the binary if it is not in the usual place.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { portalCatalog } from '../src/render/portal-catalog.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'public/static/og');
const CHROME = process.env.CHROME || [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium'
].find(p => fs.existsSync(p));
if (!CHROME) throw new Error('Chrome not found. Set CHROME=/path/to/chrome');

// Same palette as the site (public/task/index.html :root).
const MOOD = {
  energy: { bg: '#ffe1e8', accent: '#e2305b' },
  play: { bg: '#ffedcf', accent: '#c06d00' },
  calm: { bg: '#d8efe8', accent: '#22705f' },
  create: { bg: '#ece3ff', accent: '#7b4ce0' },
  home: { bg: '#f1f6ea', accent: '#e2305b' }
};
// The first activities carry a single emoji in the catalog; give them a full row.
const EMOJI = {
  'fruit-destroy': ['🍓', '🍋', '🍇'],
  'bubble-pop': ['🫧', '🍊', '🫧'],
  breathe: ['🍊', '🌿', '🍊'],
  'sand-art': ['🎨', '🍑', '🍋']
};

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function card({ title, sub, emoji, mood }) {
  const c = MOOD[mood] || MOOD.home;
  const size = title.length > 16 ? 76 : title.length > 12 ? 92 : 108;
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:wght@700&family=Unbounded:wght@700;800&display=block">
<style>
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body { background: ${c.bg}; color: #2a1532; font-family: "Nunito", system-ui, sans-serif; padding: 64px 72px; display: flex; flex-direction: column; position: relative; }
  .blob { position: absolute; border-radius: 50%; background: #fff; opacity: .55; }
  .b1 { width: 520px; height: 520px; right: -120px; top: -160px; }
  .b2 { width: 300px; height: 300px; right: 220px; bottom: -170px; opacity: .4; }
  .brand { font: 700 30px "Unbounded", sans-serif; color: ${c.accent}; position: relative; }
  .emoji { position: relative; margin-top: 44px; display: flex; gap: 28px; }
  .emoji span { width: 190px; height: 190px; border-radius: 44px; background: #fff; display: grid; place-items: center; font-size: 112px; line-height: 1; box-shadow: 0 10px 30px rgba(42,21,50,.10); }
  .emoji span:nth-child(2) { transform: translateY(18px) rotate(-4deg); }
  .emoji span:nth-child(3) { transform: rotate(5deg); }
  h1 { position: relative; margin-top: auto; font: 800 ${size}px/1.05 "Unbounded", sans-serif; letter-spacing: -0.02em; }
  p { position: relative; margin-top: 18px; font-size: 34px; color: #5f4b67; }
</style></head><body>
  <div class="blob b1"></div><div class="blob b2"></div>
  <div class="brand">Fruit Destroy</div>
  <div class="emoji">${emoji.map(e => `<span>${e}</span>`).join('')}</div>
  <h1>${esc(title)}</h1>
  <p>${esc(sub)}</p>
</body></html>`;
}

const cat = portalCatalog(path.join(root, 'public/task/index.html'));
const en = cat.str.en;
const free = 'Free in your browser · fruitdestroy.com';
const cards = [
  { id: 'home', title: 'Take a little break', sub: `${cat.activities.length} free games and calm activities · fruitdestroy.com`, emoji: ['🍓', '🫧', '🍊'], mood: 'home' },
  { id: 'activities', title: 'All activities', sub: `${cat.activities.length} games to play, release and relax · fruitdestroy.com`, emoji: ['🍉', '🧩', '🎨'], mood: 'play' },
  ...cat.activities.map(a => ({
    id: a.id,
    title: en[`${a.id}.name`],
    sub: free,
    emoji: EMOJI[a.id] || [...a.emoji, ...a.emoji, ...a.emoji].slice(0, 3),
    mood: a.moods[0]
  }))
];

fs.mkdirSync(out, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fd-og-'));
for (const c of cards) {
  if (!c.title) throw new Error(`No English name for ${c.id}`);
  const html = path.join(tmp, `${c.id}.html`);
  const png = path.join(tmp, `${c.id}.png`);
  fs.writeFileSync(html, card(c));
  execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--window-size=1200,630', '--virtual-time-budget=8000', `--screenshot=${png}`, `file://${html}`
  ], { stdio: 'ignore' });
  execFileSync('magick', [png, '-resize', '1200x630!', '-strip', '-interlace', 'JPEG', '-quality', '86', path.join(out, `${c.id}.jpg`)]);
  console.log(`${c.id}.jpg`);
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`${cards.length} images in public/static/og/`);
