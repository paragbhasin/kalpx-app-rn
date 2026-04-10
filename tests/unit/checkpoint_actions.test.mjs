/**
 * Layer 2 — static analysis tests for the new checkpoint/welcome-back code.
 * No React Native runtime needed; we read source files as text and assert
 * critical patterns are present (or absent).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// The runner sets cwd to repo root before invoking node --test.
const REPO = process.cwd();

/** Extract the body of a switch case from `case "X":` until the next `case "` or `default:`. */
function extractCaseBody(source, caseName) {
  const start = source.indexOf(`case "${caseName}":`);
  if (start === -1) return '';
  // Find the next case label after our start
  const restOffset = start + `case "${caseName}":`.length;
  const nextCaseRel = source.slice(restOffset).search(/(?:^|\n)\s*(?:case "[^"]+":|default:)/);
  if (nextCaseRel === -1) return source.slice(start);
  return source.slice(start, restOffset + nextCaseRel);
}

function read(rel) {
  return readFileSync(resolve(REPO, rel), 'utf8');
}

const actionExecutor = read('src/engine/actionExecutor.ts');
const cycleReflection = read('src/blocks/CycleReflectionBlock.tsx');
const cycleResults = read('src/blocks/CycleReflectionResultsBlock.tsx');
const activityStats = read('src/blocks/ActivityStatsBlock.tsx');
const trendChart = read('src/blocks/TrendChartBlock.tsx');
const home = read('src/screens/Home/Home.tsx');
const welcomeBack = read('src/screens/Home/WelcomeBack.tsx');
const mitraApi = read('src/engine/mitraApi.ts');
const practiceRunner = read('src/containers/PracticeRunnerContainer.tsx');

// ---------------------------------------------------------------------------
// Phase 0 — audio fixes
// ---------------------------------------------------------------------------

test('Bug 1 fix: resolveAudioSource matches generic Om.mp4 path', () => {
  // Old check was '/sounds/Om.mp4' (too narrow) — now must accept S3 URLs.
  assert.match(
    practiceRunner,
    /url\.includes\(["']Om\.mp4["']\)/,
    'resolveAudioSource must broaden Om.mp4 match for rotated S3 URLs',
  );
});

test('Bug 2 fix: stopTriggerAudio nulls refs BEFORE awaiting', () => {
  const stopFn = practiceRunner.match(
    /const stopTriggerAudio[\s\S]*?^\s*\};/m,
  )?.[0];
  assert.ok(stopFn, 'stopTriggerAudio function missing');
  // refs must be set to null before any await
  const introNullPos = stopFn.indexOf('introLoopAudioRef.current = null');
  const firstAwaitPos = stopFn.indexOf('await intro');
  assert.ok(introNullPos > 0, 'must null introLoopAudioRef.current');
  assert.ok(firstAwaitPos > introNullPos, 'must null ref before awaiting stop');
});

// ---------------------------------------------------------------------------
// Phase 1 — Welcome back
// ---------------------------------------------------------------------------

test('mitraApi exports journeyWelcomeBack helper', () => {
  assert.match(
    mitraApi,
    /export async function mitraJourneyWelcomeBack/,
    'mitraJourneyWelcomeBack must be exported',
  );
  assert.match(mitraApi, /mitra\/journey\/welcome-back\//);
});

test('Home.tsx detects welcomeBack flag from journey/status', () => {
  assert.match(home, /data\?\.welcomeBack/);
  assert.match(home, /setWelcomeBackData/);
});

test('Home.tsx renders WelcomeBack component', () => {
  assert.match(home, /import WelcomeBack from/);
  assert.match(home, /<WelcomeBack/);
  assert.match(home, /onContinue=\{handleWelcomeBackContinue\}/);
  assert.match(home, /onFresh=\{handleWelcomeBackFresh\}/);
});

test('WelcomeBack screen has continue + fresh buttons', () => {
  assert.match(welcomeBack, /onContinue/);
  assert.match(welcomeBack, /onFresh/);
  assert.match(welcomeBack, /Continue with/);
  assert.match(welcomeBack, /Start Fresh/);
});

test('Home.tsx fires welcome_back_decided track event for both decisions', () => {
  // Both handlers should fire the event with the right decision
  const continueHandler = home.match(/handleWelcomeBackContinue[\s\S]*?\n {2}\};/)?.[0] || '';
  const freshHandler = home.match(/handleWelcomeBackFresh[\s\S]*?\n {2}\};/)?.[0] || '';
  assert.match(continueHandler, /welcome_back_decided/);
  assert.match(continueHandler, /decision: ["']continue["']/);
  assert.match(freshHandler, /welcome_back_decided/);
  assert.match(freshHandler, /decision: ["']fresh["']/);
});

// ---------------------------------------------------------------------------
// Phase 2 — Day 7 / Day 14 checkpoints
// ---------------------------------------------------------------------------

test('actionExecutor has ensure_checkpoint_data case', () => {
  assert.match(actionExecutor, /case "ensure_checkpoint_data":/);
});

test('actionExecutor has checkpoint_submit case', () => {
  assert.match(actionExecutor, /case "checkpoint_submit":/);
});

test('checkpoint_submit handles day 14 deepen suggestion', () => {
  const fn =
    extractCaseBody(actionExecutor, 'checkpoint_submit') || '';
  assert.match(fn, /csDay === 14/);
  assert.match(fn, /deepenAccepted/);
  assert.match(fn, /deepenItemType/);
  assert.match(fn, /impliedFeelingMap/);
});

test('checkpoint_submit fires checkpoint_completed AND cycle_completed (day 14)', () => {
  const fn =
    extractCaseBody(actionExecutor, 'checkpoint_submit') || '';
  assert.match(fn, /mitraTrackEvent\("checkpoint_completed"/);
  assert.match(fn, /mitraTrackEvent\("cycle_completed"/);
});

test('checkpoint_completed payload includes reflection_length (web parity)', () => {
  const fn =
    extractCaseBody(actionExecutor, 'checkpoint_submit') || '';
  assert.match(fn, /reflection_length/);
});

test('cycle_completed payload includes total_days + path_cycle_number (web parity)', () => {
  const fn =
    extractCaseBody(actionExecutor, 'checkpoint_submit') || '';
  assert.match(fn, /total_days/);
  assert.match(fn, /path_cycle_number/);
});

test('ensure_checkpoint_data fires checkpoint_viewed event (web parity)', () => {
  const fn = extractCaseBody(actionExecutor, 'ensure_checkpoint_data');
  assert.match(fn, /mitraTrackEvent\("checkpoint_viewed"/);
  assert.match(fn, /engagement_level/);
});

test('Rule 12 (REG-010): generate_companion has checkpoint context guard', () => {
  // The guard should prevent overwriting day_number/identity_label/path_context
  // when checkpoint_headline is set in screenState.
  assert.match(actionExecutor, /_checkpointActive/);
  assert.match(actionExecutor, /checkpoint_headline/);
  // The guard should specifically gate identity_label / path_context
  assert.match(
    actionExecutor,
    /if \(!_checkpointActive\)[\s\S]*?identity_label/,
  );
});

test('CycleReflectionBlock auto-fetches checkpoint data on mount', () => {
  assert.match(cycleReflection, /useEffect/);
  assert.match(cycleReflection, /mitraCheckpoint/);
  assert.match(cycleReflection, /checkpoint_original_data/);
});

test('CycleReflectionBlock renders 4 feeling options', () => {
  assert.match(cycleReflection, /strong.*more steady/);
  assert.match(cycleReflection, /slight.*some shift/);
  assert.match(cycleReflection, /same.*finding my way/);
  assert.match(cycleReflection, /worse.*heaviness/);
});

test('CycleReflectionBlock submit dispatches checkpoint_submit action', () => {
  assert.match(cycleReflection, /executeAction/);
  assert.match(cycleReflection, /type: ["']checkpoint_submit["']/);
});

test('CycleReflectionResultsBlock has decision-tree action buttons', () => {
  // Day 7 buttons
  assert.match(cycleResults, /Continue My Path/);
  assert.match(cycleResults, /Lighten My Path/);
  // Day 14 buttons
  assert.match(cycleResults, /Continue Current Path/);
  assert.match(cycleResults, /Choose New Focus/);
  assert.match(cycleResults, /Deepen My Practice/);
});

test('CycleReflectionResultsBlock cleans up checkpoint state on exit (Rule 4)', () => {
  assert.match(cycleResults, /import \{ cleanupFlowState/);
  assert.match(cycleResults, /cleanupFlowState\(['"]checkpoint['"]/);
});

test('ActivityStatsBlock reads checkpoint_metrics from screenData', () => {
  assert.match(activityStats, /useScreenStore/);
  assert.match(activityStats, /milestone_activity_stats/);
});

test('TrendChartBlock reads checkpoint_trend_graph from screenData', () => {
  assert.match(trendChart, /useScreenStore/);
  assert.match(trendChart, /checkpoint_trend_graph/);
});

// ---------------------------------------------------------------------------
// Phase 2d — Auto-navigation to checkpoint screens
// ---------------------------------------------------------------------------

test('Home.tsx auto-routes to weekly_checkpoint on day 7', () => {
  assert.match(home, /weekly_checkpoint/);
  assert.match(home, /dayNumber === 7/);
});

test('Home.tsx auto-routes to daily_insight_14 on day 14', () => {
  assert.match(home, /daily_insight_14/);
  assert.match(home, /dayNumber === 14/);
});

test('Home.tsx checks checkpoint_completed before re-routing', () => {
  assert.match(home, /checkpoint_completed/);
});

// ---------------------------------------------------------------------------
// Phase 3 — Test-now header injection
// ---------------------------------------------------------------------------

test('axios interceptor injects X-Test-Now from AsyncStorage', () => {
  const axios = read('src/Networks/axios.js');
  assert.match(axios, /__DEV__/);
  assert.match(axios, /@kalpx_test_now/);
  assert.match(axios, /X-Test-Now/);
});
