/**
 * NewDashboardBodyBlock — Phase 7.
 * Smart block rendered by companion_dashboard_v3/day_active.
 * Composes all dashboard sub-components from screenData.
 * Manages WhyThis sheet open/close state locally.
 */

import React, { useState } from 'react';
import { GreetingCard } from './dashboard/GreetingCard';
import { PathChip } from './dashboard/PathChip';
import { TriadCardsRow } from './dashboard/TriadCardsRow';
import { WhyThisL1Strip } from './dashboard/WhyThisL1Strip';
import { WhyThisSheet } from './dashboard/WhyThisSheet';
import { ContinuityBanner } from './dashboard/ContinuityBanner';
import { CycleProgressBlock } from './dashboard/CycleProgressBlock';
import { SankalpCarryBlock } from './dashboard/SankalpCarryBlock';
import { QuickSupportBlock } from './dashboard/QuickSupportBlock';
import { AdditionalItemsSectionBlock } from './dashboard/AdditionalItemsSectionBlock';

interface Props {
  block?: Record<string, any>;
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

export function NewDashboardBodyBlock({ screenData, onAction }: Props) {
  const [whyThisOpen, setWhyThisOpen] = useState(false);
  const sd = screenData || {};

  const hasWhyThis =
    (Array.isArray(sd.why_this_l1_items) && sd.why_this_l1_items.length > 0) ||
    !!sd.why_this?.level1;

  const hasContinuity = sd.continuity?.tier && sd.continuity.tier !== 'none';
  const hasSankalpCarry = Array.isArray(sd.sankalp_how_to_live) && sd.sankalp_how_to_live.length > 0;
  const hasAdditional = Array.isArray(sd.additional_items) && sd.additional_items.length > 0;

  return (
    <div style={{ padding: '20px 16px 80px' }}>
      <GreetingCard sd={sd} />
      <PathChip sd={sd} />
      <TriadCardsRow sd={sd} onAction={onAction} />

      {hasWhyThis && (
        <WhyThisL1Strip sd={sd} onOpen={() => setWhyThisOpen(true)} />
      )}

      {hasContinuity && <ContinuityBanner sd={sd} />}

      <CycleProgressBlock sd={sd} />

      {hasSankalpCarry && <SankalpCarryBlock sd={sd} />}

      <QuickSupportBlock onAction={onAction} />

      {hasAdditional && (
        <AdditionalItemsSectionBlock sd={sd} onAction={onAction} />
      )}

      {whyThisOpen && (
        <WhyThisSheet sd={sd} onClose={() => setWhyThisOpen(false)} />
      )}
    </div>
  );
}
