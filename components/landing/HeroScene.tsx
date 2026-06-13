'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Float,
  Icosahedron,
  MeshDistortMaterial,
  OrbitControls,
  Points,
  PointMaterial,
  Stars,
  Torus,
} from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

const ACCENT = '#22d3ee';
const ACCENT_2 = '#3b82f6';

/* A rotating point cloud distributed across a sphere surface */
function ParticleField() {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 2200;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3.4 + Math.random() * 1.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.04;
      ref.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={ACCENT}
        size={0.025}
        sizeAttenuation
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  );
}

/* The central morphing core */
function Core() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.15;
      group.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={group}>
      <Icosahedron args={[1.35, 6]}>
        <MeshDistortMaterial
          color={ACCENT_2}
          emissive={ACCENT}
          emissiveIntensity={0.4}
          roughness={0.15}
          metalness={0.9}
          distort={0.35}
          speed={1.6}
        />
      </Icosahedron>
      <Icosahedron args={[1.7, 1]}>
        <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.18} />
      </Icosahedron>
    </group>
  );
}

/* Orbiting rings around the core */
function Rings() {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.PI / 3 + Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      ref.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });
  return (
    <group ref={ref}>
      <Torus args={[2.4, 0.012, 16, 120]}>
        <meshBasicMaterial color={ACCENT} transparent opacity={0.5} />
      </Torus>
      <Torus args={[2.9, 0.01, 16, 120]} rotation={[Math.PI / 2.5, 0, 0]}>
        <meshBasicMaterial color={ACCENT_2} transparent opacity={0.35} />
      </Torus>
    </group>
  );
}

/* Small floating geometric shards */
function Shards() {
  const shards = useMemo(
    () =>
      Array.from({ length: 7 }, () => ({
        position: [
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 4 - 1,
        ] as [number, number, number],
        scale: 0.1 + Math.random() * 0.18,
        speed: 1 + Math.random() * 2,
      })),
    []
  );

  return (
    <>
      {shards.map((s, i) => (
        <Float key={i} speed={s.speed} rotationIntensity={2} floatIntensity={2}>
          <mesh position={s.position} scale={s.scale}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? ACCENT : ACCENT_2}
              emissive={i % 2 === 0 ? ACCENT : ACCENT_2}
              emissiveIntensity={0.6}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

/* Subtle parallax driven by pointer position */
function ParallaxRig() {
  const { camera, pointer } = useThree();
  useFrame(() => {
    camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.04;
    camera.position.y += (pointer.y * 0.4 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
      <pointLight position={[-10, -8, -6]} intensity={1.2} color={ACCENT_2} />
      <pointLight position={[0, 0, 4]} intensity={1.5} color={ACCENT} />

      <Core />
      <Rings />
      <Shards />
      <ParticleField />

      <Stars radius={120} depth={60} count={2500} factor={4} saturation={0} fade speed={1} />

      <ParallaxRig />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.4}
        maxPolarAngle={Math.PI / 1.6}
        minPolarAngle={Math.PI / 3}
        enableDamping
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.35} luminanceSmoothing={0.9} intensity={1.1} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
