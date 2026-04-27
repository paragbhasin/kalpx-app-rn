/**
 * RoomEntrySheet — 6-room list sheet launched from QuickSupportBlock "More ways" footer.
 * Room order is locked per RN ROOM_ROWS order.
 */
import React, { useEffect } from 'react';

interface RoomRow {
  room_id: string;
  name: string;
  label: string;
}

// Order-locked per RN spec
const ROOM_ROWS: RoomRow[] = [
  { room_id: 'room_stillness',  name: 'Find Calm',           label: "I'm overwhelmed" },
  { room_id: 'room_connection', name: 'Feel Connected',       label: "I feel alone" },
  { room_id: 'room_release',    name: 'Set It Down',          label: "Something is heavy" },
  { room_id: 'room_clarity',    name: 'Find Clarity',         label: "I'm not sure / I want clarity" },
  { room_id: 'room_growth',     name: 'Take the Next Step',   label: "I want to grow as a person" },
  { room_id: 'room_joy',        name: "Notice What's Good",   label: "I'm in a good place" },
];

interface Props {
  onEnterRoom: (roomId: string) => void;
  onClose: () => void;
}

export function RoomEntrySheet({ onEnterRoom, onClose }: Props) {
  // Close on Escape
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
        background: 'rgba(0,0,0,0.45)',
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
          background: '#fdf8ef',
          borderRadius: '16px 16px 0 0',
          padding: '20px 20px 40px',
          maxHeight: '80dvh',
          overflowY: 'auto',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#e8d5b0' }} />
        </div>

        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#C9A84C', textTransform: 'uppercase', marginBottom: 16, textAlign: 'center' }}>
          Choose a Space
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ROOM_ROWS.map((room) => (
            <button
              key={room.room_id}
              data-testid={`room-entry-${room.room_id}`}
              onClick={() => onEnterRoom(room.room_id)}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 12,
                border: '1px solid rgba(201,168,76,0.25)',
                background: '#fff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <p style={{ fontSize: 15, fontWeight: 600, color: '#2C2A26', margin: '0 0 2px' }}>
                {room.name}
              </p>
              <p style={{ fontSize: 13, color: '#9A8C78', margin: 0 }}>
                {room.label}
              </p>
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
            color: '#9A8C78',
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
