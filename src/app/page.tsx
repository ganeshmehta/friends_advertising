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

  // Journey and Hero transitions
  const journeyOpacity = useTransform(scrollYProgress, [0, 0.35, 0.45], [1, 1, 0]);
  const heroOpacity = useTransform(scrollYProgress, [0.35, 0.42, 0.75, 0.85], [0, 1, 1, 0]);
  const heroScale = useTransform(scrollYProgress, [0.35, 0.45], [0.8, 1]);
  const heroY = useTransform(scrollYProgress, [0.4, 0.6], [20, 0]);

  const storyY = useTransform(scrollYProgress, [0.5, 0.7], [50, 0]);
  const storyOpacity = useTransform(scrollYProgress, [0.5, 0.58], [0, 1]);

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

      {/* Hero Section - Becomes visible after atmospheric entry */}
      <section className="relative w-full h-screen flex flex-col items-center justify-start pt-32 overflow-hidden z-10">
        {/* Contrast Backdrop Overlay (Soft Light Blur) */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5 z-0 pointer-events-none"></div>

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="z-10 text-center max-w-5xl mx-auto px-4 mb-4 flex flex-col items-center"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-slate-100 text-slate-500 text-[10px] font-semibold mb-6 uppercase tracking-[0.15em] shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-[var(--neon-blue)]" />
            <span>Future of OOH Advertising</span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight leading-none text-[#1d1d1f]">
            DOMINATE THE <br />
            <span className="text-[var(--neon-blue)]">SKYLINE.</span>
          </h1>

          <p className="text-xl md:text-2xl text-[var(--foreground-secondary)] font-medium mb-8 max-w-2xl leading-relaxed">
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

      {/* Services Showcase */}
      <section className="py-32 px-4 bg-[var(--background)] relative border-t border-slate-100 z-10 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[var(--neon-blue)] rounded-full mix-blend-multiply filter blur-[150px] opacity-[0.05] animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[var(--neon-purple)] rounded-full mix-blend-multiply filter blur-[150px] opacity-[0.05] animate-pulse" style={{ animationDelay: '2s' }}></div>
          
          {/* Tech Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000003_1px,transparent_1px),linear-gradient(to_bottom,#00000003_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-[var(--neon-blue)] font-bold tracking-[0.4em] text-xs uppercase mb-4"
              >
                Our Inventory
              </motion.div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tight text-[#1d1d1f]">
                THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-black via-slate-800 to-slate-500">ARSENAL</span>
              </h2>
            </div>
            <div className="max-w-md text-slate-500 font-medium text-lg leading-relaxed">
              We own the most strategic advertising assets in the region, engineered for maximum visibility and impact.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="md:col-span-2 glass rounded-[32px] p-10 flex flex-col justify-end relative overflow-hidden group cursor-pointer border border-black/5 hover:border-black/10 hover:shadow-xl transition-all duration-500"
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <MapPin className="w-48 h-48 text-[var(--neon-blue)] -mr-12 -mt-12 rotate-12" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent z-10"></div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[var(--neon-blue)] via-transparent to-transparent"></div>
              
              <div className="relative z-20">
                <div className="w-12 h-12 rounded-2xl bg-[var(--neon-blue)]/5 flex items-center justify-center mb-6 border border-[var(--neon-blue)]/10">
                  <MapPin className="w-6 h-6 text-[var(--neon-blue)]" />
                </div>
                <h3 className="text-3xl font-black mb-3 tracking-tight text-[#1d1d1f]">Flex Board Giants</h3>
                <p className="text-lg text-slate-500 group-hover:text-slate-700 transition-colors max-w-xl">
                  Strategic high-traffic locations with massive format prints that command attention from miles away.
                </p>
              </div>
              
              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[2px] h-8 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 h-[2px] w-8 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -5 }}
              className="glass rounded-[32px] p-10 flex flex-col justify-end relative overflow-hidden group cursor-pointer border border-black/5 hover:border-black/10 hover:shadow-xl transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent z-10"></div>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[var(--neon-purple)] via-transparent to-transparent"></div>
              
              <div className="relative z-20">
                <div className="w-12 h-12 rounded-2xl bg-[var(--neon-purple)]/5 flex items-center justify-center mb-6 border border-[var(--neon-purple)]/10">
                  <Monitor className="w-6 h-6 text-[var(--neon-purple)]" />
                </div>
                <h3 className="text-2xl font-black mb-3 tracking-tight text-[#1d1d1f]">LED & Glow Signs</h3>
                <p className="text-base text-slate-500 group-hover:text-slate-700 transition-colors">
                  High-definition digital displays and backlit signs for 24/7 brand brilliance.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="glass rounded-[32px] p-10 flex flex-col justify-end relative overflow-hidden group cursor-pointer border border-black/5 hover:border-black/10 hover:shadow-xl transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent z-10"></div>
              <div className="relative z-20">
                <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center mb-6 border border-black/10">
                  <Flag className="w-6 h-6 text-[#1d1d1f]" />
                </div>
                <h3 className="text-2xl font-black mb-3 tracking-tight text-[#1d1d1f]">Event Banners</h3>
                <p className="text-base text-slate-500 group-hover:text-slate-700 transition-colors">
                  Premium branding materials for corporate events and public gatherings.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              whileHover={{ y: -5 }}
              className="md:col-span-2 glass rounded-[32px] p-10 flex flex-col justify-end relative overflow-hidden group cursor-pointer border border-black/5 hover:border-black/10 hover:shadow-xl transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent z-10"></div>
              <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-[var(--neon-blue)]/[0.02] to-transparent z-0"></div>
              
              <div className="relative z-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 w-full">
                <div className="max-w-xl">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--neon-blue)]/5 flex items-center justify-center mb-6 border border-[var(--neon-blue)]/10">
                    <TrendingUp className="w-6 h-6 text-[var(--neon-blue)]" />
                  </div>
                  <h3 className="text-3xl font-black mb-3 tracking-tight text-[#1d1d1f]">Full Scale Solutions</h3>
                  <p className="text-lg text-slate-500 group-hover:text-slate-700 transition-colors">
                    Explore our complete catalog of transit media, airport advertising, and rural outreach programs.
                  </p>
                </div>
                <Link href="/services" className="relative w-16 h-16 rounded-full bg-black text-white flex items-center justify-center overflow-hidden transition-all hover:scale-105 hover:bg-black/90 shadow-sm">
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive CTA */}
      <section className="py-32 px-4 relative overflow-hidden flex items-center justify-center z-10">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-96 bg-[var(--neon-blue)] rounded-full mix-blend-multiply filter blur-[200px] opacity-[0.08]"></div>
        </div>

        <div className="relative z-10 text-center glass p-12 md:p-20 rounded-[48px] border border-black/5 max-w-4xl w-full">
          <h2 className="text-4xl md:text-6xl font-black mb-8 text-[#1d1d1f] tracking-tight">READY TO BE <br /><span className="text-[var(--neon-purple)]">SEEN?</span></h2>
          <Link href="/contact" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-300 bg-black hover:bg-black/90 rounded-full shadow-sm hover:shadow-lg text-lg">
            Start Your Campaign
            <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </main>
  );
}


