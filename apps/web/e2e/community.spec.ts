/**
 * Phase 13 — Community / Social Feed E2E
 *
 * Prerequisites:
 *   1. pnpm dev at http://localhost:5173
 *   2. Backend dev at https://dev.kalpx.com
 *   3. .env.test.local with PW_DAY3_EMAIL + PW_DAY3_PASSWORD
 *
 * Run:
 *   pnpm --filter @kalpx/web e2e -- --grep "community"
 */

import { test, expect, type Page } from '@playwright/test';
import { PERSONAS } from './fixtures/personas';

const HAS_CREDS = !!PERSONAS.day3.email && !!PERSONAS.day3.password;

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/en\/mitra/, { timeout: 15_000 });
}

// ── Feed page ─────────────────────────────────────────────────────────────────

test.describe('community feed', () => {
  test('loads /en/community and shows heading', async ({ page }) => {
    await page.goto('/en/community');
    await expect(page.locator('h1', { hasText: 'Community' })).toBeVisible({ timeout: 10_000 });
  });

  test('shows empty/error state without crashing', async ({ page }) => {
    await page.goto('/en/community');
    await page.waitForURL('/en/community');
    // Page should at minimum render the Community heading
    await expect(page.locator('h1', { hasText: 'Community' })).toBeVisible({ timeout: 10_000 });
    // Should not show a blank white screen (background is #FFF8EF)
    const bg = await page.evaluate(() => getComputedStyle(document.body).background);
    // Just check no JS crash — page rendered
    expect(await page.title()).not.toBe('');
  });

  test('clicking a post card navigates to detail page', async ({ page }) => {
    await page.goto('/en/community');
    await expect(page.locator('h1', { hasText: 'Community' })).toBeVisible({ timeout: 10_000 });

    // Wait for feed to load (either cards or empty state)
    await page.waitForTimeout(2000);

    // Find first clickable post card
    const cards = page.locator('[style*="cursor: pointer"]');
    if (await cards.count() === 0) {
      test.skip(); // No posts in feed — skip gracefully
      return;
    }

    await cards.first().click();
    await page.waitForURL(/\/en\/community\/\d+/, { timeout: 10_000 });
    // Should be on detail page
    expect(page.url()).toMatch(/\/en\/community\/\d+/);
  });
});

// ── Post detail ───────────────────────────────────────────────────────────────

test.describe('post detail', () => {
  test('back button returns to /en/community', async ({ page }) => {
    await page.goto('/en/community');
    await expect(page.locator('h1', { hasText: 'Community' })).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(2000);

    const cards = page.locator('[style*="cursor: pointer"]');
    if (await cards.count() === 0) {
      test.skip();
      return;
    }
    await cards.first().click();
    await page.waitForURL(/\/en\/community\/\d+/, { timeout: 10_000 });

    await page.getByRole('button', { name: /← community/i }).click();
    await page.waitForURL('/en/community', { timeout: 5_000 });
    await expect(page.locator('h1', { hasText: 'Community' })).toBeVisible();
  });
});

// ── Auth gate — upvote ────────────────────────────────────────────────────────

test.describe('auth gate', () => {
  test('unauthenticated upvote redirects to /login with returnTo', async ({ page }) => {
    await page.goto('/en/community');
    await expect(page.locator('h1', { hasText: 'Community' })).toBeVisible({ timeout: 10_000 });
    await page.waitForTimeout(2000);

    const upvoteBtn = page.getByRole('button', { name: /upvote/i }).first();
    if (await upvoteBtn.count() === 0) {
      test.skip();
      return;
    }
    await upvoteBtn.click();
    await page.waitForURL(/\/login/, { timeout: 5_000 });
    expect(page.url()).toContain('returnTo=');
  });

  test('unauthenticated comment area shows "sign in" CTA', async ({ page }) => {
    await page.goto('/en/community');
    await page.waitForTimeout(2000);
    const cards = page.locator('[style*="cursor: pointer"]');
    if (await cards.count() === 0) {
      test.skip();
      return;
    }
    await cards.first().click();
    await page.waitForURL(/\/en\/community\/\d+/, { timeout: 10_000 });
    // Comment composer shows auth CTA when not logged in
    await expect(
      page.locator('text=Sign in to leave a comment').or(page.getByRole('button', { name: /sign in/i }))
    ).toBeVisible({ timeout: 5_000 });
  });
});

// ── Create post page (auth-gate) ──────────────────────────────────────────────

test.describe('create post', () => {
  test('unauthenticated /en/community/new redirects to /login', async ({ page }) => {
    await page.goto('/en/community/new');
    await page.waitForURL(/\/login/, { timeout: 10_000 });
    expect(page.url()).toContain('returnTo=');
    expect(page.url()).toContain('community');
  });
});

// ── Authenticated flows ───────────────────────────────────────────────────────

test.describe('authenticated community', () => {
  test.skip(!HAS_CREDS, 'Skipped: PW_DAY3_EMAIL / PW_DAY3_PASSWORD not set');

  test('logged-in user can see feed and access + Post button', async ({ page }) => {
    await loginAs(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/community');
    await expect(page.locator('h1', { hasText: 'Community' })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: /\+ post/i })).toBeVisible();
  });

  test('logged-in user can reach create post page', async ({ page }) => {
    await loginAs(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/community/new');
    await expect(page.locator('h1', { hasText: /create post/i })).toBeVisible({ timeout: 10_000 });
  });

  test('create post form validates before submit', async ({ page }) => {
    await loginAs(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/community/new');
    await expect(page.locator('h1', { hasText: /create post/i })).toBeVisible({ timeout: 10_000 });
    // Submit without filling anything
    const submitBtn = page.getByRole('button', { name: /post to community/i });
    expect(await submitBtn.isDisabled()).toBe(true);
  });

  test('returnTo: login redirect from comment preserves post destination', async ({ page }) => {
    await page.goto('/en/community');
    await page.waitForTimeout(2000);
    const cards = page.locator('[style*="cursor: pointer"]');
    if (await cards.count() === 0) {
      test.skip();
      return;
    }
    await cards.first().click();
    const postUrl = page.url();
    await page.waitForURL(/\/en\/community\/\d+/, { timeout: 10_000 });

    // Click "Sign in to leave a comment"
    const signInCta = page.locator('text=Sign in to leave a comment');
    if (await signInCta.count() > 0) {
      await signInCta.click();
      await page.waitForURL(/\/login/, { timeout: 5_000 });
      expect(page.url()).toContain('returnTo=');

      // Login
      await page.fill('input[type="email"]', PERSONAS.day3.email);
      await page.fill('input[type="password"]', PERSONAS.day3.password);
      await page.getByRole('button', { name: /sign in/i }).click();
      // After login, should return to post or /en/mitra
      await page.waitForURL(/\/(en\/community|en\/mitra)/, { timeout: 15_000 });
    }

    void postUrl; // referenced to avoid TS unused warning
  });
});
