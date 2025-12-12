import React, { useState, useEffect } from 'react';
import { getSimulations, deleteSimulation as legacyDeleteSimulation, SimulationRecord } from '../lib/supabase';
import { persistenceService } from '../services/persistenceAdapter';
import type { CanonicalSimulation } from '../types/canonicalSimulation';
import { Clock, Trash2, FolderOpen } from 'lucide-react';

interface SavedSimulationsProps {
  onLoad: (simulation: SimulationRecord | CanonicalSimulation) => void;
}

export function SavedSimulations({ onLoad }: SavedSimulationsProps) {
  const [simulations, setSimulations] = useState<CanonicalSimulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSimulations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await persistenceService.listSimulations();
      setSimulations(data || []);
    } catch (err) {
      setError('Failed to load simulations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSimulations();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this simulation?')) return;

    try {
      await persistenceService.deleteSimulation(id);
      await loadSimulations();
    } catch (err) {
      alert('Failed to delete simulation');
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  if (simulations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No saved simulations yet</p>
          <p className="text-sm text-gray-400 mt-1">Run a simulation and save it to see it here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Saved Simulations</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {simulations.map((sim) => (
          <div
            key={sim.id}
            onClick={() => onLoad(sim)}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{sim.context.simulationName}</p>
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(sim.createdAt!)}</span>
              </div>
            </div>
            <button
              onClick={(e) => handleDelete(sim.id!, e)}
              className="ml-3 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
