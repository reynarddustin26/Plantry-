'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';

export function CartBadgeLink({ transparent = false }: { transparent?: boolean }) {
  const itemCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0),
  );

  return (
    <Link
      href="/cart"
      className={cn(
        'flex min-h-[44px] items-center gap-1.5 rounded-lg px-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-2',
        transparent ? 'text-white hover:text-[var(--mint-light)]' : 'text-foreground hover:text-primary',
      )}
    >
      Cart
      {itemCount > 0 && (
        <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-[var(--amber)] px-1.5 py-0.5 text-xs font-bold text-white">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
