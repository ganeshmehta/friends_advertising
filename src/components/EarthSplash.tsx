"use client";

import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

// Optimized geometries for the Earth part
const EARTH_GEOM = new THREE.SphereGeometry(2, 32, 32);

function SpinningEarth({ zooming }: { zooming: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const colorMap = useTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
      if (zooming) {
        // Aggressive zoom for transition
        meshRef.current.scale.lerp(new THREE.Vector3(45, 45, 45), delta * 4);
      }
    }
  });

  return (
    <group>
      <ambientLight intensity={2} />
      <directionalLight position={[10, 10, 5]} intensity={3} />
      <mesh ref={meshRef} geometry={EARTH_GEOM} rotation={[0, Math.PI * 1.2, 0]}>
        <meshStandardMaterial map={colorMap} roughness={0.8} />
      </mesh>
    </group>
  );
}

export default function EarthSplash({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'earth' | 'zooming' | 'video'>('earth');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Phase timings for high-impact transition
    const timers = [
      setTimeout(() => setPhase('zooming'), 2500),
      setTimeout(() => setIsTransitioning(true), 2600),
      setTimeout(() => setPhase('video'), 3200),
      setTimeout(() => setIsTransitioning(false), 3300),
      setTimeout(() => onComplete(), 9500), // Total splash duration
    ];

    // Preload local video for instant playback
    if (typeof window !== 'undefined') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'video';
      link.href = "/videos/splash_road.mp4";
      document.head.appendChild(link);
    }

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden"
    >
      {/* Phase 1 & 2: 3D Content */}
      <div className={`absolute inset-0 z-10 transition-opacity duration-700 ${phase === 'video' ? 'opacity-0' : 'opacity-100'}`}>
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
          <Suspense fallback={null}>
            {(phase === 'earth' || phase === 'zooming') && (
              <SpinningEarth zooming={phase === 'zooming'} />
            )}
          </Suspense>
        </Canvas>
      </div>

      {/* Phase 3: Local Video Content */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${phase === 'video' ? 'opacity-100' : 'opacity-0'}`}>
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          src="/videos/splash_road.mp4"
        />
        
        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 pointer-events-none" />
        
        {/* Branding Overlay */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={phase === 'video' ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-4"
        >
          <div className="mb-4 px-4 py-1 rounded-full border border-[var(--neon-blue)]/30 bg-black/40 backdrop-blur-sm text-[var(--neon-blue)] text-xs font-bold tracking-[0.3em] uppercase">
            Future of Advertising
          </div>
          <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter mb-2 drop-shadow-[0_0_30px_rgba(0,243,255,0.2)]">
            REAL IMPACT. <br />
            <span className="text-[var(--neon-blue)] neon-text">UNMISSABLE PRESENCE.</span>
          </h2>
          <div className="w-32 h-1 bg-[var(--neon-blue)] mt-8"></div>
        </motion.div>
      </div>

      <AnimatePresence>
        {phase === 'earth' && (
          <motion.div 
            exit={{ opacity: 0 }}
            className="absolute bottom-10 z-20 text-[var(--neon-blue)] font-bold tracking-[0.4em] animate-pulse uppercase text-[10px]"
          >
            Initializing Premium Experience...
          </motion.div>
        )}
        
        {/* Smooth white flash for landing effect */}
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-white"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}








