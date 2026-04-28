/**
 * BalancedAckOverlay — Post-regulation acknowledgment.
 * Auto-dismisses after 4s. Explicit CTA to dashboard.
 * REG-015: navigate only, does not touch runner_* fields.
 */
import React, { useEffect, useRef } from 'react';

interface Props {
  block?: { [key: string]: any };
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

const AUTO_DISMISS_MS = 4000;

export function BalancedAckOverlayBlock({ onAction }: Props) {
  const dismissedRef = useRef(false);

  const dismiss = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    onAction?.({ type: 'checkin_complete' });
  };

  useEffect(() => {
    const t = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '40px 24px',
        gap: 24,
        textAlign: 'center',
        animation: 'fadeIn 0.5s ease',
      }}
      data-testid="balanced-ack-overlay"
    >
      <div
        style={{
          maxWidth: 320,
          padding: '28px 24px',
          borderRadius: 16,
          background: 'rgba(201,168,76,0.08)',
          border: '1px solid rgba(201,168,76,0.2)',
        }}
      >
        <p style={{ fontSize: 18, color: 'var(--kalpx-text)', lineHeight: 1.6, fontStyle: 'italic' }}>
          You named it. That's already part of settling.
        </p>
      </div>

      <button
        onClick={dismiss}
        data-testid="checkin-return-btn"
        style={{
          padding: '14px 32px',
          borderRadius: 12,
          border: 'none',
          background: 'var(--kalpx-cta)',
          color: '#fff',
          fontSize: 15,
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Return to Mitra Home
      </button>

      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}
