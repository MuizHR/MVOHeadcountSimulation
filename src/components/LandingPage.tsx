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
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-soft to-page-bg">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-border-subtle shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-md">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-text-main font-bold text-lg">JLG Group</div>
              <div className="text-primary text-xs font-medium">MVO & Headcount Simulator</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="text-text-main text-sm px-4 py-2 bg-primary-soft rounded-button border border-primary/20">
                  {userName || user.email}
                </div>
                <button
                  onClick={onShowProfile}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-white border border-primary/20 rounded-button hover:bg-primary-soft transition-colors"
                  title="Profile"
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-status-error rounded-button hover:bg-red-700 transition-colors"
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
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-white border border-primary/20 rounded-button hover:bg-primary-soft transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
                <button
                  onClick={onShowSignUp}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-button hover:bg-primary-hover transition-colors"
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
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-soft border border-primary/30 rounded-full text-primary text-sm font-semibold mb-6">
            <TrendingUp className="w-4 h-4" />
            AI-Powered Workforce Planning
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-text-main mb-6 leading-tight">
            Design your{' '}
            <span className="bg-gradient-to-r from-primary via-primary-hover to-lime-accent bg-clip-text text-transparent">
              Minimum Viable Organisation
            </span>
            <br />
            with clarity, speed and intelligence.
          </h1>

          <p className="text-xl text-text-muted mb-12 max-w-3xl mx-auto leading-relaxed">
            Simulate headcount requirements, analyze risks, and optimize your workforce structure
            for new projects, functions, and business units with AI-driven insights.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onStartSimulation}
              className="px-8 py-4 bg-primary text-white font-semibold text-lg rounded-button hover:bg-primary-hover transition-all shadow-card-hover flex items-center gap-3"
            >
              <Sparkles className="w-6 h-6" />
              Launch Simulator
            </button>
            <button
              onClick={onStartSimulation}
              className="px-8 py-4 bg-white text-primary font-semibold text-lg rounded-button border-2 border-primary hover:bg-primary-soft transition-all shadow-card flex items-center gap-3"
            >
              <LayoutGrid className="w-5 h-5" />
              View Simulation Library
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
            <div className="p-6 bg-white border border-border-subtle rounded-card shadow-card hover:shadow-card-hover transition-shadow">
              <div className="w-12 h-12 bg-primary-soft rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-text-main font-bold text-lg mb-2">Monte Carlo Simulation</h3>
              <p className="text-text-muted text-sm">
                5,000+ iterations with risk analysis and probabilistic forecasting
              </p>
            </div>
            <div className="p-6 bg-white border border-border-subtle rounded-card shadow-card hover:shadow-card-hover transition-shadow">
              <div className="w-12 h-12 bg-primary-soft rounded-xl flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-text-main font-bold text-lg mb-2">Auto MVO Detection</h3>
              <p className="text-text-muted text-sm">
                AI identifies minimum viable headcount with optimal risk-cost balance
              </p>
            </div>
            <div className="p-6 bg-white border border-border-subtle rounded-card shadow-card hover:shadow-card-hover transition-shadow">
              <div className="w-12 h-12 bg-primary-soft rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-text-main font-bold text-lg mb-2">HR-Friendly Interface</h3>
              <p className="text-text-muted text-sm">
                Simple questions, no formulas — just answer in plain HR language
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
