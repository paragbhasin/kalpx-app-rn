/**
 * Phase 11 — Profile page E2E
 *
 * Prerequisites:
 *   1. pnpm dev at http://localhost:5173
 *   2. Backend dev at https://dev.kalpx.com
 *   3. .env.test.local with PW_DAY3_EMAIL + PW_DAY3_PASSWORD
 *
 * Run:
 *   pnpm --filter @kalpx/web e2e -- --grep "profile"
 */

import { test, expect, type Page } from '@playwright/test';
import { PERSONAS } from './fixtures/personas';

const HAS_CREDS = !!PERSONAS.day3.email && !!PERSONAS.day3.password;

async function loginWithCredentials(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /log in|sign in/i }).click();
  await page.waitForURL(/\/en\/mitra/, { timeout: 15_000 });
}

test.describe('profile page', () => {
  test.skip(!HAS_CREDS, 'Skipped: PW_DAY3_EMAIL / PW_DAY3_PASSWORD not set');

  test.beforeEach(async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/profile');
    await page.waitForURL(/\/en\/profile/, { timeout: 8_000 });
  });

  test('renders identity section with email', async ({ page }) => {
    await expect(page.locator('[data-testid="profile-identity"]')).toBeVisible({ timeout: 8_000 });
    await expect(page.locator('[data-testid="profile-email"]')).toBeVisible();
    const email = await page.locator('[data-testid="profile-email"]').textContent();
    expect(email).toContain('@');
  });

  test('renders logout button', async ({ page }) => {
    await expect(page.locator('[data-testid="profile-logout-btn"]')).toBeVisible();
  });

  test('renders back to Mitra link', async ({ page }) => {
    await expect(page.locator('[data-testid="profile-dashboard-link"]')).toBeVisible();
  });

  test('back to Mitra link navigates to dashboard', async ({ page }) => {
    await page.locator('[data-testid="profile-dashboard-link"]').click();
    await page.waitForURL(/\/en\/mitra/, { timeout: 8_000 });
    await expect(page).toHaveURL(/\/en\/mitra/);
  });

  test('header shows authenticated nav links', async ({ page }) => {
    const header = page.locator('[data-testid="app-header"]');
    await expect(header).toBeVisible();
    await expect(page.locator('[data-testid="header-dashboard-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="header-profile-link"]')).toBeVisible();
  });
});

test.describe('profile page — unauthenticated', () => {
  test('redirects to /login when not logged in', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    });
    await page.goto('/en/profile');
    await page.waitForURL(/\/login/, { timeout: 8_000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
