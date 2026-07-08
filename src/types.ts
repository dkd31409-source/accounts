export interface Attachment {
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  dataUrl: string; // Base64 data URI for durable local persistence and preview/download
}

export type AccountType =
  | 'bank'
  | 'card'
  | 'cash'
  | 'investment'
  | 'loan'
  | 'wallet'
  | 'savings'
  | 'fixedDeposit'
  | 'rdDeposit';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  currency: string;
  allowOverdraft: boolean;
  overdraftLimit: number;
  overdraftInterestRate?: number;
  overdraftStartDate?: string;
  overdraftDueDate?: string;
  openingBalance: number;
  createdAt: number;
}

export interface Group {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
}

export interface Budget {
  id: string;
  userId: string;
  groupId: string;
  amount: number;
  currency: string;
}

export interface Currency {
  id: string;
  userId: string;
  code: string;
  name: string;
  symbol: string;
  rate: number; // units of this currency per 1 default currency unit
  isDefault: boolean;
}

export interface Reminder {
  id: string;
  userId: string;
  title: string;
  reminderType: string;
  nextDueDate: string;
  time?: string;
  repeat: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  frequencyValue: number;
  frequencyUnit: 'days' | 'weeks' | 'months' | 'years';
  status: 'active' | 'completed';
  transactionDetails: {
    type?: 'income' | 'expense';
    amount: number;
    currency: string;
    accountId: string;
    groupId?: string;
    description?: string;
    isTransfer?: boolean;
    fromAccountId?: string;
    toAccountId?: string;
    fromAmount?: number;
    fromCurrency?: string;
    toAmount?: number;
    toCurrency?: string;
    transferFee?: number;
    exchangeRateUsed?: number;
    convertedAmount?: number;
  };
}

export interface Loan {
  id: string;
  userId: string;
  name: string;
  loanNumber: string;
  lender: string;
  borrower: string;
  loanAccountId: string;
  principalAmount: number;
  interestRate: number;
  loanCurrency: string;
  exchangeRate: number;
  emiAmount: number;
  startDate: string;
  endDate: string;
  nextDueDate: string;
  remainingBalance: number;
  status: 'Draft' | 'Pending' | 'Approved' | 'Completed' | 'Cancelled';
  notes: string;
  attachments: Attachment[];
  createdAt: number;
}

export interface Investment {
  id: string;
  userId: string;
  name: string;
  investmentType: 'Fixed Deposit' | 'Recurring Deposit' | 'Stocks' | 'Mutual Funds' | 'Gold' | 'Crypto' | 'Bonds' | 'Savings Certificates' | 'Real Estate';
  investmentAccountId: string;
  currency: string;
  exchangeRate: number;
  purchaseAmount: number;
  currentValue: number;
  profit: number;
  loss: number;
  purchaseDate: string;
  maturityDate: string;
  interestRate: number;
  dividend: number;
  status: 'Active' | 'Matured' | 'Sold';
  notes: string;
  attachments: Attachment[];
  createdAt: number;
}

export interface Asset {
  id: string;
  userId: string;
  name: string;
  assetType: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  currency: string;
  serialNumber: string;
  warranty: string;
  vendor: string;
  status: 'Active' | 'Sold' | 'Lost' | 'Disposed';
  notes: string;
  attachments: Attachment[];
  createdAt: number;
}

export interface CreditCard {
  id: string;
  userId: string;
  name: string;
  bank: string;
  creditLimit: number;
  availableLimit: number;
  paymentDueDate: string;
  currency: string;
  annualFee: number;
  monthlyFee: number;
  interest: number;
  lateFee: number;
  notes: string;
  attachments: Attachment[];
  paymentHistory: Array<{
    id: string;
    date: string;
    amount: number;
    reference: string;
  }>;
  createdAt: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  description: string;
  groupId?: string; // empty for transfers
  date: string;
  accountId: string;
  attachments: Attachment[];
  isTransfer?: boolean;
  transferId?: string;
  transferNumber?: string;
  referenceNumber?: string;
  transferFee?: number;
  exchangeRateUsed?: number;
  convertedAmount?: number;
  transferAmount?: number;
  transferSide?: 'source' | 'destination';
  status?: 'pending' | 'completed' | 'cancelled';
  createdAt: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: Record<string, any>;
  timestamp: string;
}

export interface UserSettings {
  defaultCurrency: string;
  theme: 'light' | 'dark';
  dateFormat: string;
  language: string;
  appName: string;
  appSubtitle: string;
  appLogo: string;
  brandColor: string;
  appVersion: string;
  buildNumber: string;
  releaseDate: string;
  enableAutomaticUpdates: boolean;
  downloadUpdatesAutomatically: boolean;
  notifyBeforeInstalling: boolean;
  installSecurityUpdatesAutomatically: boolean;
  backupBeforeUpdate: boolean;
  accountTypes?: string[];
  investmentTypes?: string[];
  loanTypes?: string[];
  assetTypes?: string[];
  liabilityTypes?: string[];
  incomeCategories?: string[];
  expenseCategories?: string[];
  budgetCategories?: string[];
  goalCategories?: string[];
  reminderCategories?: string[];
  tags?: string[];
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  createdAt: number;
  settings: UserSettings;
}
