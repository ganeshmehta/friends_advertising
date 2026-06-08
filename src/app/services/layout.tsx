import type { Metadata } from "next";
import { createPageMetadata, createBreadcrumbJsonLd } from "@/lib/seo";
import { siteConfig, absoluteUrl } from "@/lib/site";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = createPageMetadata({
  title: "Services",
  description:
    "Flex hoardings, vinyl & digital print, LED & glow signs, transit wraps, event banners, and corporate indoor branding — delivered across Mumbai, Pune, and Maharashtra.",
  path: "/services",
  keywords: [
    "flex board printing",
    "LED sign boards Mumbai",
    "transit advertising",
    "vehicle wraps Pune",
  ],
});

const breadcrumbJsonLd = createBreadcrumbJsonLd([{ name: "Services", path: "/services" }]);

/**
 * Service catalog structured data — gives Google a machine-readable list of
 * the OOH formats we offer so SERP cards can render rich service rollups.
 * Mirrors the inventory shown on the page; update both when adding a format.
 */
const serviceCatalogJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Outdoor Advertising",
  provider: {
    "@type": "LocalBusiness",
    name: siteConfig.name,
    url: siteConfig.url,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
  },
  areaServed: [
    { "@type": "City", name: "Mumbai" },
    { "@type": "City", name: "Navi Mumbai" },
    { "@type": "City", name: "Pune" },
    { "@type": "AdministrativeArea", name: "Maharashtra" },
  ],
  url: absoluteUrl("/services"),
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "OOH Formats",
    itemListElement: [
      "Flex hoardings",
      "Vinyl & digital print",
      "LED & glow signs",
      "Transit wraps",
      "Event banners",
      "Corporate indoor branding",
    ].map((name) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name },
    })),
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={serviceCatalogJsonLd} />
      {children}
    </>
  );
}
