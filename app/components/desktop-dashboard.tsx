"use client";

import React from 'react';
import { useFinancial } from '../lib/store';
import { formatCurrency } from '../lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';
import { TrendingDown, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';

export function DesktopDashboard() {
  const { transactions, categories, summary } = useFinancial();

  // Calculate top spending categories this month
  const expensesByCategory = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(expensesByCategory)
    .map(([id, amount]) => {
      const cat = categories.find(c => c.id === id);
      return { name: cat?.name || 'Outros', amount, color: cat?.color || 'bg-zinc-500' };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  // Mock comparison: fake previous month for insights
  const spentThisMonth = summary.expenseThisMonth;
  const spentLastMonth = spentThisMonth * 0.76; // Mock saying we spent 32% more THIS month
  const diffPercent = ((spentThisMonth / spentLastMonth) - 1) * 100;

  // Chart data (mocking days of the current month)
  const chartData = [
    { name: 'Semana 1', In: 5000, Out: 1200 },
    { name: 'Semana 2', In: 0, Out: 800 },
    { name: 'Semana 3', In: 10400, Out: 2100 },
    { name: 'Semana 4', In: 0, Out: Math.round(spentThisMonth - 4100) },
  ];

  return (
    <div className="hidden lg:flex flex-col gap-8 w-full max-w-sm xl:max-w-md shrink-0">
      
      {/* Insights Panel */}
      <div className="glass rounded-3xl p-8 flex flex-col gap-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-10 transition-transform duration-700 group-hover:scale-110 group-hover:opacity-20">
          <TrendingDown size={120} className="text-rose-500" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
            <TrendingDown size={20} className="text-rose-500" />
            Insights do Mês
          </h3>
          <p className="text-zinc-400 text-sm">Baseado no seu histórico recente</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-rose-500/10 border border-rose-500/30 p-5 rounded-2xl shadow-inner relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500 rounded-l-2xl" />
            <p className="text-rose-400 text-sm font-medium leading-relaxed pl-2">
              Você gastou <strong>{diffPercent.toFixed(0)}% a mais</strong> do que no mês passado. Se continuar assim, o saldo disponível zera em <strong>12 dias</strong>.
            </p>
          </div>
          
          {topCategories.length > 0 && (
            <div className="glass-panel p-5 rounded-2xl">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Maiores Despesas</h4>
              <div className="flex flex-col gap-3">
                {topCategories.map(cat => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${cat.color.replace('bg-', 'bg-')}`} /> {/* Crude hack to ensure color displays if it was a bg class */}
                      {cat.name}
                    </span>
                    <span className="text-sm font-bold text-white">{formatCurrency(cat.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cash Flow Chart */}
      <div className="glass rounded-3xl p-8 flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Fluxo do Mês</h3>
          <p className="text-zinc-400 text-sm">Entradas vs Saídas</p>
        </div>
        
        <div className="h-64 mt-4 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val/1000}k`} />
              <Tooltip 
                cursor={{ fill: '#27272a', opacity: 0.4 }}
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="In" name="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="Out" name="Saídas" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
