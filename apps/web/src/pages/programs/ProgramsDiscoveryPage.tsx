import React, { useEffect, useState } from 'react';
import { AppShell } from '../../components/ui/AppShell';
import { fetchPrograms, type TLPProgram } from '../../engine/liveSessionApi';
import { ProgramCard } from '../../components/ProgramCard';

// ── Types ─────────────────────────────────────────────────────────────────────

type LoadState =
  | { kind: 'loading' }
  | { kind: 'loaded'; programs: TLPProgram[]; count: number }
  | { kind: 'empty' }
  | { kind: 'error' };

type Category = 'all' | 'Meditation' | 'Yoga' | 'Gita' | 'Family' | 'Festival' | 'Ayurveda';
type Language = 'all' | 'Hindi' | 'English';

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'Meditation', label: 'Meditation' },
  { key: 'Yoga', label: 'Yoga' },
  { key: 'Gita', label: 'Gita' },
  { key: 'Family', label: 'Family' },
  { key: 'Festival', label: 'Festival' },
  { key: 'Ayurveda', label: 'Ayurveda' },
];

const LANGUAGES: { key: Language; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'Hindi', label: 'Hindi' },
  { key: 'English', label: 'English' },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export function ProgramsDiscoveryPage() {
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('all');

  // SEO
  useEffect(() => {
    document.title = 'Programs — KalpX';
  }, []);

  // Fetch programs whenever filters change
  useEffect(() => {
    let cancelled = false;
    setState({ kind: 'loading' });
    async function load() {
      try {
        const { programs, count } = await fetchPrograms({
          category: selectedCategory,
          language: selectedLanguage,
        });
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
    return () => {
      cancelled = true;
    };
  }, [selectedCategory, selectedLanguage]);

  const hasActiveFilter = selectedCategory !== 'all' || selectedLanguage !== 'all';

  return (
    <AppShell>
      <main
        role="main"
        style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px 80px' }}
      >
        {/* Page header */}
        <header style={{ marginBottom: 24 }}>
          <p
            style={{
              fontSize: 12,
              color: 'var(--kalpx-text-muted)',
              marginBottom: 8,
              letterSpacing: '0.04em',
            }}
          >
            PRACTICE PROGRAMS
          </p>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--kalpx-text)',
              marginBottom: 8,
              lineHeight: 1.3,
            }}
          >
            Guided Practice. Every Day.
          </h1>
          <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14, lineHeight: 1.6 }}>
            Multi-day practice journeys offered by trusted guides — for every path.
          </p>
        </header>

        {/* Category filter chips */}
        <div
          role="group"
          aria-label="Filter by category"
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            marginBottom: 12,
          }}
        >
          {CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              role="button"
              aria-pressed={selectedCategory === key}
              onClick={() => setSelectedCategory(key)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border:
                  selectedCategory === key
                    ? '1px solid var(--kalpx-gold)'
                    : '1px solid var(--kalpx-border)',
                background: selectedCategory === key ? 'var(--kalpx-chip-bg)' : 'transparent',
                color:
                  selectedCategory === key ? 'var(--kalpx-gold)' : 'var(--kalpx-text-soft)',
                fontWeight: selectedCategory === key ? 600 : 400,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Language toggle */}
        <div
          role="group"
          aria-label="Filter by language"
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 28,
          }}
        >
          {LANGUAGES.map(({ key, label }) => (
            <button
              key={key}
              role="button"
              aria-pressed={selectedLanguage === key}
              onClick={() => setSelectedLanguage(key)}
              style={{
                padding: '5px 14px',
                borderRadius: 'var(--kalpx-r-md)',
                border:
                  selectedLanguage === key
                    ? '1px solid var(--kalpx-gold)'
                    : '1px solid var(--kalpx-border)',
                background: selectedLanguage === key ? 'var(--kalpx-chip-bg)' : 'transparent',
                color:
                  selectedLanguage === key ? 'var(--kalpx-gold)' : 'var(--kalpx-text-soft)',
                fontWeight: selectedLanguage === key ? 600 : 400,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* States */}
        {state.kind === 'loading' && <LoadingState />}
        {state.kind === 'error' && <ErrorState />}
        {state.kind === 'empty' && <EmptyState filtered={hasActiveFilter} />}
        {state.kind === 'loaded' && (
          <ProgramList programs={state.programs} />
        )}
      </main>
    </AppShell>
  );
}

// ── States ────────────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div style={{ textAlign: 'center', paddingTop: 80 }} aria-busy="true" aria-label="Loading programs">
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '3px solid var(--kalpx-border)',
          borderTopColor: 'var(--kalpx-gold)',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
        }}
      />
      <p style={{ color: 'var(--kalpx-text-muted)', fontSize: 14 }}>Loading programs…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function ErrorState() {
  return (
    <div style={{ textAlign: 'center', paddingTop: 80 }}>
      <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Something went wrong</p>
      <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14 }}>
        Please refresh the page or{' '}
        <a href="https://kalpx.com/support" style={{ color: 'var(--kalpx-gold)' }}>
          contact support
        </a>
        .
      </p>
    </div>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 80 }}>
      <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
        {filtered ? 'No programs found in this category.' : 'No programs available right now'}
      </p>
      {!filtered && (
        <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14, lineHeight: 1.6 }}>
          Check back soon — new programs are added regularly.
        </p>
      )}
    </div>
  );
}

// ── Program list ──────────────────────────────────────────────────────────────

function ProgramList({ programs }: { programs: TLPProgram[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {programs.map((program) => (
        <ProgramCard
          key={program.code}
          code={program.code}
          slug={program.slug}
          title={program.name}
          programType={program.program_type}
          category={program.category}
          language={program.language}
          durationDays={program.duration_days}
          startMode={null}
          guide={
            program.guide
              ? {
                  displayName: program.guide.display_name,
                  photoUrl: program.guide.photo_url,
                  guideType: program.guide.guide_type,
                }
              : null
          }
          joinedCount={program.joined_count}
          programPromise={program.program_promise}
          featuredOrder={program.featured_order}
        />
      ))}
    </div>
  );
}
