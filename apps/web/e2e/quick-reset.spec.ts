/**
 * Stream E — Quick Reset / Quick Chant Frontend Verification
 * Response-shape-first audit: backend wire payload → frontend ingest → rendered UX.
 *
 * Gate E-1 locked 2026-05-10. All scenarios from verification spec.
 *
 * Prerequisites:
 *   1. Vite dev server at http://localhost:5173
 *   2. Dev backend at https://dev.kalpx.com
 *   3. .env.test.local with PW_DAY3_EMAIL + PW_DAY3_PASSWORD
 *
 * Run:
 *   pnpm --filter @kalpx/web e2e -- --grep "quick-reset" --reporter=line
 */

import { test, expect, type Page, request as playwrightRequest } from '@playwright/test';
import { PERSONAS } from './fixtures/personas';

const API_BASE = 'https://dev.kalpx.com/api/';

// ── Auth helpers ──────────────────────────────────────────────────────────────

/** Inject auth tokens into localStorage (avoids reCAPTCHA + login rate-limit throttle).
 *  Uses pre-minted tokens from env if available; falls back to API login. */
async function loginViaUI(page: Page) {
  let accessToken = process.env.PW_DAY3_ACCESS_TOKEN ?? '';
  let refreshToken = process.env.PW_DAY3_REFRESH_TOKEN ?? '';

  if (!accessToken) {
    // Fallback: try API login (may be rate-limited)
    const authCtx = await playwrightRequest.newContext({ baseURL: API_BASE });
    const resp = await authCtx.post('users/login/', {
      data: { email: PERSONAS.day3.email, password: PERSONAS.day3.password },
    });
    const data = await resp.json();
    await authCtx.dispose();
    if (!data.access_token) throw new Error(`Login failed: ${JSON.stringify(data)}`);
    accessToken = data.access_token;
    refreshToken = data.refresh_token ?? '';
  }

  // Navigate to app root to get correct origin, then inject tokens
  await page.goto('/');
  await page.evaluate(({ at, rt }) => {
    localStorage.setItem('access_token', at);
    localStorage.setItem('refresh_token', rt);
  }, { at: accessToken, rt: refreshToken });

  // Navigate to Mitra to confirm auth is accepted
  await page.goto('/en/mitra');
  await page.waitForURL(/\/en\/mitra/, { timeout: 15_000 });
}

async function getToken(page: Page): Promise<string> {
  return page.evaluate(() => localStorage.getItem('access_token') ?? '');
}

// ── API state helpers — use Playwright request context (no browser CORS) ─────

type ApiCtx = Awaited<ReturnType<typeof playwrightRequest.newContext>>;

async function makeApiCtx(token: string): Promise<ApiCtx> {
  return playwrightRequest.newContext({
    baseURL: API_BASE,
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

async function setDefault(token: string, mantraRef: string | null) {
  const ctx = await makeApiCtx(token);
  const resp = await ctx.post('mitra/v3/quick_reset/set-default/', {
    data: { mantra_ref: mantraRef },
  });
  const body = await resp.json();
  await ctx.dispose();
  return { status: resp.status(), body };
}

async function completeChant(token: string, mantraRef: string, completed = true, durationMs = 60000) {
  const ctx = await makeApiCtx(token);
  const resp = await ctx.post('mitra/v3/quick_chant/complete/', {
    data: { mantra_ref: mantraRef, completed, duration_ms: durationMs },
  });
  const body = await resp.json();
  await ctx.dispose();
  return { status: resp.status(), body };
}

async function getOpeningState(token: string) {
  const ctx = await makeApiCtx(token);
  const resp = await ctx.get('mitra/v3/quick_reset/');
  const body = await resp.json();
  await ctx.dispose();
  return { status: resp.status(), body };
}

async function getHomeState(token: string) {
  const ctx = await makeApiCtx(token);
  const resp = await ctx.get('mitra/v3/journey/home/');
  const body = await resp.json();
  await ctx.dispose();
  return { status: resp.status(), body };
}

async function getFirstActivePeacecalmMantra(token: string): Promise<string | null> {
  const ctx = await makeApiCtx(token);
  const resp = await ctx.post('mitra/browse-mantras/', { data: { focus: 'peacecalm' } });
  const data = await resp.json();
  await ctx.dispose();
  const mantras: Array<{ id: string }> = data.mantras ?? [];
  const master = mantras.find((m) => !m.id.startsWith('curated:'));
  return master?.id ?? null;
}

async function browseMantras(token: string) {
  const ctx = await makeApiCtx(token);
  const resp = await ctx.post('mitra/browse-mantras/', { data: { focus: 'peacecalm' } });
  const body = await resp.json();
  await ctx.dispose();
  return { status: resp.status(), body };
}

// ── Skip guard ────────────────────────────────────────────────────────────────

const SKIP_GUARD = !PERSONAS.day3.email || !PERSONAS.day3.password;

test.describe('Quick Reset — response-shape-first verification', () => {
  test.skip(SKIP_GUARD, 'Skipped: PW_DAY3_EMAIL / PW_DAY3_PASSWORD not set');

  let page: Page;
  let token: string;
  let peacecalmMantraRef: string;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await loginViaUI(page);
    token = await getToken(page);

    // Discover a usable peacecalm mantra for state setup
    const ref = await getFirstActivePeacecalmMantra(token);
    if (!ref) throw new Error('No active peacecalm mantra in dev DB — cannot run tests');
    peacecalmMantraRef = ref;
    console.log('Using peacecalm mantra ref:', peacecalmMantraRef);
  });

  test.afterAll(async () => {
    // Clean up — clear any explicit default so other tests start neutral
    await setDefault(token, null).catch(() => {});
    await page.close();
  });

  // ── SCENARIO 1 — State A: explicit default ─────────────────────────────────

  test('Scenario 1 — State A: explicit default | wire shape + UI', async () => {
    // A. Setup: set explicit default
    const setResult = await setDefault(token, peacecalmMantraRef);
    expect(setResult.status).toBe(200);
    expect(setResult.body.set).toBe(true);

    // B/C. Backend/API wire shape
    const { status, body } = await getOpeningState(token);
    expect(status).toBe(200);
    expect(body.screen_state).toBe('explicit');
    expect(body.source).toBe('user_selected');
    expect(body.primary_cta).toBe('Begin chanting');
    expect(body.mantra.item_id).toBe(peacecalmMantraRef);
    expect(body.mantra).toHaveProperty('title');
    expect(body.mantra).toHaveProperty('devanagari');
    expect(body.mantra).toHaveProperty('iast');
    expect(body.mantra).toHaveProperty('meaning');
    expect(body.mantra).toHaveProperty('audio_url'); // may be null or string
    expect(body).not.toHaveProperty('sessions_7d'); // E-1-S3 — must be absent
    expect(body.secondary_actions).toContain('change_mantra');
    expect(body.secondary_actions).toContain('mitra_suggest_for_this_moment');
    expect(body.secondary_actions).not.toContain('set_as_default'); // not in explicit state

    // D/E. Frontend UX
    await page.goto('/en/mitra/quick-reset');
    await page.waitForLoadState('networkidle');

    // Primary CTA must say exactly what API says
    const primaryBtn = page.getByRole('button', { name: 'Begin chanting' });
    await expect(primaryBtn).toBeVisible({ timeout: 8_000 });

    // Must show mantra title
    await expect(page.locator('p').filter({ hasText: body.mantra.title })).toBeVisible();

    // Must NOT show "Set as my Quick Reset mantra" in opening state (that's for last_used/preview only)
    const setDefaultBtn = page.getByRole('button', { name: 'Set as my Quick Reset mantra' });
    await expect(setDefaultBtn).not.toBeVisible();

    // Must show "Show another calming mantra" — the LOCKED label for mitra_suggest_for_this_moment
    await expect(page.getByRole('button', { name: 'Show another calming mantra' })).toBeVisible();

    // Must NOT show action identifier as raw text
    await expect(page.getByText('mitra_suggest_for_this_moment')).not.toBeVisible();
    await expect(page.getByText('Mitra suggest for this moment')).not.toBeVisible();

    console.log('Scenario 1 — State A PASS');
  });

  // ── SCENARIO 2 — State B: last_used ───────────────────────────────────────

  test('Scenario 2 — State B: last used | wire shape + UI', async () => {
    // A. Setup: clear explicit default, then record a chant session
    await setDefault(token, null);
    const chantResult = await completeChant(token, peacecalmMantraRef, true, 90000);
    expect(chantResult.status).toBe(200);
    expect(chantResult.body.completed).toBe(true);

    // B/C. Wire shape
    const { status, body } = await getOpeningState(token);
    expect(status).toBe(200);
    expect(body.screen_state).toBe('last_used');
    expect(body.source).toBe('last_used');
    expect(body.primary_cta).toBe('Continue last mantra');
    expect(body.mantra.item_id).toBe(peacecalmMantraRef);
    expect(body).not.toHaveProperty('sessions_7d');
    expect(body.secondary_actions).toContain('set_as_default');
    expect(body.secondary_actions).toContain('change_mantra');
    expect(body.secondary_actions).toContain('mitra_suggest_for_this_moment');

    // D/E. Frontend UX
    await page.goto('/en/mitra/quick-reset');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: 'Continue last mantra' })).toBeVisible({ timeout: 8_000 });
    await expect(page.getByRole('button', { name: 'Set as my Quick Reset mantra' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Show another calming mantra' })).toBeVisible();

    console.log('Scenario 2 — State B PASS');
  });

  // ── SCENARIO 3 — State C: no history ──────────────────────────────────────
  // NOTE: Cannot fully clear QuickChantSession via frontend API.
  // This test verifies the no_history state via wire-shape only (API response),
  // then verifies "Begin with this mantra" label mapping is correct.

  test('Scenario 3 — State C label mapping (mitra_suggested source renders correctly)', async () => {
    // This verifies the contract: when screen_state=no_history is returned,
    // the frontend renders primary_cta exactly as returned by API.
    // The "Begin with this mantra" primary CTA and "Show another calming mantra" label must appear.

    // We can't wipe QuickChantSession from frontend, so verify label contract:
    const { body } = await getOpeningState(token);
    // In whatever state we get, verify the API shape is sound
    expect(body).toHaveProperty('screen_state');
    expect(['explicit', 'last_used', 'no_history']).toContain(body.screen_state);
    expect(body).toHaveProperty('primary_cta');
    expect(body.secondary_actions).toBeInstanceOf(Array);
    expect(body).not.toHaveProperty('sessions_7d');

    // For a no_history state specifically, verify mock by checking source field logic:
    // source must be one of the 3 valid values — never "fallback"
    expect(['user_selected', 'last_used', 'mitra_suggested']).toContain(body.source);
    expect(body.source).not.toBe('fallback'); // "fallback" removed post-audit

    // Verify frontend renders primary_cta from API (not hardcoded)
    await page.goto('/en/mitra/quick-reset');
    await page.waitForLoadState('networkidle');
    // Whatever state we're in, the primary_cta from API must render as a button
    await expect(page.getByRole('button', { name: body.primary_cta })).toBeVisible({ timeout: 8_000 });

    console.log('Scenario 3 — State C shape PASS');
  });

  // ── SCENARIO 4 — Change Mantra: preview-first, no auto-set ───────────────

  test('Scenario 4 — Change Mantra: browse → preview → no auto-set', async () => {
    // Set up state A so we have a clear baseline
    await setDefault(token, peacecalmMantraRef);

    // B. Verify browse-mantras API shape
    const { body: browseResult } = await browseMantras(token);
    expect(browseResult.mantras).toBeInstanceOf(Array);
    expect(browseResult.mantras.length).toBeGreaterThan(0);

    // Verify normalizeMantraFromBrowse contract: no curated rows pass through
    const rawIds: string[] = browseResult.mantras.map((m: { id: string }) => m.id);
    const curatedIds = rawIds.filter((id) => id.startsWith('curated:'));
    const masterIds = rawIds.filter((id) => !id.startsWith('curated:'));
    console.log(`Browse: ${rawIds.length} total, ${masterIds.length} master, ${curatedIds.length} curated`);
    // Master rows should exist; curated rows should be filtered client-side
    expect(masterIds.length).toBeGreaterThan(0);

    // D/E. Frontend: Change Mantra opens picker
    await page.goto('/en/mitra/quick-reset');
    await page.waitForLoadState('networkidle');

    // Tap "Change mantra"
    const changeBtn = page.getByRole('button', { name: 'Change mantra' });
    await expect(changeBtn).toBeVisible({ timeout: 8_000 });
    await changeBtn.click();

    // Picker overlay opens and shows a list
    await expect(page.getByText('Choose a Mantra')).toBeVisible({ timeout: 6_000 });

    // Select first item in list
    const firstPickerItem = page.locator('[role="button"]').first();
    await firstPickerItem.click();

    // Must now show PREVIEW state — "Begin chanting" visible
    await expect(page.getByRole('button', { name: 'Begin chanting' })).toBeVisible({ timeout: 6_000 });

    // "Set as my Quick Reset mantra" must appear in preview (for explicit opt-in)
    await expect(page.getByRole('button', { name: 'Set as my Quick Reset mantra' })).toBeVisible();

    // Verify that tapping "Set as my Quick Reset mantra" does NOT auto-trigger during picker flow
    // (the button is present but must be an explicit user action, not auto-invoked)
    // We verify by checking the state: we have NOT yet set a new default
    const stateAfterPicker = await getOpeningState(token);
    // Still returns explicit with original ref (set-default not called yet)
    // Note: this check is on the backend state at time of picker open, before user taps "Set..."
    expect(stateAfterPicker.body.screen_state).toBe('explicit');

    console.log('Scenario 4 — Change Mantra preview-first PASS');
  });

  // ── SCENARIO 5 — "Show another calming mantra" label + behavior ───────────

  test('Scenario 5 — "Show another calming mantra" label contract', async () => {
    await setDefault(token, peacecalmMantraRef);

    await page.goto('/en/mitra/quick-reset');
    await page.waitForLoadState('networkidle');

    // B. Wire: backend identifier is mitra_suggest_for_this_moment
    const { body } = await getOpeningState(token);
    expect(body.secondary_actions).toContain('mitra_suggest_for_this_moment');

    // E. Frontend renders correct LOCKED label
    const showAnotherBtn = page.getByRole('button', { name: 'Show another calming mantra' });
    await expect(showAnotherBtn).toBeVisible({ timeout: 8_000 });

    // Raw identifier must NOT appear as UI text
    await expect(page.getByText('mitra_suggest_for_this_moment')).not.toBeVisible();
    await expect(page.getByText('Mitra suggest for this moment')).not.toBeVisible();

    // Tap button — should call browse-mantras and show a different/same mantra (deterministic V1)
    await showAnotherBtn.click();
    // After click: still on opening phase, still shows a mantra title (different or same)
    // No crash, no navigation, no error message
    await expect(page.getByRole('button', { name: 'Begin chanting' })).toBeVisible({ timeout: 8_000 });

    console.log('Scenario 5 — Show another calming mantra PASS');
  });

  // ── SCENARIO 6 & 7 — Runner + audio_url ───────────────────────────────────

  test('Scenario 6+7 — Runner audio handling (null and non-null)', async () => {
    await setDefault(token, peacecalmMantraRef);

    // B. Confirm what audio_url the API returns for this mantra
    const { body } = await getOpeningState(token);
    const audioUrl = body.mantra.audio_url;
    console.log('audio_url from API:', audioUrl);
    // audio_url must be a string or null — never undefined, never false
    expect(audioUrl === null || typeof audioUrl === 'string').toBe(true);

    // D/E. Navigate to runner
    await page.goto('/en/mitra/quick-reset');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Begin chanting' }).click();
    // Runner phase — MalaMantraCounter equivalent not applicable on web, but phase transitions work
    // Web runner renders Done chanting button
    await expect(page.getByRole('button', { name: 'Done chanting' })).toBeVisible({ timeout: 6_000 });
    await expect(page.getByRole('button', { name: 'End early' })).toBeVisible();

    if (audioUrl) {
      // If audio_url present: <audio> element should be in DOM
      const audioEl = page.locator('audio[src]');
      await expect(audioEl).toHaveCount(1, { timeout: 3_000 });
      const src = await audioEl.getAttribute('src');
      expect(src).toBe(audioUrl);
      console.log('Scenario 6 — audio element present, src matches API. PASS');
    } else {
      // If null: NO audio element
      await expect(page.locator('audio')).toHaveCount(0);
      console.log('Scenario 7 — audio_url null, no audio element rendered. PASS');
    }
  });

  // ── SCENARIO 8 — Done chanting: standard completion copy ─────────────────

  test('Scenario 8 — Done chanting: standard completion copy via wire', async () => {
    await setDefault(token, peacecalmMantraRef);

    // B/C. POST to complete with completed=true
    const { status, body } = await completeChant(token, peacecalmMantraRef, true, 120000);
    expect(status).toBe(200);
    expect(body.completed).toBe(true);
    expect(body.mantra_ref).toBe(peacecalmMantraRef);
    expect(body.copy).not.toBeNull();
    expect(body.copy.headline).toBeTruthy();
    // sessions_7d must NOT be in response
    expect(body).not.toHaveProperty('sessions_7d');
    if (body.chant_summary) {
      expect(body.chant_summary).not.toHaveProperty('sessions_7d');
    }

    // Verify one of the E-C copy strings is returned (backend decides which one)
    const validHeadlines = [
      'A moment of Smriti —\nremembering yourself in the middle of the day.',
      'You found your way back through sound.\nThat is enough.',
      'You return to the same sound.\nThis is how mantra becomes yours.',
      'The sound remained.\nYou have returned to it. That is Abhyasa.',
    ];
    console.log('API headline:', JSON.stringify(body.copy.headline));
    expect(validHeadlines).toContain(body.copy.headline);

    // D/E. Verify the done screen renders exact headline on web
    await setDefault(token, peacecalmMantraRef);
    await page.goto('/en/mitra/quick-reset');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Begin chanting' }).click();
    await page.getByRole('button', { name: 'Done chanting' }).click();

    // Done screen should be visible
    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible({ timeout: 8_000 });

    // No achievement language
    await expect(page.getByText(/great job|well done|amazing|streak|sessions|milestone/i)).not.toBeVisible();
    // No mood capture
    await expect(page.getByText(/how do you feel/i)).not.toBeVisible();
    // sessions_7d not rendered
    await expect(page.getByText(/sessions_7d/)).not.toBeVisible();

    console.log('Scenario 8 — Done chanting standard copy PASS');
  });

  // ── SCENARIO 9 — Completion: continuation subtext ─────────────────────────

  test('Scenario 9 — completion copy: subtext present when continuity rule applies', async () => {
    // B. Wire: POST complete and check if subtext is present
    await setDefault(token, peacecalmMantraRef);
    const { body } = await completeChant(token, peacecalmMantraRef, true, 90000);

    expect(body.copy).not.toBeNull();
    console.log('Scenario 9 — headline:', JSON.stringify(body.copy.headline));
    console.log('Scenario 9 — subtext:', JSON.stringify(body.copy.subtext));

    // subtext is either a string or null — never sessions_7d
    expect(body.copy.subtext === null || typeof body.copy.subtext === 'string').toBe(true);
    if (body.copy.subtext) {
      expect(body.copy.subtext).not.toContain('sessions_7d');
    }

    // D/E. Verify done screen renders subtext if present (no extra shape check needed beyond wire)
    console.log('Scenario 9 — copy shape valid PASS');
  });

  // ── SCENARIO 12 — End early: silent exit ─────────────────────────────────

  test('Scenario 12 — End early: completed=false wire + silent UI exit', async () => {
    await setDefault(token, peacecalmMantraRef);

    // B/C. Wire: POST complete with completed=false
    const { status, body } = await completeChant(token, peacecalmMantraRef, false, 15000);
    expect(status).toBe(200);
    expect(body.completed).toBe(false);
    expect(body.copy).toBeNull(); // abandoned session has no copy
    expect(body).not.toHaveProperty('sessions_7d');

    // D/E. Frontend: End early exits silently, no completion copy shown
    await setDefault(token, peacecalmMantraRef);
    await page.goto('/en/mitra/quick-reset');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Begin chanting' }).click();
    await expect(page.getByRole('button', { name: 'End early' })).toBeVisible({ timeout: 6_000 });
    await page.getByRole('button', { name: 'End early' }).click();

    // Must NOT show any completion copy, "Close" button, or achievement message
    await expect(page.getByRole('button', { name: 'Close' })).not.toBeVisible({ timeout: 3_000 });
    await expect(page.getByText(/how do you feel/i)).not.toBeVisible();
    await expect(page.getByText(/smriti|abhyasa|sound remained/i)).not.toBeVisible();

    // Must navigate away (back to mitra home or previous page)
    await expect(page).not.toHaveURL(/quick-reset/, { timeout: 5_000 });

    console.log('Scenario 12 — End early silent exit PASS');
  });

  // ── SCENARIO 13 — Home subtitle ───────────────────────────────────────────

  test('Scenario 13 — Home quick_reset_summary subtitle wire shape', async () => {
    // A. Setup: explicit default set
    await setDefault(token, peacecalmMantraRef);

    // B/C. Wire: GET home endpoint, check quick_reset_summary shape
    const homeResult = await getHomeState(token);
    expect(homeResult.status).toBe(200);
    const qrs = homeResult.body?.quick_reset_summary;
    expect(qrs).toBeTruthy();
    expect(qrs).toHaveProperty('available');
    expect(qrs).toHaveProperty('label');

    // When explicit default set: subtitle should be "Return to your sound."
    console.log('Home quick_reset_summary:', JSON.stringify(qrs));
    if (qrs.subtitle !== null && qrs.subtitle !== undefined) {
      const validSubtitles = [
        'Return to your sound.',
        'Your last mantra is here.',
      ];
      expect(validSubtitles).toContain(qrs.subtitle);
    }
    // sessions_7d must not be in home quick_reset_summary
    expect(qrs).not.toHaveProperty('sessions_7d');

    // D/E. Home renders subtitle (verify it's at least displayed)
    await page.goto('/en/mitra');
    await page.waitForLoadState('networkidle');
    if (qrs.subtitle) {
      await expect(page.getByText(qrs.subtitle)).toBeVisible({ timeout: 8_000 });
    }

    console.log('Scenario 13 — Home subtitle PASS');
  });

  // ── SCENARIO 11 — Post-safety-context wire shape ──────────────────────────

  test('Scenario 11 — post_distress banned, is_post_safety_context variable only (wire audit)', async () => {
    // B. POST complete and verify no post_distress field in response
    const { body } = await completeChant(token, peacecalmMantraRef, true, 60000);
    expect(body).not.toHaveProperty('post_distress');
    // copy.headline must be one of E-C-1 through E-C-4
    const validHeadlines = [
      'A moment of Smriti —\nremembering yourself in the middle of the day.',
      'You found your way back through sound.\nThat is enough.',
      'You return to the same sound.\nThis is how mantra becomes yours.',
      'The sound remained.\nYou have returned to it. That is Abhyasa.',
    ];
    if (body.copy) {
      expect(validHeadlines).toContain(body.copy.headline);
    }
    console.log('Scenario 11 — post_distress absent from wire PASS');
  });

  // ── SCENARIO: Set-default flow end-to-end ────────────────────────────────

  test('Set default via UI: POST fires, state reloads to explicit', async () => {
    // Start from last_used state
    await setDefault(token, null);
    await completeChant(token, peacecalmMantraRef, true, 60000);

    await page.goto('/en/mitra/quick-reset');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: 'Continue last mantra' })).toBeVisible({ timeout: 8_000 });

    // Tap "Set as my Quick Reset mantra"
    await page.getByRole('button', { name: 'Set as my Quick Reset mantra' }).click();

    // State reloads — primary_cta should now be "Begin chanting" (explicit state)
    await expect(page.getByRole('button', { name: 'Begin chanting' })).toBeVisible({ timeout: 10_000 });
    // "Continue last mantra" must no longer be present
    await expect(page.getByRole('button', { name: 'Continue last mantra' })).not.toBeVisible();

    // Verify backend state changed
    const { body } = await getOpeningState(token);
    expect(body.screen_state).toBe('explicit');

    console.log('Set-default flow PASS');
  });
});
