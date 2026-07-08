import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useApp } from '../AppContext';
import { Account, AccountType } from '../types';

interface AccountModalProps {
  accountId?: string | null;
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ accountId, onClose }) => {
  const { accounts, addAccount, editAccount, currencies } = useApp();
  const isEdit = !!accountId;
  const existingAcc = isEdit ? accounts.find((a) => a.id === accountId) : null;

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [currency, setCurrency] = useState('AED');
  const [openingBalance, setOpeningBalance] = useState('');
  const [allowOverdraft, setAllowOverdraft] = useState(false);
  const [overdraftLimit, setOverdraftLimit] = useState('');
  const [overdraftInterestRate, setOverdraftInterestRate] = useState('');
  const [overdraftStartDate, setOverdraftStartDate] = useState('');
  const [overdraftDueDate, setOverdraftDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (existingAcc) {
      setName(existingAcc.name);
      setType(existingAcc.type);
      setCurrency(existingAcc.currency);
      setOpeningBalance(String(existingAcc.openingBalance));
      setAllowOverdraft(existingAcc.allowOverdraft);
      setOverdraftLimit(existingAcc.overdraftLimit ? String(existingAcc.overdraftLimit) : '');
      setOverdraftInterestRate(existingAcc.overdraftInterestRate ? String(existingAcc.overdraftInterestRate) : '');
      setOverdraftStartDate(existingAcc.overdraftStartDate || '');
      setOverdraftDueDate(existingAcc.overdraftDueDate || '');
    }
  }, [existingAcc]);

  const handleSave = () => {
    setError(null);
    setValidationErrors({});

    if (!name.trim()) {
      setError('Please enter an account name.');
      setValidationErrors({ name: true });
      return;
    }

    const oBalance = parseFloat(openingBalance) || 0;
    const oLimit = parseFloat(overdraftLimit) || 0;
    const oInterest = parseFloat(overdraftInterestRate) || 0;

    const payload = {
      name: name.trim(),
      type,
      currency,
      openingBalance: oBalance,
      allowOverdraft,
      overdraftLimit: allowOverdraft ? oLimit : 0,
      overdraftInterestRate: allowOverdraft ? oInterest : undefined,
      overdraftStartDate: allowOverdraft ? overdraftStartDate : undefined,
      overdraftDueDate: allowOverdraft ? overdraftDueDate : undefined,
    };

    if (isEdit && accountId) {
      editAccount(accountId, payload);
    } else {
      addAccount(payload);
    }

    onClose();
  };

  const accountTypes: { id: AccountType; name: string }[] = [
    { id: 'bank', name: 'Bank Account' },
    { id: 'card', name: 'Credit Card' },
    { id: 'cash', name: 'Cash' },
    { id: 'investment', name: 'Investment Account' },
    { id: 'savings', name: 'Savings Account' },
    { id: 'fixedDeposit', name: 'Fixed Deposit' },
    { id: 'rdDeposit', name: 'RD Deposit' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-surface border border-line rounded-2xl flex flex-col shadow-2xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h3 className="font-serif font-extrabold text-lg text-ink">
            {isEdit ? 'Edit Account Details' : 'Open New Account'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-bg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Callout Banner */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 text-[#8C3B4A] rounded-xl text-xs font-bold flex items-start gap-2.5 shadow-sm animate-fade-in">
            <span className="text-sm mt-0.5">⚠️</span>
            <div className="flex-1">
              <p className="font-bold uppercase tracking-wider text-[10px] text-rose-800 mb-0.5">Account Validation Alert</p>
              <p className="font-medium text-rose-700/90 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {/* Account Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted font-sans uppercase tracking-wider flex items-center justify-between">
              <span>Account Name</span>
              {validationErrors.name && <span className="text-[10px] text-rose-600 font-bold lowercase">Required Field</span>}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
                setValidationErrors((prev) => ({ ...prev, name: false }));
              }}
              placeholder="e.g. ADCB Savings, Emirates NBD Checking"
              className={`w-full p-2.5 bg-bg border rounded-xl text-sm font-semibold text-ink focus:outline-none transition-all ${
                validationErrors.name
                  ? 'border-rose-400 bg-rose-50/10 focus:ring-1 focus:ring-rose-400 focus:border-rose-400 shadow-sm'
                  : 'border-line focus:border-[#4C7A5A]'
              }`}
            />
          </div>

          {/* Account Type & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted font-sans uppercase tracking-wider">
                Account Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AccountType)}
                className="w-full p-2.5 bg-bg border border-line rounded-xl text-sm font-semibold text-ink"
              >
                {accountTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted font-sans uppercase tracking-wider">
                Account Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full p-2.5 bg-bg border border-line rounded-xl text-sm font-semibold text-ink"
              >
                {currencies.map((cur) => (
                  <option key={cur.id} value={cur.code}>
                    {cur.code} — {cur.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Opening Balance */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted font-sans uppercase tracking-wider">
              Opening Balance
            </label>
            <input
              type="number"
              value={openingBalance}
              disabled={isEdit}
              onChange={(e) => setOpeningBalance(e.target.value)}
              placeholder="0.00"
              className="w-full p-2.5 bg-bg border border-line rounded-xl text-sm font-semibold text-ink focus:outline-none focus:border-[#4C7A5A] disabled:opacity-50"
            />
            {!isEdit && (
              <p className="text-[10px] text-muted italic">
                Starting money currently held inside this account.
              </p>
            )}
          </div>

          {/* Overdraft Module setup (Section 3 Requirement) */}
          {(type === 'bank' || type === 'savings') && (
            <div className="border-t border-line pt-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allowOverdraft"
                  checked={allowOverdraft}
                  onChange={(e) => setAllowOverdraft(e.target.checked)}
                  className="w-4 h-4 rounded text-[#4C7A5A] border-line focus:ring-[#4C7A5A]"
                />
                <label htmlFor="allowOverdraft" className="text-xs font-bold text-ink cursor-pointer">
                  Activate Overdraft Safety Protection
                </label>
              </div>

              {allowOverdraft && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#DEE9DD]/20 border border-[#DEE9DD] rounded-2xl">
                  {/* Overdraft limit */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#223A2A] uppercase tracking-wider">
                      Overdraft Limit ({currency})
                    </label>
                    <input
                      type="number"
                      value={overdraftLimit}
                      onChange={(e) => setOverdraftLimit(e.target.value)}
                      placeholder="e.g. 20000"
                      className="w-full p-2 bg-surface border border-[#DEE9DD] rounded-xl text-xs font-bold text-ink"
                    />
                  </div>

                  {/* Overdraft Interest Rate */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#223A2A] uppercase tracking-wider">
                      Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      value={overdraftInterestRate}
                      onChange={(e) => setOverdraftInterestRate(e.target.value)}
                      placeholder="e.g. 5.5"
                      className="w-full p-2 bg-surface border border-[#DEE9DD] rounded-xl text-xs font-bold text-ink"
                    />
                  </div>

                  {/* Start Date */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#223A2A] uppercase tracking-wider">
                      Overdraft Start Date
                    </label>
                    <input
                      type="date"
                      value={overdraftStartDate}
                      onChange={(e) => setOverdraftStartDate(e.target.value)}
                      className="w-full p-2 bg-surface border border-[#DEE9DD] rounded-xl text-xs font-bold text-ink"
                    />
                  </div>

                  {/* Due Date */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#223A2A] uppercase tracking-wider">
                      Overdraft Due Date
                    </label>
                    <input
                      type="date"
                      value={overdraftDueDate}
                      onChange={(e) => setOverdraftDueDate(e.target.value)}
                      className="w-full p-2 bg-surface border border-[#DEE9DD] rounded-xl text-xs font-bold text-ink"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-line bg-bg flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-line rounded-xl text-xs font-bold text-muted hover:bg-surface hover:text-ink transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#4C7A5A] hover:bg-[#3D6349] active:scale-95 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Check className="w-4 h-4" />
            Save Account
          </button>
        </div>
      </div>
    </div>
  );
};
