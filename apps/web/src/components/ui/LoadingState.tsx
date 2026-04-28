import React from 'react';

interface LoadingStateProps {
  rows?: number;
  type?: 'card' | 'text' | 'row';
  height?: number;
}

function ShimmerRow({ height }: { height: number }) {
  return (
    <div
      style={{
        height,
        borderRadius: 'var(--kalpx-r-lg)',
        marginBottom: 12,
        background: 'linear-gradient(90deg, #f0e8d8 25%, #e8dcc8 50%, #f0e8d8 75%)',
        backgroundSize: '200% 100%',
        animation: 'kalpx-shimmer 1.5s linear infinite',
      }}
    />
  );
}

export function LoadingState({ rows = 3, type = 'row', height = 60 }: LoadingStateProps) {
  const rowHeight = type === 'card' ? 160 : type === 'text' ? 20 : height;
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <ShimmerRow key={i} height={rowHeight} />
      ))}
    </>
  );
}
