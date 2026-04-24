"use client";

import React, { useState } from 'react';
import { useFinancial } from '../lib/store';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { formatCurrency } from '../lib/utils';
import * as Icons from 'lucide-react';

export function TransactionList() {
  const { transactions, categories } = useFinancial();
  const [filterMonth, setFilterMonth] = useState('ALL');
  // simplistic filtering

  const sortedTransactions = [...transactions].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">Transações Recentes</h3>
        {/* Simple filter demo */}
      </div>

      <div className="flex flex-col gap-3">
        {sortedTransactions.map(tx => {
          const category = categories.find(c => c.id === tx.categoryId);
          const IconComponent = category && (Icons as any)[category.icon] ? (Icons as any)[category.icon] : Icons.Circle;

          return (
            <div key={tx.id} className="flex items-center gap-4 bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-2xl hover:bg-zinc-800/40 transition-colors">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0", category?.color || 'bg-zinc-700')}>
                <IconComponent size={20} className="text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{tx.description || category?.name}</p>
                <p className="text-xs text-zinc-500 font-medium">{format(tx.date, "dd 'de' MMM", { locale: ptBR })} • {category?.name}</p>
              </div>

              <div className="text-right">
                <p className={cn("font-bold", tx.type === 'INCOME' ? 'text-emerald-500' : 'text-white')}>
                  {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                </p>
                {tx.date > new Date() && (
                  <p className="text-[10px] uppercase font-bold text-amber-500">Agendado</p>
                )}
              </div>
            </div>
          );
        })}

        {sortedTransactions.length === 0 && (
          <div className="py-12 text-center text-zinc-500">
            Nenhuma transação encontrada.
          </div>
        )}
      </div>
    </div>
  );
}
