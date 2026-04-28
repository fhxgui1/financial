import React from 'react';
import { getPlannedPurchasesAction } from './actions';
import { getCategoriesAction } from '../actions';
import { PlannedPurchasesClient } from './client';
import { PlannedPurchase, Category } from '../lib/types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function PlannedPurchasesPage() {
  const dbPurchases = await getPlannedPurchasesAction();
  const dbCategories = await getCategoriesAction();

  const categories: Category[] = dbCategories.map(c => ({
    ...c, type: c.type as any
  }));

  const purchases: PlannedPurchase[] = dbPurchases.map((p: any) => ({
    id: p.id,
    userId: p.userId,
    name: p.name,
    maxValue: parseFloat(p.maxValue.toString()),
    createdAt: new Date(p.createdAt),
    items: p.items.map((i: any) => ({
      id: i.id,
      plannedPurchaseId: i.plannedPurchaseId,
      categoryId: i.categoryId,
      name: i.name,
      value: parseFloat(i.value.toString()),
      purchased: i.purchased,
      createdAt: new Date(i.createdAt)
    }))
  }));

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/30 via-black to-black text-white p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-2xl transition-colors border border-zinc-800 hover:border-amber-500/30 group">
              <ArrowLeft className="text-zinc-400 group-hover:text-amber-500 transition-colors" />
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">Compras Planejadas</h1>
              <p className="text-zinc-400 text-sm mt-1">Organize seus grandes objetivos de compra e listas</p>
            </div>
          </div>
        </header>
        
        <PlannedPurchasesClient purchases={purchases} categories={categories} />
      </div>
    </div>
  );
}
