/**
 * WelcomeBackPage — web parity of RN ContinueJourney (returning-user path).
 *
 * Calls /api/mitra/v3/journey/entry-view/ on mount. Routes based on view_key:
 *   daily_view      → /en/mitra/dashboard
 *   day_7_view      → /en/mitra/checkpoint/7
 *   day_14_view     → /en/mitra/checkpoint/14
 *   onboarding_start → /en/mitra/onboarding
 *   welcome_back_surface → renders reentry chip home (this page)
 */
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mitraJourneyEntryView, mitraJourneyReentryDecision } from '../../engine/mitraApi';
import { MitraMobileShell } from '../../components/layout/MitraMobileShell';

type ChipKey = 'reentry_continue' | 'reentry_fresh';

interface EarnedContext {
  days_practiced?: number;
  strongest_anchor?: string;
  focus?: string;
  path_cycle_number?: number;
}

interface ReentryData {
  headline: string;
  body_lines: string[];
  welcome_back_line?: string;
  focus_short?: string;
  cycle_count?: number;
  chips: { id: ChipKey; label: string }[];
  user_name: string;
  tier?: 'short' | 'medium' | 'long' | 'very_long';
  earned_context?: EarnedContext;
  fresh_restart_suggested?: boolean;
  fresh_reason_label?: string;
  primary_recommendation?: 'continue' | 'fresh';
}

function parseReentryData(envelope: any, fallbackName?: string): ReentryData {
  const cont: any = envelope?.continuity ?? {};
  const greet: any = envelope?.greeting ?? {};
  const payload: any = envelope?.target?.payload ?? {};
  const decisions: string[] = payload.decisions_available ?? ['continue', 'fresh'];
  const decisionLabels: Record<string, string> = payload.decision_labels ?? {};
  const chips: ReentryData['chips'] = decisions.map((d: string) => ({
    id: (d === 'fresh' ? 'reentry_fresh' : 'reentry_continue') as ChipKey,
    label: decisionLabels[d] ?? (d === 'fresh' ? 'Begin fresh' : 'Continue'),
  }));
  return {
    headline: cont.headline || 'Welcome back.',
    body_lines: cont.body ? [cont.body] : [],
    welcome_back_line: cont.welcome_back_line || '',
    focus_short: cont.focus_short || '',
    cycle_count: cont.cycle_count ?? undefined,
    chips,
    user_name: greet.user_name || fallbackName || 'friend',
    tier: cont.tier || 'short',
    earned_context: cont.earned_context ?? undefined,
    fresh_restart_suggested: cont.fresh_restart_suggested ?? false,
    fresh_reason_label: cont.fresh_reason_label || '',
    primary_recommendation: cont.primary_recommendation || 'continue',
  };
}

export function WelcomeBackPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reentry, setReentry] = useState<ReentryData | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const routedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await mitraJourneyEntryView();
        if (cancelled) return;
        if (!result.envelope) {
          navigate('/en/mitra/dashboard', { replace: true });
          return;
        }
        const viewKey = result.envelope?.target?.view_key;
        if (viewKey === 'daily_view') {
          routedRef.current = true;
          navigate('/en/mitra/dashboard', { replace: true });
          return;
        }
        if (viewKey === 'day_7_view') {
          routedRef.current = true;
          navigate('/en/mitra/checkpoint/7', { replace: true });
          return;
        }
        if (viewKey === 'day_14_view') {
          routedRef.current = true;
          navigate('/en/mitra/checkpoint/14', { replace: true });
          return;
        }
        if (viewKey === 'onboarding_start') {
          routedRef.current = true;
          navigate('/en/mitra/onboarding', { replace: true });
          return;
        }
        setReentry(parseReentryData(result.envelope));
        setLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? 'Could not load your journey. Please try again.');
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  async function handleChip(chipId: ChipKey) {
    if (submitting) return;
    setSubmitting(true);
    const decision: 'continue' | 'fresh' = chipId === 'reentry_fresh' ? 'fresh' : 'continue';
    const idempotencyKey = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    try {
      const env = await mitraJourneyReentryDecision(decision, idempotencyKey);
      const nv = env?.next_view ?? { view_key: '' };
      if (nv.view_key === 'daily_view') {
        navigate('/en/mitra/dashboard', { replace: true });
      } else if (nv.view_key === 'onboarding_start') {
        navigate('/en/mitra/onboarding', { replace: true });
      } else {
        navigate('/en/mitra/dashboard', { replace: true });
      }
    } catch (err: any) {
      setError('Could not submit. Please try again.');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <MitraMobileShell>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
          <div>
            <div style={{ width: 28, height: 28, border: '2px solid var(--kalpx-cta)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', textAlign: 'center' }}>Loading…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      </MitraMobileShell>
    );
  }

  if (error || !reentry) {
    return (
      <MitraMobileShell>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
          <div style={{ textAlign: 'center', maxWidth: 360 }}>
            <p style={{ fontSize: 14, color: 'var(--kalpx-text-soft)', marginBottom: 20 }}>{error || 'Something went wrong.'}</p>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '12px 28px', borderRadius: 12, background: 'var(--kalpx-cta)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Try again
            </button>
          </div>
        </div>
      </MitraMobileShell>
    );
  }

  const displayName = reentry.user_name;
  const headline = reentry.headline.replace('{userName}', displayName);
  const continueChip = reentry.chips.find((c) => c.id === 'reentry_continue');
  const freshChip = reentry.chips.find((c) => c.id === 'reentry_fresh');
  const isDeepTier = reentry.tier === 'medium' || reentry.tier === 'long' || reentry.tier === 'very_long';
  const hasClassicOptions = !!continueChip && !!freshChip && reentry.chips.length === 2;

  const freshFirst = reentry.fresh_restart_suggested || reentry.primary_recommendation === 'fresh';
  const primaryChip = freshFirst ? freshChip : continueChip;
  const secondaryChip = freshFirst ? continueChip : freshChip;

  const Divider = () => (
    <div style={{ display: 'flex', alignItems: 'center', width: '60%', margin: '20px auto' }}>
      <div style={{ flex: 1, height: 1, background: 'var(--kalpx-border-gold)', opacity: 0.5, marginRight: 10 }} />
      <span style={{ fontSize: 10, color: 'var(--kalpx-border-gold)' }}>◆</span>
      <div style={{ flex: 1, height: 1, background: 'var(--kalpx-border-gold)', opacity: 0.5, marginLeft: 10 }} />
    </div>
  );

  const scrollPad: React.CSSProperties = {
    maxWidth: 480,
    margin: '0 auto',
    padding: '8px 24px 220px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  // Classic (short-tier) layout: card options
  if (hasClassicOptions && !isDeepTier) {
    return (
      <MitraMobileShell>
        <div style={scrollPad}>
          <div style={{ textAlign: 'center', marginBottom: 18, width: '100%' }}>
            <h1 style={{ fontFamily: 'var(--kalpx-font-serif)', fontSize: 22, fontWeight: 700, color: 'var(--kalpx-text)', textAlign: 'center', marginBottom: 14, lineHeight: 1.4 }}>
              {headline}
            </h1>
            {reentry.body_lines.map((line, i) => (
              <p key={i} style={{ fontFamily: 'var(--kalpx-font-serif)', fontSize: 14, color: 'var(--kalpx-text-soft)', textAlign: 'center', lineHeight: 1.7 }}>{line}</p>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', width: '72%', margin: '10px 0 26px' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(199,154,43,0.55)', marginRight: 16 }} />
            <span style={{ fontSize: 20, color: 'var(--kalpx-gold)', lineHeight: 1 }}>✿</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(199,154,43,0.55)', marginLeft: 16 }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
            {continueChip && (
              <button
                data-testid={continueChip.id}
                disabled={submitting}
                onClick={() => handleChip(continueChip.id)}
                style={{
                  width: '100%', borderRadius: 22, padding: 10,
                  border: '1px solid rgba(199,154,43,0.55)',
                  background: 'rgba(254,247,233,0.85)',
                  display: 'flex', alignItems: 'center',
                  cursor: submitting ? 'default' : 'pointer',
                  touchAction: 'manipulation', textAlign: 'left',
                }}
              >
                <div style={{ width: 45, height: 45, borderRadius: 43, background: 'rgba(238,229,216,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 16, flexShrink: 0 }}>
                  <span style={{ fontSize: 18, color: 'var(--kalpx-gold)' }}>♡</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'var(--kalpx-font-serif)', fontSize: 18, fontWeight: 700, color: 'var(--kalpx-text)', lineHeight: 1.4, marginBottom: 2 }}>{continueChip.label}</p>
                  <p style={{ fontSize: 12, color: 'var(--kalpx-text-soft)', lineHeight: 1.5 }}>Resume your journey</p>
                </div>
                <span style={{ color: 'var(--kalpx-gold)', fontSize: 18, flexShrink: 0 }}>›</span>
              </button>
            )}
            {freshChip && (
              <button
                data-testid={freshChip.id}
                disabled={submitting}
                onClick={() => handleChip(freshChip.id)}
                style={{
                  width: '100%', borderRadius: 22, padding: 10,
                  border: '1px solid rgba(210,200,184,0.65)',
                  background: 'rgba(255,255,255,0.72)',
                  display: 'flex', alignItems: 'center',
                  cursor: submitting ? 'default' : 'pointer',
                  touchAction: 'manipulation', textAlign: 'left',
                }}
              >
                <div style={{ width: 45, height: 45, borderRadius: 43, background: 'rgba(238,229,216,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 16, flexShrink: 0 }}>
                  <span style={{ fontSize: 18, color: 'var(--kalpx-gold)' }}>✦</span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'var(--kalpx-font-serif)', fontSize: 18, fontWeight: 700, color: 'var(--kalpx-text)', lineHeight: 1.4, marginBottom: 2 }}>{freshChip.label}</p>
                  <p style={{ fontSize: 12, color: 'var(--kalpx-text-soft)', lineHeight: 1.5 }}>Start a new journey</p>
                </div>
                <span style={{ color: 'var(--kalpx-gold)', fontSize: 18, flexShrink: 0 }}>›</span>
              </button>
            )}
          </div>
        </div>

        {/* Lotus decoration — bottom-right, decorative */}
        <div style={{ position: 'fixed', bottom: -60, left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 0 }}>
          <img src="/new_home_lotus.png" alt="" style={{ width: '40vw', maxWidth: 200, opacity: 0.7, objectFit: 'contain' }} />
        </div>
      </MitraMobileShell>
    );
  }

  // Deep-tier / inline chip layout (medium/long/very_long or single chip)
  return (
    <MitraMobileShell>
      <div style={scrollPad}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 10, width: '100%' }}>
          <h1 style={{ fontFamily: 'var(--kalpx-font-serif)', fontSize: 28, fontWeight: 700, color: 'var(--kalpx-text)', textAlign: 'center', marginBottom: 16, lineHeight: 1.3 }}>
            {headline}
          </h1>
          {reentry.body_lines.map((line, i) => (
            <p key={i} style={{ fontFamily: 'var(--kalpx-font-serif)', fontSize: 18, color: 'var(--kalpx-text-soft)', textAlign: 'center', lineHeight: 1.6, maxWidth: 320, margin: '0 auto 6px' }}>{line}</p>
          ))}
        </div>

        {!!reentry.welcome_back_line && (
          <p style={{ fontFamily: 'var(--kalpx-font-serif)', fontSize: 17, color: 'var(--kalpx-text-soft)', textAlign: 'center', lineHeight: 1.6, maxWidth: 320, margin: '4px 0' }}>
            {reentry.welcome_back_line}
          </p>
        )}

        <Divider />

        {/* Earned context card */}
        {!!reentry.earned_context && (
          <div style={{ width: '100%', background: 'rgba(255,252,246,0.85)', borderRadius: 20, border: '1px solid rgba(217,194,142,0.4)', padding: '16px 20px', marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {typeof reentry.earned_context.days_practiced === 'number' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Days practiced</span>
                <span style={{ fontFamily: 'var(--kalpx-font-serif)', fontSize: 16, fontWeight: 700, color: 'var(--kalpx-text)' }}>{reentry.earned_context.days_practiced}</span>
              </div>
            )}
            {typeof reentry.cycle_count === 'number' && reentry.cycle_count > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Full cycles</span>
                <span style={{ fontFamily: 'var(--kalpx-font-serif)', fontSize: 16, fontWeight: 700, color: 'var(--kalpx-text)' }}>{reentry.cycle_count}</span>
              </div>
            )}
            {!!reentry.earned_context.strongest_anchor && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Strongest anchor</span>
                <span style={{ fontFamily: 'var(--kalpx-font-serif)', fontSize: 16, fontWeight: 700, color: 'var(--kalpx-text)' }}>{reentry.earned_context.strongest_anchor}</span>
              </div>
            )}
          </div>
        )}

        {!!reentry.fresh_reason_label && (
          <p style={{ fontFamily: 'var(--kalpx-font-serif)', fontSize: 15, color: 'var(--kalpx-text-muted)', textAlign: 'center', lineHeight: 1.6, maxWidth: 300, margin: '8px 0 4px', fontStyle: 'italic' }}>
            {reentry.fresh_reason_label}
          </p>
        )}

        {/* CTA buttons */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8, marginTop: 24 }}>
          {primaryChip && (
            <button
              data-testid={primaryChip.id}
              disabled={submitting}
              onClick={() => handleChip(primaryChip.id)}
              style={{
                width: '100%', padding: '14px 20px', borderRadius: 15,
                border: '0.3px solid rgba(159,159,159,0.3)',
                background: 'var(--kalpx-cta)', color: '#fff',
                fontFamily: 'var(--kalpx-font-serif)', fontSize: 18, fontWeight: 700,
                cursor: submitting ? 'default' : 'pointer',
                boxShadow: '0 3px 8px rgba(0,0,0,0.2)', touchAction: 'manipulation',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {primaryChip.label}
            </button>
          )}
          {secondaryChip && (
            <button
              data-testid={secondaryChip.id}
              disabled={submitting}
              onClick={() => handleChip(secondaryChip.id)}
              style={{
                width: '100%', padding: '14px 20px', borderRadius: 15,
                border: '0.3px solid rgba(159,159,159,0.3)',
                background: 'var(--kalpx-card-bg)', color: 'var(--kalpx-text)',
                fontFamily: 'var(--kalpx-font-serif)', fontSize: 18,
                cursor: submitting ? 'default' : 'pointer',
                boxShadow: '0 3px 4px rgba(0,0,0,0.2)', touchAction: 'manipulation',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {secondaryChip.label}
            </button>
          )}
          {!primaryChip && reentry.chips.map((chip) => (
            <button
              key={chip.id}
              data-testid={chip.id}
              disabled={submitting}
              onClick={() => handleChip(chip.id)}
              style={{
                width: '100%', padding: '14px 20px', borderRadius: 15,
                border: '1px solid var(--kalpx-border-gold)',
                background: 'var(--kalpx-card-bg)', color: 'var(--kalpx-text)',
                fontFamily: 'var(--kalpx-font-serif)', fontSize: 18,
                cursor: submitting ? 'default' : 'pointer',
                touchAction: 'manipulation',
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lotus decoration */}
      <div style={{ position: 'fixed', bottom: -60, left: 0, right: 0, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 0 }}>
        <img src="/new_home_lotus.png" alt="" style={{ width: '40vw', maxWidth: 200, opacity: 0.7, objectFit: 'contain' }} />
      </div>
    </MitraMobileShell>
  );
}
