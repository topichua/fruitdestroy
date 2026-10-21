// Injects per-language SEO head tags into the prebuilt game bundle.
import { esc, hreflangLinks } from './util.js';

export function renderGame(html, { SITE_URL, LANGS, lang, s }) {
  const url = `${SITE_URL}/${lang}/play/`;
  const head = [
    `<title>${esc(s.playTitle)}</title>`,
    `<meta name="description" content="${esc(s.metaDescription)}">`,
    `<link rel="canonical" href="${url}">`,
    hreflangLinks(SITE_URL, LANGS, '/play/'),
    `<meta property="og:title" content="${esc(s.playTitle)}">`,
    `<meta property="og:url" content="${url}">`
  ].join('\n');
  return html
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<link rel="(canonical|alternate)"[^>]*>/gi, '')
    .replace(/<meta (name="description"|property="og:(url|title)")[^>]*>/gi, '')
    .replace(/<html([^>]*)>/i, (m, a) => `<html${a.replace(/\slang="[^"]*"/, '')} lang="${lang}">`)
    .replace(/<head([^>]*)>/i, m => `${m}\n${head}`);
}
