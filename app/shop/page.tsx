'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProductCard } from '@/components/common/ProductCard';
import { Button } from '@/components/ui/Button';
import { SEED_PRODUCTS, CATEGORIES } from '@/lib/seed-data';
import { filterProducts } from '@/lib/search';
import { useCartStore } from '@/store/cartStore';
import type { Store } from '@/lib/types';

const STORES: Store[] = ['Coles', 'Woolworths', 'IGA'];
const MAX_COMPARE = 3;

export default function ShopPage() {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [store, setStore] = useState<Store | undefined>();
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const results = useMemo(
    () => filterProducts(SEED_PRODUCTS, { query, category, store }),
    [query, category, store],
  );

  function toggleCompare(id: string) {
    setCompareIds((prev) =>
      prev.includes(id)
        ? prev.filter((c) => c !== id)
        : prev.length < MAX_COMPARE
          ? [...prev, id]
          : prev,
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div>
        <h1 className="text-2xl font-extrabold">Shop</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {results.length} of {SEED_PRODUCTS.length} products
        </p>
      </div>

      <label className="flex flex-col gap-1">
        <span className="sr-only">Search products</span>
        <input
          type="search"
          placeholder="Search products…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-[44px] rounded-lg border border-border bg-card px-3 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory(undefined)}
          className={`min-h-[44px] rounded-full border-2 px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
            !category
              ? 'border-primary bg-muted text-foreground'
              : 'border-border bg-card text-foreground hover:border-primary/50'
          }`}
        >
          All categories
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c === category ? undefined : c)}
            className={`min-h-[44px] rounded-full border-2 px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              category === c
                ? 'border-primary bg-muted text-foreground'
                : 'border-border bg-card text-foreground hover:border-primary/50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setStore(undefined)}
          className={`min-h-[44px] rounded-full border-2 px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
            !store
              ? 'border-primary bg-muted text-foreground'
              : 'border-border bg-card text-foreground hover:border-primary/50'
          }`}
        >
          All stores
        </button>
        {STORES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStore(s === store ? undefined : s)}
            className={`min-h-[44px] rounded-full border-2 px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              store === s
                ? 'border-primary bg-muted text-foreground'
                : 'border-border bg-card text-foreground hover:border-primary/50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {results.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            actions={
              <div className="flex items-center justify-between gap-2 pt-1">
                <label className="flex min-h-[44px] items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={compareIds.includes(product.id)}
                    onChange={() => toggleCompare(product.id)}
                    disabled={
                      !compareIds.includes(product.id) &&
                      compareIds.length >= MAX_COMPARE
                    }
                    className="h-5 w-5"
                  />
                  Compare
                </label>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/shop/product/${product.id}`}
                    className="flex min-h-[44px] items-center rounded-lg px-2 text-sm font-semibold text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    Details
                  </Link>
                  <Button
                    variant="secondary"
                    className="px-3 py-1 text-xs"
                    onClick={() => addItem(product.id)}
                  >
                    Add
                  </Button>
                </div>
              </div>
            }
          />
        ))}
        {results.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">
            No products match your filters.
          </p>
        )}
      </div>

      {compareIds.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card p-4">
          <div className="mx-auto flex max-w-2xl items-center justify-between">
            <p className="text-sm font-semibold">
              {compareIds.length} selected to compare
            </p>
            <Button
              onClick={() =>
                router.push(`/shop/compare?ids=${compareIds.join(',')}`)
              }
            >
              Compare
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
