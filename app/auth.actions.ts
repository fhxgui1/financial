"use server";

import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import { setSessionCookie } from './lib/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function loginAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const sql = neon(process.env.DATABASE_URL!);

  if (!username || !password) {
    return { error: 'Preencha todos os campos.' };
  }

  // Find user
  const users = await sql`SELECT id, password_hash FROM financial_users WHERE username = ${username}`;
  if (users.length === 0) {
    return { error: 'Usuário ou senha incorretos.' };
  }

  const user = users[0];
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return { error: 'Usuário ou senha incorretos.' };
  }

  await setSessionCookie(user.id);
  redirect('/');
}

export async function registerAction(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const sql = neon(process.env.DATABASE_URL!);

  if (!username || !password || password.length < 4) {
    return { error: 'Preencha corretamente (senha mínima de 4 caracteres).' };
  }

  // Check if exists
  const existing = await sql`SELECT id FROM financial_users WHERE username = ${username}`;
  if (existing.length > 0) {
    return { error: 'Usuário já existe.' };
  }

  const hash = await bcrypt.hash(password, 10);
  const result = await sql`
    INSERT INTO financial_users (username, password_hash)
    VALUES (${username}, ${hash})
    RETURNING id
  `;
  const userId = result[0].id;

  // Gracefully assign orphan records to the FIRST user ever registered
  const countUsers = await sql`SELECT COUNT(id) as c FROM financial_users`;
  if (countUsers[0].c == 1) {
    await sql`UPDATE financial_categories SET user_id = ${userId} WHERE user_id IS NULL`;
    await sql`UPDATE financial_transactions SET user_id = ${userId} WHERE user_id IS NULL`;
    await sql`UPDATE financial_budgets SET user_id = ${userId} WHERE user_id IS NULL`;
  }

  await setSessionCookie(userId);
  redirect('/');
}

const COOKIE_NAME = 'financial_auth_session';

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect('/login');
}
