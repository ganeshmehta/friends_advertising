import type { Metadata } from "next";
import { createPageMetadata, createBreadcrumbJsonLd } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = createPageMetadata({
  title: "About Us",
  description:
    "Twelve years building outdoor brand experiences across Maharashtra — print, paint, light, rig. Friends Advertising delivers craft at scale.",
  path: "/about",
  keywords: ["about Friends Advertising", "OOH agency Maharashtra", "billboard installation"],
});

const breadcrumbJsonLd = createBreadcrumbJsonLd([{ name: "About", path: "/about" }]);

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      {children}
    </>
  );
}
