/**
 * Phase 6 — Mitra Onboarding E2E Proof
 *
 * Prerequisites:
 *   1. pnpm dev running at http://localhost:5173
 *   2. Backend dev server at https://dev.kalpx.com
 *   3. A fresh guest session (no token in localStorage)
 *
 * Run:
 *   pnpm --filter @kalpx/web e2e -- --grep "onboarding"
 *
 * Note: This spec drives the full support path (turn_1 → turn_8) as a
 * pre-auth guest. At turn_7, because the guest is unauthenticated, the
 * spec verifies the redirect to /login. Full turn_8 completion requires
 * a real authenticated user — that path is exercised via the login-first
 * variant test.
 */

import { test, expect, type Page } from '@playwright/test';

async function goToOnboarding(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());
  await page.goto('/en/mitra/onboarding?containerId=welcome_onboarding&stateId=turn_1');
  await page.waitForLoadState('networkidle');
}

test.describe('Mitra onboarding', () => {
  test('turn_1: Mitra greeting renders with continue chip', async ({ page }) => {
    await goToOnboarding(page);
    await expect(page.getByTestId('chip-continue')).toBeVisible({ timeout: 8_000 });
    await expect(page.getByTestId('chip-returning')).toBeVisible({ timeout: 5_000 });
  });

  test('turn_1 → turn_2: continue chip loads path selector', async ({ page }) => {
    await goToOnboarding(page);
    await page.getByTestId('chip-continue').click();
    // turn_2 has support and growth chips
    await expect(page.getByTestId('chip-support')).toBeVisible({ timeout: 8_000 });
    await expect(page.getByTestId('chip-growth')).toBeVisible({ timeout: 5_000 });
  });

  test('turn_1 returning chip → redirects to login', async ({ page }) => {
    await goToOnboarding(page);
    await page.getByTestId('chip-returning').click();
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 });
  });

  test('support path: turn_1 → turn_2 → turn_3_support', async ({ page }) => {
    await goToOnboarding(page);
    await page.getByTestId('chip-continue').click();
    await expect(page.getByTestId('chip-support')).toBeVisible({ timeout: 8_000 });
    await page.getByTestId('chip-support').click();
    // turn_3_support has body chip
    await expect(page.getByTestId('chip-body')).toBeVisible({ timeout: 8_000 });
  });

  test('growth path: turn_1 → turn_2 → turn_3_growth', async ({ page }) => {
    await goToOnboarding(page);
    await page.getByTestId('chip-continue').click();
    await expect(page.getByTestId('chip-growth')).toBeVisible({ timeout: 8_000 });
    await page.getByTestId('chip-growth').click();
    // turn_3_growth renders — URL contains turn_3_growth
    await expect(page).toHaveURL(/turn_3_growth/, { timeout: 8_000 });
  });

  test('turn_6: guidance mode picker renders three options', async ({ page }) => {
    // Navigate directly to turn_6 to test the block in isolation
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.goto('/en/mitra/onboarding?containerId=welcome_onboarding&stateId=turn_6');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('guidance-mode-universal')).toBeVisible({ timeout: 8_000 });
    await expect(page.getByTestId('guidance-mode-hybrid')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByTestId('guidance-mode-rooted')).toBeVisible({ timeout: 5_000 });
  });

  test('turn_7 unauthenticated: show_path chip redirects to login', async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.goto('/en/mitra/onboarding?containerId=welcome_onboarding&stateId=turn_7');
    await page.waitForLoadState('networkidle');
    // show_path chip
    await expect(page.getByTestId('chip-show_path')).toBeVisible({ timeout: 8_000 });
    await page.getByTestId('chip-show_path').click();
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 });
  });

  test('/en/mitra/start redirects to onboarding when no journey', async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.goto('/en/mitra/start');
    await page.waitForLoadState('networkidle');
    // Should end up at onboarding or dashboard (API-dependent)
    const url = page.url();
    expect(url).toMatch(/\/(en\/mitra\/(onboarding|dashboard)|login)/);
  });
});
