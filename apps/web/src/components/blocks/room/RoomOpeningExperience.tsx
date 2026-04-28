import React from 'react';

interface Props {
  envelope: {
    opening_line?: string;
    second_beat_line?: string | null;
    ready_hint?: string;
    section_prompt?: string;
    memory_echo_line?: string | null;
    room_id?: string;
  };
  roomName?: string;
  lifeContextLabel?: string | null;
}

export function RoomOpeningExperience({ envelope, roomName, lifeContextLabel }: Props) {
  return (
    <div style={{ padding: '24px 20px 0', textAlign: 'center' }}>
      {roomName && (
        <p style={{ fontSize: 11, color: 'var(--kalpx-text-muted)', letterSpacing: 2, marginBottom: 12, textTransform: 'uppercase' }}>
          {roomName}
          {lifeContextLabel ? ` · ${lifeContextLabel}` : ''}
        </p>
      )}
      {/* RN: opening_line is bold 20px, serif, NOT italic */}
      {envelope.opening_line && (
        <p
          style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--kalpx-font-serif)', color: 'var(--kalpx-text)', lineHeight: 1.5, marginBottom: 10 }}
          data-testid="room-opening-line"
        >
          {envelope.opening_line}
        </p>
      )}
      {/* memory_echo_line: present in RN, was missing on web */}
      {envelope.memory_echo_line && (
        <p
          style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 10 }}
          data-testid="room-memory-echo-line"
        >
          {envelope.memory_echo_line}
        </p>
      )}
      {envelope.second_beat_line && (
        <p style={{ fontSize: 15, color: 'var(--kalpx-text-soft)', lineHeight: 1.6, marginBottom: 10 }}>
          {envelope.second_beat_line}
        </p>
      )}
      {/* RN explicitly does NOT render ready_hint (comment in RN source: "// don't render ready_hint") */}
      {/* RN does NOT render section_prompt */}
      {/* RN does NOT have a divider line */}
    </div>
  );
}
