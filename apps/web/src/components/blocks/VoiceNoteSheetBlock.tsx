/**
 * VoiceNoteSheetBlock — Voice recording shell with text fallback.
 * MediaRecorder unavailable → text input with submit.
 * Voice failure must not block trigger/checkin/room completion.
 */
import React, { useState } from 'react';

const canRecord =
  typeof navigator !== 'undefined' &&
  !!navigator.mediaDevices?.getUserMedia &&
  typeof window !== 'undefined' &&
  'MediaRecorder' in window;

interface Props {
  block?: { [key: string]: any };
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

export function VoiceNoteSheetBlock({ onAction }: Props) {
  const [text, setText] = useState('');

  const submit = () => {
    onAction?.({ type: 'support_exit' });
  };

  if (!canRecord) {
    return (
      <div style={{ padding: '32px 24px' }} data-testid="voice-note-sheet">
        <p style={{ color: '#2C2A26', marginBottom: 16, lineHeight: 1.6 }}>
          What's present for you right now?
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          data-testid="voice-note-text-input"
          placeholder="Write whatever is here..."
          style={{
            width: '100%',
            minHeight: 100,
            padding: '12px 14px',
            borderRadius: 8,
            border: '1px solid #E8DCC8',
            fontSize: 15,
            resize: 'vertical',
            marginBottom: 16,
            boxSizing: 'border-box',
          }}
        />
        <button
          onClick={submit}
          style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: '#C9A84C', color: '#fff', cursor: 'pointer' }}
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 24px', textAlign: 'center' }} data-testid="voice-note-sheet">
      <p style={{ color: '#2C2A26', fontSize: 16, marginBottom: 24 }}>
        Voice recording is available but not configured yet.
      </p>
      <button
        onClick={submit}
        style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: '#C9A84C', color: '#fff', cursor: 'pointer' }}
      >
        Continue without recording
      </button>
    </div>
  );
}
