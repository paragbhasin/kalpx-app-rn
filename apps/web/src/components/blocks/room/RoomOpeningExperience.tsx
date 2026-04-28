import React from 'react';

interface RoomContext {
  room_purpose_line?: string | null;
  sanatan_insight_line?: string | null;
}

interface Props {
  envelope: {
    opening_line?: string;
    second_beat_line?: string | null;
    ready_hint?: string;
    section_prompt?: string;
    memory_echo_line?: string | null;
    room_id?: string;
    room_context?: RoomContext | null;
  };
  roomName?: string;
  lifeContextLabel?: string | null;
}

export function RoomOpeningExperience({ envelope, roomName, lifeContextLabel }: Props) {
  const ctx = envelope.room_context;
  const hasHeader = !!(roomName || ctx?.room_purpose_line || ctx?.sanatan_insight_line);

  return (
    <div style={{ padding: '24px 20px 0', textAlign: 'center' }}>
      {/* Room header section — matches RN RoomRenderer header block */}
      {roomName && (
        <p
          data-testid="room-display-name"
          style={{ fontSize: 18, fontWeight: 600, color: 'var(--kalpx-text)', marginBottom: 6 }}
        >
          {roomName}
          {lifeContextLabel && (
            <span style={{ fontSize: 12, color: 'var(--kalpx-text-muted)', fontWeight: 400, marginLeft: 6 }}>
              · {lifeContextLabel}
            </span>
          )}
        </p>
      )}

      {ctx?.room_purpose_line && (
        <p
          data-testid="room-purpose-line"
          style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', lineHeight: 1.6, marginBottom: 8 }}
        >
          {ctx.room_purpose_line}
        </p>
      )}

      {ctx?.sanatan_insight_line && (
        <div
          data-testid="room-sanatan-insight"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            textAlign: 'left',
            margin: '8px 0',
            padding: '4px 0',
          }}
        >
          <div style={{ width: 3, minHeight: 32, borderRadius: 2, background: 'var(--kalpx-gold)', flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>
            {ctx.sanatan_insight_line}
          </p>
        </div>
      )}

      {/* Lotus divider — shown when header has at least one visible field, before opening_line */}
      {hasHeader && envelope.opening_line && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
          <img src="/new_home_lotus.png" width={20} height={16} alt="" aria-hidden="true" style={{ opacity: 0.5 }} />
        </div>
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
    </div>
  );
}
