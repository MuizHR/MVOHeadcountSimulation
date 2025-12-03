import React, { useState } from 'react';
import { Eye, Copy, Trash2, FileText, Download, FileSpreadsheet, Tag, GitBranch } from 'lucide-react';
import { SimulationHistory } from '../types/simulationHistory';
import { simulationHistoryService } from '../services/simulationHistoryService';
import { useAuth } from '../contexts/AuthContext';
import { exportSimulationToWord, exportSimulationToExcel, exportSimulationToPDF } from '../utils/simulationExport';

interface SimulationHistoryCardProps {
  simulation: SimulationHistory;
  onView: (simulation: SimulationHistory) => void;
  onDuplicate: (simulation: SimulationHistory) => void;
  onDelete: (id: string) => void;
  onViewParent?: (parentId: string) => void;
  showOwner?: boolean;
}

export const SimulationHistoryCard: React.FC<SimulationHistoryCardProps> = ({
  simulation,
  onView,
  onDuplicate,
  onDelete,
  onViewParent,
  showOwner = false
}) => {
  const { isAdmin } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await simulationHistoryService.deleteSimulation(simulation.id);
      onDelete(simulation.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting simulation:', error);
      alert('Failed to delete simulation');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = async (format: 'word' | 'excel' | 'pdf') => {
    setExporting(format);
    try {
      if (format === 'word') {
        await exportSimulationToWord(simulation);
      } else if (format === 'excel') {
        await exportSimulationToExcel(simulation);
      } else if (format === 'pdf') {
        await exportSimulationToPDF(simulation);
      }
    } catch (error) {
      console.error(`Error exporting to ${format}:`, error);
      alert(`Failed to export simulation to ${format.toUpperCase()}`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {simulation.simulation_name}
            </h3>
            {simulation.business_area && (
              <p className="text-sm text-gray-600 truncate">{simulation.business_area}</p>
            )}
            {showOwner && (simulation.user_name || simulation.user_email) && (
              <p className="text-xs text-gray-500 mt-1">
                Owner: {simulation.user_name} ({simulation.user_email})
              </p>
            )}

            {(simulation.scenario_label || simulation.parent_simulation_id) && (
              <div className="flex flex-wrap gap-1 mt-2">
                {simulation.scenario_label && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-100 text-cyan-800 text-xs font-medium rounded-full">
                    <Tag className="w-3 h-3" />
                    {simulation.scenario_label}
                  </span>
                )}
                {simulation.parent_simulation_id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onViewParent) {
                        onViewParent(simulation.parent_simulation_id!);
                      }
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full hover:bg-gray-200 transition-colors"
                    title={simulation.parent_simulation_name || 'View original simulation'}
                  >
                    <GitBranch className="w-3 h-3" />
                    Duplicated from: {simulation.parent_simulation_name || '[Original]'}
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-1 ml-2">
            <button
              onClick={() => onView(simulation)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDuplicate(simulation)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Workload:</span>
            <span className="font-semibold text-gray-900">{simulation.workload_score}</span>
          </div>
          <div className="flex gap-2">
            {simulation.planning_type && (
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                {simulation.planning_type}
              </span>
            )}
            {simulation.size_of_operation && (
              <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">
                {simulation.size_of_operation}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            Created: {formatDate(simulation.created_at)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => handleExport('word')}
            disabled={exporting !== null}
            className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
            title="Download Word"
          >
            <FileText className="w-3 h-3" />
            {exporting === 'word' ? 'Exporting...' : 'Word'}
          </button>
          <button
            onClick={() => handleExport('excel')}
            disabled={exporting !== null}
            className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
            title="Download Excel"
          >
            <FileSpreadsheet className="w-3 h-3" />
            {exporting === 'excel' ? 'Exporting...' : 'Excel'}
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null}
            className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
            title="Download PDF"
          >
            <Download className="w-3 h-3" />
            {exporting === 'pdf' ? 'Exporting...' : 'PDF'}
          </button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Simulation</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete "{simulation.simulation_name}"? This action cannot be undone.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
