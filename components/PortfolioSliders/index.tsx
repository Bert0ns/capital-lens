'use client';

import React from 'react';
import { EtfConfig } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import EtfForm from '@/components/EtfForm';

import { EmptyPortfolioState } from './EmptyPortfolioState';
import { WeightValidation } from './WeightValidation';
import { EtfSliderRow } from './EtfSliderRow';

interface PortfolioSlidersProps {
  etfs: EtfConfig[];
  totalWeight: number;
  onUpdateWeight: (id: string, weight: number) => void;
  onRemove: (id: string) => void;
  onReset: () => void;
  onAddEtf: (etf: EtfConfig) => void;
}

export default function PortfolioSliders({
  etfs,
  totalWeight,
  onUpdateWeight,
  onRemove,
  onReset,
  onAddEtf,
}: PortfolioSlidersProps) {
  if (etfs.length === 0) {
    return <EmptyPortfolioState onAddEtf={onAddEtf} onReset={onReset} />;
  }

  return (
    <Card className="flex-1 w-full flex flex-col min-h-0">
      <CardContent className="flex-1 flex flex-col pt-0 space-y-6 min-h-0">
        <div className="pt-0">
          <EtfForm onAddEtf={onAddEtf} />
        </div>
        <div className="flex-1 overflow-y-auto space-y-6 pr-4 pb-4 scrollbar-thin scrollbar-thumb-primary/20">
          {etfs.map((etf) => (
            <EtfSliderRow
              key={etf.id}
              etf={etf}
              onUpdateWeight={onUpdateWeight}
              onRemove={onRemove}
            />
          ))}
        </div>

        <WeightValidation totalWeight={totalWeight} onReset={onReset} />
      </CardContent>
    </Card>
  );
}
