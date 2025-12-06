import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WizardProvider } from './contexts/WizardContext';
import { MOVAProvider } from './contexts/MOVAContext';
import { WizardContainer } from './components/WizardContainer';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { ProfilePage } from './components/auth/ProfilePage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { MOVALauncher } from './components/mova/MOVALauncher';
import { MOVAWindow } from './components/mova/MOVAWindow';
import { MySimulations } from './components/MySimulations';
import { AdminSimulations } from './components/AdminSimulations';
import { UserManagement } from './components/UserManagement';
import { NavBar } from './components/NavBar';
import { SimulationHistoryViewer } from './components/SimulationHistoryViewer';
import { supabase } from './lib/supabase';

type AppView = 'landing' | 'wizard' | 'profile' | 'mySimulations' | 'adminSimulations' | 'userManagement' | 'historyViewer' | 'duplicateSimulation';

function AuthenticatedApp() {
  const { user, appUser, signOut, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [refreshKey, setRefreshKey] = useState(0);
  const [userName, setUserName] = useState<string>('');
  const [selectedSimulationId, setSelectedSimulationId] = useState<string | null>(null);

  useEffect(() => {
    loadUserName();
  }, [user]);

  const loadUserName = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setUserName(data.full_name);
      } else {
        setUserName(user.email || 'User');
      }
    } catch (error) {
      console.error('Error loading user name:', error);
      setUserName(user.email || 'User');
    }
  };

  const handleStartSimulation = () => {
    setCurrentView('wizard');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setRefreshKey(prev => prev + 1);
  };

  const handleShowProfile = () => {
    setCurrentView('profile');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleViewSimulation = (simulationId: string) => {
    setSelectedSimulationId(simulationId);
    setCurrentView('historyViewer');
  };

  if (currentView === 'landing') {
    return (
      <MOVAProvider>
        <LandingPage key={refreshKey} onStartSimulation={handleStartSimulation} onShowProfile={handleShowProfile} />
        <MOVALauncher />
        <MOVAWindow />
      </MOVAProvider>
    );
  }

  if (currentView === 'profile') {
    return (
      <MOVAProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <NavBar
            currentView={currentView}
            userName={userName || user?.email || 'User'}
            onNavigate={setCurrentView}
            onSignOut={handleSignOut}
          />
          <ProfilePage
            currentView={currentView}
            userName={userName || user?.email || 'User'}
            onNavigate={setCurrentView}
            onSignOut={handleSignOut}
          />
          <MOVALauncher />
          <MOVAWindow />
        </div>
      </MOVAProvider>
    );
  }

  if (currentView === 'historyViewer' && selectedSimulationId) {
    return (
      <MOVAProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <NavBar
            currentView={currentView}
            userName={userName || user?.email || 'User'}
            onNavigate={setCurrentView}
            onSignOut={handleSignOut}
          />
          <SimulationHistoryViewer
            simulationId={selectedSimulationId}
            onBack={() => setCurrentView('mySimulations')}
          />
          <MOVALauncher />
          <MOVAWindow />
        </div>
      </MOVAProvider>
    );
  }

  if (currentView === 'mySimulations') {
    return (
      <WizardProvider>
        <MOVAProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <NavBar
              currentView={currentView}
              userName={userName || user?.email || 'User'}
              onNavigate={setCurrentView}
              onSignOut={handleSignOut}
            />
            <MySimulations onNavigate={(view, data) => {
              if (view === 'view-simulation' && data?.simulationId) {
                handleViewSimulation(data.simulationId);
              } else if (view === 'duplicate-simulation' && data?.simulationId) {
                setSelectedSimulationId(data.simulationId);
                setCurrentView('duplicateSimulation');
              } else {
                setCurrentView(view as AppView);
              }
            }} />
            <MOVALauncher />
            <MOVAWindow />
          </div>
        </MOVAProvider>
      </WizardProvider>
    );
  }

  if (currentView === 'adminSimulations') {
    return (
      <WizardProvider>
        <MOVAProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <NavBar
              currentView={currentView}
              userName={userName || user?.email || 'User'}
              onNavigate={setCurrentView}
              onSignOut={handleSignOut}
            />
            <AdminSimulations onNavigate={(view, data) => {
              if (view === 'view-simulation' && data?.simulationId) {
                handleViewSimulation(data.simulationId);
              } else if (view === 'duplicate-simulation' && data?.simulationId) {
                setSelectedSimulationId(data.simulationId);
                setCurrentView('duplicateSimulation');
              } else {
                setCurrentView(view as AppView);
              }
            }} />
            <MOVALauncher />
            <MOVAWindow />
          </div>
        </MOVAProvider>
      </WizardProvider>
    );
  }

  if (currentView === 'userManagement') {
    return (
      <MOVAProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <NavBar
            currentView={currentView}
            userName={userName || user?.email || 'User'}
            onNavigate={setCurrentView}
            onSignOut={handleSignOut}
          />
          <UserManagement />
          <MOVALauncher />
          <MOVAWindow />
        </div>
      </MOVAProvider>
    );
  }

  if (currentView === 'duplicateSimulation' && selectedSimulationId) {
    return (
      <WizardProvider>
        <MOVAProvider>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <NavBar
              currentView="wizard"
              userName={userName || user?.email || 'User'}
              onNavigate={setCurrentView}
              onSignOut={handleSignOut}
            />
            <WizardContainer duplicateSimulationId={selectedSimulationId} />
            <MOVALauncher />
            <MOVAWindow />
          </div>
        </MOVAProvider>
      </WizardProvider>
    );
  }

  return (
    <WizardProvider>
      <MOVAProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <NavBar
            currentView={currentView}
            userName={userName || user?.email || 'User'}
            onNavigate={setCurrentView}
            onSignOut={handleSignOut}
          />
          <WizardContainer />
          <MOVALauncher />
          <MOVAWindow />
        </div>
      </MOVAProvider>
    </WizardProvider>
  );
}

function AuthFlow() {
  const { user, loading, signIn, signUp } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signIn(email, password);
    } catch (error: any) {
      setAuthError(error.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string, fullName: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signUp(email, password, fullName);
      setAuthError(null);
      alert('Account created successfully! Please sign in.');
      setAuthMode('login');
    } catch (error: any) {
      setAuthError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (!showAuth) {
      return (
        <LandingPage
          onStartSimulation={() => {
            setAuthMode('login');
            setShowAuth(true);
          }}
          onShowLogin={() => {
            setAuthMode('login');
            setShowAuth(true);
          }}
          onShowSignUp={() => {
            setAuthMode('signup');
            setShowAuth(true);
          }}
        />
      );
    }

    if (authMode === 'login') {
      return (
        <LoginPage
          onLogin={handleLogin}
          onSwitchToSignUp={() => {
            setAuthMode('signup');
            setAuthError(null);
          }}
          onBack={() => setShowAuth(false)}
          isLoading={authLoading}
          error={authError}
        />
      );
    }

    return (
      <SignUpPage
        onSignUp={handleSignUp}
        onSwitchToLogin={() => {
          setAuthMode('login');
          setAuthError(null);
        }}
        onBack={() => setShowAuth(false)}
        isLoading={authLoading}
        error={authError}
      />
    );
  }

  return (
    <ProtectedRoute>
      <AuthenticatedApp />
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <div
      style={{
        padding: 40,
        backgroundColor: '#111827',  // dark background
        color: 'white',               // white text
        fontSize: 24,
      }}
    >
      MVO App test – if you see this, React is working.
    </div>
  );
}