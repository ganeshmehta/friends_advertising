"use client";

import { useRef, useState, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Text, useCursor } from "@react-three/drei";
import * as THREE from "three";

// Pre-define geometries and materials to avoid re-allocation
const SCREEN_GEOM = new THREE.BoxGeometry(6, 3, 0.5);
const DISPLAY_GEOM = new THREE.PlaneGeometry(5.8, 2.8);
const FRAME_GEOM = new THREE.BoxGeometry(6.2, 3.2, 0.3);
const POLE_GEOM = new THREE.CylinderGeometry(0.3, 0.4, 6, 12);
const BASE_GEOM = new THREE.CylinderGeometry(1.5, 2, 0.5, 16);

const MAT_SCREEN = new THREE.MeshStandardMaterial({ color: "#111", metalness: 0.8, roughness: 0.2 });
const MAT_AD = new THREE.MeshBasicMaterial({ color: "#00f3ff" });
const MAT_FRAME = new THREE.MeshStandardMaterial({ color: "#222" });
const MAT_POLE = new THREE.MeshStandardMaterial({ color: "#444", metalness: 0.9, roughness: 0.1 });
const MAT_BASE = new THREE.MeshStandardMaterial({ color: "#222" });

function BillboardModel() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
      const targetRotationY = (state.pointer.x * Math.PI) / 10;
      const targetRotationX = -(state.pointer.y * Math.PI) / 15;
      groupRef.current.rotation.y += (targetRotationY - groupRef.current.rotation.y) * 0.1;
      groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.1;
    }
  });

  return (
    <group ref={groupRef} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* Billboard Screen */}
      <mesh position={[0, 2, 0]} castShadow geometry={SCREEN_GEOM} material={MAT_SCREEN} />
      
      {/* Screen Display Area */}
      <mesh position={[0, 2, 0.26]} geometry={DISPLAY_GEOM} material={MAT_AD} />
      
      {/* Text on Screen */}
      <group position={[0, 2, 0.28]}>
        <Text position={[0, 0.4, 0]} fontSize={0.45} color="white" font="/fonts/Inter-Bold.woff">
          FRIENDS ADVERTISING
        </Text>
        <Text position={[0, -0.4, 0]} fontSize={0.25} color="white" maxWidth={5} textAlign="center">
          THE COMPLETE OUTDOOR SOLUTION
        </Text>
      </group>

      {/* Billboard Frame */}
      <mesh position={[0, 2, 0]} geometry={FRAME_GEOM}>
        <meshStandardMaterial color="#222" wireframe={hovered} />
      </mesh>

      {/* Main Pole */}
      <mesh position={[0, -1, -0.2]} castShadow geometry={POLE_GEOM} material={MAT_POLE} />

      {/* Base */}
      <mesh position={[0, -4, 0]} receiveShadow geometry={BASE_GEOM} material={MAT_BASE} />
    </group>
  );
}

export default function Billboard3D() {
  return (
    <div className="w-full h-full min-h-[400px] bg-transparent">
      <Canvas 
        shadows 
        camera={{ position: [0, 2, 10], fov: 45 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
          <spotLight position={[0, -5, 5]} angle={0.5} penumbra={1} intensity={5} color="#bc13fe" />
          
          <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
            <BillboardModel />
          </Float>
          
          <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 3} />
        </Suspense>
      </Canvas>
    </div>
  );
}

