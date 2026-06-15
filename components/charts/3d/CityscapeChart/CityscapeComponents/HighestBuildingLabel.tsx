import React from 'react';
import { Html } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { PlacedBuilding } from '@/components/charts/3d/CityscapeChart/CityscapeLayout';

export function HighestBuildingLabel({ b, isHovered }: { b: PlacedBuilding; isHovered: boolean }) {
  const { x, y, depth } = useSpring({
    x: b.x,
    y: b.y,
    depth: b.depth,
    config: { mass: 1, tension: 170, friction: 26 },
  });

  return (
    <a.group position-x={x} position-y={y} position-z={depth}>
      <Html center zIndexRange={[100, 0]} className="pointer-events-none">
        <div
          className={`flex flex-col items-center pb-4 transition-all duration-500 cursor-default ${
            isHovered ? 'opacity-100 scale-125' : 'opacity-40 scale-100'
          }`}
        >
          <div className="text-[7px] md:text-[8px] font-medium tracking-widest whitespace-nowrap px-1 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,1)]">
            {b.name}
          </div>
          <div className="w-px h-4 bg-linear-to-b from-white/40 to-transparent mt-0.5" />
        </div>
      </Html>
    </a.group>
  );
}
