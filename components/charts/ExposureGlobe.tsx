'use client';

import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';

function GlobeMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Load textures
  const topologyMap = useLoader(THREE.TextureLoader, '/earth-topology.png');

  // Gentle floating rotation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group>
      <Sphere ref={meshRef} args={[2, 64, 64]}>
        <meshStandardMaterial
          color="#1e293b" // Slate-800: sophisticated dark grey-blue ocean
          emissiveMap={topologyMap}
          emissive="#22d3ee" // Cyan continents
          emissiveIntensity={1.0} // Toned down from 1.2
          bumpMap={topologyMap}
          bumpScale={0.03} // Toned down bump scale slightly
          roughness={0.7} // More matte finish
          metalness={0.3}
        />
      </Sphere>

      {/* Atmosphere Outer Glow */}
      <Sphere args={[2.05, 64, 64]}>
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.04} // Toned down the outer blue glow
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
    </group>
  );
}

export function ExposureGlobe({ data }: { data: { name: string; value: number }[] }) {
  return (
    <Card className="hover:border-primary/50 transition-colors duration-500 border border-white/10 bg-card/40 backdrop-blur-md rounded-none">
      <CardHeader className="pb-2 pt-6">
        <CardTitle className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-3">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]"></div>
          Interactive Global Exposure
        </CardTitle>
        <CardDescription className="text-slate-400 font-light tracking-wide">
          A high-tech visualization of your geographic asset distribution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[450px] w-full relative border border-white/5 bg-[#030712] overflow-hidden">
          <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={2.0} color="#ffffff" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />

            {/* Wrap the globe in Suspense while textures load */}
            <Suspense fallback={null}>
              <GlobeMesh />
            </Suspense>

            <Stars
              radius={100}
              depth={50}
              count={3000}
              factor={3}
              saturation={0}
              fade
              speed={1.5}
            />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={0.5}
              maxPolarAngle={Math.PI / 1.5}
              minPolarAngle={Math.PI / 3}
            />
          </Canvas>

          <div className="absolute bottom-6 left-6 pointer-events-none">
            <div className="flex flex-col gap-2">
              <p className="text-xs text-primary font-mono bg-primary/10 px-3 py-1.5 border border-primary/20 backdrop-blur-sm uppercase tracking-widest">
                SYSTEM_ONLINE
              </p>
              <p className="text-xs text-slate-300 font-mono bg-white/5 px-3 py-1.5 border border-white/10 backdrop-blur-sm uppercase tracking-widest">
                {data.length} Regions Active
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
