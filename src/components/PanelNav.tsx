"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNav } from "@/lib/nav";
import { siteConfig } from "@/lib/site";
import MobileMenu from "@/components/MobileMenu";

export default function PanelNav() {
  const pathname = usePathname();

  return (
    <div className="page-panel-nav" role="navigation" aria-label="Primary">
      <Link
        href="/"
        className="page-panel-brand"
        aria-label={`${siteConfig.name} — Home`}
      >
        <Image
          src="/logos/Brand_Logo.png"
          alt={`${siteConfig.name} logo`}
          width={140}
          height={140}
          priority
          sizes="40px"
          className="page-panel-brand-img"
        />
      </Link>

      <nav className="page-panel-links">
        {primaryNav.map((l) => {
          const isActive = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`page-panel-link${isActive ? " is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3">
        <Link href="/contact" className="page-panel-cta">
          Let&apos;s Talk
        </Link>
        <MobileMenu />
      </div>
    </div>
  );
}
