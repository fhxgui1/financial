import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Controle Financeiro',
  description: 'Seu app de controle financeiro premium',
  applicationName: 'Controle Financeiro',
  manifest: '/manifest.json', // Overrides global manifest
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Controle Financeiro',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#f59e0b', // amber-500
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { PWARegistration } from './components/pwa-registration';

export default function FinancialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} min-h-screen bg-black text-foreground antialiased`}>
        <PWARegistration />
        {children}
      </body>
    </html>
  );
}
