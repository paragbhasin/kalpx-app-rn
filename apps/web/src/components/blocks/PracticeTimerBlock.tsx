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
    const next = stepIndex + 1;
    setStepIndex(next);
    onAction?.({ type: 'set_screen_value', key: 'runner_step_index', value: next });
    if (steps.length > 0 && next >= steps.length) {
      complete();
    }
  };

  const progress = 1 - timeLeft / totalSeconds;

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 16px', gap: 20 }}
      data-testid="practice-timer-block"
    >
      {/* Timer circle */}
      <div
        style={{ position: 'relative', width: 160, height: 160, cursor: 'pointer' }}
        onClick={toggleTimer}
        data-testid="timer-circle"
      >
        <svg width={160} height={160} style={{ position: 'absolute', inset: 0 }}>
          <circle cx={80} cy={80} r={70} fill="none" stroke="#F0E8D8" strokeWidth={8} />
          <circle
            cx={80} cy={80} r={70}
            fill="none" stroke="#C9A84C" strokeWidth={8}
            strokeDasharray={2 * Math.PI * 70}
            strokeDashoffset={2 * Math.PI * 70 * (1 - progress)}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px', transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <span style={{ fontSize: 28, fontWeight: 300, color: '#2C2A26' }}>
            {formatTime(timeLeft)}
          </span>
          <span style={{ fontSize: 11, color: '#9A8C78', letterSpacing: 1 }}>
            {running ? 'TAP TO PAUSE' : done ? 'DONE' : 'TAP TO START'}
          </span>
        </div>
      </div>

      {/* Current step */}
      {steps.length > 0 && stepIndex < steps.length ? (
        <div style={{ maxWidth: 320, textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#9A8C78', letterSpacing: 1, marginBottom: 8 }}>
            STEP {stepIndex + 1} OF {steps.length}
          </p>
          <p style={{ fontSize: 17, color: '#3D3930', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 16 }}>
            {steps[stepIndex]}
          </p>
          {stepIndex < steps.length - 1 ? (
            <button
              onClick={nextStep}
              data-testid="next-step-btn"
              style={{
                padding: '10px 24px',
                borderRadius: 8,
                border: '1px solid #C9A84C',
                background: 'transparent',
                color: '#C9A84C',
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
                background: '#C9A84C',
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
