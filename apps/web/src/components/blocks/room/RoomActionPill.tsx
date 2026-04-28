/**
 * RoomActionPill — renders a single room action from the RoomRenderV1 envelope.
 * Phase 13.5: Parity with RN StepPill / InquiryPill / CarryCaptureModal.
 *
 * Handles: runner_mantra, runner_sankalp, runner_practice, teaching, inquiry,
 *          in_room_step, in_room_carry, exit.
 */
import React, { useState } from 'react';
import { StepModal, classifyStep } from './StepModal';
import type { StepModalResult } from './StepModal';
import { InquiryModal } from './InquiryModal';
import { CarryCaptureModal } from './CarryCaptureModal';
import { postRoomSacred } from '../../../engine/mitraApi';

interface RoomAction {
  action_id: string;
  label: string;
  action_type: string;
  action_family?: string;
  analytics_key?: string | null;
  helper_line?: string | null;
  runner_payload?: any;
  teaching_payload?: any;
  inquiry_payload?: any;
  step_payload?: any;
  carry_payload?: any;
  exit_payload?: any;
  primary_recommendation?: boolean;
  persistence?: { writes_event?: string | null };
  display?: { display_title?: string | null; transliteration?: string | null };
  [key: string]: any;
}

interface Props {
  action: RoomAction;
  roomId: string;
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

// Carry types that write sacred text (need modal + API call)
const TEXT_CARRY_WRITES_EVENTS = new Set([
  'joy_carry',
  'release_capture',
  'growth_reflect',
  'clarity_note',
  'stillness_note',
  'connection_note',
]);

export function RoomActionPill({ action, roomId, screenData = {}, onAction }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [done, setDone] = useState(false);
  const [stepModalVisible, setStepModalVisible] = useState(false);
  const [inquiryModalVisible, setInquiryModalVisible] = useState(false);
  const [carryModalVisible, setCarryModalVisible] = useState(false);
  // Active step payload — either action.step_payload (normal tap) or synthesized from inquiry practice launch
  const [activeStepPayload, setActiveStepPayload] = useState<any>(null);

  const isExit = action.action_type === 'exit';
  const isRunner = action.action_type.startsWith('runner_');
  const isTeaching = action.action_type === 'teaching';
  const isInquiry = action.action_type === 'inquiry';
  const isStep = action.action_type === 'in_room_step';
  const isCarry = action.action_type === 'in_room_carry';

  // Whether this carry action writes text (needs modal)
  const writesEvent = action.carry_payload?.persistence?.writes_event ?? action.persistence?.writes_event ?? null;
  const carryNeedsTextInput = isCarry && !!writesEvent && (
    TEXT_CARRY_WRITES_EVENTS.has(writesEvent) ||
    String(writesEvent).includes('capture') ||
    String(writesEvent).includes('carry') ||
    String(writesEvent).includes('note') ||
    String(writesEvent).includes('reflect')
  );

  // Joy carry flag (navigates to dashboard on confirm)
  const isJoyCarry = writesEvent === 'joy_carry';

  const handleTap = () => {
    if (isExit) {
      onAction?.({ type: 'room_exit', payload: { room_id: roomId } });
      return;
    }

    if (isRunner) {
      const rp = action.runner_payload || {};
      const variant = action.action_type === 'runner_mantra' ? 'mantra'
        : action.action_type === 'runner_sankalp' ? 'sankalp'
        : 'practice';
      const item = rp.item || rp.offering || {};
      // G17 Fix 1: use BE-provided runner_source so track-completion records a valid source.
      // 'support_room' is the canonical fallback (matches RN VALID_SOURCE_SURFACES).
      onAction?.({
        type: 'start_runner',
        payload: { source: rp.runner_source || 'support_room', variant, item },
      });
      return;
    }

    if (isTeaching) {
      // R2c: Teaching expands inline (approved web divergence — RN navigates to WhyThisL2Sheet).
      // Dispatch is room_step_completed, NOT open_why_this_l2. This is intentional.
      setExpanded(!expanded);
      if (!expanded) {
        onAction?.({
          type: 'room_step_completed',
          payload: { room_id: roomId, action_id: action.action_id, analytics_key: action.analytics_key },
        });
      }
      return;
    }

    if (isInquiry) {
      setInquiryModalVisible(true);
      if (!expanded) {
        onAction?.({
          type: 'room_inquiry_opened',
          payload: { room_id: roomId, action_id: action.action_id, analytics_key: action.analytics_key },
        });
        setExpanded(true);
      }
      return;
    }

    if (isStep) {
      const kind = classifyStep(action.step_payload?.template_id);
      if (kind !== 'unknown') {
        setActiveStepPayload(action.step_payload);
        setStepModalVisible(true);
      } else if (!done) {
        // Unknown template: complete immediately
        setDone(true);
        onAction?.({
          type: 'room_step_completed',
          payload: {
            room_id: roomId,
            action_id: action.action_id,
            analytics_key: action.analytics_key,
            template_id: action.step_payload?.template_id,
            writes_event: action.step_payload?.persistence?.writes_event,
          },
        });
      }
      return;
    }

    if (isCarry) {
      if (carryNeedsTextInput && !done) {
        setCarryModalVisible(true);
      } else if (!done) {
        setDone(true);
        onAction?.({
          type: 'room_carry_captured',
          payload: {
            room_id: roomId,
            action_id: action.action_id,
            analytics_key: action.analytics_key,
            label: action.label,
            writes_event: writesEvent,
          },
        });
      }
      return;
    }

    console.warn('[RoomActionPill] unknown action_type:', action.action_type);
  };

  const pillStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px 20px',
    borderRadius: 22,
    border: isExit
      ? '1px solid var(--kalpx-border-gold)'
      : action.primary_recommendation && !done
      ? '1.4px solid #D4A017'
      : '1px solid rgba(159,159,159,0.3)',
    background: isExit
      ? 'rgba(255,248,239,0.6)'
      : done
      ? 'rgba(201,168,76,0.06)'
      : '#FBF5F5',
    color: isExit ? 'var(--kalpx-text-muted)' : done ? 'var(--kalpx-text-muted)' : 'var(--kalpx-text)',
    fontSize: 15,
    textAlign: 'center' as const,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
    boxShadow: isExit ? 'none' : 'var(--kalpx-shadow-pill)',
    touchAction: 'manipulation' as const,
  };

  const expandableContent =
    isTeaching
      ? action.teaching_payload?.body || action.teaching_payload?.text || ''
      : '';

  // Transliteration: shown for runner_mantra if available
  const transliteration = action.action_type === 'runner_mantra'
    ? (action.display?.transliteration || action.runner_payload?.transliteration || null)
    : null;

  // Exit renders as a plain underlined text link — no pill wrapper, no action_family label (matches RN RoomActionExitPill)
  if (isExit) {
    return (
      <div data-testid={`room-action-${action.action_id}`} style={{ textAlign: 'center', margin: '4px 0' }}>
        <button
          onClick={handleTap}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 15,
            color: 'var(--kalpx-text)',
            textDecoration: 'underline',
            padding: '8px 0',
          }}
          data-testid={`room-action-exit-${action.action_id}`}
        >
          {action.label || "I'll go now"}
        </button>
      </div>
    );
  }

  return (
    <div data-testid={`room-action-${action.action_id}`}>
      <button style={pillStyle} onClick={handleTap}>
        {/* Kind label (action_family) — centered, uppercase */}
        {action.action_family && !done && (
          <span style={{ fontSize: 12, color: '#D4A017', letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center' }}>
            {action.action_family}
          </span>
        )}

        {/* Main label */}
        <span style={{ textAlign: 'center', fontWeight: action.primary_recommendation ? 600 : 500 }}>
          {action.label}{done ? ' ✓' : ''}
        </span>

        {/* Transliteration — mantra runner only */}
        {transliteration && !done && (
          <span style={{ fontSize: 13, color: '#8F8378', textAlign: 'center' }}>
            {transliteration}
          </span>
        )}

        {/* helper_line — muted, centered */}
        {action.helper_line && !done && (
          <span
            data-testid={`room-action-helper-${action.action_id}`}
            style={{ fontSize: 13, color: '#9A8C78', textAlign: 'center', fontStyle: 'italic' }}
          >
            {action.helper_line}
          </span>
        )}

        {/* Primary recommendation badge */}
        {action.primary_recommendation && !done && (
          <span style={{ fontSize: 10, color: '#C9A84C', letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center' }}>
            Start here →
          </span>
        )}
      </button>

      {/* Teaching expanded content */}
      {expanded && expandableContent && (
        <div
          style={{
            margin: '4px 0 0',
            padding: '16px 20px',
            borderRadius: 12,
            background: 'rgba(201,168,76,0.04)',
            border: '1px solid rgba(201,168,76,0.15)',
          }}
          data-testid={`room-action-expanded-${action.action_id}`}
        >
          <p style={{ fontSize: 15, color: '#3D3930', lineHeight: 1.7 }}>{expandableContent}</p>
        </div>
      )}

      {/* Step Modal */}
      <StepModal
        visible={stepModalVisible}
        stepPayload={activeStepPayload ?? action.step_payload}
        label={action.label}
        onCancel={() => {
          setStepModalVisible(false);
          setActiveStepPayload(null);
        }}
        onDone={(extra: StepModalResult) => {
          const stepPl = activeStepPayload ?? action.step_payload;
          setStepModalVisible(false);
          setActiveStepPayload(null);
          setDone(true);
          // R2a: fire-and-forget sacred POST for text/grounding steps
          if (extra.text || extra.grounding) {
            postRoomSacred(roomId, {
              writes_event: stepPl?.persistence?.writes_event ?? action.persistence?.writes_event ?? null,
              label: action.label,
              action_id: action.action_id,
              analytics_key: action.analytics_key ?? null,
              captured_at: Date.now(),
              text: extra.text ?? null,
              life_context: screenData.room_life_context ?? null,
              journey_id: screenData.journey_id ?? null,
              day_number: screenData.day_number ?? null,
              source_surface: 'step_pill',
            });
          }
          onAction?.({
            type: 'room_step_completed',
            payload: {
              room_id: roomId,
              action_id: action.action_id,
              analytics_key: action.analytics_key,
              template_id: stepPl?.template_id,
              writes_event: stepPl?.persistence?.writes_event ?? action.persistence?.writes_event,
              ...(extra.text ? { text: extra.text } : {}),
              ...(extra.grounding ? { grounding: extra.grounding } : {}),
            },
          });
        }}
      />

      {/* Inquiry Modal */}
      <InquiryModal
        visible={inquiryModalVisible}
        label={action.label}
        inquiryPayload={action.inquiry_payload}
        onCancel={() => setInquiryModalVisible(false)}
        onOpened={() =>
          onAction?.({
            type: 'room_inquiry_opened',
            payload: { room_id: roomId, action_id: action.action_id, analytics_key: action.analytics_key },
          })
        }
        onCategorySelected={(cat) =>
          onAction?.({
            type: 'room_inquiry_category_selected',
            payload: { room_id: roomId, action_id: action.action_id, category_id: cat.id },
          })
        }
        onLaunchPractice={(_cat, templateId) => {
          // R2b Option A: synthesize step payload from category and open StepModal (matches RN).
          setInquiryModalVisible(false);
          setActiveStepPayload({ template_id: templateId });
          setStepModalVisible(true);
        }}
        onSubmitJournal={(cat, text) => {
          setInquiryModalVisible(false);
          setDone(true);
          // R2b: fire-and-forget sacred POST for inquiry journal submission
          postRoomSacred(roomId, {
            writes_event: 'inquiry_journal',
            label: action.label,
            action_id: action.action_id,
            analytics_key: action.analytics_key ?? null,
            captured_at: Date.now(),
            text,
            life_context: screenData.room_life_context ?? null,
            journey_id: screenData.journey_id ?? null,
            day_number: screenData.day_number ?? null,
            source_surface: 'inquiry_pill',
          });
          onAction?.({
            type: 'room_step_completed',
            payload: {
              room_id: roomId,
              action_id: action.action_id,
              analytics_key: action.analytics_key,
              template_id: 'step_journal_inquiry',
              text,
              category_id: cat.id,
              source: 'inquiry',
            },
          });
        }}
      />

      {/* Carry Capture Modal */}
      {carryNeedsTextInput && (
        <CarryCaptureModal
          visible={carryModalVisible}
          label={action.label}
          roomId={roomId}
          actionId={action.action_id}
          analyticsKey={action.analytics_key}
          writesEvent={writesEvent}
          carryPayload={action.carry_payload}
          lifeContext={screenData.room_life_context ?? null}
          journeyId={screenData.journey_id ?? null}
          dayNumber={screenData.day_number ?? null}
          onSave={(text, sacredWriteOk) => {
            setDone(true);
            onAction?.({
              type: 'room_carry_captured',
              payload: {
                room_id: roomId,
                action_id: action.action_id,
                analytics_key: action.analytics_key,
                label: action.label,
                writes_event: writesEvent,
                carry_text: text,
                sacred_write_ok: sacredWriteOk,
              },
            });
          }}
          onCancel={() => setCarryModalVisible(false)}
          onReturnHome={() => {
            setCarryModalVisible(false);
            onAction?.({ type: 'room_exit', payload: { room_id: roomId } });
          }}
          onAddAnother={() => {
            // CarryCaptureModal manages its own text state; onAddAnother allows re-open
            setCarryModalVisible(false);
          }}
          isJoyCarry={isJoyCarry}
        />
      )}
    </div>
  );
}
