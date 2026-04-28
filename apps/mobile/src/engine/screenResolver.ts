/**
 * Screen Resolver — single source of truth for screen definitions.
 *
 * Two-pass resolution (cross-cutting refactor):
 *
 *   Pass 1 (local-first fast path, default):
 *     - If screen exists in allContainers.js AND is NOT marked
 *       `source: 'api_authoritative'` AND feature flag SCREEN_API_FIRST is
 *       disabled → return local immediately.
 *
 *   Pass 2 (API-first mode):
 *     - If SCREEN_API_FIRST=true OR the local screen is marked
 *       `source: 'api_authoritative'` → check 60s cache, else fetch from API,
 *       fall back to local on failure.
 *
 * Every resolution logs `[screenResolver] resolved ${containerId}/${stateId}
 * via ${source}` so Maestro can assert the path.
 *
 * Public API preserved: getScreen(containerId, stateId) => Promise<Screen>.
 * New helper: getScreenResolutionSource(containerId, stateId).
 */

import { fetchAllScreens, preloadScreens } from './screenApi';
import * as LocalContainers from '@kalpx/contracts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ScreenDefinition {
  container_id: string;
  container_type?: string;
  state_id: string;
  tone?: any;
  blocks?: any[];
  actions?: any;
  source?: string;
  [key: string]: any;
}

interface ContainerDefinition {
  container_id: string;
  container_type?: string;
  source?: string;
  states: Record<string, any>;
  [key: string]: any;
}

type ResolutionSource = 'local' | 'api' | 'cache';

// ---------------------------------------------------------------------------
// Feature flag (can be toggled via global for tests/Maestro)
// ---------------------------------------------------------------------------

function _apiFirstEnabled(): boolean {
  // Allow a runtime toggle (process.env or global) for Maestro/tests.
  const envFlag =
    (typeof process !== 'undefined' &&
      (process as any).env &&
      (process as any).env.SCREEN_API_FIRST) ||
    (globalThis as any).SCREEN_API_FIRST;
  return envFlag === 'true' || envFlag === true;
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let _apiContainers: Record<string, any> | null = null;
let _initPromise: Promise<void> | null = null;

// Per-screen API cache with TTL (cross-cutting layer).
interface CacheEntry {
  screen: ScreenDefinition;
  fetched_at: number;
}
const _screenCache: Map<string, CacheEntry> = new Map();
const CACHE_TTL_MS = 60_000;

// Track last resolution source for debugging/Maestro assertions.
const _lastSource: Map<string, ResolutionSource> = new Map();

function _cacheKey(containerId: string, stateId: string): string {
  return `${containerId}::${stateId}`;
}

function _buildLocalLookup(): Record<string, ContainerDefinition> {
  const lookup: Record<string, ContainerDefinition> = {};
  for (const [, value] of Object.entries(LocalContainers)) {
    if (value && typeof value === 'object' && 'container_id' in (value as any)) {
      const container = value as ContainerDefinition;
      lookup[container.container_id] = container;
    }
  }
  return lookup;
}

const _localLookup = _buildLocalLookup();

function _logResolution(
  containerId: string,
  stateId: string,
  source: ResolutionSource,
): void {
  _lastSource.set(_cacheKey(containerId, stateId), source);
  console.log(
    `[screenResolver] resolved ${containerId}/${stateId} via ${source}`,
  );
}

function _buildLocalScreen(
  containerId: string,
  stateId: string,
): ScreenDefinition | null {
  const local = _localLookup[containerId];
  if (!local?.states?.[stateId]) return null;
  return {
    container_id: containerId,
    container_type: local.container_type,
    state_id: stateId,
    ...local.states[stateId],
  };
}

function _buildApiScreen(
  containerId: string,
  stateId: string,
): ScreenDefinition | null {
  const api = _apiContainers?.[containerId];
  if (!api?.states?.[stateId]) return null;
  return {
    container_id: containerId,
    container_type: api.container_type,
    state_id: stateId,
    ...api.states[stateId],
  };
}

function _isApiAuthoritative(containerId: string, stateId: string): boolean {
  const local = _localLookup[containerId];
  if (!local) return false;
  if (local.source === 'api_authoritative') return true;
  const state = local.states?.[stateId];
  return state?.source === 'api_authoritative';
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

export async function initScreenResolver(): Promise<void> {
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    try {
      await preloadScreens();
      _apiContainers = await fetchAllScreens();
      const count = _apiContainers ? Object.keys(_apiContainers).length : 0;
      console.log(
        `[screenResolver] initialized ${count} API containers, ${Object.keys(_localLookup).length} local fallbacks`,
      );
    } catch (err) {
      console.warn('[screenResolver] API preload failed, local-only:', err);
      _apiContainers = null;
    }
  })();

  return _initPromise;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get a single screen by container + state.
 *
 * Two-pass resolution. See file header.
 */
export async function getScreen(
  containerId: string,
  stateId: string,
): Promise<ScreenDefinition | null> {
  const apiFirst = _apiFirstEnabled() || _isApiAuthoritative(containerId, stateId);

  // ── Pass 1: local-first fast path ──
  if (!apiFirst) {
    const localScreen = _buildLocalScreen(containerId, stateId);
    if (localScreen) {
      _logResolution(containerId, stateId, 'local');
      return localScreen;
    }
    // no local — fall through to API
  }

  // ── Pass 2: API-first (with 60s cache) ──
  const key = _cacheKey(containerId, stateId);
  const cached = _screenCache.get(key);
  if (cached && Date.now() - cached.fetched_at < CACHE_TTL_MS) {
    _logResolution(containerId, stateId, 'cache');
    return cached.screen;
  }

  try {
    // If API containers not yet loaded, trigger init (but don't block forever).
    if (_apiContainers === null) {
      await initScreenResolver();
    }
    const apiScreen = _buildApiScreen(containerId, stateId);
    if (apiScreen) {
      _screenCache.set(key, { screen: apiScreen, fetched_at: Date.now() });
      _logResolution(containerId, stateId, 'api');
      return apiScreen;
    }
  } catch (err) {
    console.warn(
      `[screenResolver] API fetch failed for ${containerId}/${stateId}, falling back to local:`,
      err,
    );
  }

  // Final fallback: local
  const fallback = _buildLocalScreen(containerId, stateId);
  if (fallback) {
    _logResolution(containerId, stateId, 'local');
    return fallback;
  }

  console.warn(`[screenResolver] not found: ${containerId}/${stateId}`);
  return null;
}

/**
 * Synchronous version — memory only. Preserves prior behavior for reducers.
 */
export function getScreenSync(
  containerId: string,
  stateId: string,
): ScreenDefinition | null {
  const apiFirst = _apiFirstEnabled() || _isApiAuthoritative(containerId, stateId);

  if (!apiFirst) {
    const localScreen = _buildLocalScreen(containerId, stateId);
    if (localScreen) {
      _logResolution(containerId, stateId, 'local');
      return localScreen;
    }
  }

  const key = _cacheKey(containerId, stateId);
  const cached = _screenCache.get(key);
  if (cached && Date.now() - cached.fetched_at < CACHE_TTL_MS) {
    _logResolution(containerId, stateId, 'cache');
    return cached.screen;
  }

  const apiScreen = _buildApiScreen(containerId, stateId);
  if (apiScreen) {
    _logResolution(containerId, stateId, 'api');
    return apiScreen;
  }

  const fallback = _buildLocalScreen(containerId, stateId);
  if (fallback) {
    _logResolution(containerId, stateId, 'local');
    return fallback;
  }
  return null;
}

export async function getContainer(
  containerId: string,
): Promise<ContainerDefinition | null> {
  const local = _localLookup[containerId];
  const api = _apiContainers?.[containerId];
  if (local || api) {
    return {
      ...(api || {}),
      ...(local || {}),
      states: {
        ...(api?.states || {}),
        ...(local?.states || {}),
      },
    };
  }
  console.warn(`[screenResolver] container not found: ${containerId}`);
  return null;
}

export function getContainerSync(
  containerId: string,
): ContainerDefinition | null {
  const local = _localLookup[containerId];
  const api = _apiContainers?.[containerId];
  if (local || api) {
    return {
      ...(api || {}),
      ...(local || {}),
      states: {
        ...(api?.states || {}),
        ...(local?.states || {}),
      },
    };
  }
  return null;
}

export function isApiLoaded(): boolean {
  return _apiContainers !== null && Object.keys(_apiContainers).length > 0;
}

/**
 * Debug helper — returns the source used in the most recent resolution of the
 * given screen ('local' | 'api' | 'cache'), or null if never resolved.
 */
export function getScreenResolutionSource(
  containerId: string,
  stateId: string,
): ResolutionSource | null {
  return _lastSource.get(_cacheKey(containerId, stateId)) ?? null;
}

/** Test/Maestro helper — clear the API cache. */
export function _clearScreenCache(): void {
  _screenCache.clear();
  _lastSource.clear();
}
