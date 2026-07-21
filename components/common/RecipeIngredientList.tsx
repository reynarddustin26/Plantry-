'use client';

import type { Recipe } from '@/lib/types';
import { getIngredientMatchStatus, getMissingIngredients } from '@/lib/recipeMatching';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';

export function RecipeIngredientList({ recipe }: { recipe: Recipe }) {
  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const cartProductIds = items.map((i) => i.productId);
  const statuses = getIngredientMatchStatus(recipe, cartProductIds);
  const missing = getMissingIngredients(recipe, cartProductIds);

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-1">
        {statuses.map(({ ingredient, inCart }) => (
          <li key={ingredient.name} className="flex items-center gap-2 text-sm">
            <span aria-hidden="true">{inCart ? '✓' : '○'}</span>
            <span className={inCart ? '' : 'text-muted-foreground'}>
              {ingredient.quantity} {ingredient.unit} {ingredient.name}
            </span>
          </li>
        ))}
      </ul>
      {missing.length > 0 && (
        <Button
          variant="secondary"
          onClick={() => {
            for (const ingredient of missing) {
              if (ingredient.productId) addItem(ingredient.productId);
            }
          }}
        >
          Add {missing.length} missing ingredient{missing.length === 1 ? '' : 's'} to cart
        </Button>
      )}
    </div>
  );
}
