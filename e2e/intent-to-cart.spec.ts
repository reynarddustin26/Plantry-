import { test, expect } from '@playwright/test';

/**
 * Phase 2 Gate Criterion (updated for Phase 10's real-account rewrite):
 * E2E suite green for the signed-out shop → cart journey.
 *
 * The old intent-selector → /onboarding/constraints → /store-selection
 * flow was local-Demo-Profile-only and has been removed along with the
 * rest of the demo system — real personalisation now requires a real
 * account (see PLAN.md's Phase 10 section), which isn't something this
 * suite creates. This test instead covers what a signed-out visitor can
 * actually do, which is still the app's full public shopping flow:
 * 1. Shop (/shop) → search for a product and add it to cart
 * 2. Cart (/cart) → verify item displays with quantity and AUD price
 * 3. Persistence → reload and verify cart survives (Zustand + localStorage)
 * 4. Allergy warnings → verify icon + text rendering (not color-only)
 */

test.describe('Intent to Cart Journey', () => {
  test('should complete full user flow from shop search to persistent cart', async ({
    page,
  }) => {
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle(/Plantry/);
    await expect(page.locator('h1')).toContainText('Shop');

    // Search for "milk"
    const searchInput = page.locator('input[type="search"]');
    await searchInput.fill('milk');
    await page.waitForTimeout(300); // Allow filter to update

    // Find an "Add" button for a milk product and click it
    const addButtons = page.locator('button:has-text("Add")');
    const addButtonCount = await addButtons.count();
    expect(addButtonCount).toBeGreaterThan(0);

    await addButtons.first().click();

    // Verify cart badge updates to show 1 item in header
    const cartBadge = page.locator('a[href="/cart"]').locator('visible=true').first();
    await expect(cartBadge).toBeVisible();

    // Navigate to cart and verify item persistence and display
    await cartBadge.click();
    await expect(page).toHaveURL(/\/cart/);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(200); // Wait for hydration

    await expect(page.locator('h1')).toContainText('Your cart');

    // Verify the added product line item is visible (contains "Milk").
    // Note: a Locator object is always truthy regardless of match count, so
    // this must assert on an actual resolved element, not the locator itself.
    const cartItems = page.getByText(/Milk/i);
    await expect(cartItems.first()).toBeVisible();

    // Verify quantity is displayed
    const quantityElements = page.locator('span').filter({ hasText: '1' });
    const quantityCount = await quantityElements.count();
    expect(quantityCount).toBeGreaterThan(0);

    // Verify price is displayed in AUD format
    const priceElement = page.locator('p:has-text("$")').first();
    await expect(priceElement).toBeVisible();

    // Verify total price is non-zero (the large bold price at the bottom of cart summary)
    const totalPrice = page.locator('p.text-xl.font-bold');
    const priceText = await totalPrice.textContent();
    expect(priceText).toMatch(/\$[\d.]+/);

    const priceMatch = priceText?.match(/\$([\d.]+)/);
    const priceValue = priceMatch ? parseFloat(priceMatch[1]) : 0;
    expect(priceValue).toBeGreaterThan(0);

    // Verify cart persistence after page reload
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(200); // Wait for hydration

    // Verify cart item is still there (persisted via Zustand + localStorage)
    const persistedCartItems = page.getByText(/Milk/i);
    await expect(persistedCartItems.first()).toBeVisible();

    // Verify quantity is still there
    const persistedQuantity = page.locator('span').filter({ hasText: '1' });
    const persistedQuantityCount = await persistedQuantity.count();
    expect(persistedQuantityCount).toBeGreaterThan(0);

    // Verify price is still displayed
    const persistedPrice = page.locator('p.text-xl.font-bold');
    await expect(persistedPrice).toBeVisible();
  });

  test('should display allergy warnings with icon and text (not color-only)', async ({
    page,
  }) => {
    // Navigate directly to shop page (can access without full flow due to local-only state)
    await page.goto('/shop');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);

    // Search for a product with known allergens
    const searchInput = page.locator('input[type="search"]');
    await searchInput.fill('milk');
    await page.waitForTimeout(300);

    // Find a product with dairy allergen (milk products have dairy)
    const allergyWarning = page.locator('.allergen-warning[role="alert"]');
    await expect(allergyWarning.first()).toBeVisible();

    // Verify the warning contains both icon and text (⚠ and "Contains:")
    const warningText = await allergyWarning.first().textContent();
    expect(warningText).toMatch(/⚠/); // Icon
    expect(warningText).toMatch(/Contains:/); // Text description
    expect(warningText).toMatch(/dairy|tree nut|gluten|peanut|soy|egg/); // Specific allergen

    // Verify role="alert" is properly set for accessibility
    const alertRole = await allergyWarning.first().getAttribute('role');
    expect(alertRole).toBe('alert');
  });
});
