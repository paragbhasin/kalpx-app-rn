/**
 * BlockRenderer — Phase 5 + Phase 6 (onboarding) + Phase 7 (dashboard) + Phase 8 (runner).
 * Real implementations for proof + onboarding + dashboard + triad runner blocks.
 * Everything else renders UnimplementedBlock with visible type label.
 */

import React from 'react';
import { HeadlineBlock } from '../components/blocks/HeadlineBlock';
import { SubtextBlock } from '../components/blocks/SubtextBlock';
import { PrimaryButtonBlock } from '../components/blocks/PrimaryButtonBlock';
import { OnboardingConversationTurnBlock } from '../components/blocks/OnboardingConversationTurnBlock';
import { OnboardingIntroHeroBlock } from '../components/blocks/OnboardingIntroHeroBlock';
import { GuidanceModePickerBlock } from '../components/blocks/GuidanceModePickerBlock';
import { FirstRecognitionBlock } from '../components/blocks/FirstRecognitionBlock';
import { PathEmergesBlock } from '../components/blocks/PathEmergesBlock';
import { NewDashboardBodyBlock } from '../components/blocks/NewDashboardBodyBlock';
import { MantraDisplayBlock } from '../components/blocks/MantraDisplayBlock';
import { RepCounterBlock } from '../components/blocks/RepCounterBlock';
import { AudioPlayerBlock } from '../components/blocks/AudioPlayerBlock';
import { SankalpHoldBlock } from '../components/blocks/SankalpHoldBlock';
import { PracticeTimerBlock } from '../components/blocks/PracticeTimerBlock';
import { CompletionReturnBlock } from '../components/blocks/CompletionReturnBlock';
import { TriggerEntryBlock } from '../components/blocks/TriggerEntryBlock';
import { SoundBridgeTransientBlock } from '../components/blocks/SoundBridgeTransientBlock';
import { CheckInRegulationBlock } from '../components/blocks/CheckInRegulationBlock';
import { BalancedAckOverlayBlock } from '../components/blocks/BalancedAckOverlayBlock';
import { VoiceConsentSheetBlock } from '../components/blocks/VoiceConsentSheetBlock';
import { VoiceNoteSheetBlock } from '../components/blocks/VoiceNoteSheetBlock';
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
    case 'onboarding_conversation_turn':
      return (
        <OnboardingConversationTurnBlock
          block={block}
          screenData={screenData}
          onAction={onAction}
        />
      );
    case 'onboarding_intro_hero':
      return <OnboardingIntroHeroBlock block={block} onAction={onAction} />;
    case 'guidance_mode_picker':
      return <GuidanceModePickerBlock block={block} onAction={onAction} />;
    case 'first_recognition':
      return <FirstRecognitionBlock block={block} screenData={screenData} />;
    case 'path_emerges':
      return <PathEmergesBlock block={block} screenData={screenData} />;
    case 'new_dashboard_body':
      return <NewDashboardBodyBlock block={block} screenData={screenData} onAction={onAction} />;

    // ── Phase 8: Runner blocks ────────────────────────────────────────
    case 'mantra_display':
    case 'mantra_runner_display':
      return <MantraDisplayBlock block={block} screenData={screenData} />;
    case 'rep_counter':
      return <RepCounterBlock block={block} screenData={screenData} onAction={onAction} />;
    case 'audio_player':
      return <AudioPlayerBlock block={block} screenData={screenData} />;
    case 'sankalp_hold':
      return <SankalpHoldBlock block={block} screenData={screenData} onAction={onAction} />;
    case 'practice_timer':
      return <PracticeTimerBlock block={block} screenData={screenData} onAction={onAction} />;
    case 'completion_return':
      return <CompletionReturnBlock block={block} screenData={screenData} onAction={onAction} />;

    // ── Phase 9: Support blocks ───────────────────────────────────────
    case 'trigger_entry':
      return <TriggerEntryBlock block={block} onAction={onAction} />;
    case 'sound_bridge_transient':
      return <SoundBridgeTransientBlock block={block} screenData={screenData} onAction={onAction} />;
    case 'checkin_regulation':
      return <CheckInRegulationBlock block={block} screenData={screenData} onAction={onAction} />;
    case 'balanced_ack_overlay':
      return <BalancedAckOverlayBlock block={block} screenData={screenData} onAction={onAction} />;
    case 'voice_consent_sheet':
      return <VoiceConsentSheetBlock block={block} screenData={screenData} onAction={onAction} />;
    case 'voice_note_sheet':
      return <VoiceNoteSheetBlock block={block} screenData={screenData} onAction={onAction} />;

    default:
      return <UnimplementedBlock block={block} />;
  }
}
