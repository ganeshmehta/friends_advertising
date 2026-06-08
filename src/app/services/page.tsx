"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import "@/styles/services-lab.css";

type ServiceMock = "flex" | "vinyl" | "led" | "banner" | "transit" | "indoor";

type ServiceCard = {
  id: string;
  title: string;
  short: string;
  format: string;
  materials: string;
  turnaround: string;
  reach: string;
  cities: string[];
  accent: string;
  mock: ServiceMock;
};

const services: ServiceCard[] = [
  {
    id: "flex",
    title: "Flex Board Printing & Installation",
    short: "High-impact roadside hoardings",
    format: "20×10 ft to 40×20 ft hoardings · highway-grade frames",
    materials: "920 gsm star-flex · UV-cured ink · galvanised-steel frame",
    turnaround: "72-hour print-to-pack · 4-day install with own crews",
    reach: "~1.2L daily impressions per premium site",
    cities: ["Navi Mumbai", "Mumbai BKC", "Pune NH4", "Aurangabad"],
    accent: "var(--neon-blue)",
    mock: "flex",
  },
  {
    id: "vinyl",
    title: "Vinyl & Digital Printing",
    short: "Premium short-run print",
    format: "A0 posters · backlit panels · window vinyls · wall wraps",
    materials: "Cast vinyl · solvent + UV ink · 5-yr outdoor lamination",
    turnaround: "24-hour print · same-day pickup or city dispatch",
    reach: "720 dpi, ΔE < 3 colour match — gallery-grade",
    cities: ["Navi Mumbai studio", "Thane", "Pune", "Nashik"],
    accent: "#06b6d4",
    mock: "vinyl",
  },
  {
    id: "led",
    title: "LED Sign Boards & Glow Signs",
    short: "24×7 illuminated storefronts",
    format: "Channel letters · backlit ACP · pixel LED screens",
    materials: "High-CRI LED modules · 5-yr driver warranty · ACP + acrylic",
    turnaround: "5-day fabrication · timed midnight install",
    reach: "24×7 visibility · 92% recall after dusk",
    cities: ["Mumbai retail strips", "Pune malls", "Nashik bazaars"],
    accent: "#22d3ee",
    mock: "led",
  },
  {
    id: "banner",
    title: "Event & Promotional Banners",
    short: "Pop-up brand surfaces",
    format: "Stage backdrops · vertical drops · pole banners · standees",
    materials: "Frontlit flex + eyelets · roll-up cassettes · fabric drops",
    turnaround: "36-hour rush · on-site rigging crew included",
    reach: "Event-grade · 100% sponsor-ready on go-live morning",
    cities: ["Mumbai BEC", "Pune ICC", "Hotel chains across MH"],
    accent: "var(--neon-purple)",
    mock: "banner",
  },
  {
    id: "transit",
    title: "Vehicle & Transit Advertising",
    short: "Brand on the move",
    format: "Bus wraps · auto-rickshaw hoods · cab door panels",
    materials: "Cast wrap vinyl · air-egress film · 3-yr fade warranty",
    turnaround: "8-hour wrap per vehicle · fleet-scale next day",
    reach: "~80,000 impressions per bus per day across a corridor",
    cities: ["Mumbai BEST", "Pune PMPML", "NMMT Navi Mumbai"],
    accent: "#0ea5e9",
    mock: "transit",
  },
  {
    id: "indoor",
    title: "Corporate Branding & Indoor Displays",
    short: "In-office brand identity",
    format: "Reception walls · backlit logos · standees · wayfinding",
    materials: "Acrylic + brushed metal · architectural-grade vinyl · LED edge",
    turnaround: "4-day design-to-install · after-hours fitment",
    reach: "Every visitor, every meeting — daily brand reinforcement",
    cities: ["IT parks · BFSI HQs · hospitality lobbies"],
    accent: "var(--accent)",
    mock: "indoor",
  },
];

export default function ServicesPage() {
  const [active, setActive] = useState(0);
  const tabsRef = useRef<HTMLOListElement>(null);
  const activeSvc = services[active];

  const setActiveClamped = useCallback((i: number) => {
    setActive(Math.max(0, Math.min(services.length - 1, i)));
  }, []);

  const onKeyNav = (event: React.KeyboardEvent<HTMLOListElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      setActiveClamped(active + 1);
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      setActiveClamped(active - 1);
    }
  };

  useEffect(() => {
    const list = tabsRef.current;
    if (!list) return;
    const buttons = list.querySelectorAll<HTMLButtonElement>("button[data-tab]");
    const target = buttons[active];
    if (
      target &&
      document.activeElement?.tagName === "BUTTON" &&
      list.contains(document.activeElement)
    ) {
      target.focus({ preventScroll: true });
    }
  }, [active]);

  const sectionStyle = { "--svc-accent": activeSvc.accent } as CSSProperties;

  return (
    <main className="services-shell flex flex-col w-full relative">
      <section className="svc-section" style={sectionStyle}>
        <div className="svc-grid-bg" aria-hidden="true" />
        <div className="svc-spotlight" aria-hidden="true" />

          <header className="svc-header">
            <p className="eyebrow">Our Services · OOH Format Catalog</p>
            <h1>Complete outdoor advertising services under one execution team</h1>
            <p className="svc-lead">
              From flex boards and vinyl prints to LED signage, vehicle branding, event banners and
              corporate indoor displays, Friends Advertising delivers a complete OOH offering with
              end-to-end accountability.
            </p>
            <ul className="svc-hero-stats grid grid-cols-2 md:grid-cols-4 gap-2" role="list">
              <li>
                <strong>6</strong>
                <span>Formats</span>
              </li>
              <li>
                <strong>240+</strong>
                <span>Active sites</span>
              </li>
              <li>
                <strong>8</strong>
                <span>Cities</span>
              </li>
              <li>
                <strong>12 yrs</strong>
                <span>Operating</span>
              </li>
            </ul>
          </header>

          <div className="svc-lab flex flex-col lg:grid lg:grid-cols-[0.85fr_1.5fr] gap-5 lg:gap-[1.1rem]">
            <ol
              ref={tabsRef}
              className="svc-tabs"
              role="tablist"
              aria-label="Service formats"
              onKeyDown={onKeyNav}
            >
              {services.map((s, i) => {
                const tabStyle = { "--svc-accent": s.accent } as CSSProperties;
                const isActive = i === active;
                return (
                  <li
                    key={s.id}
                    className={`svc-tab${isActive ? " is-active" : ""}`}
                    style={tabStyle}
                  >
                    <button
                      type="button"
                      data-tab={s.id}
                      role="tab"
                      aria-selected={isActive}
                      aria-controls="svc-stage"
                      onMouseEnter={() => setActive(i)}
                      onFocus={() => setActive(i)}
                      onClick={() => setActive(i)}
                      tabIndex={isActive ? 0 : -1}
                    >
                      <span className="svc-tab-rail" aria-hidden="true">
                        <span className="svc-tab-node" />
                      </span>
                      <span className="svc-tab-index" aria-hidden="true">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="svc-tab-body">
                        <span className="svc-tab-title">{s.title}</span>
                        <span className="svc-tab-tag">{s.short}</span>
                      </span>
                      <span className="svc-tab-chev" aria-hidden="true">
                        →
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div id="svc-stage" className="svc-stage" role="tabpanel" aria-live="polite">
              <div className="svc-stage-cityticker" aria-hidden="true">
                <span className="svc-stage-livedot" />
                <span>Live now in</span>
                <strong>{activeSvc.cities.join(" · ")}</strong>
              </div>

              <div className="svc-mock" data-mock={activeSvc.mock} key={activeSvc.id}>
                <FormatMock kind={activeSvc.mock} accent={activeSvc.accent} />
              </div>

              <dl className="svc-stage-meta grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-[0.55rem]">
                <div>
                  <dt>Typical format</dt>
                  <dd>{activeSvc.format}</dd>
                </div>
                <div>
                  <dt>Materials</dt>
                  <dd>{activeSvc.materials}</dd>
                </div>
                <div>
                  <dt>Turnaround</dt>
                  <dd>{activeSvc.turnaround}</dd>
                </div>
              </dl>

              <div className="svc-stage-foot">
                <ol className="svc-lifecycle" aria-label="Service lifecycle">
                  {["Design", "Print", "Install", "Live"].map((step, i) => (
                    <li
                      key={step}
                      className={`svc-life-step${i === 3 ? " is-current" : ""}`}
                    >
                      <span className="svc-life-dot" aria-hidden="true" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="svc-stage-reach">
                  <span aria-hidden="true">◉</span> {activeSvc.reach}
                </p>
              </div>
            </div>
          </div>

          <aside className="svc-footer-cta flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="eyebrow">Need a format that isn&apos;t here?</p>
              <h2>If it can be printed, lit, wrapped or driven — we ship it.</h2>
            </div>
            <Link href="/contact" className="svc-cta-btn">
              <span>Brief us</span>
              <span aria-hidden="true">→</span>
            </Link>
          </aside>
        </section>
    </main>
  );
}

/* ---------- Per-format CSS mock-ups ---------- */

type MockProps = { kind: ServiceMock; accent: string };

function FormatMock({ kind, accent }: MockProps) {
  const accentStyle = { "--svc-accent": accent } as CSSProperties;

  if (kind === "flex") {
    return (
      <div className="svc-flex" style={accentStyle}>
        <div className="svc-flex-wall" aria-hidden="true" />
        <div className="svc-flex-frame">
          <div className="svc-flex-board">
            <p className="svc-flex-eyebrow">FRIENDS OUTDOOR · MUMBAI BKC</p>
            <p className="svc-flex-title">
              YOUR
              <br />
              BRAND
              <br />
              HERE
            </p>
            <p className="svc-flex-foot">30 × 20 ft · Premium hoarding</p>
            <div className="svc-flex-tear" aria-hidden="true" />
          </div>
        </div>
        <div className="svc-flex-shadow" aria-hidden="true" />
      </div>
    );
  }

  if (kind === "vinyl") {
    return (
      <div className="svc-vinyl" style={accentStyle}>
        {["var(--neon-blue)", "#22d3ee", "var(--neon-purple)"].map((c, i) => (
          <div
            key={c}
            className="svc-vinyl-sheet"
            style={{ "--vc": c, "--vi": i } as CSSProperties}
          >
            <span className="svc-vinyl-tag">720 DPI · ΔE&nbsp;&lt;&nbsp;3</span>
            <span className="svc-vinyl-stripe" />
            <span className="svc-vinyl-label">PRINT {String(i + 1).padStart(2, "0")}</span>
          </div>
        ))}
        <div className="svc-vinyl-ink" aria-hidden="true" />
      </div>
    );
  }

  if (kind === "led") {
    return (
      <div className="svc-led" style={accentStyle}>
        <div className="svc-led-sky" aria-hidden="true" />
        <div className="svc-led-grid" aria-hidden="true" />
        <div className="svc-led-board">
          <p className="svc-led-text">OPEN 24×7</p>
          <p className="svc-led-sub">POWERED BY FRIENDS</p>
        </div>
        <div className="svc-led-bulbs" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} style={{ "--li": i } as CSSProperties} />
          ))}
        </div>
        <div className="svc-led-scan" aria-hidden="true" />
      </div>
    );
  }

  if (kind === "banner") {
    return (
      <div className="svc-banner" style={accentStyle}>
        <div className="svc-banner-rig" aria-hidden="true">
          <span />
          <span />
        </div>
        <div className="svc-banner-cloth">
          <p className="svc-banner-eyebrow">EVENT · 2026</p>
          <p className="svc-banner-title">
            ANNUAL
            <br />
            SUMMIT
          </p>
          <p className="svc-banner-foot">Hall 04 · 18 Apr · Mumbai</p>
        </div>
        <div className="svc-banner-confetti" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, i) => (
            <span key={i} style={{ "--ci": i } as CSSProperties} />
          ))}
        </div>
      </div>
    );
  }

  if (kind === "transit") {
    return (
      <div className="svc-transit" style={accentStyle}>
        <div className="svc-transit-sky" aria-hidden="true" />
        <div className="svc-transit-bus">
          <span className="svc-transit-windows" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="svc-transit-wrap">
            <em>YOUR BRAND</em>
            <small>across the city</small>
          </span>
          <span className="svc-transit-wheel svc-transit-wheel--l" aria-hidden="true" />
          <span className="svc-transit-wheel svc-transit-wheel--r" aria-hidden="true" />
        </div>
        <div className="svc-transit-road" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} style={{ "--di": i } as CSSProperties} />
          ))}
        </div>
        <div className="svc-transit-speed" aria-hidden="true" />
      </div>
    );
  }

  // indoor
  return (
    <div className="svc-indoor" style={accentStyle}>
      <div className="svc-indoor-floor" aria-hidden="true" />
      <div className="svc-indoor-wall">
        <p className="svc-indoor-logo">FRIENDS</p>
        <p className="svc-indoor-sub">RECEPTION · LVL 04</p>
        <div className="svc-indoor-glow" aria-hidden="true" />
      </div>
      <div className="svc-indoor-standee">
        <div className="svc-indoor-standee-screen">
          <span>EST. 2014</span>
          <strong>
            BRAND
            <br />
            DESK
          </strong>
        </div>
        <div className="svc-indoor-standee-base" aria-hidden="true" />
      </div>
      <div className="svc-indoor-spot" aria-hidden="true" />
    </div>
  );
}
