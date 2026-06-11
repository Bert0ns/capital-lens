'use client';

import { usePortfolio } from '@/hooks/usePortfolio';
import EtfForm from '@/components/EtfForm';
import PortfolioSliders from '@/components/PortfolioSliders';
import Dashboard from '@/components/Dashboard';
import { useState } from 'react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

export default function AnalyzerContent() {
  const { t } = useTranslation();
  const [isSlidersOpen, setIsSlidersOpen] = useState(true);
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
      <div className="min-h-[calc(100vh-4rem)] bg-background flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-6 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
        <p className="text-primary font-bold tracking-widest uppercase animate-pulse">
          {isLoadingDefaults ? t.analyzer.parsingDefaults : t.analyzer.initializing}
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background p-3 md:p-10 font-sans text-foreground w-full">
      <div className="max-w-7xl mx-auto space-y-8 w-full">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 relative">
            <div className="xl:sticky xl:top-24 space-y-8 xl:max-h-[calc(100vh-6rem)] flex flex-col">
              <Collapsible
                open={isSlidersOpen}
                onOpenChange={setIsSlidersOpen}
                className="flex flex-col"
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full py-3 px-4 mb-4 text-sm font-semibold text-foreground bg-muted/30 border border-border rounded-xl hover:bg-muted/60 transition-colors cursor-pointer">
                  <span>{isSlidersOpen ? 'Hide Portfolio Setup' : 'Manage Portfolio'}</span>
                  {isSlidersOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </CollapsibleTrigger>
                <div
                  className={`grid transition-all duration-500 ease-in-out ${
                    isSlidersOpen
                      ? 'grid-rows-[1fr] opacity-100 visible'
                      : 'grid-rows-[0fr] opacity-0 invisible'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="flex-1 xl:overflow-y-auto pb-4 scrollbar-thin scrollbar-thumb-primary/20 pt-4">
                      <PortfolioSliders
                        etfs={etfs}
                        totalWeight={totalWeight}
                        onUpdateWeight={updateEtfWeight}
                        onRemove={removeEtf}
                        onReset={loadDefaults}
                        onAddEtf={addEtf}
                      />
                    </div>
                  </div>
                </div>
              </Collapsible>
            </div>
          </div>
          <div className="xl:col-span-2">
            <Dashboard etfs={etfs} totalWeight={totalWeight} />
          </div>
        </div>
      </div>
    </main>
  );
}
