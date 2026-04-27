import React from 'react';
import { RoomActionPill } from './RoomActionPill';

interface Props {
  envelope: { actions: any[]; room_id: string };
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

export function RoomActionList({ envelope, screenData, onAction }: Props) {
  const sorted = [...(envelope.actions || [])].sort((a, b) => {
    const aPri = a.primary_recommendation ? 1 : 0;
    const bPri = b.primary_recommendation ? 1 : 0;
    if (aPri !== bPri) return bPri - aPri;
    if (a.action_type === 'exit' && b.action_type !== 'exit') return 1;
    if (a.action_type !== 'exit' && b.action_type === 'exit') return -1;
    return 0;
  });

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 20px 80px' }}
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
