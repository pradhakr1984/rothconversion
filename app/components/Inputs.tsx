'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserInputs } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui';
import { NY_STATE_TAX_RATE } from '../lib/taxEngine';

const inputSchema = z.object({
  age1: z.number().min(18).max(100),
  age2: z.number().min(18).max(100),
  filingStatus: z.enum(['single', 'mfj']),
  retirementAge: z.number().min(50).max(80),
  traditionalBalance: z.number().min(0),
  rothBalance: z.number().min(0),
  taxableBalance: z.number().min(0).optional(),
  annualIncome: z.number().min(0),
  yearlyIncomes: z.array(z.number().min(0)).length(10),
  retirementIncome: z.number().min(0),
  conversionStrategy: z.enum(['one-time', 'annual', 'bracket-optimization']),
  annualConversion: z.number().min(0),
  conversionPercentage: z.number().min(0).max(100),
  targetTaxBracket: z.number().min(0.10).max(0.37),
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
});

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
  } = useForm<UserInputs>({
    resolver: zodResolver(inputSchema),
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
      conversionStrategy: 'one-time',
      annualConversion: 200000, // Updated to $200k
      conversionPercentage: 10,
      targetTaxBracket: 0.22,
      expectedReturn: '',
      taxableYield: '',
      simulationYears: 30,
      stateTaxRate: NY_STATE_TAX_RATE * 100, // Convert to percentage for display
      enableStateTax: true,
      ...defaultValues,
    },
  });

  const watchedValues = watch();
  const conversionStrategy = watchedValues.conversionStrategy;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const handleFormSubmit = (data: UserInputs) => {
    // Transform string inputs to numbers for simulation
    const transformedData = {
      ...data,
      expectedReturn: typeof data.expectedReturn === 'string' && data.expectedReturn.trim() !== '' 
        ? parseFloat(data.expectedReturn) / 100 
        : undefined,
      taxableYield: typeof data.taxableYield === 'string' && data.taxableYield.trim() !== '' 
        ? parseFloat(data.taxableYield) / 100 
        : undefined,
      stateTaxRate: data.stateTaxRate / 100, // Convert percentage to decimal
    };
    onSubmit(transformedData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roth Conversion Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Age (Person 1)</label>
                <input
                  type="number"
                  {...register('age1', { valueAsNumber: true })}
                  className="w-full p-2 border rounded-md"
                  min="18"
                  max="100"
                />
                {errors.age1 && <p className="text-red-500 text-sm">{errors.age1.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Age (Person 2)</label>
                <input
                  type="number"
                  {...register('age2', { valueAsNumber: true })}
                  className="w-full p-2 border rounded-md"
                  min="18"
                  max="100"
                />
                {errors.age2 && <p className="text-red-500 text-sm">{errors.age2.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Filing Status</label>
                <select {...register('filingStatus')} className="w-full p-2 border rounded-md">
                  <option value="mfj">Married Filing Jointly</option>
                  <option value="single">Single</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Retirement Age</label>
                <input
                  type="number"
                  {...register('retirementAge', { valueAsNumber: true })}
                  className="w-full p-2 border rounded-md"
                  min="50"
                  max="80"
                />
                <p className="text-sm text-gray-500 mt-1">
                  RMDs only apply after retirement
                </p>
              </div>
            </div>
          </div>

          {/* Account Balances */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Account Balances</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Traditional IRA</label>
                <input
                  type="number"
                  {...register('traditionalBalance', { valueAsNumber: true })}
                  className="w-full p-2 border rounded-md"
                  placeholder="1,600,000"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Current: {formatCurrency(watchedValues.traditionalBalance || 0)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Roth IRA</label>
                <input
                  type="number"
                  {...register('rothBalance', { valueAsNumber: true })}
                  className="w-full p-2 border rounded-md"
                  placeholder="0"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Current: {formatCurrency(watchedValues.rothBalance || 0)}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Taxable Account (Optional)</label>
              <input
                type="number"
                {...register('taxableBalance', { valueAsNumber: true })}
                className="w-full p-2 border rounded-md"
                placeholder="200,000 (optional)"
              />
              <p className="text-sm text-gray-500 mt-1">
                Only needed if you want to track taxable account for tax payments
              </p>
            </div>
          </div>

          {/* Multi-Year Income */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Income Projection</h3>
            
            {/* Helpful explanation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">💡 Bracket Optimization with Changing Income</h4>
              <p className="text-sm text-blue-700 mb-2">
                When you select "Bracket optimization" strategy, the calculator will:
              </p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Analyze each year's income to find optimal conversion amounts</li>
                <li>Convert more in low-income years (like between jobs)</li>
                <li>Convert less in high-income years</li>
                <li>Target your specified tax bracket (e.g., 22%)</li>
              </ul>
              <p className="text-sm text-blue-700 mt-2">
                <strong>Example:</strong> If you're between jobs now (lower income) but expect higher income later, 
                this strategy will recommend larger conversions now and smaller ones later.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Annual Income (Current)</label>
              <input
                type="number"
                {...register('annualIncome', { valueAsNumber: true })}
                className="w-full p-2 border rounded-md"
                placeholder="150,000"
              />
              <p className="text-sm text-gray-500 mt-1">
                Current: {formatCurrency(watchedValues.annualIncome || 0)}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Income for Next 10 Years</label>
              <div className="space-y-3">
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-16">
                      <label className="block text-sm font-medium text-gray-700">Year {i + 1}</label>
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        {...register(`yearlyIncomes.${i}` as const, { valueAsNumber: true })}
                        className="w-full p-3 border rounded-md text-base"
                        placeholder="150,000"
                        min="0"
                      />
                    </div>
                    <div className="w-32 text-sm text-gray-500">
                      {formatCurrency(watchedValues.yearlyIncomes?.[i] || 0)}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Specify your expected income for each of the next 10 years. This helps optimize conversion timing.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Retirement Income</label>
              <input
                type="number"
                {...register('retirementIncome', { valueAsNumber: true })}
                className="w-full p-2 border rounded-md"
                placeholder="80,000"
              />
              <p className="text-sm text-gray-500 mt-1">
                Income after retirement (Social Security, pensions, etc.)
              </p>
            </div>
          </div>

          {/* Income & Conversions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Income & Conversions</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Conversion Strategy</label>
              <select {...register('conversionStrategy')} className="w-full p-2 border rounded-md">
                <option value="one-time">One-time conversion</option>
                <option value="annual">Annual conversions</option>
                <option value="bracket-optimization">Bracket optimization</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                {conversionStrategy === 'one-time' && 'Convert a specific amount once'}
                {conversionStrategy === 'annual' && 'Convert a percentage annually'}
                {conversionStrategy === 'bracket-optimization' && 'Convert to fill target tax bracket'}
              </p>
            </div>

            {conversionStrategy === 'one-time' && (
              <div>
                <label className="block text-sm font-medium mb-2">One-time Conversion Amount</label>
                <input
                  type="number"
                  {...register('annualConversion', { valueAsNumber: true })}
                  className="w-full p-2 border rounded-md"
                  placeholder="200,000"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Amount to convert in year 1: {formatCurrency(watchedValues.annualConversion || 0)}
                </p>
              </div>
            )}

            {conversionStrategy === 'annual' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Annual Conversion Amount</label>
                  <input
                    type="number"
                    {...register('annualConversion', { valueAsNumber: true })}
                    className="w-full p-2 border rounded-md"
                    placeholder="50,000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Conversion Percentage</label>
                  <input
                    type="number"
                    {...register('conversionPercentage', { valueAsNumber: true })}
                    className="w-full p-2 border rounded-md"
                    placeholder="10"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    % of Traditional IRA balance
                  </p>
                </div>
              </div>
            )}

            {conversionStrategy === 'bracket-optimization' && (
              <div>
                <label className="block text-sm font-medium mb-2">Target Tax Bracket Rate</label>
                <select {...register('targetTaxBracket', { valueAsNumber: true })} className="w-full p-2 border rounded-md">
                  <option value={0.10}>10%</option>
                  <option value={0.12}>12%</option>
                  <option value={0.22}>22%</option>
                  <option value={0.24}>24%</option>
                  <option value={0.32}>32%</option>
                  <option value={0.35}>35%</option>
                  <option value={0.37}>37%</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Convert to fill this tax bracket
                </p>
              </div>
            )}
          </div>

          {/* Investment Assumptions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Investment Assumptions (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Expected Annual Return (%)</label>
                <input
                  type="text"
                  {...register('expectedReturn')}
                  className="w-full p-2 border rounded-md"
                  placeholder="7 (or leave blank)"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Leave blank for basic analysis without growth projections
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Taxable Yield (%)</label>
                <input
                  type="text"
                  {...register('taxableYield')}
                  className="w-full p-2 border rounded-md"
                  placeholder="3 (or leave blank)"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Only needed if tracking taxable account for tax payments
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Simulation Years</label>
              <input
                type="number"
                {...register('simulationYears', { valueAsNumber: true })}
                className="w-full p-2 border rounded-md"
                placeholder="30"
                min="1"
                max="50"
              />
              <p className="text-sm text-gray-500 mt-1">
                How many years to project forward
              </p>
            </div>
          </div>

          {/* Tax Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tax Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">State Tax Rate (%)</label>
                <input
                  type="number"
                  {...register('stateTaxRate', { 
                    valueAsNumber: true,
                    setValueAs: (value) => parseFloat(value) / 100
                  })}
                  className="w-full p-2 border rounded-md"
                  placeholder="6.85"
                  step="0.01"
                  min="0"
                  max="15"
                  defaultValue={NY_STATE_TAX_RATE * 100}
                />
                <p className="text-sm text-gray-500 mt-1">
                  NY State: 6.85%
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('enableStateTax')}
                  className="rounded"
                />
                <label className="text-sm font-medium">Include State Tax</label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Calculate Roth Conversion
          </button>
        </form>
      </CardContent>
    </Card>
  );
} 