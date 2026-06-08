import type { Metadata } from "next";
import { createPageMetadata, createBreadcrumbJsonLd } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";

export const metadata: Metadata = createPageMetadata({
  title: "Projects & Network",
  description:
    "Live inventory of premium outdoor sites across Maharashtra — search by city, status, and competitor adjacency. On-site photographs available for select hoardings.",
  path: "/projects",
  keywords: [
    "billboard inventory Mumbai",
    "hoarding locations Pune",
    "outdoor advertising network Maharashtra",
  ],
});

const breadcrumbJsonLd = createBreadcrumbJsonLd([{ name: "Projects", path: "/projects" }]);

export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      {children}
    </>
  );
}
