'use client';

import { SimulationResult } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui';
import { findBreakEvenYear, calculateTotalTaxSavings, analyzeBracketOptimization } from '../lib/simulation';
import { calcMarginalTaxRate, getBrackets } from '../lib/taxEngine';

interface ResultsProps {
  results: SimulationResult[];
  inputs: any;
}

export function Results({ results, inputs }: ResultsProps) {
  if (!results || results.length === 0) {
    return null;
  }

  const breakEvenYear = findBreakEvenYear(results);
  const totalTaxSavings = calculateTotalTaxSavings(results);
  const lastResult = results[results.length - 1];

  // Analyze bracket optimization if that strategy is selected
  const bracketAnalysis = inputs.conversionStrategy === 'bracket-optimization' 
    ? analyzeBracketOptimization(inputs.annualIncome, inputs.traditionalBalance, inputs.targetTaxBracket, inputs.filingStatus, inputs.yearlyIncomes)
    : null;

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

  // Get the conversion amount for display
  const conversionAmount = results[0]?.conversionAmount || 0;

  return (
    <div className="space-y-8">

      {/* Combined Tax & Conversion Analysis */}
      <Card className="shadow-xl border-0 rounded-3xl">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-3xl">
          <CardTitle className="text-2xl font-bold flex items-center">
            <span className="mr-3">🎯</span>
            Integrated Tax & Conversion Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Current Year Analysis */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-3xl p-6">
              <h4 className="font-bold text-blue-800 mb-4 flex items-center text-lg">
                <span className="mr-3">📊</span>
                Current Year Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-blue-700">
                <div>
                  <p className="mb-2"><strong>Current Income:</strong> {formatCurrency(inputs.annualIncome)}</p>
                  <p className="mb-2"><strong>Standard Deduction:</strong> {formatCurrency(inputs.filingStatus === 'mfj' ? 29200 : 14600)}</p>
                  <p className="mb-2"><strong>Taxable Income:</strong> {formatCurrency(Math.max(0, inputs.annualIncome - (inputs.filingStatus === 'mfj' ? 29200 : 14600)))}</p>
                  <p className="mb-2"><strong>Current Tax Rate:</strong> {formatPercentage(calcMarginalTaxRate(inputs.annualIncome, getBrackets(inputs.filingStatus), inputs.filingStatus) * 100)}</p>
                </div>
                <div>
                  <p className="mb-2"><strong>Conversion Amount:</strong> {formatCurrency(results[0]?.conversionAmount || 0)}</p>
                  <p className="mb-2"><strong>Conversion Tax:</strong> {formatCurrency(results[0]?.conversionTax || 0)}</p>
                  <p className="mb-2"><strong>Effective Tax Rate on Conversion:</strong> {formatPercentage(results[0]?.conversionAmount > 0 ? (results[0]?.conversionTax / results[0]?.conversionAmount) * 100 : 0)}</p>
                </div>
              </div>
            </div>

            {/* Combined Tax & Conversion Strategy Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-3xl p-6">
              <h4 className="font-bold text-purple-800 mb-4 flex items-center text-lg">
                <span className="mr-3">🎯</span>
                Tax & Conversion Strategy Summary
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-purple-700">
                <div>
                  <p className="mb-2"><strong>Strategy:</strong> {inputs.conversionStrategy === 'bracket-optimization' ? 'Bracket Optimization' : inputs.conversionStrategy === 'one-time' ? 'One-time Conversion' : 'Annual Conversion'}</p>
                  {inputs.conversionStrategy === 'bracket-optimization' && (
                    <p className="mb-2"><strong>Target Bracket:</strong> {formatPercentage((inputs.targetTaxBracket || 0) * 100)}</p>
                  )}
                  <p className="mb-2"><strong>Current Tax Rate:</strong> {formatPercentage(calcMarginalTaxRate(inputs.annualIncome, getBrackets(inputs.filingStatus), inputs.filingStatus) * 100)}</p>
                  {inputs.enableRetirementBracketAnalysis && inputs.retirementTaxBracket && (
                    <p className="mb-2"><strong>Future Tax Rate:</strong> {formatPercentage((inputs.retirementTaxBracket || 0) * 100)}</p>
                  )}
                  <p className="mb-2"><strong>Total Conversions:</strong> {results.filter(r => r.conversionAmount > 0).length} years</p>
                  <p><strong>Total Tax Paid:</strong> {formatCurrency(results.reduce((sum, r) => sum + r.conversionTax, 0))}</p>
                </div>
                <div>
                  <p className="mb-2"><strong>Break-Even Year:</strong> {breakEvenYear ? `Year ${breakEvenYear}` : 'Not reached'}</p>
                  <p className="mb-2"><strong>Room in Current Bracket:</strong> {formatCurrency(results[0]?.conversionAmount || 0)}</p>
                  <p className="mb-2"><strong>Final Traditional Balance:</strong> {formatCurrency(results[results.length - 1]?.traditionalBalance || 0)}</p>
                  <p><strong>Final Roth Balance:</strong> {formatCurrency(results[results.length - 1]?.rothBalance || 0)}</p>
                </div>
              </div>
            </div>
            
            <div className="text-lg text-gray-600 bg-gray-50 p-6 rounded-3xl">
              <p className="mb-2"><strong>Standard Deduction:</strong> {formatCurrency(inputs.filingStatus === 'mfj' ? 29200 : 14600)} ({inputs.filingStatus === 'mfj' ? 'Married' : 'Single'})</p>
              <p className="mb-2"><strong>State Tax Rate:</strong> {formatPercentage(inputs.stateTaxRate * 100)}</p>
              <p><strong>Note:</strong> Tax calculations include standard deductions and state taxes. Married filing jointly provides higher standard deduction, allowing more room for conversions.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Schedule Table */}
      <Card className="shadow-xl border-0 rounded-3xl">
        <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-3xl">
          <CardTitle className="text-2xl font-bold flex items-center">
            <span className="mr-3">📋</span>
            Conversion Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="overflow-x-auto">
            <table className="w-full text-lg">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-bold text-gray-700">Year</th>
                  <th className="text-right py-4 px-6 font-bold text-gray-700">Age</th>
                  <th className="text-right py-4 px-6 font-bold text-gray-700">Conversion</th>
                  <th className="text-right py-4 px-6 font-bold text-gray-700">Tax Rate</th>
                  <th className="text-right py-4 px-6 font-bold text-gray-700">Tax Paid</th>
                  <th className="text-right py-4 px-6 font-bold text-gray-700">Traditional</th>
                  <th className="text-right py-4 px-6 font-bold text-gray-700">Roth</th>
                  <th className="text-right py-4 px-6 font-bold text-gray-700">RMD</th>
                  <th className="text-right py-4 px-6 font-bold text-gray-700">Total Wealth</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 15).map((result, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-bold">{result.year}</td>
                    <td className="text-right py-4 px-6">{result.age1}</td>
                    <td className="text-right py-4 px-6 font-bold text-green-600">
                      {result.conversionAmount > 0 ? formatCurrency(result.conversionAmount) : '-'}
                    </td>
                    <td className="text-right py-4 px-6">{formatPercentage(result.marginalTaxRate * 100)}</td>
                    <td className="text-right py-4 px-6">
                      {result.conversionTax > 0 ? formatCurrency(result.conversionTax) : '-'}
                    </td>
                    <td className="text-right py-4 px-6">{formatCurrency(result.traditionalBalance)}</td>
                    <td className="text-right py-4 px-6">{formatCurrency(result.rothBalance)}</td>
                    <td className="text-right py-4 px-6">
                      {result.rmdAmount > 0 ? formatCurrency(result.rmdAmount) : '-'}
                    </td>
                    <td className="text-right py-4 px-6 font-bold">{formatCurrency(result.totalAfterTaxWealth)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {results.length > 15 && (
            <div className="text-center text-lg text-gray-500 mt-6">
              Showing first 15 years of {results.length} total years
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 