import { useMemo } from 'react';
import { EtfConfig } from '@/lib/types';
import { generateNetworkData } from '@/lib/math';
import { LinkObj, NodeObj } from './types';
import { getLinkId } from './utils';

export function useNetworkData(etfs: EtfConfig[], limit: number, overlapOnly?: boolean) {
  const rawData = useMemo(() => generateNetworkData(etfs, limit), [etfs, limit]);

  const sharedHoldings = useMemo(() => {
    const etfMap: Record<string, Set<string>> = {};
    rawData.links.forEach((l) => {
      const link = l as unknown as LinkObj;
      const targetId = getLinkId(link.target);
      const sourceId = getLinkId(link.source);
      if (targetId && sourceId) {
        if (!etfMap[targetId]) etfMap[targetId] = new Set();
        etfMap[targetId].add(sourceId);
      }
    });
    return new Set(Object.keys(etfMap).filter((k) => etfMap[k].size > 1));
  }, [rawData.links]);

  const data = useMemo(() => {
    if (!overlapOnly) return rawData;
    const filteredNodes = rawData.nodes.filter((n) => {
      const node = n as NodeObj;
      return node.group === 'etf' || (node.id && sharedHoldings.has(node.id));
    });
    const nodeIds = new Set(filteredNodes.map((n) => (n as NodeObj).id));
    const filteredLinks = rawData.links.filter((l) => {
      const link = l as LinkObj;
      const sourceId = getLinkId(link.source);
      const targetId = getLinkId(link.target);
      return sourceId && targetId && nodeIds.has(sourceId) && nodeIds.has(targetId);
    });
    return { nodes: filteredNodes, links: filteredLinks };
  }, [rawData, overlapOnly, sharedHoldings]);

  const neighbors = useMemo(() => {
    const map = new Map<string, Set<string>>();
    data.nodes.forEach((n) => map.set((n as NodeObj).id!, new Set()));
    data.links.forEach((l) => {
      const link = l as LinkObj;
      const sourceId = getLinkId(link.source);
      const targetId = getLinkId(link.target);
      if (sourceId && targetId) {
        map.get(sourceId)?.add(targetId);
        map.get(targetId)?.add(sourceId);
      }
    });
    return map;
  }, [data]);

  return { rawData, sharedHoldings, data, neighbors };
}
