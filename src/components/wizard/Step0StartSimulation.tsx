import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface Step0StartSimulationProps {
  onStartSimulation: (data: {
    planningType: string;
    mainFunction: string;
    sizeOfOperation: string;
  }) => void;
}

export function Step0StartSimulation({ onStartSimulation }: Step0StartSimulationProps) {
  const [planningType, setPlanningType] = useState('new_project');
  const [mainFunction, setMainFunction] = useState('');
  const [sizeOfOperation, setSizeOfOperation] = useState('medium');

  const handleSubmit = () => {
    if (!mainFunction) {
      alert('Please select a main function');
      return;
    }

    onStartSimulation({
      planningType,
      mainFunction,
      sizeOfOperation,
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Start New Simulation</h2>
            <p className="text-gray-600 text-sm mt-1">Define your workforce planning scenario</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Planning Type
            </label>
            <select
              value={planningType}
              onChange={(e) => setPlanningType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="new_project">New Project</option>
              <option value="new_function">New Function</option>
              <option value="new_business_unit">New Business Unit</option>
              <option value="restructuring_rightsizing">Restructuring / Rightsizing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Main Function
            </label>
            <select
              value={mainFunction}
              onChange={(e) => setMainFunction(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="">Select main function...</option>
              <option value="property_management">Property & Facilities Management</option>
              <option value="security_services">Security Services</option>
              <option value="human_resources">Human Resources</option>
              <option value="finance_accounting">Finance & Accounting</option>
              <option value="operations">Operations</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Size of Operation
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50">
                <input
                  type="radio"
                  name="size"
                  value="small"
                  checked={sizeOfOperation === 'small'}
                  onChange={(e) => setSizeOfOperation(e.target.value)}
                  className="w-5 h-5 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <div className="text-gray-900 font-semibold">Small / Lean</div>
                  <div className="text-gray-600 text-xs">Minimum viable team (60% of standard)</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50">
                <input
                  type="radio"
                  name="size"
                  value="medium"
                  checked={sizeOfOperation === 'medium'}
                  onChange={(e) => setSizeOfOperation(e.target.value)}
                  className="w-5 h-5 text-teal-600 focus:ring-teal-500"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-gray-900 font-semibold">Medium / Standard</div>
                    <span className="px-2 py-0.5 bg-teal-500 text-white text-xs rounded-full">Recommended</span>
                  </div>
                  <div className="text-gray-600 text-xs">Normal operations (100% baseline)</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50">
                <input
                  type="radio"
                  name="size"
                  value="large"
                  checked={sizeOfOperation === 'large'}
                  onChange={(e) => setSizeOfOperation(e.target.value)}
                  className="w-5 h-5 text-teal-600 focus:ring-teal-500"
                />
                <div>
                  <div className="text-gray-900 font-semibold">Large / Extended</div>
                  <div className="text-gray-600 text-xs">Full-scale operations (150% of standard)</div>
                </div>
              </label>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!mainFunction}
            className="w-full py-4 bg-gradient-to-r from-teal-600 to-blue-600 text-white font-bold text-lg rounded-xl hover:from-teal-500 hover:to-blue-500 transition-all shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Generate Simulation Report
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
