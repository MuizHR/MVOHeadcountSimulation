import { useState, useEffect } from 'react';
import { Calculator, Home, LogOut, User, Users } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WizardProvider } from './contexts/WizardContext';
import { WizardContainer } from './components/WizardContainer';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { ProfilePage } from './components/auth/ProfilePage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { supabase } from './lib/supabase';

type AppView = 'landing' | 'wizard' | 'profile';

function AuthenticatedApp() {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [refreshKey, setRefreshKey] = useState(0);
  const [userName, setUserName] = useState<string>('');

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

  if (currentView === 'landing') {
    return <LandingPage key={refreshKey} onStartSimulation={handleStartSimulation} onShowProfile={handleShowProfile} />;
  }

  if (currentView === 'profile') {
    return <ProfilePage onBack={handleBackToLanding} />;
  }

  return (
    <WizardProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-gray-900 font-bold text-lg">JLG Group MVO & Headcount Simulator</div>
                  <div className="text-cyan-600 text-xs font-medium">AI-enabled workforce planning based on MVO principles</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-gray-700 text-sm px-4 py-2 bg-gray-100 rounded-lg border border-gray-200">
                  {userName || user?.email}
                </div>
                <button
                  onClick={handleShowProfile}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={handleBackToLanding}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <WizardContainer />
      </div>
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

function App() {
  return (
    <AuthProvider>
      <AuthFlow />
    </AuthProvider>
  );
}

export default App;
