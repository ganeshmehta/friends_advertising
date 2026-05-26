"use client";

import { useRef, Suspense, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

function MegaphoneModel() {
  const groupRef = useRef<THREE.Group>(null);
  const hornRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Gentle rotation
      groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.2;
      groupRef.current.rotation.x = Math.cos(time * 0.3) * 0.1;
      
      // Pulse effect on hover
      const scale = hovered ? 1.1 + Math.sin(time * 10) * 0.05 : 1;
      groupRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }

    if (hornRef.current) {
        // Animation for the horn if needed
    }
  });

  return (
    <group 
        ref={groupRef} 
        onPointerOver={() => setHovered(true)} 
        onPointerOut={() => setHovered(false)}
        rotation={[0, -Math.PI / 4, 0]}
    >
      {/* Horn Body */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.5]}>
        <coneGeometry args={[1.2, 2.5, 32, 1, true]} />
        <meshStandardMaterial 
            color="#0071e3" 
            emissive="#0071e3" 
            emissiveIntensity={hovered ? 1.2 : 0.3} 
            side={THREE.DoubleSide}
            metalness={0.7}
            roughness={0.3}
        />
      </mesh>

      {/* Back Part */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -1]}>
        <cylinderGeometry args={[0.6, 0.6, 1, 32]} />
        <meshStandardMaterial color="#f5f5f7" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Handle */}
      <mesh position={[0, -1.2, -0.8]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.3, 1.2, 0.5]} />
        <meshStandardMaterial color="#1d1d1f" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Sound Waves / Pulses */}
      {hovered && (
          <mesh position={[0, 0, 1.8]} rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.2, 1.3, 32]} />
              <MeshDistortMaterial 
                color="#0071e3" 
                speed={5} 
                distort={0.3} 
                transparent 
                opacity={0.5} 
                emissive="#0071e3"
                emissiveIntensity={1}
              />
          </mesh>
      )}

      {/* Point Light inside the horn */}
      <pointLight position={[0, 0, 0.5]} intensity={5} color="#0071e3" distance={5} />
    </group>
  );
}

export default function Megaphone3D() {
  return (
    <div className="w-full h-full relative cursor-pointer">
      <Canvas gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} />
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#bc13fe" />
          
          <Float speed={3} rotationIntensity={1.5} floatIntensity={1.5}>
            <MegaphoneModel />
          </Float>
        </Suspense>
      </Canvas>
      
      {/* Decorative Glow Background */}
      <div className="absolute inset-0 bg-[var(--neon-blue)]/5 rounded-full filter blur-3xl -z-10 pointer-events-none"></div>
    </div>
  );
}
