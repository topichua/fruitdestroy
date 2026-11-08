import fs from 'node:fs';
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

function bodyFor(cat, lang, page) {
  if (page === 'home') return homeBody(cat, lang);
  if (page === 'activities' || page.startsWith('activities-')) return catalogBody(cat, lang, page);
  return activityBody(cat, lang, page);
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
  const { title, description } = metaFor(cat, lang, page);
  const alternates = readyLangs(cat).map(l => `<link rel="alternate" hreflang="${esc(l.hreflang)}" href="${esc(site + pagePath(l.code, canonPage))}">`).join('');
  const xdefault = `${site}${pagePath('en', canonPage)}`;
  const robots = indexed ? 'index, follow, max-image-preview:large' : 'noindex, follow';
  const notice = cl === lang ? '' : `<p class="note">${esc(pick(cat, 'en', 'notTranslated').replace('{lang}', cat.langs.find(l => l.code === lang)?.label || lang))}</p>`;
  const ui = chrome(cat, lang, page);
  const seo = `<title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${esc(canonical)}">${alternates}<link rel="alternate" hreflang="x-default" href="${esc(xdefault)}"><meta name="robots" content="${robots}">`;
  const contentInfo = cat.langs.find(l => l.code === cl) || cat.langs.find(l => l.code === 'en');
  const htmlLang = contentInfo?.hreflang || cl;
  const dir = contentInfo?.dir === 'rtl' ? 'rtl' : 'ltr';
  let html = raw.replace('<html lang="en">', `<html lang="${esc(htmlLang)}" dir="${dir}">`);
  html = html.replace(/<title>[\s\S]*?<\/title>\s*/, '');
  html = html.replace(/<meta name="description" content="[^"]*">\s*/, '');
  html = html.replace('</head>', `${seo}</head>`);
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
  if (embedded) html = html.replace('<script>', `${embedded}<script>`);
  return html;
}
