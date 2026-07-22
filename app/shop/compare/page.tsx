import Link from 'next/link';
import { getProductById } from '@/lib/seed-data';
import { createClient } from '@/lib/supabase/server';
import { fetchNutritionByNames } from '@/lib/supabase/nutrition';
import { formatAud } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { AllergyWarning } from '@/components/common/AllergyWarning';
import { AddToCartButton } from '@/components/common/AddToCartButton';
import { ProductRecommendationInfo } from '@/components/common/ProductRecommendationInfo';
import { NutritionPanel } from '@/components/common/NutritionPanel';
import { CompareAiVerdict } from '@/components/common/CompareAiVerdict';

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

  const supabase = await createClient();
  const nutritionByName = supabase
    ? await fetchNutritionByNames(
        supabase,
        products.map((p) => p.name),
      )
    : new Map();

  // "More protein is better" is the one nutrient comparison this app can
  // make without asserting a value judgement about the user's goal — see
  // NutritionPanel.tsx's comment. Only meaningful with 2+ real values.
  const proteinValues = products
    .map((p) => nutritionByName.get(p.name)?.protein)
    .filter((v): v is number => v != null);
  const maxProtein = proteinValues.length >= 2 ? Math.max(...proteinValues) : null;

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
              <AllergyWarning allergens={product.allergens} />
              <ProductRecommendationInfo product={product} />
              <NutritionPanel
                nutrition={nutritionByName.get(product.name) ?? null}
                isProteinWinner={maxProtein != null && nutritionByName.get(product.name)?.protein === maxProtein}
              />
              <AddToCartButton productId={product.id} />
            </Card>
          ))}
        </div>
      )}

      {products.length >= 2 && <CompareAiVerdict products={products} />}
    </div>
  );
}
