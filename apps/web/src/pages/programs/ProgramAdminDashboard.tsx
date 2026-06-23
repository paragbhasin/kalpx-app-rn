import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppShell } from '../../components/ui/AppShell';
import { api } from '../../lib/api';

type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
type CampaignClassification = 'BREAKOUT' | 'STRONG' | 'ACCEPTABLE' | 'WEAK';

interface CampaignSummary {
  code: string;
  leader_name: string;
  community_name: string;
  status: CampaignStatus;
  metrics: {
    joined: number;
    d1_rate_pct: number | null;
    d7_rate_pct: number | null;
    support_click_rate_pct: number;
    support_problem: boolean;
    kill_signal: boolean;
    classification: CampaignClassification;
    rates_suppressed: boolean;
  };
}

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'paused', label: 'Paused' },
  { value: 'archived', label: 'Archived' },
];

function statusBadgeStyle(status: CampaignStatus): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  };
  switch (status) {
    case 'active':
      return { ...base, background: '#dcfce7', color: '#166534' };
    case 'draft':
      return { ...base, background: '#f3f4f6', color: '#374151' };
    case 'paused':
      return { ...base, background: '#fef3c7', color: '#92400e' };
    case 'completed':
      return { ...base, background: '#dbeafe', color: '#1e40af' };
    case 'archived':
      return { ...base, background: '#f3f4f6', color: '#6b7280' };
    default:
      return { ...base, background: '#f3f4f6', color: '#374151' };
  }
}

function classificationBadgeStyle(classification: CampaignClassification): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  };
  switch (classification) {
    case 'BREAKOUT':
      return { ...base, background: '#f3e8ff', color: '#6b21a8' };
    case 'STRONG':
      return { ...base, background: '#dcfce7', color: '#166534' };
    case 'ACCEPTABLE':
      return { ...base, background: '#fef3c7', color: '#92400e' };
    case 'WEAK':
      return { ...base, background: '#fee2e2', color: '#991b1b' };
    default:
      return { ...base, background: '#f3f4f6', color: '#374151' };
  }
}

function formatPct(val: number | null | undefined, suppressed?: boolean): string {
  if (suppressed) return 'N/A';
  if (val === null || val === undefined) return '—';
  return `${val}%`;
}

export function ProgramAdminDashboard() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params: Record<string, string> = {};
    if (statusFilter) params.status = statusFilter;

    api.get('programs/admin/campaigns/', { params })
      .then((res) => {
        setCampaigns(res.data?.results ?? res.data ?? []);
      })
      .catch((err) => {
        setError(err?.response?.data?.detail ?? 'Failed to load campaigns.');
      })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <AppShell>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 64px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--kalpx-text)', margin: 0 }}>
              Program Campaigns
            </h1>
            <p style={{ fontSize: 14, color: 'var(--kalpx-text-soft)', marginTop: 4, marginBottom: 0 }}>
              Admin view — aggregate metrics only
            </p>
          </div>
          <Link
            to="/programs/admin/new/"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              background: 'var(--kalpx-cta)',
              color: 'var(--kalpx-cta-text)',
              borderRadius: 'var(--kalpx-r-md)',
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            + New Campaign
          </Link>
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: '1px solid',
                borderColor: statusFilter === f.value ? 'var(--kalpx-gold)' : 'var(--kalpx-border)',
                background: statusFilter === f.value ? 'var(--kalpx-gold)' : 'transparent',
                color: statusFilter === f.value ? '#000' : 'var(--kalpx-text-soft)',
                fontWeight: statusFilter === f.value ? 600 : 400,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--kalpx-text-muted)' }}>
            Loading campaigns...
          </div>
        ) : error ? (
          <div style={{ padding: 24, background: '#fee2e2', borderRadius: 8, color: '#991b1b' }}>
            {error}
          </div>
        ) : campaigns.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center', color: 'var(--kalpx-text-soft)' }}>
            <p style={{ fontSize: 16, marginBottom: 12 }}>No campaigns yet.</p>
            <Link
              to="/programs/admin/new/"
              style={{ color: 'var(--kalpx-gold)', fontWeight: 600, textDecoration: 'none' }}
            >
              Create your first campaign
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--kalpx-card-bg)', borderBottom: '2px solid var(--kalpx-border)' }}>
                  {['Code', 'Leader', 'Community', 'Status', 'Joined', 'D1%', 'D7%', 'Support%', 'Classification'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 12px',
                        textAlign: 'left',
                        fontWeight: 600,
                        color: 'var(--kalpx-text-soft)',
                        fontSize: 12,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr
                    key={c.code}
                    onClick={() => navigate(`/programs/admin/${c.code}/`)}
                    style={{
                      borderBottom: '1px solid var(--kalpx-border)',
                      cursor: 'pointer',
                      background: c.metrics?.kill_signal ? '#fffbeb' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background = c.metrics?.kill_signal ? '#fef3c7' : 'var(--kalpx-chip-bg)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLTableRowElement).style.background = c.metrics?.kill_signal ? '#fffbeb' : 'transparent';
                    }}
                  >
                    <td style={{ padding: '12px 12px', fontWeight: 700, fontFamily: 'monospace', color: 'var(--kalpx-text)' }}>
                      {c.code}
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--kalpx-text)' }}>
                      {c.leader_name}
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--kalpx-text-soft)' }}>
                      {c.community_name}
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <span style={statusBadgeStyle(c.status)}>{c.status}</span>
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--kalpx-text)' }}>
                      {c.metrics?.joined ?? '—'}
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--kalpx-text)' }}>
                      {formatPct(c.metrics?.d1_rate_pct, c.metrics?.rates_suppressed)}
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--kalpx-text)' }}>
                      {formatPct(c.metrics?.d7_rate_pct, c.metrics?.rates_suppressed)}
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <span style={{
                        color: (c.metrics?.support_click_rate_pct ?? 0) > 10 ? '#dc2626' : 'var(--kalpx-text)',
                        fontWeight: (c.metrics?.support_click_rate_pct ?? 0) > 10 ? 600 : 400,
                      }}>
                        {c.metrics?.support_click_rate_pct !== undefined ? `${c.metrics.support_click_rate_pct}%` : '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      {c.metrics?.classification ? (
                        <span style={classificationBadgeStyle(c.metrics.classification)}>
                          {c.metrics.classification}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </AppShell>
  );
}
