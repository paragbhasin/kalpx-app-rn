import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/ui/AppShell';
import { api } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

// ── Invite a Leader ────────────────────────────────────────────────────────────

function InviteLeaderSection() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; msg: string; inviteUrl?: string } | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post<{ invite_url: string }>('ops/guide-invites/', { email: email.trim().toLowerCase() });
      setResult({ ok: true, msg: `Invite sent to ${email}`, inviteUrl: res.data.invite_url });
      setEmail('');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.email?.[0] || 'Failed to send invite.';
      setResult({ ok: false, msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={sectionCard}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--kalpx-text)', margin: '0 0 4px' }}>
        Invite a Leader
      </h3>
      <p style={{ fontSize: 13, color: 'var(--kalpx-text-soft)', margin: '0 0 14px' }}>
        Leaders receive an email with a link to create their account and access the Leader Portal.
      </p>
      <form onSubmit={handleInvite} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="leader@example.com"
          required
          style={inputStyle}
        />
        <button type="submit" disabled={loading} style={ctaBtn}>
          {loading ? 'Sending…' : 'Send Invite'}
        </button>
      </form>
      {result && (
        <div style={{
          marginTop: 12, padding: '10px 14px', borderRadius: 8,
          background: result.ok ? '#f0fdf4' : '#fee2e2',
          color: result.ok ? '#166534' : '#991b1b', fontSize: 13,
        }}>
          {result.msg}
          {result.ok && result.inviteUrl && (
            <div style={{ marginTop: 6 }}>
              <span style={{ fontWeight: 600 }}>Invite URL (dev only): </span>
              <a href={result.inviteUrl} target="_blank" rel="noreferrer"
                style={{ color: '#1d4ed8', wordBreak: 'break-all' }}>
                {result.inviteUrl}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Program Review Queue ───────────────────────────────────────────────────────

interface PendingTemplate {
  id: number;
  title: string;
  duration_days: number;
  language: string;
  review_status: string;
  submitted_at: string | null;
  guide_name: string;
  guide_email: string;
}

function ProgramReviewQueue() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<PendingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Track which template has reject expanded + their remark text
  const [rejectOpen, setRejectOpen] = useState<Record<number, boolean>>({});
  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    api.get('ops/pending-templates/?status=submitted&status=under_review')
      .then((res) => setTemplates(res.data?.templates ?? []))
      .catch(() => setError('Failed to load review queue.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const doAction = async (id: number, action: 'approve' | 'reject') => {
    setActionLoading(id);
    try {
      await api.post(`ops/pending-templates/${id}/`, {
        action: action === 'reject' ? 'reject' : 'approve',
        notes: remarks[id] ?? '',
      });
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      setRejectOpen((r) => { const n = { ...r }; delete n[id]; return n; });
    } catch {
      alert('Action failed. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleReject = (id: number) => {
    setRejectOpen((r) => ({ ...r, [id]: !r[id] }));
  };

  if (loading) return (
    <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--kalpx-text-muted)' }}>
      Loading review queue…
    </div>
  );

  if (error) return (
    <div style={{ padding: '14px 16px', background: '#fee2e2', borderRadius: 8, color: '#991b1b', fontSize: 13 }}>
      {error}
    </div>
  );

  if (templates.length === 0) return (
    <div style={{ padding: '48px 24px', textAlign: 'center', border: '1px dashed var(--kalpx-border)',
      borderRadius: 12, color: 'var(--kalpx-text-muted)', fontSize: 14 }}>
      No programs pending review right now.
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 14 }}>
      {templates.map((t) => {
        const submittedAt = t.submitted_at
          ? new Date(t.submitted_at).toLocaleString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })
          : '—';
        const isRejecting = !!rejectOpen[t.id];
        const busy = actionLoading === t.id;

        return (
          <div key={t.id} style={reviewCard}>
            {/* Top row: info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--kalpx-text)', margin: '0 0 4px',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.title || 'Untitled Program'}
                </p>
                <p style={{ fontSize: 12, color: 'var(--kalpx-text-soft)', margin: '0 0 2px' }}>
                  {t.guide_name}{t.guide_email ? ` · ${t.guide_email}` : ''}
                </p>
                <p style={{ fontSize: 11, color: 'var(--kalpx-text-muted)', margin: 0 }}>
                  {t.duration_days} days · {t.language.toUpperCase()} · Submitted {submittedAt}
                </p>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, color: '#0969da',
                background: '#dbeafe', padding: '3px 10px', borderRadius: 12, flexShrink: 0,
              }}>
                IN REVIEW
              </span>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate(`/ops/templates/${t.id}/review`)}
                style={outlineBtn}>
                View Details
              </button>
              <button
                disabled={busy || isRejecting}
                onClick={() => doAction(t.id, 'approve')}
                style={{ ...actionBtn, background: '#16a34a', opacity: (busy || isRejecting) ? 0.5 : 1 }}>
                {busy && !isRejecting ? 'Approving…' : 'Approve'}
              </button>
              <button
                disabled={busy}
                onClick={() => toggleReject(t.id)}
                style={{ ...actionBtn, background: isRejecting ? '#6b7280' : '#dc2626', opacity: busy ? 0.5 : 1 }}>
                {isRejecting ? 'Cancel' : 'Reject'}
              </button>
            </div>

            {/* Reject: inline remarks */}
            {isRejecting && (
              <div style={{ marginTop: 12, padding: '12px 14px', background: '#fef2f2',
                border: '1px solid #fecaca', borderRadius: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#991b1b', margin: '0 0 8px' }}>
                  Rejection remarks (required — shown to the leader):
                </p>
                <textarea
                  rows={3}
                  value={remarks[t.id] ?? ''}
                  onChange={(e) => setRemarks((r) => ({ ...r, [t.id]: e.target.value }))}
                  placeholder="Explain what needs to be changed or why this is being rejected…"
                  style={{
                    width: '100%', padding: '8px 12px', border: '1px solid #fca5a5',
                    borderRadius: 7, fontSize: 13, resize: 'vertical' as const,
                    fontFamily: 'inherit', background: '#fff', boxSizing: 'border-box' as const,
                    color: '#1f2937', outline: 'none',
                  }}
                />
                <button
                  disabled={busy || !(remarks[t.id] ?? '').trim()}
                  onClick={() => doAction(t.id, 'reject')}
                  style={{ ...actionBtn, background: '#dc2626', marginTop: 8,
                    opacity: (busy || !(remarks[t.id] ?? '').trim()) ? 0.5 : 1 }}>
                  {busy ? 'Rejecting…' : 'Confirm Reject'}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export function ProgramAdminDashboard() {
  const { logout } = useAuth();

  return (
    <AppShell>
      {/* Top bar */}
      <div style={{ height: 56, borderBottom: '1px solid var(--kalpx-border)', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', padding: '0 20px',
        background: 'var(--kalpx-bg)', position: 'sticky', top: 0, zIndex: 50 }}>
        <img src="/kalpx-logo.png" alt="KalpX" style={{ height: 30, width: 'auto', marginTop: 8 }} />
        <button onClick={logout}
          style={{ background: 'none', border: '1px solid var(--kalpx-border)', borderRadius: 8,
            padding: '6px 14px', fontSize: 13, color: 'var(--kalpx-text-muted)', cursor: 'pointer' }}>
          Sign out
        </button>
      </div>

      <main style={{ maxWidth: 780, margin: '0 auto', padding: '32px 20px 80px' }}>
        <header style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, color: 'var(--kalpx-text-muted)', letterSpacing: '0.05em',
            marginBottom: 4, fontWeight: 600 }}>
            OPS DASHBOARD
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--kalpx-text)', margin: 0 }}>
            Program Review Queue
          </h1>
        </header>

        <InviteLeaderSection />

        <p style={{ fontSize: 11, letterSpacing: '0.05em', color: 'var(--kalpx-text-muted)',
          marginBottom: 14, fontWeight: 600 }}>
          PENDING APPROVAL
        </p>

        <ProgramReviewQueue />
      </main>
    </AppShell>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const sectionCard: React.CSSProperties = {
  background: 'var(--kalpx-card-bg)', border: '1px solid var(--kalpx-border)',
  borderRadius: 10, padding: '18px 20px', marginBottom: 28,
};
const inputStyle: React.CSSProperties = {
  flex: '1 1 240px', padding: '9px 14px', border: '1px solid var(--kalpx-border)',
  borderRadius: 8, fontSize: 14, outline: 'none',
  background: 'var(--kalpx-bg)', color: 'var(--kalpx-text)',
};
const ctaBtn: React.CSSProperties = {
  padding: '9px 20px', background: 'var(--kalpx-cta)', color: 'var(--kalpx-cta-text)',
  border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
};
const reviewCard: React.CSSProperties = {
  background: 'var(--kalpx-card-bg)', border: '1px solid #FDE68A',
  borderRadius: 10, padding: '16px 18px',
};
const outlineBtn: React.CSSProperties = {
  padding: '7px 16px', border: '1px solid var(--kalpx-border)', background: 'none',
  color: 'var(--kalpx-text-soft)', borderRadius: 7, fontSize: 13, fontWeight: 600,
  cursor: 'pointer',
};
const actionBtn: React.CSSProperties = {
  padding: '7px 16px', border: 'none', color: '#fff',
  borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: 'pointer',
};
