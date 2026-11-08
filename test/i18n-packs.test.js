import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { portalCatalog } from '../src/render/portal-catalog.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const en = JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/en.json'), 'utf8'));
const keep = new Set(JSON.parse(fs.readFileSync(path.join(root, 'src/i18n/keep-english-keys.json'), 'utf8')));
const codes = [
  'es', 'pt', 'pl', 'cs', 'hr', 'lt', 'lv', 'de', 'fi', 'nb', 'sv', 'da', 'fr', 'it', 'ru', 'kk',
  'zh', 'ko', 'ja', 'ar', 'he', 'tr', 'id', 'hi', 'bg', 'ar-sy', 'ro', 'el', 'sq', 'cnr', 'ka',
  'bn', 'ur', 'vi', 'th', 'nl', 'ms', 'fil', 'hu', 'sk'
];

function placeholders(value) {
  return (JSON.stringify(value).match(/\{[a-z]+\}/g) || []).slice().sort();
}

test('every language pack matches the English key set', () => {
  const cat = portalCatalog(path.join(root, 'public/task/index.html'));
  assert.equal(cat.langs.filter(l => l.ready).length, 42);
  for (const code of codes) {
    const file = path.join(root, 'public/i18n', `${code}.json`);
    assert.equal(fs.existsSync(file), true, code);
    const pack = JSON.parse(fs.readFileSync(file, 'utf8'));
    const keys = Object.keys(pack);
    assert.deepEqual(keys.slice().sort(), Object.keys(en).slice().sort(), code);
    assert.notEqual(JSON.stringify(pack), JSON.stringify(en), code);
    for (const key of keys) {
      const value = pack[key];
      const source = en[key];
      assert.equal(Array.isArray(value), Array.isArray(source), `${code} ${key}`);
      if (Array.isArray(value)) {
        assert.equal(value.length, source.length, `${code} ${key}`);
        if (Array.isArray(source[0])) assert.equal(value.every(row => Array.isArray(row) && row.length === 2), true, `${code} ${key}`);
      }
      assert.deepEqual(placeholders(value), placeholders(source), `${code} ${key}`);
      assert.equal((JSON.stringify(value).match(/<em>/g) || []).length, (JSON.stringify(source).match(/<em>/g) || []).length, `${code} ${key}`);
      if (keep.has(key)) assert.deepEqual(value, source, `${code} ${key}`);
    }
  }
});
