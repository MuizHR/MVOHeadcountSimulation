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
    <div className="min-h-screen bg-page-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-main mb-2">Simulation Library</h1>
          <p className="text-text-muted">
            {showTabs
              ? 'View and manage all simulations across the organization'
              : 'Access your saved simulations and planning scenarios'
            }
          </p>
        </div>

        {showTabs && (
          <div className="mb-6 border-b border-border-subtle">
            <nav className="-mb-px flex gap-8">
              <button
                onClick={() => setActiveTab('my')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === 'my'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text-main hover:border-border-subtle'
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
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text-main hover:border-border-subtle'
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
