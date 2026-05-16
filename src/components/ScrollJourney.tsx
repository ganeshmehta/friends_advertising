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
    roughness: 0.7,
    metalness: 0.1,
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
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={3} color="#00f3ff" />
      <pointLight position={[-10, -10, -10]} intensity={1} color="#bc13fe" />
      
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
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
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
          autoPlay muted loop playsInline
          className="w-full h-full object-cover grayscale opacity-40 mix-blend-screen"
          src="/videos/splash_road.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-transparent to-[var(--background)]" />
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
