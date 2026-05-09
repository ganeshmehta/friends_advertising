"use client";

import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

// Optimized geometries for the Earth part
const EARTH_GEOM = new THREE.SphereGeometry(2, 32, 32);

function SpinningEarth({ zooming, opacity }: { zooming: boolean, opacity: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const colorMap = useTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
      if (zooming) {
        // Ultra-smooth exponential zoom
        meshRef.current.scale.lerp(new THREE.Vector3(50, 50, 50), delta * 2.5);
      }
    }
  });

  return (
    <group>
      <ambientLight intensity={1.5} />
      <pointLight position={[10, 10, 10]} intensity={2} />
      <mesh ref={meshRef} geometry={EARTH_GEOM} rotation={[0, Math.PI * 1.2, 0]}>
        <meshStandardMaterial 
          map={colorMap} 
          roughness={0.7} 
          transparent 
          opacity={opacity}
        />
      </mesh>
    </group>
  );
}

export default function EarthSplash({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'earth' | 'zooming' | 'video' | 'exiting'>('earth');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Premium timing sequence for buttery smooth transitions
    const timers = [
      setTimeout(() => setPhase('zooming'), 2800),
      setTimeout(() => setPhase('video'), 3800),
      setTimeout(() => setPhase('exiting'), 8500),
      setTimeout(() => onComplete(), 10000), // Extended for slow fade-out
    ];

    // Preload for zero-latency video start
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload'; link.as = 'video';
      link.href = "/videos/splash_road.mp4";
      document.head.appendChild(link);
    }

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Cubic-bezier easing for premium feel
  const premiumEase = [0.43, 0.13, 0.23, 0.96];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'exiting' ? 0 : 1 }}
      transition={{ duration: 1.5, ease: premiumEase }}
      className="fixed inset-0 z-50 bg-[var(--background)] overflow-hidden flex items-center justify-center"
    >
      {/* 3D Earth Phase - Smooth Cross-fade to Video */}
      <motion.div 
        animate={{ 
          opacity: phase === 'video' || phase === 'exiting' ? 0 : 1,
          scale: phase === 'zooming' ? 1.2 : 1,
          filter: phase === 'zooming' ? "blur(10px)" : "blur(0px)"
        }}
        transition={{ duration: 1.2, ease: premiumEase }}
        className="absolute inset-0 z-20 pointer-events-none"
      >
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ antialias: true, alpha: true }}>
          <Suspense fallback={null}>
            <SpinningEarth zooming={phase === 'zooming'} opacity={phase === 'video' ? 0 : 1} />
          </Suspense>
        </Canvas>
      </motion.div>

      {/* Glassy Transition Layer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: phase === 'zooming' ? 1 : 0 
        }}
        transition={{ duration: 1 }}
        className="absolute inset-0 z-30 bg-white/5 backdrop-blur-3xl pointer-events-none"
      />

      {/* Video Content Phase */}
      <motion.div 
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ 
          opacity: phase === 'video' || phase === 'exiting' ? 1 : 0,
          scale: phase === 'exiting' ? 1.05 : 1
        }}
        transition={{ duration: 2, ease: premiumEase }}
        className="absolute inset-0 z-10"
      >
        <video
          ref={videoRef}
          autoPlay muted loop playsInline
          className="w-full h-full object-cover"
          src="/videos/splash_road.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)]/80 via-transparent to-[var(--background)]/80 pointer-events-none" />
        
        {/* Premium Branding Overlay with Progressive Reveal */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={phase === 'video' ? { opacity: 1, y: 0 } : { opacity: 0 }}
          transition={{ delay: 0.8, duration: 1.5, ease: premiumEase }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
        >
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="glass p-12 md:p-20 rounded-full border border-white/10"
          >
            <div className="mb-6 px-6 py-2 rounded-full border border-[var(--neon-blue)]/20 bg-white/5 text-[var(--neon-blue)] text-xs font-bold tracking-[0.5em] uppercase">
              Friends Advertising
            </div>
            <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-4">
              REAL IMPACT. <br />
              <span className="text-[var(--neon-blue)] neon-text">NO LIMITS.</span>
            </h2>
            <div className="w-48 h-[2px] bg-gradient-to-r from-transparent via-[var(--neon-blue)] to-transparent mx-auto mt-8 opacity-50"></div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Final Glassy Exit Reveal */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'exiting' ? 1 : 0 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 z-40 bg-black/40 backdrop-blur-2xl pointer-events-none"
      />

      {/* Initial Loading Micro-copy */}
      <AnimatePresence>
        {phase === 'earth' && (
          <motion.div 
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 1, ease: premiumEase }}
            className="absolute bottom-12 z-50 text-white/40 text-[9px] font-bold tracking-[0.6em] uppercase"
          >
            Crafting Your Digital Skyline
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}









