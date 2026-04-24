import React from 'react';
import { getCategoriesAction, getBudgetsAction } from '../actions';
import { BudgetsClient } from './client';
import { Budget, Category } from '../lib/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function BudgetsPage() {
  const dbCategories = await getCategoriesAction();
  const dbBudgets = await getBudgetsAction();

  const categories: Category[] = dbCategories
    .filter(c => c.type === 'EXPENSE') // Usually budgets make sense for expenses
    .map(c => ({
      id: c.id,
      name: c.name,
      type: c.type as any,
      color: c.color,
      icon: c.icon
    }));

  const budgets: Budget[] = dbBudgets.map(b => ({
    id: b.id,
    categoryId: b.categoryId,
    amountLimit: parseFloat(b.amountLimit.toString())
  }));

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/30 via-black to-black text-white p-4 md:p-8 font-sans selection:bg-amber-500/30">
      <div className="max-w-3xl mx-auto flex flex-col gap-8 animate-[fadeIn_0.5s_ease-out_forwards]">
        <header className="flex flex-col gap-4">
          <Link href="/" className="text-zinc-400 hover:text-amber-500 flex items-center gap-2 transition-colors w-fit">
            <ArrowLeft size={20} />
            Voltar
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
              Administrar <span className="text-amber-500">Tetos de Gastos</span>
            </h1>
            <p className="text-zinc-400 font-medium">Defina o limite máximo de gastos por área para o mês.</p>
          </div>
        </header>
        
        <BudgetsClient categories={categories} initialBudgets={budgets} />
      </div>
    </div>
  );
}
