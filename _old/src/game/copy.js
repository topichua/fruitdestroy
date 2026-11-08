function dict() {
  if (dict.value) return dict.value;
  const node = typeof document !== 'undefined' ? document.getElementById('i18n') : null;
  try { dict.value = node ? JSON.parse(node.textContent) : {}; }
  catch { dict.value = {}; }
  return dict.value;
}

function lookup(path) {
  return String(path).split('.').reduce((node, key) => (node == null ? undefined : node[key]), dict());
}

export function tx(path, vars = {}) {
  const value = lookup(path);
  if (typeof value !== 'string') return '';
  return value.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '');
}

function group(n, rule) {
  const value = Math.abs(Number(n) || 0);
  if (rule === 'slavic') {
    const n10 = value % 10;
    const n100 = value % 100;
    if (n10 === 1 && n100 !== 11) return 'one';
    if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return 'few';
    return 'many';
  }
  return value === 1 ? 'one' : 'many';
}

export function phrase(path, n) {
  const forms = lookup(path);
  if (!forms || typeof forms === 'string') return tx(path, { n });
  const text = forms[group(n, forms.rule)] || forms.many || forms.one || '';
  return String(text).replace(/\{n\}/g, String(n));
}
