const memory = new Map();

function store() {
  try {
    if (typeof localStorage !== 'undefined') return localStorage;
  } catch { /* private mode */ }
  return null;
}

export const save = {
  get(key, fallback) {
    try {
      const box = store();
      const raw = box ? box.getItem('fruitrush.' + key) : memory.get(key);
      if (raw == null) return fallback;
      const value = JSON.parse(raw);
      return value ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    const raw = JSON.stringify(value);
    try {
      const box = store();
      if (box) box.setItem('fruitrush.' + key, raw);
      else memory.set(key, raw);
    } catch { /* quota */ }
  }
};
