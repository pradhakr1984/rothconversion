export interface TaxBracket {
  rate: number;
  cap: number | null;
  label: string;
}

export interface UserInputs {
  age1: number;
  age2: number;
  filingStatus: 'single' | 'mfj';
  retirementAge: number;
  traditionalBalance: number;
  rothBalance: number;
  taxableBalance?: number;
  annualIncome: number;
  // Multi-year income support
  yearlyIncomes: number[]; // Array of 10 years of income
  retirementIncome: number; // Income after retirement
  
  // Conversion strategy - only one should be active
  conversionStrategy: 'one-time' | 'annual' | 'bracket-optimization';
  
  // Strategy-specific parameters
  oneTimeConversionAmount?: number; // For one-time strategy only
  annualConversionAmount?: number; // For annual strategy only
  targetTaxBracket?: number; // For bracket-optimization strategy only
  
  // Legacy field for backward compatibility - will be removed
  conversionPercentage: number;
  
  expectedReturn?: number | string; // Can be string from form, transformed to number
  taxableYield?: number | string; // Can be string from form, transformed to number
  simulationYears: number;
  stateTaxRate: number; // Stored as percentage (e.g., 6.85 for 6.85%)
  enableStateTax: boolean;
  
  // Tax rate analysis
  enableRetirementBracketAnalysis: boolean;
  retirementTaxBracket?: number; // Expected future tax rate (e.g., 0.22 for 22%)
}

export interface SimulationResult {
  year: number;
  age1: number;
  age2: number;
  traditionalBalance: number;
  rothBalance: number;
  taxableBalance?: number;
  conversionAmount: number;
  conversionTax: number;
  marginalTaxRate: number;
  rmdAmount: number;
  rmdTax: number;
  cumulativeTaxPaid: number;
  totalAfterTaxWealth: number;
  noConversionWealth: number;
  conversionWealth: number;
  breakEven: boolean;
  isRetired: boolean;
  annualIncome: number; // Add current year's income
}

export interface MonteCarloResult {
  percentile: number;
  traditionalBalance: number;
  rothBalance: number;
  totalWealth: number;
}

export interface ChartData {
  name: string;
  traditional: number;
  roth: number;
  taxable?: number;
  total: number;
}

export interface BracketAnalysis {
  bracket: number;
  rate: number;
  maxIncome: number;
  roomInBracket: number;
  suggestedConversion: number;
} 