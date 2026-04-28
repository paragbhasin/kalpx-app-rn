/**
 * SoundBridgeTransientBlock — Moment 42 OM audio interstitial.
 * Dark bg, pulsing gold orb, tap anywhere to advance, auto-advance after 12s.
 * No back button during playback (spec §9).
 */
import React, { useEffect, useRef, useState } from 'react';
import { createAudio, type AudioHandle } from '../../lib/audio/howlerAudio';

interface Props {
  block?: { [key: string]: any };
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

export function SoundBridgeTransientBlock({ block, screenData = {}, onAction }: Props) {
  const [tapped, setTapped] = useState(false);
  const audioRef = useRef<AudioHandle | null>(null);
  const advancedRef = useRef(false);

  const advance = (exitType: 'auto' | 'tap') => {
    if (advancedRef.current) return;
    advancedRef.current = true;
    audioRef.current?.stop();
    audioRef.current?.unload();
    onAction?.({ type: 'advance_sound_bridge', payload: { exit_type: exitType } });
  };

  useEffect(() => {
    const src: string | undefined = screenData.om_audio_url;
    if (src) {
      const h = createAudio(src, { loop: false, volume: 0.7, onEnd: () => advance('auto') });
      audioRef.current = h;
    }
    const timer = setTimeout(() => advance('auto'), 12_000);
    return () => {
      clearTimeout(timer);
      audioRef.current?.stop();
      audioRef.current?.unload();
    };
  }, []);

  const handleTap = () => {
    if (!tapped) {
      setTapped(true);
      audioRef.current?.play();
    }
    advance('tap');
  };

  const mantraText = (screenData.trigger_mantra_text as string) || 'OM';
  const devanagari = (screenData.trigger_mantra_devanagari as string) || 'ॐ';

  return (
    <div
      onClick={handleTap}
      data-testid="sound-bridge-transient"
      style={{
        minHeight: '100dvh',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 32,
        gap: 32,
        userSelect: 'none',
      }}
    >
      {/* Pulsing gold orb */}
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.3) 0%, rgba(201,168,76,0.05) 70%)',
          border: '1.5px solid rgba(201,168,76,0.4)',
          animation: 'soundBridgePulse 3s ease-in-out infinite',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 36, color: 'rgba(201,168,76,0.9)' }}>{devanagari}</span>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18, fontStyle: 'italic', marginBottom: 8 }}>
          {mantraText}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, letterSpacing: 2 }}>
          TAP TO CONTINUE
        </p>
      </div>

      <style>{`
        @keyframes soundBridgePulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.12); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
