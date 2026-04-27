import React from 'react';

const PATH_COLORS: Record<string, string> = {
  support: '#d97706',
  growth: '#059669',
  return: '#7c3aed',
};

interface Props {
  sd: Record<string, any>;
}

export function PathChip({ sd }: Props) {
  const arc = sd.arc_state || {};
  const path: string = arc.journey_path || sd.journey_path || '';
  const label: string = arc.journey_path_label || sd.journey_path_label || '';
  const dayNumber: number = sd.identity?.day_number ?? sd.day_number ?? 0;

  if (!path && !label) return null;

  const color = PATH_COLORS[path] || '#b08840';

  return (
    <div
      data-testid="path-chip"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
        padding: '5px 12px',
        borderRadius: 20,
        background: `${color}18`,
        border: `1px solid ${color}40`,
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 1 }}>
        {label || path}
      </span>
      {dayNumber > 0 && (
        <span style={{ fontSize: 12, color: '#888' }}>Day {dayNumber}</span>
      )}
    </div>
  );
}
