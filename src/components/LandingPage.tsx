import React, { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, Users, User, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface LandingPageProps {
  onStartSimulation: () => void;
  onShowProfile?: () => void;
  onShowLogin?: () => void;
  onShowSignUp?: () => void;
}

export function LandingPage({ onStartSimulation, onShowProfile, onShowLogin, onShowSignUp }: LandingPageProps) {
  const { user, signOut } = useAuth();
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    loadUserName();
  }, [user]);

  const loadUserName = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
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

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-gray-900 font-bold text-lg">JLG Group</div>
              <div className="text-cyan-600 text-xs font-medium">MVO & Headcount Simulator</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="text-gray-700 text-sm px-4 py-2 bg-gray-100 rounded-lg border border-gray-200">
                  {userName || user.email}
                </div>
                <button
                  onClick={onShowProfile}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Profile"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onShowLogin}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
                <button
                  onClick={onShowSignUp}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-12">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&q=80')`,
          }}
        ></div>

        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-900/90"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/30 via-transparent to-violet-900/30"></div>

        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-sm font-semibold mb-6 backdrop-blur-sm">
            <TrendingUp className="w-4 h-4" />
            AI-Powered Workforce Planning
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Design your{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 bg-clip-text text-transparent">
              Minimum Viable Organisation
            </span>
            <br />
            with clarity, speed and intelligence.
          </h1>

          <p className="text-xl text-cyan-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            Simulate headcount requirements, analyze risks, and optimize your workforce structure
            for new projects, functions, and business units with AI-driven insights.
          </p>

          <div className="flex items-center justify-center">
            <button
              onClick={onStartSimulation}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-xl hover:shadow-cyan-500/50 flex items-center gap-3"
            >
              <Sparkles className="w-6 h-6" />
              Launch Simulator
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
            <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-2">Monte Carlo Simulation</h3>
              <p className="text-gray-600 text-sm">
                5,000+ iterations with risk analysis and probabilistic forecasting
              </p>
            </div>
            <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-auto">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-2">Auto MVO Detection</h3>
              <p className="text-gray-600 text-sm">
                AI identifies minimum viable headcount with optimal risk-cost balance
              </p>
            </div>
            <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-2">HR-Friendly Interface</h3>
              <p className="text-gray-600 text-sm">
                Simple questions, no formulas — just answer in plain HR language
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
