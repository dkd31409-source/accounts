import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Paperclip,
  Trash2,
  Edit3,
  Search,
  Filter,
  Download,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../AppContext';
import { Transaction } from '../types';

interface TransactionViewsProps {
  type: 'income' | 'expense';
  onEditTx: (id: string) => void;
  onAddTx: () => void;
}

export const TransactionViews: React.FC<TransactionViewsProps> = ({
  type,
  onEditTx,
  onAddTx,
}) => {
  const {
    transactions,
    accounts,
    groups,
    formatCurrency,
    deleteTransaction,
  } = useApp();

  // Local filter states
  const [localSearch, setLocalSearch] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [filterGroup, setFilterGroup] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const targetLabel = type === 'income' ? 'Income Ledger' : 'Expenses Ledger';

  // Filters logic
  const filteredTxs = transactions
    .filter((t) => t.type === type && !t.isTransfer)
    .filter((t) => {
      // 1. Search Query
      if (localSearch.trim()) {
        const query = localSearch.toLowerCase();
        const matchesDesc = t.description.toLowerCase().includes(query);
        const grp = groups.find((g) => g.id === t.groupId);
        const matchesGrp = grp ? grp.name.toLowerCase().includes(query) : false;
        return matchesDesc || matchesGrp;
      }
      return true;
    })
    .filter((t) => {
      // 2. Account Link
      if (filterAccount) return t.accountId === filterAccount;
      return true;
    })
    .filter((t) => {
      // 3. Category Group
      if (filterGroup) return t.groupId === filterGroup;
      return true;
    })
    .filter((t) => {
      // 4. Dates
      if (fromDate && t.date < fromDate) return false;
      if (toDate && t.date > toDate) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Aggregate sums
  const totalInBase = filteredTxs.reduce((sum, t) => sum + t.amount, 0);

  // CSV Export helper
  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Account', 'Amount', 'Currency', 'Category'];
    const rows = filteredTxs.map((t) => {
      const acc = accounts.find((a) => a.id === t.accountId);
      const grp = groups.find((g) => g.id === t.groupId);
      return [
        t.date,
        t.description,
        acc ? acc.name : 'Unknown',
        t.amount,
        t.currency,
        grp ? grp.name : 'N/A',
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${type}_transactions_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // High-fidelity document printing
  const handlePrintLedger = () => {
    window.print();
  };

  const currentGroups = groups.filter((g) => g.type === type);

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted font-sans">
            {targetLabel}
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Total Aggregate: <span className="font-bold text-ink">{formatCurrency(totalInBase)}</span>
          </p>
        </div>
        <button
          onClick={onAddTx}
          className="bg-[#4C7A5A] hover:bg-[#3D6349] text-white px-4 py-2 font-bold text-xs rounded-full shadow-sm self-start sm:self-center transition-all"
        >
          + Post New Transaction
        </button>
      </div>

      {/* Robust filter tray component */}
      <div className="bg-surface border border-line p-4 rounded-2xl shadow-sm flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-ink mb-1">
          <Filter className="w-4 h-4 text-[#4C7A5A]" />
          <span>Ledger Filter Controls</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {/* Quick Search */}
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search details..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full bg-bg border border-line rounded-xl pl-8 pr-3 py-2 text-xs font-semibold text-ink focus:outline-none"
            />
          </div>

          {/* Account selector */}
          <select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink"
          >
            <option value="">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Group selector */}
          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink"
          >
            <option value="">All Categories</option>
            {currentGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.icon} {g.name}
              </option>
            ))}
          </select>

          {/* Date range from */}
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink"
          />

          {/* Date range to */}
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="p-2 bg-bg border border-line rounded-xl text-xs font-semibold text-ink"
          />
        </div>

        {/* Action tray links */}
        <div className="flex items-center justify-end gap-3 mt-2 border-t border-line/60 pt-3 text-xs">
          <button
            onClick={handleExportCSV}
            className="text-muted hover:text-ink font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV Sheet
          </button>
          <span className="text-line">|</span>
          <button
            onClick={handlePrintLedger}
            className="text-muted hover:text-ink font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Ledger
          </button>
        </div>
      </div>

      {/* Transaction Table list */}
      <div className="bg-surface border border-line rounded-2xl overflow-hidden shadow-sm">
        {filteredTxs.length === 0 ? (
          <div className="text-center p-12 flex flex-col items-center gap-2">
            <span className="text-4xl">🧾</span>
            <p className="text-sm font-bold text-ink">No matching logs</p>
            <p className="text-xs text-muted">Try clearing some filtering options to view lists.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-bg border-b border-line text-[10px] uppercase font-bold tracking-wider text-muted font-sans select-none">
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Description</th>
                  <th className="px-5 py-3">Bank Account</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-xs font-medium text-ink font-sans">
                {filteredTxs.map((t) => {
                  const acc = accounts.find((a) => a.id === t.accountId);
                  const grp = groups.find((g) => g.id === t.groupId);

                  return (
                    <tr key={t.id} className="hover:bg-bg/25 group transition-colors">
                      <td className="px-6 py-4 font-semibold text-muted font-mono">{t.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-ink">{t.description}</span>
                          {t.attachments?.length > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-[#4C7A5A] mt-0.5">
                              <Paperclip className="w-3 h-3" />
                              {t.attachments.length} document file(s) attached
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold">{acc ? acc.name : 'Unknown Account'}</td>
                      <td className="px-6 py-4">
                        {grp ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                            style={{ backgroundColor: `${grp.color}15`, color: grp.color }}
                          >
                            <span>{grp.icon}</span>
                            <span>{grp.name}</span>
                          </span>
                        ) : (
                          <span className="text-muted italic">No Group</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`font-bold font-mono text-sm ${
                            type === 'income' ? 'text-[#4C7A5A]' : 'text-[#8C3B4A]'
                          }`}
                        >
                          {type === 'income' ? '+' : '-'}
                          {formatCurrency(t.amount, t.currency)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditTx(t.id)}
                            className="p-1 rounded-lg text-muted hover:text-ink hover:bg-bg"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Permanently delete transaction?')) {
                                deleteTransaction(t.id);
                              }
                            }}
                            className="p-1 rounded-lg text-muted hover:text-coral hover:bg-[#F3DFDF]"
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
        )}
      </div>
    </div>
  );
};
