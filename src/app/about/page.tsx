"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Users,
  Target,
  Award,
  MapPin,
  Quote,
  Building2,
  Handshake,
  Sparkles,
  Rocket,
  ArrowRight,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CityLightsBackground } from "@/components/about/CityLights";
import "@/styles/about-cinematic.css";

/* ============================================================================
   Data
   ============================================================================ */

const testimonials = [
  {
    name: "ABP Majha",
    quote:
      "Friends Advertising has been instrumental in enhancing our visibility in Maharashtra. Their strategic hoarding placements and professional execution have helped us reach our target audience effectively.",
    role: "Media Partner",
  },
  {
    name: "PVR Cinemas",
    quote:
      "We partnered with Friends Advertising for outdoor advertising to promote our new cinema releases. Their attention to detail and high-quality printing made our campaigns truly stand out.",
    role: "Entertainment Partner",
  },
  {
    name: "Metro Group",
    quote:
      "At Metro Group, we believe in building iconic structures, and Friends Advertising helped us do just that through their creative and high-impact signage solutions.",
    role: "Real Estate Partner",
  },
  {
    name: "Copper Corp",
    quote:
      "We've been working with Friends Advertising for years, and their expertise in creating large-scale signage and promotional banners has always exceeded our expectations.",
    role: "Industrial Partner",
  },
];

const partners = [
  { name: "Aaj Tak", logo: "/logos/partners/Aaj_tak.png" },
  { name: "ABP Majha", logo: "/logos/partners/ABP_Majha.png" },
  { name: "Zee 24 Taas", logo: "/logos/partners/zee_24_taas.png" },
  { name: "Star Pravah", logo: "/logos/partners/Star_Pravah.png" },
  { name: "Lok Shahi", logo: "/logos/partners/lokshahi.png" },
  { name: "Le Meridien", logo: "/logos/partners/le_meridien.png" },
  { name: "Keys Prima Hotels", logo: "/logos/partners/keys_prima_hotels.png" },
  { name: "PNB", logo: "/logos/partners/pnb.png" },
  { name: "Canara Bank", logo: "/logos/partners/canara_bank.png" },
  { name: "Tata Motors", logo: "/logos/partners/tata_motors.png" },
  { name: "PVR Cinemas", logo: "/logos/partners/pvr_cinemas.png" },
  { name: "Nyati", logo: "/logos/partners/nyati.png" },
] as const;

const realEstateClients = [
  { name: "Metro Group", tone: "from-sky-400/30 to-sky-500/5", logo: "/logos/real-estate/metro-group.png", logoClass: "scale-[1.3] object-center" },
  { name: "Satyam Developers", tone: "from-fuchsia-400/30 to-fuchsia-500/5", logo: "/logos/real-estate/satyam-developers.png", logoClass: "scale-[1.36] object-center" },
  { name: "Paradise Group", tone: "from-violet-400/30 to-violet-500/5", logo: "/logos/real-estate/paradise-group.png", logoClass: "scale-[1.28] object-center" },
  { name: "Raheja Universal", tone: "from-blue-400/30 to-blue-500/5", logo: "/logos/real-estate/raheja-universal.png", logoClass: "scale-[1.3] object-center" },
  { name: "Arihant Superstructures", tone: "from-amber-400/30 to-amber-500/5", logo: "/logos/real-estate/arihant-superstructures.png", logoClass: "scale-[1.4] object-center" },
  { name: "Goel Ganga", tone: "from-emerald-400/30 to-emerald-500/5", logo: "/logos/real-estate/goel-ganga.png", logoClass: "scale-[1.3] object-center" },
  { name: "Juhi Developers", tone: "from-rose-400/30 to-rose-500/5", logo: "/logos/real-estate/juhi-developers.png", logoClass: "scale-[1.34] object-center" },
  { name: "S.M. Hitech", tone: "from-indigo-400/30 to-indigo-500/5" },
  { name: "Sai Yogi", tone: "from-teal-400/30 to-teal-500/5" },
  { name: "Gajra", tone: "from-orange-400/30 to-orange-500/5", logo: "/logos/real-estate/gajra.png", logoClass: "scale-[1.32] object-center" },
  { name: "Gami Tiara", tone: "from-lime-400/30 to-lime-500/5", logo: "/logos/real-estate/gami-tiara.png", logoClass: "scale-[1.38] object-center" },
  { name: "GEECEE", tone: "from-pink-400/30 to-pink-500/5", logo: "/logos/real-estate/geecee.png", logoClass: "scale-[1.34] object-center" },
  { name: "Kamdhenu", tone: "from-emerald-300/30 to-cyan-400/5", logo: "/logos/real-estate/kamdhenu.png", logoClass: "scale-[1.32] object-center" },
  { name: "Mahaavir", tone: "from-purple-400/30 to-purple-500/5", logo: "/logos/real-estate/mahaavir.png", logoClass: "scale-[1.32] object-center" },
  { name: "Today Group", tone: "from-yellow-400/30 to-yellow-500/5" },
  { name: "HP (Hindustan Petroleum)", tone: "from-red-400/30 to-red-500/5", logo: "/logos/real-estate/hp.png", logoClass: "scale-[1.42] object-center" },
];

const brandInitials = (name: string) =>
  name
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .join("")
    .slice(0, 3)
    .toUpperCase();

type Manifesto = {
  glyph: string;
  title: string;
  subtitle: string;
  body: string;
  accent: string;
  accentRgb: string;
  featured?: boolean;
};

const manifesto: Manifesto[] = [
  {
    glyph: "C",
    title: "Craft",
    subtitle: "Print. Paint. Light. Rig.",
    body:
      "Twelve years in the print shop teaches you that a billboard is half artwork and half engineering. Our crews have rigged iron monsoon hoardings at 2am and tuned a backlit retail facade at 3pm in the Pune sun.",
    accent: "var(--accent)",
    accentRgb: "227,0,82",
  },
  {
    glyph: "S",
    title: "Scale",
    subtitle: "Eight cities. Ninety highways.",
    body:
      "Friends owns relationships across Mumbai BKC, Navi Mumbai, Pune, Nashik, Aurangabad, Nagpur, Kolhapur and Solapur \u2014 plus highway inventory along NH48, NH4 and the Samruddhi corridor. One brief becomes one rollout.",
    accent: "var(--neon-blue)",
    accentRgb: "0,113,227",
    featured: true,
  },
  {
    glyph: "V",
    title: "Speed",
    subtitle: "72 hours brief to wall.",
    body:
      "Our print floor runs three shifts so an approved artwork is on a Maharashtra wall before the weekend. Rush windows for product launches, election cycles and matchday takeovers are our home turf.",
    accent: "var(--neon-purple)",
    accentRgb: "92,96,245",
  },
];

const method = [
  {
    name: "Discover",
    subtitle: "Brief in. Reach map out.",
    body:
      "We map your audience routes across Maharashtra \u2014 auto sweepers, expressway commuter belts, retail strips, transit lines. The brief turns into a heat-map of where your brand should live.",
    owner: "Strategy desk",
    handoff: "Design",
  },
  {
    name: "Design",
    subtitle: "Artwork that survives weather and distance.",
    body:
      "Print-first design system tuned for the 200m highway glance, the 12m metro escalator, and the 4m retail counter \u2014 same brand, three reads.",
    owner: "Studio",
    handoff: "Deploy",
  },
  {
    name: "Deploy",
    subtitle: "Three shifts, one rollout window.",
    body:
      "Latex and solvent presses, rigging crews on call, GPS-tracked installations. We hang Mumbai, Nashik and Pune in one weekend if the brief demands it.",
    owner: "Operations",
    handoff: "Monitor",
  },
  {
    name: "Monitor",
    subtitle: "Proof you were seen.",
    body:
      "Daily site photos, traffic-impression reports, competitor adjacency notes. You see what we see, every Monday morning, for the life of the campaign.",
    owner: "Insights",
    handoff: "Wrap report",
  },
] as const;

const stats = [
  {
    icon: Users,
    label: "Associated Brands",
    value: 250,
    suffix: "+",
    grad: "from-[#0071e3] to-[#5c60f5]",
    glow: "rgba(0,113,227,0.45)",
  },
  {
    icon: Target,
    label: "Campaigns",
    value: 5000,
    suffix: "+",
    grad: "from-[#06b6d4] to-[#0ea5e9]",
    glow: "rgba(6,182,212,0.45)",
  },
  {
    icon: Award,
    label: "Awards Achieved",
    value: 12,
    suffix: "",
    grad: "from-[#f59e0b] to-[#f97316]",
    glow: "rgba(245,158,11,0.45)",
  },
  {
    icon: MapPin,
    label: "Team Members",
    value: 50,
    suffix: "+",
    grad: "from-[#10b981] to-[#14b8a6]",
    glow: "rgba(16,185,129,0.45)",
  },
];

function useCounter(to: number, start: boolean, duration = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - k, 3);
      setValue(Math.round(eased * to));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, start, duration]);
  return value;
}

function useSpotlightCursor() {
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      document.body.style.setProperty("--mx", `${e.clientX}px`);
      document.body.style.setProperty("--my", `${e.clientY}px`);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
}

/* ============================================================================
   Editorial section header — oversized number + eyebrow + headline
   ============================================================================ */
function SectionHeader({
  number,
  eyebrow,
  title,
  numberClass,
  accent,
}: {
  number: string;
  eyebrow: string;
  title: ReactNode;
  numberClass: string;
  accent?: string;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-12 mb-14">
      <div
        className={`text-[80px] md:text-[180px] font-black leading-[0.8] tracking-tighter bg-clip-text text-transparent ${numberClass}`}
      >
        {number}
      </div>
      <div className="flex-1">
        <div
          className="text-[11px] font-bold tracking-[0.4em] uppercase mb-4"
          style={{ color: accent ?? "#64748b" }}
        >
          {eyebrow}
        </div>
        <h2 className="text-4xl md:text-6xl font-black leading-[0.95] text-[#1d1d1f] tracking-tight">
          {title}
        </h2>
      </div>
    </div>
  );
}

/* ============================================================================
   Subtle blueprint-grid background overlay used in editorial sections
   ============================================================================ */
function GridOverlay() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(15,23,42,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.045) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        maskImage:
          "radial-gradient(ellipse at center, black 35%, transparent 80%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at center, black 35%, transparent 80%)",
      }}
    />
  );
}

/* ============================================================================
   Friends Method — click-through step picker
   ============================================================================ */
function FriendsMethodPicker() {
  const [active, setActive] = useState(0);
  const step = method[active];

  return (
    <div className="grid lg:grid-cols-[minmax(260px,1fr)_2fr] gap-5 relative z-10">
      <div className="rounded-[2rem] border border-black/8 bg-white p-3 md:p-4 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.18)] h-fit">
        {method.map((s, i) => {
          const isActive = i === active;
          return (
            <button
              key={s.name}
              type="button"
              onClick={() => setActive(i)}
              className={`w-full flex items-center gap-4 px-4 md:px-5 py-4 rounded-2xl text-left transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-[rgba(227,0,82,0.06)] via-transparent to-transparent ring-1 ring-[var(--accent)]/40"
                  : "hover:bg-slate-50"
              }`}
              aria-pressed={isActive}
            >
              <span
                className={`relative w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  isActive ? "border-[var(--accent)]" : "border-slate-300"
                }`}
              >
                {isActive ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
                ) : null}
              </span>
              <span
                className={`text-[11px] font-bold tracking-[0.28em] uppercase ${
                  isActive ? "text-[var(--accent)]" : "text-slate-400"
                }`}
              >
                0{i + 1}
              </span>
              <span
                className={`text-lg font-bold ${
                  isActive ? "text-[#1d1d1f]" : "text-slate-600"
                }`}
              >
                {s.name}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-[2rem] border border-black/8 bg-white p-8 md:p-12 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.18)] relative overflow-hidden min-h-[22rem]">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[rgba(227,0,82,0.05)] to-transparent pointer-events-none" />
        <AnimatePresence mode="wait">
          <motion.div
            key={step.name}
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
            transition={{ duration: 0.45, ease: [0.22, 0.85, 0.25, 1] }}
            className="relative"
          >
            <div className="flex items-start gap-5 mb-5">
              <div
                className="text-5xl md:text-6xl font-black leading-none tracking-tight select-none"
                style={{
                  color: "transparent",
                  WebkitTextStroke: "2px var(--accent)",
                }}
              >
                0{active + 1}
              </div>
              <div className="flex-1 pt-1">
                <h3 className="text-3xl md:text-4xl font-black text-[#1d1d1f] leading-tight">
                  {step.name}
                </h3>
                <p className="text-[var(--accent)] font-bold mt-1">
                  {step.subtitle}
                </p>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed text-lg mb-10 max-w-2xl">
              {step.body}
            </p>

            <div className="border-t border-black/8 pt-6 flex flex-col sm:flex-row gap-6 sm:gap-16">
              <div>
                <div className="text-[10px] font-bold tracking-[0.32em] uppercase text-slate-400 mb-1">
                  Owner
                </div>
                <div className="text-[#1d1d1f] font-bold">{step.owner}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-[0.32em] uppercase text-slate-400 mb-1">
                  Handoff
                </div>
                <div className="text-[#1d1d1f] font-bold">
                  &rarr; {step.handoff}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ============================================================================
   Hero — editorial masthead with city-lights backdrop
   ============================================================================ */
function HeroBlock() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const titleY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const orbY = useTransform(scrollYProgress, [0, 1], [0, 140]);

  useEffect(() => {
    const onScroll = () => {
      document.documentElement.style.setProperty(
        "--skyline-y",
        `${Math.min(80, window.scrollY * 0.12)}px`,
      );
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroStats = [
    { k: "8", v: "Cities" },
    { k: "5,000+", v: "Campaigns" },
    { k: "250+", v: "Brands" },
    { k: "2012", v: "Founded" },
  ];

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col overflow-hidden"
    >
      <CityLightsBackground />
      <motion.div className="about-orb absolute left-1/2 top-1/3 -translate-x-1/2 z-0" style={{ y: orbY }} />
      <div className="about-grain z-0" aria-hidden="true" />

      {/* Top metadata band */}
      <div className="relative z-10 px-4 md:px-10 pt-28 md:pt-32">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] md:text-[11px] font-bold tracking-[0.36em] uppercase text-slate-500">
          <span className="flex items-center gap-2 md:gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--neon-blue)] shadow-[0_0_10px_rgba(0,113,227,0.6)]" />
            Vol. 12 &middot; About Friends
          </span>
          <span className="hidden sm:block text-slate-400">Est. 2012 &mdash; Navi Mumbai HQ</span>
        </div>
        <div className="max-w-7xl mx-auto mt-4 h-px bg-gradient-to-r from-transparent via-black/10 to-transparent" />
      </div>

      {/* Center editorial headline */}
      <div className="relative z-10 px-4 md:px-10 flex-1 flex flex-col items-center justify-center text-center pt-14 pb-32">
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--neon-blue)]/30 bg-white/85 text-[var(--neon-blue)] text-[10px] md:text-[11px] font-bold mb-8 uppercase tracking-[0.32em] shadow-[0_8px_24px_rgba(0,113,227,0.12)] backdrop-blur-sm"
        >
          <Sparkles className="w-3 h-3" />
          <span>The Friends Studio</span>
        </motion.div>

        <motion.h1
          style={{ y: titleY }}
          initial={{ opacity: 0, y: 14, filter: "blur(14px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.0, ease: [0.22, 0.85, 0.25, 1] }}
          className="relative z-10 text-5xl sm:text-6xl md:text-[8.5rem] font-black tracking-[-0.03em] leading-[0.9] max-w-6xl mx-auto text-[#1d1d1f]"
        >
          Outdoor that
          <br />
          <span className="bg-gradient-to-r from-[var(--neon-blue)] via-[var(--neon-purple)] to-[var(--neon-blue)] bg-clip-text text-transparent">
            owns the route.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.8 }}
          className="relative z-10 mt-8 text-base md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed"
        >
          Friends Advertising is the studio behind Maharashtra&rsquo;s most-seen billboards, transit takeovers and iconic landmark wraps &mdash; built site by site since 2012.
        </motion.p>

        {/* Stat strip */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="relative z-10 mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full max-w-4xl"
        >
          {heroStats.map((s) => (
            <div
              key={s.v}
              className="rounded-2xl border border-black/8 bg-white/85 backdrop-blur-md px-5 md:px-6 py-4 md:py-5 flex flex-col items-start text-left shadow-[0_10px_30px_-20px_rgba(15,23,42,0.25)] hover:border-[var(--neon-blue)]/30 hover:shadow-[0_18px_40px_-22px_rgba(0,113,227,0.35)] transition-all duration-300"
            >
              <span className="text-3xl md:text-4xl font-black text-[#1d1d1f] tracking-tight tabular-nums">
                {s.k}
              </span>
              <span className="text-[10px] tracking-[0.28em] uppercase text-slate-500 font-bold mt-1">
                {s.v}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Refined scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-slate-400"
      >
        <span className="text-[10px] font-bold tracking-[0.4em] uppercase">Scroll the story</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <ArrowRight className="w-4 h-4 rotate-90" />
        </motion.div>
      </motion.div>

      <div className="about-skyline" aria-hidden="true">
        <div className="about-skyline-lights">
          {Array.from({ length: 28 }).map((_, i) => (
            <span
              key={i}
              style={{
                left: `${(i * 3.6 + 4) % 100}%`,
                top: `${20 + ((i * 17) % 50)}%`,
                animationDelay: `${(i * 0.27) % 4}s`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   Marquee + Stats + Tilt + Magnetic helpers
   ============================================================================ */
function Marquee({
  items,
  reverse = false,
  duration = 38,
}: {
  items: string[];
  reverse?: boolean;
  duration?: number;
}) {
  const doubled = [...items, ...items];
  return (
    <div
      className={`about-marquee ${reverse ? "reverse" : ""}`}
      style={{ ["--marquee-duration" as string]: `${duration}s` } as React.CSSProperties}
    >
      <div className="about-marquee-track">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 text-2xl md:text-4xl font-black tracking-tight text-slate-400 uppercase"
          >
            {item}
            <span className="text-[var(--neon-blue)]">&bull;</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  index,
  grad,
  glow,
}: {
  icon: typeof Rocket;
  label: string;
  value: number;
  suffix: string;
  index: number;
  grad: string;
  glow: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const display = useCounter(value, inView);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.6 }}
      className="relative overflow-hidden rounded-[28px] border border-black/8 bg-white p-7 md:p-8 flex flex-col items-start text-left shadow-[0_20px_50px_-30px_rgba(15,23,42,0.18)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_70px_-30px_rgba(15,23,42,0.35)] group"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `radial-gradient(circle, ${glow} 0%, transparent 65%)` }}
      />
      <div
        className={`relative z-10 mb-6 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} shadow-[0_14px_30px_-12px_rgba(15,23,42,0.45)]`}
      >
        <Icon className="w-7 h-7 text-white" strokeWidth={2.2} />
      </div>
      <div className="relative z-10 text-4xl md:text-5xl font-black leading-none tabular-nums text-[#1d1d1f] tracking-tight">
        {display.toLocaleString("en-IN")}
        <span
          className={`bg-gradient-to-br ${grad} bg-clip-text text-transparent`}
        >
          {suffix}
        </span>
      </div>
      <div className="relative z-10 mt-3 text-[10px] text-slate-500 uppercase tracking-[0.28em] font-bold">
        {label}
      </div>
    </motion.div>
  );
}

function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotX = useSpring(useTransform(y, [-0.5, 0.5], ["10deg", "-10deg"]), {
    stiffness: 180,
    damping: 18,
  });
  const rotY = useSpring(useTransform(x, [-0.5, 0.5], ["-10deg", "10deg"]), {
    stiffness: 180,
    damping: 18,
  });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className="about-tilt">
      <motion.div
        style={{ rotateX: rotX, rotateY: rotY }}
        className={`about-tilt-inner ${className ?? ""}`}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ============================================================================
   Page
   ============================================================================ */

export default function AboutPage() {
  useSpotlightCursor();

  return (
    <main className="flex flex-col w-full relative">
      <div className="about-spotlight" aria-hidden="true" />

      <div className="page-tile-stage">
        {/* ============================ HERO ============================ */}
        <HeroBlock />

        {/* ============================ MARQUEE STRIP ============================ */}
        <section className="tile-fullbleed py-6 border-y border-black/5 bg-slate-50/70">
          <Marquee
            items={[
              "OUTDOOR",
              "BILLBOARDS",
              "LED & GLOW",
              "TRANSIT",
              "FLEX BOARDS",
              "ICONIC LANDMARKS",
              "WESTERN INDIA",
            ]}
            duration={42}
          />
        </section>

        {/* ============================ 01 — MANIFESTO ============================ */}
        <section className="relative py-16 md:py-24 px-4 md:px-10 bg-white">
          <GridOverlay />
          <div className="relative max-w-7xl mx-auto">
            <SectionHeader
              number="01"
              eyebrow="Manifesto"
              numberClass="bg-gradient-to-br from-[var(--neon-blue)] to-[var(--neon-purple)]"
              title={
                <>
                  We don&rsquo;t sell space.
                  <br />
                  <span className="bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent">
                    We ship scale.
                  </span>
                </>
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {manifesto.map((m, i) => (
                <motion.article
                  key={m.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 0.85, 0.25, 1] }}
                  whileHover={{ y: -6 }}
                  className={`group relative rounded-[2rem] border bg-white p-8 md:p-10 transition-all duration-500 ${
                    m.featured
                      ? "border-[rgba(0,113,227,0.45)] shadow-[0_30px_70px_-30px_rgba(0,113,227,0.4)]"
                      : "border-black/8 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.18)]"
                  }`}
                  style={{
                    ...(m.featured
                      ? {}
                      : {
                          // hover-color tinting via CSS custom prop
                        }),
                  }}
                >
                  <div
                    className="absolute inset-x-0 top-0 h-1/2 rounded-t-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      backgroundImage: `linear-gradient(180deg, rgba(${m.accentRgb}, 0.08), transparent)`,
                    }}
                  />
                  <div className="relative">
                    <div
                      className="text-[64px] md:text-[88px] leading-none font-black mb-6 select-none"
                      style={{
                        color: "transparent",
                        WebkitTextStroke: `2px ${m.accent}`,
                        filter: m.featured
                          ? `drop-shadow(0 10px 28px rgba(${m.accentRgb}, 0.35))`
                          : "none",
                      }}
                    >
                      {m.glyph}
                    </div>
                    <h3 className="text-2xl font-black text-[#1d1d1f] mb-2">
                      {m.title}
                    </h3>
                    <p
                      className="text-sm font-bold mb-4 tracking-tight"
                      style={{ color: m.accent }}
                    >
                      {m.subtitle}
                    </p>
                    <p className="text-slate-600 leading-relaxed text-[15px]">
                      {m.body}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* ============================ 02 — BY THE NUMBERS ============================ */}
        <section className="relative py-16 md:py-24 px-4 md:px-10 bg-slate-50/60">
          <GridOverlay />
          <div className="relative max-w-7xl mx-auto">
            <SectionHeader
              number="02"
              eyebrow="By the Numbers"
              accent="#0d9488"
              numberClass="bg-gradient-to-br from-[#10b981] via-[#14b8a6] to-[#06b6d4]"
              title={
                <>
                  A decade of impressions.
                  <br />
                  <span className="bg-gradient-to-r from-[#0d9488] via-[#14b8a6] to-[#06b6d4] bg-clip-text text-transparent">
                    Counted, measured, owned.
                  </span>
                </>
              }
            />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
              {stats.map((stat, i) => (
                <StatCard key={stat.label} index={i} {...stat} />
              ))}
            </div>
          </div>
        </section>

        {/* ============================ 03 — THE FRIENDS METHOD ============================ */}
        <section className="relative py-16 md:py-24 px-4 md:px-10 bg-white">
          <GridOverlay />
          <div className="relative max-w-7xl mx-auto">
            <SectionHeader
              number="03"
              eyebrow="The Friends Method"
              accent="var(--accent)"
              numberClass="bg-gradient-to-br from-[var(--accent)] to-[#ff7a4b]"
              title={
                <>
                  Brief on Monday.
                  <br />
                  <span className="text-[var(--accent)]">Wall on Friday.</span>
                </>
              }
            />

            <FriendsMethodPicker />
          </div>
        </section>

        {/* ============================ TESTIMONIALS GRID ============================ */}
        <section className="py-16 md:py-24 px-4 relative">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-5xl font-black mb-4 text-[#1d1d1f] tracking-tight">
                CLIENT <span className="text-[var(--neon-purple)]">TESTIMONIALS</span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[var(--neon-purple)] to-transparent mx-auto" />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass p-8 rounded-[32px] relative overflow-hidden group hover:border-black/15 hover:shadow-lg transition-all duration-500"
                >
                  <Quote className="absolute -top-4 -right-4 w-16 h-16 md:w-24 md:h-24 text-black/[0.01] group-hover:text-[var(--neon-purple)]/[0.04] transition-colors" />
                  <p className="text-slate-600 italic mb-6 relative z-10 leading-relaxed text-lg font-medium">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--neon-blue)] to-[var(--neon-purple)] flex items-center justify-center font-bold text-xl text-white">
                      {t.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1d1d1f]">{t.name}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================ PARTNERS - LOGO GRID ============================ */}
        <section className="py-24 px-4 relative bg-slate-50/60">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 mb-4 text-[10px] font-bold tracking-[0.32em] uppercase text-[var(--neon-blue)]">
                <Handshake className="w-4 h-4" /> The Roster
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-[#1d1d1f]">
                Trusted by <span className="text-[var(--neon-blue)]">Heavyweights</span>
              </h2>
              <p className="text-slate-500 mt-4">
                Media houses, banks, hospitality and entertainment brands across India
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {partners.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: (i % 6) * 0.05, duration: 0.45 }}
                  className="group relative aspect-[5/3] rounded-2xl border border-black/8 bg-white flex items-center justify-center p-4 md:p-5 transition-all duration-300 hover:border-[var(--neon-blue)]/40 hover:shadow-[0_20px_45px_-26px_rgba(0,113,227,0.35)] hover:-translate-y-0.5"
                  title={p.name}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.logo}
                    alt={`${p.name} logo`}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.06]"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================ REAL ESTATE - TILT CARDS ============================ */}
        <section className="py-16 md:py-24 px-4 relative">
          <div className="absolute inset-0 z-0 opacity-30 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[800px] md:h-[800px] bg-[var(--neon-purple)] rounded-full filter blur-[100px] md:blur-[160px]" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 relative z-10"
          >
            <div className="inline-flex items-center gap-2 mb-4 text-[10px] font-bold tracking-[0.32em] uppercase text-[var(--neon-purple)]">
              <Building2 className="w-4 h-4" /> Skyline Owners
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-[#1d1d1f]">
              Real Estate <span className="text-[var(--neon-purple)]">Portfolio</span>
            </h2>
            <p className="text-slate-500 mt-4">
              Empowering the skyline with iconic outdoor presence
            </p>
          </motion.div>

          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 relative z-10">
            {realEstateClients.map((client, i) => (
              <motion.div
                key={client.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03, duration: 0.4 }}
                className="group"
              >
                <TiltCard
                  className={`relative aspect-square flex items-center justify-center text-center p-3 md:p-4 glass rounded-[1.8rem] border border-black/8 overflow-hidden cursor-default bg-gradient-to-br transition-transform duration-500 ${client.tone}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-slate-900/5 opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="absolute inset-x-6 top-4 h-16 rounded-full bg-white/60 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-70" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.75),rgba(255,255,255,0)_38%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative z-10 flex h-full w-full items-center justify-center">
                    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[1.55rem] border border-black/8 bg-white p-1 shadow-[0_18px_40px_-22px_rgba(15,23,42,0.35)] backdrop-blur-sm transition-all duration-500 group-hover:border-[var(--neon-blue)]/35 group-hover:shadow-[0_30px_60px_-24px_rgba(0,113,227,0.4)] md:p-2">
                      <span className="text-lg font-extrabold tracking-[0.18em] text-slate-400 transition-all duration-500 group-hover:scale-110 group-hover:text-slate-600 md:text-xl">
                        {brandInitials(client.name)}
                      </span>
                      {client.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={client.logo}
                          alt={`${client.name} logo`}
                          className={`absolute inset-0 z-10 h-full w-full object-contain p-1 transition-transform duration-500 ease-out group-hover:scale-[1.08] md:p-2 ${client.logoClass ?? "scale-[1.3] object-center"}`}
                          loading="lazy"
                        />
                      ) : null}
                    </div>
                  </div>
                </TiltCard>
                <div className="relative z-20 mt-3 h-10 overflow-visible text-center">
                  <span className="inline-flex w-max max-w-none translate-y-5 items-center whitespace-nowrap rounded-full border border-black/10 bg-white px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.05em] text-slate-700 opacity-0 shadow-[0_10px_30px_-20px_rgba(0,113,227,0.6)] backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:border-[var(--neon-blue)]/40 group-hover:opacity-100 md:px-4 md:text-[9px]">
                    {client.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
