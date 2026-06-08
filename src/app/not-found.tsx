import Link from "next/link";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Page not found",
  description: "We could not find what you were looking for.",
  path: "/404",
  noindex: true,
});

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-32 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-[var(--neon-blue)]">
        404
      </p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-[var(--foreground)] md:text-6xl">
        We can&rsquo;t find that page.
      </h1>
      <p className="mt-4 max-w-md text-base text-[var(--foreground-secondary)]">
        The link may be broken, or the page may have been moved. Let&rsquo;s get
        you back to safe ground.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-transform duration-200 hover:-translate-y-0.5"
      >
        Take me home
      </Link>
    </section>
  );
}
