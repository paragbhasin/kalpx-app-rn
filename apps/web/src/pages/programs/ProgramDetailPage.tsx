import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useParams, Link } from 'react-router-dom';
import { WEB_ENV } from '../../lib/env';
import { useTranslation } from '../../lib/i18n';
import { AppShell } from '../../components/ui/AppShell';
import { GuideChip } from '../../components/GuideChip';
import {
  fetchProgramDetail,
  fetchProgramTestimonials,
  type TLPProgramDetail,
  type ProgramTestimonial,
} from '../../engine/liveSessionApi';

// ── Types ─────────────────────────────────────────────────────────────────────

type LoadState =
  | { kind: 'loading' }
  | { kind: 'loaded'; program: TLPProgramDetail; testimonials: ProgramTestimonial[] }
  | { kind: 'not_found' }
  | { kind: 'error' };

// ── URL safety guard ──────────────────────────────────────────────────────────

function safeHref(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('https://') || url.startsWith('mailto:')) return url;
  return null;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ProgramDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const [state, setState] = useState<LoadState>({ kind: 'loading' });

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    async function load() {
      try {
        // Use slug as the lookup key — backend resolves slug → code
        const [program, testimonials] = await Promise.all([
          fetchProgramDetail(slug!),
          fetchProgramTestimonials(slug!).catch(() => [] as ProgramTestimonial[]),
        ]);
        if (cancelled) return;
        setState({ kind: 'loaded', program, testimonials });
        try {
          navigator.sendBeacon(
            '/api/programs/track/',
            JSON.stringify({ event: 'program_detail_viewed', campaign_code: program.code }),
          );
        } catch { /* analytics never blocks UX */ }
      } catch (err: unknown) {
        if (cancelled) return;
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) setState({ kind: 'not_found' });
        else setState({ kind: 'error' });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // SEO title + meta description
  useEffect(() => {
    if (state.kind !== 'loaded') return;
    const { program } = state;
    document.title = `${program.name} — KalpX`;
    const desc = program.program_promise
      ? program.program_promise.slice(0, 160)
      : `A ${program.duration_days}-day practice program on KalpX.`;
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = desc;
  }, [state.kind === 'loaded' ? (state as Extract<LoadState, { kind: 'loaded' }>).program.code : '']);

  return (
    <AppShell>
      <main
        role="main"
        style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px 80px' }}
      >
        <Link
          to="/programs/"
          style={{
            display: 'inline-block',
            fontSize: 13,
            color: 'var(--kalpx-text-muted)',
            marginBottom: 24,
            textDecoration: 'none',
          }}
        >
          {t('programDetail.allPrograms')}
        </Link>

        {state.kind === 'loading' && <LoadingState />}
        {state.kind === 'not_found' && <NotFoundState />}
        {state.kind === 'error' && <ErrorState />}
        {state.kind === 'loaded' && (
          <ProgramBody program={state.program} testimonials={state.testimonials} />
        )}
      </main>
    </AppShell>
  );
}

// ── Load states ───────────────────────────────────────────────────────────────

function LoadingState() {
  const { t } = useTranslation();
  return (
    <div style={{ textAlign: 'center', paddingTop: 80 }} aria-busy="true" aria-live="polite" aria-label={t('programDetail.loading')}>
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
      <p style={{ color: 'var(--kalpx-text-muted)', fontSize: 14 }}>{t('programDetail.loading')}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function NotFoundState() {
  const { t } = useTranslation();
  return (
    <div style={{ textAlign: 'center', paddingTop: 80 }}>
      <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>{t('programDetail.notFoundTitle')}</p>
      <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14 }}>
        {t('programDetail.notFoundBody')}
      </p>
    </div>
  );
}

function ErrorState() {
  const { t } = useTranslation();
  return (
    <div style={{ textAlign: 'center', paddingTop: 80 }}>
      <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>{t('programDetail.errorTitle')}</p>
      <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14 }}>
        {t('programDetail.errorBodyPrefix')}{' '}
        <a
          href="https://kalpx.com/support"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact KalpX support (opens in new tab)"
          style={{ color: 'var(--kalpx-gold)' }}
        >
          {t('programDetail.errorContactLink')}
        </a>
        .
      </p>
    </div>
  );
}

// ── Main program body ─────────────────────────────────────────────────────────

function ProgramBody({
  program,
  testimonials,
}: {
  program: TLPProgramDetail;
  testimonials: ProgramTestimonial[];
}) {
  const { t } = useTranslation();
  const [guideBioExpanded, setGuideBioExpanded] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const _qrBase = window.location.hostname === 'localhost' ? WEB_ENV.imageBaseUrl.replace('/api', '').replace(/\/$/, '') : window.location.origin;
  const qrUrl = `${_qrBase}/join/${program.code}`;
  const joinUrl = `/p/${program.slug}`;
  const deepLinkUrl = `kalpx://join/${program.code}`;
  const APPLE_APP_STORE_ID = '6755144623';
  const appStoreUrl = `https://apps.apple.com/app/kalpx/id${APPLE_APP_STORE_ID}?utm_source=kalpx&utm_medium=program_detail&utm_campaign=${program.code}`;
  const playStoreUrl = `https://play.google.com/store/apps/details?id=com.kalpx.app&utm_source=kalpx&utm_medium=program_detail&utm_campaign=${program.code}`;

  function handleCopyCode() {
    try {
      navigator.clipboard.writeText(program.code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      // clipboard API unavailable
    }
  }

  const guideName = program.guide?.display_name ?? 'KalpX';
  const guideType = program.guide?.guide_type;
  const guidePhoto = program.guide?.photo_url ?? null;
  const guideBio = program.guide?.bio ?? null;
  const guideTopics = program.guide?.topics ?? [];

  const bioTruncated =
    guideBio && guideBio.length > 300 && !guideBioExpanded
      ? `${guideBio.slice(0, 300)}…`
      : guideBio;

  const supportHref = safeHref(program.support_contact_url);

  // Only approved testimonials with consent are shown (backend should filter,
  // but we guard here too). Max 3.
  const visibleTestimonials = testimonials.slice(0, 3);

  return (
    <div>
      {/* ── Hero ── */}
      <header style={{ marginBottom: 28 }}>
        {/* Guide photo (if available) */}
        {guidePhoto && safeHref(guidePhoto) && (
          <img
            src={safeHref(guidePhoto)!}
            alt={`${guideName} photo`}
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              objectFit: 'cover',
              marginBottom: 16,
              border: '2px solid var(--kalpx-border-gold)',
            }}
          />
        )}

        <p
          style={{
            fontSize: 12,
            color: 'var(--kalpx-text-muted)',
            marginBottom: 6,
            letterSpacing: '0.04em',
          }}
        >
          {program.program_type ? program.program_type.toUpperCase() : t('programDetail.defaultProgramType')}
        </p>

        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--kalpx-text)',
            marginBottom: 10,
            lineHeight: 1.35,
          }}
        >
          {program.name}
        </h1>

        <p style={{ fontSize: 14, color: 'var(--kalpx-text-soft)', lineHeight: 1.6 }}>
          {t('programDetail.heroDays').replace('{days}', String(program.duration_days)).replace('{guide}', guideName)}
        </p>
      </header>

      {/* ── Program Promise ── */}
      {program.program_promise && (
        <section style={{ marginBottom: 28 }}>
          <h2
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--kalpx-text)',
              marginBottom: 10,
            }}
          >
            {t('programDetail.whatToExpect')}
          </h2>
          <p
            style={{
              fontSize: 14,
              color: 'var(--kalpx-text-soft)',
              lineHeight: 1.7,
              fontStyle: 'italic',
            }}
          >
            {program.program_promise}
          </p>
        </section>
      )}

      {/* ── Day Overview ── */}
      {program.day_themes.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <h2
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--kalpx-text)',
              marginBottom: 12,
            }}
          >
            {t('programDetail.dayOverview').replace('{days}', String(program.duration_days))}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {program.day_themes.map((theme, i) => (
              <span
                key={i}
                style={{
                  fontSize: 12,
                  padding: '4px 10px',
                  background: 'var(--kalpx-chip-bg)',
                  border: '1px solid var(--kalpx-border)',
                  borderRadius: 'var(--kalpx-r-md)',
                  color: 'var(--kalpx-text-soft)',
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: 'var(--kalpx-gold)',
                    marginRight: 4,
                    fontSize: 11,
                  }}
                >
                  {t('programDetail.dayLabel').replace('{n}', String(i + 1))}
                </span>
                {theme}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── About the Guide ── */}
      {program.guide && (
        <section
          style={{
            marginBottom: 28,
            padding: '20px 24px',
            background: 'var(--kalpx-parchment)',
            borderRadius: 'var(--kalpx-r-lg)',
          }}
        >
          <h2
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--kalpx-text)',
              marginBottom: 14,
            }}
          >
            {t('programDetail.aboutGuide')}
          </h2>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 12 }}>
            <GuideChip
              displayName={guideName}
              photoUrl={guidePhoto}
              guideType={guideType}
            />
          </div>

          {guideBio && (
            <div>
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--kalpx-text-soft)',
                  lineHeight: 1.7,
                  marginBottom: guideBio.length > 300 ? 8 : 0,
                }}
              >
                {bioTruncated}
              </p>
              {guideBio.length > 300 && (
                <button
                  onClick={() => setGuideBioExpanded((v) => !v)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--kalpx-gold)',
                    fontSize: 13,
                    cursor: 'pointer',
                    padding: 0,
                    fontWeight: 500,
                  }}
                >
                  {guideBioExpanded ? t('programDetail.showLess') : t('programDetail.readMore')}
                </button>
              )}
            </div>
          )}

          {guideTopics.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {guideTopics.map((topic) => (
                <span
                  key={topic}
                  style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    background: 'var(--kalpx-chip-bg)',
                    border: '1px solid var(--kalpx-border)',
                    borderRadius: 4,
                    color: 'var(--kalpx-text-muted)',
                  }}
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Join Section ── */}
      <section
        aria-label="Join this program"
        style={{
          marginBottom: 28,
          padding: '20px 24px',
          background: 'var(--kalpx-card-bg)',
          border: '1px solid var(--kalpx-border-gold)',
          borderRadius: 'var(--kalpx-r-lg)',
        }}
      >
        <p
          style={{
            fontSize: 12,
            color: 'var(--kalpx-text-muted)',
            letterSpacing: '0.06em',
            marginBottom: 8,
          }}
        >
          {t('programDetail.yourInviteCode')}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <code
            style={{
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'var(--kalpx-text)',
              fontFamily: 'monospace',
            }}
          >
            {program.code}
          </code>
          <button
            onClick={handleCopyCode}
            aria-label={`Copy invite code ${program.code}`}
            style={{
              padding: '6px 14px',
              background: codeCopied ? 'var(--kalpx-chip-bg)' : 'transparent',
              border: '1px solid var(--kalpx-border)',
              borderRadius: 'var(--kalpx-r-md)',
              fontSize: 12,
              color: codeCopied ? 'var(--kalpx-gold)' : 'var(--kalpx-text-muted)',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {codeCopied ? t('programDetail.copied') : t('programDetail.copy')}
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 16,
            padding: '16px',
            background: '#fff',
            borderRadius: 'var(--kalpx-r-md)',
          }}
        >
          <QRCodeSVG
            value={qrUrl}
            size={180}
            aria-label={`QR code for joining ${program.name}. Code: ${program.code}`}
          />
        </div>
        <p style={{ fontSize: 12, color: 'var(--kalpx-text-muted)', textAlign: 'center', marginBottom: 16 }}>
          {t('programDetail.scanToJoin')}
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <Link
            to={joinUrl}
            aria-label={`Join program ${program.name}`}
            style={{
              display: 'inline-block',
              padding: '11px 22px',
              background: 'var(--kalpx-gold)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--kalpx-r-md)',
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            {t('programDetail.joinProgram')}
          </Link>
          <a
            href={deepLinkUrl}
            aria-label={`Open KalpX app and join ${program.name}`}
            style={{
              display: 'inline-block',
              padding: '11px 22px',
              background: 'transparent',
              color: 'var(--kalpx-gold)',
              border: '1px solid var(--kalpx-gold)',
              borderRadius: 'var(--kalpx-r-md)',
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            {t('programDetail.openKalpX')}
          </a>
        </div>

        {/* App store links */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
          <a
            href={appStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download KalpX on the App Store"
            style={storeButtonStyle}
          >
            {t('programDetail.appStore')}
          </a>
          <a
            href={playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Get KalpX on Google Play"
            style={storeButtonStyle}
          >
            {t('programDetail.googlePlay')}
          </a>
        </div>
      </section>

      {/* ── Support ── */}
      {supportHref && (
        <section
          style={{
            borderTop: '1px solid var(--kalpx-border)',
            paddingTop: 20,
            marginBottom: 28,
          }}
        >
          <p
            style={{
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--kalpx-text)',
              marginBottom: 8,
            }}
          >
            {t('programDetail.needHelp')}
          </p>
          <a
            href={supportHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Get help with ${program.name}`}
            style={{ color: 'var(--kalpx-gold)', fontSize: 14, textDecoration: 'underline' }}
          >
            {t('programDetail.contactSupport')}
          </a>
        </section>
      )}

      {/* ── Testimonials ── */}
      {visibleTestimonials.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <h2
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--kalpx-text)',
              marginBottom: 16,
            }}
          >
            {t('programDetail.participantsSay')}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {visibleTestimonials.map((testimonial, i) => (
              <blockquote
                key={i}
                style={{
                  margin: 0,
                  padding: '16px 20px',
                  background: 'var(--kalpx-card-bg)',
                  border: '1px solid var(--kalpx-border)',
                  borderRadius: 'var(--kalpx-r-lg)',
                }}
              >
                <p
                  style={{
                    fontSize: 14,
                    color: 'var(--kalpx-text-soft)',
                    lineHeight: 1.6,
                    marginBottom: 10,
                    fontStyle: 'italic',
                  }}
                >
                  &ldquo;{testimonial.testimonial_text}&rdquo;
                </p>
                <footer style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{ fontSize: 12, fontWeight: 600, color: 'var(--kalpx-text)' }}
                  >
                    {testimonial.display_name}
                  </span>
                  {testimonial.source_day !== null && (
                    <span style={{ fontSize: 11, color: 'var(--kalpx-text-muted)' }}>
                      {t('programDetail.testimonialDay').replace('{n}', String(testimonial.source_day))}
                    </span>
                  )}
                  <span
                    style={{ fontSize: 11, color: 'var(--kalpx-gold)', marginLeft: 'auto' }}
                    aria-label={`${Math.min(5, Math.max(1, testimonial.rating))} out of 5 stars`}
                  >
                    {'★'.repeat(Math.min(5, Math.max(1, testimonial.rating)))}
                  </span>
                </footer>
              </blockquote>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const storeButtonStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '9px 18px',
  background: 'var(--kalpx-text)',
  color: '#fff',
  borderRadius: 'var(--kalpx-r-md)',
  fontWeight: 600,
  fontSize: 13,
  textDecoration: 'none',
};
