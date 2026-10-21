import { save } from './storage.js';
import { localRecords } from './leaderboard.js';
import { formatCountdown, msUntilNextUtcDay } from './session.js';

const NAMES = { classic: 'Classic', endless: 'Endless', time: 'Time Attack', daily: 'Daily' };

const box = document.querySelector('[data-progress]');
if (box && save.get('played')) {
  const note = box.querySelector('[data-progress-note]');
  const list = box.querySelector('ul');
  if (note) note.hidden = true;
  if (list) {
    const recent = (save.get('recent', []) || []).map(mode => NAMES[mode] || mode);
    const rows = localRecords();
    if (recent.length) rows.push({ label: 'Recently played', value: recent.join(', ') });
    list.hidden = false;
    list.innerHTML = rows.map(row => `<li><span>${row.label}</span><strong>${row.value}</strong></li>`).join('');
  }
}

const unlocked = save.get('achievements', {});
document.querySelectorAll('[data-ach]').forEach(item => {
  if (unlocked[item.dataset.ach]) item.classList.add('is-on');
});

const clocks = document.querySelectorAll('[data-countdown]');
if (clocks.length) {
  const paint = () => clocks.forEach(node => { node.textContent = formatCountdown(msUntilNextUtcDay()); });
  paint();
  setInterval(paint, 1000);
}
