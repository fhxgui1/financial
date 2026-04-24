"use client";

import React from 'react';
import { LogOut } from 'lucide-react';
import { logoutAction } from '../auth.actions';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();
  
  return (
    <button 
      onClick={async () => {
        await logoutAction();
        router.refresh();
      }}
      className="text-zinc-400 hover:text-rose-500 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-rose-500/10 transition-all font-medium"
      title="Sair da conta"
    >
      <LogOut size={16} /> <span className="hidden sm:inline">Sair</span>
    </button>
  );
}
