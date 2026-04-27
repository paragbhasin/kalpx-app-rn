import React from 'react';

interface Props {
  block?: Record<string, any>;
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

export function WhyThisL2SheetBlock({ screenData, onAction }: Props) {
  const sd = screenData || {};
  const principle = sd.why_this_principle || null;
  const principleId = sd.why_this?.principle_id ?? null;
  const isSubmitting = !!sd._isSubmitting;

  function handleDismiss() {
    if (onAction) onAction({ type: 'dismiss_why_this' });
  }

  function handleGoL3() {
    if (onAction && principleId) {
      onAction({ type: 'open_why_this_l3', principle_id: principleId });
    }
  }

  if (!principle) {
    return (
      <div
        data-testid="why-this-l2-sheet"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 110,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
        onClick={(e) => e.target === e.currentTarget && handleDismiss()}
      >
        <div style={{ width: '100%', maxWidth: 480, background: '#fdf8ef', borderRadius: '16px 16px 0 0', padding: '24px 20px 40px' }}>
          <button onClick={handleDismiss} style={{ background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>×</button>
          <p style={{ color: '#aaa', fontSize: 14, textAlign: 'center', marginTop: 16 }}>Principle not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="why-this-l2-sheet"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 110,
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
            The Principle
          </p>
          <button
            data-testid="why-this-l2-close"
            onClick={handleDismiss}
            style={{ background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer', padding: '0 4px' }}
          >
            ×
          </button>
        </div>

        {principle.title && (
          <p style={{ fontSize: 20, fontWeight: 700, color: '#1a1a0a', marginBottom: 10 }}>
            {principle.title}
          </p>
        )}
        {principle.description && (
          <p style={{ fontSize: 15, color: '#4a3318', lineHeight: 1.7, marginBottom: 20 }}>
            {principle.description}
          </p>
        )}
        {principleId && (
          <button
            data-testid="why-this-go-l3"
            onClick={handleGoL3}
            disabled={isSubmitting}
            style={{
              fontSize: 13,
              color: '#b08840',
              background: 'none',
              border: '1px solid #e8d5a0',
              borderRadius: 8,
              padding: '8px 16px',
              cursor: isSubmitting ? 'default' : 'pointer',
              opacity: isSubmitting ? 0.5 : 1,
            }}
          >
            See the source →
          </button>
        )}
      </div>
    </div>
  );
}
