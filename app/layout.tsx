import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CartHydrator } from '@/components/common/CartHydrator';
import { ScrollAnimationProvider } from '@/components/common/ScrollAnimationProvider';
import { AIChat } from '@/components/chat/AIChat';

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
        <ScrollAnimationProvider />
        <Header />
        {/* pt-[72px] compensates for the fixed header (removed from normal
            flow so it can float transparently over the homepage hero) —
            components/landing/Hero.tsx breaks out of this + the px/py
            padding with a matching negative margin so its background still
            reaches the very top/edges of the viewport. */}
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 pt-[96px] lg:max-w-5xl lg:px-8 lg:py-10 lg:pt-[112px] xl:max-w-7xl">
          {children}
        </main>
        <Footer />
        <AIChat />
      </body>
    </html>
  );
}
