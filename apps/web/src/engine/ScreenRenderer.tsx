/**
 * ScreenRenderer — Phase 5.
 * Resolves block list from schema and dispatches to BlockRenderer.
 * onAction is threaded through to block-level interactive elements.
 */

import React from 'react';
import { BlockRenderer } from './BlockRenderer';
import { interpolate } from './interpolation';

interface ScreenRendererProps {
  schema: any;
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

export function ScreenRenderer({ schema, screenData = {}, onAction }: ScreenRendererProps) {
  if (!schema) {
    return (
      <div style={{ padding: 24, color: '#888', textAlign: 'center' }}>
        No screen schema loaded.
      </div>
    );
  }

  // Interpolate the entire schema with screenData so {{tokens}} resolve in blocks
  const resolved = interpolate(schema, screenData);
  const rawBlocks: any[] = resolved.blocks ?? [];
  const blocks: any[] = resolved.container_id === 'welcome_onboarding'
    ? enrichOnboardingBlocks(rawBlocks)
    : rawBlocks;

  return (
    <div style={{ padding: 16 }}>
      {/* Dev-only container label — only with ?debug in URL */}
      {import.meta.env.DEV && typeof window !== 'undefined' && window.location.search.includes('debug') && (
        <div style={{ fontSize: 10, color: '#bbb', marginBottom: 8, fontFamily: 'monospace' }}>
          {schema.container_id}/{schema.state_id}
        </div>
      )}
      {blocks.map((block: any, i: number) => (
        <BlockRenderer
          key={block.id ?? i}
          block={block}
          screenData={screenData}
          onAction={onAction}
        />
      ))}
      {blocks.length === 0 && (
        <div style={{ color: '#666', fontSize: 13, padding: 24, textAlign: 'center' }}>
          No blocks in this schema.
        </div>
      )}
    </div>
  );
}

function enrichOnboardingBlocks(blocks: any[]) {
  const headlineBlock = blocks.find((block) => block.type === 'headline');
  const subtextBlock = blocks.find((block) => block.type === 'subtext');

  return blocks
    .map((block) => {
      if ((block.block_type || block.type) !== 'onboarding_conversation_turn') {
        return block;
      }

      return {
        ...block,
        headline: block.headline ?? headlineBlock?.content,
        subtext: block.subtext ?? subtextBlock?.content,
      };
    })
    .filter((block) => {
      const type = block.block_type || block.type;
      return type !== 'headline' && type !== 'subtext';
    });
}
