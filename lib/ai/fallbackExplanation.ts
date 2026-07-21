import { formatAud } from '@/lib/utils';
import type { ExplainFacts } from './explainSchemas';

// The deterministic fallback: used whenever no AI key is configured, the AI
// call times out, or its output fails schema validation twice. It never
// crashes and never invents anything — it just relays the facts the caller
// already computed (lib/scoring.ts / lib/optimisation.ts's `reason` strings)
// in plain prose. This is what "the app stays fully usable with AI_API_KEY
// removed" (blueprint §9) actually looks like in practice.
export function buildFallbackExplanation(facts: ExplainFacts): string {
  switch (facts.type) {
    case 'product_comparison':
      return facts.products.map((p) => `${p.name}: ${p.reason}`).join(' ');
    case 'basket_swap':
      return `Swapping ${facts.fromProductName} for ${facts.toProductName} saves ${formatAud(facts.savingsAud)}. ${facts.reason}`;
    case 'savings_summary':
      return `${facts.swapCount} swap${facts.swapCount === 1 ? '' : 's'} identified, saving ${formatAud(facts.totalSavingsAud)} in total.`;
  }
}
