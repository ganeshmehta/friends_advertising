"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { X, MapPin, Users, Clock, TrendingUp, Tag, CheckCircle2, Star } from "lucide-react";
import type { Location, LocationProject, LocationReview } from "./types";
import { CampaignVisualizer } from "./CampaignVisualizer";

type Props = {
  location: Location;
  onClose: () => void;
  isCompetitorZone?: boolean;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"
          }`}
        />
      ))}
    </span>
  );
}

function ProjectCard({ project }: { project: LocationProject }) {
  return (
    <article className="flex gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={project.image} alt={project.title} className="h-20 w-28 flex-none rounded-lg object-cover" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--neon-blue)]">
          {project.brand}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">{project.title}</p>
        <p className="mt-1 text-xs text-slate-600">{project.objective}</p>
        <p className="mt-1 text-xs font-semibold text-emerald-600">{project.result}</p>
      </div>
    </article>
  );
}

function ReviewCard({ review }: { review: LocationReview }) {
  const initial = review.author.charAt(0);
  return (
    <article className="rounded-xl border border-slate-100 bg-white p-4">
      <header className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-gradient-to-br from-[var(--neon-blue)] to-[var(--neon-purple)] text-sm font-semibold text-white">
          {initial}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">{review.author}</p>
          {review.role && <p className="text-[11px] text-slate-500">{review.role}</p>}
        </div>
        <div className="flex flex-col items-end">
          <StarRating rating={review.rating} />
          <p className="mt-0.5 text-[10px] text-slate-400">{review.date}</p>
        </div>
      </header>
      <blockquote className="mt-3 text-sm leading-relaxed text-slate-700">
        &ldquo;{review.quote}&rdquo;
      </blockquote>
    </article>
  );
}

export default function LocationDetailCard({ location, onClose, isCompetitorZone }: Props) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  const monthly = location.pricing?.Monthly ?? Object.values(location.pricing ?? {})[0];
  const avgRating = location.reviews?.length
    ? location.reviews.reduce((s, r) => s + r.rating, 0) / location.reviews.length
    : null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={`${location.title} details`}
    >
      {/* Lighter backdrop on the left so the map is still visible behind */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close detail panel"
        className="absolute inset-0 h-full w-full cursor-default bg-slate-900/20 backdrop-blur-[2px]"
      />

      <motion.article
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 320 }}
        className="relative z-10 flex h-full w-full flex-col overflow-hidden rounded-l-[24px] bg-white shadow-[-20px_0_60px_-20px_rgba(15,23,42,0.28)] md:max-w-[min(1180px,calc(100vw-72px))]"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-lg transition hover:bg-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex-1 overflow-y-auto">
          <div className="relative h-[220px] md:h-[260px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={location.images[0]}
              alt={location.title}
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

            <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-center gap-2">
              {location.region && (
                <span className="rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--neon-purple)] shadow-sm">
                  {location.region}
                </span>
              )}
              <span className="rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--neon-blue)] shadow-sm">
                {location.city}
              </span>
              <span
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide shadow-sm ${
                  location.status === "available"
                    ? "bg-emerald-500 text-white"
                    : "bg-amber-500 text-white"
                }`}
              >
                {location.status}
              </span>
              <span className="rounded-full bg-black/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm">
                {location.size}
              </span>
              {isCompetitorZone && (
                <span className="rounded-full bg-purple-100 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-purple-800 shadow-sm">
                  Competitor-dense zone
                </span>
              )}
              {avgRating != null && (
                <span className="ml-auto flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {avgRating.toFixed(1)} · {location.reviews?.length ?? 0} reviews
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-[1.8rem]">
            {location.title}
          </h2>

          <a
            href={location.location.startsWith('http') ? location.location : `https://www.google.com/maps/search/${encodeURIComponent(location.location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[var(--neon-blue)] underline decoration-[var(--neon-blue)] decoration-2 underline-offset-2 hover:text-[#0080ff] hover:decoration-[#0080ff] transition-all duration-200"
          >
            <MapPin className="h-4 w-4 text-[var(--neon-blue)]" />
            Google Maps
          </a>

          {location.audience && (
            <p className="mt-3 text-xs font-medium uppercase tracking-wider text-slate-400">
              {location.audience}
            </p>
          )}

          <p className="mt-5 text-[0.95rem] leading-relaxed text-slate-600">
            {location.description}
          </p>

          <div className="mt-7 grid gap-3 grid-cols-2">
            <Stat icon={<Users className="h-4 w-4" />} label="Daily Traffic" value={location.traffic.daily} />
            <Stat icon={<TrendingUp className="h-4 w-4" />} label="Weekly Reach" value={location.traffic.weeklyReach} />
            <Stat icon={<Clock className="h-4 w-4" />} label="Peak Hours" value={location.traffic.peak} />
            <Stat icon={<Tag className="h-4 w-4" />} label="Format" value={location.size} />
          </div>

          {monthly && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--neon-blue)]/15 bg-[var(--neon-blue)]/5 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Monthly Rate</p>
                <p className="mt-1 text-3xl font-black text-[var(--neon-blue)]">{monthly}</p>
              </div>
              <a
                href="/contact"
                className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
              >
                Reserve This Site →
              </a>
            </div>
          )}

          {/* Embedded campaign visualizer */}
          <div className="mt-10">
            <CampaignVisualizer location={location} />
          </div>

          {location.features?.length > 0 && (
            <div className="mt-10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">What you get</h3>
              <ul className="mt-3 grid gap-2">
                {location.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-500" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {location.projects && location.projects.length > 0 && (
            <div className="mt-10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Past projects at this location</h3>
              <div className="mt-3 grid gap-3">
                {location.projects.map((p, i) => <ProjectCard key={i} project={p} />)}
              </div>
            </div>
          )}

          {location.reviews && location.reviews.length > 0 && (
            <div className="mt-10">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Client reviews</h3>
                {avgRating != null && (
                  <p className="text-xs text-slate-500">
                    Average <strong className="text-slate-900">{avgRating.toFixed(1)}</strong> across {location.reviews.length}
                  </p>
                )}
              </div>
              <div className="mt-3 grid gap-3">
                {location.reviews.map((r, i) => <ReviewCard key={i} review={r} />)}
              </div>
            </div>
          )}

          {location.bookedDates?.length > 0 && (
            <div className="mt-10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Booked dates</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {location.bookedDates.map((d) => (
                  <span
                    key={d}
                    className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}
          </div>
        </div>
      </motion.article>
    </motion.div>,
    document.body
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}
