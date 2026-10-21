import fs from 'node:fs';
const load = f => JSON.parse(fs.readFileSync(new URL(`./${f}.json`, import.meta.url), 'utf8'));
const [en, uk, pl, de, es, fr, ptBR, tr] = ['en', 'uk', 'pl', 'de', 'es', 'fr', 'pt-br', 'tr'].map(load);

// code = URL segment; hreflang = BCP-47; og = Open Graph locale
export const LANGS = [
  { code: 'en', hreflang: 'en', og: 'en_US', label: 'English' },
  { code: 'uk', hreflang: 'uk', og: 'uk_UA', label: 'Українська' },
  { code: 'pl', hreflang: 'pl', og: 'pl_PL', label: 'Polski' },
  { code: 'de', hreflang: 'de', og: 'de_DE', label: 'Deutsch' },
  { code: 'es', hreflang: 'es', og: 'es_ES', label: 'Español' },
  { code: 'fr', hreflang: 'fr', og: 'fr_FR', label: 'Français' },
  { code: 'pt-br', hreflang: 'pt-BR', og: 'pt_BR', label: 'Português' },
  { code: 'tr', hreflang: 'tr', og: 'tr_TR', label: 'Türkçe' }
];
export const DEFAULT_LANG = 'en';
const DICT = { en, uk, pl, de, es, fr, 'pt-br': ptBR, tr };

const merge = (base, over) => {
  if (Array.isArray(base)) return base.map((b, i) => merge(b, over?.[i]));
  if (base && typeof base === 'object') return Object.fromEntries(Object.keys(base).map(k => [k, merge(base[k], over?.[k])]));
  return over ?? base;
};
const cache = {};
export const t = lang => (cache[lang] ??= merge(en, DICT[lang] || {}));
