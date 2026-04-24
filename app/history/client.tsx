"use client";

import React, { useState } from 'react';
import { Category, Transaction } from '../lib/types';
import { formatCurrency } from '../lib/utils';
import { format, isSameMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { deleteTransactionAction } from '../actions';

export function HistoryClient({ categories, transactions }: { categories: Category[], transactions: Transaction[] }) {
  const [filterMonth, setFilterMonth] = useState<string>('ALL'); // 'ALL' or '2023-10'
  const [filterCategory, setFilterCategory] = useState<string>('ALL'); // 'ALL' or categoryId

  // Create month options based on history
  const monthsSet = new Set<string>();
  transactions.forEach(t => {
    monthsSet.add(format(t.date, 'yyyy-MM'));
  });
  const monthOptions = Array.from(monthsSet).sort().reverse();

  const filtered = transactions.filter(t => {
    if (filterCategory !== 'ALL' && t.categoryId !== filterCategory) return false;
    if (filterMonth !== 'ALL' && format(t.date, 'yyyy-MM') !== filterMonth) return false;
    return true;
  });

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja apagar este registro?')) {
      await deleteTransactionAction(id);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/30 via-black to-black text-white p-4 md:p-8 font-sans selection:bg-amber-500/30">
      <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-[fadeIn_0.4s_ease-out_forwards]">
        <header className="flex flex-col gap-4">
          <Link href="/" className="text-zinc-400 hover:text-amber-500 flex items-center gap-2 transition-colors w-fit">
            <ArrowLeft size={20} />
            Voltar ao Dashboard
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">Histórico <span className="text-amber-500">Completo</span></h1>
            <p className="text-zinc-400 font-medium">Filtre e gerencie todos os seus registros financeiros.</p>
          </div>
        </header>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 glass p-6 rounded-3xl z-10 relative">
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-xs font-semibold text-zinc-500 uppercase">Período</label>
            <select 
              value={filterMonth} 
              onChange={e => setFilterMonth(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-white p-3 rounded-xl outline-none focus:border-amber-500"
            >
              <option value="ALL">Todo o período</option>
              {monthOptions.map(m => {
                const date = parseISO(m + '-02'); // force day to avoid timezone shift
                return <option key={m} value={m}>{format(date, "MMMM 'de' yyyy", { locale: ptBR })}</option>
              })}
            </select>
          </div>
          
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-xs font-semibold text-zinc-500 uppercase">Categoria</label>
            <select 
              value={filterCategory} 
              onChange={e => setFilterCategory(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-white p-3 rounded-xl outline-none focus:border-amber-500"
            >
              <option value="ALL">Todas as categorias</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* List */}
        <div className="flex flex-col gap-3 relative z-10">
          {filtered.length === 0 && (
            <div className="py-20 text-center text-zinc-500 glass-panel rounded-3xl">
              Nenhum registro encontrado para estes filtros.
            </div>
          )}

          {filtered.map(tx => {
            const category = categories.find(c => c.id === tx.categoryId);
            const IconComponent = category && (Icons as any)[category.icon] ? (Icons as any)[category.icon] : Icons.Circle;

            return (
              <div key={tx.id} className="group flex items-center gap-4 glass-panel p-4 rounded-2xl hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", category?.color || 'bg-zinc-700')}>
                  <IconComponent size={20} className="text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{tx.description || category?.name}</p>
                  <p className="text-xs text-zinc-500 font-medium">{format(tx.date, "dd 'de' MMM 'de' yyyy", { locale: ptBR })} • {category?.name}</p>
                </div>

                <div className="text-right mr-4">
                  <p className={cn("font-bold", tx.type === 'INCOME' ? 'text-emerald-500' : 'text-white')}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                </div>
                
                <button 
                  onClick={() => handleDelete(tx.id)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
