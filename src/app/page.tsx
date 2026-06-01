"use client";

import dynamic from "next/dynamic";
import EyeFollow from "@/components/EyeFollow";
import { ArrowRight, MapPin, Monitor, Flag, Sparkles, TrendingUp, Eye, MousePointer2 } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";

// Dynamically import 3D components
const ScrollJourney = dynamic(() => import("@/components/ScrollJourney"), { ssr: false });
const Megaphone3D = dynamic(() => import("@/components/Megaphone3D"), { ssr: false });

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Three-frame choreography for the FIXED background (ScrollJourney):
  //   FRAME 1  0.00 \u2013 0.32  globe + plane + brand
  //   FRAME 2  0.36 \u2013 0.56  chapter overlays
  //   Hero section + road video live INSIDE the hero <section> below and use
  //   whileInView so they fire exactly when scrolled into view (decoupled
  //   from the total page scroll length).
  const storyY = useTransform(scrollYProgress, [0.5, 0.7], [50, 0]);
  const storyOpacity = useTransform(scrollYProgress, (v) => {
    if (v <= 0.5) return 0;
    if (v >= 0.6) return 1;
    return (v - 0.5) / 0.1;
  });

  return (
    <main ref={containerRef} className="flex flex-col w-full overflow-hidden bg-[var(--background)]">
      {/* Cinematic Scroll Journey Background */}
      {isMounted && <ScrollJourney scrollYProgress={scrollYProgress} />}

      {/* Scroll Spacer for Journey (Initial Zoom & Atmospheric Entry) */}
      <section className="h-[250vh] w-full relative flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400"
        >
          <span className="text-[10px] font-bold tracking-[0.4em] uppercase">Scroll to Explore</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <MousePointer2 className="w-4 h-4 rotate-180" />
          </motion.div>
        </motion.div>
      </section>

      {/* Hero Section — DOMINATE THE SKYLINE over the road video */}
      <section className="relative w-full h-screen flex flex-col items-center justify-start pt-32 overflow-hidden z-20 bg-black">
        {/* Road video — full bleed background, locked to this section */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          // @ts-expect-error \u2014 non-standard but supported by Chromium/Safari
          disableRemotePlayback
          controlsList="nodownload nofullscreen noremoteplayback"
          className="absolute inset-0 w-full h-full object-cover saturate-[1.1] brightness-[0.95] contrast-[1.1] z-0"
          src="/videos/Temp_road.mp4"
        />
        {/* Dark overlays for legibility */}
        <div className="absolute inset-0 z-[1] bg-black/35 pointer-events-none" />
        <div className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(0,0,0,0.65)_100%)] pointer-events-none" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/50 via-transparent to-black/70 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.94 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="z-10 text-center max-w-5xl mx-auto px-4 mb-4 flex flex-col items-center"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/25 bg-black/30 text-white text-[10px] font-semibold mb-6 uppercase tracking-[0.18em] shadow-lg backdrop-blur-md"
          >
            <Sparkles className="w-3 h-3 text-[var(--neon-blue)]" />
            <span>Future of OOH Advertising</span>
          </div>

          <h1
            className="text-6xl md:text-8xl font-black mb-6 tracking-tight leading-none text-white"
            style={{
              textShadow:
                "0 4px 30px rgba(0,0,0,0.65), 0 0 60px rgba(0,0,0,0.45)",
            }}
          >
            DOMINATE THE <br />
            <span
              className="bg-gradient-to-r from-[#7ab8ff] via-[#5b8def] to-[#9d9dff] bg-clip-text text-transparent"
              style={{
                filter: "drop-shadow(0 4px 24px rgba(122,184,255,0.45))",
              }}
            >
              SKYLINE.
            </span>
          </h1>

          <p
            className="text-xl md:text-2xl text-white/90 font-medium mb-8 max-w-2xl leading-relaxed"
            style={{ textShadow: "0 2px 14px rgba(0,0,0,0.7)" }}
          >
            We engineer massive, unmissable brand experiences across Mumbai and Satara.
          </p>
        </motion.div>
      </section>

      {/* Marquee (Sleek High-Contrast Ticker) */}
      <div className="w-full bg-black py-4 overflow-hidden relative z-30 border-y border-black/10">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ ease: "linear", duration: 20, repeat: Infinity }}
          className="whitespace-nowrap flex gap-8 items-center text-white font-bold text-sm uppercase tracking-[0.25em]"
        >
          {Array(10).fill("COMPLETE OUTDOOR SOLUTION • UNMISSABLE IMPACT • ").map((text, i) => (
            <span key={i}>{text}</span>
          ))}
        </motion.div>
      </div>

      {/* Storytelling Section */}
      <section className="py-32 px-4 relative bg-[var(--background)] z-10">
        <motion.div
          style={{ y: storyY, opacity: storyOpacity }}
          className="max-w-4xl mx-auto space-y-32"
        >
          {/* Chapter 1: The Challenge */}
          <div className="flex flex-col md:flex-row gap-12 items-center relative group">
            {/* High-Contrast Soft Glow Backdrop */}
            <div className="absolute -inset-10 bg-slate-300/10 blur-[100px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

            <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[var(--accent)] to-transparent opacity-80"></div>
            <div className="flex-1 space-y-6 relative z-10">
              <div className="text-[var(--accent)] font-bold tracking-[0.3em] text-xs uppercase flex items-center gap-3">
                <span className="w-12 h-[2px] bg-[var(--accent)]"></span>
                THE CHALLENGE
              </div>
              <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-[#1d1d1f]">
                In a noisy world, <br />
                <span className="text-[var(--accent)]">whispering is invisible.</span>
              </h2>
              <p className="text-lg md:text-xl text-[var(--foreground-secondary)] font-medium leading-relaxed max-w-2xl">
                Digital ads are scrolled past in milliseconds. Screens are crowded. To truly capture attention, your brand needs to step out of the phone and into the real world.
              </p>
            </div>
            <div className="w-32 h-32 md:w-64 md:h-64 rounded-full border-2 border-slate-200 flex items-center justify-center bg-slate-50 relative z-10 shadow-sm transition-all duration-500 group-hover:border-slate-300">
              <EyeFollow />
            </div>
          </div>

          {/* Chapter 2: The Solution */}
          <div className="flex flex-col md:flex-row-reverse gap-12 items-center relative group">
            {/* High-Contrast Soft Glow Backdrop */}
            <div className="absolute -inset-10 bg-slate-300/10 blur-[100px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

            <div className="absolute -right-6 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[var(--neon-blue)] to-transparent opacity-80"></div>
            <div className="flex-1 space-y-6 relative z-10 text-right md:text-left">
              <div className="text-[var(--neon-blue)] font-bold tracking-[0.3em] text-xs uppercase flex items-center justify-end md:justify-start gap-3">
                <span className="hidden md:block w-12 h-[2px] bg-[var(--neon-blue)]"></span>
                THE SOLUTION
                <span className="md:hidden w-12 h-[2px] bg-[var(--neon-blue)]"></span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-[#1d1d1f]">
                Command attention <br />
                <span className="text-[var(--neon-blue)]">where it counts.</span>
              </h2>
              <p className="text-lg md:text-xl text-[var(--foreground-secondary)] font-medium leading-relaxed max-w-2xl ml-auto md:ml-0">
                From 50x50 ft highway titans to high-contrast LED glow signs, we place your message in the direct line of sight of thousands of daily commuters.
              </p>
            </div>
            <div className="w-48 h-48 md:w-80 md:h-80 rounded-full border-2 border-slate-200 flex items-center justify-center bg-slate-50 relative z-10 shadow-sm transition-all duration-500 group-hover:border-slate-300">
              {isMounted && <Megaphone3D />}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Services Showcase — THE ARSENAL */}
      <section className="py-32 px-4 bg-[var(--background)] relative border-t border-slate-100 z-10 overflow-hidden">
        {/* Background accents */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.025] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <div className="absolute top-1/3 -left-32 w-[28rem] h-[28rem] bg-[var(--neon-blue)] rounded-full mix-blend-multiply filter blur-[160px] opacity-[0.07]"></div>
          <div className="absolute bottom-1/4 -right-32 w-[28rem] h-[28rem] bg-[var(--neon-purple)] rounded-full mix-blend-multiply filter blur-[160px] opacity-[0.07]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000004_1px,transparent_1px),linear-gradient(to_bottom,#00000004_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section header */}
          <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-3 text-[var(--neon-blue)] font-bold tracking-[0.4em] text-xs uppercase mb-5"
              >
                <span className="w-10 h-[2px] bg-[var(--neon-blue)]"></span>
                Our Inventory
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-[#0a0a0c] leading-[0.95]"
              >
                THE{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-br from-[#0a0a0c] via-[#1d1d1f] to-[var(--neon-blue)]">
                    ARSENAL
                  </span>
                  <span className="absolute -bottom-2 left-0 right-0 h-3 bg-[var(--neon-blue)]/15 -z-0 skew-x-[-8deg]"></span>
                </span>
                .
              </motion.h2>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="max-w-md text-slate-600 font-medium text-lg leading-relaxed"
            >
              We own the most strategic advertising assets in the region —
              engineered for <span className="text-[#0a0a0c] font-bold">maximum visibility</span> and{" "}
              <span className="text-[#0a0a0c] font-bold">unmissable impact</span>.
            </motion.div>
          </div>

          {/* Top stat strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-px bg-slate-200 rounded-2xl overflow-hidden mb-10 border border-slate-200"
          >
            {[
              { label: "Premium Sites", value: "120+" },
              { label: "Daily Impressions", value: "8M+" },
              { label: "Cities Active", value: "12" },
              { label: "Brand Partners", value: "85+" },
            ].map((s) => (
              <div key={s.label} className="bg-white px-6 py-6 flex flex-col gap-1 hover:bg-slate-50 transition-colors">
                <span className="text-3xl md:text-4xl font-black tracking-tight text-[#0a0a0c]">{s.value}</span>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">{s.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[340px]">
            {/* CARD 1 — Flex Board Giants (dark hero card) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 220, damping: 24 }}
              className="md:col-span-2 md:row-span-1 rounded-[32px] p-10 relative overflow-hidden group cursor-pointer bg-gradient-to-br from-[#0a0a0c] via-[#111118] to-[#1a1a26] text-white shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] border border-white/5"
            >
              {/* Animated grid */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]"></div>
              {/* Color wash */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-[var(--neon-blue)] rounded-full blur-[120px] opacity-30 group-hover:opacity-50 transition-opacity duration-700"></div>
              {/* Floating ghost icon */}
              <MapPin className="absolute -bottom-8 -right-8 w-56 h-56 text-white/[0.04] group-hover:text-white/[0.07] transition-colors duration-700 rotate-12" />

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--neon-blue)]/15 border border-[var(--neon-blue)]/30 text-[var(--neon-blue)] text-[10px] font-bold tracking-[0.2em] uppercase">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-blue)] animate-pulse"></span>
                    Flagship
                  </div>
                  <div className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/40">01 / 04</div>
                </div>

                <div className="space-y-5">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--neon-blue)]/10 flex items-center justify-center border border-[var(--neon-blue)]/30 backdrop-blur-sm">
                    <MapPin className="w-7 h-7 text-[var(--neon-blue)]" />
                  </div>
                  <div>
                    <h3 className="text-4xl md:text-5xl font-black mb-3 tracking-tight leading-[0.95]">
                      Flex Board <span className="text-[var(--neon-blue)]">Giants.</span>
                    </h3>
                    <p className="text-base text-white/60 max-w-xl leading-relaxed">
                      Strategic high-traffic locations with massive format prints that command attention from miles away.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {["50×50 ft", "Highway Hubs", "Vinyl + LED"].map((tag) => (
                      <span key={tag} className="px-3 py-1 text-xs font-semibold rounded-full bg-white/5 border border-white/10 text-white/80">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CARD 2 — LED & Glow Signs (light premium) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, type: "spring", stiffness: 220, damping: 24 }}
              whileHover={{ y: -6 }}
              className="rounded-[32px] p-8 relative overflow-hidden group cursor-pointer bg-white border border-slate-200/80 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.15)] hover:shadow-[0_30px_70px_-25px_rgba(157,157,255,0.45)] transition-shadow duration-500"
            >
              <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-[var(--neon-purple)] rounded-full blur-[100px] opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>
              <Monitor className="absolute -bottom-6 -right-6 w-40 h-40 text-[var(--neon-purple)]/[0.04] group-hover:text-[var(--neon-purple)]/[0.08] transition-colors duration-700" />

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--neon-purple)]/10 text-[var(--neon-purple)] text-[10px] font-bold tracking-[0.2em] uppercase">
                    24 / 7
                  </div>
                  <div className="text-[10px] font-bold tracking-[0.25em] uppercase text-slate-400">02</div>
                </div>

                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--neon-purple)]/8 flex items-center justify-center border border-[var(--neon-purple)]/20">
                    <Monitor className="w-7 h-7 text-[var(--neon-purple)]" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black mb-2 tracking-tight text-[#0a0a0c]">
                      LED & Glow Signs
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      HD digital displays and backlit signs for round-the-clock brand brilliance.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 pt-2 border-t border-slate-100">
                    <Eye className="w-3.5 h-3.5" /> 4K Resolution
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CARD 3 — Event Banners */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 24 }}
              whileHover={{ y: -6 }}
              className="rounded-[32px] p-8 relative overflow-hidden group cursor-pointer bg-white border border-slate-200/80 shadow-[0_20px_60px_-25px_rgba(0,0,0,0.15)] hover:shadow-[0_30px_70px_-25px_rgba(0,0,0,0.3)] transition-shadow duration-500"
            >
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-slate-900 rounded-full blur-[120px] opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700"></div>
              <Flag className="absolute -bottom-4 -right-4 w-36 h-36 text-slate-900/[0.04] group-hover:text-slate-900/[0.07] transition-colors duration-700 -rotate-12" />

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/5 text-slate-900 text-[10px] font-bold tracking-[0.2em] uppercase">
                    Premium
                  </div>
                  <div className="text-[10px] font-bold tracking-[0.25em] uppercase text-slate-400">03</div>
                </div>

                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900/5 flex items-center justify-center border border-slate-900/10">
                    <Flag className="w-7 h-7 text-[#0a0a0c]" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black mb-2 tracking-tight text-[#0a0a0c]">
                      Event Banners
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Premium branding for corporate events and public gatherings.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 pt-2 border-t border-slate-100">
                    <Sparkles className="w-3.5 h-3.5" /> Same-day Setup
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CARD 4 — Full Scale Solutions (CTA wide card) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, type: "spring", stiffness: 220, damping: 24 }}
              whileHover={{ y: -6 }}
              className="md:col-span-2 rounded-[32px] p-10 relative overflow-hidden group cursor-pointer bg-gradient-to-br from-[#7ab8ff] via-[#5b8def] to-[var(--neon-blue)] text-white shadow-[0_30px_80px_-20px_rgba(91,141,239,0.55)] border border-white/10"
            >
              {/* Sheen */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.25),_transparent_60%)]"></div>
              <div className="absolute -bottom-32 -left-20 w-96 h-96 bg-white rounded-full blur-[120px] opacity-10"></div>
              <TrendingUp className="absolute -top-6 -right-6 w-44 h-44 text-white/10 group-hover:text-white/20 transition-colors duration-700 rotate-12" />

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 h-full">
                <div className="max-w-xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/30 text-white text-[10px] font-bold tracking-[0.2em] uppercase mb-5 backdrop-blur-sm">
                    Complete Catalog
                  </div>
                  <h3 className="text-3xl md:text-4xl font-black mb-3 tracking-tight leading-[1]">
                    Full Scale <br className="hidden md:block" />Solutions.
                  </h3>
                  <p className="text-base text-white/85 leading-relaxed">
                    Transit media, airport advertising, rural outreach — explore the full inventory.
                  </p>
                </div>
                <Link
                  href="/services"
                  className="group/btn relative inline-flex items-center gap-3 px-6 py-4 rounded-full bg-[#0a0a0c] text-white font-bold text-sm tracking-wider uppercase overflow-hidden hover:bg-white hover:text-[#0a0a0c] transition-colors duration-300 shadow-xl"
                >
                  <span className="relative z-10">View Arsenal</span>
                  <ArrowRight className="w-4 h-4 relative z-10 transition-transform group-hover/btn:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}


