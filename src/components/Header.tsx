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
      className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
        isScrolled 
          ? "nav-glass py-3" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tighter flex items-center gap-2">
          <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            FRIENDS
          </span>
          <span className="text-[var(--neon-blue)] neon-text text-3xl">.</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-10">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`relative text-xs uppercase tracking-[0.2em] font-semibold transition-all duration-300 hover:text-white ${
                pathname === link.href ? "text-white" : "text-gray-400"
              }`}
            >
              {link.label}
              {pathname === link.href && (
                <motion.div 
                  layoutId="underline"
                  className="absolute left-0 right-0 h-[1.5px] -bottom-2 bg-[var(--neon-blue)] shadow-[0_0_8px_rgba(0,243,255,0.8)]"
                />
              )}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center gap-6">
          <Link 
            href="/contact" 
            className="hidden md:inline-flex items-center justify-center px-8 py-2.5 text-[10px] uppercase tracking-[0.2em] font-bold text-white transition-all duration-300 border border-white/10 rounded-full hover:bg-white hover:text-black hover:border-white shadow-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Let's Talk
          </Link>
        </div>
      </div>
    </header>
  );
}
