'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProductCard } from '@/components/common/ProductCard';
import { Button } from '@/components/ui/Button';
import { SEED_PRODUCTS, CATEGORIES } from '@/lib/seed-data';
import { filterProducts } from '@/lib/search';
import { calculateUnitPrice, formatUnitPrice } from '@/lib/nutrition';
import { hasAllergenConflict } from '@/lib/allergens';
import { ANONYMOUS_SCORING_PROFILE, findBestValueId, getRecommendationReason, rankByPersonalScore } from '@/lib/scoring';
import { useCartStore } from '@/store/cartStore';
import { useProfile } from '@/lib/hooks/useProfile';
import type { Store } from '@/lib/types';

const STORES: Store[] = ['Coles', 'Woolworths', 'IGA', 'ALDI'];
const MAX_COMPARE = 3;

export default function ShopPage() {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const { profile } = useProfile();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [store, setStore] = useState<Store | undefined>();
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const filtered = useMemo(
    () => filterProducts(SEED_PRODUCTS, { query, category, store }),
    [query, category, store],
  );

  // Signed-in users get a real personalization signal (unit price + store
  // preference, per lib/scoring.ts — never fabricated nutrition scoring,
  // see that file's comment on why). Signed-out users see price order,
  // which is at least a real, understandable default rather than CSV order.
  const results = useMemo(() => {
    if (profile) return rankByPersonalScore(filtered, profile);
    return [...filtered].sort((a, b) => a.priceAud - b.priceAud);
  }, [filtered, profile]);

  const bestValueId = useMemo(
    () => findBestValueId(results, profile ?? ANONYMOUS_SCORING_PROFILE),
    [results, profile],
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
      <div
        className="full-bleed flex min-h-[200px] flex-col justify-end pb-6"
        style={{ background: 'radial-gradient(circle at 30% 20%, var(--forest), var(--forest-deep) 70%)' }}
      >
        {/* Background stays full-bleed (100vw); this inner wrapper matches
            main's own max-width + padding exactly so the title lines up
            with the filter bar and product grid below it, instead of
            sitting flush against the true viewport edge. */}
        <div className="mx-auto w-full max-w-2xl px-4 lg:max-w-5xl lg:px-8 xl:max-w-7xl">
          <h1 className="text-2xl font-extrabold text-white lg:text-3xl">Shop</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--mint-light)' }}>
            {results.length} of {SEED_PRODUCTS.length} products
          </p>
        </div>
      </div>

      {profile && (
        <p
          className="rounded-lg px-3 py-2 text-sm font-semibold"
          style={{ background: 'var(--surface-light)', color: 'var(--forest)' }}
        >
          {profile.displayName
            ? `Showing results for ${profile.displayName}'s goals`
            : 'Sorted for your goals — best value in your preferred stores first.'}
        </p>
      )}

      <div className="sticky top-[68px] z-30 -mx-4 flex flex-col gap-3 bg-card px-4 pb-3 pt-3 lg:-mx-8 lg:px-8">
        <label className="flex items-center gap-2">
          <span className="sr-only">Search products</span>
          <input
            type="search"
            placeholder="Search products…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[44px] flex-1 rounded-lg border border-border bg-background px-3 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
          />
          <span
            className="flex min-h-[44px] shrink-0 items-center rounded-full px-3 text-sm font-bold text-white"
            style={{ background: 'var(--amber)' }}
          >
            {results.length}
          </span>
        </label>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory(undefined)}
            className={`min-h-[44px] rounded-full border-2 px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
              !category
                ? 'border-[var(--emerald)] bg-[var(--emerald)] text-white'
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
                  ? 'border-[var(--emerald)] bg-[var(--emerald)] text-white'
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
                ? 'border-[var(--emerald)] bg-[var(--emerald)] text-white'
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
                  ? 'border-[var(--emerald)] bg-[var(--emerald)] text-white'
                  : 'border-border bg-card text-foreground hover:border-primary/50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4">
        {results.map((product) => {
          const isBestValue = product.id === bestValueId;
          const scoringProfile = profile ?? ANONYMOUS_SCORING_PROFILE;
          const conflict = hasAllergenConflict(product, scoringProfile.allergies);
          return (
          <ProductCard
            key={product.id}
            product={product}
            unitPriceLabel={formatUnitPrice(calculateUnitPrice(product))}
            reason={getRecommendationReason(product, scoringProfile, { isBestValue })}
            reasonTone={conflict ? 'excluded' : 'positive'}
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
                    className="px-3 py-1 text-xs hover:scale-[1.02]"
                    onClick={() => addItem(product.id)}
                  >
                    Add
                  </Button>
                </div>
              </div>
            }
          />
          );
        })}
        {results.length === 0 && (
          <p className="col-span-full text-center text-sm text-muted-foreground">
            Try a different search.
          </p>
        )}
      </div>

      {compareIds.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card p-4">
          <div className="mx-auto flex max-w-2xl items-center justify-between lg:max-w-5xl xl:max-w-7xl">
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
