import React, { useState } from 'react';
import {
  Brain, Network, Target, BarChart3, BookOpen, FlaskConical, FileText,
  LogOut, User, Settings, Crown, Clock, Briefcase, Menu, X, ChevronDown
} from 'lucide-react';
import { useAuth } from '../store/AuthContext';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const TABS: Tab[] = [
  { id: 'dashboard',  label: 'Dashboard',    icon: BarChart3 },
  { id: 'evaluator',  label: 'AI Evaluator', icon: Target },
  { id: 'dag',        label: 'Agent DAG',    icon: Network },
  { id: 'ats',        label: 'ATS Optimizer',icon: BookOpen },
  { id: 'roadmap',    label: 'Career Path',  icon: Briefcase },
  { id: 'xai',        label: 'XAI Audit',   icon: FlaskConical },
  { id: 'benchmarks', label: 'Benchmarks',   icon: BarChart3 },
  { id: 'history',    label: 'History',      icon: Clock },
  { id: 'paper',      label: 'IEEE Paper',   icon: FileText },
];

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const visibleTabs = TABS.filter(t => !t.roles || t.roles.includes(user?.role ?? ''));

  return (
    <header className="sticky top-0 z-50 bg-surface-900/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14 gap-4">
          {/* Logo */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 shrink-0 group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-brand-600 to-accent-purple rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Brain className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-bold text-white">X-MMHF</span>
              <span className="block text-xs text-slate-500 leading-none">IEEE AI System</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-thin">
            {visibleTabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={activeTab === id ? 'nav-tab-active flex items-center gap-1.5 text-xs' : 'nav-tab-inactive flex items-center gap-1.5 text-xs'}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </nav>

          {/* Right: User Menu */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            {/* Admin badge */}
            {user?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg text-amber-400 transition-colors"
              >
                <Crown className="w-3.5 h-3.5" /> Admin
              </button>
            )}

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-surface-700/50 hover:bg-surface-700 rounded-lg border border-white/5 transition-colors"
              >
                <div className="w-6 h-6 bg-gradient-to-br from-brand-600 to-accent-purple rounded-lg flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="hidden sm:block text-xs text-slate-300 max-w-[100px] truncate">{user?.full_name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 glass-card py-1 shadow-xl shadow-black/30 z-50">
                  <div className="px-3 py-2 border-b border-white/5">
                    <p className="text-xs font-medium text-white truncate">{user?.full_name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    <span className="text-xs text-brand-400 capitalize">{user?.role}</span>
                  </div>
                  <button
                    onClick={() => { setActiveTab('profile'); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-surface-700/50 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" /> Profile Settings
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => { setActiveTab('admin'); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-400 hover:bg-surface-700/50 transition-colors"
                    >
                      <Crown className="w-3.5 h-3.5" /> Admin Panel
                    </button>
                  )}
                  <div className="border-t border-white/5 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden pb-3 border-t border-white/5 mt-0 pt-2">
            <div className="grid grid-cols-3 gap-1">
              {visibleTabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); setMobileOpen(false); }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all ${
                    activeTab === id ? 'bg-brand-600/20 text-brand-400' : 'text-slate-400 hover:text-slate-200 hover:bg-surface-700/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Close user menu on outside click */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </header>
  );
}
