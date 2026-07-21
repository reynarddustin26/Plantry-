'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { SEED_PRODUCTS } from '@/lib/seed-data';
import { getCartSummary } from '@/lib/cart';
import { formatAud } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const summary = getCartSummary(items, SEED_PRODUCTS);

  if (summary.lineItems.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold">Your cart is empty</h1>
        <p className="text-sm text-muted-foreground">
          Add products from the shop to see them here.
        </p>
        <Link href="/shop">
          <Button>Go to shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold">Your cart</h1>

      <div className="flex flex-col gap-3">
        {summary.lineItems.map(({ product, quantity, lineTotalAud }) => (
          <Card
            key={product.id}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-semibold">{product.name}</p>
              <p className="text-xs text-muted-foreground">
                {product.store} · {formatAud(product.priceAud)} each
              </p>
            </div>
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label={`Decrease quantity of ${product.name}`}
                  onClick={() => setQuantity(product.id, quantity - 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-border text-lg font-semibold hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  −
                </button>
                <span className="w-6 text-center font-semibold">{quantity}</span>
                <button
                  type="button"
                  aria-label={`Increase quantity of ${product.name}`}
                  onClick={() => setQuantity(product.id, quantity + 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-border text-lg font-semibold hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  +
                </button>
              </div>
              <p className="w-16 text-right font-semibold">
                {formatAud(lineTotalAud)}
              </p>
              <button
                type="button"
                aria-label={`Remove ${product.name} from cart`}
                onClick={() => removeItem(product.id)}
                className="flex h-11 w-11 items-center justify-center rounded-lg text-danger hover:bg-danger-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                ✕
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {summary.itemCount} item{summary.itemCount === 1 ? '' : 's'}
          </p>
          <p className="text-xs text-muted-foreground">
            Nutrition totals arrive once product nutrition data is available
            (Phase 6).
          </p>
        </div>
        <p className="text-xl font-bold text-primary">
          {formatAud(summary.totalPriceAud)}
        </p>
      </Card>

      <Link href="/optimiser">
        <Button variant="secondary">Optimise my basket</Button>
      </Link>

      <Link href="/shop" className="text-sm text-muted-foreground hover:text-primary">
        ← Continue shopping
      </Link>
    </div>
  );
}
