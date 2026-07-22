'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CartBadgeLink } from './CartBadgeLink';
import { PlantryMascot } from '@/components/common/PlantryMascot';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/cookbook', label: 'Cookbook' },
  { href: '/demo-profile', label: 'Profile' },
];

const SCROLL_THRESHOLD = 60;

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Only the homepage has a dark hero directly under the nav — everywhere
  // else the header is solid from the start (there's no dark section to
  // float transparently over).
  const isHome = pathname === '/';
  const transparent = isHome && !scrolled;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        transparent
          ? 'border-b border-transparent bg-transparent'
          : 'border-b border-border bg-card shadow-sm',
      )}
    >
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 lg:max-w-5xl lg:px-8 xl:max-w-7xl">
        <Link
          href="/"
          className={cn(
            'flex min-h-[44px] items-center gap-2 rounded-lg text-lg font-extrabold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
            transparent ? 'text-white' : 'text-primary',
          )}
        >
          <PlantryMascot className="h-8 w-8" />
          Plantry
        </Link>
        <nav className="flex items-center gap-0.5 text-sm font-medium sm:gap-3">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex min-h-[44px] items-center rounded-lg border-b-2 px-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-2',
                  active ? 'border-[var(--amber)]' : 'border-transparent',
                  transparent
                    ? 'text-white hover:text-[var(--mint-light)]'
                    : 'text-foreground hover:text-primary',
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <CartBadgeLink transparent={transparent} />
        </nav>
      </div>
    </header>
  );
}
