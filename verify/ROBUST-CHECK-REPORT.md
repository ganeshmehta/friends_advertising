# Robust Check Report — friendsAdvFinal

Date: 2026-06-05 · Branch: working tree · Next 15.5.18 · React 18.3.1 · Tailwind v4

## TL;DR
| Check | Result |
|---|---|
| `tsc --noEmit` | ✅ 0 errors |
| `eslint .` | ✅ 0 errors / 0 warnings |
| `next build` | ✅ 12 routes prerendered |
| Visual smoke (desktop + mobile, 5 routes) | ✅ all 200, 0 console errors, 0 blank voids |
| SEO surface (robots, sitemap, manifest, JSON-LD, OG, canonical) | ✅ all present and correct |
| Security headers (CSP, HSTS, X-Frame, Referrer, Permissions) | ✅ all present |
| Mobile-light path | ✅ no 3D, no MP4, no GLB on phones |

Issues found during the smoke pass and fixed in the same session:

1. **SVG `<line> y2: "undefined"` console error** on desktop `/` — `motion.line` and `motion.rect` inside the SiteLoader skyline crane had no initial / static `y2` / `y` value before framer-motion started driving them. Fixed by adding `initial={{ y2: 120 }}` + a static `y2={120}` attribute on `<motion.line>` and the matching `<motion.rect y={120} initial={{ y: 120 }}>`. (`src/components/SiteLoader.tsx`)
2. **`/contact` had no `<main>` and no `<h1>`** — outer element was `<section>` and the hero used `<h2>`. Promoted to `<main>` and renamed the hero heading to `<h1>`. (`src/app/contact/page.tsx`)
3. **`/videos/Temp_road.mp4` requested even on mobile** — the `<video>` element under `{!isMobile && ...}` still had `preload="metadata"` so Chrome's preload scanner was pulling it. Changed to `preload="none"`. (`src/app/page.tsx`)

After fixes, every route on every profile is 0 errors / 0 voids.

---

## 1. Typecheck
```
& "C:\Program Files\nodejs\node.exe" node_modules/typescript/bin/tsc --noEmit
TSC=0
```

## 2. Lint
```
& "C:\Program Files\nodejs\node.exe" node_modules/eslint/bin/eslint.js .
ESL=0
```

## 3. Production build
```
✓ Compiled successfully in ~11s
✓ Generating static pages (12/12)

Route (app)              Size      First Load JS
┌ ○ /                    14 kB     174 kB
├ ○ /_not-found          148 B     103 kB
├ ○ /about               249 kB    400 kB
├ ƒ /api/contact         148 B     103 kB
├ ○ /contact             7.61 kB   154 kB
├ ○ /manifest.webmanifest 148 B    103 kB
├ ○ /projects            26.5 kB   173 kB
├ ○ /robots.txt          148 B     103 kB
├ ○ /services            3.85 kB   110 kB
└ ○ /sitemap.xml         148 B     103 kB
+ First Load JS shared by all  103 kB
  ├ 255-…                46.2 kB
  ├ 4bd1b696-…           54.2 kB
  └ other shared chunks  2.2 kB
```

Notes:
- `/` 174 kB First Load — on the heavier side because of three.js + framer + the SiteLoader, but the heavy 3D path is gated to non-mobile via `useIsMobile`.
- `/about` is 400 kB (CityLights `@react-three/fiber` scene). Acceptable for an interior story page that loads after the marquee click.
- All routes static-prerendered except `/api/contact` (correctly server-rendered).

## 4. Visual smoke (post-fix)
Server: `next start --port 3010` (production build). Tested with Playwright in 2 viewports:

| route | profile | status | console errors | voids | h1 |
|---|---|---|---|---|---|
| `/` | desktop (1440×900) | 200 | 0 | 0 | FRIENDSADVERTISING (loader splash) |
| `/` | mobile (390×844) | 200 | 0 | 0 | DOMINATE THE SKYLINE. |
| `/about` | desktop | 200 | 0 | 0 | Outdoor thatowns the route. |
| `/about` | mobile | 200 | 0 | 0 | Outdoor thatowns the route. |
| `/services` | desktop | 200 | 0 | 0 | Complete outdoor advertising… |
| `/services` | mobile | 200 | 0 | 0 | Complete outdoor advertising… |
| `/projects` | desktop | 200 | 0 | 0 | Strategic OOH locations… |
| `/projects` | mobile | 200 | 0 | 0 | Strategic OOH locations… |
| `/contact` | desktop | 200 | 0 | 0 | Own Attention.Own The Skyline. |
| `/contact` | mobile | 200 | 0 | 0 | Own Attention.Own The Skyline. |

Notes / cosmetic only (NOT blockers):
- About h1 text concatenates "thatowns" because of a `<br/>` between two `<span>`s; the bot strips whitespace around the line-break. Visually it reads as two lines: "Outdoor that / owns the route." This is fine for users and even for Google (line breaks don't matter to crawler text extraction), but if you'd like the SR-rendered string to read "Outdoor that owns the route." we can add a `&nbsp;` after "that".
- Contact h1 similarly concatenates "Own Attention.Own The Skyline." across the `<br/>`. Same cosmetic-only note.
- Desktop `/` request log shows `ERR_ABORTED /videos/Temp_road.mp4` once per visit — that's the browser aborting the in-flight video request when the SiteLoader unmounts before the body needs it. Harmless. (`preload="none"` already minimises this.)
- `/projects` desktop log shows 10× OSM tile aborts during the smoke run; Playwright doesn't keep the Leaflet pane alive long enough to finish the tile fetches. In a real browser they complete fine (verified earlier in `verify/mobile-sections.json` + manual checks).

Full screenshots:
- [verify/check-desktop-_.png](verify/check-desktop-_.png), [verify/check-mobile-_.png](verify/check-mobile-_.png)
- [verify/check-desktop-_about.png](verify/check-desktop-_about.png), [verify/check-mobile-_about.png](verify/check-mobile-_about.png)
- [verify/check-desktop-_services.png](verify/check-desktop-_services.png), [verify/check-mobile-_services.png](verify/check-mobile-_services.png)
- [verify/check-desktop-_projects.png](verify/check-desktop-_projects.png), [verify/check-mobile-_projects.png](verify/check-mobile-_projects.png)
- [verify/check-desktop-_contact.png](verify/check-desktop-_contact.png), [verify/check-mobile-_contact.png](verify/check-mobile-_contact.png)
- Full-length mobile home: [verify/full-mobile-_.png](verify/full-mobile-_.png) (4979 px tall, no blank zones)
- Raw report: [verify/check-report.json](verify/check-report.json)

## 5. Asset weight

### Public folder (shipped as-is)
| Folder | MB | Files |
|---|---|---|
| models | 31.95 | 5 |
| videos | 9.73 | 2 |
| logos | 1.54 | 26 |
| media | 1.53 | 11 |

### Top 15 individual assets
| Path | KB |
|---|---|
| public/models/plane/source/LooL.glb | 30 418 |
| public/videos/Temp_road.mp4 | 5 237 |
| public/videos/splash_road.mp4 | 4 730 |
| public/models/plane/textures/Eclipse5_1.png | 1 213 |
| public/logos/partners/Star_Pravah.png | 912 |
| public/media/khidkaleshwar-mandir.jpg | 809 |
| public/media/karjat-hatnoli.png | 680 |
| public/models/plane/textures/cockpit_2.png | 635 |
| public/models/plane/textures/bump-15000x15000 out_0.png | 448 |
| public/apple-touch-icon.png | 214 |
| public/logos/Brand_Logo.png | 214 |
| public/logos/partners/Aaj_tak.png | 120 |
| public/logos/partners/lokshahi.png | 77 |
| public/media/og-default.jpg | 38.8 |
| public/logos/real-estate/gami-tiara.png | 35.8 |

**Mobile transfer (with mobile-light path) for `/`**
- HTML ~74 KB
- Shared JS chunks ~103 KB gzipped
- Page JS ~14 KB
- `hero-mobile.jpg` 22.9 KB (replaces the 5.2 MB MP4)
- No LooL.glb, no Temp_road.mp4, no splash_road.mp4
- ⇒ **first paint < 250 KB over the wire on mobile**, well within "fast 3G" budgets

**Desktop transfer for `/`** still includes Temp_road.mp4 (5.2 MB) loaded lazily by the `<video>` tag with `preload="none"`, so it streams progressively once the loader unmounts.

### .next/static
- JS total: 2.04 MB (uncompressed; gzip ~600-700 KB)
- CSS total: 156 KB

### Top 5 chunks
| File | KB |
|---|---|
| bd904a5c-… | 372.9 (drei + extras) |
| b536a0f1-… | 350.6 (three.js core) |
| 255-… | 169.2 |
| 4bd1b696-… | 169 |
| b79b7286-… | 143 |

## 6. SEO surface

### robots.txt
```
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /static/
Host: https://friendsadvertising.in
Sitemap: https://friendsadvertising.in/sitemap.xml
```

### sitemap.xml (5 entries, lastmod auto)
- `/` priority 1.0 weekly
- `/about` priority 0.8 monthly
- `/services` priority 0.8 monthly
- `/projects` priority 0.8 monthly
- `/contact` priority 0.8 monthly

### manifest.webmanifest
```json
{
  "name": "Friends Advertising",
  "short_name": "Friends Adv",
  "description": "Premium outdoor advertising across Mumbai, Navi Mumbai, Pune and the rest of Maharashtra. …",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0071e3",
  "icons": [{ "src": "/favicon.ico", "sizes": "any", "type": "image/x-icon" }]
}
```
ℹ️ Suggested follow-up: add 192×192 + 512×512 PNG icons for full PWA install support. Not blocking.

### Per-route metadata + JSON-LD
| Route | title | description | canonical | og:image | JSON-LD |
|---|---|---|---|---|---|
| `/` | "Friends Advertising — The Complete Outdoor Solution" | ✅ | https://friendsadvertising.in | /media/og-default.jpg | LocalBusiness |
| `/about` | "About Us · Friends Advertising" | ✅ | …/about | …og-default.jpg | LocalBusiness + BreadcrumbList |
| `/services` | "Services · Friends Advertising" | ✅ | …/services | …og-default.jpg | LocalBusiness + BreadcrumbList + Service |
| `/projects` | "Projects & Network · Friends Advertising" | ✅ | …/projects | …og-default.jpg | LocalBusiness + BreadcrumbList |
| `/contact` | "Contact Us · Friends Advertising" | ✅ | …/contact | …og-default.jpg | LocalBusiness + BreadcrumbList |

All routes also expose `og:type=website`, `twitter:card=summary_large_image`, `theme-color=#0071e3`, and a correct viewport meta.

### Security headers (sample from `/`)
```
Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none';
  frame-ancestors 'self'; form-action 'self' mailto:;
  script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://unpkg.com;
  style-src …  (CSP truncated in PowerShell view — full directive in next.config.ts)
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Cache-Control: s-maxage=31536000
```

## 7. Remaining sub-8 items / opportunities (NONE blocking)
1. Cosmetic h1 whitespace concatenation on `/about` and `/contact` (machines stitch "thatowns"/"Attention.Own"). Add `&nbsp;` after the first half if you want it perfect for SEO snippet text extraction.
2. Replace `public/static/css/style.css` (workspace root) — Next prints a "static directory deprecated" warning on every boot. File is unreferenced; safe to delete.
3. PWA icons: add 192×192 + 512×512 PNGs to make `manifest.webmanifest` installable on Chrome Android / iOS Home Screen.
4. `LooL.glb` (29.7 MB) is desktop-only via `OrbitingPlane`, but it streams in eagerly when that section becomes visible. If desktop LCP/TTI is ever a complaint, gate it behind a `whileInView` Suspense loader or compress the GLB with `gltfpack` (typically 10× smaller).
5. The OG image is the 1200×1200 default. A purpose-built 1200×630 banner (designed once) will look better in WhatsApp/Twitter previews — replace `/media/og-default.jpg` and update `siteConfig.defaultOgImage`.

## Conclusion
All three pipelines (`tsc`, `eslint`, `next build`) are green. All five routes return 200 on both desktop and mobile profiles with zero console errors and zero blank-area "voids". SEO/security surface is complete and the mobile-light path saves ~35 MB of asset weight per phone visit. The site is ship-ready from a verification standpoint.
