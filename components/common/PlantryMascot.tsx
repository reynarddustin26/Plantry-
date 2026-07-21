// A small, friendly "concentric spheres" character for the landing hero —
// three nested circles (body, a lighter mid layer, a warm gold core) plus a
// tiny sprout, matching the brand direction from blueprint §4 ("fun/goofy
// but professional") and the 🌱 already used in the Header wordmark.
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

      {/* sprout */}
      <path
        d="M100 42 C 96 24, 80 18, 68 20 C 72 34, 84 42, 100 42 Z"
        fill="var(--mint-light)"
      />
      <path
        d="M100 42 C 104 22, 122 14, 136 16 C 130 32, 116 42, 100 42 Z"
        fill="var(--emerald)"
      />
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
