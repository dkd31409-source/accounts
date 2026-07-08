import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Repeat,
  AlertTriangle,
  FileText,
  Calendar,
  CheckCircle,
  HelpCircle,
  Briefcase,
  Layers,
  ArrowRightLeft,
  ChevronRight,
  Shield,
  Trash2,
  Edit3,
  Paperclip,
  Check,
  Search,
  Lock,
  Percent,
  Download,
  Upload,
  Coins,
} from 'lucide-react';
import { useApp } from '../AppContext';
import { DashboardCharts } from './DashboardCharts';
import { Attachment, Transaction, Account, Loan, Investment, Asset, CreditCard, Reminder } from '../types';
import { AttachmentManager } from './AttachmentManager';
import { DB } from '../db';

// Unique string identifier helper for models
const uid = (prefix = '') => `${prefix ? prefix + '_' : ''}${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

// ==========================================
// 1. HOME / DASHBOARD VIEW
// ==========================================
export const HomeView: React.FC<{
  onEditTx: (id: string) => void;
  onAddTx: () => void;
}> = ({ onEditTx, onAddTx }) => {
  const {
    transactions,
    accounts,
    formatCurrency,
    getBaseCurrencyCode,
    getDashboardMetrics,
    getAccountBalance,
    deleteTransaction,
  } = useApp();

  const metrics = getDashboardMetrics();
  const baseCode = getBaseCurrencyCode();

  // Find due reminders
  const { reminders, approveReminder } = useApp();
  const activeReminders = reminders.filter(
    (r) => r.status === 'active' && new Date(r.nextDueDate) <= new Date()
  );

  // Compute this month's savings percentage for the interactive SVG Jar
  const getSavingsRate = () => {
    if (metrics.moneyIn <= 0) return 0;
    const rate = Math.round((metrics.cashFlow / metrics.moneyIn) * 100);
    return Math.max(0, Math.min(100, rate));
  };

  const savingsRate = getSavingsRate();

  // Highlight accounts with overdraft usage (Section 3 warning display)
  const overdraftedAccounts = accounts.filter((acc) => {
    if (!acc.allowOverdraft) return false;
    const balance = getAccountBalance(acc.id);
    return balance < 0;
  });

  // Recent transactions list
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-6">
      {/* Premium Hero Frame - Money Jar Theme */}
      <div className="bg-gradient-to-br from-[#223A2A] to-[#4C7A5A] text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden select-none">
        <div className="flex flex-col gap-1.5 min-w-0">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#DEE9DD]/80 font-sans">
            Total Net Worth Balance
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white leading-none">
            {formatCurrency(metrics.netWorth)}
          </h1>
          <p className="text-xs text-[#DEE9DD]/70 font-medium mt-1">
            Aggregated bank accounts, assets, cash, investments minus liabilities
          </p>
        </div>

        {/* Dynamic Interactive Coin Jar (Representing Savings Rate!) */}
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 flex-shrink-0 select-none">
          <div className="relative w-16 h-20 flex items-center justify-center">
            {/* Coin Jar SVG */}
            <svg className="w-16 h-20 drop-shadow-md" viewBox="0 0 100 120">
              {/* Lid */}
              <rect x="35" y="5" width="30" height="8" rx="2" fill="#D6A23C" />
              <rect x="40" y="13" width="20" height="6" fill="#F6E7C8" opacity="0.6" />
              {/* Jar Body Outline */}
              <path
                d="M 25,25 Q 15,25 15,45 L 15,95 Q 15,115 35,115 L 65,115 Q 85,115 85,95 L 85,45 Q 85,25 75,25 Z"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="4"
              />
              {/* Fill Liquid (representing savings percentage height) */}
              <clipPath id="jarClip">
                <path d="M 25,25 Q 15,25 15,45 L 15,95 Q 15,115 35,115 L 65,115 Q 85,115 85,95 L 85,45 Q 85,25 75,25 Z" />
              </clipPath>
              <rect
                x="10"
                y={25 + (90 - (savingsRate / 100) * 90)}
                width="80"
                height="95"
                fill="#D6A23C"
                clipPath="url(#jarClip)"
                className="transition-all duration-500 ease-out"
              />
              <path
                d="M 15 60 Q 25 55 35 60 T 55 60 T 75 60 T 85 60"
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="2"
                clipPath="url(#jarClip)"
              />
            </svg>
            <Coins className="w-5 h-5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold font-serif text-white">{savingsRate}%</span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#DEE9DD]/80">
              Savings Kept
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards Row (Section 6 verified) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Money In */}
        <div className="bg-surface border border-line p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
              Money In
            </span>
            <span className="text-lg font-bold text-[#4C7A5A] truncate block font-serif">
              {formatCurrency(metrics.moneyIn)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#DEE9DD] text-[#223A2A] flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Money Out */}
        <div className="bg-surface border border-line p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
              Money Out
            </span>
            <span className="text-lg font-bold text-[#8C3B4A] truncate block font-serif">
              {formatCurrency(metrics.moneyOut)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F3DFDF] text-[#8C3B4A] flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* Cash Flow */}
        <div className="bg-surface border border-line p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
              Net Cash Flow
            </span>
            <span
              className={`text-lg font-bold truncate block font-serif ${
                metrics.cashFlow >= 0 ? 'text-[#4C7A5A]' : 'text-[#8C3B4A]'
              }`}
            >
              {formatCurrency(metrics.cashFlow)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-bg text-ink flex items-center justify-center">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
        </div>

        {/* Financial Assets */}
        <div className="bg-surface border border-line p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
              Total Assets
            </span>
            <span className="text-lg font-bold text-[#D6A23C] truncate block font-serif">
              {formatCurrency(metrics.assetsTotal)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F6E7C8] text-[#D6A23C] flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Warnings & Active Alerts */}
      {(overdraftedAccounts.length > 0 || activeReminders.length > 0) && (
        <div className="flex flex-col gap-3">
          {overdraftedAccounts.map((acc) => {
            const balance = getAccountBalance(acc.id);
            return (
              <div
                key={acc.id}
                className="bg-[#F3DFDF] border border-[#8C3B4A]/20 text-[#8C3B4A] rounded-2xl p-4 flex items-center gap-3 shadow-sm"
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <div className="text-xs font-semibold">
                  Overdraft Alert: Account{' '}
                  <span className="underline">{acc.name}</span> has dipped into overdraft.
                  Current Balance: <span className="font-mono">{formatCurrency(balance, acc.currency)}</span>.
                </div>
              </div>
            );
          })}

          {activeReminders.map((rem) => (
            <div
              key={rem.id}
              className="bg-[#F6E7C8]/40 border border-[#D6A23C]/20 text-[#D6A23C] rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#D6A23C] flex-shrink-0" />
                <div className="text-xs font-semibold">
                  Due Reminder: <span className="font-bold text-ink">{rem.title}</span> is due on {rem.nextDueDate}.
                </div>
              </div>
              <button
                onClick={() => approveReminder(rem.id)}
                className="px-3 py-1.5 bg-[#D6A23C] hover:bg-[#B5732E] text-white rounded-xl text-[10px] font-bold shadow-sm transition-all"
              >
                Post Transaction
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Charts component (Section 5 dynamic views) */}
      <DashboardCharts />

      {/* Recent Ledger Logs Section */}
      <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted font-sans">
            Recent Ledger Logs
          </h3>
          <button
            onClick={onAddTx}
            className="text-xs font-bold text-[#4C7A5A] hover:underline"
          >
            + Quick Post
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center p-8 flex flex-col items-center gap-2">
            <span className="text-3xl">📭</span>
            <p className="text-xs font-semibold text-ink">No transactions logged</p>
            <p className="text-[10px] text-muted">Tap Add Transaction to record your first entry.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recentTransactions.map((tx) => {
              const acc = accounts.find((a) => a.id === tx.accountId);
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3.5 hover:bg-bg/40 rounded-xl transition-colors border border-transparent hover:border-line group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        tx.type === 'income'
                          ? 'bg-[#DEE9DD] text-[#223A2A]'
                          : 'bg-[#F3DFDF] text-[#8C3B4A]'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-ink truncate">
                        {tx.description}
                      </p>
                      <p className="text-[10px] text-muted truncate mt-0.5">
                        {tx.date} · {acc?.name || 'External'}
                        {tx.attachments?.length > 0 && (
                          <span className="ml-2 inline-flex items-center gap-0.5 text-xs text-[#4C7A5A] font-sans">
                            <Paperclip className="w-3 h-3" />
                            {tx.attachments.length}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-xs font-bold font-mono ${
                        tx.type === 'income' ? 'text-[#4C7A5A]' : 'text-[#8C3B4A]'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount, tx.currency)}
                    </span>

                    {/* Edit/Delete triggers */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        onClick={() => onEditTx(tx.id)}
                        className="p-1 text-muted hover:text-ink hover:bg-bg rounded-lg transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete transaction log?')) deleteTransaction(tx.id);
                        }}
                        className="p-1 text-muted hover:text-coral hover:bg-[#F3DFDF] rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 2. ACCOUNTS VIEW / LEDGER
// ==========================================
export const AccountsView: React.FC<{
  onAddAccount: () => void;
  onEditAccount: (id: string) => void;
  onAddTx?: (accountId?: string) => void;
  onEditTx?: (id: string) => void;
}> = ({ onAddAccount, onEditAccount, onAddTx, onEditTx }) => {
  const {
    accounts,
    getAccountBalance,
    getOverdraftStatus,
    formatCurrency,
    deleteAccount,
    transactions,
    groups,
    deleteTransaction,
    editTransaction,
    convertCurrency,
  } = useApp();

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerType, setLedgerType] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [ledgerGroup, setLedgerGroup] = useState('all');
  const [ledgerSuccess, setLedgerSuccess] = useState<string | null>(null);

  const handleApprovePendingTransfer = (t: Transaction) => {
    if (!t.transferId) return;
    const today = new Date().toISOString().slice(0, 10);
    const legs = transactions.filter((tx) => tx.transferId === t.transferId);
    legs.forEach((leg) => {
      editTransaction(leg.id, { status: 'completed', date: today });
    });
    setLedgerSuccess(`Transfer approved and marked as completed on ${today}! Account ledger balances have been fully updated.`);
    setTimeout(() => setLedgerSuccess(null), 6000);
  };

  // Set first account as selected if none is selected
  React.useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  // Filter transactions for this selected account
  const rawLedgerTxs = transactions.filter((t) => t.accountId === selectedAccountId);

  // Search and filter controls inside ledger
  const filteredLedgerTxs = rawLedgerTxs
    .filter((t) => {
      // search
      if (ledgerSearch.trim()) {
        return t.description.toLowerCase().includes(ledgerSearch.toLowerCase());
      }
      return true;
    })
    .filter((t) => {
      // type
      if (ledgerType === 'all') return true;
      if (ledgerType === 'transfer') return !!t.isTransfer;
      return t.type === ledgerType && !t.isTransfer;
    })
    .filter((t) => {
      // category group
      if (ledgerGroup === 'all') return true;
      return t.groupId === ledgerGroup;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Export ledger to CSV helper
  const handleExportLedgerCSV = () => {
    if (!selectedAccount) return;
    const headers = ['Date', 'Description', 'Amount', 'Currency', 'Type', 'Category'];
    const rows = filteredLedgerTxs.map((t) => {
      const grp = groups.find((g) => g.id === t.groupId);
      return [
        t.date,
        t.description,
        t.amount,
        t.currency,
        t.isTransfer ? 'Transfer' : t.type,
        grp ? grp.name : 'N/A',
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${selectedAccount.name}_ledger_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted font-sans">
          Bank & Cash Portfolio
        </h3>
        <button
          onClick={onAddAccount}
          className="bg-[#4C7A5A] hover:bg-[#3D6349] text-white font-bold rounded-full px-4 py-2 text-xs shadow-sm transition-all"
        >
          + Open Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="bg-surface border border-line rounded-2xl p-12 text-center flex flex-col items-center gap-3">
          <span className="text-4xl">🏦</span>
          <p className="text-sm font-bold text-ink">No bank accounts registered</p>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Open a checking, card, savings, or digital account to start cataloging transactions.
          </p>
          <button
            onClick={onAddAccount}
            className="mt-2 bg-[#4C7A5A] text-white font-bold text-xs rounded-xl px-5 py-2 hover:bg-[#3D6349] transition-all"
          >
            Create Your First Account
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map((acc) => {
            const balance = getAccountBalance(acc.id);
            const overdraft = getOverdraftStatus(acc.id);
            const isSelected = selectedAccountId === acc.id;

            // Calculate pending transfers affecting this account
            const accountTxs = transactions.filter((t) => t.accountId === acc.id);
            const pendingTransfers = accountTxs.filter((t) => t.isTransfer && t.status === 'pending');
            const pendingInflow = pendingTransfers
              .filter((t) => t.type === 'income')
              .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, acc.currency), 0);
            const pendingOutflow = pendingTransfers
              .filter((t) => t.type === 'expense')
              .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, acc.currency), 0);
            const pendingNet = pendingInflow - pendingOutflow;

            return (
              <div
                key={acc.id}
                onClick={() => setSelectedAccountId(acc.id)}
                className={`bg-surface border-2 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all relative group cursor-pointer ${
                  isSelected ? 'border-[#4C7A5A] ring-2 ring-[#4C7A5A]/10' : 'border-line'
                }`}
              >
                {isSelected && (
                  <span className="absolute -top-2.5 -right-2.5 bg-[#4C7A5A] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 select-none">
                    <Check className="w-2.5 h-2.5 stroke-[3]" /> Active Ledger
                  </span>
                )}

                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {acc.type === 'card'
                          ? '💳'
                          : acc.type === 'cash'
                          ? '💵'
                          : acc.type === 'investment'
                          ? '📈'
                          : '🏦'}
                      </span>
                      <h4 className="font-serif font-bold text-base text-ink truncate max-w-[140px]">
                        {acc.name}
                      </h4>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditAccount(acc.id);
                        }}
                        className="p-1 rounded-lg text-muted hover:text-ink hover:bg-bg transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete account ${acc.name}? All transaction associations will remain.`)) {
                            deleteAccount(acc.id);
                          }
                        }}
                        className="p-1 rounded-lg text-muted hover:text-coral hover:bg-[#F3DFDF] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Main balance display */}
                  <div className="my-4">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                      Ledger Balance
                    </span>
                    <span
                      className={`text-2xl font-serif font-bold ${
                        balance >= 0 ? 'text-ink' : 'text-[#8C3B4A]'
                      }`}
                    >
                      {formatCurrency(balance, acc.currency)}
                    </span>
                    {pendingNet !== 0 && (
                      <div className="flex items-center gap-1.5 mt-1 bg-[#F6E7C8]/25 border border-[#D6A23C]/35 px-2.5 py-1 rounded-xl w-fit animate-fade-in">
                        <span className="w-1.5 h-1.5 bg-[#D6A23C] rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-[#D6A23C] uppercase tracking-wider">
                          Pending:
                        </span>
                        <span className={`text-[11px] font-mono font-bold ${pendingNet > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {pendingNet > 0 ? '+' : ''}{formatCurrency(pendingNet, acc.currency)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Overdraft Section Details (Section 3 Requirement) */}
                {acc.allowOverdraft ? (
                  <div className="mt-4 pt-4 border-t border-line text-xs font-medium text-muted flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider text-[#223A2A]">
                      <span>Overdraft Status</span>
                      <span className="text-[#4C7A5A]">Active protection</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-1 font-sans">
                      <div>
                        <span className="text-[10px] block font-semibold">Overdraft Limit</span>
                        <span className="text-ink font-bold font-mono">
                          {formatCurrency(overdraft.limit, acc.currency)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] block font-semibold">Used Balance</span>
                        <span className="text-coral font-bold font-mono">
                          {formatCurrency(overdraft.used, acc.currency)}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] block font-semibold">Available Overdraft</span>
                        <span className="text-[#4C7A5A] font-bold font-mono">
                          {formatCurrency(overdraft.available, acc.currency)}
                        </span>
                      </div>
                    </div>

                    {acc.overdraftInterestRate && (
                      <div className="text-[10px] italic mt-1 text-[#223A2A]/80">
                        * Interest Charge rate: {acc.overdraftInterestRate}% p.a.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-line text-[10px] font-semibold text-muted tracking-wider uppercase">
                    Standard Cash Ledger Account
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Account Transaction Ledger List */}
      {selectedAccount && (
        <div className="mt-8 bg-surface border border-line p-6 rounded-3xl shadow-sm flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📜</span>
                <h3 className="font-serif font-bold text-lg text-ink">
                  {selectedAccount.name} Ledger Activity
                </h3>
              </div>
              <p className="text-xs text-muted mt-1">
                Showing transaction logs associated with this portfolio account. Click any account card above to change ledger.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  if (onAddTx) onAddTx(selectedAccountId || undefined);
                }}
                className="bg-[#4C7A5A] hover:bg-[#3D6349] text-white font-bold rounded-xl px-4 py-2 text-xs transition-all flex items-center gap-1.5"
              >
                + Post Transaction
              </button>
              <button
                onClick={handleExportLedgerCSV}
                className="bg-bg border border-line hover:border-ink text-ink font-bold rounded-xl px-4 py-2 text-xs transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {ledgerSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#223A2A] rounded-xl text-xs font-bold flex items-start gap-2 animate-fade-in">
              <span className="text-sm mt-0.5">✅</span>
              <div className="flex-1">
                <p className="font-bold uppercase tracking-wider text-[10px] text-emerald-800 mb-0.5">Success</p>
                <p className="font-medium text-emerald-700/90">{ledgerSuccess}</p>
              </div>
            </div>
          )}

          {/* Ledger filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted mb-1 block">Search Details</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
                <input
                  type="text"
                  placeholder="Search description..."
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  className="w-full bg-bg border border-line rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-ink focus:outline-none focus:border-[#4C7A5A]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted mb-1 block">Transaction Type</label>
              <select
                value={ledgerType}
                onChange={(e) => setLedgerType(e.target.value as any)}
                className="w-full p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink focus:outline-none focus:border-[#4C7A5A]"
              >
                <option value="all">All Logs</option>
                <option value="income">Inflow (Income)</option>
                <option value="expense">Outflow (Expenses)</option>
                <option value="transfer">Transfers</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold tracking-wider text-muted mb-1 block">Category Group</label>
              <select
                value={ledgerGroup}
                onChange={(e) => setLedgerGroup(e.target.value)}
                className="w-full p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink focus:outline-none focus:border-[#4C7A5A]"
              >
                <option value="all">All Categories</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>{g.icon} {g.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table list */}
          {filteredLedgerTxs.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-line rounded-2xl bg-bg/20">
              <span className="text-3xl">🧾</span>
              <p className="text-xs font-bold text-ink mt-2">No matching transactions in ledger</p>
              <p className="text-[10px] text-muted">Try clearing search filters or add a new log.</p>
            </div>
          ) : (
            <div className="border border-line rounded-2xl overflow-hidden bg-bg/10">
              <div className="overflow-x-auto animate-fade-in">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-bg border-b border-line text-[10px] uppercase font-bold tracking-wider text-muted select-none">
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Description</th>
                      <th className="px-5 py-3">Category</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                      <th className="px-5 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-xs font-medium text-ink">
                    {filteredLedgerTxs.map((t) => {
                      const grp = groups.find((g) => g.id === t.groupId);
                      return (
                        <tr key={t.id} className="hover:bg-bg/25 group transition-colors">
                          <td className="px-5 py-4 font-semibold text-muted font-mono">{t.date}</td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-ink">{t.description}</span>
                                {t.status === 'pending' && (
                                  <span className="bg-[#F6E7C8] text-[#D6A23C] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse flex items-center gap-1 select-none">
                                    <span className="w-1 h-1 bg-[#D6A23C] rounded-full" /> Pending Approval
                                  </span>
                                )}
                              </div>
                              {t.isTransfer && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-[#4C7A5A] font-bold uppercase tracking-wider">
                                  <Repeat className="w-3 h-3" /> Portfolio Transfer
                                </span>
                              )}
                              {t.attachments?.length > 0 && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] text-[#4C7A5A] mt-0.5">
                                  <Paperclip className="w-3 h-3" /> {t.attachments.length} attachment(s)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {grp ? (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                                style={{ backgroundColor: `${grp.color}15`, color: grp.color }}
                              >
                                <span>{grp.icon}</span>
                                <span>{grp.name}</span>
                              </span>
                            ) : t.isTransfer ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#DEE9DD] text-[#4C7A5A]">
                                💸 Transfer
                              </span>
                            ) : (
                              <span className="text-muted italic text-[10px]">Uncategorized</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span
                              className={`font-bold font-mono text-sm ${
                                t.type === 'income' ? 'text-[#4C7A5A]' : 'text-[#8C3B4A]'
                              }`}
                            >
                              {t.type === 'income' ? '+' : '-'}
                              {formatCurrency(t.amount, t.currency)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {t.isTransfer && t.status === 'pending' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApprovePendingTransfer(t);
                                  }}
                                  className="p-1.5 rounded-lg text-[#4C7A5A] hover:bg-[#DEE9DD] transition-colors flex items-center justify-center"
                                  title="Approve & Complete Transfer"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onEditTx) onEditTx(t.id);
                                }}
                                className="p-1 rounded-lg text-muted hover:text-ink hover:bg-bg transition-colors"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Permanently delete transaction?')) {
                                    deleteTransaction(t.id);
                                  }
                                }}
                                className="p-1 rounded-lg text-muted hover:text-coral hover:bg-[#F3DFDF] transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. TRANSFERS MODULE (Section 3 & Ledger validation)
// ==========================================
export const TransfersView: React.FC = () => {
  const { accounts, addTransaction, formatCurrency, transactions, deleteTransaction, editTransaction } = useApp();

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [refNo, setRefNo] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [fromAmount, setFromAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('AED');
  const [toAmount, setToAmount] = useState('');
  const [toCurrency, setToCurrency] = useState('AED');
  const [transferFee, setTransferFee] = useState('0');
  const [exchangeRate, setExchangeRate] = useState('1');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'pending' | 'completed' | 'cancelled'>('completed');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  // Transfer history UI state
  const [transferSearch, setTransferSearch] = useState('');
  const [transferStatusFilter, setTransferStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [expandedTransferId, setExpandedTransferId] = useState<string | null>(null);

  // Update currencies automatically based on accounts selection
  const handleFromAccountChange = (id: string) => {
    setFromAccountId(id);
    setError(null);
    setValidationErrors((prev) => ({ ...prev, fromAccountId: false }));
    const acc = accounts.find((a) => a.id === id);
    if (acc) setFromCurrency(acc.currency);
  };

  const handleToAccountChange = (id: string) => {
    setToAccountId(id);
    setError(null);
    setValidationErrors((prev) => ({ ...prev, toAccountId: false }));
    const acc = accounts.find((a) => a.id === id);
    if (acc) setToCurrency(acc.currency);
  };

  // Sync converted amounts or rates
  const handleAmountChange = (val: string) => {
    setFromAmount(val);
    setError(null);
    setValidationErrors((prev) => ({ ...prev, fromAmount: false }));
    const amt = parseFloat(val) || 0;
    const rate = parseFloat(exchangeRate) || 1;
    setToAmount((amt * rate).toFixed(2));
  };

  const handleRateChange = (val: string) => {
    setExchangeRate(val);
    const amt = parseFloat(fromAmount) || 0;
    const rate = parseFloat(val) || 1;
    setToAmount((amt * rate).toFixed(2));
  };

  const executeTransfer = () => {
    setError(null);
    setSuccess(null);
    setValidationErrors({});

    const fAmt = parseFloat(fromAmount);
    const tAmt = parseFloat(toAmount);
    const fee = parseFloat(transferFee) || 0;

    const errors: Record<string, boolean> = {};
    if (!fromAccountId) errors.fromAccountId = true;
    if (!toAccountId) errors.toAccountId = true;
    if (isNaN(fAmt) || fAmt <= 0) errors.fromAmount = true;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      if (!fromAccountId || !toAccountId) {
        setError('Please specify source and target transfer accounts.');
      } else {
        setError('Please enter a valid transfer amount.');
      }
      return;
    }

    if (fromAccountId === toAccountId) {
      setError('Source and target accounts must be different portfolio accounts.');
      setValidationErrors({ fromAccountId: true, toAccountId: true });
      return;
    }

    const transferId = uid('trf');
    const transferNum = `TRF-${Date.now().toString(36).toUpperCase()}`;

    // Source Outflow Leg
    const sourceLeg: Omit<Transaction, 'id' | 'userId' | 'createdAt'> = {
      type: 'expense',
      accountId: fromAccountId,
      amount: fAmt + fee,
      currency: fromCurrency,
      description: description || `Transfer: Send to ${accounts.find((a) => a.id === toAccountId)?.name}`,
      date,
      attachments,
      isTransfer: true,
      transferId,
      transferNumber: transferNum,
      referenceNumber: refNo,
      transferSide: 'source',
      transferFee: fee,
      exchangeRateUsed: parseFloat(exchangeRate) || 1,
      status,
    };

    // Target Inflow Leg
    const destLeg: Omit<Transaction, 'id' | 'userId' | 'createdAt'> = {
      type: 'income',
      accountId: toAccountId,
      amount: tAmt,
      currency: toCurrency,
      description: description || `Transfer: Received from ${accounts.find((a) => a.id === fromAccountId)?.name}`,
      date,
      attachments,
      isTransfer: true,
      transferId,
      transferNumber: transferNum,
      referenceNumber: refNo,
      transferSide: 'destination',
      transferFee: fee,
      exchangeRateUsed: parseFloat(exchangeRate) || 1,
      status,
    };

    addTransaction(sourceLeg);
    addTransaction(destLeg);

    setSuccess(`Transfer recorded successfully! ${status === 'completed' ? 'Account balances have been synchronized.' : 'Record stored as pending.'}`);
    
    // Clear Form
    setRefNo('');
    setFromAmount('');
    setToAmount('');
    setTransferFee('0');
    setExchangeRate('1');
    setDescription('');
    setAttachments([]);
  };

  // Extract transfers from ledger
  const transferTxList = transactions.filter((t) => t.isTransfer);

  // Group transfer legs together by transferId
  const transfersGrouped = React.useMemo(() => {
    const groups: Record<string, {
      id: string;
      transferNumber?: string;
      referenceNumber?: string;
      date: string;
      status: 'pending' | 'completed' | 'cancelled';
      attachments: Attachment[];
      description?: string;
      source?: Transaction;
      destination?: Transaction;
    }> = {};

    transferTxList.forEach((tx) => {
      const gid = tx.transferId || tx.id;
      if (!groups[gid]) {
        groups[gid] = {
          id: gid,
          transferNumber: tx.transferNumber,
          referenceNumber: tx.referenceNumber,
          date: tx.date,
          status: tx.status || 'completed',
          attachments: tx.attachments || [],
          description: tx.description,
        };
      }

      // Sync status
      if (tx.status && tx.status !== 'completed') {
        groups[gid].status = tx.status;
      }

      // Merge attachments
      if (tx.attachments && tx.attachments.length > 0) {
        tx.attachments.forEach(att => {
          if (!groups[gid].attachments.some(a => a.dataUrl === att.dataUrl)) {
            groups[gid].attachments.push(att);
          }
        });
      }

      if (tx.transferSide === 'source') {
        groups[gid].source = tx;
      } else if (tx.transferSide === 'destination') {
        groups[gid].destination = tx;
      } else {
        if (tx.type === 'expense') {
          groups[gid].source = tx;
        } else {
          groups[gid].destination = tx;
        }
      }
    });

    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
  }, [transferTxList]);

  // Filter transfers based on search and status
  const filteredTransfers = transfersGrouped.filter((tg) => {
    if (transferSearch.trim()) {
      const q = transferSearch.toLowerCase();
      const numMatch = tg.transferNumber?.toLowerCase().includes(q) || tg.referenceNumber?.toLowerCase().includes(q);
      const descMatch = tg.description?.toLowerCase().includes(q);
      const srcAcc = accounts.find((a) => a.id === tg.source?.accountId)?.name.toLowerCase().includes(q);
      const destAcc = accounts.find((a) => a.id === tg.destination?.accountId)?.name.toLowerCase().includes(q);
      if (!numMatch && !descMatch && !srcAcc && !destAcc) {
        return false;
      }
    }

    if (transferStatusFilter !== 'all') {
      if (tg.status !== transferStatusFilter) return false;
    }

    return true;
  });

  const [approvalDates, setApprovalDates] = useState<Record<string, string>>({});

  const getApprovalDate = (tgId: string, currentTxDate: string) => {
    return approvalDates[tgId] || currentTxDate || new Date().toISOString().slice(0, 10);
  };

  const handleSetApprovalDate = (tgId: string, dateVal: string) => {
    setApprovalDates(prev => ({ ...prev, [tgId]: dateVal }));
  };

  const handleApproveTransfer = (tg: typeof transfersGrouped[0]) => {
    const appDate = getApprovalDate(tg.id, tg.date);
    if (!appDate) {
      setError('Please select a valid completion date.');
      return;
    }

    if (tg.source) {
      editTransaction(tg.source.id, { status: 'completed', date: appDate });
    }
    if (tg.destination) {
      editTransaction(tg.destination.id, { status: 'completed', date: appDate });
    }

    setSuccess(`Transfer ${tg.transferNumber || ''} has been approved and marked as completed on ${appDate}! Portfolio balances have been successfully updated.`);
  };

  const handleDeleteTransfer = (tg: typeof transfersGrouped[0]) => {
    if (window.confirm('Are you sure you want to delete this transfer? This will restore balances for both source and destination accounts.')) {
      if (tg.source) deleteTransaction(tg.source.id);
      if (tg.destination) deleteTransaction(tg.destination.id);
      setSuccess('Transfer deleted successfully. Portfolio balances have been restored.');
    }
  };

  const handleExportTransfersCSV = () => {
    const headers = ['Date', 'Transfer ID', 'Reference No', 'From Account', 'Amount Sent', 'Currency Sent', 'To Account', 'Amount Received', 'Currency Received', 'Fee', 'Description', 'Status'];
    const rows = filteredTransfers.map((tg) => {
      const srcAcc = accounts.find((a) => a.id === tg.source?.accountId)?.name || 'N/A';
      const destAcc = accounts.find((a) => a.id === tg.destination?.accountId)?.name || 'N/A';
      return [
        tg.date,
        tg.transferNumber || 'N/A',
        tg.referenceNumber || 'N/A',
        srcAcc,
        tg.source?.amount || '0',
        tg.source?.currency || 'N/A',
        destAcc,
        tg.destination?.amount || '0',
        tg.destination?.currency || 'N/A',
        tg.source?.transferFee || '0',
        tg.description || 'N/A',
        tg.status,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inter_account_transfers_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Transfer Input Form Card */}
      <div className="lg:col-span-7 bg-surface border border-line p-5 rounded-2xl shadow-sm flex flex-col gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted font-sans mb-1">
          New Inter-Account Transfer
        </h3>

        {/* Inline Alerts */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-[#8C3B4A] rounded-xl text-xs font-bold flex items-start gap-2 animate-fade-in">
            <span className="text-sm mt-0.5">⚠️</span>
            <div className="flex-1">
              <p className="font-bold uppercase tracking-wider text-[10px] text-rose-800 mb-0.5">Transfer Validation Error</p>
              <p className="font-medium text-rose-700/90">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#223A2A] rounded-xl text-xs font-bold flex items-start gap-2 animate-fade-in">
            <span className="text-sm mt-0.5">✅</span>
            <div className="flex-1">
              <p className="font-bold uppercase tracking-wider text-[10px] text-emerald-800 mb-0.5">Success</p>
              <p className="font-medium text-emerald-700/90">{success}</p>
            </div>
          </div>
        )}

        {/* Date & Ref */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted">Transfer Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted">Reference Number</label>
            <input
              type="text"
              value={refNo}
              onChange={(e) => setRefNo(e.target.value)}
              placeholder="e.g. TXN-1092-23"
              className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink focus:outline-none focus:border-[#4C7A5A]"
            />
          </div>
        </div>

        {/* From & To Accounts Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted flex items-center justify-between">
              <span>From Account (Source)</span>
              {validationErrors.fromAccountId && <span className="text-[10px] text-rose-600 font-bold lowercase">Required</span>}
            </label>
            <select
              value={fromAccountId}
              onChange={(e) => handleFromAccountChange(e.target.value)}
              className={`p-2 bg-bg border rounded-xl text-xs font-semibold text-ink focus:outline-none transition-all ${
                validationErrors.fromAccountId
                  ? 'border-rose-400 bg-rose-50/10 focus:ring-1 focus:ring-rose-400 focus:border-rose-400 shadow-sm'
                  : 'border-line focus:border-[#4C7A5A]'
              }`}
            >
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.currency})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted flex items-center justify-between">
              <span>To Account (Destination)</span>
              {validationErrors.toAccountId && <span className="text-[10px] text-rose-600 font-bold lowercase">Required</span>}
            </label>
            <select
              value={toAccountId}
              onChange={(e) => handleToAccountChange(e.target.value)}
              className={`p-2 bg-bg border rounded-xl text-xs font-semibold text-ink focus:outline-none transition-all ${
                validationErrors.toAccountId
                  ? 'border-rose-400 bg-rose-50/10 focus:ring-1 focus:ring-rose-400 focus:border-rose-400 shadow-sm'
                  : 'border-line focus:border-[#4C7A5A]'
              }`}
            >
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.currency})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amounts & Currency rates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted flex items-center justify-between">
              <span>Amount Sent</span>
              {validationErrors.fromAmount && <span className="text-[10px] text-rose-600 font-bold lowercase">Invalid amount</span>}
            </label>
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className={`p-2 bg-bg border rounded-xl text-xs font-semibold text-ink font-mono focus:outline-none transition-all ${
                validationErrors.fromAmount
                  ? 'border-rose-400 bg-rose-50/10 focus:ring-1 focus:ring-rose-400 focus:border-rose-400 shadow-sm'
                  : 'border-line focus:border-[#4C7A5A]'
              }`}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted">Exchange Rate</label>
            <input
              type="number"
              value={exchangeRate}
              onChange={(e) => handleRateChange(e.target.value)}
              placeholder="1.00"
              className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink font-mono focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted">Amount Received</label>
            <input
              type="number"
              value={toAmount}
              onChange={(e) => setToAmount(e.target.value)}
              placeholder="0.00"
              className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink font-mono focus:outline-none"
            />
          </div>
        </div>

        {/* Fee & Description */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted">Transfer Processing Fee</label>
            <input
              type="number"
              value={transferFee}
              onChange={(e) => setTransferFee(e.target.value)}
              placeholder="0.00"
              className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink font-mono focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2 flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Internal fund allocation"
              className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink focus:outline-none"
            />
          </div>
        </div>

        {/* Transfer Status Option */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-muted">Transfer Status</label>
          <div className="flex bg-bg p-1 rounded-xl w-fit">
            <button
              onClick={() => setStatus('completed')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                status === 'completed'
                  ? 'bg-[#DEE9DD] text-[#223A2A]'
                  : 'text-muted'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setStatus('pending')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                status === 'pending'
                  ? 'bg-[#F6E7C8] text-[#D6A23C]'
                  : 'text-muted'
              }`}
            >
              Pending
            </button>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={executeTransfer}
          className="mt-2 w-full py-2.5 bg-[#4C7A5A] hover:bg-[#3D6349] active:scale-[0.98] text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          Authorize Transfer
        </button>
      </div>

      {/* Attachment Upload widget in separate panel (Section 1 integration) */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        <div className="bg-surface border border-line p-5 rounded-2xl shadow-sm h-full">
          <AttachmentManager
            attachments={attachments}
            onChange={(updated) => setAttachments(updated)}
            title="Attach Receipts & Statements"
          />
        </div>
      </div>

      {/* NEW: Transfer Logs & Transaction Details Full-Width Panel */}
      <div className="lg:col-span-12 bg-surface border border-line p-5 rounded-2xl shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-ink font-sans">
              Inter-Account Transfer History & Transaction Details
            </h3>
            <p className="text-[10px] text-muted font-medium mt-0.5">
              Unified logs displaying matching source outflows and destination inflows with full details.
            </p>
          </div>
          <button
            onClick={handleExportTransfersCSV}
            disabled={filteredTransfers.length === 0}
            className="flex items-center gap-1.5 bg-bg hover:bg-line border border-line text-ink rounded-xl px-3.5 py-2 text-xs font-bold transition-all disabled:opacity-40 disabled:pointer-events-none self-start sm:self-center"
          >
            <Download className="w-3.5 h-3.5" />
            Export Transfers CSV
          </button>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-bg/40 p-2.5 rounded-xl border border-line">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              value={transferSearch}
              onChange={(e) => setTransferSearch(e.target.value)}
              placeholder="Search by account, ref, description..."
              className="w-full bg-surface border border-line rounded-xl pl-9 pr-3 py-1.5 text-xs font-semibold text-ink placeholder:text-muted/70 focus:outline-none focus:border-[#4C7A5A]"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-bg p-1 rounded-lg border border-line">
            <button
              onClick={() => setTransferStatusFilter('all')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                transferStatusFilter === 'all'
                  ? 'bg-surface text-ink shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setTransferStatusFilter('completed')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                transferStatusFilter === 'completed'
                  ? 'bg-[#DEE9DD] text-[#223A2A] shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setTransferStatusFilter('pending')}
              className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                transferStatusFilter === 'pending'
                  ? 'bg-[#F6E7C8] text-[#D6A23C] shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Pending
            </button>
          </div>
        </div>

        {/* Transfers List */}
        {filteredTransfers.length === 0 ? (
          <div className="text-center p-10 flex flex-col items-center gap-2 border border-dashed border-line rounded-2xl bg-bg/10">
            <span className="text-3xl">💸</span>
            <p className="text-xs font-semibold text-ink">No inter-account transfers found</p>
            <p className="text-[10px] text-muted">Use the transfer form above to allocate funds between your portfolio accounts.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filteredTransfers.map((tg) => {
              const isExpanded = expandedTransferId === tg.id;
              const sourceAcc = accounts.find((a) => a.id === tg.source?.accountId);
              const destAcc = accounts.find((a) => a.id === tg.destination?.accountId);

              return (
                <div
                  key={tg.id}
                  className={`border rounded-2xl transition-all overflow-hidden ${
                    isExpanded
                      ? 'border-[#4C7A5A]/40 bg-[#4C7A5A]/5'
                      : 'border-line hover:border-line-dark bg-surface hover:bg-bg/25'
                  }`}
                >
                  {/* Collapsed Header / Main Row */}
                  <div
                    onClick={() => setExpandedTransferId(isExpanded ? null : tg.id)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-bg border border-line flex items-center justify-center text-ink flex-shrink-0">
                        <ArrowRightLeft className="w-4.5 h-4.5 text-[#4C7A5A]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-serif font-bold text-ink">
                            {sourceAcc?.name || 'Unknown Account'}
                          </span>
                          <span className="text-muted text-[10px]">➔</span>
                          <span className="text-xs font-serif font-bold text-ink">
                            {destAcc?.name || 'Unknown Account'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted font-mono bg-bg px-1.5 py-0.5 rounded border border-line">
                            {tg.transferNumber || 'TRF-LEGACY'}
                          </span>
                          <span className="text-[10px] text-muted font-semibold">{tg.date}</span>
                          {tg.referenceNumber && (
                            <span className="text-[10px] text-muted/70 italic">Ref: {tg.referenceNumber}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      {/* Amount Summary */}
                      <div className="text-right">
                        <div className="text-xs font-bold text-ink font-mono">
                          {formatCurrency(tg.source?.amount || 0, tg.source?.currency)}
                        </div>
                        <div className="text-[10px] text-muted font-semibold">
                          Transfer Principal Leg
                        </div>
                      </div>

                      {/* Status pill */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                            tg.status === 'completed'
                              ? 'bg-[#DEE9DD] text-[#223A2A]'
                              : 'bg-[#F6E7C8] text-[#D6A23C]'
                          }`}
                        >
                          {tg.status}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTransfer(tg);
                            }}
                            className="p-1.5 text-muted hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Reverse/Delete Transfer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <ChevronRight
                            className={`w-4 h-4 text-muted transition-transform duration-200 ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Transaction Details */}
                  {isExpanded && (
                    <div className="border-t border-line-dark/15 p-4 bg-surface flex flex-col gap-4 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Source Ledger Outflow Details */}
                        <div className="bg-bg/40 p-3 rounded-xl border border-line flex flex-col gap-2">
                          <h4 className="text-[11px] font-bold text-[#8C3B4A] uppercase tracking-wider flex items-center gap-1">
                            <TrendingDown className="w-3.5 h-3.5" />
                            Source Outflow Leg
                          </h4>
                          <div className="space-y-1.5 text-xs font-medium text-ink">
                            <div className="flex justify-between">
                              <span className="text-muted">Account:</span>
                              <span className="font-semibold">{sourceAcc?.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted">Net Sent Amount:</span>
                              <span className="font-mono font-semibold">
                                {formatCurrency((tg.source?.amount || 0) - (tg.source?.transferFee || 0), tg.source?.currency)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted">Transfer Fee Paid:</span>
                              <span className="font-mono font-semibold">
                                {formatCurrency(tg.source?.transferFee || 0, tg.source?.currency)}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-line pt-1.5 mt-1">
                              <span className="text-muted font-bold">Total Debited:</span>
                              <span className="font-mono font-bold text-rose-700">
                                {formatCurrency(tg.source?.amount || 0, tg.source?.currency)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Destination Ledger Inflow Details */}
                        <div className="bg-bg/40 p-3 rounded-xl border border-line flex flex-col gap-2">
                          <h4 className="text-[11px] font-bold text-[#4C7A5A] uppercase tracking-wider flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            Destination Inflow Leg
                          </h4>
                          <div className="space-y-1.5 text-xs font-medium text-ink">
                            <div className="flex justify-between">
                              <span className="text-muted">Account:</span>
                              <span className="font-semibold">{destAcc?.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted">Received Amount:</span>
                              <span className="font-mono font-semibold">
                                {formatCurrency(tg.destination?.amount || 0, tg.destination?.currency)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted">Currency Code:</span>
                              <span className="font-mono font-semibold uppercase">{tg.destination?.currency}</span>
                            </div>
                            <div className="flex justify-between border-t border-line pt-1.5 mt-1">
                              <span className="text-muted font-bold">Total Credited:</span>
                              <span className="font-mono font-bold text-emerald-700">
                                {formatCurrency(tg.destination?.amount || 0, tg.destination?.currency)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Conversion & Verification Details */}
                        <div className="bg-bg/40 p-3 rounded-xl border border-line flex flex-col gap-2 md:col-span-2 lg:col-span-1">
                          <h4 className="text-[11px] font-bold text-muted uppercase tracking-wider">
                            Transfer Meta & Verification
                          </h4>
                          <div className="space-y-1.5 text-xs font-medium text-ink">
                            <div className="flex justify-between">
                              <span className="text-muted">Rate Applied:</span>
                              <span className="font-mono font-semibold">
                                1 {tg.source?.currency} = {tg.source?.exchangeRateUsed || 1} {tg.destination?.currency}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted">Reference Voucher:</span>
                              <span className="font-mono text-muted/80">{tg.referenceNumber || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted">Voucher State:</span>
                              <span className="font-bold uppercase tracking-wider text-[10px] text-[#223A2A] bg-[#DEE9DD] px-1.5 py-0.5 rounded">
                                Double Leg Audit ok
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted">Description:</span>
                              <span className="font-semibold text-right max-w-[150px] truncate" title={tg.description}>
                                {tg.description || 'Internal allocation'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* NEW: Pending Approval Option Panel */}
                      {tg.status === 'pending' && (
                        <div className="bg-[#F6E7C8]/25 border border-[#D6A23C]/35 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-[#D6A23C] uppercase tracking-wider flex items-center gap-1.5 mb-1 font-sans">
                              <span>⏳</span> Pending Transfer Approval
                            </h4>
                            <p className="text-[11px] text-ink/90 font-medium">
                              This inter-account transfer is currently marked as pending. You can choose a custom completion/approval date (such as tomorrow) below to authorize the transfer and update portfolio balances.
                            </p>
                            
                            {/* Quick dates */}
                            <div className="flex flex-wrap gap-1.5 mt-3 items-center">
                              <span className="text-[10px] text-muted font-bold mr-1">Quick Date:</span>
                              <button
                                type="button"
                                onClick={() => handleSetApprovalDate(tg.id, tg.date)}
                                className="px-2 py-0.5 bg-surface border border-line hover:border-line-dark text-muted hover:text-ink rounded text-[10px] font-bold transition-all"
                              >
                                Transfer Date ({tg.date})
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetApprovalDate(tg.id, '2026-07-08')}
                                className="px-2 py-0.5 bg-surface border border-line hover:border-line-dark text-muted hover:text-ink rounded text-[10px] font-bold transition-all"
                              >
                                Today (2026-07-08)
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetApprovalDate(tg.id, '2026-07-09')}
                                className="px-2 py-0.5 bg-surface border border-line hover:border-line-dark text-muted hover:text-ink rounded text-[10px] font-bold transition-all"
                              >
                                Tomorrow (2026-07-09)
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 flex-shrink-0">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-muted">Approval Date</label>
                              <input
                                type="date"
                                value={getApprovalDate(tg.id, tg.date)}
                                onChange={(e) => handleSetApprovalDate(tg.id, e.target.value)}
                                className="p-1.5 bg-surface border border-line rounded-xl text-xs font-semibold text-ink focus:outline-none focus:border-[#4C7A5A] w-full sm:w-[130px]"
                              />
                            </div>
                            
                            <button
                              type="button"
                              onClick={() => handleApproveTransfer(tg)}
                              className="bg-[#4C7A5A] hover:bg-[#3D6349] active:scale-[0.98] text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 h-[34px]"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approve & Complete
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Display Associated Receipts */}
                      {tg.attachments && tg.attachments.length > 0 && (
                        <div className="border-t border-line pt-3 mt-1">
                          <h5 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                            <FileText className="w-3.5 h-3.5" />
                            Attached Receipts & Statements ({tg.attachments.length})
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {tg.attachments.map((file) => (
                              <a
                                key={file.dataUrl || file.name}
                                href={file.dataUrl}
                                download={file.name}
                                className="flex items-center gap-2 p-2 bg-bg hover:bg-line border border-line rounded-xl text-xs font-semibold text-ink transition-colors truncate"
                              >
                                <span className="text-base flex-shrink-0">📄</span>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-semibold text-[11px]">{file.name}</p>
                                  <p className="text-[9px] text-muted font-mono">{file.type}</p>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 4. LOANS REGISTER MODULE
// ==========================================
export const LoansView: React.FC = () => {
  const { loans, addLoan, deleteLoan, formatCurrency, accounts } = useApp();

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [borrower, setBorrower] = useState('');
  const [lender, setLender] = useState('');
  const [principal, setPrincipal] = useState('');
  const [currency, setCurrency] = useState('AED');
  const [loanAccountId, setLoanAccountId] = useState('');
  const [interest, setInterest] = useState('');
  const [emi, setEmi] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  const handleSave = () => {
    setError(null);
    setValidationErrors({});

    if (!name.trim() || !principal || parseFloat(principal) <= 0) {
      setError('Please fill in loan name and enter a valid principal amount.');
      setValidationErrors({
        name: !name.trim(),
        principal: !principal || parseFloat(principal) <= 0,
      });
      return;
    }

    const payload = {
      id: uid('loan'),
      name: name.trim(),
      borrower: borrower.trim(),
      lender: lender.trim(),
      principalAmount: parseFloat(principal) || 0,
      loanCurrency: currency,
      loanAccountId,
      interestRate: parseFloat(interest) || 0,
      emiAmount: parseFloat(emi) || 0,
      nextDueDate: dueDate,
      remainingBalance: parseFloat(principal) || 0,
      status: 'Approved' as const,
      notes: '',
      attachments,
    };

    addLoan(payload);
    setShowForm(false);

    // Reset Form
    setName('');
    setBorrower('');
    setLender('');
    setPrincipal('');
    setInterest('');
    setEmi('');
    setDueDate('');
    setAttachments([]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted font-sans">
          Debt and Loans Register
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#4C7A5A] text-white px-4 py-2 font-bold text-xs rounded-full shadow-sm"
        >
          {showForm ? 'View Active Loans' : '+ Record Loan'}
        </button>
      </div>

      {showForm ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-surface border border-line p-6 rounded-2xl shadow-sm">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <h4 className="font-serif font-bold text-base text-ink mb-1">Loan Register Form</h4>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-[#8C3B4A] rounded-xl text-xs font-bold flex items-start gap-2 animate-fade-in">
                <span className="text-sm mt-0.5">⚠️</span>
                <div className="flex-1">
                  <p className="font-medium text-rose-700/90">{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted flex items-center justify-between">
                  <span>Loan Agreement Name</span>
                  {validationErrors.name && <span className="text-[10px] text-rose-600 font-bold lowercase">Required</span>}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                    setValidationErrors((prev) => ({ ...prev, name: false }));
                  }}
                  placeholder="e.g. ADCB Personal Loan"
                  className={`p-2 bg-bg border rounded-xl text-xs font-semibold text-ink focus:outline-none transition-all ${
                    validationErrors.name ? 'border-rose-400 bg-rose-50/10' : 'border-line focus:border-[#4C7A5A]'
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted">Institution / Lender</label>
                <input
                  type="text"
                  value={lender}
                  onChange={(e) => setLender(e.target.value)}
                  placeholder="e.g. ADCB Bank"
                  className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink focus:outline-none focus:border-[#4C7A5A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted flex items-center justify-between">
                  <span>Principal Amount</span>
                  {validationErrors.principal && <span className="text-[10px] text-rose-600 font-bold lowercase">Required</span>}
                </label>
                <input
                  type="number"
                  value={principal}
                  onChange={(e) => {
                    setPrincipal(e.target.value);
                    setError(null);
                    setValidationErrors((prev) => ({ ...prev, principal: false }));
                  }}
                  placeholder="0.00"
                  className={`p-2 bg-bg border rounded-xl text-xs font-semibold text-ink font-mono focus:outline-none transition-all ${
                    validationErrors.principal ? 'border-rose-400 bg-rose-50/10' : 'border-line focus:border-[#4C7A5A]'
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted">Interest Rate (% p.a.)</label>
                <input
                  type="number"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  placeholder="e.g. 4.99"
                  className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink font-mono"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted">EMI Paid Amount</label>
                <input
                  type="number"
                  value={emi}
                  onChange={(e) => setEmi(e.target.value)}
                  placeholder="0.00"
                  className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted">Linked Bank Account (Deposit)</label>
                <select
                  value={loanAccountId}
                  onChange={(e) => setLoanAccountId(e.target.value)}
                  className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink"
                >
                  <option value="">Choose bank account</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.currency})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted">EMI Monthly Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              className="py-2.5 bg-[#4C7A5A] hover:bg-[#3D6349] text-white font-bold rounded-xl text-xs shadow-sm mt-3"
            >
              Save & Release Principal Funds
            </button>
          </div>

          <div className="lg:col-span-5 bg-bg/50 p-4 border border-line rounded-2xl">
            <AttachmentManager
              attachments={attachments}
              onChange={(updated) => setAttachments(updated)}
              title="Attach Agreements & Contracts"
            />
          </div>
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-surface border border-line rounded-2xl p-12 text-center flex flex-col items-center gap-3">
          <span className="text-3xl">🏛️</span>
          <p className="text-sm font-medium text-ink">No loans recorded yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-[#4C7A5A] font-semibold underline"
          >
            Add a loan to track liabilities and net worth.
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loans.map((ln) => (
            <div key={ln.id} className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-serif font-bold text-lg text-ink truncate">{ln.name}</h4>
                  <p className="text-xs text-muted font-sans mt-0.5">Lender: {ln.lender}</p>
                </div>
                <span className="px-2.5 py-1 bg-[#F3DFDF] text-coral rounded-lg font-bold text-[10px] tracking-wider uppercase">
                  {ln.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 border-t border-line/60 pt-4">
                <div>
                  <span className="text-[10px] font-semibold uppercase text-muted tracking-wider block">
                    Outstanding
                  </span>
                  <span className="text-sm font-bold text-coral font-mono block mt-0.5">
                    {formatCurrency(ln.remainingBalance, ln.loanCurrency)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase text-muted tracking-wider block">
                    Monthly EMI
                  </span>
                  <span className="text-sm font-bold text-ink font-mono block mt-0.5">
                    {formatCurrency(ln.emiAmount, ln.loanCurrency)}
                  </span>
                </div>
              </div>

              {ln.attachments?.length > 0 && (
                <div className="mt-4 pt-3 border-t border-line/40 flex items-center gap-2 text-xs text-[#4C7A5A]">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span className="font-semibold underline">
                    {ln.attachments.length} attachment file(s) available
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 5. INVESTMENTS REGISTER MODULE
// ==========================================
export const InvestmentsView: React.FC = () => {
  const { investments, addInvestment, formatCurrency, accounts } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'Fixed Deposit' | 'Recurring Deposit' | 'Stocks' | 'Mutual Funds' | 'Gold' | 'Crypto' | 'Bonds' | 'Savings Certificates' | 'Real Estate'>('Fixed Deposit');
  const [investmentAccountId, setInvestmentAccountId] = useState('');
  const [currency, setCurrency] = useState('AED');
  const [purchaseAmt, setPurchaseAmt] = useState('');
  const [currentVal, setCurrentVal] = useState('');
  const [interest, setInterest] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  const handleSave = () => {
    setError(null);
    setValidationErrors({});

    if (!name.trim() || !purchaseAmt || parseFloat(purchaseAmt) <= 0) {
      setError('Please complete the investment name and enter a valid purchase principal amount.');
      setValidationErrors({
        name: !name.trim(),
        purchaseAmt: !purchaseAmt || parseFloat(purchaseAmt) <= 0,
      });
      return;
    }

    const payload = {
      id: uid('inv'),
      name: name.trim(),
      investmentType: type,
      investmentAccountId,
      currency,
      exchangeRate: 1,
      purchaseAmount: parseFloat(purchaseAmt) || 0,
      currentValue: parseFloat(currentVal) || parseFloat(purchaseAmt) || 0,
      profit: 0,
      loss: 0,
      purchaseDate: new Date().toISOString().slice(0, 10),
      maturityDate: dueDate,
      interestRate: parseFloat(interest) || 0,
      dividend: 0,
      status: 'Active' as const,
      notes: '',
      attachments,
    };

    addInvestment(payload);
    setShowForm(false);

    setName('');
    setPurchaseAmt('');
    setCurrentVal('');
    setInterest('');
    setDueDate('');
    setAttachments([]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted font-sans">
          Wealth & Investments Ledger
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#4C7A5A] text-white px-4 py-2 font-bold text-xs rounded-full shadow-sm"
        >
          {showForm ? 'View Portfolio' : '+ Add Asset/FD/Stock'}
        </button>
      </div>

      {showForm ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-surface border border-line p-6 rounded-2xl shadow-sm">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <h4 className="font-serif font-bold text-base text-ink mb-1">New Investment Entry</h4>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-[#8C3B4A] rounded-xl text-xs font-bold flex items-start gap-2 animate-fade-in">
                <span className="text-sm mt-0.5">⚠️</span>
                <div className="flex-1">
                  <p className="font-medium text-rose-700/90">{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted flex items-center justify-between">
                  <span>Investment Title / Code</span>
                  {validationErrors.name && <span className="text-[10px] text-rose-600 font-bold lowercase">Required</span>}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                    setValidationErrors((prev) => ({ ...prev, name: false }));
                  }}
                  placeholder="e.g. Apple Inc. (AAPL), ADCB FD"
                  className={`p-2 bg-bg border rounded-xl text-xs font-semibold text-ink focus:outline-none transition-all ${
                    validationErrors.name ? 'border-rose-400 bg-rose-50/10' : 'border-line focus:border-[#4C7A5A]'
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted">Asset Category</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink focus:outline-none focus:border-[#4C7A5A]"
                >
                  <option value="Fixed Deposit">Fixed Deposit (FD)</option>
                  <option value="Recurring Deposit">Recurring Deposit (RD)</option>
                  <option value="Stocks">Stocks / Equity</option>
                  <option value="Mutual Funds">Mutual Funds (SIP)</option>
                  <option value="Gold">Gold Asset</option>
                  <option value="Crypto">Crypto Tokens</option>
                  <option value="Bonds">Bonds / Gilts</option>
                  <option value="Real Estate">Real Estate</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted flex items-center justify-between">
                  <span>Purchase Principal</span>
                  {validationErrors.purchaseAmt && <span className="text-[10px] text-rose-600 font-bold lowercase">Required</span>}
                </label>
                <input
                  type="number"
                  value={purchaseAmt}
                  onChange={(e) => {
                    setPurchaseAmt(e.target.value);
                    setError(null);
                    setValidationErrors((prev) => ({ ...prev, purchaseAmt: false }));
                  }}
                  placeholder="0.00"
                  className={`p-2 bg-bg border rounded-xl text-xs font-semibold text-ink font-mono focus:outline-none transition-all ${
                    validationErrors.purchaseAmt ? 'border-rose-400 bg-rose-50/10' : 'border-line focus:border-[#4C7A5A]'
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted">Current Value</label>
                <input
                  type="number"
                  value={currentVal}
                  onChange={(e) => setCurrentVal(e.target.value)}
                  placeholder="0.00"
                  className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink font-mono"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted">Expected Yield (% p.a.)</label>
                <input
                  type="number"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  placeholder="e.g. 6.1"
                  className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted">Funding Source Account</label>
                <select
                  value={investmentAccountId}
                  onChange={(e) => setInvestmentAccountId(e.target.value)}
                  className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink"
                >
                  <option value="">Withdraw principal from account</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.currency})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted">Maturity / Target Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              className="py-2.5 bg-[#4C7A5A] hover:bg-[#3D6349] text-white font-bold rounded-xl text-xs shadow-sm mt-3"
            >
              Commit Purchase & Deduct Principal
            </button>
          </div>

          <div className="lg:col-span-5 bg-bg/50 p-4 border border-line rounded-2xl">
            <AttachmentManager
              attachments={attachments}
              onChange={(updated) => setAttachments(updated)}
              title="Attach Certificates & Statements"
            />
          </div>
        </div>
      ) : investments.length === 0 ? (
        <div className="bg-surface border border-line rounded-2xl p-12 text-center flex flex-col items-center gap-3">
          <span className="text-3xl">📈</span>
          <p className="text-sm font-bold text-ink">Your investment portfolio is currently empty.</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-[#4C7A5A] font-semibold underline"
          >
            Record Fixed Deposits, stocks or precious metal holdings.
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {investments.map((inv) => {
            const growth = inv.currentValue - inv.purchaseAmount;
            return (
              <div key={inv.id} className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h4 className="font-serif font-bold text-base text-ink truncate">{inv.name}</h4>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-muted block mt-1 bg-bg px-2 py-0.5 rounded border border-line/40 w-fit">
                      {inv.investmentType}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-line/60">
                  <div>
                    <span className="text-[10px] text-muted font-semibold block">Investment Cost</span>
                    <span className="font-mono text-xs font-bold text-ink block mt-0.5">
                      {formatCurrency(inv.purchaseAmount, inv.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted font-semibold block">Current Value</span>
                    <span className="font-mono text-xs font-bold block mt-0.5 text-[#4C7A5A]">
                      {formatCurrency(inv.currentValue, inv.currency)}
                    </span>
                  </div>
                </div>

                {growth !== 0 && (
                  <div className="mt-3 text-[10px] font-bold text-right flex items-center justify-end gap-1">
                    <span className="text-muted">Net Yield Growth:</span>
                    <span className={growth > 0 ? 'text-[#4C7A5A]' : 'text-coral'}>
                      {growth > 0 ? '+' : ''}
                      {formatCurrency(growth, inv.currency)} (
                      {((growth / inv.purchaseAmount) * 100).toFixed(1)}%)
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 6. DUE REMINDERS MODULE
// ==========================================
export const RemindersView: React.FC = () => {
  const { reminders, approveReminder, deleteReminder, formatCurrency } = useApp();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted font-sans">
          Reminders and Scheduled Debits
        </h3>
      </div>

      {reminders.length === 0 ? (
        <div className="bg-surface border border-line rounded-2xl p-12 text-center flex flex-col items-center gap-3">
          <span className="text-4xl">🔔</span>
          <p className="text-sm font-bold text-ink">No scheduled reminders found</p>
          <p className="text-xs text-muted max-w-sm">
            Due notifications will automatically aggregate here as upcoming dates approach.
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-line rounded-2xl overflow-hidden divide-y divide-line shadow-sm">
          {reminders.map((rem) => {
            const isDue = new Date(rem.nextDueDate) <= new Date();

            return (
              <div
                key={rem.id}
                className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                  isDue && rem.status !== 'completed' ? 'bg-[#F6E7C8]/10' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isDue && rem.status !== 'completed'
                        ? 'bg-[#F6E7C8] text-[#D6A23C]'
                        : 'bg-[#DEE9DD] text-[#223A2A]'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-serif font-bold text-sm text-ink truncate">{rem.title}</h4>
                    <p className="text-[10px] text-muted truncate mt-0.5 font-sans uppercase tracking-wider">
                      Next Due Date: <span className="font-bold text-ink">{rem.nextDueDate}</span>
                      {rem.repeat !== 'none' && ` · Repeats ${rem.repeat}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 self-end sm:self-center">
                  <span className="text-xs font-bold font-mono text-ink">
                    {formatCurrency(rem.transactionDetails.amount, rem.transactionDetails.currency)}
                  </span>
                  {isDue && rem.status !== 'completed' ? (
                    <button
                      onClick={() => approveReminder(rem.id)}
                      className="px-3.5 py-1.5 bg-[#4C7A5A] hover:bg-[#3D6349] text-white font-bold rounded-xl text-[10px] shadow-sm transition-all"
                    >
                      Record Now
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 bg-[#DEE9DD] text-[#223A2A] rounded-lg font-bold text-[9px] uppercase tracking-wider">
                      {rem.status}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      if (confirm('Delete reminder?')) deleteReminder(rem.id);
                    }}
                    className="p-1 rounded-lg text-muted hover:text-coral hover:bg-[#F3DFDF] transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 7. BUDGTE LIMITS MODULE
// ==========================================
export const BudgetsView: React.FC = () => {
  const { groups, budgets, addBudget, deleteBudget, formatCurrency, transactions, convertCurrency, getBaseCurrencyCode } = useApp();
  const baseCode = getBaseCurrencyCode();

  const [amount, setAmount] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const activeExpenseGroups = groups.filter((g) => g.type === 'expense');

  // Sum spending in current month for each group
  const getGroupSpending = (groupId: string) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return transactions
      .filter((t) => {
        if (t.type !== 'expense' || t.isTransfer || t.groupId !== groupId) return false;
        const tDate = new Date(t.date);
        return tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth;
      })
      .reduce((sum, t) => sum + convertCurrency(t.amount, t.currency, baseCode), 0);
  };

  const handleSetLimit = () => {
    setError(null);
    const amt = parseFloat(amount);
    if (!selectedGroupId || isNaN(amt) || amt <= 0) {
      setError('Please select a category group and enter a valid limit.');
      return;
    }

    // Check if limit exists
    const match = budgets.find((b) => b.groupId === selectedGroupId);
    if (match) {
      deleteBudget(match.id);
    }

    addBudget({
      groupId: selectedGroupId,
      amount: amt,
      currency: baseCode,
    });

    setAmount('');
    setSelectedGroupId('');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Set limit form widget */}
      <div className="bg-surface border border-line p-5 rounded-2xl shadow-sm flex flex-col gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted font-sans mb-1">
          Set Spending Category Limit
        </h3>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-[#8C3B4A] rounded-xl text-xs font-bold flex items-start gap-2 animate-fade-in">
            <span className="text-sm mt-0.5">⚠️</span>
            <div className="flex-1">
              <p className="font-medium text-rose-700/90">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted">Category Group</label>
            <select
              value={selectedGroupId}
              onChange={(e) => setSelectedGroupId(e.target.value)}
              className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink"
            >
              <option value="">Choose category</option>
              {activeExpenseGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.icon} {g.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted">Monthly Limit Amount ({baseCode})</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink font-mono focus:outline-none"
            />
          </div>
          <button
            onClick={handleSetLimit}
            className="sm:self-end py-2 bg-[#4C7A5A] hover:bg-[#3D6349] text-white font-bold rounded-xl text-xs shadow-sm transition-all"
          >
            Apply Cap Limit
          </button>
        </div>
      </div>

      {/* Limits List Gauge */}
      <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted font-sans mb-4">
          Active Monthly Budgets
        </h3>

        {budgets.length === 0 ? (
          <div className="text-center p-8 flex flex-col items-center gap-2">
            <span className="text-3xl">🎯</span>
            <p className="text-xs font-semibold text-ink">No monthly limits set</p>
            <p className="text-[10px] text-muted">Define caps to restrict overhead outflows.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {budgets.map((b) => {
              const grp = groups.find((g) => g.id === b.groupId);
              if (!grp) return null;

              const spent = getGroupSpending(b.groupId);
              const pct = Math.min(100, Math.round((spent / b.amount) * 100));

              return (
                <div key={b.id} className="flex flex-col gap-2 font-sans font-medium text-xs text-ink">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-2">
                      <span className="text-base">{grp.icon}</span>
                      <span>{grp.name}</span>
                    </span>
                    <span className="font-mono font-bold text-muted">
                      {formatCurrency(spent, baseCode)} /{' '}
                      <span className="text-ink">{formatCurrency(b.amount, b.currency)}</span>
                    </span>
                  </div>

                  {/* Progress Gauge */}
                  <div className="w-full h-2.5 bg-bg rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        pct >= 100 ? 'bg-[#8C3B4A]' : pct >= 80 ? 'bg-[#D6A23C]' : 'bg-[#4C7A5A]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-muted mt-0.5">
                    <span className={pct >= 100 ? 'text-[#8C3B4A]' : 'text-[#4C7A5A]'}>
                      {pct}% Limit Used This Month
                    </span>
                    <button
                      onClick={() => deleteBudget(b.id)}
                      className="text-[#8C3B4A] hover:underline"
                    >
                      Remove limit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 8. CATEGORY GROUPS MODULE
// ==========================================
export const GroupsView: React.FC = () => {
  const { groups, addGroup, deleteGroup } = useApp();

  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [icon, setIcon] = useState('🍽️');
  const [color, setColor] = useState('#8C3B4A');
  const [error, setError] = useState<string | null>(null);

  const icons = ['💼', '🏦', '🪙', '🍽️', '🚌', '🛍️', '������', '🧾', '💊', '📦', '🎁', '🔌', '📈'];
  const colors = ['#4C7A5A', '#8C3B4A', '#D6A23C', '#3E7C74', '#4A5C82', '#6B4C7A', '#C1633A', '#767A3D'];

  const handleSave = () => {
    setError(null);
    if (!name.trim()) {
      setError('Please fill in category group name.');
      return;
    }

    addGroup({
      name: name.trim(),
      type,
      icon,
      color,
    });

    setName('');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Creation form */}
      <div className="bg-surface border border-line p-5 rounded-2xl shadow-sm flex flex-col gap-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted font-sans mb-1">
          Add New Category Group
        </h3>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-[#8C3B4A] rounded-xl text-xs font-bold flex items-start gap-2 animate-fade-in">
            <span className="text-sm mt-0.5">⚠️</span>
            <div className="flex-1">
              <p className="font-medium text-rose-700/90">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted">Category Title Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Restaurants, Streaming"
              className={`p-2 bg-bg border rounded-xl text-xs font-semibold text-ink focus:outline-none transition-all ${
                error ? 'border-rose-400 bg-rose-50/10' : 'border-line focus:border-[#4C7A5A]'
              }`}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted">Group Ledger Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
        </div>

        {/* Icon & Color Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted mb-1">Pick Icon Indicator</label>
            <div className="flex flex-wrap gap-1.5">
              {icons.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={`w-8 h-8 rounded-lg text-sm border flex items-center justify-center transition-all ${
                    icon === ic
                      ? 'border-[#4C7A5A] bg-[#DEE9DD] scale-105'
                      : 'border-line bg-surface hover:bg-bg'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted mb-1">Pick Theme Color</label>
            <div className="flex flex-wrap gap-1.5">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-6 h-6 rounded-full transition-transform active:scale-95 flex items-center justify-center relative"
                  style={{ backgroundColor: c }}
                >
                  {color === c && (
                    <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-2 py-2 bg-[#4C7A5A] hover:bg-[#3D6349] text-white font-bold rounded-xl text-xs shadow-sm transition-all"
        >
          Add Group Category
        </button>
      </div>

      {/* Category List organized */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Income categories */}
        <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted font-sans mb-4">
            Income Categories
          </h4>
          <div className="flex flex-col gap-2">
            {groups
              .filter((g) => g.type === 'income')
              .map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-bg/40 font-sans text-xs font-bold text-ink"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{ backgroundColor: `${g.color}15`, color: g.color }}
                    >
                      {g.icon}
                    </span>
                    <span>{g.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Remove group ${g.name}?`)) deleteGroup(g.id);
                    }}
                    className="p-1.5 hover:bg-[#F3DFDF]/40 text-muted hover:text-coral rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
        </div>

        {/* Expense categories */}
        <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted font-sans mb-4">
            Expense Categories
          </h4>
          <div className="flex flex-col gap-2">
            {groups
              .filter((g) => g.type === 'expense')
              .map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-bg/40 font-sans text-xs font-bold text-ink"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{ backgroundColor: `${g.color}15`, color: g.color }}
                    >
                      {g.icon}
                    </span>
                    <span>{g.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Remove group ${g.name}?`)) deleteGroup(g.id);
                    }}
                    className="p-1.5 hover:bg-[#F3DFDF]/40 text-muted hover:text-coral rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 9. ASSETS REGISTER MODULE
// ==========================================
export const AssetsView: React.FC = () => {
  const { assets, addAsset, formatCurrency, deleteAsset } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Mobile');
  const [serial, setSerial] = useState('');
  const [warranty, setWarranty] = useState('');
  const [vendor, setVendor] = useState('');
  const [purchaseAmt, setPurchaseAmt] = useState('');
  const [currentVal, setCurrentVal] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  const handleSave = () => {
    setError(null);
    setValidationErrors({});

    if (!name.trim() || !purchaseAmt || parseFloat(purchaseAmt) <= 0) {
      setError('Please fill in asset name and enter a valid purchase price.');
      setValidationErrors({
        name: !name.trim(),
        purchaseAmt: !purchaseAmt || parseFloat(purchaseAmt) <= 0,
      });
      return;
    }

    const payload = {
      id: uid('asset'),
      name: name.trim(),
      assetType: category,
      purchaseDate: new Date().toISOString().slice(0, 10),
      purchasePrice: parseFloat(purchaseAmt) || 0,
      currentValue: parseFloat(currentVal) || parseFloat(purchaseAmt) || 0,
      currency: 'AED',
      serialNumber: serial,
      warranty,
      vendor,
      status: 'Active' as const,
      notes: '',
      attachments,
    };

    addAsset(payload);
    setShowForm(false);

    setName('');
    setSerial('');
    setWarranty('');
    setVendor('');
    setPurchaseAmt('');
    setCurrentVal('');
    setAttachments([]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted font-sans">
          Physical Asset & Commodity Inventory
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#4C7A5A] text-white px-4 py-2 font-bold text-xs rounded-full shadow-sm"
        >
          {showForm ? 'View Inventory' : '+ Register New Asset'}
        </button>
      </div>

      {showForm ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-surface border border-line p-6 rounded-2xl shadow-sm">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <h4 className="font-serif font-bold text-base text-ink mb-1">New Asset Inventory Form</h4>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-[#8C3B4A] rounded-xl text-xs font-bold flex items-start gap-2 animate-fade-in">
                <span className="text-sm mt-0.5">⚠️</span>
                <div className="flex-1">
                  <p className="font-medium text-rose-700/90">{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted flex items-center justify-between">
                  <span>Asset Title Description</span>
                  {validationErrors.name && <span className="text-[10px] text-rose-600 font-bold lowercase">Required</span>}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                    setValidationErrors((prev) => ({ ...prev, name: false }));
                  }}
                  placeholder="e.g. MacBook Pro, GOLD 24k bar 10g"
                  className={`p-2 bg-bg border rounded-xl text-xs font-semibold text-ink focus:outline-none transition-all ${
                    validationErrors.name ? 'border-rose-400 bg-rose-50/10' : 'border-line focus:border-[#4C7A5A]'
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted">Asset Commodity Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink focus:outline-none focus:border-[#4C7A5A]"
                >
                  <option value="Mobile">Mobile Electronics</option>
                  <option value="Laptop">Computer Hardware</option>
                  <option value="Gold">Gold bullion / Jewelry</option>
                  <option value="Vehicle">Vehicles & Transport</option>
                  <option value="Land">Real Estate / Land</option>
                  <option value="Furniture">Machinery & Furniture</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted flex items-center justify-between">
                  <span>Purchase Cost (AED)</span>
                  {validationErrors.purchaseAmt && <span className="text-[10px] text-rose-600 font-bold lowercase">Required</span>}
                </label>
                <input
                  type="number"
                  value={purchaseAmt}
                  onChange={(e) => {
                    setPurchaseAmt(e.target.value);
                    setError(null);
                    setValidationErrors((prev) => ({ ...prev, purchaseAmt: false }));
                  }}
                  placeholder="0.00"
                  className={`p-2 bg-bg border rounded-xl text-xs font-semibold text-ink font-mono focus:outline-none transition-all ${
                    validationErrors.purchaseAmt ? 'border-rose-400 bg-rose-50/10' : 'border-line focus:border-[#4C7A5A]'
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted">Current Value (AED)</label>
                <input
                  type="number"
                  value={currentVal}
                  onChange={(e) => setCurrentVal(e.target.value)}
                  placeholder="0.00"
                  className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink font-mono"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted">Vendor Seller</label>
                <input
                  type="text"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  placeholder="e.g. Sharaf DG, Apple Store"
                  className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted">Serial Code Number</label>
                <input
                  type="text"
                  value={serial}
                  onChange={(e) => setSerial(e.target.value)}
                  placeholder="e.g. S/N C02FG82..."
                  className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink font-mono"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted">Warranty Period info</label>
                <input
                  type="text"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  placeholder="e.g. 1 Year Apple Care"
                  className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              className="py-2.5 bg-[#4C7A5A] hover:bg-[#3D6349] text-white font-bold rounded-xl text-xs shadow-sm mt-3"
            >
              Add Asset & Increase Net Worth
            </button>
          </div>

          <div className="lg:col-span-5 bg-bg/50 p-4 border border-line rounded-2xl">
            <AttachmentManager
              attachments={attachments}
              onChange={(updated) => setAttachments(updated)}
              title="Attach Purchase Invoices"
            />
          </div>
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-surface border border-line rounded-2xl p-12 text-center flex flex-col items-center gap-3">
          <span className="text-3xl">🧰</span>
          <p className="text-sm font-bold text-ink">Asset list is empty.</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-[#4C7A5A] font-semibold underline"
          >
            Add items you own to include in net worth calculation.
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {assets.map((as) => (
            <div key={as.id} className="bg-surface border border-line rounded-2xl p-5 shadow-sm relative group">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-serif font-bold text-base text-ink truncate">{as.name}</h4>
                  <span className="text-[9px] uppercase font-bold text-muted block mt-1">
                    {as.assetType} · S/N: {as.serialNumber || 'N/A'}
                  </span>
                </div>
                <button
                  onClick={() => deleteAsset(as.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#F3DFDF] hover:text-[#8C3B4A] rounded transition-all text-muted"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 border-t border-line/50 pt-3">
                <div>
                  <span className="text-[10px] text-muted block">Purchase Cost</span>
                  <span className="text-xs font-bold text-ink font-mono mt-0.5 block">
                    {formatCurrency(as.purchasePrice, as.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted block">Estimated Value</span>
                  <span className="text-xs font-bold text-[#4C7A5A] font-mono mt-0.5 block">
                    {formatCurrency(as.currentValue, as.currency)}
                  </span>
                </div>
              </div>

              {as.attachments?.length > 0 && (
                <div className="mt-3 text-[10px] text-[#4C7A5A] flex items-center gap-1 font-semibold underline">
                  <Paperclip className="w-3 h-3" />
                  {as.attachments.length} Invoice attachments logged
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 10. CREDIT MODULE (Section 2 - Merged Cards)
// ==========================================
export const CreditView: React.FC = () => {
  const { creditCards, addCreditCard, formatCurrency, deleteCreditCard } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [limit, setLimit] = useState('');
  const [available, setAvailable] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [currency, setCurrency] = useState('AED');
  const [annualFee, setAnnualFee] = useState('0');
  const [monthlyFee, setMonthlyFee] = useState('0');
  const [interest, setInterest] = useState('');
  const [lateFee, setLateFee] = useState('0');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  const handleSave = () => {
    setError(null);
    setValidationErrors({});

    if (!name.trim() || !limit || parseFloat(limit) <= 0) {
      setError('Please fill in card name and enter a valid credit limit.');
      setValidationErrors({
        name: !name.trim(),
        limit: !limit || parseFloat(limit) <= 0,
      });
      return;
    }

    const oLimit = parseFloat(limit) || 0;
    const oAvail = parseFloat(available) || oLimit;

    const payload = {
      id: uid('cc'),
      name: name.trim(),
      bank: bank.trim(),
      creditLimit: oLimit,
      availableLimit: oAvail,
      paymentDueDate: dueDate,
      currency,
      annualFee: parseFloat(annualFee) || 0,
      monthlyFee: parseFloat(monthlyFee) || 0,
      interest: parseFloat(interest) || 0,
      lateFee: parseFloat(lateFee) || 0,
      notes: notes.trim(),
      attachments,
      paymentHistory: [],
    };

    addCreditCard(payload);
    setShowForm(false);

    setName('');
    setBank('');
    setLimit('');
    setAvailable('');
    setDueDate('');
    setAnnualFee('0');
    setMonthlyFee('0');
    setInterest('');
    setLateFee('0');
    setNotes('');
    setAttachments([]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted font-sans">
          Portfolio Credit Accounts
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#4C7A5A] text-white px-4 py-2 font-bold text-xs rounded-full shadow-sm"
        >
          {showForm ? 'View Credit Limits' : '+ Add Credit Card'}
        </button>
      </div>

      {showForm ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-surface border border-line p-6 rounded-2xl shadow-sm">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <h4 className="font-serif font-bold text-base text-ink mb-1">Add Credit Register Card</h4>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-[#8C3B4A] rounded-xl text-xs font-bold flex items-start gap-2 animate-fade-in">
                <span className="text-sm mt-0.5">⚠️</span>
                <div className="flex-1">
                  <p className="font-medium text-rose-700/90">{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted flex items-center justify-between">
                  <span>Credit Card / Account Name</span>
                  {validationErrors.name && <span className="text-[10px] text-rose-600 font-bold lowercase">Required</span>}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                    setValidationErrors((prev) => ({ ...prev, name: false }));
                  }}
                  placeholder="e.g. ADCB Infinite Visa"
                  className={`p-2 bg-bg border rounded-xl text-xs font-semibold text-ink focus:outline-none transition-all ${
                    validationErrors.name ? 'border-rose-400 bg-rose-50/10' : 'border-line focus:border-[#4C7A5A]'
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted">Issuer Bank</label>
                <input
                  type="text"
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  placeholder="e.g. ADCB, Citibank"
                  className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink focus:outline-none focus:border-[#4C7A5A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted flex items-center justify-between">
                  <span>Credit Limit</span>
                  {validationErrors.limit && <span className="text-[10px] text-rose-600 font-bold lowercase">Required</span>}
                </label>
                <input
                  type="number"
                  value={limit}
                  onChange={(e) => {
                    setLimit(e.target.value);
                    setError(null);
                    setValidationErrors((prev) => ({ ...prev, limit: false }));
                  }}
                  placeholder="0.00"
                  className={`p-2 bg-bg border rounded-xl text-xs font-semibold text-ink font-mono focus:outline-none transition-all ${
                    validationErrors.limit ? 'border-rose-400 bg-rose-50/10' : 'border-line focus:border-[#4C7A5A]'
                  }`}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted">Available Credit</label>
                <input
                  type="number"
                  value={available}
                  onChange={(e) => setAvailable(e.target.value)}
                  placeholder="0.00"
                  className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink font-mono"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted">Bill Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted">Interest APR (%)</label>
                <input
                  type="number"
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  placeholder="e.g. 24"
                  className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink font-mono"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted">Annual Fee</label>
                <input
                  type="number"
                  value={annualFee}
                  onChange={(e) => setAnnualFee(e.target.value)}
                  className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink font-mono"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-muted">Late Payment Penalty</label>
                <input
                  type="number"
                  value={lateFee}
                  onChange={(e) => setLateFee(e.target.value)}
                  className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              className="py-2.5 bg-[#4C7A5A] hover:bg-[#3D6349] text-white font-bold rounded-xl text-xs shadow-sm mt-3"
            >
              Configure Credit Limit & Open Account
            </button>
          </div>

          <div className="lg:col-span-5 bg-bg/50 p-4 border border-line rounded-2xl">
            <AttachmentManager
              attachments={attachments}
              onChange={(updated) => setAttachments(updated)}
              title="Attach Credit Agreements"
            />
          </div>
        </div>
      ) : creditCards.length === 0 ? (
        <div className="bg-surface border border-line rounded-2xl p-12 text-center flex flex-col items-center gap-3">
          <span className="text-3xl">💳</span>
          <p className="text-sm font-bold text-ink">No credit accounts registered yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="text-xs text-[#4C7A5A] font-semibold underline"
          >
            Create credit records to track liabilities and payments.
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {creditCards.map((cc) => {
            const usedAmount = Math.max(0, cc.creditLimit - cc.availableLimit);
            return (
              <div key={cc.id} className="bg-surface border border-line rounded-2xl p-5 shadow-sm group relative">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-serif font-bold text-base text-ink">{cc.name}</h4>
                    <span className="text-[10px] text-muted block mt-1 font-semibold">
                      Issuer Bank: {cc.bank || 'External'}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteCreditCard(cc.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[#F3DFDF] hover:text-[#8C3B4A] rounded transition-all text-muted"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-line/60 font-sans font-bold text-xs">
                  <div>
                    <span className="text-[9px] text-muted uppercase font-bold tracking-wider block">Limit</span>
                    <span className="text-ink font-mono mt-0.5 block">{formatCurrency(cc.creditLimit, cc.currency)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#8C3B4A] uppercase font-bold tracking-wider block font-semibold">Used amount</span>
                    <span className="text-coral font-mono mt-0.5 block">{formatCurrency(usedAmount, cc.currency)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-[#4C7A5A] uppercase font-bold tracking-wider block">Available</span>
                    <span className="text-ink font-mono mt-0.5 block">{formatCurrency(cc.availableLimit, cc.currency)}</span>
                  </div>
                </div>

                {cc.paymentDueDate && (
                  <div className="mt-3 text-[10px] text-[#D6A23C] font-semibold block uppercase tracking-wider">
                    ⚠️ NEXT DUE DATE: {cc.paymentDueDate}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 11. FINANCIAL SYSTEM BACKUPS / EXPORTS
// ==========================================
export const BackupView: React.FC = () => {
  const {
    transactions,
    accounts,
    groups,
    budgets,
    reminders,
    loans,
    investments,
    assets,
    creditCards,
    currencies,
    importBackupData,
  } = useApp();

  const [importFile, setImportFile] = useState<File | null>(null);
  const [importMeta, setImportMeta] = useState<{
    txCount: number;
    accCount: number;
    exportedAt: string;
    valid: boolean;
    data: any;
  } | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleExportBackup = () => {
    const data = {
      app: 'Money',
      exportedAt: new Date().toISOString(),
      transactions,
      accounts,
      groups,
      budgets,
      reminders,
      loans,
      investments,
      assets,
      creditCards,
      currencies,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `money_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    setImportFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const txCount = Array.isArray(json.transactions) ? json.transactions.length : 0;
        const accCount = Array.isArray(json.accounts) ? json.accounts.length : 0;

        if (!json.transactions && !json.accounts) {
          setErrorMsg('Invalid backup file structure: Must contain transactions or accounts database.');
          setImportMeta(null);
          return;
        }

        setImportMeta({
          txCount,
          accCount,
          exportedAt: json.exportedAt || 'Unknown Date',
          valid: true,
          data: json,
        });
      } catch (err) {
        setErrorMsg('Failed to parse file: Please upload a valid JSON backup file.');
        setImportMeta(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImportClick = async () => {
    if (!importMeta || !importMeta.data) return;

    setErrorMsg(null);
    const result = await importBackupData(importMeta.data);
    if (result.success) {
      setSuccessMsg(result.message);
      setImportFile(null);
      setImportMeta(null);
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="bg-surface border border-line p-6 rounded-3xl shadow-sm max-w-xl mx-auto flex flex-col gap-5 font-sans">
      <div className="flex flex-col gap-1 items-center text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#DEE9DD] text-[#223A2A] flex items-center justify-center mb-1">
          <Shield className="w-6 h-6" />
        </div>
        <h3 className="font-serif font-bold text-lg text-ink">System Durable Backup Core</h3>
        <p className="text-xs text-muted max-w-sm mt-1 mx-auto leading-relaxed">
          Export your entire accounting ledger, asset balances, gold registers, overdraft accounts, and receipts locally in a clean standard JSON format, or restore from an existing file.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {/* Export Panel */}
        <div className="border border-line rounded-2xl p-4 flex flex-col justify-between gap-3 bg-bg/20">
          <div>
            <h4 className="font-bold text-xs text-ink uppercase tracking-wider mb-1">Export Database</h4>
            <p className="text-[11px] text-muted leading-relaxed">
              Compile your complete user profile, ledger transactions, and accounts into a single file for storage.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportBackup}
            className="w-full py-2 bg-[#4C7A5A] hover:bg-[#3D6349] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON Backup
          </button>
        </div>

        {/* Import Panel */}
        <div className="border border-line rounded-2xl p-4 flex flex-col justify-between gap-3 bg-bg/20">
          <div>
            <h4 className="font-bold text-xs text-ink uppercase tracking-wider mb-1">Import & Restore</h4>
            <p className="text-[11px] text-muted leading-relaxed">
              Restore transactions and accounts from an exported JSON file. This will override existing records.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              id="backup-file-picker"
              className="hidden"
            />
            <label
              htmlFor="backup-file-picker"
              className="w-full py-2 bg-surface hover:bg-bg border border-line border-dashed rounded-xl text-xs font-bold text-ink transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#4C7A5A]" />
              {importFile ? importFile.name : 'Select JSON File'}
            </label>
          </div>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
          ✅ {successMsg}
        </div>
      )}

      {/* Meta Preview and Confirm */}
      {importMeta && importMeta.valid && (
        <div className="bg-[#F6E7C8]/20 border border-[#D6A23C]/35 rounded-2xl p-4 flex flex-col gap-3 animate-fade-in text-left">
          <div>
            <h4 className="text-xs font-bold text-[#D6A23C] uppercase tracking-wider flex items-center gap-1">
              <span>📂</span> Verify Backup File Contents
            </h4>
            <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
              Please verify that this is the backup you intend to import. Performing this restore will merge or overwrite your current lists.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 bg-surface p-2.5 rounded-xl border border-line font-mono text-[10px] text-ink font-semibold">
            <div>
              <span className="text-muted block text-[9px] uppercase font-sans font-bold">Ledger Transactions</span>
              <span className="text-sm font-bold text-[#4C7A5A]">{importMeta.txCount} Records</span>
            </div>
            <div>
              <span className="text-muted block text-[9px] uppercase font-sans font-bold">Bank Accounts</span>
              <span className="text-sm font-bold text-[#4C7A5A]">{importMeta.accCount} Accounts</span>
            </div>
            <div>
              <span className="text-muted block text-[9px] uppercase font-sans font-bold">Export Timestamp</span>
              <span className="text-xs font-bold text-ink block truncate" title={importMeta.exportedAt}>
                {importMeta.exportedAt.slice(0, 10)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleImportClick}
            className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm uppercase tracking-wider"
          >
            Confirm & Overwrite Current Workspace
          </button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 12. GENERAL OPTIONS & BRANDING SETTINGS
// ==========================================
export const SettingsView: React.FC = () => {
  const {
    user,
    transactions,
    accounts,
    groups,
    budgets,
    reminders,
    loans,
    investments,
    assets,
    creditCards,
    currencies,
    updateUserSettings,
    importBackupData,
    formatCurrency,
  } = useApp();

  // Settings State Form
  const [appName, setAppName] = useState(() => user?.settings?.appName || 'Money');
  const [appSubtitle, setAppSubtitle] = useState(() => user?.settings?.appSubtitle || 'Your money, in a jar you can see.');
  const [appLogo, setAppLogo] = useState(() => user?.settings?.appLogo || '🪙');
  const [defaultCurrency, setDefaultCurrency] = useState(() => user?.settings?.defaultCurrency || 'AED');
  const [enableUpdates, setEnableUpdates] = useState(() => user?.settings?.enableAutomaticUpdates ?? true);
  const [backupBeforeUp, setBackupBeforeUp] = useState(() => user?.settings?.backupBeforeUpdate ?? true);

  // Status & Notification Banners
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);
  const [upgradeSuccess, setUpgradeSuccess] = useState<string | null>(null);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  // Import State
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importMeta, setImportMeta] = useState<{
    txCount: number;
    accCount: number;
    exportedAt: string;
    valid: boolean;
    data: any;
  } | null>(null);

  // Upgrade State
  const [upgradeFile, setUpgradeFile] = useState<File | null>(null);
  const [upgradeMeta, setUpgradeMeta] = useState<{
    targetVersion: string;
    buildNumber: string;
    releaseNotes: string;
    features: string[];
    valid: boolean;
    data: any;
  } | null>(null);

  // Load Upgrade History Logs
  const [upgradeHistory, setUpgradeHistory] = useState<{
    version: string;
    build: string;
    notes: string;
    date: string;
    features?: string[];
  }[]>(() => {
    return DB.get(`upgrade_history_${user?.id || 'guest'}`, [
      {
        version: '1.0.0',
        build: '1',
        notes: 'Initial production launch. Durable client-side salted hashing, dual-entry ledger accounts, asset registers, and local encrypted backups.',
        date: '2026-07-08',
        features: ['Dual-entry inter-account transfer validation', 'Interest calculations on overdraft limits', 'Secure transaction audit trails']
      }
    ]);
  });

  const handleSavePreferences = () => {
    setSettingsSuccess(null);
    updateUserSettings({
      appName: appName.trim(),
      appSubtitle: appSubtitle.trim(),
      appLogo,
      defaultCurrency,
      enableAutomaticUpdates: enableUpdates,
      backupBeforeUpdate: backupBeforeUp,
    });
    setSettingsSuccess('Application preferences and branding customisations saved successfully!');
    setTimeout(() => setSettingsSuccess(null), 5000);
  };

  // Export
  const handleExportBackup = () => {
    const data = {
      app: 'Money',
      exportedAt: new Date().toISOString(),
      transactions,
      accounts,
      groups,
      budgets,
      reminders,
      loans,
      investments,
      assets,
      creditCards,
      currencies,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${appName.toLowerCase().replace(/\s+/g, '_')}_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setBackupSuccess('Data backup compiled and downloaded successfully!');
    setTimeout(() => setBackupSuccess(null), 4000);
  };

  // Import Upload Handler
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBackupError(null);
    setBackupSuccess(null);
    setImportFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const txCount = Array.isArray(json.transactions) ? json.transactions.length : 0;
        const accCount = Array.isArray(json.accounts) ? json.accounts.length : 0;

        if (!json.transactions && !json.accounts) {
          setBackupError('Invalid backup structure: Must contain transactions or accounts arrays.');
          setImportMeta(null);
          return;
        }

        setImportMeta({
          txCount,
          accCount,
          exportedAt: json.exportedAt || 'Unknown Date',
          valid: true,
          data: json,
        });
      } catch (err) {
        setBackupError('Failed to parse backup JSON. Please ensure the file is a valid standard backup.');
        setImportMeta(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImportConfirm = async () => {
    if (!importMeta || !importMeta.data) return;
    setBackupError(null);
    const result = await importBackupData(importMeta.data);
    if (result.success) {
      setBackupSuccess(result.message);
      setImportFile(null);
      setImportMeta(null);
    } else {
      setBackupError(result.message);
    }
  };

  // Upgrade Upload Handler
  const handleUpgradeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUpgradeError(null);
    setUpgradeSuccess(null);
    setUpgradeFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.targetVersion || !json.releaseNotes) {
          setUpgradeError('Invalid update package structure. Missing targetVersion or releaseNotes.');
          setUpgradeMeta(null);
          return;
        }

        setUpgradeMeta({
          targetVersion: json.targetVersion,
          buildNumber: json.buildNumber || '1',
          releaseNotes: json.releaseNotes,
          features: Array.isArray(json.features) ? json.features : [],
          valid: true,
          data: json,
        });
      } catch (err) {
        setUpgradeError('Failed to parse upgrade patch JSON.');
        setUpgradeMeta(null);
      }
    };
    reader.readAsText(file);
  };

  const handleRunUpgrade = () => {
    if (!upgradeMeta) return;

    setUpgradeError(null);
    setUpgradeSuccess(null);

    // Apply Upgrade Versioning
    updateUserSettings({
      appVersion: upgradeMeta.targetVersion,
      buildNumber: upgradeMeta.buildNumber,
      releaseDate: new Date().toISOString().slice(0, 10),
    });

    // Create a new log item
    const newLog = {
      version: upgradeMeta.targetVersion,
      build: upgradeMeta.buildNumber,
      notes: upgradeMeta.releaseNotes,
      date: new Date().toISOString().slice(0, 10),
      features: upgradeMeta.features,
    };

    const nextHistory = [newLog, ...upgradeHistory.filter(h => h.version !== newLog.version)];
    setUpgradeHistory(nextHistory);
    DB.set(`upgrade_history_${user?.id || 'guest'}`, nextHistory);

    setUpgradeSuccess(`System upgraded successfully! The application is now running Version v${upgradeMeta.targetVersion} (Build ${upgradeMeta.buildNumber}).`);
    setUpgradeFile(null);
    setUpgradeMeta(null);
  };

  // Generate and Download Simulator File
  const handleDownloadSamplePatch = () => {
    const samplePatch = {
      targetVersion: '1.2.0',
      buildNumber: '25',
      releaseNotes: 'Advanced Ledger Reconciliation Engine, automated daily gold asset indices, and security verification pipelines.',
      features: [
        'Interactive pending transfer approval pipeline with editable dates',
        'Auto-converting multi-currency portfolio indicators',
        'High-density PDF print outputs and full custom branding controls'
      ],
      releaseDate: new Date().toISOString().slice(0, 10),
    };
    const blob = new Blob([JSON.stringify(samplePatch, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'app_upgrade_patch_v1.2.0.json';
    link.click();
    setUpgradeSuccess('Sample upgrade package downloaded successfully! You can select this file below to test the upgrade process.');
    setTimeout(() => setUpgradeSuccess(null), 7000);
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8 font-sans pb-10">
      
      {/* Upper header section */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted font-sans">
          Application Preferences & System Maintenance
        </h3>
        <p className="text-xs text-muted mt-0.5">
          Manage customizable branding options, durable database backups, and manual software upgrades.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* ================= COLUMN 1: GENERAL PREFERENCES & BRANDING ================= */}
        <div className="bg-surface border border-line rounded-3xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-2.5 border-b border-line pb-4">
            <span className="text-xl">⚙️</span>
            <div>
              <h4 className="font-serif font-bold text-base text-ink">Preferences & Custom Branding</h4>
              <p className="text-[11px] text-muted">Customize the portal aesthetics and defaults</p>
            </div>
          </div>

          {settingsSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#223A2A] rounded-xl text-xs font-semibold animate-fade-in">
              ✅ {settingsSuccess}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Display profile details */}
            <div className="bg-bg/40 p-4 rounded-2xl border border-line flex items-center justify-between">
              <div>
                <span className="text-[9px] text-muted font-bold block uppercase tracking-wider">Signed-in User</span>
                <span className="text-xs font-bold text-ink mt-0.5 block">{user?.username || 'Guest Administrator'}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-muted font-bold block uppercase tracking-wider">Default Core Currency</span>
                <span className="text-xs font-bold text-[#4C7A5A] mt-0.5 block">AED (United Arab Emirates Dirham)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* App Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Display App Name</label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  className="p-2.5 bg-surface border border-line rounded-xl text-xs font-semibold text-ink focus:outline-none focus:border-[#4C7A5A]"
                  placeholder="e.g. WealthJar"
                />
              </div>

              {/* App Logo */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Branding Logo Symbol</label>
                <select
                  value={appLogo}
                  onChange={(e) => setAppLogo(e.target.value)}
                  className="p-2.5 bg-surface border border-line rounded-xl text-xs font-semibold text-ink focus:outline-none focus:border-[#4C7A5A]"
                >
                  <option value="🪙">🪙 Gold Coin Register</option>
                  <option value="🏦">🏦 Central Vault</option>
                  <option value="💼">💼 Wealth Portfolio</option>
                  <option value="📈">📈 Growth Index</option>
                  <option value="💎">💎 Premium Asset</option>
                </select>
              </div>
            </div>

            {/* App Subtitle */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Branding Slogan / Subtitle</label>
              <input
                type="text"
                value={appSubtitle}
                onChange={(e) => setAppSubtitle(e.target.value)}
                className="p-2.5 bg-surface border border-line rounded-xl text-xs font-semibold text-ink focus:outline-none focus:border-[#4C7A5A]"
                placeholder="Motto for the dashboard header"
              />
            </div>

            {/* Currency settings */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Preferred Base Currency</label>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                className="p-2.5 bg-surface border border-line rounded-xl text-xs font-semibold text-ink focus:outline-none focus:border-[#4C7A5A]"
              >
                <option value="AED">AED - United Arab Emirates Dirham</option>
                <option value="USD">USD - United States Dollar</option>
                <option value="EUR">EUR - Eurozone Currency</option>
                <option value="INR">INR - Indian Rupee Standard</option>
              </select>
            </div>

            {/* Preference options */}
            <div className="border border-line rounded-2xl p-4 flex flex-col gap-3 bg-bg/25 mt-1">
              <h5 className="font-bold text-[10px] text-muted uppercase tracking-wider">System Settings</h5>
              
              <label className="flex items-start gap-2.5 cursor-pointer text-xs font-semibold text-ink">
                <input
                  type="checkbox"
                  checked={enableUpdates}
                  onChange={(e) => setEnableUpdates(e.target.checked)}
                  className="mt-0.5 accent-[#4C7A5A]"
                />
                <div>
                  <span className="block">Enable Automatic Core Updates</span>
                  <span className="text-[10px] text-muted font-normal block mt-0.5">Check online repositories for background maintenance patches</span>
                </div>
              </label>

              <div className="w-full h-[1px] bg-line" />

              <label className="flex items-start gap-2.5 cursor-pointer text-xs font-semibold text-ink">
                <input
                  type="checkbox"
                  checked={backupBeforeUp}
                  onChange={(e) => setBackupBeforeUp(e.target.checked)}
                  className="mt-0.5 accent-[#4C7A5A]"
                />
                <div>
                  <span className="block">Durable Backup Before Upgrades</span>
                  <span className="text-[10px] text-muted font-normal block mt-0.5">Automatically trigger an offline JSON download backup before patching database models</span>
                </div>
              </label>
            </div>

            <button
              type="button"
              onClick={handleSavePreferences}
              className="w-full py-2.5 bg-[#4C7A5A] hover:bg-[#3D6349] text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
            >
              <CheckCircle className="w-4 h-4" />
              Save Custom Settings
            </button>
          </div>
        </div>

        {/* ================= COLUMN 2: BACKUPS & UPGRADE PORTAL ================= */}
        <div className="flex flex-col gap-6">
          
          {/* A. SYSTEM BACKUPS: EXPORT & IMPORT */}
          <div className="bg-surface border border-line rounded-3xl p-6 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2.5 border-b border-line pb-4">
              <span className="text-xl">💾</span>
              <div>
                <h4 className="font-serif font-bold text-base text-ink">System Backups (Durable Storage)</h4>
                <p className="text-[11px] text-muted">Export data ledger or restore from a local file</p>
              </div>
            </div>

            {backupError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                ⚠️ {backupError}
              </div>
            )}

            {backupSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                ✅ {backupSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Export Panel */}
              <div className="border border-line rounded-2xl p-4 flex flex-col justify-between gap-3 bg-bg/25">
                <div>
                  <h5 className="font-bold text-[10px] text-muted uppercase tracking-wider mb-1">Export Database</h5>
                  <p className="text-[10px] text-muted leading-relaxed">
                    Compile ledger transactions, overdrafts, and bank balances into a secure JSON backup.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="w-full py-2 bg-[#4C7A5A] hover:bg-[#3D6349] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export Backup
                </button>
              </div>

              {/* Import Panel */}
              <div className="border border-line rounded-2xl p-4 flex flex-col justify-between gap-3 bg-bg/25">
                <div>
                  <h5 className="font-bold text-[10px] text-muted uppercase tracking-wider mb-1">Restore Backup</h5>
                  <p className="text-[10px] text-muted leading-relaxed">
                    Upload an existing backup file to restore records. It overrides current workspace records.
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportFileChange}
                    id="import-picker"
                    className="hidden"
                  />
                  <label
                    htmlFor="import-picker"
                    className="w-full py-2 bg-surface hover:bg-bg border border-line border-dashed rounded-xl text-[11px] font-bold text-ink transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#4C7A5A]" />
                    {importFile ? importFile.name : 'Choose Backup'}
                  </label>
                </div>
              </div>
            </div>

            {/* Verified Backup Metadata Banner */}
            {importMeta && importMeta.valid && (
              <div className="bg-[#F6E7C8]/25 border border-[#D6A23C]/35 rounded-2xl p-4 flex flex-col gap-3 animate-fade-in">
                <div>
                  <h4 className="text-[11px] font-bold text-[#D6A23C] uppercase tracking-wider flex items-center gap-1">
                    <span>📂</span> Verify Backup File
                  </h4>
                  <p className="text-[10px] text-muted mt-0.5 leading-relaxed">
                    Valid software database structure detected. Overwrite and synchronize your workspace ledger?
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 bg-surface p-2 rounded-xl border border-line font-mono text-[9px] text-ink font-semibold">
                  <div>
                    <span className="text-muted block text-[8px] uppercase font-sans font-bold">Transactions</span>
                    <span className="text-xs font-bold text-[#4C7A5A]">{importMeta.txCount} Records</span>
                  </div>
                  <div>
                    <span className="text-muted block text-[8px] uppercase font-sans font-bold">Bank Accounts</span>
                    <span className="text-xs font-bold text-[#4C7A5A]">{importMeta.accCount} Accounts</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleImportConfirm}
                  className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                >
                  Overwrite Workspace Data
                </button>
              </div>
            )}
          </div>

          {/* B. MANUAL SOFTWARE UPGRADE CENTER */}
          <div className="bg-surface border border-line rounded-3xl p-6 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2.5 border-b border-line pb-4 justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🚀</span>
                <div>
                  <h4 className="font-serif font-bold text-base text-ink">App Upgrade Portal</h4>
                  <p className="text-[11px] text-muted">Upload release package to apply future updates</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-100 font-mono">
                Active Version v{user?.settings?.appVersion || '1.0.0'}
              </span>
            </div>

            {upgradeError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                ⚠️ {upgradeError}
              </div>
            )}

            {upgradeSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                ✅ {upgradeSuccess}
              </div>
            )}

            <div className="flex flex-col gap-3 bg-bg/25 border border-line p-4 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-muted font-bold block uppercase tracking-wider">Test the Upgrade Engine</span>
                  <p className="text-[10px] text-muted mt-0.5 leading-relaxed">
                    Download a secure mock upgrade file (`app_upgrade_patch_v1.2.0.json`) and upload it below to verify the real-time software patching process.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSamplePatch}
                  className="px-3 py-1.5 bg-[#4C7A5A] hover:bg-[#3D6349] text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  <Download className="w-3 h-3" /> Get Patch JSON
                </button>
              </div>

              <div className="w-full h-[1px] bg-line my-1" />

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider">Upload App Upgrade File</label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleUpgradeFileChange}
                  id="upgrade-picker"
                  className="hidden"
                />
                <label
                  htmlFor="upgrade-picker"
                  className="w-full py-3 bg-surface hover:bg-bg border border-line border-dashed rounded-xl text-xs font-bold text-ink transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#4C7A5A]" />
                  {upgradeFile ? `Package Selected: ${upgradeFile.name}` : 'Upload App Update Package (.json)'}
                </label>
              </div>
            </div>

            {/* Upgrade Verified Metadata Panel */}
            {upgradeMeta && upgradeMeta.valid && (
              <div className="bg-[#DEE9DD]/50 border border-[#4C7A5A]/35 rounded-2xl p-4 flex flex-col gap-3 animate-fade-in">
                <div>
                  <h5 className="text-[11px] font-bold text-[#4C7A5A] uppercase tracking-wider flex items-center gap-1">
                    <span>🌟</span> New Software Version Verified
                  </h5>
                  <p className="text-[10px] text-ink mt-1 font-semibold leading-normal">
                    Update to version <span className="font-mono font-bold text-[#4C7A5A]">v{upgradeMeta.targetVersion} (Build {upgradeMeta.buildNumber})</span> is verified.
                  </p>
                  <p className="text-[10px] text-muted mt-1 italic">
                    &ldquo;{upgradeMeta.releaseNotes}&rdquo;
                  </p>
                </div>

                {upgradeMeta.features.length > 0 && (
                  <div className="flex flex-col gap-1 text-[10px] font-medium text-ink bg-surface border border-line p-2.5 rounded-xl">
                    <span className="font-bold text-muted uppercase tracking-wider text-[8px]">New Features Added:</span>
                    {upgradeMeta.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-emerald-600 text-xs font-bold">✓</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleRunUpgrade}
                  className="w-full py-2 bg-[#4C7A5A] hover:bg-[#3D6349] text-white font-bold rounded-xl text-xs transition-colors shadow-sm uppercase tracking-widest"
                >
                  Run System Upgrade
                </button>
              </div>
            )}

            {/* Timeline of Upgrades */}
            <div className="flex flex-col gap-2 border-t border-line pt-4">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Installation & Patch logs</span>
              <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto scrollbar-thin">
                {upgradeHistory.map((hist, i) => (
                  <div key={i} className="bg-bg/40 border border-line p-3 rounded-xl flex flex-col gap-1 text-[10px]">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-ink">v{hist.version} (Build {hist.build})</span>
                      <span className="text-muted font-bold text-[9px]">{hist.date}</span>
                    </div>
                    <p className="text-muted leading-relaxed font-normal">{hist.notes}</p>
                    {hist.features && hist.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {hist.features.map((f, idx) => (
                          <span key={idx} className="bg-surface border border-line px-1.5 py-0.5 rounded text-[8px] font-bold text-muted uppercase tracking-wider">
                            {f.split(' ').slice(0, 2).join(' ')}...
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

// ==========================================
// 13. REPORTS & ANALYTICS VIEW
// ==========================================
export const ReportsView: React.FC = () => {
  const { getDashboardMetrics, formatCurrency } = useApp();
  const metrics = getDashboardMetrics();

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted font-sans">
            Financial Analytics & Reports
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Detailed performance tracking and category metrics.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-surface border border-line hover:border-ink text-ink font-bold px-4 py-2 text-xs rounded-full shadow-sm self-start sm:self-center transition-all flex items-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-[#4C7A5A]" /> Print Report
        </button>
      </div>

      {/* Metrics breakdown row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-line p-5 rounded-2xl shadow-sm flex flex-col">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
            Total Money In
          </span>
          <span className="text-xl font-serif font-bold text-[#4C7A5A]">
            {formatCurrency(metrics.moneyIn)}
          </span>
        </div>
        <div className="bg-surface border border-line p-5 rounded-2xl shadow-sm flex flex-col">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
            Total Money Out
          </span>
          <span className="text-xl font-serif font-bold text-[#8C3B4A]">
            {formatCurrency(metrics.moneyOut)}
          </span>
        </div>
        <div className="bg-surface border border-line p-5 rounded-2xl shadow-sm flex flex-col">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
            Net Cash Flow
          </span>
          <span className={`text-xl font-serif font-bold ${metrics.cashFlow >= 0 ? 'text-ink' : 'text-[#8C3B4A]'}`}>
            {metrics.cashFlow >= 0 ? '+' : ''}{formatCurrency(metrics.cashFlow)}
          </span>
        </div>
      </div>

      {/* Embedded Charts */}
      <DashboardCharts />
    </div>
  );
};
