import { cookies } from 'next/headers';
import { neon } from '@neondatabase/serverless';

const COOKIE_NAME = 'financial_auth_session';

export async function getSessionUserId() {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);
  return session?.value || null;
}

export async function setSessionCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days - persistent login
    path: '/',
  });
}

