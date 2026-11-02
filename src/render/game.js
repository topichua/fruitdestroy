import { esc, favicon, googleTag, hreflangLinks, i18nScript, adsenseTag, adsterraSlot, adsterraHead, adsterraScript } from './util.js';

export function renderGame({ SITE_URL, ADSENSE_CLIENT, LANGS, lang, s, embed = false, portal = '' }) {
  const locale = LANGS.find(l => l.code === lang);
  const url = `${SITE_URL}/${lang}/${embed ? 'embed' : 'play'}/`;
  return `<!doctype html>
<html lang="${locale.hreflang}">
<head>
${googleTag(portal)}
${adsenseTag(ADSENSE_CLIENT)}
${favicon()}
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(embed ? 'Fruit Destroy' : s.playTitle)}</title>
<meta name="description" content="${esc(s.metaDescription)}">
<meta name="theme-color" content="#0e0c22">
${embed ? `<meta name="robots" content="noindex, nofollow">\n<link rel="canonical" href="${SITE_URL}/${lang}/play/">` : `<link rel="canonical" href="${url}">\n${hreflangLinks(SITE_URL, LANGS, '/play/')}`}
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(s.playTitle)}">
<meta property="og:description" content="${esc(s.metaDescription)}">
<meta property="og:url" content="${embed ? `${SITE_URL}/${lang}/play/` : url}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bungee&family=Chakra+Petch:wght@500;600;700&display=swap">
<link rel="stylesheet" href="/game/game.css">
${embed ? '' : adsterraHead()}
</head>
<body${embed ? '' : ' class="has-ads"'}>
${embed ? '' : `<div class="ad-row ad-row--top">${adsterraSlot('h468')}</div>
<div class="stage-row">
<aside class="ad-rail ad-rail--l">${adsterraSlot('v160')}</aside>`}
<div class="stage">
  <div class="stage-scale" id="scale">
    <div class="layout is-ads-off">
      <main id="screen" class="cabinet"></main>
    </div>
  </div>
</div>
${embed ? '' : `<aside class="ad-rail ad-rail--r">${adsterraSlot('v160')}</aside>
</div>
<div class="ad-row ad-row--bottom">${adsterraSlot('m320')}</div>`}
${i18nScript(s)}
<script type="module">
  import { mount } from '/game/main.js';
  mount(document.getElementById('screen'), { siteUrl: ${JSON.stringify(SITE_URL)}, lang: ${JSON.stringify(lang)}, embed: ${embed ? 'true' : 'false'} });
</script>
${embed ? '' : adsterraScript()}
</body>
</html>`;
}
