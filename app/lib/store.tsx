"use client";

import React, { createContext, useContext, useState, useMemo } from 'react';
import { Transaction, Category, FinancialSummary, Budget } from './types';
// Remove mock data import
import { startOfMonth, isSameMonth } from 'date-fns';

interface FinancialContextType {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  summary: FinancialSummary;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export function FinancialProvider({ 
  children, 
  initialCategories, 
  initialTransactions,
  initialBudgets
}: { 
  children: React.ReactNode, 
  initialCategories: Category[], 
  initialTransactions: Transaction[],
  initialBudgets: Budget[]
}) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [categories] = useState<Category[]>(initialCategories);
  const [budgets] = useState<Budget[]>(initialBudgets);

  // Sync state if server revalidates and sends fresh DB data
  React.useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: Math.random().toString(36).substring(7),
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const summary = useMemo<FinancialSummary>(() => {
    const now = new Date();
    
    // Simplistic calculation for the whole time vs this month
    let totalIncome = 0;
    let totalExpense = 0;
    
    let incomeThisMonth = 0;
    let expenseThisMonth = 0;
    let committedBalance = 0; // Simple mock: expenses in the future this month

    transactions.forEach(tx => {
      // Global balance
      if (tx.type === 'INCOME') totalIncome += tx.amount;
      if (tx.type === 'EXPENSE') totalExpense += tx.amount;

      // Ensure dates are parsed properly
      const txDate = typeof tx.date === 'string' ? new Date(tx.date) : tx.date;

      // This month
      if (isSameMonth(txDate, now)) {
        if (tx.type === 'INCOME') incomeThisMonth += tx.amount;
        if (tx.type === 'EXPENSE') {
          expenseThisMonth += tx.amount;
          if (txDate > now) {
            committedBalance += tx.amount;
          }
        }
      }
    });

    const currentBalance = totalIncome - totalExpense;
    const partialBalance = incomeThisMonth - expenseThisMonth;
    const availableBalance = currentBalance - committedBalance;

    return {
      currentBalance,
      availableBalance,
      committedBalance,
      incomeThisMonth,
      expenseThisMonth,
      partialBalance,
    };
  }, [transactions]);

  return (
    <FinancialContext.Provider value={{ transactions, categories, budgets, addTransaction, summary }}>
      {children}
    </FinancialContext.Provider>
  );
}

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) throw new Error('useFinancial must be used within FinancialProvider');
  return context;
};
