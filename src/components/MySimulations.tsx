import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SimulationHistory, SimulationHistoryFilters, SortField, SortOrder } from '../types/simulationHistory';
import { simulationHistoryService } from '../services/simulationHistoryService';
import { SimulationHistoryCard } from './SimulationHistoryCard';
import { DuplicateSimulationDialog } from './DuplicateSimulationDialog';

interface MySimulationsProps {
  onNavigate?: (view: string, data?: any) => void;
  hideHeader?: boolean;
}

export const MySimulations: React.FC<MySimulationsProps> = ({ onNavigate, hideHeader = false }) => {
  const { appUser } = useAuth();
  const [simulations, setSimulations] = useState<SimulationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SimulationHistoryFilters>({});
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [duplicatingSimulation, setDuplicatingSimulation] = useState<SimulationHistory | null>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);

  useEffect(() => {
    loadSimulations();
  }, [appUser, filters, sortField, sortOrder]);

  const loadSimulations = async () => {
    if (!appUser) return;

    setLoading(true);
    try {
      const data = await simulationHistoryService.getUserSimulations(
        appUser.id,
        { ...filters, search: searchTerm },
        sortField,
        sortOrder
      );
      setSimulations(data);
    } catch (error) {
      console.error('Error loading simulations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleView = (simulation: SimulationHistory) => {
    onNavigate?.('view-simulation', { simulationId: simulation.id });
  };

  const handleDuplicate = (simulation: SimulationHistory) => {
    setDuplicatingSimulation(simulation);
  };

  const handleDuplicateConfirm = async (options: {
    newName: string;
    scenarioLabel: string;
    duplicationNote: string;
  }) => {
    if (!appUser || !duplicatingSimulation) return;

    setIsDuplicating(true);
    try {
      const newSimulation = await simulationHistoryService.duplicateSimulation(
        duplicatingSimulation.id,
        appUser.id,
        options
      );

      setDuplicatingSimulation(null);
      onNavigate?.('duplicate-simulation', { simulationId: newSimulation.id });
    } catch (error) {
      console.error('Error duplicating simulation:', error);
      alert('Unable to duplicate simulation right now. Please try again later.');
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleDelete = (id: string) => {
    setSimulations(prev => prev.filter(s => s.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading simulations...</div>
      </div>
    );
  }

  return (
    <div className={hideHeader ? '' : 'max-w-7xl mx-auto px-4 py-8'}>
      {!hideHeader && (
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Simulations</h1>
          <button
            onClick={() => onNavigate?.('wizard')}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-md transition-shadow flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Launch Simulator
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by simulation name or business area..."
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Planning Type</label>
              <select
                value={filters.planning_type || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, planning_type: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="New Project">New Project</option>
                <option value="New Function">New Function</option>
                <option value="New BU">New BU</option>
                <option value="Restructuring">Restructuring</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size of Operation</label>
              <select
                value={filters.size_of_operation || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, size_of_operation: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Sizes</option>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={`${sortField}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortField(field as SortField);
                  setSortOrder(order as SortOrder);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="workload_score-desc">Highest Workload</option>
                <option value="workload_score-asc">Lowest Workload</option>
                <option value="total_fte-desc">Highest FTE</option>
                <option value="total_fte-asc">Lowest FTE</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {simulations.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-600 mb-4">
            You don't have any simulations yet. Start a new one with 'Launch Simulator'.
          </p>
          <button
            onClick={() => onNavigate?.('wizard')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-md transition-shadow"
          >
            Launch Your First Simulation
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {simulations.map((simulation) => (
            <SimulationHistoryCard
              key={simulation.id}
              simulation={simulation}
              onView={handleView}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onViewParent={(parentId) => onNavigate?.('view-simulation', { simulationId: parentId })}
            />
          ))}
        </div>
      )}

      {duplicatingSimulation && (
        <DuplicateSimulationDialog
          simulation={duplicatingSimulation}
          onConfirm={handleDuplicateConfirm}
          onCancel={() => setDuplicatingSimulation(null)}
          isProcessing={isDuplicating}
        />
      )}
    </div>
  );
};
