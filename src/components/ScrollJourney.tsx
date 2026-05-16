"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture, Stars, Float, OrbitControls } from "@react-three/drei";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import * as THREE from "three";

function Earth({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const earthTexture = useTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');
  
  // Custom materials for premium look
  const earthMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    map: earthTexture,
    roughness: 0.55,
    metalness: 0.15,
    color: new THREE.Color("#ffffff"),
    emissive: new THREE.Color("#0a1a2a"),
    emissiveIntensity: 0.1,
  }), [earthTexture]);

  useFrame((state, delta) => {
    if (meshRef.current && cloudRef.current) {
      // Constant slow rotation + scroll-based speedup
      const scrollVal = scrollYProgress.get();
      meshRef.current.rotation.y += delta * 0.2 + (scrollVal * delta * 2);
      cloudRef.current.rotation.y += delta * 0.25 + (scrollVal * delta * 2.5);
      
      // Zoom effect mapped to scroll
      // As we scroll from 0 to 0.4, we zoom from scale 1 to 50
      const zoomScale = THREE.MathUtils.lerp(1.5, 60, Math.pow(scrollVal * 2.5, 3));
      if (scrollVal <= 0.4) {
        meshRef.current.scale.setScalar(zoomScale);
        cloudRef.current.scale.setScalar(zoomScale * 1.01);
      }
    }
  });

  return (
    <group>
      <ambientLight intensity={0.9} />
      <pointLight position={[10, 10, 10]} intensity={4} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={2} color="#ffd38a" />
      <directionalLight position={[5, 3, 5]} intensity={2} color="#ffffff" />
      
      {/* Main Earth */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <primitive object={earthMaterial} attach="material" />
      </mesh>

      {/* Atmospheric Glow/Clouds */}
      <mesh ref={cloudRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial 
          color="#00f3ff" 
          transparent 
          opacity={0.1} 
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

export default function ScrollJourney({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  // Mapping scroll progress to various cinematic values
  const earthOpacity = useTransform(scrollYProgress, [0, 0.3, 0.4], [1, 1, 0]);
  const videoOpacity = useTransform(scrollYProgress, [0.25, 0.4, 0.8], [0, 1, 0]);
  const blurValue = useTransform(scrollYProgress, [0.2, 0.4, 0.6], [0, 20, 0]);
  const letterboxSize = useTransform(scrollYProgress, [0, 0.1, 0.8, 1], ["0%", "8%", "8%", "0%"]);
  
  // Overlay text transitions
  const text1Opacity = useTransform(scrollYProgress, [0, 0.1, 0.15], [0, 1, 0]);
  const text2Opacity = useTransform(scrollYProgress, [0.15, 0.25, 0.3], [0, 1, 0]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[var(--background)]">
      {/* Letterbox Effect */}
      <motion.div style={{ height: letterboxSize }} className="absolute top-0 left-0 right-0 bg-black z-50" />
      <motion.div style={{ height: letterboxSize }} className="absolute bottom-0 left-0 right-0 bg-black z-50" />

      {/* 3D Scene Container */}
      <motion.div 
        style={{ opacity: earthOpacity, filter: `blur(${blurValue.get()}px)` }}
        className="absolute inset-0 z-10 pointer-events-auto"
      >
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <Suspense fallback={null}>
            <>
              {/* Far deep blue stars (background galaxy) */}
              <Stars
                radius={120}
                depth={80}
                count={4000}
                factor={4}
                saturation={0.3}
                fade
                speed={0.5}
              />

              {/* Mid-layer white + slight cyan stars */}
              <Stars
                radius={80}
                depth={40}
                count={3000}
                factor={5}
                saturation={0.6}
                fade
                speed={0.8}
              />

              {/* Near bright glowing stars */}
              <Stars
                radius={50}
                depth={20}
                count={1500}
                factor={6}
                saturation={1}
                fade
                speed={1.2}
              />
            </>
            <Earth scrollYProgress={scrollYProgress} />
            <OrbitControls 
              enableZoom={false} 
              enablePan={false} 
              rotateSpeed={0.5} 
              enableDamping={true} 
              dampingFactor={0.05}
            />
          </Suspense>
        </Canvas>
      </motion.div>

   {/* Atmospheric Entry Video Overlay */}
<motion.div 
  style={{ opacity: videoOpacity }}
  className="absolute inset-0 z-20"
>
  <video
    autoPlay
    muted
    loop
    playsInline
    className="w-full h-full object-cover saturate-150 brightness-115 contrast-115"
    src="/videos/Temp_road.mp4"
  />

  {/* Light cinematic overlay */}
  <div className="absolute inset-0 bg-black/5" />

  {/* Soft glow for premium feel */}
  <div className="absolute inset-0 bg-cyan-400/5 mix-blend-screen" />

  {/* Vignette */}
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.18)_100%)]" />
</motion.div>

      {/* Cinematic Text Layers */}
      <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
        <motion.div style={{ opacity: text1Opacity }} className="text-center px-4">
          <h2 className="text-2xl md:text-4xl font-bold tracking-[0.5em] uppercase neon-text text-[var(--neon-blue)]">
            A New Perspective
          </h2>
          <h2 className="text-2xl md:text-4xl font-bold tracking-[0.5em] uppercase neon-text text-[var(--neon-blue)]">
            For OutDoor Advertising
          </h2>
        </motion.div>
        
        <motion.div style={{ opacity: text2Opacity }} className="text-center px-4">
          <h2 className="text-2xl md:text-4xl font-bold tracking-[0.5em] uppercase neon-text text-[var(--neon-green)]">
            Hitting the Streets
          </h2>
          <h2 className="text-2xl md:text-4xl font-bold tracking-[0.5em] uppercase neon-text text-[var(--neon-green)]">
            Converting campaigns into experiences
          </h2>
        </motion.div>
      </div>

      {/* Guided Visual Overlay */}
      <div className="absolute inset-0 z-40 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(8,10,21,0.4)_100%)]" />
    </div>
  );
}
