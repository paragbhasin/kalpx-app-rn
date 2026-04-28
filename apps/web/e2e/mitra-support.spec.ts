/**
 * Phase 9 — Mitra Support E2E
 * Trigger / Check-In / Rooms
 *
 * Prerequisites:
 *   1. pnpm dev at http://localhost:5173
 *   2. Backend dev at https://dev.kalpx.com
 *   3. .env.test.local with PW_DAY3_EMAIL + PW_DAY3_PASSWORD
 *
 * Run:
 *   pnpm --filter @kalpx/web e2e -- --grep "support"
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

test.describe('Trigger flow', () => {
  test.skip(
    !PERSONAS.day3.email || !PERSONAS.day3.password,
    'Skipped: PW_DAY3_EMAIL / PW_DAY3_PASSWORD not set in .env.test.local',
  );

  test('quick support chip → trigger page loads → exit returns to dashboard', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/dashboard');
    await page.waitForLoadState('networkidle');

    // Navigate directly to trigger entry (chip tap on dashboard fires initiate_trigger_support)
    await page.goto('/en/mitra/trigger');
    await page.waitForLoadState('networkidle');

    // Exit button is present (not during sound_bridge)
    await expect(page.getByTestId('trigger-exit-btn')).toBeVisible({ timeout: 8_000 });

    // Exit returns to dashboard
    await page.getByTestId('trigger-exit-btn').click();
    await expect(page).toHaveURL(/\/en\/mitra\/dashboard/, { timeout: 8_000 });
  });

  test('trigger page has trigger-entry-btn or sound_bridge transient', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/trigger');
    await page.waitForLoadState('networkidle');

    // One of these two should be visible
    const hasEntry = await page.getByTestId('trigger-entry-btn').isVisible().catch(() => false);
    const hasBridge = await page.getByTestId('sound-bridge-transient').isVisible().catch(() => false);
    expect(hasEntry || hasBridge).toBe(true);
  });

  test('sound_bridge page hides exit button', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/engine?containerId=support_trigger&stateId=sound_bridge');
    await page.waitForLoadState('networkidle');

    // trigger-exit-btn should be hidden on sound_bridge state
    await expect(page.getByTestId('trigger-exit-btn')).not.toBeVisible();
  });
});

test.describe('Check-in flow', () => {
  test.skip(
    !PERSONAS.day3.email || !PERSONAS.day3.password,
    'Skipped: PW_DAY3_EMAIL / PW_DAY3_PASSWORD not set in .env.test.local',
  );

  test('checkin page loads notice step with exit button', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/checkin');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('checkin-exit-btn')).toBeVisible({ timeout: 8_000 });
    await expect(page.getByTestId('checkin-regulation-block')).toBeVisible({ timeout: 8_000 });
  });

  test('exit button on checkin returns to dashboard', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/checkin');
    await page.waitForLoadState('networkidle');

    const exitBtn = page.getByTestId('checkin-exit-btn');
    await expect(exitBtn).toBeVisible({ timeout: 8_000 });
    await exitBtn.click();
    await expect(page).toHaveURL(/\/en\/mitra\/dashboard/, { timeout: 8_000 });
  });

  test('balanced_ack hides exit button', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/engine?containerId=support_checkin&stateId=balanced_ack');
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('checkin-exit-btn')).not.toBeVisible();
    await expect(page.getByTestId('balanced-ack-overlay')).toBeVisible({ timeout: 8_000 });
  });
});

test.describe('Room flow', () => {
  test.skip(
    !PERSONAS.day3.email || !PERSONAS.day3.password,
    'Skipped: PW_DAY3_EMAIL / PW_DAY3_PASSWORD not set in .env.test.local',
  );

  test('joy room loads renderer with exit button', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/room/joy');
    await page.waitForLoadState('networkidle');

    // Exit button always visible
    await expect(page.getByTestId('room-exit-btn')).toBeVisible({ timeout: 10_000 });

    // Room renderer or fallback should be visible
    const hasRenderer = await page.getByTestId('room-renderer-room_joy').isVisible().catch(() => false);
    const hasUnavailable = await page.getByTestId('room-unavailable-return').isVisible().catch(() => false);
    expect(hasRenderer || hasUnavailable).toBe(true);
  });

  test('room exit button returns to dashboard', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/room/joy');
    await page.waitForLoadState('networkidle');

    const exitBtn = page.getByTestId('room-exit-btn');
    await expect(exitBtn).toBeVisible({ timeout: 10_000 });
    await exitBtn.click();
    await expect(page).toHaveURL(/\/en\/mitra\/dashboard/, { timeout: 8_000 });
  });

  test('clarity room shows context picker before render', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/room/clarity');
    await page.waitForLoadState('networkidle');

    // Clarity is in ROOMS_WITH_CONTEXT_PICKER — should see picker first
    const hasPicker = await page.getByTestId('life-context-picker').isVisible().catch(() => false);
    const hasRenderer = await page.getByTestId('room-renderer-room_clarity').isVisible().catch(() => false);
    // One of them must be visible (picker if no prior context, renderer if context was set)
    expect(hasPicker || hasRenderer).toBe(true);
  });

  test('context picker skip navigates to room render', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/room/clarity');
    await page.waitForLoadState('networkidle');

    const picker = page.getByTestId('life-context-picker');
    if (!(await picker.isVisible().catch(() => false))) {
      test.skip(); // Picker not shown — context already set, skip
      return;
    }

    await page.getByTestId('context-picker-skip').click();

    // After skip, should show renderer or fallback (loading → render)
    await expect(page.getByTestId('room-exit-strip')).toBeVisible({ timeout: 10_000 });
  });

  test('grief room skips context picker (no picker for grief)', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/room/grief');
    await page.waitForLoadState('networkidle');

    // grief is not in ROOMS_WITH_CONTEXT_PICKER — no picker
    await expect(page.getByTestId('life-context-picker')).not.toBeVisible();
    // exit button should be visible
    await expect(page.getByTestId('room-exit-btn')).toBeVisible({ timeout: 10_000 });
  });

  test('backend failure shows fallback with return button', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);

    // Navigate to a nonexistent room to force backend 404 → fallback
    await page.goto('/en/mitra/room/nonexistent_room_xyz');
    await page.waitForLoadState('networkidle');

    // Either the fallback "Return to dashboard" or the unavailable card should show
    const hasFallback = await page.getByTestId('room-unavailable-return').isVisible().catch(() => false);
    const hasExitAction = await page.getByText(/return to mitra home/i).isVisible().catch(() => false);
    const hasExit = await page.getByTestId('room-exit-btn').isVisible().catch(() => false);
    expect(hasFallback || hasExitAction || hasExit).toBe(true);
  });
});

test.describe('Support — safe exit invariants', () => {
  test.skip(
    !PERSONAS.day3.email || !PERSONAS.day3.password,
    'Skipped: PW_DAY3_EMAIL / PW_DAY3_PASSWORD not set in .env.test.local',
  );

  test('no crash visible on trigger page', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/trigger');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/something went wrong|failed to load|could not load/i)).not.toBeVisible();
  });

  test('no crash visible on checkin page', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/checkin');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/something went wrong|failed to load|could not load/i)).not.toBeVisible();
  });

  test('no crash visible on joy room page', async ({ page }) => {
    await loginWithCredentials(page, PERSONAS.day3.email, PERSONAS.day3.password);
    await page.goto('/en/mitra/room/joy');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText(/something went wrong|failed to load|could not load/i)).not.toBeVisible();
  });
});
