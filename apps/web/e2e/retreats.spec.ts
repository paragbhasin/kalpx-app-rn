/**
 * Phase 14A — Retreats Interest Form E2E
 * Prerequisites: pnpm dev at http://localhost:5173, backend at https://dev.kalpx.com
 * .env.test.local with PW_DAY3_EMAIL + PW_DAY3_PASSWORD
 * Run: pnpm --filter @kalpx/web e2e -- --grep "retreats"
 */
import { test, expect } from '@playwright/test';
import { PERSONAS } from './fixtures/personas';

const HAS_CREDS = !!PERSONAS.day3.email && !!PERSONAS.day3.password;

test.describe('retreats interest form', () => {
  test('unauthenticated /en/retreats shows sign-in CTA', async ({ page }) => {
    await page.goto('/en/retreats');
    await expect(page.locator('text=Sign in').or(page.locator('text=sign in'))).toBeVisible({ timeout: 10_000 });
  });

  test.describe('authenticated', () => {
    test.skip(!HAS_CREDS, 'Skipped: credentials not set');

    test('form loads and submit button is disabled when required fields missing', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', PERSONAS.day3.email);
      await page.fill('input[type="password"]', PERSONAS.day3.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL(/\/en\/mitra/, { timeout: 15_000 });

      await page.goto('/en/retreats');
      await expect(page.locator('h1')).toBeVisible({ timeout: 10_000 });
      const submitBtn = page.getByRole('button', { name: /express interest/i });
      expect(await submitBtn.isDisabled()).toBe(true);
    });
  });
});
