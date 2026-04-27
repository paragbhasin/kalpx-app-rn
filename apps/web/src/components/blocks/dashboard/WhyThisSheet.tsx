import React from 'react';

interface WhyThis {
  level1?: string;
  level2?: string;
  level3?: string;
}

interface WhyThisItem {
  id: string;
  label: string;
}

interface Props {
  sd: Record<string, any>;
  onClose: () => void;
}

export function WhyThisSheet({ sd, onClose }: Props) {
  const whyThis: WhyThis = sd.why_this || {};
  const items: WhyThisItem[] = Array.isArray(sd.why_this_l1_items) ? sd.why_this_l1_items : [];
  const hasContent = whyThis.level1 || whyThis.level2 || items.length > 0;

  return (
    <div
      data-testid="why-this-sheet"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#fdf8ef',
          borderRadius: '16px 16px 0 0',
          padding: '24px 20px 40px',
          maxHeight: '80dvh',
          overflowY: 'auto',
        }}
      >
        {/* Handle + close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#b08840', textTransform: 'uppercase', margin: 0 }}>
            Why This?
          </p>
          <button
            data-testid="why-this-close"
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer', padding: '0 4px' }}
          >
            ×
          </button>
        </div>

        {!hasContent && (
          <p style={{ color: '#aaa', fontSize: 14, textAlign: 'center' }}>No explanation available yet.</p>
        )}

        {/* THE PRINCIPLE section */}
        {(whyThis.level1 || whyThis.level2) && (
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#888', textTransform: 'uppercase', marginBottom: 8 }}>
              The Principle
            </p>
            {whyThis.level1 && (
              <p style={{ fontSize: 18, fontWeight: 700, color: '#1a1a0a', marginBottom: 8 }}>
                {whyThis.level1}
              </p>
            )}
            {whyThis.level2 && (
              <p style={{ fontSize: 15, color: '#4a3318', lineHeight: 1.6 }}>
                {whyThis.level2}
              </p>
            )}
          </div>
        )}

        {/* Source quote */}
        {whyThis.level3 && (
          <div
            style={{
              padding: '12px 16px',
              borderLeft: '3px solid #d4b16a',
              background: '#fffbf0',
              borderRadius: '0 8px 8px 0',
              marginBottom: 20,
            }}
          >
            <p style={{ fontSize: 14, fontStyle: 'italic', color: '#6b4c1a', lineHeight: 1.6, margin: 0 }}>
              {whyThis.level3}
            </p>
          </div>
        )}

        {/* YOUR PATH ITEMS section */}
        {items.length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#888', textTransform: 'uppercase', marginBottom: 10 }}>
              Your Path Items
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: '#fff',
                    border: '1px solid #e8d5a0',
                  }}
                >
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#b08840', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>
                    {item.id}
                  </p>
                  <p style={{ fontSize: 14, color: '#2a1a0a' }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
