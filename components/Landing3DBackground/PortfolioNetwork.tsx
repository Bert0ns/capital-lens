import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generateNetworkGeometry } from './geometry';

export function PortfolioNetwork({
  theme,
  mouseRef,
}: {
  theme: string;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const isDark = theme === 'theme-cyberpunk';

  const NODE_COUNT = 300;
  const RADIUS = 12;

  // Pre-calculate the network geometry once
  const { positionsArray, lineGeometry } = useMemo(
    () => generateNetworkGeometry(NODE_COUNT, RADIUS),
    []
  );

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (groupRef.current) {
      // Glacial majestic rotation
      groupRef.current.rotation.y = time * 0.003;
      groupRef.current.rotation.z = Math.sin(time * 0.002) * 0.03;

      // Smooth Mouse Parallax (Rotation)
      const targetX = (mouseRef.current.y * Math.PI) / 12;
      const targetY = (mouseRef.current.x * Math.PI) / 12;

      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.008;
      groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.008;

      // Smooth Mouse Parallax (Horizontal & Vertical Movement)
      const targetPosX = mouseRef.current.x * 1.5;
      const targetPosY = mouseRef.current.y * 1.5;

      groupRef.current.position.x += (targetPosX - groupRef.current.position.x) * 0.008;
      groupRef.current.position.y += (targetPosY - groupRef.current.position.y) * 0.008;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Network Nodes (Assets) */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positionsArray, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={isDark ? '#22d3ee' : '#3b82f6'}
          size={0.12}
          transparent
          opacity={isDark ? 0.9 : 0.7}
          sizeAttenuation
        />
      </points>

      {/* Network Connections (Correlations) */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          color={isDark ? '#8b5cf6' : '#94a3b8'}
          transparent
          opacity={isDark ? 0.25 : 0.15}
        />
      </lineSegments>
    </group>
  );
}
