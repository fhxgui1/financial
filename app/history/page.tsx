import React from 'react';
import { getCategoriesAction, getTransactionsAction } from '../actions';
import { HistoryClient } from './client';
import { Category, Transaction } from '../lib/types';

export default async function HistoryPage() {
  const dbCategories = await getCategoriesAction();
  const dbTransactions = await getTransactionsAction();

  const categories: Category[] = dbCategories.map(c => ({
    id: c.id,
    name: c.name,
    type: c.type as any,
    color: c.color,
    icon: c.icon
  }));

  const transactions: Transaction[] = dbTransactions.map(t => ({
    id: t.id,
    amount: parseFloat(t.amount.toString()),
    type: t.type as any,
    categoryId: t.categoryId,
    date: new Date(t.date),
    accountId: t.accountId,
    description: t.description
  }));

  return <HistoryClient categories={categories} transactions={transactions} />;
}
