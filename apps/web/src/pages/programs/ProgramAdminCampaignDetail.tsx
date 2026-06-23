import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { AppShell } from '../../components/ui/AppShell';
import { api } from '../../lib/api';

type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
type CampaignClassification = 'BREAKOUT' | 'STRONG' | 'ACCEPTABLE' | 'WEAK';

interface CampaignMetrics {
  joined: number;
  d1_count: number;
  d1_rate_pct: number | null;
  d2_count: number;
  d2_rate_pct: number | null;
  d3_count: number;
  d3_rate_pct: number | null;
  d7_count: number;
  d7_rate_pct: number | null;
  support_click_count: number;
  support_click_rate_pct: number;
  support_problem: boolean;
  kill_signal: boolean;
  classification: CampaignClassification;
  rates_suppressed: boolean;
  d8: { inner_path: number; daily_rhythm: number; quick_chant: number };
}

interface CampaignDetail {
  code: string;
  leader_name: string;
  leader_type: string;
  leader_email: string;
  community_name: string;
  status: CampaignStatus;
  template: { title: string; duration_days: number };
  support_contact_url: string;
  internal_ops_owner: string;
  estimated_invites: number;
  notes: string;
  created_at: string;
  metrics: CampaignMetrics;
  qr_url: string;
}

function statusBadgeStyle(status: CampaignStatus): React.CSSProperties {
  const base: React.CSSProperties = {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  };
  switch (status) {
    case 'active': return { ...base, background: '#dcfce7', color: '#166534' };
    case 'draft': return { ...base, background: '#f3f4f6', color: '#374151' };
    case 'paused': return { ...base, background: '#fef3c7', color: '#92400e' };
    case 'completed': return { ...base, background: '#dbeafe', color: '#1e40af' };
    case 'archived': return { ...base, background: '#f3f4f6', color: '#6b7280' };
    default: return { ...base, background: '#f3f4f6', color: '#374151' };
  }
}

function formatPct(val: number | null | undefined, suppressed?: boolean): string {
  if (suppressed) return 'N/A';
  if (val === null || val === undefined) return '—';
  return `${val}%`;
}

function downloadQr(code: string) {
  const canvas = document.getElementById('program-qr-canvas') as HTMLCanvasElement;
  if (!canvas) return;
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `kalpx-invite-${code}.png`;
  link.click();
}

export function ProgramAdminCampaignDetail() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Inline edit state
  const [editingSupportUrl, setEditingSupportUrl] = useState(false);
  const [editingOpsOwner, setEditingOpsOwner] = useState(false);
  const [supportUrlDraft, setSupportUrlDraft] = useState('');
  const [opsOwnerDraft, setOpsOwnerDraft] = useState('');
  const [patchError, setPatchError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    setError(null);
    api.get(`programs/admin/campaigns/${code}/`)
      .then((res) => {
        setCampaign(res.data);
      })
      .catch((err) => {
        setError(err?.response?.data?.detail ?? 'Failed to load campaign.');
      })
      .finally(() => setLoading(false));
  }, [code]);

  async function handleStatusChange(newStatus: CampaignStatus) {
    if (!code || !campaign) return;
    if (newStatus === 'archived') {
      if (!window.confirm(`Archive campaign ${code}? This cannot be easily undone.`)) return;
    }
    try {
      const res = await api.patch(`programs/admin/campaigns/${code}/`, { status: newStatus });
      setCampaign((prev) => prev ? { ...prev, status: res.data.status } : prev);
      setPatchError(null);
    } catch (err: any) {
      setPatchError(err?.response?.data?.detail ?? 'Failed to update status.');
    }
  }

  async function saveSupportUrl() {
    if (!code) return;
    try {
      const res = await api.patch(`programs/admin/campaigns/${code}/`, { support_contact_url: supportUrlDraft });
      setCampaign((prev) => prev ? { ...prev, support_contact_url: res.data.support_contact_url } : prev);
      setEditingSupportUrl(false);
      setPatchError(null);
    } catch (err: any) {
      setPatchError(err?.response?.data?.detail ?? 'Failed to save support URL.');
    }
  }

  async function saveOpsOwner() {
    if (!code) return;
    try {
      const res = await api.patch(`programs/admin/campaigns/${code}/`, { internal_ops_owner: opsOwnerDraft });
      setCampaign((prev) => prev ? { ...prev, internal_ops_owner: res.data.internal_ops_owner } : prev);
      setEditingOpsOwner(false);
      setPatchError(null);
    } catch (err: any) {
      setPatchError(err?.response?.data?.detail ?? 'Failed to save ops owner.');
    }
  }

  function copyLink() {
    const url = `${window.location.origin}/join/${code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) {
    return (
      <AppShell>
        <div style={{ padding: 64, textAlign: 'center', color: 'var(--kalpx-text-muted)' }}>
          Loading campaign...
        </div>
      </AppShell>
    );
  }

  if (error || !campaign) {
    return (
      <AppShell>
        <div style={{ maxWidth: 640, margin: '32px auto', padding: '0 20px' }}>
          <div style={{ padding: 24, background: '#fee2e2', borderRadius: 8, color: '#991b1b' }}>
            {error ?? 'Campaign not found.'}
          </div>
          <button
            onClick={() => navigate('/programs/admin/')}
            style={{ marginTop: 16, background: 'none', border: 'none', color: 'var(--kalpx-gold)', cursor: 'pointer', fontSize: 14 }}
          >
            ← Back to campaigns
          </button>
        </div>
      </AppShell>
    );
  }

  const m = campaign.metrics;
  const joinUrl = `${window.location.origin}/join/${campaign.code}`;

  return (
    <AppShell>
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '32px 20px 80px' }}>

        {/* A. Header */}
        <div style={{ marginBottom: 32 }}>
          <button
            onClick={() => navigate('/programs/admin/')}
            style={{ background: 'none', border: 'none', color: 'var(--kalpx-text-soft)', cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 12 }}
          >
            ← Back to campaigns
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--kalpx-text)', margin: 0, fontFamily: 'monospace' }}>
              {campaign.code}
            </h1>
            <span style={statusBadgeStyle(campaign.status)}>{campaign.status}</span>
          </div>
          <p style={{ fontSize: 15, color: 'var(--kalpx-text-soft)', marginTop: 6, marginBottom: 0 }}>
            {campaign.leader_name} · {campaign.community_name}
          </p>

          {/* Status action buttons — Phase 9 */}
          <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {campaign.status === 'draft' && (
              <button
                onClick={() => handleStatusChange('active')}
                style={{ padding: '8px 18px', background: '#166534', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
              >
                Publish
              </button>
            )}
            {campaign.status === 'active' && (
              <button
                onClick={() => handleStatusChange('paused')}
                style={{ padding: '8px 18px', background: '#92400e', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
              >
                Pause
              </button>
            )}
            {campaign.status === 'paused' && (
              <button
                onClick={() => handleStatusChange('active')}
                style={{ padding: '8px 18px', background: '#166534', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
              >
                Activate
              </button>
            )}
            {(campaign.status === 'active' || campaign.status === 'paused') && (
              <button
                onClick={() => handleStatusChange('archived')}
                style={{ padding: '8px 18px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
              >
                Archive
              </button>
            )}
          </div>
          {patchError && (
            <p style={{ marginTop: 8, color: '#dc2626', fontSize: 13 }}>{patchError}</p>
          )}
        </div>

        {/* B. Funnel */}
        <div style={{ background: 'var(--kalpx-card-bg)', border: '1px solid var(--kalpx-border)', borderRadius: 'var(--kalpx-r-lg)', padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--kalpx-text-soft)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16, marginTop: 0 }}>
            Retention Funnel
          </h2>
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto' }}>
            {[
              { label: 'Joined', count: m.joined, pct: null, showPct: false },
              { label: 'D1', count: m.d1_count, pct: m.d1_rate_pct, showPct: true },
              { label: 'D2', count: m.d2_count, pct: m.d2_rate_pct, showPct: true },
              { label: 'D3', count: m.d3_count, pct: m.d3_rate_pct, showPct: true },
              { label: 'D7', count: m.d7_count, pct: m.d7_rate_pct, showPct: true },
            ].map((step, i) => (
              <div key={step.label} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && (
                  <span style={{ color: 'var(--kalpx-text-muted)', fontSize: 18, margin: '0 8px' }}>→</span>
                )}
                <div style={{ textAlign: 'center', minWidth: 72 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--kalpx-text)' }}>
                    {step.count}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--kalpx-text-muted)', fontWeight: 500 }}>
                    {step.label}
                  </div>
                  {step.showPct && (
                    <div style={{ fontSize: 13, color: 'var(--kalpx-text-soft)', marginTop: 2 }}>
                      {formatPct(step.pct, m.rates_suppressed)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {m.rates_suppressed && (
            <p style={{ marginTop: 12, fontSize: 12, color: 'var(--kalpx-text-muted)', marginBottom: 0 }}>
              Rates suppressed — sample too small (&lt;5).
            </p>
          )}
        </div>

        {/* C. Alerts */}
        {m.kill_signal && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '14px 18px', marginBottom: 16, color: '#991b1b', fontWeight: 600 }}>
            Kill signal: {m.joined} joined, 0 returned on Day 3.
          </div>
        )}
        {m.support_problem && (
          <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, padding: '14px 18px', marginBottom: 16, color: '#92400e', fontWeight: 600 }}>
            Support click rate {m.support_click_rate_pct}% — review onboarding copy.
          </div>
        )}

        {/* D. Day 8 Continuation */}
        {m.d7_count > 0 && (
          <div style={{ background: 'var(--kalpx-card-bg)', border: '1px solid var(--kalpx-border)', borderRadius: 'var(--kalpx-r-lg)', padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--kalpx-text-soft)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16, marginTop: 0 }}>
              Day 8 Continuation
            </h2>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'Inner Path', value: m.d8?.inner_path ?? 0 },
                { label: 'Daily Rhythm', value: m.d8?.daily_rhythm ?? 0 },
                { label: 'Quick Chant', value: m.d8?.quick_chant ?? 0 },
              ].map((box) => (
                <div key={box.label} style={{
                  flex: '1 1 120px',
                  padding: '16px',
                  background: 'var(--kalpx-chip-bg)',
                  borderRadius: 8,
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--kalpx-text)' }}>{box.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--kalpx-text-soft)', marginTop: 4 }}>{box.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* E. QR Code */}
        <div style={{ background: 'var(--kalpx-card-bg)', border: '1px solid var(--kalpx-border)', borderRadius: 'var(--kalpx-r-lg)', padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--kalpx-text-soft)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16, marginTop: 0 }}>
            Invite QR Code
          </h2>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div>
              <QRCodeCanvas value={campaign.qr_url} size={200} id="program-qr-canvas" />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <p style={{ fontSize: 13, color: 'var(--kalpx-text-soft)', marginBottom: 12 }}>
                Share this QR code or the link below:
              </p>
              <code style={{
                display: 'block',
                fontSize: 13,
                padding: '8px 12px',
                background: 'var(--kalpx-chip-bg)',
                borderRadius: 6,
                marginBottom: 12,
                wordBreak: 'break-all',
              }}>
                {joinUrl}
              </code>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={() => downloadQr(campaign.code)}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--kalpx-cta)',
                    color: 'var(--kalpx-cta-text)',
                    border: 'none',
                    borderRadius: 6,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  Download PNG
                </button>
                <button
                  onClick={copyLink}
                  style={{
                    padding: '8px 16px',
                    background: 'transparent',
                    color: 'var(--kalpx-gold)',
                    border: '1px solid var(--kalpx-gold)',
                    borderRadius: 6,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  {copied ? 'Copied!' : 'Copy link'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* F. Campaign Settings */}
        <div style={{ background: 'var(--kalpx-card-bg)', border: '1px solid var(--kalpx-border)', borderRadius: 'var(--kalpx-r-lg)', padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--kalpx-text-soft)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16, marginTop: 0 }}>
            Campaign Settings
          </h2>

          {/* Support contact URL */}
          <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--kalpx-border)' }}>
            <div style={{ fontSize: 12, color: 'var(--kalpx-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Support Contact URL</div>
            {editingSupportUrl ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  value={supportUrlDraft}
                  onChange={(e) => setSupportUrlDraft(e.target.value)}
                  style={{ flex: 1, minWidth: 200, padding: '6px 10px', border: '1px solid var(--kalpx-border)', borderRadius: 6, fontSize: 14 }}
                />
                <button onClick={saveSupportUrl} style={{ padding: '6px 14px', background: '#166534', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Save</button>
                <button onClick={() => setEditingSupportUrl(false)} style={{ padding: '6px 14px', background: 'transparent', color: 'var(--kalpx-text-soft)', border: '1px solid var(--kalpx-border)', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, color: 'var(--kalpx-text)' }}>{campaign.support_contact_url || '—'}</span>
                {campaign.support_contact_url && (
                  <a href={campaign.support_contact_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--kalpx-gold)', textDecoration: 'none' }}>Test link ↗</a>
                )}
                <button
                  onClick={() => { setSupportUrlDraft(campaign.support_contact_url || ''); setEditingSupportUrl(true); }}
                  style={{ padding: '4px 10px', background: 'transparent', border: '1px solid var(--kalpx-border)', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: 'var(--kalpx-text-soft)' }}
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Internal ops owner */}
          <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--kalpx-border)' }}>
            <div style={{ fontSize: 12, color: 'var(--kalpx-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>Internal Ops Owner</div>
            {editingOpsOwner ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  value={opsOwnerDraft}
                  onChange={(e) => setOpsOwnerDraft(e.target.value)}
                  style={{ flex: 1, minWidth: 200, padding: '6px 10px', border: '1px solid var(--kalpx-border)', borderRadius: 6, fontSize: 14 }}
                />
                <button onClick={saveOpsOwner} style={{ padding: '6px 14px', background: '#166534', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Save</button>
                <button onClick={() => setEditingOpsOwner(false)} style={{ padding: '6px 14px', background: 'transparent', color: 'var(--kalpx-text-soft)', border: '1px solid var(--kalpx-border)', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Cancel</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: 'var(--kalpx-text)' }}>{campaign.internal_ops_owner || '—'}</span>
                <button
                  onClick={() => { setOpsOwnerDraft(campaign.internal_ops_owner || ''); setEditingOpsOwner(true); }}
                  style={{ padding: '4px 10px', background: 'transparent', border: '1px solid var(--kalpx-border)', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: 'var(--kalpx-text-soft)' }}
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Read-only fields */}
          {[
            { label: 'Template', value: campaign.template?.title ? `${campaign.template.title} (${campaign.template.duration_days}d)` : '—' },
            {
              label: 'Estimated vs Actual',
              value: `${campaign.estimated_invites} estimated · ${m.joined} joined (gap: ${campaign.estimated_invites - m.joined})`,
            },
            { label: 'Leader Email', value: campaign.leader_email || '—' },
            { label: 'Created', value: campaign.created_at ? new Date(campaign.created_at).toLocaleDateString() : '—' },
            { label: 'Notes', value: campaign.notes || '—' },
          ].map((row) => (
            <div key={row.label} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: 'var(--kalpx-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.4 }}>{row.label}</div>
              <div style={{ fontSize: 14, color: 'var(--kalpx-text)' }}>{row.value}</div>
            </div>
          ))}
        </div>

      </main>
    </AppShell>
  );
}
