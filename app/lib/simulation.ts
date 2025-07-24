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
  let noConversionWealth = inputs.traditionalBalance + inputs.rothBalance + (inputs.taxableBalance || 0);
  
  // Track if one-time conversion has been done
  let oneTimeConversionDone = false;
  
  for (let year = 1; year <= inputs.simulationYears; year++) {
    const age1 = inputs.age1 + year - 1;
    const age2 = inputs.age2 + year - 1;
    const isRetired = age1 >= inputs.retirementAge;
    
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
          inputs.annualIncome,
          traditionalBalance,
          brackets,
          inputs.targetTaxBracket
        );
      }
    }
    
    // Calculate tax on conversion
    const taxableIncome = inputs.annualIncome + conversionAmount;
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
    if (inputs.expectedReturn !== undefined) {
      traditionalBalance *= (1 + inputs.expectedReturn);
      rothBalance *= (1 + inputs.expectedReturn);
      if (inputs.taxableYield !== undefined && inputs.taxableBalance !== undefined) {
        taxableBalance *= (1 + inputs.taxableYield);
      }
    }
    
    // Calculate no-conversion scenario for break-even analysis
    if (inputs.expectedReturn !== undefined) {
      noConversionWealth *= (1 + inputs.expectedReturn);
    }
    
    // Calculate total after-tax wealth
    const totalAfterTaxWealth = traditionalBalance + rothBalance + Math.max(0, taxableBalance);
    
    // Check for break-even
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
      isRetired
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