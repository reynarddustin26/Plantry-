import Link from 'next/link';
import type { Recipe } from '@/lib/types';
import { formatAud } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface RecipeCardProps {
  recipe: Recipe;
  matchSummary: { matched: number; total: number };
}

function labelize(value: string): string {
  return value.replace(/_/g, ' ');
}

export function RecipeCard({ recipe, matchSummary }: RecipeCardProps) {
  const allMatched = matchSummary.total > 0 && matchSummary.matched === matchSummary.total;

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{recipe.title}</p>
          <p className="text-xs text-muted-foreground">
            {recipe.totalMinutes} min · {recipe.servings} servings
          </p>
        </div>
        <Badge>{labelize(recipe.course)}</Badge>
      </div>

      <p className="text-lg font-bold text-primary">
        {formatAud(recipe.costPerServingAud)}/serving
      </p>

      <p className={allMatched ? 'text-xs font-semibold text-primary' : 'text-xs text-muted-foreground'}>
        {matchSummary.matched}/{matchSummary.total} ingredients in your cart
      </p>

      <div className="flex flex-wrap gap-1">
        {recipe.tags.map((tag) => (
          <Badge key={tag}>{labelize(tag)}</Badge>
        ))}
      </div>

      <Link
        href={`/cookbook/recipes/${recipe.id}`}
        className="flex min-h-[44px] items-center justify-center rounded-lg border border-border text-sm font-semibold text-primary hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        View recipe
      </Link>
    </Card>
  );
}
