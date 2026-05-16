"use client";

import { useEffect, useRef, useState } from "react";
import locations from "./data/locations.json";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  MapPin,
  Navigation,
  X
} from "lucide-react";

const LocationModal = ({ location, onClose }: any) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-6 backdrop-blur-lg"
    >
      <motion.div
        initial={{ y: 30 }}
        animate={{ y: 0 }}
        exit={{ y: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl overflow-hidden rounded-[32px] bg-white shadow-[0_40px_120px_rgba(0,0,0,0.25)]"
      >
        <div className="relative h-[320px]">
          <img
            src={location.images[0]}
            alt={location.title}
            className="h-full w-full object-cover"
          />

          <button
            onClick={onClose}
            className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-white"
          >
            <X className="h-5 w-5 text-slate-800" />
          </button>
        </div>

        <div className="p-8">
          <div className="flex gap-3">
            <span className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
              {location.city}
            </span>

            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${location.status === "available"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
                }`}
            >
              {location.status}
            </span>
          </div>

          <h2 className="mt-5 text-4xl font-black text-slate-900">
            {location.title}
          </h2>

          <p className="mt-3 flex items-center gap-2 text-slate-500">
            <Navigation className="h-4 w-4" />
            {location.location}
          </p>

          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            {location.description}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              {
                label: "Daily Traffic",
                value: location.traffic.daily
              },
              {
                label: "Weekly Reach",
                value: location.traffic.weeklyReach
              },
              {
                label: "Peak Hours",
                value: location.traffic.peak
              },
              {
                label: "Format",
                value: location.size
              }
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl bg-slate-50 p-5"
              >
                <p className="text-sm text-slate-500">
                  {item.label}
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const LeafletMap = ({
  locations,
  onSelect,
  selectedLocation
}: any) => {
  const mapRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (mapInstanceRef.current || !mapRef.current) return;

    if (!document.querySelector("#leaflet-css")) {
      const link = document.createElement("link");

      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";

      document.head.appendChild(link);
    }

    const loadLeaflet = () => {
      if ((window as any).L) {
        initMap();
        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";

      script.onload = initMap;

      document.head.appendChild(script);
    };

    const initMap = () => {
      const L = (window as any).L;

      const map = L.map(mapRef.current, {
        center: [19.076, 72.8777],
        zoom: 10,
        zoomControl: false
      });

      mapInstanceRef.current = map;

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "&copy; OpenStreetMap"
        }
      ).addTo(map);

      L.control.zoom({
        position: "bottomright"
      }).addTo(map);

      const bounds = L.latLngBounds([]);

      locations.forEach((loc: any) => {
        bounds.extend(loc.coordinates);

        const color =
          loc.status === "available"
            ? "#10b981"
            : "#f59e0b";

        const icon = L.divIcon({
          html: `
            <div style="
              width:20px;
              height:20px;
              background:${color};
              border-radius:999px;
              border:4px solid white;
              box-shadow:0 10px 25px rgba(0,0,0,0.25);
            "></div>
          `,
          className: "",
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const marker = L.marker(loc.coordinates, {
          icon
        }).addTo(map);

        marker.on("click", () => onSelect(loc));
      });

      map.fitBounds(bounds, {
        padding: [60, 60]
      });
    };

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedLocation || !mapInstanceRef.current) return;

    mapInstanceRef.current.flyTo(
      selectedLocation.coordinates,
      14,
      {
        duration: 1.5
      }
    );
  }, [selectedLocation]);

  return <div ref={mapRef} className="h-full w-full" />;
};

export default function ProjectsPage() {
  const [selected, setSelected] = useState<any>(null);
  const [query, setQuery] = useState("");

  const filteredLocations = locations.filter((location) =>
    location.title
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#f3f6fb]">
      <style jsx global>{`
        .leaflet-pane,
        .leaflet-top,
        .leaflet-bottom,
        .leaflet-control,
        .leaflet-container {
          z-index: 1 !important;
        }
      `}</style>

      {/* HERO */}
      <section className="px-6 pb-14 pt-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-5 py-2 text-sm font-semibold text-indigo-700">
          <MapPin className="h-4 w-4" />
          Premium OOH Billboard Network
        </div>

        <h1 className="mx-auto max-w-5xl text-5xl font-black tracking-tight text-slate-900 md:text-7xl">
          Explore Billboard
          <span className="text-indigo-600">
            {" "}Locations
          </span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-500">
          Search and discover high-performing outdoor
          advertising locations across Maharashtra.
        </p>
      </section>

      {/* SEARCH */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="relative z-20 mx-auto mb-6 max-w-xl">
          <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />

          <input
            type="text"
            placeholder="Search locations..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-slate-900 shadow-sm outline-none transition-all focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
          />

          {query && (
            <div className="absolute mt-2 max-h-[320px] w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl">
              {filteredLocations.map((location: any) => (
                <button
                  key={location.id}
                  onClick={() => {
                    setSelected(location);
                    setQuery("");
                  }}
                  className="flex w-full items-center justify-between border-b border-slate-100 px-5 py-4 text-left transition hover:bg-slate-50"
                >
                  <div>
                    <p className="font-semibold text-slate-900">
                      {location.title}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {location.city}
                    </p>
                  </div>

                  <MapPin className="h-4 w-4 text-indigo-500" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MAP */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h3 className="font-bold text-slate-900">
                Interactive Billboard Map
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Click any pin to explore details
              </p>
            </div>

            <div className="text-sm text-slate-500">
              {locations.length} Locations
            </div>
          </div>

          <div className="h-[720px]">
            <LeafletMap
              locations={locations}
              onSelect={setSelected}
              selectedLocation={selected}
            />
          </div>
        </div>
      </section>

      {/* MODAL */}
      <AnimatePresence>
        {selected && (
          <LocationModal
            location={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}