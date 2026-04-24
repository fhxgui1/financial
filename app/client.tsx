"use client";

import React, { useState } from 'react';
import { FinancialProvider, useFinancial } from './lib/store';
import { DesktopDashboard } from './components/desktop-dashboard';
import { QuickAdd } from './components/quick-add';
import { formatCurrency } from './lib/utils';
import { Plus, ArrowDownRight, ArrowUpRight, Wallet, History, Settings2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Category, Transaction, Budget } from './lib/types';
import Link from 'next/link';
import { isSameMonth } from 'date-fns';
import * as Icons from 'lucide-react';

function BudgetOverview() {
  const { transactions, categories, budgets } = useFinancial();
  const now = new Date();

  // Calculate expenses this month by category
  const expensesByCategory = transactions
    .filter(t => t.type === 'EXPENSE' && isSameMonth(t.date, now))
    .reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">Gastos por Categoria (Mês)</h3>
        <Link href="/financial/history" className="text-sm text-zinc-400 hover:text-amber-500 flex items-center gap-1 transition-colors">
          <History size={16} />
          Ver Histórico
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.filter(c => c.type === 'EXPENSE').map(cat => {
          const spent = expensesByCategory[cat.id] || 0;
          const budget = budgets.find(b => b.categoryId === cat.id)?.amountLimit || 0;
          const hasBudget = budget > 0;
          const isOverBudget = hasBudget && spent > budget;
          const percent = hasBudget ? Math.min(100, (spent / budget) * 100) : 0;
          const IconComponent = (Icons as any)[cat.icon] || Icons.Circle;

          return (
            <div key={cat.id} className="glass group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-amber-500/20 rounded-2xl p-5 flex flex-col gap-3">
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", cat.color || 'bg-zinc-700')}>
                    <IconComponent size={20} className="text-white" />
                  </div>
                  <span className="font-bold text-white tracking-tight">{cat.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-white block">{formatCurrency(spent)}</span>
                  {hasBudget ? (
                    <span className="text-xs text-zinc-500 font-medium">Teto: {formatCurrency(budget)}</span>
                  ) : (
                    <span className="text-xs text-zinc-500 font-medium">Sem teto definido</span>
                  )}
                </div>
              </div>

              {hasBudget && (
                <div className="relative z-10">
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className={cn(isOverBudget ? "text-rose-500" : "text-emerald-500 flex items-center gap-1")}>
                      {isOverBudget ? (
                        <><AlertTriangle size={12}/> Acima do teto!</>
                      ) : (
                        <><CheckCircle2 size={12}/> Dentro do teto</>
                      )}
                    </span>
                    <span className="text-zinc-400">{percent.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-500", isOverBudget ? "bg-rose-500" : "bg-emerald-500")}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Progress background glow */}
              {hasBudget && isOverBudget && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FinancialApp() {
  const { summary } = useFinancial();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/30 via-black to-black text-white p-4 md:p-8 font-sans selection:bg-amber-500/30">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-8 pb-32 lg:pb-0">
          
          <header className="flex flex-col gap-4">
            {/* Topbar Nav */}
            <div className="flex items-center justify-end gap-4 text-sm font-medium">
              <Link href="/budgets" className="text-zinc-400 hover:text-amber-500 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-zinc-900 transition-all">
                <Settings2 size={16} /> Tetos de Gastos
              </Link>
              <Link href="/history" className="text-zinc-400 hover:text-amber-500 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-zinc-900 transition-all">
                <History size={16} /> Histórico
              </Link>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    <Wallet className="text-amber-500" size={24} />
                  </div>
                  Controle Financeiro
                </h1>
                <p className="text-zinc-400 text-sm mt-1">Sua vida financeira em um relance</p>
              </div>
              
              <button 
                onClick={() => setIsQuickAddOpen(true)}
                className="hidden lg:flex bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-3 px-6 rounded-2xl items-center gap-2 transition-colors shadow-[0_0_30px_-5px_rgba(245,158,11,0.4)]"
              >
                <Plus size={20} />
                Novo Registro
              </button>
            </div>

            {/* Main Balance Card */}
            <div className="glass border border-zinc-800 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden group mt-4">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 transition-opacity group-hover:opacity-75" />
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
                <div className="flex flex-col gap-2">
                  <span className="text-zinc-400 font-medium">Saldo Atual</span>
                  <span className="text-6xl md:text-7xl font-black text-white tracking-tighter drop-shadow-md">
                    {formatCurrency(summary.currentBalance)}
                  </span>
                </div>

                <div className="flex gap-4 md:gap-8">
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Disponível</span>
                    <span className="text-lg font-bold text-emerald-400">{formatCurrency(summary.availableBalance)}</span>
                  </div>
                  <div className="w-px bg-zinc-800" />
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Comprometido</span>
                    <span className="text-lg font-bold text-rose-400">{formatCurrency(summary.committedBalance)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="glass-panel rounded-2xl p-5 flex flex-col gap-1 transition-all hover:bg-zinc-900/60">
                <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1 font-medium">
                  <ArrowUpRight size={16} className="text-emerald-500" />
                  Entrou (Mês)
                </div>
                <span className="text-xl font-bold text-white">{formatCurrency(summary.incomeThisMonth)}</span>
              </div>
              <div className="glass-panel rounded-2xl p-5 flex flex-col gap-1 transition-all hover:bg-zinc-900/60">
                <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1 font-medium">
                  <ArrowDownRight size={16} className="text-rose-500" />
                  Saiu (Mês)
                </div>
                <span className="text-xl font-bold text-white">{formatCurrency(summary.expenseThisMonth)}</span>
              </div>
              <div className="col-span-2 lg:col-span-1 glass-panel rounded-2xl p-5 flex flex-col gap-1 transition-all hover:bg-zinc-900/60">
                <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1 font-medium">
                  <Wallet size={16} className="text-amber-500" />
                  Saldo Parcial
                </div>
                <span className={cn(
                  "text-xl font-bold",
                  summary.partialBalance >= 0 ? "text-emerald-400" : "text-rose-400"
                )}>
                  {summary.partialBalance > 0 ? '+' : ''}{formatCurrency(summary.partialBalance)}
                </span>
              </div>
            </div>
          </header>

          <div className="mt-4 flex-1">
            <BudgetOverview />
          </div>

        </div>

        {/* Desktop Sidebar component */}
        <DesktopDashboard />
        
      </div>

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/90 to-transparent lg:hidden z-40">
        <button 
          onClick={() => setIsQuickAddOpen(true)}
          className="w-full bg-amber-500 text-zinc-950 font-bold text-lg py-5 rounded-2xl flex items-center justify-center gap-2 shadow-[0_10px_40px_-5px_rgba(245,158,11,0.5)] active:scale-[0.98] transition-transform"
        >
          <Plus size={24} />
          Registrar Rápido
        </button>
      </div>

      <QuickAdd isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
    </div>
  );
}

export function FinancialClient({ initialCategories, initialTransactions, initialBudgets }: { initialCategories: Category[], initialTransactions: Transaction[], initialBudgets: Budget[] }) {
  return (
    <FinancialProvider initialCategories={initialCategories} initialTransactions={initialTransactions} initialBudgets={initialBudgets}>
      <FinancialApp />
    </FinancialProvider>
  );
}
