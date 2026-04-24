"use client";

import React, { useState } from 'react';
import { loginAction, registerAction } from '../auth.actions';
import { Loader2, Wallet, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoginClient() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const action = isLogin ? loginAction : registerAction;
    
    try {
      const result = await action(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
      // If success, action redirects
    } catch (e) {
      setError('Ocorreu um erro.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto glass rounded-3xl p-8 flex flex-col gap-6 relative overflow-hidden animate-[fadeIn_0.5s_ease-out_forwards]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
      
      <div className="flex flex-col items-center text-center gap-4 relative z-10 mb-2">
        <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 shadow-[0_0_25px_rgba(245,158,11,0.3)]">
          <Wallet className="text-amber-500" size={32} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">{isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}</h1>
          <p className="text-zinc-400 text-sm mt-1">Seu controle financeiro premium</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-sm font-medium text-center">
            {error}
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Usuário</label>
          <input 
            type="text" 
            name="username" 
            required 
            className="bg-black/60 border border-zinc-800 rounded-2xl p-4 text-white font-medium focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all"
            placeholder="Seu nome de usuário"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Senha</label>
          <input 
            type="password" 
            name="password" 
            required 
            className="bg-black/60 border border-zinc-800 rounded-2xl p-4 text-white font-medium focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="mt-4 bg-amber-500 text-black font-bold py-4 rounded-2xl hover:bg-amber-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] shadow-[0_0_20px_-5px_rgba(245,158,11,0.4)]"
        >
          {loading ? <Loader2 className="animate-spin" size={24} /> : (
            <React.Fragment>
              {isLogin ? 'Entrar' : 'Cadastrar'}
              <ArrowRight size={20} />
            </React.Fragment>
          )}
        </button>
      </form>

      <div className="relative z-10 text-center mt-2">
        <button 
          onClick={() => { setIsLogin(!isLogin); setError(''); }} 
          className="text-sm font-medium text-zinc-400 hover:text-amber-500 transition-colors"
        >
          {isLogin ? 'Não tem uma conta? Crie aqui' : 'Já tem conta? Clique para entrar'}
        </button>
      </div>
    </div>
  );
}
