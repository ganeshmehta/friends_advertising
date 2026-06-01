"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useCampaignUpload, type CampaignMediaKind } from "../../hooks/useCampaignUpload";
import {
  denormalizeQuad,
  deriveDefaultQuad,
  parseFormatAspect,
  quadToMatrix3d,
} from "../../services/perspectiveWarp";
import { renderBillboardPreview, sampleAmbientColor } from "../../services/renderBillboardPreview";
import type { LightingMood, Location, SunDirection } from "./types";

type Props = {
  location: Location;
  onRequestSite?: () => void;
};

type Preset = {
  id: string;
  label: string;
  url: string;
  kind: CampaignMediaKind;
};

const PRESETS: Preset[] = [
  { id: "highway-dawn", label: "Highway Dawn", url: "/media/campaign-highway-dawn.svg", kind: "image" },
  { id: "urban-junction", label: "Urban Junction", url: "/media/campaign-urban-junction.svg", kind: "image" },
  { id: "night-neon", label: "Night Neon", url: "/media/campaign-night-neon.svg", kind: "image" },
];

const WIDE_LAYOUT_MIN = 820;
const SRC_BASE_WIDTH = 1000;

type Rgba = { r: number; g: number; b: number; a: number };
type TimeRecipe = {
  bpBrightness: number;
  bpSaturation: number;
  bpHueRotate: number;
  bpContrast: number;
  bpSepia: number;
  cvBrightness: number;
  cvSaturation: number;
  ambientTint: Rgba;
  moodTint: Rgba;
  rimColor: Rgba;
  haloColor: Rgba;
  spillColor: Rgba;
  spillIntensity: number;
  shadowAlpha: number;
  vignetteAlpha: number;
  skyTop: string;
  skyBot: string;
  label: string;
};

const TIME_KEYFRAMES: Array<{ hour: number; recipe: TimeRecipe }> = [
  {
    hour: 6,
    recipe: {
      bpBrightness: 0.92, bpSaturation: 0.9, bpHueRotate: -6, bpContrast: 1.02, bpSepia: 0.05,
      cvBrightness: 0.98, cvSaturation: 0.96,
      ambientTint: { r: 220, g: 200, b: 180, a: 0.1 },
      moodTint: { r: 220, g: 230, b: 245, a: 0.16 },
      rimColor: { r: 255, g: 200, b: 140, a: 0.45 },
      haloColor: { r: 255, g: 190, b: 130, a: 0 },
      spillColor: { r: 255, g: 200, b: 150, a: 1 }, spillIntensity: 0,
      shadowAlpha: 0.26, vignetteAlpha: 0.2,
      skyTop: "#f0c8a0", skyBot: "#fbe2c3",
      label: "Dawn",
    },
  },
  {
    hour: 9,
    recipe: {
      bpBrightness: 1.0, bpSaturation: 1.0, bpHueRotate: 0, bpContrast: 1.0, bpSepia: 0,
      cvBrightness: 1.0, cvSaturation: 1.0,
      ambientTint: { r: 255, g: 250, b: 235, a: 0.04 },
      moodTint: { r: 255, g: 248, b: 230, a: 0.06 },
      rimColor: { r: 255, g: 240, b: 210, a: 0.5 },
      haloColor: { r: 255, g: 240, b: 210, a: 0 },
      spillColor: { r: 255, g: 245, b: 215, a: 1 }, spillIntensity: 0,
      shadowAlpha: 0.34, vignetteAlpha: 0.13,
      skyTop: "#8ec6ff", skyBot: "#dcefff",
      label: "Morning",
    },
  },
  {
    hour: 12,
    recipe: {
      bpBrightness: 1.02, bpSaturation: 1.02, bpHueRotate: 0, bpContrast: 1.0, bpSepia: 0,
      cvBrightness: 1.02, cvSaturation: 1.02,
      ambientTint: { r: 255, g: 250, b: 235, a: 0.03 },
      moodTint: { r: 255, g: 250, b: 235, a: 0.04 },
      rimColor: { r: 255, g: 245, b: 220, a: 0.55 },
      haloColor: { r: 255, g: 245, b: 220, a: 0 },
      spillColor: { r: 255, g: 250, b: 230, a: 1 }, spillIntensity: 0,
      shadowAlpha: 0.38, vignetteAlpha: 0.1,
      skyTop: "#6cb4ff", skyBot: "#bee0ff",
      label: "High Noon",
    },
  },
  {
    hour: 15,
    recipe: {
      bpBrightness: 0.98, bpSaturation: 1.04, bpHueRotate: 4, bpContrast: 1.0, bpSepia: 0.03,
      cvBrightness: 1.0, cvSaturation: 1.04,
      ambientTint: { r: 255, g: 235, b: 200, a: 0.06 },
      moodTint: { r: 255, g: 225, b: 190, a: 0.1 },
      rimColor: { r: 255, g: 220, b: 170, a: 0.55 },
      haloColor: { r: 255, g: 210, b: 150, a: 0.05 },
      spillColor: { r: 255, g: 220, b: 170, a: 1 }, spillIntensity: 0.05,
      shadowAlpha: 0.4, vignetteAlpha: 0.14,
      skyTop: "#9cc8ff", skyBot: "#ffd8a8",
      label: "Afternoon",
    },
  },
  {
    hour: 17.5,
    recipe: {
      bpBrightness: 0.86, bpSaturation: 1.08, bpHueRotate: 8, bpContrast: 1.02, bpSepia: 0.1,
      cvBrightness: 1.05, cvSaturation: 1.1,
      ambientTint: { r: 255, g: 200, b: 150, a: 0.14 },
      moodTint: { r: 255, g: 180, b: 130, a: 0.18 },
      rimColor: { r: 255, g: 170, b: 100, a: 0.6 },
      haloColor: { r: 255, g: 170, b: 100, a: 0.12 },
      spillColor: { r: 255, g: 180, b: 120, a: 1 }, spillIntensity: 0.22,
      shadowAlpha: 0.44, vignetteAlpha: 0.22,
      skyTop: "#ff9c4a", skyBot: "#ffd6a0",
      label: "Golden Hour",
    },
  },
  {
    hour: 19,
    recipe: {
      bpBrightness: 0.66, bpSaturation: 1.0, bpHueRotate: 12, bpContrast: 1.08, bpSepia: 0.18,
      cvBrightness: 1.15, cvSaturation: 1.18,
      ambientTint: { r: 200, g: 150, b: 130, a: 0.22 },
      moodTint: { r: 220, g: 140, b: 110, a: 0.24 },
      rimColor: { r: 255, g: 130, b: 90, a: 0.6 },
      haloColor: { r: 255, g: 150, b: 100, a: 0.2 },
      spillColor: { r: 255, g: 160, b: 110, a: 1 }, spillIntensity: 0.45,
      shadowAlpha: 0.32, vignetteAlpha: 0.32,
      skyTop: "#9a3a86", skyBot: "#ff7860",
      label: "Civil Dusk",
    },
  },
  {
    hour: 20.5,
    recipe: {
      bpBrightness: 0.45, bpSaturation: 0.88, bpHueRotate: -8, bpContrast: 1.12, bpSepia: 0.08,
      cvBrightness: 1.32, cvSaturation: 1.28,
      ambientTint: { r: 140, g: 160, b: 200, a: 0.2 },
      moodTint: { r: 150, g: 175, b: 220, a: 0.16 },
      rimColor: { r: 255, g: 220, b: 170, a: 0.55 },
      haloColor: { r: 255, g: 220, b: 180, a: 0.3 },
      spillColor: { r: 255, g: 220, b: 170, a: 1 }, spillIntensity: 0.72,
      shadowAlpha: 0.2, vignetteAlpha: 0.42,
      skyTop: "#1e2960", skyBot: "#4a3a80",
      label: "Twilight",
    },
  },
  {
    hour: 22,
    recipe: {
      bpBrightness: 0.3, bpSaturation: 0.8, bpHueRotate: -14, bpContrast: 1.18, bpSepia: 0,
      cvBrightness: 1.45, cvSaturation: 1.32,
      ambientTint: { r: 120, g: 150, b: 200, a: 0.22 },
      moodTint: { r: 130, g: 160, b: 210, a: 0.14 },
      rimColor: { r: 255, g: 230, b: 190, a: 0.5 },
      haloColor: { r: 255, g: 235, b: 200, a: 0.42 },
      spillColor: { r: 255, g: 235, b: 200, a: 1 }, spillIntensity: 1,
      shadowAlpha: 0.14, vignetteAlpha: 0.5,
      skyTop: "#0a1230", skyBot: "#1a2450",
      label: "Night",
    },
  },
];

const MOOD_HOUR: Record<LightingMood, number> = { dawn: 6, day: 12, dusk: 19, night: 21 };
const MOOD_CHIPS: Array<{ mood: LightingMood; label: string }> = [
  { mood: "dawn", label: "Dawn" },
  { mood: "day", label: "Day" },
  { mood: "dusk", label: "Dusk" },
  { mood: "night", label: "Night" },
];

const HOUR_MIN = 6;
const HOUR_MAX = 22;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpRgba = (a: Rgba, b: Rgba, t: number): Rgba => ({
  r: lerp(a.r, b.r, t),
  g: lerp(a.g, b.g, t),
  b: lerp(a.b, b.b, t),
  a: lerp(a.a, b.a, t),
});
const rgbaCss = (c: Rgba) =>
  `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${c.a.toFixed(3)})`;

function recipeAt(hour: number): TimeRecipe {
  const clamped = Math.max(HOUR_MIN, Math.min(HOUR_MAX, hour));
  if (clamped <= TIME_KEYFRAMES[0].hour) return TIME_KEYFRAMES[0].recipe;
  if (clamped >= TIME_KEYFRAMES[TIME_KEYFRAMES.length - 1].hour) {
    return TIME_KEYFRAMES[TIME_KEYFRAMES.length - 1].recipe;
  }
  let i = 0;
  while (i < TIME_KEYFRAMES.length - 1 && TIME_KEYFRAMES[i + 1].hour < clamped) i++;
  const a = TIME_KEYFRAMES[i];
  const b = TIME_KEYFRAMES[i + 1];
  const t = (clamped - a.hour) / (b.hour - a.hour);
  return {
    bpBrightness: lerp(a.recipe.bpBrightness, b.recipe.bpBrightness, t),
    bpSaturation: lerp(a.recipe.bpSaturation, b.recipe.bpSaturation, t),
    bpHueRotate: lerp(a.recipe.bpHueRotate, b.recipe.bpHueRotate, t),
    bpContrast: lerp(a.recipe.bpContrast, b.recipe.bpContrast, t),
    bpSepia: lerp(a.recipe.bpSepia, b.recipe.bpSepia, t),
    cvBrightness: lerp(a.recipe.cvBrightness, b.recipe.cvBrightness, t),
    cvSaturation: lerp(a.recipe.cvSaturation, b.recipe.cvSaturation, t),
    ambientTint: lerpRgba(a.recipe.ambientTint, b.recipe.ambientTint, t),
    moodTint: lerpRgba(a.recipe.moodTint, b.recipe.moodTint, t),
    rimColor: lerpRgba(a.recipe.rimColor, b.recipe.rimColor, t),
    haloColor: lerpRgba(a.recipe.haloColor, b.recipe.haloColor, t),
    spillColor: lerpRgba(a.recipe.spillColor, b.recipe.spillColor, t),
    spillIntensity: lerp(a.recipe.spillIntensity, b.recipe.spillIntensity, t),
    shadowAlpha: lerp(a.recipe.shadowAlpha, b.recipe.shadowAlpha, t),
    vignetteAlpha: lerp(a.recipe.vignetteAlpha, b.recipe.vignetteAlpha, t),
    skyTop: t < 0.5 ? a.recipe.skyTop : b.recipe.skyTop,
    skyBot: t < 0.5 ? a.recipe.skyBot : b.recipe.skyBot,
    label: t < 0.5 ? a.recipe.label : b.recipe.label,
  };
}

function backplateFilter(r: TimeRecipe): string {
  return `brightness(${r.bpBrightness.toFixed(3)}) saturate(${r.bpSaturation.toFixed(3)}) hue-rotate(${r.bpHueRotate.toFixed(1)}deg) contrast(${r.bpContrast.toFixed(3)})${r.bpSepia > 0.005 ? ` sepia(${r.bpSepia.toFixed(3)})` : ""}`;
}
function creativeFilter(r: TimeRecipe): string {
  return `brightness(${r.cvBrightness.toFixed(3)}) saturate(${r.cvSaturation.toFixed(3)})`;
}
function rimGradientCss(r: TimeRecipe, direction: SunDirection): string {
  const start = rgbaCss(r.rimColor);
  const fade = rgbaCss({ ...r.rimColor, a: 0 });
  const angle = direction === "top" ? "180deg" : "90deg";
  return `linear-gradient(${angle}, ${start}, ${fade} ${direction === "top" ? "40%" : "32%"})`;
}
function formatClock(hour: number): string {
  const h24 = Math.max(0, Math.min(23, Math.floor(hour)));
  const mins = Math.round((hour - h24) * 60);
  const period = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${mins.toString().padStart(2, "0")} ${period}`;
}
function quadCentroid(quad: import("./types").BillboardQuad): [number, number] {
  let cx = 0, cy = 0;
  for (const [x, y] of quad) { cx += x; cy += y; }
  return [cx / 4, cy / 4];
}
function quadToClipPath(quad: import("./types").BillboardQuad | undefined): string | undefined {
  if (!quad) return undefined;
  const pts = quad.map(([x, y]) => `${(x * 100).toFixed(3)}% ${(y * 100).toFixed(3)}%`);
  return `polygon(${pts.join(", ")})`;
}
function isRealPhoto(image: string): boolean {
  if (!image) return false;
  if (image.endsWith(".svg")) return false;
  if (image.includes("unsplash.com") || image.includes("images.unsplash")) return false;
  if (image.includes("location-placeholder")) return false;
  return true;
}

function useStageSize(ref: React.RefObject<HTMLDivElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize((prev) => {
        if (Math.abs(prev.width - rect.width) < 1 && Math.abs(prev.height - rect.height) < 1) return prev;
        return { width: rect.width, height: rect.height };
      });
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
  return size;
}

export function CampaignVisualizer({ location, onRequestSite }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const rootSize = useStageSize(rootRef);
  const isWide = rootSize.width >= WIDE_LAYOUT_MIN;
  const { asset, error, loading, upload, setPreset, clear } = useCampaignUpload();
  const [dragOver, setDragOver] = useState(false);
  const initialHour = MOOD_HOUR[location.lightingMood ?? "day"];
  const [hour, setHour] = useState<number>(initialHour);
  const [splitMode, setSplitMode] = useState(false);
  const [splitPos, setSplitPos] = useState(0.55);
  const [splitTouched, setSplitTouched] = useState(false);
  const [ambientTint, setAmbientTint] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const fileInputId = useId();
  const sliderId = useId();

  const stageRef = useRef<HTMLDivElement>(null);
  const stageSize = useStageSize(stageRef);

  const backplate = location.images?.[0] ?? "/media/location-placeholder.svg";
  const quad = useMemo(
    () => location.billboardQuad ?? deriveDefaultQuad(location.size),
    [location.billboardQuad, location.size]
  );
  const billboardAspect = parseFormatAspect(location.size);
  const sunDirection: SunDirection = location.sunDirection ?? "right";
  const hasRealPhoto = isRealPhoto(backplate);
  const hasCalibratedQuad = Boolean(location.billboardQuad);
  const isStudioMode = hasRealPhoto && hasCalibratedQuad;
  const recipe = useMemo(() => recipeAt(hour), [hour]);

  // When we have a real on-site photo with a calibrated quad, the stage MUST
  // match the photo's natural aspect ratio — otherwise object-cover crops the
  // photo, the quad coords drift, and the creative lands in the wrong spot.
  const [backplateAspect, setBackplateAspect] = useState<number | null>(null);
  useEffect(() => {
    if (!isStudioMode) { setBackplateAspect(null); return; }
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setBackplateAspect(img.naturalWidth / img.naturalHeight);
      }
    };
    img.src = backplate;
    return () => { cancelled = true; };
  }, [backplate, isStudioMode]);
  const stageAspect = backplateAspect ?? 16 / 9;

  const mood: LightingMood = useMemo(() => {
    if (hour < 8) return "dawn";
    if (hour < 16.5) return "day";
    if (hour < 20) return "dusk";
    return "night";
  }, [hour]);

  const [spillCx, spillCy] = useMemo(() => quadCentroid(quad), [quad]);

  useEffect(() => {
    setHour(MOOD_HOUR[location.lightingMood ?? "day"]);
  }, [location.id, location.lightingMood]);

  const transform = useMemo(() => {
    if (stageSize.width === 0 || stageSize.height === 0) return "none";
    const aspect = asset ? asset.width / asset.height : billboardAspect;
    const srcHeight = SRC_BASE_WIDTH / aspect;
    const dst = denormalizeQuad(quad, stageSize.width, stageSize.height);
    return quadToMatrix3d(SRC_BASE_WIDTH, srcHeight, dst);
  }, [stageSize, quad, asset, billboardAspect]);

  const sourceHeight = useMemo(() => {
    const aspect = asset ? asset.width / asset.height : billboardAspect;
    return SRC_BASE_WIDTH / aspect;
  }, [asset, billboardAspect]);

  const aspectMismatch = useMemo(() => {
    if (!asset) return null;
    const creativeAspect = asset.width / asset.height;
    const diff = Math.abs(creativeAspect - billboardAspect) / billboardAspect;
    if (diff < 0.15) return null;
    return {
      creative: creativeAspect.toFixed(2),
      billboard: billboardAspect.toFixed(2),
    };
  }, [asset, billboardAspect]);

  useEffect(() => {
    let cancelled = false;
    if (!isStudioMode) {
      setAmbientTint(null);
      return;
    }
    void sampleAmbientColor(backplate, quad).then((rgb) => {
      if (cancelled) return;
      if (!rgb) { setAmbientTint(null); return; }
      setAmbientTint(`rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, 0.12)`);
    });
    return () => { cancelled = true; };
  }, [backplate, quad, isStudioMode]);

  const onFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      void upload(files[0]);
    },
    [upload]
  );
  const onDrop = useCallback(
    (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files); },
    [onFiles]
  );
  const onDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(true); }, []);
  const onDragLeave = useCallback(() => setDragOver(false), []);

  const onDownload = useCallback(async () => {
    if (!asset || asset.kind !== "image") return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const dataUrl = await renderBillboardPreview({
        backplateUrl: backplate,
        creativeUrl: asset.url,
        quad,
        tint: rgbaCss(recipe.moodTint),
        shadowColor: `rgba(0, 0, 0, ${recipe.shadowAlpha})`,
        sunDirection,
        mimeType: "image/jpeg",
        quality: 0.92,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${location.id}-preview-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : "Could not export preview");
    } finally {
      setDownloading(false);
    }
  }, [asset, location.id, backplate, quad, recipe, sunDirection]);

  const clipPath = useMemo(() => quadToClipPath(location.billboardQuad), [location.billboardQuad]);
  const rimEdgeStyle: React.CSSProperties | undefined =
    clipPath !== undefined
      ? {
          clipPath,
          WebkitClipPath: clipPath,
          background: rimGradientCss(recipe, sunDirection),
          transform: sunDirection === "left" ? "scaleX(-1)" : "none",
        }
      : undefined;

  const bpFilter = backplateFilter(recipe);
  const cvFilter = creativeFilter(recipe);

  const spillStyle: React.CSSProperties | undefined =
    isStudioMode && asset && recipe.spillIntensity > 0.02
      ? {
          background: `radial-gradient(${(35 + recipe.spillIntensity * 35).toFixed(1)}% ${(28 + recipe.spillIntensity * 30).toFixed(1)}% at ${(spillCx * 100).toFixed(1)}% ${(spillCy * 100).toFixed(1)}%, ${rgbaCss({ ...recipe.spillColor, a: recipe.spillIntensity * 0.85 })}, ${rgbaCss({ ...recipe.spillColor, a: 0 })} 70%)`,
          opacity: recipe.spillIntensity,
        }
      : undefined;

  const haloStyle: React.CSSProperties | undefined =
    isStudioMode && asset && clipPath && recipe.haloColor.a > 0.01
      ? {
          clipPath,
          WebkitClipPath: clipPath,
          boxShadow: `0 0 ${(40 + recipe.haloColor.a * 80).toFixed(0)}px ${(20 + recipe.haloColor.a * 60).toFixed(0)}px ${rgbaCss(recipe.haloColor)}`,
        }
      : undefined;

  const afterClip = splitMode ? `inset(0 0 0 ${(splitPos * 100).toFixed(2)}%)` : undefined;

  const onSplitPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setSplitTouched(true);
    const move = (clientX: number) => {
      const rect = stageRef.current!.getBoundingClientRect();
      const pct = (clientX - rect.left) / rect.width;
      setSplitPos(Math.max(0.04, Math.min(0.96, pct)));
    };
    move(event.clientX);
    const onMove = (e: PointerEvent) => move(e.clientX);
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return (
    <section ref={rootRef} className="cv-root rounded-2xl border border-slate-200/70 bg-gradient-to-br from-slate-50 via-white to-slate-50 p-5 lg:p-7">
      <header className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--neon-purple)]">
          {isStudioMode ? "Live Campaign Studio" : "Live Campaign Visualizer"}
        </p>
        <h3 className="mt-1.5 text-xl font-semibold text-slate-900 lg:text-2xl">
          {isStudioMode
            ? `Mount your creative on the actual ${location.title} hoarding`
            : `See your creative on this ${location.size} hoarding`}
        </h3>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          {isStudioMode
            ? `Real on-site photograph from ${location.location}. Drop a still below and we'll composite it onto the billboard face with matched scene lighting — everything runs in your browser.`
            : `Drop a still or short video below to preview it live on the ${location.title} billboard. Everything runs in your browser — nothing is uploaded.`}
        </p>
      </header>

      <div
        className="grid gap-5"
        style={{
          gridTemplateColumns: isWide ? "260px minmax(0,1fr) 260px" : "minmax(0,1fr)",
        }}
      >
        {/* LEFT RAIL */}
        <div className="flex flex-col gap-3">
          <label
            htmlFor={fileInputId}
            className={[
              "flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed p-5 text-center text-sm transition cursor-pointer",
              dragOver
                ? "border-[var(--neon-purple)] bg-purple-50/60"
                : "border-slate-300 bg-white/60 hover:border-slate-400",
              loading && "opacity-70",
            ].filter(Boolean).join(" ")}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
          >
            <input
              id={fileInputId}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,video/quicktime"
              onChange={(e) => onFiles(e.target.files)}
              hidden
            />
            <div className="text-2xl text-[var(--neon-purple)]" aria-hidden="true">↑</div>
            <strong className="text-slate-900">{loading ? "Loading…" : "Drop your creative"}</strong>
            <span className="text-xs text-slate-500">
              or click to browse · PNG, JPG, SVG, MP4, WEBM · up to 25 MB
            </span>
          </label>

          {error && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
          )}

          {aspectMismatch && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Heads up — your creative is {aspectMismatch.creative}:1 but this billboard is{" "}
              {aspectMismatch.billboard}:1. It will be stretched slightly to fill the face. For the
              cleanest preview, export at {aspectMismatch.billboard}:1.
            </p>
          )}

          <div className="rounded-xl bg-white/60 p-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Or try a sample creative
            </p>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPreset(p.url, p.label, p.kind)}
                  disabled={loading}
                  className={[
                    "group flex flex-col items-center gap-1 rounded-lg border p-1.5 text-[10px] transition",
                    asset?.name === p.label
                      ? "border-[var(--neon-purple)] bg-purple-50"
                      : "border-slate-200 bg-white hover:border-slate-400",
                  ].join(" ")}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.label} className="h-10 w-full rounded object-cover" />
                  <span className="text-slate-700">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {asset && (
            <div className="flex items-center justify-between rounded-md bg-white/70 px-3 py-2 text-xs">
              <span className="truncate text-slate-700" title={asset.name}>{asset.name}</span>
              <button
                type="button"
                onClick={clear}
                className="ml-2 rounded px-2 py-0.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* CENTER: stage */}
        <div className="flex flex-col gap-2">
          <div
            ref={stageRef}
            data-mood={mood}
            aria-label={`Preview of ${location.title} billboard`}
            className="relative w-full overflow-hidden rounded-xl bg-slate-900 shadow-[0_30px_60px_-20px_rgba(15,23,42,0.4)]"
            style={{ aspectRatio: `${stageAspect}` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="absolute inset-0 h-full w-full object-cover"
              src={backplate}
              alt=""
              style={{ filter: bpFilter, transition: "filter 0.4s ease" }}
            />

            {spillStyle && (
              <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={spillStyle} />
            )}

            <div
              className="absolute inset-0"
              style={afterClip ? { clipPath: afterClip, WebkitClipPath: afterClip } : undefined}
            >
              {isStudioMode && asset && clipPath && (
                <div
                  className="absolute inset-0 bg-black"
                  aria-hidden="true"
                  style={{
                    clipPath,
                    WebkitClipPath: clipPath,
                    opacity: recipe.shadowAlpha,
                    transform:
                      sunDirection === "left"
                        ? "translate(0.6%, 0.8%)"
                        : sunDirection === "top"
                          ? "translate(0, 1.2%)"
                          : "translate(-0.6%, 0.8%)",
                    filter: "blur(4px)",
                  }}
                />
              )}

              {asset && stageSize.width > 0 && (
                <div
                  className="absolute left-0 top-0 origin-top-left overflow-hidden bg-white"
                  style={{
                    width: SRC_BASE_WIDTH,
                    height: sourceHeight,
                    transform,
                    filter: isStudioMode ? cvFilter : undefined,
                    transition: "filter 0.4s ease",
                    padding: `${Math.round(sourceHeight * 0.035)}px ${Math.round(SRC_BASE_WIDTH * 0.035)}px`,
                  }}
                >
                  {asset.kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={asset.url} alt={asset.name} draggable={false} className="block h-full w-full object-cover" />
                  ) : (
                    <video src={asset.url} autoPlay loop muted playsInline className="block h-full w-full object-cover" />
                  )}
                </div>
              )}

              {isStudioMode && asset && clipPath && ambientTint && (
                <div
                  className="pointer-events-none absolute inset-0 mix-blend-multiply"
                  aria-hidden="true"
                  style={{ clipPath, WebkitClipPath: clipPath, background: ambientTint }}
                />
              )}
              {isStudioMode && asset && clipPath && (
                <div
                  className="pointer-events-none absolute inset-0 mix-blend-multiply"
                  aria-hidden="true"
                  style={{ clipPath, WebkitClipPath: clipPath, background: rgbaCss(recipe.moodTint) }}
                />
              )}
              {isStudioMode && asset && rimEdgeStyle && (
                <div
                  className="pointer-events-none absolute inset-0 mix-blend-screen"
                  aria-hidden="true"
                  style={rimEdgeStyle}
                />
              )}
              {haloStyle && (
                <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={haloStyle} />
              )}
              {isStudioMode && asset && clipPath && (
                <div
                  className="pointer-events-none absolute inset-0"
                  aria-hidden="true"
                  style={{
                    clipPath,
                    WebkitClipPath: clipPath,
                    boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.6)",
                  }}
                />
              )}
            </div>

            {isStudioMode && (
              <>
                <div
                  className="pointer-events-none absolute inset-0"
                  aria-hidden="true"
                  style={{
                    background:
                      "radial-gradient(120% 80% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
                    opacity: recipe.vignetteAlpha,
                  }}
                />
                <div className="pointer-events-none absolute inset-0 cv-grain" aria-hidden="true" />
              </>
            )}

            {splitMode && asset && isStudioMode && (
              <>
                <div
                  className="absolute top-0 z-20 flex h-full w-6 -translate-x-1/2 cursor-ew-resize items-center justify-center"
                  style={{ left: `${(splitPos * 100).toFixed(2)}%` }}
                  onPointerDown={onSplitPointerDown}
                  role="slider"
                  aria-label="Compare before and after"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(splitPos * 100)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowLeft") setSplitPos((p) => Math.max(0.04, p - 0.02));
                    if (e.key === "ArrowRight") setSplitPos((p) => Math.min(0.96, p + 0.02));
                  }}
                >
                  <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]" aria-hidden="true" />
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg" aria-hidden="true">
                    <span>‹</span>
                    <span>›</span>
                  </div>
                </div>
                <span
                  className={`absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-[10px] uppercase tracking-widest text-white transition-opacity ${splitTouched ? "opacity-30" : "opacity-100"}`}
                  aria-hidden="true"
                >
                  Before
                </span>
                <span
                  className={`absolute right-3 top-3 rounded-md bg-black/60 px-2 py-1 text-[10px] uppercase tracking-widest text-white transition-opacity ${splitTouched ? "opacity-30" : "opacity-100"}`}
                  aria-hidden="true"
                >
                  After
                </span>
              </>
            )}

            {!asset && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
                <span className="rounded-full bg-black/60 px-3 py-1 text-[11px] uppercase tracking-widest text-white">
                  {isStudioMode ? "Drop a creative to see it mounted" : "Your creative appears here"}
                </span>
              </div>
            )}

            {!hasRealPhoto && (
              <div
                className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-900/75 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/95 backdrop-blur-sm"
                aria-hidden="true"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Awaiting on-site photograph
              </div>
            )}
          </div>

          <div className="text-xs text-slate-600">
            <p>
              <strong className="text-slate-800">{location.title}</strong> · {location.size}
              {location.region && <> · {location.region}</>}
            </p>
            {isStudioMode && location.photoCredit && (
              <p className="text-[10px] text-slate-500">{location.photoCredit}</p>
            )}
          </div>
        </div>

        {/* RIGHT RAIL */}
        <div className="flex flex-col gap-3">
          <div className="rounded-xl bg-white/60 p-3">
            <div className="flex items-baseline justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Time of day</p>
              <p className="text-sm">
                <strong className="text-slate-900">{formatClock(hour)}</strong>
                <span className="ml-1 text-slate-500">· {recipe.label}</span>
              </p>
            </div>
            <div
              className="mt-2 h-2.5 w-full rounded-full"
              aria-hidden="true"
              style={{
                background: `linear-gradient(180deg, ${recipe.skyTop}, ${recipe.skyBot})`,
                transition: "background 0.4s ease",
              }}
            />
            <input
              id={sliderId}
              type="range"
              min={HOUR_MIN}
              max={HOUR_MAX}
              step={0.25}
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              aria-label="Time of day"
              className="mt-2 w-full accent-[var(--neon-purple)]"
            />
            <div className="mt-1 flex justify-between text-[10px] text-slate-500">
              <span>6 AM</span><span>Noon</span><span>6 PM</span><span>10 PM</span>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1" role="radiogroup" aria-label="Lighting mood">
              {MOOD_CHIPS.map((chip) => (
                <button
                  key={chip.mood}
                  type="button"
                  role="radio"
                  aria-checked={mood === chip.mood}
                  onClick={() => setHour(MOOD_HOUR[chip.mood])}
                  className={[
                    "rounded-md px-2 py-1 text-[11px] font-medium transition",
                    mood === chip.mood
                      ? "bg-[var(--neon-purple)] text-white shadow"
                      : "bg-white text-slate-600 hover:bg-slate-100",
                  ].join(" ")}
                >
                  {chip.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-slate-500">
              Drag the slider to scrub from sunrise to nightfall — the billboard self-illuminates as the scene darkens.
            </p>
          </div>

          {isStudioMode && asset && (
            <div className="rounded-xl bg-white/60 p-3">
              <button
                type="button"
                onClick={() => {
                  setSplitMode((prev) => {
                    if (!prev) {
                      setSplitPos(Math.max(0.18, Math.min(0.82, spillCx)));
                      setSplitTouched(false);
                    }
                    return !prev;
                  });
                }}
                aria-pressed={splitMode}
                className={[
                  "flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition",
                  splitMode
                    ? "bg-[var(--neon-blue)] text-white"
                    : "bg-slate-900 text-white hover:bg-slate-800",
                ].join(" ")}
              >
                <span aria-hidden="true" className="inline-flex h-2 w-4 overflow-hidden rounded-sm border border-white/50">
                  <span className="h-full w-1/2 bg-white" />
                  <span className="h-full w-1/2 bg-transparent" />
                </span>
                {splitMode ? "Hide before/after" : "Compare before/after"}
              </button>
              {splitMode && (
                <p className="mt-2 text-[10px] text-slate-500">
                  Drag the divider to wipe between the empty hoarding and your creative.
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            {isStudioMode && (
              <button
                type="button"
                onClick={onDownload}
                disabled={!asset || asset.kind !== "image" || downloading}
                title={asset?.kind === "video" ? "Download is image-only. Use a still creative to export a JPG." : undefined}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {downloading ? "Rendering…" : "Download JPG preview"}
              </button>
            )}
            <a
              href="#contact"
              onClick={(e) => {
                if (onRequestSite) { e.preventDefault(); onRequestSite(); }
              }}
              className="rounded-md bg-[var(--neon-blue)] px-3 py-2 text-center text-xs font-semibold text-white shadow hover:bg-[var(--neon-purple)]"
            >
              Reserve this site →
            </a>
          </div>

          {downloadError && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{downloadError}</p>
          )}
        </div>
      </div>
    </section>
  );
}
