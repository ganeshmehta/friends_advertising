# Agent brief — friendsAdvFinal

> Marketing site for **Friends Advertising** (Mumbai OOH).
> Plain Next.js **15.5.18** App Router. There is **no** `node_modules/next/dist/docs/` folder — ignore any boilerplate that tells you to read it. Use your normal Next 15 / React 18 knowledge.

## Stack (locked)
- Next.js 15.5.18 (App Router) · React 18.3.1 runtime · `@types/react` 19
- Tailwind v4 (`@tailwindcss/postcss`) · TypeScript 5 strict
- React Three Fiber v9 (`@react-three/fiber` ^9.6) + drei ^10.7 + three ^0.184
- framer-motion ^12.38
- ESLint 9 (flat config in `eslint.config.mjs`) + `eslint-config-next` 16.x

## Windows / PowerShell toolchain
PowerShell exec-policy can refuse `npx`/`npm` `.ps1` shims. Always invoke node directly:
- Type-check: `& "C:\Program Files\nodejs\node.exe" node_modules/typescript/bin/tsc --noEmit`
- Lint:       `& "C:\Program Files\nodejs\node.exe" node_modules/eslint/bin/eslint.js .`
- Build:      `& "C:\Program Files\nodejs\node.exe" node_modules/next/dist/bin/next build`
- `Tee-Object` writes UTF-16 — read back with `Get-Content -Encoding Unicode`.
- A stray `package-lock.json` in `C:\Users\v-anoomishra\` used to confuse Next file-tracing — pinned via `outputFileTracingRoot: path.join(__dirname)` in `next.config.ts`. Don't remove that line.

## Architecture conventions (don't reinvent)
- **Single source of truth**: `src/lib/site.ts` (`siteConfig`, `absoluteUrl`), `src/lib/seo.ts` (`createPageMetadata`), `src/lib/nav.ts` (`primaryNav`). Header / Footer / per-route layouts read from these.
- **Per-route SEO**: each client `page.tsx` under `/about /services /projects /contact` is paired with a **server** `layout.tsx` that exports `metadata = createPageMetadata({...})`. `metadata` in a `"use client"` file silently no-ops — don't try it.
- **CSP allow-list lives in `next.config.ts`**. New external origin → update CSP **and** `images.remotePatterns` if it's served via `next/image`. Required directives currently include:
  - `script-src`/`style-src`: `'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://unpkg.com`
  - `connect-src`: `'self' blob: data: https://*.tile.openstreetmap.org https://raw.githubusercontent.com https://cdnjs.cloudflare.com https://unpkg.com` — **`blob:` is mandatory** (GLTFLoader fetches embedded textures via `URL.createObjectURL`).
  - `img-src`: `'self' data: blob: https://*.tile.openstreetmap.org https://raw.githubusercontent.com https://www.transparenttextures.com`
  - `worker-src`: `'self' blob:`
  - **DEV-ONLY GATING (do not regress)**: `upgrade-insecure-requests` and HSTS are gated to `process.env.NODE_ENV === "production"`. If you ever ship `upgrade-insecure-requests` in dev, it rewrites every `http://localhost:3000/_next/static/chunks/*.js` request to `https://localhost:3000/...` (no server there) — chunks silently 404, React never hydrates, the SiteLoader sits at `000%` forever, no console error. Dev also needs `'unsafe-eval'` in `script-src` (Webpack eval source-maps) and `ws: wss:` in `connect-src` (Fast Refresh HMR socket).
- **JSON-LD** is inlined in `src/app/layout.tsx` via `dangerouslySetInnerHTML` from a fully-typed module-scope object — safe, leave the pattern.

## React 19 strict-lint patterns adopted here
- `react-hooks/set-state-in-effect` — for "reset derived state when prop changes", use the React-documented **store-previous-render** pattern (setState during render with a guard). See `prevLocationId` in [src/app/projects/CampaignVisualizer.tsx](src/app/projects/CampaignVisualizer.tsx). Do **not** add `useEffect(() => setX(...), [prop])`.
- For "reset state to null on mode toggle", schedule the reset via `queueMicrotask(...)` inside an effect — the lint targets sync setState in the effect body.
- `react-hooks/purity` — never call `Math.random()` during render that produces a memoised THREE.js geometry. Use a seeded LCG (see `makeRng` in [src/components/about/CityLights.tsx](src/components/about/CityLights.tsx)).
- The `// eslint-disable-next-line react-hooks/set-state-in-effect` in [src/components/SiteLoader.tsx](src/components/SiteLoader.tsx) is intentional (window/sessionStorage are not SSR-safe) — keep it.

## R3F v9 typing
`<bufferAttribute args={[arr, 3]} attach="attributes-position" />` requires `args`. Cleaner: construct `THREE.BufferAttribute` imperatively and render `<primitive attach="attributes-position" object={attr} />`.

## Layout / scroll traps already fixed (do not re-introduce)
- `src/app/page.tsx`: `<main ref={containerRef} className="relative ...">` — the `relative` is required for framer-motion `useScroll`. Without it, scroll-driven hero/chapter animations break silently.
- `SiteLoader` `visible` state is initialised to `true` (deterministic for SSR), then reconciled in `useEffect`. Do **not** initialise from `typeof window !== "undefined"` — causes hydration tear-down.
- `preserveAspectRatio` Y component only accepts `Min|Mid|Max`. `xMinYEnd meet` throws; use `xMinYMax meet`.
- Don't add `overflow: hidden` to a `position: sticky` element's outer wrapper — it makes the wrapper the scroll container and the sticky stops pinning to the viewport.

## Known clean state (last verified)
- `tsc --noEmit` → 0 errors
- `eslint .` → 0 errors / 0 warnings (`verify/**` + `scripts/**` are in `globalIgnores`)
- `next build` → 12 routes prerendered, shared First Load JS ≈ 103 kB
- `next start --port 3002` — `/`, `/about`, `/services`, `/projects`, `/contact` render; Leaflet shows 99 markers; SiteLoader runs and unmounts cleanly.

## Known cosmetic noise (not bugs)
- `/static/css/style.css` at workspace root triggers Next's "static directory deprecated" warning. Not referenced from `src/` — safe to delete when convenient.
- `THREE.Clock` deprecation comes from `@react-three/fiber` internals; informational only.

## Brand assets
- Header / Footer / PanelNav logo: `public/logos/Brand_Logo.png` (square ~140×140).
- `siteConfig.defaultOgImage` → `/logos/Brand_Logo.png` at `1200×1200`. Replace with a true 1200×630 banner when one is supplied.
