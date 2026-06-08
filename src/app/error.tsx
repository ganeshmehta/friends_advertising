"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Route-level error boundary. Catches uncaught errors in any nested page and
 * logs them so they surface in browser dev tools / monitoring. The reset
 * callback re-renders the segment so users can recover without a full reload.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to whatever monitoring is wired up at the platform level.
    console.error("Route segment error:", error);
  }, [error]);

  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-32 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-[var(--accent)]">
        Something went wrong
      </p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--foreground)] md:text-5xl">
        We hit an unexpected snag.
      </h1>
      <p className="mt-4 max-w-md text-base text-[var(--foreground-secondary)]">
        The page failed to render. Try again, or head back to the home page.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-transform duration-200 hover:-translate-y-0.5"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-black transition-transform duration-200 hover:-translate-y-0.5"
        >
          Home
        </Link>
      </div>
    </section>
  );
}
