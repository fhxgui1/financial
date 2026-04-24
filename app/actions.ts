"use server";

import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';
import { TransactionType } from './lib/types';

// The ! assumes DATABASE_URL is present. If it's not, the server will error cleanly.
const sql = neon(process.env.DATABASE_URL!);

export async function getCategoriesAction() {
  try {
    const categories = await sql`
      SELECT id, name, type, color, icon
      FROM financial_categories
      ORDER BY name ASC
    `;
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function getTransactionsAction() {
  try {
    const transactions = await sql`
      SELECT 
        id, amount, type, category_id as "categoryId", date, account_id as "accountId", description
      FROM financial_transactions
      ORDER BY date DESC
    `;
    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

export type CreateTransactionInput = {
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: Date;
  description?: string;
  accountId?: string;
};

export async function createTransactionAction(data: CreateTransactionInput) {
  try {
    await sql`
      INSERT INTO financial_transactions (amount, type, category_id, date, description, account_id)
      VALUES (
        ${data.amount}, 
        ${data.type}, 
        ${data.categoryId}, 
        ${data.date.toISOString()}, 
        ${data.description || null}, 
        ${data.accountId || null}
      )
    `;
    
    // Revalidates the page to ensure we pull the new data when we reload or refresh
    revalidatePath('/financial');
    return { success: true };
  } catch (error) {
    console.error('Error creating transaction:', error);
    return { success: false, error: 'Falha ao criar transação' };
  }
}

export async function deleteTransactionAction(id: string) {
  try {
    await sql`
      DELETE FROM financial_transactions WHERE id = ${id}
    `;
    revalidatePath('/financial');
    return { success: true };
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return { success: false, error: 'Falha ao deletar transação' };
  }
}

export async function getBudgetsAction() {
  try {
    const budgets = await sql`
      SELECT id, category_id as "categoryId", amount_limit as "amountLimit"
      FROM financial_budgets
    `;
    return budgets;
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return [];
  }
}

export async function upsertBudgetAction(categoryId: string, amountLimit: number) {
  try {
    await sql`
      INSERT INTO financial_budgets (category_id, amount_limit, updated_at)
      VALUES (${categoryId}, ${amountLimit}, CURRENT_TIMESTAMP)
      ON CONFLICT (category_id) DO UPDATE 
      SET amount_limit = EXCLUDED.amount_limit, updated_at = CURRENT_TIMESTAMP
    `;
    revalidatePath('/financial');
    revalidatePath('/financial/budgets');
    return { success: true };
  } catch (error) {
    console.error('Error upserting budget:', error);
    return { success: false, error: 'Falha ao salvar orçamento' };
  }
}
