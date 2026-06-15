import React from 'react';
import { useSpring, a } from '@react-spring/three';

export function AnimatedGround({ width, height }: { width: number; height: number }) {
  const { scaleX, scaleY } = useSpring({
    scaleX: width + 30,
    scaleY: height + 30,
    config: { mass: 1, tension: 100, friction: 20 },
  });

  return (
    <a.mesh position={[0, 0, -0.5]} scale-x={scaleX} scale-y={scaleY} scale-z={1}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial color="#09090b" />
    </a.mesh>
  );
}
