import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { rankByPersonalScore } from '@/lib/scoring';
import { SEED_PRODUCTS, DEMO_PROFILE } from '@/lib/seed-data';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/common/ProductCard';
import { DashboardCartInsights } from '@/components/dashboard/DashboardCartInsights';
import type { DemoProfile } from '@/lib/types';

export default async function DashboardPage() {
  const supabase = await createClient();
  if (!supabase) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold">Accounts unavailable</h1>
        <p className="text-sm text-muted-foreground">
          Supabase isn&apos;t configured in this environment. Use the Demo
          Profile instead — it works fully offline.
        </p>
        <Link href="/demo-profile">
          <Button>Go to Demo Profile</Button>
        </Link>
      </div>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/auth/signin');

  const [profileResult, allergiesResult, profileAllergiesResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('allergies').select('id, name'),
    supabase.from('profile_allergies').select('allergy_id').eq('user_id', user.id),
  ]);

  if (profileResult.error || !profileResult.data) {
    throw new Error(`Failed to load profile: ${profileResult.error?.message ?? 'no profile row found'}`);
  }

  const row = profileResult.data;
  const allergyNameById = new Map((allergiesResult.data ?? []).map((a) => [a.id, a.name]));
  const allergyNames = (profileAllergiesResult.data ?? [])
    .map((pa) => allergyNameById.get(pa.allergy_id))
    .filter((name): name is string => Boolean(name));

  // Real values where the user has set them; DEMO_PROFILE's balanced
  // defaults only as a computation fallback for unset numeric targets — the
  // UI below never claims these fallback numbers ARE the user's setting.
  const displayName = row.display_name ?? user.email ?? 'there';
  const budgetIsSet = row.weekly_budget != null;
  const syntheticProfile: DemoProfile = {
    id: user.id,
    displayName,
    weeklyBudget: row.weekly_budget ?? DEMO_PROFILE.weeklyBudget,
    calorieTarget: row.calorie_target ?? DEMO_PROFILE.calorieTarget,
    proteinTarget: row.protein_target ?? DEMO_PROFILE.proteinTarget,
    carbTarget: row.carb_target ?? DEMO_PROFILE.carbTarget,
    fatTarget: row.fat_target ?? DEMO_PROFILE.fatTarget,
    fibreTarget: row.fibre_target ?? DEMO_PROFILE.fibreTarget,
    maxCookingMinutes: row.max_cooking_minutes ?? DEMO_PROFILE.maxCookingMinutes,
    defaultIntent: (row.default_intent as DemoProfile['defaultIntent']) ?? DEMO_PROFILE.defaultIntent,
    shoppingStrategy: row.shopping_strategy as DemoProfile['shoppingStrategy'],
    allergies: allergyNames,
    preferredStores: (row.preferred_stores as DemoProfile['preferredStores']) ?? [],
  };

  const recommended = rankByPersonalScore(SEED_PRODUCTS, syntheticProfile).slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">Welcome back, {displayName}</h1>
        {!budgetIsSet && (
          <p className="mt-1 text-sm text-muted-foreground">
            You haven&apos;t set a weekly budget yet —{' '}
            <Link href="/profile" className="underline" style={{ color: 'var(--emerald)' }}>
              set one in your profile
            </Link>{' '}
            to see real progress here.
          </p>
        )}
      </div>

      <DashboardCartInsights profile={syntheticProfile} />

      <div>
        <p className="mb-2 font-semibold">Your recommended basket</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recommended.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>

      <Card className="flex flex-wrap gap-3">
        <Link href="/shop">
          <Button>Shop</Button>
        </Link>
        <Link href="/cookbook">
          <Button variant="ghost">Cookbook</Button>
        </Link>
        <Link href="/cart">
          <Button variant="ghost">View cart</Button>
        </Link>
      </Card>
    </div>
  );
}
