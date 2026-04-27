import React from 'react';

interface Props {
  block: { block_type?: string; type?: string; id?: string; [key: string]: any };
}

export function UnimplementedBlock({ block }: Props) {
  const type = block.block_type || block.type || '?';
  return (
    <div
      style={{
        padding: '6px 10px',
        margin: '3px 0',
        border: '1px dashed #ccc',
        borderRadius: 5,
        fontSize: 11,
        color: '#bbb',
        fontFamily: 'monospace',
      }}
    >
      [{type}]{block.id ? ` #${block.id}` : ''}
    </div>
  );
}
