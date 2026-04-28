import React from 'react';

interface AdditionalItem {
  item_id?: string;
  title?: string;
  subtitle?: string;
  item_type?: string;
  slot?: string;
  [key: string]: any;
}

interface Props {
  sd: Record<string, any>;
  onAction?: (action: any) => void;
}

export function AdditionalItemsSectionBlock({ sd, onAction }: Props) {
  const items: AdditionalItem[] = Array.isArray(sd.additional_items) ? sd.additional_items : [];
  if (!items.length) return null;

  return (
    <div
      data-testid="additional-items-section"
      style={{ marginBottom: 24 }}
    >
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 2,
          color: 'var(--kalpx-cta)',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        Additional Practice
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item, i) => (
          <button
            key={item.item_id ?? i}
            data-testid={`additional-item-${item.item_id ?? i}`}
            onClick={() =>
              onAction &&
              void onAction({
                type: 'start_runner',
                payload: {
                  source: `additional_${item.item_type || 'recommended'}`,
                  variant: item.item_type || 'mantra',
                  item,
                },
              })
            }
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '12px 14px',
              borderRadius: 10,
              border: '1px solid var(--kalpx-border-gold)',
              background: 'var(--kalpx-card-bg)',
              boxShadow: 'var(--kalpx-shadow-card)',
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            {item.item_type && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  color: 'var(--kalpx-cta)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: 3,
                }}
              >
                {item.item_type}
              </span>
            )}
            <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--kalpx-text)' }}>
              {item.title || item.item_id || 'Practice item'}
            </span>
            {item.subtitle && (
              <span style={{ display: 'block', fontSize: 12, color: 'var(--kalpx-text-soft)', marginTop: 2 }}>
                {item.subtitle}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
