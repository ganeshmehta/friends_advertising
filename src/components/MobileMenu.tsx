"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { primaryNav } from "@/lib/nav";
import { siteConfig } from "@/lib/site";

type Props = {
  /** Visual variant: header (dark text on light) or panel (matches PanelNav). */
  variant?: "light" | "dark";
};

/**
 * Hamburger button + animated fullscreen overlay shown on screens narrower
 * than the desktop nav breakpoint (`md` / 768 px for Header,
 * 880 px for PanelNav). Hidden on `md:` and above.
 *
 * IMPORTANT: The overlay is rendered into `document.body` via createPortal.
 * Both `Header.nav-glass` and `.page-panel-nav` use `backdrop-filter`, which
 * (per CSS spec) makes the ancestor the containing block for `position: fixed`
 * descendants — i.e. a fixed-positioned overlay rendered INSIDE the nav gets
 * clamped to the nav's box (≈ 365×72) instead of covering the viewport.
 * Portaling out of that subtree restores correct viewport-relative fixed
 * positioning so the dark overlay actually fills the screen and accepts taps
 * across the entire surface.
 */
export default function MobileMenu({ variant = "light" }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelId = useId();

  // The portal target (document.body) is only available on the client.
  // The lint targets sync setState in effect bodies; here it's intentional
  // because we need to flip from a deterministic SSR value (false) to true
  // exactly once after hydration so the portal mounts. Same pattern as
  // src/components/SiteLoader.tsx.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Lock body scroll while the menu is open and close on ESC.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Close on route change without a sync-setState effect:
  // every nav link in the overlay calls close() in its onClick handler.
  const close = () => setOpen(false);

  const barColor = variant === "dark" ? "#ffffff" : "#0a0a0a";

  const overlay = (
    <AnimatePresence>
      {open && (
        <motion.div
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden fixed inset-0 z-[9000] bg-[#0a0a0a]/95 backdrop-blur-xl"
          onClick={(e) => {
            // Close when tapping the backdrop (not the inner panel).
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <motion.nav
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            aria-label="Mobile primary"
            className="flex h-full flex-col px-8 pt-28 pb-12"
          >
            <ul className="flex flex-col gap-1">
              {primaryNav.map((link, i) => {
                const isActive = pathname === link.href;
                return (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.06 + i * 0.04, ease: "easeOut" }}
                  >
                    <Link
                      href={link.href}
                      onClick={close}
                      aria-current={isActive ? "page" : undefined}
                      className={`group flex items-baseline justify-between border-b border-white/10 py-5 text-3xl font-bold tracking-tight transition-colors ${
                        isActive ? "text-white" : "text-white/65 hover:text-white"
                      }`}
                    >
                      <span>{link.longLabel ?? link.label}</span>
                      <span
                        aria-hidden
                        className={`text-sm tracking-[0.3em] transition-transform ${
                          isActive ? "text-[var(--neon-blue)]" : "text-white/30"
                        } group-hover:translate-x-1`}
                      >
                        0{i + 1}
                      </span>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>

            <div className="mt-auto flex flex-col gap-4">
              <Link
                href="/contact"
                onClick={close}
                className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.24em] text-black transition-transform active:scale-[0.98]"
              >
                Let&rsquo;s Talk
              </Link>
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">
                {siteConfig.name}
              </p>
            </div>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="md:hidden relative z-[60] inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/80 backdrop-blur-md shadow-sm transition-colors hover:bg-white"
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        <span className="relative block h-3.5 w-5">
          <motion.span
            aria-hidden
            className="absolute left-0 right-0 block h-[2px] rounded-full"
            style={{ backgroundColor: barColor, top: "2px" }}
            animate={open ? { rotate: 45, top: "7px" } : { rotate: 0, top: "2px" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          />
          <motion.span
            aria-hidden
            className="absolute left-0 right-0 block h-[2px] rounded-full"
            style={{ backgroundColor: barColor, top: "12px" }}
            animate={open ? { rotate: -45, top: "7px" } : { rotate: 0, top: "12px" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          />
        </span>
      </button>

      {mounted ? createPortal(overlay, document.body) : null}
    </>
  );
}
