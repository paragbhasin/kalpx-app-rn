import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/ui/AppShell';
import { fetchPrograms, type TLPProgram } from '../../engine/liveSessionApi';

type LoadState =
  | { kind: 'loading' }
  | { kind: 'loaded'; programs: TLPProgram[]; count: number }
  | { kind: 'empty' }
  | { kind: 'error' };

function formatDuration(days: number): string {
  return `${days} Day${days !== 1 ? 's' : ''}`;
}

function formatStartDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function ProgramsDiscoveryPage() {
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { programs, count } = await fetchPrograms();
        if (cancelled) return;
        if (programs.length === 0) {
          setState({ kind: 'empty' });
        } else {
          setState({ kind: 'loaded', programs, count });
        }
      } catch {
        if (!cancelled) setState({ kind: 'error' });
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <AppShell>
      <main
        role="main"
        style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px 80px' }}
      >
        {/* Page header */}
        <header style={{ marginBottom: 28 }}>
          <p style={{
            fontSize: 12,
            color: 'var(--kalpx-text-muted)',
            marginBottom: 8,
            letterSpacing: '0.04em',
          }}>
            PRACTICE PROGRAMS
          </p>
          <h1 style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--kalpx-text)',
            marginBottom: 8,
            lineHeight: 1.3,
          }}>
            Explore Programs
          </h1>
          <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14, lineHeight: 1.6 }}>
            Guided practice journeys offered by trusted leaders.
          </p>
        </header>

        {/* States */}
        {state.kind === 'loading' && <LoadingState />}
        {state.kind === 'error' && <ErrorState />}
        {state.kind === 'empty' && <EmptyState />}
        {state.kind === 'loaded' && (
          <ProgramList programs={state.programs} onJoin={(code) => navigate(`/join/${code}`)} />
        )}
      </main>
    </AppShell>
  );
}

// ── Loading ───────────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div style={{ textAlign: 'center', paddingTop: 80 }} aria-busy="true" aria-label="Loading programs">
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid var(--kalpx-border)',
        borderTopColor: 'var(--kalpx-gold)',
        animation: 'spin 0.8s linear infinite',
        margin: '0 auto 16px',
      }} />
      <p style={{ color: 'var(--kalpx-text-muted)', fontSize: 14 }}>Loading programs…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Error ─────────────────────────────────────────────────────────────────────

function ErrorState() {
  return (
    <div style={{ textAlign: 'center', paddingTop: 80 }}>
      <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Something went wrong</p>
      <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14 }}>
        Please refresh the page or{' '}
        <a href="https://kalpx.com/support" style={{ color: 'var(--kalpx-gold)' }}>contact support</a>.
      </p>
    </div>
  );
}

// ── Empty ─────────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', paddingTop: 80 }}>
      <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>No programs available right now</p>
      <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14, lineHeight: 1.6 }}>
        Check back soon — new programs are added regularly.
      </p>
    </div>
  );
}

// ── Program list ──────────────────────────────────────────────────────────────

function ProgramList({
  programs,
  onJoin,
}: {
  programs: TLPProgram[];
  onJoin: (code: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {programs.map((program) => (
        <ProgramCard key={program.code} program={program} onJoin={onJoin} />
      ))}
    </div>
  );
}

function ProgramCard({
  program,
  onJoin,
}: {
  program: TLPProgram;
  onJoin: (code: string) => void;
}) {
  const startDateLabel = formatStartDate(program.start_date);

  return (
    <article
      style={{
        background: 'var(--kalpx-card-bg)',
        border: '1px solid var(--kalpx-border-gold)',
        borderRadius: 'var(--kalpx-r-lg)',
        padding: '20px 24px',
      }}
    >
      {/* Leader / community tag */}
      <p style={{
        fontSize: 11,
        color: 'var(--kalpx-text-muted)',
        letterSpacing: '0.05em',
        marginBottom: 6,
        textTransform: 'uppercase',
      }}>
        {program.community_name || program.leader_name}
      </p>

      {/* Program name */}
      <h2 style={{
        fontSize: 17,
        fontWeight: 600,
        color: 'var(--kalpx-text)',
        marginBottom: 6,
        lineHeight: 1.4,
      }}>
        {program.name}
      </h2>

      {/* Description */}
      {program.description && (
        <p style={{
          fontSize: 13,
          color: 'var(--kalpx-text-soft)',
          lineHeight: 1.6,
          marginBottom: 14,
        }}>
          {program.description}
        </p>
      )}

      {/* Meta row */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px 16px',
        marginBottom: 16,
      }}>
        <MetaChip label="Leader" value={program.leader_name} />
        <MetaChip label="Duration" value={formatDuration(program.duration_days)} />
        {startDateLabel && <MetaChip label="Starts" value={startDateLabel} />}
      </div>

      {/* Join button */}
      <button
        onClick={() => onJoin(program.code)}
        aria-label={`Join ${program.name}`}
        style={{
          display: 'inline-block',
          padding: '10px 22px',
          background: 'var(--kalpx-gold)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--kalpx-r-md)',
          fontWeight: 600,
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        Join Program →
      </button>
    </article>
  );
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <span style={{ fontSize: 13, color: 'var(--kalpx-text-soft)' }}>
      <span style={{ color: 'var(--kalpx-text-muted)', fontSize: 11, letterSpacing: '0.04em' }}>
        {label.toUpperCase()}
      </span>{' '}
      <span style={{ fontWeight: 500, color: 'var(--kalpx-text)' }}>{value}</span>
    </span>
  );
}
