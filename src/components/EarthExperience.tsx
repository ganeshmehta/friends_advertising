import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import { Suspense, useRef, useState, useEffect } from 'react';
import { useTexture } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { useGesture } from '@use-gesture/react';
import EarthDetailModal from './EarthDetailModal';
import pointsData from "../data/earthPoints.json";

// Low‑poly sphere geometry
const EARTH_GEOM = new THREE.SphereGeometry(2, 32, 32);

function Point({ data, onSelect }) {
  const meshRef = useRef<THREE.Mesh>(null);
  // Hover animation using GSAP
  useEffect(() => {
    if (!meshRef.current) return;
    const el = meshRef.current;
    const hover = () => {
      el.scale.set(1.2, 1.2, 1.2);
    };
    const out = () => {
      el.scale.set(1, 1, 1);
    };
    const handle = el;
    handle.addEventListener('pointerover', hover);
    handle.addEventListener('pointerout', out);
    return () => {
      handle.removeEventListener('pointerover', hover);
      handle.removeEventListener('pointerout', out);
    };
  }, []);

  return (
    <mesh
      ref={meshRef}
      position={new THREE.Vector3(...data.position)}
      geometry={new THREE.SphereGeometry(0.07, 16, 16)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(data);
      }}
    >
      <meshStandardMaterial color="var(--neon-blue)" emissive="var(--neon-blue)" emissiveIntensity={0.6} />
    </mesh>
  );
}

export default function EarthExperience() {
  const [selected, setSelected] = useState<any>(null);
  const earthRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  // Load texture
  const [colorMap] = useTexture(['/textures/earth_low.jpg']); // add this texture to public/textures

  // Initial camera position – focus on India (approx lat 20N, lon 78E)
  useEffect(() => {
    // Convert lat/lon to spherical coordinates for the camera
    const phi = THREE.MathUtils.degToRad(90 - 20); // latitude
    const theta = THREE.MathUtils.degToRad(78 + 180); // longitude offset
    const radius = 5;
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
  }, []);

  // Gesture handling – only rotate while user drags / scrolls
  const bind = useGesture(
    {
      onDrag: ({ offset: [x, y] }) => {
        if (earthRef.current) {
          earthRef.current.rotation.y = x / 100;
          earthRef.current.rotation.x = y / 100;
        }
      },
      onWheel: ({ delta: [, dy] }) => {
        // simple zoom, clamped
        const newZ = THREE.MathUtils.clamp(camera.position.length() + dy * 0.01, 3, 10);
        camera.position.setLength(newZ);
      }
    },
    { drag: { threshold: 10 }, eventOptions: { passive: false } }
  );

  // Animation loop – apply inertia damping when not dragging (optional)
  useFrame(() => {
    // nothing needed for now – earth stays static unless user interacts
  });

  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '70vh' }}
        {...bind()}
        frameloop="demand"
      >
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={2} />
        <Suspense fallback={null}>
          <mesh ref={earthRef} geometry={EARTH_GEOM} rotation={[0, Math.PI * 1.2, 0]}>
            <meshStandardMaterial
              map={colorMap}
              roughness={0.7}
              metalness={0.2}
              transparent
            />
          </mesh>
        </Suspense>
      </Canvas>
      {selected && (
        <EarthDetailModal
          point={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
