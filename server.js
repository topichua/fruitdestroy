import fs from 'node:fs';
import express from 'express';
import compression from 'compression';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ADSENSE_CLIENT_ID, adsenseTag, favicon, googleTag } from './src/render/util.js';
import { sitemap, robots, adsTxt } from './src/render/seo-files.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const SITE_URL = (process.env.SITE_URL || 'https://fruitdestroy.com').replace(/\/$/, '');
const ADSENSE_CLIENT = process.env.ADSENSE_CLIENT || ADSENSE_CLIENT_ID;
const dev = process.env.NODE_ENV !== 'production';
const PORTAL = path.join(__dirname, 'public/task/index.html');

const LANGS = ['en', 'uk', 'pl', 'de', 'es', 'fr', 'pt-br', 'tr'];

// Old game paths have no page of their own in the portal. dist/seo/redirects.txt
// was not in the drop, so this map is the live site's public URLs.
const LEGACY = {
  play: 'fruit-destroy',
  daily: 'fruit-destroy',
  achievements: 'fruit-destroy',
  embed: 'fruit-destroy'
};

const PORTAL_PAGES = new Set([
  'activities', 'activities-energy', 'activities-play', 'activities-calm', 'activities-create',
  'fruit-destroy', 'fruit-destroy-zen', 'fruit-destroy-quick',
  'bubble-pop', 'breathe', 'sand-art',
  'fruit-slice', 'fruit-splash', 'tower-topple', 'coconut-bowling', 'juice-press',
  'fruit-merge', 'fruit-sort', 'catch-the-fruit', 'fruit-memory', 'fruit-maze',
  'fruit-puzzle', 'fruit-flip', 'fruit-beats', 'fruit-garden', 'fruit-pond',
  'orchard-sounds', 'tea-time', 'sunset-peel', 'fruit-mosaic', 'smoothie-studio',
  'pattern-maker', 'kaleido-draw', 'sticker-scene', 'citrus-stamps'
]);

const app = express();
app.disable('x-powered-by');
app.use(compression());
app.use('/static', express.static(path.join(__dirname, 'public/static'), { maxAge: '7d' }));

const searchOf = req => {
  const q = req.originalUrl.indexOf('?');
  return q === -1 ? '' : req.originalUrl.slice(q);
};

function portalHtml() {
  const raw = fs.readFileSync(PORTAL, 'utf8').replaceAll('https://fruitdestroy.gg', SITE_URL);
  const head = `${googleTag()}${adsenseTag(ADSENSE_CLIENT)}${favicon()}`;
  const at = raw.indexOf('<head>');
  if (at === -1) return raw;
  return raw.slice(0, at + 6) + head + raw.slice(at + 6);
}

const sendPortal = (res) => {
  res.set('Content-Security-Policy', 'frame-ancestors *');
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.set('Cache-Control', dev ? 'no-store' : 'public, max-age=300');
  res.send(portalHtml());
};

function portalHash(lang, page) {
  return page && page !== 'home' ? `#${lang}-${page}` : `#${lang}`;
}

function redirectPortal(res, lang, page, search = '') {
  res.redirect(302, `/${search}${portalHash(lang, page)}`);
}

app.get('/', (req, res) => sendPortal(res));

app.get(['/embed', '/embed/'], (req, res) => {
  const lang = req.acceptsLanguages(...LANGS) || 'en';
  redirectPortal(res, lang, 'fruit-destroy', searchOf(req));
});

app.get(['/:lang/:section', '/:lang/:section/'], (req, res, next) => {
  const { lang, section } = req.params;
  if (!LANGS.includes(lang)) return next();
  const page = LEGACY[section] || (PORTAL_PAGES.has(section) ? section : null);
  if (!page) return next();
  redirectPortal(res, lang, page, searchOf(req));
});

app.get(['/:lang', '/:lang/'], (req, res, next) => {
  const { lang } = req.params;
  if (!LANGS.includes(lang)) return next();
  redirectPortal(res, lang, 'home', searchOf(req));
});

app.get('/sitemap.xml', (req, res) => res.type('application/xml').send(sitemap({ SITE_URL })));
app.get('/robots.txt', (req, res) => res.type('text/plain').send(robots({ SITE_URL })));
app.get('/ads.txt', (req, res) => res.type('text/plain').send(adsTxt({ ADSENSE_CLIENT })));
app.get('/healthz', (req, res) => res.send('ok'));
app.get('/favicon.ico', (req, res) => res.type('image/png').sendFile(path.join(__dirname, 'public/static/favicon.png')));

app.use((req, res) => res.status(404).type('html').send(`<!doctype html><head>${googleTag()}${adsenseTag(ADSENSE_CLIENT)}${favicon()}<meta charset="utf-8"><title>404 — Fruit Destroy</title></head><body style="background:#170d1c;color:#f2f6ea;font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0"><div style="text-align:center"><div style="font-size:64px">🍌💨</div><h1>Page not found</h1><a style="color:#ff4f7a" href="/">Back to Fruit Destroy</a></div>`));

app.listen(PORT, () => console.log(`Fruit Destroy on http://localhost:${PORT}`));
