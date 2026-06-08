import type { NextConfig } from "next";
import path from "node:path";

/**
 * OWASP-aligned security headers applied to every response.
 *
 * Notes:
 * - `Content-Security-Policy` whitelists the external origins the app currently
 *   needs (Leaflet from cdnjs / unpkg, OpenStreetMap tiles, the earth texture
 *   on raw.githubusercontent, Google Fonts injected by `next/font`). Tighten
 *   the allow-lists as those dependencies move in-house.
 * - `'unsafe-inline'` is permitted for styles because Tailwind + Next inject
 *   inline `<style>` tags during hydration. Inline scripts are NOT allowed.
 * - HSTS is preload-eligible; only emit if you are confident HTTPS is enforced.
 * - `upgrade-insecure-requests` + HSTS are PRODUCTION-ONLY. In dev (`npm run
 *   dev` on http://localhost:3000) `upgrade-insecure-requests` rewrites every
 *   subresource URL to https://localhost:3000 — for which there is no server,
 *   so all `/_next/static/chunks/*` requests silently fail and React never
 *   hydrates. The boot loader then sits at 000% forever. Same trap for HSTS,
 *   which would poison the user's browser into refusing the dev URL.
 */
const isDev = process.env.NODE_ENV !== "production";

// Dev relaxations:
//   - Next.js Webpack dev uses `eval()`-based source maps → needs 'unsafe-eval'.
//   - Fast Refresh uses a WebSocket on the same origin → ws: / wss: in connect-src.
//   - 'upgrade-insecure-requests' and HSTS would force https://localhost (no
//     server there) and silently fail every chunk → loader stalls at 000%.
const scriptSrcExtras = isDev ? " 'unsafe-eval'" : "";
const connectSrcExtras = isDev ? " ws: wss:" : "";

const CspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self' mailto:",
  `script-src 'self' 'unsafe-inline'${scriptSrcExtras} https://cdnjs.cloudflare.com https://unpkg.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://unpkg.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://raw.githubusercontent.com https://www.transparenttextures.com",
  "media-src 'self' blob:",
  `connect-src 'self' blob: data:${connectSrcExtras} https://*.tile.openstreetmap.org https://raw.githubusercontent.com https://cdnjs.cloudflare.com https://unpkg.com`,
  "worker-src 'self' blob:",
  "manifest-src 'self'",
];
if (!isDev) {
  CspDirectives.push("upgrade-insecure-requests");
}
const ContentSecurityPolicy = CspDirectives.join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];
if (!isDev) {
  // HSTS only in production (avoids poisoning the browser against http://localhost).
  securityHeaders.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,

  // Hide the floating "N" Next.js dev badge in the bottom corner during
  // `npm run dev`. The badge is never emitted in production builds anyway,
  // but the user wants it suppressed in dev too.
  devIndicators: false,

  // Pin the workspace root so Next's file-tracing doesn't escape into the
  // user's home directory just because another lockfile exists higher up.
  outputFileTracingRoot: path.join(__dirname),

  // Strip console output (but keep error/warn) in production builds.
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  // Pre-approve the external image hosts we currently render.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "www.transparenttextures.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Aggressive caching for hashed Next.js build assets.
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
