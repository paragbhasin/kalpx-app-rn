import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/ui/AppShell';
import { api } from '../../lib/api';

// ── Types ──────────────────────────────────────────────────────────────────────

interface GrowthSection {
  total_users: number;
  new_today: number;
  new_7d: number;
  new_30d: number;
  dau_proxy: number;
  wau_proxy: number;
  dau_note: string;
}

interface ActivationSection {
  users_ever_completed_quick_chant: number;
  users_ever_completed_rhythm: number;
  users_ever_started_inner_path: number;
  users_ever_used_tell_mitra: number;
  users_ever_completed_program_day_1: number;
  users_with_any_ritual: number;
  activation_rate_pct: number;
  users_completed_quick_chant_7d: number;
  users_completed_rhythm_7d: number;
  users_used_tell_mitra_7d: number;
  users_with_any_ritual_7d: number;
  users_with_valid_timezone: number;
  users_with_confirmed_timezone: number;
  timezone_note: string;
  gaps: string[];
}

interface PushReachabilitySection {
  total_tokens: number;
  linked: number;
  orphan: number;
  linked_rate_pct: number;
  orphan_rate_pct: number;
  ios: { linked: number; orphan: number };
  android: { linked: number; orphan: number };
  web: { linked: number; orphan: number };
  new_linked_24h: number;
  new_linked_7d: number;
  orphan_by_age: { lt_1d: number; '1_to_7d': number; '7_to_30d': number; gt_30d: number };
  linked_device_token_users: number;
  valid_timezone_users: number;
  push_enabled_users: number;
  push_reachable_users: number;
  push_reachable_rate_pct: number;
  adoption_note: string;
}

interface NotificationsSection {
  last_24h: Record<string, number>;
  last_7d: Record<string, number>;
  tap_rate_24h_pct: number | null;
  tap_rate_7d_pct: number | null;
  send_success_rate_pct: number | null;
  suppression_reasons_7d: { reason: string; count: number }[];
  states_present_30d: string[];
  tap_rate_note: string;
}

interface RitualsSection {
  quick_chant: Record<string, number>;
  rhythm: Record<string, number>;
  inner_path: Record<string, number>;
  tell_mitra: Record<string, number>;
}

interface RetentionSection {
  active_today: number;
  active_yesterday: number;
  active_7d_proxy: number;
  users_2plus_days_7d_rhythm: number;
  note: string;
}

interface ProgramsSection {
  active_campaigns: number;
  total_joins: number;
  joins_7d: number;
  d1_total: number;
  d3_total: number;
  d7_total: number;
  d7_rate_pct: number;
  shares_total: number;
  testimonials_total: number;
  classification_counts: Record<string, number>;
  kill_signal_count: number;
  support_problem_count: number;
  top_5_by_d7_rate: { code: string; joined: number; d7_rate_pct: number; classification: string; status: string }[];
  lowest_5_by_d7_rate: { code: string; joined: number; d7_rate_pct: number; classification: string; status: string }[];
}

interface AttributionSection {
  by_source_channel: { value: string; count: number }[];
  by_utm_source: { value: string; count: number }[];
  unknown_source_count: number;
  referred_users: number;
  install_note: string;
}

interface MobileAnalyticsSection {
  ios_firebase_enabled: boolean;
  android_firebase_enabled: boolean;
  init_analytics_called_on_launch: boolean;
  platform_in_events: boolean;
  app_version_in_events: boolean;
  ios_blocker: string;
  track_b_branch: string;
  note: string;
}

interface GrowthSummary {
  generated_at: string;
  growth: GrowthSection;
  activation: ActivationSection;
  push_reachability: PushReachabilitySection;
  notifications: NotificationsSection;
  rituals: RitualsSection;
  retention: RetentionSection;
  programs: ProgramsSection;
  attribution: AttributionSection;
  quality: { [k: string]: string };
  mobile_analytics: MobileAnalyticsSection;
  gaps: string[];
}

type SectionData = GrowthSummary[keyof GrowthSummary];

function isErrorSection(v: SectionData): v is { error: string; note: string } {
  return typeof v === 'object' && v !== null && 'error' in v;
}

// ── UI helpers ─────────────────────────────────────────────────────────────────

function AdminNav() {
  const navigate = useNavigate();
  const links: [string, string][] = [
    ['Overview', '/programs/admin/overview/'],
    ['Campaigns', '/programs/admin/campaigns/'],
    ['Create', '/programs/admin/new/'],
    ['Template Queue', '/programs/admin/'],
  ];
  return (
    <div style={{
      display: 'flex', gap: 2, marginBottom: 24, flexWrap: 'wrap',
    }}>
      {links.map(([label, path]) => {
        const active = window.location.pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              padding: '7px 14px', fontSize: 13, fontWeight: active ? 700 : 500,
              background: active ? 'var(--kalpx-gold, #b58a3a)' : 'transparent',
              color: active ? '#fff' : 'var(--kalpx-text-soft)',
              border: `1px solid ${active ? 'var(--kalpx-gold, #b58a3a)' : 'var(--kalpx-border, #d1d5db)'}`,
              borderRadius: 6, cursor: 'pointer',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function Stat({ label, value, sub, warn }: { label: string; value: string | number; sub?: string; warn?: boolean }) {
  return (
    <div style={{
      padding: '16px 20px', background: warn ? '#fff7ed' : 'var(--kalpx-surface, #f9fafb)',
      borderRadius: 8, border: `1px solid ${warn ? '#fed7aa' : 'var(--kalpx-border, #e5e7eb)'}`,
      minWidth: 140, flex: '1 1 140px',
    }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: warn ? '#c2410c' : 'var(--kalpx-text)', lineHeight: 1.2 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--kalpx-text-soft)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.4 }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: 'var(--kalpx-text-soft)', marginTop: 2 }}>{sub}</div>
      )}
    </div>
  );
}

function SectionCard({ title, children, error }: { title: string; children: React.ReactNode; error?: string }) {
  return (
    <div style={{
      marginBottom: 20, borderRadius: 8,
      border: '1px solid var(--kalpx-border, #e5e7eb)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '12px 20px', background: 'var(--kalpx-surface, #f9fafb)',
        borderBottom: '1px solid var(--kalpx-border, #e5e7eb)',
        fontWeight: 700, fontSize: 14, color: 'var(--kalpx-text)',
      }}>
        {title}
      </div>
      <div style={{ padding: '16px 20px', fontSize: 13 }}>
        {error
          ? <div style={{ color: '#dc2626' }}>Error: {error}</div>
          : children}
      </div>
    </div>
  );
}

function Row({ label, value, note }: { label: string; value: string | number | React.ReactNode; note?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0', borderBottom: '1px solid var(--kalpx-border, #e5e7eb)' }}>
      <span style={{ color: 'var(--kalpx-text-soft)' }}>
        {label}
        {note && <span style={{ fontSize: 11, marginLeft: 6, color: '#9ca3af' }}>({note})</span>}
      </span>
      <span style={{ fontWeight: 600, color: 'var(--kalpx-text)', textAlign: 'right', marginLeft: 16 }}>
        {value}
      </span>
    </div>
  );
}

function Bool({ v }: { v: boolean }) {
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
      background: v ? '#dcfce7' : '#fee2e2',
      color: v ? '#166534' : '#991b1b',
    }}>
      {v ? 'YES' : 'NO'}
    </span>
  );
}

function pct(val: number | null): string {
  if (val === null || val === undefined) return '—';
  return `${val}%`;
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ProgramAdminOverview() {
  const [data, setData] = useState<GrowthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api.get<GrowthSummary>('programs/admin/growth-summary/')
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load growth summary. Check your network or server logs.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <AppShell>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
        <AdminNav />

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--kalpx-text)', margin: 0 }}>
              Founder Command Center
            </h1>
            {data && (
              <p style={{ fontSize: 12, color: 'var(--kalpx-text-soft)', margin: '4px 0 0' }}>
                Generated: {new Date(data.generated_at).toLocaleString()}
              </p>
            )}
          </div>
          <button
            onClick={load}
            disabled={loading}
            style={{
              padding: '8px 16px', fontSize: 13, fontWeight: 600,
              background: 'none', border: '1px solid var(--kalpx-border, #d1d5db)',
              borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer',
              color: 'var(--kalpx-text)',
            }}
          >
            {loading ? 'Loading…' : '↻ Refresh'}
          </button>
        </div>

        {error && (
          <div style={{ padding: 16, background: '#fee2e2', color: '#991b1b', borderRadius: 8, marginBottom: 20, fontSize: 13 }}>
            {error}
          </div>
        )}

        {loading && !data && (
          <div style={{ textAlign: 'center', padding: 64, color: 'var(--kalpx-text-soft)', fontSize: 14 }}>
            Loading…
          </div>
        )}

        {data && (
          <>
            {/* Summary cards */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
              <Stat label="Total Users" value={data.growth.total_users} sub={`+${data.growth.new_7d} this week`} />
              <Stat label="DAU Proxy" value={data.growth.dau_proxy} sub="ritual activity" />
              <Stat label="Activation" value={pct(data.activation.activation_rate_pct)} sub="any ritual ever" />
              <Stat label="Push Reachable" value={pct(data.push_reachability.push_reachable_rate_pct)} warn={data.push_reachability.push_reachable_rate_pct < 50} />
              <Stat label="Active Programs" value={data.programs.active_campaigns} />
              <Stat label="Notif Tap 7d" value={pct(data.notifications.tap_rate_7d_pct)} />
              <Stat label="Orphan Tokens" value={data.push_reachability.orphan} warn={data.push_reachability.orphan > 100} />
              <Stat label="D7 Rate" value={pct(data.programs.d7_rate_pct)} />
            </div>

            {/* Growth */}
            <SectionCard title="Growth" error={isErrorSection(data.growth) ? data.growth.error : undefined}>
              <Row label="Total active users" value={data.growth.total_users} />
              <Row label="New today" value={data.growth.new_today} />
              <Row label="New last 7 days" value={data.growth.new_7d} />
              <Row label="New last 30 days" value={data.growth.new_30d} />
              <Row label="DAU proxy" value={data.growth.dau_proxy} note={data.growth.dau_note} />
              <Row label="WAU proxy" value={data.growth.wau_proxy} />
            </SectionCard>

            {/* Activation */}
            <SectionCard title="Activation" error={isErrorSection(data.activation) ? data.activation.error : undefined}>
              <Row label="Users ever completed quick chant" value={data.activation.users_ever_completed_quick_chant} />
              <Row label="Users ever completed rhythm" value={data.activation.users_ever_completed_rhythm} />
              <Row label="Users ever started inner path" value={data.activation.users_ever_started_inner_path} />
              <Row label="Users ever used Tell Mitra" value={data.activation.users_ever_used_tell_mitra} />
              <Row label="Users ever completed program Day 1" value={data.activation.users_ever_completed_program_day_1} />
              <Row label="Users with any ritual (all time)" value={`${data.activation.users_with_any_ritual} (${pct(data.activation.activation_rate_pct)})`} />
              <Row label="Quick chant completions (7d users)" value={data.activation.users_completed_quick_chant_7d} />
              <Row label="Rhythm completions (7d users)" value={data.activation.users_completed_rhythm_7d} />
              <Row label="Tell Mitra (7d users)" value={data.activation.users_used_tell_mitra_7d} />
              <Row label="Any ritual (7d users)" value={data.activation.users_with_any_ritual_7d} />
              <Row label="Users with valid timezone" value={data.activation.users_with_valid_timezone} note="non-empty IANA" />
              <Row label="Users with confirmed timezone" value={data.activation.users_with_confirmed_timezone} note="device/user-set" />
              {data.activation.gaps?.length > 0 && (
                <div style={{ marginTop: 10, fontSize: 12, color: '#9ca3af' }}>
                  Gaps: {data.activation.gaps.join(' · ')}
                </div>
              )}
            </SectionCard>

            {/* Push Reachability */}
            <SectionCard title="Push Reachability" error={isErrorSection(data.push_reachability) ? data.push_reachability.error : undefined}>
              <Row label="Push reachable users" value={`${data.push_reachability.push_reachable_users} (${pct(data.push_reachability.push_reachable_rate_pct)})`} note="linked token + valid tz + push on" />
              <Row label="Users with linked token" value={data.push_reachability.linked_device_token_users} />
              <Row label="Users with valid timezone" value={data.push_reachability.valid_timezone_users} />
              <Row label="Users with push enabled" value={data.push_reachability.push_enabled_users} />
              <Row label="Total tokens" value={data.push_reachability.total_tokens} />
              <Row label="Linked tokens" value={`${data.push_reachability.linked} (${pct(data.push_reachability.linked_rate_pct)})`} />
              <Row label="Orphan tokens" value={`${data.push_reachability.orphan} (${pct(data.push_reachability.orphan_rate_pct)})`} />
              <Row label="iOS" value={`${data.push_reachability.ios.linked} linked, ${data.push_reachability.ios.orphan} orphan`} />
              <Row label="Android" value={`${data.push_reachability.android.linked} linked, ${data.push_reachability.android.orphan} orphan`} />
              <Row label="New linked (24h)" value={data.push_reachability.new_linked_24h} />
              <Row label="New linked (7d)" value={data.push_reachability.new_linked_7d} />
              <div style={{ marginTop: 10, fontSize: 12, color: '#9ca3af' }}>
                Orphan age: &lt;1d: {data.push_reachability.orphan_by_age.lt_1d} · 1–7d: {data.push_reachability.orphan_by_age['1_to_7d']} · 7–30d: {data.push_reachability.orphan_by_age['7_to_30d']} · &gt;30d: {data.push_reachability.orphan_by_age.gt_30d}
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: '#9ca3af' }}>{data.push_reachability.adoption_note}</div>
            </SectionCard>

            {/* Notifications */}
            <SectionCard title="Notifications" error={isErrorSection(data.notifications) ? data.notifications.error : undefined}>
              <Row label="Tap rate (24h)" value={pct(data.notifications.tap_rate_24h_pct)} />
              <Row label="Tap rate (7d)" value={pct(data.notifications.tap_rate_7d_pct)} />
              <Row label="Send success rate (24h)" value={pct(data.notifications.send_success_rate_pct)} />
              <div style={{ marginTop: 12, marginBottom: 6, fontWeight: 600, fontSize: 12, color: 'var(--kalpx-text-soft)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Last 24h by state</div>
              {Object.entries(data.notifications.last_24h).map(([state, count]) => (
                <Row key={state} label={state} value={count} />
              ))}
              {Object.keys(data.notifications.last_24h).length === 0 && (
                <div style={{ color: '#9ca3af', fontSize: 13 }}>No notifications in last 24h</div>
              )}
              <div style={{ marginTop: 12, marginBottom: 6, fontWeight: 600, fontSize: 12, color: 'var(--kalpx-text-soft)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Suppression reasons (7d)</div>
              {data.notifications.suppression_reasons_7d.length === 0
                ? <div style={{ color: '#9ca3af', fontSize: 13 }}>None</div>
                : data.notifications.suppression_reasons_7d.map((r) => (
                  <Row key={r.reason} label={r.reason} value={r.count} />
                ))}
              <div style={{ marginTop: 10, fontSize: 12, color: '#9ca3af' }}>
                States present (30d): {data.notifications.states_present_30d.join(', ') || 'none'}
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: '#9ca3af' }}>{data.notifications.tap_rate_note}</div>
            </SectionCard>

            {/* Rituals */}
            <SectionCard title="Ritual Engagement" error={isErrorSection(data.rituals) ? data.rituals.error : undefined}>
              <div style={{ marginBottom: 8, fontWeight: 600, fontSize: 12, color: 'var(--kalpx-text-soft)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Quick Chant / Japa</div>
              <Row label="Sessions today" value={data.rituals.quick_chant.sessions_today} />
              <Row label="Completed today" value={data.rituals.quick_chant.completed_today} />
              <Row label="Sessions (7d)" value={data.rituals.quick_chant.sessions_7d} />
              <Row label="Completed (7d)" value={data.rituals.quick_chant.completed_7d} />
              <div style={{ marginTop: 12, marginBottom: 8, fontWeight: 600, fontSize: 12, color: 'var(--kalpx-text-soft)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Rhythm</div>
              <Row label="Completions today" value={data.rituals.rhythm.completions_today} />
              <Row label="Completions (7d)" value={data.rituals.rhythm.completions_7d} />
              <Row label="Completions (30d)" value={data.rituals.rhythm.completions_30d} />
              <div style={{ marginTop: 12, marginBottom: 8, fontWeight: 600, fontSize: 12, color: 'var(--kalpx-text-soft)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Inner Path</div>
              <Row label="Activity events (7d)" value={data.rituals.inner_path.activity_events_7d} />
              <Row label="User-day pairs (7d)" value={data.rituals.inner_path.user_day_pairs_7d} />
              <div style={{ marginTop: 12, marginBottom: 8, fontWeight: 600, fontSize: 12, color: 'var(--kalpx-text-soft)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Tell Mitra</div>
              <Row label="Messages today" value={data.rituals.tell_mitra.messages_today} />
              <Row label="Messages (7d)" value={data.rituals.tell_mitra.messages_7d} />
              <Row label="Active users (7d)" value={data.rituals.tell_mitra.active_users_7d} />
            </SectionCard>

            {/* Retention */}
            <SectionCard title="Retention" error={isErrorSection(data.retention) ? data.retention.error : undefined}>
              <Row label="Active today (proxy)" value={data.retention.active_today} />
              <Row label="Active yesterday (proxy)" value={data.retention.active_yesterday} />
              <Row label="Active last 7 days (proxy)" value={data.retention.active_7d_proxy} />
              <Row label="Users 2+ active days in 7d (rhythm proxy)" value={data.retention.users_2plus_days_7d_rhythm} />
              <div style={{ marginTop: 10, fontSize: 12, color: '#9ca3af' }}>{data.retention.note}</div>
            </SectionCard>

            {/* Programs */}
            <SectionCard title="Programs">
              <Row label="Active campaigns" value={data.programs.active_campaigns} />
              <Row label="Total joins" value={data.programs.total_joins} />
              <Row label="Joins (7d)" value={data.programs.joins_7d} />
              <Row label="D1 completions" value={data.programs.d1_total} />
              <Row label="D3 completions" value={data.programs.d3_total} />
              <Row label="D7 completions" value={data.programs.d7_total} />
              <Row label="Overall D7 rate" value={pct(data.programs.d7_rate_pct)} />
              <Row label="Shares (ProgramShare)" value={data.programs.shares_total} />
              <Row label="Testimonials" value={data.programs.testimonials_total} />
              <Row label="Kill signals" value={data.programs.kill_signal_count} />
              <Row label="Support problems" value={data.programs.support_problem_count} />
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {Object.entries(data.programs.classification_counts).map(([cls, count]) => (
                  <span key={cls} style={{ padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: 700, ...clsBadgeStyle(cls as Classification) }}>
                    {cls}: {count}
                  </span>
                ))}
              </div>
              {data.programs.top_5_by_d7_rate.length > 0 && (
                <>
                  <div style={{ marginTop: 16, marginBottom: 6, fontWeight: 600, fontSize: 12, color: 'var(--kalpx-text-soft)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Top 5 by D7 rate</div>
                  {data.programs.top_5_by_d7_rate.map((r) => (
                    <Row key={r.code} label={`${r.code} (${r.status})`} value={`${r.joined} joined · D7: ${pct(r.d7_rate_pct)} · ${r.classification}`} />
                  ))}
                </>
              )}
              <div style={{ marginTop: 12 }}>
                <a href="/programs/admin/campaigns/" style={{ fontSize: 13, color: 'var(--kalpx-gold, #b58a3a)', textDecoration: 'none', fontWeight: 600 }}>
                  → View full campaign list
                </a>
              </div>
            </SectionCard>

            {/* Attribution */}
            <SectionCard title="Attribution" error={isErrorSection(data.attribution) ? data.attribution.error : undefined}>
              <Row label="Referred users" value={data.attribution.referred_users} />
              <Row label="No source recorded" value={data.attribution.unknown_source_count} />
              <div style={{ marginTop: 12, marginBottom: 6, fontWeight: 600, fontSize: 12, color: 'var(--kalpx-text-soft)', textTransform: 'uppercase', letterSpacing: 0.4 }}>By source channel</div>
              {data.attribution.by_source_channel.map((r) => (
                <Row key={r.value} label={r.value} value={r.count} />
              ))}
              <div style={{ marginTop: 12, marginBottom: 6, fontWeight: 600, fontSize: 12, color: 'var(--kalpx-text-soft)', textTransform: 'uppercase', letterSpacing: 0.4 }}>By UTM source (top 20)</div>
              {data.attribution.by_utm_source.length === 0
                ? <div style={{ color: '#9ca3af', fontSize: 13 }}>No UTM data</div>
                : data.attribution.by_utm_source.map((r) => (
                  <Row key={r.value} label={r.value} value={r.count} />
                ))}
              <div style={{ marginTop: 10, fontSize: 12, color: '#9ca3af' }}>{data.attribution.install_note}</div>
            </SectionCard>

            {/* Quality */}
            <SectionCard title="Quality">
              <Row label="Generic notification fallbacks" value={data.quality.generic_notification_fallbacks} />
              <Row label="API errors" value={data.quality.api_errors} />
              <Row label="Crash data" value={data.quality.crash_data} />
              <div style={{ marginTop: 10, fontSize: 12, color: '#9ca3af' }}>{data.quality.note}</div>
            </SectionCard>

            {/* Mobile Analytics Readiness */}
            <SectionCard title="Mobile Analytics Readiness">
              <Row label="iOS Firebase Analytics enabled" value={<Bool v={data.mobile_analytics.ios_firebase_enabled} />} />
              <Row label="Android Firebase Analytics enabled" value={<Bool v={data.mobile_analytics.android_firebase_enabled} />} />
              <Row label="initAnalytics() called on launch" value={<Bool v={data.mobile_analytics.init_analytics_called_on_launch} />} />
              <Row label="platform in events" value={<Bool v={data.mobile_analytics.platform_in_events} />} />
              <Row label="app_version in events" value={<Bool v={data.mobile_analytics.app_version_in_events} />} />
              <Row label="iOS blocker" value={data.mobile_analytics.ios_blocker} />
              <Row label="Track B branch" value={data.mobile_analytics.track_b_branch} />
              <div style={{ marginTop: 10, fontSize: 12, color: '#9ca3af' }}>{data.mobile_analytics.note}</div>
            </SectionCard>

            {/* Gaps */}
            <SectionCard title="Known Gaps">
              <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8, color: 'var(--kalpx-text-soft)' }}>
                {data.gaps.map((gap, i) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
            </SectionCard>
          </>
        )}
      </div>
    </AppShell>
  );
}

// ── Classification badge styles ────────────────────────────────────────────────

type Classification = 'BREAKOUT' | 'STRONG' | 'ACCEPTABLE' | 'WEAK';

function clsBadgeStyle(cls: Classification): React.CSSProperties {
  switch (cls) {
    case 'BREAKOUT':   return { background: '#dcfce7', color: '#166534' };
    case 'STRONG':     return { background: '#dbeafe', color: '#1e40af' };
    case 'ACCEPTABLE': return { background: '#fef3c7', color: '#92400e' };
    case 'WEAK':       return { background: '#fee2e2', color: '#991b1b' };
  }
}
