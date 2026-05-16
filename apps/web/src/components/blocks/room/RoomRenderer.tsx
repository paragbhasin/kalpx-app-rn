/**
 * RoomRenderer — top-level room render from RoomRenderV1 envelope.
 * S17-D4A: when guided mode is on (entry_context.recommended_first_action_id present),
 * renders RoomGuidedSection instead of RoomActionList. Flag off → existing flat list.
 */
import React from 'react';
import { RoomOpeningExperience } from './RoomOpeningExperience';
import { RoomPrincipleBanner } from './RoomPrincipleBanner';
import { RoomActionList } from './RoomActionList';
import { RoomGuidedSection } from './RoomGuidedSection';
import { ROOM_LABELS } from '@kalpx/contracts';
import { ROOM_DISPLAY_NAMES, LIFE_CONTEXT_LABELS } from './roomConstants';

interface Props {
  envelope: any;
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

export function RoomRenderer({ envelope, screenData, onAction }: Props) {
  const roomName = ROOM_LABELS[envelope.room_id as keyof typeof ROOM_LABELS] ?? ROOM_DISPLAY_NAMES[envelope.room_id] ?? envelope.room_id;
  const lifeContextLabel = envelope.life_context
    ? LIFE_CONTEXT_LABELS[envelope.life_context] || envelope.life_context
    : null;

  const isGuided = !!(envelope.room_context?.entry_context?.recommended_first_action_id);

  return (
    <div style={{ paddingBottom: 40 }} data-testid={`room-renderer-${envelope.room_id}`}>
      {isGuided ? (
        <RoomGuidedSection
          envelope={envelope}
          roomName={roomName}
          lifeContextLabel={lifeContextLabel}
          screenData={screenData}
          onAction={onAction}
        />
      ) : (
        <>
          <RoomOpeningExperience
            envelope={envelope}
            roomName={roomName}
            lifeContextLabel={lifeContextLabel}
          />
          {envelope.principle_banner && (
            <RoomPrincipleBanner banner={envelope.principle_banner} screenData={screenData} onAction={onAction} />
          )}
          <RoomActionList
            envelope={envelope}
            screenData={screenData}
            onAction={onAction}
          />
        </>
      )}
    </div>
  );
}
