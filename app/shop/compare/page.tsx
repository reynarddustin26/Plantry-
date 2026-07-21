import Link from 'next/link';
import { getProductById } from '@/lib/seed-data';
import { formatAud } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { AllergyWarning } from '@/components/common/AllergyWarning';
import { AddToCartButton } from '@/components/common/AddToCartButton';

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const products = (ids ?? '')
    .split(',')
    .map((id) => getProductById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">Compare</h1>
        <Link
          href="/shop"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          ← Back to shop
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No products selected. Go back to the shop and check up to 3
          products to compare.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col gap-2">
              <p className="font-semibold">{product.name}</p>
              <p className="text-xs text-muted-foreground">
                {product.store} · {product.packageSize} · {product.category}
              </p>
              <p className="text-lg font-bold text-primary">
                {formatAud(product.priceAud)}
              </p>
              <p className="text-xs text-muted-foreground">
                Unit-price comparison and scoring lands in Phase 3.
              </p>
              <AllergyWarning allergens={product.allergens} />
              <AddToCartButton productId={product.id} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
