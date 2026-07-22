const FEATURES = [
  {
    icon: '🛡️',
    title: 'Allergen safety',
    desc: 'Hard-blocked. Never softened by a recommendation score.',
  },
  {
    icon: '💰',
    title: 'Real savings',
    desc: 'Unit price, protein-per-dollar, and basket optimisation in one place.',
  },
  {
    icon: '🍳',
    title: 'Cart to meals',
    desc: 'Every item in your basket unlocks matching recipes automatically.',
  },
];

export function WhyPlantry() {
  return (
    <section className="full-bleed px-4 py-14 sm:px-6" style={{ background: 'var(--forest)' }}>
      <h2 className="fade-up mb-8 text-center text-2xl font-extrabold text-white">Why Plantry</h2>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <div
            key={feature.title}
            className="fade-up rounded-2xl border p-6 text-white"
            style={{ background: '#0f4a35', borderColor: '#15503c', transitionDelay: `${i * 100}ms` }}
          >
            <p className="text-3xl">{feature.icon}</p>
            <p className="mt-3 font-bold">{feature.title}</p>
            <p className="mt-1 text-sm" style={{ color: 'var(--mint-light)' }}>
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
