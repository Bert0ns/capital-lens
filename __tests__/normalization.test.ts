import { normalizeSector, normalizeCountry, getCountryIsoCode } from '@/lib/math/normalization';

describe('Normalization Utils', () => {
  describe('normalizeSector', () => {
    it('normalizes known sectors correctly', () => {
      expect(normalizeSector('IT')).toBe('Information Technology');
      expect(normalizeSector('tech')).toBe('Information Technology');
      expect(normalizeSector('finanziari')).toBe('Financials');
      expect(normalizeSector('finance')).toBe('Financials');
      expect(normalizeSector('health')).toBe('Healthcare');
      expect(normalizeSector('sanità')).toBe('Healthcare');
    });

    it('returns Unknown for empty, "Unknown" or "N/A"', () => {
      expect(normalizeSector('')).toBe('Unknown');
      expect(normalizeSector('Unknown')).toBe('Unknown');
      expect(normalizeSector('N/A')).toBe('Unknown');
    });

    it('falls back to Title Case for unknown sectors', () => {
      expect(normalizeSector('aerospace')).toBe('Aerospace');
      expect(normalizeSector('randomSector')).toBe('RandomSector');
    });
  });

  describe('normalizeCountry', () => {
    it('normalizes 2-letter ISO codes directly', () => {
      expect(normalizeCountry('us')).toBe('United States');
      expect(normalizeCountry('US')).toBe('United States');
      expect(normalizeCountry('jp')).toBe('Japan');
      expect(normalizeCountry('gb')).toBe('United Kingdom');
      expect(normalizeCountry('uk')).toBe('United Kingdom');
    });

    it('normalizes full country names using regex matchers', () => {
      expect(normalizeCountry('stati uniti')).toBe('United States');
      expect(normalizeCountry('UNITED STATES')).toBe('United States');
      expect(normalizeCountry('giappone')).toBe('Japan');
      expect(normalizeCountry('regno unito')).toBe('United Kingdom');
      expect(normalizeCountry('gran bretagna')).toBe('United Kingdom');
      expect(normalizeCountry('paesi bassi')).toBe('Netherlands');
    });

    it('returns Unknown for empty, "Unknown", "N/A" or "-"', () => {
      expect(normalizeCountry('')).toBe('Unknown');
      expect(normalizeCountry('Unknown')).toBe('Unknown');
      expect(normalizeCountry('N/A')).toBe('Unknown');
      expect(normalizeCountry('-')).toBe('Unknown');
    });

    it('falls back to Title Case for unknown countries', () => {
      expect(normalizeCountry('mars')).toBe('Mars');
      expect(normalizeCountry('fake country')).toBe('Fake country');
    });
  });

  describe('getCountryIsoCode', () => {
    it('returns the correct ISO code for a canonical country name', () => {
      expect(getCountryIsoCode('United States')).toBe('us');
      expect(getCountryIsoCode('Japan')).toBe('jp');
      expect(getCountryIsoCode('South Africa')).toBe('za');
    });

    it('returns an empty string if the country is not found in ISO_MAP', () => {
      expect(getCountryIsoCode('Mars')).toBe('');
      expect(getCountryIsoCode('Unknown')).toBe('');
      expect(getCountryIsoCode('')).toBe('');
    });
  });
});
