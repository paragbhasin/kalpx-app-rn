import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '../../components/ui/AppShell';
import { submitSessionDraft } from '../../engine/liveSessionApi';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error' | 'auth_required';

const SESSION_TYPES = [
  { value: 'jaap', label: 'Jaap (chanting)' },
  { value: 'dhyaan', label: 'Dhyaan (meditation)' },
  { value: 'satsang', label: 'Satsang' },
  { value: 'yoga', label: 'Yoga / Pranayama' },
  { value: 'katha', label: 'Katha' },
  { value: 'pravachan', label: 'Pravachan' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'qa', label: 'Q&A Session' },
  { value: 'other', label: 'Other' },
];

const PLATFORMS = [
  { value: 'zoom', label: 'Zoom' },
  { value: 'google_meet', label: 'Google Meet' },
  { value: 'youtube_live', label: 'YouTube Live' },
  { value: 'instagram_live', label: 'Instagram Live' },
  { value: 'whatsapp', label: 'WhatsApp Call' },
  { value: 'other', label: 'Other' },
];

const RECURRENCES = [
  { value: 'once', label: 'One-time session' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'festival', label: 'Festival / special occasion' },
];

const LANGUAGES = [
  { value: 'hi', label: 'Hindi' },
  { value: 'en', label: 'English' },
  { value: 'te', label: 'Telugu' },
];

function Field({
  label, required, hint, children,
}: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600,
        color: 'var(--kalpx-text)', marginBottom: 4 }}>
        {label}{required && <span style={{ color: 'var(--kalpx-gold)' }}> *</span>}
      </label>
      {hint && (
        <p style={{ fontSize: 12, color: 'var(--kalpx-text-muted)', margin: '0 0 6px' }}>{hint}</p>
      )}
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', fontSize: 14,
  border: '1px solid var(--kalpx-border)', borderRadius: 8,
  background: 'var(--kalpx-surface)', color: 'var(--kalpx-text)',
  boxSizing: 'border-box',
};

export function GuideSessionDraftPage() {
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [successId, setSuccessId] = useState<number | null>(null);

  const [title, setTitle] = useState('');
  const [sessionType, setSessionType] = useState('');
  const [description, setDescription] = useState('');
  const [externalJoinUrl, setExternalJoinUrl] = useState('');
  const [externalPlatform, setExternalPlatform] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [recurrence, setRecurrence] = useState('once');
  const [language, setLanguage] = useState('');
  const [notesToKalpx, setNotesToKalpx] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !sessionType || !description || !externalJoinUrl || !externalPlatform || !scheduledAt) return;

    setSubmitState('submitting');
    try {
      const result = await submitSessionDraft({
        title, session_type: sessionType, description,
        external_join_url: externalJoinUrl, external_platform: externalPlatform,
        scheduled_at: scheduledAt, timezone,
        duration_minutes: parseInt(durationMinutes, 10) || 60,
        recurrence, language, notes_to_kalpx: notesToKalpx,
      });
      setSuccessId(result.submission_id);
      setSubmitState('success');
    } catch (e: any) {
      if (e?.response?.status === 403) {
        setSubmitState('auth_required');
      } else {
        const data = e?.response?.data ?? {};
        const detail = data.external_join_url?.[0] ?? data.detail ?? 'Submission failed.';
        setErrorMsg(detail);
        setSubmitState('error');
      }
    }
  }

  if (submitState === 'success') {
    return (
      <AppShell>
        <main style={{ maxWidth: 560, margin: '0 auto', padding: '60px 20px' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🙏</div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--kalpx-text)', marginBottom: 12 }}>
              Session Draft Submitted
            </h1>
            <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
              Submission #{successId} received. KalpX will review within 1–2 business days.
            </p>
            <p style={{ color: 'var(--kalpx-text-muted)', fontSize: 13, marginBottom: 28 }}>
              Once approved, your session will appear on the KalpX live sessions page.
            </p>
            <Link to="/guide/dashboard"
              style={{ color: 'var(--kalpx-gold)', fontSize: 14, fontWeight: 600 }}>
              ← Back to dashboard
            </Link>
          </div>
        </main>
      </AppShell>
    );
  }

  if (submitState === 'auth_required') {
    return (
      <AppShell>
        <main style={{ maxWidth: 560, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--kalpx-text-muted)', marginBottom: 16 }}>
            You need to be a verified guide to schedule a session.
          </p>
          <Link to="/login" style={{ color: 'var(--kalpx-gold)', fontSize: 14 }}>Sign in →</Link>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '32px 20px 80px' }}>
        <Link to="/guide/dashboard"
          style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', display: 'block', marginBottom: 24 }}>
          ← Dashboard
        </Link>

        <header style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, color: 'var(--kalpx-text-muted)', letterSpacing: '0.05em',
            marginBottom: 6, fontWeight: 600 }}>
            GUIDE TOOLS
          </p>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--kalpx-text)', margin: '0 0 8px' }}>
            Schedule a Live Session
          </h1>
          <p style={{ fontSize: 13, color: 'var(--kalpx-text-soft)', lineHeight: 1.6, margin: 0 }}>
            Your session runs on your chosen platform (Zoom, Meet, YouTube, etc.). KalpX handles
            the listing, reminders, and post-session flow.
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <Field label="Session title" required>
            <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Sunday Morning Jaap" required />
          </Field>

          <Field label="Session type" required>
            <select style={inputStyle} value={sessionType}
              onChange={e => setSessionType(e.target.value)} required>
              <option value="">Select type</option>
              {SESSION_TYPES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Description" required
            hint="What will practitioners experience in this session?">
            <textarea style={{ ...inputStyle, minHeight: 88, resize: 'vertical' }}
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describe the session…" required />
          </Field>

          <Field label="Platform" required
            hint="Where will you host this session?">
            <select style={inputStyle} value={externalPlatform}
              onChange={e => setExternalPlatform(e.target.value)} required>
              <option value="">Select platform</option>
              {PLATFORMS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Join link (https:// required)" required
            hint="Your Zoom / Google Meet / YouTube / etc. link. Must start with https://.">
            <input style={inputStyle} type="url" value={externalJoinUrl}
              onChange={e => setExternalJoinUrl(e.target.value)}
              placeholder="https://zoom.us/j/your-meeting-id" required />
          </Field>

          <Field label="Date and time" required>
            <input type="datetime-local" style={inputStyle} value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)} required />
          </Field>

          <Field label="Timezone">
            <input style={inputStyle} value={timezone}
              onChange={e => setTimezone(e.target.value)}
              placeholder="e.g. Asia/Kolkata, America/New_York" />
          </Field>

          <Field label="Duration (minutes)">
            <input type="number" style={inputStyle} value={durationMinutes}
              onChange={e => setDurationMinutes(e.target.value)}
              min={15} max={480} placeholder="60" />
          </Field>

          <Field label="Recurrence">
            <select style={inputStyle} value={recurrence} onChange={e => setRecurrence(e.target.value)}>
              {RECURRENCES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Language">
            <select style={inputStyle} value={language} onChange={e => setLanguage(e.target.value)}>
              <option value="">Select language</option>
              {LANGUAGES.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Notes to KalpX team">
            <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
              value={notesToKalpx} onChange={e => setNotesToKalpx(e.target.value)}
              placeholder="Anything the KalpX team should know before approving…" />
          </Field>

          {submitState === 'error' && (
            <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 16 }}>{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={submitState === 'submitting'}
            style={{ width: '100%', padding: '13px', background: 'var(--kalpx-gold)',
              color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600,
              cursor: submitState === 'submitting' ? 'not-allowed' : 'pointer',
              opacity: submitState === 'submitting' ? 0.7 : 1 }}>
            {submitState === 'submitting' ? 'Submitting…' : 'Submit Session Draft'}
          </button>
        </form>
      </main>
    </AppShell>
  );
}
