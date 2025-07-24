'use client';

import { SimulationResult } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui';
import { findBreakEvenYear, calculateTotalTaxSavings, analyzeBracketOptimization } from '../lib/simulation';

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
    ? analyzeBracketOptimization(inputs.annualIncome, inputs.traditionalBalance, inputs.targetTaxBracket, inputs.filingStatus)
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

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Break-Even Year</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {breakEvenYear ? `Year ${breakEvenYear}` : 'Not reached'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              When conversion becomes beneficial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Tax Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${totalTaxSavings > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalTaxSavings)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Lifetime benefit of conversion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Final Wealth</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(lastResult.totalAfterTaxWealth)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              After-tax total at year {lastResult.year}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bracket Optimization Analysis */}
      {bracketAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Bracket Optimization Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${bracketAnalysis.shouldConvert ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                <h4 className="font-semibold mb-2">
                  {bracketAnalysis.shouldConvert ? '✅ Convert Recommended' : '⚠️ Conversion Not Recommended'}
                </h4>
                <p className="text-sm text-gray-700 mb-2">{bracketAnalysis.reasoning}</p>
                {bracketAnalysis.shouldConvert && (
                  <p className="text-sm font-medium">
                    Recommended amount: {formatCurrency(bracketAnalysis.recommendedAmount)}
                  </p>
                )}
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>Current income:</strong> {formatCurrency(inputs.annualIncome)}</p>
                <p><strong>Target bracket:</strong> {formatPercentage(inputs.targetTaxBracket * 100)}</p>
                <p><strong>Traditional IRA balance:</strong> {formatCurrency(inputs.traditionalBalance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversion Details */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conversion Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Year 1 Conversion Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Starting Traditional IRA:</span>
                    <span>{formatCurrency(inputs.traditionalBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Starting Roth IRA:</span>
                    <span>{formatCurrency(inputs.rothBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversion Amount:</span>
                    <span className="font-semibold">{formatCurrency(results[0].conversionAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Conversion Tax:</span>
                    <span>{formatCurrency(results[0].conversionTax)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>After Conversion Traditional:</span>
                    <span>{formatCurrency(inputs.traditionalBalance - results[0].conversionAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>After Conversion Roth:</span>
                    <span>{formatCurrency(inputs.rothBalance + results[0].conversionAmount)}</span>
                  </div>
                  {inputs.expectedReturn && (
                    <>
                      <div className="flex justify-between">
                        <span>Growth Rate:</span>
                        <span>{formatPercentage(inputs.expectedReturn * 100)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>End of Year Traditional:</span>
                        <span>{formatCurrency(results[0].traditionalBalance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>End of Year Roth:</span>
                        <span>{formatCurrency(results[0].rothBalance)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Tax Impact</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Marginal Tax Rate:</span>
                    <span>{formatPercentage(results[0].marginalTaxRate * 100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Effective Tax Rate:</span>
                    <span>{formatPercentage((results[0].conversionTax / results[0].conversionAmount) * 100)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax Paid From:</span>
                    <span>{inputs.taxableBalance !== undefined ? 'Taxable Account' : 'Other Sources'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Balances Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Account Balances Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Year</th>
                  <th className="text-left py-2">Age</th>
                  <th className="text-right py-2">Traditional IRA</th>
                  <th className="text-right py-2">Roth IRA</th>
                  {inputs.taxableBalance !== undefined && (
                    <th className="text-right py-2">Taxable</th>
                  )}
                  <th className="text-right py-2">Total</th>
                  <th className="text-right py-2">Conversion</th>
                  <th className="text-right py-2">Tax Rate</th>
                  <th className="text-center py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 10).map((result) => (
                  <tr key={result.year} className="border-b hover:bg-gray-50">
                    <td className="py-2">{result.year}</td>
                    <td className="py-2">{result.age1}</td>
                    <td className="text-right py-2">{formatCurrency(result.traditionalBalance)}</td>
                    <td className="text-right py-2">{formatCurrency(result.rothBalance)}</td>
                    {inputs.taxableBalance !== undefined && (
                      <td className="text-right py-2">{formatCurrency(Math.max(0, result.taxableBalance || 0))}</td>
                    )}
                    <td className="text-right py-2 font-semibold">{formatCurrency(result.totalAfterTaxWealth)}</td>
                    <td className="text-right py-2">{formatCurrency(result.conversionAmount)}</td>
                    <td className="text-right py-2">{formatPercentage(result.marginalTaxRate * 100)}</td>
                    <td className="text-center py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        result.isRetired ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {result.isRetired ? 'Retired' : 'Working'}
                      </span>
                    </td>
                  </tr>
                ))}
                {results.length > 10 && (
                  <tr className="text-gray-500">
                    <td colSpan={inputs.taxableBalance !== undefined ? 9 : 8} className="text-center py-2">
                      ... and {results.length - 10} more years
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* RMD Analysis */}
      {results.some(r => r.rmdAmount > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>RMD Analysis (After Retirement)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Year</th>
                    <th className="text-left py-2">Age</th>
                    <th className="text-right py-2">RMD Amount</th>
                    <th className="text-right py-2">RMD Tax</th>
                    <th className="text-right py-2">Traditional Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {results.filter(r => r.rmdAmount > 0).slice(0, 10).map((result) => (
                    <tr key={result.year} className="border-b hover:bg-gray-50">
                      <td className="py-2">{result.year}</td>
                      <td className="py-2">{result.age1}</td>
                      <td className="text-right py-2">{formatCurrency(result.rmdAmount)}</td>
                      <td className="text-right py-2">{formatCurrency(result.rmdTax)}</td>
                      <td className="text-right py-2">{formatCurrency(result.traditionalBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tax Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Conversion Tax Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Conversion Amount:</span>
                  <span>{formatCurrency(results.reduce((sum, r) => sum + r.conversionAmount, 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Conversion Tax:</span>
                  <span>{formatCurrency(results.reduce((sum, r) => sum + r.conversionTax, 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Tax Rate:</span>
                  <span>{formatPercentage(
                    (results.reduce((sum, r) => sum + r.conversionTax, 0) / 
                     results.reduce((sum, r) => sum + r.conversionAmount, 0)) * 100
                  )}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">RMD Tax Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total RMD Amount:</span>
                  <span>{formatCurrency(results.reduce((sum, r) => sum + r.rmdAmount, 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total RMD Tax:</span>
                  <span>{formatCurrency(results.reduce((sum, r) => sum + r.rmdTax, 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span>RMD Tax Rate:</span>
                  <span>{formatPercentage(
                    (results.reduce((sum, r) => sum + r.rmdTax, 0) / 
                     results.reduce((sum, r) => sum + r.rmdAmount, 0)) * 100
                  )}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategy Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Strategy Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Conversion Strategy</h4>
              <p className="text-sm text-gray-600">
                {inputs.conversionStrategy === 'one-time' && 
                  `One-time conversion of ${formatCurrency(inputs.annualConversion)} in year 1`
                }
                {inputs.conversionStrategy === 'annual' && 
                  `Annual conversions of ${formatCurrency(inputs.annualConversion)} (${inputs.conversionPercentage}% of balance)`
                }
                {inputs.conversionStrategy === 'bracket-optimization' && 
                  `Convert to fill ${formatPercentage(inputs.targetTaxBracket * 100)} tax bracket`
                }
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Key Insights</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {breakEvenYear && (
                  <li>• Break-even occurs in year {breakEvenYear}</li>
                )}
                {totalTaxSavings > 0 && (
                  <li>• Lifetime tax savings: {formatCurrency(totalTaxSavings)}</li>
                )}
                <li>• Retirement age: {inputs.retirementAge}</li>
                <li>• RMDs start at age 72 (if retired)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 