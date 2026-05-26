"use client";

import dynamic from "next/dynamic";

const FloatingStars = dynamic(
  () => import("./FloatingStars"),
  { ssr: false }
);

export default function FloatingStarsClient() {
  return <FloatingStars />;
}