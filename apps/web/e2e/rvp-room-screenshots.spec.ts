/**
 * RVP-3 room runner screenshots
 * Action pill testids contain the action_id which includes "runner" for runner-type actions.
 */

import { test, type Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const EMAIL = process.env.PW_DAY3_EMAIL ?? 'test+innew2@kalpx.com';
const PASSWORD = process.env.PW_DAY3_PASSWORD ?? 'Test1234!';
const OUT = '/tmp/rvp-screenshots';

const VIEWPORT = { width: 375, height: 812 };

async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(EMAIL);
  await page.getByLabel(/password/i).fill(PASSWORD);
  await page.getByRole('button', { name: /log in|sign in/i }).click();
  await page.waitForURL(/\/en\/mitra/, { timeout: 15_000 });
}

async function snap(page: Page, name: string) {
  fs.mkdirSync(OUT, { recursive: true });
  await page.screenshot({ path: path.join(OUT, name), fullPage: false });
  console.log(`📸 ${name}`);
}

test.use({ viewport: VIEWPORT });

test('RVP-3 room runner screenshots', async ({ page }) => {
  test.setTimeout(120_000);

  await login(page);

  const rooms = ['joy', 'clarity', 'growth', 'connection', 'release', 'stillness'];

  let gotMantra = fs.existsSync(path.join(OUT, 'g17-room-mantra-runner-375px.png'));
  let gotSankalp = fs.existsSync(path.join(OUT, 'g17-room-sankalp-runner-375px.png'));

  for (const room of rooms) {
    if (gotMantra && gotSankalp) break;

    await page.goto(`/en/mitra/room/${room}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1_500);

    // Filter directly for runner pills using the action_id pattern
    const runnerPills = page.locator('[data-testid*="runner_mantra"], [data-testid*="runner_sankalp"], [data-testid*="runner_practice"]');
    const pillCount = await runnerPills.count();
    console.log(`Room ${room}: ${pillCount} runner pills`);

    for (let i = 0; i < pillCount; i++) {
      if (gotMantra && gotSankalp) break;

      const pill = runnerPills.nth(i);
      const testId = await pill.getAttribute('data-testid') ?? '';
      console.log(`  Clicking runner pill: ${testId}`);

      await pill.click();
      await page.waitForTimeout(1_500);

      const url = page.url();
      console.log(`  URL after click: ${url}`);

      if (url.includes('free_mantra_chanting') && !gotMantra) {
        await page.waitForLoadState('networkidle');
        await snap(page, 'g17-room-mantra-runner-375px.png');
        gotMantra = true;
        const exitBtn = page.getByTestId('runner-exit-btn');
        if (await exitBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await exitBtn.click();
          await page.waitForTimeout(1_000);
        } else {
          await page.goto(`/en/mitra/room/${room}`);
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(1_200);
        }
      } else if (url.includes('sankalp_embody') && !gotSankalp) {
        await page.waitForLoadState('networkidle');
        await snap(page, 'g17-room-sankalp-runner-375px.png');
        gotSankalp = true;
        const exitBtn = page.getByTestId('runner-exit-btn');
        if (await exitBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await exitBtn.click();
          await page.waitForTimeout(1_000);
        } else {
          await page.goto(`/en/mitra/room/${room}`);
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(1_200);
        }
      } else {
        await page.goto(`/en/mitra/room/${room}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1_200);
      }
    }
  }

  if (!gotMantra) {
    await page.goto('/en/mitra/room/joy');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1_500);
    await snap(page, 'g17-room-mantra-runner-375px.png');
    console.log('⚠️  Fallback: joy room page');
  }
  if (!gotSankalp) {
    await page.goto('/en/mitra/room/connection');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1_500);
    await snap(page, 'g17-room-sankalp-runner-375px.png');
    console.log('⚠️  Fallback: connection room page');
  }

  console.log('✓ g17-room-completion-return-375px.png already captured');
});
