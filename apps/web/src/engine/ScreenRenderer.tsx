/**
 * ScreenRenderer — Phase 3 scaffold.
 * Dispatches container_type → placeholder container.
 * Real containers are ported in Phases 5–9.
 */

import React from 'react';
import { BlockRenderer } from './BlockRenderer';

interface ScreenRendererProps {
  schema: any;
  screenData?: Record<string, any>;
}

export function ScreenRenderer({ schema, screenData }: ScreenRendererProps) {
  if (!schema) {
    return (
      <div style={{ padding: 24, color: '#888', textAlign: 'center' }}>
        No screen schema loaded.
      </div>
    );
  }

  const blocks: any[] = schema.blocks ?? [];

  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 11, color: '#666', marginBottom: 12, fontFamily: 'monospace' }}>
        {schema.container_id}/{schema.state_id} [{schema.container_type ?? 'unknown'}]
      </div>
      {blocks.map((block: any, i: number) => (
        <BlockRenderer key={i} block={block} screenData={screenData} />
      ))}
      {blocks.length === 0 && (
        <div style={{ color: '#666', fontSize: 13 }}>No blocks in this schema.</div>
      )}
    </div>
  );
}
