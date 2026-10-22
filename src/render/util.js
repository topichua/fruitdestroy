export const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const GA_ID = 'G-3G1Q7Z4ESN';

export const googleTag = () => `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${GA_ID}');
</script>`;

export const hreflangLinks = (SITE_URL, LANGS, suffix = '/') =>
  LANGS.map(l => `<link rel="alternate" hreflang="${l.hreflang}" href="${SITE_URL}/${l.code}${suffix}">`).join('\n') +
  `\n<link rel="alternate" hreflang="x-default" href="${SITE_URL}/">`;

export const adSlot = (name, w, h, { client, format = 'auto', className = '' } = {}) => client
  ? `<div class="ad ${className}" style="max-width:${w}px;height:${h}px"><ins class="adsbygoogle" style="display:block;width:100%;height:100%" data-ad-client="${client}" data-ad-slot="${process.env['AD_SLOT_' + name.toUpperCase().replace(/-/g, '_')] || ''}" data-ad-format="${format}" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script></div>`
  : `<div class="ad ad-ph ${className}" data-ad-slot="${name}" style="max-width:${w}px;height:${h}px"><b>AD</b><span>${w} × ${h}</span><small>${name}</small></div>`;
