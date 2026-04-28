import React from 'react';

interface Props {
  sd: Record<string, any>;
  onClose: () => void;
  onAction?: (action: any) => void;
}

export function WhyThisSheet({ sd, onClose, onAction }: Props) {
  const whyThis = sd.why_this || {};
  const items: { id: string; label: string }[] = Array.isArray(sd.why_this_l1_items) ? sd.why_this_l1_items : [];
  const overlayLevel: string | null = sd.why_this_overlay_level || null;
  const principle = sd.why_this_principle || null;
  const source = sd.why_this_source || null;
  const principleId = whyThis.principle_id ?? null;
  const isSubmitting = !!sd._isSubmitting;

  const hasContent = whyThis.level1 || whyThis.level2 || items.length > 0;

  function handleClose() {
    if (onAction && overlayLevel) {
      onAction({ type: 'dismiss_why_this' });
    }
    onClose();
  }

  function handleBackToL1() {
    if (onAction) onAction({ type: 'dismiss_why_this' });
  }

  function handleGoL2() {
    if (onAction && principleId) {
      onAction({ type: 'open_why_this_l2', principle_id: principleId });
    }
  }

  function handleGoL3() {
    if (onAction && principleId) {
      onAction({ type: 'open_why_this_l3', principle_id: principleId });
    }
  }

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
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          background: 'var(--kalpx-bg)',
          borderRadius: '16px 16px 0 0',
          padding: '24px 20px 40px',
          maxHeight: '80dvh',
          overflowY: 'auto',
        }}
      >
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--kalpx-chip-bg)' }} />
        </div>

        {/* Eyebrow + close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          {overlayLevel && overlayLevel !== 'l1' ? (
            <button
              data-testid="why-this-back"
              onClick={handleBackToL1}
              style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--kalpx-gold)', cursor: 'pointer', padding: '0 4px', fontWeight: 600 }}
            >
              ← Back
            </button>
          ) : (
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--kalpx-gold)', textTransform: 'uppercase', margin: 0 }}>
              WHY THIS
            </p>
          )}
          <button
            data-testid="why-this-close"
            onClick={handleClose}
            style={{ background: 'none', border: 'none', fontSize: 22, color: 'var(--kalpx-text-muted)', cursor: 'pointer', padding: '0 4px' }}
          >
            ×
          </button>
        </div>

        {/* L3 — Source attribution */}
        {overlayLevel === 'l3' && source && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--kalpx-text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
              The Source
            </p>
            {source.text && (
              <div
                style={{
                  padding: '12px 16px',
                  borderLeft: `3px solid var(--kalpx-border-gold)`,
                  background: 'var(--kalpx-bg)',
                  borderRadius: '0 8px 8px 0',
                  marginBottom: 16,
                }}
              >
                <p style={{ fontSize: 15, fontStyle: 'italic', color: 'var(--kalpx-text-soft)', lineHeight: 1.6, margin: 0 }}>
                  {source.text}
                </p>
              </div>
            )}
            {source.attribution && (
              <p style={{ fontSize: 12, color: 'var(--kalpx-text-muted)', marginBottom: 8 }}>
                — {source.attribution}
              </p>
            )}
            {source.tradition && (
              <p style={{ fontSize: 12, color: 'var(--kalpx-gold)', fontWeight: 600 }}>
                {source.tradition}
              </p>
            )}
          </div>
        )}

        {/* L2 — Principle detail */}
        {overlayLevel === 'l2' && principle && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--kalpx-text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
              The Principle
            </p>
            {principle.title && (
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--kalpx-text)', marginBottom: 10 }}>
                {principle.title}
              </p>
            )}
            {principle.description && (
              <p style={{ fontSize: 15, color: 'var(--kalpx-text-soft)', lineHeight: 1.7, marginBottom: 16 }}>
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
                  color: 'var(--kalpx-gold)',
                  background: 'none',
                  border: `1px solid var(--kalpx-chip-bg)`,
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
        )}

        {/* L1 — Default view */}
        {(!overlayLevel || overlayLevel === 'l1') && (
          <>
            {!hasContent && (
              <p style={{ color: '#aaa', fontSize: 14, textAlign: 'center' }}>No explanation available yet.</p>
            )}

            {(whyThis.level1 || whyThis.level2) && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--kalpx-text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                  The Principle
                </p>
                {whyThis.level1 && (
                  <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--kalpx-text)', marginBottom: 8 }}>
                    {whyThis.level1}
                  </p>
                )}
                {whyThis.level2 && (
                  <p style={{ fontSize: 15, color: 'var(--kalpx-text-soft)', lineHeight: 1.6, marginBottom: 12 }}>
                    {whyThis.level2}
                  </p>
                )}
                {principleId && onAction && (
                  <button
                    data-testid="why-this-go-deeper"
                    onClick={handleGoL2}
                    disabled={isSubmitting}
                    style={{
                      fontSize: 13,
                      color: 'var(--kalpx-gold)',
                      background: 'none',
                      border: `1px solid var(--kalpx-chip-bg)`,
                      borderRadius: 8,
                      padding: '8px 16px',
                      cursor: isSubmitting ? 'default' : 'pointer',
                      opacity: isSubmitting ? 0.5 : 1,
                    }}
                  >
                    Go deeper →
                  </button>
                )}
              </div>
            )}

            {whyThis.level3 && (
              <div
                style={{
                  padding: '12px 16px',
                  borderLeft: `3px solid var(--kalpx-border-gold)`,
                  background: 'var(--kalpx-bg)',
                  borderRadius: '0 8px 8px 0',
                  marginBottom: 20,
                }}
              >
                <p style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--kalpx-text-soft)', lineHeight: 1.6, margin: 0 }}>
                  {whyThis.level3}
                </p>
              </div>
            )}

            {items.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--kalpx-text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
                  Your Path Items
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 8,
                        background: 'var(--kalpx-card-bg)',
                        border: `1px solid var(--kalpx-chip-bg)`,
                      }}
                    >
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--kalpx-gold)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>
                        {item.id}
                      </p>
                      <p style={{ fontSize: 14, color: 'var(--kalpx-text)' }}>{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
