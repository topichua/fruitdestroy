import assert from 'node:assert/strict';
import test from 'node:test';
import { createApp } from '../server.js';

const SITE = 'https://fruitdestroy.com';

function visible(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
}

function headOf(html) {
  const end = html.indexOf('</head>');
  return end === -1 ? html : html.slice(0, end);
}

async function listen() {
  const server = createApp().listen(0);
  await new Promise(resolve => server.once('listening', resolve));
  const { port } = server.address();
  return { server, base: `http://127.0.0.1:${port}` };
}

test('indexed URLs, redirects, 404 and sitemap', async t => {
  const { server, base } = await listen();
  t.after(() => new Promise(resolve => server.close(resolve)));

  const robots = await fetch(base + '/robots.txt');
  assert.equal(robots.status, 200);
  const robotsText = await robots.text();
  assert.match(robotsText, new RegExp(`Sitemap: ${SITE}/sitemap.xml`));
  assert.doesNotMatch(robotsText, /Disallow:\s*\/en/);
  assert.doesNotMatch(robotsText, /Disallow:\s*\/uk/);

  const sm = await fetch(base + '/sitemap.xml');
  assert.equal(sm.status, 200);
  const xml = await sm.text();
  assert.doesNotMatch(xml, /<lastmod>/);
  assert.doesNotMatch(xml, /#/);
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  assert.ok(locs.length >= 60);
  assert.ok(locs.includes(`${SITE}/en/`));
  assert.ok(locs.includes(`${SITE}/uk/`));
  assert.ok(locs.includes(`${SITE}/en/activities/`));
  assert.ok(locs.includes(`${SITE}/en/fruit-maze/`));
  assert.ok(locs.includes(`${SITE}/uk/breathe/`));
  assert.ok(locs.includes(`${SITE}/pl/fruit-maze/`));
  assert.ok(locs.includes(`${SITE}/ja/`));
  assert.equal(locs.length, 42 * 34);
  assert.ok(!locs.some(u => u.includes('/fruit-destroy-zen/') || u.includes('#')));
  assert.ok(locs.every(u => u.startsWith(`${SITE}/`) && u.endsWith('/')));

  const ogImages = new Set();
  for (const loc of locs) {
    const path = new URL(loc).pathname;
    const res = await fetch(base + path, { redirect: 'manual' });
    assert.equal(res.status, 200, path);
    const html = await res.text();
    const head = headOf(html);
    const dom = visible(html);
    assert.equal((head.match(/<title>/g) || []).length, 1, path);
    assert.equal((html.match(/<title>/g) || []).length, 1, path);
    assert.equal((head.match(/name="description"/g) || []).length, 1, path);
    assert.equal((dom.match(/<h1\b/g) || []).length, 1, path);
    const robotsMeta = head.match(/name="robots" content="([^"]+)"/);
    assert.ok(robotsMeta, path);
    assert.doesNotMatch(robotsMeta[1], /noindex/, path);
    const canon = head.match(/<link rel="canonical" href="([^"]+)">/);
    assert.ok(canon, path);
    assert.equal(canon[1], loc, path);
    const lang = path.split('/').filter(Boolean)[0];
    assert.match(html, /<html lang="[a-zA-Z-]+"/, path);
    const alts = [...head.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)];
    const hrefs = Object.fromEntries(alts.map(m => [m[1], m[2]]));
    assert.equal(hrefs.en, loc.replace(`/${lang}/`, '/en/'), path);
    assert.equal(hrefs.uk, loc.replace(`/${lang}/`, '/uk/'), path);
    assert.equal(hrefs['x-default'], hrefs.en, path);
    assert.equal(alts.length, 43, path);
    assert.ok(alts.some(m => new URL(m[2]).pathname === path), path);
    assert.match(dom, new RegExp(`href="/${lang}/`), path);
    // Social and structured data must be in the HTML: link previews do not run JavaScript.
    const og = Object.fromEntries([...head.matchAll(/<meta (?:property|name)="((?:og|twitter):[^"]+)" content="([^"]*)" data-seo="">/g)].map(m => [m[1], m[2]]));
    assert.equal(og['og:url'], loc, path);
    assert.ok(og['og:title'] && og['og:title'] === og['twitter:title'], path);
    assert.ok(og['og:description'], path);
    assert.match(og['og:locale'], /^[a-z]{2,3}(_[A-Z]{2})?$/, path);
    assert.equal(og['twitter:card'], 'summary_large_image', path);
    assert.match(og['og:image'], new RegExp(`^${SITE}/static/og/[a-z-]+\\.jpg$`), path);
    assert.equal(og['twitter:image'], og['og:image'], path);
    ogImages.add(new URL(og['og:image']).pathname);
    const ld = [...head.matchAll(/<script type="application\/ld\+json" data-seo="">([\s\S]*?)<\/script>/g)];
    assert.equal(ld.length, 1, path);
    const data = JSON.parse(ld[0][1]);
    assert.equal(data['@context'], 'https://schema.org', path);
    assert.ok(JSON.stringify(data).includes(`${SITE}/${lang}/`), path);
    assert.doesNotMatch(dom, /href="#[^"]*"/, path);
  }

  // 28 activities + the catalog + home, each a real 1200x630 file on disk.
  assert.equal(ogImages.size, 30);
  for (const image of ogImages) {
    const res = await fetch(base + image);
    assert.equal(res.status, 200, image);
    assert.equal(res.headers.get('content-type'), 'image/jpeg', image);
  }
  const fdLd = JSON.parse(headOf(await (await fetch(base + '/en/fruit-destroy/')).text()).match(/ld\+json" data-seo="">([\s\S]*?)<\/script>/)[1]);
  assert.deepEqual(fdLd['@graph'].map(n => n['@type']), ['VideoGame', 'FAQPage']);
  const filHead = headOf(await (await fetch(base + '/fil/')).text());
  assert.match(filHead, /hreflang="tl" href="https:\/\/fruitdestroy\.com\/fil\/"/);
  assert.doesNotMatch(filHead, /hreflang="fil"/);

  const maze = visible(await (await fetch(base + '/en/fruit-maze/')).text());
  const mazeUk = visible(await (await fetch(base + '/uk/fruit-maze/')).text());
  const breathe = visible(await (await fetch(base + '/en/breathe/')).text());
  const slice = visible(await (await fetch(base + '/en/fruit-slice/')).text());
  const sand = visible(await (await fetch(base + '/uk/sand-art/')).text());
  assert.match(maze, /How to play/);
  assert.match(maze, /orchard maze/i);
  assert.match(mazeUk, /Як грати/);
  assert.match(mazeUk, /лабіринт/);
  assert.doesNotMatch(breathe, /orchard maze/i);
  assert.match(breathe, /orange slice/i);
  assert.match(slice, /Swipe to slice/);
  assert.match(sand, /кольоровий пісок|пісок/i);
  assert.match(maze, /href="\/en\/catch-the-fruit\/"/);

  const zen = await fetch(base + '/en/fruit-destroy-zen/', { redirect: 'manual' });
  assert.equal(zen.status, 200);
  const zenHtml = await zen.text();
  assert.match(zenHtml, /noindex/);
  assert.match(headOf(zenHtml), new RegExp(`canonical" href="${SITE}/en/fruit-destroy/"`));
  assert.doesNotMatch(xml, /fruit-destroy-zen/);

  const pl = await fetch(base + '/pl/fruit-maze/', { redirect: 'manual' });
  assert.equal(pl.status, 200);
  const plHtml = await pl.text();
  const plVisible = visible(plHtml);
  assert.match(plHtml, /<html lang="pl"/);
  assert.doesNotMatch(headOf(plHtml), /noindex/);
  assert.match(headOf(plHtml), new RegExp(`canonical" href="${SITE}/pl/fruit-maze/"`));
  assert.match(plVisible, /Jak grać/);
  assert.match(plVisible, /labirynt/i);

  for (const [accept, to] of [
    [undefined, '/en/'],
    ['uk-UA,uk;q=0.9,en;q=0.8', '/uk/'],
    ['de-DE,de;q=0.9', '/de/'],
    ['xx', '/en/']
  ]) {
    const root = await fetch(base + '/', { redirect: 'manual', headers: accept ? { 'accept-language': accept } : {} });
    assert.equal(root.status, 302, accept);
    assert.equal(root.headers.get('location'), to, accept);
    assert.equal(root.headers.get('cache-control'), 'no-store', accept);
  }
  const rootQuery = await fetch(base + '/?utm_source=keep', { redirect: 'manual' });
  assert.equal(rootQuery.headers.get('location'), '/en/?utm_source=keep');

  for (const [from, to] of [
    ['/en', '/en/'],
    ['/uk/fruit-maze', '/uk/fruit-maze/'],
    ['/en/breathe?utm_source=keep', '/en/breathe/?utm_source=keep'],
    ['/en/play/?from=portal', '/en/fruit-destroy/?from=portal']
  ]) {
    const res = await fetch(base + from, { redirect: 'manual' });
    assert.equal(res.status, 301, from);
    assert.equal(res.headers.get('location'), to, from);
  }

  for (const missing of ['/no-such-page', '/en/not-a-game/', '/fruit-maze/']) {
    const res = await fetch(base + missing, { redirect: 'manual' });
    assert.equal(res.status, 404, missing);
    assert.match(await res.text(), /Page not found/);
  }
});
