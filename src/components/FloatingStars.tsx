"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

// Premium vibrant color palette - highly saturated for white backgrounds
const palette = [
  [0, 150, 255],     // Bright Cyan Blue
  [100, 50, 255],    // Deep Purple
  [255, 50, 150],    // Hot Pink
  [0, 255, 200],     // Turquoise
  [255, 100, 0],     // Vibrant Orange
  [200, 50, 255],    // Magenta
  [50, 200, 255],    // Sky Cyan
  [255, 0, 150],     // Electric Pink
  [100, 255, 100],   // Neon Green
  [255, 150, 0],     // Golden Orange
  [150, 100, 255],   // Lavender Purple
  [0, 200, 255],     // Bright Cyan
  [255, 50, 50],     // Bright Red
  [150, 0, 255],     // Deep Violet
  [50, 255, 150],    // Mint Green
  [255, 200, 0],     // Golden Yellow
];

const CLUSTER_COUNT = 8;
const PER_CLUSTER = 28;
const MARGIN = 60;

// Define different movement directions
const directions = [
  { startX: -10, startY: 0, endX: 120, endY: 100, name: "left-top to right-bottom" },    // ↘
  { startX: 110, startY: 100, endX: 110, endY: -10, name: "right-bottom to right-top" }, // ↑
  { startX: 110, startY: 0, endX: -10, endY: 100, name: "right-top to left-bottom" },    // ↙
  { startX: -10, startY: 50, endX: 120, endY: 50, name: "left to right" },               // →
  { startX: 50, startY: -10, endX: 50, endY: 110, name: "top to bottom" },               // ↓
  { startX: 120, startY: 50, endX: -10, endY: 50, name: "right to left" },               // ←
  { startX: 0, startY: 100, endX: 100, endY: 0, name: "bottom-left to top-right" },      // ↗
  { startX: 100, startY: 100, endX: 0, endY: 0, name: "bottom-right to top-left" },      // ↖
];

function rand(a: number, b: number) {
  return Math.random() * (b - a) + a;
}

export default function FloatingOvals() {
  const { clusters, particles } = useMemo(() => {
    const clusters = Array.from({ length: CLUSTER_COUNT }).map((_, idx) => {
      const direction = directions[idx % directions.length];
      return {
        startX: direction.startX,
        startY: direction.startY,
        endX: direction.endX,
        endY: direction.endY,
        dur: rand(25, 35),
        delay: rand(0, 5),
      };
    });

    const particles = clusters.flatMap((_, c) =>
      Array.from({ length: PER_CLUSTER }).map((__, i) => {
        const [r, g, b] = palette[(c * 3 + i) % palette.length];
        const spread = rand(0, 40);
        const spreadAngle = rand(0, Math.PI * 2);
        // Free movement phase - random position after group journey
        const freeX = rand(-20, 120);
        const freeY = rand(-20, 120);
        const freeDir = rand(0, Math.PI * 2);
        const freeDist = rand(30, 80);
        const freeEndX = freeX + Math.cos(freeDir) * freeDist;
        const freeEndY = freeY + Math.sin(freeDir) * freeDist;
        
        return {
          id: `${c}-${i}`,
          clusterIdx: c,
          offX: Math.cos(spreadAngle) * spread,
          offY: Math.sin(spreadAngle) * spread * 0.5,
          rx: rand(6, 18),
          ry: rand(3, 8),
          angle: rand(0, 180),
          color: `rgba(${r},${g},${b},VAL)`,
          alpha: rand(0.4, 0.6),
          rotateDelta: rand(-20, 20),
          // Free movement properties
          freeX,
          freeY,
          freeEndX,
          freeEndY,
          freeDur: rand(8, 15),
        };
      })
    );

    return { clusters, particles };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]">
      {particles.map((p) => {
        const cl = clusters[p.clusterIdx];
        return (
          <motion.div
            key={p.id}
            className="absolute"
            style={{
              width: p.rx * 2,
              height: p.ry * 2,
              borderRadius: "50%",
              background: p.color.replace("VAL", p.alpha.toFixed(2)),
              rotate: p.angle,
            }}
            animate={{
              left: [
                `calc(${cl.startX}% + ${p.offX}px)`,  // Phase 1: Start (coordinated)
                `calc(${cl.endX}% + ${p.offX}px)`,    // Phase 1: End (coordinated)
                `calc(${p.freeX}% + ${p.offX}px)`,    // Phase 2: Random position (free)
                `calc(${p.freeEndX}% + ${p.offX}px)`, // Phase 2: End (free)
              ],
              top: [
                `calc(${cl.startY}% + ${p.offY}px)`,  // Phase 1: Start (coordinated)
                `calc(${cl.endY}% + ${p.offY}px)`,    // Phase 1: End (coordinated)
                `calc(${p.freeY}% + ${p.offY}px)`,    // Phase 2: Random position (free)
                `calc(${p.freeEndY}% + ${p.offY}px)`, // Phase 2: End (free)
              ],
              rotate: [p.angle, p.angle + p.rotateDelta, p.angle, p.angle + p.rotateDelta],
              opacity: [p.alpha, p.alpha, p.alpha, p.alpha * 0.3],
            }}
            transition={{
              duration: cl.dur + p.freeDur,
              repeat: Infinity,
              ease: "linear",
              delay: cl.delay,
            }}
          />
        );
      })}
    </div>
  );
}