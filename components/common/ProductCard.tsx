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
  actions?: ReactNode;
}

export function ProductCard({ product, reason, actions }: ProductCardProps) {
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
      <p className="text-lg font-bold text-primary">
        {formatAud(product.priceAud)}
      </p>
      <AllergyWarning allergens={product.allergens} />
      <ReasoningSlot reason={reason} />
      {actions}
    </Card>
  );
}
