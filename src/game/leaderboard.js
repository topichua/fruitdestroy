import { fmt, num } from './config.js';
import { save } from './storage.js';
import { utcWeek } from './session.js';

/**
 * Global leaderboards are not available in this build.
 * There is no account server, and a score in a URL is not proof of a result.
 *
 * A future server would own the ranking:
 *   POST /v1/scores   { mode, score, seed, day }  — server replays or signs the run
 *   GET  /v1/leaderboards?period=day|week|all&mode=&limit=10
 * The response is only scores the server stored. Clients must not submit a rank.
 */
export const GLOBAL_LEADERBOARD = false;

export function localRecords() {
  const week = save.get('weekBest', { id: '', score: 0 });
  const streak = save.get('streak', { streak: 0 });
  return [
    { id: 'best', value: num(save.get('best', 0)) },
    { id: 'endless', value: fmt(save.get('endlessBest', 0)) },
    { id: 'time', value: num(save.get('timeBest', 0)) },
    { id: 'daily', value: num(save.get('dailyBest', 0)) },
    { id: 'week', value: week.id === utcWeek() ? num(week.score) : num(0) },
    { id: 'streak', n: streak.streak || 0, value: String(streak.streak || 0) }
  ];
}
