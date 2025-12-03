import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, Copy, Trash2, Mail, Download, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { generatePDF } from '../../utils/pdfGenerator';
import { generateCSV } from '../../utils/csvGenerator';
import SimulationPreviewModal from './SimulationPreviewModal';
import EmailModal from './EmailModal';

interface Simulation {
  id: string;
  simulation_name: string;
  user_id: string | null;
  inputs: any;
  scenarios: any;
  selected_scenario_type: string;
  created_at: string;
  updated_at: string;
}

export default function AdminDashboard() {
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSimulation, setSelectedSimulation] = useState<Simulation | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTarget, setEmailTarget] = useState<Simulation | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadSimulations();
  }, []);

  const loadSimulations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('simulations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSimulations(data || []);
    } catch (error) {
      console.error('Error loading simulations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this simulation?')) return;

    try {
      const { error } = await supabase
        .from('simulations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadSimulations();
    } catch (error) {
      console.error('Error deleting simulation:', error);
      alert('Failed to delete simulation');
    }
  };

  const handleDuplicate = async (simulation: Simulation) => {
    try {
      const { error } = await supabase
        .from('simulations')
        .insert({
          simulation_name: `${simulation.simulation_name} (Copy)`,
          user_id: user?.id || null,
          inputs: simulation.inputs,
          scenarios: simulation.scenarios,
          selected_scenario_type: simulation.selected_scenario_type,
        });

      if (error) throw error;
      await loadSimulations();
    } catch (error) {
      console.error('Error duplicating simulation:', error);
      alert('Failed to duplicate simulation');
    }
  };

  const handlePreview = (simulation: Simulation) => {
    setSelectedSimulation(simulation);
    setShowPreview(true);
  };

  const handleDownloadPDF = async (simulation: Simulation) => {
    try {
      await generatePDF(simulation);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    }
  };

  const handleDownloadCSV = (simulation: Simulation) => {
    try {
      generateCSV(simulation);
    } catch (error) {
      console.error('Error generating CSV:', error);
      alert('Failed to generate CSV');
    }
  };

  const handleEmail = (simulation: Simulation) => {
    setEmailTarget(simulation);
    setShowEmailModal(true);
  };

  const getWorkloadValue = (simulation: Simulation): number => {
    try {
      if (simulation.inputs?.planningContext?.headcountTarget) {
        return simulation.inputs.planningContext.headcountTarget;
      }
      return 0;
    } catch {
      return 0;
    }
  };

  const getFunctionName = (simulation: Simulation): string => {
    try {
      if (simulation.inputs?.planningContext?.functionName) {
        return simulation.inputs.planningContext.functionName;
      }
      return 'N/A';
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-xl text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => window.history.back()}
              className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <h1 className="text-4xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-2">Manage all simulations across the platform</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">Total Simulations</p>
            <p className="text-3xl font-bold text-blue-600">{simulations.length}</p>
          </div>
        </div>

        {simulations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <p className="text-slate-600 text-lg">No simulations found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {simulations.map((simulation) => (
              <div
                key={simulation.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-slate-900 truncate mb-1">
                      {simulation.simulation_name}
                    </h3>
                    <p className="text-sm text-slate-500 truncate">
                      {getFunctionName(simulation)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <button
                      onClick={() => handlePreview(simulation)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(simulation)}
                      className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(simulation.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-sm text-slate-600">Workload</span>
                    <span className="text-lg font-semibold text-slate-900">
                      {getWorkloadValue(simulation)}
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-sm text-slate-600">Created</span>
                    <span className="text-sm font-medium text-slate-900">
                      {new Date(simulation.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEmail(simulation)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                  <button
                    onClick={() => handleDownloadCSV(simulation)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    CSV
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(simulation)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPreview && selectedSimulation && (
        <SimulationPreviewModal
          simulation={selectedSimulation}
          onClose={() => {
            setShowPreview(false);
            setSelectedSimulation(null);
          }}
        />
      )}

      {showEmailModal && emailTarget && (
        <EmailModal
          simulation={emailTarget}
          onClose={() => {
            setShowEmailModal(false);
            setEmailTarget(null);
          }}
        />
      )}
    </div>
  );
}
