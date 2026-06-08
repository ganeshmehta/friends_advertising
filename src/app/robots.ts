import type { MetadataRoute } from "next";
import { siteConfig, absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Lock down framework internals + any future API surface.
        disallow: ["/api/", "/_next/", "/static/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.url,
  };
}
