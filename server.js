import express from 'express';
import compression from 'compression';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANGS, DEFAULT_LANG, t } from './src/i18n/index.js';
import { renderLanding } from './src/render/landing.js';
import { renderGame } from './src/render/game.js';
import { renderAchievements, renderDaily } from './src/render/pages.js';
import { sitemap, robots, adsTxt } from './src/render/seo-files.js';
import { portalFrom } from './src/game/portal.js';
import { favicon, googleTag } from './src/render/util.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const SITE_URL = (process.env.SITE_URL || 'https://fruitdestroy.com').replace(/\/$/, '');
const ADSENSE_CLIENT = process.env.ADSENSE_CLIENT || '';
const dev = process.env.NODE_ENV !== 'production';
const codes = LANGS.map(l => l.code);
const ctx = { SITE_URL, ADSENSE_CLIENT, LANGS };

const app = express();
app.disable('x-powered-by');
app.use(compression());
app.use('/static', express.static(path.join(__dirname, 'public/static'), { maxAge: '7d' }));
app.use('/game', express.static(path.join(__dirname, 'src/game'), { maxAge: dev ? 0 : '1h', index: false }));

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
  send(res, renderGame({ ...ctx, lang, s: t(lang), portal: portalFrom(req.query.from) }));
});
const searchOf = req => {
  const q = req.originalUrl.indexOf('?');
  return q === -1 ? '' : req.originalUrl.slice(q);
};
app.get(['/embed', '/embed/'], (req, res) => {
  const lang = req.acceptsLanguages(...codes) || DEFAULT_LANG;
  res.redirect(302, `/${lang}/embed/${searchOf(req)}`);
});
app.get('/:lang/embed/', (req, res, next) => {
  const lang = req.params.lang;
  if (!codes.includes(lang)) return next();
  res.set('Content-Security-Policy', 'frame-ancestors *');
  send(res, renderGame({ ...ctx, lang, s: t(lang), embed: true, portal: portalFrom(req.query.from) }));
});
app.get('/:lang/daily/', (req, res, next) => {
  const lang = req.params.lang;
  if (!codes.includes(lang)) return next();
  send(res, renderDaily({ ...ctx, lang, s: t(lang) }));
});
app.get('/:lang/achievements/', (req, res, next) => {
  const lang = req.params.lang;
  if (!codes.includes(lang)) return next();
  send(res, renderAchievements({ ...ctx, lang, s: t(lang) }));
});
app.get('/:lang', (req, res, next) => codes.includes(req.params.lang) ? res.redirect(301, `/${req.params.lang}/`) : next());
app.get('/:lang/play', (req, res, next) => codes.includes(req.params.lang) ? res.redirect(301, `/${req.params.lang}/play/${searchOf(req)}`) : next());
app.get('/:lang/embed', (req, res, next) => codes.includes(req.params.lang) ? res.redirect(301, `/${req.params.lang}/embed/${searchOf(req)}`) : next());
app.get('/:lang/daily', (req, res, next) => codes.includes(req.params.lang) ? res.redirect(301, `/${req.params.lang}/daily/`) : next());
app.get('/:lang/achievements', (req, res, next) => codes.includes(req.params.lang) ? res.redirect(301, `/${req.params.lang}/achievements/`) : next());

app.get('/sitemap.xml', (req, res) => res.type('application/xml').send(sitemap(ctx)));
app.get('/robots.txt', (req, res) => res.type('text/plain').send(robots(ctx)));
app.get('/ads.txt', (req, res) => res.type('text/plain').send(adsTxt(ctx)));
app.get('/healthz', (req, res) => res.send('ok'));
app.get('/favicon.ico', (req, res) => res.type('image/png').sendFile(path.join(__dirname, 'public/static/favicon.png')));

app.use((req, res) => res.status(404).type('html').send(`<!doctype html><head>${googleTag()}${favicon()}<meta charset="utf-8"><title>404 — Fruit Destroy</title></head><body style="background:#0e0c22;color:#f4f1ff;font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0"><div style="text-align:center"><div style="font-size:64px">🍌💨</div><h1>Page not found</h1><a style="color:#ff86ba" href="/">Back to the game</a></div>`));

app.listen(PORT, () => console.log(`Fruit Destroy on http://localhost:${PORT}`));
