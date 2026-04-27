/**
 * Phase 8 — Mitra Runner E2E
 *
 * Prerequisites:
 *   1. pnpm dev at http://localhost:5173
 *   2. Backend dev at https://dev.kalpx.com
 *   3. .env.test.local with PW_DAY3_EMAIL + PW_DAY3_PASSWORD
 *
 * Run:
 *   pnpm --filter @kalpx/web e2e -- --grep "runner"
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

test.describe('Mitra runner flows', () => {
  test.skip(
    !PERSONAS.day3.email || !PERSONAS.day3.password,
    'Skipped: PW_DAY3_EMAIL / PW_DAY3_PASSWORD not set in .env.test.local',
  );

  test('mantra runner: tap triad card → rep counter → exit → dashboard', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/dashboard');
    await page.waitForLoadState('networkidle');

    // Dashboard loads with triad cards
    const mantraCard = page.getByTestId('triad-card-mantra');
    await expect(mantraCard).toBeVisible({ timeout: 10_000 });

    // Tap mantra card → navigates to free_mantra_chanting
    await mantraCard.click();
    await expect(page).toHaveURL(/free_mantra_chanting/, { timeout: 8_000 });

    // Rep counter is visible
    await expect(page.getByTestId('rep-counter')).toBeVisible({ timeout: 6_000 });

    // Tap rep counter a few times
    const tapTarget = page.getByTestId('rep-tap-target');
    await tapTarget.click();
    await tapTarget.click();

    // Exit button is visible
    await expect(page.getByTestId('runner-exit-btn')).toBeVisible();
    await page.getByTestId('runner-exit-btn').click();

    // Returns to dashboard
    await expect(page).toHaveURL(/\/en\/mitra\/dashboard/, { timeout: 8_000 });
    await expect(page.getByTestId('greeting-card')).toBeVisible({ timeout: 5_000 });
  });

  test('sankalp runner: tap triad card → hold block visible', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/dashboard');
    await page.waitForLoadState('networkidle');

    const sankalpCard = page.getByTestId('triad-card-sankalp');
    await expect(sankalpCard).toBeVisible({ timeout: 10_000 });
    await sankalpCard.click();

    await expect(page).toHaveURL(/sankalp_embody/, { timeout: 8_000 });
    await expect(page.getByTestId('sankalp-hold-block')).toBeVisible({ timeout: 6_000 });
  });

  test('practice runner: tap triad card → timer block visible', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/dashboard');
    await page.waitForLoadState('networkidle');

    const practiceCard = page.getByTestId('triad-card-practice');
    await expect(practiceCard).toBeVisible({ timeout: 10_000 });
    await practiceCard.click();

    await expect(page).toHaveURL(/practice_step_runner/, { timeout: 8_000 });
    await expect(page.getByTestId('practice-timer-block')).toBeVisible({ timeout: 6_000 });
  });

  test('completion return: return_to_dashboard navigates home', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);

    // Navigate directly to completion_return with runner state
    await page.goto('/en/mitra/engine?containerId=practice_runner&stateId=completion_return');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('completion-return-block')).toBeVisible({ timeout: 8_000 });

    await page.getByTestId('return-to-dashboard-btn').click();
    await expect(page).toHaveURL(/\/en\/mitra\/dashboard/, { timeout: 8_000 });
  });

  test('no error visible after completing runner flow', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/dashboard');
    await page.waitForLoadState('networkidle');

    const mantraCard = page.getByTestId('triad-card-mantra');
    if (!(await mantraCard.isVisible().catch(() => false))) return;

    await mantraCard.click();
    await page.waitForURL(/free_mantra_chanting/, { timeout: 8_000 });

    await expect(page.getByText(/something went wrong|failed to load|could not load/i)).not.toBeVisible();
  });
});
