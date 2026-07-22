'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { RecipeCard } from '@/components/common/RecipeCard';
import { PlantryMascot } from '@/components/common/PlantryMascot';
import { RECIPES } from '@/lib/recipes-data';
import { filterRecipes, getMatchSummary } from '@/lib/recipeMatching';
import { useCartStore } from '@/store/cartStore';
import { useProfile } from '@/lib/hooks/useProfile';
import type { RecipeCourse, RecipeMethod, RecipeTag } from '@/lib/types';

// Only these 4 dietary preferences have a directly matching recipe tag —
// 'none' intentionally has no entry (no auto-filter to apply).
const DIETARY_TO_RECIPE_TAG: Record<string, RecipeTag> = {
  vegetarian: 'vegetarian',
  vegan: 'vegan',
  keto: 'keto',
  gluten_free: 'gluten_free',
};

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

function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export default function CookbookPage() {
  const cartItems = useCartStore((s) => s.items);
  const cartProductIds = cartItems.map((i) => i.productId);
  const { profile } = useProfile();
  const [query, setQuery] = useState('');
  const [course, setCourse] = useState<RecipeCourse | undefined>();
  // Multi-select, AND logic: a recipe must carry every selected tag/method
  // (e.g. Vegan + Budget only shows recipes tagged with both), not just one
  // of them — this was the reported bug (tags were single-select before,
  // so "combining" two tags just replaced the selection instead of
  // narrowing it).
  const [tags, setTags] = useState<Set<RecipeTag>>(new Set());
  const [methods, setMethods] = useState<Set<RecipeMethod>>(new Set());
  const [canMakeNow, setCanMakeNow] = useState(false);

  // Auto-applies the signed-in user's dietary preference as a tag filter
  // once, on load — a ref (not state) tracks whether that's already
  // happened so it never re-fires and stomps on a filter the user
  // deliberately cleared afterward.
  const appliedDietaryDefault = useRef(false);
  useEffect(() => {
    if (appliedDietaryDefault.current || !profile) return;
    appliedDietaryDefault.current = true;
    const preference = profile.dietaryPreferences[0];
    const matchingTag = preference ? DIETARY_TO_RECIPE_TAG[preference] : undefined;
    if (matchingTag) {
      queueMicrotask(() => setTags((prev) => new Set(prev).add(matchingTag)));
    }
  }, [profile]);

  const goalTags = new Set(profile?.dietaryPreferences.map((p) => DIETARY_TO_RECIPE_TAG[p]).filter(Boolean));

  const results = filterRecipes(RECIPES, {
    query,
    course,
    tags: Array.from(tags),
    methods: Array.from(methods),
    canMakeNow,
    cartProductIds,
  });

  const activeFilterPills: { label: string; onRemove: () => void }[] = [
    ...(course ? [{ label: labelize(course), onRemove: () => setCourse(undefined) }] : []),
    ...Array.from(tags).map((t) => ({
      label: labelize(t),
      onRemove: () => setTags((prev) => toggleInSet(prev, t)),
    })),
    ...Array.from(methods).map((m) => ({
      label: labelize(m),
      onRemove: () => setMethods((prev) => toggleInSet(prev, m)),
    })),
    ...(canMakeNow ? [{ label: 'Can make now', onRemove: () => setCanMakeNow(false) }] : []),
  ];

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

      <CourseTabs course={course} onChange={setCourse} />

      <div className="flex flex-wrap gap-2">
        <FilterChip label="All diets" active={tags.size === 0} onClick={() => setTags(new Set())} />
        {TAGS.map((t) => (
          <FilterChip
            key={t}
            label={labelize(t)}
            active={tags.has(t)}
            onClick={() => setTags((prev) => toggleInSet(prev, t))}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterChip label="All methods" active={methods.size === 0} onClick={() => setMethods(new Set())} />
        {METHODS.map((m) => (
          <FilterChip
            key={m}
            label={labelize(m)}
            active={methods.has(m)}
            onClick={() => setMethods((prev) => toggleInSet(prev, m))}
          />
        ))}
        <FilterChip
          label="Can make now"
          active={canMakeNow}
          onClick={() => setCanMakeNow((prev) => !prev)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {results.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            matchSummary={getMatchSummary(recipe, cartProductIds)}
            matchesGoals={goalTags.size > 0 && recipe.tags.some((t) => goalTags.has(t))}
          />
        ))}
        {results.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-3 py-10 text-center">
            <PlantryMascot className="h-16 w-16" />
            {activeFilterPills.length > 0 ? (
              <>
                <p className="text-sm font-semibold">No recipes match all your filters</p>
                <p className="text-xs text-muted-foreground">Try removing one filter</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {activeFilterPills.map((pill) => (
                    <button
                      key={pill.label}
                      type="button"
                      onClick={pill.onRemove}
                      className="flex min-h-[36px] items-center gap-1.5 rounded-full border-2 border-[var(--emerald)] bg-card px-3 text-xs font-semibold capitalize text-foreground hover:bg-muted"
                    >
                      {pill.label}
                      <span aria-hidden="true">✕</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                {canMakeNow
                  ? 'Add more items to your cart to unlock recipes.'
                  : 'No recipes match your search.'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseTabs({
  course,
  onChange,
}: {
  course: RecipeCourse | undefined;
  onChange: (course: RecipeCourse | undefined) => void;
}) {
  const options: (RecipeCourse | undefined)[] = [undefined, ...COURSES];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((c) => {
        const active = course === c;
        return (
          <button
            key={c ?? 'all'}
            type="button"
            onClick={() => onChange(c === course ? undefined : c)}
            className="relative min-h-[44px] overflow-hidden rounded-full px-4 text-sm font-semibold capitalize transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {active ? (
              <motion.span
                layoutId="course-tab-indicator"
                className="absolute inset-0 rounded-full"
                style={{ background: 'var(--emerald)' }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
              />
            ) : (
              <span className="absolute inset-0 rounded-full border-2 border-border bg-card" />
            )}
            <span className={`relative z-10 ${active ? 'text-white' : 'text-foreground'}`}>
              {c ? labelize(c) : 'All courses'}
            </span>
          </button>
        );
      })}
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
          ? 'border-[var(--emerald)] bg-[var(--emerald)] text-white'
          : 'border-border bg-card text-foreground hover:border-primary/50'
      }`}
    >
      {label}
    </button>
  );
}
