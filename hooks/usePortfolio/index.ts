import { usePortfolioState } from './usePortfolioState';
import { usePortfolioStorage } from './usePortfolioStorage';

export function usePortfolio() {
  const { etfs, setEtfs, addEtf, removeEtf, updateEtfWeight } = usePortfolioState();
  const { isLoaded, isLoadingDefaults, loadDefaults } = usePortfolioStorage(etfs, setEtfs);

  const totalWeight = etfs.reduce((sum, etf) => sum + etf.globalWeight, 0);

  return {
    etfs,
    isLoaded,
    isLoadingDefaults,
    totalWeight,
    addEtf,
    removeEtf,
    updateEtfWeight,
    loadDefaults,
  };
}
