"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface PointData {
  id: string;
  title: string;
  desc: string;
  media?: string[];
  cta?: { text: string; link: string };
}

interface Props {
  point: PointData;
  onClose: () => void;
}

export default function EarthDetailModal({ point, onClose }: Props) {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`earth-detail-${point.id}-title`}
    >
      <motion.div
        className="glass max-w-2xl w-full p-8 rounded-xl relative"
        layoutId={point.id}
      >
        <button
          type="button"
          className="absolute top-4 right-4 text-white text-3xl font-bold"
          onClick={onClose}
          aria-label="Close detail"
        >
          &times;
        </button>
        <h2
          id={`earth-detail-${point.id}-title`}
          className="text-2xl font-bold mb-4"
        >
          {point.title}
        </h2>
        <p className="mb-4">{point.desc}</p>
        {point.media && (
          <div className="grid grid-cols-1 gap-4 mb-4">
            {point.media.map((src, i) => (
              <div key={i} className="relative w-full overflow-hidden rounded">
                <Image
                  src={src}
                  alt={point.title}
                  width={800}
                  height={450}
                  sizes="(min-width: 768px) 640px, 100vw"
                  className="h-auto w-full rounded"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
        {point.cta && (
          <a
            href={point.cta.link}
            rel="noopener noreferrer"
            className="inline-block mt-2 bg-neon-blue text-black py-2 px-4 rounded hover:opacity-90"
          >
            {point.cta.text}
          </a>
        )}
      </motion.div>
    </motion.div>
  );
}
