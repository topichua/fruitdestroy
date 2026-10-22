import { ACHIEVEMENTS } from '../game/achievements.js';
import { esc, favicon, googleTag, hreflangLinks, i18nScript } from './util.js';

function shell({ SITE_URL, LANGS, lang, s, path, title, description, body }) {
  const locale = LANGS.find(item => item.code === lang);
  const url = `${SITE_URL}/${lang}${path}`;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url,
    isPartOf: { '@type': 'WebSite', name: 'Fruit Destroy', url: SITE_URL }
  };
  return `<!doctype html>
<html lang="${locale.hreflang}">
<head>
${googleTag()}
${favicon()}
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${url}">
${hreflangLinks(SITE_URL, LANGS, path)}
<meta property="og:type" content="website">
<meta property="og:site_name" content="Fruit Destroy">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bungee&family=Chakra+Petch:wght@500;600;700&display=swap">
<link rel="stylesheet" href="/static/site.css">
</head>
<body>
<header class="top"><nav class="wrap nav"><a class="brand" href="/${lang}/">Fruit Destroy!</a><a class="btn btn-sm" href="/${lang}/play/">${esc(s.ui.pages.play)}</a></nav></header>
<main class="wrap sec page">${body}</main>
<footer class="foot"><div class="wrap foot-row"><a class="brand" href="/${lang}/">Fruit Destroy!</a><nav aria-label="${esc(s.language)}" class="langs">${LANGS.map(item => `<a href="/${item.code}${path}" hreflang="${item.hreflang}"${item.code === lang ? ' aria-current="page"' : ''}>${item.label}</a>`).join('')}</nav></div></footer>
${i18nScript(s)}
<script type="module" src="/game/progress.js"></script>
</body>
</html>`;
}

export function renderDaily(ctx) {
  const { lang, s } = ctx;
  return shell({
    ...ctx,
    path: '/daily/',
    title: s.dailyTitle,
    description: s.dailyDescription,
    body: `<h1>${esc(s.dailyTitle)}</h1>
<p class="lead">${esc(s.dailyDescription)}</p>
<p class="sub">${esc(s.ui.pages.nextBoardBefore)} <strong data-countdown>00:00:00</strong> ${esc(s.ui.pages.nextBoardAfter)}</p>
<p><a class="btn btn-lg" href="/${lang}/play/#daily">${esc(s.ui.pages.playToday)}</a></p>
<p class="sub">${esc(s.ui.pages.streakNote)}</p>`
  });
}

export function renderAchievements(ctx) {
  const { s } = ctx;
  const items = ACHIEVEMENTS.map(item => {
    const copy = s.ui.ach[item.id] || item;
    return `<li class="card" data-ach="${esc(item.id)}"><h2>${item.emoji} ${esc(copy.name)}</h2><p>${esc(copy.detail)}</p></li>`;
  }).join('');
  return shell({
    ...ctx,
    path: '/achievements/',
    title: s.achTitle,
    description: s.achDescription,
    body: `<h1>${esc(s.achTitle)}</h1>
<p class="lead">${esc(s.achDescription)}</p>
<ul class="grid g260 achieve-page">${items}</ul>`
  });
}
