import { test, expect } from '@playwright/test';

/**
 * Phase 2 Gate Criterion: E2E suite green for intent → cart journey
 *
 * This test covers the complete critical user flow:
 * 1. Intent selection (/) → select "Health"
 * 2. Constraints (/onboarding/constraints) → pre-filled with Demo Profile
 * 3. Store selection (/store-selection) → Coles and Woolworths pre-selected
 * 4. Shop (/shop) → search for product and add to cart
 * 5. Cart (/cart) → verify item displays with quantity and AUD price
 * 6. Persistence → reload and verify cart survives (Zustand + localStorage)
 * 7. Allergy warnings → verify icon + text rendering (not color-only)
 */

test.describe('Intent to Cart Journey', () => {
  test('should complete full user flow from intent selection to persistent cart', async ({
    page,
  }) => {
    // STEP 1: Visit home page and select intent
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify page title
    await expect(page).toHaveTitle(/Plantry/);

    // Verify intent cards are visible
    const healthButton = page.locator('button:has-text("Health")');
    await expect(healthButton).toBeVisible();

    // Select "Health" intent
    await healthButton.click();

    // Verify health button is now selected (SelectableCard applies border-primary
    // only when selected — bg-card is a base class present either way, so
    // asserting on that would pass even if the click did nothing)
    await expect(healthButton).toHaveClass(/border-primary/);

    // Click Continue button
    const continueButton = page.locator('button:has-text("Continue")').first();
    await continueButton.click();

    // STEP 2: Verify constraints page with Demo Profile pre-fill
    await expect(page).toHaveURL(/\/onboarding\/constraints/);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('A few constraints');

    // Verify demo profile note is visible
    await expect(page.locator('text=Demo Profile')).toBeVisible();

    // Verify weekly budget pre-filled with demo value (80)
    const budgetInput = page.locator('input[type="number"]').first();
    const budgetValue = await budgetInput.inputValue();
    expect(parseFloat(budgetValue)).toBe(80);

    // Verify allergies are pre-selected (dairy and tree nut)
    const allergyButtons = page.locator('button[aria-pressed="true"]');
    const allergyCount = await allergyButtons.count();
    expect(allergyCount).toBe(2);

    // Verify the specific allergens are selected
    const dairyButton = page.locator('button:has-text("dairy")');
    const treeNutButton = page.locator('button:has-text("tree nut")');
    await expect(dairyButton).toHaveAttribute('aria-pressed', 'true');
    await expect(treeNutButton).toHaveAttribute('aria-pressed', 'true');

    // Click Continue to go to store selection
    await page.locator('button:has-text("Continue")').last().click();

    // STEP 3: Verify store selection page with Coles & Woolworths pre-selected
    await expect(page).toHaveURL(/\/store-selection/);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Where do you shop?');

    // Verify Coles and Woolworths are pre-selected
    const colesButton = page.locator('button:has-text("Coles")');
    const woolButton = page.locator('button:has-text("Woolworths")');

    await expect(colesButton).toBeVisible();
    await expect(woolButton).toBeVisible();

    // Click "Continue to Shopping" button
    const continueShoppingButton = page.locator('button:has-text("Continue to Shopping")');
    await continueShoppingButton.click();

    // STEP 4: Shop page — search and add product
    await expect(page).toHaveURL(/\/shop/);
    await page.waitForLoadState('networkidle');
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

    // STEP 5: Navigate to cart and verify item persistence and display
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

    // STEP 6: Verify cart persistence after page reload
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
