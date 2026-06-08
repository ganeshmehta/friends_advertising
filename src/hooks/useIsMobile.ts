"use client";

import { useEffect, useState } from "react";

/**
 * Returns `true` once the document confirms the viewport is narrower than
 * the desktop breakpoint (≈ 768 px) AND the device has no fine pointer
 * (rules out small windows on a laptop). Defaults to `false` during SSR
 * and the first client render so the heavy desktop tree mounts only when
 * we are confident the device can take it; mobile is opt-in.
 *
 * Used to gate expensive 3D scenes, autoplaying background videos, and the
 * cinematic boot loader so phones get a fast static-first experience while
 * desktops keep the full art-directed flow.
 */
export function useIsMobile(query: string = "(max-width: 767px), (pointer: coarse) and (max-width: 1024px)"): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const apply = () => setIsMobile(mql.matches);
    apply();
    // Safari < 14 lacks addEventListener on MediaQueryList — guard for it.
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", apply);
      return () => mql.removeEventListener("change", apply);
    }
    mql.addListener(apply);
    return () => mql.removeListener(apply);
  }, [query]);

  return isMobile;
}
