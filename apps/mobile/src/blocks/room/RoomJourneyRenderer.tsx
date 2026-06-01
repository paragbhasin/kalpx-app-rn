/**
 * RoomJourneyRenderer — phase-based inline room renderer.
 *
 * Replaces the modal-stack architecture (RoomGuidedSection + StepModal +
 * InquiryModal) for the new journey path. All practice bodies render inline.
 * No modal wrappers. Feature-flagged: only active when isJourneyEnabled().
 *
 * Phase machine:
 *   arrival → action_intro → [runner_wait | inline_action]
 *     → next_gentle_step → action_intro → ... → completion_return
 *
 * No-touch zones preserved:
 *   - RoomGuidedSection unchanged (fallback when flag OFF)
 *   - StepModal / InquiryModal unchanged (used by fallback path)
 *   - RoomContainer (ambient audio, context_picker, why_this_l2)
 *   - All app navigation contracts
 */
import { ROOM_LABELS, ROOM_REFLECTION_OPTIONS } from '@kalpx/contracts';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { executeAction } from '../../engine/actionExecutor';
import { trackRoomTelemetry } from '../../engine/mitraApi';
import { stopRoomAmbientAudio } from '../../engine/roomAmbientAudio';
import { navigationRef } from '../../Shared/Routes/NavigationService';
import { useScreenStore } from '../../engine/useScreenBridge';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/fonts';
import { buildActionCtx } from './actions/actionContextHelper';
import GroundingPhase from './phases/GroundingPhase';
import { InquiryDetail, InquiryList } from './phases/InquiryPhase';
import ReachOutPhase from './phases/ReachOutPhase';
import TextPhase from './phases/TextPhase';
import TimerPhase, { type TimerKind } from './phases/TimerPhase';
import VoicePhase from './phases/VoicePhase';
import {
  ACTION_FAMILY_COMPANION_DEFAULTS,
  CARRY_MEMORY_MODAL,
  classifyActionFamily,
  getCarryCTA,
  getCarryCompanion,
  getCarryPlaceholder,
  getCarryPrompt,
  getCompletionCopy,
  getInquiryCategoryPrompt,
  getRoomArrivalCopy,
  getRoomStepCompanionLine,
  getStepIntroLine,
  getBetweenStepLine,
  ROOM_COMPLETION_LINES,
} from './roomStepCopy';
import type { ActionEnvelope, InquiryCategory, RoomRenderV1, StepPayload } from './types';
import type { JourneyActionFamily } from './roomJourneyTypes';

const LOTUS_ICON = require('../../../assets/lotus_icon.png');

// ─── CarryConfirmationBeat ────────────────────────────────────────────────────
// Shown when a carry writes_event was already dispatched by a prior step.
// Never re-dispatches. Auto-advances after 2s; tap also advances.

const CarryConfirmationBeat: React.FC<{ line: string; onAdvance: () => void }> = ({
  line, onAdvance,
}) => {
  const { height: windowHeight } = useWindowDimensions();
  useEffect(() => {
    const t = setTimeout(onAdvance, 2000);
    return () => clearTimeout(t);
  }, [onAdvance]);
  return (
    <Pressable
      style={[{ flex: 1, minHeight: windowHeight, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }]}
      onPress={onAdvance}
      accessibilityRole="button"
    >
      <Text style={{ fontSize: 17, fontFamily: Fonts.serif.regular, color: '#432104', textAlign: 'center', lineHeight: 26 }}>
        {line}
      </Text>
    </Pressable>
  );
};

// ─── Phase state machine ──────────────────────────────────────────────────────

type PhaseState =
  | { id: 'arrival' }
  | { id: 'action_intro'; actionIndex: number }
  | { id: 'runner_wait'; actionIndex: number }
  | { id: 'inline_action'; actionIndex: number; subPhase?: 'inquiry_list' | 'inquiry_detail'; selectedCategory?: InquiryCategory }
  | { id: 'next_gentle_step'; betweenLine: string; nextActionIndex: number }
  | { id: 'completion_return' };

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTimerKind(action: ActionEnvelope): TimerKind | null {
  const tid = action.step_payload?.template_id ?? '';
  if (tid.startsWith('step_breathe_'))       return 'timer_breathe';
  if (tid.startsWith('step_sit_'))           return 'timer_sit';
  if (tid.startsWith('step_walk_'))          return 'timer_walk';
  if (tid.startsWith('step_hand_on_heart_')) return 'timer_heart';
  return null;
}

function getRunnerWaitLineKey(family: JourneyActionFamily): string {
  if (family === 'sankalp') return 'room.actions.stayWithTheOffering';
  if (family === 'practice') return 'room.actions.letThePracticeHoldYou';
  return 'room.actions.stayWithTheSound';
}

function getWritesEvent(action: ActionEnvelope): string | null {
  return (
    (action as any).carry_payload?.writes_event ??
    action.persistence?.writes_event ??
    null
  );
}

// ─── RoomJourneyRenderer ─────────────────────────────────────────────────────

interface Props {
  envelope: RoomRenderV1;
}

const RoomJourneyRenderer: React.FC<Props> = ({ envelope }) => {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { loadScreen, goBack, screenData } = useScreenStore();
  const actionCtx = buildActionCtx({ loadScreen, goBack });

  const roomId: string = envelope.room_id;
  const ctx = (envelope as any).room_context ?? {};
  const entryCtx = ctx.entry_context ?? {};
  const recId: string | null = entryCtx.recommended_first_action_id ?? null;
  const roomSteps = (envelope as any).room_steps;
  const roomDisplayName = ROOM_LABELS[envelope.room_id as keyof typeof ROOM_LABELS] ?? '';
  const arrivalCopyRaw = getRoomArrivalCopy(roomId, ctx);
  const arrivalCopy = {
    ...arrivalCopyRaw,
    companionLine: arrivalCopyRaw.companionLine || t('room.actions.youreHereThatIsEnough'),
  };
  const completionCopyRaw = getCompletionCopy(roomId);
  const completionCopy = {
    ...completionCopyRaw,
    message: completionCopyRaw.message || t('room.actions.youStayedWithIt'),
    subtext: completionCopyRaw.subtext || t('room.actions.youCanReturnAnytime'),
  };
  const reflectionOptions = ROOM_REFLECTION_OPTIONS[roomId as keyof typeof ROOM_REFLECTION_OPTIONS] ?? [];
  const renderId: string = (envelope as any).provenance?.render_id ?? '';

  // Redux keys (read-only here; written via actionCtx.setScreenValue)
  const resumeActionId = (screenData as any)?.room_sequence_resume_action_id as string | null;
  const pendingResumeActionId = (screenData as any)?.room_pending_resume_action_id as string | null;

  // orderedActions — exact logic from RoomGuidedSection.tsx:203-226
  const orderedActions = useMemo((): ActionEnvelope[] => {
    const actionMap = new Map(
      envelope.actions.map((a) => [a.action_id, a]),
    );
    const steps = Array.isArray(roomSteps)
      ? [...roomSteps].sort((a: any, b: any) => (a?.step_number ?? 0) - (b?.step_number ?? 0))
      : [];

    const orderedIds: string[] = [];
    if (recId) orderedIds.push(recId);
    for (const step of steps) {
      const actionId = step?.action_id;
      if (!actionId || orderedIds.includes(actionId)) continue;
      orderedIds.push(actionId);
    }

    const nonExitActions = envelope.actions.filter((a) => a.action_type !== 'exit');
    const fromSteps = orderedIds
      .map((id) => actionMap.get(id))
      .filter((a): a is ActionEnvelope => Boolean(a));

    return fromSteps.length > 0 ? fromSteps : nonExitActions;
  }, [envelope.actions, recId, roomSteps]);

  // ─── State ────────────────────────────────────────────────────────────────

  const [phase, setPhase] = useState<PhaseState>({ id: 'arrival' });
  const [runnerBeat, setRunnerBeat] = useState<string | null>(null); // "You made space."
  const [exitConfirmVisible, setExitConfirmVisible] = useState(false);
  const [selectedChip, setSelectedChip] = useState<string | null>(null);

  // Duplicate writes_event guard — tracks events dispatched this session
  const dispatchedEventsRef = useRef(new Set<string>());
  // Completion dispatch guard — room_sequence_completed fires exactly once per session
  const completionDispatchedRef = useRef(false);

  // Runner resume guards (same pattern as RoomGuidedSection)
  const handledResumeActionIdRef = useRef<string | null>(null);
  const pendingOpenedForRef = useRef<string | null>(null);

  // Keep current phase accessible in effects without stale closure
  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; });

  // ─── advancePhase ─────────────────────────────────────────────────────────

  const advancePhase = useCallback((completedIndex: number) => {
    let nextIndex = completedIndex + 1;
    while (nextIndex < orderedActions.length && orderedActions[nextIndex]?.action_type === 'exit') {
      nextIndex++;
    }

    if (nextIndex >= orderedActions.length) {
      // Do NOT dispatch room_sequence_completed here — it fires on "Return to Mitra Home" tap.
      setPhase({ id: 'completion_return' });
      return;
    }

    const completedAction = orderedActions[completedIndex];
    const nextAction = orderedActions[nextIndex];
    if (!completedAction || !nextAction) {
      setPhase({ id: 'completion_return' });
      return;
    }

    const completedFamily = classifyActionFamily(completedAction);
    const nextFamily = classifyActionFamily(nextAction);
    const betweenLine = getBetweenStepLine({ completedFamily, nextFamily });

    setPhase({ id: 'next_gentle_step', betweenLine, nextActionIndex: nextIndex });
  }, [orderedActions]);

  // ─── Runner resume effects ─────────────────────────────────────────────────

  // Watch room_sequence_resume_action_id — set by CycleTransitions when a runner completes
  useEffect(() => {
    if (!resumeActionId) return;
    if (handledResumeActionIdRef.current === resumeActionId) return;
    handledResumeActionIdRef.current = resumeActionId;

    // Clear Redux key
    actionCtx.setScreenValue(null, 'room_sequence_resume_action_id');

    // If we're in runner_wait, the runner returned — show beat then advance
    const current = phaseRef.current;
    if (current.id === 'runner_wait') {
      const completedIndex = current.actionIndex;
      setRunnerBeat(t('room.actions.youMadeSpace'));
      setTimeout(() => {
        setRunnerBeat(null);
        advancePhase(completedIndex);
      }, 1500);
      return;
    }

    // Otherwise, find the action and restore phase (remount recovery)
    const action = orderedActions.find((a) => a.action_id === resumeActionId);
    if (!action) return;
    const idx = orderedActions.indexOf(action);
    if (idx < 0) return;

    if (['in_room_carry', 'in_room_step', 'inquiry'].includes(action.action_type)) {
      actionCtx.setScreenValue(resumeActionId, 'room_pending_resume_action_id');
    } else {
      setPhase({ id: 'action_intro', actionIndex: idx });
    }
  }, [resumeActionId, orderedActions, advancePhase, actionCtx]);

  // Watch room_pending_resume_action_id — set when remounting after runner returns
  useEffect(() => {
    if (!pendingResumeActionId) return;
    if (pendingOpenedForRef.current === pendingResumeActionId) return;

    const action = orderedActions.find((a) => a.action_id === pendingResumeActionId);
    if (!action) return;
    const idx = orderedActions.indexOf(action);
    if (idx < 0) return;

    pendingOpenedForRef.current = pendingResumeActionId;

    if (action.action_type === 'inquiry') {
      setPhase({ id: 'inline_action', actionIndex: idx, subPhase: 'inquiry_list' });
    } else if (action.action_type === 'in_room_carry' || action.action_type === 'in_room_step') {
      setPhase({ id: 'inline_action', actionIndex: idx });
    }
  }, [pendingResumeActionId, orderedActions]);

  // ─── Dispatch helpers ──────────────────────────────────────────────────────

  function dispatchRunnerStart(action: ActionEnvelope) {
    const rp = action.runner_payload;
    if (!rp) return;
    const idx = orderedActions.indexOf(action);
    if (envelope.room_id) {
      actionCtx.setScreenValue(envelope.room_id, 'room_id');
    }
    void executeAction(
      {
        type: 'start_runner',
        payload: {
          source: rp.runner_source ?? 'support_room',
          variant: (rp as any).runner_kind ?? action.action_type.replace('runner_', '') ?? 'mantra',
          item: rp,
          action_id: action.action_id,
          room_sequence_active: true,
          room_sequence_action_ids: orderedActions.map((a) => a.action_id),
          room_sequence_index: idx,
        },
      } as any,
      actionCtx,
    );
  }

  function dispatchStepCompleted(action: ActionEnvelope, extra: Record<string, unknown> = {}) {
    const writesEvent = getWritesEvent(action);
    const templateId = action.step_payload?.template_id ?? '';
    void executeAction(
      {
        type: 'room_step_completed',
        payload: {
          room_id: roomId,
          template_id: templateId,
          action_id: action.action_id,
          analytics_key: action.analytics_key,
          writes_event: writesEvent,
          ...extra,
        },
      } as any,
      actionCtx,
    );
    if (writesEvent) dispatchedEventsRef.current.add(writesEvent);
    actionCtx.setScreenValue(null, 'room_pending_resume_action_id');
    pendingOpenedForRef.current = null;
  }

  function dispatchCarryCaptured(action: ActionEnvelope, text: string) {
    const writesEvent = getWritesEvent(action);
    // Duplicate guard — never dispatch the same writes_event twice
    if (writesEvent && dispatchedEventsRef.current.has(writesEvent)) {
      // Already saved by a prior step; skip silently
      return;
    }
    void executeAction(
      {
        type: 'room_carry_captured',
        payload: {
          room_id: roomId,
          action_id: action.action_id,
          analytics_key: action.analytics_key,
          label: action.label,
          writes_event: writesEvent,
          ...(text ? { text } : {}),
        },
      } as any,
      actionCtx,
    );
    if (writesEvent) dispatchedEventsRef.current.add(writesEvent);
    actionCtx.setScreenValue(null, 'room_pending_resume_action_id');
    pendingOpenedForRef.current = null;
  }

  function dispatchInquiryOpened(action: ActionEnvelope) {
    void executeAction(
      {
        type: 'room_inquiry_opened',
        payload: {
          room_id: roomId,
          action_id: action.action_id,
          analytics_key: action.analytics_key,
          category_count: action.inquiry_payload?.categories?.length ?? 0,
        },
      } as any,
      actionCtx,
    );
  }

  function dispatchInquiryCategorySelected(action: ActionEnvelope, category: InquiryCategory) {
    void executeAction(
      {
        type: 'room_inquiry_category_selected',
        payload: {
          room_id: roomId,
          category_id: category.id,
          action_id: action.action_id,
          analytics_key: action.analytics_key,
        },
      } as any,
      actionCtx,
    );
  }

  // ─── Begin sequence ───────────────────────────────────────────────────────

  function handleBegin() {
    if (envelope.room_id) {
      actionCtx.setScreenValue(envelope.room_id, 'room_id');
    }
    actionCtx.setScreenValue(false, 'show_room_reflection');
    actionCtx.setScreenValue(true, 'room_sequence_active');
    actionCtx.setScreenValue(orderedActions.map((a) => a.action_id), 'room_sequence_action_ids');
    actionCtx.setScreenValue(null, 'room_sequence_resume_action_id');
    void (trackRoomTelemetry as any)({
      event_type: 'recommended_action_started',
      room_id: roomId,
      render_id: renderId,
      action_id: orderedActions[0]?.action_id,
      surface: 'room',
    });
    if (!orderedActions[0]) {
      setPhase({ id: 'completion_return' });
      return;
    }
    handleActionBegin(0);
  }

  // ─── "Begin" tap on action_intro ─────────────────────────────────────────

  function handleActionBegin(actionIndex: number) {
    const action = orderedActions[actionIndex];
    if (!action) return;
    const family = classifyActionFamily(action);

    if (action.action_type.startsWith('runner_')) {
      setPhase({ id: 'runner_wait', actionIndex });
      dispatchRunnerStart(action);
      return;
    }

    if (action.action_type === 'inquiry') {
      dispatchInquiryOpened(action);
      setPhase({ id: 'inline_action', actionIndex, subPhase: 'inquiry_list' });
      return;
    }

    setPhase({ id: 'inline_action', actionIndex });
  }

  // ─── Exit ─────────────────────────────────────────────────────────────────

  function handleExitRequest() {
    setExitConfirmVisible(true);
  }

  function handleConfirmExit() {
    setExitConfirmVisible(false);
    void (trackRoomTelemetry as any)({
      event_type: 'room_exited',
      room_id: roomId,
      surface: 'room',
    });
    void executeAction(
      { type: 'room_exit', payload: { room_id: roomId } } as any,
      actionCtx,
    );
  }

  // ─── Auto-advance effects ─────────────────────────────────────────────────

  // arrival: tap only — no auto-advance. User reads at their own pace.
  // next_gentle_step: tap only — same principle. Between-step lines need to be read.

  // ─── Inline action completion handlers ───────────────────────────────────

  function handleInlineComplete(actionIndex: number, extra: Record<string, unknown> = {}) {
    const action = orderedActions[actionIndex];
    if (!action) return;

    if (action.action_type === 'in_room_carry') {
      dispatchCarryCaptured(action, (extra.text as string) ?? '');
    } else if (action.action_type === 'in_room_step') {
      dispatchStepCompleted(action, extra);
    }
    advancePhase(actionIndex);
  }

  function handleInquirySubmit(actionIndex: number, category: InquiryCategory, text: string) {
    const action = orderedActions[actionIndex];
    if (!action) return;
    void executeAction(
      {
        type: 'room_step_completed',
        payload: {
          room_id: roomId,
          template_id: 'step_journal_inquiry',
          action_id: action.action_id,
          analytics_key: action.analytics_key,
          writes_event: action.persistence?.writes_event ?? null,
          text,
          category_id: category.id,
          source: 'inquiry',
        },
      } as any,
      actionCtx,
    );
    actionCtx.setScreenValue(null, 'room_pending_resume_action_id');
    pendingOpenedForRef.current = null;
    advancePhase(actionIndex);
  }

  // ─── Completion chip ──────────────────────────────────────────────────────

  function handleChipSelect(code: string) {
    setSelectedChip(code);
  }

  function handleReturnHome() {
    // Guard against double-tap
    if (completionDispatchedRef.current) return;
    completionDispatchedRef.current = true;

    // Fire completion telemetry (lightweight — does not trigger any screen change)
    void (trackRoomTelemetry as any)({
      event_type: 'room_sequence_completed',
      room_id: roomId,
      chip_code: selectedChip ?? null,
    });

    // Clear room sequence state. We intentionally skip dispatching
    // room_sequence_completed because its handler calls
    // loadScreen(practice_runner/completion_return) which renders the old
    // CompletionReturnTransient block on top of our own completion screen.
    actionCtx.setScreenValue(false, 'room_sequence_active');
    actionCtx.setScreenValue(null, 'room_sequence_resume_action_id');
    actionCtx.setScreenValue(null, 'room_sequence_action_ids');
    actionCtx.setScreenValue(null, 'room_sequence_index');
    actionCtx.setScreenValue(null, 'room_id');
    void stopRoomAmbientAudio();

    // Navigate back to the surface that launched this room (same logic as room_exit).
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
    } else if (navigationRef.isReady()) {
      (navigationRef as any).navigate('Home');
    } else {
      actionCtx.loadScreen({ container_id: 'companion_dashboard_v3', state_id: 'day_active' } as any);
    }
  }

  // ─── Render helpers ───────────────────────────────────────────────────────

  function renderInlineAction() {
    if (phase.id !== 'inline_action') return null;
    const { actionIndex, subPhase, selectedCategory } = phase;
    const action = orderedActions[actionIndex];
    if (!action) return null;
    const family = classifyActionFamily(action);
    const companionLine = getRoomStepCompanionLine({ action, roomContext: ctx });

    // ── Timer (breathe/sit/walk/heart) ──
    const timerKind = getTimerKind(action);
    if (timerKind) {
      return (
        <TimerPhase
          kind={timerKind}
          stepPayload={action.step_payload}
          companionLine={companionLine}
          onComplete={() => handleInlineComplete(actionIndex)}
          onEscape={handleExitRequest}
        />
      );
    }

    // ── Grounding ──
    if (family === 'grounding') {
      return (
        <GroundingPhase
          stepPayload={action.step_payload}
          companionLine={companionLine}
          onComplete={(text) => handleInlineComplete(actionIndex, text ? { text } : {})}
          onEscape={handleExitRequest}
        />
      );
    }

    // ── Inquiry ──
    if (family === 'inquiry') {
      const categories = action.inquiry_payload?.categories ?? [];
      if (subPhase === 'inquiry_detail' && selectedCategory) {
        return (
          <InquiryDetail
            category={selectedCategory}
            reflectivePrompt={getInquiryCategoryPrompt(selectedCategory) || t('room.actions.whatDoesThisBringUp')}
            onSave={(categoryId, text) => handleInquirySubmit(actionIndex, selectedCategory, text)}
            onSkip={() => advancePhase(actionIndex)}
            onEscape={handleExitRequest}
          />
        );
      }
      return (
        <InquiryList
          categories={categories}
          companionLine={companionLine}
          onSelect={(cat) => {
            dispatchInquiryCategorySelected(action, cat);
            setPhase({ id: 'inline_action', actionIndex, subPhase: 'inquiry_detail', selectedCategory: cat });
          }}
          onSkipStep={() => advancePhase(actionIndex)}
          onEscape={handleExitRequest}
        />
      );
    }

    // ── Teaching ──
    if (family === 'teaching') {
      const body = action.teaching_payload?.body ?? companionLine;
      return (
        <ScrollView contentContainerStyle={styles.teachingScroll}>
          {companionLine ? (
            <Text style={styles.teachingCompanion}>{companionLine}</Text>
          ) : null}
          <Text style={styles.teachingBody}>{body}</Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => advancePhase(actionIndex)}
            activeOpacity={0.7}
          >
            <Text style={[styles.ctaText, isHindi && { letterSpacing: 0 }]}>{t('room.actions.continue')}</Text>
          </TouchableOpacity>
        </ScrollView>
      );
    }

    // ── Carry / text_input / journal ──
    if (family === 'carry') {
      const writesEvent = getWritesEvent(action);
      const alreadySaved = writesEvent ? dispatchedEventsRef.current.has(writesEvent) : false;
      if (alreadySaved) {
        // Duplicate guard: already dispatched this writes_event from a prior step.
        // Show confirmation beat instead of save UI. Never dispatch again.
        return (
          <CarryConfirmationBeat
            line={t('room.actions.aThreadOfCare')}
            onAdvance={() => advancePhase(actionIndex)}
          />
        );
      }
      return (
        <TextPhase
          companionLine={getCarryCompanion(writesEvent)}
          prompt={getCarryPrompt(writesEvent)}
          placeholder={getCarryPlaceholder(writesEvent)}
          ctaLabel={getCarryCTA(writesEvent)}
          onSave={(text) => {
            dispatchCarryCaptured(action, text);
            setTimeout(() => advancePhase(actionIndex), 700);
          }}
          onSkip={() => advancePhase(actionIndex)}
        />
      );
    }

    if (family === 'text_input') {
      const writesEvent = getWritesEvent(action);
      const sc = action.step_payload?.step_config;
      const maxChars = typeof (sc as any)?.max_chars === 'number' ? (sc as any).max_chars : 1000;
      const modal = CARRY_MEMORY_MODAL[writesEvent ?? ''];
      return (
        <TextPhase
          companionLine={modal?.why_we_ask ?? modal?.sanatan_context ?? companionLine}
          prompt={modal?.prompt ?? action.step_payload?.prompt ?? t('room.actions.whatIsPresentRightNow')}
          placeholder={modal?.placeholder ?? t('room.actions.writeAFewWords')}
          ctaLabel={modal?.primary_label ?? t('room.actions.letThisLand')}
          maxChars={maxChars}
          onSave={(text) => {
            dispatchStepCompleted(action, { text });
            setTimeout(() => advancePhase(actionIndex), 700);
          }}
          onSkip={() => advancePhase(actionIndex)}
        />
      );
    }

    // ── Voice note ──
    if (family === 'voice_note') {
      if (Platform.OS === 'web') {
        // Web always falls back to text input
        return (
          <TextPhase
            companionLine={companionLine}
            prompt={t('room.actions.writeWhatYouWouldHaveSpoken')}
            placeholder={t('room.actions.writeAFewWords')}
            ctaLabel={t('room.actions.letThisLand')}
            onSave={(text) => handleInlineComplete(actionIndex, { text })}
            onSkip={() => advancePhase(actionIndex)}
          />
        );
      }
      return (
        <VoicePhase
          companionLine={companionLine}
          onSave={(uri, durationMs) => handleInlineComplete(actionIndex, { uri, duration_ms: durationMs })}
          onWriteInstead={() => {
            // Transition to text variant inline
            setPhase({ id: 'inline_action', actionIndex, subPhase: undefined, selectedCategory: undefined });
          }}
          onSkip={() => advancePhase(actionIndex)}
        />
      );
    }

    // ── Reach out ──
    if (family === 'reach_out') {
      const writesEvent = getWritesEvent(action);
      const modal = CARRY_MEMORY_MODAL[writesEvent ?? ''] ?? CARRY_MEMORY_MODAL['connection_reach_out'];
      return (
        <ReachOutPhase
          companionLine={modal?.why_we_ask ?? companionLine}
          prompt={modal?.prompt ?? t('room.actions.writeShortMessageToSomeone')}
          placeholder={modal?.placeholder ?? t('room.actions.yourMessage')}
          ctaLabel={modal?.primary_label ?? t('room.actions.copyAndGo')}
          onSave={(text) => handleInlineComplete(actionIndex, { text })}
          onSkip={() => advancePhase(actionIndex)}
        />
      );
    }

    // ── Unknown / unrecognized action — never return null, never get stuck ──
    return (
      <View style={styles.unknownStep}>
        <Text style={[styles.unknownTitle, isHindi && { letterSpacing: 0 }]}>{t('room.actions.aGentleStep')}</Text>
        <Text style={[styles.unknownCompanion, isHindi && { letterSpacing: 0 }]}>{companionLine || t('room.actions.mitraIsWithYou')}</Text>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => advancePhase(actionIndex)}
          activeOpacity={0.7}
        >
          <Text style={[styles.ctaText, isHindi && { letterSpacing: 0 }]}>{t('room.actions.continue')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Phase renders ────────────────────────────────────────────────────────

  function renderArrival() {
    return (
      <Pressable
        style={[styles.phaseFill, { minHeight: windowHeight }]}
        onPress={handleBegin}
        accessibilityRole="button"
        accessibilityLabel={t('room.actions.beginRoomJourney')}
      >
        <ScrollView
          contentContainerStyle={[
            styles.arrivalScroll,
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Image source={LOTUS_ICON} style={styles.arrivalLotus} resizeMode="contain" />
          <Text style={styles.arrivalRoomName}>{roomDisplayName}</Text>

          <View style={styles.arrivalDivider}>
            <View style={styles.hairline} />
            <Text style={styles.diamond}>◇</Text>
            <View style={styles.hairline} />
          </View>

          {arrivalCopy.companionLine ? (
            <Text style={styles.arrivalCompanion}>{arrivalCopy.companionLine}</Text>
          ) : null}

          {arrivalCopy.wisdomLine ? (
            <View style={styles.wisdomRow}>
              <View style={styles.wisdomAccent} />
              <Text style={styles.wisdomText}>{arrivalCopy.wisdomLine}</Text>
            </View>
          ) : null}

          {envelope.principle_banner ? (
            <View style={styles.bannerRow}>
              <Text style={styles.bannerText}>
                {envelope.principle_banner.wisdom_anchor_line}
              </Text>
            </View>
          ) : null}

          <Text style={[styles.arrivalHint, isHindi && { letterSpacing: 0 }]}>{t('room.actions.whenYouReady')}</Text>
        </ScrollView>
      </Pressable>
    );
  }

  function renderActionIntro() {
    if (phase.id !== 'action_intro') return null;
    const { actionIndex } = phase;
    const action = orderedActions[actionIndex];
    if (!action) return null;
    const family = classifyActionFamily(action);
    const companionLine = getRoomStepCompanionLine({ action, roomContext: ctx });
    const stepIntro = getStepIntroLine(family);
    const isFirst = actionIndex === 0;
    const rp = action.runner_payload;

    return (
      <ScrollView
        contentContainerStyle={[
          styles.introScroll,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isFirst ? (
          <Text style={[styles.introBrow, isHindi && { letterSpacing: 0 }]}>{t('room.actions.mitraBeginsWith')}</Text>
        ) : null}

        <Text style={styles.introLabel}>
          {rp?.title ?? action.label ?? stepIntro}
        </Text>

        {rp?.devanagari ? (
          <Text style={styles.introDevanagari}>{rp.devanagari}</Text>
        ) : null}

        {companionLine ? (
          <Text style={styles.introCompanion}>{companionLine}</Text>
        ) : null}

        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => handleActionBegin(actionIndex)}
          activeOpacity={0.7}
          testID={`room_journey_begin_${action.action_id}`}
        >
          <Text style={[styles.ctaText, isHindi && { letterSpacing: 0 }]}>{t('room.actions.begin')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleExitRequest} style={styles.escapeBtn} hitSlop={{ top: 8, bottom: 8 }}>
          <Text style={[styles.escapeText, isHindi && { letterSpacing: 0 }]}>{t('room.actions.illGoNow')}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  function renderRunnerWait() {
    const currentAction = phase.id === 'runner_wait' ? orderedActions[phase.actionIndex] : null;
    const waitLine = runnerBeat ?? (
      currentAction
        ? t(getRunnerWaitLineKey(classifyActionFamily(currentAction)))
        : t('room.actions.stayWithTheSound')
    );
    return (
      <View style={[styles.phaseFill, styles.runnerCenter, { minHeight: windowHeight }]}>
        <Image source={LOTUS_ICON} style={styles.runnerLotus} resizeMode="contain" />
        <Text style={[styles.runnerText, isHindi && { letterSpacing: 0 }]}>{waitLine}</Text>
      </View>
    );
  }

  function renderNextGentleStep() {
    if (phase.id !== 'next_gentle_step') return null;
    const nextIdx = phase.nextActionIndex;
    return (
      <Pressable
        style={[styles.phaseFill, styles.betweenCenter, { minHeight: windowHeight }]}
        onPress={() => setPhase({ id: 'action_intro', actionIndex: nextIdx })}
        accessibilityRole="button"
        accessibilityLabel={t('room.actions.continueToNextStep')}
      >
        <Text style={styles.betweenLine}>{phase.betweenLine}</Text>
        <Text style={[styles.betweenHint, isHindi && { letterSpacing: 0 }]}>{t('room.actions.tapWhenReady')}</Text>
      </Pressable>
    );
  }

  function renderCompletion() {
    return (
      <ScrollView
        contentContainerStyle={[
          styles.completionScroll,
          { paddingTop: insets.top + 36, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {completionCopy.sanatanHeader ? (
          <Text style={styles.completionSanatan}>{completionCopy.sanatanHeader}</Text>
        ) : null}

        <Text style={styles.completionMessage}>{completionCopy.message}</Text>
        <Text style={styles.completionSubtext}>{completionCopy.subtext}</Text>

        {reflectionOptions.length > 0 ? (
          <View style={styles.chipRow}>
            {reflectionOptions.map((opt) => (
              <TouchableOpacity
                key={opt.code}
                style={[styles.chip, selectedChip === opt.code && styles.chipSelected]}
                onPress={() => handleChipSelect(opt.code)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, selectedChip === opt.code && styles.chipTextSelected]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={handleReturnHome}
          activeOpacity={0.7}
          testID="room_journey_return_home"
        >
          <Text style={[styles.ctaText, isHindi && { letterSpacing: 0 }]}>{t('room.actions.returnToMitraHome')}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // ─── Exit confirm modal ───────────────────────────────────────────────────

  function renderExitConfirm() {
    return (
      <Modal
        visible={exitConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setExitConfirmVisible(false)}
      >
        <View style={styles.exitOverlay}>
          <View style={styles.exitSheet}>
            <Text style={[styles.exitTitle, isHindi && { letterSpacing: 0 }]}>{t('room.actions.leaveThisRoom')}</Text>
            <Text style={[styles.exitBody, isHindi && { letterSpacing: 0 }]}>
              {t('room.actions.practiceHeld')}
            </Text>
            <TouchableOpacity
              style={styles.exitConfirmBtn}
              onPress={handleConfirmExit}
              activeOpacity={0.8}
            >
              <Text style={[styles.exitConfirmText, isHindi && { letterSpacing: 0 }]}>{t('room.actions.yesIllGoNow')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.exitCancelBtn}
              onPress={() => setExitConfirmVisible(false)}
              hitSlop={{ top: 8, bottom: 8 }}
            >
              <Text style={[styles.exitCancelText, isHindi && { letterSpacing: 0 }]}>{t('room.actions.stay')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // ─── Root render ──────────────────────────────────────────────────────────

  const minH = windowHeight - insets.top;

  return (
    <View style={[styles.root, { minHeight: minH }]} testID={`room_journey_${roomId}`}>
      {phase.id === 'arrival' && renderArrival()}

      {phase.id === 'action_intro' && (
        <>
          {renderActionIntro()}
        </>
      )}

      {phase.id === 'runner_wait' && renderRunnerWait()}

      {phase.id === 'inline_action' && (
        <View style={[styles.inlineRoot, { minHeight: minH }]}>
          {renderInlineAction()}
          {/* Floating exit — suppressed for timed steps (they own "I'll go now" internally)
              and for inquiry (handled within InquiryPhase). */}
          {((): boolean => {
            const f = classifyActionFamily(orderedActions[phase.actionIndex] ?? {} as ActionEnvelope);
            return f !== 'inquiry' && f !== 'breathe' && f !== 'sit' && f !== 'walk' && f !== 'heart' && f !== 'grounding';
          })() && (
            <TouchableOpacity
              onPress={handleExitRequest}
              style={styles.floatingEscape}
              hitSlop={{ top: 8, bottom: 8 }}
            >
              <Text style={[styles.escapeText, isHindi && { letterSpacing: 0 }]}>{t('room.actions.illGoNow')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {phase.id === 'next_gentle_step' && renderNextGentleStep()}

      {phase.id === 'completion_return' && renderCompletion()}

      {renderExitConfirm()}
    </View>
  );
};

export default RoomJourneyRenderer;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  phaseFill: {
    flex: 1,
  },
  inlineRoot: {
    flex: 1,
  },

  // ── Arrival ──
  arrivalScroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  arrivalLotus: {
    width: 36,
    height: 30,
    tintColor: Colors.gold,
    opacity: 0.7,
    marginBottom: 16,
  },
  arrivalRoomName: {
    fontSize: 24,
    fontFamily: Fonts.serif.regular,
    color: '#432104',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  arrivalDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '70%',
    marginBottom: 20,
  },
  hairline: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.goldHairline,
    opacity: 0.5,
  },
  diamond: {
    fontSize: 12,
    color: Colors.goldHairline,
    marginHorizontal: 10,
    opacity: 0.7,
  },
  arrivalCompanion: {
    fontSize: 16,
    fontFamily: Fonts.sans.regular,
    color: '#6B5E4E',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
    fontStyle: 'italic',
    paddingHorizontal: 8,
  },
  wisdomRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  wisdomAccent: {
    width: 2,
    alignSelf: 'stretch',
    backgroundColor: Colors.goldHairline,
    marginRight: 10,
    borderRadius: 1,
    opacity: 0.7,
  },
  wisdomText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.sans.regular,
    color: '#8A7968',
    lineHeight: 20,
  },
  bannerRow: {
    backgroundColor: 'rgba(255, 248, 230, 0.85)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.goldHairline,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
    alignSelf: 'stretch',
  },
  bannerText: {
    fontSize: 13,
    fontFamily: Fonts.sans.medium,
    color: '#8b6914',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  arrivalHint: {
    fontSize: 12,
    color: '#C4B49A',
    fontFamily: Fonts.sans.regular,
    marginTop: 24,
    letterSpacing: 0.5,
  },

  // ── Action intro ──
  introScroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  introBrow: {
    fontSize: 12,
    fontFamily: Fonts.sans.medium,
    color: '#8b7a55',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 12,
    textAlign: 'center',
  },
  introLabel: {
    fontSize: 26,
    fontFamily: Fonts.serif.regular,
    color: '#432104',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 8,
  },
  introDevanagari: {
    fontSize: 18,
    color: '#8b6914',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 26,
  },
  introCompanion: {
    fontSize: 15,
    fontFamily: Fonts.sans.regular,
    color: Colors.textSoft,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    fontStyle: 'italic',
    paddingHorizontal: 8,
  },

  // ── Runner wait ──
  runnerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  runnerLotus: {
    width: 48,
    height: 40,
    tintColor: Colors.gold,
    opacity: 0.6,
    marginBottom: 24,
  },
  runnerText: {
    fontSize: 16,
    fontFamily: Fonts.sans.regular,
    color: Colors.textSoft,
    textAlign: 'center',
    lineHeight: 24,
    fontStyle: 'italic',
  },

  // ── Between step ──
  betweenCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  betweenLine: {
    fontSize: 20,
    fontFamily: Fonts.serif.regular,
    color: '#432104',
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: 20,
  },
  betweenHint: {
    fontSize: 12,
    color: '#C4B49A',
    fontFamily: Fonts.sans.regular,
    letterSpacing: 0.5,
  },

  // ── Unknown action fallback ──
  unknownStep: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  unknownTitle: {
    fontSize: 20,
    fontFamily: Fonts.serif.regular,
    color: '#432104',
    textAlign: 'center',
    marginBottom: 12,
  },
  unknownCompanion: {
    fontSize: 15,
    fontFamily: Fonts.sans.regular,
    color: Colors.textSoft,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    fontStyle: 'italic',
  },

  // ── Teaching ──
  teachingScroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  teachingCompanion: {
    fontSize: 14,
    fontFamily: Fonts.sans.regular,
    color: Colors.textSoft,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  teachingBody: {
    fontSize: 16,
    fontFamily: Fonts.sans.regular,
    color: '#432104',
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: 32,
  },

  // ── Completion ──
  completionScroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  completionSanatan: {
    fontSize: 13,
    fontFamily: Fonts.sans.medium,
    color: '#8b6914',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  completionMessage: {
    fontSize: 26,
    fontFamily: Fonts.serif.regular,
    color: '#432104',
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: 10,
  },
  completionSubtext: {
    fontSize: 15,
    fontFamily: Fonts.sans.regular,
    color: Colors.textSoft,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    fontStyle: 'italic',
    paddingHorizontal: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 28,
  },
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.goldHairline,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 253, 247, 0.9)',
  },
  chipSelected: {
    backgroundColor: Colors.goldPale,
    borderColor: Colors.gold,
  },
  chipText: {
    fontSize: 13,
    fontFamily: Fonts.sans.regular,
    color: '#6B5E4E',
  },
  chipTextSelected: {
    color: '#432104',
    fontFamily: Fonts.sans.medium,
  },

  // ── Shared CTA ──
  ctaBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 4,
  },
  ctaText: {
    fontSize: 15,
    fontFamily: Fonts.sans.medium,
    color: '#fff',
    letterSpacing: 0.3,
  },
  escapeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 20,
  },
  escapeText: {
    fontSize: 13,
    color: '#B8A898',
    fontFamily: Fonts.sans.regular,
    textDecorationLine: 'underline',
  },
  floatingEscape: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 16,
  },

  // ── Exit confirm ──
  exitOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 20, 10, 0.45)',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  exitSheet: {
    backgroundColor: '#FFFDF7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  exitTitle: {
    fontSize: 18,
    fontFamily: Fonts.serif.regular,
    color: '#432104',
    marginBottom: 10,
  },
  exitBody: {
    fontSize: 14,
    fontFamily: Fonts.sans.regular,
    color: Colors.textSoft,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  exitConfirmBtn: {
    backgroundColor: Colors.gold,
    borderRadius: 24,
    paddingVertical: 13,
    paddingHorizontal: 36,
    marginBottom: 14,
  },
  exitConfirmText: {
    fontSize: 15,
    fontFamily: Fonts.sans.medium,
    color: '#fff',
    letterSpacing: 0.3,
  },
  exitCancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  exitCancelText: {
    fontSize: 14,
    color: '#B8A898',
    fontFamily: Fonts.sans.regular,
    textDecorationLine: 'underline',
  },
});
