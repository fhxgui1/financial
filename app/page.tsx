import React from 'react';
import { getCategoriesAction, getTransactionsAction, getBudgetsAction } from './actions';
import { FinancialClient } from './client';
import { Category, Transaction, Budget } from './lib/types';

export default async function Page() {
  const dbCategories = await getCategoriesAction();
  const dbTransactions = await getTransactionsAction();
  const dbBudgets = await getBudgetsAction();

  const initialCategories: Category[] = dbCategories.map(c => ({
    id: c.id,
    name: c.name,
    type: c.type as any,
    color: c.color,
    icon: c.icon
  }));

  const initialTransactions: Transaction[] = dbTransactions.map(t => ({
    id: t.id,
    amount: parseFloat(t.amount.toString()),
    type: t.type as any,
    categoryId: t.categoryId,
    date: new Date(t.date),
    accountId: t.accountId,
    description: t.description
  }));

  const initialBudgets: Budget[] = dbBudgets.map(b => ({
    id: b.id,
    categoryId: b.categoryId,
    amountLimit: parseFloat(b.amountLimit.toString())
  }));

  return (
    <FinancialClient 
      initialCategories={initialCategories} 
      initialTransactions={initialTransactions} 
      initialBudgets={initialBudgets}
    />
  );
}
