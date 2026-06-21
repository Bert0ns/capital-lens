'use client';

import { useEffect } from 'react';

/**
 * Suppresses the harmless Recharts warning about 0 width/height that spams the console
 * when ResponsiveContainers are rendered inside hidden tabs or flex containers.
 * This is a known development-only issue in Recharts.
 */
export function RechartsWarningSuppressor() {
  useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (
        msg.includes('The width') &&
        msg.includes('and height') &&
        msg.includes('should be greater than 0')
      ) {
        return;
      }
      originalWarn(...args);
    };

    return () => {
      console.warn = originalWarn;
    };
  }, []);

  return null;
}
