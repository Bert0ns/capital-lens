import {
  aggregateBy,
  calculateAverageTer,
  aggregateTopHoldings,
  searchHoldings,
  searchByCountry,
  generateNetworkData,
} from '../lib/math';
import { calculateMechanicsData } from '../lib/math/mechanics';
import { EtfConfig } from '@/lib/types';

describe('Math Utilities', () => {
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
        { name: 'Apple', ticker: 'AAPL', weight: 10, sector: 'IT', country: 'US', currency: 'USD' },
        {
          name: 'Microsoft',
          ticker: 'MSFT',
          weight: 5,
          sector: 'Technology',
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
        {
          name: 'Apple',
          ticker: 'AAPL',
          weight: 4,
          sector: 'Information Technology',
          country: 'US',
          currency: 'USD',
        },
        {
          name: 'Nestle',
          ticker: 'NESN',
          weight: 6,
          sector: 'Consumer Staples',
          country: 'CH',
          currency: 'CHF',
        },
      ],
    },
  ];

  describe('aggregateBy', () => {
    describe('Sector Normalization & Edge Cases', () => {
      it('normalizes various IT sector names into "Information Technology"', () => {
        const results = aggregateBy(mockEtfs, 'sector');
        const itSector = results.find((r) => r.name === 'Information Technology');

        // ETF 1: AAPL (10% of 50% = 5) + MSFT (5% of 50% = 2.5) = 7.5
        // ETF 2: AAPL (4% of 50% = 2) = 2
        // Total IT = 9.5
        expect(itSector?.value).toBeCloseTo(9.5);
      });

      it('normalizes various other sectors correctly', () => {
        const customEtfs: EtfConfig[] = [
          {
            ...mockEtfs[0],
            globalWeight: 100,
            holdings: [
              {
                name: 'A',
                ticker: 'A',
                weight: 10,
                sector: 'finanziari',
                country: 'US',
                currency: 'USD',
              },
              {
                name: 'B',
                ticker: 'B',
                weight: 10,
                sector: 'salute',
                country: 'US',
                currency: 'USD',
              },
              {
                name: 'C',
                ticker: 'C',
                weight: 10,
                sector: ' beni di consumo ',
                country: 'US',
                currency: 'USD',
              },
              {
                name: 'D',
                ticker: 'D',
                weight: 10,
                sector: 'pubblica utilità',
                country: 'US',
                currency: 'USD',
              },
              {
                name: 'E',
                ticker: 'E',
                weight: 10,
                sector: 'immobiliare',
                country: 'US',
                currency: 'USD',
              },
            ],
          },
        ];
        const results = aggregateBy(customEtfs, 'sector');

        expect(results.find((r) => r.name === 'Financials')?.value).toBe(10);
        expect(results.find((r) => r.name === 'Healthcare')?.value).toBe(10);
        expect(results.find((r) => r.name === 'Consumer Staples')?.value).toBe(10);
        expect(results.find((r) => r.name === 'Utilities')?.value).toBe(10);
        expect(results.find((r) => r.name === 'Real Estate')?.value).toBe(10);
      });

      it('handles empty, Unknown, and N/A sectors', () => {
        const customEtfs: EtfConfig[] = [
          {
            ...mockEtfs[0],
            globalWeight: 100,
            holdings: [
              { name: 'A', ticker: 'A', weight: 10, sector: '', country: 'US', currency: 'USD' },
              {
                name: 'B',
                ticker: 'B',
                weight: 10,
                sector: 'Unknown',
                country: 'US',
                currency: 'USD',
              },
              { name: 'C', ticker: 'C', weight: 10, sector: 'N/A', country: 'US', currency: 'USD' },
            ],
          },
        ];
        const results = aggregateBy(customEtfs, 'sector');
        expect(results.find((r) => r.name === 'Unknown')?.value).toBe(30);
      });

      it('capitalizes fallback sectors', () => {
        const customEtfs: EtfConfig[] = [
          {
            ...mockEtfs[0],
            globalWeight: 100,
            holdings: [
              {
                name: 'A',
                ticker: 'A',
                weight: 10,
                sector: 'random sector',
                country: 'US',
                currency: 'USD',
              },
            ],
          },
        ];
        const results = aggregateBy(customEtfs, 'sector');
        expect(results.find((r) => r.name === 'Random sector')?.value).toBe(10);
      });
    });

    describe('General Aggregation Edge Cases', () => {
      it('aggregates by country correctly', () => {
        const results = aggregateBy(mockEtfs, 'country');
        const usCountry = results.find((r) => r.name === 'United States');

        // ETF 1: US (15% of 50% = 7.5)
        // ETF 2: US (4% of 50% = 2)
        // Total US = 9.5
        expect(usCountry?.value).toBeCloseTo(9.5);
      });

      it('handles empty ETF arrays', () => {
        const results = aggregateBy([], 'sector');
        expect(results).toEqual([]);
      });

      it('handles ETFs with empty holdings', () => {
        const emptyHoldingsEtfs: EtfConfig[] = [
          { ...mockEtfs[0], holdings: [] },
          { ...mockEtfs[1], holdings: [] },
        ];
        const results = aggregateBy(emptyHoldingsEtfs, 'sector');
        expect(results).toEqual([]);
      });

      it('handles missing property gracefully (fallback to Unknown)', () => {
        const customEtfs: EtfConfig[] = [
          {
            ...mockEtfs[0],
            globalWeight: 100,
            holdings: [
              // @ts-expect-error - explicitly testing missing properties
              { name: 'A', ticker: 'A', weight: 10 },
            ],
          },
        ];
        const results = aggregateBy(customEtfs, 'country');
        expect(results.find((r) => r.name === 'Unknown')?.value).toBe(10);
      });

      it('handles global weight 0', () => {
        const zeroWeightEtfs = mockEtfs.map((e) => ({ ...e, globalWeight: 0 }));
        const results = aggregateBy(zeroWeightEtfs, 'sector');
        // all values should be 0
        expect(results.every((r) => r.value === 0)).toBe(true);
      });
    });
  });

  describe('aggregateTopHoldings', () => {
    it('merges overlapping holdings from different ETFs', () => {
      const topHoldings = aggregateTopHoldings(mockEtfs, 10);
      const apple = topHoldings.find((h) => h.name === 'AAPL');

      // ETF 1: 5%, ETF 2: 2% -> Total 7%
      expect(apple?.value).toBeCloseTo(7);
    });

    it('falls back to holding name if ticker is N/A', () => {
      const customEtfs: EtfConfig[] = [
        {
          ...mockEtfs[0],
          globalWeight: 100,
          holdings: [
            {
              name: 'No Ticker Corp',
              ticker: 'N/A',
              weight: 10,
              sector: 'IT',
              country: 'US',
              currency: 'USD',
            },
          ],
        },
      ];
      const topHoldings = aggregateTopHoldings(customEtfs, 10);
      expect(topHoldings.find((h) => h.name === 'No Ticker Corp')?.value).toBe(10);
    });

    it('returns empty array when ETFs array is empty', () => {
      const topHoldings = aggregateTopHoldings([], 10);
      expect(topHoldings).toEqual([]);
    });

    it('respects the limit', () => {
      const customEtfs: EtfConfig[] = [
        {
          ...mockEtfs[0],
          globalWeight: 100,
          holdings: [
            { name: 'A', ticker: 'A', weight: 50, sector: 'IT', country: 'US', currency: 'USD' },
            { name: 'B', ticker: 'B', weight: 30, sector: 'IT', country: 'US', currency: 'USD' },
            { name: 'C', ticker: 'C', weight: 20, sector: 'IT', country: 'US', currency: 'USD' },
          ],
        },
      ];

      const topHoldings = aggregateTopHoldings(customEtfs, 2);
      expect(topHoldings.length).toBe(2);
      expect(topHoldings[0].name).toBe('A');
      expect(topHoldings[1].name).toBe('B');
    });

    it('handles limit 0 by returning empty array', () => {
      const topHoldings = aggregateTopHoldings(mockEtfs, 0);
      expect(topHoldings).toEqual([]);
    });
  });

  describe('calculateAverageTer', () => {
    it('calculates the weighted average TER correctly', () => {
      const avgTer = calculateAverageTer(mockEtfs);
      // (50 * 0.1 + 50 * 0.2) / 100 = 0.15
      expect(avgTer).toBeCloseTo(0.15);
    });

    it('returns 0 if total weight is 0', () => {
      const zeroWeightEtfs = mockEtfs.map((e) => ({ ...e, globalWeight: 0 }));
      expect(calculateAverageTer(zeroWeightEtfs)).toBe(0);
    });

    it('returns 0 if the ETF array is empty', () => {
      expect(calculateAverageTer([])).toBe(0);
    });

    it('handles negative weights safely (if possible)', () => {
      const negativeWeightEtfs: EtfConfig[] = [
        { ...mockEtfs[0], globalWeight: 50, ter: 0.1 },
        { ...mockEtfs[1], globalWeight: -20, ter: 0.2 },
      ];
      // Total weight: 30
      // Weighted TER: 50 * 0.1 + (-20) * 0.2 = 5 - 4 = 1
      // Average: 1 / 30 = 0.0333...
      const avgTer = calculateAverageTer(negativeWeightEtfs);
      expect(avgTer).toBeCloseTo(1 / 30);
    });

    it('handles zero TER', () => {
      const zeroTerEtfs: EtfConfig[] = [
        { ...mockEtfs[0], globalWeight: 50, ter: 0 },
        { ...mockEtfs[1], globalWeight: 50, ter: 0 },
      ];
      expect(calculateAverageTer(zeroTerEtfs)).toBe(0);
    });
  });

  describe('searchHoldings', () => {
    it('returns empty array if query is empty or whitespace', () => {
      expect(searchHoldings(mockEtfs, '')).toEqual([]);
      expect(searchHoldings(mockEtfs, '   ')).toEqual([]);
    });

    it('returns empty array if no matching holding is found', () => {
      expect(searchHoldings(mockEtfs, 'NonExistent')).toEqual([]);
    });

    it('finds holding by ticker (case insensitive) and aggregates across ETFs', () => {
      // AAPL is in ETF 1 (10%) and ETF 2 (4%). Both ETFs have 50% global weight.
      const results = searchHoldings(mockEtfs, 'aapl');
      expect(results.length).toBe(1);
      expect(results[0].ticker).toBe('AAPL');
      expect(results[0].name).toBe('Apple');
      expect(results[0].totalWeight).toBeCloseTo(7); // (10 * 0.5) + (4 * 0.5) = 7
      expect(results[0].breakdown.length).toBe(2);
      expect(results[0].breakdown[0].etfId).toBe('1');
      expect(results[0].breakdown[0].contribution).toBeCloseTo(5);
    });

    it('finds holding by name and ignores ETFs with 0 global weight', () => {
      const customEtfs: EtfConfig[] = [
        ...mockEtfs,
        {
          ...mockEtfs[0],
          id: '3',
          globalWeight: 0,
          holdings: [
            {
              name: 'Apple',
              ticker: 'AAPL',
              weight: 50,
              sector: 'IT',
              country: 'US',
              currency: 'USD',
            },
          ],
        },
      ];
      // Search for "apple"
      const results = searchHoldings(customEtfs, 'Apple');
      expect(results.length).toBe(1);
      // The 3rd ETF should be ignored, so the result should still be exactly 7
      expect(results[0].totalWeight).toBeCloseTo(7);
      expect(results[0].breakdown.length).toBe(2);
    });

    it('handles holding with N/A ticker by falling back to name', () => {
      const customEtfs: EtfConfig[] = [
        {
          ...mockEtfs[0],
          globalWeight: 100,
          holdings: [
            {
              name: 'Unknown Corp',
              ticker: 'N/A',
              weight: 10,
              sector: 'IT',
              country: 'US',
              currency: 'USD',
            },
          ],
        },
      ];
      const results = searchHoldings(customEtfs, 'unknown');
      expect(results.length).toBe(1);
      expect(results[0].ticker).toBe('N/A');
      expect(results[0].name).toBe('Unknown Corp');
    });
  });

  describe('searchByCountry', () => {
    it('returns empty array if query is empty or whitespace', () => {
      expect(searchByCountry(mockEtfs, '')).toEqual([]);
      expect(searchByCountry(mockEtfs, '   ')).toEqual([]);
    });

    it('returns empty array if no matching country is found', () => {
      expect(searchByCountry(mockEtfs, 'Italy')).toEqual([]);
    });

    it('groups results by canonical country name and aggregates correctly', () => {
      const results = searchByCountry(mockEtfs, 'us'); // Should match 'US' (from AAPL and MSFT)

      expect(results.length).toBe(1);
      const usResult = results[0];

      expect(usResult.countryName).toBe('United States'); // 'US' should be normalized to 'United States'

      // AAPL in ETF1 (10%), MSFT in ETF1 (5%), AAPL in ETF2 (4%)
      // All weights * 0.5 (global multiplier)
      // Total = (10 * 0.5) + (5 * 0.5) + (4 * 0.5) = 5 + 2.5 + 2 = 9.5
      expect(usResult.totalWeight).toBeCloseTo(9.5);

      // ETF Breakdown
      expect(usResult.etfBreakdown.length).toBe(2);
      expect(usResult.etfBreakdown.find((b) => b.etfId === '1')?.contribution).toBeCloseTo(7.5);
      expect(usResult.etfBreakdown.find((b) => b.etfId === '2')?.contribution).toBeCloseTo(2);

      // Companies Breakdown
      expect(usResult.companies.length).toBe(2); // AAPL and MSFT
      const aapl = usResult.companies.find((c) => c.ticker === 'AAPL');
      expect(aapl?.totalWeight).toBeCloseTo(7); // 5 + 2
      const msft = usResult.companies.find((c) => c.ticker === 'MSFT');
      expect(msft?.totalWeight).toBeCloseTo(2.5);
    });

    it('handles unknown or empty country strings', () => {
      const customEtfs: EtfConfig[] = [
        {
          ...mockEtfs[0],
          globalWeight: 100,
          holdings: [
            {
              name: 'Mystery Corp',
              ticker: 'MYS',
              weight: 100,
              sector: 'IT',
              country: '', // empty country
              currency: 'USD',
            },
          ],
        },
      ];
      // Search for unknown should not return anything for empty queries
      const results = searchByCountry(customEtfs, 'unknown');
      // The code specifically ignores 'Unknown' canonical country:
      // if (canonCountry === 'Unknown' || ...) return;
      expect(results.length).toBe(0);
    });
  });

  describe('generateNetworkData', () => {
    it('generates nodes for ETFs and top holdings, and creates links', () => {
      const limit = 2;
      const data = generateNetworkData(mockEtfs, limit);

      // ETFs + up to 2 top holdings. mockEtfs has 2 ETFs.
      // Top 2 holdings: AAPL (7%), NESN (3% - 6*0.5), MSFT (2.5% - 5*0.5) => Top 2 are AAPL and NESN.
      expect(data.nodes.filter((n) => n.group === 'etf').length).toBe(2);
      expect(data.nodes.filter((n) => n.group === 'holding').length).toBe(2); // AAPL and NESN

      // Check links: ETF1 -> AAPL, ETF2 -> AAPL, ETF2 -> NESN. (ETF1 -> MSFT is omitted because MSFT is not top 2)
      expect(data.links.length).toBe(3);

      const etf1Links = data.links.filter((l) => l.source === '1');
      expect(etf1Links.length).toBe(1);
      expect(etf1Links[0].target).toBe('AAPL'); // Uses key which is ticker 'AAPL'

      const etf2Links = data.links.filter((l) => l.source === '2');
      expect(etf2Links.length).toBe(2);
      expect(etf2Links.some((l) => l.target === 'AAPL')).toBe(true);
      expect(etf2Links.some((l) => l.target === 'NESN')).toBe(true);
    });

    it('ignores ETFs with global weight 0', () => {
      const zeroWeightEtfs = mockEtfs.map((e) => ({ ...e, globalWeight: 0 }));
      const data = generateNetworkData(zeroWeightEtfs, 10);
      expect(data.nodes.length).toBe(0);
      expect(data.links.length).toBe(0);
    });
  });

  describe('calculateMechanicsData', () => {
    it('returns empty arrays for empty etfs input', () => {
      const result = calculateMechanicsData([]);
      expect(result.topEtfs).toEqual([]);
      expect(result.axesData).toEqual([]);
    });

    it('calculates correct scores for ETFs based on diversification, cost, age, and size', () => {
      const etfs: EtfConfig[] = [
        {
          id: '1',
          name: 'Good ETF',
          issuer: 'Vanguard',
          ter: 0.1, // Low cost = high score
          globalWeight: 100,
          replicationMethod: 'Physical',
          useOfProfit: 'Accumulating',
          domicile: 'Ireland',
          fundAge: 10, // Old = high score
          fundSize: 5000, // Large = high score
          holdings: [
            { name: 'A', ticker: 'A', weight: 50, sector: 'IT', country: 'US', currency: 'USD' },
            { name: 'B', ticker: 'B', weight: 50, sector: 'IT', country: 'US', currency: 'USD' },
          ], // Low diversification = low score
        },
        {
          id: '2',
          name: 'Bad ETF',
          issuer: 'iShares',
          ter: 0.8, // High cost = low score
          globalWeight: 100,
          replicationMethod: 'Synthetic',
          useOfProfit: 'Accumulating',
          domicile: 'Luxembourg',
          fundAge: 1, // Young = low score
          fundSize: 50, // Small = low score
          holdings: [
            { name: 'A', ticker: 'A', weight: 20, sector: 'IT', country: 'US', currency: 'USD' },
            { name: 'B', ticker: 'B', weight: 20, sector: 'IT', country: 'US', currency: 'USD' },
            { name: 'C', ticker: 'C', weight: 20, sector: 'IT', country: 'US', currency: 'USD' },
            { name: 'D', ticker: 'D', weight: 20, sector: 'IT', country: 'US', currency: 'USD' },
            { name: 'E', ticker: 'E', weight: 20, sector: 'IT', country: 'US', currency: 'USD' },
          ], // High diversification = high score
        },
      ];

      const result = calculateMechanicsData(etfs);
      expect(result.topEtfs.length).toBe(2);

      const goodEtf = result.topEtfs.find((e) => e.name === 'Good ETF');
      const badEtf = result.topEtfs.find((e) => e.name === 'Bad ETF');

      expect(goodEtf).toBeDefined();
      expect(badEtf).toBeDefined();

      const costData = result.axesData.find((a) => a.key === 'cost');
      const divData = result.axesData.find((a) => a.key === 'diversification');
      const sizeData = result.axesData.find((a) => a.key === 'size');
      const ageData = result.axesData.find((a) => a.key === 'age');

      // Good ETF should have better cost, age, and size scores
      expect(costData!.scores['Good ETF']).toBeGreaterThan(costData!.scores['Bad ETF']);
      expect(ageData!.scores['Good ETF']).toBeGreaterThan(ageData!.scores['Bad ETF']);
      expect(sizeData!.scores['Good ETF']).toBeGreaterThan(sizeData!.scores['Bad ETF']);

      // Bad ETF should have a better diversification score
      expect(divData!.scores['Bad ETF']).toBeGreaterThan(divData!.scores['Good ETF']);
    });
  });
});
