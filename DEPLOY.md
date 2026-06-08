# DEPLOY.md — hosting Friends Advertising

This site is a standard **Next.js 15 App Router** app. It can be deployed to
anything that runs Node.js 20+. Three battle-tested paths are documented
below; pick whichever fits your team.

---

## TL;DR

| Option            | Effort | Best for                                |
| ----------------- | ------ | --------------------------------------- |
| **Vercel** ⭐     | 2 min  | Fastest path — pushed from GitHub       |
| **Netlify**       | 5 min  | Already on Netlify for other projects   |
| **Self-hosted VM** | 30 min | Full control, fixed cost, no vendor lock |

---

## Option A — Vercel (recommended)

Vercel is built by the same team as Next.js, so build settings auto-detect.

1. Push the repo to GitHub / GitLab / Bitbucket.
2. Go to <https://vercel.com/new> and import the repository.
3. **Framework Preset** should auto-fill to *Next.js*. Leave the defaults:
   - Build command: `next build`
   - Output directory: *(blank — Vercel handles it)*
   - Install command: `npm install`
4. Under **Environment Variables**, paste every key from `.env.example`:

   | Name                    | Value                                       |
   | ----------------------- | ------------------------------------------- |
   | `NEXT_PUBLIC_SITE_URL`  | `https://your-production-domain.com`        |
   | `RESEND_API_KEY`        | (from Resend)                               |
   | `CONTACT_TO_EMAIL`      | your inbox                                  |
   | `CONTACT_FROM_EMAIL`    | verified sender                             |

5. Click **Deploy**. ~90 seconds later you get a `*.vercel.app` URL.
6. Add a custom domain under *Settings → Domains*. Vercel issues the TLS cert
   automatically (Let's Encrypt).
7. Future pushes to the default branch deploy automatically.

---

## Option B — Netlify

1. <https://app.netlify.com/start> → import the Git repo.
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Install the **Next.js runtime plugin** (Netlify offers it during setup).
4. Add the same environment variables as the Vercel table above under
   *Site settings → Build & deploy → Environment*.
5. Deploy. Connect a custom domain. Done.

---

## Option C — Self-hosted VM (Ubuntu + nginx + PM2)

For when you want a fixed monthly bill and full ownership.

### One-time server setup (Ubuntu 22.04 / 24.04)

```bash
# Install Node 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git

# Process manager
sudo npm install -g pm2

# Create a non-root user for the app
sudo adduser --system --group friends
sudo mkdir -p /var/www/friends && sudo chown friends:friends /var/www/friends
```

### Deploy the code

```bash
sudo -u friends bash
cd /var/www/friends
git clone <your-repo-url> .

# Install + build
npm ci
cp .env.example .env.local   # then edit with real values
npm run build

# Start with PM2
pm2 start npm --name friends-adv -- run start -- --port 3000
pm2 save
pm2 startup    # outputs a command — run it as root to enable boot autostart
```

### nginx reverse proxy + TLS

Create `/etc/nginx/sites-available/friendsadvertising`:

```nginx
server {
    listen 80;
    server_name friendsadvertising.in www.friendsadvertising.in;

    # Allow Let's Encrypt's HTTP-01 challenge before HTTPS is set up.
    location /.well-known/acme-challenge/ { root /var/www/letsencrypt; }
    location / { return 301 https://$host$request_uri; }
}

server {
    listen 443 ssl http2;
    server_name friendsadvertising.in www.friendsadvertising.in;

    # Filled in by certbot:
    # ssl_certificate     /etc/letsencrypt/live/friendsadvertising.in/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/friendsadvertising.in/privkey.pem;

    # Let Next handle its own security headers (we already set CSP/HSTS/etc.
    # in next.config.ts). Don't double-stamp them in nginx.
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    # Allow large request bodies (form submissions are small but be lenient).
    client_max_body_size 2m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 60s;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/friendsadvertising /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Get a free TLS cert
sudo snap install --classic certbot
sudo certbot --nginx -d friendsadvertising.in -d www.friendsadvertising.in
```

### Future deploys

```bash
sudo -u friends bash
cd /var/www/friends
git pull
npm ci
npm run build
pm2 reload friends-adv     # zero-downtime restart
```

---

## Production checklist

Before pointing customers at the URL:

- [ ] `NEXT_PUBLIC_SITE_URL` is set to the real domain (no trailing slash)
- [ ] All three `RESEND_*` env vars are set; a real test enquiry hits the
      inbox
- [ ] HTTPS is enforced (Vercel/Netlify do this automatically; nginx
      redirects port 80 → 443)
- [ ] You hit a few pages and confirm:
  - [ ] Mobile hamburger opens to a full-screen dark overlay
  - [ ] No "N" dev badge in the corner (production builds never show it)
  - [ ] No console errors in DevTools
  - [ ] `/robots.txt` and `/sitemap.xml` resolve
- [ ] `Strict-Transport-Security` header is present (curl `-I https://...`)
- [ ] Content-Security-Policy header is present (and **does not** contain
      `'unsafe-eval'` — that's dev-only and gated to `NODE_ENV !== "production"`)

---

## Operational notes

- **Caching:** Hashed Next.js static assets (`/_next/static/...`) ship with
  `Cache-Control: public, max-age=31536000, immutable`. Page HTML is
  re-fetched on every request.
- **Security headers:** All OWASP-recommended response headers (CSP, HSTS,
  X-Content-Type-Options, X-Frame-Options, Referrer-Policy,
  Permissions-Policy, COOP) are set centrally in
  [next.config.ts](next.config.ts). `upgrade-insecure-requests` and HSTS are
  **production-only** — emitting them in dev would break `http://localhost`.
- **Logs:** PM2: `pm2 logs friends-adv`. Vercel/Netlify: the platform's UI.
- **Rolling back:** Vercel and Netlify keep every deployment; one click to
  promote a previous build. With PM2 you `git checkout <previous-sha> &&
  npm ci && npm run build && pm2 reload friends-adv`.
- **Scaling:** Anywhere the Node process is duplicated (multiple Vercel
  regions, multiple PM2 instances, Kubernetes pods), the in-memory rate
  limit on `/api/contact` becomes per-instance. For higher traffic, swap
  the rate-limit block in `src/app/api/contact/route.ts` for an Upstash /
  Redis-backed implementation.
