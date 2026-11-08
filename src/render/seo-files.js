// The v5 portal is one document. Language and activity live in the hash
// (#en, #uk-fruit-destroy), so /en/…/ and /uk/…/ are not separate pages.
export function sitemap({ SITE_URL }) {
  const today = new Date().toISOString().slice(0, 10);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${SITE_URL}/</loc>\n    <lastmod>${today}</lastmod>\n  </url>\n</urlset>\n`;
}
export const robots = ({ SITE_URL }) => `User-agent: *\nAllow: /\nDisallow: /*/c/\nDisallow: /embed\nDisallow: /*/embed\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
export const adsTxt = ({ ADSENSE_CLIENT }) => ADSENSE_CLIENT
  ? `google.com, ${ADSENSE_CLIENT.replace('ca-', '')}, DIRECT, f08c47fec0942fa0\n`
  : '# Set ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXXXXXX to publish ads.txt\n';
