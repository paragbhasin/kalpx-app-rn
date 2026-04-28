import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { isAuthenticated } from '@kalpx/auth';
import { webStorage } from '../../lib/webStorage';
import { submitRetreatsInterest } from '../../lib/retreatsApi';
import { getUserProfile } from '../../lib/userApi';
import { AppShell, FormSection, SuccessState } from '../../components/ui';

const INTEREST_OPTIONS = [
  'Healing & Therapy',
  'Yoga & Meditation',
  'Spiritual Growth',
  'Ayurveda & Wellness',
];

const LOCATION_OPTIONS = ['Mountains', 'Beach', 'Forest', 'City Retreat Center', 'Ashram'];

const DURATION_OPTIONS: Array<{ value: '3_days' | '7_days' | '10_plus_days'; label: string }> = [
  { value: '3_days', label: '3 Days' },
  { value: '7_days', label: '7 Days' },
  { value: '10_plus_days', label: '10+ Days' },
];

const EXPERIENCE_OPTIONS: Array<{ value: 'essencial' | 'comfort' | 'premium'; label: string }> = [
  { value: 'essencial', label: 'Essential' },
  { value: 'comfort', label: 'Comfort' },
  { value: 'premium', label: 'Premium' },
];

const PENDING_KEY = 'pending_retreat_data';

interface FormState {
  interests: string[];
  locations: string[];
  userCity: string;
  duration: '3_days' | '7_days' | '10_plus_days' | '';
  experience: 'essencial' | 'comfort' | 'premium' | '';
  spiritualIntent: string;
}

const DEFAULT_FORM: FormState = {
  interests: [],
  locations: [],
  userCity: '',
  duration: '',
  experience: '',
  spiritualIntent: '',
};

export function RetreatsInterestPage() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<number>(0);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const ok = await isAuthenticated(webStorage);
      setAuthed(ok);

      if (ok) {
        // Restore pending form if returning after login
        const pending = sessionStorage.getItem(PENDING_KEY);
        if (pending) {
          try {
            const parsed = JSON.parse(pending) as FormState;
            setForm(parsed);
          } catch {
            // ignore parse errors
          }
          sessionStorage.removeItem(PENDING_KEY);
        }

        // Fetch user ID from profile
        const profile = await getUserProfile();
        if (profile?.id) setUserId(profile.id);
      }
    }
    init();
  }, []);

  // Geolocation on mount
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
        },
        () => {
          // silently ignore
        },
      );
    }
  }, []);

  function toggleChip(field: 'interests' | 'locations', value: string) {
    setForm((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  }

  const isFormValid =
    form.interests.length > 0 &&
    form.locations.length > 0 &&
    form.duration !== '' &&
    form.experience !== '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;

    // Auth check at submit time
    const ok = await isAuthenticated(webStorage);
    if (!ok) {
      sessionStorage.setItem(PENDING_KEY, JSON.stringify(form));
      navigate(`/login?returnTo=${encodeURIComponent('/en/retreats')}`);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await submitRetreatsInterest(userId, {
        interests: form.interests,
        locations: form.locations,
        userCity: form.userCity,
        geolocationCity: '',
        country: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        latitude,
        longitude,
        duration: form.duration as '3_days' | '7_days' | '10_plus_days',
        experience: form.experience as 'essencial' | 'comfort' | 'premium',
        spiritualIntent: form.spiritualIntent,
      });
      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // Not yet checked
  if (authed === null) return null;

  // Unauthenticated — show locked CTA card
  if (!authed) {
    return (
      <AppShell>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 16px' }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--kalpx-text)', marginBottom: 8 }}>
            Retreats
          </h1>
          <p style={{ fontSize: 14, color: 'var(--kalpx-text-soft)', marginBottom: 24 }}>
            Find a retreat that matches your path.
          </p>
          <div
            style={{
              background: 'var(--kalpx-card-bg)',
              border: '1px solid var(--kalpx-border-gold)',
              borderRadius: 12,
              padding: 24,
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: 16, color: 'var(--kalpx-text)', marginBottom: 20, fontWeight: 600 }}>
              Sign in to express your interest in retreats
            </p>
            <button
              onClick={() =>
                navigate(`/login?returnTo=${encodeURIComponent('/en/retreats')}`)
              }
              style={{
                padding: '12px 28px',
                borderRadius: 10,
                background: 'var(--kalpx-cta)',
                color: '#fff',
                border: 'none',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </AppShell>
    );
  }

  // Success state
  if (success) {
    return (
      <AppShell>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 16px' }}>
          <SuccessState
            heading="Interest Recorded"
            message="We'll be in touch about retreats that match your path."
            action={{ label: '← Back to home', to: '/en' }}
          />
        </div>
      </AppShell>
    );
  }

  // Form
  return (
    <AppShell>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '28px 16px 60px' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: 'var(--kalpx-cta)', fontWeight: 600, marginBottom: 2 }}>
            KalpX
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--kalpx-text)', marginBottom: 4 }}>
            Retreats
          </h1>
          <p style={{ fontSize: 14, color: 'var(--kalpx-text-soft)' }}>
            Tell us what you're looking for and we'll match you to the right retreat.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Healing interests */}
          <FormSection label="Healing interests">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {INTEREST_OPTIONS.map((opt) => {
                const selected = form.interests.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleChip('interests', opt)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 20,
                      border: `1px solid ${selected ? 'var(--kalpx-cta)' : 'var(--kalpx-border-gold)'}`,
                      background: selected ? 'var(--kalpx-cta)' : 'var(--kalpx-card-bg)',
                      color: selected ? '#fff' : 'var(--kalpx-text)',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </FormSection>

          {/* Preferred locations */}
          <FormSection label="Preferred locations">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {LOCATION_OPTIONS.map((opt) => {
                const selected = form.locations.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleChip('locations', opt)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 20,
                      border: `1px solid ${selected ? 'var(--kalpx-cta)' : 'var(--kalpx-border-gold)'}`,
                      background: selected ? 'var(--kalpx-cta)' : 'var(--kalpx-card-bg)',
                      color: selected ? '#fff' : 'var(--kalpx-text)',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </FormSection>

          {/* City */}
          <div
            style={{
              background: 'var(--kalpx-card-bg)',
              border: '1px solid var(--kalpx-border-gold)',
              borderRadius: 12,
              padding: 20,
              marginBottom: 16,
            }}
          >
            <label
              htmlFor="userCity"
              style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--kalpx-text)', marginBottom: 8 }}
            >
              City (optional)
            </label>
            <input
              id="userCity"
              type="text"
              value={form.userCity}
              onChange={(e) => setForm((prev) => ({ ...prev, userCity: e.target.value }))}
              placeholder="e.g. Mumbai"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--kalpx-border-gold)',
                fontSize: 14,
                color: 'var(--kalpx-text)',
                background: 'var(--kalpx-bg)',
                outline: 'none',
              }}
            />
          </div>

          {/* Duration */}
          <FormSection label="Duration">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {DURATION_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                >
                  <input
                    type="radio"
                    name="duration"
                    value={opt.value}
                    checked={form.duration === opt.value}
                    onChange={() => setForm((prev) => ({ ...prev, duration: opt.value }))}
                    style={{ accentColor: 'var(--kalpx-cta)' }}
                  />
                  <span style={{ fontSize: 14, color: 'var(--kalpx-text)' }}>{opt.label}</span>
                </label>
              ))}
            </div>
          </FormSection>

          {/* Experience */}
          <FormSection label="Experience">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {EXPERIENCE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                >
                  <input
                    type="radio"
                    name="experience"
                    value={opt.value}
                    checked={form.experience === opt.value}
                    onChange={() => setForm((prev) => ({ ...prev, experience: opt.value }))}
                    style={{ accentColor: 'var(--kalpx-cta)' }}
                  />
                  <span style={{ fontSize: 14, color: 'var(--kalpx-text)' }}>{opt.label}</span>
                </label>
              ))}
            </div>
          </FormSection>

          {/* Spiritual intent */}
          <div
            style={{
              background: 'var(--kalpx-card-bg)',
              border: '1px solid var(--kalpx-border-gold)',
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
            }}
          >
            <label
              htmlFor="spiritualIntent"
              style={{ display: 'block', fontSize: 14, fontWeight: 700, color: 'var(--kalpx-text)', marginBottom: 8 }}
            >
              What draws you to this retreat? (optional)
            </label>
            <textarea
              id="spiritualIntent"
              value={form.spiritualIntent}
              onChange={(e) => setForm((prev) => ({ ...prev, spiritualIntent: e.target.value }))}
              maxLength={500}
              rows={3}
              placeholder="Share what you're seeking..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid var(--kalpx-border-gold)',
                fontSize: 14,
                color: 'var(--kalpx-text)',
                background: 'var(--kalpx-bg)',
                outline: 'none',
                resize: 'vertical',
              }}
            />
            <p style={{ fontSize: 12, color: 'var(--kalpx-text-muted)', marginTop: 4, textAlign: 'right' }}>
              {form.spiritualIntent.length}/500
            </p>
          </div>

          {error && (
            <p style={{ fontSize: 14, color: '#c0392b', marginBottom: 16 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={!isFormValid || submitting}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 12,
              background: isFormValid && !submitting ? 'var(--kalpx-cta)' : '#d4b896',
              color: '#fff',
              border: 'none',
              fontSize: 16,
              fontWeight: 700,
              cursor: isFormValid && !submitting ? 'pointer' : 'not-allowed',
            }}
          >
            {submitting ? 'Submitting…' : 'Express Interest'}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
