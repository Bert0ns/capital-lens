'use client';

import { usePortfolio } from '../hooks/usePortfolio';
import EtfForm from '../components/EtfForm';
import PortfolioSliders from '../components/PortfolioSliders';
import Dashboard from '../components/Dashboard';

export default function Home() {
  const {
    etfs,
    isLoaded,
    isLoadingDefaults,
    totalWeight,
    addEtf,
    removeEtf,
    updateEtfWeight,
    loadDefaults,
  } = usePortfolio();

  if (!isLoaded || isLoadingDefaults) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 animate-pulse">
          {isLoadingDefaults ? 'Parsing default ETF CSVs...' : 'Loading portfolio...'}
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              ETF Portfolio Analyzer
            </h1>
            <p className="text-gray-500 mt-2">
              Upload your ETF holdings CSVs, configure weights, and analyze your true underlying
              exposure.
            </p>
          </div>
          <a
            href="https://github.com/Bert0ns/investment-portfolio-analysis"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors bg-gray-900 text-gray-50 hover:bg-gray-900/90 rounded-md shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-github"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
            Star on GitHub
          </a>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Form & Sliders */}
          <div className="lg:col-span-1 relative">
            <div className="lg:sticky lg:top-6 space-y-6 lg:max-h-[calc(100vh-3rem)] flex flex-col">
              <EtfForm onAddEtf={addEtf} />
              <div className="flex-1 lg:overflow-y-auto pr-2 pb-4 scrollbar-thin scrollbar-thumb-gray-200">
                <PortfolioSliders
                  etfs={etfs}
                  totalWeight={totalWeight}
                  onUpdateWeight={updateEtfWeight}
                  onRemove={removeEtf}
                  onReset={loadDefaults}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Dashboard */}
          <div className="lg:col-span-2">
            <Dashboard etfs={etfs} totalWeight={totalWeight} />
          </div>
        </div>
      </div>
    </main>
  );
}
