'use client';

import { useState } from 'react';
import { RecipeCard } from '@/components/common/RecipeCard';
import { RECIPES } from '@/lib/recipes-data';
import { filterRecipes, getMatchSummary } from '@/lib/recipeMatching';
import { useCartStore } from '@/store/cartStore';
import type { RecipeCourse, RecipeMethod, RecipeTag } from '@/lib/types';

const COURSES: RecipeCourse[] = ['breakfast', 'main', 'snack', 'dessert', 'drink', 'meal_prep'];
const TAGS: RecipeTag[] = [
  'vegan',
  'vegetarian',
  'gluten_free',
  'dairy_free',
  'keto',
  'high_protein',
  'low_calorie',
  'budget',
  'student',
  'family',
  'no_cook',
];
const METHODS: RecipeMethod[] = ['air_fryer', 'bbq', 'one_pot', 'quick'];

function labelize(value: string): string {
  return value.replace(/_/g, ' ');
}

export default function CookbookPage() {
  const cartItems = useCartStore((s) => s.items);
  const cartProductIds = cartItems.map((i) => i.productId);
  const [query, setQuery] = useState('');
  const [course, setCourse] = useState<RecipeCourse | undefined>();
  const [tag, setTag] = useState<RecipeTag | undefined>();
  const [method, setMethod] = useState<RecipeMethod | undefined>();
  const [canMakeNow, setCanMakeNow] = useState(false);

  const results = filterRecipes(RECIPES, {
    query,
    course,
    tag,
    method,
    canMakeNow,
    cartProductIds,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">Cookbook</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {results.length} of {RECIPES.length} recipes
        </p>
      </div>

      <label className="flex flex-col gap-1">
        <span className="sr-only">Search recipes</span>
        <input
          type="search"
          placeholder="Search recipes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-[44px] rounded-lg border border-border bg-card px-3 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <FilterChip label="All courses" active={!course} onClick={() => setCourse(undefined)} />
        {COURSES.map((c) => (
          <FilterChip
            key={c}
            label={labelize(c)}
            active={course === c}
            onClick={() => setCourse(c === course ? undefined : c)}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip label="All diets" active={!tag} onClick={() => setTag(undefined)} />
        {TAGS.map((t) => (
          <FilterChip
            key={t}
            label={labelize(t)}
            active={tag === t}
            onClick={() => setTag(t === tag ? undefined : t)}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip label="All methods" active={!method} onClick={() => setMethod(undefined)} />
        {METHODS.map((m) => (
          <FilterChip
            key={m}
            label={labelize(m)}
            active={method === m}
            onClick={() => setMethod(m === method ? undefined : m)}
          />
        ))}
        <FilterChip
          label="Can make now"
          active={canMakeNow}
          onClick={() => setCanMakeNow((prev) => !prev)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {results.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            matchSummary={getMatchSummary(recipe, cartProductIds)}
          />
        ))}
        {results.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">
            No recipes match your filters.
          </p>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[44px] rounded-full border-2 px-4 text-sm font-semibold capitalize transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
        active
          ? 'border-primary bg-muted text-foreground'
          : 'border-border bg-card text-foreground hover:border-primary/50'
      }`}
    >
      {label}
    </button>
  );
}
