import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/ui/AppShell';
import { api } from '../../lib/api';

interface Template {
  id: number;
  title: string;
  duration_days: number;
}

interface FormState {
  template_id: string;
  code: string;
  leader_name: string;
  leader_type: string;
  community_name: string;
  support_contact_url: string;
  internal_ops_owner: string;
  estimated_invites: string;
  leader_email: string;
  leader_phone: string;
  notes: string;
}

type FieldErrors = Partial<Record<keyof FormState | 'non_field_errors', string[]>>;

const LEADER_TYPE_OPTIONS = [
  { value: 'temple', label: 'Temple/Spiritual' },
  { value: 'yoga', label: 'Yoga/Ayurveda' },
  { value: 'parent', label: 'Parent/NRI Group' },
  { value: 'creator', label: 'Micro-Creator' },
  { value: 'manager', label: 'Workplace/Manager' },
  { value: 'other', label: 'Other' },
];

const CODE_RE = /^[A-Z0-9]{4,10}$/;

function codeValidationMessage(code: string): string | null {
  if (!code) return null;
  if (!/^[A-Z0-9]*$/.test(code)) return 'Code must be uppercase letters and digits only.';
  if (code.length < 4) return 'Code must be at least 4 characters.';
  if (code.length > 10) return 'Code must be at most 10 characters.';
  return null;
}

const EMPTY_FORM: FormState = {
  template_id: '',
  code: '',
  leader_name: '',
  leader_type: '',
  community_name: '',
  support_contact_url: '',
  internal_ops_owner: '',
  estimated_invites: '',
  leader_email: '',
  leader_phone: '',
  notes: '',
};

function InputRow({
  label,
  required,
  children,
  errors,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  errors?: string[];
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--kalpx-text)', marginBottom: 6 }}>
        {label}
        {required && <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {errors && errors.length > 0 && (
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#dc2626' }}>{errors.join(' ')}</p>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid var(--kalpx-border)',
  borderRadius: 6,
  fontSize: 14,
  color: 'var(--kalpx-text)',
  background: 'var(--kalpx-card-bg)',
  boxSizing: 'border-box',
};

export function ProgramAdminCreateCampaign() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [showSuccessOptions, setShowSuccessOptions] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    api.get('programs/admin/templates/')
      .then((res) => {
        setTemplates(res.data?.results ?? res.data ?? []);
      })
      .catch(() => {
        setTemplates([]);
      })
      .finally(() => setTemplatesLoading(false));
  }, []);

  function handleChange(field: keyof FormState, value: string) {
    if (field === 'code') {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    }
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const codeErr = codeValidationMessage(form.code);
    if (codeErr) {
      setFieldErrors({ code: [codeErr] });
      return;
    }

    setSubmitting(true);
    setFieldErrors({});

    try {
      const res = await api.post('programs/admin/campaigns/', {
        ...form,
        estimated_invites: parseInt(form.estimated_invites, 10),
        template_id: parseInt(form.template_id, 10),
      });
      const campaign = res.data;
      setCreatedCode(campaign.code);
      setShowSuccessOptions(true);
    } catch (err: any) {
      const data = err?.response?.data;
      if (data && typeof data === 'object') {
        setFieldErrors(data as FieldErrors);
      } else {
        setFieldErrors({ non_field_errors: ['An unexpected error occurred. Please try again.'] });
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePublishNow() {
    if (!createdCode) return;
    setPublishing(true);
    try {
      await api.patch(`programs/admin/campaigns/${createdCode}/`, { status: 'active' });
      navigate(`/programs/admin/${createdCode}/`);
    } catch {
      navigate(`/programs/admin/${createdCode}/`);
    } finally {
      setPublishing(false);
    }
  }

  function handleSaveAsDraft() {
    if (createdCode) navigate(`/programs/admin/${createdCode}/`);
  }

  if (showSuccessOptions && createdCode) {
    return (
      <AppShell>
        <main style={{ maxWidth: 600, margin: '0 auto', padding: '64px 20px' }}>
          <div style={{
            background: 'var(--kalpx-card-bg)',
            border: '1px solid var(--kalpx-border)',
            borderRadius: 'var(--kalpx-r-lg)',
            padding: 32,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--kalpx-text)', marginBottom: 8 }}>
              Campaign <code style={{ fontFamily: 'monospace' }}>{createdCode}</code> created
            </h2>
            <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14, marginBottom: 24 }}>
              What would you like to do next?
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={handlePublishNow}
                disabled={publishing}
                style={{
                  padding: '10px 24px',
                  background: '#166534',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: publishing ? 'default' : 'pointer',
                  opacity: publishing ? 0.7 : 1,
                }}
              >
                {publishing ? 'Publishing...' : 'Publish now'}
              </button>
              <button
                onClick={handleSaveAsDraft}
                style={{
                  padding: '10px 24px',
                  background: 'transparent',
                  color: 'var(--kalpx-gold)',
                  border: '1px solid var(--kalpx-gold)',
                  borderRadius: 6,
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: 'pointer',
                }}
              >
                Save as draft
              </button>
            </div>
          </div>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main style={{ maxWidth: 700, margin: '0 auto', padding: '32px 20px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <button
            onClick={() => navigate('/programs/admin/')}
            style={{ background: 'none', border: 'none', color: 'var(--kalpx-text-soft)', cursor: 'pointer', fontSize: 13, padding: 0, marginBottom: 12 }}
          >
            ← Back to campaigns
          </button>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--kalpx-text)', margin: 0 }}>
            New Campaign
          </h1>
        </div>

        {fieldErrors.non_field_errors && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: '#991b1b', fontSize: 14 }}>
            {fieldErrors.non_field_errors.join(' ')}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ background: 'var(--kalpx-card-bg)', border: '1px solid var(--kalpx-border)', borderRadius: 'var(--kalpx-r-lg)', padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--kalpx-text-soft)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 0, marginBottom: 20 }}>
              Program
            </h2>

            <InputRow label="Template" required errors={fieldErrors.template_id}>
              {templatesLoading ? (
                <p style={{ fontSize: 13, color: 'var(--kalpx-text-muted)' }}>Loading templates...</p>
              ) : (
                <select
                  value={form.template_id}
                  onChange={(e) => handleChange('template_id', e.target.value)}
                  required
                  style={{ ...inputStyle }}
                >
                  <option value="">Select a template</option>
                  {templates.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {t.title} ({t.duration_days}d)
                    </option>
                  ))}
                </select>
              )}
            </InputRow>

            <InputRow label="Invite Code" required errors={fieldErrors.code}>
              <input
                type="text"
                value={form.code}
                onChange={(e) => handleChange('code', e.target.value)}
                placeholder="e.g. YOGA21"
                maxLength={10}
                required
                style={inputStyle}
              />
              {form.code && !CODE_RE.test(form.code) && !fieldErrors.code && (
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#d97706' }}>
                  {codeValidationMessage(form.code)}
                </p>
              )}
              <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--kalpx-text-muted)' }}>
                4–10 uppercase letters and digits. Uniqueness validated on save.
              </p>
            </InputRow>
          </div>

          <div style={{ background: 'var(--kalpx-card-bg)', border: '1px solid var(--kalpx-border)', borderRadius: 'var(--kalpx-r-lg)', padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--kalpx-text-soft)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 0, marginBottom: 20 }}>
              Leader
            </h2>

            <InputRow label="Leader Name" required errors={fieldErrors.leader_name}>
              <input
                type="text"
                value={form.leader_name}
                onChange={(e) => handleChange('leader_name', e.target.value)}
                placeholder="Full name"
                required
                style={inputStyle}
              />
            </InputRow>

            <InputRow label="Leader Type" required errors={fieldErrors.leader_type}>
              <select
                value={form.leader_type}
                onChange={(e) => handleChange('leader_type', e.target.value)}
                required
                style={inputStyle}
              >
                <option value="">Select type</option>
                {LEADER_TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </InputRow>

            <InputRow label="Leader Email" errors={fieldErrors.leader_email}>
              <input
                type="email"
                value={form.leader_email}
                onChange={(e) => handleChange('leader_email', e.target.value)}
                placeholder="email@example.com"
                style={inputStyle}
              />
            </InputRow>

            <InputRow label="Leader Phone" errors={fieldErrors.leader_phone}>
              <input
                type="tel"
                value={form.leader_phone}
                onChange={(e) => handleChange('leader_phone', e.target.value)}
                placeholder="+91..."
                style={inputStyle}
              />
            </InputRow>
          </div>

          <div style={{ background: 'var(--kalpx-card-bg)', border: '1px solid var(--kalpx-border)', borderRadius: 'var(--kalpx-r-lg)', padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--kalpx-text-soft)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 0, marginBottom: 20 }}>
              Community
            </h2>

            <InputRow label="Community Name" required errors={fieldErrors.community_name}>
              <input
                type="text"
                value={form.community_name}
                onChange={(e) => handleChange('community_name', e.target.value)}
                placeholder="e.g. Sunrise Yoga Studio"
                required
                style={inputStyle}
              />
            </InputRow>

            <InputRow label="Estimated Invites" required errors={fieldErrors.estimated_invites}>
              <input
                type="number"
                value={form.estimated_invites}
                onChange={(e) => handleChange('estimated_invites', e.target.value)}
                placeholder="e.g. 100"
                min={1}
                required
                style={inputStyle}
              />
            </InputRow>
          </div>

          <div style={{ background: 'var(--kalpx-card-bg)', border: '1px solid var(--kalpx-border)', borderRadius: 'var(--kalpx-r-lg)', padding: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--kalpx-text-soft)', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 0, marginBottom: 20 }}>
              Operations
            </h2>

            <InputRow label="Support Contact URL" required errors={fieldErrors.support_contact_url}>
              <input
                type="url"
                value={form.support_contact_url}
                onChange={(e) => handleChange('support_contact_url', e.target.value)}
                placeholder="https://wa.me/..."
                required
                style={inputStyle}
              />
            </InputRow>

            <InputRow label="Internal Ops Owner" required errors={fieldErrors.internal_ops_owner}>
              <input
                type="text"
                value={form.internal_ops_owner}
                onChange={(e) => handleChange('internal_ops_owner', e.target.value)}
                placeholder="e.g. Pavani"
                required
                style={inputStyle}
              />
            </InputRow>

            <InputRow label="Notes" errors={fieldErrors.notes}>
              <textarea
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Internal notes..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' as const }}
              />
            </InputRow>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate('/programs/admin/')}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                color: 'var(--kalpx-text-soft)',
                border: '1px solid var(--kalpx-border)',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 24px',
                background: 'var(--kalpx-cta)',
                color: 'var(--kalpx-cta-text)',
                border: 'none',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 14,
                cursor: submitting ? 'default' : 'pointer',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </main>
    </AppShell>
  );
}
