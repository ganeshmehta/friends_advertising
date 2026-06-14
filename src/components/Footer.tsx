import Image from "next/image";
import Link from "next/link";
import { primaryNav } from "@/lib/nav";
import { siteConfig } from "@/lib/site";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="px-4 pb-5 pt-12 md:px-6">
      <div className="relative mx-auto max-w-7xl 2xl:max-w-[1480px] overflow-hidden rounded-[28px] bg-[linear-gradient(155deg,#0d2440,#173b62)] px-6 pb-6 pt-8 text-[#e6f3fb] shadow-[0_40px_80px_-50px_rgba(13,36,64,0.7)] md:px-10 md:pb-7 md:pt-10">
        {/* radial accents */}
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(120% 140% at 0% 0%, rgba(15,195,205,0.18), transparent 55%), radial-gradient(120% 140% at 100% 0%, rgba(92,96,245,0.18), transparent 55%)",
          }}
        />
        {/* top brand stripe */}
        <div
          className="absolute inset-x-0 top-0 h-[3px] opacity-95"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(90deg, var(--neon-purple), var(--neon-blue))",
          }}
        />

        <div className="relative grid items-start gap-10 md:grid-cols-[1.5fr_0.85fr_1.1fr]">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <p className="m-0 inline-flex items-center gap-3 text-[1rem] font-extrabold tracking-tight text-white">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-[11px] bg-white p-1.5 shadow-[0_10px_22px_-10px_rgba(0,113,227,0.6)]">
                <Image
                  src="/logos/Brand_Logo.png"
                  alt={`${siteConfig.name} logo`}
                  width={120}
                  height={120}
                  sizes="48px"
                  className="h-full w-full object-contain"
                />
              </span>
              <span>{siteConfig.name}</span>
            </p>
            <h3 className="m-0 max-w-[22ch] text-[clamp(1.15rem,1.8vw,1.5rem)] font-extrabold leading-tight tracking-tight text-white">
              Best Outdoor Media Company in Navi Mumbai
            </h3>
            <p className="m-0 max-w-[42ch] text-[0.92rem] leading-relaxed text-[rgba(206,229,240,0.86)]">
              The complete outdoor solution for brands across Maharashtra — from
              billboards and transit media to integrated campaign planning.
            </p>
            <div className="mt-1.5">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-[0.88rem] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:border-transparent hover:bg-[linear-gradient(135deg,var(--neon-blue),var(--neon-purple))]"
              >
                Start a campaign <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Explore */}
          <nav aria-label="Footer" className="flex flex-col gap-3">
            <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[rgba(143,198,227,0.9)]">
              Explore
            </p>
            <ul className="m-0 grid list-none gap-2 p-0">
              {primaryNav.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.92rem] font-semibold text-[rgba(230,243,251,0.85)] transition-all duration-150 hover:translate-x-0.5 hover:text-white"
                  >
                    {link.longLabel ?? link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="flex flex-col gap-3">
            <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[rgba(143,198,227,0.9)]">
              Get in touch
            </p>
            <ul className="m-0 grid list-none gap-3.5 p-0">
              <li className="grid gap-0.5 text-[0.92rem] text-[rgba(230,243,251,0.92)]">
                <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[rgba(143,198,227,0.8)]">
                  Email
                </span>
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="break-words font-semibold text-white transition-colors duration-150 hover:text-[var(--neon-blue)]"
                >
                  {siteConfig.contact.email}
                </a>
              </li>
              <li className="grid gap-0.5 text-[0.92rem] text-[rgba(230,243,251,0.92)]">
                <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[rgba(143,198,227,0.8)]">
                  Phone
                </span>
                <a
                  href={`tel:${siteConfig.contact.phoneRaw}`}
                  className="font-semibold text-white transition-colors duration-150 hover:text-[var(--neon-blue)]"
                >
                  {siteConfig.contact.phone}
                </a>
              </li>
              <li className="grid gap-0.5 text-[0.92rem] text-[rgba(230,243,251,0.92)]">
                <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[rgba(143,198,227,0.8)]">
                  Office
                </span>
                <span>{siteConfig.contact.address1.city}, {siteConfig.contact.address1.region}, India</span>
                <span>{siteConfig.contact.address2.city}, {siteConfig.contact.address2.region}, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="relative mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.08] pt-4 text-[0.76rem] text-[rgba(180,205,222,0.7)]">
          <p className="m-0">© {year} {siteConfig.legalName}. All rights reserved.</p>
          <p className="m-0 italic text-[rgba(143,198,227,0.65)]">
            Crafted for brands that want to be seen everywhere that matters.
          </p>
        </div>
      </div>
    </footer>
  );
}
