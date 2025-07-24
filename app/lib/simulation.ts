import { UserInputs, SimulationResult } from '../types';
import { getBrackets, calcMarginalTaxRate, calcTotalTax, getOptimalConversionAmount } from './taxEngine';
import { getRmd } from './rmd';

export function runSimulation(inputs: UserInputs): SimulationResult[] {
  const results: SimulationResult[] = [];
  const brackets = getBrackets(inputs.filingStatus);
  
  let traditionalBalance = inputs.traditionalBalance;
  let rothBalance = inputs.rothBalance;
  let taxableBalance = inputs.taxableBalance || 0;
  let cumulativeTaxPaid = 0;
  
  // Track no-conversion scenario - same starting point but no conversions
  let noConversionTraditional = inputs.traditionalBalance;
  let noConversionRoth = inputs.rothBalance;
  let noConversionTaxable = inputs.taxableBalance || 0;
  
  // Track if one-time conversion has been done
  let oneTimeConversionDone = false;
  
  for (let year = 1; year <= inputs.simulationYears; year++) {
    const age1 = inputs.age1 + year - 1;
    const age2 = inputs.age2 + year - 1;
    const isRetired = age1 >= inputs.retirementAge;
    
    // Get income for this year
    let currentYearIncome: number;
    if (year <= 10) {
      // Use specific yearly income for first 10 years
      currentYearIncome = inputs.yearlyIncomes[year - 1] || inputs.annualIncome;
    } else if (isRetired) {
      // Use retirement income after retirement age
      currentYearIncome = inputs.retirementIncome;
    } else {
      // Use last working year income for remaining working years
      currentYearIncome = inputs.yearlyIncomes[9] || inputs.annualIncome;
    }
    
    // Determine conversion amount based on strategy
    let conversionAmount = 0;
    
    if (inputs.conversionStrategy === 'one-time' && !oneTimeConversionDone) {
      conversionAmount = Math.min(inputs.annualConversion, traditionalBalance);
      oneTimeConversionDone = true;
    } else if (inputs.conversionStrategy === 'annual') {
      conversionAmount = Math.min(
        inputs.annualConversion,
        traditionalBalance * (inputs.conversionPercentage / 100)
      );
    } else if (inputs.conversionStrategy === 'bracket-optimization') {
      // Only convert if not retired and we have room in target bracket
      if (!isRetired) {
        conversionAmount = getOptimalConversionAmount(
          currentYearIncome,
          traditionalBalance,
          brackets,
          inputs.targetTaxBracket
        );
      }
    }
    
    // Calculate tax on conversion
    const taxableIncome = currentYearIncome + conversionAmount;
    const marginalTaxRate = calcMarginalTaxRate(taxableIncome, brackets);
    const conversionTax = calcTotalTax(conversionAmount, brackets, inputs.enableStateTax ? inputs.stateTaxRate : 0);
    
    // Apply conversion
    traditionalBalance -= conversionAmount;
    rothBalance += conversionAmount;
    if (inputs.taxableBalance !== undefined) {
      taxableBalance -= conversionTax;
    }
    
    // Calculate RMD if applicable (only if retired)
    const rmdAmount = isRetired && age1 >= 72 ? getRmd(traditionalBalance, age1) : 0;
    const rmdTax = rmdAmount > 0 ? calcTotalTax(rmdAmount, brackets, inputs.enableStateTax ? inputs.stateTaxRate : 0) : 0;
    
    // Apply RMD
    traditionalBalance -= rmdAmount;
    if (inputs.taxableBalance !== undefined) {
      taxableBalance -= rmdTax;
    }
    
    // Apply investment growth (only if growth assumptions provided)
    const expectedReturn = typeof inputs.expectedReturn === 'string' ? parseFloat(inputs.expectedReturn) / 100 : inputs.expectedReturn;
    const taxableYield = typeof inputs.taxableYield === 'string' ? parseFloat(inputs.taxableYield) / 100 : inputs.taxableYield;
    
    if (expectedReturn !== undefined && expectedReturn > 0) {
      traditionalBalance *= (1 + expectedReturn);
      rothBalance *= (1 + expectedReturn);
      if (taxableYield !== undefined && taxableYield > 0 && inputs.taxableBalance !== undefined) {
        taxableBalance *= (1 + taxableYield);
      }
    }
    
    // Calculate no-conversion scenario - same logic but no conversions
    const noConversionRmdAmount = isRetired && age1 >= 72 ? getRmd(noConversionTraditional, age1) : 0;
    const noConversionRmdTax = noConversionRmdAmount > 0 ? calcTotalTax(noConversionRmdAmount, brackets, inputs.enableStateTax ? inputs.stateTaxRate : 0) : 0;
    
    noConversionTraditional -= noConversionRmdAmount;
    if (inputs.taxableBalance !== undefined) {
      noConversionTaxable -= noConversionRmdTax;
    }
    
    if (expectedReturn !== undefined && expectedReturn > 0) {
      noConversionTraditional *= (1 + expectedReturn);
      noConversionRoth *= (1 + expectedReturn);
      if (taxableYield !== undefined && taxableYield > 0 && inputs.taxableBalance !== undefined) {
        noConversionTaxable *= (1 + taxableYield);
      }
    }
    
    // Calculate total after-tax wealth
    const totalAfterTaxWealth = traditionalBalance + rothBalance + Math.max(0, taxableBalance);
    const noConversionWealth = noConversionTraditional + noConversionRoth + Math.max(0, noConversionTaxable);
    
    // Check for break-even - when conversion strategy becomes beneficial
    const breakEven = totalAfterTaxWealth > noConversionWealth;
    
    cumulativeTaxPaid += conversionTax + rmdTax;
    
    results.push({
      year,
      age1,
      age2,
      traditionalBalance,
      rothBalance,
      taxableBalance: inputs.taxableBalance !== undefined ? taxableBalance : undefined,
      conversionAmount,
      conversionTax,
      marginalTaxRate,
      rmdAmount,
      rmdTax,
      cumulativeTaxPaid,
      totalAfterTaxWealth,
      noConversionWealth,
      conversionWealth: totalAfterTaxWealth,
      breakEven,
      isRetired,
      annualIncome: currentYearIncome
    });
  }
  
  return results;
}

export function findBreakEvenYear(results: SimulationResult[]): number | null {
  for (const result of results) {
    if (result.breakEven) {
      return result.year;
    }
  }
  return null;
}

export function calculateTotalTaxSavings(results: SimulationResult[]): number {
  if (results.length === 0) return 0;
  const lastResult = results[results.length - 1];
  return lastResult.conversionWealth - lastResult.noConversionWealth;
}

// New function to analyze if conversion makes sense for bracket optimization
export function analyzeBracketOptimization(
  currentIncome: number,
  traditionalBalance: number,
  targetBracket: number,
  filingStatus: 'single' | 'mfj',
  yearlyIncomes?: number[]
): { shouldConvert: boolean; recommendedAmount: number; reasoning: string; yearlyRecommendations?: Array<{year: number, income: number, recommendedAmount: number}> } {
  const brackets = getBrackets(filingStatus);
  const currentBracket = calcMarginalTaxRate(currentIncome, brackets);
  
  // If we have yearly incomes, analyze the full scenario
  if (yearlyIncomes && yearlyIncomes.length > 0) {
    const yearlyRecommendations = [];
    let totalRecommended = 0;
    
    for (let year = 0; year < Math.min(10, yearlyIncomes.length); year++) {
      const yearIncome = yearlyIncomes[year];
      const yearBracket = calcMarginalTaxRate(yearIncome, brackets);
      
      // Only recommend conversions if we're at or below target bracket
      if (yearBracket <= targetBracket) {
        // Find room in the target bracket
        for (const bracket of brackets) {
          if (bracket.rate === targetBracket && bracket.cap) {
            const roomInBracket = bracket.cap - yearIncome;
            const recommendedAmount = Math.min(roomInBracket, traditionalBalance - totalRecommended);
            
            if (recommendedAmount > 0) {
              yearlyRecommendations.push({
                year: year + 1,
                income: yearIncome,
                recommendedAmount
              });
              totalRecommended += recommendedAmount;
            }
            break;
          }
        }
      }
    }
    
    if (totalRecommended > 0) {
      return {
        shouldConvert: true,
        recommendedAmount: totalRecommended,
        reasoning: `Convert ${totalRecommended.toLocaleString()} over ${yearlyRecommendations.length} years to fill ${targetBracket * 100}% bracket`,
        yearlyRecommendations
      };
    }
  }
  
  // Fallback to current year analysis
  // If we're already at or below target bracket, convert to fill next bracket
  if (currentBracket <= targetBracket) {
    for (const bracket of brackets) {
      if (bracket.rate > currentBracket && bracket.cap) {
        const roomInBracket = bracket.cap - currentIncome;
        const recommendedAmount = Math.min(roomInBracket, traditionalBalance);
        return {
          shouldConvert: recommendedAmount > 0,
          recommendedAmount,
          reasoning: `Convert up to ${bracket.label} bracket (${bracket.rate * 100}%)`
        };
      }
    }
    // If at top bracket, convert a reasonable amount
    const recommendedAmount = Math.min(traditionalBalance * 0.1, 50000);
    return {
      shouldConvert: recommendedAmount > 0,
      recommendedAmount,
      reasoning: `Convert ${recommendedAmount.toLocaleString()} at current rate (${currentBracket * 100}%)`
    };
  }
  
  // If above target bracket, convert to get down to target bracket
  let conversionAmount = 0;
  let testIncome = currentIncome;
  
  for (const bracket of brackets) {
    if (bracket.rate <= targetBracket && bracket.cap) {
      const roomInBracket = bracket.cap - testIncome;
      if (roomInBracket > 0) {
        conversionAmount += roomInBracket;
        testIncome = bracket.cap;
      }
    }
  }
  
  const finalAmount = Math.min(conversionAmount, traditionalBalance);
  return {
    shouldConvert: finalAmount > 0,
    recommendedAmount: finalAmount,
    reasoning: `Convert to reach ${targetBracket * 100}% bracket`
  };
}

export function analyzeTaxBrackets(
  currentIncome: number,
  traditionalBalance: number,
  filingStatus: 'single' | 'mfj'
): Array<{ bracket: number; rate: number; maxIncome: number; roomInBracket: number; suggestedConversion: number }> {
  const brackets = getBrackets(filingStatus);
  const analysis = [];
  
  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    const maxIncome = bracket.cap || Infinity;
    const roomInBracket = Math.max(0, maxIncome - currentIncome);
    const suggestedConversion = Math.min(roomInBracket, traditionalBalance);
    
    analysis.push({
      bracket: i + 1,
      rate: bracket.rate,
      maxIncome: maxIncome === Infinity ? 0 : maxIncome,
      roomInBracket,
      suggestedConversion
    });
  }
  
  return analysis;
} 