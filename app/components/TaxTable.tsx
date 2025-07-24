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

  return (
    <Card>
      <CardHeader>
        <CardTitle>2025 Federal Tax Brackets - {filingStatus === 'mfj' ? 'Married Filing Jointly' : 'Single'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Tax Rate</th>
                <th className="text-right py-2">Income Range</th>
                <th className="text-right py-2">Bracket Width</th>
              </tr>
            </thead>
            <tbody>
              {brackets.map((bracket, index) => {
                const previousCap = index > 0 ? brackets[index - 1].cap : 0;
                const bracketWidth = bracket.cap ? bracket.cap - previousCap : null;
                
                return (
                  <tr key={bracket.rate} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-semibold">{bracket.label}</td>
                    <td className="text-right py-2">
                      {formatCurrency(previousCap)} - {formatCurrency(bracket.cap)}
                    </td>
                    <td className="text-right py-2">
                      {bracketWidth ? formatCurrency(bracketWidth) : '∞'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> These are the 2025 federal tax brackets. State taxes may apply in addition to federal taxes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
} 