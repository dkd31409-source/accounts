import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { useApp } from '../AppContext';
import { Transaction, Attachment } from '../types';
import { AttachmentManager } from './AttachmentManager';

interface TransactionModalProps {
  transactionId?: string | null;
  defaultAccountId?: string | null;
  onClose: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  transactionId,
  defaultAccountId,
  onClose,
}) => {
  const {
    transactions,
    accounts,
    groups,
    currencies,
    addTransaction,
    editTransaction,
    formatCurrency,
    getAccountBalance,
    getBaseCurrencyCode,
    convertCurrency,
  } = useApp();

  const isEdit = !!transactionId;
  const existingTx = isEdit ? transactions.find((t) => t.id === transactionId) : null;

  // Form State
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [accountId, setAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('AED');
  const [description, setDescription] = useState('');
  const [groupId, setGroupId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  // Multi-currency auxiliary states
  const [exchangeRate, setExchangeRate] = useState('1');
  const [convertedAmount, setConvertedAmount] = useState('0');

  const baseCode = getBaseCurrencyCode();
  const selectedAccount = accounts.find((a) => a.id === accountId);
  const showMultiCurrency = currency !== baseCode;

  // Initialize form state
  useEffect(() => {
    if (existingTx) {
      setType(existingTx.type);
      setAccountId(existingTx.accountId);
      setAmount(String(existingTx.amount));
      setCurrency(existingTx.currency);
      setDescription(existingTx.description);
      setGroupId(existingTx.groupId || '');
      setDate(existingTx.date);
      setAttachments(existingTx.attachments || []);
      setExchangeRate(String(existingTx.exchangeRateUsed || 1));
      setConvertedAmount(String(existingTx.convertedAmount || existingTx.amount));
    } else if (accounts.length > 0) {
      const initialAccId = defaultAccountId && accounts.some((a) => a.id === defaultAccountId)
        ? defaultAccountId
        : accounts[0].id;
      setAccountId(initialAccId);
      const acc = accounts.find((a) => a.id === initialAccId);
      setCurrency(acc?.currency || 'AED');
    }
  }, [existingTx, accounts, defaultAccountId]);

  // Handle account changes to sync standard currency
  const handleAccountChange = (accId: string) => {
    setAccountId(accId);
    const acc = accounts.find((a) => a.id === accId);
    if (acc) {
      setCurrency(acc.currency);
    }
  };

  // Recalculate exchange conversions
  useEffect(() => {
    const amt = parseFloat(amount) || 0;
    const rate = parseFloat(exchangeRate) || 1;

    if (!showMultiCurrency) {
      setConvertedAmount(String(amt));
    } else {
      setConvertedAmount(String((amt * rate).toFixed(2)));
    }
  }, [amount, exchangeRate, currency]);

  const handleSave = () => {
    setError(null);
    setValidationErrors({});

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setError('Please enter a valid amount greater than 0.');
      setValidationErrors({ amount: true });
      return;
    }
    if (!accountId) {
      setError('Please choose a transaction bank account.');
      setValidationErrors({ accountId: true });
      return;
    }
    if (!groupId && type === 'expense') {
      setError('Please select a category group.');
      setValidationErrors({ groupId: true });
      return;
    }

    // Safety balance checks
    const acc = accounts.find((a) => a.id === accountId);
    if (acc) {
      let currentBal = getAccountBalance(accountId);

      // If we are editing, remove the influence of the old transaction from currentBal first
      if (isEdit && existingTx && existingTx.accountId === accountId) {
        const oldAmt = existingTx.amount;
        const oldConverted = convertCurrency(oldAmt, existingTx.currency, acc.currency);
        if (existingTx.type === 'expense') {
          currentBal += oldConverted;
        } else {
          currentBal -= oldConverted;
        }
      }

      // Convert current transaction amount to the account's currency
      const amtInAccCurrency = convertCurrency(amt, currency, acc.currency);
      const transactionCost = type === 'expense' ? amtInAccCurrency : -amtInAccCurrency;
      const expectedBal = currentBal - transactionCost;
      const oLimit = acc.allowOverdraft ? acc.overdraftLimit : 0;

      if (expectedBal < -oLimit) {
        setError(
          `Insufficient funds! This transaction exceeds the overdraft safety limit of ${formatCurrency(
            oLimit,
            acc.currency
          )} on your account.`
        );
        setValidationErrors({ amount: true });
        return;
      }
    }

    const payload = {
      type,
      amount: amt,
      currency,
      description: description || (type === 'income' ? 'Income Transaction' : 'Expense Transaction'),
      groupId,
      date,
      accountId,
      attachments,
      exchangeRateUsed: parseFloat(exchangeRate) || 1,
      convertedAmount: parseFloat(convertedAmount) || amt,
    };

    if (isEdit && transactionId) {
      editTransaction(transactionId, payload);
    } else {
      addTransaction(payload);
    }

    onClose();
  };

  const activeGroups = groups.filter((g) => g.type === type);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-surface border border-line rounded-2xl flex flex-col shadow-2xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <h3 className="font-serif font-extrabold text-lg text-ink">
            {isEdit ? 'Edit Transaction Record' : 'Record Transaction'}
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
              <p className="font-bold uppercase tracking-wider text-[10px] text-rose-800 mb-0.5">Entry Validation Alert</p>
              <p className="font-medium text-rose-700/90 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {/* Income vs Expense Toggle */}
          <div className="flex bg-bg p-1 rounded-xl">
            <button
              onClick={() => {
                setType('income');
                setError(null);
                setValidationErrors({});
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-[#DEE9DD] text-[#223A2A] shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => {
                setType('expense');
                setError(null);
                setValidationErrors({});
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-[#F3DFDF] text-[#8C3B4A] shadow-sm'
                  : 'text-muted hover:text-ink'
              }`}
            >
              Expense
            </button>
          </div>

          {/* Account Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted font-sans uppercase tracking-wider flex items-center justify-between">
              <span>Selected Account</span>
              {validationErrors.accountId && <span className="text-[10px] text-rose-600 font-bold lowercase">Required Field</span>}
            </label>
            <select
              value={accountId}
              onChange={(e) => {
                handleAccountChange(e.target.value);
                setError(null);
                setValidationErrors((prev) => ({ ...prev, accountId: false }));
              }}
              className={`w-full p-2.5 bg-bg border rounded-xl text-sm font-semibold text-ink focus:outline-none transition-all ${
                validationErrors.accountId
                  ? 'border-rose-400 bg-rose-50/10 focus:ring-1 focus:ring-rose-400 focus:border-rose-400 shadow-sm'
                  : 'border-line focus:border-[#4C7A5A]'
              }`}
            >
              <option value="" disabled>Select Bank Account</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.currency})
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted font-sans uppercase tracking-wider flex items-center justify-between">
                <span>Amount</span>
                {validationErrors.amount && <span className="text-[10px] text-rose-600 font-bold lowercase">Invalid amount</span>}
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(null);
                  setValidationErrors((prev) => ({ ...prev, amount: false }));
                }}
                placeholder="0.00"
                className={`w-full p-2.5 bg-bg border rounded-xl text-sm font-semibold text-ink focus:outline-none transition-all ${
                  validationErrors.amount
                    ? 'border-rose-400 bg-rose-50/10 focus:ring-1 focus:ring-rose-400 focus:border-rose-400 shadow-sm'
                    : 'border-line focus:border-[#4C7A5A]'
                }`}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted font-sans uppercase tracking-wider">
                Currency
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

          {/* Multi-currency controls */}
          {showMultiCurrency && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#DEE9DD]/20 border border-[#DEE9DD] rounded-xl animate-fade-in">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#223A2A] uppercase tracking-wider">
                  Exchange Rate (1 {currency} to {baseCode})
                </label>
                <input
                  type="number"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  className="w-full p-2 bg-surface border border-[#DEE9DD] rounded-lg text-xs font-bold text-ink"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#223A2A] uppercase tracking-wider">
                  Converted ({baseCode})
                </label>
                <input
                  type="text"
                  disabled
                  value={convertedAmount}
                  className="w-full p-2 bg-bg border border-line rounded-lg text-xs font-bold text-muted"
                />
              </div>
            </div>
          )}

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted font-sans uppercase tracking-wider flex items-center justify-between">
                <span>Category</span>
                {validationErrors.groupId && <span className="text-[10px] text-rose-600 font-bold lowercase">Required Field</span>}
              </label>
              <select
                value={groupId}
                onChange={(e) => {
                  setGroupId(e.target.value);
                  setError(null);
                  setValidationErrors((prev) => ({ ...prev, groupId: false }));
                }}
                className={`w-full p-2.5 bg-bg border rounded-xl text-sm font-semibold text-ink focus:outline-none transition-all ${
                  validationErrors.groupId
                    ? 'border-rose-400 bg-rose-50/10 focus:ring-1 focus:ring-rose-400 focus:border-rose-400 shadow-sm'
                    : 'border-line focus:border-[#4C7A5A]'
                }`}
              >
                <option value="">Select Category</option>
                {activeGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.icon} {g.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-muted font-sans uppercase tracking-wider">
                Transaction Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 bg-bg border border-line rounded-xl text-sm font-semibold text-ink focus:outline-none focus:border-[#4C7A5A]"
              />
            </div>
          </div>

          {/* What was it for */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-muted font-sans uppercase tracking-wider">
              Description / Notes
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Weekly grocery shopping"
              className="w-full p-2.5 bg-bg border border-line rounded-xl text-sm font-semibold text-ink focus:outline-none focus:border-[#4C7A5A]"
            />
          </div>

          {/* Document Attachment Integration (Section 1 requirement) */}
          <div className="border-t border-line pt-4">
            <AttachmentManager
              attachments={attachments}
              onChange={(updated) => setAttachments(updated)}
              title="Transaction Receipts & Invoices"
            />
          </div>
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
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
