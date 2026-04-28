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
  icon: string;
  iconBg: string;
  labelColor: string;
}

export function PathEmergesBlock({ screenData }: Props) {
  const sd = screenData || {};

  const items: TriadItem[] = [
    {
      label: sd.mantra_label || 'MANTRA',
      content: sd.mantra_text || sd.companion_mantra_title || '',
      icon: 'ॐ',
      iconBg: '#5E8D55',
      labelColor: '#5E8D55',
    },
    {
      label: sd.sankalp_label || 'SANKALP',
      content: sd.sankalp_text || sd.companion_sankalp_line || '',
      prefix: sd.sankalp_prefix || '',
      icon: '♡',
      iconBg: '#8168AA',
      labelColor: '#8168AA',
    },
    {
      label: sd.practice_label || 'PRACTICE',
      content: sd.practice_title || sd.companion_practice_title || '',
      icon: '🧘',
      iconBg: 'var(--kalpx-gold)',
      labelColor: 'var(--kalpx-gold)',
    },
  ];

  const hasData = items.some((i) => !!i.content);

  if (!hasData) {
    return (
      <div
        style={{
          padding: 20,
          borderRadius: 12,
          border: '1px dashed var(--kalpx-border-gold)',
          textAlign: 'center',
          color: 'var(--kalpx-text-soft)',
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
              border: '1px solid var(--kalpx-chip-bg)',
              background: 'var(--kalpx-bg)',
              marginBottom: 12,
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: item.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                color: '#fff',
                flexShrink: 0,
              }}
            >
              {item.icon}
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  color: item.labelColor,
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                {item.label}
              </p>
              {item.prefix && (
                <p style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', marginBottom: 4 }}>{item.prefix}</p>
              )}
              <p style={{ fontSize: 17, fontWeight: 600, color: 'var(--kalpx-text)', lineHeight: 1.4 }}>
                {item.content}
              </p>
            </div>
          </div>
        ) : null,
      )}

      <div style={{ textAlign: 'center', paddingTop: 8, paddingBottom: 4 }}>
        <div style={{ width: 40, height: 1, background: 'var(--kalpx-border-gold)', margin: '0 auto 12px' }} />
        <p style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', fontStyle: 'italic', lineHeight: 1.6 }}>
          This isn't homework. It's sadhana.
        </p>
      </div>
    </div>
  );
}
