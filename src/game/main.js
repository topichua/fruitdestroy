import { STAGE_H, STAGE_W } from './config.js';
import { Game } from './engine.js';
import { GameView } from './view.js';

export function mount(screen, options) {
  const game = new Game();
  const view = new GameView(screen, game, options);
  game.onChange = () => view.draw();

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

  if (location.hash === '#daily') game.start('daily', 0);
  else view.draw();
}
