interface ReasoningSlotProps {
  reason?: string;
  tone?: 'positive' | 'excluded';
}

// Every recommendation shows its reason, not just a bare score (blueprint
// §4). Phase 3's lib/scoring.ts plugs its deterministic explanations in here.
// tone='excluded' is for the allergen hard-gate — text alone (not just color)
// makes the exclusion explicit, per the "never rely on color alone" rule.
export function ReasoningSlot({ reason, tone = 'positive' }: ReasoningSlotProps) {
  if (!reason) return null;

  const isExcluded = tone === 'excluded';

  return (
    <p className={isExcluded ? 'text-xs font-semibold text-danger-text' : 'text-xs text-muted-foreground'}>
      <span aria-hidden="true">{isExcluded ? '✕ ' : '✓ '}</span>
      {reason}
    </p>
  );
}
