"use client";

import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, Float, Text, useCursor } from "@react-three/drei";
import * as THREE from "three";

function BillboardModel() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
      // Slight rotation based on mouse position
      const targetRotationY = (state.pointer.x * Math.PI) / 6;
      const targetRotationX = -(state.pointer.y * Math.PI) / 12;
      groupRef.current.rotation.y += (targetRotationY - groupRef.current.rotation.y) * 0.1;
      groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.1;
    }
  });

  return (
    <group ref={groupRef} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* Billboard Screen */}
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[6, 3, 0.5]} />
        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Screen Display Area (The "Ad") */}
      <mesh position={[0, 2, 0.26]}>
        <planeGeometry args={[5.8, 2.8]} />
        {/* We use a glowing basic material for the ad screen to simulate LED/flex lighting */}
        <meshBasicMaterial color="#00f3ff" />
      </mesh>
      
      {/* Text on Screen */}
      <group position={[0, 2, 0.28]}>
        <Text
          position={[0, 0.4, 0]}
          fontSize={0.45}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000"
          letterSpacing={0.05}
        >
          FRIENDS ADVERTISING
        </Text>
        <Text
          position={[0, -0.4, 0]}
          fontSize={0.25}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={5}
          textAlign="center"
          lineHeight={1.8}
          outlineWidth={0.005}
          outlineColor="#000"
        >
          THE COMPLETE OUTDOOR SOLUTION
        </Text>
      </group>

      {/* Billboard Frame */}
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[6.2, 3.2, 0.3]} />
        <meshStandardMaterial color="#222" wireframe={hovered} />
      </mesh>

      {/* Main Pole - Moved back to avoid clipping screen */}
      <mesh position={[0, -1, -0.2]} castShadow>
        <cylinderGeometry args={[0.3, 0.4, 6]} />
        <meshStandardMaterial color="#444" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Base */}
      <mesh position={[0, -4, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 2, 0.5]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    </group>
  );
}

export default function Billboard3D() {
  return (
    <div className="w-full h-full min-h-[500px] bg-transparent">
      <Canvas shadows camera={{ position: [0, 2, 10], fov: 50 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <spotLight position={[0, -5, 5]} angle={0.5} penumbra={1} intensity={2} color="#bc13fe" />
          
          {/* Use a basic environment setup to avoid hanging if network is slow */}
          <Environment preset="city" />
          
          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <BillboardModel />
          </Float>
          
          <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 3} />
        </Suspense>
      </Canvas>
    </div>
  );
}
