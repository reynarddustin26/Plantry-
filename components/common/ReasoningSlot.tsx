interface ReasoningSlotProps {
  reason?: string;
}

// Placeholder slot for Phase 3's deterministic scoring explanations. Every
// recommendation must show its reason, not just a bare score — this component
// is the UI contract Phase 3 plugs into, so it's built before the logic exists.
export function ReasoningSlot({ reason }: ReasoningSlotProps) {
  if (!reason) return null;

  return (
    <p className="text-xs text-muted-foreground">
      <span aria-hidden="true">✓ </span>
      {reason}
    </p>
  );
}
