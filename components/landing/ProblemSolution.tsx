import { FadeUp } from '@/components/common/FadeUp';

const PAIRS = [
  { pain: '😩 "I spend 20 min comparing prices"', solution: 'Plantry compares all stores instantly' },
  { pain: '😟 "I always miss allergen warnings"', solution: 'Hard-blocked before they reach cart' },
  { pain: '😤 "I never know what to cook"', solution: 'Cart auto-matches to recipes' },
];

export function ProblemSolution() {
  return (
    <FadeUp as="section" className="rounded-2xl px-4 py-10 sm:px-8" style={{ background: 'var(--surface-light)' }}>
      <h2 className="mb-6 text-center text-2xl font-extrabold" style={{ color: 'var(--text-dark)' }}>
        Sound familiar?
      </h2>
      <div className="mx-auto flex w-full max-w-2xl flex-col divide-y divide-border">
        {PAIRS.map((pair) => (
          <div
            key={pair.pain}
            className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <p className="text-sm text-muted-foreground">{pair.pain}</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--forest)' }}>
              → {pair.solution}
            </p>
          </div>
        ))}
      </div>
    </FadeUp>
  );
}
