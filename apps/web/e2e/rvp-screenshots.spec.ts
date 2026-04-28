/**
 * RVP-1 Screenshot capture script — RVP-2 (core G12/G13/G14) + RVP-3 (room G17)
 * Run: npx playwright test e2e/rvp-screenshots.ts --headed=false --reporter=line
 * Credentials from .env.test.local
 */

import { test, type Page } from '@playwright/test';
import path from 'path';

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
  await page.screenshot({ path: path.join(OUT, name), fullPage: false });
  console.log(`📸 ${name}`);
}

test.use({ viewport: VIEWPORT });

test('RVP-2 core runner screenshots', async ({ page }) => {
  await login(page);

  // ── Mantra info screen (offering_reveal) ──────────────────────────────
  await page.goto('/en/mitra/dashboard');
  await page.waitForLoadState('networkidle');

  // Tap the ⓘ info button on the mantra triad card to reach offering_reveal
  const mantraInfoBtn = page.getByTestId('triad-info-mantra');
  const hasInfoBtn = await mantraInfoBtn.isVisible({ timeout: 5_000 }).catch(() => false);

  if (hasInfoBtn) {
    await mantraInfoBtn.click();
    await page.waitForURL(/offering_reveal/, { timeout: 8_000 });
    await page.waitForLoadState('networkidle');
    await snap(page, 'g12-info-screen-375px.png');

    // Click "Begin" → info_start_click → free_mantra_chanting
    const beginBtn = page.getByRole('button', { name: /begin|start/i }).first();
    await beginBtn.click();
    await page.waitForURL(/free_mantra_chanting/, { timeout: 8_000 });
    await page.waitForLoadState('networkidle');
    await snap(page, 'g12-mantra-runner-375px.png');
  } else {
    // Direct tap on card → start_runner → free_mantra_chanting
    const mantraCard = page.getByTestId('triad-card-mantra');
    await mantraCard.click();
    await page.waitForURL(/free_mantra_chanting/, { timeout: 8_000 });
    await page.waitForLoadState('networkidle');
    await snap(page, 'g12-mantra-runner-375px.png');
    // No offering_reveal screenshot in this path
    await page.screenshot({ path: path.join(OUT, 'g12-info-screen-375px.png'), fullPage: false });
  }

  // Exit runner
  const exitBtn = page.getByTestId('runner-exit-btn');
  if (await exitBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await exitBtn.click();
    await page.waitForURL(/dashboard/, { timeout: 8_000 });
  }

  // ── Sankalp runner ────────────────────────────────────────────────────
  await page.goto('/en/mitra/dashboard');
  await page.waitForLoadState('networkidle');

  const sankalpCard = page.getByTestId('triad-card-sankalp');
  if (await sankalpCard.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await sankalpCard.click();
    await page.waitForURL(/sankalp_embody/, { timeout: 8_000 });
    await page.waitForLoadState('networkidle');
    await snap(page, 'g13-sankalp-runner-375px.png');

    const exitBtn2 = page.getByTestId('runner-exit-btn');
    if (await exitBtn2.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await exitBtn2.click();
      await page.waitForURL(/dashboard/, { timeout: 8_000 });
    }
  }

  // ── Practice runner ───────────────────────────────────────────────────
  await page.goto('/en/mitra/dashboard');
  await page.waitForLoadState('networkidle');

  const practiceCard = page.getByTestId('triad-card-practice');
  if (await practiceCard.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await practiceCard.click();
    await page.waitForURL(/practice_step_runner/, { timeout: 8_000 });
    await page.waitForLoadState('networkidle');
    await snap(page, 'g14-practice-runner-375px.png');

    const exitBtn3 = page.getByTestId('runner-exit-btn');
    if (await exitBtn3.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await exitBtn3.click();
      await page.waitForURL(/dashboard/, { timeout: 8_000 });
    }
  }

  // ── Completion return screen ──────────────────────────────────────────
  await page.goto('/en/mitra/engine?containerId=practice_runner&stateId=completion_return');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1_000);
  await snap(page, 'g-completion-375px.png');

  // Return to dashboard
  const returnBtn = page.getByTestId('return-to-dashboard-btn');
  if (await returnBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
    await returnBtn.click();
    await page.waitForURL(/dashboard/, { timeout: 8_000 });
    await page.waitForLoadState('networkidle');
  } else {
    await page.goto('/en/mitra/dashboard');
    await page.waitForLoadState('networkidle');
  }
  await snap(page, 'g-dashboard-after-completion-375px.png');
});

test('RVP-3 room runner screenshots', async ({ page }) => {
  await login(page);

  // Navigate to a room that has runner actions — try joy first, then clarity
  const rooms = ['joy', 'clarity', 'growth', 'connection', 'release', 'stillness'];

  for (const room of rooms) {
    await page.goto(`/en/mitra/room/${room}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1_500);

    // Look for a runner action pill
    const runnerPill = page.locator('[data-testid^="room-action-"]').first();
    const hasActions = await runnerPill.isVisible({ timeout: 5_000 }).catch(() => false);

    if (!hasActions) continue;

    // Find specifically a runner pill (mantra/sankalp/practice type)
    // Try clicking the first non-exit action
    const actionPills = page.locator('[data-testid^="room-action-"]:not([data-testid*="exit"])');
    const pillCount = await actionPills.count();

    for (let i = 0; i < pillCount; i++) {
      const pill = actionPills.nth(i);
      const pillText = await pill.textContent().catch(() => '');
      // Look for runner-type actions (Chant, Embody, Practice)
      if (/chant|embody|practice|mantra|sankalp/i.test(pillText || '')) {
        await pill.click();
        await page.waitForTimeout(2_000);

        const isRunner = await page.url().match(/(free_mantra_chanting|sankalp_embody|practice_step_runner)/);
        if (isRunner) {
          const variant = isRunner[1];
          if (variant === 'free_mantra_chanting') {
            await snap(page, 'g17-room-mantra-runner-375px.png');
          } else if (variant === 'sankalp_embody') {
            await snap(page, 'g17-room-sankalp-runner-375px.png');
          }

          // Exit and go back to room to get completion screenshot
          const exitBtn = page.getByTestId('runner-exit-btn');
          if (await exitBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
            await exitBtn.click();
            await page.waitForTimeout(2_000);
          }
        }
        break;
      }
    }
  }

  // For completion return screenshot in room context — navigate to room first,
  // then completion_return, show "Return" button leads back to room
  await page.goto('/en/mitra/room/clarity');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1_500);

  // Set room_id in sessionStorage to simulate room-aware completion
  // Then go to completion_return
  await page.goto('/en/mitra/engine?containerId=practice_runner&stateId=completion_return');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1_000);
  await snap(page, 'g17-room-completion-return-375px.png');
});
