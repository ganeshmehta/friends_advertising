import type { Metadata } from "next";
import { siteConfig, absoluteUrl } from "./site";

export type PageMetaInput = {
  /** Page-specific title (will be appended to the site title template). */
  title: string;
  /** Page-specific description (140–160 chars recommended). */
  description?: string;
  /** Workspace-relative path used for canonical + OG URL. */
  path: string;
  /** Additional keywords merged with the global keyword set. */
  keywords?: string[];
  /** OG image override (path or absolute URL). Defaults to site default. */
  image?: string;
  /** Set true to discourage indexing (e.g., preview / WIP pages). */
  noindex?: boolean;
};

/**
 * Factory that produces a consistent {@link Metadata} object for every route.
 * Encapsulates the OpenGraph + Twitter + canonical wiring so each page only
 * declares what's unique about itself — keeps SEO consistent and avoids drift.
 */
export function createPageMetadata({
  title,
  description = siteConfig.description,
  path,
  keywords = [],
  image = siteConfig.defaultOgImage,
  noindex = false,
}: PageMetaInput): Metadata {
  const canonical = absoluteUrl(path);
  const ogImage = image.startsWith("http") ? image : absoluteUrl(image);

  return {
    title,
    description,
    keywords: Array.from(new Set([...siteConfig.keywords, ...keywords])),
    alternates: { canonical },
    robots: noindex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      site: siteConfig.social.twitter,
      creator: siteConfig.social.twitter,
    },
  };
}

/**
 * Build a schema.org `BreadcrumbList` JSON-LD payload for a single page.
 * Always prefixes the trail with the site root so SERPs render the full
 * navigation path. Pass the array of `{name, path}` from the homepage
 * downwards (excluding home — it's added automatically).
 */
export function createBreadcrumbJsonLd(
  trail: ReadonlyArray<{ name: string; path: string }>,
): Record<string, unknown> {
  const items = [
    { name: "Home", path: "/" },
    ...trail,
  ].map((entry, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    name: entry.name,
    item: absoluteUrl(entry.path),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

