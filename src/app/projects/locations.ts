import rawLocations from "./data/locations.json";
import type {
  Location,
  LocationProject,
  LocationReview,
  LightingMood,
  SunDirection,
  BillboardQuad,
} from "./types";

// Real on-site photos with hand-calibrated billboard quads.
// Each quad is [TopLeft, TopRight, BottomRight, BottomLeft] in normalised image coords (0-1).
type RealPhoto = {
  image: string;
  billboardQuad: BillboardQuad;
  lightingMood: LightingMood;
  sunDirection: SunDirection;
  photoCredit: string;
};

const REAL_PHOTOS: Record<number, RealPhoto> = {
  // Karjat — front side, "Beverly Hills" billboard photo (800x800 source)
  // Quad pixel-verified against source: TL(350,108) TR(506,110) BR(506,266) BL(350,266)
  74: {
    image: "/media/karjat-hatnoli.png",
    billboardQuad: [
      [0.4375, 0.135],
      [0.6325, 0.1375],
      [0.6325, 0.3325],
      [0.4375, 0.3325],
    ],
    lightingMood: "day",
    sunDirection: "right",
    photoCredit: "On-site reference photograph — Friends Advertising field team",
  },
  // Karjat — back side, same corridor photo (reusable)
  75: {
    image: "/media/karjat-hatnoli.png",
    billboardQuad: [
      [0.4375, 0.135],
      [0.6325, 0.1375],
      [0.6325, 0.3325],
      [0.4375, 0.3325],
    ],
    lightingMood: "day",
    sunDirection: "right",
    photoCredit: "On-site reference photograph — Friends Advertising field team",
  },
  // Thane — Khidkaleshwar Mandir (Vashi to Kalyan), 800x800 source.
  // Quad pixel-verified against source: TL(297,148) TR(492,148) BR(492,289) BL(297,289)
  17: {
    image: "/media/khidkaleshwar-mandir.jpg",
    billboardQuad: [
      [0.371, 0.185],
      [0.615, 0.185],
      [0.615, 0.361],
      [0.371, 0.361],
    ],
    lightingMood: "day",
    sunDirection: "left",
    photoCredit: "On-site reference photograph — Friends Advertising field team",
  },
};

const SAMPLE_PROJECT_IMAGES = [
  "https://images.unsplash.com/photo-1554072675-66db59dba46f?w=900&q=80",
  "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=900&q=80",
  "https://images.unsplash.com/photo-1542401886-65d6c61db217?w=900&q=80",
];

const SAMPLE_BRANDS = [
  "Coca-Cola India",
  "Maruti Suzuki",
  "Tata Neu",
  "Asian Paints",
  "Nykaa",
  "Bajaj Allianz",
  "Vivo Mobile",
  "Zomato Gold",
  "HDFC Bank",
  "ITC Aashirvaad",
];

const SAMPLE_REVIEWERS = [
  { author: "Aditi Khanna", role: "Brand Manager" },
  { author: "Vikram Joshi", role: "Regional Head" },
  { author: "Priya Iyer", role: "Performance Lead" },
  { author: "Rohit Mehta", role: "Marketing Director" },
  { author: "Sanjay Patil", role: "CMO" },
  { author: "Sneha Desai", role: "Founder" },
  { author: "Akash Verma", role: "Growth Lead" },
];

const SAMPLE_QUOTES = [
  "Drove a sharp lift in dispatch volume the week we went live. Best ROI placement in this corridor.",
  "Friends handled mounting, permits and creative swap end-to-end. Zero headache from our side.",
  "Visibility is everything you'd expect from a premium hoarding — and the night lighting is excellent.",
  "Slots fill fast for a reason. The corridor traffic is exactly the audience we needed.",
  "Coordinated rollout across three sites felt seamless. Reporting and photos were timely.",
];

const SAMPLE_OBJECTIVES = [
  "Festive season awareness blitz",
  "New product launch teaser run",
  "App download conversion push",
  "Brand repositioning takeover",
  "Local store-opening footfall driver",
];

const SAMPLE_RESULTS = [
  "+38% recall lift within 4 weeks",
  "Anchored a city-wide launch with 12M+ impressions",
  "Drove the highest weekly install spike of the campaign",
  "Filled the showroom for two consecutive weekends",
  "Outperformed digital CPM on the same audience segment",
];

const LIGHTING_OPTIONS: LightingMood[] = ["dawn", "day", "dusk", "night"];
const SUN_OPTIONS: SunDirection[] = ["left", "right", "top"];

// Deterministic hash → index so the same pin always gets the same synthetic data.
function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number, offset = 0): T {
  return arr[(seed + offset) % arr.length];
}

function buildProjects(loc: { id: number; city: string; size: string; title: string }): LocationProject[] {
  const seed = hash(`p-${loc.id}-${loc.city}`);
  const count = (seed % 2) + 1; // 1 or 2 projects
  return Array.from({ length: count }, (_, i) => ({
    title: `${pick(SAMPLE_BRANDS, seed, i)} · ${pick(SAMPLE_OBJECTIVES, seed, i + 3)}`,
    image: pick(SAMPLE_PROJECT_IMAGES, seed, i),
    objective: pick(SAMPLE_OBJECTIVES, seed, i + 1),
    result: pick(SAMPLE_RESULTS, seed, i + 2),
    brand: pick(SAMPLE_BRANDS, seed, i),
  }));
}

function buildReviews(loc: { id: number; city: string }): LocationReview[] {
  const seed = hash(`r-${loc.id}-${loc.city}`);
  const count = (seed % 3) + 1; // 1 to 3 reviews
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return Array.from({ length: count }, (_, i) => {
    const reviewer = pick(SAMPLE_REVIEWERS, seed, i);
    const rating = (((seed >> i) % 2) + 4) as 4 | 5;
    return {
      author: reviewer.author,
      role: reviewer.role,
      rating,
      date: `${pick(months, seed, i)} 202${5 + ((seed + i) % 2)}`,
      quote: pick(SAMPLE_QUOTES, seed, i),
    };
  });
}

function deriveAudience(size: string, city: string): string {
  const sizeMatch = size.match(/(\d+)\s*[xX]\s*(\d+)/);
  const area = sizeMatch ? Number(sizeMatch[1]) * Number(sizeMatch[2]) : 600;
  if (area >= 1500) return `Massive-format reach · ${city} commuter & visitor stream`;
  if (area >= 1000) return `High-impact arterial visibility · ${city} corridor traffic`;
  if (area >= 500) return `Premium roadside placement · ${city} daily commuters`;
  return `Targeted urban placement · ${city} foot & vehicle traffic`;
}

function deriveLightingMood(seed: number): LightingMood {
  return LIGHTING_OPTIONS[seed % LIGHTING_OPTIONS.length];
}

function deriveSunDirection(seed: number): SunDirection {
  return SUN_OPTIONS[seed % SUN_OPTIONS.length];
}

const COMPETITOR_CITY_KEYWORDS = ["mumbai", "powai", "andheri", "bandra", "vashi", "thane"];

function isCompetitorZone(loc: { city: string; location: string }): boolean {
  const haystack = `${loc.city} ${loc.location}`.toLowerCase();
  return COMPETITOR_CITY_KEYWORDS.some((k) => haystack.includes(k));
}

const enriched: Location[] = (rawLocations as unknown as Location[]).map((loc) => {
  const seed = hash(`${loc.id}-${loc.city}`);
  const real = REAL_PHOTOS[loc.id];
  return {
    ...loc,
    region: loc.region ?? loc.city,
    audience: loc.audience ?? deriveAudience(loc.size, loc.city),
    projects: loc.projects ?? buildProjects(loc),
    reviews: loc.reviews ?? buildReviews(loc),
    lightingMood: real?.lightingMood ?? loc.lightingMood ?? deriveLightingMood(seed),
    sunDirection: real?.sunDirection ?? loc.sunDirection ?? deriveSunDirection(seed),
    billboardQuad: real?.billboardQuad ?? loc.billboardQuad,
    photoCredit: real?.photoCredit ?? loc.photoCredit,
    images: real ? [real.image, ...loc.images] : loc.images,
  };
});

// IDs of locations with a real on-site photograph (Studio mode unlocked).
export const studioReadyIds = new Set<number>(Object.keys(REAL_PHOTOS).map(Number));

// Surface studio-ready sites first, then everything else in original order.
const sorted = [
  ...enriched.filter((l) => studioReadyIds.has(l.id)),
  ...enriched.filter((l) => !studioReadyIds.has(l.id)),
];

export const locations: Location[] = sorted;

export const competitorDenseSites = new Set(
  enriched.filter(isCompetitorZone).map((l) => l.id)
);
