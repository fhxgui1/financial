"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinancial } from '../lib/store';
import { format } from 'date-fns';
import { X, ArrowDownCircle, ArrowUpCircle, Check } from 'lucide-react';
import { TransactionType } from '../lib/types';
import { cn } from '@/lib/utils';
import { createTransactionAction } from '../actions';

export function QuickAdd({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { categories, addTransaction } = useFinancial();
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [amountStr, setAmountStr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [description, setDescription] = useState('');

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setType('EXPENSE');
      setAmountStr('');
      setCategoryId('');
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setDescription('');
    }
  }, [isOpen]);

  const filteredCategories = categories.filter(c => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(amountStr.replace(',', '.'));
    if (!amount || amount <= 0 || !categoryId) return;
    
    const txDate = new Date(date);

    // 1. Optimistic UI Update
    addTransaction({
      amount,
      type,
      categoryId,
      date: txDate,
      description: description.trim() || undefined
    });
    
    onClose();

    // 2. Persist to Database via Server Action
    await createTransactionAction({
      amount,
      type,
      categoryId,
      date: txDate,
      description: description.trim() || undefined
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 mt-24 h-[90vh] flex flex-col rounded-t-[32px] glass-panel p-6 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:h-auto md:w-full md:max-w-lg md:rounded-3xl border border-zinc-800 shadow-2xl"
            style={Number(window.innerWidth) >= 768 ? { y: '-50%', x: '-50%' } : {}}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white tracking-tight">Novo Registro</h2>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1 overflow-y-auto">
              {/* Type selector */}
              <div className="flex gap-3 bg-zinc-900 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => { setType('EXPENSE'); setCategoryId(''); }}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-all",
                    type === 'EXPENSE' ? "bg-rose-500/15 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  <ArrowDownCircle size={18} />
                  Saída
                </button>
                <button
                  type="button"
                  onClick={() => { setType('INCOME'); setCategoryId(''); }}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-all",
                    type === 'INCOME' ? "bg-emerald-500/15 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  <ArrowUpCircle size={18} />
                  Entrada
                </button>
              </div>

              {/* Amount */}
              <div className="flex flex-col items-center justify-center py-6">
                <span className="text-sm font-medium text-zinc-500 mb-2">Valor do registro</span>
                <div className="flex items-center text-5xl md:text-6xl font-bold text-white tracking-tighter">
                  <span className="text-2xl text-zinc-500 mr-2 opacity-50">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    required
                    value={amountStr}
                    onChange={e => setAmountStr(e.target.value)}
                    className="bg-transparent border-none outline-none w-full max-w-[200px] text-center"
                    autoFocus
                  />
                </div>
              </div>

              {/* Category Grid */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-400">Categoria</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {filteredCategories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoryId(cat.id)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all gap-2",
                        categoryId === cat.id 
                          ? "border-amber-500 bg-amber-500/15 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                          : "border-zinc-800 bg-black/40 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800"
                      )}
                    >
                      <span className="text-xs font-medium truncate w-full text-center">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Desc */}
              <div className="flex gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-sm font-medium text-zinc-400">Data</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 text-white p-4 rounded-2xl outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-8 md:mb-0">
                <label className="text-sm font-medium text-zinc-400">Descrição (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Almoço com cliente"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-white p-4 rounded-2xl outline-none focus:border-amber-500 transition-colors placeholder:text-zinc-600"
                />
              </div>

              <div className="mt-auto hidden md:block" />

              <button
                type="submit"
                disabled={!amountStr || !categoryId}
                className="w-full bg-amber-500 text-zinc-950 font-bold text-lg py-5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-400 transition-colors mb-6 md:mb-0 shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)]"
              >
                <Check size={24} />
                Registrar agora
              </button>
            </form>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
}
