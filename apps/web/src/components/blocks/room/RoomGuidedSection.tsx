/**
 * RoomGuidedSection — S17-D4A guided room layout.
 * Shows recommended action card + secondary links (why/view all steps) + exit.
 * Replaces flat RoomActionList when entry_context.recommended_first_action_id is set.
 */
import React, { useState } from 'react';
import { ROOM_GUIDED_COPY } from '@kalpx/contracts';
import { postRoomTelemetry } from '../../../engine/mitraApi';
import { WEB_ENV } from '../../../lib/env';

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
    if (!onAction) return;
    const actionId: string = recAction.action_id;
    const actionType: string = recAction.action_type ?? '';
    if (actionType === 'inquiry') {
      const ip = (recAction as any).inquiry_payload;
      if (!ip) return;
      onAction({
        type: 'room_inquiry_opened',
        payload: { inquiry_payload: ip, action_id: actionId, room_id: roomId, render_id: renderId },
      });
    } else {
      const rp = recAction.runner_payload;
      if (!rp) {
        if (WEB_ENV.isDev) console.warn('[S17-D4B] handleBegin: runner_payload missing for', actionType);
        return;
      }
      const variant: string =
        rp.runner_kind ||
        (actionType.startsWith('runner_') ? actionType.replace('runner_', '') : actionType) ||
        'mantra';
      onAction({
        type: 'start_runner',
        payload: {
          source: rp.runner_source ?? 'support_room',
          variant,
          item: rp,
          action_id: actionId,
        },
      });
    }
  }

  function handleExit() {
    void postRoomTelemetry({ room_id: roomId, event_type: 'room_exited', phase: 'welcome', render_id: renderId } as any);
    if (onAction) {
      onAction({ type: 'exit_tapped', payload: { room_id: roomId } });
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
              <div
                key={a.action_id}
                data-testid={`room-step-${a.action_id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 20px',
                  borderBottom: '1px solid rgba(200,180,154,0.2)',
                  background: a.action_id === recId ? 'rgba(201,168,76,0.08)' : 'transparent',
                }}
              >
                <span style={{ fontSize: 13, color: '#9f9f9f', minWidth: 20, textAlign: 'right' }}>{i + 1}</span>
                <span style={{ flex: 1, fontSize: 14, color: '#432104' }}>{a.label}</span>
                {a.action_id === recId && (
                  <span style={{ fontSize: 11, color: '#8B6914', fontStyle: 'italic' }}>suggested</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
