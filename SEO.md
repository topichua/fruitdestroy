# Fruit Destroy — SEO & multi-language setup

## 1. One URL per language (required)
Google indexes one language per URL. Don't swap text with JS on the same URL.

```
https://fruitdestroy.gg/            → x-default (language picker or auto-redirect by Accept-Language, 302 not 301)
https://fruitdestroy.gg/en/         → English
https://fruitdestroy.gg/uk/         → Українська
https://fruitdestroy.gg/pl/  /de/  /es/  /fr/  /pt-br/  /tr/
```
Sub-pages follow the same pattern: `/uk/daily/`, `/uk/endless/`, `/uk/c/K7Q2X` (challenge links: `noindex`).

## 2. Per-language page head
Every language page carries:
- `<html lang="uk">`
- its own translated `<title>` + `<meta name="description">`
- `<link rel="canonical">` pointing to **itself** (not to /en/)
- the **full identical set** of `hreflang` links (all languages + `x-default`) — every page lists all others, including itself
- `og:locale` = own locale, `og:locale:alternate` = the rest
- translated OG image (text on image in that language) → `/og/{lang}-1200x630.png`
- JSON-LD with translated `name`/`description`, `inLanguage` = own code

**Important:** the tags must be in the server-rendered / prebuilt HTML. Crawlers and social previews (Facebook, Telegram, Viber) do not run JS. With Vite, use prerendering (`vite-plugin-ssr`/`vike`, `vite-ssg`, or a build script that writes `dist/{lang}/index.html` from a template).

## 3. Translations (title ≤ 60 chars, description ≤ 155)

| lang | title | description |
|---|---|---|
| en | Fruit Destroy — Free Fruit Matching Arcade Game Online | Match pairs of fruit, chain combos and shoo hungry critters! Play free in your browser — levels, Endless and a Daily Challenge. |
| uk | Fruit Destroy — безкоштовна аркадна гра з фруктами | Знаходь пари фруктів, роби комбо і проганяй голодних звірят! Грай безкоштовно в браузері — рівні, нескінченний режим і щоденний виклик. |
| pl | Fruit Destroy — darmowa gra zręcznościowa z owocami | Łącz pary owoców, rób combo i przeganiaj głodne zwierzaki! Graj za darmo w przeglądarce — poziomy, tryb bez końca i wyzwanie dnia. |
| de | Fruit Destroy — Kostenloses Obst-Paare Arcade-Spiel | Finde Obstpaare, baue Combos und verscheuche hungrige Tiere! Kostenlos im Browser spielen — Level, Endlosmodus und tägliche Challenge. |
| es | Fruit Destroy — Juego arcade gratis de emparejar frutas | ¡Empareja frutas, encadena combos y espanta a los animales hambrientos! Juega gratis en tu navegador: niveles, modo infinito y reto diario. |
| fr | Fruit Destroy — Jeu d'arcade gratuit d'association de fruits | Associe les fruits par paires, enchaîne les combos et chasse les animaux gourmands ! Joue gratuitement : niveaux, mode infini et défi du jour. |
| pt-BR | Fruit Destroy — Jogo arcade grátis de combinar frutas | Combine pares de frutas, faça combos e espante os bichos famintos! Jogue grátis no navegador — fases, modo infinito e desafio diário. |
| tr | Fruit Destroy — Ücretsiz Meyve Eşleştirme Arcade Oyunu | Meyve çiftlerini eşleştir, kombo yap ve aç hayvanları kovala! Tarayıcında ücretsiz oyna — bölümler, sonsuz mod ve günlük meydan okuma. |

Have a native speaker check each; keywords should be what people actually search in that language (e.g. uk: «гра з фруктами», «знайди пару», «ігри для дітей онлайн»).

## 4. sitemap.xml with hreflang
```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://fruitdestroy.gg/uk/</loc>
    <xhtml:link rel="alternate" hreflang="en" href="https://fruitdestroy.gg/en/"/>
    <xhtml:link rel="alternate" hreflang="uk" href="https://fruitdestroy.gg/uk/"/>
    <!-- …all languages… -->
    <xhtml:link rel="alternate" hreflang="x-default" href="https://fruitdestroy.gg/"/>
  </url>
  <!-- repeat one <url> per language page -->
</urlset>
```
`robots.txt`:
```
User-agent: *
Allow: /
Disallow: /*/c/
Sitemap: https://fruitdestroy.gg/sitemap.xml
```

## 5. In-game text
Keep UI strings in `src/i18n/{lang}.json`; the route prefix sets the language. Add a visible language switcher made of plain `<a href="/uk/">` links (crawlable).

## 6. Checklist
- Google Search Console: add the domain, submit the sitemap, check the "International targeting / hreflang" errors
- Test previews: Facebook Sharing Debugger, opengraph.xyz, Telegram @WebpageBot
- Lighthouse SEO ≥ 95; LCP < 2.5s on mobile
- Indexable text on the page (H1 + 2–3 sentences "how to play" per language) — a canvas-only page ranks poorly
