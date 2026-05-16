"use client";

import dynamic from "next/dynamic";
import EyeFollow from "@/components/EyeFollow";
import { ArrowRight, MapPin, Monitor, Megaphone, Flag, Sparkles, TrendingUp, Eye, MousePointer2 } from "lucide-react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";

// Dynamically import 3D components
const Billboard3D = dynamic(() => import("@/components/Billboard3D"), { ssr: false });
const ScrollJourney = dynamic(() => import("@/components/ScrollJourney"), { ssr: false });

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
          className="fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40"
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
        {/* Contrast Backdrop Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 z-0 pointer-events-none"></div>

        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="z-10 text-center max-w-5xl mx-auto px-4 mb-4 flex flex-col items-center"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--neon-blue)] bg-black/40 text-[var(--neon-blue)] text-xs font-bold mb-6 uppercase tracking-widest shadow-[0_0_20px_rgba(0,243,255,0.2)]"
          >
            <Sparkles className="w-3 h-3" />
            <span>Future of OOH Advertising</span>
          </motion.div>

          <h1 className="text-6xl md:text-9xl font-black mb-6 tracking-tighter leading-tight text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
            DOMINATE THE <br />
            <span className="neon-text text-[var(--neon-blue)] brightness-125">SKYLINE.</span>
          </h1>

          <p className="text-xl md:text-2xl text-white font-medium mb-8 max-w-2xl leading-relaxed drop-shadow-md">
            We engineer massive, unmissable brand experiences across Mumbai and Satara.
          </p>
        </motion.div>

        {/* The 3D Billboard */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="z-20 w-full flex-1 min-h-[40vh] relative -mt-10"
        >
          {isMounted && <Billboard3D />}
        </motion.div>
      </section>

      {/* Marquee */}
      <div className="w-full bg-[var(--neon-purple)] py-3 overflow-hidden relative z-30">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ ease: "linear", duration: 20, repeat: Infinity }}
          className="whitespace-nowrap flex gap-8 items-center text-black font-black text-xl uppercase tracking-widest"
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
            {/* High-Contrast Glow Backdrop */}
            <div className="absolute -inset-10 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

            <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[var(--accent)] to-transparent opacity-80"></div>
            <div className="flex-1 space-y-6 relative z-10">
              <div className="text-[var(--accent)] font-black tracking-[0.3em] text-xs uppercase flex items-center gap-3">
                <span className="w-12 h-[2px] bg-[var(--accent)]"></span>
                THE CHALLENGE
              </div>
              <h2 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter text-white">
                In a noisy world, <br />
                <span className="text-[var(--accent)] brightness-150 drop-shadow-[0_0_20px_rgba(255,0,85,0.4)]">whispering is invisible.</span>
              </h2>
              <p className="text-xl md:text-2xl text-white font-medium leading-relaxed max-w-2xl drop-shadow-sm">
                Digital ads are scrolled past in milliseconds. Screens are crowded. To truly capture attention, your brand needs to step out of the phone and into the real world.
              </p>
            </div>
            <div className="w-32 h-32 md:w-64 md:h-64 rounded-full border-2 border-[var(--accent)]/50 flex items-center justify-center bg-[var(--accent)]/10 relative z-10 shadow-[0_0_50px_rgba(255,0,85,0.2)]">
              <EyeFollow />
            </div>
          </div>

          {/* Chapter 2: The Solution */}
          <div className="flex flex-col md:flex-row-reverse gap-12 items-center relative group">
            {/* High-Contrast Glow Backdrop */}
            <div className="absolute -inset-10 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

            <div className="absolute -right-6 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[var(--neon-blue)] to-transparent opacity-80"></div>
            <div className="flex-1 space-y-6 relative z-10 text-right md:text-left">
              <div className="text-[var(--neon-blue)] font-black tracking-[0.3em] text-xs uppercase flex items-center justify-end md:justify-start gap-3">
                <span className="hidden md:block w-12 h-[2px] bg-[var(--neon-blue)]"></span>
                THE SOLUTION
                <span className="md:hidden w-12 h-[2px] bg-[var(--neon-blue)]"></span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter text-white">
                Command attention <br />
                <span className="text-[var(--neon-blue)] brightness-150 drop-shadow-[0_0_20px_rgba(0,243,255,0.4)]">where it counts.</span>
              </h2>
              <p className="text-xl md:text-2xl text-white font-medium leading-relaxed max-w-2xl ml-auto md:ml-0 drop-shadow-sm">
                From 50x50 ft highway titans to high-contrast LED glow signs, we place your message in the direct line of sight of thousands of daily commuters.
              </p>
            </div>
            <div className="w-32 h-32 md:w-64 md:h-64 rounded-full border-2 border-[var(--neon-blue)]/50 flex items-center justify-center bg-[var(--neon-blue)]/10 relative z-10 shadow-[0_0_50px_rgba(0,243,255,0.2)]">
              <Megaphone className="w-24 h-24 text-[var(--neon-blue)] drop-shadow-[0_0_30px_rgba(0,243,255,0.8)]" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Services Showcase */}
      <section className="py-24 px-4 bg-[var(--background)] relative border-t border-white/5 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6">OUR ARSENAL</h2>
            <div className="w-24 h-1 bg-[var(--neon-blue)]"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            <motion.div
              whileHover={{ scale: 0.98 }}
              className="md:col-span-2 glass rounded-3xl p-8 flex flex-col justify-end relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/40 to-transparent z-10"></div>
              <div className="absolute inset-0 opacity-10 group-hover:opacity-30 transition-opacity bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--neon-blue)] via-transparent to-transparent"></div>
              <div className="relative z-20">
                <MapPin className="w-10 h-10 text-[var(--neon-blue)] mb-4" />
                <h3 className="text-3xl font-bold mb-2">Flex Board Giants</h3>
                <p className="text-white/70 group-hover:text-white transition-colors">Dominate highways with large-format prints.</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 0.98 }}
              className="glass rounded-3xl p-8 flex flex-col justify-end relative overflow-hidden group cursor-pointer border border-white/5 hover:border-[var(--neon-purple)]/30 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/40 to-transparent z-10"></div>
              <div className="absolute inset-0 opacity-10 group-hover:opacity-30 transition-opacity bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--neon-purple)] via-transparent to-transparent"></div>
              <div className="relative z-20">
                <Monitor className="w-10 h-10 text-[var(--neon-purple)] mb-4" />
                <h3 className="text-2xl font-bold mb-2">LED & Glow Signs</h3>
                <p className="text-white/70 group-hover:text-white transition-colors">Round-the-clock visibility.</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 0.98 }}
              className="glass rounded-3xl p-8 flex flex-col justify-end relative overflow-hidden group cursor-pointer border border-white/5 hover:border-white/20 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/40 to-transparent z-10"></div>
              <div className="relative z-20">
                <Flag className="w-10 h-10 text-white mb-4" />
                <h3 className="text-2xl font-bold mb-2">Event Banners</h3>
                <p className="text-white/70 group-hover:text-white transition-colors">Custom promotional materials.</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 0.98 }}
              className="md:col-span-2 glass rounded-3xl p-8 flex flex-col justify-end relative overflow-hidden group cursor-pointer border border-[var(--neon-blue)]/10 hover:border-[var(--neon-blue)]/40 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)]/40 to-transparent z-10"></div>
              <div className="relative z-20 flex justify-between items-end">
                <div>
                  <TrendingUp className="w-10 h-10 text-[var(--neon-blue)] mb-4" />
                  <h3 className="text-3xl font-bold mb-2">See All Services</h3>
                  <p className="text-white/70 group-hover:text-white transition-colors">Explore our complete range of OOH assets.</p>
                </div>
                <Link href="/services" className="w-14 h-14 rounded-full bg-[var(--neon-blue)] text-black flex items-center justify-center hover:scale-110 transition-transform">
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-96 bg-[var(--neon-blue)] rounded-full mix-blend-screen filter blur-[200px] opacity-20"></div>
        </div>

        <div className="relative z-10 text-center glass p-12 md:p-20 rounded-3xl border border-white/10 max-w-4xl w-full">
          <h2 className="text-5xl md:text-7xl font-black mb-8">READY TO BE <br /><span className="text-[var(--neon-purple)] neon-text">SEEN?</span></h2>
          <Link href="/contact" className="group relative inline-flex items-center justify-center px-10 py-5 font-bold text-white transition-all duration-200 bg-transparent border-2 border-[var(--neon-blue)] rounded-full hover:bg-[var(--neon-blue)] hover:text-black hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] text-xl">
            Start Your Campaign
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </section>
    </main>
  );
}


