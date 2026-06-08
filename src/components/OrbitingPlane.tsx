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

    /** Apply our standard post-processing to the loaded scene graph. */
    const adoptGltf = (gltf: { scene: THREE.Group }) => {
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
    };

    // Fast path: SiteLoader already fetched + parsed the GLB and parked the
    // promise on window. Skip a second round-trip entirely.
    type WindowWithPlaneCache = Window & {
      __planeGLTFPromise?: Promise<{ scene: THREE.Group }>;
    };
    const warm = (window as WindowWithPlaneCache).__planeGLTFPromise;
    if (warm) {
      warm
        .then((gltf) => adoptGltf(gltf))
        .catch((err) => console.warn("[OrbitingPlane] warm cache failed:", err));
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
    }

    const startLoad = () => {
      if (cancelled) return;
      import("three/examples/jsm/loaders/GLTFLoader.js")
        .then(({ GLTFLoader }) => {
          if (cancelled) return;
          const loader = new GLTFLoader();
          loader.load(
            url,
            (gltf) => adoptGltf(gltf as { scene: THREE.Group }),
            undefined,
            (err) => console.warn("[OrbitingPlane] model failed:", err)
          );
        })
        .catch((err) => console.warn("[OrbitingPlane] loader import failed:", err));
    };

    // Defer GLB fetch + GLTFLoader import to browser idle time so it never
    // competes with the initial paint. Falls back to a short timeout on
    // browsers without requestIdleCallback (Safari).
    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const w = window as IdleWindow;
    let idleHandle: number | null = null;
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
    if (typeof w.requestIdleCallback === "function") {
      idleHandle = w.requestIdleCallback(startLoad, { timeout: 1500 });
    } else {
      timeoutHandle = setTimeout(startLoad, 300);
    }

    return () => {
      cancelled = true;
      if (idleHandle !== null && typeof w.cancelIdleCallback === "function") {
        w.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== null) clearTimeout(timeoutHandle);
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

  // No placeholder geometry while the GLB is still loading or if it fails —
  // showing an obviously-broken cone+box was worse than showing nothing.
  // The plane simply pops in once the real model is ready.
  return null;
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

