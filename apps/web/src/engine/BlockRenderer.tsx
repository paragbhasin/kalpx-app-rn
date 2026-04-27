/**
 * BlockRenderer — Phase 3 scaffold.
 * All block types render a placeholder. Real blocks are ported in Phases 5–9.
 */

import React from 'react';

interface BlockRendererProps {
  block: {
    block_type: string;
    [key: string]: any;
  };
  screenData?: Record<string, any>;
}

export function BlockRenderer({ block }: BlockRendererProps) {
  return (
    <div
      style={{
        padding: '8px 12px',
        margin: '4px 0',
        border: '1px dashed #444',
        borderRadius: 6,
        fontSize: 12,
        color: '#888',
        fontFamily: 'monospace',
      }}
    >
      [{block.block_type}]
    </div>
  );
}
