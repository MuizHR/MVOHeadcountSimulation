import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, TrendingUp, Users, LogOut, LogIn, UserPlus, ChevronDown, UserCircle, LayoutGrid } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface LandingPageProps {
  onStartSimulation: () => void;
  onShowProfile?: () => void;
  onShowLogin?: () => void;
  onShowSignUp?: () => void;
  onNavigate?: (view: string) => void;
}

export function LandingPage({ onStartSimulation, onShowProfile, onShowLogin, onShowSignUp, onNavigate }: LandingPageProps) {
  const { user, signOut, appUser, isAdmin } = useAuth();
  const [userName, setUserName] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUserName();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
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
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-md p-1.5">
              <img src="/jlg_logo_1.png" alt="JLG" className="w-full h-full object-contain" />
            </div>
            <div className="text-left">
              <div className="text-text-main font-bold text-lg leading-tight">JLG</div>
              <div className="text-primary text-xs font-medium leading-tight">MVO & Headcount Simulator</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="rounded-full px-3 py-1.5 bg-gray-100 hover:bg-gray-200 flex items-center gap-2 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
                      {getInitials(userName || user.email || 'User')}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium text-text-main">{userName || user.email}</div>
                      {appUser?.role === 'super_admin' && (
                        <div className="text-xs text-status-warning font-semibold">Super Admin</div>
                      )}
                      {appUser?.role === 'admin' && (
                        <div className="text-xs text-status-error font-semibold">Admin</div>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-card-hover border border-border-subtle py-1">
                      <button
                        onClick={() => {
                          if (onShowProfile) onShowProfile();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-text-main hover:bg-primary-soft flex items-center gap-2 transition-colors"
                      >
                        <UserCircle className="w-4 h-4" />
                        Profile
                      </button>

                      <button
                        onClick={() => {
                          if (onNavigate) onNavigate('simulationLibrary');
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-text-main hover:bg-primary-soft flex items-center gap-2 transition-colors"
                      >
                        <LayoutGrid className="w-4 h-4" />
                        Simulation Library
                      </button>

                      {isAdmin && isAdmin() && (
                        <button
                          onClick={() => {
                            if (onNavigate) onNavigate('userManagement');
                            setIsDropdownOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-text-main hover:bg-primary-soft flex items-center gap-2 transition-colors"
                        >
                          <Users className="w-4 h-4" />
                          Manage Users
                        </button>
                      )}

                      <div className="border-t border-border-subtle my-1"></div>

                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-status-error hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
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

          <div className="flex items-center justify-center">
            <button
              onClick={onStartSimulation}
              className="px-8 py-4 bg-primary text-white font-semibold text-lg rounded-button hover:bg-primary-hover transition-all shadow-card-hover flex items-center gap-3"
            >
              <Sparkles className="w-6 h-6" />
              Launch Simulator
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
