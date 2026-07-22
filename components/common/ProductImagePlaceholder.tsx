// The catalog has no product photos (never fabricated) — this is an honest
// placeholder, not a fake image: a gradient tile with the product's initial.
export function ProductImagePlaceholder({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';

  return (
    <div
      className="flex aspect-square w-full items-center justify-center rounded-lg text-6xl font-extrabold text-white"
      style={{ background: 'linear-gradient(135deg, var(--forest), var(--emerald))' }}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}
