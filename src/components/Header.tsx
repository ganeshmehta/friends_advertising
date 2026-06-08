"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { primaryNav } from "@/lib/nav";
import { siteConfig } from "@/lib/site";
import MobileMenu from "@/components/MobileMenu";

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "nav-glass py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl 2xl:max-w-[1480px] mx-auto px-6 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center"
          aria-label={`${siteConfig.name} — Home`}
        >
          <Image
            src="/logos/Brand_Logo.png"
            alt={`${siteConfig.name} logo`}
            width={160}
            height={160}
            priority
            sizes="(min-width: 768px) 48px, 40px"
            className={`h-10 w-auto object-contain transition-all duration-300 md:h-12 ${
              isScrolled ? "md:h-11" : ""
            }`}
          />
        </Link>

        <nav className="hidden md:flex items-center gap-10" aria-label="Primary">
          {primaryNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={`relative text-[11px] uppercase tracking-[0.2em] font-semibold transition-all duration-300 hover:text-[var(--foreground)] ${
                pathname === link.href ? "text-[var(--foreground)]" : "text-[var(--foreground-secondary)]"
              }`}
            >
              {link.label}
              {pathname === link.href && (
                <motion.div
                  layoutId="underline"
                  className="absolute left-0 right-0 h-[2px] -bottom-2 bg-[var(--neon-blue)] rounded-full"
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-6">
          <Link
            href="/contact"
            className="hidden md:inline-flex items-center justify-center px-6 py-2 text-[10px] uppercase tracking-[0.2em] font-bold text-white transition-all duration-300 bg-black hover:bg-black/85 rounded-full border border-black/10 shadow-sm"
          >
            Let&rsquo;s Talk
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
