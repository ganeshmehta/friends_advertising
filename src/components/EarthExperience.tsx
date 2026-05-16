import { Canvas, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useRef } from 'react';
import { OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Shared geometry
const EARTH_GEOM = new THREE.SphereGeometry(2, 64, 64);

function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);

  // Load textures
  const [earthMap, borderMap] = useTexture([
    '/textures/earth_day.jpg',
    '/textures/earth_gold_boundaries.png'
  ]);

  // Slow auto rotation
  useEffect(() => {
    let frame: number;

    const animate = () => {
      if (earthRef.current) {
        earthRef.current.rotation.y += 0.0015;
      }

      frame = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      {/* Main Earth */}
      <mesh ref={earthRef} geometry={EARTH_GEOM}>
        <meshStandardMaterial
          map={earthMap}
          roughness={0.8}
          metalness={0.15}
        />
      </mesh>

      {/* Golden boundary overlay */}
      <mesh
        geometry={EARTH_GEOM}
        scale={[1.003, 1.003, 1.003]}
      >
        <meshBasicMaterial
          map={borderMap}
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh
        geometry={EARTH_GEOM}
        scale={[1.08, 1.08, 1.08]}
      >
        <shaderMaterial
          transparent
          side={THREE.BackSide}
          uniforms={{
            glowColor: {
              value: new THREE.Color('#f6c453')
            },
            viewVector: {
              value: new THREE.Vector3(0, 0, 5)
            }
          }}
          vertexShader={`
            uniform vec3 viewVector;
            varying float intensity;

            void main() {
              vec3 vNormal = normalize(normalMatrix * normal);
              vec3 vNormel = normalize(normalMatrix * viewVector);

              intensity = pow(0.7 - dot(vNormal, vNormel), 4.0);

              gl_Position = projectionMatrix *
                            modelViewMatrix *
                            vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 glowColor;
            varying float intensity;

            void main() {
              vec3 glow = glowColor * intensity;

              gl_FragColor = vec4(glow, 1.0);
            }
          `}
        />
      </mesh>
    </>
  );
}

function CameraSetup() {
  const { camera } = useThree();

  useEffect(() => {
    // Focus near India initially
    const phi = THREE.MathUtils.degToRad(90 - 20);
    const theta = THREE.MathUtils.degToRad(78 + 180);

    const radius = 5;

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
  }, []);

  return null;
}

export default function EarthExperience() {
  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        background: 'black'
      }}
    >
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 50
        }}
        gl={{
          antialias: true,
          alpha: true
        }}
      >
        {/* Camera setup */}
        <CameraSetup />

        {/* Lights */}
        <ambientLight intensity={0.5} />

        <directionalLight
          position={[5, 3, 5]}
          intensity={2}
        />

        <pointLight
          position={[-5, -3, -5]}
          intensity={1}
          color="#f6c453"
        />

        {/* Stars background */}
        <Suspense fallback={null}>
          <Earth />
        </Suspense>

        {/* Controls */}
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={10}
          rotateSpeed={0.6}
          zoomSpeed={0.8}
        />
      </Canvas>
    </div>
  );
}