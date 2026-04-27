import React from 'react';

interface CommunityErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function CommunityErrorState({
  message = 'Could not load content. Please try again.',
  onRetry,
}: CommunityErrorStateProps) {
  return (
    <div
      style={{
        padding: '16px 20px', borderRadius: 12,
        background: '#fff1f0', border: '1px solid #fca5a5',
        marginBottom: 12,
      }}
    >
      <p style={{ color: '#b91c1c', fontSize: 14, marginBottom: onRetry ? 8 : 0 }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: '7px 18px', borderRadius: 8,
            background: '#b91c1c', color: '#fff',
            border: 'none', fontSize: 13, cursor: 'pointer',
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
