/**
 * Phase 14C — Notifications Inbox E2E
 * Prerequisites: pnpm dev at http://localhost:5173, backend at https://dev.kalpx.com
 * Run: pnpm --filter @kalpx/web e2e -- --grep "notifications"
 */
import { test, expect } from '@playwright/test';
import { PERSONAS } from './fixtures/personas';

const HAS_CREDS = !!PERSONAS.day3.email && !!PERSONAS.day3.password;

test.describe('notifications inbox', () => {
  test('unauthenticated /en/notifications redirects to /login with returnTo', async ({ page }) => {
    await page.goto('/en/notifications');
    await page.waitForURL(/\/login/, { timeout: 10_000 });
    expect(page.url()).toContain('returnTo=');
  });

  test.describe('authenticated', () => {
    test.skip(!HAS_CREDS, 'Skipped: credentials not set');

    test('authenticated user sees notifications page', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', PERSONAS.day3.email);
      await page.fill('input[type="password"]', PERSONAS.day3.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForURL(/\/en\/mitra/, { timeout: 15_000 });

      await page.goto('/en/notifications');
      await expect(page.locator('h1', { hasText: 'Notifications' })).toBeVisible({ timeout: 10_000 });
    });
  });
});
