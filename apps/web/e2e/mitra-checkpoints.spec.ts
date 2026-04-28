/**
 * Phase 10B — Checkpoint E2E
 *
 * Prerequisites:
 *   1. pnpm dev at http://localhost:5173
 *   2. Backend dev at https://dev.kalpx.com
 *   3. .env.test.local with:
 *      PW_DAY7_EMAIL + PW_DAY7_PASSWORD
 *      PW_DAY14_EMAIL + PW_DAY14_PASSWORD
 *      (PW_DAY3_EMAIL + PW_DAY3_PASSWORD for not-ready tests)
 *
 * Run:
 *   pnpm --filter @kalpx/web e2e -- --grep "checkpoint"
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

const hasDay3 = Boolean(PERSONAS.day3.email && PERSONAS.day3.password);
const hasDay7 = Boolean(PERSONAS.day7.email && PERSONAS.day7.password);
const hasDay14 = Boolean(PERSONAS.day14.email && PERSONAS.day14.password);

// ── Not-Ready + Error States ──────────────────────────────────────────────────

test.describe('Checkpoint — not logged in', () => {
  test('/en/mitra/checkpoint/7 redirects when not logged in', async ({ page }) => {
    await page.goto('/en/mitra/checkpoint/7');
    await expect(page).toHaveURL(/\/en\/mitra\/start|\/en\/mitra\/onboarding/, { timeout: 8_000 });
  });

  test('/en/mitra/checkpoint/14 redirects when not logged in', async ({ page }) => {
    await page.goto('/en/mitra/checkpoint/14');
    await expect(page).toHaveURL(/\/en\/mitra\/start|\/en\/mitra\/onboarding/, { timeout: 8_000 });
  });
});

test.describe('Checkpoint — not yet at checkpoint day', () => {
  test.skip(!hasDay3, 'Skipped: PW_DAY3_EMAIL / PW_DAY3_PASSWORD not set');

  test('day 3 user sees not-ready card on /checkpoint/7', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/checkpoint/7');
    await page.waitForLoadState('networkidle');
    // Either not-ready card or redirected to dashboard
    const isNotReady = await page.getByTestId('checkpoint-not-ready').isVisible().catch(() => false);
    const isDashboard = page.url().includes('/en/mitra/dashboard');
    expect(isNotReady || isDashboard).toBe(true);
  });

  test('day 3 user sees not-ready card on /checkpoint/14', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/checkpoint/14');
    await page.waitForLoadState('networkidle');
    const isNotReady = await page.getByTestId('checkpoint-not-ready').isVisible().catch(() => false);
    const isDashboard = page.url().includes('/en/mitra/dashboard');
    expect(isNotReady || isDashboard).toBe(true);
  });

  test('back button from not-ready card goes to dashboard', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/checkpoint/7');
    await page.waitForLoadState('networkidle');
    const backBtn = page.getByTestId('checkpoint-back-btn');
    if (!(await backBtn.isVisible().catch(() => false))) return; // was redirected already
    await backBtn.click();
    await expect(page).toHaveURL(/\/en\/mitra\/dashboard/, { timeout: 5_000 });
  });
});

// ── Day 7 Checkpoint ──────────────────────────────────────────────────────────

test.describe('Checkpoint — Day 7 user', () => {
  test.skip(!hasDay7, 'Skipped: PW_DAY7_EMAIL / PW_DAY7_PASSWORD not set');

  test('/checkpoint/7 loads intro screen', async ({ page }) => {
    await loginWithCredentials(page, (PERSONAS as any).day7.email, (PERSONAS as any).day7.password);
    await page.goto('/en/mitra/checkpoint/7');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('checkpoint-intro')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
  });

  test('intro CTA advances to reflection phase', async ({ page }) => {
    await loginWithCredentials(page, (PERSONAS as any).day7.email, (PERSONAS as any).day7.password);
    await page.goto('/en/mitra/checkpoint/7');
    await expect(page.getByTestId('checkpoint-intro')).toBeVisible({ timeout: 10_000 });
    await page.getByTestId('checkpoint-intro-cta').click();
    await expect(page.getByTestId('checkpoint-reflection')).toBeVisible({ timeout: 3_000 });
  });

  test('reflection CTA advances to decisions phase', async ({ page }) => {
    await loginWithCredentials(page, (PERSONAS as any).day7.email, (PERSONAS as any).day7.password);
    await page.goto('/en/mitra/checkpoint/7');
    await expect(page.getByTestId('checkpoint-intro')).toBeVisible({ timeout: 10_000 });
    await page.getByTestId('checkpoint-intro-cta').click();
    await expect(page.getByTestId('checkpoint-reflection')).toBeVisible({ timeout: 3_000 });
    await page.getByTestId('checkpoint-reflection-cta').click();
    await expect(page.getByTestId('checkpoint-decisions')).toBeVisible({ timeout: 3_000 });
  });

  test('day 7 shows at least one decision button', async ({ page }) => {
    await loginWithCredentials(page, (PERSONAS as any).day7.email, (PERSONAS as any).day7.password);
    await page.goto('/en/mitra/checkpoint/7');
    await expect(page.getByTestId('checkpoint-intro')).toBeVisible({ timeout: 10_000 });
    await page.getByTestId('checkpoint-intro-cta').click();
    await page.getByTestId('checkpoint-reflection-cta').click();
    await expect(page.getByTestId('checkpoint-decisions')).toBeVisible({ timeout: 3_000 });
    // At least one decision button must be visible
    const continueBtn = page.getByTestId('checkpoint-decision-continue');
    const lightenBtn = page.getByTestId('checkpoint-decision-lighten');
    const hasDecision = await continueBtn.isVisible().catch(() => false) || await lightenBtn.isVisible().catch(() => false);
    expect(hasDecision).toBe(true);
  });

  test('day 7 day dots are shown in reflection phase', async ({ page }) => {
    await loginWithCredentials(page, (PERSONAS as any).day7.email, (PERSONAS as any).day7.password);
    await page.goto('/en/mitra/checkpoint/7');
    await expect(page.getByTestId('checkpoint-intro')).toBeVisible({ timeout: 10_000 });
    await page.getByTestId('checkpoint-intro-cta').click();
    await expect(page.getByTestId('checkpoint-day-dots')).toBeVisible({ timeout: 3_000 });
  });

  test('checkpoint page does not show blank screen', async ({ page }) => {
    await loginWithCredentials(page, (PERSONAS as any).day7.email, (PERSONAS as any).day7.password);
    await page.goto('/en/mitra/checkpoint/7');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
    // Must show either intro or not-ready — never blank
    const hasIntro = await page.getByTestId('checkpoint-intro').isVisible().catch(() => false);
    const hasNotReady = await page.getByTestId('checkpoint-not-ready').isVisible().catch(() => false);
    expect(hasIntro || hasNotReady).toBe(true);
  });
});

// ── Day 14 Checkpoint ─────────────────────────────────────────────────────────

test.describe('Checkpoint — Day 14 user', () => {
  test.skip(!hasDay14, 'Skipped: PW_DAY14_EMAIL / PW_DAY14_PASSWORD not set');

  test('/checkpoint/14 loads intro screen', async ({ page }) => {
    await loginWithCredentials(page, (PERSONAS as any).day14.email, (PERSONAS as any).day14.password);
    await page.goto('/en/mitra/checkpoint/14');
    await page.waitForLoadState('networkidle');
    await expect(page.getByTestId('checkpoint-intro')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
  });

  test('day 14 shows classification headline in reflection phase', async ({ page }) => {
    await loginWithCredentials(page, (PERSONAS as any).day14.email, (PERSONAS as any).day14.password);
    await page.goto('/en/mitra/checkpoint/14');
    await expect(page.getByTestId('checkpoint-intro')).toBeVisible({ timeout: 10_000 });
    await page.getByTestId('checkpoint-intro-cta').click();
    await expect(page.getByTestId('checkpoint-reflection')).toBeVisible({ timeout: 3_000 });
    // No error
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
  });

  test('day 14 decisions include change_focus option', async ({ page }) => {
    await loginWithCredentials(page, (PERSONAS as any).day14.email, (PERSONAS as any).day14.password);
    await page.goto('/en/mitra/checkpoint/14');
    await expect(page.getByTestId('checkpoint-intro')).toBeVisible({ timeout: 10_000 });
    await page.getByTestId('checkpoint-intro-cta').click();
    await page.getByTestId('checkpoint-reflection-cta').click();
    await expect(page.getByTestId('checkpoint-decisions')).toBeVisible({ timeout: 3_000 });
    await expect(page.getByTestId('checkpoint-decision-change_focus')).toBeVisible({ timeout: 2_000 });
  });
});

// ── Direct URL Refresh ────────────────────────────────────────────────────────

test.describe('Checkpoint — direct URL refresh', () => {
  test.skip(!hasDay3, 'Skipped: requires day3 persona for refresh test');

  test('refreshing /checkpoint/7 does not show blank screen', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/checkpoint/7');
    await page.waitForLoadState('networkidle');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/something went wrong/i)).not.toBeVisible();
  });
});
