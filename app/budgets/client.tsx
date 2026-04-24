"use client";

import React, { useState } from 'react';
import { Category, Budget } from '../lib/types';
import { upsertBudgetAction, createExpenseCategoryAndBudgetAction } from '../actions';
import { Check, Loader2, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '../lib/utils';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

export function BudgetsClient({ categories, initialBudgets }: { categories: Category[], initialBudgets: Budget[] }) {
  const router = useRouter();
  const [budgets, setBudgets] = useState<Budget[]>(initialBudgets);
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('ShoppingCart');
  const [newColor, setNewColor] = useState('bg-blue-500');
  const [newAmount, setNewAmount] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreateNew = async () => {
    if (!newName) return;
    setCreating(true);
    const amountVal = parseFloat(newAmount.replace(',', '.')) || 0;
    try {
      await createExpenseCategoryAndBudgetAction(newName, newIcon, newColor, amountVal);
      setNewName('');
      setNewAmount('');
      setIsAddingNew(false);
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

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

      {!isAddingNew ? (
        <button 
          onClick={() => setIsAddingNew(true)}
          className="glass-panel p-5 rounded-3xl flex items-center justify-center gap-2 text-zinc-400 hover:text-white hover:border-amber-500/30 hover:bg-amber-500/5 transition-all duration-300 border-dashed border-2 mt-2"
        >
          <Plus size={24} />
          <span className="font-bold text-lg">Criar Nova Categoria / Teto</span>
        </button>
      ) : (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col gap-6 border-amber-500/40 shadow-[0_0_30px_-5px_rgba(245,158,11,0.2)] mt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Plus className="text-amber-500"/> Adicionar Nova Categoria</h3>
            <button onClick={() => setIsAddingNew(false)} className="text-zinc-500 hover:text-white p-2 bg-zinc-900 rounded-full transition-colors"><X size={20}/></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Nome da categoria</label>
              <input 
                type="text" 
                value={newName} onChange={e => setNewName(e.target.value)}
                className="bg-black/60 border border-zinc-800 rounded-2xl p-4 text-white font-medium focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all placeholder:text-zinc-700"
                placeholder="Ex: Lazer, Viagens..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Teto inicial (opcional)</label>
              <div className="flex bg-black/60 border border-zinc-800 rounded-2xl px-4 py-4 items-center gap-2 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500/50 transition-all">
                <span className="text-zinc-500 font-bold">R$</span>
                <input 
                  type="number" step="0.01"
                  value={newAmount} onChange={e => setNewAmount(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-white font-bold"
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 mt-2">
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Ícone</label>
              <div className="flex flex-wrap gap-2">
                {['ShoppingCart', 'Utensils', 'Car', 'Home', 'Coffee', 'Briefcase', 'Gift', 'Zap', 'Heart', 'Smile', 'Plane', 'Smartphone', 'Gamepad2', 'Cpu'].map(ic => {
                  const IconComp = (Icons as any)[ic] || Icons.Circle;
                  return (
                    <button 
                      key={ic} type="button" onClick={() => setNewIcon(ic)}
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                        newIcon === ic 
                          ? "bg-amber-500/20 text-amber-500 border border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
                          : "bg-black/60 text-zinc-400 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900"
                      )}
                    >
                      <IconComp size={20} />
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Cor de Destaque</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { val: 'bg-rose-500', label: 'Rosa' },
                  { val: 'bg-blue-500', label: 'Azul' },
                  { val: 'bg-emerald-500', label: 'Esmeralda' },
                  { val: 'bg-amber-500', label: 'Âmbar' },
                  { val: 'bg-purple-500', label: 'Roxo' },
                  { val: 'bg-orange-500', label: 'Laranja' },
                  { val: 'bg-cyan-500', label: 'Ciano' },
                  { val: 'bg-zinc-500', label: 'Cinza' }
                ].map(c => (
                  <button 
                    key={c.val} type="button" onClick={() => setNewColor(c.val)}
                    title={c.label}
                    className={cn(
                      "w-10 h-10 rounded-full transition-all flex items-center justify-center shadow-inner",
                      c.val,
                      newColor === c.val ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-950 scale-110" : "opacity-80 hover:opacity-100 hover:scale-105"
                    )}
                  >
                    {newColor === c.val && <Check size={16} className="text-white drop-shadow-md" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={handleCreateNew}
            disabled={!newName || creating}
            className="mt-2 bg-amber-500 text-black font-bold py-4 rounded-2xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)]"
          >
            {creating ? <Loader2 className="animate-spin" size={24} /> : <Check size={24} />}
            Salvar Nova Categoria
          </button>
        </div>
      )}
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

