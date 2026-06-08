import type { Metadata } from "next";
import { createPageMetadata, createBreadcrumbJsonLd } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = createPageMetadata({
  title: "Contact Us",
  description:
    "Start an outdoor campaign with Friends Advertising — call, email, or send us a brief. Average response time under 4 hours.",
  path: "/contact",
  keywords: [
    "contact Friends Advertising",
    "billboard quote Mumbai",
    "outdoor advertising enquiry",
  ],
});

const breadcrumbJsonLd = createBreadcrumbJsonLd([{ name: "Contact", path: "/contact" }]);

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      {children}
    </>
  );
}
