import { useState, useCallback } from 'react';
import { EtfConfig } from '@/lib/types';

export function usePortfolioState() {
  const [etfs, setEtfs] = useState<EtfConfig[]>([]);

  const addEtf = useCallback((etf: EtfConfig) => {
    setEtfs((prev) => [...prev, etf]);
  }, []);

  const removeEtf = useCallback((id: string) => {
    setEtfs((prev) => prev.filter((etf) => etf.id !== id));
  }, []);

  const updateEtfWeight = useCallback((id: string, weight: number) => {
    setEtfs((prev) => {
      const etf = prev.find((e) => e.id === id);
      if (!etf || etf.globalWeight === weight) return prev;
      return prev.map((e) => (e.id === id ? { ...e, globalWeight: weight } : e));
    });
  }, []);

  return {
    etfs,
    setEtfs,
    addEtf,
    removeEtf,
    updateEtfWeight,
  };
}
