/**
 * Dev-only render/effect loop tracer.
 * Import traceRender / traceEffect / traceDispatch and call at the top of
 * components or inside effects to detect rapid fire.
 *
 * REMOVE before shipping — this file is for crash diagnosis only.
 */

if (!__DEV__) {
  // eslint-disable-next-line no-console
  console.warn('[loopTracer] loaded in production — remove immediately');
}

type CountEntry = { count: number; ts: number };
const registry: Record<string, CountEntry> = {};
const WINDOW_MS = 2000;
const ALARM_THRESHOLD = 10; // fire >= 10 times in 2 s → suspect loop

function tick(key: string): number {
  const now = Date.now();
  const entry = registry[key];
  if (!entry || now - entry.ts > WINDOW_MS) {
    registry[key] = { count: 1, ts: now };
    return 1;
  }
  entry.count += 1;
  return entry.count;
}

/** Call at the top of a function component. */
export function traceRender(name: string, extra?: Record<string, any>): void {
  if (!__DEV__) return;
  const n = tick(`render:${name}`);
  if (n === 1 || n % 5 === 0 || n >= ALARM_THRESHOLD) {
    const alarm = n >= ALARM_THRESHOLD ? ' 🔴 LOOP SUSPECT' : '';
    // eslint-disable-next-line no-console
    console.log(
      `[TRACE render] ${name} #${n}${alarm}`,
      extra ? JSON.stringify(extra) : '',
    );
  }
}

/** Call inside useEffect / useFocusEffect to log every run. */
export function traceEffect(name: string, deps?: Record<string, any>): void {
  if (!__DEV__) return;
  const n = tick(`effect:${name}`);
  const alarm = n >= ALARM_THRESHOLD ? ' 🔴 LOOP SUSPECT' : '';
  // eslint-disable-next-line no-console
  console.log(
    `[TRACE effect] ${name} #${n}${alarm}`,
    deps ? JSON.stringify(deps) : '',
  );
}

/** Call inside callbacks / dispatchers to log every invocation. */
export function traceDispatch(
  name: string,
  oldVal: any,
  newVal: any,
  skipped = false,
): void {
  if (!__DEV__) return;
  const n = tick(`dispatch:${name}`);
  const alarm = n >= ALARM_THRESHOLD ? ' 🔴 LOOP SUSPECT' : '';
  const status = skipped ? 'SKIPPED' : 'FIRED';
  // eslint-disable-next-line no-console
  console.log(
    `[TRACE dispatch] ${name} #${n} ${status}${alarm}`,
    `old=${JSON.stringify(oldVal)} new=${JSON.stringify(newVal)}`,
  );
}

/**
 * Redux middleware — logs every action type and rate-alarms on storms.
 * Wire into store/index.ts:
 *   import { loopTracerMiddleware } from '../utils/loopTracer';
 *   middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(loopTracerMiddleware)
 */
export const loopTracerMiddleware =
  (_store: any) => (next: any) => (action: any) => {
    if (!__DEV__) return next(action);
    const type: string = action?.type ?? 'unknown';
    const n = tick(`action:${type}`);
    if (n === 1 || n % 5 === 0 || n >= ALARM_THRESHOLD) {
      const alarm = n >= ALARM_THRESHOLD ? ' 🔴 ACTION STORM' : '';
      // eslint-disable-next-line no-console
      console.log(`[TRACE action] ${type} #${n}${alarm}`);
    }
    return next(action);
  };
