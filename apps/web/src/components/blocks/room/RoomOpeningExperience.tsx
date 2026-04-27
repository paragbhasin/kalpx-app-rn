import React from 'react';

interface Props {
  envelope: {
    opening_line?: string;
    second_beat_line?: string | null;
    ready_hint?: string;
    section_prompt?: string;
    room_id?: string;
  };
  roomName?: string;
  lifeContextLabel?: string | null;
}

export function RoomOpeningExperience({ envelope, roomName, lifeContextLabel }: Props) {
  return (
    <div style={{ padding: '24px 20px 0', textAlign: 'center' }}>
      {roomName && (
        <p style={{ fontSize: 11, color: '#9A8C78', letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' }}>
          {roomName}
          {lifeContextLabel ? ` · ${lifeContextLabel}` : ''}
        </p>
      )}
      {envelope.opening_line && (
        <p
          style={{ fontSize: 18, color: '#2C2A26', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 10 }}
          data-testid="room-opening-line"
        >
          {envelope.opening_line}
        </p>
      )}
      {envelope.second_beat_line && (
        <p style={{ fontSize: 15, color: '#6B6356', lineHeight: 1.6, marginBottom: 10 }}>
          {envelope.second_beat_line}
        </p>
      )}
      {envelope.ready_hint && (
        <p style={{ fontSize: 13, color: '#9A8C78', lineHeight: 1.5, marginBottom: 16 }}>
          {envelope.ready_hint}
        </p>
      )}
      {envelope.section_prompt && (
        <p style={{ fontSize: 12, color: '#C9A84C', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 20 }}>
          {envelope.section_prompt}
        </p>
      )}
      <div style={{ width: 40, height: 1, background: '#E8DCC8', margin: '0 auto 20px' }} />
    </div>
  );
}
