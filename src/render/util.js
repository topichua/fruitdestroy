export const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const i18nScript = copy => `<script type="application/json" id="i18n">${JSON.stringify(copy).replace(/</g, '\\u003c')}</script>`;

const GA_ID = 'G-3G1Q7Z4ESN';
export const ADSENSE_CLIENT_ID = 'ca-pub-7568002828900289';

// Flip to true to show AdSense units and the dashed placeholders.
export const ADS_ON = false;

export const favicon = () => `<link rel="icon" href="/static/favicon.png" type="image/png" sizes="48x48">
<link rel="apple-touch-icon" href="/static/favicon.png">`;

export const googleTag = (portal = '') => `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  ${portal ? `gtag('set', { portal: ${JSON.stringify(portal)} });
  gtag('config', '${GA_ID}', { campaign_source: ${JSON.stringify(portal)}, campaign_medium: 'embed' });` : `gtag('config', '${GA_ID}');`}
</script>`;

export const adsenseTag = (client = ADSENSE_CLIENT_ID) => client
  ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(client)}" crossorigin="anonymous"></script>`
  : '';

export const hreflangLinks = (SITE_URL, LANGS, suffix = '/') =>
  LANGS.map(l => `<link rel="alternate" hreflang="${l.hreflang}" href="${SITE_URL}/${l.code}${suffix}">`).join('\n') +
  `\n<link rel="alternate" hreflang="x-default" href="${SITE_URL}/">`;

export const adSlot = (name, w, h, { client, format = 'auto', className = '' } = {}) => !ADS_ON ? '' : client
  ? `<div class="ad ${className}" style="max-width:${w}px;height:${h}px"><ins class="adsbygoogle" style="display:block;width:100%;height:100%" data-ad-client="${client}" data-ad-slot="${process.env['AD_SLOT_' + name.toUpperCase().replace(/-/g, '_')] || ''}" data-ad-format="${format}" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>`
  : `<div class="ad ad-ph ${className}" data-ad-slot="${name}" style="max-width:${w}px;height:${h}px"><b>AD</b><span>${w} × ${h}</span><small>${name}</small></div>`;
