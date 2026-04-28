import React from 'react';

interface Props {
  sd: Record<string, any>;
}

export function SankalpCarryBlock({ sd }: Props) {
  const items: string[] = Array.isArray(sd.sankalp_how_to_live) ? sd.sankalp_how_to_live : [];
  const label: string = sd.sankalp_how_to_live_label || 'How To Live This';

  if (!items.length) return null;

  return (
    <div
      data-testid="sankalp-carry-block"
      style={{
        marginBottom: 20,
        padding: '14px 16px',
        borderRadius: 12,
        background: '#f9f5ff',
        border: '1px solid #e9d5ff',
      }}
    >
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#7c3aed', textTransform: 'uppercase', marginBottom: 8 }}>
        {label}
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {items.map((item, i) => (
          <li key={i} style={{ fontSize: 14, color: 'var(--kalpx-text-soft)', lineHeight: 1.5, paddingLeft: 12, borderLeft: '2px solid #c4b5fd' }}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
