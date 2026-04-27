import React from 'react';

interface ClassEmptyStateProps {
  message?: string;
}

export function ClassEmptyState({ message = 'No classes available right now.' }: ClassEmptyStateProps) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
      <p style={{ fontSize: 32, marginBottom: 12 }}>🪔</p>
      <p style={{ fontSize: 15, color: '#7a5c3a', lineHeight: 1.5 }}>{message}</p>
    </div>
  );
}
