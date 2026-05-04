import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  fetchNotificationPrefs,
  updateNotificationPref,
  updatePreference,
  type NotificationPrefs,
} from '../../store/preferencesSlice';

const PAGE_BG = '#fffaf5';
const SECTION_BG = '#fff8f0';
const GOLD = '#b8864b';
const BORDER = 'rgba(184, 134, 75, 0.22)';
const TEXT = '#3a2e24';
const TEXT_SECONDARY = '#7a6a58';

type CategoryConfig = {
  key: keyof NotificationPrefs;
  label: string;
  description: string;
  defaultOn: boolean;
};

const COMPANION_CATEGORIES: CategoryConfig[] = [
  {
    key: 'morning_presence',
    label: 'Morning Companion',
    description: 'A gentle start before your day opens.',
    defaultOn: true,
  },
  {
    key: 'prep_heads_up',
    label: 'Practice Reminders',
    description: 'A nudge to return to your Sankalp or Mantra.',
    defaultOn: true,
  },
  {
    key: 'evening_reflection',
    label: 'Evening Reflection',
    description: 'A quiet close for the day.',
    defaultOn: true,
  },
];

const OPTIONAL_CATEGORIES: CategoryConfig[] = [
  {
    key: 'post_conflict_follow',
    label: 'After a Hard Moment',
    description: 'A gentle return after a heavy time. Off by default.',
    defaultOn: false,
  },
  {
    key: 'grief_follow',
    label: 'Grief Companionship',
    description: 'Still with you, when you want it. Off by default.',
    defaultOn: false,
  },
  {
    key: 'festival_ritucharya',
    label: 'Festival & Season Rhythms',
    description: 'Tithi and seasonal companions. Off by default.',
    defaultOn: false,
  },
  {
    key: 'gentle_reengagement',
    label: 'Re-engagement',
    description: 'A soft return after a quiet period. Off by default.',
    defaultOn: false,
  },
  {
    key: 'community_updates',
    label: 'Community',
    description: 'Updates from the KalpX community. Off by default.',
    defaultOn: false,
  },
];

const FREQUENCY_OPTIONS = [
  { label: 'Normal', value: 'normal', description: 'Full companion rhythm' },
  { label: 'Reduced', value: 'reduced', description: 'Fewer, more spaced' },
  { label: 'Off', value: 'off', description: 'Pause all notifications' },
] as const;

function isValidHHMM(val: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(val);
}

export function NotificationPreferencesPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector((s: RootState) => s.preferences.notifications);
  const quietHours = useSelector((s: RootState) => s.preferences.quiet_hours);
  const frequency = useSelector((s: RootState) => s.preferences.recommended_frequency);
  const loaded = useSelector((s: RootState) => s.preferences.loaded);

  const [quietStart, setQuietStart] = useState(quietHours.start);
  const [quietEnd, setQuietEnd] = useState(quietHours.end);
  const [quietError, setQuietError] = useState('');
  const [savingQuiet, setSavingQuiet] = useState(false);
  const [quietSaved, setQuietSaved] = useState(false);

  useEffect(() => {
    dispatch(fetchNotificationPrefs());
  }, [dispatch]);

  useEffect(() => {
    setQuietStart(quietHours.start);
    setQuietEnd(quietHours.end);
  }, [quietHours.start, quietHours.end]);

  const handleToggle = (key: keyof NotificationPrefs, value: boolean) => {
    dispatch(updateNotificationPref({ key, value }));
  };

  const handleFrequency = (value: string) => {
    dispatch(updatePreference({ key: 'recommended_frequency', value }));
  };

  const handleSaveQuietHours = async () => {
    if (!isValidHHMM(quietStart)) {
      setQuietError('Start must be HH:MM (e.g. 23:00)');
      return;
    }
    if (!isValidHHMM(quietEnd)) {
      setQuietError('End must be HH:MM (e.g. 05:00)');
      return;
    }
    setQuietError('');
    setSavingQuiet(true);
    try {
      await dispatch(
        updatePreference({ key: 'quiet_hours', value: { start: quietStart, end: quietEnd } }),
      );
      setQuietSaved(true);
      setTimeout(() => setQuietSaved(false), 2000);
    } finally {
      setSavingQuiet(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: PAGE_BG, fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 20px', borderBottom: `1px solid ${BORDER}`,
        backgroundColor: PAGE_BG, position: 'sticky', top: 0, zIndex: 10,
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: TEXT, display: 'flex', alignItems: 'center' }}
          aria-label="Back"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: TEXT }}>Notification Preferences</h2>
      </div>

      {!loaded ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <div style={{ width: 28, height: 28, border: `3px solid ${GOLD}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '16px 16px 48px' }}>

          {/* Companion rhythm */}
          <Section title="Companion Rhythm" subtitle="Core companion notifications. On by default.">
            {COMPANION_CATEGORIES.map((cat) => (
              <CategoryRow
                key={cat.key}
                label={cat.label}
                description={cat.description}
                value={notifications[cat.key] ?? cat.defaultOn}
                onToggle={(v) => handleToggle(cat.key, v)}
              />
            ))}
          </Section>

          {/* Optional */}
          <Section title="Optional — Off by Default" subtitle="These are more personal. Enable only what feels right for you.">
            {OPTIONAL_CATEGORIES.map((cat) => (
              <CategoryRow
                key={cat.key}
                label={cat.label}
                description={cat.description}
                value={notifications[cat.key] ?? cat.defaultOn}
                onToggle={(v) => handleToggle(cat.key, v)}
              />
            ))}
          </Section>

          {/* Quiet hours */}
          <Section title="Quiet Hours" subtitle="No notifications during this window. Default: 11 PM to 5 AM.">
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap', marginTop: 4 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, color: TEXT_SECONDARY }}>From</label>
                <input
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  placeholder="23:00"
                  maxLength={5}
                  style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 10px', fontSize: 15, color: TEXT, width: 80, outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, color: TEXT_SECONDARY }}>Until</label>
                <input
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                  placeholder="05:00"
                  maxLength={5}
                  style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 10px', fontSize: 15, color: TEXT, width: 80, outline: 'none' }}
                />
              </div>
              <button
                onClick={handleSaveQuietHours}
                disabled={savingQuiet}
                style={{
                  backgroundColor: GOLD, color: '#fff', border: 'none', borderRadius: 8,
                  padding: '9px 18px', fontSize: 14, fontWeight: 600, cursor: savingQuiet ? 'not-allowed' : 'pointer',
                  opacity: savingQuiet ? 0.7 : 1,
                }}
              >
                {savingQuiet ? 'Saving...' : quietSaved ? 'Saved' : 'Save'}
              </button>
            </div>
            {quietError && <p style={{ color: '#c0392b', fontSize: 12, marginTop: 6 }}>{quietError}</p>}
          </Section>

          {/* Frequency */}
          <Section title="Frequency" subtitle="How often Mitra reaches out across all categories.">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {FREQUENCY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleFrequency(opt.value)}
                  style={{
                    flex: 1, minWidth: 90, border: `1px solid ${frequency === opt.value ? GOLD : BORDER}`,
                    borderRadius: 10, padding: '10px 8px', backgroundColor: frequency === opt.value ? '#fff5e8' : '#fff',
                    cursor: 'pointer', textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: frequency === opt.value ? GOLD : TEXT, marginBottom: 2 }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 11, color: TEXT_SECONDARY }}>{opt.description}</div>
                </button>
              ))}
            </div>
          </Section>

          <p style={{ textAlign: 'center', fontSize: 12, color: TEXT_SECONDARY, marginTop: 24 }}>
            Global notification consent can be changed in your browser or device settings.
          </p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 16, backgroundColor: SECTION_BG, borderRadius: 12, border: `1px solid ${BORDER}`, padding: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 2 }}>{title}</div>
      <div style={{ fontSize: 12, color: TEXT_SECONDARY, marginBottom: 14 }}>{subtitle}</div>
      {children}
    </div>
  );
}

function CategoryRow({
  label,
  description,
  value,
  onToggle,
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: `1px solid ${BORDER}` }}>
      <div style={{ flex: 1, paddingRight: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: TEXT }}>{label}</div>
        <div style={{ fontSize: 12, color: TEXT_SECONDARY, marginTop: 2 }}>{description}</div>
      </div>
      <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, flexShrink: 0 }}>
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onToggle(e.target.checked)}
          style={{ opacity: 0, width: 0, height: 0 }}
        />
        <span style={{
          position: 'absolute', cursor: 'pointer', inset: 0, borderRadius: 24,
          backgroundColor: value ? GOLD : '#e0d8cc',
          transition: 'background-color 0.2s',
        }}>
          <span style={{
            position: 'absolute', content: '""', height: 18, width: 18, left: value ? 22 : 3, bottom: 3,
            backgroundColor: '#fff', borderRadius: '50%', transition: 'left 0.2s',
          }} />
        </span>
      </label>
    </div>
  );
}
