import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { AppShell } from '../../components/ui/AppShell';
import { fetchProgramByCode, fetchProgramBySlug, type ProgramCampaignPublic } from '../../engine/programApi';
import { captureProgramAttribution } from '../../utils/programAttribution';

// Resolve placeholder before shipping: replace with real App Store ID
const APPLE_APP_STORE_ID = 'REPLACE_ME_APPLE_APP_ID';

// Allowlist-based URL safety: only https:// and mailto: are rendered as hrefs
function safeHref(url: string | null | undefined, fallback: string): string {
  if (!url) return fallback;
  if (url.startsWith('https://') || url.startsWith('mailto:')) return url;
  return fallback;
}

function buildHeadline(campaign: ProgramCampaignPublic): string {
  const hero = campaign.community_name || campaign.leader_name;
  const days = campaign.duration_days;
  if (hero) {
    return `A ${days}-day practice offered by ${hero}, powered by KalpX.`;
  }
  return `A ${days}-day practice, powered by KalpX.`;
}

type LoadState =
  | { kind: 'loading' }
  | { kind: 'found'; campaign: ProgramCampaignPublic }
  | { kind: 'not_found' }
  | { kind: 'ended' }
  | { kind: 'error' };

export function ProgramLandingPage() {
  const { code, slug } = useParams<{ code?: string; slug?: string }>();
  const [state, setState] = useState<LoadState>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const campaign = code
          ? await fetchProgramByCode(code)
          : await fetchProgramBySlug(slug!);
        if (cancelled) return;
        setState({ kind: 'found', campaign });
      } catch (err: any) {
        if (cancelled) return;
        const status = err?.response?.status;
        if (status === 404) setState({ kind: 'not_found' });
        else if (status === 410) setState({ kind: 'ended' });
        else setState({ kind: 'error' });
      }
    }
    load();
    return () => { cancelled = true; };
  }, [code, slug]);

  // Attribution + analytics on successful campaign load
  useEffect(() => {
    if (state.kind !== 'found') return;
    const { campaign } = state;
    captureProgramAttribution(campaign.code);
    // Fire program_landing_viewed analytics (structured as a plain fetch to avoid
    // coupling this public page to the authenticated analytics client)
    try {
      const params = new URLSearchParams(window.location.search);
      const payload = {
        event: 'program_landing_viewed',
        campaign_code: campaign.code,
        utm_source: params.get('utm_source') || '',
        utm_medium: params.get('utm_medium') || '',
      };
      navigator.sendBeacon('/api/analytics/event/', JSON.stringify(payload));
    } catch {
      // analytics failure must never break the landing page
    }
  }, [state.kind === 'found' ? (state as any).campaign?.code : null]);

  return (
    <AppShell>
      <main
        role="main"
        style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px 80px' }}
      >
        {state.kind === 'loading' && <LoadingState />}
        {state.kind === 'not_found' && <NotFoundState />}
        {state.kind === 'ended' && <EndedState />}
        {state.kind === 'error' && <ErrorState />}
        {state.kind === 'found' && <CampaignBody campaign={state.campaign} />}
      </main>
    </AppShell>
  );
}

// ── Loading ──────────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div style={{ textAlign: 'center', paddingTop: 80 }} aria-busy="true" aria-label="Loading program">
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid var(--kalpx-border)',
        borderTopColor: 'var(--kalpx-gold)',
        animation: 'spin 0.8s linear infinite',
        margin: '0 auto 16px',
      }} />
      <p style={{ color: 'var(--kalpx-text-muted)', fontSize: 14 }}>Loading program…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Error states ─────────────────────────────────────────────────────────────

function NotFoundState() {
  return (
    <div style={{ textAlign: 'center', paddingTop: 80 }}>
      <p style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>Link not valid</p>
      <p style={{ color: 'var(--kalpx-text-soft)', lineHeight: 1.6 }}>
        This invite link isn&apos;t valid. Please check with the person who shared it.
      </p>
    </div>
  );
}

function EndedState() {
  return (
    <div style={{ textAlign: 'center', paddingTop: 80 }}>
      <p style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>Program has ended</p>
      <p style={{ color: 'var(--kalpx-text-soft)' }}>This program has ended.</p>
    </div>
  );
}

function ErrorState() {
  return (
    <div style={{ textAlign: 'center', paddingTop: 80 }}>
      <p style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>Something went wrong</p>
      <p style={{ color: 'var(--kalpx-text-soft)' }}>
        Please try again or{' '}
        <a href="https://kalpx.com/support" style={{ color: 'var(--kalpx-gold)' }}>contact support</a>.
      </p>
    </div>
  );
}

// ── Paused banner (inline, not a route change) ────────────────────────────────

function PausedBanner() {
  return (
    <div
      role="alert"
      style={{
        background: 'var(--kalpx-chip-bg)',
        border: '1px solid var(--kalpx-border-gold)',
        borderRadius: 'var(--kalpx-r-md)',
        padding: '12px 16px',
        marginBottom: 24,
        fontSize: 14,
        color: 'var(--kalpx-text-soft)',
      }}
    >
      This program is currently paused. Check back soon.
    </div>
  );
}

// ── Main campaign body ────────────────────────────────────────────────────────

function CampaignBody({ campaign }: { campaign: ProgramCampaignPublic }) {
  const joinUrl = `https://kalpx.com/join/${campaign.code}`;
  const deepLinkUrl = `kalpx://join/${campaign.code}`;
  const supportUrl = `/programs/support?code=${campaign.code}${
    campaign.support_contact_url
      ? `&support_url=${encodeURIComponent(campaign.support_contact_url)}&support_label=${encodeURIComponent(campaign.support_contact_label || 'Contact support')}`
      : ''
  }`;

  const appStoreUrl = `https://apps.apple.com/app/kalpx/id${APPLE_APP_STORE_ID}?utm_source=kalpx&utm_medium=program&utm_campaign=${campaign.code}`;
  const playStoreUrl = `https://play.google.com/store/apps/details?id=com.kalpx.app&utm_source=kalpx&utm_medium=program&utm_campaign=${campaign.code}`;

  const headline = buildHeadline(campaign);
  const isPaused = campaign.status === 'paused';

  return (
    <div>
      {/* Paused banner */}
      {isPaused && <PausedBanner />}

      {/* Header — Decision 3: Program is the hero, not "Download KalpX" */}
      <header style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 12, color: 'var(--kalpx-text-muted)', marginBottom: 10, letterSpacing: '0.04em' }}>
          PRACTICE PROGRAM
        </p>
        <h1
          style={{
            fontSize: 20,
            fontWeight: 600,
            lineHeight: 1.4,
            color: 'var(--kalpx-text)',
            marginBottom: 12,
          }}
        >
          {headline}
        </h1>
        {campaign.program_promise && (
          <p style={{ color: 'var(--kalpx-text-soft)', lineHeight: 1.6, fontSize: 15 }}>
            {campaign.program_promise}
          </p>
        )}
      </header>

      {/* Invite Code Block — Decision 10: Always visible, no interaction required */}
      <section
        aria-label="Your invite code"
        style={{
          background: 'var(--kalpx-card-bg)',
          border: '1px solid var(--kalpx-border-gold)',
          borderRadius: 'var(--kalpx-r-lg)',
          padding: '20px 24px',
          marginBottom: 28,
        }}
      >
        <p
          id="invite-code-label"
          style={{ fontSize: 12, color: 'var(--kalpx-text-muted)', marginBottom: 8, letterSpacing: '0.06em' }}
        >
          YOUR INVITE CODE
        </p>
        <code
          aria-labelledby="invite-code-label"
          style={{
            display: 'block',
            fontSize: 32,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: 'var(--kalpx-text)',
            fontFamily: 'monospace',
            marginBottom: 10,
          }}
        >
          {campaign.code}
        </code>
        <p style={{ fontSize: 13, color: 'var(--kalpx-text-soft)', lineHeight: 1.5 }}>
          Enter this in the KalpX app under &quot;Have an invite code?&quot;
        </p>
      </section>

      {/* Download section */}
      <section style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', marginBottom: 14 }}>
          Download KalpX to join:
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <a
            href={appStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download KalpX on the App Store"
            style={storeButtonStyle}
          >
            App Store
          </a>
          <a
            href={playStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Get KalpX on Google Play"
            style={storeButtonStyle}
          >
            Google Play
          </a>
        </div>
        {/* Open KalpX — custom scheme, secondary (Decision 5) */}
        <p style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', marginBottom: 8 }}>
          Already have KalpX?
        </p>
        <a
          href={deepLinkUrl}
          aria-label={`Open KalpX app and join with code ${campaign.code}`}
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            border: '1px solid var(--kalpx-border-gold)',
            borderRadius: 'var(--kalpx-r-md)',
            color: 'var(--kalpx-gold)',
            fontWeight: 500,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          Open KalpX
        </a>
      </section>

      {/* QR section (Decision 5: HTTPS primary) */}
      <section
        style={{
          marginBottom: 28,
          padding: '20px 24px',
          background: 'var(--kalpx-parchment)',
          borderRadius: 'var(--kalpx-r-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          role="img"
          aria-label={`QR code to join program — scan with your phone camera. URL: ${joinUrl}`}
        >
          <QRCodeSVG
            value={joinUrl}
            size={180}
            level="M"
            style={{ display: 'block' }}
          />
          {/* Visually hidden URL for screen readers */}
          <span className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
            {joinUrl}
          </span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', textAlign: 'center' }}>
          Scan to join on mobile
        </p>
      </section>

      {/* Program schedule */}
      {campaign.days.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--kalpx-text)' }}>
            {campaign.duration_days}-Day Schedule
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {campaign.days.map(day => (
              <div
                key={day.day_number}
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 12,
                  fontSize: 14,
                  color: 'var(--kalpx-text-soft)',
                }}
              >
                <span
                  style={{
                    minWidth: 48,
                    fontWeight: 600,
                    color: 'var(--kalpx-gold)',
                    fontSize: 12,
                    letterSpacing: '0.04em',
                  }}
                >
                  DAY {day.day_number}
                </span>
                <span>{day.theme}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* What happens each day */}
      {campaign.hero_copy && (
        <section style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10, color: 'var(--kalpx-text)' }}>
            What happens each day
          </h2>
          <p style={{ color: 'var(--kalpx-text-soft)', lineHeight: 1.7, fontSize: 14 }}>
            {campaign.hero_copy}
          </p>
        </section>
      )}

      {/* Support section — Decision 2: Support must be obvious */}
      <section
        style={{
          borderTop: '1px solid var(--kalpx-border)',
          paddingTop: 24,
          marginBottom: 24,
        }}
      >
        <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 8, color: 'var(--kalpx-text)' }}>
          Need help joining?
        </p>
        <Link
          to={supportUrl}
          style={{
            color: 'var(--kalpx-gold)',
            fontWeight: 500,
            fontSize: 14,
            textDecoration: 'underline',
          }}
          aria-label="Get support joining this program"
        >
          Get support →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ fontSize: 12, color: 'var(--kalpx-text-faint)', lineHeight: 1.6 }}>
        {campaign.status === 'active' && (
          <span>Program is active · </span>
        )}
        {campaign.start_date && (
          <span>Starts {campaign.start_date} · </span>
        )}
        <span>Powered by KalpX</span>
      </footer>
    </div>
  );
}

const storeButtonStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '11px 22px',
  background: 'var(--kalpx-text)',
  color: '#fff',
  borderRadius: 'var(--kalpx-r-md)',
  fontWeight: 600,
  fontSize: 14,
  textDecoration: 'none',
};
