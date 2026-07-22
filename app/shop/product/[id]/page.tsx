import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/seed-data';
import { createClient } from '@/lib/supabase/server';
import { fetchNutritionByName } from '@/lib/supabase/nutrition';
import { formatAud } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AllergyWarning } from '@/components/common/AllergyWarning';
import { AddToCartButton } from '@/components/common/AddToCartButton';
import { ProductRecommendationInfo } from '@/components/common/ProductRecommendationInfo';
import { ProductAiPanel } from '@/components/common/ProductAiPanel';
import { NutritionPanel } from '@/components/common/NutritionPanel';
import { ProductImagePlaceholder } from '@/components/common/ProductImagePlaceholder';
import type { NutritionPer100g } from '@/lib/types';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) {
    notFound();
  }

  let nutrition: NutritionPer100g | null = null;
  const supabase = await createClient();
  if (supabase) {
    nutrition = await fetchNutritionByName(supabase, product.name);
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/shop"
        className="w-fit text-sm text-muted-foreground hover:text-primary"
      >
        ← Back to shop
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="flex flex-col gap-3 lg:col-span-3">
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: 'var(--forest)' }}>
              {product.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {product.store} · {product.packageSize}
            </p>
          </div>

          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold" style={{ color: 'var(--emerald)' }}>
              {formatAud(product.priceAud)}
            </p>
            <ProductRecommendationInfo product={product} />
          </div>

          <AllergyWarning allergens={product.allergens} />

          <NutritionPanel nutrition={nutrition} />

          <AddToCartButton productId={product.id} className="w-full" />
        </Card>

        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card className="flex flex-col gap-3">
            <ProductImagePlaceholder name={product.name} />
            <Badge className="w-fit">{product.category}</Badge>
          </Card>

          <ProductAiPanel product={product} />
        </div>
      </div>
    </div>
  );
}
