'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserInputs } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui';
import { NY_STATE_TAX_RATE } from '../lib/taxEngine';
import { useEffect } from 'react';

// Base schema that all strategies share
const baseSchema = {
  age1: z.number().min(18).max(100),
  age2: z.number().min(18).max(100),
  filingStatus: z.enum(['single', 'mfj']),
  retirementAge: z.number().min(50).max(80),
  traditionalBalance: z.number().min(0),
  rothBalance: z.number().min(0),
  taxableBalance: z.union([z.number().min(0), z.string().optional(), z.undefined()]).optional(),
  annualIncome: z.number().min(0),
  yearlyIncomes: z.array(z.number().min(0)).length(10),
  retirementIncome: z.number().min(0),
  conversionStrategy: z.enum(['one-time', 'annual', 'bracket-optimization']),
  conversionPercentage: z.number().min(0).max(100),
  expectedReturn: z.string().optional().transform(val => {
    if (val === '' || val === undefined || val === null) return undefined;
    const num = parseFloat(val);
    return isNaN(num) ? undefined : num;
  }),
  taxableYield: z.string().optional().transform(val => {
    if (val === '' || val === undefined || val === null) return undefined;
    const num = parseFloat(val);
    return isNaN(num) ? undefined : num;
  }),
  simulationYears: z.number().min(1).max(50),
  stateTaxRate: z.number().min(0).max(15), // Now represents percentage (0-15%)
  enableStateTax: z.boolean(),
  enableRetirementBracketAnalysis: z.boolean(),
  retirementTaxBracket: z.number().optional().or(z.literal('')),
};

// Create a conditional schema based on conversion strategy
const createInputSchema = (conversionStrategy: string) => {
  // Add strategy-specific validation
  if (conversionStrategy === 'one-time') {
    return z.object({
      ...baseSchema,
      oneTimeConversionAmount: z.number().min(1, 'One-time conversion amount is required'),
      annualConversionAmount: z.number().optional(),
      targetTaxBracket: z.number().optional(),
    });
  } else if (conversionStrategy === 'annual') {
    return z.object({
      ...baseSchema,
      oneTimeConversionAmount: z.number().optional(),
      annualConversionAmount: z.number().min(1, 'Annual conversion amount is required'),
      targetTaxBracket: z.number().optional(),
    });
  } else {
    return z.object({
      ...baseSchema,
      oneTimeConversionAmount: z.number().optional(),
      annualConversionAmount: z.number().optional(),
      targetTaxBracket: z.number().optional(),
    });
  }
};

interface InputsProps {
  onSubmit: (data: UserInputs) => void;
  defaultValues?: Partial<UserInputs>;
}

export function Inputs({ onSubmit, defaultValues }: InputsProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<UserInputs>({
    resolver: zodResolver(createInputSchema('bracket-optimization')),
    defaultValues: {
      age1: 45,
      age2: 45,
      filingStatus: 'mfj',
      retirementAge: 65,
      traditionalBalance: 1600000, // Updated to $1.6M
      rothBalance: 0, // Updated to $0
      taxableBalance: undefined,
      annualIncome: 150000,
      yearlyIncomes: Array(10).fill(150000), // Default 10 years at $150k
      retirementIncome: 80000, // Default retirement income
      conversionStrategy: 'bracket-optimization',
      oneTimeConversionAmount: undefined,
      annualConversionAmount: undefined,
      conversionPercentage: 10,
      targetTaxBracket: 0.22, // Default to 22%
      expectedReturn: '',
      taxableYield: '',
      simulationYears: 30,
      stateTaxRate: NY_STATE_TAX_RATE * 100, // Convert to percentage for display
      enableStateTax: true,
      enableRetirementBracketAnalysis: false,
      retirementTaxBracket: undefined,
      ...defaultValues,
    },
  });

  const watchedValues = watch();
  const conversionStrategy = watchedValues.conversionStrategy || 'bracket-optimization';

  // Update schema when conversion strategy changes
  useEffect(() => {
    // Clear strategy-specific fields when switching strategies
    if (conversionStrategy === 'one-time') {
      setValue('annualConversionAmount', undefined);
      setValue('targetTaxBracket', undefined);
    } else if (conversionStrategy === 'annual') {
      setValue('oneTimeConversionAmount', undefined);
      setValue('targetTaxBracket', undefined);
    } else if (conversionStrategy === 'bracket-optimization') {
      setValue('oneTimeConversionAmount', undefined);
      setValue('annualConversionAmount', undefined);
    }
    
    // Trigger validation after clearing fields
    trigger();
  }, [conversionStrategy, setValue, trigger]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const handleFormSubmit = (data: UserInputs) => {
    // Transform string inputs to numbers for simulation
    const transformedData = {
      ...data,
      taxableBalance: data.taxableBalance && Number(data.taxableBalance) > 0 ? Number(data.taxableBalance) : undefined,
      expectedReturn: typeof data.expectedReturn === 'string' && data.expectedReturn.trim() !== '' 
        ? parseFloat(data.expectedReturn) / 100 
        : undefined,
      taxableYield: typeof data.taxableYield === 'string' && data.taxableYield.trim() !== '' 
        ? parseFloat(data.taxableYield) / 100 
        : undefined,
      stateTaxRate: data.stateTaxRate / 100, // Convert percentage to decimal
      retirementTaxBracket: data.retirementTaxBracket ? data.retirementTaxBracket / 100 : undefined,
    };
    onSubmit(transformedData);
  };

  return (
    <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm rounded-3xl">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-3xl">
        <CardTitle className="text-lg lg:text-xl font-bold flex items-center">
          <span className="mr-3">📊</span>
          Roth Conversion Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 lg:p-8">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8 lg:space-y-10">
          {/* Personal Information */}
          <div className="space-y-6 lg:space-y-8">
            <div className="flex items-center mb-6 lg:mb-8">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-2xl flex items-center justify-center mr-3 lg:mr-4">
                <span className="text-blue-600 text-base lg:text-lg">👤</span>
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-gray-900">Personal Information</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Your Age</label>
                <input
                  type="number"
                  {...register('age1', { valueAsNumber: true })}
                  className="w-full p-3 lg:p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base lg:text-lg"
                  placeholder="45"
                  min="18"
                  max="100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Spouse Age (if applicable)</label>
                <input
                  type="number"
                  {...register('age2', { valueAsNumber: true })}
                  className="w-full p-3 lg:p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base lg:text-lg"
                  placeholder="45"
                  min="18"
                  max="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Filing Status</label>
                <select {...register('filingStatus')} className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg">
                  <option value="mfj">Married Filing Jointly</option>
                  <option value="single">Single</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Retirement Age</label>
                <input
                  type="number"
                  {...register('retirementAge', { valueAsNumber: true })}
                  className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                  placeholder="65"
                  min="50"
                  max="80"
                />
              </div>
            </div>
          </div>

          {/* Account Balances */}
          <div className="space-y-6 lg:space-y-8">
            <div className="flex items-center mb-6 lg:mb-8">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-green-100 rounded-2xl flex items-center justify-center mr-3 lg:mr-4">
                <span className="text-green-600 text-base lg:text-lg">💰</span>
              </div>
              <h3 className="text-lg lg:text-xl font-bold text-gray-900">Account Balances</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Traditional IRA Balance</label>
                <input
                  type="number"
                  {...register('traditionalBalance', { valueAsNumber: true })}
                  className="w-full p-3 lg:p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base lg:text-lg"
                  placeholder="1,600,000"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Current: {formatCurrency(watchedValues.traditionalBalance || 0)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Roth IRA Balance</label>
                <input
                  type="number"
                  {...register('rothBalance', { valueAsNumber: true })}
                  className="w-full p-3 lg:p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base lg:text-lg"
                  placeholder="0"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Current: {formatCurrency(watchedValues.rothBalance || 0)}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Taxable Account Balance (Optional)</label>
                              <input
                  type="number"
                  {...register('taxableBalance')}
                  className="w-full p-3 lg:p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base lg:text-lg"
                  placeholder="500,000"
                />
              <p className="text-sm text-gray-500 mt-2">
                Only needed if tracking taxable account for tax payments
              </p>
            </div>
          </div>

          {/* Income & Conversions */}
          <div className="space-y-8">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center mr-4">
                <span className="text-orange-600 text-lg">🔄</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Income & Conversion Strategy</h3>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-3xl p-8 mb-8">
              <h4 className="font-bold text-blue-800 mb-4 flex items-center text-lg">
                <span className="mr-3">💡</span>
                Conversion Strategy Options
              </h4>
              <div className="text-sm text-blue-700 space-y-3">
                <div className="flex items-start">
                  <span className="font-bold mr-2">• One-time:</span>
                  <span>Convert a specific dollar amount once (e.g., $200,000)</span>
                </div>
                <div className="flex items-start">
                  <span className="font-bold mr-2">• Annual:</span>
                  <span>Convert a specific dollar amount each year (e.g., $50,000/year)</span>
                </div>
                <div className="flex items-start">
                  <span className="font-bold mr-2">• Bracket optimization:</span>
                  <span>Convert to fill a target tax bracket rate (e.g., 22%)</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Annual Income (Current)</label>
                <input
                  type="number"
                  {...register('annualIncome', { valueAsNumber: true })}
                  className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                  placeholder="150,000"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Current: {formatCurrency(watchedValues.annualIncome || 0)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Retirement Income</label>
                <input
                  type="number"
                  {...register('retirementIncome', { valueAsNumber: true })}
                  className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                  placeholder="80,000"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Income after retirement (Social Security, pensions, etc.)
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Income for Next 10 Years</label>
              <div className="space-y-4 max-h-60 overflow-y-auto p-6 bg-gray-50 rounded-3xl">
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-16">
                      <label className="block text-sm font-bold text-gray-700">Year {i + 1}</label>
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        {...register(`yearlyIncomes.${i}` as const, { valueAsNumber: true })}
                        className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                        placeholder="150,000"
                        min="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Specify your expected income for each of the next 10 years. This helps optimize conversion timing.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">Conversion Strategy</label>
              <select {...register('conversionStrategy')} className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg">
                <option value="one-time">One-time conversion (specific dollar amount)</option>
                <option value="annual">Annual conversions (specific dollar amount)</option>
                <option value="bracket-optimization">Bracket optimization (target tax rate)</option>
              </select>
              <p className="text-sm text-gray-500 mt-2">
                {conversionStrategy === 'one-time' && 'Convert a specific dollar amount once'}
                {conversionStrategy === 'annual' && 'Convert a specific dollar amount each year'}
                {conversionStrategy === 'bracket-optimization' && 'Convert to fill a target tax bracket rate'}
              </p>
            </div>

            {conversionStrategy === 'one-time' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">One-time Conversion Amount</label>
                <input
                  type="number"
                  {...register('oneTimeConversionAmount', { valueAsNumber: true })}
                  className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                  placeholder="200,000"
                  min="1"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Amount to convert in year 1: {formatCurrency(watchedValues.oneTimeConversionAmount || 0)}
                </p>
                {errors.oneTimeConversionAmount && (
                  <p className="text-red-500 text-sm mt-1">{errors.oneTimeConversionAmount.message}</p>
                )}
              </div>
            )}

            {conversionStrategy === 'annual' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Annual Conversion Amount</label>
                <input
                  type="number"
                  {...register('annualConversionAmount', { valueAsNumber: true })}
                  className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                  placeholder="50,000"
                  min="1"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Amount to convert each year: {formatCurrency(watchedValues.annualConversionAmount || 0)}
                </p>
                {errors.annualConversionAmount && (
                  <p className="text-red-500 text-sm mt-1">{errors.annualConversionAmount.message}</p>
                )}
              </div>
            )}

            {conversionStrategy === 'bracket-optimization' && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Target Tax Bracket Rate</label>
                <select {...register('targetTaxBracket', { valueAsNumber: true })} className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg">
                  <option value={0.10}>10%</option>
                  <option value={0.12}>12%</option>
                  <option value={0.22}>22%</option>
                  <option value={0.24}>24%</option>
                  <option value={0.32}>32%</option>
                  <option value={0.35}>35%</option>
                  <option value={0.37}>37%</option>
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  Convert to fill this target tax bracket rate
                </p>
                {errors.targetTaxBracket && (
                  <p className="text-red-500 text-sm mt-1">{errors.targetTaxBracket.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Investment Assumptions */}
          <div className="space-y-8">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center mr-4">
                <span className="text-purple-600 text-lg">📈</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Investment Assumptions (Optional)</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Expected Annual Return (%)</label>
                <input
                  type="number"
                  {...register('expectedReturn')}
                  className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                  placeholder="7"
                  step="0.1"
                  min="0"
                  max="20"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Leave blank for basic analysis without growth projections
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Taxable Yield (%)</label>
                <input
                  type="number"
                  {...register('taxableYield')}
                  className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                  placeholder="3"
                  step="0.1"
                  min="0"
                  max="10"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Only needed if tracking taxable account for tax payments
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Simulation Years</label>
                <input
                  type="number"
                  {...register('simulationYears', { valueAsNumber: true })}
                  className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                  placeholder="30"
                  min="1"
                  max="50"
                />
                <p className="text-sm text-gray-500 mt-2">
                  How many years to project forward
                </p>
              </div>
            </div>
          </div>

          {/* Tax Settings */}
          <div className="space-y-8">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center mr-4">
                <span className="text-red-600 text-lg">🏛️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Tax Settings</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">State Tax Rate (%)</label>
                <input
                  type="number"
                  {...register('stateTaxRate', { 
                    valueAsNumber: true,
                    setValueAs: (value) => parseFloat(value) / 100
                  })}
                  className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                  placeholder="6.85"
                  step="0.01"
                  min="0"
                  max="15"
                  defaultValue={(NY_STATE_TAX_RATE * 100).toFixed(2)}
                />
                <p className="text-sm text-gray-500 mt-2">
                  NY State: 6.85%
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  {...register('enableStateTax')}
                  className="w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2"
                />
                <label className="text-sm font-bold text-gray-700">Include State Tax</label>
              </div>
            </div>
            
            {/* Tax Rate Analysis */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  {...register('enableRetirementBracketAnalysis')}
                  className="w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2"
                />
                <label className="text-sm font-bold text-gray-700">Enable Tax Rate Analysis</label>
              </div>
              
              {watch('enableRetirementBracketAnalysis') && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Expected Future Tax Rate (%)</label>
                  <input
                    type="number"
                    {...register('retirementTaxBracket', { 
                      valueAsNumber: true
                    })}
                    className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                    placeholder="22"
                    step="1"
                    min="10"
                    max="37"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Enter as percentage (e.g., 22 for 22%)
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Compare converting now vs. paying taxes at this rate in the future
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 lg:py-5 px-6 lg:px-8 rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-bold text-lg lg:text-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            🚀 Calculate Roth Conversion
          </button>
        </form>
      </CardContent>
    </Card>
  );
} 