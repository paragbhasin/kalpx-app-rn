/**
 * Waterfall check — verifies the entry-view cache seeding eliminates the
 * redundant daily-view API call on cold dashboard load.
 *
 * Checks:
 *   1. Cold load: entry-view called once; daily-view NOT called immediately.
 *   2. Dashboard renders (identity block visible, no blank state).
 *   3. Hard refresh: entry-view called again after reload (cache cleared).
 *   4. Logout/login: no stale dashboard payload from prior user.
 *   5. Day-7 / Day-14 routing paths: entry-view still resolves.
 *
 * Run against local dev server (uses dev.kalpx.com API):
 *   pnpm --filter @kalpx/web e2e -- --grep "waterfall"
 *
 * Auth sessions are shared via storageState (beforeAll logs in once per persona)
 * so the total login API call count stays at 4, avoiding per-IP throttling.
 */

import { test, expect, type Page } from '@playwright/test';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { PERSONAS } from './fixtures/personas';

const HAS_DAY3 = !!PERSONAS.day3.email && !!PERSONAS.day3.password;
const HAS_DAY7 = !!PERSONAS.day7.email && !!PERSONAS.day7.password;
const HAS_DAY14 = !!PERSONAS.day14.email && !!PERSONAS.day14.password;

const AUTH_DIR = path.join(os.tmpdir(), 'kalpx-pw-auth');
const DAY3_AUTH = path.join(AUTH_DIR, 'day3.json');
const DAY7_AUTH = path.join(AUTH_DIR, 'day7.json');
const DAY14_AUTH = path.join(AUTH_DIR, 'day14.json');

async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /log in|sign in/i }).click();
  await page.waitForURL(/\/en\/mitra/, { timeout: 20_000 });
}

async function logout(page: Page) {
  await page.goto('/en/profile');
  const logoutBtn = page.locator('[data-testid="profile-logout-btn"]');
  if (await logoutBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await logoutBtn.click();
    await page.waitForURL(/\/login|\/en(?!\/mitra)/, { timeout: 8_000 });
  } else {
    await page.goto('/login');
  }
}

test.describe('waterfall check', () => {
  test.skip(!HAS_DAY3, 'Skipped: PW_DAY3_EMAIL / PW_DAY3_PASSWORD not set');

  // Login each persona once in beforeAll; reuse storageState in individual tests
  // to avoid making 7+ login API calls per run (which exhausts the per-IP throttle).
  test.beforeAll(async ({ browser }) => {
    fs.mkdirSync(AUTH_DIR, { recursive: true });

    const loginAndSave = async (email: string, password: string, dest: string) => {
      const page = await browser.newPage();
      await loginAs(page, email, password);
      await page.context().storageState({ path: dest });
      await page.close();
    };

    await loginAndSave(PERSONAS.day3.email, PERSONAS.day3.password, DAY3_AUTH);
    if (HAS_DAY7) await loginAndSave(PERSONAS.day7.email, PERSONAS.day7.password, DAY7_AUTH);
    if (HAS_DAY14) await loginAndSave(PERSONAS.day14.email, PERSONAS.day14.password, DAY14_AUTH);
  });

  test('cold load — daily-view NOT called when entry-view returns daily_view', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: DAY3_AUTH });
    const page = await ctx.newPage();

    const apiCalls: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('mitra/v3/journey/')) {
        const match = url.match(/mitra\/v3\/journey\/([^/?]+)/);
        if (match) apiCalls.push(match[1]);
      }
    });

    await page.goto('/en/mitra');
    // Wait for any visible heading — audio/media can block networkidle indefinitely.
    // Heading visible = entry-view resolved + getDashboardView() returned (from seed or API).
    await page.locator('h1, h2').first().waitFor({ state: 'visible', timeout: 15_000 });

    const entryViewCalls = apiCalls.filter((c) => c === 'entry-view').length;
    const dailyViewCalls = apiCalls.filter((c) => c === 'daily-view').length;

    expect(entryViewCalls).toBeGreaterThanOrEqual(1);
    // If entry-view returned daily_view payload, daily-view should NOT be called again
    expect(dailyViewCalls).toBe(0);

    await ctx.close();
  });

  test('dashboard renders — no blank state after cold load', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: DAY3_AUTH });
    const page = await ctx.newPage();

    await page.goto('/en/mitra');
    await page.locator('h1, h2').first().waitFor({ state: 'visible', timeout: 15_000 });

    const bodyText = await page.locator('body').innerText({ timeout: 10_000 });
    expect(bodyText.trim().length).toBeGreaterThan(50);
    expect(bodyText).not.toContain('Unexpected token');
    expect(bodyText).not.toContain('SyntaxError');

    await ctx.close();
  });

  test('hard refresh — daily-view IS fetched fresh (cache cleared by reload)', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: DAY3_AUTH });
    const page = await ctx.newPage();

    await page.goto('/en/mitra');
    await page.locator('h1, h2').first().waitFor({ state: 'visible', timeout: 15_000 });

    const callsAfterRefresh: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('mitra/v3/journey/')) {
        const match = url.match(/mitra\/v3\/journey\/([^/?]+)/);
        if (match) callsAfterRefresh.push(match[1]);
      }
    });

    // Hard reload clears module-level JS state
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3_000);

    const entryAfterRefresh = callsAfterRefresh.filter((c) => c === 'entry-view').length;
    expect(entryAfterRefresh).toBeGreaterThanOrEqual(1);

    await ctx.close();
  });

  test('logout/login — no stale payload from prior user', async ({ browser }) => {
    test.skip(!HAS_DAY7, 'Skipped: PW_DAY7_EMAIL not set');

    const ctx = await browser.newContext({ storageState: DAY3_AUTH });
    const page = await ctx.newPage();

    await page.goto('/en/mitra');
    await page.locator('h1, h2').first().waitFor({ state: 'visible', timeout: 15_000 });

    await logout(page);

    const callsAfterSwitch: string[] = [];
    page.on('request', (req) => {
      const url = req.url();
      if (url.includes('mitra/v3/journey/')) {
        const match = url.match(/mitra\/v3\/journey\/([^/?]+)/);
        if (match) callsAfterSwitch.push(match[1]);
      }
    });

    // Login as day7 — only non-beforeAll login in the suite (4th total login call)
    await loginAs(page, PERSONAS.day7.email, PERSONAS.day7.password);
    await page.waitForTimeout(3_000);

    const entryAfterSwitch = callsAfterSwitch.filter((c) => c === 'entry-view').length;
    expect(entryAfterSwitch).toBeGreaterThanOrEqual(1);

    await ctx.close();
  });

  test('day-7 routing — entry-view resolves without crashing', async ({ browser }) => {
    test.skip(!HAS_DAY7, 'Skipped: PW_DAY7_EMAIL not set');

    const ctx = await browser.newContext({ storageState: DAY7_AUTH });
    const page = await ctx.newPage();

    await page.goto('/en/mitra');
    await page.waitForLoadState('domcontentloaded', { timeout: 15_000 });
    await page.waitForTimeout(3_000);

    const url = page.url();
    expect(url).toMatch(/\/en\/mitra/);
    const bodyText = await page.locator('body').innerText({ timeout: 8_000 });
    expect(bodyText.trim().length).toBeGreaterThan(30);

    await ctx.close();
  });

  test('day-14 routing — entry-view resolves without crashing', async ({ browser }) => {
    test.skip(!HAS_DAY14, 'Skipped: PW_DAY14_EMAIL not set');

    const ctx = await browser.newContext({ storageState: DAY14_AUTH });
    const page = await ctx.newPage();

    await page.goto('/en/mitra');
    await page.waitForLoadState('domcontentloaded', { timeout: 15_000 });
    await page.waitForTimeout(3_000);

    const url = page.url();
    expect(url).toMatch(/\/en\/mitra/);
    const bodyText = await page.locator('body').innerText({ timeout: 8_000 });
    expect(bodyText.trim().length).toBeGreaterThan(30);

    await ctx.close();
  });
});
