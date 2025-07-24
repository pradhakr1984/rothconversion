'use client';

import { useState } from 'react';
import { UserInputs, SimulationResult } from './types';
import { runSimulation } from './lib/simulation';
import { Inputs } from './components/Inputs';
import { Results } from './components/Results';
import { BracketAnalysis } from './components/BracketAnalysis';

export default function Home() {
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [inputs, setInputs] = useState<UserInputs | null>(null);
  const [filingStatus, setFilingStatus] = useState<'single' | 'mfj'>('mfj');

  const handleSubmit = (data: UserInputs) => {
    setInputs(data);
    setFilingStatus(data.filingStatus);
    try {
      const simulationResults = runSimulation(data);
      setResults(simulationResults);
    } catch (error) {
      console.error('Simulation error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg text-white">🧮</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Roth Conversion Optimizer
                </h1>
                <p className="text-sm text-gray-600 hidden sm:block">
                  Smart tax planning for your retirement
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-xs text-gray-500">
              <span className="px-2 py-1 bg-gray-100 rounded-md font-mono">Next.js</span>
              <span className="px-2 py-1 bg-gray-100 rounded-md font-mono">TypeScript</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 overflow-hidden">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Optimize Your Roth IRA Conversions
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6 max-w-3xl mx-auto break-words">
              Visualize and optimize Roth IRA conversions with intelligent tax bracket analysis, 
              RMD planning, and investment growth projections.
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Tax bracket optimization</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>RMD planning</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Growth projections</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Inputs onSubmit={handleSubmit} />
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {results.length > 0 && inputs ? (
              <Results results={results} inputs={inputs} />
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-12 text-center border border-gray-200/50 shadow-sm">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 lg:mb-8">
                  <span className="text-2xl lg:text-3xl">📊</span>
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4">
                  Ready to Analyze Your Roth Conversion?
                </h3>
                <p className="text-gray-600 max-w-md mx-auto text-base lg:text-lg">
                  Fill out the form on the left to see your personalized conversion strategy and tax analysis.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Sections */}
        {inputs && (
          <div className="space-y-8 mb-16">
            {/* Tax Bracket Analysis */}
            <div>
              <BracketAnalysis 
                currentIncome={inputs.annualIncome}
                traditionalBalance={inputs.traditionalBalance}
                filingStatus={inputs.filingStatus}
              />
            </div>
          </div>
        )}

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mr-4">
                <span className="text-green-600 text-xl">💡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Why Convert to Roth?</h3>
            </div>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-3 mt-1">✓</span>
                <span>Tax-free growth and withdrawals in retirement</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 mt-1">✓</span>
                <span>No required minimum distributions (RMDs)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 mt-1">✓</span>
                <span>Potential estate planning benefits</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 mt-1">✓</span>
                <span>Hedge against future tax rate increases</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mr-4">
                <span className="text-blue-600 text-xl">⚖️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Key Considerations</h3>
            </div>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 mt-1">•</span>
                <span>Pay taxes now vs. later timing</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 mt-1">•</span>
                <span>Current vs. future tax brackets</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 mt-1">•</span>
                <span>Investment time horizon</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-3 mt-1">•</span>
                <span>Other income sources in retirement</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-gray-200/50 hover:shadow-md transition-all duration-300 md:col-span-2 lg:col-span-1">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center mr-4">
                <span className="text-amber-600 text-xl">⚠️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Important Notes</h3>
            </div>
            <ul className="space-y-4 text-gray-600">
              <li className="flex items-start">
                <span className="text-amber-500 mr-3 mt-1">•</span>
                <span>This is for educational purposes only</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-3 mt-1">•</span>
                <span>Consult with a tax professional</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-3 mt-1">•</span>
                <span>Tax laws may change</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-500 mr-3 mt-1">•</span>
                <span>Investment returns are not guaranteed</span>
              </li>
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-sm border border-gray-200/50 mb-16">
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mr-4">
              <span className="text-purple-600 text-xl">❓</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="border-l-4 border-purple-200 pl-6">
                <h4 className="font-bold text-gray-800 mb-2">Why do I need a retirement date?</h4>
                <p className="text-gray-600">RMDs only apply after you retire. This helps calculate the true tax impact of required distributions.</p>
              </div>
              <div className="border-l-4 border-purple-200 pl-6">
                <h4 className="font-bold text-gray-800 mb-2">Is the taxable account balance required?</h4>
                <p className="text-gray-600">No, it's optional. It's only needed if you want to track how much you'll pay in taxes from your taxable account.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="border-l-4 border-purple-200 pl-6">
                <h4 className="font-bold text-gray-800 mb-2">Are growth assumptions required?</h4>
                <p className="text-gray-600">No, you can leave them blank for basic tax analysis. Growth assumptions are only needed for long-term projections.</p>
              </div>
              <div className="border-l-4 border-purple-200 pl-6">
                <h4 className="font-bold text-gray-800 mb-2">What's the difference between conversion strategies?</h4>
                <ul className="mt-2 space-y-1 text-gray-600">
                  <li>• <strong>One-time:</strong> Convert a specific dollar amount once</li>
                  <li>• <strong>Annual:</strong> Convert a specific dollar amount each year</li>
                  <li>• <strong>Bracket optimization:</strong> Convert to fill a target tax bracket rate</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-gray-200/50">
          <p className="text-gray-500 text-sm">
            Tax calculations based on 2025 federal brackets and NY state tax (6.85%).
          </p>
        </footer>
      </div>
    </div>
  );
} 