import React from 'react';

interface Props {
  block: { content?: string; variant?: string; style?: any; action?: any; [key: string]: any };
  onAction?: (action: any) => void;
}

export function SubtextBlock({ block, onAction }: Props) {
  const inlineStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#555',
    margin: '4px 0 8px',
    lineHeight: 1.5,
    ...(block.variant === 'italic' || block.variant === 'italic_multiline' ? { fontStyle: 'italic' } : {}),
    ...(block.variant === 'small' ? { fontSize: 12 } : {}),
    ...(block.style?.color ? { color: block.style.color } : {}),
    ...(block.style?.textAlign ? { textAlign: block.style.textAlign } : {}),
  };

  if (block.action && onAction) {
    return (
      <button
        onClick={() => onAction(block.action)}
        style={{ ...inlineStyle, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
      >
        {block.content || ''}
      </button>
    );
  }

  return <p style={inlineStyle}>{block.content || ''}</p>;
}
