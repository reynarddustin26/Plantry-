import { describe, expect, it } from 'vitest';
import { buildFallbackExplanation } from './fallbackExplanation';

describe('buildFallbackExplanation', () => {
  it('relays each product comparison reason verbatim, never inventing new claims', () => {
    const result = buildFallbackExplanation({
      type: 'product_comparison',
      products: [
        {
          name: 'Chicken Breast Fillets (Coles)',
          priceAud: 8.5,
          unitPriceLabel: '$1.70/100g',
          allergenConflict: false,
          reason: 'Best value — lowest price per 100g among safe options.',
        },
        {
          name: 'Chicken Breast Fillets (Woolworths)',
          priceAud: 8.75,
          unitPriceLabel: '$1.75/100g',
          allergenConflict: false,
          reason: 'Slightly higher unit price than the best value option.',
        },
      ],
    });
    expect(result).toContain('Best value — lowest price per 100g among safe options.');
    expect(result).toContain('Slightly higher unit price than the best value option.');
  });

  it('formats a basket swap explanation from the given savings and reason', () => {
    const result = buildFallbackExplanation({
      type: 'basket_swap',
      fromProductName: 'Chicken Breast Fillets',
      toProductName: 'Canned Chickpeas',
      savingsAud: 6.1,
      reason: 'Cheaper protein source per 100g, no allergy conflict.',
    });
    expect(result).toContain('Chicken Breast Fillets');
    expect(result).toContain('Canned Chickpeas');
    expect(result).toContain('$6.10');
    expect(result).toContain('Cheaper protein source per 100g, no allergy conflict.');
  });

  it('pluralizes swap count correctly for a savings summary', () => {
    expect(buildFallbackExplanation({ type: 'savings_summary', totalSavingsAud: 12, swapCount: 1 })).toBe(
      '1 swap identified, saving $12.00 in total.',
    );
    expect(buildFallbackExplanation({ type: 'savings_summary', totalSavingsAud: 24, swapCount: 3 })).toBe(
      '3 swaps identified, saving $24.00 in total.',
    );
  });
});
