import { sound } from './audio.js';
import { track } from './analytics.js';
import { STAGE_H, STAGE_W } from './config.js';
import { Game } from './engine.js';
import { readChallenge } from './session.js';
import { GameView } from './view.js';

export function mount(screen, options) {
  const game = new Game();
  const view = new GameView(screen, game, options);
  game.onChange = () => view.draw();
  game.onEvent = (name, props) => {
    const referrer = name === 'game_start' || name === 'challenge_opened' ? (document.referrer || undefined) : undefined;
    track(name, { ...props, referrer });
    sound.play(name, props);
  };

  const scale = document.getElementById('scale');
  const fit = () => {
    const next = Math.min(1, (window.innerWidth - 32) / STAGE_W, (window.innerHeight - 32) / STAGE_H);
    scale.style.transform = `scale(${next})`;
  };
  fit();
  window.addEventListener('resize', fit);
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && game.state.screen === 'play') {
      game.patch({ paused: !game.state.paused });
    }
  });

  const challenge = readChallenge(location.search);
  const hashed = { '#daily': 'daily', '#endless': 'endless', '#time': 'time', '#classic': 'classic' }[location.hash];
  if (challenge) {
    game.emit('challenge_opened', { gameMode: challenge.mode, score: challenge.score, challengeId: String(challenge.seed) });
    game.start(challenge.mode, challenge.level, {
      seed: challenge.seed,
      challenge: { score: challenge.score, mode: challenge.mode, level: challenge.level, seed: challenge.seed }
    });
  } else if (hashed) game.start(hashed, hashed === 'classic' ? undefined : 0);
  else view.draw();
}
