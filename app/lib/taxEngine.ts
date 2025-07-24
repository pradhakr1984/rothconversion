import { TaxBracket } from '../types';

// 2025 Federal Tax Brackets (Married Filing Jointly)
export const MFJ_BRACKETS: TaxBracket[] = [
  { rate: 0.10, cap: 22000, label: '10%' },
  { rate: 0.12, cap: 89450, label: '12%' },
  { rate: 0.22, cap: 190750, label: '22%' },
  { rate: 0.24, cap: 364200, label: '24%' },
  { rate: 0.32, cap: 462500, label: '32%' },
  { rate: 0.35, cap: 693750, label: '35%' },
  { rate: 0.37, cap: null, label: '37%' },
];

// 2025 Federal Tax Brackets (Single)
export const SINGLE_BRACKETS: TaxBracket[] = [
  { rate: 0.10, cap: 11000, label: '10%' },
  { rate: 0.12, cap: 44725, label: '12%' },
  { rate: 0.22, cap: 95375, label: '22%' },
  { rate: 0.24, cap: 182100, label: '24%' },
  { rate: 0.32, cap: 231250, label: '32%' },
  { rate: 0.35, cap: 346875, label: '35%' },
  { rate: 0.37, cap: null, label: '37%' },
];

// New York State Tax Rate (2024-2025)
export const NY_STATE_TAX_RATE = 0.0685; // 6.85% for most income levels

export function getBrackets(filingStatus: 'single' | 'mfj'): TaxBracket[] {
  return filingStatus === 'single' ? SINGLE_BRACKETS : MFJ_BRACKETS;
}

export function calcMarginalTax(income: number, brackets: TaxBracket[]): number {
  let tax = 0;
  let remaining = income;
  
  for (const bracket of brackets) {
    if (bracket.cap === null || remaining <= bracket.cap) {
      tax += remaining * bracket.rate;
      break;
    }
    tax += bracket.cap * bracket.rate;
    remaining -= bracket.cap;
  }
  
  return tax;
}

export function calcMarginalTaxRate(income: number, brackets: TaxBracket[]): number {
  for (const bracket of brackets) {
    if (bracket.cap === null || income <= bracket.cap) {
      return bracket.rate;
    }
  }
  return brackets[brackets.length - 1].rate;
}

export function calcTotalTax(income: number, brackets: TaxBracket[], stateTaxRate: number = 0): number {
  const federalTax = calcMarginalTax(income, brackets);
  const stateTax = income * stateTaxRate;
  return federalTax + stateTax;
}

export function calcEffectiveTaxRate(income: number, brackets: TaxBracket[], stateTaxRate: number = 0): number {
  if (income === 0) return 0;
  return calcTotalTax(income, brackets, stateTaxRate) / income;
}

// Helper function to get the optimal conversion amount for a given tax bracket
export function getOptimalConversionAmount(
  currentIncome: number,
  traditionalBalance: number,
  brackets: TaxBracket[],
  targetBracket: number
): number {
  const currentBracket = calcMarginalTaxRate(currentIncome, brackets);
  
  // If we're already at or below the target bracket, convert to fill the target bracket
  if (currentBracket <= targetBracket) {
    // Find the target bracket threshold
    for (const bracket of brackets) {
      if (bracket.rate === targetBracket && bracket.cap) {
        const roomInBracket = bracket.cap - currentIncome;
        return Math.min(roomInBracket, traditionalBalance);
      }
    }
    // If target bracket is not found or has no cap, convert a reasonable amount
    return Math.min(traditionalBalance * 0.1, 50000); // 10% or $50k, whichever is less
  }
  
  // If we're above the target bracket, convert to get down to the target bracket
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
  
  return Math.min(conversionAmount, traditionalBalance);
} 