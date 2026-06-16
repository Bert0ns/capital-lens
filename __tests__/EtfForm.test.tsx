import { render, screen } from '@testing-library/react';
import EtfForm from '@/components/EtfForm';
import { useEtfForm } from '@/hooks/useEtfForm';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { dictionaries } from '@/lib/i18n';

jest.mock('../hooks/useEtfForm');
jest.mock('../lib/i18n/LanguageContext', () => ({
  useTranslation: jest.fn(),
}));

describe('EtfForm Component', () => {
  beforeEach(() => {
    (useTranslation as jest.Mock).mockReturnValue({
      t: dictionaries.en,
    });

    (useEtfForm as jest.Mock).mockReturnValue({
      state: {
        open: true,
        name: '',
        isin: '',
        issuer: 'iShares',
        ter: '',
        replicationMethod: 'Physical',
        fundSize: '',
        fundAge: '',
        useOfProfit: 'Accumulating',
        domicile: 'Ireland',
        file: null as File | null,
        isLoading: false,
      },
      actions: {
        setOpen: jest.fn(),
        setName: jest.fn(),
        setIsin: jest.fn(),
        setIssuer: jest.fn(),
        setTer: jest.fn(),
        setReplicationMethod: jest.fn(),
        setFundSize: jest.fn(),
        setFundAge: jest.fn(),
        setUseOfProfit: jest.fn(),
        setDomicile: jest.fn(),
        setFile: jest.fn(),
        handleSubmit: jest.fn(),
      },
      t: dictionaries.en,
    });
  });

  it('renders form fields when open', () => {
    render(<EtfForm onAddEtf={jest.fn()} />);
    // Just rendering it when `open=true` covers the UI component lines.
    expect(
      screen.getAllByText(dictionaries.en.pages.analyzer.components.etfForm.addEtf).length
    ).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText('e.g., S&P 500')).toBeInTheDocument();
  });
});
