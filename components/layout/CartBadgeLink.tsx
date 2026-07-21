'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { Badge } from '@/components/ui/Badge';

export function CartBadgeLink() {
  const itemCount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0),
  );

  return (
    <Link
      href="/cart"
      className="flex min-h-[44px] items-center gap-1 rounded-lg px-1.5 text-foreground hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-2"
    >
      Cart
      {itemCount > 0 && <Badge>{itemCount}</Badge>}
    </Link>
  );
}
