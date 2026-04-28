/**
 * Howler.js audio adapter for Mitra runner flows.
 * Audio is NEVER auto-played — caller must invoke play() after a user gesture.
 * Missing src or failed load silently no-ops; runner completion is never blocked.
 */

import { Howl } from 'howler';

export interface AudioHandle {
  play(): void;
  pause(): void;
  stop(): void;
  unload(): void;
  isPlaying(): boolean;
  isLoaded(): boolean;
}

export interface AudioOptions {
  loop?: boolean;
  volume?: number;
  onEnd?: () => void;
  onLoadError?: () => void;
}

const _noop: AudioHandle = {
  play: () => {},
  pause: () => {},
  stop: () => {},
  unload: () => {},
  isPlaying: () => false,
  isLoaded: () => false,
};

export function createAudio(src: string | undefined | null, options: AudioOptions = {}): AudioHandle {
  if (!src) return _noop;

  let _playing = false;
  let _loaded = false;

  const howl = new Howl({
    src: [src],
    loop: options.loop ?? false,
    volume: options.volume ?? 0.8,
    html5: true,
    onload: () => { _loaded = true; },
    onloaderror: () => {
      _loaded = false;
      options.onLoadError?.();
    },
    onplay: () => { _playing = true; },
    onpause: () => { _playing = false; },
    onstop: () => { _playing = false; },
    onend: () => {
      _playing = false;
      if (!options.loop) options.onEnd?.();
    },
  });

  return {
    play() {
      try { howl.play(); } catch { /* browser policy — ignore */ }
    },
    pause() {
      try { howl.pause(); } catch {}
    },
    stop() {
      try { howl.stop(); } catch {}
    },
    unload() {
      try { howl.unload(); } catch {}
    },
    isPlaying: () => _playing,
    isLoaded: () => _loaded,
  };
}
