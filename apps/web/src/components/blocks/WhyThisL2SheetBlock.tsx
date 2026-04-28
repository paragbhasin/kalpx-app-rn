import React from 'react';

interface Props {
  block?: Record<string, any>;
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

const GO_DEEPER_TYPES = ['mantra', 'sankalp', 'practice'];

export function WhyThisL2SheetBlock({ screenData, onAction }: Props) {
  const sd = screenData || {};
  const principle = sd.why_this_principle || null;
  const principleId = sd.why_this?.principle_id ?? null;
  const linkedType: string | null = sd.why_this?.linked_item_type ?? null;
  const isSubmitting = !!sd._isSubmitting;

  function handleDismiss() {
    onAction?.({ type: 'dismiss_why_this' });
  }

  function handleGoDeeper() {
    if (onAction && principleId && linkedType) {
      onAction({ type: 'view_info', payload: { type: linkedType, manualData: sd[`master_${linkedType}`] } });
    }
  }

  const showGoDeeper = !!(linkedType && GO_DEEPER_TYPES.includes(linkedType) && sd[`master_${linkedType}`]);

  const backdrop = (
    <div
      data-testid="why-this-l2-sheet"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 110, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={(e) => e.target === e.currentTarget && handleDismiss()}
    />
  );

  if (!principle) {
    return (
      <>
        {backdrop}
        <div
          data-testid="why-this-l2-sheet"
          style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 111, display: 'flex', justifyContent: 'center' }}
        >
          <div style={{ width: '100%', maxWidth: 480, background: 'var(--kalpx-card-bg)', borderRadius: '16px 16px 0 0', padding: '12px 20px 40px' }}>
            {/* Handle bar */}
            <div style={{ width: 44, height: 4, borderRadius: 2, background: '#d9cfb8', margin: '0 auto 20px' }} />
            <p style={{ color: 'var(--kalpx-text-muted)', fontSize: 14, textAlign: 'center', marginTop: 16 }}>Principle not available.</p>
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button onClick={handleDismiss} style={gotItStyle}>Got it</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 110 }}
        onClick={handleDismiss}
      />
      <div
        data-testid="why-this-l2-sheet"
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 111, display: 'flex', justifyContent: 'center' }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 480,
            background: 'var(--kalpx-card-bg)',
            borderRadius: '16px 16px 0 0',
            padding: '12px 20px calc(32px + env(safe-area-inset-bottom))',
            maxHeight: '82dvh',
            overflowY: 'auto',
          }}
        >
          {/* Handle bar — matches RN 44x4 #d9cfb8 */}
          <div style={{ width: 44, height: 4, borderRadius: 2, background: '#d9cfb8', margin: '0 auto 20px' }} />

          {/* "WHY THIS" micro label */}
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.6, color: '#8b7a55', textTransform: 'uppercase', textAlign: 'center', marginBottom: 10 }}>
            Why This
          </p>

          {/* Principle title — 26px serif */}
          {principle.title && (
            <p style={{ fontSize: 26, fontWeight: 700, color: 'var(--kalpx-text)', lineHeight: 1.3, textAlign: 'center', marginBottom: 10, fontFamily: 'var(--kalpx-font-serif)' }}>
              {principle.title}
            </p>
          )}

          {/* Essence */}
          {principle.description && (
            <p style={{ fontSize: 15, color: 'var(--kalpx-text-soft)', lineHeight: 1.6, textAlign: 'center', marginBottom: 14 }}>
              {principle.description}
            </p>
          )}

          {/* Tradition */}
          {principle.tradition && (
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.4, color: '#8b7a55', textAlign: 'center', opacity: 0.7, marginBottom: 14, textTransform: 'uppercase' }}>
              {principle.tradition}
            </p>
          )}

          {/* Context scroll area */}
          {principle.context && (
            <div style={{ maxHeight: 180, overflowY: 'auto', marginBottom: 18 }}>
              <p style={{ fontSize: 14, color: 'var(--kalpx-text-soft)', lineHeight: 1.6, textAlign: 'center' }}>
                {principle.context}
              </p>
            </div>
          )}

          {/* "Go Deeper" — only when linked_item_type has matching master */}
          {showGoDeeper && (
            <button
              data-testid="why-this-go-l3"
              onClick={handleGoDeeper}
              disabled={isSubmitting}
              style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: '#8b6914',
                background: 'none',
                border: 'none',
                cursor: isSubmitting ? 'default' : 'pointer',
                opacity: isSubmitting ? 0.5 : 1,
                padding: '6px 0',
                marginBottom: 20,
              }}
            >
              Go Deeper →
            </button>
          )}

          {/* "Got it" pill dismiss */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              data-testid="why-this-l2-close"
              onClick={handleDismiss}
              style={gotItStyle}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const gotItStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: 'var(--kalpx-text-soft)',
  background: 'none',
  border: '1px solid #d9cfb8',
  borderRadius: 22,
  padding: '10px 28px',
  minWidth: 120,
  minHeight: 44,
  cursor: 'pointer',
  touchAction: 'manipulation',
};
