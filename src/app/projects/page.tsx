"use client";

import { memo, useCallback, useDeferredValue, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { locations, competitorDenseSites, studioReadyIds } from "./locations";
import LocationMap from "./LocationMap";
import LocationDetailCard from "./LocationDetailCard";
import type { Location } from "./types";

type StatusFilter = "all" | "available" | "booked";

function filterLocations(
  items: Location[],
  query: string,
  status: StatusFilter,
  competitorOnly: boolean,
  competitorIds: Set<number>
): Location[] {
  const q = query.trim().toLowerCase();
  return items.filter((loc) => {
    if (status !== "all" && loc.status !== status) return false;
    if (competitorOnly && !competitorIds.has(loc.id)) return false;
    if (!q) return true;
    const haystack = `${loc.title} ${loc.city} ${loc.location} ${loc.size} ${loc.status} ${loc.region ?? ""}`.toLowerCase();
    return haystack.includes(q);
  });
}

function InfoRow({ label, value, accent }: { label: string; value: React.ReactNode; accent?: "blue" | "warm" | "default" }) {
  const tone =
    accent === "blue"
      ? "text-[var(--neon-blue)]"
      : accent === "warm"
      ? "text-[#c2410c]"
      : "text-slate-800";
  return (
    <div className="grid grid-cols-[68px_1fr] items-baseline gap-2.5 border-t border-slate-200/70 py-2 first:border-t-0">
      <span className="text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
      <span className={`text-[0.8rem] font-medium leading-snug ${tone}`}>{value}</span>
    </div>
  );
}

type CardProps = {
  loc: Location;
  isActive: boolean;
  isCompetitorZone: boolean;
  hasOnSitePhoto?: boolean;
  onSelect: (loc: Location) => void;
};

const NetworkCard = memo(function NetworkCard({ loc, isActive, isCompetitorZone, hasOnSitePhoto, onSelect }: CardProps) {
  const projectCount = loc.projects?.length ?? 0;
  const reviewCount = loc.reviews?.length ?? 0;
  const avgRating = loc.reviews?.length
    ? loc.reviews.reduce((s, r) => s + r.rating, 0) / loc.reviews.length
    : null;
  const eyebrow = loc.region && loc.region !== loc.city ? loc.region : loc.city;
  return (
    <button
      type="button"
      onClick={() => onSelect(loc)}
      className={`group block w-full overflow-hidden rounded-2xl border bg-white p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--neon-blue)]/60 hover:shadow-[0_22px_50px_-28px_rgba(0,113,227,0.45)] ${
        isActive
          ? "border-[var(--neon-blue)] shadow-[0_24px_55px_-26px_rgba(0,113,227,0.55)]"
          : "border-slate-200/80 shadow-[0_2px_10px_-6px_rgba(15,23,42,0.12)]"
      }`}
    >
      {/* Header: eyebrow + rating */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {eyebrow}
          </p>
          {hasOnSitePhoto && (
            <span
              title="Verified on-site photograph available in the Live Campaign Studio"
              className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] px-2 py-[2px] text-[0.55rem] font-bold uppercase tracking-[0.14em] text-white shadow-[0_4px_10px_-4px_rgba(0,113,227,0.55)]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true" />
              On-site Photo
            </span>
          )}
        </div>
        {avgRating != null && (
          <span className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-slate-600">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {avgRating.toFixed(1)}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="mt-1.5 line-clamp-2 text-[1.02rem] font-black leading-snug tracking-tight text-slate-900">
        {loc.title}
      </h3>

      {/* Subtitle: full location line */}
      <p className="mt-1 line-clamp-1 text-[0.78rem] text-slate-500">
        {loc.location}
      </p>

      {/* Bordered info rows */}
      <div className="mt-3.5 border-t border-slate-200/70">
        {loc.audience && (
          <InfoRow label="Audience" value={loc.audience} accent="blue" />
        )}
        <InfoRow label="Format" value={loc.size} />
        <InfoRow
          label="Zone"
          value={isCompetitorZone ? "Competitor active — bold creative recommended" : `${projectCount} project${projectCount === 1 ? "" : "s"} · ${reviewCount} review${reviewCount === 1 ? "" : "s"}`}
          accent={isCompetitorZone ? "warm" : "default"}
        />
      </div>
    </button>
  );
});

export default function ProjectsPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [competitorOnly, setCompetitorOnly] = useState(false);

  const deferredQuery = useDeferredValue(query);
  const filtered = useMemo(
    () => filterLocations(locations, deferredQuery, status, competitorOnly, competitorDenseSites),
    [deferredQuery, status, competitorOnly]
  );

  const selected = useMemo(
    () => (selectedId != null ? locations.find((l) => l.id === selectedId) ?? null : null),
    [selectedId]
  );

  const handleSelect = useCallback((loc: Location) => setSelectedId(loc.id), []);
  const handleClose = useCallback(() => setSelectedId(null), []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-[#fbfaf8] to-[#f3f5fa]">
      {/* Soft brand glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]"
        style={{
          background:
            "radial-gradient(circle at 8% 8%, rgba(0,113,227,0.10), transparent 36%), radial-gradient(circle at 92% 4%, rgba(92,96,245,0.10), transparent 38%)",
        }}
      />

      <style jsx global>{`
        .leaflet-pane,
        .leaflet-top,
        .leaflet-bottom,
        .leaflet-control,
        .leaflet-container {
          z-index: 1 !important;
        }
        /* Brand-aligned marker cluster bubbles */
        .marker-cluster {
          background: rgba(0, 113, 227, 0.18) !important;
        }
        .marker-cluster div {
          color: #fff !important;
          font-weight: 800;
          font-family: inherit;
          box-shadow: 0 6px 18px -8px rgba(15, 23, 40, 0.45);
        }
        .marker-cluster-small div {
          background: linear-gradient(135deg, #0fc3cd, #2ed4b3) !important;
        }
        .marker-cluster-medium div {
          background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple)) !important;
        }
        .marker-cluster-large div {
          background: linear-gradient(135deg, var(--neon-purple), #ff3971) !important;
        }
      `}</style>

      <section className="mx-auto max-w-7xl px-4 pt-16 md:px-6 md:pt-20">
        {/* HERO — left-aligned, source-style */}
        <div className="max-w-4xl">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Our Network &amp; Past Work
          </p>
          <h1 className="mt-4 text-[clamp(2.4rem,5.4vw,4.4rem)] font-black leading-[1.02] tracking-tight text-[#0d2440]">
            Strategic OOH locations across{" "}
            <span className="bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] bg-clip-text text-transparent">
              high-traffic Maharashtra
            </span>{" "}
            corridors
          </h1>
          <p className="mt-5 max-w-[66ch] text-[1.02rem] leading-relaxed text-slate-500">
            Click any pin on the map — or a card below — to see past projects, sizes,
            and reviews from brands that have run campaigns at that site.
          </p>

          {/* Hero info rows — match modal pattern */}
          <div className="mt-7 max-w-[640px] rounded-2xl border border-slate-200/70 bg-white/70 px-5 py-1 backdrop-blur">
            <InfoRow label="Network" value={`${locations.length} active OOH sites`} accent="blue" />
            <InfoRow label="Corridors" value="Mumbai · Pune · Karjat · Lonavala · Navi Mumbai" />
            <InfoRow label="Available" value={`${locations.filter((l) => l.status === "available").length} open slots`} />
          </div>
        </div>

        {/* TWO-COLUMN GRID */}
        <div className="mt-10 grid gap-5 lg:grid-cols-2 lg:gap-5">
          {/* MAP */}
          <div className="overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_30px_80px_-50px_rgba(15,23,42,0.5)]">
            <div className="h-[520px] lg:h-[calc(100vh-160px)] lg:max-h-[760px]">
              <LocationMap
                locations={filtered}
                selectedId={selectedId}
                onSelect={handleSelect}
                competitorDenseSites={competitorDenseSites}
              />
            </div>
          </div>

          {/* PANEL */}
          <div className="flex h-[760px] flex-col overflow-hidden rounded-[22px] border border-slate-200/80 bg-white shadow-[0_30px_80px_-50px_rgba(15,23,42,0.5)] lg:h-[calc(100vh-160px)] lg:max-h-[760px]">
            {/* Search header */}
            <div className="border-b border-slate-200/70 bg-white px-5 py-5">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Search &amp; filter
              </p>
              <h2 className="mt-1 text-[1.15rem] font-black tracking-tight text-slate-900">
                Browse the network
              </h2>

              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, region, or format"
                aria-label="Search locations"
                className="mt-3.5 w-full rounded-[10px] border border-slate-200 bg-white px-3.5 py-3 text-[0.92rem] font-medium text-slate-800 outline-none transition focus:border-[var(--neon-blue)] focus:shadow-[0_0_0_3px_rgba(0,113,227,0.18)]"
              />

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {([
                  { key: "all", label: "All" },
                  { key: "available", label: "Available" },
                  { key: "booked", label: "Booked" },
                ] as const).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setStatus(opt.key)}
                    className={`rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold transition ${
                      status === opt.key
                        ? "border-[var(--neon-blue)] bg-[var(--neon-blue)] text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCompetitorOnly((v) => !v)}
                  className={`rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold transition ${
                    competitorOnly
                      ? "border-[var(--neon-purple)] bg-[var(--neon-purple)] text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                  }`}
                >
                  Competitor zones
                </button>
              </div>

              <p className="mt-3 text-[0.78rem] text-slate-500">
                Showing{" "}
                <strong className="font-bold text-slate-700">{filtered.length}</strong>{" "}
                of {locations.length} locations
              </p>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto bg-[#fafafa] px-4 py-4">
              {filtered.length === 0 ? (
                <p className="px-2 py-10 text-center text-sm text-slate-500">
                  No locations match your search.
                </p>
              ) : (
                <div className="grid gap-3.5 sm:grid-cols-2">
                  {filtered.map((loc) => (
                    <NetworkCard
                      key={loc.id}
                      loc={loc}
                      isActive={selectedId === loc.id}
                      isCompetitorZone={competitorDenseSites.has(loc.id)}
                      hasOnSitePhoto={studioReadyIds.has(loc.id)}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selected && (
          <LocationDetailCard
            location={selected}
            onClose={handleClose}
            isCompetitorZone={competitorDenseSites.has(selected.id)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
