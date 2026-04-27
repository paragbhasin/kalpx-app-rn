import React from 'react';
import { interpolate } from '../../engine/interpolation';

interface Props {
  block: {
    text_key?: string;
    devanagari_key?: string;
    transliteration_key?: string;
    [key: string]: any;
  };
  screenData?: Record<string, any>;
}

export function MantraDisplayBlock({ block, screenData = {} }: Props) {
  const sd = screenData;
  const textKey = block.text_key || 'mantra_text';
  const devKey = block.devanagari_key || 'mantra_devanagari';
  const translitKey = block.transliteration_key || 'mantra_transliteration';

  const text = sd[textKey] || sd['runner_active_item']?.title || '';
  const devanagari = sd[devKey] || sd['runner_active_item']?.devanagari || '';
  const translit = sd[translitKey] || sd['runner_active_item']?.transliteration || '';

  const displayText = interpolate(text, sd);

  return (
    <div style={{ textAlign: 'center', padding: '24px 16px 16px' }}>
      {devanagari ? (
        <p
          style={{
            fontFamily: "'Noto Serif Devanagari', serif",
            fontSize: 26,
            lineHeight: 1.6,
            color: '#2C2A26',
            marginBottom: 8,
          }}
        >
          {devanagari}
        </p>
      ) : null}
      {displayText ? (
        <p
          style={{
            fontFamily: "'Roboto Serif', Georgia, serif",
            fontSize: 18,
            fontStyle: 'italic',
            lineHeight: 1.6,
            color: '#3D3930',
            marginBottom: 4,
          }}
        >
          {displayText}
        </p>
      ) : null}
      {translit ? (
        <p style={{ fontSize: 13, color: '#9A8C78', letterSpacing: 1 }}>
          {translit}
        </p>
      ) : null}
    </div>
  );
}
