export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: Date;
  accountId?: string;
  description?: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amountLimit: number;
}

export interface FinancialSummary {
  currentBalance: number;
  availableBalance: number;
  committedBalance: number;
  incomeThisMonth: number;
  expenseThisMonth: number;
  partialBalance: number; // income - expense for the current month
}
