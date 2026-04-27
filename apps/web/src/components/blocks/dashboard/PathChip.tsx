import React from 'react';

interface Props {
  sd: Record<string, any>;
}

export function PathChip({ sd }: Props) {
  const arc = sd.arc_state || {};
  const path: string = arc.journey_path || sd.journey_path || '';
  const label: string = arc.journey_path_label || sd.journey_path_label || '';

  if (!path && !label) return null;

  return (
    <div
      data-testid="path-chip"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 20,
        padding: '5px 12px',
        borderRadius: 20,
        background: 'rgba(201,168,76,0.06)',
        border: '1px solid rgba(201,168,76,0.3)',
      }}
    >
      <span style={{ fontSize: 13, color: '#C9A84C' }}>✦</span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 500,
          color: '#9A8C78',
          // No uppercase, no colored tint
        }}
      >
        {label || path}
      </span>
    </div>
  );
}
