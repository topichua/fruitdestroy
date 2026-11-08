import { ACHIEVEMENTS, achievementProgress } from './achievements.js';
import { ANIMALS, BH, BW, CAP, FRUITS, GONE, LIGHT_THEMES, RULES, TILE, fmt, multFor, num } from './config.js';
import { boardLayers, themeName } from './backgrounds.js';
import { iconHTML } from './icons.js';
import { localRecords } from './leaderboard.js';
import { save } from './storage.js';
import { challengeUrl, formatCountdown, msUntilNextUtcDay, playerName, shareText } from './session.js';
import { sound } from './audio.js';
import { phrase, tx } from './copy.js';

const MODE_IDS = ['classic', 'endless', 'time', 'daily'];
const CRITTER_INDEX = { Monkey: 0, Mouse: 1, Hippo: 2, Lizard: 3, Bunny: 4 };
const CALLOUTS = { 'GREAT!': '2', 'AMAZING!': '3', 'INCREDIBLE!': '5', 'UNSTOPPABLE!': '8' };

function applyStyle(el, style) {
  for (const [key, value] of Object.entries(style)) {
    const cssKey = key.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase());
    el.style.setProperty(cssKey, value == null ? '' : String(value));
  }
}

function fruitStyle(fruit, tile, light, targeted) {  
  const tint = FRUITS[fruit.k][1];
  const style = {
    left: `${fruit.x}px`,
    top: `${fruit.y}px`,
    fontSize: `${TILE * (tile === 'bare' ? 0.82 : 0.56)}px`,
    transform: `rotate(${fruit.rot}deg)`,
    animation: 'fr-in .32s ease-out',
    background: 'transparent',
    borderRadius: '0',
    boxShadow: 'none',
    filter: tile === 'bare' ? 'drop-shadow(0 3px 0 rgba(46,43,37,.18))' : 'none',
    opacity: '1',
    zIndex: '1',
    pointerEvents: 'auto',
    transition: 'transform .18s cubic-bezier(.3,1.6,.5,1), opacity .28s, box-shadow .18s',
    outline: 'none',
    outlineOffset: '0px'
  };
  if (tile !== 'bare') {
    const radius = tile === 'blob' ? '58% 42% 55% 45% / 48% 58% 42% 52%' : '50%';
    style.borderRadius = radius;
    if (light) {
      style.background = 'rgba(255,255,255,.88)';
      style.boxShadow = '0 4px 0 rgba(0,0,0,.12), 0 8px 16px rgba(0,0,0,.14)';
    } else {
      style.background = `var(${tint})`;
      style.boxShadow = 'inset 0 -4px 0 rgba(46,43,37,.10), var(--shadow-sm)';
    }
  }
  if (fruit.st === 'sel') {
    Object.assign(style, {
      transform: 'scale(1.14)',
      boxShadow: '0 0 0 3px var(--color-bg), 0 0 0 6px var(--color-accent), 0 0 30px var(--fr-glow)',
      zIndex: '2',
      borderRadius: tile === 'blob' ? style.borderRadius : '50%',
      background: tile === 'bare' ? 'var(--color-accent-200)' : style.background
    });
  }
  if (fruit.st === 'pop') Object.assign(style, { transform: 'scale(1.5)', opacity: '0', pointerEvents: 'none' });
  if (fruit.st === 'fly') {
    Object.assign(style, {
      left: `${BW / 2 - TILE / 2}px`,
      top: `${BH - 74}px`,
      transform: 'scale(.4) rotate(200deg)',
      opacity: '0.35',
      pointerEvents: 'none',
      zIndex: '3',
      transition: 'left .45s cubic-bezier(.4,0,.9,.6), top .45s cubic-bezier(.3,-.9,.9,.4), transform .45s, opacity .45s'
    });
  }
  if (fruit.st === 'eaten') {
    Object.assign(style, {
      transform: 'scale(0) rotate(60deg)',
      opacity: '0',
      pointerEvents: 'none',
      transition: 'transform .4s ease-in, opacity .4s'
    });
  }
  if (targeted) Object.assign(style, { outline: '4px dashed var(--color-accent)', outlineOffset: '4px' });
  if (fruit.st === 'bad') {
    Object.assign(style, {
      animation: 'fr-shake .36s',
      boxShadow: '0 0 0 4px var(--color-bg), 0 0 0 8px var(--color-neutral-700)'
    });
  }
  return style;
}

function field(root, name) {
  return root.querySelector(`[data-field="${name}"]`);
}

export class GameView {
  constructor(screen, game, { siteUrl, lang = 'en' }) {
    this.screen = screen;
    this.game = game;
    this.siteUrl = siteUrl;
    this.lang = lang;
    this.shown = null;
    this.theme = null;
    this.reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    screen.addEventListener('click', event => this.onClick(event));
    screen.addEventListener('pointerdown', () => sound.unlock(), { once: true });
  }

  t(key, vars) {
    return tx(`ui.${key}`, vars);
  }

  modeName(id) {
    return this.t(id) || id;
  }

  critterName(name) {
    const index = CRITTER_INDEX[name];
    return index == null ? name : (tx(`critterNames.${index}`) || name);
  }

  lines(key, count = 3) {
    return Array.from({ length: count }, (_, index) => this.t(`${key}.${index}`));
  }

  ruleFor(id, level) {
    const aim = id === 'classic'
      ? this.t('rules.classic.aim', { pairs: 10 + (level || 1) })
      : this.t(`rules.${id}.aim`);
    return { name: this.modeName(id), aim, points: this.lines(`rules.${id}.points`) };
  }

  introText(state) {
    const intro = state.intro;
    if (!intro) return '';
    if (typeof intro === 'string') return intro;
    if (intro.fresh?.length) {
      const list = intro.fresh.map(animal => this.t('introNewItem', {
        emoji: animal.e,
        name: this.critterName(animal.name),
        fruit: animal.fruit
      })).join(' · ');
      return this.t('introNew', { list });
    }
    const list = (state.critters || []).map(animal => `${animal.e}→${FRUITS[animal.food][0]}`).join('  ');
    return this.t('introHungry', { list });
  }

  floatText(floater) {
    if (floater.key === 'ate') return this.t('ate', floater.vars) || floater.text;
    if (floater.key === 'shoo') return this.t('shoo') || floater.text;
    return floater.text;
  }

  resultCopy(result, state) {
    const vars = result.vars || {};
    if (result.kind === 'endless') {
      return {
        kicker: this.t('results.endlessKicker'),
        title: this.t('results.endlessTitle'),
        note: result.record ? this.t('results.endlessRecord') : this.t('results.endlessNote', vars)
      };
    }
    if (result.kind === 'time') {
      return {
        kicker: this.t('results.timeKicker'),
        title: result.win ? this.t('results.timeTitle') : this.t('results.boardFullTitle'),
        note: result.record ? this.t('results.timeRecord') : this.t('results.timeNote', vars)
      };
    }
    const kicker = state.mode === 'daily'
      ? this.t('results.dailyKicker')
      : this.t('results.levelKicker', { n: state.level });
    if (result.kind === 'clear') {
      const star = this.t(vars.star === 'third' ? 'results.thirdStar' : 'results.anotherStar');
      return {
        kicker,
        title: this.t('results.cleared'),
        note: (result.stars || 0) >= 3 ? this.t('results.perfect') : this.t('results.starNote', { time: vars.time, star })
      };
    }
    if (result.kind === 'timeout') {
      return {
        kicker,
        title: this.t('results.timeTitle'),
        note: this.t('results.pairsShort', { n: vars.short })
      };
    }
    return { kicker: result.kicker || '', title: result.title || '', note: result.note || '' };
  }

  draw() {
    if (this.pending && this.game.state.screen === 'menu') {
      if (this.shown !== 'brief') {
        this.shown = 'brief';
        this.stopClock();
        this.showBrief();
      }
      return;
    }
    const { screen } = this.game.state;
    if (this.shown !== screen) {
      this.shown = screen;
      this.theme = null;
      this.stopClock();
      if (screen === 'menu') this.showMenu();
      else if (screen === 'play') this.showPlay();
      else this.showResult();
      return;
    }
    if (screen === 'play') this.patchPlay();
    else if (screen === 'result') this.patchResult();
  }

  onClick(event) {
    const button = event.target.closest('[data-action]');
    if (!button || !this.screen.contains(button)) return;
    const { action } = button.dataset;
    const game = this.game;
    const state = game.state;
    if (action === 'classic') this.pick('classic', save.get('level', 1));
    else if (action === 'endless') this.pick('endless', 0);
    else if (action === 'daily') this.pick('daily', 0);
    else if (action === 'time') this.pick('time', 0);
    else if (action === 'pause') game.patch({ paused: true });
    else if (action === 'resume') game.patch({ paused: false });
    else if (action === 'retry') this.again(false);
    else if (action === 'rematch') this.again(true);
    else if (action === 'next') game.start('classic', state.level + 1);
    else if (action === 'menu') game.toMenu();
    else if (action === 'challenge') this.share(false);
    else if (action === 'share') this.share(true);
    else if (action === 'mute') this.toggleMute(button);
    else if (action === 'records') this.showSheet('records');
    else if (action === 'achievements') this.showSheet('achievements');
    else if (action === 'rules') this.showSheet('rules');
    else if (action === 'start-mode') this.confirmBrief();
    else if (action === 'brief-back') this.cancelBrief();
    else if (action === 'help') game.patch({ help: true, paused: true });
    else if (action === 'close-help') game.patch({ help: false, paused: false });
    else if (action === 'back') this.showMenu();
  }

  pick(mode, level) {
    this.brief(mode, level);
  }

  brief(mode, level = 0, options = {}) {
    if (mode === 'classic' && !level) level = save.get('level', 1);
    this.pending = { mode, level, options };
    this.shown = '';
    this.draw();
  }

  confirmBrief() {
    const pending = this.pending;
    if (!pending) return;
    this.pending = null;
    this.game.emit('game_mode_selected', { gameMode: pending.mode });
    this.game.start(pending.mode, pending.level, pending.options);
  }

  cancelBrief() {
    this.pending = null;
    this.shown = '';
    this.draw();
  }

  showBrief() {
    const { mode, level } = this.pending;
    const rule = this.ruleFor(mode, level);
    this.screen.innerHTML = `
      <section class="menu sheet">
        <header class="menu-bar">
          <button type="button" class="icon-btn" data-action="brief-back" aria-label="${this.t('back')}">${iconHTML('arrowRight')}</button>
          <div class="logo">${rule.name}</div>
        </header>
        <div class="sheet-body brief">
          <p class="rule-aim">${rule.aim}</p>
          <ul class="rule-list">${rule.points.map(line => `<li>${line}</li>`).join('')}</ul>
          <h3>${this.t('howRound')}</h3>
          <ul class="rule-list">${this.lines('shared').map(line => `<li>${line}</li>`).join('')}</ul>
          <button type="button" class="btn-primary" data-action="start-mode">${iconHTML('playFill')}${this.t('playNamed', { mode: rule.name })}</button>
        </div>
      </section>`;
  }

  again(sameSeed) {
    const state = this.game.state;
    this.game.emit('game_restart', { gameMode: state.mode });
    const options = sameSeed || state.challenge ? { seed: state.seed, challenge: state.challenge } : {};
    this.game.start(state.mode, state.level, options);
  }

  challengeLink() {
    const state = this.game.state;
    return challengeUrl({
      origin: this.siteUrl,
      lang: this.lang,
      mode: state.mode,
      level: state.level,
      seed: state.seed,
      score: state.score
    });
  }

  async share(preferSystem) {
    const state = this.game.state;
    const url = this.challengeLink();
    const streak = state.result?.streak || 0;
    const text = shareText({
      mode: state.mode,
      score: state.score,
      streak,
      url,
      lines: [
        `🍉 ${state.mode === 'daily' ? this.t('shareDaily') : this.t('shareTitle')}`,
        '',
        this.t('shareScore', { score: num(state.score) }),
        ...(state.mode === 'daily' && streak > 0 ? [this.t('shareStreak', { n: phrase('ui.day', streak) })] : []),
        '',
        this.t('shareBeat'),
        '',
        url
      ].join('\n')
    });
    this.game.emit(preferSystem ? 'share_clicked' : 'challenge_created', {
      gameMode: state.mode,
      score: state.score,
      challengeId: String(state.seed)
    });
    if (preferSystem && navigator.share) {
      try {
        await navigator.share({ title: this.t('shareTitle'), text, url });
        return;
      } catch { /* dismissed or unsupported */ }
    }
    try { await navigator.clipboard.writeText(preferSystem ? text : url); } catch { /* blocked */ }
    this.game.patch({ copied: true });
    this.game.later(() => this.game.patch({ copied: false }), 1800);
  }

  toggleMute(button) {
    const muted = sound.toggle();
    button.setAttribute('aria-pressed', String(muted));
    button.textContent = muted ? this.t('muted') : this.t('sound');
  }

  stopClock() {
    clearInterval(this.clock);
    this.clock = null;
  }

  showMenu() {
    const best = num(save.get('best', 0));
    const endlessBest = fmt(save.get('endlessBest', 0));
    const timeBest = num(save.get('timeBest', 0));
    const level = save.get('level', 1);
    const last = save.get('lastMode', 'classic');
    const resume = last === 'classic' ? this.t('level', { n: level }) : this.modeName(last);
    this.screen.innerHTML = `
      <section class="menu">
        <header class="menu-bar">
          <div class="logo">Fruit Destroy!</div>
          <div class="menu-tools">
            <button type="button" class="icon-btn" data-action="rules" aria-label="${this.t('how')}">${iconHTML('info')}</button>
            <button type="button" class="icon-btn" data-action="achievements" aria-label="${this.t('achievements')}">${iconHTML('starFill')}</button>
            <button type="button" class="icon-btn" data-action="records" aria-label="${this.t('records')}">${iconHTML('trophy')}</button>
            <p class="best-pill"><span>${this.t('best')}</span><strong>${best}</strong></p>
          </div>
        </header>
        <div class="menu-body">
          <div class="menu-glow" aria-hidden="true"></div>
          <div class="hero-copy">
            <p class="fruit-row" aria-hidden="true"><span>🍓</span><span>🍋</span><span>🍉</span><span>🫐</span></p>
            <h1>Fruit<br><span>Destroy!</span></h1>
            <p class="lede">${this.t('lede')}</p>
            <div class="play-row">
              <button type="button" class="btn-primary btn-xl" data-action="${last}">${iconHTML('playFill')}${this.t('play')}</button>
              <p class="continue">${this.t('resume', { mode: resume })}</p>
            </div>
          </div>
          <div class="mode-list">
            <button type="button" class="mode-card" data-action="classic">
              <span class="mode-icon">${iconHTML('map')}</span>
              <span><strong>${this.t('classic')}</strong><small>${this.t('classicHint', { n: level })}</small></span>
              ${iconHTML('arrowRight')}
            </button>
            <button type="button" class="mode-card mode-endless" data-action="endless">
              <span class="mode-icon mode-icon-cyan">${iconHTML('infinity')}</span>
              <span><strong>${this.t('endless')}</strong><small>${this.t('endlessHint', { best: endlessBest })}</small></span>
              ${iconHTML('arrowRight')}
            </button>
            <button type="button" class="mode-card mode-time" data-action="time">
              <span class="mode-icon mode-icon-cyan">${iconHTML('timer')}</span>
              <span><strong>${this.t('time')}</strong><small>${this.t('timeHint', { best: timeBest })}</small></span>
              ${iconHTML('arrowRight')}
            </button>
            <button type="button" class="mode-card mode-daily" data-action="daily">
              <span class="mode-icon">${iconHTML('calendar')}</span>
              <span><strong>${this.t('daily')}</strong><small>${this.t('dailyHint', { when: `<span data-countdown>${this.t('nextSoon')}</span>` })}</small></span>
              ${iconHTML('arrowRight')}
            </button>
          </div>
        </div>
      </section>`;
    const countdown = this.screen.querySelector('[data-countdown]');
    const paint = () => { countdown.textContent = this.t('nextIn', { time: formatCountdown(msUntilNextUtcDay()) }); };
    paint();
    this.clock = setInterval(paint, 1000);
  }

  showSheet(kind) {
    this.stopClock();
    const title = kind === 'records' ? this.t('yourRecords') : kind === 'rules' ? this.t('how') : this.t('achievements');
    const body = kind === 'records' ? this.recordsBody() : kind === 'rules' ? this.rulesHTML() : this.achievementsBody();
    this.screen.innerHTML = `
      <section class="menu sheet">
        <header class="menu-bar">
          <button type="button" class="icon-btn" data-action="back" aria-label="${this.t('back')}">${iconHTML('arrowRight')}</button>
          <div class="logo">${title}</div>
        </header>
        <div class="sheet-body">${body}</div>
      </section>`;
  }

  rulesHTML(mode) {
    const shared = `<section class="rule-block"><h3>${this.t('everyMode')}</h3><ul class="rule-list">${this.lines('shared').map(line => `<li>${line}</li>`).join('')}</ul></section>`;
    const modes = MODE_IDS.filter(id => !mode || id === mode);
    const blocks = modes.map(id => {
      const item = this.ruleFor(id, id === 'classic' ? save.get('level', 1) : 0);
      return `<section class="rule-block"><h3>${item.name}</h3><p class="rule-aim">${item.aim}</p><ul class="rule-list">${item.points.map(line => `<li>${line}</li>`).join('')}</ul></section>`;
    }).join('');
    return shared + blocks;
  }

  recordsBody() {
    const rows = localRecords().map(row => {
      const label = this.t(`recordLabels.${row.id}`);
      const value = row.id === 'streak' ? phrase('ui.day', row.n) : row.value;
      return `<li><span>${label}</span><strong>${value}</strong></li>`;
    }).join('');
    return `<p class="sheet-note">${this.t('recordsNote', { name: playerName() })}</p><ul class="record-list">${rows}</ul>`;
  }

  achievementsBody() {
    const have = save.get('achievements', {});
    const profile = save.get('profile', {});
    return `<ul class="achieve-list">${ACHIEVEMENTS.map(item => {
      const unlocked = !!have[item.id];
      const progress = achievementProgress(item.id, profile);
      const width = Math.round(progress.current / progress.goal * 100);
      const name = this.t(`ach.${item.id}.name`) || item.name;
      const detail = this.t(`ach.${item.id}.detail`) || item.detail;
      return `<li class="${unlocked ? 'is-on' : ''}"><span>${item.emoji}</span><span><strong>${name}</strong><small>${detail}</small><i style="width:${width}%"></i></span></li>`;
    }).join('')}</ul>`;
  }

  showPlay() {
    const state = this.game.state;
    this.screen.innerHTML = `
      <section class="play">
        <aside class="hud">
          <header class="hud-top">
            <button type="button" class="icon-btn" data-action="pause" aria-label="${this.t('pause')}">${iconHTML('pause')}</button>
            <button type="button" class="icon-btn" data-action="help" aria-label="${this.t('how')}">${iconHTML('info')}</button>
            <div class="logo">Fruit Destroy!</div>
            <button type="button" class="icon-btn mute-btn" data-action="mute" aria-pressed="${sound.muted()}" aria-label="${this.t('mute')}">${sound.muted() ? this.t('muted') : this.t('sound')}</button>
          </header>
          <section class="panel">
            <p class="kicker">${this.t('score')}</p>
            <p class="score" data-field="score"></p>
            <p class="muted">${this.t('best')} <span data-field="best"></span></p>
            <p class="beat" data-field="beat" hidden></p>
          </section>
          <section class="panel combo" data-field="combo">
            <div class="combo-row">
              <span class="icon-slot">${iconHTML('flame')}</span>
              <span class="mult" data-field="mult"></span>
              <span class="combo-sub" data-field="combo-sub"></span>
            </div>
            <div class="bar"><span data-field="combo-bar"></span></div>
          </section>
          <section class="panel mode-panel">
            <div class="mode-row">
              <span class="mode-pill" data-field="mode"></span>
              <span class="time">${iconHTML('timer')}<span data-field="time"></span></span>
            </div>
            <div data-panel="endless" hidden>
              <div class="stat-line"><span>${this.t('boardFull')}</span><span data-field="occ"></span></div>
              <div class="bar bar-thick"><span data-field="occ-bar"></span></div>
              <p class="muted" data-field="speed"></p>
            </div>
            <div data-panel="timed" hidden>
              <div class="stat-line"><span>${this.t('matchPairs')}</span><span data-field="pairs"></span></div>
              <div class="bar bar-thick"><span data-field="pairs-bar"></span></div>
            </div>
          </section>
          <section class="panel critter-panel" data-panel="critters" hidden>
            <p class="critter-title">${this.t('hungry')}</p>
            <p class="muted" data-field="critter-stats"></p>
            <div class="chips" data-field="chips"></div>
          </section>
          <p class="hint">${this.t('hint')}</p>
        </aside>
        <div class="board" data-field="board">
          <div class="bg base" data-layer="base"></div>
          <div class="bg glow" data-layer="glow"></div>
          <div class="bg floor" data-layer="floor"></div>
          <div class="bg danger" data-layer="danger"></div>
          <p class="bg-label" data-field="theme"></p>
          <div class="playfield">
            <div class="basket" data-field="basket" aria-hidden="true">🧺<span data-field="basket-count"></span></div>
            <div class="fruits" data-field="fruits"></div>
            <div class="animals" data-field="animals"></div>
            <div class="floats" data-field="floats"></div>
            <p class="callout" data-field="callout" hidden></p>
            <p class="intro" data-field="intro" hidden></p>
          </div>
        </div>
        <div class="pause" data-panel="help" hidden>
          <div class="pause-card help-card">
            <div class="pause-head"><h2>${this.t('how')}</h2></div>
            <div data-field="help-body"></div>
            <button type="button" class="btn-primary" data-action="close-help">${this.t('gotIt')}</button>
          </div>
        </div>
        <div class="pause" data-panel="pause" hidden>
          <div class="pause-card">
            <div class="pause-head"><h2>${this.t('paused')}</h2><p data-field="pause-meta"></p></div>
            <button type="button" class="btn-primary" data-action="resume">${iconHTML('playFill')}${this.t('resumeBtn')}</button>
            <div class="pause-actions">
              <button type="button" class="btn-ghost" data-action="retry">${iconHTML('restart')}${this.t('restart')}</button>
              <button type="button" class="btn-ghost" data-action="menu">${iconHTML('home')}${this.t('quit')}</button>
            </div>
          </div>
        </div>
      </section>`;
    this.liveBest = save.get('best', 0);
    this.calloutN = 0;
    field(this.screen, 'best').textContent = num(this.liveBest);
    field(this.screen, 'intro').textContent = this.introText(state);
    const chips = field(this.screen, 'chips');
    (state.critters || []).forEach(animal => {
      const chip = document.createElement('span');
      chip.textContent = `${animal.e}→${FRUITS[animal.food][0]}`;
      chips.append(chip);
    });
    const flood = state.mode === 'endless' || state.mode === 'time';
    this.screen.querySelector('[data-panel="endless"]').hidden = !flood;
    this.screen.querySelector('[data-panel="timed"]').hidden = flood;
    this.screen.querySelector('[data-panel="critters"]').hidden = !(state.critters && state.critters.length);
    this.play = {
      fruits: field(this.screen, 'fruits'),
      animals: field(this.screen, 'animals'),
      floats: field(this.screen, 'floats')
    };
    this.play.fruits.addEventListener('pointerdown', event => {
      const button = event.target.closest('.fruit');
      if (!button) return;
      event.preventDefault();
      this.game.tap(Number(button.dataset.id));
    });
    this.play.animals.addEventListener('pointerdown', event => {
      const button = event.target.closest('.animal');
      if (!button) return;
      event.preventDefault();
      this.game.shoo(Number(button.dataset.id));
    });
    this.patchPlay();
  }

  patchPlay() {
    const state = this.game.state;
    const live = (state.fruits || []).filter(fruit => !GONE.has(fruit.st)).length;
    const mult = multFor(state.combo || 0);
    const comboLeft = state.combo ? Math.max(0, 1 - (state.elapsed - state.lastMatch) / RULES.comboWindow) : 0;
    const hot = (state.combo || 0) >= 2;
    const flood = state.mode === 'endless' || state.mode === 'time';
    const score = field(this.screen, 'score');
    score.textContent = num(state.score || 0);
    score.classList.toggle('is-record', this.liveBest > 0 && (state.score || 0) > this.liveBest);
    const beat = field(this.screen, 'beat');
    beat.hidden = !state.challenge;
    if (state.challenge) beat.textContent = this.t('beat', { score: num(state.challenge.score) });
    field(this.screen, 'mult').textContent = `×${mult}`;
    field(this.screen, 'combo-sub').textContent = state.combo >= 2 ? this.t('inARow', { n: state.combo }) : state.combo === 1 ? this.t('matchAgain') : this.t('chain');
    field(this.screen, 'combo').classList.toggle('is-hot', hot);
    field(this.screen, 'combo-bar').style.width = `${comboLeft * 100}%`;
    field(this.screen, 'mode').textContent = state.mode === 'endless' ? this.t('modeEndless') : state.mode === 'time' ? this.t('modeTime') : state.mode === 'daily' ? this.t('modeDaily') : this.t('modeLevel', { n: state.level });
    field(this.screen, 'time').textContent = state.mode === 'endless' ? fmt(state.elapsed || 0) : fmt((state.limit || 0) - (state.elapsed || 0));
    this.paintCallout(state);
    if (flood) {
      const ratio = live / CAP;
      field(this.screen, 'occ').textContent = `${Math.round(ratio * 100)}%`;
      const occ = field(this.screen, 'occ-bar');
      occ.style.width = `${Math.min(100, ratio * 100)}%`;
      occ.classList.toggle('is-hot', ratio > 0.75);
      field(this.screen, 'speed').textContent = this.t('speed', {
        n: Math.round((2.4 - this.game.interval(state.elapsed || 0)) / 0.16) + 1,
        s: this.game.interval(state.elapsed || 0).toFixed(1)
      });
    } else {
      field(this.screen, 'pairs').textContent = `${state.matches || 0} / ${state.target || 0}`;
      field(this.screen, 'pairs-bar').style.width = `${Math.min(100, (state.matches || 0) / (state.target || 1) * 100)}%`;
    }
    field(this.screen, 'critter-stats').textContent = this.t('critterStats', { ate: state.eaten || 0, shooed: state.shooed || 0 });
    const board = field(this.screen, 'board');
    board.classList.toggle('is-danger', flood && live / CAP > 0.75);
    field(this.screen, 'basket-count').textContent = String((state.matches || 0) * 2);
    field(this.screen, 'basket').classList.toggle('is-pop', state.elapsed - state.lastMatch < 0.6);
    const intro = field(this.screen, 'intro');
    intro.hidden = !(state.intro && state.elapsed < 4.5);
    this.screen.querySelector('[data-panel="pause"]').hidden = !state.paused || !!state.help;
    const help = this.screen.querySelector('[data-panel="help"]');
    help.hidden = !state.help;
    if (state.help && help.dataset.mode !== state.mode) {
      help.dataset.mode = state.mode;
      help.querySelector('[data-field="help-body"]').innerHTML = this.rulesHTML(state.mode);
    }
    field(this.screen, 'pause-meta').textContent = `${field(this.screen, 'mode').textContent} · ${field(this.screen, 'time').textContent}`;
    this.paintBoard(state, live);
    this.syncFruits(state);
    this.syncAnimals(state);
    this.syncFloats(state);
  }

  paintBoard(state, live) {
    const theme = themeName(state);
    const layers = boardLayers(theme, { mode: state.mode, live });
    if (this.theme !== theme) {
      this.theme = theme;
      for (const name of ['base', 'glow', 'floor']) {
        const el = this.screen.querySelector(`[data-layer="${name}"]`);
        el.removeAttribute('style');
        applyStyle(el, layers[name]);
      }
      const label = field(this.screen, 'theme');
      label.textContent = this.t(`themes.${theme}`) || layers.name;
      label.style.color = layers.labelColor;
    }
    const danger = this.screen.querySelector('[data-layer="danger"]');
    const flood = state.mode === 'endless' || state.mode === 'time';
    danger.hidden = !flood;
    if (flood) danger.style.height = layers.danger.height;
  }

  syncFruits(state) {
    const targets = new Set((state.animals || []).filter(animal => animal.ph === 'walk' && animal.tid != null).map(animal => animal.tid));
    const light = LIGHT_THEMES.has(themeName(state));
    const seen = new Set();
    for (const fruit of state.fruits) {
      const id = String(fruit.id);
      seen.add(id);
      let el = this.play.fruits.querySelector(`:scope > [data-id="${id}"]`);
      const isNew = !el;
      if (!el) {
        el = document.createElement('button');
        el.type = 'button';
        el.className = 'fruit';
        el.dataset.id = id;
        el.textContent = FRUITS[fruit.k][0];
        this.play.fruits.append(el);
      }
      const targeted = targets.has(fruit.id) && !GONE.has(fruit.st);
      const stamp = `${fruit.st}|${fruit.x}|${fruit.y}|${fruit.rot}|${targeted}`;
      if (!isNew && el.dataset.stamp === stamp) continue;
      const prev = el.dataset.st;
      el.dataset.stamp = stamp;
      el.dataset.st = fruit.st;
      const style = fruitStyle(fruit, RULES.fruitTile, light, targeted);
      if (!isNew && !(fruit.st === 'bad' && prev !== 'bad')) delete style.animation;
      applyStyle(el, style);
    }
    for (const el of [...this.play.fruits.children]) {
      if (!seen.has(el.dataset.id)) el.remove();
    }
  }

  syncAnimals(state) {
    const seen = new Set();
    for (const animal of state.animals || []) {
      const id = String(animal.id);
      seen.add(id);
      let el = this.play.animals.querySelector(`:scope > [data-id="${id}"]`);
      const kind = ANIMALS[animal.a];
      if (!el) {
        el = document.createElement('button');
        el.type = 'button';
        el.className = 'animal';
        el.dataset.id = id;
        el.innerHTML = `<span class="animal-face">${kind.e}</span><span class="animal-bubble"></span>`;
        this.play.animals.append(el);
      }
      el.style.left = `${animal.x - 4}px`;
      el.style.top = `${animal.y - 10}px`;
      el.style.cursor = animal.ph === 'walk' ? 'pointer' : 'default';
      el.querySelector('.animal-face').style.transform = `scaleX(${animal.dir === 1 ? -1 : 1})`;
      const bubble = el.querySelector('.animal-bubble');
      bubble.textContent = animal.ph === 'eat' ? (this.t('nom') || 'NOM!') : animal.ph === 'flee' ? '💨' : FRUITS[kind.food][0];
      bubble.style.fontSize = animal.ph === 'eat' ? '15px' : '20px';
    }
    for (const el of [...this.play.animals.children]) {
      if (!seen.has(el.dataset.id)) el.remove();
    }
  }

  syncFloats(state) {
    const seen = new Set();
    for (const floater of state.floats || []) {
      const id = String(floater.id);
      seen.add(id);
      if (this.play.floats.querySelector(`:scope > [data-id="${id}"]`)) continue;
      const el = document.createElement('div');
      el.className = floater.bad ? 'float is-bad' : 'float';
      el.dataset.id = id;
      el.style.left = `${Math.min(floater.x, BW - 140)}px`;
      el.style.top = `${Math.max(floater.y - 20, 0)}px`;
      el.textContent = this.floatText(floater);
      this.play.floats.append(el);
      if ((floater.combo || 0) >= 2) this.burst(floater);
    }
    for (const el of [...this.play.floats.children]) {
      if (!seen.has(el.dataset.id)) el.remove();
    }
  }

  showResult() {
    const state = this.game.state;
    const result = state.result || {};
    const win = !!result.win;
    const copy = this.resultCopy(result, state);
    const versus = result.versus
      ? result.versus.tie
        ? this.t('tied', { score: num(result.versus.target) })
        : result.versus.beat
          ? this.t('youBeat', { score: num(result.versus.target) })
          : this.t('shortOf', { score: num(result.versus.target) })
      : '';
    const unlocked = (result.unlocked || []).map(item => `${item.emoji} ${this.t(`ach.${item.id}.name`) || item.name}`).join(' · ');
    const stars = [0, 1, 2].map(i => {
      const on = i < (result.stars || 0);
      const size = i === 1 ? 96 : 76;
      const delay = on ? `animation-delay:${0.25 + i * 0.18}s;` : '';
      return `<span class="star${on ? ' is-on' : ''}" style="font-size:${size}px;transform:rotate(${(i - 1) * 10}deg);${delay}">${iconHTML('starFill')}</span>`;
    }).join('');
    const stats = (result.stats || []).map(stat => `<div class="stat"><strong>${stat.v}</strong><span>${this.t(`stats.${stat.k}`) || stat.k}</span></div>`).join('');
    this.screen.innerHTML = `
      <section class="result ${win ? 'is-win' : 'is-lose'}">
        <div class="result-blob" aria-hidden="true"></div>
        <div class="result-copy">
          <p class="kicker">${copy.kicker || ''}</p>
          <h2>${copy.title || ''}</h2>
          ${result.stars ? `<div class="stars">${stars}</div>` : ''}
          <p class="note">${copy.note || ''}</p>
          ${versus ? `<p class="versus">${versus}</p>` : ''}
          ${state.mode === 'daily' && result.streak ? `<p class="versus">${this.t('streakLine', { n: phrase('ui.day', result.streak) })}</p>` : ''}
          ${unlocked ? `<p class="versus">${this.t('unlocked', { list: unlocked })}</p>` : ''}
        </div>
        <div class="result-card">
          <div class="result-score">
            <p data-field="count"></p>
            ${result.newBest ? `<span class="new-best">${this.t('newBest')}</span>` : ''}
            <small class="best-line">${this.t('personalBest', { score: num(result.personalBest || 0) })}</small>
          </div>
          <div class="stats">${stats}</div>
          ${result.canNext ? `<button type="button" class="btn-primary" data-action="next">${this.t('nextLevel')}${iconHTML('arrowRight')}</button>` : ''}
          <button type="button" class="btn-primary" data-action="${state.challenge ? 'rematch' : 'retry'}">${iconHTML('restart')}${state.challenge ? this.t('rematch') : this.t('again')}</button>
          <div class="result-actions">
            <button type="button" class="btn-ghost" data-action="share"><span data-field="share">${this.t('share')}</span></button>
            <button type="button" class="btn-ghost" data-action="challenge">${iconHTML('users')}<span data-field="challenge">${this.t('challenge')}</span></button>
            <button type="button" class="icon-btn" data-action="menu" aria-label="${this.t('menu')}">${iconHTML('home')}</button>
          </div>
        </div>
      </section>`;
    this.patchResult();
  }

  patchResult() {
    const state = this.game.state;
    const count = field(this.screen, 'count');
    const challenge = field(this.screen, 'challenge');
    if (count) count.textContent = num(state.count || 0);
    const share = field(this.screen, 'share');
    if (challenge) challenge.textContent = state.copied ? this.t('linkCopied') : this.t('challenge');
    if (share) share.textContent = state.copied ? this.t('copied') : this.t('share');
  }

  paintCallout(state) {
    const el = field(this.screen, 'callout');
    if (!el) return;
    if (!state.callout) {
      el.hidden = true;
      return;
    }
    if (this.calloutN === state.callout.n) return;
    this.calloutN = state.callout.n;
    el.hidden = false;
    const calloutKey = CALLOUTS[state.callout.text];
    el.textContent = calloutKey ? (this.t(`callouts.${calloutKey}`) || state.callout.text) : state.callout.text;
    el.dataset.combo = String(state.callout.combo);
    el.classList.remove('is-on');
    void el.offsetWidth;
    el.classList.add('is-on');
    if (state.callout.combo >= 5) this.shake();
  }

  burst(floater) {
    if (this.reduce || !this.play) return;
    for (let i = 0; i < 8; i++) {
      const dot = document.createElement('i');
      dot.className = 'burst';
      dot.style.left = `${floater.x}px`;
      dot.style.top = `${floater.y}px`;
      dot.style.setProperty('--dx', `${Math.cos(i / 8 * Math.PI * 2) * 36}px`);
      dot.style.setProperty('--dy', `${Math.sin(i / 8 * Math.PI * 2) * 36}px`);
      this.play.floats.append(dot);
      setTimeout(() => dot.remove(), 420);
    }
  }

  shake() {
    if (this.reduce) return;
    const cabinet = this.screen.closest('.cabinet') || this.screen;
    cabinet.classList.remove('is-shake');
    void cabinet.offsetWidth;
    cabinet.classList.add('is-shake');
  }
}
