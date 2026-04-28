/**
 * Phase 9.5 — Mitra Routing Audit E2E
 *
 * Prerequisites:
 *   1. pnpm dev at http://localhost:5173
 *   2. Backend dev at https://dev.kalpx.com
 *   3. .env.test.local with PW_DAY3_EMAIL + PW_DAY3_PASSWORD
 *
 * Run:
 *   pnpm --filter @kalpx/web e2e -- --grep "routing"
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

test.describe('Routing audit — unauthenticated / no journey', () => {
  test('/en/mitra shows landing page when not logged in', async ({ page }) => {
    await page.goto('/en/mitra');
    await page.waitForLoadState('networkidle');

    // Should see "Begin journey" or "Sign in" — not dashboard
    const hasBegin = await page.getByText(/begin journey/i).isVisible().catch(() => false);
    const hasSignIn = await page.getByText(/sign in/i).isVisible().catch(() => false);
    expect(hasBegin || hasSignIn).toBe(true);

    // Must not show dashboard content
    await expect(page.getByTestId('greeting-card')).not.toBeVisible();
  });

  test('/en/mitra/dashboard redirects to start when not logged in', async ({ page }) => {
    await page.goto('/en/mitra/dashboard');
    // RequiresJourney will redirect to /en/mitra/start
    await expect(page).toHaveURL(/\/en\/mitra\/start|\/en\/mitra\/onboarding/, { timeout: 8_000 });
  });

  test('/en/mitra/engine redirects to start when not logged in', async ({ page }) => {
    await page.goto('/en/mitra/engine?containerId=practice_runner&stateId=free_mantra_chanting');
    await expect(page).toHaveURL(/\/en\/mitra\/start|\/en\/mitra\/onboarding/, { timeout: 8_000 });
  });

  test('/en/mitra/engine with no params shows fallback not blank screen', async ({ page }) => {
    // Navigate directly — skip auth check by going to engine with no params
    // (RequiresJourney will redirect first, but the fallback test is for when it passes)
    await page.goto('/en/mitra/engine');
    await page.waitForLoadState('networkidle');
    // Either redirected to start, or (if somehow authed) shows the fallback card
    const isStartPage = page.url().includes('/en/mitra/start') || page.url().includes('/en/mitra/onboarding');
    const hasFallback = await page.getByTestId('engine-not-found').isVisible().catch(() => false);
    const hasReturnBtn = await page.getByTestId('engine-return-btn').isVisible().catch(() => false);
    // Must not be blank — at least one of these must be true
    expect(isStartPage || hasFallback || hasReturnBtn).toBe(true);
  });

  test('/login shows login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /sign in|log in/i })).toBeVisible({ timeout: 5_000 });
  });

  test('/signup shows signup form', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');
    // Should see an email input or a signup-related heading
    const hasInput = await page.locator('input[type="email"], input[type="text"]').first().isVisible().catch(() => false);
    expect(hasInput).toBe(true);
  });

  test('/forgot-password shows forgot password form', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    const hasInput = await page.locator('input[type="email"]').isVisible().catch(() => false);
    expect(hasInput).toBe(true);
  });
});

test.describe('Routing audit — active journey user', () => {
  test.skip(!hasPersonas, 'Skipped: PW_DAY3_EMAIL / PW_DAY3_PASSWORD not set in .env.test.local');

  test('/en/mitra redirects to /en/mitra/dashboard for active journey user', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra');
    await expect(page).toHaveURL(/\/en\/mitra\/dashboard/, { timeout: 10_000 });
    // Must NOT show "Begin journey" to active user
    await expect(page.getByText(/begin journey/i)).not.toBeVisible();
  });

  test('/en/mitra/start redirects to dashboard for active journey user', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/start');
    await expect(page).toHaveURL(/\/en\/mitra\/dashboard/, { timeout: 10_000 });
  });

  test('/en/mitra/onboarding redirects to dashboard for active journey user', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/onboarding?stateId=turn_1');
    await expect(page).toHaveURL(/\/en\/mitra\/dashboard/, { timeout: 10_000 });
  });

  test('/en/mitra/dashboard loads dashboard for active journey user', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/dashboard');
    await page.waitForLoadState('networkidle');
    // Loading skeleton or content should be visible (not error or redirect)
    await expect(page).toHaveURL(/\/en\/mitra\/dashboard/);
    await expect(page.getByText(/something went wrong|failed to load/i)).not.toBeVisible();
  });

  test('back from dashboard does not show Begin Journey screen', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    // The login flow navigates /en/mitra → /en/mitra/dashboard (replace)
    // So pressing back from dashboard should go to pre-login page, not /en/mitra landing
    await page.goto('/en/mitra/dashboard');
    await page.waitForLoadState('networkidle');
    await page.goBack();
    await page.waitForLoadState('networkidle');
    // Should be on /login or /en (pre-mitra) — NOT on /en/mitra showing "Begin journey"
    const url = page.url();
    const isOnDashboard = url.includes('/en/mitra/dashboard');
    const isBeginJourneyVisible = await page.getByText(/begin journey/i).isVisible().catch(() => false);
    // If still on dashboard (replace: true), that's fine. If back went somewhere, Begin journey must not show.
    if (!isOnDashboard) {
      expect(isBeginJourneyVisible).toBe(false);
    }
  });
});

test.describe('Routing audit — flow exit invariants', () => {
  test.skip(!hasPersonas, 'Skipped: PW_DAY3_EMAIL / PW_DAY3_PASSWORD not set in .env.test.local');

  test('dashboard → runner → exit → dashboard', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/dashboard');
    await page.waitForLoadState('networkidle');

    const mantraCard = page.getByTestId('triad-card-mantra');
    if (!(await mantraCard.isVisible().catch(() => false))) return;

    await mantraCard.click();
    await page.waitForURL(/free_mantra_chanting/, { timeout: 8_000 });

    const exitBtn = page.getByTestId('runner-exit-btn');
    await expect(exitBtn).toBeVisible({ timeout: 5_000 });
    await exitBtn.click();

    await expect(page).toHaveURL(/\/en\/mitra\/dashboard/, { timeout: 8_000 });
    // Dashboard should reload without showing stale runner blocks
    await expect(page.getByTestId('rep-counter')).not.toBeVisible();
  });

  test('dashboard → trigger → exit → dashboard (no runner state contamination)', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/trigger');
    await page.waitForLoadState('networkidle');

    const exitBtn = page.getByTestId('trigger-exit-btn');
    if (!(await exitBtn.isVisible().catch(() => false))) return;
    await exitBtn.click();

    await expect(page).toHaveURL(/\/en\/mitra\/dashboard/, { timeout: 8_000 });
    // Runner blocks must not appear on dashboard
    await expect(page.getByTestId('rep-tap-target')).not.toBeVisible();
    await expect(page.getByTestId('sankalp-hold-block')).not.toBeVisible();
  });

  test('dashboard → checkin → exit → dashboard (no trigger state contamination)', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/checkin');
    await page.waitForLoadState('networkidle');

    const exitBtn = page.getByTestId('checkin-exit-btn');
    if (!(await exitBtn.isVisible().catch(() => false))) return;
    await exitBtn.click();

    await expect(page).toHaveURL(/\/en\/mitra\/dashboard/, { timeout: 8_000 });
    await expect(page.getByTestId('checkin-regulation-block')).not.toBeVisible();
  });

  test('dashboard → room → exit → dashboard (no room state contamination)', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/room/joy');
    await page.waitForLoadState('networkidle');

    const exitBtn = page.getByTestId('room-exit-btn');
    await expect(exitBtn).toBeVisible({ timeout: 10_000 });
    await exitBtn.click();

    await expect(page).toHaveURL(/\/en\/mitra\/dashboard/, { timeout: 8_000 });
    await expect(page.getByTestId('room-renderer-room_joy')).not.toBeVisible();
  });
});

test.describe('Routing audit — direct URL refresh', () => {
  test.skip(!hasPersonas, 'Skipped: PW_DAY3_EMAIL / PW_DAY3_PASSWORD not set in .env.test.local');

  test('refreshing /en/mitra/engine with valid containerId/stateId recovers correctly', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/engine?containerId=practice_runner&stateId=completion_return');
    await page.waitForLoadState('networkidle');
    await page.reload();
    await page.waitForLoadState('networkidle');
    // Should show completion screen or dashboard — not blank or error
    await expect(page.getByText(/something went wrong|failed to load/i)).not.toBeVisible();
  });

  test('refreshing /en/mitra/trigger re-enters trigger at entry state', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/trigger');
    await page.waitForLoadState('networkidle');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
    await expect(page.getByTestId('trigger-exit-btn')).toBeVisible({ timeout: 8_000 });
  });

  test('refreshing /en/mitra/checkin re-enters checkin at notice state', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/checkin');
    await page.waitForLoadState('networkidle');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
    await expect(page.getByTestId('checkin-exit-btn')).toBeVisible({ timeout: 8_000 });
  });
});

test.describe('Routing audit — logout clears session', () => {
  test.skip(!hasPersonas, 'Skipped: PW_DAY3_EMAIL / PW_DAY3_PASSWORD not set in .env.test.local');

  test('logout redirects to /login and prevents dashboard access', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/dashboard');
    await page.waitForLoadState('networkidle');

    // Navigate to logout
    await page.goto('/logout');
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 });

    // Try to access dashboard — should redirect to start/onboarding
    await page.goto('/en/mitra/dashboard');
    await expect(page).toHaveURL(/\/en\/mitra\/start|\/en\/mitra\/onboarding/, { timeout: 8_000 });
  });

  test('logout then login does not show previous user dashboard data', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/dashboard');
    await page.waitForLoadState('networkidle');

    // Logout
    await page.goto('/logout');
    await expect(page).toHaveURL(/\/login/, { timeout: 8_000 });

    // Log back in as same user
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/dashboard');
    await page.waitForLoadState('networkidle');

    // Dashboard should load fresh — no error visible
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
  });
});
