/**
 * CycleReflectionBlock — Phase 10B.
 * Handles Day 7 and Day 14 checkpoint display + decision submission.
 * Data is pre-loaded into screenData by CheckpointPage before this block renders.
 * Internal phase: intro → reflection → decisions.
 */

import React, { useState } from 'react';

type Phase = 'intro' | 'reflection' | 'decisions';

interface Props {
  block?: Record<string, any>;
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
  day: 7 | 14;
}

export function CycleReflectionBlock({ screenData, onAction, day }: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const sd = screenData || {};
  const isSubmitting = !!sd._isSubmitting;
  const submitError = !!sd.checkpoint_submit_error;

  const checkpointKey = day === 7 ? 'checkpoint_day_7' : 'checkpoint_day_14';
  const cp = sd[checkpointKey] || {};
  const decisionsAvailable: string[] = sd[`day_${day}_decisions_available`] || (day === 7 ? ['continue', 'lighten', 'reset'] : ['continue_same', 'deepen', 'change_focus']);
  const mitraReflection: string = sd.checkpoint_mitra_reflection || '';
  const dayStatuses: string[] = sd.journey_day_statuses || [];

  function submitDecision(decision: string) {
    if (onAction) {
      onAction({ type: 'submit_checkpoint_decision', payload: { decision, day } });
    }
  }

  // ── Intro — hero background matching RN 7daybg.png / 14day_updated.png ──────
  if (phase === 'intro') {
    const eyebrow = cp.eyebrow || (day === 7 ? 'Day 7 Checkpoint' : 'Day 14 Checkpoint');
    const headline = cp.intro_headline || cp.headline || (day === 7 ? 'A Week Complete' : 'Two Weeks. Something Settled.');
    const body = cp.intro_body || cp.body || (day === 7 ? 'Take a moment to reflect on your journey.' : 'Can I show you what has changed?');
    const ctaLabel = cp.intro_cta_label || 'Continue';

    return (
      <div
        data-testid="checkpoint-intro"
        style={{
          minHeight: '100dvh',
          backgroundImage: day === 7 ? 'url(/7daybg.png)' : 'url(/14day_updated.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '40px 24px calc(64px + env(safe-area-inset-bottom))',
          maxWidth: 480,
          margin: '0 auto',
        }}
      >
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--kalpx-gold)', textTransform: 'uppercase', marginBottom: 16 }}>
          {eyebrow}
        </p>
        <p style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--kalpx-font-serif)', color: 'var(--kalpx-text)', lineHeight: 1.3, marginBottom: 16 }}>
          {headline}
        </p>
        <p style={{ fontSize: 16, color: 'var(--kalpx-text-soft)', lineHeight: 1.7, marginBottom: 40 }}>
          {body}
        </p>
        <button
          data-testid="checkpoint-intro-cta"
          onClick={() => setPhase('reflection')}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: 'var(--kalpx-cta)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          {ctaLabel}
        </button>
      </div>
    );
  }

  // ── Reflection ────────────────────────────────────────────────────
  if (phase === 'reflection') {
    const graphCta = cp.graph_cta || 'Continue to Choices';
    const completedCount = dayStatuses.filter((s) => s === 'completed').length;
    const totalDays = dayStatuses.length || day;

    let narrativeText = mitraReflection;
    if (!narrativeText && cp.narrative_template) {
      narrativeText = cp.narrative_template
        .replace('{completed_count}', String(completedCount))
        .replace('{total_days}', String(totalDays));
    }
    if (!narrativeText) {
      narrativeText = `${completedCount} of ${totalDays} days held with intention.`;
    }

    return (
      <div
        data-testid="checkpoint-reflection"
        style={{ padding: '40px 24px 80px', maxWidth: 480, margin: '0 auto' }}
      >
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--kalpx-gold)', textTransform: 'uppercase', marginBottom: 20 }}>
          {day === 7 ? 'What Grew' : 'Your Journey'}
        </p>

        {/* Day dot timeline */}
        {dayStatuses.length > 0 && (
          <div
            data-testid="checkpoint-day-dots"
            style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}
          >
            {dayStatuses.map((status, i) => (
              <div
                key={i}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: status === 'completed' ? 'var(--kalpx-gold)' : 'rgba(201,168,76,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  color: status === 'completed' ? '#fff' : 'var(--kalpx-text-muted)',
                  fontWeight: 700,
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            padding: '16px',
            background: 'var(--kalpx-card-bg)',
            borderRadius: 12,
            border: '1px solid var(--kalpx-border-gold)',
            marginBottom: 32,
          }}
        >
          <p style={{ fontSize: 15, color: 'var(--kalpx-text-soft)', lineHeight: 1.7, margin: 0 }}>
            {narrativeText}
          </p>
        </div>

        {day === 14 && sd.checkpoint_classification_headline && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--kalpx-gold)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
              {sd.checkpoint_classification_label || 'Your Arc'}
            </p>
            <p style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--kalpx-font-serif)', color: 'var(--kalpx-text)', marginBottom: 8 }}>
              {sd.checkpoint_classification_headline}
            </p>
            {sd.checkpoint_classification_body && (
              <p style={{ fontSize: 14, color: 'var(--kalpx-text-soft)', lineHeight: 1.6 }}>
                {sd.checkpoint_classification_body}
              </p>
            )}
          </div>
        )}

        <button
          data-testid="checkpoint-reflection-cta"
          onClick={() => setPhase('decisions')}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: 'var(--kalpx-cta)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            touchAction: 'manipulation',
          }}
        >
          {graphCta}
        </button>
      </div>
    );
  }

  // ── Decisions ─────────────────────────────────────────────────────
  const dc = sd.checkpoint_decision_copy || {};
  const framing = sd.checkpoint_decision_framing || sd.checkpoint_framing || (day === 7 ? 'Choose your next week:' : 'How will you move forward?');

  const decisionLabels: Record<string, string> = {
    continue: cp.cta_continue_label || 'Continue My Path',
    lighten: cp.cta_lighten_label || 'Lighten',
    reset: cp.cta_start_fresh_label || 'Start Fresh',
    continue_same: cp.continue_path_cta || dc.continue_same_cta || 'Continue Same Path',
    deepen: cp.deepen_practice_cta || dc.deepen_cta || 'Deepen Practice',
    change_focus: cp.change_focus_cta || dc.change_focus_cta || 'Change Focus',
  };

  const decisionDescriptions: Record<string, string> = {
    continue: 'Keep going with your current practice rhythm.',
    lighten: 'Lower the intensity — stay consistent but easier.',
    reset: 'Start a new path with fresh clarity.',
    continue_same: 'Keep going with the same practice as the last 14 days.',
    deepen: 'Commit to 108 repetitions — deeper engagement.',
    change_focus: 'Choose a different focus for your next cycle.',
  };

  return (
    <div
      data-testid="checkpoint-decisions"
      style={{ padding: '40px 24px 80px', maxWidth: 480, margin: '0 auto' }}
    >
      <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--kalpx-gold)', textTransform: 'uppercase', marginBottom: 16 }}>
        {day === 7 ? 'Your Next Week' : 'Your Next Cycle'}
      </p>
      <p style={{ fontSize: 18, fontFamily: 'var(--kalpx-font-serif)', color: 'var(--kalpx-text)', lineHeight: 1.5, marginBottom: 32, fontWeight: 600 }}>
        {framing}
      </p>

      {submitError && (
        <p
          data-testid="checkpoint-submit-error"
          style={{ fontSize: 13, color: '#c0392b', textAlign: 'center', marginBottom: 16 }}
        >
          Something went wrong. Please try again.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {decisionsAvailable.map((decision) => (
          <button
            key={decision}
            data-testid={`checkpoint-decision-${decision}`}
            onClick={() => !isSubmitting && submitDecision(decision)}
            disabled={isSubmitting}
            style={{
              padding: '16px 20px',
              background: 'var(--kalpx-card-bg)',
              border: '1.5px solid var(--kalpx-border-gold)',
              borderRadius: 12,
              textAlign: 'left',
              cursor: isSubmitting ? 'default' : 'pointer',
              opacity: isSubmitting ? 0.6 : 1,
              boxShadow: 'var(--kalpx-shadow-card)',
              touchAction: 'manipulation',
            }}
          >
            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--kalpx-text)', marginBottom: 4 }}>
              {decisionLabels[decision] || decision}
            </p>
            {decisionDescriptions[decision] && (
              <p style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', margin: 0 }}>
                {decisionDescriptions[decision]}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
