export function sitemap({ SITE_URL, LANGS }) {
  const today = new Date().toISOString().slice(0, 10);
  const alts = suffix => LANGS.map(l => `    <xhtml:link rel="alternate" hreflang="${l.hreflang}" href="${SITE_URL}/${l.code}${suffix}"/>`).join('\n') +
    `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/"/>`;
  const urls = ['/', '/play/', '/daily/', '/achievements/'].flatMap(suffix => LANGS.map(l => `  <url>\n    <loc>${SITE_URL}/${l.code}${suffix}</loc>\n    <lastmod>${today}</lastmod>\n${alts(suffix)}\n  </url>`));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
}
export const robots = ({ SITE_URL }) => `User-agent: *\nAllow: /\nDisallow: /*/c/\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
export const adsTxt = ({ ADSENSE_CLIENT }) => ADSENSE_CLIENT
  ? `google.com, ${ADSENSE_CLIENT.replace('ca-', '')}, DIRECT, f08c47fec0942fa0\n`
  : '# Set ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX to publish ads.txt\n';
