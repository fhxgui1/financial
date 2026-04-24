"use client";

import React, { useState } from 'react';
import { Category, Budget } from '../lib/types';
import { upsertBudgetAction } from '../actions';
import { Check, Loader2 } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

export function BudgetsClient({ categories, initialBudgets }: { categories: Category[], initialBudgets: Budget[] }) {
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);

  const handleSave = async (categoryId: string, amount: number) => {
    setLoadingCategory(categoryId);
    try {
      await upsertBudgetAction(categoryId, amount);
      setBudgets(prev => {
        const existing = prev.find(b => b.categoryId === categoryId);
        if (existing) {
          return prev.map(b => b.categoryId === categoryId ? { ...b, amountLimit: amount } : b);
        } else {
          return [...prev, { id: 'optimistic', categoryId, amountLimit: amount }];
        }
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCategory(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {categories.map(cat => {
        const budget = budgets.find(b => b.categoryId === cat.id);
        return <BudgetRow key={cat.id} category={cat} current={budget?.amountLimit || 0} onSave={handleSave} saving={loadingCategory === cat.id} />;
      })}
    </div>
  );
}

function BudgetRow({ category, current, onSave, saving }: { category: Category, current: number, onSave: (id: string, val: number) => void, saving: boolean }) {
  const [valueStr, setValueStr] = useState(current > 0 ? current.toString() : '');
  const IconComponent = (Icons as any)[category.icon] || Icons.Circle;

  return (
    <div className="glass-panel p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:border-white/10 group">
      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner", category.color || 'bg-zinc-700')}>
          <IconComponent size={26} className="text-white drop-shadow-sm" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-white text-xl translate-y-0.5">{category.name}</p>
          <p className="text-sm text-zinc-500 mt-1">Teto Atual: <span className="text-zinc-300 font-bold">{formatCurrency(current)}</span></p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
        <div className="flex bg-black/40 border border-zinc-800/80 rounded-2xl px-5 py-4 flex-1 md:w-56 items-center gap-2 focus-within:border-amber-500/50 focus-within:ring-2 focus-within:ring-amber-500/10 transition-all shadow-inner relative overflow-hidden">
          <span className="text-zinc-500 font-bold">R$</span>
          <input 
            type="number" 
            step="0.01"
            placeholder="0,00"
            value={valueStr}
            onChange={e => setValueStr(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-white font-black text-lg"
          />
        </div>
        <button 
          onClick={() => {
            const val = parseFloat(valueStr.replace(',', '.'));
            if (!isNaN(val)) onSave(category.id, val);
          }}
          disabled={saving}
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 h-[56px] px-6 rounded-2xl font-bold transition-all flex items-center justify-center min-w-[120px] shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.6)] active:scale-95"
        >
          {saving ? <Loader2 className="animate-spin" size={22} /> : <span className="flex items-center gap-2"><Check size={20} /> Salvar</span>}
        </button>
      </div>
    </div>
  );
}
