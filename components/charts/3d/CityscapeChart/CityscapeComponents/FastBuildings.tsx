/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PlacedBuilding } from '@/components/charts/3d/CityscapeChart/CityscapeLayout';

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

const MAX_BUILDINGS = 5000;

function updateSkyscraper(skyRef: THREE.InstancedMesh, curr: any, color: string, index: number) {
  tempObject.position.set(curr.x, curr.y, curr.depth / 2);
  tempObject.scale.set(curr.size, curr.size, curr.depth);
  tempObject.updateMatrix();
  skyRef.setMatrixAt(index, tempObject.matrix);
  tempColor.set(color).multiplyScalar(curr.emissive);
  skyRef.setColorAt(index, tempColor);
}

function updateWireframe(
  wireRef: THREE.InstancedMesh,
  curr: any,
  color: string,
  index: number,
  isHovered: boolean
) {
  tempObject.position.set(curr.x, curr.y, curr.depth / 2);
  tempObject.scale.set(curr.size + 0.01, curr.size + 0.01, curr.depth + 0.01);
  tempObject.updateMatrix();
  wireRef.setMatrixAt(index, tempObject.matrix);
  wireRef.setColorAt(index, tempColor.set(color).multiplyScalar(isHovered ? 5.0 : 0.4));
}

function updatePlaza(plazaRef: THREE.InstancedMesh, curr: any, color: string, index: number) {
  tempObject.position.set(curr.x, curr.y, 0.05);
  tempObject.scale.set(curr.size + 0.3, curr.size + 0.3, 1);
  tempObject.updateMatrix();
  plazaRef.setMatrixAt(index, tempObject.matrix);
  plazaRef.setColorAt(index, tempColor.set(color));
}

function triggerNeedsUpdate(
  skyRef: THREE.InstancedMesh | null,
  wireRef: THREE.InstancedMesh | null,
  plazaRef: THREE.InstancedMesh | null
) {
  if (skyRef) {
    skyRef.instanceMatrix.needsUpdate = true;
    if (skyRef.instanceColor) skyRef.instanceColor.needsUpdate = true;
  }
  if (wireRef) {
    wireRef.instanceMatrix.needsUpdate = true;
    if (wireRef.instanceColor) wireRef.instanceColor.needsUpdate = true;
  }
  if (plazaRef) {
    plazaRef.instanceMatrix.needsUpdate = true;
    if (plazaRef.instanceColor) plazaRef.instanceColor.needsUpdate = true;
  }
}

export function FastBuildings({
  buildings,
  hoveredBuilding,
  setHoveredBuilding,
}: {
  buildings: PlacedBuilding[];
  hoveredBuilding: PlacedBuilding | null;
  setHoveredBuilding: (b: PlacedBuilding | null) => void;
}) {
  const count = buildings.length;

  const skyRef = useRef<THREE.InstancedMesh>(null);
  const wireRef = useRef<THREE.InstancedMesh>(null);
  const plazaRef = useRef<THREE.InstancedMesh>(null);

  // Preserve animation state across renders and re-ordering
  const animStates = useRef<
    Map<string, { x: number; y: number; size: number; depth: number; emissive: number }>
  >(new Map());

  // Dynamically update the active draw count without remounting the buffers
  React.useLayoutEffect(() => {
    const activeCount = Math.min(count, MAX_BUILDINGS);
    if (skyRef.current) skyRef.current.count = activeCount;
    if (wireRef.current) wireRef.current.count = activeCount;
    if (plazaRef.current) plazaRef.current.count = activeCount;
  }, [count]);

  useFrame((state, delta) => {
    // Framerate-independent lerp factor (similar to a spring)
    const factor = 1 - Math.exp(-15 * delta);
    let needsUpdate = false;

    for (let i = 0; i < Math.min(buildings.length, MAX_BUILDINGS); i++) {
      const b = buildings[i];
      let curr = animStates.current.get(b.name);
      if (!curr) {
        curr = { x: b.x, y: b.y, size: b.size, depth: b.depth, emissive: 0.3 };
        animStates.current.set(b.name, curr);
      }

      const isHovered = hoveredBuilding?.name === b.name;
      const targetEmissive = isHovered ? 3.5 : 0.6;

      curr.x = THREE.MathUtils.lerp(curr.x, b.x, factor);
      curr.y = THREE.MathUtils.lerp(curr.y, b.y, factor);
      curr.size = THREE.MathUtils.lerp(curr.size, b.size, factor);
      curr.depth = THREE.MathUtils.lerp(curr.depth, b.depth, factor);
      curr.emissive = THREE.MathUtils.lerp(curr.emissive, targetEmissive, factor);

      // --- Skyscraper ---
      if (skyRef.current) updateSkyscraper(skyRef.current, curr, b.color, i);

      // --- Wireframe ---
      if (wireRef.current) updateWireframe(wireRef.current, curr, b.color, i, isHovered);

      // --- Plaza Foundation ---
      if (plazaRef.current) updatePlaza(plazaRef.current, curr, b.color, i);

      needsUpdate = true;
    }

    if (needsUpdate) {
      triggerNeedsUpdate(skyRef.current, wireRef.current, plazaRef.current);
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    if (e.instanceId !== undefined && e.instanceId < count) {
      setHoveredBuilding(buildings[e.instanceId]);
    }
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setHoveredBuilding(null);
  };

  return (
    <group>
      <instancedMesh ref={plazaRef} args={[null as any, null as any, MAX_BUILDINGS]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial opacity={0.08} transparent depthWrite={false} />
      </instancedMesh>

      <instancedMesh
        ref={skyRef}
        args={[null as any, null as any, MAX_BUILDINGS]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.9} roughness={0.1} toneMapped={false} />
      </instancedMesh>

      <instancedMesh ref={wireRef} args={[null as any, null as any, MAX_BUILDINGS]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial wireframe transparent opacity={0.6} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
