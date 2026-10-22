import { save } from './storage.js';
import { ACHIEVEMENTS, earnedIds } from './achievements.js';

const MODES = new Set(['classic', 'endless', 'daily', 'time']);

export function utcDay(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function daySeed(date = new Date()) {
  return date.getUTCFullYear() * 10000 + (date.getUTCMonth() + 1) * 100 + date.getUTCDate();
}

export function shiftDay(iso, days) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

export function msUntilNextUtcDay(now = Date.now()) {
  const date = new Date(now);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1) - now;
}

export function formatCountdown(ms) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function utcWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export function comboCallout(combo) {
  if (combo >= 8) return 'UNSTOPPABLE!';
  if (combo >= 5) return 'INCREDIBLE!';
  if (combo >= 3) return 'AMAZING!';
  if (combo >= 2) return 'GREAT!';
  return '';
}

export function nextStreak(record = {}, day) {
  const days = Array.isArray(record.days) ? record.days : [];
  if (days.includes(day)) return { last: record.last || day, streak: record.streak || 1, days };
  const streak = record.last === shiftDay(day, -1) ? (record.streak || 0) + 1 : 1;
  return { last: day, streak, days: [...days, day].slice(-366) };
}

export function playerName() {
  const existing = save.get('name', '');
  if (existing) return existing;
  const first = ['Lime', 'Mango', 'Berry', 'Peach', 'Kiwi', 'Cherry'];
  const second = ['Fox', 'Panda', 'Otter', 'Finch', 'Newt', 'Corgi'];
  const name = `${first[Math.floor(Math.random() * first.length)]} ${second[Math.floor(Math.random() * second.length)]}`;
  save.set('name', name);
  return name;
}

export function readChallenge(search) {
  const params = new URLSearchParams(search);
  if (!params.get('c') || !params.get('m')) return null;
  const mode = params.get('m');
  const seed = Number(params.get('c'));
  if (!MODES.has(mode) || !Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) return null;
  const level = Math.max(0, Math.round(Number(params.get('l')) || 0));
  const score = Math.max(0, Math.round(Number(params.get('s')) || 0));
  return {
    mode,
    level: mode === 'classic' ? Math.max(1, level) : 0,
    seed,
    score,
    officialDaily: mode === 'daily' && seed === daySeed()
  };
}

export function challengeUrl({ origin, lang = 'en', mode, level = 0, seed, score }) {
  const url = new URL(`/${lang}/play/`, origin);
  url.searchParams.set('c', String(seed >>> 0));
  url.searchParams.set('m', mode);
  url.searchParams.set('l', String(level || 0));
  url.searchParams.set('s', String(Math.max(0, Math.round(score || 0))));
  return url.toString();
}

export function shareText({ mode, score, streak, url, lines: custom }) {
  if (custom) return custom;
  const lines = [mode === 'daily' ? '🍉 Fruit Destroy Daily' : '🍉 Fruit Destroy', '', `Score: ${Math.round(score).toLocaleString('en-US')}`];
  if (mode === 'daily' && streak > 0) lines.push(`Streak: ${streak} day${streak === 1 ? '' : 's'}`);
  lines.push('', 'Can you beat me?', '', url);
  return lines.join('\n');
}

export function remember(run) {
  const profile = save.get('profile', {
    games: 0, bestCombo: 0, bestScore: 0, dailyCount: 0, beatFriend: false, perfect: false
  });
  profile.games += 1;
  profile.bestCombo = Math.max(profile.bestCombo || 0, run.bestCombo || 0);
  profile.bestScore = Math.max(profile.bestScore || 0, run.score || 0);
  if (run.win && run.mode !== 'time' && run.misses === 0 && run.matches > 0) profile.perfect = true;
  if (run.challenge && run.score > run.challenge.score) profile.beatFriend = true;

  let streak = save.get('streak', { last: '', streak: 0, days: [] });
  if (run.mode === 'daily' && run.win && run.officialDaily) {
    streak = nextStreak(streak, utcDay());
    save.set('streak', streak);
    profile.dailyCount = streak.days.length;
  }
  const weekId = utcWeek();
  const week = save.get('weekBest', { id: '', score: 0 });
  const weekScore = week.id === weekId ? week.score : 0;
  if ((run.score || 0) > weekScore) save.set('weekBest', { id: weekId, score: run.score || 0 });
  if (run.mode === 'time') save.set('timeBest', Math.max(save.get('timeBest', 0), run.score || 0));
  if (run.mode === 'daily') save.set('dailyBest', Math.max(save.get('dailyBest', 0), run.score || 0));
  save.set('lastMode', run.mode);
  const recent = save.get('recent', []);
  save.set('recent', [run.mode, ...recent.filter(mode => mode !== run.mode)].slice(0, 3));
  save.set('played', true);
  save.set('profile', profile);

  const have = save.get('achievements', {});
  const fresh = earnedIds(profile).filter(id => !have[id]);
  if (fresh.length) {
    const next = { ...have };
    for (const id of fresh) next[id] = Date.now();
    save.set('achievements', next);
  }
  return {
    streak: streak.streak || 0,
    unlocked: fresh.map(id => ACHIEVEMENTS.find(item => item.id === id)).filter(Boolean)
  };
}
