'use client';

import { analyzeTaxBrackets } from '../lib/simulation';
import { Card, CardContent, CardHeader, CardTitle } from './ui';

interface BracketAnalysisProps {
  currentIncome: number;
  traditionalBalance: number;
  filingStatus: 'single' | 'mfj';
}

export function BracketAnalysis({ currentIncome, traditionalBalance, filingStatus }: BracketAnalysisProps) {
  const bracketAnalysis = analyzeTaxBrackets(currentIncome, traditionalBalance, filingStatus);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Bracket Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Current income: {formatCurrency(currentIncome)} | 
            Traditional balance: {formatCurrency(traditionalBalance)}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Bracket</th>
                <th className="text-right py-2">Tax Rate</th>
                <th className="text-right py-2">Max Income</th>
                <th className="text-right py-2">Room in Bracket</th>
                <th className="text-right py-2">Suggested Conversion</th>
              </tr>
            </thead>
            <tbody>
              {bracketAnalysis.map((bracket) => (
                <tr key={bracket.bracket} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-semibold">{bracket.bracket}</td>
                  <td className="text-right py-2">{formatPercentage(bracket.rate)}</td>
                  <td className="text-right py-2">
                    {bracket.maxIncome === 0 ? '∞' : formatCurrency(bracket.maxIncome)}
                  </td>
                  <td className="text-right py-2">{formatCurrency(bracket.roomInBracket)}</td>
                  <td className="text-right py-2 font-semibold">
                    {bracket.suggestedConversion > 0 ? formatCurrency(bracket.suggestedConversion) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <h4 className="font-semibold mb-2">Recommendations</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Convert up to the next tax bracket to minimize marginal tax rate</li>
            <li>• Consider converting to fill the 12% or 22% brackets if possible</li>
            <li>• Balance conversion amount with available taxable funds for tax payment</li>
            <li>• Factor in state taxes (NY: 6.85%) for total tax impact</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 