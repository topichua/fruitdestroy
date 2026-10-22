export function portalFrom(value) {
  const host = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .split('/')[0]
    .split('?')[0]
    .replace(/:\d+$/, '');
  if (host.length > 80) return '';
  if (!/^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?)*$/.test(host)) return '';
  return host;
}
