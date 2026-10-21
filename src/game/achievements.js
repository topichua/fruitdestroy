export const ACHIEVEMENTS = [
  { id: 'first-match', emoji: '🍒', name: 'First Match', detail: 'Finish a game.', goal: 1, key: 'games' },
  { id: 'combo-master', emoji: '🍓', name: 'Combo Master', detail: 'Reach a ×5 combo.', goal: 5, key: 'bestCombo' },
  { id: 'rising-star', emoji: '🍋', name: 'Rising Star', detail: 'Score 5,000 points in one game.', goal: 5000, key: 'bestScore' },
  { id: 'fruit-legend', emoji: '🍉', name: 'Fruit Legend', detail: 'Score 50,000 points in one game.', goal: 50000, key: 'bestScore' },
  { id: 'daily-player', emoji: '🔥', name: 'Daily Player', detail: 'Complete 3 daily challenges.', goal: 3, key: 'dailyCount' },
  { id: 'champion', emoji: '🏆', name: 'Champion', detail: 'Beat a friend\'s score.', goal: 1, key: 'beatFriend' },
  { id: 'perfectionist', emoji: '💎', name: 'Perfectionist', detail: 'Clear a round with no misses.', goal: 1, key: 'perfect' }
];

export function achievementProgress(id, profile = {}) {
  const item = ACHIEVEMENTS.find(entry => entry.id === id);
  if (!item) return { current: 0, goal: 1 };
  const raw = profile[item.key];
  const current = item.key === 'beatFriend' || item.key === 'perfect' ? (raw ? 1 : 0) : (raw || 0);
  return { current: Math.min(item.goal, current), goal: item.goal };
}

export function earnedIds(profile = {}) {
  return ACHIEVEMENTS.filter(item => {
    if (item.key === 'beatFriend' || item.key === 'perfect') return !!profile[item.key];
    return (profile[item.key] || 0) >= item.goal;
  }).map(item => item.id);
}
