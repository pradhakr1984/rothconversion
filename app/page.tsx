'use client';

import { useState } from 'react';
import { UserInputs, SimulationResult } from './types';
import { runSimulation } from './lib/simulation';
import { Inputs } from './components/Inputs';
import { Results } from './components/Results';
import { TaxTable } from './components/TaxTable';
import { BracketAnalysis } from './components/BracketAnalysis';

export default function Home() {
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [inputs, setInputs] = useState<UserInputs | null>(null);
  const [filingStatus, setFilingStatus] = useState<'single' | 'mfj'>('mfj');

  const handleSubmit = (data: UserInputs) => {
    setInputs(data);
    setFilingStatus(data.filingStatus);
    const simulationResults = runSimulation(data);
    setResults(simulationResults);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🧮 Roth Conversion Optimizer
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Visualize and optimize Roth IRA conversions with tax bracket analysis, 
            RMD planning, and investment growth projections.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <Inputs onSubmit={handleSubmit} />
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {results.length > 0 && inputs && (
              <Results results={results} inputs={inputs} />
            )}
          </div>
        </div>

        {/* Tax Bracket Analysis */}
        {inputs && (
          <div className="mt-8">
            <BracketAnalysis 
              currentIncome={inputs.annualIncome}
              traditionalBalance={inputs.traditionalBalance}
              filingStatus={inputs.filingStatus}
            />
          </div>
        )}

        {/* Tax Table */}
        <div className="mt-8">
          <TaxTable filingStatus={filingStatus} />
        </div>

        {/* Information Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-3">Why Convert to Roth?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Tax-free growth and withdrawals</li>
              <li>• No required minimum distributions (RMDs)</li>
              <li>• Potential estate planning benefits</li>
              <li>• Hedge against future tax rate increases</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-3">Key Considerations</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Pay taxes now vs. later</li>
              <li>• Current vs. future tax brackets</li>
              <li>• Investment time horizon</li>
              <li>• Other income sources in retirement</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-3">Important Notes</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• This is for educational purposes only</li>
              <li>• Consult with a tax professional</li>
              <li>• Tax laws may change</li>
              <li>• Investment returns are not guaranteed</li>
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Frequently Asked Questions</h3>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-800">Why do I need a retirement date?</h4>
              <p>RMDs only apply after you retire. This helps calculate the true tax impact of required distributions.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Is the taxable account balance required?</h4>
              <p>No, it's optional. It's only needed if you want to track how much you'll pay in taxes from your taxable account.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">Are growth assumptions required?</h4>
              <p>No, you can leave them blank for basic tax analysis. Growth assumptions are only needed for long-term projections.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">What's the difference between conversion strategies?</h4>
              <ul className="mt-2 space-y-1">
                <li>• <strong>One-time:</strong> Convert a fixed amount once</li>
                <li>• <strong>Annual:</strong> Convert a fixed amount each year</li>
                <li>• <strong>Bracket optimization:</strong> Convert to fill a target tax bracket</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            Built with Next.js, TypeScript, and Tailwind CSS. 
            Tax calculations based on 2025 federal brackets and NY state tax (6.85%).
          </p>
        </div>
      </div>
    </div>
  );
} 