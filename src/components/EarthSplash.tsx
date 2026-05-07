"use client";

import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, useTexture, Text } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

function SpinningEarth({ zooming }: { zooming: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const colorMap = useTexture('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg');

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
      
      if (zooming) {
        meshRef.current.scale.lerp(new THREE.Vector3(20, 20, 20), delta * 5);
      }
    }
  });

  return (
    <group>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 10, 5]} intensity={2} />
      <Sphere ref={meshRef} args={[2, 64, 64]} rotation={[0, Math.PI * 1.2, 0]}>
        <meshStandardMaterial map={colorMap} roughness={0.6} metalness={0.1} />
      </Sphere>
    </group>
  );
}

function RealisticRoadScene() {
  const roadSpeed = 40; // Fast moving road

  return (
    <group>
      <color attach="background" args={["#020205"]} />
      <fog attach="fog" args={["#020205", 10, 100]} />
      <ambientLight intensity={0.1} />
      <directionalLight position={[10, 20, 10]} intensity={0.2} />
      
      {/* The static ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#050505" roughness={1} />
      </mesh>

      {/* The Road Surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.99, 0]}>
        <planeGeometry args={[14, 300]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Moving Scenery Objects (Trees, Lamps, Billboards, Lane Markings) */}
      {Array.from({ length: 20 }).map((_, i) => (
        <SceneryItem key={i} index={i} speed={roadSpeed} totalItems={20} />
      ))}
    </group>
  );
}

function SceneryItem({ index, speed, totalItems }: { index: number, speed: number, totalItems: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const spacing = 15;
  const initialZ = -(index * spacing);
  const side = index % 2 === 0 ? 1 : -1;
  const isBillboard = index % 4 === 0; // Every 4th item is a billboard

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.z += delta * speed;
      if (groupRef.current.position.z > 10) {
        // Reset far back when it passes the camera
        groupRef.current.position.z -= totalItems * spacing;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, initialZ]}>
      {isBillboard ? (
        <Billboard side={side} />
      ) : (
        <group>
          <Tree side={side} />
          <StreetLamp side={side} />
        </group>
      )}
      
      {/* Lane Markings (center of the road) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.98, 0]}>
        <planeGeometry args={[0.3, 5]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
}

function Tree({ side }: { side: number }) {
  // Randomize tree slightly so they don't look perfectly uniform
  const x = side * (8 + Math.random() * 4); // Place off the road
  const z = (Math.random() - 0.5) * 5;
  const scale = 0.8 + Math.random() * 0.7;

  return (
    <group position={[x, -2, z]} scale={scale}>
      {/* Trunk */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 4]} />
        <meshStandardMaterial color="#2d1c10" roughness={0.9} />
      </mesh>
      {/* Leaves - Pine tree style */}
      <mesh position={[0, 6, 0]}>
        <coneGeometry args={[2.5, 6, 6]} />
        <meshStandardMaterial color="#0a2a12" roughness={1} />
      </mesh>
      <mesh position={[0, 8, 0]}>
        <coneGeometry args={[2, 5, 6]} />
        <meshStandardMaterial color="#0c3015" roughness={1} />
      </mesh>
    </group>
  );
}

function StreetLamp({ side }: { side: number }) {
  const x = side * 7.5;
  
  return (
    <group position={[x, -2, 0]}>
      {/* Pole */}
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 10]} />
        <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Arm */}
      <mesh position={[-side * 1, 10, 0]} rotation={[0, 0, side * Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 2]} />
        <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Light Bulb */}
      <mesh position={[-side * 2, 9.8, 0]}>
        <sphereGeometry args={[0.3]} />
        <meshBasicMaterial color="#ffeebb" />
        <pointLight intensity={3} color="#ffeebb" distance={30} />
      </mesh>
    </group>
  );
}

function Billboard({ side }: { side: number }) {
  const x = side * 12;
  // Rotate slightly to face the oncoming driver
  const rotationY = side === 1 ? -Math.PI / 8 : Math.PI / 8;
  const color = side === 1 ? "#00f3ff" : "#bc13fe";
  const brandName = side === 1 ? "FRIENDS" : "ADVERTISING";

  return (
    <group position={[x, -2, 0]} rotation={[0, rotationY, 0]}>
      {/* Main Pole */}
      <mesh position={[0, 6, 0]}>
        <cylinderGeometry args={[0.5, 0.6, 12]} />
        <meshStandardMaterial color="#222" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Screen Frame */}
      <mesh position={[0, 12, 0]}>
        <boxGeometry args={[10, 6, 1]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      
      {/* The Ad Screen */}
      {/* Since side=1 is on the right, the screen should face -Z. 
          Actually the camera is looking at -Z, so the screen should face +Z. 
          If rotationY rotates the group, the plane faces +Z by default. */}
      <mesh position={[0, 12, 0.51]}>
        <planeGeometry args={[9.6, 5.6]} />
        <meshBasicMaterial color={color} />
      </mesh>
      
      {/* Text on Billboard */}
      <Text
        position={[0, 12, 0.55]}
        fontSize={1.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000"
      >
        {brandName}
      </Text>

      {/* Screen Glow Light */}
      <pointLight position={[0, 12, 2]} intensity={5} color={color} distance={40} decay={2} />
    </group>
  );
}

export default function EarthSplash({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'earth' | 'zooming' | 'road'>('earth');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const zoomTimer = setTimeout(() => {
      setPhase('zooming');
    }, 3000); // Start zoom after 3 seconds

    const transitionInTimer = setTimeout(() => {
      setIsTransitioning(true);
    }, 3100); // Start fading to black shortly after zoom starts

    const roadTimer = setTimeout(() => {
      setPhase('road');
    }, 3900); // Switch to road when fully black

    const transitionOutTimer = setTimeout(() => {
      setIsTransitioning(false);
    }, 4000); // Fade back in to reveal the road

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 7500); // Extended total time for smoother experience

    return () => {
      clearTimeout(zoomTimer);
      clearTimeout(transitionInTimer);
      clearTimeout(roadTimer);
      clearTimeout(transitionOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[var(--neon-blue)] mix-blend-screen filter blur-[150px] opacity-10"></div>
      </div>
      
      <div className="relative z-10 w-full h-full">
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
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
            className="absolute bottom-10 z-20 text-[var(--neon-blue)] font-bold tracking-widest animate-pulse"
          >
            LOADING EXPERIENCE...
          </motion.div>
        )}
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 z-40 bg-black"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
