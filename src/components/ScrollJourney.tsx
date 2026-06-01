"use client";

import { useRef, useMemo, Suspense, useState, useEffect, lazy } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture, Stars } from "@react-three/drei";
import { motion, useTransform, MotionValue, useMotionValueEvent } from "framer-motion";
import * as THREE from "three";

// Lazy: the plane (GLB + GLTFLoader) only fetches when the scene actually needs it.
const OrbitingPlane = lazy(() => import("@/components/OrbitingPlane"));

/** Mount the plane component only once Frame 1 is visible. */
function LazyPlane({ sceneOpacity }: { sceneOpacity: MotionValue<number> }) {
  const [active, setActive] = useState(() => sceneOpacity.get() > 0.01);
  useMotionValueEvent(sceneOpacity, "change", (v) => {
    if (v > 0.01) setActive(true);
  });
  if (!active) return null;
  return <OrbitingPlane />;
}

/** Mount the heavy road video only when it actually needs to be visible.
 *  Disables Chrome's auto picture-in-picture so it can't pop out when scrolled. */
function RoadVideo({ opacity }: { opacity: MotionValue<number> }) {
  const [active, setActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  useMotionValueEvent(opacity, "change", (v) => setActive(v > 0.01));
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.disablePictureInPicture = true;
    if (document.pictureInPictureElement === el) {
      document.exitPictureInPicture().catch(() => {});
    }
  }, [active]);
  if (!active) return null;
  return (
    <motion.div style={{ opacity }} className="absolute inset-0 z-[8] pointer-events-none">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        // @ts-expect-error — non-standard but supported by Chromium/Safari
        disableRemotePlayback
        controlsList="nodownload nofullscreen noremoteplayback"
        className="w-full h-full object-cover saturate-[1.1] brightness-[0.95] contrast-[1.1]"
        src="/videos/Temp_road.mp4"
      />
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(0,0,0,0.65)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
    </motion.div>
  );
}

function Earth({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudRef = useRef<THREE.Mesh>(null);
  const earthTexture = useTexture(
    "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg"
  );

  const earthMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: earthTexture,
        roughness: 0.78,
        metalness: 0.05,
        color: new THREE.Color("#ffffff"),
        emissive: new THREE.Color("#0b2a4a"),
        emissiveIntensity: 0.06,
      }),
    [earthTexture]
  );

  // Fresnel atmospheric rim — believable halo glow on the limb
  const atmosphereMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          glowColor: { value: new THREE.Color("#7ab8ff") },
          intensity: { value: 1.15 },
        },
        vertexShader: /* glsl */ `
          varying float vIntensity;
          void main() {
            vec3 vNormal = normalize(normalMatrix * normal);
            vec3 viewDir = normalize(-vec3(modelViewMatrix * vec4(position, 1.0)));
            vIntensity = pow(1.0 - dot(vNormal, viewDir), 2.4);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 glowColor;
          uniform float intensity;
          varying float vIntensity;
          void main() {
            gl_FragColor = vec4(glowColor, 1.0) * vIntensity * intensity;
          }
        `,
      }),
    []
  );

  useFrame((_, delta) => {
    if (!meshRef.current || !cloudRef.current || !groupRef.current) return;
    const scrollVal = scrollYProgress.get();
    // Calm idle spin + tiny scroll-coupled boost (was 1.4 / 1.6 — too fast)
    meshRef.current.rotation.y += delta * 0.12 + scrollVal * delta * 0.25;
    cloudRef.current.rotation.y += delta * 0.14 + scrollVal * delta * 0.28;

    // Gentle parallax: 1.4× → 1.6× across Frame 1 only. No more 60× explosion.
    if (scrollVal <= 0.32) {
      const t = Math.min(scrollVal / 0.28, 1);
      const zoomScale = THREE.MathUtils.lerp(1.4, 1.6, t);
      groupRef.current.scale.setScalar(zoomScale);
    }
  });

  return (
    // Push globe to lower portion of frame (original perfect-feeling position)
    <group ref={groupRef} position={[0, -2.6, 0]}>
      <hemisphereLight args={["#bcd6ff", "#1a1a2e", 0.55]} />
      <directionalLight position={[6, 4, 5]} intensity={3.2} color="#fff2dc" />
      <directionalLight position={[-5, -2, -4]} intensity={0.6} color="#6aa8ff" />

      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 96, 96]} />
        <primitive object={earthMaterial} attach="material" />
      </mesh>

      <mesh ref={cloudRef} scale={1.012}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial
          color="#bcd6ff"
          transparent
          opacity={0.07}
          side={THREE.FrontSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh scale={1.085}>
        <sphereGeometry args={[2, 64, 64]} />
        <primitive object={atmosphereMaterial} attach="material" />
      </mesh>
    </group>
  );
}

export default function ScrollJourney({
  scrollYProgress,
}: {
  scrollYProgress: MotionValue<number>;
}) {
  // ============================================================
  //  THREE FRAMES (no overlap, generous holds, smooth handoffs)
  // ============================================================
  //  FRAME 1  0.00 – 0.32   Globe + Plane + brand wordmark
  //  FRAME 2  0.36 – 0.56   Chapter overlays (Perspective, Streets)
  //  FRAME 3  0.60 – 0.92   Road video + DOMINATE THE SKYLINE hero
  // ============================================================

  // --- FRAME 1 ---
  // Earth + nebula + plane visible. Calm zoom (1.4→ 1.6× in the Earth canvas).
  const sceneOpacity = useTransform(scrollYProgress, (v) => {
    if (v <= 0.28) return 1;
    if (v >= 0.34) return 0;
    return 1 - (v - 0.28) / 0.06;
  });
  const brandOpacity = useTransform(scrollYProgress, (v) => {
    if (v <= 0.22) return 1;
    if (v >= 0.30) return 0;
    return 1 - (v - 0.22) / 0.08;
  });

  // --- FRAME 2 ---
  // Two chapter cards on a clean dark backdrop. No globe, no plane, no video.
  const text1Opacity = useTransform(scrollYProgress, (v) => {
    if (v <= 0.36 || v >= 0.46) return 0;
    if (v < 0.39) return (v - 0.36) / 0.03;
    if (v < 0.43) return 1;
    return 1 - (v - 0.43) / 0.03;
  });
  const text2Opacity = useTransform(scrollYProgress, (v) => {
    if (v <= 0.46 || v >= 0.56) return 0;
    if (v < 0.49) return (v - 0.46) / 0.03;
    if (v < 0.53) return 1;
    return 1 - (v - 0.53) / 0.03;
  });
  // Dark backdrop stays from end of Frame 1 through Frame 2 so chapters
  // never sit on the white page background.
  const darkBackdrop = useTransform(scrollYProgress, (v) => {
    if (v <= 0.30) return 0;
    if (v < 0.34) return (v - 0.30) / 0.04;
    if (v < 0.58) return 1;
    if (v < 0.62) return 1 - (v - 0.58) / 0.04;
    return 0;
  });

  // --- FRAME 3 ---
  // The road video + DOMINATE THE SKYLINE hero now live inside the hero
  // <section> in page.tsx so they're guaranteed to render when the hero
  // scrolls into view. Keep these MotionValues as no-ops so the existing
  // letterbox / video plumbing stays inert.
  const videoOpacity = useTransform(scrollYProgress, () => 0);
  const letterboxSize = useTransform(scrollYProgress, () => "0%");

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#050818]">
      {/* Letterbox (cinematic black bars during road sequence) */}
      <motion.div
        style={{ height: letterboxSize }}
        className="absolute top-0 left-0 right-0 bg-black z-[45]"
      />
      <motion.div
        style={{ height: letterboxSize }}
        className="absolute bottom-0 left-0 right-0 bg-black z-[45]"
      />

      {/* Nebula backdrop (CSS, behind the canvas) */}
      <motion.div style={{ opacity: sceneOpacity }} className="absolute inset-0 z-[5]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 35%, #1b2a55 0%, #0f1a3a 38%, #0a1130 62%, #050818 100%)",
          }}
        />
        <div
          className="absolute inset-0 mix-blend-screen opacity-50"
          style={{
            background:
              "radial-gradient(28% 18% at 18% 26%, rgba(0,113,227,0.22), transparent 75%), radial-gradient(26% 18% at 82% 26%, rgba(92,96,245,0.20), transparent 75%), radial-gradient(50% 30% at 50% 92%, rgba(227,0,82,0.18), transparent 70%)",
          }}
        />
      </motion.div>

      {/* 3D Scene */}
      <motion.div style={{ opacity: sceneOpacity }} className="absolute inset-0 z-10">
        <Canvas
          camera={{ position: [0, 0, 10], fov: 45 }}
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <Stars
              radius={140}
              depth={60}
              count={6000}
              factor={4}
              saturation={0.3}
              fade
              speed={0.6}
            />
            <ambientLight intensity={0.25} />
            <Earth scrollYProgress={scrollYProgress} />
            <LazyPlane sceneOpacity={sceneOpacity} />
          </Suspense>
        </Canvas>
      </motion.div>

      {/* Brand mark — centered, gently glowing */}
      <motion.div
        style={{ opacity: brandOpacity }}
        className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
      >
        <div className="text-center px-4">
          <div className="text-[10px] md:text-xs font-bold tracking-[0.55em] uppercase text-white/70 mb-3 drop-shadow-[0_0_18px_rgba(122,184,255,0.5)]">
            Presenting
          </div>
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-none"
            style={{
              textShadow:
                "0 0 28px rgba(122,184,255,0.45), 0 0 64px rgba(92,96,245,0.35)",
            }}
          >
            FRIENDS
            <br />
            <span className="bg-gradient-to-r from-[#7ab8ff] via-[#9d9dff] to-[#ff8fb1] bg-clip-text text-transparent">
              ADVERTISING
            </span>
          </h1>
          <div className="mt-5 text-xs md:text-sm font-semibold tracking-[0.35em] uppercase text-white/60">
            Be Seen Everywhere
          </div>
        </div>
      </motion.div>

      {/* Dim scrim that covers Frames 2 \u2192 3 so the chapters and the road
          video both sit on a deep backdrop instead of the white page. */}
      <motion.div
        style={{ opacity: darkBackdrop }}
        className="absolute inset-0 z-[6] pointer-events-none bg-[#050818]"
      />

      {/* Scroll-triggered cinematic text overlays */}
      <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
        <motion.div style={{ opacity: text1Opacity }} className="text-center px-4 absolute">
          <div className="text-[10px] md:text-xs font-bold tracking-[0.5em] uppercase text-[#7ab8ff]/90 mb-4">
            Chapter 01
          </div>
          <h2
            className="text-4xl md:text-7xl font-black tracking-tight text-white mb-4 leading-[0.95]"
            style={{ textShadow: "0 4px 40px rgba(0,0,0,0.6), 0 0 30px rgba(122,184,255,0.35)" }}
          >
            A New <span className="text-[#7ab8ff]">Perspective.</span>
          </h2>
          <h3 className="text-xs md:text-sm font-bold tracking-[0.35em] uppercase text-white/65">
            For Outdoor Advertising
          </h3>
        </motion.div>

        <motion.div style={{ opacity: text2Opacity }} className="text-center px-4 absolute">
          <div className="text-[10px] md:text-xs font-bold tracking-[0.5em] uppercase text-[#c9b3ff]/90 mb-4">
            Chapter 02
          </div>
          <h2
            className="text-4xl md:text-7xl font-black tracking-tight text-white mb-4 leading-[0.95]"
            style={{ textShadow: "0 4px 40px rgba(0,0,0,0.6), 0 0 30px rgba(201,179,255,0.35)" }}
          >
            Hitting the <span className="text-[#c9b3ff]">Streets.</span>
          </h2>
          <h3 className="text-xs md:text-sm font-bold tracking-[0.35em] uppercase text-white/65">
            Converting campaigns into experiences
          </h3>
        </motion.div>
      </div>

      {/* Frame 3 \u2014 road / streets video full-frame */}
      <RoadVideo opacity={videoOpacity} />
    </div>
  );
}
