/**
 * RoomRenderer — top-level room render from RoomRenderV1 envelope.
 * Render order: RoomOpeningExperience → RoomPrincipleBanner (optional) → RoomActionList.
 */
import React from 'react';
import { RoomOpeningExperience } from './RoomOpeningExperience';
import { RoomPrincipleBanner } from './RoomPrincipleBanner';
import { RoomActionList } from './RoomActionList';
import { ROOM_DISPLAY_NAMES, LIFE_CONTEXT_LABELS } from './roomConstants';

interface Props {
  envelope: any;
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

export function RoomRenderer({ envelope, screenData, onAction }: Props) {
  const roomName = ROOM_DISPLAY_NAMES[envelope.room_id] || envelope.room_id;
  const lifeContextLabel = envelope.life_context
    ? LIFE_CONTEXT_LABELS[envelope.life_context] || envelope.life_context
    : null;

  return (
    <div style={{ paddingBottom: 40 }} data-testid={`room-renderer-${envelope.room_id}`}>
      <RoomOpeningExperience
        envelope={envelope}
        roomName={roomName}
        lifeContextLabel={lifeContextLabel}
      />
      {envelope.principle_banner && (
        <RoomPrincipleBanner banner={envelope.principle_banner} onAction={onAction} />
      )}
      <RoomActionList
        envelope={envelope}
        screenData={screenData}
        onAction={onAction}
      />
    </div>
  );
}
