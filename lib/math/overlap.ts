import { EtfConfig } from '@/lib/types';

export interface OverlapMatrixResult {
  etfId1: string;
  etfName1: string;
  etfId2: string;
  etfName2: string;
  overlapPercent: number; // 0 to 100
}

export interface UniquenessResult {
  etfId: string;
  etfName: string;
  uniquenessPercent: number; // 0 to 100
}

function getHoldingKey(holding: { ticker: string; name: string }): string {
  return holding.ticker !== 'N/A' ? holding.ticker : holding.name;
}

// Builds a fast lookup map of holding key -> weight for a single ETF
function buildWeightMap(etf: EtfConfig): Map<string, number> {
  const map = new Map<string, number>();
  for (const holding of etf.holdings) {
    const key = getHoldingKey(holding);
    // Sum weights in case of duplicate tickers in the same ETF (rare, but possible)
    map.set(key, (map.get(key) || 0) + holding.weight);
  }
  return map;
}

export function calculatePairwiseOverlap(etf1: EtfConfig, etf2: EtfConfig): number {
  if (etf1.id === etf2.id) return 100;

  const map1 = buildWeightMap(etf1);
  const map2 = buildWeightMap(etf2);

  let overlap = 0;
  for (const [key, weight1] of map1.entries()) {
    const weight2 = map2.get(key);
    if (weight2 !== undefined) {
      overlap += Math.min(weight1, weight2);
    }
  }

  return overlap;
}

export function generateOverlapMatrix(etfs: EtfConfig[]): OverlapMatrixResult[] {
  const results: OverlapMatrixResult[] = [];

  for (let i = 0; i < etfs.length; i++) {
    for (let j = i + 1; j < etfs.length; j++) {
      const etf1 = etfs[i];
      const etf2 = etfs[j];
      const overlap = calculatePairwiseOverlap(etf1, etf2);

      results.push({
        etfId1: etf1.id,
        etfName1: etf1.name,
        etfId2: etf2.id,
        etfName2: etf2.name,
        overlapPercent: overlap,
      });

      results.push({
        etfId1: etf2.id,
        etfName1: etf2.name,
        etfId2: etf1.id,
        etfName2: etf1.name,
        overlapPercent: overlap,
      });
    }

    // Self-overlap
    results.push({
      etfId1: etfs[i].id,
      etfName1: etfs[i].name,
      etfId2: etfs[i].id,
      etfName2: etfs[i].name,
      overlapPercent: 100,
    });
  }

  return results;
}

export function calculateUniqueness(etfs: EtfConfig[]): UniquenessResult[] {
  if (etfs.length <= 1) {
    return etfs.map((etf) => ({
      etfId: etf.id,
      etfName: etf.name,
      uniquenessPercent: 100,
    }));
  }

  const results: UniquenessResult[] = [];
  const etfMaps = etfs.map((etf) => buildWeightMap(etf));

  for (let i = 0; i < etfs.length; i++) {
    const targetEtf = etfs[i];
    const targetMap = etfMaps[i];

    // Build the "Union" of all other ETFs
    const unionMap = new Map<string, number>();
    for (let j = 0; j < etfs.length; j++) {
      if (i === j) continue;
      const otherMap = etfMaps[j];
      for (const [key, weight] of otherMap.entries()) {
        const existing = unionMap.get(key) || 0;
        unionMap.set(key, Math.max(existing, weight));
      }
    }

    // Calculate overlap with the union
    let overlapWithUnion = 0;
    for (const [key, weight] of targetMap.entries()) {
      const unionWeight = unionMap.get(key);
      if (unionWeight !== undefined) {
        overlapWithUnion += Math.min(weight, unionWeight);
      }
    }

    // Uniqueness is what's left
    const uniquenessPercent = Math.max(0, 100 - overlapWithUnion);

    results.push({
      etfId: targetEtf.id,
      etfName: targetEtf.name,
      uniquenessPercent,
    });
  }

  return results.sort((a, b) => b.uniquenessPercent - a.uniquenessPercent);
}
