import { FadeUp } from '@/components/common/FadeUp';

const STEPS = [
  { title: 'Tell us your goals', desc: 'Budget, diet, and allergies — set once, applied everywhere.' },
  { title: 'We compare the stores', desc: 'Real Coles, Woolworths and IGA prices, side by side.' },
  { title: 'AI explains your options', desc: 'Every ranking is scored by real data, then explained in plain English.' },
  { title: 'Cook from your cart', desc: 'Recipes unlock automatically as you shop.' },
  { title: 'See exactly what you saved', desc: 'Time and money, itemised — not just a number.' },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 rounded-2xl px-4 py-12 sm:px-8"
      style={{ background: 'var(--surface-light)' }}
    >
      <FadeUp as="h2" className="mb-10 text-center text-2xl font-extrabold" style={{ color: 'var(--text-dark)' }}>
        How it works
      </FadeUp>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-5 sm:gap-4">
        {STEPS.map((step, i) => (
          <FadeUp
            key={step.title}
            delay={i * 0.08}
            className="flex flex-col items-center gap-2 text-center"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-white"
              style={{ background: 'var(--amber)' }}
            >
              {i + 1}
            </span>
            <p className="font-semibold" style={{ color: 'var(--forest)' }}>
              {step.title}
            </p>
            <p className="text-xs text-muted-foreground">{step.desc}</p>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
