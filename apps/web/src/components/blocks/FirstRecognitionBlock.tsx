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
        background: 'rgba(255, 252, 246, 0.86)',
        border: '1px solid rgba(226, 196, 126, 0.72)',
        borderRadius: 34,
        padding: '38px 28px 34px',
        marginBottom: 28,
        boxShadow: '0 18px 38px rgba(179, 140, 54, 0.12)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
        textAlign: 'center',
        maxWidth: 560,
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      {block.label && (
        <>
          <p
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '4px',
              color: 'var(--kalpx-gold)',
              textTransform: 'uppercase',
              margin: '0 0 18px',
            }}
          >
            {block.label}
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              marginBottom: 34,
            }}
          >
            <div style={{ width: 66, height: 1, background: 'rgba(226, 196, 126, 0.9)' }} />
            <span style={{ fontSize: 10, color: 'var(--kalpx-gold)' }}>◆</span>
            <div style={{ width: 66, height: 1, background: 'rgba(226, 196, 126, 0.9)' }} />
          </div>
        </>
      )}
      {emphasizedLine && (
        <p
          style={{
            fontFamily: 'var(--kalpx-font-serif)',
            fontWeight: 700,
            fontSize: 'clamp(22px, 5.8vw, 30px)',
            lineHeight: 1.55,
            color: 'var(--kalpx-text)',
            margin: '0 0 30px',
            textWrap: 'balance',
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
            fontSize: i === 0 ? 'clamp(19px, 4.8vw, 22px)' : 'clamp(16px, 4.4vw, 18px)',
            lineHeight: i === 0 ? 1.5 : 1.6,
            color: 'var(--kalpx-text-soft)',
            margin: i === bodyLines.length - 1 ? 0 : '0 0 18px',
            textWrap: 'balance',
          }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}
