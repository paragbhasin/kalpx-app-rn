/**
 * AudioPlayerBlock — Howler.js wrapper for mantra/practice audio.
 * Audio NEVER auto-plays. First user tap triggers audio unlock.
 * Missing or failed audio silently no-ops — completion is never blocked.
 */
import React, { useEffect, useRef, useState } from 'react';
import { createAudio, type AudioHandle } from '../../lib/audio/howlerAudio';

interface Props {
  block: {
    audio_key?: string;
    loop?: boolean;
    [key: string]: any;
  };
  screenData?: Record<string, any>;
}

export function AudioPlayerBlock({ block, screenData = {} }: Props) {
  const audioKey = block.audio_key || 'mantra_audio_url';
  const src: string | undefined = screenData[audioKey] || screenData['runner_active_item']?.audio_url;
  const loop = block.loop ?? true;

  const handleRef = useRef<AudioHandle | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;
    const h = createAudio(src, {
      loop,
      onEnd: () => setPlaying(false),
      onLoadError: () => setError(true),
    });
    handleRef.current = h;
    return () => {
      h.stop();
      h.unload();
      handleRef.current = null;
    };
  }, [src, loop]);

  if (!src || error) return null;

  const toggle = () => {
    const h = handleRef.current;
    if (!h) return;
    if (playing) {
      h.pause();
      setPlaying(false);
    } else {
      h.play();
      setPlaying(true);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 16px' }}>
      <button
        onClick={toggle}
        data-testid="audio-player-btn"
        aria-label={playing ? 'Pause audio' : 'Play audio'}
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '1.5px solid #C9A84C',
          background: playing ? '#C9A84C' : 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s',
        }}
      >
        {playing ? (
          // Pause icon
          <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <rect x={5} y={3} width={4} height={14} rx={1} fill={playing ? '#fff' : '#C9A84C'} />
            <rect x={11} y={3} width={4} height={14} rx={1} fill={playing ? '#fff' : '#C9A84C'} />
          </svg>
        ) : (
          // Play icon
          <svg width={20} height={20} viewBox="0 0 20 20" fill="none">
            <path d="M7 4l10 6-10 6V4z" fill="#C9A84C" />
          </svg>
        )}
      </button>
    </div>
  );
}
