import { EtfConfig } from '@/lib/types';
import { aggregateTopHoldings } from './aggregation';

export interface NetworkNode {
  id: string;
  name: string;
  group: 'etf' | 'holding';
  val: number; // For node sizing
  color?: string;
}

export interface NetworkLink {
  source: string;
  target: string;
  value: number; // For link thickness
}

export interface NetworkGraphData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

export function generateNetworkData(etfs: EtfConfig[], limit: number = 100): NetworkGraphData {
  const nodes: NetworkNode[] = [];
  const links: NetworkLink[] = [];

  // 1. Add all active ETFs as central nodes
  const activeEtfs = etfs.filter((e) => e.globalWeight > 0);
  activeEtfs.forEach((etf) => {
    nodes.push({
      id: etf.id,
      name: etf.name,
      group: 'etf',
      val: etf.globalWeight,
      // Different colors for different issuers/ETFs if we want, or handle in the chart
    });
  });

  // 2. Calculate top N holdings across the portfolio to avoid 10,000 nodes
  const topHoldings = aggregateTopHoldings(activeEtfs, limit);
  const topHoldingKeys = new Set(topHoldings.map((h) => h.name));

  // 3. For each top holding, add a node
  topHoldings.forEach((h) => {
    nodes.push({
      id: h.name, // The unique key used in aggregateTopHoldings is either ticker or name
      name: h.name,
      group: 'holding',
      val: h.value,
    });
  });

  // 4. Create links connecting ETFs to these top holdings
  for (const etf of activeEtfs) {
    for (const holding of etf.holdings) {
      const key = holding.ticker !== 'N/A' ? holding.ticker : holding.name;
      if (topHoldingKeys.has(key)) {
        links.push({
          source: etf.id,
          target: key,
          value: holding.weight, // Inner weight to represent link strength
        });
      }
    }
  }

  return { nodes, links };
}
