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
import { EXTRA } from './extra.js';

const DICT = { en, uk, pl, de, es, fr, 'pt-br': ptBR, tr };

const merge = (base, over) => {
  if (Array.isArray(base) || Array.isArray(over)) {
    const list = Array.isArray(base) ? base : [];
    const extra = Array.isArray(over) ? over : [];
    const len = Math.max(list.length, extra.length);
    return Array.from({ length: len }, (_, i) => merge(list[i], extra[i]));
  }
  const baseObj = base && typeof base === 'object';
  const overObj = over && typeof over === 'object';
  if (baseObj || overObj) {
    const left = baseObj ? base : {};
    const right = overObj ? over : {};
    return Object.fromEntries([...new Set([...Object.keys(left), ...Object.keys(right)])].map(key => [key, merge(left[key], right[key])]));
  }
  return over ?? base;
};
const withEn = merge(en, EXTRA.en);
const cache = {};
export const t = lang => (cache[lang] ??= merge(merge(withEn, DICT[lang] || {}), EXTRA[lang] || {}));
