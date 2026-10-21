export const FRUITS = [
  ['🍎', '--color-accent-200'], ['🍌', '--color-accent-100'], ['🍓', '--color-accent-300'], ['🍊', '--color-accent-200'],
  ['🍉', '--color-accent-2-200'], ['🍒', '--color-accent-300'], ['🍋', '--color-accent-2-100'], ['🥝', '--color-accent-2-300'],
  ['🍍', '--color-accent-100'], ['🍑', '--color-accent-200'], ['🍇', '--color-neutral-200'], ['🫐', '--color-neutral-300'],
  ['🍅', '--color-accent-300'], ['🥕', '--color-accent-200']
];

export const ANIMALS = [
  { e: '🐒', name: 'Monkey', food: 1, from: 3, speed: 10 },
  { e: '🐭', name: 'Mouse', food: 2, from: 4, speed: 13 },
  { e: '🦛', name: 'Hippo', food: 4, from: 5, speed: 6 },
  { e: '🦎', name: 'Lizard', food: 12, from: 6, speed: 11 },
  { e: '🐰', name: 'Bunny', food: 13, from: 7, speed: 12 }
];

export const GONE = new Set(['pop', 'fly', 'eaten']);

export const COLS = 9;
export const ROWS = 7;
export const BW = 840;
export const BH = 680;
export const TILE = 76;
export const CAP = 40;
export const CW = BW / COLS;
export const CH = BH / ROWS;
export const STAGE_W = 1648;
export const STAGE_H = 910;

export const COMBO = [[8, 3], [5, 2], [3, 1.5], [2, 1.2]];

export const RULES = {
  animalsFrom: 3,
  boardBg: 'auto',
  fruitTile: 'circle',
  density: 16,
  timer: 60,
  comboWindow: 3
};

export const LIGHT_THEMES = new Set(['jungle', 'forest', 'desert']);

export function rng(seed) {
  return () => {
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export const fmt = s => {
  s = Math.max(0, Math.ceil(s));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export const num = n => Math.round(n).toLocaleString('en-US');

export const multFor = c => (COMBO.find(([n]) => c >= n) || [0, 1])[1];
