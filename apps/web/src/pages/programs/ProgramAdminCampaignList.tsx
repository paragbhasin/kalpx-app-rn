import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/ui/AppShell';
import { api } from '../../lib/api';

type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
type Classification = 'BREAKOUT' | 'STRONG' | 'ACCEPTABLE' | 'WEAK';
type SortKey = 'joined' | 'd7_rate_pct' | 'd1_rate_pct' | 'classification';

interface CampaignRow {
  code: string;
  leader_name: string;
  community_name: string;
  leader_type: string;
  status: CampaignStatus;
  joined: number;
  d1_count: number;
  d1_rate_pct: number;
  d3_count: number;
  d3_rate_pct: number;
  d7_count: number;
  d7_rate_pct: number;
  support_click_rate_pct: number;
  support_problem: boolean;
  kill_signal: boolean;
  classification: Classification;
  created_at: string;
}

const CLASSIFICATION_ORDER: Record<Classification, number> = {
  BREAKOUT: 0, STRONG: 1, ACCEPTABLE: 2, WEAK: 3,
};

function classificationBadge(c: Classification): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-block', padding: '2px 8px', borderRadius: 4,
    fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
  };
  switch (c) {
    case 'BREAKOUT':   return { ...base, background: '#dcfce7', color: '#166534' };
    case 'STRONG':     return { ...base, background: '#dbeafe', color: '#1e40af' };
    case 'ACCEPTABLE': return { ...base, background: '#fef3c7', color: '#92400e' };
    case 'WEAK':       return { ...base, background: '#fee2e2', color: '#991b1b' };
  }
}

function statusBadge(s: CampaignStatus): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-block', padding: '2px 8px', borderRadius: 4,
    fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
  };
  switch (s) {
    case 'active':    return { ...base, background: '#dcfce7', color: '#166534' };
    case 'draft':     return { ...base, background: '#f3f4f6', color: '#374151' };
    case 'paused':    return { ...base, background: '#fef3c7', color: '#92400e' };
    case 'completed': return { ...base, background: '#dbeafe', color: '#1e40af' };
    case 'archived':  return { ...base, background: '#f3f4f6', color: '#6b7280' };
    default:          return { ...base, background: '#f3f4f6', color: '#374151' };
  }
}

function d7Color(pct: number): string {
  if (pct >= 50) return '#166534';
  if (pct >= 30) return '#92400e';
  return '#991b1b';
}

function d7Bg(pct: number): string {
  if (pct >= 50) return '#dcfce7';
  if (pct >= 30) return '#fef3c7';
  return '#fee2e2';
}

export function ProgramAdminCampaignList() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>('joined');
  const [filterStatus, setFilterStatus] = useState<CampaignStatus | ''>('');
  const [filterClassification, setFilterClassification] = useState<Classification | ''>('');
  const [filterAtRisk, setFilterAtRisk] = useState(false);
  const [filterSupportProblem, setFilterSupportProblem] = useState(false);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filterStatus) params.status = filterStatus;
    const query = new URLSearchParams(params).toString();
    setLoading(true);
    setError(null);
    api
      .get<CampaignRow[]>(`programs/admin/campaigns/${query ? '?' + query : ''}`)
      .then((res) => setRows(res.data))
      .catch(() => setError('Failed to load campaigns.'))
      .finally(() => setLoading(false));
  }, [filterStatus]);

  const displayed = rows
    .filter((r) => !filterClassification || r.classification === filterClassification)
    .filter((r) => !filterAtRisk || r.kill_signal)
    .filter((r) => !filterSupportProblem || r.support_problem)
    .slice()
    .sort((a, b) => {
      if (sortKey === 'joined') return b.joined - a.joined;
      if (sortKey === 'd7_rate_pct') return b.d7_rate_pct - a.d7_rate_pct;
      if (sortKey === 'd1_rate_pct') return b.d1_rate_pct - a.d1_rate_pct;
      if (sortKey === 'classification')
        return CLASSIFICATION_ORDER[a.classification] - CLASSIFICATION_ORDER[b.classification];
      return 0;
    });

  return (
    <AppShell>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--kalpx-text)', margin: 0 }}>
              Campaigns
            </h1>
            <p style={{ fontSize: 13, color: 'var(--kalpx-text-soft)', margin: '4px 0 0' }}>
              {loading ? '…' : `${displayed.length} of ${rows.length} campaigns`}
            </p>
          </div>
          <button
            onClick={() => navigate('/programs/admin/new/')}
            style={{
              background: 'var(--kalpx-gold, #b58a3a)', color: '#fff',
              border: 'none', borderRadius: 6, padding: '9px 18px',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            + New Campaign
          </button>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20, alignItems: 'center' }}>
          <label style={labelStyle}>
            Sort:
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} style={selectStyle}>
              <option value="joined">Joined (most)</option>
              <option value="d7_rate_pct">D7 rate</option>
              <option value="d1_rate_pct">D1 rate</option>
              <option value="classification">Classification</option>
            </select>
          </label>

          <label style={labelStyle}>
            Status:
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as CampaignStatus | '')} style={selectStyle}>
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </label>

          <label style={labelStyle}>
            Classification:
            <select value={filterClassification} onChange={(e) => setFilterClassification(e.target.value as Classification | '')} style={selectStyle}>
              <option value="">All</option>
              <option value="BREAKOUT">Breakout</option>
              <option value="STRONG">Strong</option>
              <option value="ACCEPTABLE">Acceptable</option>
              <option value="WEAK">Weak</option>
            </select>
          </label>

          <label style={{ ...labelStyle, flexDirection: 'row', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={filterAtRisk} onChange={(e) => setFilterAtRisk(e.target.checked)} />
            At risk only
          </label>

          <label style={{ ...labelStyle, flexDirection: 'row', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
            <input type="checkbox" checked={filterSupportProblem} onChange={(e) => setFilterSupportProblem(e.target.checked)} />
            Support problem
          </label>
        </div>

        {/* Error */}
        {error && (
          <div style={{ padding: 16, background: '#fee2e2', color: '#991b1b', borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--kalpx-text-soft)', fontSize: 14 }}>
            Loading campaigns…
          </div>
        )}

        {/* Empty */}
        {!loading && !error && displayed.length === 0 && (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--kalpx-text-soft)', fontSize: 14 }}>
            No campaigns match the current filters.
          </div>
        )}

        {/* Table */}
        {!loading && displayed.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--kalpx-border, #e5e7eb)' }}>
                  {['Code', 'Leader / Community', 'Status', 'Joined', 'D1%', 'D3%', 'D7%', 'Classification', 'Flags', ''].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '10px 12px', textAlign: 'left', fontWeight: 700,
                        fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5,
                        color: 'var(--kalpx-text-soft)', whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map((row) => (
                  <tr
                    key={row.code}
                    style={{ borderBottom: '1px solid var(--kalpx-border, #e5e7eb)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--kalpx-surface-hover, #f9fafb)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                  >
                    <td style={cellStyle}>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13, color: 'var(--kalpx-text)' }}>
                        {row.code}
                      </span>
                    </td>

                    <td style={cellStyle}>
                      <div style={{ fontWeight: 600, color: 'var(--kalpx-text)' }}>{row.leader_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--kalpx-text-soft)', marginTop: 2 }}>{row.community_name}</div>
                    </td>

                    <td style={cellStyle}>
                      <span style={statusBadge(row.status)}>{row.status}</span>
                    </td>

                    <td style={{ ...cellStyle, fontWeight: 700, color: 'var(--kalpx-text)', textAlign: 'center' }}>
                      {row.joined}
                    </td>

                    <td style={{ ...cellStyle, textAlign: 'center', color: 'var(--kalpx-text-soft)' }}>
                      {row.joined > 0 ? `${row.d1_rate_pct}%` : '—'}
                    </td>

                    <td style={{ ...cellStyle, textAlign: 'center', color: 'var(--kalpx-text-soft)' }}>
                      {row.joined > 0 ? `${row.d3_rate_pct}%` : '—'}
                    </td>

                    <td style={{ ...cellStyle, textAlign: 'center' }}>
                      {row.joined > 0 ? (
                        <span style={{
                          display: 'inline-block', padding: '3px 10px', borderRadius: 4,
                          fontWeight: 700, fontSize: 13,
                          background: d7Bg(row.d7_rate_pct), color: d7Color(row.d7_rate_pct),
                        }}>
                          {row.d7_rate_pct}%
                        </span>
                      ) : '—'}
                    </td>

                    <td style={cellStyle}>
                      <span style={classificationBadge(row.classification)}>{row.classification}</span>
                    </td>

                    <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
                      {row.kill_signal && (
                        <span style={{
                          display: 'inline-block', marginRight: 6, padding: '2px 7px',
                          borderRadius: 4, fontSize: 11, fontWeight: 700,
                          background: '#fee2e2', color: '#991b1b',
                        }}>
                          KILL
                        </span>
                      )}
                      {row.support_problem && (
                        <span style={{
                          display: 'inline-block', padding: '2px 7px',
                          borderRadius: 4, fontSize: 11, fontWeight: 700,
                          background: '#fef3c7', color: '#92400e',
                        }}>
                          SUPPORT
                        </span>
                      )}
                    </td>

                    <td style={{ ...cellStyle, textAlign: 'right' }}>
                      <button
                        onClick={() => navigate(`/programs/admin/${row.code}/`)}
                        style={{
                          background: 'none', border: '1px solid var(--kalpx-border, #d1d5db)',
                          borderRadius: 4, padding: '5px 12px', fontSize: 12,
                          color: 'var(--kalpx-text)', cursor: 'pointer', fontWeight: 500,
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Back link */}
        <div style={{ marginTop: 32 }}>
          <button
            onClick={() => navigate('/programs/admin/')}
            style={{ background: 'none', border: 'none', color: 'var(--kalpx-text-soft)', cursor: 'pointer', fontSize: 13 }}
          >
            ← Back to Admin
          </button>
        </div>
      </div>
    </AppShell>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: 4,
  fontSize: 12, color: 'var(--kalpx-text-soft)', fontWeight: 600,
};

const selectStyle: React.CSSProperties = {
  fontSize: 13, padding: '6px 10px', borderRadius: 4,
  border: '1px solid var(--kalpx-border, #d1d5db)',
  color: 'var(--kalpx-text)', background: 'var(--kalpx-surface, #fff)', cursor: 'pointer',
};

const cellStyle: React.CSSProperties = {
  padding: '12px 12px', verticalAlign: 'middle',
};
