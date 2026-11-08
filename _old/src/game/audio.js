import { save } from './storage.js';

let ctx;
let muted = false;

function context() {
  const AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!ctx) ctx = new AudioCtx();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, duration, type, gain = 0.06, delay = 0) {
  const audio = context();
  if (!audio || muted || save.get('mute', false)) return;
  const start = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const amp = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(gain, start);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(amp);
  amp.connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export const sound = {
  unlock() {
    muted = !!save.get('mute', false);
    context();
  },
  muted() {
    return !!save.get('mute', false);
  },
  toggle() {
    const next = !save.get('mute', false);
    save.set('mute', next);
    muted = next;
    return next;
  },
  play(name, props = {}) {
    if (save.get('mute', false)) return;
    if (name === 'match') tone(props.combo >= 2 ? 520 + props.combo * 24 : 480, 0.07, 'triangle');
    else if (name === 'combo_achieved') tone(640 + (props.combo || 2) * 30, 0.09, 'square', 0.04);
    else if (name === 'miss') tone(150, 0.09, 'sine', 0.04);
    else if (name === 'shoo') tone(760, 0.06, 'sine', 0.05);
    else if (name === 'personal_best') [523, 659, 784].forEach((freq, i) => tone(freq, 0.1, 'triangle', 0.05, i * 0.08));
    else if (name === 'game_over') tone(220, 0.14, 'triangle', 0.04);
  }
};
