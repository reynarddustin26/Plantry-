import Link from 'next/link';
import type { Recipe } from '@/lib/types';
import { formatAud } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface RecipeCardProps {
  recipe: Recipe;
  matchSummary: { matched: number; total: number };
  matchesGoals?: boolean;
}

function labelize(value: string): string {
  return value.replace(/_/g, ' ');
}

export function RecipeCard({ recipe, matchSummary, matchesGoals }: RecipeCardProps) {
  const allMatched = matchSummary.total > 0 && matchSummary.matched === matchSummary.total;
  const missingCount = matchSummary.total - matchSummary.matched;

  return (
    <Card className="flex flex-col gap-2 overflow-hidden !p-0">
      {/* No real recipe photography in this app (no image pipeline) — an
          honest gradient placeholder rather than a fabricated stock photo. */}
      <div
        className="flex h-28 items-center justify-center text-3xl"
        style={{ background: 'linear-gradient(135deg, var(--forest), var(--emerald))' }}
      >
        🍽️
      </div>

      <div className="flex flex-col gap-2 p-4 lg:p-6">
        <div className="flex items-start justify-between gap-2">
          <p className="font-bold">{recipe.title}</p>
          <Badge>{labelize(recipe.course)}</Badge>
        </div>

        {matchesGoals && (
          <span
            className="w-fit rounded-full px-2.5 py-1 text-xs font-semibold text-white"
            style={{ background: 'var(--forest)' }}
          >
            Matches your goals
          </span>
        )}

        <p className="text-lg font-bold text-primary">
          {formatAud(recipe.costPerServingAud)}/serving
        </p>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            {recipe.totalMinutes} min
          </span>
          {recipe.tags.includes('high_protein') && (
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              High protein
            </span>
          )}
          {allMatched ? (
            <span
              className="rounded-full px-2.5 py-1 text-xs font-semibold text-white"
              style={{ background: 'var(--emerald)' }}
            >
              Can make now
            </span>
          ) : (
            matchSummary.total > 0 && (
              <span
                className="rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{ background: 'var(--amber)', color: 'var(--text-dark)' }}
              >
                {missingCount} item{missingCount === 1 ? '' : 's'} missing
              </span>
            )
          )}
        </div>

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
      </div>
    </Card>
  );
}
