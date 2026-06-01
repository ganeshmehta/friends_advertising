"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

export default function PanelNav() {
  const pathname = usePathname();

  return (
    <div className="page-panel-nav" role="navigation" aria-label="Primary">
      <Link href="/" className="page-panel-brand" aria-label="Friends Advertising — Home">
        <span>FRIENDS</span>
        <span className="page-panel-brand-dot" aria-hidden="true">
          .
        </span>
      </Link>

      <nav className="page-panel-links">
        {links.map((l) => {
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

      <Link href="/contact" className="page-panel-cta">
        Let&apos;s Talk
      </Link>
    </div>
  );
}
