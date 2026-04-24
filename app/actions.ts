"use server";

import { neon } from '@neondatabase/serverless';
import { revalidatePath } from 'next/cache';
import { TransactionType } from './lib/types';
import { getSessionUserId } from './lib/auth';

// The ! assumes DATABASE_URL is present. If it's not, the server will error cleanly.
const sql = neon(process.env.DATABASE_URL!);

export async function getCategoriesAction() {
  try {
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) return [];
    
    const categories = await sql`
      SELECT id, name, type, color, icon
      FROM financial_categories
      WHERE user_id = ${sessionUserId} OR user_id IS NULL
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
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) return [];
    
    const transactions = await sql`
      SELECT 
        id, amount, type, category_id as "categoryId", date, account_id as "accountId", description
      FROM financial_transactions
      WHERE user_id = ${sessionUserId}
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
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) return { success: false, error: 'Não autorizado' };
    
    await sql`
      INSERT INTO financial_transactions (amount, type, category_id, date, description, account_id, user_id)
      VALUES (
        ${data.amount}, 
        ${data.type}, 
        ${data.categoryId}, 
        ${data.date.toISOString()}, 
        ${data.description || null}, 
        ${data.accountId || null},
        ${sessionUserId}
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
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) return { success: false, error: 'Não autorizado' };

    await sql`
      DELETE FROM financial_transactions WHERE id = ${id} AND user_id = ${sessionUserId}
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
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) return [];

    const budgets = await sql`
      SELECT id, category_id as "categoryId", amount_limit as "amountLimit"
      FROM financial_budgets
      WHERE user_id = ${sessionUserId}
    `;
    return budgets;
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return [];
  }
}

export async function upsertBudgetAction(categoryId: string, amountLimit: number) {
  try {
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) return { success: false, error: 'Não autorizado' };

    await sql`
      INSERT INTO financial_budgets (category_id, amount_limit, updated_at, user_id)
      VALUES (${categoryId}, ${amountLimit}, CURRENT_TIMESTAMP, ${sessionUserId})
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

export async function createExpenseCategoryAndBudgetAction(name: string, icon: string, color: string, amountLimit: number) {
  try {
    const sessionUserId = await getSessionUserId();
    if (!sessionUserId) return { success: false, error: 'Não autorizado' };

    const result = await sql`
      INSERT INTO financial_categories (name, type, color, icon, user_id)
      VALUES (${name}, 'EXPENSE', ${color}, ${icon}, ${sessionUserId})
      RETURNING id
    `;
    const newId = result[0].id;

    if (amountLimit > 0) {
      await sql`
        INSERT INTO financial_budgets (category_id, amount_limit, updated_at, user_id)
        VALUES (${newId}, ${amountLimit}, CURRENT_TIMESTAMP, ${sessionUserId})
      `;
    }
    
    revalidatePath('/', 'layout');
    return { success: true, categoryId: newId };
  } catch (error) {
    console.error('Error creating new category/budget:', error);
    return { success: false, error: 'Falha ao criar categoria e teto' };
  }
}
