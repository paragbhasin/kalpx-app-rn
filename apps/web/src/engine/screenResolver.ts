/**
 * Screen Resolver stub — Phase 3 scaffold.
 * Resolves screen schemas from @kalpx/contracts (local-first).
 * API-first mode wired in Phase 4B vertical-slice gate.
 */

import * as contracts from '@kalpx/contracts';
import { localizeScreenSchema } from './screenTranslations';
import { getActiveLocale } from '../lib/locale';

const containerMap: Record<string, any> = contracts as any;

export async function getScreen(containerId: string, stateId: string): Promise<any | null> {
  try {
    // Containers are exported as named exports: PortalContainer, etc.
    // Try exact match first, then scan for container_id property.
    const container =
      Object.values(containerMap).find(
        (c: any) => c && typeof c === 'object' && c.container_id === containerId,
      ) ?? null;
    if (!container) return null;
    const state = container.states?.[stateId];
    if (!state) return null;
    const schema = { ...state, container_id: containerId, state_id: stateId };
    // Apply Hindi translations for contract-local screens
    return localizeScreenSchema(schema, getActiveLocale());
  } catch {
    return null;
  }
}
