"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/site";

/**
 * Lightweight boot splash shown ONLY on mobile / coarse-pointer devices.
 *
 * Why a separate component instead of reusing SiteLoader:
 *   SiteLoader pre-fetches AND PARSES the road MP4 (5 MB) and the plane GLB
 *   (29 MB) so the desktop cinematic flow stays smooth. On a phone we throw
 *   those assets away entirely, so paying for the pre-fetch would be wasted
 *   bandwidth + watt-hours. This splash just animates the brand mark for
 *   ~1.2 s on the very first visit per session, then resolves.
 *
 * Re-uses the same `fa:site-loader-played` sessionStorage key so visits 2..N
 * skip both splashes alike — keeps behaviour consistent across breakpoints.
 */
const SESSION_KEY = "fa:site-loader-played";
const DURATION_MS = 1200;

export default function MobileSplash({ onDone }: { onDone?: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      const qs = new URLSearchParams(window.location.search);
      if (qs.get("noloader") === "1") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVisible(false);
        onDone?.();
        return;
      }
      if (qs.get("loader") !== "1" && sessionStorage.getItem(SESSION_KEY) === "1") {
        setVisible(false);
        onDone?.();
        return;
      }
    } catch {
      /* default to visible */
    }
    const id = window.setTimeout(() => {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }
      setVisible(false);
      onDone?.();
    }, DURATION_MS);
    return () => window.clearTimeout(id);
  }, [onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a1a3a] text-white"
        >
          {/* radial accents — pure CSS, no extra assets */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 90% at 50% 10%, rgba(15,195,205,0.18), transparent 60%), radial-gradient(120% 90% at 50% 100%, rgba(122,184,255,0.22), transparent 65%)",
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col items-center gap-5"
          >
            <Image
              src="/logos/Brand_Logo.png"
              alt=""
              width={96}
              height={96}
              priority
              sizes="96px"
              className="h-[72px] w-[72px] object-contain drop-shadow-[0_10px_30px_rgba(122,184,255,0.45)]"
            />
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[1rem] font-extrabold tracking-tight text-white">
                {siteConfig.name}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[rgba(206,229,240,0.75)]">
                {siteConfig.tagline}
              </span>
            </div>
            <motion.div
              className="mt-2 h-[2px] w-24 origin-left rounded-full bg-gradient-to-r from-[#7ab8ff] via-[#5c60f5] to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: DURATION_MS / 1000, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
