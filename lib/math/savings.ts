export interface SavingsPlanProjectionPoint {
  year: number;
  invested: number;
  value: number;
}

export interface SavingsPlanResult {
  chartData: SavingsPlanProjectionPoint[];
  finalTotalValue: number;
  finalInvested: number;
}

export function calculateSavingsPlanProjection(
  initialInvestment: number,
  monthlyContribution: number,
  years: number,
  expectedReturn: number,
  stopAccumulatingMonths: number
): SavingsPlanResult {
  const data: SavingsPlanProjectionPoint[] = [];
  const monthlyRate = expectedReturn / 100 / 12;
  const totalMonths = years * 12;
  const clampedStopMonths = Math.min(stopAccumulatingMonths, totalMonths);

  let currentTotal = initialInvestment;
  let currentInvested = initialInvestment;

  data.push({
    year: 0,
    invested: currentInvested,
    value: Math.round(currentTotal),
  });

  for (let m = 1; m <= totalMonths; m++) {
    const currentContribution = m <= clampedStopMonths ? monthlyContribution : 0;
    currentTotal = currentTotal * (1 + monthlyRate) + currentContribution;
    currentInvested += currentContribution;

    if (m % 12 === 0 || m === totalMonths) {
      const yearPoint = data.find((d) => d.year === m / 12);
      if (!yearPoint) {
        data.push({
          year: m / 12,
          invested: currentInvested,
          value: Math.round(currentTotal),
        });
      }
    }
  }

  return {
    chartData: data,
    finalTotalValue: currentTotal,
    finalInvested: currentInvested,
  };
}
