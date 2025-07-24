export function generateLogNormalReturn(mean: number, stdDev: number): number {
  // Box-Muller transform for log-normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.exp(mean + stdDev * z0);
}

export function runMonteCarloSimulation(
  initialTraditional: number,
  initialRoth: number,
  years: number,
  expectedReturn: number,
  volatility: number = 0.15,
  runs: number = 1000
): Array<{ traditional: number; roth: number; total: number }> {
  const results = [];
  
  for (let run = 0; run < runs; run++) {
    let traditional = initialTraditional;
    let roth = initialRoth;
    
    for (let year = 0; year < years; year++) {
      const returnRate = generateLogNormalReturn(expectedReturn, volatility);
      
      traditional *= (1 + returnRate);
      roth *= (1 + returnRate);
    }
    
    results.push({
      traditional,
      roth,
      total: traditional + roth
    });
  }
  
  return results;
}

export function calculatePercentiles(
  results: Array<{ traditional: number; roth: number; total: number }>,
  percentiles: number[] = [10, 25, 50, 75, 90]
): Array<{ percentile: number; traditional: number; roth: number; total: number }> {
  const sorted = results.sort((a, b) => a.total - b.total);
  
  return percentiles.map(p => {
    const index = Math.floor((p / 100) * (sorted.length - 1));
    return {
      percentile: p,
      ...sorted[index]
    };
  });
}

export function runGrowthScenarios(
  traditionalBalance: number,
  rothBalance: number,
  years: number,
  scenarios: Array<{ name: string; return: number; volatility: number }>
): Array<{ scenario: string; traditional: number; roth: number; total: number }> {
  return scenarios.map(scenario => {
    const result = runMonteCarloSimulation(
      traditionalBalance,
      rothBalance,
      years,
      scenario.return,
      scenario.volatility,
      1
    )[0];
    
    return {
      scenario: scenario.name,
      ...result
    };
  });
} 