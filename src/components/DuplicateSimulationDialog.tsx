import React, { useState } from 'react';
import { X, Copy } from 'lucide-react';
import { SimulationHistory } from '../types/simulationHistory';

interface DuplicateSimulationDialogProps {
  simulation: SimulationHistory;
  onConfirm: (options: {
    newName: string;
    scenarioLabel: string;
    duplicationNote: string;
  }) => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export function DuplicateSimulationDialog({
  simulation,
  onConfirm,
  onCancel,
  isProcessing = false
}: DuplicateSimulationDialogProps) {
  const [newName, setNewName] = useState(
    simulation.simulation_name
      ? `${simulation.simulation_name} (Copy)`
      : 'Untitled Simulation (Copy)'
  );
  const [scenarioLabel, setScenarioLabel] = useState('');
  const [duplicationNote, setDuplicationNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      alert('Please enter a simulation name');
      return;
    }
    onConfirm({
      newName: newName.trim(),
      scenarioLabel: scenarioLabel.trim(),
      duplicationNote: duplicationNote.trim()
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Copy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Duplicate Simulation</h2>
              <p className="text-sm text-gray-600">
                Creating a copy of: {simulation.simulation_name}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              New Simulation Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={isProcessing}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
              placeholder="Enter a name for the duplicated simulation"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              This will be shown as the simulation title in your list
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Scenario Label <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={scenarioLabel}
              onChange={(e) => setScenarioLabel(e.target.value)}
              disabled={isProcessing}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
              placeholder='e.g., "Phase 2", "Alternative B", "High-Risk Scenario"'
              maxLength={50}
            />
            <p className="mt-1 text-xs text-gray-500">
              A short label to identify this scenario variant
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Notes / Reason <span className="text-gray-500 font-normal">(Optional)</span>
            </label>
            <textarea
              value={duplicationNote}
              onChange={(e) => setDuplicationNote(e.target.value)}
              disabled={isProcessing}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50 resize-none"
              placeholder="Example: Using higher workload for Q4, testing more automation, adjusting structure for Phase 2..."
              maxLength={500}
            />
            <p className="mt-1 text-xs text-gray-500">
              Explain why you're creating this copy and what's different ({duplicationNote.length}/500)
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">What happens next?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• A new editable simulation will be created with all inputs pre-filled</li>
              <li>• You can modify any settings before running the simulation</li>
              <li>• The original simulation remains unchanged</li>
              <li>• Your new simulation will be linked to the original for tracking</li>
            </ul>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !newName.trim()}
              className="flex-1 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Duplicating...
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Duplicate & Open
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
