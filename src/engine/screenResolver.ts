/**
 * Screen Resolver — single source of truth for screen definitions.
 *
 * Resolution order:
 *   1. API cache (populated by preloadScreens on startup)
 *   2. Local allContainers.js fallback
 *
 * Usage:
 *   import { initScreenResolver, getScreen, getContainer } from './screenResolver';
 *
 *   // On app startup (after fonts loaded):
 *   await initScreenResolver();
 *
 *   // Anywhere you need a screen:
 *   const screen = await getScreen('companion_dashboard', 'day_active');
 *   const container = await getContainer('companion_dashboard');
 */

import { fetchAllScreens, preloadScreens } from './screenApi';
import * as LocalContainers from '../../allContainers';

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
  [key: string]: any;
}

interface ContainerDefinition {
  container_id: string;
  container_type?: string;
  states: Record<string, any>;
  [key: string]: any;
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let _apiContainers: Record<string, any> | null = null;
let _initPromise: Promise<void> | null = null;

/**
 * Build a lookup from container_id → container definition using the local
 * allContainers.js exports (which are named exports like PortalContainer,
 * CompanionDashboardContainer, etc.).
 */
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

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

/**
 * Initialize the screen resolver by preloading API screen definitions.
 * Safe to call multiple times — subsequent calls return the same promise.
 */
export async function initScreenResolver(): Promise<void> {
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    try {
      await preloadScreens();
      _apiContainers = await fetchAllScreens();
      const count = _apiContainers ? Object.keys(_apiContainers).length : 0;
      console.log(`[SCREEN_RESOLVER] Initialized with ${count} API containers, ${Object.keys(_localLookup).length} local fallbacks`);
    } catch (err) {
      console.warn('[SCREEN_RESOLVER] API preload failed, using local fallback only:', err);
      _apiContainers = null;
    }
  })();

  return _initPromise;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get a single screen (state) definition by container ID and state ID.
 *
 * Resolution: API cache → local allContainers.js fallback.
 * Returns null if not found in either source.
 */
export async function getScreen(
  containerId: string,
  stateId: string,
): Promise<ScreenDefinition | null> {
  const local = _localLookup[containerId];
  const api = _apiContainers?.[containerId];

  // Prefer local definitions during app-side iteration; merge API as fallback.
  if (local?.states?.[stateId]) {
    const localState = local.states[stateId];
    const apiState = api?.states?.[stateId] || {};
    return {
      container_id: containerId,
      container_type: local.container_type || api?.container_type,
      state_id: stateId,
      ...apiState,
      ...localState,
    };
  }

  // API fallback
  if (api?.states?.[stateId]) {
    const state = api.states[stateId];
    return {
      container_id: containerId,
      container_type: api.container_type,
      state_id: stateId,
      ...state,
    };
  }

  console.warn(`[SCREEN_RESOLVER] Screen not found: ${containerId}/${stateId}`);
  return null;
}

/**
 * Synchronous version — checks memory only (no async IO).
 * Useful in reducers and render paths where async is not allowed.
 */
export function getScreenSync(
  containerId: string,
  stateId: string,
): ScreenDefinition | null {
  const local = _localLookup[containerId];
  const api = _apiContainers?.[containerId];

  if (local?.states?.[stateId]) {
    const localState = local.states[stateId];
    const apiState = api?.states?.[stateId] || {};
    return {
      container_id: containerId,
      container_type: local.container_type || api?.container_type,
      state_id: stateId,
      ...apiState,
      ...localState,
    };
  }

  if (api?.states?.[stateId]) {
    const state = api.states[stateId];
    return {
      container_id: containerId,
      container_type: api.container_type,
      state_id: stateId,
      ...state,
    };
  }

  return null;
}

/**
 * Get a full container definition (with all its states).
 *
 * Resolution: API cache → local allContainers.js fallback.
 */
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

  console.warn(`[SCREEN_RESOLVER] Container not found: ${containerId}`);
  return null;
}

/**
 * Synchronous version of getContainer — memory only.
 */
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

/**
 * Check whether API data has been loaded.
 */
export function isApiLoaded(): boolean {
  return _apiContainers !== null && Object.keys(_apiContainers).length > 0;
}
