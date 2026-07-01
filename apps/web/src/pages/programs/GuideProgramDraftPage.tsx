import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/ui/AppShell';
import { submitProgramDraft } from '../../engine/liveSessionApi';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error' | 'auth_required';

const CATEGORIES = [
  { value: 'meditation', label: 'Meditation / Dhyaan' },
  { value: 'yoga', label: 'Yoga / Pranayama' },
  { value: 'gita', label: 'Gita' },
  { value: 'family', label: 'Family' },
  { value: 'festival', label: 'Festival Sadhana' },
  { value: 'ayurveda', label: 'Ayurveda' },
  { value: 'satsang', label: 'Satsang' },
  { value: 'other', label: 'Other' },
];

const LANGUAGES = [
  { value: 'hi', label: 'Hindi' },
  { value: 'en', label: 'English' },
  { value: 'te', label: 'Telugu' },
];

const DURATIONS = [
  { value: '7', label: '7 days' },
  { value: '14', label: '14 days' },
  { value: '21', label: '21 days' },
  { value: 'other', label: 'Other' },
];

const START_TYPES = [
  { value: 'rolling', label: 'Rolling (anyone can join anytime)' },
  { value: 'cohort', label: 'Cohort (everyone starts together)' },
  { value: 'scheduled', label: 'Scheduled date' },
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

export function GuideProgramDraftPage() {
  const navigate = useNavigate();
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [successId, setSuccessId] = useState<number | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [dailyStructure, setDailyStructure] = useState('');
  const [startType, setStartType] = useState('rolling');
  const [desiredStartDate, setDesiredStartDate] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [supportNeeds, setSupportNeeds] = useState('');
  const [notesToKalpx, setNotesToKalpx] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !category || !durationDays || !description || !language) return;

    setSubmitState('submitting');
    try {
      const result = await submitProgramDraft({
        title, category,
        duration_days: durationDays === 'other' ? durationDays : parseInt(durationDays, 10),
        description, language,
        target_audience: targetAudience,
        daily_structure: dailyStructure,
        start_type: startType,
        desired_start_date: desiredStartDate,
        max_participants: maxParticipants ? parseInt(maxParticipants, 10) : undefined,
        support_needs: supportNeeds,
        notes_to_kalpx: notesToKalpx,
      });
      setSuccessId(result.submission_id);
      setSubmitState('success');
    } catch (e: any) {
      if (e?.response?.status === 403) {
        setSubmitState('auth_required');
      } else {
        const detail = e?.response?.data?.detail ?? 'Submission failed. Please try again.';
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
              Program Draft Submitted
            </h1>
            <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14, lineHeight: 1.7, marginBottom: 8 }}>
              Submission #{successId} received. KalpX will review within 3–5 business days.
            </p>
            <p style={{ color: 'var(--kalpx-text-muted)', fontSize: 13, marginBottom: 28 }}>
              You'll receive a notification once your program is reviewed.
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
            You need to be a verified guide to submit a program draft.
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
            Submit Program Draft
          </h1>
          <p style={{ fontSize: 13, color: 'var(--kalpx-text-soft)', lineHeight: 1.6, margin: 0 }}>
            KalpX will review your draft within 3–5 business days. You'll be notified once approved.
          </p>
        </header>

        <form onSubmit={handleSubmit}>
          <Field label="Program title" required>
            <input style={inputStyle} value={title} onChange={e => setTitle(e.target.value)}
              placeholder="e.g. 7-Day Morning Sadhana" required />
          </Field>

          <Field label="Category" required>
            <select style={inputStyle} value={category} onChange={e => setCategory(e.target.value)} required>
              <option value="">Select a category</option>
              {CATEGORIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Duration" required>
            <select style={inputStyle} value={durationDays} onChange={e => setDurationDays(e.target.value)} required>
              <option value="">Select duration</option>
              {DURATIONS.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Language" required>
            <select style={inputStyle} value={language} onChange={e => setLanguage(e.target.value)} required>
              <option value="">Select language</option>
              {LANGUAGES.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Program description" required
            hint="What is this program about? What will practitioners experience?">
            <textarea style={{ ...inputStyle, minHeight: 100, resize: 'vertical' }}
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Describe the practice journey…" required />
          </Field>

          <Field label="Target audience"
            hint="Who is this for? (e.g. beginners, parents, people dealing with stress)">
            <textarea style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }}
              value={targetAudience} onChange={e => setTargetAudience(e.target.value)}
              placeholder="e.g. Anyone who wants to build a morning routine…" />
          </Field>

          <Field label="Daily structure"
            hint="What does a typical day look like? (e.g. 5-min mantra + reflection)">
            <textarea style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }}
              value={dailyStructure} onChange={e => setDailyStructure(e.target.value)}
              placeholder="e.g. A short mantra, a guided prompt, and a 1-question reflection…" />
          </Field>

          <Field label="Start type">
            <select style={inputStyle} value={startType} onChange={e => setStartType(e.target.value)}>
              {START_TYPES.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </Field>

          {startType !== 'rolling' && (
            <Field label="Desired start date"
              hint="When do you want participants to begin the program?">
              <input type="date" style={inputStyle} value={desiredStartDate}
                onChange={e => setDesiredStartDate(e.target.value)} />
            </Field>
          )}

          <Field label="Maximum participants"
            hint="How many people do you want to allow in this program? Leave blank for unlimited.">
            <input type="number" style={inputStyle} value={maxParticipants}
              onChange={e => setMaxParticipants(e.target.value)}
              placeholder="e.g. 50" min={1} />
          </Field>

          <Field label="Support needs"
            hint="What help do you need from KalpX? (e.g. WhatsApp copy, Hindi translations)">
            <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
              value={supportNeeds} onChange={e => setSupportNeeds(e.target.value)}
              placeholder="e.g. I'll need help writing WhatsApp messages in Hindi…" />
          </Field>

          <Field label="Notes to KalpX team">
            <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
              value={notesToKalpx} onChange={e => setNotesToKalpx(e.target.value)}
              placeholder="Anything else the KalpX team should know…" />
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
            {submitState === 'submitting' ? 'Submitting…' : 'Submit Program Draft'}
          </button>
        </form>
      </main>
    </AppShell>
  );
}
