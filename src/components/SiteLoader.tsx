"use client";

/**
 * SiteLoader
 * ----------
 * OOH-themed boot sequence: a billboard is rigged, pasted, lit, then "goes
 * live". The animation runs while we genuinely pre-fetch AND PARSE the
 * heaviest assets the home page needs:
 *   1. Road video MP4 (fetch only — streamed into the HTTP cache)
 *   2. Plane GLB (fetch + GLTFLoader.parse + texture decode)
 *
 * The plane previously appeared half a beat late because the loader was
 * counting "bytes downloaded" but the page was waiting on "parsed by
 * three.js + textures decoded". This version actually finishes the parse
 * step before signalling complete, and exposes the warm GLTF cache via
 * `window.__planeGLTFPromise` so OrbitingPlane can reuse it instantly.
 *
 * Reveal: once (a) all assets reach 100% AND (b) the minimum dramatic
 * duration has elapsed, the loader flashes white, then unmounts.
 */

import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

type FetchAsset = { kind: "fetch"; url: string; weight: number };
type GlbAsset = { kind: "glb"; url: string; weight: number };
type Asset = FetchAsset | GlbAsset;

const ASSETS: Asset[] = [
  { kind: "fetch", url: "/videos/Temp_road.mp4", weight: 5 },
  { kind: "glb", url: "/models/plane/source/LooL.glb", weight: 5 },
];

const PHASES = [
  "WAKING THE CITY",
  "RIGGING SCAFFOLD",
  "PRINTING ARTWORK",
  "PASTING THE FLEX",
  "ROUTING POWER",
  "ALIGNING SPOTLIGHTS",
  "TUNING THE TRANSMITTER",
  "RAISING BILLBOARD",
  "GOING LIVE",
] as const;

/** Partner / route names that get "ingested" by the loader for flavor. */
const INGEST_FEED = [
  "MUMBAI · WESTERN EXPRESS HWY",
  "SATARA · PUNE-BENGALURU CORRIDOR",
  "PVR CINEMAS · CAMPAIGN #4471",
  "ABP MAJHA · ELECTION ROLLOUT",
  "TATA MOTORS · METRO TAKEOVER",
  "METRO GROUP · 50×50 FLEX",
  "LE MERIDIEN · LED RIBBON",
  "CANARA BANK · 12M HOARDING",
  "ZEE 24 TAAS · TRANSIT WRAP",
  "STAR PRAVAH · MATCHDAY PUSH",
  "RAHEJA UNIVERSAL · SKYLINE GLOW",
  "AAJ TAK · BREAKING-NEWS BURST",
  "KEYS PRIMA · LOBBY DIGITAL",
  "HP PETROLEUM · HIGHWAY CANOPY",
] as const;

const STATS = [
  { label: "SQ FT PRINTED", target: 12_847_302 },
  { label: "DAILY EYEBALLS", target: 9_412_580 },
  { label: "HOARDINGS LIVE", target: 1247 },
  { label: "CITIES COVERED", target: 38 },
] as const;

const MIN_DURATION_MS = 4800;
const MAX_DURATION_MS = 11000;
const SESSION_KEY = "fa:site-loader-played";

export default function SiteLoader({ onDone }: { onDone?: () => void }) {
  // Skip loader on subsequent SPA visits within the same tab session.
  // Escape hatches:
  //   ?noloader=1  skips, ?loader=1 forces, window.__replayLoader() resets+reloads
  //
  // IMPORTANT: Initial state must be deterministic across server/client to
  // avoid a hydration mismatch. We assume "visible" on first render, then
  // re-evaluate on mount using the actual URL + sessionStorage.
  const [visible, setVisible] = useState<boolean>(true);

  // Re-evaluate visibility on the client after hydration. The single
  // cascading render here is intentional — we cannot read window.location /
  // sessionStorage during the SSR pass, so we have to settle the real
  // visibility immediately after mount.
  useEffect(() => {
    try {
      const qs = new URLSearchParams(window.location.search);
      if (qs.get("noloader") === "1") {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVisible(false);
        return;
      }
      if (qs.get("loader") === "1") {
        sessionStorage.removeItem(SESSION_KEY);
        return;
      }
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        setVisible(false);
      }
    } catch {
      /* ignore — default to visible */
    }
  }, []);
  const [rawProgress, setRawProgress] = useState(0); // 0..100, monotonic
  const [igniting, setIgniting] = useState(false); // spotlights blaze
  const [flashing, setFlashing] = useState(false); // white blink at the cut
  const [feedIdx, setFeedIdx] = useState(0);
  const startedAt = useRef<number>(0);

  // Phase index is fully derived from rawProgress — keep it as a computed
  // value at render time so we don't trigger a cascading setState from inside
  // an effect (see react-hooks/set-state-in-effect).
  const phaseIdx = Math.min(
    PHASES.length - 1,
    Math.floor((rawProgress / 100) * PHASES.length),
  );

  // DevTools convenience
  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as unknown as { __replayLoader?: () => void }).__replayLoader = () => {
      try {
        sessionStorage.removeItem(SESSION_KEY);
      } catch {
        /* ignore */
      }
      window.location.reload();
    };
  }, []);

  // Smooth the progress so the bar never jitters on chunky reads
  const smooth = useSpring(0, { stiffness: 55, damping: 22, mass: 0.7 });
  const widthPct = useTransform(smooth, (v) => `${Math.min(100, Math.max(0, v))}%`);
  const widthCss = useMotionTemplate`${widthPct}`;
  const pasteClip = useTransform(smooth, (v) => `inset(0 ${100 - Math.min(100, v)}% 0 0)`);
  const rollerLeft = useTransform(smooth, (v) => `calc(${Math.min(100, v)}% - 7%)`);
  const noiseOpacity = useTransform(smooth, (v) => Math.max(0, 0.35 - v / 300));

  /* ---------------------------------------------------------------- */
  /* Real asset pre-fetch + parse with progress                       */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!visible) {
      onDone?.();
      return;
    }
    startedAt.current = performance.now();

    let cancelled = false;
    const loaded = new Array(ASSETS.length).fill(0);
    const totals = new Array(ASSETS.length).fill(0);
    const weights = ASSETS.map((a) => a.weight);
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    const recompute = () => {
      let p = 0;
      for (let i = 0; i < ASSETS.length; i++) {
        const t = totals[i] || 0;
        const f = t > 0 ? Math.min(1, loaded[i] / t) : 0;
        p += (f * weights[i]) / totalWeight;
      }
      const pct = p * 100;
      setRawProgress((prev) => (pct > prev ? pct : prev));
    };

    async function fetchOne(idx: number, asset: FetchAsset) {
      try {
        const res = await fetch(asset.url, { cache: "force-cache" });
        const len = Number(res.headers.get("content-length")) || 0;
        totals[idx] = len > 0 ? len : 1;
        if (!res.body) {
          loaded[idx] = totals[idx];
          recompute();
          return;
        }
        const reader = res.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done || cancelled) break;
          loaded[idx] += value?.byteLength ?? 0;
          if (totals[idx] < loaded[idx]) totals[idx] = loaded[idx];
          recompute();
        }
        loaded[idx] = totals[idx];
        recompute();
      } catch {
        loaded[idx] = 1;
        totals[idx] = 1;
        recompute();
      }
    }

    /** Fetch the GLB bytes (with progress) AND fully parse via GLTFLoader so
     *  the plane is genuinely render-ready when the loader cuts away.
     *  The parsed result is cached on window for OrbitingPlane to reuse. */
    async function fetchAndParseGlb(idx: number, asset: GlbAsset) {
      try {
        // Reserve the last 10% of this asset's weight for the parse step
        const FETCH_FRACTION = 0.9;
        const res = await fetch(asset.url, { cache: "force-cache" });
        const len = Number(res.headers.get("content-length")) || 0;
        const fetchTotal = len > 0 ? len : 1;
        // Inflate the reported total so fetch alone can only reach 90%
        totals[idx] = fetchTotal / FETCH_FRACTION;

        const chunks: Uint8Array[] = [];
        if (res.body) {
          const reader = res.body.getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done || cancelled) break;
            if (value) {
              chunks.push(value);
              loaded[idx] += value.byteLength;
              recompute();
            }
          }
        }
        if (cancelled) return;

        // Stitch chunks into one buffer for GLTFLoader.parse
        const totalBytes = chunks.reduce((s, c) => s + c.byteLength, 0);
        const buffer = new ArrayBuffer(totalBytes);
        const view = new Uint8Array(buffer);
        let off = 0;
        for (const c of chunks) {
          view.set(c, off);
          off += c.byteLength;
        }

        // Parse + decode textures (this is what was actually delaying the plane)
        const { GLTFLoader } = await import(
          "three/examples/jsm/loaders/GLTFLoader.js"
        );
        const loader = new GLTFLoader();
        const baseUrl = asset.url.replace(/[^/]+$/, "");
        const gltfPromise = new Promise<unknown>((resolve, reject) => {
          loader.parse(buffer, baseUrl, resolve, reject);
        });

        // Expose the warm GLTF promise globally so OrbitingPlane can skip the
        // second download/parse round-trip and pop in immediately.
        type WindowWithPlaneCache = Window & {
          __planeGLTFPromise?: Promise<unknown>;
        };
        (window as WindowWithPlaneCache).__planeGLTFPromise = gltfPromise;

        await gltfPromise;
        if (cancelled) return;

        // Parse finished — fill the remaining 10%
        loaded[idx] = totals[idx];
        recompute();
      } catch {
        loaded[idx] = 1;
        totals[idx] = 1;
        recompute();
      }
    }

    Promise.all(
      ASSETS.map((a, i) =>
        a.kind === "fetch" ? fetchOne(i, a) : fetchAndParseGlb(i, a),
      ),
    ).then(() => {
      if (!cancelled) setRawProgress(100);
    });

    // Hard ceiling so flaky networks never strand the user
    const safety = window.setTimeout(() => {
      if (!cancelled) setRawProgress(100);
    }, MAX_DURATION_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(safety);
    };
  }, [visible, onDone]);

  /* ---------------------------------------------------------------- */
  /* Drive the smoothed spring                                        */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    smooth.set(rawProgress);
  }, [rawProgress, smooth]);

  /* ---------------------------------------------------------------- */
  /* Ingest feed ticker — cycles through partner names                */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!visible) return;
    const t = window.setInterval(() => {
      setFeedIdx((i) => (i + 1) % INGEST_FEED.length);
    }, 380);
    return () => window.clearInterval(t);
  }, [visible]);

  /* ---------------------------------------------------------------- */
  /* Reveal: wait for 100% + min duration, then flash + unmount       */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    if (!visible) return;
    if (rawProgress < 100) return;

    const elapsed = performance.now() - startedAt.current;
    const wait = Math.max(0, MIN_DURATION_MS - elapsed);

    const t1 = window.setTimeout(() => setIgniting(true), wait);
    const t2 = window.setTimeout(() => setFlashing(true), wait + 700);
    const t3 = window.setTimeout(() => {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore quota / privacy mode */
      }
      setVisible(false);
      onDone?.();
    }, wait + 1100);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [rawProgress, visible, onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="site-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] overflow-hidden bg-[#04060c] text-white"
          aria-label="Loading Friends Advertising"
          role="status"
        >
          {/* Subtle radial vignette + cool nebula tint */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.22),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(168,85,247,0.16),transparent_55%)]" />

          {/* Blueprint grid (city plan vibe) */}
          <div className="absolute inset-0 opacity-[0.20] bg-[linear-gradient(to_right,#1f2a44_1px,transparent_1px),linear-gradient(to_bottom,#1f2a44_1px,transparent_1px)] bg-[size:84px_84px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_85%)]" />

          {/* Drifting horizontal scanlines */}
          <motion.div
            aria-hidden
            className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent"
            animate={{ y: ["-2vh", "102vh"] }}
            transition={{ duration: 5.5, ease: "linear", repeat: Infinity }}
          />
          <motion.div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-violet-300/50 to-transparent"
            animate={{ y: ["2vh", "-102vh"] }}
            transition={{ duration: 7.5, ease: "linear", repeat: Infinity }}
          />

          {/* Floating embers / paper-scrap particles */}
          <Embers />

          {/* Top status strip */}
          <div className="absolute top-0 left-0 right-0 px-6 pt-6 z-[5]">
            <div className="flex items-center justify-between text-[10px] font-mono tracking-[0.35em] uppercase text-white/70 mb-2">
              <span className="flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(0,229,255,0.9)] animate-pulse" />
                FRIENDS // OOH BOOT
              </span>
              <span className="hidden md:flex items-center gap-4 text-white/45">
                <SignalBars />
                <span>LAT 19.0760 · LON 72.8777</span>
              </span>
              <motion.span>
                <Counter spring={smooth} />%
              </motion.span>
            </div>
            <div className="relative h-[3px] w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#00e5ff] via-[#3b82f6] to-[#a855f7]"
                style={{ width: widthCss }}
              />
              {/* Leading-edge glow */}
              <motion.div
                className="absolute inset-y-[-2px] w-[14px] rounded-full bg-cyan-200 blur-[3px]"
                style={{ left: widthCss, opacity: 0.7 }}
              />
              <div className="absolute inset-0 flex justify-between pointer-events-none">
                {Array.from({ length: 11 }).map((_, i) => (
                  <span key={i} className="w-[1px] h-full bg-white/15" />
                ))}
              </div>
            </div>
            {/* Sub-strip: ingest feed */}
            <div className="mt-2 flex items-center justify-between text-[9px] font-mono tracking-[0.25em] uppercase text-white/45">
              <span className="flex items-center gap-2">
                <span className="text-cyan-300/80">›</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={feedIdx}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25 }}
                  >
                    INGEST · {INGEST_FEED[feedIdx]}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="hidden md:inline-block">v26.06 · BUILD 2026.06.02</span>
            </div>
          </div>

          {/* Stage: spotlights cast from above the billboard */}
          <motion.div
            aria-hidden
            className="absolute inset-x-0 top-0 h-[65%] pointer-events-none"
            initial={{ opacity: 0.35 }}
            animate={{ opacity: igniting ? 1 : 0.6 }}
            transition={{ duration: 0.5 }}
            style={{
              background:
                "radial-gradient(ellipse 38% 70% at 32% 0%, rgba(0,229,255,0.36), transparent 60%), radial-gradient(ellipse 38% 70% at 68% 0%, rgba(168,85,247,0.36), transparent 60%)",
              filter: igniting ? "saturate(1.5)" : "none",
            }}
          />

          {/* Searchlight beam that sweeps slowly across the upper canvas */}
          <SweepBeam />

          {/* Skyline silhouette with animated crane + blinking windows */}
          <Skyline />

          {/* Billboard rig — centered */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
              style={{ perspective: "1400px" }}
            >
              {/* Spotlight bulbs */}
              <div
                className="absolute -top-3 left-[14%] w-2.5 h-2.5 rounded-full bg-cyan-200"
                style={{
                  boxShadow: igniting
                    ? "0 0 32px 10px rgba(0,229,255,0.95), 0 0 70px 22px rgba(0,229,255,0.5)"
                    : "0 0 14px 3px rgba(0,229,255,0.55)",
                }}
              />
              <div
                className="absolute -top-3 right-[14%] w-2.5 h-2.5 rounded-full bg-violet-200"
                style={{
                  boxShadow: igniting
                    ? "0 0 32px 10px rgba(168,85,247,0.95), 0 0 70px 22px rgba(168,85,247,0.5)"
                    : "0 0 14px 3px rgba(168,85,247,0.55)",
                }}
              />
              {/* Pulsing red transmission beacon */}
              <motion.div
                className="absolute -top-5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-rose-400"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.1, repeat: Infinity }}
                style={{ boxShadow: "0 0 14px 3px rgba(244,63,94,0.7)" }}
              />

              {/* Top rail */}
              <div className="absolute -top-1 left-[10%] right-[10%] h-[3px] bg-gradient-to-r from-white/10 via-white/30 to-white/10 rounded-full" />

              {/* Billboard panel */}
              <div
                className="relative w-[min(820px,88vw)] aspect-[16/6] rounded-[6px] overflow-hidden border border-white/15"
                style={{
                  background: "#0b1224",
                  boxShadow:
                    "0 40px 90px -25px rgba(0,0,0,0.85), inset 0 0 0 1px rgba(255,255,255,0.04)",
                  transform: "rotateX(2.5deg)",
                }}
              >
                {/* Bare flex backing */}
                <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,#0a1020_0px,#0a1020_2px,#101830_2px,#101830_4px)] opacity-60" />
                {/* Edge frame */}
                <div className="absolute inset-1 rounded-[4px] border border-white/5" />

                {/* Brand artwork — revealed left → right by smoothed progress */}
                <motion.div
                  className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
                  style={{ clipPath: pasteClip }}
                >
                  <div className="text-[9px] md:text-[11px] tracking-[0.55em] uppercase text-cyan-300/90 mb-2 font-semibold">
                    Friends Advertising
                  </div>
                  <div className="leading-none">
                    <div className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight text-white">
                      DOMINATE
                    </div>
                    <div className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-r from-[#00e5ff] via-[#3b82f6] to-[#a855f7] bg-clip-text text-transparent">
                      THE SKYLINE.
                    </div>
                  </div>
                  <div className="mt-3 text-[9px] md:text-[10px] tracking-[0.45em] uppercase text-white/55">
                    Mumbai · Satara · Pan-India
                  </div>
                </motion.div>

                {/* Paste-roller sweep */}
                <motion.div
                  aria-hidden
                  className="absolute top-0 bottom-0 w-[14%] z-[3] pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(90deg,transparent,rgba(255,255,255,0.25),rgba(0,229,255,0.4),rgba(255,255,255,0.25),transparent)",
                    left: rollerLeft,
                    opacity: rawProgress < 100 ? 1 : 0,
                  }}
                />

                {/* Static-noise wash that fades out as the panel "tunes in" */}
                <motion.div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none mix-blend-overlay"
                  style={{
                    opacity: noiseOpacity,
                    backgroundImage:
                      "repeating-linear-gradient(0deg,rgba(255,255,255,0.06) 0,rgba(255,255,255,0.06) 1px,transparent 1px,transparent 3px)",
                  }}
                />

                {/* Pre-live SMPTE-ish corner ticks */}
                <CornerTicks />
              </div>

              {/* Scaffold poles */}
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "top" }}
                className="absolute top-full left-[12%] w-[5px] h-[18vh] bg-gradient-to-b from-white/45 via-white/15 to-transparent"
              />
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "top" }}
                className="absolute top-full right-[12%] w-[5px] h-[18vh] bg-gradient-to-b from-white/45 via-white/15 to-transparent"
              />
              {/* Cross brace */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.55, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "center" }}
                className="absolute top-[calc(100%+8vh)] left-[14%] right-[14%] h-[2px] bg-white/15"
              />
              {/* Climbing worker silhouette dot */}
              <motion.div
                aria-hidden
                className="absolute left-[12%] w-1.5 h-1.5 rounded-full bg-white/80"
                animate={{ top: ["100%", "0%"] }}
                transition={{ duration: 3.2, ease: "easeOut", repeat: Infinity }}
                style={{ boxShadow: "0 0 6px rgba(255,255,255,0.5)" }}
              />
            </motion.div>
          </div>

          {/* Audio-waveform / EQ bars on the left — "broadcast" feel */}
          <EqBars className="absolute left-6 top-1/2 -translate-y-1/2 hidden md:flex" />
          {/* Power meter on the right */}
          <PowerMeter
            className="absolute right-6 top-1/2 -translate-y-1/2 hidden md:flex"
            spring={smooth}
          />

          {/* Phase ticker + stat counters at the bottom */}
          <div className="absolute bottom-8 left-0 right-0 z-[5] px-6">
            <div className="text-center mb-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phaseIdx}
                  initial={{ opacity: 0, y: 8, letterSpacing: "0.7em" }}
                  animate={{ opacity: 1, y: 0, letterSpacing: "0.5em" }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="text-[11px] md:text-xs font-bold tracking-[0.5em] uppercase text-white/90"
                >
                  {PHASES[phaseIdx]}
                  <span className="inline-block ml-2 align-middle w-2 h-2 bg-cyan-300 rounded-full animate-pulse" />
                </motion.div>
              </AnimatePresence>
              <div className="mt-2 text-[9px] md:text-[10px] tracking-[0.4em] uppercase text-white/35 font-mono">
                The Complete Outdoor Solution
              </div>
            </div>

            {/* Stat ticker bar */}
            <div className="mx-auto max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 text-center">
              {STATS.map((s, i) => (
                <StatPill key={s.label} stat={s} spring={smooth} delay={i * 80} />
              ))}
            </div>
          </div>

          {/* "GOING LIVE" white-out flash at the cut */}
          <AnimatePresence>
            {flashing && (
              <motion.div
                key="flash"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.4] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, times: [0, 0.4, 1] }}
                className="absolute inset-0 bg-white pointer-events-none z-[6]"
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- helpers ---------- */

type Spring = ReturnType<typeof useSpring>;

function Counter({ spring }: { spring: Spring }) {
  const rounded = useTransform(spring, (v) =>
    Math.floor(Math.min(100, Math.max(0, v))),
  );
  const [n, setN] = useState(0);
  useEffect(() => {
    const unsub = rounded.on("change", (v) => setN(v));
    return unsub;
  }, [rounded]);
  return <>{String(n).padStart(3, "0")}</>;
}

function StatPill({
  stat,
  spring,
  delay,
}: {
  stat: { label: string; target: number };
  spring: Spring;
  delay: number;
}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const unsub = spring.on("change", (v) => {
      const eased = Math.min(1, Math.max(0, v / 100));
      setN(Math.floor(stat.target * eased));
    });
    return unsub;
  }, [spring, stat.target]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 + delay / 1000, duration: 0.5 }}
      className="rounded-md border border-white/10 bg-white/[0.03] backdrop-blur-sm px-3 py-2"
    >
      <div className="text-[8px] md:text-[9px] tracking-[0.3em] uppercase text-white/45 font-mono">
        {stat.label}
      </div>
      <div className="text-base md:text-lg font-mono font-bold text-cyan-200 tabular-nums">
        {n.toLocaleString("en-IN")}
      </div>
    </motion.div>
  );
}

function CornerTicks() {
  const corners = [
    "top-1.5 left-1.5",
    "top-1.5 right-1.5",
    "bottom-1.5 left-1.5",
    "bottom-1.5 right-1.5",
  ];
  return (
    <>
      {corners.map((c, i) => (
        <span
          key={i}
          aria-hidden
          className={`absolute ${c} w-3 h-3 border border-white/35`}
          style={{
            borderRight: i === 0 || i === 2 ? "none" : undefined,
            borderLeft: i === 1 || i === 3 ? "none" : undefined,
            borderBottom: i === 0 || i === 1 ? "none" : undefined,
            borderTop: i === 2 || i === 3 ? "none" : undefined,
          }}
        />
      ))}
    </>
  );
}

function SignalBars() {
  return (
    <span className="inline-flex items-end gap-[2px] h-3">
      {[3, 6, 9, 12].map((h, i) => (
        <motion.span
          key={i}
          className="w-[3px] bg-cyan-300/80"
          style={{ height: h }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, delay: i * 0.12, repeat: Infinity }}
        />
      ))}
    </span>
  );
}

function EqBars({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-end gap-[3px] h-24 ${className}`} aria-hidden>
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-sm bg-gradient-to-t from-cyan-400/30 via-cyan-300/80 to-violet-300/80"
          animate={{ height: ["10%", "85%", "30%", "65%", "20%"] }}
          transition={{
            duration: 1.4 + (i % 3) * 0.2,
            repeat: Infinity,
            delay: i * 0.07,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function PowerMeter({
  className = "",
  spring,
}: {
  className?: string;
  spring: Spring;
}) {
  const fillHeight = useTransform(
    spring,
    (v) => `${Math.min(100, Math.max(0, v))}%`,
  );
  const fillH = useMotionTemplate`${fillHeight}`;
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`} aria-hidden>
      <span className="text-[8px] font-mono tracking-[0.3em] text-white/45">PWR</span>
      <div className="relative w-2 h-24 rounded-sm bg-white/10 overflow-hidden border border-white/10">
        <motion.div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald-400 via-cyan-300 to-violet-300"
          style={{ height: fillH }}
        />
      </div>
      <div className="flex flex-col gap-[2px]">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.span
            key={i}
            className="block w-1.5 h-1.5 rounded-full"
            animate={{ backgroundColor: ["#22d3ee", "#a855f7", "#22d3ee"] }}
            transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.15 }}
            style={{ boxShadow: "0 0 6px currentColor" }}
          />
        ))}
      </div>
    </div>
  );
}

function SweepBeam() {
  const angle = useMotionValue(-30);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const t = (performance.now() - start) / 4500; // 4.5s per cycle
      const a = Math.sin(t * Math.PI * 2) * 35; // -35..35 deg
      angle.set(a);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [angle]);
  const transform = useTransform(angle, (a) => `translateX(-50%) rotate(${a}deg)`);
  return (
    <motion.div
      aria-hidden
      className="absolute left-1/2 top-[-10%] w-[60vw] h-[80vh] pointer-events-none"
      style={{
        transform,
        transformOrigin: "50% 0%",
        background:
          "linear-gradient(180deg, rgba(0,229,255,0.18) 0%, rgba(0,229,255,0.06) 35%, transparent 70%)",
        clipPath: "polygon(45% 0%, 55% 0%, 100% 100%, 0% 100%)",
        mixBlendMode: "screen",
        filter: "blur(8px)",
      }}
    />
  );
}

function Embers() {
  // 18 floating particles drifting upward with subtle horizontal drift —
  // ash + paper-scrap + sparks vibe.
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: (i * 53.7) % 100,
    size: 1 + ((i * 7) % 4) * 0.6,
    duration: 7 + ((i * 3) % 6),
    delay: (i * 0.4) % 4,
    hue:
      i % 3 === 0
        ? "rgba(0,229,255,0.85)"
        : i % 3 === 1
          ? "rgba(168,85,247,0.75)"
          : "rgba(255,255,255,0.6)",
    drift: ((i % 2 === 0 ? 1 : -1) * (15 + (i % 4) * 4)),
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute bottom-[-10px] rounded-full"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.hue,
            boxShadow: `0 0 ${p.size * 5}px ${p.hue}`,
          }}
          animate={{
            y: ["0vh", "-105vh"],
            x: [0, p.drift],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.1, 0.85, 1],
          }}
        />
      ))}
    </div>
  );
}

function Skyline() {
  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
      {/* Animated construction crane silhouette on the left */}
      <svg
        aria-hidden
        className="absolute bottom-[18vh] left-[6%] h-[36vh] w-[18vw] opacity-80"
        viewBox="0 0 240 400"
        preserveAspectRatio="xMinYMax meet"
      >
        {/* Tower */}
        <rect x="92" y="60" width="14" height="320" fill="#0a1224" stroke="rgba(255,255,255,0.08)" />
        {/* Counterweight */}
        <rect x="40" y="50" width="60" height="14" fill="#0a1224" stroke="rgba(255,255,255,0.08)" />
        {/* Boom */}
        <rect x="98" y="50" width="120" height="14" fill="#0a1224" stroke="rgba(255,255,255,0.08)" />
        {/* Cabin */}
        <rect x="86" y="46" width="20" height="22" fill="#0e1830" stroke="rgba(255,255,255,0.1)" />
        {/* Hook cable + hook — animated together */}
        <motion.line
          x1="180"
          y1="64"
          x2="180"
          y2={120}
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1"
          initial={{ y2: 120 }}
          animate={{ y2: [120, 240, 120] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.rect
          x="174"
          y={120}
          width="12"
          height="6"
          fill="#1a2540"
          stroke="rgba(255,255,255,0.4)"
          initial={{ y: 120 }}
          animate={{ y: [120, 240, 120] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Tip warning light */}
        <motion.circle
          cx="218"
          cy="57"
          r="3"
          fill="#f43f5e"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.3, repeat: Infinity }}
        />
      </svg>

      <svg
        aria-hidden
        className="block w-full h-[22vh] opacity-95"
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="sky-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#070b16" stopOpacity="0" />
            <stop offset="60%" stopColor="#050810" stopOpacity="1" />
            <stop offset="100%" stopColor="#03060c" stopOpacity="1" />
          </linearGradient>
        </defs>
        <rect x="0" y="120" width="1440" height="100" fill="url(#sky-fade)" />
        <path
          d="M0,220 L0,170 L40,170 L40,140 L90,140 L90,160 L140,160 L140,120 L175,120 L175,150 L220,150 L220,110 L260,110 L260,135 L310,135 L310,90 L335,90 L335,75 L360,75 L360,90 L390,90 L390,140 L440,140 L440,118 L480,118 L480,150 L520,150 L520,100 L560,100 L560,130 L605,130 L605,80 L635,80 L635,60 L660,60 L660,80 L705,80 L705,140 L745,140 L745,110 L785,110 L785,135 L830,135 L830,95 L860,95 L860,75 L890,75 L890,95 L930,95 L930,140 L975,140 L975,118 L1015,118 L1015,150 L1055,150 L1055,108 L1095,108 L1095,135 L1140,135 L1140,90 L1175,90 L1175,75 L1205,75 L1205,90 L1245,90 L1245,140 L1290,140 L1290,118 L1335,118 L1335,150 L1380,150 L1380,108 L1440,108 L1440,220 Z"
          fill="#0a1224"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
        {/* Random lit windows */}
        {Array.from({ length: 80 }).map((_, i) => {
          const x = ((i * 137) % 1440) + ((i * 53) % 13);
          const y = 130 + ((i * 17) % 60);
          const lit = i % 3 === 0;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width="2"
              height="3"
              fill={lit ? "#7cd5ff" : "#1b2740"}
              opacity={lit ? 0.9 : 0.4}
            />
          );
        })}
      </svg>
    </div>
  );
}
