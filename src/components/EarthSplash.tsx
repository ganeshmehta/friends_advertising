"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  Stars,
  useTexture,
} from "@react-three/drei";

import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";

import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

// ======================
// EARTH
// ======================

function PremiumEarth() {
  const earthRef = useRef<THREE.Mesh>(null);

  // TEXTURES
  const [earthMap, bumpMap, specMap] = useTexture([
    "/textures/earth_day.jpg",
    "/textures/earth_bump.jpg",
    "/textures/earth_spec.jpg",
  ]);

  // CONSTANT SCALE VECTOR
  const atmosphereScale = useMemo(
    () => new THREE.Vector3(1.08, 1.08, 1.08),
    []
  );

  // SMOOTH ROTATION
  useFrame((_, delta) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group>
      {/* ======================
          MAIN EARTH
      ====================== */}

      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 128, 128]} />

        <meshStandardMaterial
          map={earthMap}
          bumpMap={bumpMap}
          bumpScale={0.04}
          metalness={0.15}
          roughness={0.7}
          emissive="#112244"
          emissiveIntensity={0.18}
        />
      </mesh>

      {/* ======================
          GOLDEN COASTLINE GLOW
      ====================== */}

      <mesh scale={[1.003, 1.003, 1.003]}>
        <sphereGeometry args={[2, 128, 128]} />

        <meshStandardMaterial
          map={specMap}
          color="#f6c453"
          emissive="#f6c453"
          emissiveIntensity={2}
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* ======================
          ATMOSPHERE GLOW
      ====================== */}

      <mesh scale={atmosphereScale}>
        <sphereGeometry args={[2, 128, 128]} />

        <shaderMaterial
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
          transparent
          uniforms={{
            glowColor: {
              value: new THREE.Color("#4fa3ff"),
            },
          }}
          vertexShader={`
            varying vec3 vNormal;

            void main() {
              vNormal = normalize(normalMatrix * normal);

              gl_Position =
                projectionMatrix *
                modelViewMatrix *
                vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec3 vNormal;
            uniform vec3 glowColor;

            void main() {

              float intensity =
                pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);

              gl_FragColor =
                vec4(glowColor * intensity, intensity);
            }
          `}
        />
      </mesh>
    </group>
  );
}

// ======================
// MAIN COMPONENT
// ======================

export default function PremiumEarthScene() {
  return (
    <div className="w-full h-screen bg-black">
      {/* BACKGROUND GLOW */}
      <div className="absolute inset-0 bg-blue-500/10 blur-[180px]" />

      <Canvas
        camera={{
          position: [0, 0, 5.5],
          fov: 45,
        }}
        gl={{
          antialias: true,
          alpha: true,
        }}
      >
        {/* ======================
            BACKGROUND COLOR
        ====================== */}

        <color attach="background" args={["#020817"]} />

        {/* ======================
            CINEMATIC LIGHTING
        ====================== */}

        <ambientLight intensity={1.8} />

        <directionalLight
          position={[5, 3, 5]}
          intensity={5}
          color="#ffffff"
        />

        <pointLight
          position={[10, 10, 10]}
          intensity={7}
          color="#4fa3ff"
        />

        <pointLight
          position={[-10, -5, -10]}
          intensity={3}
          color="#f6c453"
        />

        {/* ======================
            HDR ENVIRONMENT
        ====================== */}

        <Suspense fallback={null}>
          <Environment preset="sunset" />
        </Suspense>

        {/* ======================
            STARS
        ====================== */}

        <Stars
          radius={100}
          depth={60}
          count={5000}
          factor={4}
          fade
          speed={0.5}
        />

        {/* ======================
            EARTH
        ====================== */}

        <Suspense fallback={null}>
          <PremiumEarth />
        </Suspense>

        {/* ======================
            CAMERA CONTROLS
        ====================== */}

        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={10}
          rotateSpeed={0.5}
          zoomSpeed={0.7}
          autoRotate={false}
        />

        {/* ======================
            POST PROCESSING
        ====================== */}

        <EffectComposer>
          {/* CINEMATIC BLOOM */}
          <Bloom
            intensity={1.4}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
          />

          {/* PREMIUM EDGE DARKENING */}
          <Vignette
            eskil={false}
            offset={0.15}
            darkness={1.2}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}