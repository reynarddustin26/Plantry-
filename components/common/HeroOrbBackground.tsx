export function HeroOrbBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="hero-gradient-bg -mx-4 rounded-b-2xl px-4 py-10 lg:-mx-8 lg:px-8 lg:py-16">
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-orb hero-orb-3" />
      <div className="hero-orb hero-orb-4" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
