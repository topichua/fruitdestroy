import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const EXPORT_MARK = 'try { Router.go(); } catch (e) { console.error(e); document.getElementById(\'main\').innerHTML = \'<div class="wrap" style="padding-block:40px"><h1>Something went wrong</h1><p>Please reload the page.</p></div>\'; }';

let cache = null;

function portalScript(html) {
  const start = html.indexOf('<script>');
  const end = html.lastIndexOf('</script>');
  if (start === -1 || end === -1) throw new Error('Portal HTML has no script');
  const code = html.slice(start + '<script>'.length, end);
  if (!code.includes(EXPORT_MARK)) throw new Error('Portal script has no Router.go() bootstrap');
  return code.replace(
    EXPORT_MARK,
    'globalThis.__FD_EXPORT = { STR, LANGS, PAGES: PAGES.slice(), MOODS: MOODS.slice(), RELATED, activities: ACTIVITIES.map(a => ({ id: a.id, moods: a.moods.slice(), type: a.type })) };'
  );
}

export function loadPortalCatalog(html) {
  const sandbox = {
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    queueMicrotask,
    URL,
    URLSearchParams,
    navigator: { language: 'en', userAgent: 'node' },
    location: { hash: '', pathname: '/', search: '', href: 'http://localhost/', origin: 'http://localhost' },
    history: { replaceState() {}, pushState() {}, state: null },
    localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
    matchMedia() { return { matches: false, addEventListener() {} }; },
    requestAnimationFrame() { return 0; },
    cancelAnimationFrame() {},
    addEventListener() {},
    removeEventListener() {},
    document: {
      documentElement: { lang: 'en' },
      title: '',
      head: { querySelector() { return null; }, querySelectorAll() { return []; }, appendChild() {} },
      body: { appendChild() {}, classList: { add() {}, remove() {}, toggle() {} } },
      addEventListener() {},
      querySelector() { return null; },
      querySelectorAll() { return []; },
      getElementById() {
        return { innerHTML: '', hidden: true, querySelector() { return null; }, querySelectorAll() { return []; }, addEventListener() {}, appendChild() {}, classList: { add() {}, remove() {}, toggle() {} } };
      },
      createElement() { return { setAttribute() {}, style: {}, appendChild() {} }; }
    }
  };
  sandbox.window = sandbox;
  vm.createContext(sandbox);
  vm.runInContext(portalScript(html), sandbox, { filename: 'portal.html', timeout: 15000 });
  const data = sandbox.__FD_EXPORT;
  if (!data?.STR?.en || !data.activities?.length) throw new Error('Portal catalog export failed');
  return {
    str: data.STR,
    langs: data.LANGS.map(l => ({ code: l.code, label: l.label, ready: !!l.ready, hreflang: l.hreflang || l.code, dir: l.dir || 'ltr' })),
    pages: data.PAGES,
    moods: data.MOODS,
    related: data.RELATED,
    activities: data.activities
  };
}

function localeDir() {
  return path.join(path.dirname(fileURLToPath(import.meta.url)), '../../public/i18n');
}

function localeStamp() {
  const dir = localeDir();
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir).reduce((max, name) => Math.max(max, fs.statSync(path.join(dir, name)).mtimeMs), 0);
}

function mergeLocalePacks(data) {
  const dir = localeDir();
  if (!fs.existsSync(dir)) return data;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.json')) continue;
    const code = name.slice(0, -'.json'.length);
    data.str[code] = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
  }
  return data;
}

export function portalCatalog(file) {
  const mtime = fs.statSync(file).mtimeMs;
  const locales = localeStamp();
  if (cache && cache.file === file && cache.mtime === mtime && cache.locales === locales) return cache.data;
  const data = mergeLocalePacks(loadPortalCatalog(fs.readFileSync(file, 'utf8')));
  cache = { file, mtime, locales, data };
  return data;
}

export function readyLangs(cat) {
  return cat.langs.filter(l => l.ready);
}

export function isKnownLang(cat, lang) {
  return cat.langs.some(l => l.code === lang);
}

export function isKnownPage(cat, page) {
  return page === 'home' || cat.pages.includes(page);
}

export function canonicalPage(page) {
  return String(page || 'home').replace(/^fruit-destroy-(zen|quick)$/, 'fruit-destroy');
}

export function isIndexedPage(cat, lang, page) {
  if (!readyLangs(cat).some(l => l.code === lang)) return false;
  if (page !== canonicalPage(page)) return false;
  return isKnownPage(cat, page);
}

export function pagePath(lang, page) {
  return page === 'home' ? `/${lang}/` : `/${lang}/${page}/`;
}

export function indexedPaths(cat) {
  const pages = ['home', ...cat.pages.filter(p => p !== 'home' && p === canonicalPage(p))];
  const paths = [];
  for (const lang of readyLangs(cat)) {
    for (const page of pages) paths.push(pagePath(lang.code, page));
  }
  return paths;
}
