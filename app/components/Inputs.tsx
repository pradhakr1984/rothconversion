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
  conversionStrategy: z.enum(['one-time', 'annual', 'bracket-optimization']),
  annualConversion: z.number().min(0),
  conversionPercentage: z.number().min(0).max(100),
  targetTaxBracket: z.number().min(0.10).max(0.37),
  expectedReturn: z.number().min(0).max(0.2).optional(),
  taxableYield: z.number().min(0).max(0.1).optional(),
  simulationYears: z.number().min(1).max(50),
  stateTaxRate: z.number().min(0).max(0.15),
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
      conversionStrategy: 'one-time',
      annualConversion: 200000, // Updated to $200k
      conversionPercentage: 10,
      targetTaxBracket: 0.22,
      expectedReturn: undefined,
      taxableYield: undefined,
      simulationYears: 30,
      stateTaxRate: NY_STATE_TAX_RATE,
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roth Conversion Calculator</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

          {/* Income & Conversions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Income & Conversions</h3>
            <div>
              <label className="block text-sm font-medium mb-2">Annual Income</label>
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
              <label className="block text-sm font-medium mb-2">Conversion Strategy</label>
              <select {...register('conversionStrategy')} className="w-full p-2 border rounded-md">
                <option value="one-time">One-time conversion</option>
                <option value="annual">Annual conversions</option>
                <option value="bracket-optimization">Bracket optimization</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                {conversionStrategy === 'one-time' && 'Convert a fixed amount once'}
                {conversionStrategy === 'annual' && 'Convert a fixed amount each year'}
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
                  Amount to convert in the first year only
                </p>
              </div>
            )}

            {conversionStrategy === 'annual' && (
              <div className="space-y-4">
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
                  <label className="block text-sm font-medium mb-2">
                    Conversion Percentage of Traditional Balance
                  </label>
                  <input
                    type="range"
                    {...register('conversionPercentage', { valueAsNumber: true })}
                    className="w-full"
                    min="0"
                    max="100"
                    step="1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Current: {formatPercentage(watchedValues.conversionPercentage || 0)}
                  </p>
                </div>
              </div>
            )}

            {conversionStrategy === 'bracket-optimization' && (
              <div>
                <label className="block text-sm font-medium mb-2">Target Tax Bracket Rate</label>
                <select {...register('targetTaxBracket', { valueAsNumber: true })} className="w-full p-2 border rounded-md">
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

          {/* Investment Assumptions (Optional) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Investment Assumptions (Optional)</h3>
            <p className="text-sm text-gray-600 mb-4">
              Leave blank for basic tax analysis without growth projections
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Expected Annual Return</label>
                <input
                  type="range"
                  {...register('expectedReturn', { valueAsNumber: true })}
                  className="w-full"
                  min="0"
                  max="0.15"
                  step="0.001"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Current: {watchedValues.expectedReturn ? formatPercentage((watchedValues.expectedReturn) * 100) : 'Not set'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Taxable Account Yield</label>
                <input
                  type="range"
                  {...register('taxableYield', { valueAsNumber: true })}
                  className="w-full"
                  min="0"
                  max="0.08"
                  step="0.001"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Current: {watchedValues.taxableYield ? formatPercentage((watchedValues.taxableYield) * 100) : 'Not set'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Simulation Years</label>
                <input
                  type="range"
                  {...register('simulationYears', { valueAsNumber: true })}
                  className="w-full"
                  min="10"
                  max="50"
                  step="1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Current: {watchedValues.simulationYears || 30} years
                </p>
              </div>
            </div>
          </div>

          {/* Tax Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tax Settings</h3>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register('enableStateTax')}
                className="rounded"
              />
              <label className="text-sm font-medium">Include State Tax (NY: 6.85%)</label>
            </div>
            {watchedValues.enableStateTax && (
              <div>
                <label className="block text-sm font-medium mb-2">State Tax Rate</label>
                <input
                  type="range"
                  {...register('stateTaxRate', { valueAsNumber: true })}
                  className="w-full"
                  min="0"
                  max="0.15"
                  step="0.001"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Current: {formatPercentage((watchedValues.stateTaxRate || 0) * 100)}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Calculate Roth Conversion
          </button>
        </form>
      </CardContent>
    </Card>
  );
} 