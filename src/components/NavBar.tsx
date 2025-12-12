import { useState, useRef, useEffect } from 'react';
import { Users, Home, LayoutGrid, LogOut, ChevronDown, UserCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavBarProps {
  currentView: string;
  userName: string;
  onNavigate: (view: string) => void;
  onSignOut: () => void;
}

export function NavBar({ currentView, userName, onNavigate, onSignOut }: NavBarProps) {
  const { appUser, isAdmin } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isActiveView = (view: string) => currentView === view;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-md flex-shrink-0 p-1.5">
            <img src="/jlg_logo_1.png" alt="JLG" className="w-full h-full object-contain" />
          </div>
          <div className="hidden sm:block">
            <div className="text-text-main font-bold text-base md:text-lg leading-tight">
              JLG
            </div>
            <div className="text-primary text-xs font-medium">
              MVO & Headcount Simulator
            </div>
          </div>
          <div className="sm:hidden">
            <div className="text-text-main font-bold text-base leading-tight">
              JLG
            </div>
            <div className="text-primary text-xs font-medium">
              MVO Simulator
            </div>
          </div>
        </button>

        <nav className="hidden md:flex items-center gap-2">
          <button
            onClick={() => onNavigate('landing')}
            className={`
              rounded-button px-4 py-2 flex items-center gap-2 text-sm font-medium transition-all
              ${isActiveView('landing') || isActiveView('wizard')
                ? 'bg-primary text-white shadow-md hover:bg-primary-hover'
                : 'bg-white text-primary border border-primary/20 hover:bg-primary-soft'
              }
            `}
          >
            <Home className="w-4 h-4" />
            Launch Simulator
          </button>

          <button
            onClick={() => onNavigate('simulationLibrary')}
            className={`
              rounded-button px-4 py-2 flex items-center gap-2 text-sm font-medium transition-all
              ${isActiveView('simulationLibrary') || isActiveView('userManagement')
                ? 'bg-primary text-white shadow-md hover:bg-primary-hover'
                : 'bg-white text-primary border border-primary/20 hover:bg-primary-soft'
              }
            `}
          >
            <LayoutGrid className="w-4 h-4" />
            Simulation Library
          </button>
        </nav>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="rounded-full px-3 py-1.5 bg-gray-100 hover:bg-gray-200 flex items-center gap-2 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold">
              {getInitials(userName)}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-sm font-medium text-text-main">{userName}</div>
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
                  onNavigate('profile');
                  setIsDropdownOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-text-main hover:bg-primary-soft flex items-center gap-2 transition-colors"
              >
                <UserCircle className="w-4 h-4" />
                Profile
              </button>

              <button
                onClick={() => {
                  onNavigate('simulationLibrary');
                  setIsDropdownOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-text-main hover:bg-primary-soft flex items-center gap-2 transition-colors"
              >
                <LayoutGrid className="w-4 h-4" />
                Simulation Library
              </button>

              {isAdmin() && (
                <button
                  onClick={() => {
                    onNavigate('userManagement');
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
                  onSignOut();
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

        <nav className="md:hidden flex items-center gap-2 mr-14">
          <button
            onClick={() => onNavigate('landing')}
            className={`
              rounded-full p-2 transition-all
              ${isActiveView('landing') || isActiveView('wizard')
                ? 'bg-primary text-white'
                : 'bg-white text-primary border border-primary/20'
              }
            `}
          >
            <Home className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('simulationLibrary')}
            className={`
              rounded-full p-2 transition-all
              ${isActiveView('simulationLibrary') || isActiveView('userManagement')
                ? 'bg-primary text-white'
                : 'bg-white text-primary border border-primary/20'
              }
            `}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </header>
  );
}
