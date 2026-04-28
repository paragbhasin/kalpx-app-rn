import React, { useEffect } from 'react';

interface ModalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: 'auto' | 'half' | 'full';
}

export function ModalSheet({ isOpen, onClose, title, children, height = 'auto' }: ModalSheetProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const heightValue = height === 'full' ? '92dvh' : height === 'half' ? '50dvh' : 'auto';
  const maxHeight = height === 'auto' ? '90dvh' : undefined;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 100,
          animation: 'none',
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 101,
          background: 'var(--kalpx-card-bg)',
          borderRadius: '20px 20px 0 0',
          boxShadow: 'var(--kalpx-shadow-sheet)',
          height: heightValue,
          maxHeight,
          overflowY: 'auto',
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
          animation: 'kalpx-sheet-up 200ms ease-out',
        }}
      >
        <style>{`
          @keyframes kalpx-sheet-up {
            from { transform: translateY(100%); }
            to   { transform: translateY(0); }
          }
        `}</style>

        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
          <div
            style={{
              width: 32,
              height: 4,
              borderRadius: 2,
              background: 'var(--kalpx-border-gold)',
            }}
          />
        </div>

        {/* Title */}
        {title && (
          <div style={{ padding: '4px 20px 12px', borderBottom: '1px solid var(--kalpx-border)' }}>
            <h3
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 700,
                color: 'var(--kalpx-text)',
                fontFamily: 'var(--kalpx-font-sans)',
              }}
            >
              {title}
            </h3>
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '16px 20px' }}>
          {children}
        </div>
      </div>
    </>
  );
}
