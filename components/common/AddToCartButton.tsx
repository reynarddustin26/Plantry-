'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cartStore';

export function AddToCartButton({ productId }: { productId: string }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 2000);
    return () => clearTimeout(timer);
  }, [added]);

  return (
    <Button
      onClick={() => {
        addItem(productId);
        setAdded(true);
      }}
    >
      {added ? 'Added ✓' : 'Add to cart'}
    </Button>
  );
}
