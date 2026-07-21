import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRecipeById } from '@/lib/recipes-data';
import { formatAud } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AllergyWarning } from '@/components/common/AllergyWarning';
import { RecipeIngredientList } from '@/components/common/RecipeIngredientList';

function labelize(value: string): string {
  return value.replace(/_/g, ' ');
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = getRecipeById(id);

  if (!recipe) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/cookbook"
        className="w-fit text-sm text-muted-foreground hover:text-primary"
      >
        ← Back to cookbook
      </Link>

      <Card className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-xl font-extrabold">{recipe.title}</h1>
            <p className="text-sm text-muted-foreground">
              {recipe.totalMinutes} min · {recipe.servings} servings ·{' '}
              {formatAud(recipe.costPerServingAud)}/serving
            </p>
          </div>
          <Badge>{labelize(recipe.course)}</Badge>
        </div>

        <div className="flex flex-wrap gap-1">
          {recipe.tags.map((tag) => (
            <Badge key={tag}>{labelize(tag)}</Badge>
          ))}
          {recipe.method.map((m) => (
            <Badge key={m}>{labelize(m)}</Badge>
          ))}
        </div>

        <AllergyWarning allergens={recipe.allergens} />

        <p className="text-xs text-muted-foreground">
          Nutrition data not yet available for this recipe — real per-serving
          nutrition lands in a later phase.
        </p>
      </Card>

      <div>
        <h2 className="mb-2 text-sm font-semibold">Ingredients</h2>
        <RecipeIngredientList recipe={recipe} />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold">Instructions</h2>
        <ol className="flex flex-col gap-2 text-sm">
          {recipe.instructions.map((step, i) => (
            <li key={i} className="flex gap-2">
              <span className="font-semibold text-primary">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {recipe.substitutions && recipe.substitutions.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold">Substitutions</h2>
          <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
            {recipe.substitutions.map((sub) => (
              <li key={sub.originalIngredient}>
                {sub.originalIngredient} → {sub.substitute}
                {sub.reason ? ` (${sub.reason})` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      {recipe.storageNotes && (
        <p className="text-xs text-muted-foreground">Storage: {recipe.storageNotes}</p>
      )}
    </div>
  );
}
