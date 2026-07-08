import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { useApp } from '../AppContext';
import { Transaction } from '../types';

interface DashboardChartsProps {
  onCategoryClick?: (groupId: string) => void;
  onMonthClick?: (monthKey: string) => void;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  onCategoryClick,
  onMonthClick,
}) => {
  const { transactions, groups, formatCurrency, convertCurrency, getBaseCurrencyCode } = useApp();
  const baseCode = getBaseCurrencyCode();

  // A) MONEY IN VS MONEY OUT (Last 6 Months)
  const getIncomeVsExpenseData = () => {
    const data = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mLabel = d.toLocaleString('en-US', { month: 'short' });
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      // Sum transactions in this month
      let income = 0;
      let expense = 0;

      transactions.forEach((t) => {
        if (t.isTransfer) return;
        const tDate = new Date(t.date);
        const tKey = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}`;

        if (tKey === mKey) {
          const amt = convertCurrency(t.amount, t.currency, baseCode);
          if (t.type === 'income') {
            income += amt;
          } else {
            expense += amt;
          }
        }
      });

      data.push({
        name: mLabel,
        key: mKey,
        Income: parseFloat(income.toFixed(2)),
        Expense: parseFloat(expense.toFixed(2)),
      });
    }
    return data;
  };

  // B) SPENDING BY GROUP
  const getSpendingByGroupData = () => {
    const spendingMap: Record<string, { name: string; value: number; color: string; id: string }> = {};

    transactions.forEach((t) => {
      if (t.type !== 'expense' || t.isTransfer || !t.groupId) return;
      const grp = groups.find((g) => g.id === t.groupId);
      if (!grp) return;

      const amt = convertCurrency(t.amount, t.currency, baseCode);
      if (spendingMap[t.groupId]) {
        spendingMap[t.groupId].value += amt;
      } else {
        spendingMap[t.groupId] = {
          id: t.groupId,
          name: grp.name,
          value: amt,
          color: grp.color || '#A65A72',
        };
      }
    });

    const list = Object.values(spendingMap).map((item) => ({
      ...item,
      value: parseFloat(item.value.toFixed(2)),
    }));

    // Sort by value desc
    return list.sort((a, b) => b.value - a.value);
  };

  // C) TOTAL MONEY OVER TIME (Running balance)
  const getRunningBalanceData = () => {
    const data = [];
    const now = new Date();
    let currentBalance = 0;

    // Calculate opening balance up to 6 months ago
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    transactions.forEach((t) => {
      const tDate = new Date(t.date);
      if (tDate < sixMonthsAgo) {
        if (t.isTransfer && t.status !== 'completed') return;
        const amt = convertCurrency(t.amount, t.currency, baseCode);
        if (t.type === 'income') {
          currentBalance += amt;
        } else {
          currentBalance -= amt;
        }
      }
    });

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mLabel = d.toLocaleString('en-US', { month: 'short' });
      const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      transactions.forEach((t) => {
        if (t.isTransfer && t.status !== 'completed') return;
        const tDate = new Date(t.date);
        const tKey = `${tDate.getFullYear()}-${String(tDate.getMonth() + 1).padStart(2, '0')}`;

        if (tKey === mKey) {
          const amt = convertCurrency(t.amount, t.currency, baseCode);
          if (t.type === 'income') {
            currentBalance += amt;
          } else {
            currentBalance -= amt;
          }
        }
      });

      data.push({
        name: mLabel,
        Balance: parseFloat(currentBalance.toFixed(2)),
      });
    }

    return data;
  };

  const barData = getIncomeVsExpenseData();
  const pieData = getSpendingByGroupData();
  const lineData = getRunningBalanceData();

  const totalSpending = pieData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* 2-Column charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Money In vs Money Out */}
        <div className="lg:col-span-7 bg-surface border border-line rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-ink mb-4 font-sans uppercase tracking-wider text-muted">
            Money In vs Money Out (6 Months)
          </h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                onClick={(state: any) => {
                  if (state && state.activePayload && onMonthClick) {
                    const monthKey = state.activePayload[0].payload.key;
                    onMonthClick(monthKey);
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#DBDACB" opacity={0.5} />
                <XAxis dataKey="name" stroke="#6C7566" fontSize={11} tickLine={false} />
                <YAxis stroke="#6C7566" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val) => [formatCurrency(val as number), '']}
                  contentStyle={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--line)',
                    borderRadius: '12px',
                    fontFamily: 'var(--font-body)',
                  }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Income" fill="#4C7A5A" radius={[4, 4, 0, 0]} name="Money In" />
                <Bar dataKey="Expense" fill="#8C3B4A" radius={[4, 4, 0, 0]} name="Money Out" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spending by Group */}
        <div className="lg:col-span-5 bg-surface border border-line rounded-2xl p-5 shadow-sm flex flex-col">
          <h3 className="text-sm font-semibold text-ink mb-4 font-sans uppercase tracking-wider text-muted">
            Spending by Category
          </h3>
          {pieData.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <span className="text-3xl mb-2">🍽️</span>
              <p className="text-xs font-semibold text-ink">No spending registered</p>
              <p className="text-[10px] text-muted mt-0.5">Expenses will categorize automatically.</p>
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-6 h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                      onClick={(data: any) => {
                        if (data && onCategoryClick) {
                          onCategoryClick(data.id);
                        }
                      }}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [formatCurrency(val as number), '']}
                      contentStyle={{
                        backgroundColor: 'var(--surface)',
                        borderColor: 'var(--line)',
                        borderRadius: '12px',
                        fontFamily: 'var(--font-body)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legends list */}
              <div className="sm:col-span-6 flex flex-col gap-1.5 max-h-[190px] overflow-y-auto pr-1">
                {pieData.slice(0, 5).map((item, i) => {
                  const pct = totalSpending > 0 ? ((item.value / totalSpending) * 100).toFixed(0) : '0';
                  return (
                    <div
                      key={i}
                      onClick={() => onCategoryClick && onCategoryClick(item.id)}
                      className="flex items-center justify-between gap-2 text-xs font-medium cursor-pointer p-1 rounded-lg hover:bg-bg transition-colors"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate text-ink">{item.name}</span>
                      </div>
                      <div className="font-mono text-[10px] text-muted flex-shrink-0">
                        {pct}% ({formatCurrency(item.value)})
                      </div>
                    </div>
                  );
                })}
                {pieData.length > 5 && (
                  <div className="text-[10px] text-muted text-center italic mt-1">
                    + {pieData.length - 5} more categories
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Running Total Over Time (Line Chart) */}
      <div className="bg-surface border border-line rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-ink mb-4 font-sans uppercase tracking-wider text-muted">
          Total Balance History Over Time
        </h3>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DBDACB" opacity={0.5} />
              <XAxis dataKey="name" stroke="#6C7566" fontSize={11} tickLine={false} />
              <YAxis stroke="#6C7566" fontSize={11} tickLine={false} />
              <Tooltip
                formatter={(val) => [formatCurrency(val as number), 'Running Balance']}
                contentStyle={{
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--line)',
                  borderRadius: '12px',
                  fontFamily: 'var(--font-body)',
                }}
              />
              <Line
                type="monotone"
                dataKey="Balance"
                stroke="#4C7A5A"
                strokeWidth={3}
                dot={{ r: 4, fill: '#4C7A5A', strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
