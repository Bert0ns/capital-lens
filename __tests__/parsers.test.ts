import { getCsvParser } from '@/lib/parsers';
import { ISharesParser, VanguardParser, AmundiParser, LyxorParser } from '@/lib/parsers/strategies';
import { Issuer } from '@/lib/types';

describe('getCsvParser Factory', () => {
  it('returns ISharesParser for iShares', () => {
    expect(getCsvParser('iShares')).toBeInstanceOf(ISharesParser);
  });

  it('returns VanguardParser for Vanguard', () => {
    expect(getCsvParser('Vanguard')).toBeInstanceOf(VanguardParser);
  });

  it('returns AmundiParser for Amundi', () => {
    expect(getCsvParser('Amundi')).toBeInstanceOf(AmundiParser);
  });

  it('returns LyxorParser for Lyxor', () => {
    expect(getCsvParser('Lyxor')).toBeInstanceOf(LyxorParser);
  });

  it('throws an error for unsupported issuer', () => {
    expect(() => getCsvParser('UnknownIssuer' as Issuer)).toThrow(
      'Unsupported issuer: UnknownIssuer'
    );
  });
});
