"use client";

import { useEffect, useRef, useState } from "react";
import type { Location } from "./types";

type Props = {
  locations: Location[];
  selectedId: number | null;
  onSelect: (loc: Location) => void;
  highlightedIds?: Set<number>;
  competitorDenseSites?: Set<number>;
};

declare global {
  interface Window {
    L?: any;
  }
}

const LEAFLET_CSS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
const LEAFLET_JS = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
const CLUSTER_CSS = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css";
const CLUSTER_DEFAULT_CSS = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css";
const CLUSTER_JS = "https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js";

function ensureLink(id: string, href: string) {
  if (document.querySelector(`#${id}`)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function ensureScript(id: string, src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`#${id}`) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === "true") return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${src}`)));
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.onload = () => { script.dataset.loaded = "true"; resolve(); };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

async function loadLeaflet(): Promise<any> {
  if (typeof window === "undefined") return null;
  ensureLink("leaflet-css", LEAFLET_CSS);
  ensureLink("leaflet-cluster-css", CLUSTER_CSS);
  ensureLink("leaflet-cluster-default-css", CLUSTER_DEFAULT_CSS);
  await ensureScript("leaflet-js", LEAFLET_JS);
  try {
    await ensureScript("leaflet-cluster-js", CLUSTER_JS);
  } catch {
    // Clustering is optional — fall back to a plain layerGroup if it fails.
  }
  return window.L;
}

function colorFor(loc: Location, opts: { highlighted: boolean; competitor: boolean }): string {
  if (opts.highlighted) return "#ff6d3d";
  if (opts.competitor) return "#9c3bd0";
  return loc.status === "available" ? "#10b981" : "#f59e0b";
}

function popupHtml(loc: Location, competitor: boolean) {
  const status = loc.status === "available" ? "Available" : "Booked";
  const competitorTag = competitor
    ? `<div style="display:inline-block;margin-top:4px;padding:2px 6px;border-radius:9999px;background:#f3e8ff;color:#6b21a8;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Competitor zone</div>`
    : "";
  return `
    <div style="font-family:system-ui,sans-serif;min-width:200px">
      <div style="font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.08em">${loc.city}</div>
      <div style="font-size:14px;font-weight:600;color:#0f172a;margin-top:2px">${loc.title}</div>
      <div style="font-size:12px;color:#475569;margin-top:6px">${loc.size} · ${status}</div>
      <div style="font-size:11px;color:#64748b;margin-top:4px">${loc.traffic.daily} daily impressions</div>
      ${competitorTag}
    </div>`;
}

export default function LocationMap({
  locations,
  selectedId,
  onSelect,
  highlightedIds,
  competitorDenseSites,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const clusterRef = useRef<any>(null);
  const markersRef = useRef<Map<number, any>>(new Map());
  const onSelectRef = useRef(onSelect);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    let cancelled = false;
    void loadLeaflet().then((L) => {
      if (cancelled || !containerRef.current || mapRef.current || !L) return;

      const map = L.map(containerRef.current, {
        center: [19.076, 72.8777],
        zoom: 10,
        zoomControl: false,
        scrollWheelZoom: true,
        preferCanvas: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 18,
      }).addTo(map);
      L.control.zoom({ position: "bottomright" }).addTo(map);

      const cluster = typeof L.markerClusterGroup === "function"
        ? L.markerClusterGroup({
            showCoverageOnHover: false,
            spiderfyOnMaxZoom: true,
            maxClusterRadius: 55,
          })
        : L.layerGroup();
      cluster.addTo(map);
      clusterRef.current = cluster;
      mapRef.current = map;
      setMapReady(true);
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        clusterRef.current = null;
        markersRef.current.clear();
      }
      setMapReady(false);
    };
  }, []);

  // Sync markers.
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    const cluster = clusterRef.current;
    if (!map || !cluster || !window.L) return;
    const L = window.L;

    cluster.clearLayers();
    markersRef.current.clear();

    if (locations.length === 0) return;

    const bounds = L.latLngBounds([] as [number, number][]);
    locations.forEach((loc) => {
      const highlighted = !!highlightedIds?.has(loc.id);
      const competitor = !!competitorDenseSites?.has(loc.id);
      const fillColor = colorFor(loc, { highlighted, competitor });

      const marker = L.circleMarker(loc.coordinates, {
        radius: highlighted ? 10 : 8,
        weight: 2,
        color: "#ffffff",
        fillColor,
        fillOpacity: 0.92,
      });
      marker.bindPopup(popupHtml(loc, competitor));
      marker.on("click", () => onSelectRef.current?.(loc));
      cluster.addLayer(marker);
      markersRef.current.set(loc.id, marker);
      bounds.extend(loc.coordinates);
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [mapReady, locations, highlightedIds, competitorDenseSites]);

  // Fly to selected.
  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    if (!map || selectedId == null) return;
    const loc = locations.find((l) => l.id === selectedId);
    if (!loc) return;
    map.flyTo(loc.coordinates, 14, { duration: 1.2 });
    const marker = markersRef.current.get(selectedId);
    if (marker && typeof marker.openPopup === "function") {
      setTimeout(() => marker.openPopup(), 350);
    }
  }, [mapReady, selectedId, locations]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      aria-label="Billboard locations map"
    />
  );
}
