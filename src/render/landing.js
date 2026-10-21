import { esc, hreflangLinks, adSlot } from './util.js';

const CRITTERS = [['🐒', '🍌', 3], ['🐭', '🍓', 4], ['🦛', '🍉', 5], ['🦎', '🍅', 6], ['🐰', '🥕', 7]];
const STEP_ICONS = ['👆', '🔥', '🐒'];
const MODE_ICONS = ['🗺️', '♾️', '📅'];
const MODE_CLASS = ['', 'mode-cyan', 'mode-pink'];
const PREVIEW = [[8,30,'🍓',-10,'sel'],[24,52,'🍋',8],[6,62,'🍉',-6],[38,30,'🍇',4],[40,62,'🍓',12],[72,48,'🫐',-8],[84,22,'🍊',6],[86,62,'🍌',-12,'target'],[20,10,'🍑',10],[56,62,'🍊',-4],[70,8,'🍒',8],[30,82,'🍍',-8]];

export function renderLanding({ SITE_URL, ADSENSE_CLIENT, LANGS, lang, s }) {
  const L = LANGS.find(l => l.code === lang);
  const url = `${SITE_URL}/${lang}/`;
  const play = `/${lang}/play/`;
  const ad = (n, w, h, o = {}) => adSlot(n, w, h, { client: ADSENSE_CLIENT, ...o });
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'VideoGame', name: 'Fruit Destroy', url, description: s.metaDescription, genre: ['Arcade', 'Puzzle', 'Casual'], gamePlatform: ['Web browser', 'Mobile', 'Desktop'], inLanguage: L.hreflang, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, image: `${SITE_URL}/static/og/${lang}-1200x630.png` },
      { '@type': 'FAQPage', mainEntity: s.faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }
    ]
  };
  return `<!doctype html>
<html lang="${L.hreflang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(s.htmlTitle)}</title>
<meta name="description" content="${esc(s.metaDescription)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#0e0c22">
<link rel="canonical" href="${url}">
${hreflangLinks(SITE_URL, LANGS.map(l => ({ ...l, code: l.code })), '/')}
<meta property="og:type" content="website">
<meta property="og:site_name" content="Fruit Destroy">
<meta property="og:title" content="${esc(s.ogTitle)}">
<meta property="og:description" content="${esc(s.ogDescription)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE_URL}/static/og/${lang}-1200x630.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="${L.og}">
${LANGS.filter(l => l.code !== lang).map(l => `<meta property="og:locale:alternate" content="${l.og}">`).join('\n')}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(s.ogTitle)}">
<meta name="twitter:description" content="${esc(s.ogDescription)}">
<meta name="twitter:image" content="${SITE_URL}/static/og/${lang}-1200x630.png">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bungee&family=Chakra+Petch:wght@500;600;700&display=swap">
<link rel="stylesheet" href="/static/site.css">
${ADSENSE_CLIENT ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}" crossorigin="anonymous"></script>` : ''}
</head>
<body>
<header class="top">
  <nav class="wrap nav">
    <a class="brand" href="${url}">Fruit Destroy!</a>
    <div class="nav-links">
      <a href="#how">${esc(s.nav.how)}</a><a href="#critters">${esc(s.nav.critters)}</a><a href="#modes">${esc(s.nav.modes)}</a><a href="#faq">${esc(s.nav.faq)}</a>
    </div>
    <a class="btn btn-sm" href="${play}">${esc(s.nav.play)}</a>
  </nav>
</header>

<div class="wrap center pad-t">${ad('top-leaderboard', 728, 90, { format: 'horizontal' })}</div>
<div class="rail rail-l">${ad('rail-left', 160, 600, { format: 'vertical' })}</div>
<div class="rail rail-r">${ad('rail-right', 160, 600, { format: 'vertical' })}</div>

<main>
<section class="wrap hero">
  <div class="hero-copy">
    <span class="pill">${esc(s.badge)}</span>
    <h1>${esc(s.h1a)} <span>${esc(s.h1b)}</span></h1>
    <p class="lead">${esc(s.lead)}</p>
    <div class="row">
      <a class="btn btn-lg" href="${play}">${esc(s.playNow)}</a>
      <a class="link-cyan" href="${play}#daily">${esc(s.daily)}</a>
    </div>
  </div>
  <div class="preview" aria-hidden="true">
    ${PREVIEW.map(([l, t, e, r, k]) => `<span class="tile${k ? ' ' + k : ''}" style="left:${l}%;top:${t}%;transform:rotate(${r}deg)${k === 'sel' ? ' scale(1.12)' : ''}">${e}</span>`).join('')}
    <span class="pv-monkey">🐒<i>🍌</i></span>
    <span class="pv-basket">🧺</span>
    <span class="pv-combo">🔥 ×1.5</span>
  </div>
</section>

<section id="how" class="wrap sec">
  <h2>${esc(s.howTitle)}</h2>
  <ol class="grid g260">
    ${s.steps.map((st, i) => `<li class="card"><div class="row"><span class="num">${i + 1}</span><span class="ico">${STEP_ICONS[i]}</span></div><h3>${esc(st.title)}</h3><p>${esc(st.body)}</p></li>`).join('')}
  </ol>
</section>

<div class="wrap center">${ad('in-content-rect', 336, 280, { format: 'rectangle' })}</div>

<section id="critters" class="wrap sec">
  <h2>${esc(s.crittersTitle)}</h2>
  <p class="sub">${esc(s.crittersLead)}</p>
  <div class="grid g190">
    ${CRITTERS.map(([e, f, n], i) => `<div class="card card-pink"><div class="crit">${e}<span>→</span><b>${f}</b></div><h3>${esc(s.critterNames[i])}</h3><small>${esc(s.fromLevel.replace('{n}', n))}</small></div>`).join('')}
  </div>
</section>

<div class="wrap center">${ad('mid-leaderboard', 728, 90, { format: 'horizontal' })}</div>

<section id="modes" class="wrap sec">
  <h2>${esc(s.modesTitle)}</h2>
  <div class="grid g300">
    ${s.modes.map((m, i) => `<a class="card mode ${MODE_CLASS[i]}" href="${play}"><span class="ico">${MODE_ICONS[i]}</span><h3>${esc(m.title)}</h3><p>${esc(m.body)}</p><span class="link-cyan">${esc(s.playMode.replace('{m}', m.title))}</span></a>`).join('')}
  </div>
</section>

<section id="faq" class="wrap sec faq">
  <div class="faq-list">
    <h2>${esc(s.faqTitle)}</h2>
    ${s.faq.map(f => `<details class="card"><summary>${esc(f.q)}<span>+</span></summary><p>${esc(f.a)}</p></details>`).join('')}
  </div>
  <aside class="faq-ad">${ad('faq-sidebar', 300, 250, { format: 'rectangle' })}</aside>
</section>

<section class="wrap sec">
  <div class="cta">
    <div><h2>${esc(s.ctaTitle)}</h2><p>${esc(s.ctaLead)}</p></div>
    <a class="btn btn-lg" href="${play}">${esc(s.ctaBtn)}</a>
  </div>
</section>
</main>

<div class="wrap center pad-b">${ad('bottom-leaderboard', 970, 90, { format: 'horizontal' })}</div>
<div class="anchor">${ad('mobile-anchor', 320, 50, { format: 'horizontal' })}</div>

<footer class="foot">
  <div class="wrap foot-row">
    <span class="brand">Fruit Destroy!</span>
    <nav aria-label="Language" class="langs">
      ${LANGS.map(l => `<a href="/${l.code}/" hreflang="${l.hreflang}" lang="${l.hreflang}"${l.code === lang ? ' aria-current="page"' : ''}>${l.label}</a>`).join('')}
    </nav>
    <div class="legal"><a href="/${lang}/privacy/">${esc(s.privacy)}</a><a href="/${lang}/terms/">${esc(s.terms)}</a></div>
  </div>
</footer>
</body>
</html>`;
}
