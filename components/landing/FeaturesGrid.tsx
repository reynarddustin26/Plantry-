import { FadeUp } from '@/components/common/FadeUp';

const FEATURES = [
  { icon: '🔍', title: 'Price comparison', proof: 'Unit price across 3 stores' },
  { icon: '🛡️', title: 'Allergen guard', proof: 'Hard-blocked, never just warned' },
  { icon: '🤖', title: 'AI explanations', proof: 'Why this product beats that one' },
  { icon: '🍳', title: 'Recipe matching', proof: 'Cart → meals, automatically' },
  { icon: '💰', title: 'Basket optimiser', proof: 'Swaps that save money' },
  { icon: '📊', title: 'Nutrition tracking', proof: 'Protein, calories, macros' },
];

export function FeaturesGrid() {
  return (
    <FadeUp as="section" className="rounded-2xl px-4 py-10 sm:px-8" style={{ background: 'var(--surface-light)' }}>
      <h2 className="mb-8 text-center text-2xl font-extrabold" style={{ color: 'var(--text-dark)' }}>
        Everything you need, in one basket
      </h2>
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-2xl">{feature.icon}</p>
            <p className="mt-2 font-bold" style={{ color: 'var(--text-dark)' }}>
              {feature.title}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{feature.proof}</p>
          </div>
        ))}
      </div>
    </FadeUp>
  );
}
