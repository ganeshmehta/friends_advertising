"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PanelNav from "@/components/PanelNav";

export default function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    if (isHome) return;
    let raf = 0;
    let pendingX = 0;
    let pendingY = 0;
    const apply = () => {
      raf = 0;
      document.documentElement.style.setProperty("--mx", `${pendingX}px`);
      document.documentElement.style.setProperty("--my", `${pendingY}px`);
    };
    const onMove = (e: MouseEvent) => {
      pendingX = e.clientX;
      pendingY = e.clientY;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isHome]);

  if (isHome) {
    return (
      <>
        <Header />
        <div className="flex-1 pt-20 relative z-0">{children}</div>
        <div className="page-home-footer">
          <Footer />
        </div>
      </>
    );
  }

  return (
    <div className="page-shell-bg flex-1 relative z-0">
      <div className="page-shell-grid" aria-hidden="true" />
      <div className="page-shell-spot" aria-hidden="true" />
      <div className="page-shell-wrap">
        <div className="page-panel">
          <PanelNav />
          <div className="page-panel-body">{children}</div>
          <div className="page-panel-footer">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
