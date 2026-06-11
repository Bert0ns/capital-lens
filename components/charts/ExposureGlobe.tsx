'use client';

import React, { useRef, Suspense, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Play, Pause } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import countryCoordsData from '../../public/static/countries_coordinates.json';
import countryAliasesData from '../../public/static/country_aliases.json';

const BASE_COORDINATES = countryCoordsData as unknown as Record<string, [number, number]>;
const ALIASES = countryAliasesData as Record<string, string>;

function getCoordinates(lat: number, lng: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  // Three.js maps textures such that we typically need a 180 degree offset for standard Equirectangular projections
  // Using 180 aligns the prime meridian (Greenwich) with the correct coordinate axis
  const theta = (lng + 180) * (Math.PI / 180);

  // Spherical to Cartesian coordinates
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

function Pillar({
  name,
  lat,
  lng,
  value,
  maxValue,
}: {
  name: string;
  lat: number;
  lng: number;
  value: number;
  maxValue: number;
}) {
  const radius = 2;
  const pos = getCoordinates(lat, lng, radius);

  const targetHeight = Math.max(0.05, (value / maxValue) * 1.5);
  const targetRatio = value / maxValue;
  const targetDistanceFactor = 4 + targetRatio * 8;

  const groupRef = useRef<THREE.Group>(null);
  const cylinderRef = useRef<THREE.Mesh>(null);
  const labelGroupRef = useRef<THREE.Group>(null);

  const currentHeight = useRef(0.01);

  React.useEffect(() => {
    if (groupRef.current) {
      groupRef.current.lookAt(0, 0, 0);
    }
  }, [pos]);

  useFrame((state, delta) => {
    // Smoothly interpolate the height
    currentHeight.current = THREE.MathUtils.damp(currentHeight.current, targetHeight, 6, delta);

    // Update cylinder scale and position
    if (cylinderRef.current) {
      cylinderRef.current.scale.y = currentHeight.current;
      cylinderRef.current.position.z = -currentHeight.current / 2;
    }

    // Update label position to stay above the pillar
    if (labelGroupRef.current) {
      labelGroupRef.current.position.z = -currentHeight.current - 0.1;
    }
  });

  return (
    <group position={pos} ref={groupRef}>
      {/* Cylinder rotated to align its local Y axis with the group's outward normal (-Z) */}
      <mesh ref={cylinderRef} rotation={[Math.PI / 2, 0, 0]}>
        {/* Base height 1, scale.y will dynamically alter it */}
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
        <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={2.0} />
      </mesh>

      <group ref={labelGroupRef}>
        <Html center distanceFactor={targetDistanceFactor}>
          <div className="px-1.5 py-1 bg-[#020617]/80 backdrop-blur-md border border-amber-500/40 text-amber-400 font-mono text-[7px] leading-tight rounded-sm flex flex-col items-center shadow-none whitespace-nowrap">
            <span className="font-bold tracking-wider uppercase">{name}</span>
            <span className="opacity-80">{value.toFixed(1)}%</span>
          </div>
        </Html>
      </group>
    </group>
  );
}

function GlobeMesh({
  data,
  isRotating,
}: {
  data: { name: string; value: number }[];
  isRotating: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  // Merge duplicates that map to the same country name
  const mergedDataMap: Record<string, number> = {};
  data.forEach((item) => {
    const rawName = item.name.trim();
    const mappedName = ALIASES[rawName] || rawName;

    // Filter out Unione Europea and generic Unknowns
    if (mappedName === 'Unknown' || rawName === 'Unione Europea') return;

    const coords = BASE_COORDINATES[mappedName];
    if (!coords) return; // Skip if no valid coordinates exist

    if (!mergedDataMap[mappedName]) {
      mergedDataMap[mappedName] = 0;
    }
    mergedDataMap[mappedName] += item.value;
  });

  const mergedData = Object.entries(mergedDataMap).map(([name, value]) => ({ name, value }));
  const maxValue = Math.max(...mergedData.map((d) => d.value), 1);

  // Load textures
  const topologyMap = useLoader(THREE.TextureLoader, '/earth-topology.png');

  // Gentle floating rotation applied to the ENTIRE group (Globe + Pillars)
  useFrame(() => {
    if (groupRef.current && isRotating) {
      groupRef.current.rotation.y += 0.001; // Auto-rotate
    }
  });

  return (
    <group ref={groupRef}>
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial
          color="#1e293b" // Slate-800: sophisticated dark grey-blue ocean
          emissiveMap={topologyMap}
          emissive="#22d3ee" // Cyan continents
          emissiveIntensity={0.7} // Toned down from 1.0 to reduce bloom
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

      {/* Data Pillars */}
      {mergedData.map((item, i) => {
        const coords = BASE_COORDINATES[item.name];
        if (!coords) return null;

        return (
          <Pillar
            key={i}
            name={item.name}
            lat={coords[0]}
            lng={coords[1]}
            value={item.value}
            maxValue={maxValue}
          />
        );
      })}
    </group>
  );
}

export function ExposureGlobe({ data }: { data: { name: string; value: number }[] }) {
  const [isRotating, setIsRotating] = useState(true);

  // Calculate true number of mapped unique regions
  const uniqueRegionsCount = new Set(
    data
      .map((d) => ALIASES[d.name.trim()] || d.name.trim())
      .filter((name) => name !== 'Unknown' && name !== 'Unione Europea' && BASE_COORDINATES[name])
  ).size;

  return (
    <Card className="hover:border-primary/50 transition-colors duration-500 border border-white/10 bg-card/40 backdrop-blur-md rounded-none">
      <CardHeader className="pb-2 pt-2">
        <CardTitle className="text-xl font-black uppercase tracking-widest text-white flex items-center gap-3">
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
              <GlobeMesh data={data} isRotating={isRotating} />
            </Suspense>

            <EffectComposer>
              <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={0.8} />
            </EffectComposer>

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
              autoRotate={isRotating}
              autoRotateSpeed={0.5}
              maxPolarAngle={Math.PI / 1.5}
              minPolarAngle={Math.PI / 3}
            />
          </Canvas>

          {/* Overlay UI */}
          <div className="absolute bottom-6 left-6 pointer-events-none flex flex-col gap-3">
            <p className="text-[10px] text-amber-400 font-mono bg-black/40 px-3 py-1.5 border border-amber-500/30 backdrop-blur-md uppercase tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.1)] rounded-sm w-max">
              {uniqueRegionsCount} Regions Active
            </p>
            <button
              onClick={() => setIsRotating(!isRotating)}
              className="pointer-events-auto text-[10px] text-cyan-400 font-mono bg-black/40 px-3 py-1.5 border border-cyan-500/30 backdrop-blur-md uppercase tracking-widest hover:bg-cyan-900/40 transition-colors shadow-[0_0_10px_rgba(34,211,238,0.1)] rounded-sm flex items-center justify-center w-max gap-2"
            >
              {isRotating ? <Pause size={12} /> : <Play size={12} />}
              {isRotating ? 'Pause Rotation' : 'Resume Rotation'}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
