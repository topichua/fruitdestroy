import express from 'express';
import compression from 'compression';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ADSENSE_CLIENT_ID, adsenseTag, favicon, googleTag } from './src/render/util.js';
import { sitemap, robots, adsTxt } from './src/render/seo-files.js';
import { portalCatalog, isKnownLang, isKnownPage, isIndexedPage, pagePath, indexedPaths } from './src/render/portal-catalog.js';
import { renderPortalDocument } from './src/render/portal-document.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const SITE_URL = (process.env.SITE_URL || 'https://fruitdestroy.com').replace(/\/$/, '');
const ADSENSE_CLIENT = process.env.ADSENSE_CLIENT || ADSENSE_CLIENT_ID;
const dev = process.env.NODE_ENV !== 'production';
const PORTAL = path.join(__dirname, 'public/task/index.html');

// Old game paths have no page of their own. They permanently move to Fruit Destroy.
const LEGACY = {
  play: 'fruit-destroy',
  daily: 'fruit-destroy',
  achievements: 'fruit-destroy',
  embed: 'fruit-destroy'
};

const searchOf = req => {
  const q = req.originalUrl.indexOf('?');
  return q === -1 ? '' : req.originalUrl.slice(q);
};

function portalHtml(route) {
  const doc = renderPortalDocument(PORTAL, route, { SITE_URL });
  const head = `${googleTag()}${adsenseTag(ADSENSE_CLIENT)}${favicon()}`;
  const at = doc.indexOf('<head>');
  if (at === -1) return doc;
  return doc.slice(0, at + 6) + head + doc.slice(at + 6);
}

const sendHtml = (res, html) => {
  res.set('Content-Security-Policy', 'frame-ancestors *');
  res.set('Content-Type', 'text/html; charset=utf-8');
  res.set('Cache-Control', dev ? 'no-store' : 'public, max-age=300');
  res.send(html);
};

function pageRoute(lang, page, { root = false } = {}) {
  const cat = portalCatalog(PORTAL);
  return { lang, page, root, indexed: !root && isIndexedPage(cat, lang, page) };
}

const permanent = (res, pathname, search) => res.redirect(301, pathname + search);

function readyRequestLang(req) {
  const codes = portalCatalog(PORTAL).langs.filter(l => l.ready).map(l => l.code);
  return req.acceptsLanguages(...codes) || 'en';
}

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('strict routing', true);
  app.use(compression());
  app.use('/static', express.static(path.join(__dirname, 'public/static'), { maxAge: '7d' }));
  app.use('/i18n', express.static(path.join(__dirname, 'public/i18n'), { maxAge: '1h' }));

  // `/` stays 200 so a browser can still read an old hash (#en-fruit-maze) before
  // the client replaces it. The document itself is not indexed.
  app.get('/', (req, res) => sendHtml(res, portalHtml(pageRoute('en', 'home', { root: true }))));

  app.get(['/embed', '/embed/'], (req, res) => {
    permanent(res, pagePath(readyRequestLang(req), 'fruit-destroy'), searchOf(req));
  });

  app.get('/sitemap.xml', (req, res) => {
    const urls = indexedPaths(portalCatalog(PORTAL)).map(p => `${SITE_URL}${p}`);
    res.type('application/xml').send(sitemap({ urls }));
  });
  app.get('/robots.txt', (req, res) => res.type('text/plain').send(robots({ SITE_URL })));
  app.get('/ads.txt', (req, res) => res.type('text/plain').send(adsTxt({ ADSENSE_CLIENT })));
  app.get('/healthz', (req, res) => res.send('ok'));
  app.get('/favicon.ico', (req, res) => res.type('image/png').sendFile(path.join(__dirname, 'public/static/favicon.png')));

  app.get('/:lang', (req, res, next) => {
    const { lang } = req.params;
    if (!isKnownLang(portalCatalog(PORTAL), lang)) return next();
    permanent(res, pagePath(lang, 'home'), searchOf(req));
  });

  app.get('/:lang/', (req, res, next) => {
    const { lang } = req.params;
    if (!isKnownLang(portalCatalog(PORTAL), lang)) return next();
    sendHtml(res, portalHtml(pageRoute(lang, 'home')));
  });

  app.get('/:lang/:section', (req, res, next) => {
    const { lang, section } = req.params;
    const cat = portalCatalog(PORTAL);
    if (!isKnownLang(cat, lang)) return next();
    const page = LEGACY[section] || (isKnownPage(cat, section) ? section : null);
    if (!page) return next();
    permanent(res, pagePath(lang, page), searchOf(req));
  });

  app.get('/:lang/:section/', (req, res, next) => {
    const { lang, section } = req.params;
    const cat = portalCatalog(PORTAL);
    if (!isKnownLang(cat, lang)) return next();
    const page = LEGACY[section] || (isKnownPage(cat, section) ? section : null);
    if (!page) return next();
    if (LEGACY[section]) return permanent(res, pagePath(lang, page), searchOf(req));
    sendHtml(res, portalHtml(pageRoute(lang, page)));
  });

  app.use((req, res) => res.status(404).type('html').send(`<!doctype html><head>${googleTag()}${adsenseTag(ADSENSE_CLIENT)}${favicon()}<meta charset="utf-8"><title>404 — Fruit Destroy</title></head><body style="background:#170d1c;color:#f2f6ea;font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0"><div style="text-align:center"><div style="font-size:64px">🍌💨</div><h1>Page not found</h1><a style="color:#ff4f7a" href="/en/">Back to Fruit Destroy</a></div>`));
  return app;
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (invokedDirectly) {
  createApp().listen(PORT, () => console.log(`Fruit Destroy on http://localhost:${PORT}`));
}
