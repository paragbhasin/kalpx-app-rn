import React from 'react';

interface Props {
  block: {
    label?: string;
    emphasized_line?: string;
    [key: string]: any;
  };
  screenData?: Record<string, any>;
}

export function FirstRecognitionBlock({ block, screenData }: Props) {
  const emphasizedLine: string = block.emphasized_line || screenData?.recognition_line || '';
  const bodyLines: string[] = Array.isArray(screenData?.recognition_body_lines)
    ? screenData.recognition_body_lines
    : [];

  if (!emphasizedLine && !bodyLines.length) return null;

  return (
    <div
      style={{
        background: '#fffdf9',
        border: '1px solid rgba(199,154,43,0.35)',
        borderRadius: 20,
        padding: '24px 20px',
        marginBottom: 24,
        boxShadow: '0 2px 8px rgba(67,33,4,0.07)',
        textAlign: 'center',
      }}
    >
      {block.label && (
        <>
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '2.5px',
              color: 'var(--kalpx-gold)',
              textTransform: 'uppercase',
              margin: '0 0 12px',
            }}
          >
            {block.label}
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 18,
            }}
          >
            <div style={{ width: 44, height: 1, background: 'rgba(199,154,43,0.4)' }} />
            <span style={{ fontSize: 10, color: 'var(--kalpx-gold)' }}>◆</span>
            <div style={{ width: 44, height: 1, background: 'rgba(199,154,43,0.4)' }} />
          </div>
        </>
      )}
      {emphasizedLine && (
        <p
          style={{
            fontFamily: 'var(--kalpx-font-serif)',
            fontWeight: 700,
            fontSize: 22,
            lineHeight: 1.4,
            color: 'var(--kalpx-text)',
            margin: '0 0 20px',
          }}
        >
          {emphasizedLine}
        </p>
      )}
      {bodyLines.map((line, i) => (
        <p
          key={i}
          style={{
            fontFamily: 'var(--kalpx-font-serif)',
            fontSize: 17,
            lineHeight: 1.65,
            color: 'var(--kalpx-text-soft)',
            margin: i === bodyLines.length - 1 ? 0 : '0 0 10px',
          }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}
