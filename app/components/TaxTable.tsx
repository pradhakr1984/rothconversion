'use client';

import { getBrackets } from '../lib/taxEngine';
import { Card, CardContent, CardHeader, CardTitle } from './ui';

interface TaxTableProps {
  filingStatus: 'single' | 'mfj';
}

export function TaxTable({ filingStatus }: TaxTableProps) {
  const brackets = getBrackets(filingStatus);
  
  const formatCurrency = (value: number | null) => {
    if (value === null) return '∞';
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
    <Card className="shadow-xl border-0 rounded-3xl">
      <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-3xl">
        <CardTitle className="text-2xl font-bold flex items-center">
          <span className="mr-3">🏛️</span>
          2025 Federal Tax Brackets - {filingStatus === 'mfj' ? 'Married Filing Jointly' : 'Single'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-8">
          <div className="overflow-x-auto bg-gray-50 rounded-3xl p-6">
            <table className="w-full text-lg">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-bold">Tax Rate</th>
                  <th className="text-right py-4 px-6 font-bold">Income Range</th>
                  <th className="text-right py-4 px-6 font-bold">Bracket Width</th>
                </tr>
              </thead>
              <tbody>
                {brackets.map((bracket, index) => {
                  const previousCap = index > 0 ? (brackets[index - 1].cap ?? 0) : 0;
                  const bracketWidth = bracket.cap ? bracket.cap - previousCap : null;
                  
                  return (
                    <tr key={bracket.rate} className="border-b border-gray-100 hover:bg-white transition-colors">
                      <td className="py-4 px-6 font-bold text-emerald-600">
                        {formatPercentage(bracket.rate)}
                      </td>
                      <td className="text-right py-4 px-6">
                        {formatCurrency(previousCap)} - {bracket.cap ? formatCurrency(bracket.cap) : '∞'}
                      </td>
                      <td className="text-right py-4 px-6">
                        {bracketWidth ? formatCurrency(bracketWidth) : '∞'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-8">
            <h4 className="font-bold text-emerald-800 mb-4 flex items-center text-xl">
              <span className="mr-3">💡</span>
              Important Notes
            </h4>
            <ul className="text-lg text-emerald-700 space-y-4">
              <li className="flex items-start">
                <span className="text-emerald-500 mr-3 mt-2">•</span>
                <span>These are the 2025 federal tax brackets. State taxes (like NY's 6.85%) are additional.</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-500 mr-3 mt-2">•</span>
                <span>Roth conversions are taxed at your marginal rate based on total income.</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-500 mr-3 mt-2">•</span>
                <span>Consider converting to fill lower tax brackets (12% or 22%) when possible.</span>
              </li>
              <li className="flex items-start">
                <span className="text-emerald-500 mr-3 mt-2">•</span>
                <span>Tax brackets are indexed for inflation and may change annually.</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 