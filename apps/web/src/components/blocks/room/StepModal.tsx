/**
 * StepModal — web equivalent of RN StepModal (Phase 13.5).
 * Supports: timer, text-input/journal, grounding, unknown-fallback.
 * Voice-note and reach-out are stub-only on web (same as RN MVP).
 */
import React, { useState, useEffect, useRef } from 'react';

export type StepModalKind =
  | 'timer_breathe'
  | 'timer_walk'
  | 'timer_sit'
  | 'timer_heart'
  | 'text_input'
  | 'grounding'
  | 'voice_note'
  | 'reach_out'
  | 'unknown';

export interface StepModalResult {
  text?: string;
  grounding?: string[];
  source?: 'voice_note' | 'reach_out';
  duration_sec?: number;
  stub?: boolean;
}

/** Derive UI kind from template_id prefix — mirrors RN classifyStep */
export function classifyStep(templateId?: string | null): StepModalKind {
  if (!templateId) return 'unknown';
  if (templateId.startsWith('step_breathe_')) return 'timer_breathe';
  if (templateId.startsWith('step_walk_timer_')) return 'timer_walk';
  if (templateId.startsWith('step_sit_ambient_')) return 'timer_sit';
  if (templateId.startsWith('step_hand_on_heart_')) return 'timer_heart';
  if (templateId.startsWith('step_text_input_')) return 'text_input';
  if (templateId.startsWith('step_journal_')) return 'text_input';
  if (templateId.startsWith('step_grounding_')) return 'grounding';
  if (templateId.startsWith('step_voice_note')) return 'voice_note';
  if (templateId.startsWith('step_reach_out')) return 'reach_out';
  return 'unknown';
}

const GROUNDING_PROMPTS = [
  'Name 5 things you can see',
  'Name 4 things you can hear',
  'Name 3 things you can feel',
  'Name 2 things you can smell',
  'Name 1 thing you can taste',
];

const MAX_TEXT = 1000;

interface Props {
  visible: boolean;
  stepPayload?: any;
  label: string;
  onCancel: () => void;
  onDone: (extra: StepModalResult) => void;
  errorMessage?: string | null;
  isSubmitting?: boolean;
}

export function StepModal({ visible, stepPayload, label, onCancel, onDone, errorMessage, isSubmitting = false }: Props) {
  const kind = classifyStep(stepPayload?.template_id);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [visible, onCancel]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        data-testid="step-modal"
        style={{
          width: '100%',
          maxWidth: 480,
          background: '#fdf8ef',
          borderRadius: '24px 24px 0 0',
          padding: '0 0 32px',
          maxHeight: '90dvh',
          overflowY: 'auto',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E0E0E2' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', padding: '14px 16px 4px' }}>
          <button
            data-testid="step-modal-cancel"
            onClick={onCancel}
            style={{ background: 'none', border: 'none', fontSize: 15, color: '#6E6E73', cursor: 'pointer', padding: 0 }}
          >
            Cancel
          </button>
        </div>
        <p
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: '#1C1C1E',
            textAlign: 'center',
            padding: '0 20px 12px',
            lineHeight: 1.4,
          }}
        >
          {label}
        </p>

        {/* Body */}
        <div
          style={{ padding: '0 24px', opacity: isSubmitting ? 0.55 : 1 }}
          data-testid="step-modal-body"
        >
          {(kind === 'timer_breathe' || kind === 'timer_walk' || kind === 'timer_sit' || kind === 'timer_heart') && (
            <TimerBody kind={kind} stepPayload={stepPayload} onDone={onDone} />
          )}
          {kind === 'text_input' && (
            <TextInputBody stepPayload={stepPayload} onDone={onDone} />
          )}
          {kind === 'grounding' && (
            <GroundingBody onDone={onDone} />
          )}
          {kind === 'voice_note' && (
            <VoiceNoteBody onDone={onDone} />
          )}
          {kind === 'reach_out' && (
            <ReachOutBody onDone={onDone} />
          )}
          {kind === 'unknown' && (
            <UnknownBody onDone={onDone} />
          )}
        </div>

        {errorMessage && (
          <p
            data-testid="step-modal-error"
            style={{ color: '#C0392B', fontSize: 13, textAlign: 'center', marginTop: 4, padding: '0 16px' }}
          >
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Timer body ────────────────────────────────────────────────────────────────

function defaultTimerSeconds(kind: string): number {
  if (kind === 'timer_heart') return 30;
  return 60;
}

function defaultInstruction(kind: string): string {
  if (kind === 'timer_heart') return 'Rest your hand on your heart. Breathe.';
  if (kind === 'timer_breathe') return 'Breathe gently.';
  if (kind === 'timer_walk') return 'Walk at your own pace.';
  return 'Sit quietly.';
}

interface TimerBodyProps {
  kind: string;
  stepPayload: any;
  onDone: (extra: StepModalResult) => void;
}

function TimerBody({ kind, stepPayload, onDone }: TimerBodyProps) {
  const totalSec = (() => {
    const raw = stepPayload?.duration_sec;
    if (typeof raw === 'number' && raw > 0 && raw <= 3600) return raw;
    const sc = stepPayload?.step_config;
    if (sc) {
      const computed = (sc.cycles || 0) * ((sc.inhale || 0) + (sc.exhale || 0) + (sc.hold || 0));
      if (computed > 0 && computed <= 3600) return computed;
    }
    return defaultTimerSeconds(kind);
  })();

  const cueText = (stepPayload?.cue_text && String(stepPayload.cue_text)) || defaultInstruction(kind);
  const [remaining, setRemaining] = useState(totalSec);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const atZero = remaining <= 0;

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { if (intervalRef.current) clearInterval(intervalRef.current); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  useEffect(() => { if (atZero) setRunning(false); }, [atZero]);

  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const timeLabel = `${mm}:${ss.toString().padStart(2, '0')}`;

  return (
    <div style={{ textAlign: 'center', paddingTop: 8 }}>
      <p style={{ fontSize: 16, color: '#3C3C43', marginBottom: 24 }} data-testid="step-modal-timer-cue">{cueText}</p>
      <p style={{ fontSize: 64, color: '#1C1C1E', marginBottom: 32, fontVariantNumeric: 'tabular-nums' }} data-testid="step-modal-timer-digits">
        {timeLabel}
      </p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        {!running && !atZero && (
          <button
            data-testid="step-modal-timer-start"
            onClick={() => setRunning(true)}
            style={{ padding: '12px 20px', borderRadius: 24, border: '1px solid #1C1C1E', background: 'none', fontSize: 15, color: '#432104', cursor: 'pointer' }}
          >
            Start
          </button>
        )}
        {running && (
          <button
            data-testid="step-modal-timer-pause"
            onClick={() => setRunning(false)}
            style={{ padding: '12px 20px', borderRadius: 24, border: '1px solid #1C1C1E', background: 'none', fontSize: 15, color: '#432104', cursor: 'pointer' }}
          >
            Pause
          </button>
        )}
        <button
          data-testid="step-modal-timer-done"
          onClick={() => onDone({})}
          style={{ padding: '12px 20px', borderRadius: 24, border: '1px solid #D8D8D8', background: '#FBF5F5', fontSize: 15, fontWeight: 600, color: '#432104', cursor: 'pointer' }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

// ── Text-input body ───────────────────────────────────────────────────────────

const PROMPT_SLOT_TEXT: Record<string, string> = {
  name_short_prompt: "What's closest to you right now?",
  name_full_prompt: 'What feels most full or alive right now?',
};

interface TextInputBodyProps {
  stepPayload: any;
  onDone: (extra: StepModalResult) => void;
}

function TextInputBody({ stepPayload, onDone }: TextInputBodyProps) {
  const mm = stepPayload?.memory_modal;
  const [text, setText] = useState('');
  const promptSlot = stepPayload?.step_config?.prompt_slot;
  const promptText =
    mm?.prompt ||
    (stepPayload?.prompt && String(stepPayload.prompt)) ||
    (typeof promptSlot === 'string' && PROMPT_SLOT_TEXT[promptSlot]) ||
    'Take a moment and write what comes.';
  const placeholderText = mm?.placeholder || 'Type what you feel..';
  const doneLabel = mm?.primary_label || 'Done';
  const trimmed = text.trim();
  const enabled = trimmed.length >= 1;

  return (
    <div style={{ paddingTop: 8 }}>
      {mm?.sanatan_context && (
        <p style={{ fontSize: 13, color: '#8B6914', fontStyle: 'italic', textAlign: 'center', marginBottom: 6, lineHeight: 1.5 }}>
          {mm.sanatan_context}
        </p>
      )}
      {mm?.why_we_ask && (
        <p style={{ fontSize: 13, color: '#5C5C5C', textAlign: 'center', marginBottom: 14, lineHeight: 1.5 }}>
          {mm.why_we_ask}
        </p>
      )}
      <p style={{ fontSize: 16, color: '#3C3C43', marginBottom: 16, lineHeight: 1.4 }}>{promptText}</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_TEXT))}
        placeholder={placeholderText}
        data-testid="step-modal-text-input"
        maxLength={MAX_TEXT}
        style={{
          width: '100%',
          minHeight: 160,
          border: '1px solid #D8D8D8',
          borderRadius: 12,
          padding: 12,
          fontSize: 15,
          color: '#1C1C1E',
          background: 'rgba(255,255,255,0.5)',
          resize: 'vertical',
          boxSizing: 'border-box',
        }}
      />
      <p style={{ fontSize: 12, color: '#8E8E93', textAlign: 'right', margin: '6px 0 16px' }}>
        {text.length} / {MAX_TEXT}
      </p>
      <button
        data-testid="step-modal-text-done"
        disabled={!enabled}
        onClick={() => onDone({ text: trimmed })}
        style={{
          width: '100%',
          height: 40,
          borderRadius: 28,
          border: '0.3px solid #9f9f9f',
          background: '#FBF5F5',
          fontSize: 17,
          fontWeight: 600,
          color: '#432104',
          cursor: enabled ? 'pointer' : 'default',
          opacity: enabled ? 1 : 0.35,
        }}
      >
        {doneLabel}
      </button>
    </div>
  );
}

// ── Grounding body ────────────────────────────────────────────────────────────

function GroundingBody({ onDone }: { onDone: (extra: StepModalResult) => void }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '', '', '']);
  const current = answers[index] ?? '';
  const prompt = GROUNDING_PROMPTS[index];
  const isLast = index === GROUNDING_PROMPTS.length - 1;
  const trimmed = current.trim();
  const enabled = trimmed.length >= 1;

  const setCurrent = (v: string) => {
    setAnswers((prev) => { const next = [...prev]; next[index] = v.slice(0, MAX_TEXT); return next; });
  };

  const handleNext = () => {
    if (!enabled) return;
    if (isLast) { onDone({ grounding: answers.map((a) => a.trim()) }); return; }
    setIndex((i) => Math.min(GROUNDING_PROMPTS.length - 1, i + 1));
  };

  return (
    <div style={{ paddingTop: 8 }}>
      <p data-testid="step-modal-grounding-progress" style={{ fontSize: 12, color: '#8E8E93', textAlign: 'center', marginBottom: 8 }}>
        {index + 1} of {GROUNDING_PROMPTS.length}
      </p>
      <p style={{ fontSize: 16, color: '#3C3C43', marginBottom: 16, lineHeight: 1.4 }}>{prompt}</p>
      <textarea
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
        placeholder="Type what you feel.."
        data-testid="step-modal-grounding-input"
        maxLength={MAX_TEXT}
        style={{
          width: '100%',
          minHeight: 120,
          border: '1px solid #D8D8D8',
          borderRadius: 12,
          padding: 12,
          fontSize: 15,
          color: '#1C1C1E',
          background: 'rgba(255,255,255,0.5)',
          resize: 'vertical',
          boxSizing: 'border-box',
        }}
      />
      <button
        data-testid={isLast ? 'step-modal-grounding-done' : 'step-modal-grounding-next'}
        disabled={!enabled}
        onClick={handleNext}
        style={{
          width: '100%',
          height: 40,
          marginTop: 16,
          borderRadius: 28,
          border: '0.3px solid #9f9f9f',
          background: '#FBF5F5',
          fontSize: 17,
          fontWeight: 600,
          color: '#432104',
          cursor: enabled ? 'pointer' : 'default',
          opacity: enabled ? 1 : 0.35,
        }}
      >
        {isLast ? 'Done' : 'Next'}
      </button>
    </div>
  );
}

// ── Voice note stub body ──────────────────────────────────────────────────────

function VoiceNoteBody({ onDone }: { onDone: (extra: StepModalResult) => void }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 20 }}>
      <p style={{ fontSize: 24, marginBottom: 12 }}>🎙</p>
      <p style={{ fontSize: 15, color: '#3C3C43', marginBottom: 8, lineHeight: 1.5 }}>
        Speaking it aloud can help.
      </p>
      <p style={{ fontSize: 13, color: '#8E8E93', marginBottom: 28, lineHeight: 1.4 }}>
        Voice recording will be available in a future update.
      </p>
      <button
        data-testid="step-modal-voice-note-done"
        onClick={() => onDone({ source: 'voice_note', stub: true })}
        style={{
          padding: '12px 20px',
          borderRadius: 24,
          border: '1px solid #D8D8D8',
          background: '#FBF5F5',
          fontSize: 15,
          fontWeight: 600,
          color: '#432104',
          cursor: 'pointer',
        }}
      >
        Done
      </button>
    </div>
  );
}

// ── Reach out stub body ───────────────────────────────────────────────────────

function ReachOutBody({ onDone }: { onDone: (extra: StepModalResult) => void }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 20 }}>
      <p style={{ fontSize: 24, marginBottom: 12 }}>🤝</p>
      <p style={{ fontSize: 15, color: '#3C3C43', marginBottom: 8, lineHeight: 1.5 }}>
        Reaching out to someone you trust is a meaningful step.
      </p>
      <p style={{ fontSize: 13, color: '#8E8E93', marginBottom: 28, lineHeight: 1.4 }}>
        Contact suggestions will be available in a future update.
      </p>
      <button
        data-testid="step-modal-reach-out-done"
        onClick={() => onDone({ source: 'reach_out', stub: true })}
        style={{
          padding: '12px 20px',
          borderRadius: 24,
          border: '1px solid #D8D8D8',
          background: '#FBF5F5',
          fontSize: 15,
          fontWeight: 600,
          color: '#432104',
          cursor: 'pointer',
        }}
      >
        Done
      </button>
    </div>
  );
}

// ── Unknown / fallback body ───────────────────────────────────────────────────

function UnknownBody({ onDone }: { onDone: (extra: StepModalResult) => void }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 20 }}>
      <p style={{ fontSize: 16, color: '#3C3C43', marginBottom: 24 }}>
        This step will be available in a future update.
      </p>
      <button
        data-testid="step-modal-unknown-done"
        onClick={() => onDone({})}
        style={{
          padding: '12px 20px',
          borderRadius: 24,
          border: '1px solid #D8D8D8',
          background: '#FBF5F5',
          fontSize: 15,
          fontWeight: 600,
          color: '#432104',
          cursor: 'pointer',
        }}
      >
        Done
      </button>
    </div>
  );
}
