export type LocationStatus = "available" | "booked";

export type BillboardQuad = [
  [number, number],
  [number, number],
  [number, number],
  [number, number],
];

export type LightingMood = "dawn" | "day" | "dusk" | "night";
export type SunDirection = "left" | "right" | "top";

export type LocationProject = {
  title: string;
  image: string;
  objective: string;
  result: string;
  brand: string;
};

export type LocationReview = {
  author: string;
  role?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  date: string;
  quote: string;
};

export type Location = {
  id: number;
  city: string;
  title: string;
  location: string;
  size: string;
  coordinates: [number, number];
  status: LocationStatus;
  pricing: Record<string, string>;
  traffic: {
    daily: string;
    peak: string;
    weeklyReach: string;
  };
  description: string;
  features: string[];
  images: string[];
  bookedDates: string[];
  region?: string;
  audience?: string;
  projects?: LocationProject[];
  reviews?: LocationReview[];
  billboardQuad?: BillboardQuad;
  lightingMood?: LightingMood;
  sunDirection?: SunDirection;
  photoCredit?: string;
};
