import React from 'react';

interface WhyThisItem {
  id: string;
  label: string;
}

interface Props {
  sd: Record<string, any>;
  onOpen: (item?: WhyThisItem) => void;
}

export function WhyThisL1Strip({ sd, onOpen }: Props) {
  const items: WhyThisItem[] = Array.isArray(sd.why_this_l1_items) ? sd.why_this_l1_items : [];
  const whyThis = sd.why_this;

  if (!items.length && !whyThis?.level1) return null;

  // Per-chip horizontal scroll (RN parity: one chip per item, each opens sheet)
  if (items.length > 0) {
    return (
      <div
        data-testid="why-this-strip"
        style={{ marginBottom: 20 }}
      >
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#C9A84C', textTransform: 'uppercase', margin: '0 0 8px' }}>
          WHY THIS
        </p>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 4,
          }}
        >
          {items.map((item) => (
            <button
              key={item.id}
              data-testid={`why-this-chip-${item.id}`}
              onClick={() => onOpen(item)}
              style={{
                flexShrink: 0,
                padding: '8px 14px',
                borderRadius: 20,
                background: 'rgba(201,168,76,0.06)',
                border: '1px solid rgba(201,168,76,0.3)',
                fontSize: 13,
                color: '#6B6356',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Fallback: single why_this.level1 card
  return (
    <div
      data-testid="why-this-strip"
      style={{
        marginBottom: 20,
        padding: '12px 16px',
        borderRadius: 10,
        background: 'rgba(201,168,76,0.06)',
        border: '1px solid rgba(201,168,76,0.3)',
        cursor: 'pointer',
      }}
      onClick={() => onOpen()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#C9A84C', textTransform: 'uppercase', margin: 0 }}>
          WHY THIS
        </p>
        <span style={{ fontSize: 14, color: '#C9A84C' }}>›</span>
      </div>
      {whyThis?.level1 && (
        <p style={{ fontSize: 13, color: '#6B6356', margin: '6px 0 0', lineHeight: 1.5 }}>
          {whyThis.level1}
        </p>
      )}
    </div>
  );
}
