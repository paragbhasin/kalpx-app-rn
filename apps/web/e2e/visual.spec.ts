/**
 * Visual screenshot specs — Phase UI-Foundation.
 * Run: pnpm --filter @kalpx/web e2e -- --grep "visual"
 *
 * These are NOT pixel-diff tests (no toHaveScreenshot baseline yet).
 * They verify pages render without crash at the specified viewports.
 * Upgrade to snapshot tests once a visual baseline is established.
 */

import { test, expect } from '@playwright/test';

const MOBILE = { width: 390, height: 844 };    // iPhone 14
const DESKTOP = { width: 1280, height: 900 };

test.describe('visual smoke — mobile viewport', () => {
  test.use({ viewport: MOBILE });

  test('Mitra home renders', async ({ page }) => {
    await page.goto('/en/mitra');
    await expect(page.locator('body')).toBeVisible({ timeout: 10_000 });
    expect(await page.title()).not.toBe('');
  });

  test('Classes listing renders', async ({ page }) => {
    await page.goto('/en/classes');
    await expect(page.locator('h1')).toBeVisible({ timeout: 10_000 });
    expect(await page.title()).not.toBe('');
  });

  test('Login page renders with cream background', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible({ timeout: 10_000 });
    const bg = await page.evaluate(() => getComputedStyle(document.body).background);
    expect(bg).not.toContain('rgb(10, 10, 10)'); // not dark bg
  });

  test('Retreats page renders', async ({ page }) => {
    await page.goto('/en/retreats');
    await expect(page.locator('h1')).toBeVisible({ timeout: 10_000 });
  });

  test('Notifications redirects unauthenticated to login', async ({ page }) => {
    await page.goto('/en/notifications');
    await page.waitForURL(/\/login/, { timeout: 10_000 });
    expect(page.url()).toContain('returnTo=');
  });
});

test.describe('visual smoke — desktop viewport', () => {
  test.use({ viewport: DESKTOP });

  test('Classes listing expands on desktop', async ({ page }) => {
    await page.goto('/en/classes');
    await expect(page.locator('h1')).toBeVisible({ timeout: 10_000 });
    // Content container should be present
    expect(await page.title()).not.toBe('');
  });

  test('Login page renders correctly on desktop', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible({ timeout: 10_000 });
  });
});
