// urls are the absolute canonical addresses of pages that return 200 and are indexable.
// No lastmod: the portal has no per-page modification date.
export function sitemap({ urls }) {
  const body = urls.map(loc => `  <url>\n    <loc>${loc}</loc>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}
export const robots = ({ SITE_URL }) => `User-agent: *\nAllow: /\nDisallow: /*/c/\nDisallow: /embed\nDisallow: /*/embed\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
export const adsTxt = ({ ADSENSE_CLIENT }) => ADSENSE_CLIENT
  ? `google.com, ${ADSENSE_CLIENT.replace('ca-', '')}, DIRECT, f08c47fec0942fa0\n`
  : '# Set ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX to publish ads.txt\n';
