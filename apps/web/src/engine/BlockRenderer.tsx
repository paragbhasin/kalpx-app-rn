/**
 * BlockRenderer — Phase 5.
 * Real implementations for the blocks needed in the vertical-slice proof.
 * Everything else renders UnimplementedBlock with visible type label.
 */

import React from 'react';
import { HeadlineBlock } from '../components/blocks/HeadlineBlock';
import { SubtextBlock } from '../components/blocks/SubtextBlock';
import { PrimaryButtonBlock } from '../components/blocks/PrimaryButtonBlock';
import { UnimplementedBlock } from '../components/blocks/UnimplementedBlock';

interface BlockRendererProps {
  block: {
    block_type?: string;
    type?: string;
    [key: string]: any;
  };
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

export function BlockRenderer({ block, screenData, onAction }: BlockRendererProps) {
  const blockType: string = block.block_type || block.type || '';

  // Check visibility condition — skip hidden blocks
  if (block.visibility_condition) {
    const cond = block.visibility_condition;
    if (screenData && screenData[cond] === false) return null;
    if (screenData && !screenData[cond] && screenData[cond] !== undefined) return null;
  }

  switch (blockType) {
    case 'headline':
      return <HeadlineBlock block={block} />;
    case 'subtext':
      return <SubtextBlock block={block} onAction={onAction} />;
    case 'primary_button':
      return <PrimaryButtonBlock block={block} onAction={onAction} />;
    default:
      return <UnimplementedBlock block={block} />;
  }
}
