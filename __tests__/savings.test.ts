import { calculateSavingsPlanProjection } from '../lib/math/savings';

describe('Savings Plan Math', () => {
  it('calculates savings plan projection correctly for positive years', () => {
    const result = calculateSavingsPlanProjection(1000, 100, 5, 5, 60);

    expect(result.chartData.length).toBe(6); // Year 0 + 5 years
    expect(result.chartData[0]).toEqual({ year: 0, invested: 1000, value: 1000 });

    // Check final totals roughly (1000 initial + 100/mo * 60 = 7000 invested)
    expect(result.finalInvested).toBe(7000);
    expect(result.finalTotalValue).toBeGreaterThan(7000); // Because of 5% return
  });

  it('handles zero or negative years by returning initial values', () => {
    const resultZero = calculateSavingsPlanProjection(1000, 100, 0, 5, 60);
    expect(resultZero.chartData.length).toBe(1);
    expect(resultZero.finalInvested).toBe(1000);
    expect(resultZero.finalTotalValue).toBe(1000);

    const resultNegative = calculateSavingsPlanProjection(1000, 100, -5, 5, 60);
    expect(resultNegative.chartData.length).toBe(1);
    expect(resultNegative.finalInvested).toBe(1000);
    expect(resultNegative.finalTotalValue).toBe(1000);
  });

  it('respects stopAccumulatingMonths', () => {
    // 5 years = 60 months. Stop at 12 months.
    const result = calculateSavingsPlanProjection(0, 100, 5, 0, 12);

    // Total invested should be 1200
    expect(result.finalInvested).toBe(1200);
    // Because expectedReturn is 0, finalTotalValue should also be 1200
    expect(result.finalTotalValue).toBe(1200);
  });
});
