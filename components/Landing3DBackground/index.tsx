'use client';

import { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useTheme } from 'next-themes';
import { PortfolioNetwork } from './PortfolioNetwork';

export default function Landing3DBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const handleMouseMove = (event: MouseEvent) => {
      // Normalize to -1 to 1
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === 'theme-cyberpunk';

  return (
    <div
      className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${isDark ? 'opacity-90' : 'opacity-40'}`}
    >
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={isDark ? 0.5 : 2} />
        <directionalLight position={[10, 10, 5]} intensity={isDark ? 2 : 3} color="#ffffff" />
        <pointLight
          position={[-10, -10, -5]}
          intensity={isDark ? 3 : 1}
          color={isDark ? '#22d3ee' : '#3b82f6'}
        />

        {isDark && (
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.02} />
        )}

        <PortfolioNetwork theme={resolvedTheme || 'theme-professional'} mouseRef={mouseRef} />
      </Canvas>
    </div>
  );
}
