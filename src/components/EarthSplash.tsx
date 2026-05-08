"use client";

import { useRef, useEffect, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture, Text } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

// Optimized geometries for instant load
const EARTH_GEOM = new THREE.SphereGeometry(2, 32, 32);
const ROAD_GEOM = new THREE.PlaneGeometry(14, 600);
const GROUND_GEOM = new THREE.PlaneGeometry(600, 600);
const LANE_GEOM = new THREE.PlaneGeometry(0.3, 5);
const TRUNK_GEOM = new THREE.CylinderGeometry(0.2, 0.3, 4, 8);
const LEAVES_GEOM = new THREE.ConeGeometry(2.5, 6, 8);
const POLE_GEOM = new THREE.CylinderGeometry(0.12, 0.12, 10, 8);
const LIGHT_GEOM = new THREE.SphereGeometry(0.3, 8, 8);

// Lighter materials and stronger emissive properties for visibility
const MAT_ROAD = new THREE.MeshStandardMaterial({ color: "#222", roughness: 0.6, metalness: 0.3 });
const MAT_GROUND = new THREE.MeshStandardMaterial({ color: "#0a0a0a" });
const MAT_LANE = new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#ffffff", emissiveIntensity: 2 });
const MAT_TRUNK = new THREE.MeshStandardMaterial({ color: "#3a261a", roughness: 0.9 });
const MAT_LEAVES = new THREE.MeshStandardMaterial({ color: "#0f3a1a", roughness: 0.8 });
const MAT_POLE = new THREE.MeshStandardMaterial({ color: "#555", metalness: 0.8, roughness: 0.2 });
const MAT_LIGHT_GLOW = new THREE.MeshBasicMaterial({ color: "#fff4cc" });

function SpinningEarth({ zooming }: { zooming: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const colorMap = useTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
      if (zooming) {
        meshRef.current.scale.lerp(new THREE.Vector3(25, 25, 25), delta * 4);
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

function RealisticRoadScene() {
  const roadSpeed = 45;
  const itemCount = 20;
  const spacing = 18;

  return (
    <group>
      <color attach="background" args={["#020205"]} />
      {/* Lightened fog to avoid black-out */}
      <fog attach="fog" args={["#020205", 20, 150]} />
      
      {/* Significantly boosted lighting for visibility */}
      <ambientLight intensity={1.5} />
      <pointLight position={[0, 20, -10]} intensity={150} color="#00f3ff" distance={100} />
      <pointLight position={[0, 20, -50]} intensity={150} color="#bc13fe" distance={100} />
      <pointLight position={[0, 20, -90]} intensity={150} color="#00f3ff" distance={100} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} geometry={GROUND_GEOM} material={MAT_GROUND} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.99, 0]} geometry={ROAD_GEOM} material={MAT_ROAD} />

      {Array.from({ length: itemCount }).map((_, i) => (
        <SceneryItem key={i} index={i} speed={roadSpeed} totalItems={itemCount} spacing={spacing} />
      ))}
    </group>
  );
}

function SceneryItem({ index, speed, totalItems, spacing }: { index: number, speed: number, totalItems: number, spacing: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const initialZ = -(index * spacing);
  const side = index % 2 === 0 ? 1 : -1;
  const isBillboard = index % 4 === 0;

  const randomScale = useMemo(() => 0.8 + Math.random() * 0.4, []);
  const randomXOffset = useMemo(() => Math.random() * 2, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.z += delta * speed;
      if (groupRef.current.position.z > 20) {
        groupRef.current.position.z -= totalItems * spacing;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, initialZ]}>
      {isBillboard ? (
        <BillboardItem side={side} />
      ) : (
        <group scale={randomScale}>
          <TreeItem side={side} xOffset={randomXOffset} />
          <LampItem side={side} />
        </group>
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.98, 0]} geometry={LANE_GEOM} material={MAT_LANE} />
    </group>
  );
}

function TreeItem({ side, xOffset }: { side: number, xOffset: number }) {
  const x = side * (9 + xOffset);
  return (
    <group position={[x, -2, 0]}>
      <mesh position={[0, 2, 0]} geometry={TRUNK_GEOM} material={MAT_TRUNK} />
      <mesh position={[0, 6, 0]} geometry={LEAVES_GEOM} material={MAT_LEAVES} />
      <mesh position={[0, 8, 0]} geometry={LEAVES_GEOM} material={MAT_LEAVES} scale={0.7} />
    </group>
  );
}

function LampItem({ side }: { side: number }) {
  const x = side * 7.5;
  return (
    <group position={[x, -2, 0]}>
      <mesh position={[0, 5, 0]} geometry={POLE_GEOM} material={MAT_POLE} />
      {/* Light Head */}
      <mesh position={[-side * 1.5, 9.8, 0]} geometry={LIGHT_GEOM} material={MAT_LIGHT_GLOW} />
      <pointLight position={[-side * 1.5, 9.8, 0]} intensity={50} color="#ffeebb" distance={30} decay={1.5} />
    </group>
  );
}

function BillboardItem({ side }: { side: number }) {
  const x = side * 12;
  const brandName = side === 1 ? "FRIENDS" : "ADVERTISING";
  const color = side === 1 ? "#00f3ff" : "#bc13fe";

  return (
    <group position={[x, -2, 0]} rotation={[0, side === 1 ? -0.4 : 0.4, 0]}>
      <mesh position={[0, 6, 0]} geometry={TRUNK_GEOM} material={MAT_POLE} scale={[2.5, 3, 2.5]} />
      <mesh position={[0, 12, 0]}>
        <boxGeometry args={[10, 6, 0.5]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, 12, 0.3]}>
        <planeGeometry args={[9.6, 5.6]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <Text position={[0, 12, 0.35]} fontSize={1.2} color="white" anchorX="center" anchorY="middle">
        {brandName}
      </Text>
      <pointLight position={[0, 12, 2]} intensity={80} color={color} distance={40} />
    </group>
  );
}

export default function EarthSplash({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'earth' | 'zooming' | 'road'>('earth');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('zooming'), 3000),
      setTimeout(() => setIsTransitioning(true), 3100),
      setTimeout(() => setPhase('road'), 3800),
      setTimeout(() => setIsTransitioning(false), 3900),
      setTimeout(() => onComplete(), 8500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      <div className="relative w-full h-full">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }} gl={{ antialias: true, powerPreference: "high-performance" }}>
          <Suspense fallback={null}>
            {phase === 'earth' || phase === 'zooming' ? (
              <SpinningEarth zooming={phase === 'zooming'} />
            ) : (
              <RealisticRoadScene />
            )}
          </Suspense>
        </Canvas>
      </div>

      <AnimatePresence>
        {phase === 'earth' && (
          <motion.div 
            exit={{ opacity: 0 }}
            className="absolute bottom-10 z-20 text-[var(--neon-blue)] font-bold tracking-widest animate-pulse uppercase"
          >
            Loading Experience...
          </motion.div>
        )}
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}




