import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/seed-data';
import { formatAud } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AllergyWarning } from '@/components/common/AllergyWarning';
import { AddToCartButton } from '@/components/common/AddToCartButton';
import { ProductRecommendationInfo } from '@/components/common/ProductRecommendationInfo';
import { ProductAiPanel } from '@/components/common/ProductAiPanel';

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

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/shop"
        className="w-fit text-sm text-muted-foreground hover:text-primary"
      >
        ← Back to shop
      </Link>

      <Card className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-extrabold">{product.name}</h1>
            <p className="text-sm text-muted-foreground">
              {product.store} · {product.packageSize}
            </p>
          </div>
          <Badge>{product.category}</Badge>
        </div>

        <p className="text-2xl font-bold text-primary">
          {formatAud(product.priceAud)}
        </p>

        <AllergyWarning allergens={product.allergens} />
        <ProductRecommendationInfo product={product} />

        {product.nutritionPer100g === null && (
          <p className="text-xs text-muted-foreground">
            Nutrition data not yet available for this product.
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          Sourced: {product.source} · captured {product.capturedAt}
        </p>

        <AddToCartButton productId={product.id} />
      </Card>

      <ProductAiPanel product={product} />
    </div>
  );
}
