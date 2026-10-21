import express from 'express';
import compression from 'compression';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGS, DEFAULT_LANG, t } from './src/i18n/index.js';
import { renderLanding } from './src/render/landing.js';
import { renderGame } from './src/render/game.js';
import { sitemap, robots, adsTxt } from './src/render/seo-files.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const SITE_URL = (process.env.SITE_URL || 'https://fruitdestroy.gg').replace(/\/$/, '');
const ADSENSE_CLIENT = process.env.ADSENSE_CLIENT || '';
const GAME_HTML = fs.readFileSync(path.join(__dirname, 'public/game.html'), 'utf8');
const codes = LANGS.map(l => l.code);
const ctx = { SITE_URL, ADSENSE_CLIENT, LANGS };

const app = express();
app.disable('x-powered-by');
app.use(compression());
app.use('/static', express.static(path.join(__dirname, 'public/static'), { maxAge: '7d' }));

const send = (res, html) => res.set('Content-Type', 'text/html; charset=utf-8').set('Cache-Control', 'public, max-age=300').send(html);

app.get('/', (req, res) => {
  const lang = req.acceptsLanguages(...codes) || DEFAULT_LANG;
  res.redirect(302, `/${lang}/`);
});
app.get('/:lang/', (req, res, next) => {
  const lang = req.params.lang;
  if (!codes.includes(lang)) return next();
  send(res, renderLanding({ ...ctx, lang, s: t(lang) }));
});
app.get('/:lang/play/', (req, res, next) => {
  const lang = req.params.lang;
  if (!codes.includes(lang)) return next();
  send(res, renderGame(GAME_HTML, { ...ctx, lang, s: t(lang) }));
});
app.get('/:lang', (req, res, next) => codes.includes(req.params.lang) ? res.redirect(301, `/${req.params.lang}/`) : next());
app.get('/:lang/play', (req, res, next) => codes.includes(req.params.lang) ? res.redirect(301, `/${req.params.lang}/play/`) : next());

app.get('/sitemap.xml', (req, res) => res.type('application/xml').send(sitemap(ctx)));
app.get('/robots.txt', (req, res) => res.type('text/plain').send(robots(ctx)));
app.get('/ads.txt', (req, res) => res.type('text/plain').send(adsTxt(ctx)));
app.get('/healthz', (req, res) => res.send('ok'));

app.use((req, res) => res.status(404).type('html').send(`<!doctype html><meta charset="utf-8"><title>404 — Fruit Destroy</title><body style="background:#0e0c22;color:#f4f1ff;font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0"><div style="text-align:center"><div style="font-size:64px">🍌💨</div><h1>Page not found</h1><a style="color:#ff86ba" href="/">Back to the game</a></div>`));

app.listen(PORT, () => console.log(`Fruit Destroy on http://localhost:${PORT}`));
