"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function PointsCloud({ count = 2200 }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const p = new Float32Array(count * 3);
    const c = new Float32Array(count * 3);
    const colorGen = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const radius = 20 + Math.random() * 40;
      const theta = Math.random() * 2 * Math.PI;
      const y = (Math.random() - 0.5) * 20;

      p[i * 3] = radius * Math.cos(theta);
      p[i * 3 + 1] = y;
      p[i * 3 + 2] = radius * Math.sin(theta);

      // Light-theme palette: neon-blue (#0071e3) + neon-purple (#5c60f5) + soft accent
      const mix = Math.random();
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
    return [p, c];
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
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
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
        <PointsCloud count={3000} />
      </Canvas>
      {/* Soft vignette and bottom fade keep particles from dominating the page */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(255,255,255,0.7)_100%)] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--background)] to-transparent pointer-events-none" />
    </div>
  );
}
