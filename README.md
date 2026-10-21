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
| `/{lang}/daily/` | today's shared daily challenge |
| `/{lang}/achievements/` | the seven achievements and which ones this device has earned |
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

## Layout
- `server.js` — routes, language redirect, SEO files
- `src/render/` — landing page and the play-page shell (title, hreflang, ads)
- `src/i18n/` — translations, one JSON file per language
- `src/game/` — the game, served as ES modules at `/game/`
- `public/static/site.css` — landing styles

## Editing
- Texts / translations: `src/i18n/{lang}.json` (missing keys fall back to `en.json`). New language: add the JSON + one line in `LANGS` in `src/i18n/index.js`.
- Landing markup: `src/render/landing.js` · styles: `public/static/site.css`
- Game rules and simulation: `src/game/engine.js` · tuning (board size, timer, critters): `src/game/config.js`
- Game screens: `src/game/view.js` · styles: `src/game/game.css` · board themes: `src/game/backgrounds.js`
- Social preview images: put `public/static/og/{lang}-1200x630.png` (one per language)
- Ads: set `ADSENSE_CLIENT` and each `AD_SLOT_*` id; until then dashed placeholders render. Rules → `ADS.md`.

Scores, streaks and achievements are stored in `localStorage` on this device. There is no account server, so the site does not show a global top 10 or a rank. A score in a challenge link is only the number to beat. A future ranking API would be `POST /v1/scores` (the server checks the run) and `GET /v1/leaderboards?period=day|week|all&mode=&limit=10`.

## Not done yet
- Game UI text is English only (landing is fully translated)
- `/{lang}/privacy/` and `/{lang}/terms/` pages (linked in the footer, currently 404) — required for AdSense
- OG images, favicon, cookie-consent banner (EU)
