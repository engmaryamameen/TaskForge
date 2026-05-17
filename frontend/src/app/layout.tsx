import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TaskForge',
  description: 'Multi-tenant project management platform',
  icons: {
    icon: [
      { url: '/brand/taskforge-icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/taskforge-icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/brand/taskforge-app-icon-transparent.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/brand/taskforge-icon-180.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
