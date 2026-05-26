"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/services", label: "Services" },
    { href: "/projects", label: "Projects" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? "nav-glass py-3" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tighter flex items-center gap-2">
          <span className="bg-gradient-to-r from-black via-slate-800 to-slate-600 bg-clip-text text-transparent">
            FRIENDS
          </span>
          <span className="text-[var(--neon-blue)] text-3xl">.</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-10">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
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
        
        <div className="flex items-center gap-6">
          <Link 
            href="/contact" 
            className="hidden md:inline-flex items-center justify-center px-6 py-2 text-[10px] uppercase tracking-[0.2em] font-bold text-white transition-all duration-300 bg-black hover:bg-black/85 rounded-full border border-black/10 shadow-sm"
          >
            Let's Talk
          </Link>
        </div>
      </div>
    </header>
  );
}
