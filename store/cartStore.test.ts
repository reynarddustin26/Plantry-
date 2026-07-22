import { describe, expect, it, beforeEach } from 'vitest';
import { useCartStore } from './cartStore';

// Bypasses the persist middleware's localStorage rehydration — irrelevant to
// these tests, which only exercise the plain state-update logic.
function resetStore() {
  useCartStore.setState({ items: [] });
}

describe('useCartStore.setQuantity', () => {
  beforeEach(resetStore);

  it('updates the quantity of a product already in the cart', () => {
    useCartStore.getState().addItem('a');
    useCartStore.getState().setQuantity('a', 5);
    expect(useCartStore.getState().items).toEqual([{ productId: 'a', quantity: 5 }]);
  });

  it('removes the item when set to zero or below', () => {
    useCartStore.getState().addItem('a');
    useCartStore.getState().setQuantity('a', 0);
    expect(useCartStore.getState().items).toEqual([]);
  });

  // Regression test: the basket optimiser's "Accept swap" flow calls
  // setQuantity(suggestedProductId, quantity) for a product that is NOT yet
  // in the cart. A plain .map() over existing items silently no-ops for an
  // id it never matches, so the swap's replacement item never actually got
  // added — only the original got removed via removeItem(), net-shrinking
  // the cart by one every accepted swap. This must add the item instead.
  it('adds a brand-new product when it is not already in the cart (upsert)', () => {
    useCartStore.getState().addItem('existing');
    useCartStore.getState().setQuantity('brand-new', 3);
    expect(useCartStore.getState().items).toEqual([
      { productId: 'existing', quantity: 1 },
      { productId: 'brand-new', quantity: 3 },
    ]);
  });

  it('does not add anything when setting a non-existent product to zero', () => {
    useCartStore.getState().setQuantity('never-added', 0);
    expect(useCartStore.getState().items).toEqual([]);
  });
});

describe('useCartStore.addItem / removeItem', () => {
  beforeEach(resetStore);

  it('adds a new item at quantity 1', () => {
    useCartStore.getState().addItem('a');
    expect(useCartStore.getState().items).toEqual([{ productId: 'a', quantity: 1 }]);
  });

  it('increments quantity when adding an item already in the cart', () => {
    useCartStore.getState().addItem('a');
    useCartStore.getState().addItem('a');
    expect(useCartStore.getState().items).toEqual([{ productId: 'a', quantity: 2 }]);
  });

  it('removes an item entirely', () => {
    useCartStore.getState().addItem('a');
    useCartStore.getState().removeItem('a');
    expect(useCartStore.getState().items).toEqual([]);
  });
});
