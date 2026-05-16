"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Header() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/services", label: "Services" },
    { href: "/projects", label: "Projects" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 glass border-b-0 border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tighter">
          FRIENDS<span className="text-[var(--neon-blue)]">.</span>
        </Link>
        
        <nav className="hidden md:flex gap-8">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`relative text-sm font-medium transition-colors hover:text-white ${pathname === link.href ? "text-white" : "text-gray-400"}`}
            >
              {link.label}
              {pathname === link.href && (
                <motion.div 
                  layoutId="underline"
                  className="absolute left-0 right-0 h-[2px] -bottom-2 bg-[var(--neon-blue)] neon-text"
                />
              )}
            </Link>
          ))}
        </nav>
        
        <Link href="/contact" className="hidden md:inline-flex items-center justify-center px-6 py-2 text-sm font-bold text-white transition-all duration-200 border border-white/20 rounded-full hover:bg-white hover:text-black">
          Let's Talk
        </Link>
      </div>
    </header>
  );
}
