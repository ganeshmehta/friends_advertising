"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const DEFAULT_POINT_COUNT = 3000;

/**
 * Deterministic Lehmer LCG — gives the same point distribution on every render
 * (so the cloud is stable across hydration/re-renders) without depending on the
 * impure `Math.random`, which the React purity lint correctly flags.
 */
function makeRng(seed: number) {
  let state = seed | 0 || 1;
  return () => {
    state = (state * 48271) % 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function buildCloud(count: number): {
  positions: Float32Array;
  colors: Float32Array;
} {
  const p = new Float32Array(count * 3);
  const c = new Float32Array(count * 3);
  const colorGen = new THREE.Color();
  const rng = makeRng(0x1f3a7c);

  for (let i = 0; i < count; i++) {
    const radius = 20 + rng() * 40;
    const theta = rng() * 2 * Math.PI;
    const y = (rng() - 0.5) * 20;

    p[i * 3] = radius * Math.cos(theta);
    p[i * 3 + 1] = y;
    p[i * 3 + 2] = radius * Math.sin(theta);

    // Light-theme palette: neon-blue (#0071e3) + neon-purple (#5c60f5) + soft accent
    const mix = rng();
    if (mix > 0.7) {
      colorGen.setHex(0x0071e3); // Apple-blue
    } else if (mix > 0.4) {
      colorGen.setHex(0x5c60f5); // Indigo-purple
    } else {
      colorGen.setHex(0xa1c4ff); // Soft sky
    }

    c[i * 3] = colorGen.r;
    c[i * 3 + 1] = colorGen.g;
    c[i * 3 + 2] = colorGen.b;
  }
  return { positions: p, colors: c };
}

function PointsCloud({ count = 2200 }) {
  const pointsRef = useRef<THREE.Points>(null);

  // Pre-built BufferAttribute instances satisfy the strict @react-three/fiber
  // v9 typings (which require `args` on the JSX form) and avoid re-allocating
  // typed arrays on every render.
  const { positionAttr, colorAttr } = useMemo(() => {
    const { positions, colors } = buildCloud(count);
    return {
      positionAttr: new THREE.BufferAttribute(positions, 3),
      colorAttr: new THREE.BufferAttribute(colors, 3),
    };
  }, [count]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 2;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <primitive attach="attributes-position" object={positionAttr} />
        <primitive attach="attributes-color" object={colorAttr} />
      </bufferGeometry>
      <pointsMaterial
        size={0.18}
        vertexColors
        transparent
        opacity={0.55}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function CityLightsBackground() {
  return (
    <div className="absolute inset-0 z-0 opacity-90">
      <Canvas camera={{ position: [0, 5, 20], fov: 60 }}>
        {/* Light fog tinted toward page background so particles fade gracefully */}
        <fog attach="fog" args={["#f5f5f7", 20, 60]} />
        <PointsCloud count={DEFAULT_POINT_COUNT} />
      </Canvas>
      {/* Soft vignette and bottom fade keep particles from dominating the page */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(255,255,255,0.7)_100%)] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--background)] to-transparent pointer-events-none" />
    </div>
  );
}
