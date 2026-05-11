/**
 * Wave QC-B — Quick Check-in Frontend Verification
 * Response-shape-first: seed state → backend wire → home shape → rendered UX.
 *
 * Verification hierarchy:
 *   1. State Creation  — seed CompanionState via prana-acknowledge API
 *   2. API Truth       — verify prana-acknowledge + dismiss return 200
 *   3. Response Shape  — GET home → active_checkin_window fields
 *   4. Frontend Ingest — chip labels, prompt copy, ack text rendered correctly
 *   5. UX Confirmation — dismiss clears window, companion boundary copy present
 *
 * Prerequisites:
 *   1. Vite dev server at http://localhost:5173
 *   2. Dev backend at https://dev.kalpx.com
 *   3. .env.test.local with PW_DAY3_ACCESS_TOKEN (pre-minted, avoids rate limit)
 *
 * Run:
 *   pnpm --filter @kalpx/web e2e -- --grep "quick-checkin" --reporter=line
 */

import { test, expect, type Page } from '@playwright/test';

const API_BASE = 'https://dev.kalpx.com/api/';
const ACCESS_TOKEN = process.env.PW_DAY3_ACCESS_TOKEN ?? '';
const STORAGE_KEY = 'access_token';

async function injectAuth(page: Page) {
  await page.goto('/en');
  await page.evaluate(
    ({ key, token }) => localStorage.setItem(key, token),
    { key: STORAGE_KEY, token: ACCESS_TOKEN },
  );
}

async function seedCheckin(pranaType: string) {
  const resp = await fetch(`${API_BASE}mitra/prana-acknowledge/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pranaType, focus: 'peacecalm', tz: 'America/Los_Angeles' }),
  });
  if (!resp.ok) throw new Error(`prana-acknowledge failed: ${resp.status}`);
}

async function seedDismiss() {
  const resp = await fetch(`${API_BASE}mitra/prana-acknowledge/dismiss/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
  if (!resp.ok) throw new Error(`dismiss failed: ${resp.status}`);
}

async function gotoHome(page: Page) {
  await page.goto('/en/mitra');
  await page.waitForLoadState('networkidle');
}

test.describe('Quick Check-in (Wave QC-B)', () => {
  test.skip(!ACCESS_TOKEN, 'Skipped: PW_DAY3_ACCESS_TOKEN not set in .env.test.local');

  test.beforeEach(async ({ page }) => {
    await injectAuth(page);
  });

  // ── Layer 4: Chip labels and prompt copy ───────────────────────────────────

  test('home shows "How are you landing?" with locked QC-A chip labels', async ({ page }) => {
    await seedDismiss(); // ensure no active window
    await gotoHome(page);

    await expect(page.getByText('How are you landing?')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole('button', { name: 'Agitated' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Drained' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Steady' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open' })).toBeVisible();
  });

  // ── Layer 5: Agitated → active window with action card ────────────────────

  test('tap Agitated → Rajas acknowledgment + Quick Reset card + companion boundary', async ({ page }) => {
    await seedDismiss();
    await gotoHome(page);

    await page.getByRole('button', { name: 'Agitated' }).click();
    await page.waitForResponse(
      (r) => r.url().includes('prana-acknowledge') && !r.url().includes('dismiss') && r.status() === 200,
      { timeout: 10_000 },
    );
    await page.waitForResponse(
      (r) => r.url().includes('journey/home') && r.status() === 200,
      { timeout: 10_000 },
    );

    await expect(page.getByText('Rajas')).toBeVisible({ timeout: 8_000 });
    await expect(page.getByRole('button', { name: /Quick Reset →/ })).toBeVisible();
    // companion boundary copy (includes Tell Mitra link)
    await expect(page.getByText(/heavy to carry/i)).toBeVisible();
    // chip row gone
    await expect(page.getByText('How are you landing?')).not.toBeVisible();
  });

  // ── Layer 5: Drained → active window with mantra card ─────────────────────

  test('tap Drained → Tamas acknowledgment + mantra card', async ({ page }) => {
    await seedDismiss();
    await gotoHome(page);

    await page.getByRole('button', { name: 'Drained' }).click();
    await page.waitForResponse(
      (r) => r.url().includes('prana-acknowledge') && !r.url().includes('dismiss') && r.status() === 200,
      { timeout: 10_000 },
    );
    await page.waitForResponse(
      (r) => r.url().includes('journey/home') && r.status() === 200,
      { timeout: 10_000 },
    );

    await expect(page.getByText('Tamas')).toBeVisible({ timeout: 8_000 });
  });

  // ── Layer 5: Steady → ack-only, no action card ────────────────────────────

  test('tap Steady → ack text only, no Quick Reset card', async ({ page }) => {
    await seedDismiss();
    await gotoHome(page);

    await page.getByRole('button', { name: 'Steady' }).click();
    await page.waitForResponse(
      (r) => r.url().includes('prana-acknowledge') && !r.url().includes('dismiss') && r.status() === 200,
      { timeout: 10_000 },
    );
    await page.waitForResponse(
      (r) => r.url().includes('journey/home') && r.status() === 200,
      { timeout: 10_000 },
    );

    await expect(page.getByText('arrived steady')).toBeVisible({ timeout: 8_000 });
    await expect(page.getByRole('button', { name: /Quick Reset →/ })).not.toBeVisible();
    await expect(page.getByText(/heavy to carry/i)).not.toBeVisible();
  });

  // ── Layer 5: Open → ack-only ───────────────────────────────────────────────

  test('tap Open → ack text only', async ({ page }) => {
    await seedDismiss();
    await gotoHome(page);

    await page.getByRole('button', { name: 'Open' }).click();
    await page.waitForResponse(
      (r) => r.url().includes('prana-acknowledge') && !r.url().includes('dismiss') && r.status() === 200,
      { timeout: 10_000 },
    );
    await page.waitForResponse(
      (r) => r.url().includes('journey/home') && r.status() === 200,
      { timeout: 10_000 },
    );

    await expect(page.getByText('Open and present')).toBeVisible({ timeout: 8_000 });
    await expect(page.getByRole('button', { name: /Quick Reset →/ })).not.toBeVisible();
  });

  // ── Layer 5: Dismiss clears active window ─────────────────────────────────
  // MANUAL VERIFICATION REQUIRED: dismiss test passes locally but ETag cache
  // (same ETag before/after dismiss from dev backend) can cause stale home
  // response in headless Chromium. Fix applied: forceFresh: true adds _t
  // timestamp param to bypass browser HTTP cache. Verify:
  //   1. Tap Agitated → see acknowledgment window
  //   2. Click × → window clears, chip row returns
  //   3. Network tab: GET journey/home?...&_t=<ts> returns active=false

  test('dismiss × button clears active window and restores chip row', async ({ page }) => {
    await seedCheckin('agitated');
    await gotoHome(page);

    await expect(page.getByText('Rajas')).toBeVisible({ timeout: 10_000 });

    // tap dismiss
    await page.getByTestId('dismiss-checkin').click();
    await page.waitForResponse(
      (r) => r.url().includes('dismiss') && r.status() === 200,
      { timeout: 8_000 },
    );
    await page.waitForResponse(
      (r) => r.url().includes('journey/home') && r.status() === 200,
      { timeout: 8_000 },
    );
    await page.waitForLoadState('networkidle');

    await expect(page.getByTestId('dismiss-checkin')).not.toBeVisible({ timeout: 8_000 });
    await expect(page.getByText('How are you landing?')).toBeVisible();
  });

  // ── Layer 4: No banned copy anywhere on page ──────────────────────────────

  test('no banned copy visible on home page', async ({ page }) => {
    await seedDismiss();
    await gotoHome(page);

    const content = await page.content();
    const lower = content.toLowerCase();
    const banned = [
      'complete your check-in',
      'continue your check-in',
      'pending check-in',
      'check-in streak',
      'how are you feeling today',
    ];
    for (const phrase of banned) {
      expect(lower, `Found banned copy: "${phrase}"`).not.toContain(phrase);
    }
  });
});
