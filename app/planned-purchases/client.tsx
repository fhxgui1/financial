"use client";

import React, { useState } from 'react';
import { PlannedPurchase, Category } from '../lib/types';
import { createPlannedPurchaseAction, addPlannedPurchaseItemAction, toggleItemPurchasedAction, deletePlannedPurchaseAction } from './actions';
import { Plus, X, ListTodo, ShoppingCart, Loader2, Check, AlertTriangle, Trash2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { useRouter } from 'next/navigation';

export function PlannedPurchasesClient({ purchases, categories }: { purchases: PlannedPurchase[], categories: Category[] }) {
  const router = useRouter();
  const [isAddingNewGroup, setIsAddingNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMax, setNewGroupMax] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);

  const handleCreateGroup = async () => {
    if (!newGroupName) return;
    setCreatingGroup(true);
    const maxVal = parseFloat(newGroupMax.replace(',', '.')) || 0;
    try {
      await createPlannedPurchaseAction(newGroupName, maxVal);
      setNewGroupName('');
      setNewGroupMax('');
      setIsAddingNewGroup(false);
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingGroup(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* List Purchases */}
      <div className="flex flex-col gap-6">
        {purchases.map(p => (
          <PurchaseGroup key={p.id} purchase={p} categories={categories} onRefresh={() => router.refresh()} />
        ))}
      </div>

      {!isAddingNewGroup ? (
        <button 
          onClick={() => setIsAddingNewGroup(true)}
          className="glass-panel p-5 rounded-3xl flex items-center justify-center gap-2 text-zinc-400 hover:text-white hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-300 border-dashed border-2 mt-2"
        >
          <Plus size={24} />
          <span className="font-bold text-lg">Criar Novo Grupo de Compras</span>
        </button>
      ) : (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl flex flex-col gap-6 border-emerald-500/40 shadow-[0_0_30px_-5px_rgba(16,185,129,0.2)] mt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2"><Plus className="text-emerald-500"/> Novo Grupo de Compras</h3>
            <button onClick={() => setIsAddingNewGroup(false)} className="text-zinc-500 hover:text-white p-2 bg-zinc-900 rounded-full transition-colors"><X size={20}/></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Nome do Grupo</label>
              <input 
                type="text" 
                value={newGroupName} onChange={e => setNewGroupName(e.target.value)}
                className="bg-black/60 border border-zinc-800 rounded-2xl p-4 text-white font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-zinc-700"
                placeholder="Ex: Reforma da Sala, Supermercado..."
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Valor Máximo a Gastar</label>
              <div className="flex bg-black/60 border border-zinc-800 rounded-2xl px-4 py-4 items-center gap-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">
                <span className="text-zinc-500 font-bold">R$</span>
                <input 
                  type="number" step="0.01"
                  value={newGroupMax} onChange={e => setNewGroupMax(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-white font-bold"
                  placeholder="0,00"
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleCreateGroup}
            disabled={!newGroupName || creatingGroup}
            className="mt-2 bg-emerald-500 text-black font-bold py-4 rounded-2xl hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]"
          >
            {creatingGroup ? <Loader2 className="animate-spin" size={24} /> : <Check size={24} />}
            Salvar Grupo
          </button>
        </div>
      )}
    </div>
  );
}

function PurchaseGroup({ purchase, categories, onRefresh }: { purchase: PlannedPurchase, categories: Category[], onRefresh: () => void }) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemValue, setNewItemValue] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const items = purchase.items || [];
  const totalSpent = items.reduce((acc, i) => acc + i.value, 0);
  const percent = purchase.maxValue > 0 ? Math.min(100, (totalSpent / purchase.maxValue) * 100) : 0;
  const isOverBudget = purchase.maxValue > 0 && totalSpent > purchase.maxValue;

  const handleAddItem = async () => {
    if (!newItemName) return;
    setLoading(true);
    const val = parseFloat(newItemValue.replace(',', '.')) || 0;
    try {
      await addPlannedPurchaseItemAction(purchase.id, newItemName, val, newItemCategory);
      setNewItemName('');
      setNewItemValue('');
      setNewItemCategory(null);
      setIsAddingItem(false);
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const handletoggleItem = async (id: string, current: boolean) => {
    await toggleItemPurchasedAction(id, !current);
    onRefresh();
  }

  const handleDeleteGroup = async () => {
    if(confirm('Tem certeza? Isso apagará todos os itens.')) {
      await deletePlannedPurchaseAction(purchase.id);
      onRefresh();
    }
  }

  return (
    <div className="glass-panel p-0 rounded-3xl overflow-hidden border border-zinc-800/80 shadow-2xl transition-all relative flex flex-col group/card">
      {/* Background glow logic inside the group */}
      {isOverBudget && (
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      )}
      
      {/* Header Info */}
      <div className="p-6 pb-4 border-b border-zinc-800/50 bg-black/40 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex flex-col items-center justify-center border border-emerald-500/20 shadow-inner">
              <ShoppingCart size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{purchase.name}</h2>
              <div className="text-xs text-zinc-500 font-medium mt-0.5">
                Limite: {formatCurrency(purchase.maxValue)}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={cn("text-2xl font-black drop-shadow-sm", isOverBudget ? "text-rose-400" : "text-white")}>
              {formatCurrency(totalSpent)}
            </span>
            {purchase.maxValue > 0 && (
              <span className={cn("text-xs font-bold", isOverBudget ? "text-rose-500" : "text-emerald-500")}>
                {percent.toFixed(0)}% Utilizado
              </span>
            )}
            <button onClick={handleDeleteGroup} className="opacity-0 group-hover/card:opacity-100 transition-opacity mt-1 text-zinc-600 hover:text-rose-500 p-1">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        {purchase.maxValue > 0 && (
           <div className="h-2.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
             <div 
               className={cn("h-full rounded-full transition-all duration-700 ease-out relative", isOverBudget ? "bg-rose-500" : "bg-gradient-to-r from-emerald-600 to-emerald-400")}
               style={{ width: `${percent}%` }}
             >
                <div className="absolute inset-0 bg-white/10" />
             </div>
           </div>
        )}
      </div>

      {/* Items List */}
      <div className="flex flex-col p-2">
        {items.length === 0 && (
          <div className="text-zinc-500 text-sm text-center py-6 border-b border-zinc-800 border-dashed mx-4 mb-2">Nenhum item adicionado à lista.</div>
        )}
        {items.map(item => {
          const cat = categories.find(c => c.id === item.categoryId);
          const IconComp = cat ? ((Icons as any)[cat.icon] || Icons.Circle) : Icons.Circle;

          return (
            <div key={item.id} className="flex items-center justify-between p-4 bg-transparent hover:bg-white/5 mx-2 rounded-2xl transition-colors group">
              <div className="flex items-center gap-4 flex-1">
                <button 
                  onClick={() => handletoggleItem(item.id, item.purchased)}
                  className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center transition-all border shrink-0 shadow-inner",
                    item.purchased 
                      ? "bg-emerald-500 border-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]" 
                      : "bg-zinc-900 border-zinc-700 hover:border-emerald-500/50"
                  )}
                >
                  {item.purchased && <Check size={14} className="stroke-[3]" />}
                </button>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className={cn("font-medium truncate transition-colors", item.purchased ? "text-zinc-500 line-through" : "text-zinc-200")}>
                    {item.name}
                  </span>
                  {cat && (
                    <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <div className={cn("w-4 h-4 rounded flex items-center justify-center", cat.color || 'bg-zinc-700')}>
                        <IconComp size={10} className="text-white" />
                      </div>
                      {cat.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="font-bold tabular-nums text-right shrink-0">
                <span className={cn(item.purchased ? "text-zinc-500" : "text-zinc-300")}>
                  {formatCurrency(item.value)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Item form / Button */}
      <div className="p-4 bg-black/20 mt-auto border-t border-zinc-800/50">
        {!isAddingItem ? (
           <button 
            onClick={() => setIsAddingItem(true)}
            className="w-full py-3 px-4 rounded-xl border border-dashed border-zinc-700 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/5 flex items-center justify-center gap-2 transition-all text-sm font-bold"
           >
             <Plus size={18} /> Adicionar Item
           </button>
        ) : (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 p-3 bg-zinc-900/50 rounded-2xl border border-zinc-800 shadow-inner">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input 
                type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)}
                placeholder="Nome do Item"
                className="bg-black/60 border border-zinc-800 rounded-xl p-3 text-sm text-white font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none w-full"
              />
              <div className="flex bg-black/60 border border-zinc-800 rounded-xl px-3 items-center focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">
                <span className="text-zinc-500 font-bold text-sm">R$</span>
                <input 
                  type="number" step="0.01" value={newItemValue} onChange={e => setNewItemValue(e.target.value)}
                  placeholder="0,00"
                  className="bg-transparent border-none outline-none w-full text-white font-bold text-sm px-2 py-3"
                />
              </div>
            </div>

            <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
              <button 
                  onClick={() => setNewItemCategory(null)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border",
                    newItemCategory === null 
                      ? "bg-zinc-800 border-zinc-600 text-white shadow-inner" 
                      : "bg-black/40 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                  )}
                >
                  Geral
              </button>
              {categories.map(cat => {
                 const IconComp = (Icons as any)[cat.icon] || Icons.Circle;
                 return (
                  <button 
                    key={cat.id}
                    onClick={() => setNewItemCategory(cat.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all border",
                      newItemCategory === cat.id 
                        ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                        : "bg-black/40 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                    )}
                  >
                    <div className={cn("w-4 h-4 rounded flex items-center justify-center", cat.color || "bg-zinc-700")}>
                      <IconComp size={10} className="text-white" />
                    </div>
                    {cat.name}
                  </button>
                 );
              })}
            </div>

            <div className="flex gap-2 mt-1">
              <button onClick={() => setIsAddingItem(false)} className="flex-1 py-3 font-bold text-sm text-zinc-400 bg-black/40 hover:bg-black/60 rounded-xl transition-colors border border-zinc-800">Cancelar</button>
              <button 
                onClick={handleAddItem} disabled={loading || !newItemName}
                className="flex-[2] py-3 font-bold text-sm text-black bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 rounded-xl transition-all shadow-[0_0_15px_-5px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /> Adicionar</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
