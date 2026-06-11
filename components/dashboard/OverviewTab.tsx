import React from 'react';
import { TopHoldingsChart } from '../charts/TopHoldingsChart';
import { PieChartCard } from '../charts/PieChartCard';

interface OverviewTabProps {
  topHoldings: any;
  etfAllocationData: any;
  sectorData: any;
  geoData: any;
  currencyData: any;
}

export function OverviewTab({
  topHoldings,
  etfAllocationData,
  sectorData,
  geoData,
  currencyData,
}: OverviewTabProps) {
  return (
    <>
      <div className="lg:col-span-2 transition-transform hover:scale-[1.01] duration-300">
        <TopHoldingsChart data={topHoldings} />
      </div>

      <div className="transition-transform hover:scale-[1.02] duration-300">
        <PieChartCard
          title="ETF Allocation"
          info="A macro-level breakdown of the weights you assigned to each individual ETF in your portfolio."
          data={etfAllocationData}
          colorOffset={6}
        />
      </div>

      <div className="transition-transform hover:scale-[1.02] duration-300">
        <PieChartCard
          title="Sector Exposure"
          info="The industry breakdown (e.g., Technology, Healthcare) of the underlying companies in your portfolio."
          data={sectorData}
        />
      </div>

      <div className="transition-transform hover:scale-[1.02] duration-300">
        <PieChartCard
          title="Geographic Exposure"
          info="A breakdown of the physical country locations of the underlying companies in your portfolio."
          data={geoData.slice(0, 10)}
        />
      </div>

      <div className="transition-transform hover:scale-[1.02] duration-300">
        <PieChartCard
          title="Currency Exposure"
          info="Your risk exposure to different foreign exchange currencies based on the trading currency of your underlying assets."
          data={currencyData}
          colorOffset={4}
        />
      </div>
    </>
  );
}
