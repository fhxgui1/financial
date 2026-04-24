import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('financial_auth_session');
  
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - login (the login page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json (pwa manifest)
     * - icon (pwa icons)
     * - sw.js (service worker)
     */
    '/((?!login|_next/static|_next/image|favicon.ico|manifest.json|icon-*|sw.js).*)',
  ],
};
