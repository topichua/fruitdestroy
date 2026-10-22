import { ADS_ON, esc, favicon, googleTag, hreflangLinks, adSlot } from './util.js';

export function renderGame({ SITE_URL, ADSENSE_CLIENT, LANGS, lang, s }) {
  const locale = LANGS.find(l => l.code === lang);
  const url = `${SITE_URL}/${lang}/play/`;
  const ad = (name, w, h, format, className) => adSlot(name, w, h, { client: ADSENSE_CLIENT, format, className });
  return `<!doctype html>
<html lang="${locale.hreflang}">
<head>
${googleTag()}
${favicon()}
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(s.playTitle)}</title>
<meta name="description" content="${esc(s.metaDescription)}">
<meta name="theme-color" content="#0e0c22">
<link rel="canonical" href="${url}">
${hreflangLinks(SITE_URL, LANGS, '/play/')}
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(s.playTitle)}">
<meta property="og:description" content="${esc(s.metaDescription)}">
<meta property="og:url" content="${url}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bungee&family=Chakra+Petch:wght@500;600;700&display=swap">
<link rel="stylesheet" href="/game/game.css">
${ADSENSE_CLIENT ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(ADSENSE_CLIENT)}" crossorigin="anonymous"></script>` : ''}
</head>
<body>
<div class="stage">
  <div class="stage-scale" id="scale">
    <div class="layout${ADS_ON ? '' : ' is-ads-off'}">
      ${ad('play-left', 160, 600, 'vertical', 'ad-rail')}
      <main id="screen" class="cabinet"></main>
      ${ad('play-right', 160, 600, 'vertical', 'ad-rail')}
      ${ad('play-bottom', 728, 90, 'horizontal', 'ad-leader')}
    </div>
  </div>
</div>
<script type="module">
  import { mount } from '/game/main.js';
  mount(document.getElementById('screen'), { siteUrl: ${JSON.stringify(SITE_URL)}, lang: ${JSON.stringify(lang)} });
</script>
</body>
</html>`;
}
