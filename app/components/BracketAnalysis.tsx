'use client';

import { analyzeTaxBrackets } from '../lib/simulation';
import { getStandardDeduction } from '../lib/taxEngine';
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

  // Get current bracket info
  const currentBracket = bracketAnalysis.find(b => b.rate === bracketAnalysis[0]?.rate);
  const currentBracketIndex = bracketAnalysis.findIndex(b => b.rate === bracketAnalysis[0]?.rate);
  const nextBracket = bracketAnalysis[currentBracketIndex + 1];
  const nextBracketThreshold = nextBracket?.maxIncome || 0;
  const roomInCurrentBracket = currentBracket?.roomInBracket || 0;
  const currentTaxRate = currentBracket?.rate || 0;

  return (
    <Card className="shadow-xl border-0 rounded-3xl">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-3xl">
        <CardTitle className="text-2xl font-bold flex items-center">
          <span className="mr-3">📊</span>
          Tax Bracket Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <div className="space-y-8">
          {/* Current Tax Situation */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-3xl p-8 mb-8">
            <h4 className="font-bold text-indigo-800 mb-4 flex items-center text-xl">
              <span className="mr-3">💡</span>
              Current Tax Situation
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-lg text-indigo-700">
              <div>
                <p className="mb-3"><strong>Current Income:</strong> {formatCurrency(currentIncome)}</p>
                <p className="mb-3"><strong>Traditional IRA Balance:</strong> {formatCurrency(traditionalBalance)}</p>
                <p><strong>Filing Status:</strong> {filingStatus === 'mfj' ? 'Married Filing Jointly' : 'Single'}</p>
              </div>
              <div>
                <p className="mb-3"><strong>Current Tax Bracket:</strong> {formatPercentage(currentTaxRate)}</p>
                <p className="mb-3"><strong>Next Bracket Threshold:</strong> {formatCurrency(nextBracketThreshold)}</p>
                <p><strong>Room in Current Bracket:</strong> {formatCurrency(roomInCurrentBracket)}</p>
              </div>
            </div>
          </div>

          {/* Tax Brackets Table */}
          <div>
            <h4 className="font-bold mb-6 text-2xl">2025 Federal Tax Brackets</h4>
            <div className="overflow-x-auto bg-gray-50 rounded-3xl p-6">
              <table className="w-full text-lg">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-4 px-6 font-bold">Tax Rate</th>
                    <th className="text-right py-4 px-6 font-bold">Income Range</th>
                    <th className="text-right py-4 px-6 font-bold">Room in Bracket</th>
                    <th className="text-right py-4 px-6 font-bold">Suggested Conversion</th>
                  </tr>
                </thead>
                <tbody>
                  {bracketAnalysis.map((bracket, index) => (
                    <tr key={index} className={`border-b border-gray-100 hover:bg-white transition-colors ${
                      bracket.rate === bracketAnalysis[0]?.rate ? 'bg-blue-50 border-blue-200' : ''
                    }`}>
                      <td className="py-4 px-6 font-bold">
                        {formatPercentage(bracket.rate)}
                        {bracket.rate === bracketAnalysis[0]?.rate && (
                          <span className="ml-2 text-blue-600">← Your current bracket</span>
                        )}
                      </td>
                      <td className="text-right py-4 px-6">
                        {bracket.bracket === 1 ? '0' : formatCurrency(bracketAnalysis[bracket.bracket - 2]?.maxIncome || 0)} - {bracket.maxIncome === 0 ? '∞' : formatCurrency(bracket.maxIncome)}
                      </td>
                      <td className="text-right py-4 px-6">
                        {formatCurrency(bracket.roomInBracket)}
                      </td>
                      <td className="text-right py-4 px-6 font-bold text-green-600">
                        {bracket.suggestedConversion > 0 ? formatCurrency(bracket.suggestedConversion) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="font-bold mb-6 text-2xl">Conversion Recommendations</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-3xl p-8">
                <h5 className="font-bold text-green-800 mb-4 text-xl">Conservative Approach</h5>
                <p className="text-lg text-green-700 mb-4">
                  Convert only what fits in your current bracket to avoid moving to a higher tax rate.
                </p>
                <p className="font-bold text-2xl text-green-600">
                  {formatCurrency(bracketAnalysis[0]?.roomInBracket || 0)}
                </p>
                <p className="text-sm text-green-600 mt-2">
                  Safe conversion amount
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-3xl p-8">
                <h5 className="font-bold text-blue-800 mb-4 text-xl">Aggressive Approach</h5>
                <p className="text-lg text-blue-700 mb-4">
                  Convert up to the next bracket threshold, accepting a higher tax rate for more Roth conversion.
                </p>
                <p className="font-bold text-2xl text-blue-600">
                  {formatCurrency(Math.max(0, (bracketAnalysis.find(b => b.rate > bracketAnalysis[0]?.rate)?.maxIncome || 0) - (currentIncome - getStandardDeduction(filingStatus))))}
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  Maximum conversion amount
                </p>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-8">
            <h4 className="font-bold text-amber-800 mb-4 flex items-center text-xl">
              <span className="mr-3">⚠️</span>
              Important Considerations
            </h4>
            <ul className="text-lg text-amber-700 space-y-4">
              <li className="flex items-start">
                <span className="text-amber-500 mr-3 mt-2">•</span>
                <span>Converting more than {formatCurrency(bracketAnalysis[0]?.roomInBracket || 0)} will push you into the {formatPercentage(bracketAnalysis[1]?.rate || 0)} bracket (next bracket up)</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-3 mt-2">•</span>
                <span>Consider your future income expectations when deciding conversion amounts</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-3 mt-2">•</span>
                <span>Remember that Roth conversions are irreversible - you cannot convert back to traditional</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-3 mt-2">•</span>
                <span>Consult with a tax professional before making large conversions</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 