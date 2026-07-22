const STEPS = [
  { title: 'Tell Plantry your goal', desc: 'Budget, health, quick, or convenience — pick what matters this week.' },
  { title: 'Choose your stores', desc: 'Coles, Woolworths, IGA — one or all three.' },
  { title: 'Compare real products', desc: 'Real AU prices, unit pricing, and allergen checks side by side.' },
  { title: 'Build your basket', desc: 'Add what you need — allergy conflicts are blocked automatically.' },
  { title: 'See what you saved', desc: 'Every swap and every dollar, explained, not just a number.' },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 rounded-2xl px-4 py-12 sm:px-8"
      style={{ background: 'var(--surface-light)' }}
    >
      <h2 className="fade-up mb-10 text-center text-2xl font-extrabold" style={{ color: 'var(--text-dark)' }}>
        How it works
      </h2>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-5 sm:gap-4">
        {STEPS.map((step, i) => (
          <div
            key={step.title}
            className="fade-up flex flex-col items-center gap-2 text-center"
            style={{ transitionDelay: `${i * 80}ms` }}
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
          </div>
        ))}
      </div>
    </section>
  );
}
