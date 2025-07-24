export interface TaxBracket {
  rate: number;
  cap: number | null;
  label: string;
}

export interface UserInputs {
  // Personal Info
  age1: number;
  age2: number;
  filingStatus: 'single' | 'mfj';
  retirementAge: number;
  
  // Account Balances
  traditionalBalance: number;
  rothBalance: number;
  taxableBalance?: number; // Optional - only needed if you want to track taxable account
  
  // Income & Conversions
  annualIncome: number;
  conversionStrategy: 'one-time' | 'annual' | 'bracket-optimization';
  annualConversion: number;
  conversionPercentage: number;
  targetTaxBracket: number; // For bracket optimization
  
  // Investment Assumptions (optional for basic analysis)
  expectedReturn?: number;
  taxableYield?: number;
  simulationYears: number;
  
  // Tax Settings
  stateTaxRate: number;
  enableStateTax: boolean;
}

export interface SimulationResult {
  year: number;
  age1: number;
  age2: number;
  
  // Balances
  traditionalBalance: number;
  rothBalance: number;
  taxableBalance?: number;
  
  // Conversion Details
  conversionAmount: number;
  conversionTax: number;
  marginalTaxRate: number;
  
  // RMD Analysis
  rmdAmount: number;
  rmdTax: number;
  
  // Cumulative Totals
  cumulativeTaxPaid: number;
  totalAfterTaxWealth: number;
  
  // Break-even analysis
  noConversionWealth: number;
  conversionWealth: number;
  breakEven: boolean;
  
  // Retirement status
  isRetired: boolean;
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