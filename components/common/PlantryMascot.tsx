// Plantry's "concentric spheres" mascot — three nested circles, three amber
// leaves, a simple face. Used small (header logo mark) and large (hero).
export function PlantryMascot({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label="Plantry's mascot — a small sprouting sphere character"
    >
      <circle cx="100" cy="112" r="70" fill="var(--emerald)" />
      <circle cx="100" cy="112" r="48" fill="var(--mint)" />
      <circle cx="100" cy="112" r="24" fill="var(--gold)" />

      {/* three amber leaves */}
      <path d="M100 42 C 97 26, 84 18, 72 19 C 75 32, 86 41, 100 42 Z" fill="var(--gold)" />
      <path d="M100 42 C 103 22, 122 13, 137 15 C 130 32, 115 42, 100 42 Z" fill="var(--amber)" />
      <path d="M100 42 C 100 28, 100 16, 100 8 C 106 16, 106 30, 100 42 Z" fill="var(--gold)" />
      <line x1="100" y1="42" x2="100" y2="58" stroke="var(--forest)" strokeWidth="4" strokeLinecap="round" />

      {/* face */}
      <circle cx="84" cy="108" r="5" fill="var(--forest-deep)" />
      <circle cx="116" cy="108" r="5" fill="var(--forest-deep)" />
      <path
        d="M84 126 Q100 138 116 126"
        stroke="var(--forest-deep)"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
