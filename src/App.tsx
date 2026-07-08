import React, { useState } from 'react';
import {
  Home,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Repeat,
  Calendar,
  LogOut,
  Plus,
  Coins,
  BarChart2,
  Menu,
  X,
  Settings,
  DollarSign,
  PieChart,
  Target,
  FolderTree,
  Grid,
  CreditCard,
  Database,
} from 'lucide-react';
import { AppProvider, useApp } from './AppContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { TransactionModal } from './components/TransactionModal';
import { AccountModal } from './components/AccountModal';
import {
  HomeView,
  AccountsView,
  TransfersView,
  LoansView,
  InvestmentsView,
  RemindersView,
  BudgetsView,
  GroupsView,
  AssetsView,
  CreditView,
  BackupView,
  SettingsView,
  ReportsView,
} from './components/ModuleViews';
import { TransactionViews } from './components/TransactionViews';

function AppContent() {
  const {
    user,
    view,
    setView,
    login,
    signup,
    logout,
    theme,
  } = useApp();

  // Screen/modal triggers
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTxId, setActiveTxId] = useState<string | null>(null);
  const [defaultTxAccountId, setDefaultTxAccountId] = useState<string | null>(null);
  const [showTxModal, setShowTxModal] = useState(false);

  const [activeAccId, setActiveAccId] = useState<string | null>(null);
  const [showAccModal, setShowAccModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!username.trim() || !password) {
      setAuthError('Please enter username and password.');
      return;
    }
    const success = await login(username, password);
    if (!success) {
      setAuthError('Invalid credentials. Please verify your username and try again.');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!username.trim() || !password || !confirmPassword) {
      setAuthError('Please fill in all requested fields.');
      return;
    }
    if (password !== confirmPassword) {
      setAuthError('Confirm password field does not match choice.');
      return;
    }
    const success = await signup(username, password);
    if (!success) {
      setAuthError('Username already taken. Please try another choice.');
    }
  };

  // Main Render router
  const renderActiveView = () => {
    switch (view) {
      case 'home':
        return (
          <HomeView
            onEditTx={(id) => {
              setActiveTxId(id);
              setShowTxModal(true);
            }}
            onAddTx={() => {
              setActiveTxId(null);
              setShowTxModal(true);
            }}
          />
        );
      case 'accounts':
        return (
          <AccountsView
            onAddAccount={() => {
              setActiveAccId(null);
              setShowAccModal(true);
            }}
            onEditAccount={(id) => {
              setActiveAccId(id);
              setShowAccModal(true);
            }}
            onAddTx={(accId) => {
              setActiveTxId(null);
              setDefaultTxAccountId(accId || null);
              setShowTxModal(true);
            }}
            onEditTx={(id) => {
              setActiveTxId(id);
              setShowTxModal(true);
            }}
          />
        );
      case 'income':
        return (
          <TransactionViews
            type="income"
            onEditTx={(id) => {
              setActiveTxId(id);
              setShowTxModal(true);
            }}
            onAddTx={() => {
              setActiveTxId(null);
              setShowTxModal(true);
            }}
          />
        );
      case 'expenses':
        return (
          <TransactionViews
            type="expense"
            onEditTx={(id) => {
              setActiveTxId(id);
              setShowTxModal(true);
            }}
            onAddTx={() => {
              setActiveTxId(null);
              setShowTxModal(true);
            }}
          />
        );
      case 'transfers':
        return <TransfersView />;
      case 'loans':
        return <LoansView />;
      case 'investments':
        return <InvestmentsView />;
      case 'reminders':
        return <RemindersView />;
      case 'budgets':
        return <BudgetsView />;
      case 'groups':
        return <GroupsView />;
      case 'assets':
        return <AssetsView />;
      case 'credit':
        return <CreditView />;
      case 'backup':
        return <BackupView />;
      case 'settings':
        return <SettingsView />;
      case 'reports':
        return <ReportsView />;
      default:
        return (
          <HomeView
            onEditTx={(id) => {
              setActiveTxId(id);
              setShowTxModal(true);
            }}
            onAddTx={() => {
              setActiveTxId(null);
              setShowTxModal(true);
            }}
          />
        );
    }
  };

  // Authentication View Render
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-bg select-none">
        {/* Ambient Radial Mesh Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,#DEE9DD,transparent_45%),radial-gradient(circle_at_85%_85%,#F3DFDF,transparent_45%)] opacity-70 pointer-events-none" />

        <div className="w-full max-w-sm bg-surface border border-line rounded-3xl p-6 sm:p-8 flex flex-col items-center shadow-xl relative z-10">
          {/* Logo Brand icon */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#223A2A] to-[#4C7A5A] flex items-center justify-center text-white text-2xl shadow-md mb-3">
            🪙
          </div>
          <h1 className="font-serif font-extrabold text-xl text-ink">Money Ledger</h1>
          <p className="text-xs text-muted font-medium mb-6 mt-1 text-center">
            Your finances kept elegantly in a single offline coin-jar ledger.
          </p>

          {/* Sign in vs Sign up tabs */}
          <div className="w-full flex bg-bg p-1 rounded-xl mb-5 font-sans font-bold text-xs select-none">
            <button
              onClick={() => {
                setAuthTab('login');
                setAuthError('');
              }}
              className={`flex-1 py-2 text-center rounded-lg transition-all ${
                authTab === 'login' ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setAuthTab('signup');
                setAuthError('');
              }}
              className={`flex-1 py-2 text-center rounded-lg transition-all ${
                authTab === 'signup' ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form container */}
          {authTab === 'login' ? (
            <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-muted">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full p-2.5 bg-bg border border-line rounded-xl text-xs font-semibold text-ink placeholder-muted focus:outline-none focus:border-[#4C7A5A]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-muted">
                  Secret Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-bg border border-line rounded-xl text-xs font-semibold text-ink placeholder-muted focus:outline-none focus:border-[#4C7A5A]"
                />
              </div>

              {authError && <p className="text-[10px] font-bold text-coral mt-1">{authError}</p>}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#4C7A5A] hover:bg-[#3D6349] active:scale-[0.98] text-white font-bold rounded-xl text-xs shadow-sm mt-2 transition-all"
              >
                Access Ledger Vault
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="w-full flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-muted">
                  Choose Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. dheepankumar"
                  className="w-full p-2.5 bg-bg border border-line rounded-xl text-xs font-semibold text-ink placeholder-muted focus:outline-none focus:border-[#4C7A5A]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-muted">
                  Create Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full p-2.5 bg-bg border border-line rounded-xl text-xs font-semibold text-ink placeholder-muted focus:outline-none focus:border-[#4C7A5A]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-muted">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Retype password"
                  className="w-full p-2.5 bg-bg border border-line rounded-xl text-xs font-semibold text-ink placeholder-muted focus:outline-none"
                />
              </div>

              {authError && <p className="text-[10px] font-bold text-coral mt-1">{authError}</p>}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#4C7A5A] hover:bg-[#3D6349] active:scale-[0.98] text-white font-bold rounded-xl text-xs shadow-sm mt-2 transition-all"
              >
                Launch Custom Coin-Jar
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen bg-bg transition-colors duration-200 ${theme === 'dark' ? 'dark-theme' : ''}`}>
      {/* 1. Desktop Sticky Navigation Column */}
      <Sidebar />

      {/* 2. Scrollable View Area Frame */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        {/* Topbar context search utilities */}
        <Topbar
          onQuickAdd={() => {
            setActiveTxId(null);
            setShowTxModal(true);
          }}
        />

        {/* Mobile quick utility Header */}
        <div className="md:hidden flex items-center justify-between border-b border-line px-5 py-3.5 bg-surface">
          <div className="flex items-center gap-2">
            <span className="text-xl">🪙</span>
            <span className="font-serif font-black text-sm text-ink">Money Ledger</span>
          </div>
          <button
            onClick={() => setShowMobileMenu(true)}
            className="p-1.5 rounded-lg border border-line bg-bg hover:bg-bg/80 text-ink transition-colors flex items-center gap-1 cursor-pointer"
            title="Open navigation menu"
          >
            <Menu className="w-4 h-4 text-[#4C7A5A]" />
            <span className="text-[10px] font-bold">Menu</span>
          </button>
        </div>

        {/* Dynamic Inner Component viewport wrapper */}
        <main className="flex-1 p-5 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* 3. MOBILE TOUCH STICKY BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-md border-t border-line flex items-center justify-around py-2 px-3 z-40 select-none shadow-lg">
        {/* Home */}
        <button
          onClick={() => {
            setView('home');
            setShowMobileMenu(false);
          }}
          className={`flex flex-col items-center gap-1.5 py-1 text-[10px] font-bold transition-colors cursor-pointer ${
            view === 'home' ? 'text-[#4C7A5A]' : 'text-muted'
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        {/* Accounts */}
        <button
          onClick={() => {
            setView('accounts');
            setShowMobileMenu(false);
          }}
          className={`flex flex-col items-center gap-1.5 py-1 text-[10px] font-bold transition-colors cursor-pointer ${
            view === 'accounts' ? 'text-[#4C7A5A]' : 'text-muted'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Accounts</span>
        </button>

        {/* Mobile Quick Add floating button overlay */}
        <button
          onClick={() => {
            setActiveTxId(null);
            setShowTxModal(true);
          }}
          className="w-11 h-11 rounded-full bg-[#4C7A5A] text-white flex items-center justify-center shadow-lg -translate-y-4 border-4 border-bg hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-5 h-5" />
        </button>

        {/* Reports Ledger */}
        <button
          onClick={() => {
            setView('reports');
            setShowMobileMenu(false);
          }}
          className={`flex flex-col items-center gap-1.5 py-1 text-[10px] font-bold transition-colors cursor-pointer ${
            view === 'reports' ? 'text-[#4C7A5A]' : 'text-muted'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Reports</span>
        </button>

        {/* More Options / Toggles Drawer */}
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className={`flex flex-col items-center gap-1.5 py-1 text-[10px] font-bold transition-colors cursor-pointer ${
            showMobileMenu ? 'text-[#4C7A5A]' : 'text-muted'
          }`}
        >
          <Menu className="w-4 h-4" />
          <span>More</span>
        </button>
      </nav>

      {/* 4. MOBILE DRAWER SLIDE-UP NAVIGATION OVERLAY */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:hidden animate-fade-in select-none">
          {/* Backdrop Closer */}
          <div className="absolute inset-0" onClick={() => setShowMobileMenu(false)} />

          {/* Drawer Body Frame */}
          <div className="bg-surface border-t border-line rounded-t-[2.5rem] w-full max-h-[85vh] overflow-y-auto relative z-10 flex flex-col p-6 shadow-2xl animate-slide-up">
            {/* Header notch design bar */}
            <div className="w-12 h-1 bg-line rounded-full mx-auto mb-4 flex-shrink-0" />

            <div className="flex items-center justify-between mb-5 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xl">🪙</span>
                <div>
                  <h4 className="font-serif font-black text-ink text-sm">Navigation Vault</h4>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-wider">Select modules or registers</p>
                </div>
              </div>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-1.5 rounded-full bg-bg border border-line text-ink hover:bg-line transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrolling Menu groups */}
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-5 pb-6">
              {/* Category Group 1: General Core */}
              <div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-muted block mb-2 px-1">Core Actions</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setView('home'); setShowMobileMenu(false); }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      view === 'home' ? 'bg-[#DEE9DD] text-[#223A2A] border-[#4C7A5A]' : 'bg-bg text-ink border-transparent hover:bg-line/40'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </button>
                  <button
                    onClick={() => { setView('accounts'); setShowMobileMenu(false); }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      view === 'accounts' ? 'bg-[#DEE9DD] text-[#223A2A] border-[#4C7A5A]' : 'bg-bg text-ink border-transparent hover:bg-line/40'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Accounts</span>
                  </button>
                  <button
                    onClick={() => { setView('reports'); setShowMobileMenu(false); }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      view === 'reports' ? 'bg-[#DEE9DD] text-[#223A2A] border-[#4C7A5A]' : 'bg-bg text-ink border-transparent hover:bg-line/40'
                    }`}
                  >
                    <BarChart2 className="w-4 h-4" />
                    <span>Reports</span>
                  </button>
                </div>
              </div>

              {/* Category Group 2: Cashbooks */}
              <div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-muted block mb-2 px-1">Ledger Cashbooks</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setView('income'); setShowMobileMenu(false); }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      view === 'income' ? 'bg-[#DEE9DD] text-[#223A2A] border-[#4C7A5A]' : 'bg-bg text-ink border-transparent hover:bg-line/40'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Income</span>
                  </button>
                  <button
                    onClick={() => { setView('expenses'); setShowMobileMenu(false); }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      view === 'expenses' ? 'bg-[#DEE9DD] text-[#223A2A] border-[#4C7A5A]' : 'bg-bg text-ink border-transparent hover:bg-line/40'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4 text-rose-600" />
                    <span>Expenses</span>
                  </button>
                  <button
                    onClick={() => { setView('transfers'); setShowMobileMenu(false); }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border col-span-2 ${
                      view === 'transfers' ? 'bg-[#DEE9DD] text-[#223A2A] border-[#4C7A5A]' : 'bg-bg text-ink border-transparent hover:bg-line/40'
                    }`}
                  >
                    <Repeat className="w-4 h-4" />
                    <span>Transfers Register</span>
                  </button>
                </div>
              </div>

              {/* Category Group 3: Portfolios & Registers */}
              <div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-muted block mb-2 px-1">Asset Registers & Registers</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setView('loans'); setShowMobileMenu(false); }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      view === 'loans' ? 'bg-[#DEE9DD] text-[#223A2A] border-[#4C7A5A]' : 'bg-bg text-ink border-transparent hover:bg-line/40'
                    }`}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Loans Register</span>
                  </button>
                  <button
                    onClick={() => { setView('investments'); setShowMobileMenu(false); }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      view === 'investments' ? 'bg-[#DEE9DD] text-[#223A2A] border-[#4C7A5A]' : 'bg-bg text-ink border-transparent hover:bg-line/40'
                    }`}
                  >
                    <PieChart className="w-4 h-4" />
                    <span>Investments</span>
                  </button>
                  <button
                    onClick={() => { setView('budgets'); setShowMobileMenu(false); }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      view === 'budgets' ? 'bg-[#DEE9DD] text-[#223A2A] border-[#4C7A5A]' : 'bg-bg text-ink border-transparent hover:bg-line/40'
                    }`}
                  >
                    <Target className="w-4 h-4" />
                    <span>Budget Limits</span>
                  </button>
                  <button
                    onClick={() => { setView('assets'); setShowMobileMenu(false); }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      view === 'assets' ? 'bg-[#DEE9DD] text-[#223A2A] border-[#4C7A5A]' : 'bg-bg text-ink border-transparent hover:bg-line/40'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                    <span>Assets Registry</span>
                  </button>
                  <button
                    onClick={() => { setView('credit'); setShowMobileMenu(false); }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      view === 'credit' ? 'bg-[#DEE9DD] text-[#223A2A] border-[#4C7A5A]' : 'bg-bg text-ink border-transparent hover:bg-line/40'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Credit Card</span>
                  </button>
                  <button
                    onClick={() => { setView('reminders'); setShowMobileMenu(false); }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      view === 'reminders' ? 'bg-[#DEE9DD] text-[#223A2A] border-[#4C7A5A]' : 'bg-bg text-ink border-transparent hover:bg-line/40'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Reminders</span>
                  </button>
                </div>
              </div>

              {/* Category Group 4: Categories & System */}
              <div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-muted block mb-2 px-1">Settings & Backup</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setView('groups'); setShowMobileMenu(false); }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      view === 'groups' ? 'bg-[#DEE9DD] text-[#223A2A] border-[#4C7A5A]' : 'bg-bg text-ink border-transparent hover:bg-line/40'
                    }`}
                  >
                    <FolderTree className="w-4 h-4" />
                    <span>Groups & Categories</span>
                  </button>
                  <button
                    onClick={() => { setView('backup'); setShowMobileMenu(false); }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      view === 'backup' ? 'bg-[#DEE9DD] text-[#223A2A] border-[#4C7A5A]' : 'bg-bg text-ink border-transparent hover:bg-line/40'
                    }`}
                  >
                    <Database className="w-4 h-4" />
                    <span>System Backup</span>
                  </button>
                  <button
                    onClick={() => { setView('settings'); setShowMobileMenu(false); }}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border col-span-2 ${
                      view === 'settings' ? 'bg-[#DEE9DD] text-[#223A2A] border-[#4C7A5A]' : 'bg-bg text-ink border-transparent hover:bg-line/40'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Preferences & Settings</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Logout controls */}
            <div className="border-t border-line pt-4 flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={() => { setShowMobileMenu(false); logout(); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#F3DFDF]/20 hover:bg-[#F3DFDF]/40 border border-coral/30 rounded-2xl text-xs font-bold text-[#8C3B4A] transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out of Ledger Vault</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Core Modals overlays */}
      {showTxModal && (
        <TransactionModal
          transactionId={activeTxId}
          defaultAccountId={defaultTxAccountId}
          onClose={() => {
            setShowTxModal(false);
            setDefaultTxAccountId(null);
          }}
        />
      )}

      {showAccModal && (
        <AccountModal
          accountId={activeAccId}
          onClose={() => setShowAccModal(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
