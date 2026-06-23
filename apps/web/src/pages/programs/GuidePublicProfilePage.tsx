import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AppShell } from '../../components/ui/AppShell';
import { GuideChip } from '../../components/GuideChip';
import { fetchGuidePublicProfile, type GuidePublicProfile } from '../../engine/liveSessionApi';

type LoadState =
  | { kind: 'loading' }
  | { kind: 'loaded'; guide: GuidePublicProfile }
  | { kind: 'not_found' }
  | { kind: 'error' };

const GUIDE_TYPE_LABELS: Record<string, string> = {
  yoga: 'Yoga / Pranayama',
  ayurveda: 'Ayurveda',
  gita: 'Gita Teacher',
  meditation: 'Meditation / Dhyaan',
  satsang: 'Satsang Leader',
  temple: 'Temple / Priest',
  parent: 'Parent / NRI Group',
  general: 'General Wellness',
  other: 'Guide',
};

function guideTypeLabel(type: string) {
  return GUIDE_TYPE_LABELS[type] ?? type;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function GuidePublicProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [state, setState] = useState<LoadState>({ kind: 'loading' });

  useEffect(() => {
    if (!slug) { setState({ kind: 'not_found' }); return; }
    document.title = 'Guide Profile — KalpX';
    let cancelled = false;
    async function load() {
      try {
        const guide = await fetchGuidePublicProfile(slug!);
        if (!cancelled) {
          document.title = `${guide.display_name} — KalpX`;
          setState({ kind: 'loaded', guide });
        }
      } catch (e: any) {
        if (!cancelled) {
          setState(e?.response?.status === 404 ? { kind: 'not_found' } : { kind: 'error' });
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [slug]);

  return (
    <AppShell>
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px 80px' }}>
        {state.kind === 'loading' && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--kalpx-text-muted)' }}>
            Loading…
          </div>
        )}

        {state.kind === 'not_found' && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: 'var(--kalpx-text-muted)', marginBottom: 16 }}>Guide not found.</p>
            <Link to="/programs/" style={{ color: 'var(--kalpx-gold)', fontSize: 14 }}>
              ← Browse programs
            </Link>
          </div>
        )}

        {state.kind === 'error' && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--kalpx-text-muted)' }}>
            Something went wrong. Please try again.
          </div>
        )}

        {state.kind === 'loaded' && (() => {
          const { guide } = state;
          return (
            <>
              {/* Back */}
              <Link
                to="/programs/"
                style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', display: 'block', marginBottom: 24 }}
              >
                ← Programs
              </Link>

              {/* Hero */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
                {guide.photo_url ? (
                  <img
                    src={guide.photo_url}
                    alt={guide.display_name}
                    style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover',
                      border: '2px solid var(--kalpx-border-gold)', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--kalpx-gold)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {guide.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--kalpx-text)',
                    margin: '0 0 4px' }}>
                    {guide.display_name}
                  </h1>
                  <p style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', margin: '0 0 6px' }}>
                    {guideTypeLabel(guide.guide_type)}
                    {guide.city ? ` · ${guide.city}` : ''}
                  </p>
                  {guide.languages.length > 0 && (
                    <p style={{ fontSize: 12, color: 'var(--kalpx-text-soft)', margin: 0 }}>
                      {guide.languages.map(l => l.toUpperCase()).join(' · ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Bio */}
              {guide.bio && (
                <section style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--kalpx-text-soft)', margin: 0 }}>
                    {guide.bio}
                  </p>
                </section>
              )}

              {/* Topics */}
              {guide.topics.length > 0 && (
                <section style={{ marginBottom: 24 }}>
                  <p style={{ fontSize: 11, letterSpacing: '0.05em', color: 'var(--kalpx-text-muted)',
                    marginBottom: 8, fontWeight: 600 }}>
                    TOPICS
                  </p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {guide.topics.map(t => (
                      <span key={t} style={{ fontSize: 12, padding: '3px 10px',
                        background: 'var(--kalpx-chip-bg)', border: '1px solid var(--kalpx-border)',
                        borderRadius: 12, color: 'var(--kalpx-text)' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Programs */}
              {guide.programs.length > 0 && (
                <section style={{ marginBottom: 28 }}>
                  <p style={{ fontSize: 11, letterSpacing: '0.05em', color: 'var(--kalpx-text-muted)',
                    marginBottom: 12, fontWeight: 600 }}>
                    PROGRAMS
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {guide.programs.map(p => (
                      <Link key={p.code} to={`/programs/${p.slug}`}
                        style={{ display: 'block', textDecoration: 'none',
                          padding: '12px 14px',
                          background: 'var(--kalpx-surface)',
                          border: '1px solid var(--kalpx-border)',
                          borderRadius: 10 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--kalpx-text)',
                          margin: '0 0 4px' }}>
                          {p.name}
                        </p>
                        {p.duration_days && (
                          <p style={{ fontSize: 12, color: 'var(--kalpx-text-muted)', margin: 0 }}>
                            {p.duration_days}-day program
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Upcoming sessions */}
              {guide.upcoming_sessions.length > 0 && (
                <section>
                  <p style={{ fontSize: 11, letterSpacing: '0.05em', color: 'var(--kalpx-text-muted)',
                    marginBottom: 12, fontWeight: 600 }}>
                    UPCOMING SESSIONS
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {guide.upcoming_sessions.map(s => (
                      <Link key={s.code} to={`/live-sessions/${s.code}/`}
                        style={{ display: 'block', textDecoration: 'none',
                          padding: '12px 14px',
                          background: 'var(--kalpx-surface)',
                          border: '1px solid var(--kalpx-border)',
                          borderRadius: 10 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--kalpx-text)',
                          margin: '0 0 4px' }}>
                          {s.title}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--kalpx-text-muted)', margin: 0 }}>
                          {formatDate(s.scheduled_at)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {guide.programs.length === 0 && guide.upcoming_sessions.length === 0 && (
                <p style={{ fontSize: 14, color: 'var(--kalpx-text-muted)', textAlign: 'center',
                  padding: '24px 0' }}>
                  No programs or sessions listed yet.
                </p>
              )}
            </>
          );
        })()}
      </main>
    </AppShell>
  );
}
