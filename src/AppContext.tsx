import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserSettings,
  Transaction,
  Account,
  Group,
  Budget,
  Currency,
  Reminder,
  Loan,
  Investment,
  Asset,
  CreditCard,
  AuditLog,
  Attachment,
} from './types';
import { DB, seedDefaultsForUser, uid, sha256Hex, randomSalt } from './db';

interface AppContextType {
  user: User | null;
  view: string;
  transactions: Transaction[];
  accounts: Account[];
  groups: Group[];
  budgets: Budget[];
  currencies: Currency[];
  reminders: Reminder[];
  loans: Loan[];
  investments: Investment[];
  assets: Asset[];
  creditCards: CreditCard[];
  auditLogs: AuditLog[];
  theme: 'light' | 'dark';
  currentSelectedAccount: string | null;
  currentSelectedCategory: string | null;
  searchQuery: string;
  filters: {
    from: string;
    to: string;
    groupId: string;
    accountId: string;
    month: string;
    year: string;
  };

  // Actions
  setView: (view: string) => void;
  setSearchQuery: (query: string) => void;
  setFilters: React.Dispatch<React.SetStateAction<AppContextType['filters']>>;
  toggleTheme: () => void;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Database updates
  addTransaction: (tx: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => void;
  editTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  addAccount: (acc: Omit<Account, 'id' | 'userId' | 'createdAt'>) => void;
  editAccount: (id: string, acc: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  addGroup: (grp: Omit<Group, 'id' | 'userId'>) => void;
  editGroup: (id: string, grp: Partial<Group>) => void;
  deleteGroup: (id: string) => void;

  addBudget: (bgt: Omit<Budget, 'id' | 'userId'>) => void;
  deleteBudget: (id: string) => void;

  addReminder: (rem: Omit<Reminder, 'id' | 'userId'>) => void;
  editReminder: (id: string, rem: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  approveReminder: (id: string) => void;

  addLoan: (ln: Omit<Loan, 'id' | 'userId' | 'createdAt'>) => void;
  editLoan: (id: string, ln: Partial<Loan>) => void;
  deleteLoan: (id: string) => void;

  addInvestment: (inv: Omit<Investment, 'id' | 'userId' | 'createdAt'>) => void;
  editInvestment: (id: string, inv: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;

  addAsset: (asst: Omit<Asset, 'id' | 'userId' | 'createdAt'>) => void;
  editAsset: (id: string, asst: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;

  addCreditCard: (cc: Omit<CreditCard, 'id' | 'userId' | 'createdAt'>) => void;
  editCreditCard: (id: string, cc: Partial<CreditCard>) => void;
  deleteCreditCard: (id: string) => void;

  // Selectors & Calculations
  getAccountBalance: (accountId: string) => number;
  getOverdraftStatus: (accountId: string) => {
    limit: number;
    used: number;
    available: number;
    isOverdrafted: boolean;
  };
  convertCurrency: (amount: number, from: string, to: string) => number;
  formatCurrency: (amount: number, code?: string) => string;
  getBaseCurrencyCode: () => string;

  // Unified Dashboard Metrics
  getDashboardMetrics: () => {
    moneyIn: number;
    moneyOut: number;
    cashFlow: number;
    netWorth: number;
    assetsTotal: number;
    liabilitiesTotal: number;
  };

  // Settings & Backups
  updateUserSettings: (settings: Partial<UserSettings>) => void;
  importBackupData: (data: any) => Promise<{ success: boolean; message: string }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => DB.get<User | null>('current_user', null));
  const [view, setView] = useState<string>('home');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [currentSelectedAccount, setCurrentSelectedAccount] = useState<string | null>(null);
  const [currentSelectedCategory, setCurrentSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<AppContextType['filters']>({
    from: '',
    to: '',
    groupId: '',
    accountId: '',
    month: '',
    year: '',
  });

  // Load user-specific records once logged in
  useEffect(() => {
    if (user) {
      const uId = user.id;
      setTransactions(DB.get<Transaction[]>(`tx_${uId}`, []));
      setAccounts(DB.get<Account[]>(`acc_${uId}`, []));
      setGroups(DB.get<Group[]>(`grp_${uId}`, []));
      setBudgets(DB.get<Budget[]>(`bgt_${uId}`, []));
      setCurrencies(DB.get<Currency[]>(`cur_${uId}`, []));
      setReminders(DB.get<Reminder[]>(`rem_${uId}`, []));
      setLoans(DB.get<Loan[]>(`loan_${uId}`, []));
      setInvestments(DB.get<Investment[]>(`inv_${uId}`, []));
      setAssets(DB.get<Asset[]>(`asset_${uId}`, []));
      setCreditCards(DB.get<CreditCard[]>(`cc_${uId}`, []));
      setAuditLogs(DB.get<AuditLog[]>(`audit_${uId}`, []));
      setTheme(user.settings?.theme || 'light');
    } else {
      setTransactions([]);
      setAccounts([]);
      setGroups([]);
      setBudgets([]);
      setCurrencies([]);
      setReminders([]);
      setLoans([]);
      setInvestments([]);
      setAssets([]);
      setCreditCards([]);
      setAuditLogs([]);
    }
  }, [user]);

  // Synchronize state back to database
  const saveState = (key: string, data: any) => {
    if (user) {
      DB.set(`${key}_${user.id}`, data);
    }
  };

  const getBaseCurrencyCode = () => {
    const def = currencies.find((c) => c.isDefault);
    return def ? def.code : 'AED';
  };

  // Convert currency helper
  const convertCurrency = (amount: number, from: string, to: string) => {
    if (from === to) return amount;
    const fromCur = currencies.find((c) => c.code === from);
    const toCur = currencies.find((c) => c.code === to);
    if (!fromCur || !toCur) return amount;

    // Convert from custom to default base, then from default base to target
    const inBase = amount / fromCur.rate;
    return inBase * toCur.rate;
  };

  const formatCurrency = (amount: number, code?: string) => {
    const targetCode = code || getBaseCurrencyCode();
    const cur = currencies.find((c) => c.code === targetCode) || { symbol: targetCode + ' ' };
    return `${cur.symbol}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // 1. Dynamic Account Balance Calculator
  const getAccountBalance = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    if (!account) return 0;

    let balance = account.openingBalance;
    const accountTxs = transactions.filter((t) => t.accountId === accountId);

    accountTxs.forEach((t) => {
      // If it's a transfer, check status
      if (t.isTransfer && t.status !== 'completed') return;

      const amt = convertCurrency(t.amount, t.currency, account.currency);
      if (t.type === 'income') {
        balance += amt;
      } else {
        balance -= amt;
      }
    });

    return balance;
  };

  // 2. Overdraft metrics calculator
  const getOverdraftStatus = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    if (!account || !account.allowOverdraft) {
      return { limit: 0, used: 0, available: 0, isOverdrafted: false };
    }

    const balance = getAccountBalance(accountId);
    const limit = account.overdraftLimit;

    if (balance >= 0) {
      return {
        limit,
        used: 0,
        available: limit,
        isOverdrafted: false,
      };
    } else {
      const used = Math.abs(balance);
      const available = Math.max(0, limit - used);
      return {
        limit,
        used,
        available,
        isOverdrafted: true,
      };
    }
  };

  // Auth Operations
  const login = async (username: string, password: string) => {
    const users = DB.get<User[]>('users_list', []);
    const matched = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (!matched) return false;

    const hash = await sha256Hex(matched.salt + password);
    if (hash === matched.passwordHash) {
      setUser(matched);
      DB.set('current_user', matched);
      return true;
    }
    return false;
  };

  const signup = async (username: string, password: string) => {
    const users = DB.get<User[]>('users_list', []);
    const exists = users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase());
    if (exists) return false;

    const salt = randomSalt();
    const passwordHash = await sha256Hex(salt + password);

    const newUser: User = {
      id: uid('user'),
      username: username.trim(),
      passwordHash,
      salt,
      createdAt: Date.now(),
      settings: {
        defaultCurrency: 'AED',
        theme: 'light',
        dateFormat: 'YYYY-MM-DD',
        language: 'English',
        appName: 'Money',
        appSubtitle: 'Your money, in a jar you can see.',
        appLogo: '🪙',
        brandColor: '#4C7A5A',
        appVersion: '1.0.0',
        buildNumber: '1',
        releaseDate: '2026-07-08',
        enableAutomaticUpdates: false,
        downloadUpdatesAutomatically: false,
        notifyBeforeInstalling: true,
        installSecurityUpdatesAutomatically: true,
        backupBeforeUpdate: true,
      },
    };

    // Save to users master list
    DB.set('users_list', [...users, newUser]);

    // Pre-seed data lists
    const seeded = await seedDefaultsForUser(newUser.id);
    DB.set(`grp_${newUser.id}`, seeded.groups);
    DB.set(`cur_${newUser.id}`, seeded.currencies);
    DB.set(`acc_${newUser.id}`, seeded.accounts);
    DB.set(`tx_${newUser.id}`, seeded.transactions);
    DB.set(`rem_${newUser.id}`, seeded.reminders);
    DB.set(`loan_${newUser.id}`, seeded.loans);
    DB.set(`inv_${newUser.id}`, seeded.investments);
    DB.set(`asset_${newUser.id}`, seeded.assets);
    DB.set(`cc_${newUser.id}`, seeded.creditCards);
    DB.set(`bgt_${newUser.id}`, seeded.budgets);

    setUser(newUser);
    DB.set('current_user', newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
    DB.set('current_user', null);
    setView('home');
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (user) {
      const updatedUser = {
        ...user,
        settings: { ...user.settings, theme: nextTheme },
      };
      setUser(updatedUser);
      DB.set('current_user', updatedUser);
      const users = DB.get<User[]>('users_list', []);
      DB.set(
        'users_list',
        users.map((u) => (u.id === user.id ? updatedUser : u))
      );
    }
  };

  // Transaction Operations
  const addTransaction = (tx: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const newTx: Transaction = {
      id: uid('tx'),
      userId: user.id,
      ...tx,
      createdAt: Date.now(),
    };
    const next = [...transactions, newTx];
    setTransactions(next);
    saveState('tx', next);

    // If transaction involves credit card account, update its limits
    const account = accounts.find((a) => a.id === tx.accountId);
    if (account && account.type === 'card') {
      const card = creditCards.find((c) => c.name === account.name);
      if (card) {
        const diff = convertCurrency(tx.amount, tx.currency, card.currency);
        const newAvailable =
          tx.type === 'expense'
            ? card.availableLimit - diff
            : card.availableLimit + diff;
        editCreditCard(card.id, { availableLimit: Math.max(0, newAvailable) });
      }
    }
  };

  const editTransaction = (id: string, partial: Partial<Transaction>) => {
    const next = transactions.map((t) => (t.id === id ? { ...t, ...partial } : t));
    setTransactions(next);
    saveState('tx', next);
  };

  const deleteTransaction = (id: string) => {
    const next = transactions.filter((t) => t.id !== id);
    setTransactions(next);
    saveState('tx', next);
  };

  // Account Operations
  const addAccount = (acc: Omit<Account, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const newAcc: Account = {
      id: uid('acc'),
      userId: user.id,
      ...acc,
      createdAt: Date.now(),
    };
    const next = [...accounts, newAcc];
    setAccounts(next);
    saveState('acc', next);

    // If account is a credit card, also create it in the credit card register
    if (acc.type === 'card') {
      addCreditCard({
        name: acc.name,
        bank: 'Card Issuer',
        creditLimit: acc.overdraftLimit || 10000,
        availableLimit: acc.overdraftLimit || 10000,
        paymentDueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
        currency: acc.currency,
        annualFee: 0,
        monthlyFee: 0,
        interest: 20,
        lateFee: 150,
        notes: 'Associated with credit card account ' + acc.name,
        attachments: [],
        paymentHistory: [],
      });
    }
  };

  const editAccount = (id: string, partial: Partial<Account>) => {
    const next = accounts.map((a) => (a.id === id ? { ...a, ...partial } : a));
    setAccounts(next);
    saveState('acc', next);
  };

  const deleteAccount = (id: string) => {
    const next = accounts.filter((a) => a.id !== id);
    setAccounts(next);
    saveState('acc', next);
  };

  // Group Operations
  const addGroup = (grp: Omit<Group, 'id' | 'userId'>) => {
    if (!user) return;
    const newGrp: Group = {
      id: uid('grp'),
      userId: user.id,
      ...grp,
    };
    const next = [...groups, newGrp];
    setGroups(next);
    saveState('grp', next);
  };

  const editGroup = (id: string, partial: Partial<Group>) => {
    const next = groups.map((g) => (g.id === id ? { ...g, ...partial } : g));
    setGroups(next);
    saveState('grp', next);
  };

  const deleteGroup = (id: string) => {
    const next = groups.filter((g) => g.id !== id);
    setGroups(next);
    saveState('grp', next);
  };

  // Budget Operations
  const addBudget = (bgt: Omit<Budget, 'id' | 'userId'>) => {
    if (!user) return;
    const newBgt: Budget = {
      id: uid('bgt'),
      userId: user.id,
      ...bgt,
    };
    const next = [...budgets, newBgt];
    setBudgets(next);
    saveState('bgt', next);
  };

  const deleteBudget = (id: string) => {
    const next = budgets.filter((b) => b.id !== id);
    setBudgets(next);
    saveState('bgt', next);
  };

  // Reminder Operations
  const addReminder = (rem: Omit<Reminder, 'id' | 'userId'>) => {
    if (!user) return;
    const newRem: Reminder = {
      id: uid('rem'),
      userId: user.id,
      ...rem,
    };
    const next = [...reminders, newRem];
    setReminders(next);
    saveState('rem', next);
  };

  const editReminder = (id: string, partial: Partial<Reminder>) => {
    const next = reminders.map((r) => (r.id === id ? { ...r, ...partial } : r));
    setReminders(next);
    saveState('rem', next);
  };

  const deleteReminder = (id: string) => {
    const next = reminders.filter((r) => r.id !== id);
    setReminders(next);
    saveState('rem', next);
  };

  const approveReminder = (id: string) => {
    const rem = reminders.find((r) => r.id === id);
    if (!rem) return;

    if (rem.transactionDetails.isTransfer) {
      // Execute Transfer
      const transferId = uid('trf');
      const transferNum = uid('trf_num');
      const sourceLeg: Omit<Transaction, 'id' | 'userId' | 'createdAt'> = {
        type: 'expense',
        accountId: rem.transactionDetails.fromAccountId || '',
        amount: rem.transactionDetails.fromAmount || 0,
        currency: rem.transactionDetails.fromCurrency || 'AED',
        description: rem.title + ' (Auto Transfer Out)',
        date: new Date().toISOString().slice(0, 10),
        attachments: [],
        isTransfer: true,
        transferId,
        transferNumber: transferNum,
        transferSide: 'source',
        status: 'completed',
      };
      const destLeg: Omit<Transaction, 'id' | 'userId' | 'createdAt'> = {
        type: 'income',
        accountId: rem.transactionDetails.toAccountId || '',
        amount: rem.transactionDetails.toAmount || 0,
        currency: rem.transactionDetails.toCurrency || 'AED',
        description: rem.title + ' (Auto Transfer In)',
        date: new Date().toISOString().slice(0, 10),
        attachments: [],
        isTransfer: true,
        transferId,
        transferNumber: transferNum,
        transferSide: 'destination',
        status: 'completed',
      };
      addTransaction(sourceLeg);
      addTransaction(destLeg);
    } else {
      // Execute regular transaction
      addTransaction({
        type: rem.transactionDetails.type || 'expense',
        accountId: rem.transactionDetails.accountId,
        amount: rem.transactionDetails.amount,
        currency: rem.transactionDetails.currency,
        description: rem.title + ' (Reminder auto-posted)',
        groupId: rem.transactionDetails.groupId,
        date: new Date().toISOString().slice(0, 10),
        attachments: [],
      });
    }

    // Update reminder status
    if (rem.repeat === 'none') {
      editReminder(id, { status: 'completed' });
    } else {
      // Advance due date
      const d = new Date(rem.nextDueDate);
      if (rem.repeat === 'daily') d.setDate(d.getDate() + 1);
      if (rem.repeat === 'weekly') d.setDate(d.getDate() + 7);
      if (rem.repeat === 'monthly') d.setMonth(d.getMonth() + 1);
      if (rem.repeat === 'yearly') d.setFullYear(d.getFullYear() + 1);
      editReminder(id, { nextDueDate: d.toISOString().slice(0, 10) });
    }
  };

  // Loan Operations
  const addLoan = (ln: Omit<Loan, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const newLn: Loan = {
      id: uid('loan'),
      userId: user.id,
      ...ln,
      createdAt: Date.now(),
    };
    const next = [...loans, newLn];
    setLoans(next);
    saveState('loan', next);

    // Automatically post loan principal as an incoming transaction to the linked account
    if (ln.status === 'Approved' && ln.loanAccountId) {
      addTransaction({
        type: 'income',
        accountId: ln.loanAccountId,
        amount: ln.principalAmount,
        currency: ln.loanCurrency,
        description: `Loan received: ${ln.name}`,
        date: ln.startDate || new Date().toISOString().slice(0, 10),
        attachments: ln.attachments,
        groupId: groups.find((g) => g.name === 'Loan Received')?.id,
      });
    }
  };

  const editLoan = (id: string, partial: Partial<Loan>) => {
    const next = loans.map((ln) => (ln.id === id ? { ...ln, ...partial } : ln));
    setLoans(next);
    saveState('loan', next);
  };

  const deleteLoan = (id: string) => {
    const next = loans.filter((ln) => ln.id !== id);
    setLoans(next);
    saveState('loan', next);
  };

  // Investment Operations
  const addInvestment = (inv: Omit<Investment, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const newInv: Investment = {
      id: uid('inv'),
      userId: user.id,
      ...inv,
      createdAt: Date.now(),
    };
    const next = [...investments, newInv];
    setInvestments(next);
    saveState('inv', next);

    // If investment is active, withdraw purchaseAmount from linked account
    if (inv.investmentAccountId && inv.purchaseAmount > 0) {
      addTransaction({
        type: 'expense',
        accountId: inv.investmentAccountId,
        amount: inv.purchaseAmount,
        currency: inv.currency,
        description: `Investment Purchase: ${inv.name}`,
        date: inv.purchaseDate || new Date().toISOString().slice(0, 10),
        attachments: inv.attachments,
      });
    }
  };

  const editInvestment = (id: string, partial: Partial<Investment>) => {
    const next = investments.map((inv) => (inv.id === id ? { ...inv, ...partial } : inv));
    setInvestments(next);
    saveState('inv', next);
  };

  const deleteInvestment = (id: string) => {
    const next = investments.filter((inv) => inv.id !== id);
    setInvestments(next);
    saveState('inv', next);
  };

  // Asset Operations
  const addAsset = (asst: Omit<Asset, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const newAsst: Asset = {
      id: uid('asset'),
      userId: user.id,
      ...asst,
      createdAt: Date.now(),
    };
    const next = [...assets, newAsst];
    setAssets(next);
    saveState('asset', next);
  };

  const editAsset = (id: string, partial: Partial<Asset>) => {
    const next = assets.map((a) => (a.id === id ? { ...a, ...partial } : a));
    setAssets(next);
    saveState('asset', next);
  };

  const deleteAsset = (id: string) => {
    const next = assets.filter((a) => a.id !== id);
    setAssets(next);
    saveState('asset', next);
  };

  // Credit Card Operations
  const addCreditCard = (cc: Omit<CreditCard, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const newCc: CreditCard = {
      id: uid('cc'),
      userId: user.id,
      ...cc,
      createdAt: Date.now(),
    };
    const next = [...creditCards, newCc];
    setCreditCards(next);
    saveState('cc', next);
  };

  const editCreditCard = (id: string, partial: Partial<CreditCard>) => {
    const next = creditCards.map((c) => (c.id === id ? { ...c, ...partial } : c));
    setCreditCards(next);
    saveState('cc', next);
  };

  const deleteCreditCard = (id: string) => {
    const next = creditCards.filter((c) => c.id !== id);
    setCreditCards(next);
    saveState('cc', next);
  };

  // Unified Dashboard Metrics and Core Card Calculations (Section 6 Requirements)
  const getDashboardMetrics = () => {
    const baseCode = getBaseCurrencyCode();

    // 1. Money In (Income + Deposits + Loan received + other incoming)
    let moneyIn = 0;
    // 2. Money Out (Expenses + Payments + Transfers out + Loan repayment)
    let moneyOut = 0;

    transactions.forEach((t) => {
      // Exclude unposted transfers
      if (t.isTransfer && t.status !== 'completed') return;

      const amtInBase = convertCurrency(t.amount, t.currency, baseCode);

      if (t.type === 'income') {
        moneyIn += amtInBase;
      } else {
        moneyOut += amtInBase;
      }
    });

    // 3. Cash Flow (Money In - Money Out)
    const cashFlow = moneyIn - moneyOut;

    // 4. Net Worth calculation:
    // Assets (Positive Bank balances + Cash + Investments + Assets)
    // Minus Liabilities (Outstanding Loans + Credit card Used/Balance + Overdraft balances)
    let bankCashAssetTotal = 0;
    let overdraftUsedTotal = 0;

    accounts.forEach((acc) => {
      const balance = getAccountBalance(acc.id);
      const balInBase = convertCurrency(balance, acc.currency, baseCode);

      if (balInBase >= 0) {
        bankCashAssetTotal += balInBase;
      } else {
        // If it's a negative overdraft or credit card account balance
        overdraftUsedTotal += Math.abs(balInBase);
      }
    });

    // Investments currentValue
    const investmentsTotal = investments
      .filter((inv) => inv.status === 'Active')
      .reduce((sum, inv) => sum + convertCurrency(inv.currentValue, inv.currency, baseCode), 0);

    // Assets currentValue
    const assetsTotal = assets
      .filter((a) => a.status === 'Active')
      .reduce((sum, a) => sum + convertCurrency(a.currentValue, a.currency, baseCode), 0);

    // Outstanding loans
    const loansTotal = loans
      .filter((ln) => ln.status === 'Approved' || ln.status === 'Pending')
      .reduce((sum, ln) => sum + convertCurrency(ln.remainingBalance, ln.loanCurrency, baseCode), 0);

    // Credit cards used (sum of: limit - availableLimit)
    const creditUsedTotal = creditCards.reduce((sum, card) => {
      const used = Math.max(0, card.creditLimit - card.availableLimit);
      return sum + convertCurrency(used, card.currency, baseCode);
    }, 0);

    const netWorth =
      (bankCashAssetTotal + investmentsTotal + assetsTotal) -
      (loansTotal + creditUsedTotal + overdraftUsedTotal);

    return {
      moneyIn,
      moneyOut,
      cashFlow,
      netWorth,
      assetsTotal: bankCashAssetTotal + investmentsTotal + assetsTotal,
      liabilitiesTotal: loansTotal + creditUsedTotal + overdraftUsedTotal,
    };
  };

  const updateUserSettings = (settingsPatch: Partial<UserSettings>) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      settings: { ...user.settings, ...settingsPatch },
    };
    setUser(updatedUser);
    DB.set('current_user', updatedUser);
    const users = DB.get<User[]>('users_list', []);
    DB.set(
      'users_list',
      users.map((u) => (u.id === user.id ? updatedUser : u))
    );
  };

  const importBackupData = async (data: any): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: 'User is not logged in.' };
    try {
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'Invalid backup format: Must be a JSON object.' };
      }

      const uId = user.id;

      // Update states and save them
      if (Array.isArray(data.transactions)) {
        const txs = data.transactions.map((tx: any) => ({ ...tx, userId: uId }));
        setTransactions(txs);
        saveState('tx', txs);
      }
      if (Array.isArray(data.accounts)) {
        const accs = data.accounts.map((acc: any) => ({ ...acc, userId: uId }));
        setAccounts(accs);
        saveState('acc', accs);
      }
      if (Array.isArray(data.groups)) {
        const grps = data.groups.map((grp: any) => ({ ...grp, userId: uId }));
        setGroups(grps);
        saveState('grp', grps);
      }
      if (Array.isArray(data.budgets)) {
        const bgts = data.budgets.map((bgt: any) => ({ ...bgt, userId: uId }));
        setBudgets(bgts);
        saveState('bgt', bgts);
      }
      if (Array.isArray(data.reminders)) {
        const rems = data.reminders.map((rem: any) => ({ ...rem, userId: uId }));
        setReminders(rems);
        saveState('rem', rems);
      }
      if (Array.isArray(data.loans)) {
        const lns = data.loans.map((ln: any) => ({ ...ln, userId: uId }));
        setLoans(lns);
        saveState('loan', lns);
      }
      if (Array.isArray(data.investments)) {
        const invs = data.investments.map((inv: any) => ({ ...inv, userId: uId }));
        setInvestments(invs);
        saveState('inv', invs);
      }
      if (Array.isArray(data.assets)) {
        const assts = data.assets.map((asst: any) => ({ ...asst, userId: uId }));
        setAssets(assts);
        saveState('asset', assts);
      }
      if (Array.isArray(data.creditCards)) {
        const ccs = data.creditCards.map((cc: any) => ({ ...cc, userId: uId }));
        setCreditCards(ccs);
        saveState('cc', ccs);
      }
      if (Array.isArray(data.currencies)) {
        const curs = data.currencies.map((cur: any) => ({ ...cur, userId: uId }));
        setCurrencies(curs);
        saveState('cur', curs);
      }
      if (Array.isArray(data.auditLogs)) {
        const logs = data.auditLogs.map((log: any) => ({ ...log, userId: uId }));
        setAuditLogs(logs);
        saveState('audit', logs);
      }

      return { success: true, message: 'All record lists have been successfully restored and merged!' };
    } catch (e: any) {
      console.error('Failed to import backup data', e);
      return { success: false, message: `Failed to import: ${e?.message || e}` };
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        view,
        transactions,
        accounts,
        groups,
        budgets,
        currencies,
        reminders,
        loans,
        investments,
        assets,
        creditCards,
        auditLogs,
        theme,
        currentSelectedAccount,
        currentSelectedCategory,
        searchQuery,
        filters,

        setView,
        setSearchQuery,
        setFilters,
        toggleTheme,
        login,
        signup,
        logout,

        addTransaction,
        editTransaction,
        deleteTransaction,

        addAccount,
        editAccount,
        deleteAccount,

        addGroup,
        editGroup,
        deleteGroup,

        addBudget,
        deleteBudget,

        addReminder,
        editReminder,
        deleteReminder,
        approveReminder,

        addLoan,
        editLoan,
        deleteLoan,

        addInvestment,
        editInvestment,
        deleteInvestment,

        addAsset,
        editAsset,
        deleteAsset,

        addCreditCard,
        editCreditCard,
        deleteCreditCard,

        getAccountBalance,
        getOverdraftStatus,
        convertCurrency,
        formatCurrency,
        getBaseCurrencyCode,
        getDashboardMetrics,

        updateUserSettings,
        importBackupData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
