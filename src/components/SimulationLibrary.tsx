import { useState } from 'react';
import { MySimulations } from './MySimulations';
import { AdminSimulations } from './AdminSimulations';
import { useAuth } from '../contexts/AuthContext';

interface SimulationLibraryProps {
  onNavigate: (view: string, data?: any) => void;
}

export function SimulationLibrary({ onNavigate }: SimulationLibraryProps) {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');
  const showTabs = isAdmin();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Simulation Library</h1>
          <p className="text-gray-600">
            {showTabs
              ? 'View and manage all simulations across the organization'
              : 'Access your saved simulations and planning scenarios'
            }
          </p>
        </div>

        {showTabs && (
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex gap-8">
              <button
                onClick={() => setActiveTab('my')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'my'
                    ? 'border-cyan-600 text-cyan-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                My Simulations
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'all'
                    ? 'border-cyan-600 text-cyan-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                All Simulation Library
              </button>
            </nav>
          </div>
        )}

        <div>
          {activeTab === 'my' ? (
            <MySimulations onNavigate={onNavigate} hideHeader />
          ) : (
            <AdminSimulations onNavigate={onNavigate} hideHeader />
          )}
        </div>
      </div>
    </div>
  );
}
