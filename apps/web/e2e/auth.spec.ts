/**
 * Phase 11 — Auth E2E (login, logout, forgot-password, reset-password flow)
 *
 * Prerequisites:
 *   1. pnpm dev at http://localhost:5173
 *   2. Backend dev at https://dev.kalpx.com
 *   3. .env.test.local with PW_DAY3_EMAIL + PW_DAY3_PASSWORD
 *
 * Run:
 *   pnpm --filter @kalpx/web e2e -- --grep "auth"
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

// ── Login ─────────────────────────────────────────────────────────────────────

test.describe('login', () => {
  test.skip(!HAS_CREDS, 'Skipped: PW_DAY3_EMAIL / PW_DAY3_PASSWORD not set');

  test('valid credentials → redirect to /en/mitra', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await expect(page).toHaveURL(/\/en\/mitra/);
  });

  test('invalid credentials → shows error, stays on /login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('nonexistent@kalpx.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    await expect(page.locator('[data-testid="login-error"]')).toBeVisible({ timeout: 8_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('login page has link to signup', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: /sign up|create/i })).toBeVisible();
  });

  test('login page has link to forgot-password', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: /forgot/i })).toBeVisible();
  });
});

// ── Logout ────────────────────────────────────────────────────────────────────

test.describe('logout', () => {
  test.skip(!HAS_CREDS, 'Skipped: PW_DAY3_EMAIL / PW_DAY3_PASSWORD not set');

  test('logout clears session and shows signed-out header', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);

    // Navigate to profile and sign out
    await page.goto('/en/profile');
    await page.locator('[data-testid="profile-logout-btn"]').click();

    // Redirect to login after logout (or landing)
    await page.waitForURL(/\/login|\/en/, { timeout: 8_000 });

    // Can no longer access profile — should redirect to login
    await page.goto('/en/profile');
    await page.waitForURL(/\/login/, { timeout: 8_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test('guest UUID is preserved after logout', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);

    // Grab guestUUID before logout
    const guestBefore = await page.evaluate(() => localStorage.getItem('guestUUID'));

    await page.goto('/en/profile');
    await page.locator('[data-testid="profile-logout-btn"]').click();
    await page.waitForURL(/\/login|\/en/, { timeout: 8_000 });

    const guestAfter = await page.evaluate(() => localStorage.getItem('guestUUID'));
    if (guestBefore) {
      expect(guestAfter).toBe(guestBefore);
    }
  });
});

// ── Forgot + Reset password ────────────────────────────────────────────────────

test.describe('forgot-password page', () => {
  test('renders email input and send-code button', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /send|reset/i })).toBeVisible();
  });

  test('empty submit shows validation error', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByRole('button', { name: /send|reset/i }).click();
    // Either browser native validation or custom error element
    const emailInput = page.getByLabel(/email/i);
    const isRequired = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    const customError = page.locator('[data-testid="forgot-error"]');
    const hasCustomError = await customError.isVisible().catch(() => false);
    expect(isRequired || hasCustomError).toBe(true);
  });

  test('entering email navigates to /reset-password', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByLabel(/email/i).fill('anyone@kalpx.com');
    await page.getByRole('button', { name: /send|reset/i }).click();
    // ForgotPasswordPage always navigates to /reset-password after submit
    await page.waitForURL(/\/reset-password/, { timeout: 8_000 });
    await expect(page).toHaveURL(/\/reset-password/);
  });
});

test.describe('reset-password page', () => {
  test('renders code + new-password inputs when reached via state', async ({ page }) => {
    // Simulate arriving via ForgotPasswordPage navigation (sets location.state.email)
    await page.goto('/forgot-password');
    await page.getByLabel(/email/i).fill('anyone@kalpx.com');
    await page.getByRole('button', { name: /send|reset/i }).click();
    await page.waitForURL(/\/reset-password/, { timeout: 8_000 });

    await expect(page.locator('[data-testid="reset-otp-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="reset-new-password"]')).toBeVisible();
    await expect(page.locator('[data-testid="reset-confirm-password"]')).toBeVisible();
  });

  test('mismatched passwords shows error', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByLabel(/email/i).fill('anyone@kalpx.com');
    await page.getByRole('button', { name: /send|reset/i }).click();
    await page.waitForURL(/\/reset-password/, { timeout: 8_000 });

    await page.locator('[data-testid="reset-otp-input"]').fill('123456');
    await page.locator('[data-testid="reset-new-password"]').fill('password1');
    await page.locator('[data-testid="reset-confirm-password"]').fill('password2');
    await page.locator('[data-testid="reset-submit-btn"]').click();

    await expect(page.locator('[data-testid="reset-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="reset-error"]')).toContainText(/match/i);
  });

  test('short password shows error', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByLabel(/email/i).fill('anyone@kalpx.com');
    await page.getByRole('button', { name: /send|reset/i }).click();
    await page.waitForURL(/\/reset-password/, { timeout: 8_000 });

    await page.locator('[data-testid="reset-otp-input"]').fill('123456');
    await page.locator('[data-testid="reset-new-password"]').fill('short');
    await page.locator('[data-testid="reset-confirm-password"]').fill('short');
    await page.locator('[data-testid="reset-submit-btn"]').click();

    await expect(page.locator('[data-testid="reset-error"]')).toBeVisible();
  });
});

// ── Auth guards ────────────────────────────────────────────────────────────────

test.describe('RequiresAuth guard', () => {
  test('unauthenticated visit to /en/profile redirects to /login', async ({ page }) => {
    // Clear any stored tokens
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
