import {
  ANIMALS, BH, BW, CAP, CH, COLS, CW, FRUITS, GONE, ROWS, RULES, TILE,
  fmt, multFor, num, rng, walkerCap
} from './config.js';
import { save } from './storage.js';
import { comboCallout, daySeed, remember } from './session.js';

const basketCell = cell => Math.floor(cell / COLS) === ROWS - 1 && cell % COLS >= 3 && cell % COLS <= 5;

export class Game {
  constructor() {
    this.state = {
      screen: 'menu',
      scale: 1,
      paused: false,
      fruits: [],
      floats: [],
      sel: null,
      count: 0,
      copied: false
    };
    this.timers = new Set();
    this.uid = 1;
    this.tickId = null;
    this.countId = null;
    this.onChange = null;
    this.onEvent = null;
  }

  emit(name, props) {
    this.onEvent?.(name, props);
  }

  patch(partial) {
    Object.assign(this.state, partial);
    this.onChange?.();
  }

  later(fn, ms) {
    const id = setTimeout(() => {
      this.timers.delete(id);
      fn();
    }, ms);
    this.timers.add(id);
    return id;
  }

  clearTimers() {
    this.timers.forEach(clearTimeout);
    this.timers.clear();
    clearInterval(this.countId);
    clearInterval(this.tickId);
    if (globalThis.__frTick) clearInterval(globalThis.__frTick);
    this.tickId = null;
    globalThis.__frTick = null;
  }

  spawnPair(fruits, types) {
    const used = new Set(fruits.map(f => f.cell));
    const free = [];
    for (let cell = 0; cell < COLS * ROWS; cell++) {
      if (!used.has(cell) && !basketCell(cell)) free.push(cell);
    }
    if (free.length < 2) return fruits;
    const kinds = this.kinds || [...Array(types).keys()];
    const kind = kinds[Math.floor(this.r() * kinds.length)];
    const out = [...fruits];
    const pair = this.uid++;
    for (let n = 0; n < 2; n++) {
      const cell = free.splice(Math.floor(this.r() * free.length), 1)[0];
      out.push({
        id: this.uid++,
        k: kind,
        p: pair,
        cell,
        x: (cell % COLS) * CW + (CW - TILE) * this.r(),
        y: Math.floor(cell / COLS) * CH + (CH - TILE) * this.r(),
        rot: Math.round((this.r() - 0.5) * 24),
        st: 'idle'
      });
    }
    return out;
  }

  start(mode, level, options = {}) {
    if (mode === 'classic' && !level) level = save.get('level', 1);
    this.clearTimers();
    this.tickId = globalThis.__frTick = setInterval(() => this.tick(), 100);
    const seed = options.seed != null ? (Number(options.seed) >>> 0) : (mode === 'daily' ? daySeed() : (Date.now() >>> 0));
    this.seed = seed;
    this.r = rng(seed);
    const cfg = mode === 'endless'
      ? { types: 8, initial: 12, target: Infinity, limit: Infinity }
      : mode === 'time'
        ? { types: 6, initial: 12, target: Infinity, limit: 60 }
        : mode === 'daily'
          ? { types: 8, initial: 16, target: 18, limit: 90 }
          : { types: Math.min(4 + level, 12), initial: RULES.density, target: 10 + level, limit: RULES.timer };
    const unlockAt = RULES.animalsFrom - 3;
    const critters = mode === 'endless' || mode === 'time'
      ? ANIMALS
      : mode === 'daily'
        ? ANIMALS.slice(0, 3)
        : ANIMALS.filter(animal => level >= animal.from + unlockAt);
    this.kinds = [...Array(cfg.types).keys()];
    critters.forEach(animal => {
      if (!this.kinds.includes(animal.food)) this.kinds.push(animal.food);
      this.kinds.push(animal.food);
    });
    const fresh = critters.filter(animal => mode === 'classic' && level === animal.from + unlockAt);
    const intro = critters.length
      ? { fresh: fresh.map(animal => ({ e: animal.e, name: animal.name, fruit: FRUITS[animal.food][0] })) }
      : null;
    let fruits = [];
    for (let i = 0; i < cfg.initial / 2; i++) fruits = this.spawnPair(fruits, cfg.types);
    save.set('lastMode', mode);
    this.patch({
      screen: 'play', mode, level, paused: false, fruits, floats: [], sel: null,
      score: 0, combo: 0, lastMatch: -99, matches: 0, misses: 0, bestCombo: 0,
      elapsed: 0, spawned: cfg.initial / 2, nextSpawn: 2.4, result: null, copied: false,
      critters, animals: [], eaten: 0, shooed: 0, intro, seed, callout: null,
      challenge: options.challenge || null,
      officialDaily: mode === 'daily' && seed === daySeed(),
      nextAnimal: mode === 'endless' ? 15 : mode === 'time' ? 8 : 5,
      ...cfg
    });
    this.emit('game_start', {
      gameMode: mode,
      challengeId: options.challenge ? String(seed) : undefined,
      isNewPlayer: !save.get('played', false)
    });
    if (mode === 'daily') this.emit('daily_challenge_started', { gameMode: 'daily', challengeId: String(seed) });
  }

  ramp(elapsed, up) {
    const s = this.state;
    if (s.mode !== 'endless' && s.mode !== 'time') return;
    const types = Math.min(12, (s.mode === 'time' ? 6 : 8) + Math.floor(elapsed / 20));
    if (types <= s.types) return;
    for (let kind = 0; kind < types; kind++) if (!this.kinds.includes(kind)) this.kinds.push(kind);
    up.types = types;
  }

  tap(id) {
    const s = this.state;
    if (s.screen !== 'play' || s.paused) return;
    const fruit = s.fruits.find(item => item.id === id);
    if (!fruit || GONE.has(fruit.st)) return;
    const selected = s.fruits.find(item => item.id === s.sel && !GONE.has(item.st));
    if (s.sel == null || !selected) {
      this.patch({
        sel: id,
        fruits: s.fruits.map(item => item.id === id ? { ...item, st: 'sel' } : item.st === 'sel' ? { ...item, st: 'idle' } : item)
      });
      return;
    }
    if (s.sel === id) {
      this.patch({ sel: null, fruits: s.fruits.map(item => item.id === id ? { ...item, st: 'idle' } : item) });
      return;
    }
    if (selected.k === fruit.k) {
      const ids = [selected.id, fruit.id];
      const gap = s.elapsed - s.lastMatch;
      const combo = gap <= RULES.comboWindow ? s.combo + 1 : 1;
      const mult = multFor(combo);
      const pts = Math.round((100 + Math.max(0, Math.round(60 - gap * 20))) * mult);
      let fruits = s.fruits.map(item => ids.includes(item.id) ? { ...item, st: 'fly' } : item);
      let spawned = s.spawned;
      if (s.mode !== 'endless' && s.mode !== 'time' && spawned < s.target) {
        fruits = this.spawnPair(fruits, s.types);
        spawned++;
      }
      const floater = { id: this.uid++, x: fruit.x, y: fruit.y, text: `+${pts}${mult > 1 ? ' ×' + mult : ''}`, combo };
      const matches = s.matches + 1;
      const callout = comboCallout(combo);
      const crossed = callout && comboCallout(combo - 1) !== callout;
      this.patch({
        sel: null, fruits, spawned, score: s.score + pts, combo, lastMatch: s.elapsed, matches,
        bestCombo: Math.max(s.bestCombo, combo), floats: [...s.floats, floater],
        callout: crossed ? { n: this.uid++, text: callout, combo } : (combo >= 2 ? s.callout : null),
        shake: crossed && combo >= 5
      });
      this.emit('match', { gameMode: s.mode, combo, score: pts });
      if (crossed) this.emit('combo_achieved', { gameMode: s.mode, combo, callout });
      this.later(() => this.patch({ fruits: this.state.fruits.filter(item => !ids.includes(item.id)) }), 480);
      this.later(() => this.patch({ floats: this.state.floats.filter(item => item.id !== floater.id) }), 900);
      if (s.mode !== 'endless' && matches >= s.target) this.later(() => this.finish(true), 450);
      return;
    }
    const ids = [selected.id, fruit.id];
    this.patch({
      sel: null,
      combo: 0,
      callout: null,
      misses: s.misses + 1,
      fruits: s.fruits.map(item => ids.includes(item.id) ? { ...item, st: 'bad' } : item)
    });
    this.emit('miss', { gameMode: s.mode });
    this.later(() => this.patch({
      fruits: this.state.fruits.map(item => ids.includes(item.id) && item.st === 'bad' ? { ...item, st: 'idle' } : item)
    }), 380);
  }

  tick() {
    const s = this.state;
    if (s.screen !== 'play' || s.paused || s.result) return;
    const elapsed = +(s.elapsed + 0.1).toFixed(1);
    const up = { elapsed };
    if (s.combo > 0 && elapsed - s.lastMatch > RULES.comboWindow) {
      up.combo = 0;
      up.callout = null;
    }
    this.ramp(elapsed, up);
    this.stepAnimals(s, elapsed, up);
    const flooding = s.mode === 'endless' || s.mode === 'time';
    if (flooding && elapsed >= s.nextSpawn) {
      up.fruits = this.spawnPair(up.fruits || s.fruits, up.types || s.types);
      up.nextSpawn = elapsed + this.interval(elapsed);
    }
    const live = (up.fruits || s.fruits).filter(item => !GONE.has(item.st)).length;
    this.patch(up);
    if (flooding && live >= CAP) this.finish(false);
    else if (s.mode !== 'endless' && elapsed >= s.limit) this.finish(s.mode === 'time');
  }

  stepAnimals(s, elapsed, up) {
    if (!s.critters || !s.critters.length) return;
    let fruits = s.fruits;
    let animals = s.animals.map(animal => ({ ...animal }));
    let floats = s.floats;
    let score = s.score;
    let eaten = s.eaten;
    let sel = s.sel;
    const alive = fruit => fruit && !GONE.has(fruit.st);
    if (elapsed >= s.nextAnimal) {
      const cap = s.mode === 'endless' || s.mode === 'time'
        ? Math.min(5, 2 + Math.floor(elapsed / 25))
        : walkerCap(s.mode, s.level);
      if (animals.filter(animal => animal.ph === 'walk').length < cap) {
        const taken = new Set(animals.map(animal => animal.tid));
        const options = s.critters.filter(animal => fruits.some(fruit => fruit.k === animal.food && alive(fruit) && !taken.has(fruit.id)));
        if (options.length) {
          const animal = options[Math.floor(this.r() * options.length)];
          const left = this.r() < 0.5;
          animals.push({
            id: this.uid++,
            a: ANIMALS.indexOf(animal),
            x: left ? -80 : BW + 10,
            y: 40 + this.r() * (BH - 260),
            ph: 'walk',
            tid: null,
            dir: left ? 1 : -1
          });
        }
      }
      const gap = s.mode === 'classic'
        ? Math.max(4, 11 - s.level * 0.4)
        : s.mode === 'daily'
          ? 6
          : Math.max(3.2, 6 - elapsed * 0.04);
      up.nextAnimal = elapsed + gap;
    }
    animals = animals.filter(animal => {
      const kind = ANIMALS[animal.a];
      if (animal.ph === 'walk') {
        let target = fruits.find(fruit => fruit.id === animal.tid);
        if (!alive(target)) {
          const taken = new Set(animals.filter(other => other !== animal).map(other => other.tid));
          target = fruits
            .filter(fruit => fruit.k === kind.food && alive(fruit) && !taken.has(fruit.id))
            .sort((a, b) => Math.hypot(a.x - animal.x, a.y - animal.y) - Math.hypot(b.x - animal.x, b.y - animal.y))[0];
          animal.tid = target ? target.id : null;
        }
        if (!target) {
          animal.ph = 'flee';
          return true;
        }
        const dx = target.x - animal.x;
        const dy = target.y - animal.y;
        const distance = Math.hypot(dx, dy);
        if (distance > kind.speed) {
          animal.x += dx / distance * kind.speed;
          animal.y += dy / distance * kind.speed;
          animal.dir = dx > 0 ? 1 : -1;
          return true;
        }
        animal.x = target.x;
        animal.y = target.y;
        animal.ph = 'eat';
        animal.t = elapsed;
        const ids = fruits.filter(fruit => fruit.p === target.p && alive(fruit)).map(fruit => fruit.id);
        fruits = fruits.map(fruit => ids.includes(fruit.id) ? { ...fruit, st: 'eaten' } : fruit);
        if (ids.includes(sel)) sel = null;
        if (s.mode !== 'endless' && s.mode !== 'time') fruits = this.spawnPair(fruits, s.types);
        eaten++;
        score = Math.max(0, score - 50);
        const floater = { id: this.uid++, x: target.x, y: target.y, bad: true, key: 'ate', vars: { emoji: kind.e, fruit: FRUITS[kind.food][0] }, text: `${kind.e} ate ${FRUITS[kind.food][0]} −50` };
        floats = [...floats, floater];
        this.later(() => this.patch({ fruits: this.state.fruits.filter(fruit => !ids.includes(fruit.id)) }), 420);
        this.later(() => this.patch({ floats: this.state.floats.filter(item => item.id !== floater.id) }), 1300);
      } else if (animal.ph === 'eat') {
        if (elapsed - animal.t >= 0.9) animal.ph = 'flee';
      } else {
        if (animal.fx == null) animal.fx = animal.x < BW / 2 ? -1 : 1;
        animal.dir = animal.fx;
        animal.x += animal.fx * 30;
        if (animal.x < -120 || animal.x > BW + 40) return false;
      }
      return true;
    });
    Object.assign(up, { fruits, animals, floats, score, eaten, sel });
  }

  shoo(id) {
    const s = this.state;
    if (s.screen !== 'play' || s.paused) return;
    const animal = s.animals.find(item => item.id === id);
    if (!animal || animal.ph !== 'walk') return;
    const floater = { id: this.uid++, x: animal.x, y: animal.y, key: 'shoo', text: 'Shoo! +50' };
    this.patch({
      animals: s.animals.map(item => item.id === id ? { ...item, ph: 'flee' } : item),
      score: s.score + 50,
      shooed: s.shooed + 1,
      floats: [...s.floats, floater]
    });
    this.later(() => this.patch({ floats: this.state.floats.filter(item => item.id !== floater.id) }), 900);
    this.emit('shoo', { gameMode: s.mode });
  }

  interval(t) {
    return Math.max(0.8, 2.4 - t * 0.012);
  }

  stopLoop() {
    clearInterval(this.tickId);
    this.tickId = null;
    globalThis.__frTick = null;
  }

  finish(win) {
    const s = this.state;
    if (s.result) return;
    this.stopLoop();
    const acc = s.matches + s.misses ? Math.round(s.matches / (s.matches + s.misses) * 100) : 100;
    const best = save.get('best', 0);
    const newBest = s.score > best;
    if (newBest) save.set('best', s.score);
    let result;
    if (s.mode === 'endless') {
      const endlessBest = save.get('endlessBest', 0);
      const record = s.elapsed > endlessBest;
      if (record) save.set('endlessBest', s.elapsed);
      result = {
        win: false,
        kicker: 'GAME OVER · BOARD 100% FULL',
        title: 'Fruit avalanche!',
        note: record ? 'New survival record!' : `${fmt(endlessBest - s.elapsed)} off your best survival of ${fmt(endlessBest)}.`,
        newBest: newBest || record,
        kind: 'endless',
        record,
        vars: { gap: fmt(Math.max(0, endlessBest - s.elapsed)), best: fmt(endlessBest) },
        stats: [{ v: fmt(s.elapsed), k: 'survived' }, { v: `${acc}%`, k: 'accuracy' }, { v: `${s.bestCombo}`, k: 'bestCombo' }],
        retryPrimary: true
      };
    } else if (s.mode === 'time') {
      const timeBest = save.get('timeBest', 0);
      const record = s.score > timeBest;
      result = {
        win: !!win,
        kicker: 'TIME ATTACK · 60 SECONDS',
        title: win ? "Time's up!" : 'Board full!',
        note: record ? 'New time-attack record!' : `Time-attack best: ${num(timeBest)}.`,
        newBest: newBest || record,
        kind: 'time',
        record,
        vars: { best: num(timeBest) },
        stats: [{ v: num(s.score), k: 'score' }, { v: `${acc}%`, k: 'accuracy' }, { v: `${s.bestCombo} ×${multFor(s.bestCombo)}`, k: 'bestCombo' }],
        retryPrimary: true
      };
    } else if (win) {
      const used = s.elapsed / s.limit;
      const stars = used <= 0.5 ? 3 : used <= 0.75 ? 2 : 1;
      if (s.mode === 'classic') save.set('level', Math.max(save.get('level', 1), s.level + 1));
      result = {
        win: true,
        stars,
        kicker: s.mode === 'daily' ? 'DAILY · CHERRY CHAOS' : `LEVEL ${s.level}`,
        title: 'Cleared!',
        note: stars < 3
          ? `Finish under ${fmt(s.limit * (stars === 2 ? 0.5 : 0.75))} for ${stars === 2 ? 'the third star' : 'another star'}.`
          : 'Perfect peel. Three stars.',
        newBest,
        canNext: s.mode === 'classic',
        kind: 'clear',
        vars: { time: fmt(s.limit * (stars === 2 ? 0.5 : 0.75)), star: stars === 2 ? 'third' : 'another' },
        stats: [{ v: `${acc}%`, k: 'accuracy' }, { v: `${s.bestCombo} ×${multFor(s.bestCombo)}`, k: 'bestCombo' }, { v: fmt(s.elapsed), k: 'time' }],
        retryPrimary: s.mode !== 'classic'
      };
    } else {
      result = {
        win: false,
        kicker: s.mode === 'daily' ? 'DAILY · CHERRY CHAOS' : `LEVEL ${s.level}`,
        title: "Time's up!",
        note: `${s.target - s.matches} pairs short. Chain combos to move faster.`,
        newBest,
        kind: 'timeout',
        vars: { short: s.target - s.matches },
        stats: [{ v: `${s.matches}/${s.target}`, k: 'pairs' }, { v: `${acc}%`, k: 'accuracy' }, { v: `${s.bestCombo}`, k: 'bestCombo' }],
        retryPrimary: true
      };
    }
    const isNewPlayer = !save.get('played', false);
    const memory = remember({ ...s, win: !!win });
    if (s.challenge) result.versus = { target: s.challenge.score, beat: s.score > s.challenge.score, tie: s.score === s.challenge.score };
    result.personalBest = save.get('best', 0);
    result.unlocked = memory.unlocked;
    result.streak = memory.streak;
    this.emit('game_over', {
      gameMode: s.mode,
      score: s.score,
      durationSeconds: s.elapsed,
      challengeId: s.challenge ? String(s.seed) : undefined,
      isNewPlayer,
      win: !!win,
      combo: s.bestCombo
    });
    if (newBest) this.emit('personal_best', { gameMode: s.mode, score: s.score, durationSeconds: s.elapsed });
    if (s.mode === 'daily' && win && s.officialDaily) this.emit('daily_challenge_completed', { gameMode: 'daily', score: s.score, durationSeconds: s.elapsed });
    if (s.challenge) this.emit('challenge_completed', { gameMode: s.mode, score: s.score, challengeId: String(s.seed) });
    for (const item of memory.unlocked) this.emit('achievement_unlocked', { id: item.id, gameMode: s.mode });
    this.patch({ screen: 'result', result, paused: false, count: 0 });
    const target = s.score;
    const started = performance.now();
    clearInterval(this.countId);
    this.countId = setInterval(() => {
      const p = Math.min(1, (performance.now() - started) / 900);
      this.patch({ count: target * (1 - Math.pow(1 - p, 3)) });
      if (p >= 1) clearInterval(this.countId);
    }, 30);
  }

  toMenu() {
    clearInterval(this.countId);
    this.stopLoop();
    this.patch({ screen: 'menu', paused: false });
  }
}
