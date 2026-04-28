/**
 * Phase 7 — Mitra Dashboard E2E
 *
 * Prerequisites:
 *   1. pnpm dev at http://localhost:5173
 *   2. Backend dev at https://dev.kalpx.com
 *   3. .env.test.local with PW_DAY3_EMAIL + PW_DAY3_PASSWORD
 *
 * Run:
 *   pnpm --filter @kalpx/web e2e -- --grep "dashboard"
 */

import { test, expect, type Page } from '@playwright/test';
import { PERSONAS } from './fixtures/personas';

async function loginWithCredentials(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /log in|sign in/i }).click();
  await page.waitForURL(/\/en\/mitra/, { timeout: 15_000 });
}

test.describe('Mitra dashboard', () => {
  test.skip(
    !PERSONAS.day3.email || !PERSONAS.day3.password,
    'Skipped: PW_DAY3_EMAIL / PW_DAY3_PASSWORD not set in .env.test.local',
  );

  test('full dashboard flow: login → load → triad → offering_reveal → back', async ({ page }) => {
    const networkCalls: { url: string; status: number }[] = [];
    page.on('response', (res) => {
      if (res.url().includes('/mitra/')) {
        networkCalls.push({ url: res.url(), status: res.status() });
      }
    });

    // 1. Login
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);

    // 2. Navigate to dashboard
    await page.goto('/en/mitra/dashboard');
    await page.waitForLoadState('networkidle');

    // 3. Dashboard data endpoint called with 200
    const dashCall = networkCalls.find(
      (c) =>
        (c.url.includes('/mitra/v3/journey/daily-view/') || c.url.includes('/mitra/today/')) &&
        c.status === 200,
    );
    expect(dashCall, 'Dashboard API call returned 200').toBeTruthy();

    // 4. Greeting visible
    await expect(page.getByTestId('greeting-card')).toBeVisible({ timeout: 10_000 });

    // 5. At least one triad card visible
    const triadCards = page.locator('[data-testid^="triad-card-"]');
    await expect(triadCards.first()).toBeVisible({ timeout: 8_000 });

    // 6. Quick support visible
    await expect(page.getByTestId('quick-support-block')).toBeVisible({ timeout: 5_000 });

    // 7. Tap first triad card
    const firstCard = triadCards.first();
    const cardTestId = await firstCard.getAttribute('data-testid');
    await firstCard.click();

    // 8. Navigated to offering_reveal / engine
    await expect(page).toHaveURL(/\/en\/mitra\/engine/, { timeout: 8_000 });

    // 9. Screen rendered (headline visible)
    await expect(page.locator('h2')).toBeVisible({ timeout: 6_000 });

    // 10. Go back to dashboard
    await page.goBack();
    await expect(page).toHaveURL(/\/en\/mitra\/dashboard/, { timeout: 8_000 });

    // 11. Dashboard still renders — no blank screen
    await expect(page.getByTestId('greeting-card')).toBeVisible({ timeout: 5_000 });

    // 12. No error visible
    await expect(page.getByText(/something went wrong|failed to load|could not load/i)).not.toBeVisible();

    if (cardTestId) {
      console.log(`✓ Tapped ${cardTestId} → offering_reveal → back to dashboard`);
    }
  });

  test('WhyThis strip opens sheet when available', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/dashboard');
    await page.waitForLoadState('networkidle');

    const strip = page.getByTestId('why-this-strip');
    const stripVisible = await strip.isVisible().catch(() => false);

    if (!stripVisible) {
      console.log('⚠ WhyThis strip not present in current backend response — skipping sheet test');
      return;
    }

    await strip.click();
    await expect(page.getByTestId('why-this-sheet')).toBeVisible({ timeout: 4_000 });

    // Close sheet
    await page.getByTestId('why-this-close').click();
    await expect(page.getByTestId('why-this-sheet')).not.toBeVisible({ timeout: 3_000 });
  });

  test('quick support chip: triggered navigates to /trigger', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('support-chip-triggered')).toBeVisible({ timeout: 8_000 });
    await page.getByTestId('support-chip-triggered').click();
    await expect(page).toHaveURL(/\/en\/mitra\/trigger/, { timeout: 6_000 });
  });
});

test.describe('Mitra dashboard — no journey guard', () => {
  test('unauthenticated user redirected away from dashboard', async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.goto('/en/mitra/dashboard');
    await page.waitForLoadState('networkidle');
    // Should redirect to start or login — not stay on dashboard
    const url = page.url();
    expect(url).not.toMatch(/\/en\/mitra\/dashboard/);
  });
});
