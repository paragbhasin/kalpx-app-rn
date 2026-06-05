/**
 * RoomReflectionSheet — S17-D4A post-recommended-action reflection.
 * Shows "What shifted a little?" options, then inline next-step view.
 * Triggered by RoomPage when show_room_reflection=true in screenData.
 */
import React, { useState } from 'react';
import { useTranslation } from '../../../lib/i18n';
import { ROOM_REFLECTION_OPTIONS, ROOM_GUIDED_COPY, ROOM_COMPLETION_HEADER, ROOM_NEXT_STEP_LINE } from '@kalpx/contracts';
import type { VerifiedRoomId } from '@kalpx/types';
import { postRoomReflection, postRoomTelemetry } from '../../../engine/mitraApi';

interface Props {
  roomId: string;
  renderId?: string | null;
  tellMitraEventId?: string | number | null;
  onClose: () => void;
  onNavigateTellMitra: () => void;
  onViewAllSteps: () => void;
  onReturnHome: () => void;
}

type Phase = 'reflection' | 'next_step';

export function RoomReflectionSheet({
  roomId,
  renderId,
  tellMitraEventId,
  onClose,
  onNavigateTellMitra,
  onViewAllSteps,
  onReturnHome,
}: Props) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('reflection');

  const options = ROOM_REFLECTION_OPTIONS[roomId as VerifiedRoomId] ?? [];

  async function handleOption(code: string, isBridge: boolean) {
    void postRoomReflection(roomId, {
      response_code: code,
      render_id: renderId ?? null,
      tell_mitra_event_id: tellMitraEventId ?? null,
    });
    void postRoomTelemetry({ room_id: roomId, event_type: 'reflection_submitted', response_code: code } as any);
    if (isBridge) {
      onNavigateTellMitra();
      return;
    }
    setPhase('next_step');
  }

  function handleNextStep(choice: string) {
    void postRoomTelemetry({ room_id: roomId, event_type: 'next_step_selected', choice } as any);
    switch (choice) {
      case 'finish_here':   onClose(); break;
      case 'tell_mitra':    onNavigateTellMitra(); break;
      case 'continue':      onViewAllSteps(); break;
      case 'return_home':   onReturnHome(); break;
      default:              onClose();
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(30,20,10,0.5)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      data-testid="room-reflection-sheet"
    >
      <div
        style={{
          background: '#FFF8EF',
          borderRadius: '18px 18px 0 0',
          width: '100%',
          maxWidth: 480,
          padding: '24px 20px 48px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {phase === 'reflection' ? (
          <>
            {ROOM_COMPLETION_HEADER[roomId as VerifiedRoomId] && (
              <p
                style={{
                  fontSize: 14,
                  color: '#8A7968',
                  textAlign: 'center',
                  lineHeight: 1.5,
                  margin: '0 0 10px',
                  fontStyle: 'italic',
                }}
              >
                {ROOM_COMPLETION_HEADER[roomId as VerifiedRoomId]}
              </p>
            )}
            <p
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#432104',
                textAlign: 'center',
                margin: '0 0 20px',
              }}
            >
              {ROOM_GUIDED_COPY.reflectionPrompt}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {options.map((opt) => (
                <button
                  key={opt.code}
                  data-testid={`reflection-option-${opt.code}`}
                  onClick={() => handleOption(opt.code, !!opt.is_tell_mitra_bridge)}
                  style={{
                    padding: '13px 16px',
                    borderRadius: 28,
                    border: '1.5px solid rgba(200,180,154,0.5)',
                    background: opt.is_tell_mitra_bridge ? 'transparent' : 'rgba(255,251,244,0.8)',
                    color: opt.is_tell_mitra_bridge ? '#8B6914' : '#432104',
                    fontSize: 14,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontStyle: opt.is_tell_mitra_bridge ? 'italic' : 'normal',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p
              style={{
                fontSize: 14,
                color: '#8A7968',
                textAlign: 'center',
                lineHeight: 1.5,
                margin: '0 0 20px',
              }}
            >
              {t('mitra.room.youCanStay')}
            </p>
            {ROOM_NEXT_STEP_LINE[roomId as VerifiedRoomId] && (
              <p
                style={{
                  fontSize: 14,
                  color: '#432104',
                  textAlign: 'center',
                  fontStyle: 'italic',
                  margin: '0 0 16px',
                  lineHeight: 1.5,
                }}
              >
                {ROOM_NEXT_STEP_LINE[roomId as VerifiedRoomId]}
              </p>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { key: 'finish_here',  label: ROOM_GUIDED_COPY.nextStep.finishHere },
                { key: 'tell_mitra',   label: ROOM_GUIDED_COPY.nextStep.tellMitraMore },
                { key: 'continue',     label: ROOM_GUIDED_COPY.nextStep.continueStep },
                { key: 'return_home',  label: ROOM_GUIDED_COPY.nextStep.returnHome },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  data-testid={`next-step-${key}`}
                  onClick={() => handleNextStep(key)}
                  style={{
                    padding: '13px 16px',
                    borderRadius: 28,
                    border: '1.5px solid rgba(200,180,154,0.5)',
                    background: 'transparent',
                    color: '#432104',
                    fontSize: 14,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
