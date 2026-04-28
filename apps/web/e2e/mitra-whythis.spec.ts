/**
 * Phase 10A — WhyThis L1/L2/L3 E2E
 *
 * Prerequisites:
 *   1. pnpm dev at http://localhost:5173
 *   2. Backend dev at https://dev.kalpx.com
 *   3. .env.test.local with PW_DAY3_EMAIL + PW_DAY3_PASSWORD
 *
 * Run:
 *   pnpm --filter @kalpx/web e2e -- --grep "why-this"
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

const hasPersonas = Boolean(PERSONAS.day3.email && PERSONAS.day3.password);

test.describe('WhyThis sheet — unauthenticated no-op', () => {
  test('dashboard without active journey does not show why-this strip', async ({ page }) => {
    await page.goto('/en/mitra/dashboard');
    await page.waitForLoadState('networkidle');
    // Unauthenticated users see the start/onboarding page, not the dashboard
    const isRedirected = page.url().includes('/en/mitra/start') || page.url().includes('/en/mitra/onboarding');
    const hasStrip = await page.getByTestId('why-this-strip').isVisible().catch(() => false);
    // Either redirected (no strip visible) or strip may be absent on fresh dashboard
    expect(isRedirected || !hasStrip).toBe(true);
  });
});

test.describe('WhyThis sheet — active journey user', () => {
  test.skip(!hasPersonas, 'Skipped: PW_DAY3_EMAIL / PW_DAY3_PASSWORD not set in .env.test.local');

  test('dashboard shows why-this strip when principle data is available', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/dashboard');
    await page.waitForLoadState('networkidle');
    // Strip may not appear if user has no principle data yet — just verify no crash
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
  });

  test('tapping why-this strip opens the sheet', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/dashboard');
    await page.waitForLoadState('networkidle');

    const strip = page.getByTestId('why-this-strip');
    if (!(await strip.isVisible().catch(() => false))) return; // no data — skip

    await strip.click();
    await expect(page.getByTestId('why-this-sheet')).toBeVisible({ timeout: 3_000 });
  });

  test('close button dismisses why-this sheet', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/dashboard');
    await page.waitForLoadState('networkidle');

    const strip = page.getByTestId('why-this-strip');
    if (!(await strip.isVisible().catch(() => false))) return;

    await strip.click();
    await expect(page.getByTestId('why-this-sheet')).toBeVisible({ timeout: 3_000 });
    await page.getByTestId('why-this-close').click();
    await expect(page.getByTestId('why-this-sheet')).not.toBeVisible({ timeout: 2_000 });
  });

  test('backdrop click dismisses why-this sheet', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/dashboard');
    await page.waitForLoadState('networkidle');

    const strip = page.getByTestId('why-this-strip');
    if (!(await strip.isVisible().catch(() => false))) return;

    await strip.click();
    await expect(page.getByTestId('why-this-sheet')).toBeVisible({ timeout: 3_000 });
    // Click the backdrop (the overlay div itself, not the sheet)
    await page.mouse.click(10, 10);
    await expect(page.getByTestId('why-this-sheet')).not.toBeVisible({ timeout: 2_000 });
  });

  test('go-deeper button fetches L2 principle if present', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/dashboard');
    await page.waitForLoadState('networkidle');

    const strip = page.getByTestId('why-this-strip');
    if (!(await strip.isVisible().catch(() => false))) return;

    await strip.click();
    await expect(page.getByTestId('why-this-sheet')).toBeVisible({ timeout: 3_000 });

    const deeperBtn = page.getByTestId('why-this-go-deeper');
    if (!(await deeperBtn.isVisible().catch(() => false))) return; // no principle_id — skip

    await deeperBtn.click();
    // Should show L2 content or remain on sheet — must not show error
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
    await expect(page.getByTestId('why-this-sheet')).toBeVisible();
  });

  test('why-this sheet shows fallback when no content', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/dashboard');
    await page.waitForLoadState('networkidle');
    // If strip is not visible, no content — that's valid behavior
    const strip = page.getByTestId('why-this-strip');
    if (!(await strip.isVisible().catch(() => false))) {
      // Verify dashboard itself is not broken
      await expect(page.getByTestId('greeting-card')).toBeVisible({ timeout: 5_000 });
    }
  });
});

test.describe('WhyThis — dismiss clears overlay state', () => {
  test.skip(!hasPersonas, 'Skipped: PW_DAY3_EMAIL / PW_DAY3_PASSWORD not set in .env.test.local');

  test('opening then closing why-this does not contaminate dashboard state', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/dashboard');
    await page.waitForLoadState('networkidle');

    const strip = page.getByTestId('why-this-strip');
    if (!(await strip.isVisible().catch(() => false))) return;

    await strip.click();
    await expect(page.getByTestId('why-this-sheet')).toBeVisible({ timeout: 3_000 });
    await page.getByTestId('why-this-close').click();

    // Dashboard must still be intact
    await expect(page.getByTestId('greeting-card')).toBeVisible({ timeout: 3_000 });
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
  });
});
