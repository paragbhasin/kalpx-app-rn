import React from 'react';

interface WhyThisItem {
  id: string;
  label: string;
}

interface Props {
  sd: Record<string, any>;
  onOpen: () => void;
}

export function WhyThisL1Strip({ sd, onOpen }: Props) {
  const items: WhyThisItem[] = Array.isArray(sd.why_this_l1_items) ? sd.why_this_l1_items : [];
  const whyThis = sd.why_this;

  if (!items.length && !whyThis?.level1) return null;

  return (
    <div
      data-testid="why-this-strip"
      style={{
        marginBottom: 20,
        padding: '12px 16px',
        borderRadius: 10,
        background: '#fef9ed',
        border: '1px solid #e8d5a0',
        cursor: 'pointer',
      }}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#b08840', textTransform: 'uppercase', margin: 0 }}>
          Why This?
        </p>
        <span style={{ fontSize: 14, color: '#b08840' }}>›</span>
      </div>
      {items.length > 0 && (
        <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.slice(0, 2).map((item) => (
            <p key={item.id} style={{ fontSize: 13, color: '#6b4c1a', margin: 0, lineHeight: 1.5 }}>
              {item.label}
            </p>
          ))}
          {items.length > 2 && (
            <p style={{ fontSize: 12, color: '#aaa', margin: 0 }}>+{items.length - 2} more</p>
          )}
        </div>
      )}
    </div>
  );
}
