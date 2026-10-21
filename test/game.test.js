import assert from 'node:assert/strict';
import test from 'node:test';
import { earnedIds } from '../src/game/achievements.js';
import { multFor, walkerCap } from '../src/game/config.js';
import { Game } from '../src/game/engine.js';
import { GLOBAL_LEADERBOARD } from '../src/game/leaderboard.js';
import { save } from '../src/game/storage.js';
import {
  challengeUrl, comboCallout, daySeed, msUntilNextUtcDay, nextStreak, readChallenge, shareText
} from '../src/game/session.js';

function reset() {
  save.set('best', 0);
  save.set('endlessBest', 0);
  save.set('level', 1);
  save.set('timeBest', 0);
  save.set('dailyBest', 0);
  save.set('lastMode', 'classic');
  save.set('played', false);
  save.set('profile', {});
  save.set('achievements', {});
  save.set('recent', []);
  save.set('streak', { last: '', streak: 0, days: [] });
  save.set('weekBest', { id: '', score: 0 });
}

function layout(game) {
  return game.state.fruits.map(fruit => [fruit.k, fruit.cell, fruit.x, fruit.y].join(':')).join('|');
}

function stop(game) {
  game.clearTimers();
}

test('combo words sit on top of the existing multipliers', () => {
  assert.equal(multFor(2), 1.2);
  assert.equal(multFor(3), 1.5);
  assert.equal(multFor(5), 2);
  assert.equal(multFor(8), 3);
  assert.equal(comboCallout(2), 'GREAT!');
  assert.equal(comboCallout(3), 'AMAZING!');
  assert.equal(comboCallout(5), 'INCREDIBLE!');
  assert.equal(comboCallout(8), 'UNSTOPPABLE!');
  assert.equal(comboCallout(1), '');
});

test('classic walker cap grows after level 10 and stays capped', () => {
  assert.equal(walkerCap('classic', 1), 2);
  assert.equal(walkerCap('classic', 10), 2);
  assert.equal(walkerCap('classic', 11), 3);
  assert.equal(walkerCap('classic', 19), 4);
  assert.equal(walkerCap('classic', 35), 6);
  assert.equal(walkerCap('endless', 40), 2);
  assert.equal(walkerCap('daily', 40), 2);
});

test('a UTC day has one seed', () => {
  assert.equal(daySeed(new Date('2026-10-21T00:30:00Z')), 20261021);
  assert.equal(daySeed(new Date('2026-10-21T23:59:00Z')), 20261021);
  assert.equal(daySeed(new Date('2026-10-22T00:00:00Z')), 20261022);
  const left = msUntilNextUtcDay(Date.parse('2026-10-21T23:00:00Z'));
  assert.ok(left > 0 && left <= 86400000);
});

test('two daily starts share a board, and a classic seed repeats', () => {
  reset();
  const first = new Game();
  const second = new Game();
  first.start('daily', 0);
  second.start('daily', 0);
  assert.equal(first.state.seed, second.state.seed);
  assert.equal(layout(first), layout(second));
  assert.equal(first.state.officialDaily, true);
  stop(first);
  stop(second);

  const classic = new Game();
  const again = new Game();
  classic.start('classic', 4, { seed: 12345 });
  again.start('classic', 4, { seed: 12345 });
  assert.equal(layout(classic), layout(again));
  assert.equal(classic.state.target, 14);
  stop(classic);
  stop(again);
});

test('challenge links keep a seed and a target, and reject junk', () => {
  reset();
  const before = save.get('best', 0);
  assert.equal(readChallenge('?m=classic&s=10'), null);
  assert.equal(readChallenge('?c=4&m=nope'), null);
  assert.equal(readChallenge('?c=1.5&m=classic'), null);
  const link = readChallenge('?c=99&m=classic&l=3&s=1200');
  assert.deepEqual(link, { mode: 'classic', level: 3, seed: 99, score: 1200, officialDaily: false });
  assert.equal(save.get('best', 0), before);
  const url = new URL(challengeUrl({ origin: 'https://fruitdestroy.com', lang: 'en', mode: 'daily', seed: 20261021, score: 450 }));
  assert.equal(url.pathname, '/en/play/');
  assert.equal(url.searchParams.get('c'), '20261021');
  assert.equal(url.searchParams.get('s'), '450');
  const text = shareText({ mode: 'daily', score: 12450, streak: 2, url: url.toString() });
  assert.match(text, /Score: 12,450/);
  assert.match(text, /Can you beat me\?/);
  assert.doesNotMatch(text, /Rank|Top \d|%/);
});

test('streaks continue only across calendar days', () => {
  assert.equal(nextStreak({ last: '2026-10-20', streak: 4, days: ['2026-10-20'] }, '2026-10-21').streak, 5);
  assert.equal(nextStreak({ last: '2026-10-18', streak: 4, days: ['2026-10-18'] }, '2026-10-21').streak, 1);
  const same = nextStreak({ last: '2026-10-21', streak: 2, days: ['2026-10-20', '2026-10-21'] }, '2026-10-21');
  assert.equal(same.streak, 2);
  assert.equal(same.days.length, 2);
});

test('achievements follow real thresholds', () => {
  assert.deepEqual(earnedIds({ games: 1, bestScore: 100, bestCombo: 1 }), ['first-match']);
  assert.ok(!earnedIds({ bestScore: 4999 }).includes('rising-star'));
  assert.ok(earnedIds({ bestScore: 5000 }).includes('rising-star'));
  assert.ok(!earnedIds({ bestScore: 49999 }).includes('fruit-legend'));
  assert.ok(earnedIds({ bestScore: 50000 }).includes('fruit-legend'));
  assert.ok(earnedIds({ bestCombo: 5 }).includes('combo-master'));
  assert.ok(earnedIds({ dailyCount: 3 }).includes('daily-player'));
  assert.ok(!earnedIds({ dailyCount: 2 }).includes('daily-player'));
  assert.equal(GLOBAL_LEADERBOARD, false);
});

test('a second match inside the window is a combo, and a miss clears it', () => {
  reset();
  const game = new Game();
  game.start('classic', 1, { seed: 7 });
  const pair = () => {
    const open = game.state.fruits.filter(fruit => fruit.st === 'idle' || fruit.st === 'sel');
    const first = open.find(fruit => open.some(other => other.id !== fruit.id && other.k === fruit.k && other.p === fruit.p));
    const second = open.find(fruit => fruit.id !== first.id && fruit.p === first.p);
    game.tap(first.id);
    game.tap(second.id);
  };
  pair();
  assert.equal(game.state.combo, 1);
  assert.equal(game.state.callout, null);
  pair();
  assert.equal(game.state.combo, 2);
  assert.equal(game.state.callout.text, 'GREAT!');
  const idle = game.state.fruits.filter(fruit => fruit.st === 'idle');
  const missA = idle[0];
  const missB = idle.find(fruit => fruit.k !== missA.k);
  game.tap(missA.id);
  game.tap(missB.id);
  assert.equal(game.state.combo, 0);
  assert.equal(game.state.callout, null);
  stop(game);
});

test('time attack starts as a 60 second round and does not end immediately', () => {
  reset();
  const game = new Game();
  game.start('time', 0, { seed: 3 });
  assert.equal(game.state.screen, 'play');
  assert.equal(game.state.limit, 60);
  assert.equal(game.state.target, Infinity);
  assert.equal(game.state.result, null);
  game.tick();
  assert.equal(game.state.result, null);
  assert.equal(game.state.elapsed, 0.1);
  stop(game);
});

test('finishing stores a personal best and a friend target without inventing a rank', () => {
  reset();
  const game = new Game();
  const events = [];
  game.onEvent = name => events.push(name);
  game.start('classic', 1, { seed: 11, challenge: { score: 50, mode: 'classic', level: 1, seed: 11 } });
  game.patch({ score: 80, matches: 1, misses: 0 });
  game.finish(true);
  assert.equal(save.get('best', 0), 80);
  assert.equal(game.state.result.personalBest, 80);
  assert.equal(game.state.result.newBest, true);
  assert.deepEqual(game.state.result.versus, { target: 50, beat: true, tie: false });
  assert.ok(game.state.result.unlocked.some(item => item.id === 'champion'));
  assert.ok(events.includes('personal_best'));
  assert.ok(events.includes('achievement_unlocked'));
  assert.ok(!events.includes('rank'));
  stop(game);
});
