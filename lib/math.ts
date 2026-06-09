import { EtfConfig } from './types';

export interface AggregationResult {
  name: string;
  value: number;
}

function normalizeSector(sector: string): string {
  if (!sector || sector === 'Unknown' || sector === 'N/A') return 'Unknown';

  const s = sector.trim().toLowerCase();

  if (s === 'it' || s.includes('tech') || s.includes('tecnologia') || s.includes('informatica'))
    return 'Information Technology';
  if (s.includes('finanziari') || s.includes('financial') || s.includes('finance'))
    return 'Financials';
  if (s.includes('industr') || s.includes('industrali')) return 'Industrials';
  if (
    s.includes('health') ||
    s.includes('sanità') ||
    s.includes('sanita') ||
    s.includes('cura') ||
    s.includes('salute')
  )
    return 'Healthcare';
  if (
    s.includes('discrezionali') ||
    s.includes('discretionary') ||
    s.includes('cyclical') ||
    s.includes('consumer services')
  )
    return 'Consumer Discretionary';
  if (
    s.includes('staples') ||
    s.includes('beni di consumo') ||
    s.includes('defensive') ||
    s.includes('consumer goods')
  )
    return 'Consumer Staples';
  if (s.includes('material') || s.includes('materie prime')) return 'Materials';
  if (s.includes('energ')) return 'Energy';
  if (s.includes('utilit') || s.includes('pubblica utilità')) return 'Utilities';
  if (s.includes('communication') || s.includes('telecom') || s.includes('comunicazion'))
    return 'Communication Services';
  if (s.includes('real estate') || s.includes('immobiliare') || s.includes('property'))
    return 'Real Estate';

  // Return the original sector with title case as fallback
  return sector.charAt(0).toUpperCase() + sector.slice(1);
}

export function aggregateBy(
  etfs: EtfConfig[],
  key: 'sector' | 'country' | 'currency'
): AggregationResult[] {
  const map = new Map<string, number>();

  for (const etf of etfs) {
    // global weight is 0-100, we use it to scale
    const globalMultiplier = etf.globalWeight / 100;

    for (const holding of etf.holdings) {
      // holding.weight is also typically 0-100
      const actualWeight = holding.weight * globalMultiplier;
      let groupingKey = holding[key] || 'Unknown';

      if (key === 'sector') {
        groupingKey = normalizeSector(groupingKey);
      }

      map.set(groupingKey, (map.get(groupingKey) || 0) + actualWeight);
    }
  }

  // Convert map to array and sort by value descending
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function aggregateTopHoldings(etfs: EtfConfig[], limit: number = 10): AggregationResult[] {
  const map = new Map<string, number>();

  for (const etf of etfs) {
    const globalMultiplier = etf.globalWeight / 100;

    for (const holding of etf.holdings) {
      const actualWeight = holding.weight * globalMultiplier;
      // We use ticker if available, else name
      const groupingKey = holding.ticker !== 'N/A' ? holding.ticker : holding.name;

      map.set(groupingKey, (map.get(groupingKey) || 0) + actualWeight);
    }
  }

  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export function calculateAverageTer(etfs: EtfConfig[]): number {
  let totalWeight = 0;
  let weightedTer = 0;

  for (const etf of etfs) {
    totalWeight += etf.globalWeight;
    weightedTer += etf.ter * etf.globalWeight;
  }

  if (totalWeight === 0) return 0;
  return weightedTer / totalWeight;
}
