import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';
import { FlowNode, FlowLink } from '@/lib/math/moneyFlowLayout';

interface MoneyFlowComponentsProps {
  nodes: FlowNode[];
  links: FlowLink[];
  scaleFactor?: number;
}

const COLORS = {
  portfolio: '#3b82f6', // blue-500
  etf: '#8b5cf6', // violet-500
  sector: '#10b981', // emerald-500
  company: '#f59e0b', // amber-500
};

// Base elevation logic
const getNodeElevation = (node: FlowNode) => {
  switch (node.type) {
    case 'portfolio':
      return 18;
    case 'etf':
      return Math.max(0, 18 - (node.ter || 0.2) * 35);
    case 'sector':
    case 'company':
    default:
      return 0;
  }
};

function RenderLink({ link, scaleFactor }: { link: FlowLink; scaleFactor: number }) {
  const sourceNode = link.source as FlowNode;
  const targetNode = link.target as FlowNode;

  const sx = (sourceNode.x1 || 0) * scaleFactor - 25;
  const sz = (link.y0 || 0) * scaleFactor - 15;
  const sy = getNodeElevation(sourceNode);

  const tx = (targetNode.x0 || 0) * scaleFactor - 25;
  const tz = (link.y1 || 0) * scaleFactor - 15;
  const ty = getNodeElevation(targetNode);

  const ribbonWidth = Math.max(0.1, (link.width || 1) * scaleFactor);

  const curve = useMemo(() => {
    const p0 = new THREE.Vector3(sx, sy, sz);
    // Add a microscopic offset to p1 and p2 to prevent collinearity.
    // THREE.ExtrudeGeometry fails with NaN if the curve is perfectly straight.
    const p1 = new THREE.Vector3(sx + (tx - sx) / 2, sy + 0.001, sz + 0.001);
    const p2 = new THREE.Vector3(sx + (tx - sx) / 2, ty - 0.001, tz - 0.001);
    const p3 = new THREE.Vector3(tx, ty, tz);
    return new THREE.CubicBezierCurve3(p0, p1, p2, p3);
  }, [sx, sy, sz, tx, ty, tz]);

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-ribbonWidth / 2, -0.05);
    s.lineTo(ribbonWidth / 2, -0.05);
    s.lineTo(ribbonWidth / 2, 0.05);
    s.lineTo(-ribbonWidth / 2, 0.05);
    s.lineTo(-ribbonWidth / 2, -0.05);
    return s;
  }, [ribbonWidth]);

  const extrudeSettings = useMemo(
    () => ({
      steps: 64,
      bevelEnabled: false,
      extrudePath: curve,
    }),
    [curve]
  );

  return (
    <mesh>
      <extrudeGeometry
        key={`${sx}-${sy}-${sz}-${tx}-${ty}-${tz}-${ribbonWidth}`}
        args={[shape, extrudeSettings]}
      />
      <meshStandardMaterial
        color={COLORS[sourceNode.type as keyof typeof COLORS] || '#888'}
        transparent
        opacity={0.3}
        emissive={COLORS[sourceNode.type as keyof typeof COLORS] || '#888'}
        emissiveIntensity={0.5}
      />
    </mesh>
  );
}

export function MoneyFlowComponents({
  nodes,
  links,
  scaleFactor = 0.05,
}: MoneyFlowComponentsProps) {
  const renderedNodes = nodes.map((node) => {
    const sx = ((node.x0 || 0) + (node.x1 || 0)) / 2;
    const sy = ((node.y0 || 0) + (node.y1 || 0)) / 2;
    const width = ((node.x1 || 0) - (node.x0 || 0)) * scaleFactor;
    const depth = ((node.y1 || 0) - (node.y0 || 0)) * scaleFactor;

    const x = sx * scaleFactor - 25;
    const z = sy * scaleFactor - 15;
    const y = getNodeElevation(node);

    // Height of the block uses a square root scale based on its portfolio weight.
    // This prevents massive aggregates like "Total Portfolio" or "Other Companies" (e.g. 100%)
    // from visually crushing the tiny variations between individual companies (e.g. 0.1% vs 4%).
    // 100% = ~15 units. 5% = ~3.3 units. 1% = 1.5 units. 0.1% = ~0.4 units.
    const height = Math.max(0.1, Math.sqrt(node.value || 0) * 1.5);

    return (
      <group key={node.id} position={[x, y + height / 2, z]}>
        <mesh>
          <boxGeometry key={`${width}-${height}-${depth}`} args={[width, height, depth]} />
          <meshPhysicalMaterial
            color={COLORS[node.type as keyof typeof COLORS] || '#888'}
            transparent
            opacity={0.8}
            roughness={0.2}
            transmission={0.5}
            thickness={1}
          />
        </mesh>
        <Text
          position={[0, height / 2 + 0.5, 0]}
          fontSize={0.8}
          color="white"
          anchorX="center"
          anchorY="middle"
          rotation={[-Math.PI / 4, 0, 0]}
        >
          {node.name}
        </Text>
      </group>
    );
  });

  const springs = useSpring({
    from: { scale: 0.001, position: [0, -20, 0] as [number, number, number] },
    to: { scale: 1, position: [0, 0, 0] as [number, number, number] },
    config: { tension: 100, friction: 20 },
  });

  return (
    <animated.group scale={springs.scale} position={springs.position}>
      {links.map((link) => {
        const sid = typeof link.source === 'object' ? link.source.id : link.source;
        const tid = typeof link.target === 'object' ? link.target.id : link.target;
        return <RenderLink key={`${sid}-${tid}`} link={link} scaleFactor={scaleFactor} />;
      })}
      {renderedNodes}
    </animated.group>
  );
}
