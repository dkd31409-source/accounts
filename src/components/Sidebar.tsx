import React from 'react';
import {
  Home,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Repeat,
  BarChart2,
  Calendar,
  DollarSign,
  PieChart,
  User,
  LogOut,
  Settings,
  Target,
  Database,
  Grid,
  CreditCard,
  FolderTree,
} from 'lucide-react';
import { useApp } from '../AppContext';

export const Sidebar: React.FC = () => {
  const { view, setView, logout, user } = useApp();

  const NAV_ITEMS = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'accounts', label: 'Accounts', icon: Briefcase },
    { id: 'income', label: 'Income', icon: TrendingUp },
    { id: 'expenses', label: 'Expenses', icon: TrendingDown },
    { id: 'transfers', label: 'Transfers', icon: Repeat },
    { id: 'reports', label: 'Reports', icon: BarChart2 },
    { id: 'loans', label: 'Loans', icon: DollarSign },
    { id: 'investments', label: 'Investments', icon: PieChart },
    { id: 'reminders', label: 'Reminders', icon: Calendar },
    { id: 'budgets', label: 'Budgets', icon: Target },
    { id: 'groups', label: 'Groups', icon: FolderTree },
    { id: 'assets', label: 'Assets', icon: Grid },
    { id: 'credit', label: 'Credit', icon: CreditCard },
    { id: 'backup', label: 'Backup', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex w-60 bg-surface border-r border-line flex-col h-screen sticky top-0 flex-shrink-0 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-line">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#223A2A] to-[#4C7A5A] flex items-center justify-center text-white font-serif font-extrabold text-base shadow-sm">
          {user?.settings?.appLogo || '🪙'}
        </div>
        <span className="font-serif font-extrabold text-lg text-ink">
          {user?.settings?.appName || 'Money'}
        </span>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-0.5 scrollbar-thin scrollbar-thumb-line">
        {NAV_ITEMS.map((item) => {
          const IconComponent = item.icon;
          const isActive = view === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-[#DEE9DD] text-[#223A2A] shadow-sm'
                  : 'text-muted hover:bg-bg hover:text-ink'
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#4C7A5A]' : 'text-muted'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile Controls */}
      <div className="p-4 border-t border-line bg-surface flex flex-col gap-2">
        <div className="flex items-center gap-2.5 p-2 bg-bg rounded-xl">
          <div className="w-8 h-8 rounded-full bg-[#4C7A5A] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
            {user?.username?.slice(0, 1) || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-ink truncate leading-tight">
              {user?.username || 'User'}
            </p>
            <p className="text-[9px] text-muted truncate mt-0.5">
              Online Session
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-line hover:border-coral/40 hover:bg-[#F3DFDF]/20 hover:text-[#8C3B4A] rounded-xl text-xs font-bold text-muted transition-all duration-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
