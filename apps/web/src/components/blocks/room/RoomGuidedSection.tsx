/**
 * RoomGuidedSection — S17-D4A guided room layout.
 * Shows recommended action card + secondary links (why/view all steps) + exit.
 * Replaces flat RoomActionList when entry_context.recommended_first_action_id is set.
 */
import React, { useState } from 'react';
import { ROOM_GUIDED_COPY } from '@kalpx/contracts';
import { postRoomSacred, postRoomTelemetry } from '../../../engine/mitraApi';
import { WEB_ENV } from '../../../lib/env';
import { CarryCaptureModal } from './CarryCaptureModal';
import { InquiryModal } from './InquiryModal';
import type { StepModalResult } from './StepModal';
import { StepModal, classifyStep } from './StepModal';

interface Props {
  envelope: any;
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

export function RoomGuidedSection({ envelope, screenData, onAction }: Props) {
  const ctx = envelope.room_context?.entry_context ?? {};
  const recId: string | null = ctx.recommended_first_action_id ?? null;
  const recTitle: string = ctx.recommended_first_action_title ?? '';
  const recDesc: string = ctx.recommended_first_action_description ?? '';
  const roomId: string = envelope.room_id;
  const renderId: string = envelope.provenance?.render_id ?? '';

  const recAction = recId
    ? (envelope.actions as any[]).find((a: any) => a.action_id === recId) ?? null
    : null;

  const nonExitActions: any[] = (envelope.actions as any[]).filter(
    (a: any) => a.action_type !== 'exit',
  );

  const [whyExpanded, setWhyExpanded] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [stepModalVisible, setStepModalVisible] = useState(false);
  const [inquiryModalVisible, setInquiryModalVisible] = useState(false);
  const [carryModalVisible, setCarryModalVisible] = useState(false);
  const [activeAction, setActiveAction] = useState<any | null>(null);
  const [activeStepPayload, setActiveStepPayload] = useState<any>(null);

  function openAction(action: any) {
    if (!action) return;
    setStepsOpen(false);
    setActiveAction(action);

    if (action.action_type === 'in_room_step') {
      const kind = classifyStep(action.step_payload?.template_id);
      if (kind !== 'unknown') {
        setActiveStepPayload(action.step_payload);
        setStepModalVisible(true);
      } else {
        onAction?.({
          type: 'room_step_completed',
          payload: {
            room_id: roomId,
            action_id: action.action_id,
            analytics_key: action.analytics_key,
            template_id: action.step_payload?.template_id,
            writes_event:
              action.step_payload?.persistence?.writes_event ??
              action.persistence?.writes_event,
          },
        });
      }
      return;
    }

    if (action.action_type === 'inquiry') {
      setInquiryModalVisible(true);
      return;
    }

    if (action.action_type === 'in_room_carry') {
      setCarryModalVisible(true);
      return;
    }

    if (action.action_type.startsWith('runner_')) {
      const rp = action.runner_payload;
      if (!rp) {
        if (WEB_ENV.isDev) console.warn('[RoomGuidedSection] missing runner_payload for', action.action_type);
        return;
      }
      const variant: string =
        rp.runner_kind ||
        (action.action_type.startsWith('runner_')
          ? action.action_type.replace('runner_', '')
          : action.action_type) ||
        'mantra';
      onAction?.({
        type: 'start_runner',
        payload: {
          source: rp.runner_source ?? 'support_room',
          variant,
          item: {
            ...(rp.item || rp.offering || rp),
            item_id: rp.item_id || rp.item?.item_id || rp.offering?.item_id,
            id:
              rp.item_id ||
              rp.item?.id ||
              rp.offering?.id ||
              rp.item?.item_id ||
              rp.offering?.item_id,
            item_type:
              rp.item_type ||
              rp.item?.item_type ||
              rp.offering?.item_type ||
              variant,
            title: rp.title || rp.item?.title || rp.offering?.title || '',
            subtitle:
              rp.subtitle ||
              rp.subtitle_or_line ||
              rp.item?.subtitle ||
              rp.offering?.subtitle ||
              '',
            subtitle_or_line:
              rp.subtitle_or_line ||
              rp.subtitle ||
              rp.item?.subtitle_or_line ||
              rp.offering?.subtitle_or_line ||
              '',
            line:
              rp.line ||
              rp.subtitle_or_line ||
              rp.item?.line ||
              rp.offering?.line ||
              '',
            devanagari:
              rp.devanagari ||
              rp.item?.devanagari ||
              rp.offering?.devanagari ||
              '',
            audio_url:
              rp.audio_url ||
              rp.item?.audio_url ||
              rp.offering?.audio_url ||
              '',
            reps_total:
              rp.reps_default_selection ||
              rp.reps_target ||
              rp.item?.reps_total ||
              rp.offering?.reps_total ||
              null,
            duration_seconds:
              rp.duration_min != null
                ? Math.round(rp.duration_min * 60)
                : rp.item?.duration_seconds || rp.offering?.duration_seconds || null,
            steps: rp.steps || rp.item?.steps || rp.offering?.steps || [],
          },
          action_id: action.action_id,
        },
      });
    }
  }

  function handleBegin() {
    if (WEB_ENV.isDev) console.log('[S17-D4B] handleBegin', {
      recId,
      recAction_found: !!recAction,
      recAction_type: (recAction as any)?.action_type,
      runner_payload_present: !!(recAction as any)?.runner_payload,
      inquiry_payload_present: !!(recAction as any)?.inquiry_payload,
      actions_count: (envelope.actions as any[]).length,
      action_ids: (envelope.actions as any[]).map((a: any) => a.action_id),
      render_id: renderId,
    });
    if (!recAction) return;
    void postRoomTelemetry({
      room_id: roomId,
      event_type: 'recommended_action_started',
      render_id: renderId,
      action_id: recAction.action_id,
    } as any);
    openAction(recAction);
  }

  function handleExit() {
    void postRoomTelemetry({ room_id: roomId, event_type: 'room_exited', phase: 'welcome', render_id: renderId } as any);
    if (onAction) {
      onAction({ type: 'room_exit', payload: { room_id: roomId } });
    }
  }

  return (
    <div style={{ padding: '0 20px 80px' }} data-testid="room-guided-section">
      {/* Recommended action card */}
      <div
        style={{
          background: 'rgba(255, 251, 244, 0.95)',
          border: '1px solid rgba(200, 180, 154, 0.4)',
          borderRadius: 16,
          padding: '20px 20px 16px',
          marginBottom: 12,
          boxShadow: '0 2px 12px rgba(67,33,4,0.06)',
        }}
        data-testid="room-recommended-card"
      >
        <p
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#432104',
            lineHeight: 1.4,
            margin: '0 0 6px',
          }}
        >
          {recTitle || recAction?.label || ''}
        </p>
        {recDesc && (
          <p
            style={{
              fontSize: 13,
              color: '#8A7968',
              fontStyle: 'italic',
              lineHeight: 1.5,
              margin: '0 0 14px',
            }}
          >
            {recDesc}
          </p>
        )}
        <button
          onClick={handleBegin}
          data-testid="room-guided-begin"
          style={{
            width: '100%',
            padding: '13px 0',
            borderRadius: 28,
            border: 'none',
            background: '#432104',
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: 0.3,
          }}
        >
          {ROOM_GUIDED_COPY.begin}
        </button>
      </div>

      {/* Secondary links */}
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginBottom: 10 }}>
        {ctx.why_this_room_line && (
          <button
            onClick={() => {
              void postRoomTelemetry({ room_id: roomId, event_type: 'why_this_viewed', render_id: renderId } as any);
              setWhyExpanded((v) => !v);
            }}
            data-testid="room-guided-why-this"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#8B6914', textDecoration: 'underline' }}
          >
            {ROOM_GUIDED_COPY.whyThisLabel}
          </button>
        )}
        <button
          onClick={() => setStepsOpen(true)}
          data-testid="room-guided-view-all-steps"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#8A7968', textDecoration: 'underline' }}
        >
          {ROOM_GUIDED_COPY.viewAllSteps}
        </button>
      </div>

      {/* Why this accordion */}
      {whyExpanded && ctx.why_this_room_line && (
        <div
          data-testid="room-why-this-expanded"
          style={{
            background: 'rgba(248, 242, 232, 0.8)',
            borderRadius: 10,
            padding: '12px 14px',
            marginBottom: 10,
            fontSize: 13,
            color: '#6B5E4E',
            lineHeight: 1.55,
          }}
        >
          {ctx.why_this_room_line}
        </div>
      )}

      {/* Exit link */}
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <button
          onClick={handleExit}
          data-testid="room-guided-exit"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#b0a090' }}
        >
          {ROOM_GUIDED_COPY.exitLabel}
        </button>
      </div>

      {/* View all steps overlay */}
      {stepsOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(30,20,10,0.45)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
          onClick={() => setStepsOpen(false)}
        >
          <div
            style={{
              background: '#FFF8EF',
              borderRadius: '18px 18px 0 0',
              width: '100%',
              maxWidth: 480,
              padding: '20px 0 40px',
              maxHeight: '70dvh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p style={{ fontSize: 15, fontWeight: 600, color: '#432104', textAlign: 'center', margin: '0 0 16px' }}>
              Steps in this space
            </p>
            {nonExitActions.map((a: any, i: number) => (
              <button
                key={a.action_id}
                data-testid={`room-step-${a.action_id}`}
                onClick={() => openAction(a)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  padding: '12px 20px',
                  borderBottom: '1px solid rgba(200,180,154,0.2)',
                  background: a.action_id === recId ? 'rgba(201,168,76,0.08)' : 'transparent',
                  borderLeft: 'none',
                  borderRight: 'none',
                  borderTop: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 13, color: '#9f9f9f', minWidth: 20, textAlign: 'right' }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: 14, color: '#432104' }}>{a.label}</span>
                {a.action_id === recId && (
                  <span style={{ fontSize: 11, color: '#8B6914', fontStyle: 'italic' }}>suggested</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
      <StepModal
        visible={stepModalVisible}
        stepPayload={activeStepPayload}
        label={activeAction?.label || 'Step'}
        onCancel={() => {
          setStepModalVisible(false);
          setActiveStepPayload(null);
          setActiveAction(null);
        }}
        onDone={(extra: StepModalResult) => {
          const stepPl = activeStepPayload;
          const action = activeAction;
          setStepModalVisible(false);
          setActiveStepPayload(null);
          setActiveAction(null);
          if (!action) return;
          if (extra.text || extra.grounding) {
            postRoomSacred(roomId, {
              writes_event:
                stepPl?.persistence?.writes_event ??
                action.persistence?.writes_event ??
                null,
              label: action.label,
              action_id: action.action_id,
              analytics_key: action.analytics_key ?? null,
              captured_at: Date.now(),
              text: extra.text ?? null,
              life_context: screenData?.room_life_context ?? null,
              journey_id: screenData?.journey_id ?? null,
              day_number: screenData?.day_number ?? null,
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
              writes_event:
                stepPl?.persistence?.writes_event ??
                action.persistence?.writes_event,
              ...(extra.text ? { text: extra.text } : {}),
              ...(extra.grounding ? { grounding: extra.grounding } : {}),
            },
          });
        }}
      />
      <InquiryModal
        visible={inquiryModalVisible}
        label={activeAction?.label || 'Inquiry'}
        inquiryPayload={activeAction?.inquiry_payload}
        onCancel={() => {
          setInquiryModalVisible(false);
          setActiveAction(null);
        }}
        onOpened={() =>
          activeAction &&
          onAction?.({
            type: 'room_inquiry_opened',
            payload: {
              room_id: roomId,
              action_id: activeAction.action_id,
              analytics_key: activeAction.analytics_key,
            },
          })
        }
        onCategorySelected={(cat) =>
          activeAction &&
          onAction?.({
            type: 'room_inquiry_category_selected',
            payload: {
              room_id: roomId,
              action_id: activeAction.action_id,
              category_id: cat.id,
            },
          })
        }
        onLaunchPractice={(_cat, templateId) => {
          setInquiryModalVisible(false);
          setActiveStepPayload({ template_id: templateId });
          setStepModalVisible(true);
        }}
        onSubmitJournal={(cat, text) => {
          const action = activeAction;
          setInquiryModalVisible(false);
          setActiveAction(null);
          if (!action) return;
          postRoomSacred(roomId, {
            writes_event: 'inquiry_journal',
            label: action.label,
            action_id: action.action_id,
            analytics_key: action.analytics_key ?? null,
            captured_at: Date.now(),
            text,
            life_context: screenData?.room_life_context ?? null,
            journey_id: screenData?.journey_id ?? null,
            day_number: screenData?.day_number ?? null,
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
      <CarryCaptureModal
        visible={carryModalVisible}
        label={activeAction?.label || 'Carry'}
        roomId={roomId}
        actionId={activeAction?.action_id || ''}
        analyticsKey={activeAction?.analytics_key ?? null}
        writesEvent={
          activeAction?.carry_payload?.writes_event ??
          activeAction?.carry_payload?.persistence?.writes_event ??
          activeAction?.persistence?.writes_event ??
          null
        }
        carryPayload={activeAction?.carry_payload}
        lifeContext={screenData?.room_life_context ?? null}
        journeyId={screenData?.journey_id ?? null}
        dayNumber={screenData?.day_number ?? null}
        onCancel={() => {
          setCarryModalVisible(false);
          setActiveAction(null);
        }}
        onSave={(_text, _sacredWriteOk) => {
          const action = activeAction;
          setCarryModalVisible(false);
          setActiveAction(null);
          if (!action) return;
          onAction?.({
            type: 'room_carry_captured',
            payload: {
              room_id: roomId,
              action_id: action.action_id,
              analytics_key: action.analytics_key,
              label: action.label,
              writes_event:
                action.carry_payload?.writes_event ??
                action.carry_payload?.persistence?.writes_event ??
                action.persistence?.writes_event ??
                null,
            },
          });
        }}
      />
    </div>
  );
}
