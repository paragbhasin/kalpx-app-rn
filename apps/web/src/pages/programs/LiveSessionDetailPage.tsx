import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppShell } from '../../components/ui/AppShell';
import {
  fetchLiveSessionDetail,
  registerForSession,
  recordJoinClick,
  type TLPLiveSessionDetail,
  type LiveSessionRegistration,
} from '../../engine/liveSessionApi';

// ── Types ─────────────────────────────────────────────────────────────────────

type LoadState =
  | { kind: 'loading' }
  | { kind: 'loaded'; session: TLPLiveSessionDetail }
  | { kind: 'not_found' }
  | { kind: 'error' };

type RegisterState =
  | { kind: 'idle' }
  | { kind: 'registering' }
  | { kind: 'registered'; result: LiveSessionRegistration }
  | { kind: 'auth_required' }
  | { kind: 'error'; message: string };

// ── Helpers ───────────────────────────────────────────────────────────────────

const SESSION_TYPE_LABELS: Record<string, string> = {
  jaap: 'Jaap',
  dhyaan: 'Dhyaan',
  satsang: 'Satsang',
  yoga: 'Yoga',
  katha: 'Katha',
  pravachan: 'Pravachan',
  workshop: 'Workshop',
  qa: 'Q&A',
};

const PLATFORM_LABELS: Record<string, string> = {
  zoom: 'Zoom',
  meet: 'Google Meet',
  teams: 'Teams',
  youtube: 'YouTube Live',
  jitsi: 'Jitsi',
  webex: 'Webex',
};

const REMINDER_LABELS: Record<'all' | 'day_of' | 'none', string> = {
  all: 'All reminders (24h + 1h + 15 min)',
  day_of: 'Day-of reminder only',
  none: 'No reminders',
};

function sessionTypeLabel(type: string): string {
  return SESSION_TYPE_LABELS[type.toLowerCase()] ?? type;
}

function platformLabel(platform: string): string {
  return PLATFORM_LABELS[platform.toLowerCase()] ?? platform;
}

function formatScheduledAt(dateStr: string, timezone: string): string {
  try {
    const d = new Date(dateStr);
    const datePart = d.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: timezone,
    });
    const timePart = d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone,
    });
    const tzShort =
      timezone.includes('Kolkata') || timezone.includes('Asia/Calcutta')
        ? 'IST'
        : timezone.split('/').pop()?.replace(/_/g, ' ') ?? timezone;
    return `${datePart} at ${timePart} ${tzShort}`;
  } catch {
    return dateStr;
  }
}

function safeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('https://') || url.startsWith('http://')) return url;
  return null;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function LiveSessionDetailPage() {
  const { code } = useParams<{ code: string }>();
  const [state, setState] = useState<LoadState>({ kind: 'loading' });

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    async function load() {
      try {
        const session = await fetchLiveSessionDetail(code!);
        if (cancelled) return;
        setState({ kind: 'loaded', session });
      } catch (err: unknown) {
        if (cancelled) return;
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) setState({ kind: 'not_found' });
        else setState({ kind: 'error' });
      }
    }
    load();
    return () => { cancelled = true; };
  }, [code]);

  // SEO title — set when session is loaded
  useEffect(() => {
    if (state.kind !== 'loaded') return;
    document.title = `${state.session.title} — KalpX`;
  }, [state.kind === 'loaded' ? (state as Extract<LoadState, { kind: 'loaded' }>).session.title : '']);

  return (
    <AppShell>
      <main
        role="main"
        style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px 80px' }}
      >
        {/* Back link */}
        <Link
          to="/live-sessions/"
          style={{
            display: 'inline-block',
            fontSize: 13,
            color: 'var(--kalpx-text-muted)',
            marginBottom: 24,
            textDecoration: 'none',
          }}
        >
          ← All Sessions
        </Link>

        {state.kind === 'loading' && <LoadingState />}
        {state.kind === 'not_found' && <NotFoundState />}
        {state.kind === 'error' && <ErrorState />}
        {state.kind === 'loaded' && <SessionBody session={state.session} />}
      </main>
    </AppShell>
  );
}

// ── Load states ───────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div style={{ textAlign: 'center', paddingTop: 80 }} aria-busy="true" aria-label="Loading session">
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid var(--kalpx-border)',
        borderTopColor: 'var(--kalpx-gold)',
        animation: 'spin 0.8s linear infinite',
        margin: '0 auto 16px',
      }} />
      <p style={{ color: 'var(--kalpx-text-muted)', fontSize: 14 }}>Loading session…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function NotFoundState() {
  return (
    <div style={{ textAlign: 'center', paddingTop: 80 }}>
      <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Session not found</p>
      <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14 }}>
        This session link is no longer valid.
      </p>
    </div>
  );
}

function ErrorState() {
  return (
    <div style={{ textAlign: 'center', paddingTop: 80 }}>
      <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Something went wrong</p>
      <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14 }}>
        Please refresh or{' '}
        <a href="https://kalpx.com/support" style={{ color: 'var(--kalpx-gold)' }}>contact support</a>.
      </p>
    </div>
  );
}

// ── Main session body ─────────────────────────────────────────────────────────

function SessionBody({ session }: { session: TLPLiveSessionDetail }) {
  const [registerState, setRegisterState] = useState<RegisterState>({ kind: 'idle' });
  const [reminderPref, setReminderPref] = useState<'all' | 'day_of' | 'none'>('all');

  async function handleRegister() {
    setRegisterState({ kind: 'registering' });
    try {
      const result = await registerForSession(session.code, reminderPref);
      setRegisterState({ kind: 'registered', result });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403) {
        setRegisterState({ kind: 'auth_required' });
      } else {
        setRegisterState({
          kind: 'error',
          message: 'Registration failed. Please try again.',
        });
      }
    }
  }

  async function handleJoinClick() {
    const url = safeUrl(session.external_join_url);
    if (!url) return;
    // Fire-and-forget: record click then open
    try {
      const res = await recordJoinClick(session.code);
      const resolvedUrl = safeUrl(res.external_join_url) ?? url;
      window.open(resolvedUrl, '_blank', 'noopener,noreferrer');
    } catch {
      // On error, still open with the URL we already have
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  const isDraftOrSubmitted = ['draft', 'submitted'].includes(session.status);
  const isApprovedOrScheduled = ['approved', 'scheduled'].includes(session.status);
  const isLive = session.status === 'live';
  const isCompleted = session.status === 'completed';
  const isCancelled = session.status === 'cancelled';

  return (
    <div>
      {/* Session type + platform badges */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.05em',
          color: 'var(--kalpx-gold)',
          background: 'var(--kalpx-chip-bg)',
          border: '1px solid var(--kalpx-border-gold)',
          borderRadius: 4,
          padding: '3px 10px',
        }}>
          {sessionTypeLabel(session.session_type)}
        </span>
        {isLive && (
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: '#fff',
            background: '#e53935',
            borderRadius: 4,
            padding: '3px 10px',
          }}>
            LIVE NOW
          </span>
        )}
        <span style={{
          fontSize: 11,
          color: 'var(--kalpx-text-muted)',
          border: '1px solid var(--kalpx-border)',
          borderRadius: 4,
          padding: '3px 10px',
        }}>
          {platformLabel(session.external_platform)}
        </span>
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: 22,
        fontWeight: 700,
        color: 'var(--kalpx-text)',
        marginBottom: 20,
        lineHeight: 1.35,
      }}>
        {session.title}
      </h1>

      {/* Guide card */}
      <GuideCard
        name={session.guide_name}
        bio={session.guide_bio}
        photoUrl={session.guide_photo_url}
      />

      {/* Meta grid */}
      <section
        aria-label="Session details"
        style={{
          background: 'var(--kalpx-card-bg)',
          border: '1px solid var(--kalpx-border)',
          borderRadius: 'var(--kalpx-r-lg)',
          padding: '16px 20px',
          marginBottom: 24,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px 24px',
        }}
      >
        <MetaRow label="When" value={formatScheduledAt(session.scheduled_at, session.timezone)} />
        <MetaRow label="Duration" value={`${session.duration_minutes} minutes`} />
        <MetaRow label="Language" value={session.language} />
        <MetaRow label="Platform" value={platformLabel(session.external_platform)} />
        {session.capacity !== null && (
          <MetaRow label="Capacity" value={`${session.capacity} seats`} />
        )}
      </section>

      {/* Description */}
      {session.description && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--kalpx-text)', marginBottom: 8 }}>
            About this session
          </h2>
          <p style={{ fontSize: 14, color: 'var(--kalpx-text-soft)', lineHeight: 1.7 }}>
            {session.description}
          </p>
        </section>
      )}

      {/* ── Status-driven CTA ── */}

      {/* Draft / submitted */}
      {isDraftOrSubmitted && (
        <PendingBanner />
      )}

      {/* Approved / scheduled — register */}
      {isApprovedOrScheduled && session.registration_enabled && (
        <RegisterBlock
          registerState={registerState}
          reminderPref={reminderPref}
          onReminderChange={setReminderPref}
          onRegister={handleRegister}
        />
      )}
      {isApprovedOrScheduled && !session.registration_enabled && (
        <InfoBanner message="Registration is not required for this session. Join directly when it starts." />
      )}

      {/* Live — join */}
      {isLive && safeUrl(session.external_join_url) && (
        <section style={{ marginBottom: 24 }}>
          <button
            onClick={handleJoinClick}
            style={primaryButtonStyle}
            aria-label="Join this live session now"
          >
            Join Now →
          </button>
        </section>
      )}
      {isLive && !safeUrl(session.external_join_url) && (
        <InfoBanner message="The join link will appear here once the session goes live." />
      )}

      {/* Completed */}
      {isCompleted && (
        <section style={{ marginBottom: 24 }}>
          {safeUrl(session.recording_url) ? (
            <a
              href={safeUrl(session.recording_url)!}
              target="_blank"
              rel="noopener noreferrer"
              style={outlineButtonStyle}
              aria-label="Watch the recording of this session"
            >
              Watch Recording →
            </a>
          ) : (
            <InfoBanner message="This session is complete. Recording not available." />
          )}
        </section>
      )}

      {/* Cancelled */}
      {isCancelled && (
        <div
          role="alert"
          style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: 'var(--kalpx-r-md)',
            padding: '12px 16px',
            fontSize: 14,
            color: '#991b1b',
            marginBottom: 24,
          }}
        >
          This session has been cancelled.
        </div>
      )}

      {/* Support link */}
      {safeUrl(session.support_contact_url) && (
        <section
          style={{
            borderTop: '1px solid var(--kalpx-border)',
            paddingTop: 20,
            marginBottom: 20,
          }}
        >
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--kalpx-text)', marginBottom: 8 }}>
            Need help?
          </p>
          <a
            href={safeUrl(session.support_contact_url)!}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--kalpx-gold)', fontSize: 14, textDecoration: 'underline' }}
          >
            Contact support →
          </a>
        </section>
      )}
    </div>
  );
}

// ── Guide card ────────────────────────────────────────────────────────────────

function GuideCard({
  name,
  bio,
  photoUrl,
}: {
  name: string;
  bio: string | null;
  photoUrl: string | null;
}) {
  const safePhoto = safeUrl(photoUrl);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
      marginBottom: 24,
      padding: '16px 20px',
      background: 'var(--kalpx-parchment)',
      borderRadius: 'var(--kalpx-r-lg)',
    }}>
      {/* Avatar */}
      {safePhoto ? (
        <img
          src={safePhoto}
          alt={`${name} photo`}
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            objectFit: 'cover',
            flexShrink: 0,
            border: '2px solid var(--kalpx-border-gold)',
          }}
        />
      ) : (
        <div style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'var(--kalpx-chip-bg)',
          border: '1px solid var(--kalpx-border-gold)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: 22,
          color: 'var(--kalpx-gold)',
          fontWeight: 700,
        }}>
          {name.charAt(0).toUpperCase()}
        </div>
      )}

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 11, color: 'var(--kalpx-text-muted)', letterSpacing: '0.04em', marginBottom: 2 }}>
          GUIDE
        </p>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--kalpx-text)', marginBottom: bio ? 6 : 0 }}>
          {name}
        </p>
        {bio && (
          <p style={{ fontSize: 13, color: 'var(--kalpx-text-soft)', lineHeight: 1.6 }}>
            {bio}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Register block ────────────────────────────────────────────────────────────

function RegisterBlock({
  registerState,
  reminderPref,
  onReminderChange,
  onRegister,
}: {
  registerState: RegisterState;
  reminderPref: 'all' | 'day_of' | 'none';
  onReminderChange: (pref: 'all' | 'day_of' | 'none') => void;
  onRegister: () => void;
}) {
  // Registered confirmation
  if (registerState.kind === 'registered') {
    return (
      <div
        role="status"
        style={{
          background: 'var(--kalpx-chip-bg)',
          border: '1px solid var(--kalpx-border-gold)',
          borderRadius: 'var(--kalpx-r-lg)',
          padding: '20px 24px',
          marginBottom: 24,
        }}
      >
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--kalpx-text)', marginBottom: 8 }}>
          You&apos;re registered!
        </p>
        <p style={{ fontSize: 14, color: 'var(--kalpx-text-soft)', lineHeight: 1.6, marginBottom: 16 }}>
          {registerState.result.already_registered
            ? 'You were already registered for this session.'
            : "We'll remind you before the session starts."}
        </p>
        {/* Reminder preference selector (post-registration) */}
        <ReminderSelector
          value={reminderPref}
          onChange={onReminderChange}
          label="Change reminder preference"
        />
      </div>
    );
  }

  // Auth required
  if (registerState.kind === 'auth_required') {
    return (
      <div
        role="alert"
        style={{
          background: 'var(--kalpx-card-bg)',
          border: '1px solid var(--kalpx-border)',
          borderRadius: 'var(--kalpx-r-lg)',
          padding: '20px 24px',
          marginBottom: 24,
        }}
      >
        <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--kalpx-text)', marginBottom: 12 }}>
          Sign in to register
        </p>
        <Link
          to="/login"
          style={primaryButtonStyle}
          aria-label="Sign in to register for this session"
        >
          Sign In →
        </Link>
      </div>
    );
  }

  return (
    <section style={{ marginBottom: 24 }}>
      {/* Reminder preference */}
      <div style={{ marginBottom: 16 }}>
        <ReminderSelector
          value={reminderPref}
          onChange={onReminderChange}
          label="Reminder preference"
        />
      </div>

      {/* Register button */}
      <button
        onClick={onRegister}
        disabled={registerState.kind === 'registering'}
        style={{
          ...primaryButtonStyle,
          opacity: registerState.kind === 'registering' ? 0.7 : 1,
          cursor: registerState.kind === 'registering' ? 'not-allowed' : 'pointer',
        }}
        aria-label="Register for this session"
      >
        {registerState.kind === 'registering' ? 'Registering…' : 'Register for Session'}
      </button>

      {/* Error */}
      {registerState.kind === 'error' && (
        <p
          role="alert"
          style={{ fontSize: 13, color: '#b91c1c', marginTop: 10 }}
        >
          {registerState.message}
        </p>
      )}
    </section>
  );
}

function ReminderSelector({
  value,
  onChange,
  label,
}: {
  value: 'all' | 'day_of' | 'none';
  onChange: (v: 'all' | 'day_of' | 'none') => void;
  label: string;
}) {
  const id = 'reminder-pref';
  return (
    <div>
      <label
        htmlFor={id}
        style={{ fontSize: 12, color: 'var(--kalpx-text-muted)', letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}
      >
        {label.toUpperCase()}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as 'all' | 'day_of' | 'none')}
        style={{
          fontSize: 14,
          color: 'var(--kalpx-text)',
          background: 'var(--kalpx-card-bg)',
          border: '1px solid var(--kalpx-border)',
          borderRadius: 'var(--kalpx-r-md)',
          padding: '8px 12px',
          minWidth: 260,
          cursor: 'pointer',
        }}
      >
        {(Object.keys(REMINDER_LABELS) as Array<'all' | 'day_of' | 'none'>).map((key) => (
          <option key={key} value={key}>
            {REMINDER_LABELS[key]}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Small reusable components ─────────────────────────────────────────────────

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: 'var(--kalpx-text-muted)', letterSpacing: '0.04em', marginBottom: 2 }}>
        {label.toUpperCase()}
      </p>
      <p style={{ fontSize: 14, color: 'var(--kalpx-text)', fontWeight: 500 }}>{value}</p>
    </div>
  );
}

function PendingBanner() {
  return (
    <div
      role="status"
      style={{
        background: 'var(--kalpx-chip-bg)',
        border: '1px solid var(--kalpx-border)',
        borderRadius: 'var(--kalpx-r-md)',
        padding: '12px 16px',
        fontSize: 14,
        color: 'var(--kalpx-text-soft)',
        marginBottom: 24,
      }}
    >
      This session is pending approval and will open for registration shortly.
    </div>
  );
}

function InfoBanner({ message }: { message: string }) {
  return (
    <div style={{
      background: 'var(--kalpx-chip-bg)',
      border: '1px solid var(--kalpx-border)',
      borderRadius: 'var(--kalpx-r-md)',
      padding: '12px 16px',
      fontSize: 14,
      color: 'var(--kalpx-text-soft)',
      marginBottom: 24,
    }}>
      {message}
    </div>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const primaryButtonStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '11px 24px',
  background: 'var(--kalpx-gold)',
  color: '#fff',
  border: 'none',
  borderRadius: 'var(--kalpx-r-md)',
  fontWeight: 600,
  fontSize: 15,
  cursor: 'pointer',
  textDecoration: 'none',
};

const outlineButtonStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '11px 24px',
  background: 'transparent',
  color: 'var(--kalpx-gold)',
  border: '1px solid var(--kalpx-gold)',
  borderRadius: 'var(--kalpx-r-md)',
  fontWeight: 600,
  fontSize: 15,
  cursor: 'pointer',
  textDecoration: 'none',
};
