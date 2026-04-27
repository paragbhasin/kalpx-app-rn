// Screen engine types — extracted from apps/mobile/src/engine/screenResolver.ts.
// Made public (exported) so both apps and packages/feature-flows can use them.

export interface ScreenDefinition {
  container_id: string;
  state_id: string;
  [key: string]: unknown;
}

export interface ContainerDefinition {
  container_id: string;
  states: Record<string, ScreenDefinition>;
  [key: string]: unknown;
}

export type ResolutionSource = 'local' | 'api' | 'cache';
