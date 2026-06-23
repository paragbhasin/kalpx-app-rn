import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/ui/AppShell';
import { fetchLiveSessions, type TLPLiveSession } from '../../engine/liveSessionApi';

type LoadState =
  | { kind: 'loading' }
  | { kind: 'loaded'; sessions: TLPLiveSession[] }
  | { kind: 'empty' }
  | { kind: 'error' };

type FilterTab = 'all' | 'upcoming' | 'recurring';

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

function formatScheduledAt(dateStr: string, timezone: string): string {
  try {
    const d = new Date(dateStr);
    const label = d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: timezone,
    });
    const time = d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone,
    });
    // Derive short timezone abbreviation heuristically from the timezone string
    const tzShort = timezone.includes('Kolkata') || timezone.includes('Asia/Calcutta')
      ? 'IST'
      : timezone.split('/').pop()?.replace(/_/g, ' ') ?? timezone;
    return `${label} · ${time} ${tzShort}`;
  } catch {
    return dateStr;
  }
}

function sessionTypeLabel(type: string): string {
  return SESSION_TYPE_LABELS[type.toLowerCase()] ?? type;
}

function platformLabel(platform: string): string {
  return PLATFORM_LABELS[platform.toLowerCase()] ?? platform;
}

function isUpcoming(session: TLPLiveSession): boolean {
  return ['approved', 'scheduled', 'live'].includes(session.status);
}

function isRecurring(session: TLPLiveSession): boolean {
  return session.recurrence_type !== 'none' && session.recurrence_type !== 'one_time';
}

export function LiveSessionsListPage() {
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Live Sessions — KalpX';
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { sessions } = await fetchLiveSessions();
        if (cancelled) return;
        if (sessions.length === 0) {
          setState({ kind: 'empty' });
        } else {
          setState({ kind: 'loaded', sessions });
        }
      } catch {
        if (!cancelled) setState({ kind: 'error' });
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filteredSessions =
    state.kind === 'loaded'
      ? state.sessions.filter((s) => {
          if (activeTab === 'upcoming') return isUpcoming(s);
          if (activeTab === 'recurring') return isRecurring(s);
          return true;
        })
      : [];

  return (
    <AppShell>
      <main
        role="main"
        style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px 80px' }}
      >
        {/* Page header */}
        <header style={{ marginBottom: 24 }}>
          <p style={{
            fontSize: 12,
            color: 'var(--kalpx-text-muted)',
            marginBottom: 8,
            letterSpacing: '0.04em',
          }}>
            LIVE SESSIONS
          </p>
          <h1 style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--kalpx-text)',
            marginBottom: 8,
            lineHeight: 1.3,
          }}>
            Upcoming Sessions
          </h1>
          <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14, lineHeight: 1.6 }}>
            Join live practice sessions with trusted guides.
          </p>
        </header>

        {/* Filter tabs (only when loaded with data) */}
        {state.kind === 'loaded' && (
          <FilterTabs active={activeTab} onChange={setActiveTab} />
        )}

        {/* States */}
        {state.kind === 'loading' && <LoadingState />}
        {state.kind === 'error' && <ErrorState />}
        {state.kind === 'empty' && <EmptyState />}
        {state.kind === 'loaded' && filteredSessions.length === 0 && (
          <EmptyFilterState tab={activeTab} />
        )}
        {state.kind === 'loaded' && filteredSessions.length > 0 && (
          <SessionList
            sessions={filteredSessions}
            onOpen={(code) => navigate(`/live-sessions/${code}/`)}
          />
        )}
      </main>
    </AppShell>
  );
}

// ── Filter tabs ───────────────────────────────────────────────────────────────

function FilterTabs({
  active,
  onChange,
}: {
  active: FilterTab;
  onChange: (tab: FilterTab) => void;
}) {
  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'recurring', label: 'Recurring' },
  ];

  return (
    <div
      role="tablist"
      aria-label="Filter sessions"
      style={{ display: 'flex', gap: 8, marginBottom: 24 }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={active === tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            padding: '7px 16px',
            borderRadius: 'var(--kalpx-r-md)',
            border: active === tab.key
              ? '1px solid var(--kalpx-gold)'
              : '1px solid var(--kalpx-border)',
            background: active === tab.key ? 'var(--kalpx-chip-bg)' : 'transparent',
            color: active === tab.key ? 'var(--kalpx-gold)' : 'var(--kalpx-text-soft)',
            fontWeight: active === tab.key ? 600 : 400,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ── States ────────────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div style={{ textAlign: 'center', paddingTop: 80 }} aria-busy="true" aria-label="Loading sessions">
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid var(--kalpx-border)',
        borderTopColor: 'var(--kalpx-gold)',
        animation: 'spin 0.8s linear infinite',
        margin: '0 auto 16px',
      }} />
      <p style={{ color: 'var(--kalpx-text-muted)', fontSize: 14 }}>Loading sessions…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', paddingTop: 80 }}>
      <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>No sessions scheduled</p>
      <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14, lineHeight: 1.6 }}>
        Check back soon — sessions are announced regularly.
      </p>
    </div>
  );
}

function EmptyFilterState({ tab }: { tab: FilterTab }) {
  const messages: Record<FilterTab, string> = {
    all: 'No sessions available.',
    upcoming: 'No upcoming sessions right now.',
    recurring: 'No recurring sessions found.',
  };
  return (
    <div style={{ textAlign: 'center', paddingTop: 48 }}>
      <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14 }}>{messages[tab]}</p>
    </div>
  );
}

// ── Session list and card ─────────────────────────────────────────────────────

function SessionList({
  sessions,
  onOpen,
}: {
  sessions: TLPLiveSession[];
  onOpen: (code: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {sessions.map((session) => (
        <SessionCard key={session.code} session={session} onOpen={onOpen} />
      ))}
    </div>
  );
}

function SessionCard({
  session,
  onOpen,
}: {
  session: TLPLiveSession;
  onOpen: (code: string) => void;
}) {
  const isLive = session.status === 'live';
  const isCompleted = session.status === 'completed';
  const isCancelled = session.status === 'cancelled';

  return (
    <article
      style={{
        background: 'var(--kalpx-card-bg)',
        border: `1px solid ${isLive ? 'var(--kalpx-gold)' : 'var(--kalpx-border)'}`,
        borderRadius: 'var(--kalpx-r-lg)',
        padding: '18px 20px',
        opacity: isCancelled ? 0.6 : 1,
      }}
    >
      {/* Status / type badges row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.05em',
          color: 'var(--kalpx-gold)',
          background: 'var(--kalpx-chip-bg)',
          border: '1px solid var(--kalpx-border-gold)',
          borderRadius: 4,
          padding: '2px 8px',
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
            padding: '2px 8px',
          }}>
            LIVE
          </span>
        )}
        {isRecurring(session) && (
          <span style={{
            fontSize: 11,
            color: 'var(--kalpx-text-muted)',
            border: '1px solid var(--kalpx-border)',
            borderRadius: 4,
            padding: '2px 8px',
          }}>
            Recurring
          </span>
        )}
        <span style={{
          fontSize: 11,
          color: 'var(--kalpx-text-muted)',
          border: '1px solid var(--kalpx-border)',
          borderRadius: 4,
          padding: '2px 8px',
          marginLeft: 'auto',
        }}>
          {platformLabel(session.external_platform)}
        </span>
      </div>

      {/* Title */}
      <h2 style={{
        fontSize: 16,
        fontWeight: 600,
        color: 'var(--kalpx-text)',
        marginBottom: 4,
        lineHeight: 1.4,
      }}>
        {session.title}
      </h2>

      {/* Guide name */}
      <p style={{ fontSize: 13, color: 'var(--kalpx-text-soft)', marginBottom: 10 }}>
        with {session.guide_name}
      </p>

      {/* Time + duration */}
      <p style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', marginBottom: 14 }}>
        {formatScheduledAt(session.scheduled_at, session.timezone)}
        {' · '}
        {session.duration_minutes} min
      </p>

      {/* CTA */}
      {!isCancelled && (
        <button
          onClick={() => onOpen(session.code)}
          aria-label={`View details for ${session.title}`}
          style={{
            padding: '9px 20px',
            background: isLive ? 'var(--kalpx-gold)' : 'transparent',
            color: isLive ? '#fff' : 'var(--kalpx-gold)',
            border: '1px solid var(--kalpx-gold)',
            borderRadius: 'var(--kalpx-r-md)',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {isLive ? 'Join Now →' : isCompleted ? 'View Details' : 'Register →'}
        </button>
      )}
      {isCancelled && (
        <p style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', fontStyle: 'italic' }}>
          This session has been cancelled
        </p>
      )}
    </article>
  );
}
