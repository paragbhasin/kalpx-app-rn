/**
 * FirstRecognitionBlock — Phase 6.
 * turn_7: displays the backend-composed recognition line and body paragraphs.
 * Reads screenData.recognition_line (interpolated) + screenData.recognition_body_lines.
 */

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

  return (
    <div style={{ marginBottom: 28 }}>
      {block.label && (
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 2,
            color: 'var(--kalpx-gold)',
            marginBottom: 12,
            textTransform: 'uppercase',
          }}
        >
          {block.label}
        </p>
      )}
      {emphasizedLine && (
        <p
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: 'var(--kalpx-text)',
            lineHeight: 1.4,
            marginBottom: 16,
          }}
        >
          {emphasizedLine}
        </p>
      )}
      {bodyLines.map((line, i) => (
        <p
          key={i}
          style={{
            fontSize: 16,
            color: 'var(--kalpx-text-soft)',
            lineHeight: 1.6,
            marginBottom: 8,
          }}
        >
          {line}
        </p>
      ))}
    </div>
  );
}
