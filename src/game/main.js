import { sound } from './audio.js';
import { track } from './analytics.js';
import { Game } from './engine.js';
import { portalFrom } from './portal.js';
import { readChallenge } from './session.js';
import { GameView } from './view.js';

export function mount(screen, options) {
  const game = new Game();
  const view = new GameView(screen, game, options);
  const portal = portalFrom(new URLSearchParams(location.search).get('from')) || undefined;
  game.onChange = () => { view.draw(); fit(); };
  game.onEvent = (name, props) => {
    const referrer = name === 'game_start' || name === 'challenge_opened' ? (document.referrer || undefined) : undefined;
    track(name, { ...props, referrer, portal });
    sound.play(name, props);
  };

  const embed = !!options.embed;
  const scale = document.getElementById('scale');
  const stage = scale.closest('.stage');
  const compactQuery = window.matchMedia('(max-width: 820px)');
  if (embed) stage.classList.add('is-embed');
  const fit = () => {
    const viewport = window.visualViewport;
    const width = viewport?.width || window.innerWidth;
    const height = viewport?.height || window.innerHeight;
    if (viewport) {
      stage.style.top = `${viewport.offsetTop}px`;
      stage.style.left = `${viewport.offsetLeft}px`;
      stage.style.width = `${width}px`;
      stage.style.height = `${height}px`;
    }
    const compact = compactQuery.matches;
    stage.classList.toggle('is-compact', compact);
    if (compact) {
      scale.style.transform = 'none';
      scale.style.margin = '0';
      const boardScale = Math.min(1, (width - 8) / 840, (height - 112) / 680);
      stage.style.setProperty('--board-scale', String(boardScale));
      return;
    }
    if (embed) {
      scale.style.transform = 'none';
      scale.style.margin = '0';
      const board = stage.querySelector('.board');
      if (board) {
        const box = board.getBoundingClientRect();
        const boardScale = Math.min(box.width / 840, box.height / 680);
        stage.style.setProperty('--board-scale', String(boardScale || 1));
      }
      return;
    }
    stage.style.removeProperty('--board-scale');
    const layout = scale.firstElementChild;
    const boxW = layout.offsetWidth || 1280;
    const boxH = layout.offsetHeight || 800;
    const next = Math.min(1, (width - 24) / boxW, (height - 24) / boxH);
    scale.style.transform = `scale(${next})`;
    scale.style.margin = `${boxH * (1 - next) / -2}px ${boxW * (1 - next) / -2}px`;
  };
  fit();
  window.addEventListener('resize', fit);
  window.visualViewport?.addEventListener('resize', fit);
  window.visualViewport?.addEventListener('scroll', fit);
  compactQuery.addEventListener('change', fit);
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && game.state.screen === 'play') {
      if (game.state.help) game.patch({ help: false, paused: false });
      else game.patch({ paused: !game.state.paused });
    }
  });

  const challenge = readChallenge(location.search);
  const queryMode = new URLSearchParams(location.search).get('mode');
  const fromQuery = ['classic', 'endless', 'time', 'daily'].includes(queryMode) ? queryMode : null;
  const hashed = { '#daily': 'daily', '#endless': 'endless', '#time': 'time', '#classic': 'classic' }[location.hash];
  const requested = hashed || fromQuery;
  if (challenge) {
    game.emit('challenge_opened', { gameMode: challenge.mode, score: challenge.score, challengeId: String(challenge.seed) });
    view.brief(challenge.mode, challenge.level, {
      seed: challenge.seed,
      challenge: { score: challenge.score, mode: challenge.mode, level: challenge.level, seed: challenge.seed }
    });
  } else if (requested) view.brief(requested, requested === 'classic' ? undefined : 0);
  else view.draw();
}
