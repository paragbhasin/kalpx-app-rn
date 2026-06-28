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
  first_open_7d: number | null;
  install_to_signup_rate_pct: number | null;
  install_note: string;
}

interface SignupToFirstRitual {
  total_new_30d: number;
  first_ritual_within_1d: number;
  first_ritual_within_7d: number;
  rate_1d_pct: number;
  rate_7d_pct: number;
  note: string;
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
  users_started_inner_path_7d: number;
  users_used_tell_mitra_7d: number;
  users_completed_program_day_1_7d: number;
  users_with_any_ritual_7d: number;
  signup_to_first_ritual: SignupToFirstRitual;
  activation_note: string;
}

interface PushReachabilitySection {
  linked_device_token_users: number;
  valid_timezone_users: number;
  confirmed_timezone_users: number;
  default_but_valid_timezone_users: number;
  invalid_timezone_users: number;
  push_enabled_users: number;
  push_reachable_users: number;
  push_reachable_rate_pct: number;
  iana_validation: string;
  push_reachability_note: string;
}

interface DeviceTokensSection {
  total: number;
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
  adoption_note: string;
}

interface NotificationToRitual {
  tapped_7d: number;
  completed_ritual_after_tap_7d: number;
  rate_pct: number | null;
  window_hours: number;
  note: string;
}

interface NotificationsSection {
  states_present_30d: string[];
  last_24h: Record<string, number>;
  last_7d: Record<string, number>;
  tap_rate_24h_pct: number | null;
  tap_rate_7d_pct: number | null;
  send_success_rate_pct: number | null;
  suppression_reasons_7d: { reason: string; count: number }[];
  notification_to_ritual: NotificationToRitual;
  tap_rate_note: string;
}

interface CrossSurface {
  users_2plus_active_days_7d: number;
  users_3plus_active_days_7d: number;
  source: string;
}

interface RetentionSection {
  active_today: number;
  active_yesterday: number;
  active_7d_proxy: number;
  users_2plus_days_7d_rhythm: number;
  cross_surface: CrossSurface;
  note: string;
}

interface RitualsSection {
  quick_chant: Record<string, number>;
  rhythm: Record<string, number>;
  inner_path: Record<string, number>;
  tell_mitra: Record<string, number>;
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
  unknown_source_rate_pct: number;
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
  eas_secret_action_required: string;
  note: string;
}

interface GapItem {
  id: string;
  priority: 'P0' | 'P1' | 'P2';
  label: string;
  status: 'not_wired' | 'partial' | 'wired';
  requires_mobile: boolean;
  blocker: string | null;
  next_action: string;
}

interface GapsSection {
  p0_count: number;
  p1_count: number;
  p2_count: number;
  wired_this_session: string[];
  items: GapItem[];
  plan_file: string;
}

interface GrowthSummary {
  generated_at: string;
  growth: GrowthSection;
  activation: ActivationSection;
  push_reachability: PushReachabilitySection;
  device_tokens: DeviceTokensSection;
  notifications: NotificationsSection;
  rituals: RitualsSection;
  retention: RetentionSection;
  programs: ProgramsSection;
  attribution: AttributionSection;
  quality: { [k: string]: string };
  mobile_analytics: MobileAnalyticsSection;
  gaps: GapsSection;
}

type SectionData = GrowthSummary[keyof GrowthSummary];

function isErrorSection(v: SectionData): v is { error: string; note: string } {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && 'error' in v;
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
    <div style={{ display: 'flex', gap: 2, marginBottom: 24, flexWrap: 'wrap' }}>
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 12, marginBottom: 6, fontWeight: 600, fontSize: 12, color: 'var(--kalpx-text-soft)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
      {children}
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

function Note({ children }: { children: React.ReactNode }) {
  return <div style={{ marginTop: 8, fontSize: 12, color: '#9ca3af' }}>{children}</div>;
}

function pct(val: number | null | undefined): string {
  if (val === null || val === undefined) return '—';
  return `${val}%`;
}

function PriorityBadge({ p }: { p: 'P0' | 'P1' | 'P2' }) {
  const styles: Record<string, React.CSSProperties> = {
    P0: { background: '#fee2e2', color: '#991b1b', fontWeight: 800 },
    P1: { background: '#fef3c7', color: '#92400e', fontWeight: 700 },
    P2: { background: '#f3f4f6', color: '#6b7280', fontWeight: 600 },
  };
  return (
    <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, ...styles[p] }}>
      {p}
    </span>
  );
}

function StatusBadge({ s }: { s: string }) {
  if (s === 'wired') return <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, background: '#dcfce7', color: '#166534', fontWeight: 700 }}>WIRED</span>;
  if (s === 'partial') return <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, background: '#fef3c7', color: '#92400e', fontWeight: 700 }}>PARTIAL</span>;
  return <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 11, background: '#fee2e2', color: '#991b1b', fontWeight: 700 }}>NOT WIRED</span>;
}

// ── Measurement Gaps & Closure Plan section ────────────────────────────────────

function MeasurementGapsSection({ gaps }: { gaps: GapsSection }) {
  const p0Items = gaps.items.filter(g => g.priority === 'P0');

  return (
    <div style={{
      marginBottom: 24,
      borderRadius: 8,
      border: '2px solid #fca5a5',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 20px',
        background: '#fef2f2',
        borderBottom: '1px solid #fca5a5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <div>
          <span style={{ fontWeight: 800, fontSize: 15, color: '#991b1b' }}>
            Measurement Gaps &amp; Closure Plan
          </span>
          <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 10 }}>
            Not cosmetic — every gap has a closure plan in audit/founder_command_center_gap_closure_plan.md
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ padding: '4px 12px', background: '#fee2e2', color: '#991b1b', borderRadius: 6, fontSize: 13, fontWeight: 800 }}>
            P0: {gaps.p0_count}
          </span>
          <span style={{ padding: '4px 12px', background: '#fef3c7', color: '#92400e', borderRadius: 6, fontSize: 13, fontWeight: 700 }}>
            P1: {gaps.p1_count}
          </span>
          <span style={{ padding: '4px 12px', background: '#f3f4f6', color: '#6b7280', borderRadius: 6, fontSize: 13, fontWeight: 600 }}>
            P2: {gaps.p2_count}
          </span>
        </div>
      </div>

      {/* P0 gaps — shown as action items, not footnotes */}
      {p0Items.length > 0 && (
        <div style={{ padding: '0 20px 4px' }}>
          <div style={{ marginTop: 12, marginBottom: 8, fontSize: 11, fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            P0 — Blocking Founder Decisions
          </div>
          {p0Items.map(g => (
            <div key={g.id} style={{
              marginBottom: 10, padding: '10px 14px',
              background: '#fff7ed', borderRadius: 6,
              border: '1px solid #fed7aa',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <PriorityBadge p="P0" />
                <StatusBadge s={g.status} />
                {g.requires_mobile && (
                  <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>NEEDS MOBILE BUILD</span>
                )}
                <span style={{ fontWeight: 700, fontSize: 13, color: '#c2410c' }}>{g.label}</span>
              </div>
              {g.blocker && (
                <div style={{ fontSize: 12, color: '#c2410c', marginBottom: 4 }}>
                  <strong>Blocker:</strong> {g.blocker}
                </div>
              )}
              <div style={{ fontSize: 12, color: '#374151' }}>
                <strong>Next action:</strong> {g.next_action}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* P1/P2 summary */}
      <div style={{ padding: '8px 20px 14px' }}>
        <div style={{ marginTop: 4, marginBottom: 8, fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          P1 / P2 — Deferred (No Mobile Build Required Unless Noted)
        </div>
        {gaps.items.filter(g => g.priority !== 'P0').map(g => (
          <div key={g.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            padding: '6px 0', borderBottom: '1px solid var(--kalpx-border, #e5e7eb)',
            fontSize: 12,
          }}>
            <PriorityBadge p={g.priority} />
            <StatusBadge s={g.status} />
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 600, color: 'var(--kalpx-text)' }}>{g.label}</span>
              {g.requires_mobile && <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 6 }}>+mobile</span>}
            </div>
          </div>
        ))}
        {gaps.wired_this_session.length > 0 && (
          <div style={{ marginTop: 10, fontSize: 12, color: '#166534', fontWeight: 600 }}>
            ✓ Wired in V1: {gaps.wired_this_session.join(' · ')}
          </div>
        )}
      </div>
    </div>
  );
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
            {/* Top 8 summary cards */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
              <Stat label="New Users 7d" value={data.growth.new_7d} sub={`+${data.growth.new_today} today`} />
              <Stat label="DAU Proxy" value={data.growth.dau_proxy} sub="ritual activity" />
              <Stat label="Push Reachable %" value={pct(data.push_reachability.push_reachable_rate_pct)} warn={data.push_reachability.push_reachable_rate_pct < 50} />
              <Stat label="Ritual Users 7d" value={data.activation.users_with_any_ritual_7d} sub="any ritual" />
              <Stat label="Program Joins 7d" value={data.programs.joins_7d} />
              <Stat label="Notif Tap 7d" value={pct(data.notifications.tap_rate_7d_pct)} />
              <Stat label="Orphan Tokens" value={data.device_tokens.orphan} warn={data.device_tokens.orphan > 100} />
              <Stat label="Program D7 Rate" value={pct(data.programs.d7_rate_pct)} />
            </div>

            {/* MEASUREMENT GAPS — prominent, not a footnote */}
            {!isErrorSection(data.gaps) && (
              <MeasurementGapsSection gaps={data.gaps} />
            )}

            {/* Growth */}
            <SectionCard title="Growth" error={isErrorSection(data.growth) ? data.growth.error : undefined}>
              <Row label="Total active users" value={data.growth.total_users} />
              <Row label="New today" value={data.growth.new_today} />
              <Row label="New last 7 days" value={data.growth.new_7d} />
              <Row label="New last 30 days" value={data.growth.new_30d} />
              <Row label="DAU proxy" value={data.growth.dau_proxy} note={data.growth.dau_note} />
              <Row label="WAU proxy" value={data.growth.wau_proxy} />
              <Row
                label="First open 7d (Firebase)"
                value={data.growth.first_open_7d !== null ? data.growth.first_open_7d : '— not wired (G001)'}
              />
              <Row
                label="Install → signup rate"
                value={data.growth.install_to_signup_rate_pct !== null ? pct(data.growth.install_to_signup_rate_pct) : '— not wired (G001+G002)'}
              />
              <Note>{data.growth.install_note}</Note>
            </SectionCard>

            {/* Activation */}
            <SectionCard title="Activation" error={isErrorSection(data.activation) ? data.activation.error : undefined}>
              <SectionLabel>All-time distinct users</SectionLabel>
              <Row label="Completed quick chant (ever)" value={data.activation.users_ever_completed_quick_chant} />
              <Row label="Completed rhythm (ever)" value={data.activation.users_ever_completed_rhythm} />
              <Row label="Started inner path (ever)" value={data.activation.users_ever_started_inner_path} />
              <Row label="Used Tell Mitra (ever)" value={data.activation.users_ever_used_tell_mitra} />
              <Row label="Completed program Day 1 (ever)" value={data.activation.users_ever_completed_program_day_1} />
              <Row label="Any ritual (ever)" value={`${data.activation.users_with_any_ritual} (${pct(data.activation.activation_rate_pct)})`} />
              <SectionLabel>Last 7 days</SectionLabel>
              <Row label="Quick chant completions" value={data.activation.users_completed_quick_chant_7d} />
              <Row label="Rhythm completions" value={data.activation.users_completed_rhythm_7d} />
              <Row label="Inner path starts" value={data.activation.users_started_inner_path_7d} />
              <Row label="Tell Mitra messages" value={data.activation.users_used_tell_mitra_7d} />
              <Row label="Program Day 1 completions" value={data.activation.users_completed_program_day_1_7d} />
              <Row label="Any ritual" value={data.activation.users_with_any_ritual_7d} />
              <SectionLabel>Signup → First Ritual (30-day cohort)</SectionLabel>
              {(() => {
                const sfr = data.activation.signup_to_first_ritual;
                return (
                  <>
                    <Row label="New users (last 30d)" value={sfr.total_new_30d} />
                    <Row label="First ritual within 1 day" value={`${sfr.first_ritual_within_1d} (${pct(sfr.rate_1d_pct)})`} />
                    <Row label="First ritual within 7 days" value={`${sfr.first_ritual_within_7d} (${pct(sfr.rate_7d_pct)})`} />
                    <Note>{sfr.note}</Note>
                  </>
                );
              })()}
            </SectionCard>

            {/* Push Reachability */}
            <SectionCard title="Push Reachability" error={isErrorSection(data.push_reachability) ? data.push_reachability.error : undefined}>
              <Row label="Push reachable users" value={`${data.push_reachability.push_reachable_users} (${pct(data.push_reachability.push_reachable_rate_pct)})`} note="linked token + valid IANA tz + push on" />
              <Row label="Users with linked device token" value={data.push_reachability.linked_device_token_users} />
              <Row label="Users with push enabled" value={data.push_reachability.push_enabled_users} />
              <SectionLabel>Timezone health (IANA validated)</SectionLabel>
              <Row label="Valid IANA timezone users" value={data.push_reachability.valid_timezone_users} note="pytz validated" />
              <Row label="Confirmed timezone users" value={data.push_reachability.confirmed_timezone_users} note="device/user-set source" />
              <Row label="Default-but-valid timezone users" value={data.push_reachability.default_but_valid_timezone_users} />
              <Row
                label="Invalid timezone users"
                value={data.push_reachability.invalid_timezone_users}
                note="data quality issue"
              />
              {data.push_reachability.invalid_timezone_users > 0 && (
                <div style={{ marginTop: 8, padding: '8px 12px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 6, fontSize: 12, color: '#c2410c' }}>
                  {data.push_reachability.invalid_timezone_users} users have non-IANA timezone strings — excluded from push reachability.
                </div>
              )}
              <Note>{data.push_reachability.push_reachability_note}</Note>
            </SectionCard>

            {/* Device Tokens */}
            <SectionCard title="Device Tokens" error={isErrorSection(data.device_tokens) ? data.device_tokens.error : undefined}>
              <Row label="Total tokens" value={data.device_tokens.total} />
              <Row label="Linked tokens" value={`${data.device_tokens.linked} (${pct(data.device_tokens.linked_rate_pct)})`} />
              <Row label="Orphan tokens" value={`${data.device_tokens.orphan} (${pct(data.device_tokens.orphan_rate_pct)})`} />
              <Row label="New linked (24h)" value={data.device_tokens.new_linked_24h} />
              <Row label="New linked (7d)" value={data.device_tokens.new_linked_7d} />
              <SectionLabel>By platform</SectionLabel>
              <Row label="iOS" value={`${data.device_tokens.ios.linked} linked · ${data.device_tokens.ios.orphan} orphan`} />
              <Row label="Android" value={`${data.device_tokens.android.linked} linked · ${data.device_tokens.android.orphan} orphan`} />
              <Row label="Web" value={`${data.device_tokens.web.linked} linked · ${data.device_tokens.web.orphan} orphan`} />
              <SectionLabel>Orphan age</SectionLabel>
              <Row label="&lt; 1 day" value={data.device_tokens.orphan_by_age.lt_1d} />
              <Row label="1–7 days" value={data.device_tokens.orphan_by_age['1_to_7d']} />
              <Row label="7–30 days" value={data.device_tokens.orphan_by_age['7_to_30d']} />
              <Row label="&gt; 30 days" value={data.device_tokens.orphan_by_age.gt_30d} />
              <Note>{data.device_tokens.adoption_note}</Note>
            </SectionCard>

            {/* Notifications */}
            <SectionCard title="Notifications" error={isErrorSection(data.notifications) ? data.notifications.error : undefined}>
              <Row label="Tap rate (24h)" value={pct(data.notifications.tap_rate_24h_pct)} />
              <Row label="Tap rate (7d)" value={pct(data.notifications.tap_rate_7d_pct)} />
              <Row label="Send success rate (24h)" value={pct(data.notifications.send_success_rate_pct)} />
              <SectionLabel>Notification → Ritual Return (7d)</SectionLabel>
              {(() => {
                const ntr = data.notifications.notification_to_ritual;
                return (
                  <>
                    <Row label="Notifications tapped" value={ntr.tapped_7d} />
                    <Row label="Ritual completed within 2h of tap" value={ntr.completed_ritual_after_tap_7d} />
                    <Row label="Tap-to-ritual rate" value={ntr.rate_pct !== null ? pct(ntr.rate_pct) : '—'} />
                    <Note>{ntr.note}</Note>
                  </>
                );
              })()}
              <SectionLabel>Last 24h by state</SectionLabel>
              {Object.entries(data.notifications.last_24h).map(([state, count]) => (
                <Row key={state} label={state} value={count} />
              ))}
              {Object.keys(data.notifications.last_24h).length === 0 && (
                <div style={{ color: '#9ca3af', fontSize: 13 }}>No notifications in last 24h</div>
              )}
              <SectionLabel>Suppression reasons (7d)</SectionLabel>
              {data.notifications.suppression_reasons_7d.length === 0
                ? <div style={{ color: '#9ca3af', fontSize: 13 }}>None</div>
                : data.notifications.suppression_reasons_7d.map((r) => (
                  <Row key={r.reason} label={r.reason} value={r.count} />
                ))}
              <Note>States present (30d): {data.notifications.states_present_30d.join(', ') || 'none'}</Note>
            </SectionCard>

            {/* Rituals */}
            <SectionCard title="Ritual Engagement" error={isErrorSection(data.rituals) ? data.rituals.error : undefined}>
              <SectionLabel>Quick Chant / Japa</SectionLabel>
              <Row label="Sessions today" value={data.rituals.quick_chant.sessions_today} />
              <Row label="Completed today" value={data.rituals.quick_chant.completed_today} />
              <Row label="Sessions (7d)" value={data.rituals.quick_chant.sessions_7d} />
              <Row label="Completed (7d)" value={data.rituals.quick_chant.completed_7d} />
              <SectionLabel>Rhythm</SectionLabel>
              <Row label="Completions today" value={data.rituals.rhythm.completions_today} />
              <Row label="Completions (7d)" value={data.rituals.rhythm.completions_7d} />
              <Row label="Completions (30d)" value={data.rituals.rhythm.completions_30d} />
              <SectionLabel>Inner Path</SectionLabel>
              <Row label="Activity events (7d)" value={data.rituals.inner_path.activity_events_7d} />
              <Row label="User-day pairs (7d)" value={data.rituals.inner_path.user_day_pairs_7d} />
              <SectionLabel>Tell Mitra</SectionLabel>
              <Row label="Messages today" value={data.rituals.tell_mitra.messages_today} />
              <Row label="Messages (7d)" value={data.rituals.tell_mitra.messages_7d} />
              <Row label="Active users (7d)" value={data.rituals.tell_mitra.active_users_7d} />
            </SectionCard>

            {/* Retention */}
            <SectionCard title="Retention" error={isErrorSection(data.retention) ? data.retention.error : undefined}>
              <Row label="Active today (proxy)" value={data.retention.active_today} />
              <Row label="Active yesterday (proxy)" value={data.retention.active_yesterday} />
              <Row label="Active last 7 days (proxy)" value={data.retention.active_7d_proxy} />
              <SectionLabel>Cross-Surface Repeat Users (7d)</SectionLabel>
              <Row label="2+ active days (all surfaces)" value={data.retention.cross_surface.users_2plus_active_days_7d} note={data.retention.cross_surface.source} />
              <Row label="3+ active days (all surfaces)" value={data.retention.cross_surface.users_3plus_active_days_7d} />
              <Row label="2+ active days (Rhythm only)" value={data.retention.users_2plus_days_7d_rhythm} note="legacy comparison" />
              <Note>{data.retention.note}</Note>
            </SectionCard>

            {/* Programs */}
            <SectionCard title="Programs" error={isErrorSection(data.programs) ? data.programs.error : undefined}>
              <Row label="Active campaigns" value={data.programs.active_campaigns} />
              <Row label="Total joins" value={data.programs.total_joins} />
              <Row label="Joins (7d)" value={data.programs.joins_7d} />
              <Row label="D1 completions" value={data.programs.d1_total} />
              <Row label="D3 completions" value={data.programs.d3_total} />
              <Row label="D7 completions" value={data.programs.d7_total} />
              <Row label="Overall D7 rate" value={pct(data.programs.d7_rate_pct)} />
              <Row label="Shares (ProgramShare)" value={data.programs.shares_total} />
              <Row label="Testimonials (ProgramTestimonial)" value={data.programs.testimonials_total} />
              <Row label="Kill signals (≥15 joined, 0 D3)" value={data.programs.kill_signal_count} />
              <Row label="Support problems (>10% click)" value={data.programs.support_problem_count} />
              <SectionLabel>Classification</SectionLabel>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.entries(data.programs.classification_counts).map(([cls, count]) => (
                  <span key={cls} style={{ padding: '3px 10px', borderRadius: 4, fontSize: 12, fontWeight: 700, ...clsBadgeStyle(cls as Classification) }}>
                    {cls}: {count}
                  </span>
                ))}
              </div>
              {data.programs.top_5_by_d7_rate.length > 0 && (
                <>
                  <SectionLabel>Top 5 by D7 rate</SectionLabel>
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
              <Row label="No source recorded" value={`${data.attribution.unknown_source_count} (${pct(data.attribution.unknown_source_rate_pct)})`} />
              <SectionLabel>By source channel</SectionLabel>
              {data.attribution.by_source_channel.map((r) => (
                <Row key={r.value} label={r.value} value={r.count} />
              ))}
              <SectionLabel>By UTM source (top 20)</SectionLabel>
              {data.attribution.by_utm_source.length === 0
                ? <div style={{ color: '#9ca3af', fontSize: 13 }}>No UTM data</div>
                : data.attribution.by_utm_source.map((r) => (
                  <Row key={r.value} label={r.value} value={r.count} />
                ))}
              <Note>{data.attribution.install_note}</Note>
            </SectionCard>

            {/* Mobile Analytics Readiness */}
            <SectionCard title="Mobile Analytics Readiness">
              <Row label="iOS Firebase Analytics" value={<Bool v={data.mobile_analytics.ios_firebase_enabled} />} />
              <Row label="Android Firebase Analytics" value={<Bool v={data.mobile_analytics.android_firebase_enabled} />} />
              <Row label="initAnalytics() called on launch" value={<Bool v={data.mobile_analytics.init_analytics_called_on_launch} />} />
              <Row label="platform in events" value={<Bool v={data.mobile_analytics.platform_in_events} />} />
              <Row label="app_version in events" value={<Bool v={data.mobile_analytics.app_version_in_events} />} />
              <Row label="iOS blocker" value={data.mobile_analytics.ios_blocker} />
              <Row label="Track B branch" value={data.mobile_analytics.track_b_branch} />
              {data.mobile_analytics.eas_secret_action_required && (
                <div style={{ marginTop: 10, padding: '10px 14px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 6, fontSize: 12, color: '#92400e' }}>
                  <strong>Action required (Parag):</strong> {data.mobile_analytics.eas_secret_action_required}
                </div>
              )}
              <Note>{data.mobile_analytics.note}</Note>
            </SectionCard>

            {/* Quality */}
            <SectionCard title="Quality">
              <Row label="Generic notification fallbacks" value={data.quality.generic_notification_fallbacks} />
              <Row label="API errors" value={data.quality.api_errors} />
              <Row label="Crash data" value={data.quality.crash_data} />
              <Note>{data.quality.note}</Note>
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
