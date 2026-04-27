import React from 'react';

const QUICK_CHIPS = [
  { id: 'triggered', label: 'I Feel Triggered', action: { type: 'initiate_trigger' } },
  { id: 'checkin', label: 'Quick Check-in', action: { type: 'start_checkin' } },
  { id: 'good_place', label: "I'm in a good place", action: { type: 'enter_room', payload: { room_id: 'room_joy', source: 'quick_support_good_place' } } },
];

interface Props {
  onAction?: (action: any) => void;
}

export function QuickSupportBlock({ onAction }: Props) {
  return (
    <div data-testid="quick-support-block" style={{ marginBottom: 24 }}>
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#b08840', textTransform: 'uppercase', marginBottom: 10 }}>
        Quick Support
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip.id}
            data-testid={`support-chip-${chip.id}`}
            onClick={() => onAction && void onAction(chip.action)}
            style={{
              padding: '11px 16px',
              borderRadius: 10,
              border: '1px solid #e0d4b8',
              background: '#fdf8ef',
              color: '#4a3318',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
