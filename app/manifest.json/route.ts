import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    name: 'Controle Financeiro Premium',
    short_name: 'FC Premium',
    description: 'Seu app de controle financeiro',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#f59e0b',
    icons: [
      {
        src: '/icon-192x192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      },
      {
        src: '/icon-512x512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any maskable'
      },
    ],
  };

  return NextResponse.json(manifest);
}
