"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  /** Where the path starts in world X (off-screen left by default) */
  startX?: number;
  /** Where the path ends in world X (off-screen right) */
  endX?: number;
  /** Vertical center of the path */
  centerY?: number;
  /** Vertical sag/rise of the gentle curve */
  curveAmount?: number;
  /** Distance from camera plane (smaller = closer / bigger on screen) */
  depth?: number;
  /** Seconds for a single left→right pass before looping */
  duration?: number;
  modelUrl?: string;
  /** Multiplier on the auto-normalized plane size */
  scale?: number;
  /** Manual rotation fix-up in case the GLB's nose doesn't point along -Z */
  modelRotation?: [number, number, number];
  /** Auto-fit target size for the model's longest axis */
  targetSize?: number;
};

// Reusable temp vectors (avoid per-frame allocation)
const POS = new THREE.Vector3();
const LOOK = new THREE.Vector3();
const WORLD_UP = new THREE.Vector3(0, 1, 0);

function PlaneModel({
  url,
  scale,
  modelRotation,
  targetSize,
}: {
  url: string;
  scale: number;
  modelRotation: [number, number, number];
  targetSize: number;
}) {
  const [scene, setScene] = useState<THREE.Group | null>(null);
  const [fit, setFit] = useState(1);

  useEffect(() => {
    let cancelled = false;
    let disposed: THREE.Object3D | null = null;
    import("three/examples/jsm/loaders/GLTFLoader.js")
      .then(({ GLTFLoader }) => {
        const loader = new GLTFLoader();
        loader.load(
          url,
          (gltf) => {
            if (cancelled) return;
            const obj = gltf.scene;

            const box = new THREE.Box3().setFromObject(obj);
            const size = new THREE.Vector3();
            const center = new THREE.Vector3();
            box.getSize(size);
            box.getCenter(center);
            obj.position.sub(center);

            const longest = Math.max(size.x, size.y, size.z) || 1;
            setFit(targetSize / longest);

            obj.traverse((node) => {
              const m = node as THREE.Mesh;
              if (m.isMesh) {
                m.castShadow = false;
                m.receiveShadow = false;
                m.frustumCulled = false;
                const mats = Array.isArray(m.material) ? m.material : [m.material];
                mats.forEach((mat) => {
                  const std = mat as THREE.MeshStandardMaterial;
                  if (std && std.isMeshStandardMaterial) {
                    std.envMapIntensity = 1.1;
                    std.roughness = Math.min(0.85, (std.roughness ?? 0.6) + 0.1);
                  }
                });
              }
            });
            disposed = obj;
            setScene(obj);
          },
          undefined,
          (err) => console.warn("[OrbitingPlane] model failed:", err)
        );
      })
      .catch((err) => console.warn("[OrbitingPlane] loader import failed:", err));
    return () => {
      cancelled = true;
      if (disposed) {
        disposed.traverse((node) => {
          const m = node as THREE.Mesh;
          if (m.geometry) m.geometry.dispose();
          if (m.material) {
            const mat = m.material as THREE.Material | THREE.Material[];
            if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
            else mat.dispose();
          }
        });
      }
    };
  }, [url, targetSize]);

  if (scene) {
    return (
      <group rotation={modelRotation} scale={fit * scale}>
        <primitive object={scene} />
      </group>
    );
  }

  return (
    <group scale={scale * 0.6} rotation={[0, Math.PI / 2, 0]}>
      <mesh>
        <coneGeometry args={[0.18, 0.7, 14]} />
        <meshStandardMaterial color="#ffffff" metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh position={[-0.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.05, 0.9, 0.16]} />
        <meshStandardMaterial color="#0071e3" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

export default function OrbitingPlane({
  /** Where the path starts (off-screen left by default) */
  startX = -6,
  /** Where the path ends (off-screen right) */
  endX = 6,
  /** Vertical center of the path */
  centerY = 0.6,
  /** Vertical sag/rise of the gentle curve (positive = arcs upward in the middle) */
  curveAmount = 0.6,
  /** Distance from camera plane */
  depth = 4.2,
  /** Seconds for a single left→right pass */
  duration = 14,
  modelUrl = "/models/plane/source/LooL.glb",
  scale = 1,
  // GLB's local +Y is the nose, local +Z is the top. To get the standard
  // side-profile view (top-up, nose along world -Z forward direction):
  //   rotate -90° on X: +Y → -Z (nose forward) and +Z → +Y (top up).
  // Extra +90° on X (net 0 on X) keeps the orientation but rolls onto the
  // side — applied here per request.
  modelRotation = [0, 0, Math.PI / 6],
  targetSize = 1.8,
}: Props) {
  const planeRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!planeRef.current) return;
    const period = duration;
    // Normalized progress 0 → 1, then wraps
    const u = (state.clock.getElapsedTime() % period) / period;

    // X: linear sweep from startX to endX
    const x = startX + (endX - startX) * u;
    // Y: gentle parabolic arc — highest in the middle, even at the ends
    // 4·u·(1-u) is a parabola that's 0 at u=0,1 and 1 at u=0.5
    const y = centerY + curveAmount * (4 * u * (1 - u) - 0.5);
    POS.set(x, y, depth);

    // Look-ahead point along the path for forward orientation
    const ahead = Math.min(1, u + 0.02);
    const xA = startX + (endX - startX) * ahead;
    const yA = centerY + curveAmount * (4 * ahead * (1 - ahead) - 0.5);
    LOOK.set(xA, yA, depth);

    planeRef.current.position.copy(POS);
    // Standard side-profile view: top stays UP (world +Y).
    planeRef.current.up.copy(WORLD_UP);
    planeRef.current.lookAt(LOOK);
  });

  return (
    <group ref={planeRef}>
      <PlaneModel
        url={modelUrl}
        scale={scale}
        modelRotation={modelRotation}
        targetSize={targetSize}
      />
    </group>
  );
}

