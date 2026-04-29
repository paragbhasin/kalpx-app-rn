import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

interface Props {
  block: {
    audio_key?: string;
    audio_url?: string;
    loop?: boolean;
    autoplay?: boolean;
    label?: string;
    [key: string]: any;
  };
  screenData?: Record<string, any>;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function AudioWave() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="10" width="2" height="4" rx="1" fill="#B89450" opacity="0.4" />
      <rect x="7" y="7" width="2" height="10" rx="1" fill="#B89450" opacity="0.7" />
      <rect x="11" y="4" width="2" height="16" rx="1" fill="#B89450" />
      <rect x="15" y="7" width="2" height="10" rx="1" fill="#B89450" opacity="0.7" />
      <rect x="19" y="10" width="2" height="4" rx="1" fill="#B89450" opacity="0.4" />
    </svg>
  );
}

export function AudioPlayerBlock({ block, screenData = {} }: Props) {
  const audioKey = block.audio_key || "mantra_audio_url";
  const src: string | undefined =
    block.audio_url ||
    screenData[audioKey] ||
    screenData["runner_active_item"]?.audio_url;
  const loop = block.loop ?? true;
  const autoplay = block.autoplay ?? true;
  const label = block.label || "Guided Audio";

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const autoplayAttemptedRef = useRef(false);
  const progressTimerRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;

    const audio = new Audio(src);
    audio.preload = "auto";
    audio.loop = loop;
    audio.muted = isMuted;
    audioRef.current = audio;

    const syncProgress = () => {
      setCurrentTime(audio.currentTime || 0);
      setDuration(audio.duration || 0);
    };

    const onLoaded = () => {
      syncProgress();
      if (autoplay && !autoplayAttemptedRef.current) {
        autoplayAttemptedRef.current = true;
        void audio.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    const onError = () => setError(true);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", syncProgress);
    audio.addEventListener("durationchange", syncProgress);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.load();

    return () => {
      if (progressTimerRef.current != null) {
        window.clearInterval(progressTimerRef.current);
        progressTimerRef.current = null;
      }
      audio.pause();
      audio.src = "";
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", syncProgress);
      audio.removeEventListener("durationchange", syncProgress);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      if (audioRef.current === audio) audioRef.current = null;
    };
  }, [src, loop, autoplay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = isMuted;
  }, [isMuted]);

  const progressValue = useMemo(() => {
    if (!duration) return 0;
    return Math.min(1, Math.max(0, currentTime / duration));
  }, [currentTime, duration]);

  if (!src) return null;

  const togglePlay = async () => {
    if (error) return;
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
    } catch {
      // browser gesture policy can block playback; leave controls usable
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const seek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const nextTime = value * duration;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 360,
        margin: "20px auto",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 15,
        }}
      >
        <AudioWave />
        <p
          style={{
            margin: 0,
            fontSize: 14,
            letterSpacing: 2,
            textTransform: "uppercase",
            fontWeight: 500,
            color: "#B89450",
          }}
        >
          {label}
        </p>
        <AudioWave />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ fontSize: 14, color: "#432104", opacity: 0.7, minWidth: 35 }}>
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.001}
          value={progressValue}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Audio progress"
          style={{
            flex: 1,
            accentColor: "#E2C18D",
            cursor: "pointer",
          }}
        />
        <span style={{ fontSize: 14, color: "#432104", opacity: 0.7, minWidth: 35 }}>
          {formatTime(duration)}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ width: 50 }} />

        <button
          onClick={() => void togglePlay()}
          data-testid="audio-player-btn"
          aria-label={error ? "Audio unavailable" : isPlaying ? "Pause audio" : "Play audio"}
          disabled={error}
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: "2.5px solid #D9A557",
            background: "#fff",
            color: "#C9962A",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: error ? "not-allowed" : "pointer",
            boxShadow: "0 2px 4px rgba(217,165,87,0.2)",
            opacity: error ? 0.45 : 1,
          }}
        >
          {isPlaying ? <Pause size={20} strokeWidth={2.8} /> : <Play size={20} fill="#C9962A" strokeWidth={2.2} style={{ marginLeft: 2 }} />}
        </button>

        <button
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          style={{
            width: 50,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            color: "#432104",
          }}
        >
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: isMuted ? "rgba(184,148,80,0.15)" : "rgba(184,148,80,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isMuted ? <VolumeX size={18} color="#B89450" /> : <Volume2 size={18} color="#B89450" />}
          </span>
          <span
            style={{
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: 1,
              opacity: 0.6,
            }}
          >
            Mute
          </span>
        </button>
      </div>
    </div>
  );
}
