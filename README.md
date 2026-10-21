# Fruit Destroy — website

Node.js (Express) server-side rendered site: a multilingual landing page plus the browser game.

## Run locally
```bash
npm install
npm run dev          # http://localhost:3000
```
Node 18+.

## Routes
| URL | What |
|---|---|
| `/` | 302 → `/{lang}/` chosen from the browser's `Accept-Language` |
| `/{lang}/` | SSR landing page (en, uk, pl, de, es, fr, pt-br, tr) |
| `/{lang}/play/` | the game, with per-language SEO head injected |
| `/sitemap.xml` | every page × language, with hreflang alternates |
| `/robots.txt`, `/ads.txt`, `/healthz` | |

## Push to your repository
```bash
cd fruit-destroy-site
git init
git add .
git commit -m "Fruit Destroy: SSR landing + game"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

## Deploy
Set env vars from `.env.example` (`SITE_URL` must be your real domain).
- **Render / Railway / Fly.io**: new web service from the repo · build `npm install` · start `npm start`
- **Docker**: `docker build -t fruit-destroy . && docker run -p 3000:3000 -e SITE_URL=https://yourdomain fruit-destroy`
- **VPS**: `npm install --omit=dev && pm2 start server.js --name fruit-destroy`, behind nginx with HTTPS

Then in Google Search Console add the domain and submit `https://yourdomain/sitemap.xml`.

## Editing
- Texts / translations: `src/i18n/{lang}.json` (missing keys fall back to `en.json`). New language: add the JSON + one line in `LANGS` in `src/i18n/index.js`.
- Landing markup: `src/render/landing.js` · styles: `public/static/site.css`
- Social preview images: put `public/static/og/{lang}-1200x630.png` (one per language)
- Ads: set `ADSENSE_CLIENT` and each `AD_SLOT_*` id; until then dashed placeholders render. Rules → `ADS.md`.
- `public/game.html` is a self-contained build of the game from the design project — rebuild there and replace the file; don't hand-edit it.

## Not done yet
- Game UI text is English only (landing is fully translated)
- `/{lang}/privacy/` and `/{lang}/terms/` pages (linked in the footer, currently 404) — required for AdSense
- OG images, favicon, cookie-consent banner (EU)
