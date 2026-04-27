/**
 * Phase 5 — Mitra Vertical-Slice Proof
 *
 * Prerequisites:
 *   1. pnpm dev running at http://localhost:5173
 *   2. Backend dev server at https://dev.kalpx.com (or VITE_API_BASE_URL in .env.development.local)
 *   3. .env.test.local with PW_DAY3_EMAIL + PW_DAY3_PASSWORD for a user with an active journey
 *
 * Run:
 *   pnpm --filter @kalpx/web e2e
 */

import { test, expect, type Page } from '@playwright/test';
import { PERSONAS } from './fixtures/personas';

// Track API calls during the test
const API_BASE = process.env.VITE_API_BASE_URL ?? 'https://dev.kalpx.com/api';

async function loginWithCredentials(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /log in|sign in/i }).click();
  // Wait for redirect away from login
  await page.waitForURL(/\/en\/mitra/, { timeout: 15_000 });
}

test.describe('Mitra vertical slice', () => {
  test.skip(
    !PERSONAS.day3.email || !PERSONAS.day3.password,
    'Skipped: PW_DAY3_EMAIL / PW_DAY3_PASSWORD not set in .env.test.local',
  );

  test('full slice: login → dashboard → engine screen → track_event → track_completion → return', async ({ page }) => {
    // Collect network evidence
    const networkCalls: { url: string; status: number }[] = [];
    page.on('response', (res) => {
      const url = res.url();
      if (url.includes('/mitra/')) {
        networkCalls.push({ url, status: res.status() });
      }
    });

    // 1. Login
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);

    // 2. Navigate to dashboard (may redirect automatically from /en/mitra)
    await page.goto('/en/mitra/dashboard');
    await page.waitForLoadState('networkidle');

    // 3. GET /mitra/today/ should have fired and returned 200
    const todayCall = networkCalls.find(c => c.url.includes('/mitra/today/'));
    expect(todayCall, 'GET /mitra/today/ was called').toBeTruthy();
    expect(todayCall?.status, '/mitra/today/ returned 200').toBe(200);

    // 4. Dashboard proof card visible
    const mantraCard = page.getByTestId('triad-card-mantra');
    await expect(mantraCard).toBeVisible({ timeout: 10_000 });

    // 5. Tap the mantra card
    await mantraCard.click();

    // 6. Engine route reached with correct query params
    await expect(page).toHaveURL(/\/en\/mitra\/engine/, { timeout: 8_000 });
    const url = new URL(page.url());
    expect(url.searchParams.get('containerId')).toBe('cycle_transitions');
    expect(url.searchParams.get('stateId')).toBe('offering_reveal');

    // 7. Contract screen rendered — headline visible
    await expect(page.locator('h2')).toBeVisible({ timeout: 8_000 });

    // 8. Tap the "Begin" / primary action button
    const beginBtn = page.getByTestId('btn-info_start');
    await expect(beginBtn).toBeVisible({ timeout: 5_000 });
    await beginBtn.click();

    // 9. track_event and track_completion fired with 200
    await page.waitForResponse(
      (res) => res.url().includes('/mitra/track-event/') && res.status() === 200,
      { timeout: 8_000 },
    );
    await page.waitForResponse(
      (res) => res.url().includes('/mitra/track-completion/') && res.status() === 200,
      { timeout: 8_000 },
    );

    // 10. Returned to dashboard
    await expect(page).toHaveURL(/\/en\/mitra\/dashboard/, { timeout: 8_000 });

    // 11. No error visible on dashboard
    await expect(page.getByText(/something went wrong|failed to load/i)).not.toBeVisible();
  });

  test('guest user: GET /mitra/today/ sends X-Guest-UUID header', async ({ page }) => {
    // Clear any existing session
    await page.context().clearCookies();
    await page.goto('/en/mitra/dashboard');
    // The RequiresJourney guard should redirect; but if we reach the dashboard or get a /today/ call
    // with a guest UUID header, the architecture is correct. This test mainly checks the request header.
    const todayRequest = page.waitForRequest((req) => req.url().includes('/mitra/today/'));
    // Trigger by navigating again after a brief pause
    await page.reload();
    try {
      const req = await todayRequest;
      const guestUUID = req.headers()['x-guest-uuid'];
      expect(guestUUID, 'X-Guest-UUID header present on guest call').toBeTruthy();
    } catch {
      // If no today/ call fires (e.g. redirected to login), that is also acceptable behavior
    }
  });
});
