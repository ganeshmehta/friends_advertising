# SETUP.md — bring this project up on any machine

> This file is the moral equivalent of a `requirements.txt` for a Node /
> Next.js project. Every dependency the app needs is declared in
> [package.json](package.json); npm reads that file and installs everything.

---

## 1. Prerequisites

Install these once per machine:

| Tool        | Version       | Why                                     |
| ----------- | ------------- | --------------------------------------- |
| **Node.js** | **20.x LTS** or newer | Runs Next.js, builds the bundle |
| **npm**     | bundled with Node (≥ 10) | Installs JS dependencies         |
| **Git**     | any           | Clone / pull the repo                   |

Download Node from <https://nodejs.org/en/download> — pick the **LTS**
installer. After install, in a fresh terminal:

```powershell
node --version    # → v20.x.x  (or higher)
npm --version     # → 10.x.x   (or higher)
```

A modern browser (Chrome / Edge / Firefox / Safari) is required to view the
site locally.

---

## 2. Get the code

If you're moving the project on an external HDD, just copy the whole folder
**except `node_modules/` and `.next/`** — those are reproducible from
`package.json` and would only slow you down. The required Node modules are
re-installed on the target machine in step 3.

```powershell
# Either: clone from a remote
git clone <your-repo-url> friendsAdvFinal
cd friendsAdvFinal

# Or: copy the folder and skip .next/ + node_modules/
```

---

## 3. Install dependencies

From the project root:

```powershell
npm install
```

On Windows + PowerShell, npm may print a noisy *funding* / *audit* summary —
that's normal. It must end with `added N packages` and no `npm ERR!` lines.
Total install size ≈ 600 MB of `node_modules`.

> **PowerShell execution-policy gotcha:** If you ever see
> `npm.ps1 cannot be loaded because running scripts is disabled`, run the
> commands by invoking node directly:
>
> ```powershell
> & "C:\Program Files\nodejs\node.exe" node_modules\npm\bin\npm-cli.js install
> ```

---

## 4. Configure environment variables

```powershell
Copy-Item .env.example .env.local
notepad .env.local
```

Fill in real values. At minimum you need:

| Variable                | Required for         | Source                                          |
| ----------------------- | -------------------- | ----------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`  | SEO, OpenGraph, /api/contact same-origin check | Your production URL (no trailing slash) |
| `RESEND_API_KEY`        | Contact form sending | https://resend.com → API Keys                   |
| `CONTACT_TO_EMAIL`      | Contact form sending | Your inbox                                      |
| `CONTACT_FROM_EMAIL`    | Contact form sending | A verified sender on your Resend-verified domain |

Without the Resend trio, the form will load and validate normally but the
submit button will surface *"Email delivery is not configured on the server"*.
See [EMAIL_SETUP.md](EMAIL_SETUP.md) for the full email setup.

---

## 5. Run the dev server

```powershell
npm run dev
```

Visit <http://localhost:3000>. Hot-reload is enabled — edit any file in
`src/` and the page updates automatically.

> First request after `next dev` starts may take 3–10 s because Next compiles
> each route on demand. Subsequent requests are near-instant.

To run on a specific port:

```powershell
npm run dev -- --port 4000
# or, bypassing PowerShell exec-policy:
& "C:\Program Files\nodejs\node.exe" node_modules\next\dist\bin\next dev --port 4000
```

---

## 6. Build & run production locally

```powershell
npm run build      # compile + tree-shake + minify; ~30 s
npm run start      # serve the prebuilt /. Default port 3000.
```

`next build` will fail loudly if there's a TypeScript or ESLint error.
Both should pass clean on a healthy checkout.

---

## 7. Useful one-liners

```powershell
# Type-check only (no emit)
& "C:\Program Files\nodejs\node.exe" node_modules\typescript\bin\tsc --noEmit

# Lint (zero warnings expected)
& "C:\Program Files\nodejs\node.exe" node_modules\eslint\bin\eslint.js .

# Wipe the .next cache if dev gets weird
Remove-Item -Recurse -Force .next
```

---

## 8. What lives where

| Path                       | Purpose                                                 |
| -------------------------- | ------------------------------------------------------- |
| `src/app/`                 | Next.js App Router routes (`page.tsx`, `layout.tsx`)    |
| `src/app/api/contact/`     | POST endpoint that delivers form submissions            |
| `src/components/`          | Shared React components (Header, Footer, MobileMenu…)   |
| `src/lib/`                 | Pure helpers: `site.ts`, `seo.ts`, `nav.ts`             |
| `src/styles/`              | Page-scoped CSS (`about-cinematic.css`, `services-lab.css`) |
| `public/`                  | Static assets served at `/` (`/logos/...`, `/videos/...`) |
| `next.config.ts`           | OWASP security headers, image domains, etc.             |
| `tsconfig.json`            | TypeScript strict-mode config                           |
| `eslint.config.mjs`        | Flat-config ESLint rules                                |
| `.env.local` *(you create)* | Secrets and per-environment overrides                  |

---

## 9. Cross-checklist before deploying

- [ ] `npm install` succeeded with no `npm ERR!` lines
- [ ] `.env.local` exists with real `RESEND_*` values
- [ ] `npm run build` finishes successfully
- [ ] `npm run start` serves the site at <http://localhost:3000>
- [ ] Contact form submits and you receive an email
- [ ] Mobile hamburger opens to a full-screen dark overlay
- [ ] No "N" dev badge in the corner (production never shows it)

When all boxes are ticked, head over to [DEPLOY.md](DEPLOY.md).


# 1. Clean build cache (saves space + avoids stale cache issues)
Remove-Item -Recurse -Force .next, verify\eslint.log, verify\build.log, verify\tsc.log -ErrorAction SilentlyContinue

# 2. Zip with 7-Zip (handles long paths, fast)
# Install once: winget install 7zip.7zip
& "C:\Program Files\7-Zip\7z.exe" a -t7z -mx=5 ..\friendsAdvFinal.7z .

# OR vanilla PowerShell (slower, fine for one-off)
Compress-Archive -Path * -DestinationPath ..\friendsAdvFinal.zip -CompressionLevel Optimal
