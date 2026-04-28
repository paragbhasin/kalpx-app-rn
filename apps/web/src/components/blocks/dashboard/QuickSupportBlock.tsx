import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Sun } from 'lucide-react';
// Icon mapping (matches RN Ionicons):
//   alert-circle-outline → AlertCircle
//   checkmark-circle-outline → CheckCircle2
//   sunny-outline → Sun
import { RoomEntrySheet } from '../room/RoomEntrySheet';

interface Props {
  onAction?: (action: any) => void;
}

export function QuickSupportBlock({ onAction }: Props) {
  const [roomSheetOpen, setRoomSheetOpen] = useState(false);

  return (
    <div data-testid="quick-support-block" style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#C9A84C', textTransform: 'uppercase', marginBottom: 10 }}>
        Quick Support
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Chip 1 — primary (filled lotusPeach) — alert-circle-outline → AlertCircle */}
        <button
          data-testid="support-chip-triggered"
          onClick={() => onAction && void onAction({ type: 'initiate_trigger' })}
          style={{
            padding: '14px 16px',
            borderRadius: 28,
            border: 'none',
            background: '#F5EDEA',
            color: 'var(--kalpx-text)',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            minHeight: 48,
            touchAction: 'manipulation',
          }}
        >
          <AlertCircle size={18} strokeWidth={1.6} />
          I Feel Triggered
        </button>

        {/* Chip 2 — checkmark-circle-outline → CheckCircle2 */}
        <button
          data-testid="support-chip-checkin"
          onClick={() => onAction && void onAction({ type: 'start_checkin' })}
          style={{
            padding: '14px 16px',
            borderRadius: 28,
            border: '1px solid rgba(201,168,76,0.4)',
            background: 'transparent',
            color: 'var(--kalpx-text)',
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            minHeight: 48,
            touchAction: 'manipulation',
          }}
        >
          <CheckCircle2 size={18} strokeWidth={1.6} />
          Quick Check-in
        </button>

        {/* Chip 3 — sunny-outline → Sun */}
        <button
          data-testid="support-chip-good_place"
          onClick={() => onAction && void onAction({ type: 'enter_room', payload: { room_id: 'room_joy', source: 'quick_support_good_place' } })}
          style={{
            padding: '14px 16px',
            borderRadius: 28,
            border: '1px solid rgba(201,168,76,0.4)',
            background: 'transparent',
            color: 'var(--kalpx-text)',
            fontSize: 15,
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            minHeight: 48,
            touchAction: 'manipulation',
          }}
        >
          <Sun size={18} strokeWidth={1.6} />
          I'm in a good place
        </button>
      </div>

      {/* Footer link — opens RoomEntrySheet */}
      <button
        data-testid="support-more-ways"
        onClick={() => setRoomSheetOpen(true)}
        style={{
          display: 'block',
          width: '100%',
          marginTop: 12,
          background: 'none',
          border: 'none',
          fontSize: 13,
          color: '#9A8C78',
          cursor: 'pointer',
          textAlign: 'center',
          padding: '4px 0',
        }}
      >
        More ways to be supported →
      </button>

      {roomSheetOpen && (
        <RoomEntrySheet
          onEnterRoom={(roomId) => {
            setRoomSheetOpen(false);
            onAction?.({ type: 'enter_room', payload: { room_id: roomId, source: 'room_entry_sheet' } });
          }}
          onClose={() => setRoomSheetOpen(false)}
        />
      )}
    </div>
  );
}
