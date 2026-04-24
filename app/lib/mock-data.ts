import { Category, Transaction } from './types';
import { subDays, addDays } from 'date-fns';

export const initialCategories: Category[] = [
  { id: 'c1', name: 'Salário', type: 'INCOME', color: 'bg-emerald-500', icon: 'Wallet' },
  { id: 'c2', name: 'Freela', type: 'INCOME', color: 'bg-teal-400', icon: 'Briefcase' },
  { id: 'c3', name: 'Alimentação', type: 'EXPENSE', color: 'bg-rose-500', icon: 'Utensils' },
  { id: 'c4', name: 'Transporte', type: 'EXPENSE', color: 'bg-blue-500', icon: 'Car' },
  { id: 'c5', name: 'Moradia', type: 'EXPENSE', color: 'bg-indigo-500', icon: 'Home' },
  { id: 'c6', name: 'Lazer', type: 'EXPENSE', color: 'bg-fuchsia-500', icon: 'Gamepad2' },
  { id: 'c7', name: 'Assinaturas', type: 'EXPENSE', color: 'bg-purple-500', icon: 'Youtube' }
];

const now = new Date();

export const initialTransactions: Transaction[] = [
  {
    id: 't1',
    amount: 15400.00,
    type: 'INCOME',
    categoryId: 'c1',
    date: subDays(now, 5),
    description: 'Salário ref. mês anterior',
  },
    {
    id: 't13',
    amount: 52000.00,
    type: 'INCOME',
    categoryId: 'c1',
    date: subDays(now, 30),
    description: 'investimentos',
  },
  
  {
    id: 't2',
    amount: 2500.00,
    type: 'EXPENSE',
    categoryId: 'c5',
    date: subDays(now, 4),
    description: 'Aluguel + Condomínio',
  },
  {
    id: 't3',
    amount: 145.50,
    type: 'EXPENSE',
    categoryId: 'c3',
    date: subDays(now, 2),
    description: 'Mercado da semana',
  },
  {
    id: 't4',
    amount: 80.00,
    type: 'EXPENSE',
    categoryId: 'c4',
    date: subDays(now, 1),
    description: 'Uber',
  },
  {
    id: 't5',
    amount: 45.90,
    type: 'EXPENSE',
    categoryId: 'c7',
    date: addDays(now, 10), // Committed (future) expense
    description: 'Netflix',
  },
  {
    id: 't6',
    amount: 320.00,
    type: 'EXPENSE',
    categoryId: 'c6',
    date: subDays(now, 3),
    description: 'Jantar com amigos',
  }
];
