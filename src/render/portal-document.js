import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { portalCatalog, readyLangs, canonicalPage, pagePath } from './portal-catalog.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rich = s => esc(s).replace(/&lt;(\/?)em&gt;/g, '<$1em>');

function pick(cat, lang, key) {
  const pack = cat.str[lang] || cat.str.en;
  const value = pack[key] ?? cat.str.en[key];
  return value == null ? '' : value;
}

function contentLang(cat, lang) {
  return readyLangs(cat).some(l => l.code === lang) ? lang : 'en';
}

function listFor(cat, mood) {
  const list = cat.activities
    .filter(a => !mood || a.moods.includes(mood))
    .map(a => ({ id: a.id, variant: null }));
  if (mood === 'calm') list.push({ id: 'fruit-destroy', variant: 'zen' });
  if (mood === 'energy') {
    const i = list.findIndex(x => x.id === 'fruit-destroy');
    if (i >= 0) list[i] = { id: 'fruit-destroy', variant: 'quick' };
  }
  return list;
}

function entryPath(lang, id, variant) {
  return pagePath(lang, variant ? `${id}-${variant}` : id);
}

function entryName(cat, lang, id, variant) {
  return variant ? pick(cat, lang, `fruit-destroy.${variant}Name`) : pick(cat, lang, `${id}.name`);
}

function entryCard(cat, lang, id, variant) {
  return variant ? pick(cat, lang, `fruit-destroy.${variant}Card`) : pick(cat, lang, `${id}.card`);
}

function linkList(cat, lang, entries) {
  return `<ul>${entries.map(({ id, variant }) => {
    const href = entryPath(lang, id, variant);
    return `<li><a href="${esc(href)}">${esc(entryName(cat, lang, id, variant))}</a> — ${esc(entryCard(cat, lang, id, variant))}</li>`;
  }).join('')}</ul>`;
}

function relatedIds(cat, id, variant) {
  const key = variant ? `${id}-${variant}` : id;
  return (cat.related[key] || cat.related[id] || []).filter(x => x !== id).slice(0, 6);
}

function activityBody(cat, lang, page) {
  const cl = contentLang(cat, lang);
  const variantMatch = page.match(/^fruit-destroy-(zen|quick)$/);
  const id = variantMatch ? 'fruit-destroy' : page;
  const variant = variantMatch ? variantMatch[1] : null;
  const about = pick(cat, cl, `${id}.about`);
  const steps = pick(cat, cl, `${id}.steps`);
  const note = pick(cat, cl, `${id}.note`);
  const paras = Array.isArray(about) ? about : [];
  const stepItems = Array.isArray(steps) ? steps : [];
  const related = relatedIds(cat, id, variant)
    .map(rid => ({ id: rid, variant: null }))
    .filter(x => cat.activities.some(a => a.id === x.id));
  const faq = id === 'fruit-destroy' && !variant ? pick(cat, cl, 'fruit-destroy.faq') : [];
  return `<div class="wrap act">
    <a class="crumb" href="${esc(pagePath(lang, 'activities'))}">${esc(pick(cat, cl, 'backActivities'))}</a>
    <h1 id="h1">${esc(variant ? entryName(cat, cl, id, variant) : pick(cat, cl, `${id}.h1`) || entryName(cat, cl, id))}</h1>
    <p class="act-lead">${esc(entryCard(cat, cl, id, variant))}</p>
  </div>
  <div class="wrap"><section class="about" aria-label="${esc(pick(cat, cl, 'aboutLabel'))}">
    <h2>${esc(pick(cat, cl, 'aboutTitle'))}</h2>
    ${paras.map(p => `<p>${esc(p)}</p>`).join('')}
    <figure class="shot"><img src="/static/shots/${esc(id)}.jpg" alt="${esc(`${entryName(cat, cl, id)} — ${entryCard(cat, cl, id)}`)}" width="1200" height="711" loading="lazy" decoding="async"></figure>
    ${note ? `<p>${esc(note)}</p>` : ''}
    ${stepItems.length ? `<h2>${esc(pick(cat, cl, 'howTitle'))}</h2><ol class="steps">${stepItems.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}
    ${Array.isArray(faq) && faq.length ? `<h2>${esc(pick(cat, cl, 'faqTitle'))}</h2>${faq.map(([q, a]) => `<h3>${esc(q)}</h3><p>${esc(a)}</p>`).join('')}` : ''}
  </section></div>
  <div class="wrap"><section>
    <h2>${esc(pick(cat, cl, 'tryNext'))}</h2>
    <p><a href="${esc(pagePath(lang, 'activities'))}">${esc(pick(cat, cl, 'activitiesTitle'))}</a></p>
    ${linkList(cat, lang, related)}
  </section></div>`;
}

function homeBody(cat, lang) {
  const cl = contentLang(cat, lang);
  const entries = cat.activities.map(a => ({ id: a.id, variant: null }));
  return `<div class="wrap"><section class="hero" aria-labelledby="h1">
    <h1 id="h1">${rich(pick(cat, cl, 'heroTitle'))}</h1>
    <p>${esc(pick(cat, cl, 'heroSub'))}</p>
    <p><a href="${esc(pagePath(lang, 'fruit-destroy'))}">${esc(pick(cat, cl, 'playFD'))}</a>
    <a href="${esc(pagePath(lang, 'activities'))}">${esc(pick(cat, cl, 'exploreAll'))}</a>
    <a href="${esc(pagePath(lang, 'fruit-maze'))}">${esc(pick(cat, cl, 'heroMaze'))}</a></p>
  </section>
  <nav aria-label="${esc(pick(cat, cl, 'moodQ'))}"><h2>${esc(pick(cat, cl, 'moodQ'))}</h2>
    <ul>${cat.moods.map(m => `<li><a href="${esc(pagePath(lang, 'activities-' + m))}">${esc(pick(cat, cl, 'mood.' + m))}</a> — ${esc(pick(cat, cl, 'moodSub.' + m))}</li>`).join('')}</ul>
  </nav>
  <section><h2>${esc(pick(cat, cl, 'activitiesTitle'))}</h2>${linkList(cat, lang, entries)}</section>
  <section><h2>${esc(pick(cat, cl, 'howTitleHome'))}</h2>
    <ol><li>${esc(pick(cat, cl, 'how1t'))}: ${esc(pick(cat, cl, 'how1'))}</li><li>${esc(pick(cat, cl, 'how2t'))}: ${esc(pick(cat, cl, 'how2'))}</li><li>${esc(pick(cat, cl, 'how3t'))}: ${esc(pick(cat, cl, 'how3'))}</li></ol>
  </section></div>`;
}

function catalogBody(cat, lang, page) {
  const cl = contentLang(cat, lang);
  const mood = page === 'activities' ? null : page.slice('activities-'.length);
  const entries = listFor(cat, mood);
  const title = mood ? pick(cat, cl, 'mood.' + mood) : pick(cat, cl, 'activitiesTitle');
  const sub = mood ? pick(cat, cl, 'moodSub.' + mood) : pick(cat, cl, 'activitiesSub');
  return `<div class="wrap">
    <a class="crumb" href="${esc(pagePath(lang, 'home'))}">${esc(pick(cat, cl, 'backHome'))}</a>
    <h1 id="h1">${esc(title)}</h1>
    <p>${esc(sub)}</p>
    <nav aria-label="${esc(pick(cat, cl, 'filterLabel'))}">
      <a href="${esc(pagePath(lang, 'activities'))}">${esc(pick(cat, cl, 'all'))}</a>
      ${cat.moods.map(m => `<a href="${esc(pagePath(lang, 'activities-' + m))}">${esc(pick(cat, cl, 'mood.' + m))}</a>`).join(' ')}
    </nav>
    ${linkList(cat, lang, entries)}
  </div>`;
}

function chrome(cat, lang, page) {
  const cl = contentLang(cat, lang);
  const header = `<div class="wrap"><a class="brand" href="${esc(pagePath(lang, 'home'))}">Fruit Destroy</a> <a href="${esc(pagePath(lang, 'activities'))}">${esc(pick(cat, cl, 'navActivities'))}</a></div>`;
  const moods = cat.moods.map(m => `<a href="${esc(pagePath(lang, 'activities-' + m))}">${esc(pick(cat, cl, 'mood.' + m))}</a>`).join('');
  const games = cat.activities.map(a => `<a href="${esc(pagePath(lang, a.id))}">${esc(entryName(cat, cl, a.id))}</a>`).join('');
  const langs = cat.langs.map(l => `<a href="${esc(pagePath(l.code, page))}" hreflang="${esc(l.hreflang)}" lang="${esc(l.hreflang)}">${esc(l.label)}</a>`).join(' ');
  const footer = `<div class="wrap"><nav aria-label="${esc(pick(cat, cl, 'footMoods'))}">${moods}</nav><nav aria-label="${esc(pick(cat, cl, 'activitiesTitle'))}">${games}<a href="${esc(pagePath(lang, 'activities'))}">${esc(pick(cat, cl, 'activitiesTitle'))}</a></nav><nav aria-label="${esc(pick(cat, cl, 'language'))}">${langs}</nav></div>`;
  return { header, footer };
}

function metaFor(cat, lang, page) {
  const cl = contentLang(cat, lang);
  if (page === 'home') return { title: pick(cat, cl, 'meta.home.title'), description: pick(cat, cl, 'meta.home.desc') };
  if (page === 'activities') return { title: pick(cat, cl, 'meta.catalog.title'), description: pick(cat, cl, 'meta.catalog.desc') };
  if (page.startsWith('activities-')) {
    const mood = page.slice('activities-'.length);
    return { title: pick(cat, cl, `meta.mood.${mood}.title`), description: pick(cat, cl, `meta.mood.${mood}.desc`) };
  }
  const id = page.replace(/^fruit-destroy-(zen|quick)$/, 'fruit-destroy');
  return { title: pick(cat, cl, `meta.${id}.title`), description: pick(cat, cl, `meta.${id}.desc`) };
}

// Social preview: one image per activity, a shared one for the catalog pages and for home.
export function ogImagePath(cat, page) {
  const canon = canonicalPage(page);
  if (cat.activities.some(a => a.id === canon)) return `/static/og/${canon}.jpg`;
  return canon.startsWith('activities') ? '/static/og/activities.jpg' : '/static/og/home.jpg';
}

// The same structured data the client writes in setMeta(), so crawlers that do not run
// JavaScript get it too. Keep the two in step.
function jsonLdFor(cat, site, lang, page, image) {
  const canon = canonicalPage(page);
  const base = `${site}/${lang}`;
  if (canon === 'home') {
    return { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Fruit Destroy', url: `${base}/`, inLanguage: lang, description: pick(cat, lang, 'meta.home.desc'), image };
  }
  if (canon === 'activities' || canon.startsWith('activities-')) {
    const mood = canon === 'activities' ? null : canon.slice('activities-'.length);
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: listFor(cat, mood).map((x, i) => ({ '@type': 'ListItem', position: i + 1, name: entryName(cat, lang, x.id, x.variant), url: `${base}/${x.id}/` }))
    };
  }
  const description = pick(cat, lang, `meta.${canon}.desc`);
  if (canon === 'fruit-destroy') {
    const faq = pick(cat, lang, 'fruit-destroy.faq');
    const game = { '@type': 'VideoGame', name: 'Fruit Destroy', url: `${base}/fruit-destroy/`, description, image, screenshot: `${site}/static/shots/fruit-destroy.jpg`, genre: ['Arcade', 'Puzzle', 'Casual'], gamePlatform: ['Web browser', 'Mobile', 'Desktop'], inLanguage: lang, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } };
    const graph = [game];
    if (Array.isArray(faq) && faq.length) graph.push({ '@type': 'FAQPage', mainEntity: faq.map(([q, ans]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: ans } })) });
    return { '@context': 'https://schema.org', '@graph': graph };
  }
  const common = { '@context': 'https://schema.org', name: pick(cat, lang, `${canon}.name`), url: `${base}/${canon}/`, description, image, screenshot: `${site}/static/shots/${canon}.jpg`, inLanguage: lang, isAccessibleForFree: true };
  return canon === 'breathe'
    ? { ...common, '@type': 'WebApplication', applicationCategory: 'LifestyleApplication' }
    : { ...common, '@type': 'VideoGame', genre: ['Casual'], gamePlatform: ['Web browser', 'Mobile', 'Desktop'] };
}

// Tags carry data-seo so the client's setMeta() replaces them instead of adding a second set.
function socialTags(cat, { site, lang, page, title, description, canonical }) {
  const image = site + ogImagePath(cat, page);
  const info = cat.langs.find(l => l.code === lang);
  const meta = (attr, key, content) => `<meta ${attr}="${key}" content="${esc(content)}" data-seo="">`;
  const ld = JSON.stringify(jsonLdFor(cat, site, lang, page, image)).replace(/</g, '\\u003c');
  return [
    meta('property', 'og:type', 'website'),
    meta('property', 'og:site_name', 'Fruit Destroy'),
    meta('property', 'og:title', title),
    meta('property', 'og:description', description),
    meta('property', 'og:url', canonical),
    meta('property', 'og:locale', info?.og || 'en_US'),
    meta('property', 'og:image', image),
    meta('property', 'og:image:width', '1200'),
    meta('property', 'og:image:height', '630'),
    meta('property', 'og:image:alt', title),
    meta('name', 'twitter:card', 'summary_large_image'),
    meta('name', 'twitter:title', title),
    meta('name', 'twitter:description', description),
    meta('name', 'twitter:image', image),
    `<script type="application/ld+json" data-seo="">${ld}</script>`
  ].join('');
}

function bodyFor(cat, lang, page) {
  if (page === 'home') return homeBody(cat, lang);
  if (page === 'activities' || page.startsWith('activities-')) return catalogBody(cat, lang, page);
  return activityBody(cat, lang, page);
}

// The portal keeps its whole app in one inline <script>. Served inline it is ~375 KB in
// every page and cannot be cached, so the server lifts it out: appScript() returns the code
// and a content hash, the page links /static/app.{hash}.js and browsers keep it for a year.
// The source file stays a single HTML document.
// Fonts come from /static/fonts instead of Google Fonts: no third-party connection, and no
// render-blocking stylesheet request. The @font-face rules go inline; the files a page is
// sure to use (Latin for the brand and UI, Cyrillic where the language needs it) are preloaded.
const FONT_CSS = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'fonts.css'), 'utf8').replace(/\/\*[\s\S]*?\*\/\s*/g, '').replace(/\n/g, '');
const CYRILLIC_LANGS = new Set(['uk', 'ru', 'bg', 'kk']);
const GOOGLE_FONTS = /<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\s*<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>\s*<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/[^"]*">\s*/;
function fontTags(lang) {
  const subsets = CYRILLIC_LANGS.has(lang) ? ['latin', 'cyrillic'] : ['latin'];
  const preload = subsets.flatMap(sub => ['unbounded', 'nunito'].map(f => `<link rel="preload" as="font" type="font/woff2" href="/static/fonts/${f}-${sub}.woff2" crossorigin>`)).join('');
  return `${preload}<style>${FONT_CSS}</style>`;
}

let scriptCache = null;
export function appScript(file, { SITE_URL }) {
  const site = SITE_URL.replace(/\/$/, '');
  const mtime = fs.statSync(file).mtimeMs;
  if (scriptCache && scriptCache.file === file && scriptCache.mtime === mtime && scriptCache.site === site) return scriptCache;
  const raw = fs.readFileSync(file, 'utf8').replaceAll('https://fruitdestroy.gg', site);
  const start = raw.indexOf('<script>');
  const end = raw.lastIndexOf('</script>');
  if (start === -1 || end === -1) throw new Error('Portal HTML has no script');
  const code = raw.slice(start + '<script>'.length, end);
  const hash = crypto.createHash('sha256').update(code).digest('hex').slice(0, 12);
  scriptCache = { file, mtime, site, code, hash, path: `/static/app.${hash}.js` };
  return scriptCache;
}

export function renderPortalDocument(file, route, { SITE_URL }) {
  const site = SITE_URL.replace(/\/$/, '');
  const raw = fs.readFileSync(file, 'utf8').replaceAll('https://fruitdestroy.gg', site);
  const cat = portalCatalog(file);
  const page = route.page;
  const lang = route.lang;
  const cl = contentLang(cat, lang);
  const indexed = route.indexed;
  const canonPage = canonicalPage(page);
  const canonLang = readyLangs(cat).some(l => l.code === lang) && !route.root ? lang : 'en';
  const canonical = `${site}${pagePath(canonLang, canonPage)}`;
  const meta = metaFor(cat, lang, page);
  const title = meta.title;
  const description = cat.fitDescription(meta.description);
  const alternates = readyLangs(cat).map(l => `<link rel="alternate" hreflang="${esc(l.hreflang)}" href="${esc(site + pagePath(l.code, canonPage))}">`).join('');
  const xdefault = `${site}${pagePath('en', canonPage)}`;
  const robots = indexed ? 'index, follow, max-image-preview:large' : 'noindex, follow';
  const notice = cl === lang ? '' : `<p class="note">${esc(pick(cat, 'en', 'notTranslated').replace('{lang}', cat.langs.find(l => l.code === lang)?.label || lang))}</p>`;
  const ui = chrome(cat, lang, page);
  const seo = `<title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${esc(canonical)}">${alternates}<link rel="alternate" hreflang="x-default" href="${esc(xdefault)}"><meta name="robots" content="${robots}">${socialTags(cat, { site, lang: canonLang, page, title, description, canonical })}`;
  const contentInfo = cat.langs.find(l => l.code === cl) || cat.langs.find(l => l.code === 'en');
  const htmlLang = contentInfo?.hreflang || cl;
  const dir = contentInfo?.dir === 'rtl' ? 'rtl' : 'ltr';
  let html = raw.replace('<html lang="en">', `<html lang="${esc(htmlLang)}" dir="${dir}">`);
  html = html.replace(/<title>[\s\S]*?<\/title>\s*/, '');
  if (!GOOGLE_FONTS.test(html)) throw new Error('Portal HTML no longer links Google Fonts the expected way');
  html = html.replace(GOOGLE_FONTS, '');
  html = html.replace(/<meta name="description" content="[^"]*">\s*/, '');
  html = html.replace('</head>', () => `${seo}${fontTags(cl)}</head>`);
  html = html.replace('<header id="site-header" class="site-header"></header>', `<header id="site-header" class="site-header">${ui.header}</header>`);
  html = html.replace('<main id="main" tabindex="-1"></main>', `<main id="main" tabindex="-1">${notice}${bodyFor(cat, lang, page)}</main>`);
  html = html.replace('<footer id="site-foot" class="site-foot"></footer>', `<footer id="site-foot" class="site-foot">${ui.footer}</footer>`);
  html = html.replace(/<noscript>[\s\S]*?<\/noscript>/, '<noscript><p>Turn on JavaScript to play.</p></noscript>');
  let embedded = '';
  if (cl !== 'en' && cat.str[cl]) {
    const pack = JSON.stringify(cat.str[cl]).replace(/</g, '\\u003c');
    embedded += `<script type="application/json" id="fd-locale" data-lang="${esc(cl)}">${pack}</script>`;
  }
  const gameFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../public/i18n/games', `${cl}.json`);
  if (cl !== 'en' && cl !== 'uk' && fs.existsSync(gameFile)) {
    const pack = fs.readFileSync(gameFile, 'utf8').replace(/</g, '\\u003c');
    embedded += `<script type="application/json" id="fd-game" data-lang="${esc(cl)}">${pack}</script>`;
  }
  // Swap the inline app for the cached file. Locale packs stay inline, just before it.
  const app = appScript(file, { SITE_URL });
  const start = html.indexOf('<script>');
  const end = html.lastIndexOf('</script>');
  html = `${html.slice(0, start)}${embedded}<script src="${app.path}"></script>${html.slice(end + '</script>'.length)}`;
  html = html.replace('</head>', () => `<link rel="preload" as="script" href="${app.path}"></head>`);
  return html;
}
