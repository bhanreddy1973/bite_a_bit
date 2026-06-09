import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientProviders } from '@/components/layout/ClientProviders';

/**
 * Root layout — Server Component.
 * - Loads Inter font via next/font/google
 * - Sets metadata (title, description)
 * - Renders html/body with Inter font class
 * - Delegates interactive logic to ClientProviders (client component)
 *
 * Requirements: 1.2, 2.1, 2.6, 12.2, 17.1
 */

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bite a Bit',
  description:
    'Premium food ordering app — browse menus, customize your cart, and place orders with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
