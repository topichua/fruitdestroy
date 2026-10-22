const queue = [];

export function track(name, props = {}) {
  const event = {
    name,
    at: Date.now(),
    props: {
      gameMode: props.gameMode,
      score: props.score,
      durationSeconds: props.durationSeconds,
      challengeId: props.challengeId,
      referrer: props.referrer,
      portal: props.portal,
      isNewPlayer: props.isNewPlayer,
      combo: props.combo,
      id: props.id
    }
  };
  queue.push(event);
  if (queue.length > 40) queue.shift();
  try {
    globalThis.dispatchEvent?.(new CustomEvent('fruitdestroy:analytics', { detail: event }));
  } catch { /* non-browser */ }
  if (Array.isArray(globalThis.dataLayer)) globalThis.dataLayer.push({ event: name, ...event.props });
  const params = Object.fromEntries(Object.entries(event.props).filter(([, value]) => value !== undefined));
  globalThis.gtag?.('event', name, params);
}

export function recentEvents() {
  return queue.slice();
}
