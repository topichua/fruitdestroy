# Fruit Destroy — Adsterra banners (live)

Loader: `public/static/adsterra.js` (+ `adsterra.css`), markup via `adsterraSlot()` in `src/render/util.js`. Not loaded in `/embed/`.

| unit | key | shows |
|---|---|---|
| 468×60 `h468` | f687a0f4… | ≥768px, above the game (`/play/`) / below the header (landing) |
| 160×300 `v160` | 21784cdb… | ≥1360px, left **and** right of the game (same key, loaded twice) |
| 320×50 `m320` | 389eb1a5… | <768px, in flow below the game / above the landing footer |

- Scripts load one at a time after `load` (they all read the global `atOptions`), only for slots visible at the current breakpoint, never refreshed.
- Blocked/failed/empty slots collapse (`data-ad-state="failed|empty"`) and the game refits.
- Opt-out: `window.fdAdsConsent = false` (set by a future CMP) or GPC/DNT skips loading. No CMP exists yet; one is needed for EU/UK traffic.

---

# Fruit Destroy — ad slots (Google AdSense)

Every placeholder has `data-ad-slot="<name>"`. Replace the placeholder box with the AdSense unit and keep the outer wrapper (it reserves space, which prevents layout shift / CLS).

## Landing (`Fruit Destroy Landing.dc.html`)
| slot | size | shows on | format |
|---|---|---|---|
| top-leaderboard | 728×90 (responsive) | all | horizontal |
| rail-left / rail-right | 160×600, fixed | screens ≥ 1600px | vertical |
| in-content-rect | 336×280 | all (after "How to play") | rectangle |
| mid-leaderboard | 728×90 | all (after Critters) | horizontal |
| faq-sidebar | 300×250, sticky | all (beside FAQ, stacks on mobile) | rectangle |
| bottom-leaderboard | 970×90 (responsive) | all (above footer) | horizontal |
| mobile-anchor | 320×50, fixed bottom | screens ≤ 760px | horizontal |

## Game (`Fruit Destroy Arcade.dc.html`)
| slot | size |
|---|---|
| left-160x600 | 160×600 |
| right-160x600 | 160×600 |
| bottom-728x90 | 728×90 |

## Code
Once, in `<head>`:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
```
Per slot (inside the reserved wrapper):
```html
<ins class="adsbygoogle" style="display:block;width:100%;height:100%"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="1234567890"
     data-ad-format="horizontal"
     data-full-width-responsive="true"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
```
Fixed sizes (rails, 300×250): drop `data-ad-format`, set `style="display:inline-block;width:160px;height:600px"`.

## Rules that keep the account safe
- Never place ads over or inside the playfield, and never next to tap targets (accidental clicks = policy strike). Game-screen ads stay outside the 1280×800 board.
- Max one sticky anchor per page; the rails count as fixed units, so keep them only on wide screens.
- Pause or don't refresh ads mid-game; show interstitials only between levels via **H5 Games Ads** (`adBreak()` — the AdSense program for web games; supports rewarded "watch an ad for +10s").
- Add `ads.txt` at the domain root: `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`
- EU/UK visitors need a consent banner (Google-certified CMP — AdSense Privacy & messaging) before ads load.
- The audience includes kids: in AdSense, mark the site/pages as child-directed if it's primarily for children (limits ads to non-personalized).
