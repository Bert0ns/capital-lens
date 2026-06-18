import { generateVoronoiData } from '../lib/math/voronoi';
import { getVoronoiCacheKey, getCachedVoronoi, setCachedVoronoi } from '../lib/math/voronoiCache';
import { EtfConfig } from '@/lib/types';

describe('Voronoi Utilities', () => {
  const mockEtfs: EtfConfig[] = [
    {
      id: '1',
      name: 'Test ETF 1',
      issuer: 'iShares',
      ter: 0.1,
      globalWeight: 50,
      replicationMethod: 'Physical',
      useOfProfit: 'Accumulating',
      domicile: 'Ireland',
      fundAge: 5,
      fundSize: 1000,
      holdings: [
        { name: 'Apple', ticker: 'AAPL', weight: 60, sector: 'IT', country: 'US', currency: 'USD' },
        {
          name: 'Microsoft',
          ticker: 'MSFT',
          weight: 40,
          sector: 'IT',
          country: 'US',
          currency: 'USD',
        },
      ],
    },
    {
      id: '2',
      name: 'Test ETF 2',
      issuer: 'Vanguard',
      ter: 0.2,
      globalWeight: 50,
      replicationMethod: 'Physical',
      useOfProfit: 'Distributing',
      domicile: 'US',
      fundAge: 10,
      fundSize: 2000,
      holdings: [
        { name: 'Apple', ticker: 'AAPL', weight: 20, sector: 'IT', country: 'US', currency: 'USD' },
        {
          name: 'Tesla',
          ticker: 'TSLA',
          weight: 80,
          sector: 'Consumer',
          country: 'US',
          currency: 'USD',
        },
      ],
    },
  ];

  describe('generateVoronoiData', () => {
    it('returns an empty array when ETFs list is empty', () => {
      const data = generateVoronoiData([], 800, 600);
      expect(data).toEqual([]);
    });

    it('returns an empty array when global weights are zero', () => {
      const zeroEtfs = mockEtfs.map((e) => ({ ...e, globalWeight: 0 }));
      const data = generateVoronoiData(zeroEtfs, 800, 600);
      expect(data).toEqual([]);
    });

    it('aggregates holdings across ETFs and applies mock polygons', () => {
      const data = generateVoronoiData(mockEtfs, 800, 600, 10);

      // AAPL (30 + 10 = 40), TSLA (40), MSFT (20) -> 3 nodes
      expect(data.length).toBe(3);

      const aapl = data.find((d) => d.data.ticker === 'AAPL');
      expect(aapl).toBeDefined();
      expect(aapl?.data.weight).toBeCloseTo(40);

      const tsla = data.find((d) => d.data.ticker === 'TSLA');
      expect(tsla).toBeDefined();
      expect(tsla?.data.weight).toBeCloseTo(40);

      // Verify the mock attached polygons
      expect(data[0].polygon).toEqual([
        [0, 0],
        [10, 0],
        [10, 10],
        [0, 10],
      ]);
    });

    it('clusters holdings into a tail node if count exceeds maxNodes', () => {
      // Set maxNodes to 2. We have 3 holdings. The smallest (MSFT) should become TAIL_NODE.
      const data = generateVoronoiData(mockEtfs, 800, 600, 2);

      expect(data.length).toBe(3); // 2 top nodes + 1 tail node
      const tail = data.find((d) => d.data.isTail);
      expect(tail).toBeDefined();
      expect(tail?.data.weight).toBeCloseTo(20);
      expect(tail?.data.id).toBe('TAIL_NODE');
    });
  });

  describe('Voronoi Cache', () => {
    it('generates deterministic cache keys based on etfs and dimensions', () => {
      const key1 = getVoronoiCacheKey(mockEtfs, 800.4, 600.6, 50);
      const key2 = getVoronoiCacheKey(mockEtfs, 800, 601, 50); // Math.round handles the decimals

      expect(key1).toBe(key2);
      expect(key1).toContain('1:50:2|2:50:2');
    });

    it('sets and retrieves cache properly, and respects size limits', () => {
      const key = 'test-key';
      const mockData = [
        {
          data: { id: 'AAPL', name: 'Apple', ticker: 'AAPL', weight: 10, sector: 'IT' },
          polygon: [[0, 0]] as [number, number][],
        },
      ];

      setCachedVoronoi(key, mockData);
      expect(getCachedVoronoi(key)).toEqual(mockData);

      // Flood the cache to test size limit (5)
      setCachedVoronoi('key-1', []);
      setCachedVoronoi('key-2', []);
      setCachedVoronoi('key-3', []);
      setCachedVoronoi('key-4', []);
      setCachedVoronoi('key-5', []);
      setCachedVoronoi('key-6', []);

      // The original 'test-key' or early keys should be evicted
      expect(getCachedVoronoi(key)).toBeNull();
    });
  });
});
