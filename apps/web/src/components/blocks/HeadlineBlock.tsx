import React from 'react';

interface Props {
  block: { content?: string; variant?: string; [key: string]: any };
}

export function HeadlineBlock({ block }: Props) {
  return (
    <h2
      style={{
        fontSize: 20,
        fontWeight: 600,
        color: '#1a1a1a',
        margin: '16px 0 8px',
        lineHeight: 1.3,
      }}
    >
      {block.content || ''}
    </h2>
  );
}
