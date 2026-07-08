import React from 'react';
import { Search, Sun, Moon, Plus } from 'lucide-react';
import { useApp } from '../AppContext';

interface TopbarProps {
  onQuickAdd: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onQuickAdd }) => {
  const { view, searchQuery, setSearchQuery, theme, toggleTheme } = useApp();

  const getViewTitle = () => {
    switch (view) {
      case 'home':
        return 'Home';
      case 'accounts':
        return 'Bank Accounts';
      case 'income':
        return 'Income';
      case 'expenses':
        return 'Expenses';
      case 'transfers':
        return 'Transfers';
      case 'reports':
        return 'Financial Reports';
      case 'loans':
        return 'Loans Register';
      case 'investments':
        return 'Investments Ledger';
      case 'reminders':
        return 'Due Reminders';
      case 'budgets':
        return 'Budget Limits';
      case 'groups':
        return 'Groups & Categories';
      case 'assets':
        return 'Assets Register';
      case 'credit':
        return 'Credit Account';
      case 'backup':
        return 'System Backup';
      case 'settings':
        return 'Settings';
      default:
        return 'Overview';
    }
  };

  return (
    <header className="flex items-center justify-between gap-4 px-6 py-4 border-b border-line bg-surface-glass backdrop-blur-md sticky top-0 z-40 select-none">
      {/* Title */}
      <h2 className="font-serif font-extrabold text-lg sm:text-xl text-ink truncate flex-shrink-0">
        {getViewTitle()}
      </h2>

      {/* Global Search Bar */}
      <div className="hidden sm:block flex-1 max-w-sm relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          placeholder="Quick search... (Press /)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-bg border border-line rounded-full pl-10 pr-4 py-2 text-xs font-semibold text-ink placeholder-muted focus:outline-none focus:border-[#4C7A5A] transition-all"
        />
      </div>

      {/* Action Tray */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-line hover:bg-bg text-ink transition-colors"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Quick Add Button */}
        <button
          onClick={onQuickAdd}
          className="bg-[#4C7A5A] hover:bg-[#3D6349] active:scale-95 text-white font-semibold rounded-full px-4 py-2 text-xs transition-all flex items-center gap-1.5 shadow-sm hover:shadow-[#4C7A5A]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>
      </div>
    </header>
  );
};
