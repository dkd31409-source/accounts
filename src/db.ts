import {
  User,
  Transaction,
  Group,
  Budget,
  Currency,
  Reminder,
  Loan,
  Investment,
  Asset,
  CreditCard,
  AuditLog,
} from './types';

// Helper to generate unique IDs
export function uid(prefix: string = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

// Client-side simple SHA-256 implementation for user authentication
export async function sha256Hex(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const buf = await window.crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function randomSalt(): string {
  const arr = window.crypto.getRandomValues(new Uint8Array(16));
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Durable Synchronous localStorage engine
const STORAGE_PREFIX = 'money_app_';

export const DB = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const val = localStorage.getItem(STORAGE_PREFIX + key);
      return val ? JSON.parse(val) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from storage`, e);
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing ${key} to storage`, e);
    }
  },

  clear(): void {
    try {
      // Clear only our keys to avoid disrupting other apps
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(k);
        }
      });
    } catch (e) {
      console.error('Error clearing storage', e);
    }
  },
};

// Initial data seed generator for new users
export async function seedDefaultsForUser(userId: string): Promise<{
  groups: Group[];
  currencies: Currency[];
  accounts: any[];
  transactions: Transaction[];
  reminders: Reminder[];
  loans: Loan[];
  investments: Investment[];
  assets: Asset[];
  creditCards: CreditCard[];
  budgets: Budget[];
}> {
  // 1. Create Default Groups (Categories)
  const incomeGroups: Omit<Group, 'id' | 'userId'>[] = [
    { name: 'Salary', icon: '💼', color: '#4C7A5A', type: 'income' },
    { name: 'Deposits', icon: '🏦', color: '#3E7C74', type: 'income' },
    { name: 'Loan Received', icon: '🏛️', color: '#D6A23C', type: 'income' },
    { name: 'Other Income', icon: '➕', color: '#767A3D', type: 'income' },
  ];

  const expenseGroups: Omit<Group, 'id' | 'userId'>[] = [
    { name: 'Food', icon: '🍽️', color: '#8C3B4A', type: 'expense' },
    { name: 'Transport', icon: '🚌', color: '#B5732E', type: 'expense' },
    { name: 'Shopping', icon: '🛍️', color: '#A65A72', type: 'expense' },
    { name: 'Housing', icon: '🏠', color: '#4A5C82', type: 'expense' },
    { name: 'Bills', icon: '🧾', color: '#6B4C7A', type: 'expense' },
    { name: 'Other expenses', icon: '📦', color: '#C1633A', type: 'expense' },
  ];

  const seededGroups: Group[] = [];
  incomeGroups.forEach((g) => {
    seededGroups.push({ id: uid('grp'), userId, ...g });
  });
  expenseGroups.forEach((g) => {
    seededGroups.push({ id: uid('grp'), userId, ...g });
  });

  // 2. Currencies (AED, USD, EUR, INR)
  // Default base currency is AED as the user mentioned "AED" in the sample data and overdraft AED examples.
  const seededCurrencies: Currency[] = [
    { id: uid('cur'), userId, code: 'AED', name: 'UAE Dirham', symbol: 'AED ', rate: 1, isDefault: true },
    { id: uid('cur'), userId, code: 'USD', name: 'US Dollar', symbol: '$', rate: 3.67, isDefault: false },
    { id: uid('cur'), userId, code: 'EUR', name: 'Euro', symbol: '€', rate: 4.01, isDefault: false },
    { id: uid('cur'), userId, code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 0.044, isDefault: false },
  ];

  // 3. Accounts (Bank, Cash, Credit Card, Overdraft Bank)
  const defaultAccounts = [
    {
      id: uid('acc'),
      userId,
      name: 'Main Bank Account',
      type: 'bank' as const,
      currency: 'AED',
      allowOverdraft: true,
      overdraftLimit: 20000,
      overdraftInterestRate: 5.5,
      overdraftStartDate: '2026-01-01',
      overdraftDueDate: '2027-01-01',
      openingBalance: 1000,
      createdAt: Date.now(),
    },
    {
      id: uid('acc'),
      userId,
      name: 'Cash In Hand',
      type: 'cash' as const,
      currency: 'AED',
      allowOverdraft: false,
      overdraftLimit: 0,
      openingBalance: 500,
      createdAt: Date.now(),
    },
    {
      id: uid('acc'),
      userId,
      name: 'Visa Credit Card',
      type: 'card' as const,
      currency: 'AED',
      allowOverdraft: false,
      overdraftLimit: 0,
      openingBalance: 0,
      createdAt: Date.now(),
    },
  ];

  // 4. Seeding Credit Cards Details to match the updated Credit card account
  const seededCreditCards: CreditCard[] = [
    {
      id: uid('crd'),
      userId,
      name: 'Visa Credit Card',
      bank: 'Emirates NBD',
      creditLimit: 15000,
      availableLimit: 15000,
      paymentDueDate: '2026-07-25',
      currency: 'AED',
      annualFee: 0,
      monthlyFee: 0,
      interest: 24,
      lateFee: 250,
      notes: 'For regular purchases',
      attachments: [],
      paymentHistory: [],
      createdAt: Date.now(),
    },
  ];

  // 5. Seeding TESTING SAMPLE DATA (Section 9 requirement)
  // Income: AED 3,000
  // Expense: AED 1,042.97
  // Expected result: Money In: AED 3,000, Money Out: AED 1,042.97, Cash Flow: AED 1,957.03
  const salaryGroup = seededGroups.find((g) => g.name === 'Salary');
  const otherExpenseGroup = seededGroups.find((g) => g.name === 'Other expenses');

  const seededTransactions: Transaction[] = [
    {
      id: uid('tx'),
      userId,
      type: 'income',
      amount: 3000,
      currency: 'AED',
      description: 'Monthly Income Sample',
      groupId: salaryGroup?.id || '',
      date: new Date().toISOString().slice(0, 10),
      accountId: defaultAccounts[0].id, // Main Bank
      attachments: [],
      createdAt: Date.now() - 1000 * 60 * 60,
    },
    {
      id: uid('tx'),
      userId,
      type: 'expense',
      amount: 1042.97,
      currency: 'AED',
      description: 'Electricity & Internet Bills',
      groupId: otherExpenseGroup?.id || '',
      date: new Date().toISOString().slice(0, 10),
      accountId: defaultAccounts[0].id, // Main Bank
      attachments: [],
      createdAt: Date.now(),
    },
  ];

  // Seed default items for other lists
  const seededReminders: Reminder[] = [];
  const seededLoans: Loan[] = [];
  const seededInvestments: Investment[] = [];
  const seededAssets: Asset[] = [];
  const seededBudgets: Budget[] = [];

  return {
    groups: seededGroups,
    currencies: seededCurrencies,
    accounts: defaultAccounts,
    transactions: seededTransactions,
    reminders: seededReminders,
    loans: seededLoans,
    investments: seededInvestments,
    assets: seededAssets,
    creditCards: seededCreditCards,
    budgets: seededBudgets,
  };
}
