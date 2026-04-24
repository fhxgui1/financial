import React from 'react';
import { LoginClient } from './client';
import { getSessionUserId } from '../lib/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const userId = await getSessionUserId();
  if (userId) {
    redirect('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/30 via-black to-black font-sans selection:bg-amber-500/30">
      <LoginClient />
    </div>
  );
}
