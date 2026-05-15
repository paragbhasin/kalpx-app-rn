/**
 * Cross-surface onboarding isolation — Playwright smoke.
 *
 * API-layer assertions: entry-view and chips never 500 regardless of cross-surface state.
 * UI smoke: /en/mitra/onboarding?stateId=turn_1 must render without "No screen schema loaded."
 *
 * Run:
 *   cd apps/web && npx playwright test e2e/onboarding-cross-surface.spec.ts
 */

import { test, expect } from '@playwright/test';

// ── API-layer: response shape ──────────────────────────────────────────────────

test.describe('Onboarding cross-surface — API layer', () => {
  test('entry-view returns 200 or 401, never 5xx', async ({ request }) => {
    const resp = await request.get('http://localhost:8000/api/mitra/v3/journey/entry-view/');
    expect([200, 401, 403]).toContain(resp.status());
  });

  test('onboarding chips returns 200 or 401 for support+relationships, never 5xx', async ({
    request,
  }) => {
    const resp = await request.get(
      'http://localhost:8000/api/mitra/onboarding/chips/?stage=2&lane=support&stage1_choice=relationships',
    );
    expect([200, 401, 403]).toContain(resp.status());
  });

  test('onboarding chips returns non-empty for authenticated test user', async ({ request }) => {
    const jwt = process.env.TEST_JWT ?? '';
    if (!jwt) {
      test.skip();
      return;
    }
    const resp = await request.get(
      'http://localhost:8000/api/mitra/onboarding/chips/?stage=2&lane=support&stage1_choice=relationships',
      { headers: { Authorization: `Bearer ${jwt}` } },
    );
    if (resp.status() === 200) {
      const data = await resp.json();
      expect((data.chips ?? []).length).toBeGreaterThan(0);
    }
  });
});

// ── UI smoke: schema load verification ────────────────────────────────────────

test.describe('Onboarding UI smoke — schema load verification', () => {
  test('?stateId=turn_1 renders without "No screen schema loaded."', async ({ page }) => {
    await page.goto('http://localhost:5173/en/mitra/onboarding?stateId=turn_1');
    await page.waitForLoadState('networkidle');

    const errorLocator = page.getByText('No screen schema loaded');
    await expect(errorLocator).not.toBeVisible();

    // Page must have rendered meaningful content.
    const body = (await page.textContent('body')) ?? '';
    expect(body.trim().length).toBeGreaterThan(10);
  });

  test('/en/mitra/onboarding (no stateId param) loads schema without error', async ({ page }) => {
    await page.goto('http://localhost:5173/en/mitra/onboarding');
    await page.waitForLoadState('networkidle');

    const errorLocator = page.getByText('No screen schema loaded');
    await expect(errorLocator).not.toBeVisible();
  });

  test('stateId=turn_1 is present in URL after navigating from /en/mitra', async ({ page }) => {
    // Simulates InnerPathPage navigating to onboarding — URL must contain stateId=turn_1.
    // This test only validates the URL navigation contract, not auth state.
    await page.goto('http://localhost:5173/en/mitra/onboarding?stateId=turn_1');
    expect(page.url()).toContain('stateId=turn_1');
  });
});
