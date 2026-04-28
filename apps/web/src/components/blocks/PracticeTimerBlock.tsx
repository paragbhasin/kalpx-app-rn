/**
 * PracticeTimerBlock — countdown timer + step progression for practice_step_runner.
 * Reads `practice_duration_seconds` and `practice_steps` from screenData.
 * Fires complete_runner when timer reaches 0 OR all steps are acknowledged.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  block: {
    duration_key?: string;
    steps_key?: string;
    end_practice_action?: any;
    [key: string]: any;
  };
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function PracticeTimerBlock({ block, screenData = {}, onAction }: Props) {
  const durationKey = block.duration_key || 'practice_duration_seconds';
  const stepsKey = block.steps_key || 'practice_steps';

  const totalSeconds: number = (screenData[durationKey] as number) || 300; // default 5 min
  const steps: string[] = Array.isArray(screenData[stepsKey]) ? screenData[stepsKey] : [];

  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [stepIndex, setStepIndex] = useState((screenData['runner_step_index'] as number) || 0);
  const [stepVisible, setStepVisible] = useState(true);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const complete = useCallback(() => {
    if (done) return;
    setDone(true);
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    onAction?.({ type: 'complete_runner' });
  }, [done, onAction]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          complete();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, complete]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const toggleTimer = () => {
    if (done) return;
    setRunning((r) => !r);
  };

  const nextStep = () => {
    // Fade out current step, then advance
    setStepVisible(false);
    setTimeout(() => {
      const next = stepIndex + 1;
      setStepIndex(next);
      setStepVisible(true);
      onAction?.({ type: 'set_screen_value', key: 'runner_step_index', value: next });
      if (steps.length > 0 && next >= steps.length) {
        complete();
      }
    }, 280);
  };

  const progress = 1 - timeLeft / totalSeconds;
  // Final 10s: pulse gold glow on ring
  const isFinal10 = running && !done && timeLeft <= 10 && timeLeft > 0;
  const RING_R = 110;
  const RING_SIZE = 240;
  const RING_CENTER = 120;

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px', gap: 20 }}
      data-testid="practice-timer-block"
    >
      {/* Timer circle — 240px matches RN */}
      <div
        style={{ position: 'relative', width: RING_SIZE, height: RING_SIZE, cursor: 'pointer' }}
        onClick={toggleTimer}
        data-testid="timer-circle"
      >
        <svg width={RING_SIZE} height={RING_SIZE} style={{ position: 'absolute', inset: 0 }}>
          <circle cx={RING_CENTER} cy={RING_CENTER} r={RING_R} fill="none" stroke="var(--kalpx-chip-bg)" strokeWidth={8} />
          <circle
            cx={RING_CENTER} cy={RING_CENTER} r={RING_R}
            fill="none"
            stroke="var(--kalpx-gold)"
            strokeWidth={isFinal10 ? 10 : 8}
            strokeDasharray={2 * Math.PI * RING_R}
            strokeDashoffset={2 * Math.PI * RING_R * (1 - progress)}
            strokeLinecap="round"
            style={{
              transform: `rotate(-90deg)`,
              transformOrigin: `${RING_CENTER}px ${RING_CENTER}px`,
              transition: 'stroke-dashoffset 1s linear',
              filter: isFinal10 ? 'drop-shadow(0 0 6px rgba(201,168,76,0.8))' : 'none',
              animation: isFinal10 ? 'timerGlow 1s ease-in-out infinite alternate' : 'none',
            }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <span style={{ fontSize: 32, fontWeight: 300, color: isFinal10 ? 'var(--kalpx-gold)' : 'var(--kalpx-text)', transition: 'color 0.5s' }}>
            {formatTime(timeLeft)}
          </span>
          <span style={{ fontSize: 11, color: 'var(--kalpx-text-muted)', letterSpacing: 1 }}>
            {running ? 'TAP TO PAUSE' : done ? 'DONE' : 'TAP TO START'}
          </span>
        </div>
      </div>
      <style>{`
        @keyframes timerGlow {
          from { filter: drop-shadow(0 0 4px rgba(201,168,76,0.6)); }
          to   { filter: drop-shadow(0 0 10px rgba(201,168,76,1.0)); }
        }
        .timer-step-text {
          transition: opacity 0.28s ease;
        }
      `}</style>

      {/* Current step */}
      {steps.length > 0 && stepIndex < steps.length ? (
        <div style={{ maxWidth: 320, textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: 'var(--kalpx-text-muted)', letterSpacing: 1, marginBottom: 8 }}>
            STEP {stepIndex + 1} OF {steps.length}
          </p>
          <p
            className="timer-step-text"
            style={{ fontSize: 17, color: 'var(--kalpx-text)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 16, opacity: stepVisible ? 1 : 0 }}
          >
            {steps[stepIndex]}
          </p>
          {stepIndex < steps.length - 1 ? (
            <button
              onClick={nextStep}
              data-testid="next-step-btn"
              style={{
                padding: '10px 24px',
                borderRadius: 8,
                border: `1px solid var(--kalpx-gold)`,
                background: 'transparent',
                color: 'var(--kalpx-gold)',
                fontSize: 13,
                cursor: 'pointer',
                letterSpacing: 1,
              }}
            >
              Next step
            </button>
          ) : (
            <button
              onClick={complete}
              data-testid="complete-practice-btn"
              style={{
                padding: '10px 24px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--kalpx-cta)',
                color: '#fff',
                fontSize: 13,
                cursor: 'pointer',
                letterSpacing: 1,
              }}
            >
              Complete practice
            </button>
          )}
        </div>
      ) : null}

      {/* No steps — just timer */}
      {steps.length === 0 && !done && (
        <button
          onClick={complete}
          data-testid="end-practice-btn"
          style={{
            padding: '10px 24px',
            borderRadius: 8,
            border: 'none',
            background: '#C9A84C',
            color: '#fff',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          End practice
        </button>
      )}
    </div>
  );
}
