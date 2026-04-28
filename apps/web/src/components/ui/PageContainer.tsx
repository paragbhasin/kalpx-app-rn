import React from 'react';

interface PageContainerProps {
  mode?: 'mitra' | 'wide';
  pt?: number;
  pb?: number;
  px?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function PageContainer({
  mode = 'mitra',
  pt = 28,
  pb = 60,
  px = 16,
  children,
  style,
}: PageContainerProps) {
  const maxWidth = mode === 'mitra' ? 480 : undefined;

  return (
    <div
      style={{
        width: '100%',
        margin: '0 auto',
        maxWidth: mode === 'mitra' ? maxWidth : undefined,
        paddingTop: pt,
        paddingBottom: pb,
        paddingLeft: px,
        paddingRight: px,
        boxSizing: 'border-box',
        ...style,
      }}
      className={mode === 'wide' ? 'kalpx-wide-container' : ''}
    >
      {/* Inject responsive max-width for wide mode via a style tag trick */}
      {mode === 'wide' && (
        <style>{`
          .kalpx-wide-container {
            max-width: 480px;
          }
          @media (min-width: 640px) {
            .kalpx-wide-container {
              max-width: 672px;
            }
          }
          @media (min-width: 1024px) {
            .kalpx-wide-container {
              max-width: 896px;
            }
          }
        `}</style>
      )}
      {children}
    </div>
  );
}
