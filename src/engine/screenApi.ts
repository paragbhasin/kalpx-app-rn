/**
 * Screen API Client — fetches screen definitions from backend.
 *
 * Replaces local allContainers.js with server-driven definitions.
 * Implements caching via AsyncStorage for offline support.
 */

import api from '../Networks/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = 'kalpx_screen_definitions';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CacheEntry {
  data: any;
  timestamp: number;
}

let _memoryCache: Record<string, any> | null = null;

/**
 * Fetch all container definitions (manifest + full data).
 * Uses memory cache → AsyncStorage cache → API fallback chain.
 */
export async function fetchAllScreens(): Promise<Record<string, any>> {
  // 1. Memory cache
  if (_memoryCache) return _memoryCache;

  // 2. AsyncStorage cache
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw) {
      const cached: CacheEntry = JSON.parse(raw);
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        _memoryCache = cached.data;
        return cached.data;
      }
    }
  } catch (e) {
    console.warn('[SCREEN_API] Cache read failed:', e);
  }

  // 3. API fetch
  try {
    const res = await api.get('mitra/screens/');
    const manifest = res.data;

    // Fetch full data for each container
    const fullData: Record<string, any> = {};
    const containerIds = Object.keys(manifest);

    await Promise.all(
      containerIds.map(async (id) => {
        try {
          const containerRes = await api.get(`mitra/screens/${id}/`);
          fullData[id] = containerRes.data;
        } catch (err) {
          console.warn(`[SCREEN_API] Failed to fetch container ${id}:`, err);
        }
      }),
    );

    // Cache it
    _memoryCache = fullData;
    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data: fullData, timestamp: Date.now() }),
    ).catch(() => {});

    console.log(`[SCREEN_API] Loaded ${containerIds.length} containers from API`);
    return fullData;
  } catch (err) {
    console.error('[SCREEN_API] Failed to fetch screens from API:', err);
    return {};
  }
}

/**
 * Fetch a single screen (state) from a container.
 * Falls back to local cache if API unavailable.
 */
export async function fetchScreen(
  containerId: string,
  stateId: string,
): Promise<any | null> {
  // Try memory cache first
  if (_memoryCache?.[containerId]?.states?.[stateId]) {
    return {
      container_id: containerId,
      container_type: _memoryCache[containerId].container_type,
      state_id: stateId,
      ..._memoryCache[containerId].states[stateId],
    };
  }

  // API fetch
  try {
    const res = await api.get(`mitra/screens/${containerId}/${stateId}/`);
    return res.data;
  } catch (err) {
    console.warn(`[SCREEN_API] Failed to fetch ${containerId}/${stateId}:`, err);
    return null;
  }
}

/**
 * Invalidate the cache (force re-fetch on next call).
 */
export function invalidateScreenCache(): void {
  _memoryCache = null;
  AsyncStorage.removeItem(CACHE_KEY).catch(() => {});
}

/**
 * Preload all screen definitions into cache.
 * Call this on app startup for offline support.
 */
export async function preloadScreens(): Promise<void> {
  await fetchAllScreens();
}
