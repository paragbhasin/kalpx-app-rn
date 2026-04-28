import React from 'react';

interface Props {
  block?: Record<string, any>;
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

export function WhyThisL3SheetBlock({ screenData, onAction }: Props) {
  const sd = screenData || {};
  const source = sd.why_this_source || null;

  function handleDismiss() {
    if (onAction) onAction({ type: 'dismiss_why_this' });
  }

  return (
    <div
      data-testid="why-this-l3-sheet"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 120,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={(e) => e.target === e.currentTarget && handleDismiss()}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#b08840', textTransform: 'uppercase', margin: 0 }}>
            The Source
          </p>
          <button
            data-testid="why-this-l3-close"
            onClick={handleDismiss}
            style={{ background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer', padding: '0 4px' }}
          >
            ×
          </button>
        </div>

        {!source && (
          <p style={{ color: '#aaa', fontSize: 14, textAlign: 'center' }}>Source not available.</p>
        )}

        {source && (
          <>
            {source.sanskrit && (
              <p style={{ fontFamily: '"Noto Sans Devanagari", sans-serif', fontSize: 22, color: '#432104', lineHeight: 1.5, textAlign: 'center', marginBottom: 10 }}>
                {source.sanskrit}
              </p>
            )}
            {source.transliteration && (
              <p style={{ fontSize: 15, fontStyle: 'italic', color: '#6a5830', lineHeight: 1.6, textAlign: 'center', marginBottom: 14 }}>
                {source.transliteration}
              </p>
            )}
            {source.text && (
              <div
                style={{
                  padding: '12px 16px',
                  borderLeft: '3px solid #d4b16a',
                  background: '#fffbf0',
                  borderRadius: '0 8px 8px 0',
                  marginBottom: 16,
                }}
              >
                <p style={{ fontSize: 15, fontStyle: 'italic', color: '#6b4c1a', lineHeight: 1.6, margin: 0 }}>
                  {source.text}
                </p>
              </div>
            )}
            {source.attribution && (
              <p style={{ fontSize: 12, color: '#9A8C78', marginBottom: 6 }}>
                — {source.attribution}
              </p>
            )}
            {source.tradition && (
              <p style={{ fontSize: 12, color: '#b08840', fontWeight: 600 }}>
                {source.tradition}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
