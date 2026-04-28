/**
 * RoomPage — canonical room container host.
 * Reads roomId from URL params, dispatches enter_room if needed,
 * handles context_picker state → RoomRenderer with live RoomRenderV1 envelope.
 */
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useScreenState, updateScreenData } from '../../store/screenSlice';
import { getRoomRender } from '../../engine/mitraApi';
import { executeAction } from '../../engine/actionExecutor';
import { LifeContextPickerSheet } from '../../components/blocks/room/LifeContextPickerSheet';
import { RoomRenderer } from '../../components/blocks/room/RoomRenderer';
import { ROOM_DISPLAY_NAMES } from '../../components/blocks/room/roomConstants';
import { webNavigate } from '../../lib/webRouter';
import type { AppDispatch } from '../../store';

const ROOMS_WITH_CONTEXT_PICKER = ['room_clarity', 'room_growth'];

function buildExitOnlyFallback(roomId: string) {
  return {
    schema_version: 'room.render.v1',
    room_id: roomId,
    opening_line: '',
    second_beat_line: null,
    ready_hint: '',
    section_prompt: '',
    dashboard_chip_label: null,
    principle_banner: null,
    opening_experience: {} as any,
    actions: [{
      action_id: `${roomId}_exit_fallback`,
      label: 'Return to Mitra Home',
      action_type: 'exit',
      action_family: 'exit',
      exit_payload: { returns_to: 'dashboard' },
    }],
  };
}

export function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const screenState = useScreenState();
  const sd = screenState.screenData;

  const fullRoomId = roomId?.startsWith('room_') ? roomId : `room_${roomId || ''}`;

  const [phase, setPhase] = useState<'picker' | 'loading' | 'render' | 'error'>(
    ROOMS_WITH_CONTEXT_PICKER.includes(fullRoomId) ? 'picker' : 'loading',
  );
  const [envelope, setEnvelope] = useState<any>(null);
  const [lifeContext, setLifeContext] = useState<string | null>(
    (sd?.room_life_context as string | null) || null,
  );

  const actionContext = {
    dispatch,
    screenData: screenState.screenData,
  };

  const fetchRender = async (ctx: string | null) => {
    setPhase('loading');
    try {
      const data = await getRoomRender(fullRoomId, ctx ? { life_context: ctx } : undefined);
      if (!data) throw new Error('no_data');
      setEnvelope(data);
      dispatch(updateScreenData({ room_id: fullRoomId, room_render_payload: data }));
      setPhase('render');
    } catch {
      setEnvelope(buildExitOnlyFallback(fullRoomId));
      setPhase('render');
    }
  };

  useEffect(() => {
    // If room has no picker, fetch immediately
    if (!ROOMS_WITH_CONTEXT_PICKER.includes(fullRoomId)) {
      void fetchRender(lifeContext);
    }
    // Stamp room_id into store
    dispatch(updateScreenData({ room_id: fullRoomId }));
  }, [fullRoomId]);

  const roomName = ROOM_DISPLAY_NAMES[fullRoomId] || fullRoomId;

  // Guard browser back: intercept popstate and navigate to dashboard instead
  const handleActionRef = useRef<(action: any) => void>(() => {});

  const handleAction = (action: any) => {
    void executeAction(action, actionContext);
  };

  handleActionRef.current = handleAction;

  useEffect(() => {
    if (phase !== 'render') return;
    const handler = () => {
      handleActionRef.current({ type: 'room_exit', payload: { room_id: fullRoomId } });
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, [phase, fullRoomId]);

  if (phase === 'picker') {
    return (
      <LifeContextPickerSheet
        roomId={fullRoomId}
        allowedContexts={(sd?.life_context_allowed as string[] | null) || null}
        onPick={(ctx) => {
          setLifeContext(ctx);
          dispatch(updateScreenData({ room_life_context: ctx }));
          void executeAction(
            { type: 'room_telemetry', payload: { event_type: 'context_picked', room_id: fullRoomId, life_context: ctx } },
            actionContext,
          );
          void fetchRender(ctx);
        }}
        onSkip={() => {
          setLifeContext(null);
          void executeAction(
            { type: 'room_telemetry', payload: { event_type: 'context_skipped', room_id: fullRoomId, life_context: null } },
            actionContext,
          );
          void fetchRender(null);
        }}
        onBack={() => webNavigate('/en/mitra/dashboard')}
      />
    );
  }

  const roomBgStyle: React.CSSProperties = {
    minHeight: '100dvh',
    background: '#FFF8EF',
    backgroundImage: 'url(/rooms_bg.jpg)',
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
  };

  if (phase === 'loading') {
    return (
      <div style={{ ...roomBgStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--kalpx-text-muted)' }}>
          <div style={{ width: 32, height: 32, border: '2px solid var(--kalpx-cta)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 13 }}>Entering {roomName}…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...roomBgStyle, maxWidth: 480, margin: '0 auto' }}>
      {/* Frosted exit pill — top-right, immersive */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px 0' }} data-testid="room-exit-strip">
        <button
          onClick={() => handleAction({ type: 'room_exit', payload: { room_id: fullRoomId } })}
          data-testid="room-exit-btn"
          style={{
            background: 'rgba(250,247,242,0.85)',
            border: '1px solid var(--kalpx-border-gold)',
            borderRadius: 20,
            padding: '5px 14px',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            fontSize: 13,
            color: 'var(--kalpx-text-muted)',
            cursor: 'pointer',
          }}
        >
          ✕ Leave room
        </button>
      </div>

      {envelope ? (
        <RoomRenderer
          envelope={envelope}
          screenData={screenState.screenData}
          onAction={handleAction}
        />
      ) : (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <p style={{ color: 'var(--kalpx-text-muted)' }}>This space is not available right now.</p>
          <button
            onClick={() => handleAction({ type: 'room_exit', payload: { room_id: fullRoomId } })}
            style={{ marginTop: 16, padding: '10px 24px', borderRadius: 8, background: 'var(--kalpx-cta)', color: '#fff', border: 'none', cursor: 'pointer' }}
            data-testid="room-unavailable-return"
          >
            Return to dashboard
          </button>
        </div>
      )}
    </div>
  );
}
