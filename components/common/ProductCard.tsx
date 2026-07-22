import type { ReactNode } from 'react';
import type { Product } from '@/lib/types';
import { formatAud } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AllergyWarning } from './AllergyWarning';
import { ReasoningSlot } from './ReasoningSlot';

interface ProductCardProps {
  product: Product;
  reason?: string;
  reasonTone?: 'positive' | 'excluded';
  unitPriceLabel?: string;
  // Real, Supabase-ingested value only (see lib/supabase/nutrition.ts) —
  // never shown at all when null/undefined, never coerced to a fabricated
  // "0g protein".
  proteinPer100g?: number | null;
  actions?: ReactNode;
}

export function ProductCard({
  product,
  reason,
  reasonTone,
  unitPriceLabel,
  proteinPer100g,
  actions,
}: ProductCardProps) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{product.name}</p>
          <p className="text-xs text-muted-foreground">
            {product.store} · {product.packageSize}
          </p>
        </div>
        <Badge>{product.category}</Badge>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-lg font-bold text-primary">
          {formatAud(product.priceAud)}
        </p>
        {unitPriceLabel && (
          <p className="text-xs text-muted-foreground">{unitPriceLabel}</p>
        )}
        {proteinPer100g != null && (
          <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
            {proteinPer100g.toFixed(0)}g protein/100g
          </span>
        )}
      </div>
      <AllergyWarning allergens={product.allergens} />
      <ReasoningSlot reason={reason} tone={reasonTone} />
      {actions}
    </Card>
  );
}
