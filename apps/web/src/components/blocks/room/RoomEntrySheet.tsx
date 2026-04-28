/**
 * RoomEntrySheet — 6-room list sheet launched from QuickSupportBlock "More ways" footer.
 * Room order is locked per RN ROOM_ROWS order.
 */
import React, { useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

interface RoomRow {
  room_id: string;
  name: string;
  label: string;
  accent: string;
  backing: string;
}

// Order-locked per RN spec (§14.3). Colors match RN ROOM_ROWS exactly.
const ROOM_ROWS: RoomRow[] = [
  { room_id: 'room_stillness',  name: 'Find Calm',           label: "I'm overwhelmed",            accent: '#B9A98D', backing: '#F6F2EA' },
  { room_id: 'room_connection', name: 'Feel Connected',       label: "I feel alone",               accent: '#C8A698', backing: '#F7EFEB' },
  { room_id: 'room_release',    name: 'Set It Down',          label: "Something is heavy",         accent: '#9A9A9A', backing: '#F1F0EE' },
  { room_id: 'room_clarity',    name: 'Find Clarity',         label: "I'm not sure / I want clarity", accent: '#A9B2B6', backing: '#F0F2F3' },
  { room_id: 'room_growth',     name: 'Take the Next Step',   label: "I want to grow as a person", accent: '#9C7F5A', backing: '#F4EDE2' },
  { room_id: 'room_joy',        name: "Notice What's Good",   label: "I'm in a good place",        accent: '#C9A84C', backing: '#FBF4DC' },
];

interface Props {
  onEnterRoom: (roomId: string) => void;
  onClose: () => void;
}

export function RoomEntrySheet({ onEnterRoom, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      data-testid="room-entry-sheet-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        data-testid="room-entry-sheet"
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'var(--kalpx-card-bg)',
          borderRadius: '22px 22px 0 0',
          padding: '12px 18px 28px',
          maxHeight: '80dvh',
          overflowY: 'auto',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--kalpx-chip-bg)' }} />
        </div>

        <p style={{
          fontFamily: 'var(--kalpx-font-serif)',
          fontWeight: 700,
          fontSize: 18,
          color: 'var(--kalpx-text)',
          letterSpacing: 0.2,
          marginBottom: 14,
        }}>
          More ways to be supported
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ROOM_ROWS.map((room) => (
            <button
              key={room.room_id}
              data-testid={`room-entry-${room.room_id}`}
              onClick={() => onEnterRoom(room.room_id)}
              style={{
                width: '100%',
                minHeight: 72,
                padding: '0 16px',
                borderRadius: 14,
                border: 'none',
                background: room.backing,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <div style={{ width: 4, height: 36, borderRadius: 2, marginRight: 14, background: room.accent, flexShrink: 0 }} />
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={{ fontFamily: 'var(--kalpx-font-serif)', fontWeight: 700, fontSize: 16, color: 'var(--kalpx-text)', letterSpacing: 0.15, margin: '0 0 2px' }}>
                  {room.name}
                </p>
                <p style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', margin: 0 }}>
                  {room.label}
                </p>
              </div>
              <ChevronRight size={18} strokeWidth={1.6} color="var(--kalpx-text-muted)" style={{ flexShrink: 0 }} />
            </button>
          ))}
        </div>

        <button
          data-testid="room-entry-sheet-close"
          onClick={onClose}
          style={{
            display: 'block',
            width: '100%',
            marginTop: 16,
            background: 'none',
            border: 'none',
            fontSize: 13,
            color: 'var(--kalpx-text-muted)',
            cursor: 'pointer',
            textAlign: 'center',
            padding: '8px 0',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
