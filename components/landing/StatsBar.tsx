// Product/recipe counts match the real Phase 6 ingestion results (53
// products, 27 recipes populated in Supabase) — not placeholder numbers.
const STATS = [
  { value: '53+', label: 'Products' },
  { value: '27', label: 'Recipes' },
  { value: '~40 min', label: 'saved/week' },
];

export function StatsBar() {
  return (
    <section
      className="fade-up -mx-4 px-4 py-10 lg:-mx-8 lg:px-8"
      style={{ background: 'var(--emerald)' }}
    >
      <div className="mx-auto grid max-w-5xl grid-cols-3 gap-4 text-center">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <p className="text-3xl font-bold text-white sm:text-4xl">{stat.value}</p>
            <p className="text-sm" style={{ color: 'var(--mint-light)' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
