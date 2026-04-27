import React from 'react';
import { RoomActionPill } from './RoomActionPill';

interface Props {
  envelope: { actions: any[]; room_id: string };
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

export function RoomActionList({ envelope, screenData, onAction }: Props) {
  const actions: any[] = Array.isArray(envelope.actions) ? envelope.actions : [];

  // B8: Empty actions fallback
  if (actions.length === 0) {
    return (
      <div style={{ padding: '32px 20px', textAlign: 'center' }} data-testid="room-action-list-empty">
        <p style={{ color: '#9A8C78', fontSize: 14, marginBottom: 20 }}>
          This space is resting — check back shortly.
        </p>
        <button
          data-testid="room-empty-return"
          onClick={() => onAction?.({ type: 'room_exit', payload: { room_id: envelope.room_id } })}
          style={{
            padding: '12px 24px',
            borderRadius: 28,
            border: 'none',
            background: 'rgba(201,168,76,0.12)',
            fontSize: 14,
            color: '#2C2A26',
            cursor: 'pointer',
          }}
        >
          Return to home
        </button>
      </div>
    );
  }

  const sorted = [...actions].sort((a, b) => {
    const aPri = a.primary_recommendation ? 1 : 0;
    const bPri = b.primary_recommendation ? 1 : 0;
    if (aPri !== bPri) return bPri - aPri;
    if (a.action_type === 'exit' && b.action_type !== 'exit') return 1;
    if (a.action_type !== 'exit' && b.action_type === 'exit') return -1;
    return 0;
  });

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '20px 20px 80px' }}
      data-testid="room-action-list"
    >
      {sorted.map((action) => (
        <RoomActionPill
          key={action.action_id}
          action={action}
          roomId={envelope.room_id}
          screenData={screenData}
          onAction={onAction}
        />
      ))}
    </div>
  );
}
