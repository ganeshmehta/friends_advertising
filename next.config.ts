import type { NextConfig } from "next";
import path from "node:path";

/**
 * OWASP-aligned security headers.
 */
const isDev = process.env.NODE_ENV !== "production";

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

  // Static export for cPanel
  output: "export",
  trailingSlash: true,

  devIndicators: false,

  outputFileTracingRoot: path.join(__dirname),

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "www.transparenttextures.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  // These headers work only when Next.js serves the app.
  // They are ignored after static export on cPanel,
  // but leaving them here won't affect the build.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;