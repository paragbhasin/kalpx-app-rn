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
          background: '#fdf8ef',
          borderRadius: '16px 16px 0 0',
          padding: '24px 20px 40px',
          maxHeight: '80dvh',
          overflowY: 'auto',
        }}
      >
        {/* Handle + close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          {overlayLevel && overlayLevel !== 'l1' ? (
            <button
              data-testid="why-this-back"
              onClick={handleBackToL1}
              style={{ background: 'none', border: 'none', fontSize: 13, color: '#b08840', cursor: 'pointer', padding: '0 4px', fontWeight: 600 }}
            >
              ← Back
            </button>
          ) : (
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#b08840', textTransform: 'uppercase', margin: 0 }}>
              Why This?
            </p>
          )}
          <button
            data-testid="why-this-close"
            onClick={handleClose}
            style={{ background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer', padding: '0 4px' }}
          >
            ×
          </button>
        </div>

        {/* L3 — Source attribution */}
        {overlayLevel === 'l3' && source && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#888', textTransform: 'uppercase', marginBottom: 12 }}>
              The Source
            </p>
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
              <p style={{ fontSize: 12, color: '#9A8C78', marginBottom: 8 }}>
                — {source.attribution}
              </p>
            )}
            {source.tradition && (
              <p style={{ fontSize: 12, color: '#b08840', fontWeight: 600 }}>
                {source.tradition}
              </p>
            )}
          </div>
        )}

        {/* L2 — Principle detail */}
        {overlayLevel === 'l2' && principle && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#888', textTransform: 'uppercase', marginBottom: 12 }}>
              The Principle
            </p>
            {principle.title && (
              <p style={{ fontSize: 20, fontWeight: 700, color: '#1a1a0a', marginBottom: 10 }}>
                {principle.title}
              </p>
            )}
            {principle.description && (
              <p style={{ fontSize: 15, color: '#4a3318', lineHeight: 1.7, marginBottom: 16 }}>
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
        )}

        {/* L1 — Default view */}
        {(!overlayLevel || overlayLevel === 'l1') && (
          <>
            {!hasContent && (
              <p style={{ color: '#aaa', fontSize: 14, textAlign: 'center' }}>No explanation available yet.</p>
            )}

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
                  <p style={{ fontSize: 15, color: '#4a3318', lineHeight: 1.6, marginBottom: 12 }}>
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
                      color: '#b08840',
                      background: 'none',
                      border: '1px solid #e8d5a0',
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
          </>
        )}
      </div>
    </div>
  );
}
