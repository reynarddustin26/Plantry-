import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartHydrator } from '@/components/common/CartHydrator';

export const metadata: Metadata = {
  title: 'Plantry',
  description:
    'Tell Plantry your budget and your goals — it turns groceries into a basket, and a basket into meals.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <CartHydrator />
        <Header />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 lg:max-w-5xl lg:px-8 lg:py-10 xl:max-w-7xl">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
