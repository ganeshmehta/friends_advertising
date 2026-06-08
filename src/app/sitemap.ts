import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { primaryNav } from "@/lib/nav";

/**
 * Static sitemap generated from the primary navigation. Update `primaryNav`
 * (or extend the list below) when new public routes are added.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return primaryNav.map((entry) => {
    const isHome = entry.href === "/";
    return {
      url: absoluteUrl(entry.href),
      lastModified: now,
      changeFrequency: isHome ? "weekly" : "monthly",
      priority: isHome ? 1 : 0.8,
    };
  });
}
