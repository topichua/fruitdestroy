import { save } from './storage.js';
import { localRecords } from './leaderboard.js';
import { phrase, tx } from './copy.js';
import { formatCountdown, msUntilNextUtcDay } from './session.js';

const modeName = mode => tx(`ui.${mode}`) || mode;

const box = document.querySelector('[data-progress]');
if (box && save.get('played')) {
  const note = box.querySelector('[data-progress-note]');
  const list = box.querySelector('ul');
  if (note) note.hidden = true;
  if (list) {
    const recent = (save.get('recent', []) || []).map(modeName);
    const rows = localRecords();
    if (recent.length) rows.push({ id: 'recent', value: recent.join(', ') });
    list.hidden = false;
    list.innerHTML = rows.map(row => {
      const label = tx(`ui.recordLabels.${row.id}`) || row.id;
      const value = row.id === 'streak' ? phrase('ui.day', row.n) : row.value;
      return `<li><span>${label}</span><strong>${value}</strong></li>`;
    }).join('');
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
