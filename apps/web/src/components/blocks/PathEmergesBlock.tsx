/**
 * PathEmergesBlock — Phase 6.
 * turn_8: displays the generated mantra / sankalp / practice triad.
 * Reads from screenData: mantra_text, sankalp_text, practice_title,
 * mantra_label, sankalp_label, practice_label, sankalp_prefix.
 */

import React from 'react';

interface Props {
  block?: Record<string, any>;
  screenData?: Record<string, any>;
}

interface TriadItem {
  label: string;
  content: string;
  prefix?: string;
}

export function PathEmergesBlock({ screenData }: Props) {
  const sd = screenData || {};

  const items: TriadItem[] = [
    {
      label: sd.mantra_label || 'MANTRA',
      content: sd.mantra_text || sd.companion_mantra_title || '',
    },
    {
      label: sd.sankalp_label || 'SANKALP',
      content: sd.sankalp_text || sd.companion_sankalp_line || '',
      prefix: sd.sankalp_prefix || '',
    },
    {
      label: sd.practice_label || 'PRACTICE',
      content: sd.practice_title || sd.companion_practice_title || '',
    },
  ];

  const hasData = items.some((i) => !!i.content);

  if (!hasData) {
    return (
      <div
        style={{
          padding: 20,
          borderRadius: 12,
          border: '1px dashed #d4b16a',
          textAlign: 'center',
          color: '#6b4c1a',
          fontSize: 14,
          marginBottom: 20,
        }}
      >
        Preparing your path…
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 24 }}>
      {items.map((item) =>
        item.content ? (
          <div
            key={item.label}
            data-testid={`triad-${item.label.toLowerCase()}`}
            style={{
              padding: '16px 20px',
              borderRadius: 12,
              border: '1px solid #e8d5a0',
              background: '#fdf8ef',
              marginBottom: 12,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2,
                color: '#d4b16a',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              {item.label}
            </p>
            {item.prefix && (
              <p style={{ fontSize: 13, color: '#8a6030', marginBottom: 4 }}>{item.prefix}</p>
            )}
            <p style={{ fontSize: 17, fontWeight: 600, color: '#2a1a0a', lineHeight: 1.4 }}>
              {item.content}
            </p>
          </div>
        ) : null,
      )}
    </div>
  );
}
