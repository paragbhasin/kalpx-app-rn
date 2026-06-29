import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  fetchPreferences,
  fetchNotificationPrefs,
  fetchGlobalConsent,
  updateNotificationPref,
  updateGlobalConsent,
  updatePreference,
  type NotificationPrefs,
  type GlobalConsent,
} from '../../store/preferencesSlice';
import { getUserProfile, updateUserProfile } from '../../lib/userApi';
import { useWebPush } from '../../hooks/useWebPush';
import { useTranslation } from '../../lib/i18n';

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

const TIMEZONE_OPTIONS = [
  { label: 'India Standard Time (IST)', value: 'Asia/Kolkata' },
  { label: 'Gulf Standard Time (GST)', value: 'Asia/Dubai' },
  { label: 'Sri Lanka Standard Time (SLST)', value: 'Asia/Colombo' },
  { label: 'British Time (GMT/BST)', value: 'Europe/London' },
  { label: 'Central European Time (CET/CEST)', value: 'Europe/Berlin' },
  { label: 'Eastern Time (US & Canada)', value: 'America/New_York' },
  { label: 'Central Time (US & Canada)', value: 'America/Chicago' },
  { label: 'Mountain Time (US & Canada)', value: 'America/Denver' },
  { label: 'Pacific Time (US & Canada)', value: 'America/Los_Angeles' },
  { label: 'Australian Eastern Time (AEST/AEDT)', value: 'Australia/Sydney' },
  { label: 'Australian Western Time (AWST)', value: 'Australia/Perth' },
  { label: 'Singapore Time (SGT)', value: 'Asia/Singapore' },
  { label: 'Hong Kong Time (HKT)', value: 'Asia/Hong_Kong' },
  { label: 'South Africa Standard Time (SAST)', value: 'Africa/Johannesburg' },
];

function isValidHHMM(val: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(val);
}

export function NotificationPreferencesPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector((s: RootState) => s.preferences.notifications);
  const quietHours = useSelector((s: RootState) => s.preferences.quiet_hours);
  const frequency = useSelector((s: RootState) => s.preferences.recommended_frequency);
  const globalConsent = useSelector((s: RootState) => s.preferences.global_consent);
  const loaded = useSelector((s: RootState) => s.preferences.loaded);
  const { t } = useTranslation();

  const COMPANION_CATEGORIES: CategoryConfig[] = [
    {
      key: 'morning_presence',
      label: t('notifPrefs.catMorningLabel'),
      description: t('notifPrefs.catMorningDesc'),
      defaultOn: true,
    },
    {
      key: 'prep_heads_up',
      label: t('notifPrefs.catPracticeLabel'),
      description: t('notifPrefs.catPracticeDesc'),
      defaultOn: true,
    },
    {
      key: 'evening_reflection',
      label: t('notifPrefs.catEveningLabel'),
      description: t('notifPrefs.catEveningDesc'),
      defaultOn: true,
    },
    {
      key: 'milestone_reflections',
      label: t('notifPrefs.catMilestoneLabel'),
      description: t('notifPrefs.catMilestoneDesc'),
      defaultOn: true,
    },
    {
      key: 'morning_briefing',
      label: t('notifPrefs.catBriefingLabel'),
      description: t('notifPrefs.catBriefingDesc'),
      defaultOn: true,
    },
  ];

  const COMPANION_GUIDANCE_CATEGORIES: CategoryConfig[] = [
    {
      key: 'predictive_suggestions',
      label: t('notifPrefs.catPredictiveLabel'),
      description: t('notifPrefs.catPredictiveDesc'),
      defaultOn: true,
    },
    {
      key: 'festival_ritucharya',
      label: t('notifPrefs.catFestivalLabel'),
      description: t('notifPrefs.catFestivalDesc'),
      defaultOn: true,
    },
    {
      key: 'gentle_reengagement',
      label: t('notifPrefs.catReturnLabel'),
      description: t('notifPrefs.catReturnDesc'),
      defaultOn: true,
    },
    {
      key: 'post_conflict_follow',
      label: t('notifPrefs.catResetLabel'),
      description: t('notifPrefs.catResetDesc'),
      defaultOn: true,
    },
    {
      key: 'community_updates',
      label: t('notifPrefs.catCommunityLabel'),
      description: t('notifPrefs.catCommunityDesc'),
      defaultOn: true,
    },
    {
      key: 'post_room_continuity',
      label: t('notifPrefs.catPostRoomLabel'),
      description: t('notifPrefs.catPostRoomDesc'),
      defaultOn: true,
    },
  ];

  const SENSITIVE_CATEGORIES: CategoryConfig[] = [
    {
      key: 'grief_follow',
      label: t('notifPrefs.catGriefLabel'),
      description: t('notifPrefs.catGriefDesc'),
      defaultOn: true,
    },
  ];

  const RHYTHM_CATEGORIES: CategoryConfig[] = [
    {
      key: 'rhythm_reminders',
      label: t('notifPrefs.catRhythmLabel'),
      description: t('notifPrefs.catRhythmDesc'),
      defaultOn: true,
    },
    {
      key: 'checkin_companion_nudge',
      label: t('notifPrefs.catCheckinLabel'),
      description: t('notifPrefs.catCheckinDesc'),
      defaultOn: true,
    },
    {
      key: 'quick_chant_reminders',
      label: t('notifPrefs.catMantraLabel'),
      description: t('notifPrefs.catMantraDesc'),
      defaultOn: true,
    },
  ];

  const FREQUENCY_OPTIONS = [
    { label: t('notifPrefs.frequencyNormal'), value: 'normal', description: t('notifPrefs.frequencyNormalDesc') },
    { label: t('notifPrefs.frequencyReduced'), value: 'reduced', description: t('notifPrefs.frequencyReducedDesc') },
    { label: t('notifPrefs.frequencyOff'), value: 'off', description: t('notifPrefs.frequencyOffDesc') },
  ] as const;

  const webPush = useWebPush();

  const [quietStart, setQuietStart] = useState(quietHours.start);
  const [quietEnd, setQuietEnd] = useState(quietHours.end);
  const [quietError, setQuietError] = useState('');
  const [savingQuiet, setSavingQuiet] = useState(false);
  const [quietSaved, setQuietSaved] = useState(false);

  // Timezone state
  const [currentTimezone, setCurrentTimezone] = useState('');
  const [selectedTimezone, setSelectedTimezone] = useState('');
  const [showTimezoneSelector, setShowTimezoneSelector] = useState(false);
  const [savingTimezone, setSavingTimezone] = useState(false);
  const [timezoneSaved, setTimezoneSaved] = useState(false);
  const detectedTimezone = (() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return ''; }
  })();

  useEffect(() => {
    dispatch(fetchPreferences());
    dispatch(fetchNotificationPrefs());
    dispatch(fetchGlobalConsent());
    // Load current timezone from user profile
    void getUserProfile().then((profile) => {
      const tz = profile?.timezone as string | undefined;
      if (tz) {
        setCurrentTimezone(tz);
        setSelectedTimezone(tz);
      }
    });
  }, [dispatch]);

  const handleSaveTimezone = async (tz: string) => {
    setSavingTimezone(true);
    try {
      await updateUserProfile({ timezone: tz } as any);
      setCurrentTimezone(tz);
      setSelectedTimezone(tz);
      setShowTimezoneSelector(false);
      setTimezoneSaved(true);
      setTimeout(() => setTimezoneSaved(false), 2000);
    } finally {
      setSavingTimezone(false);
    }
  };

  useEffect(() => {
    setQuietStart(quietHours.start);
    setQuietEnd(quietHours.end);
  }, [quietHours.start, quietHours.end]);

  const handleGlobalConsentToggle = (key: keyof GlobalConsent, value: boolean) => {
    dispatch(updateGlobalConsent({ [key]: value }));
  };

  const handleToggle = (key: keyof NotificationPrefs, value: boolean) => {
    dispatch(updateNotificationPref({ key, value }));
  };

  const handleFrequency = (value: string) => {
    dispatch(updatePreference({ key: 'recommended_frequency', value }));
  };

  const handleSaveQuietHours = async () => {
    if (!isValidHHMM(quietStart)) {
      setQuietError(t('notifPrefs.quietStartError'));
      return;
    }
    if (!isValidHHMM(quietEnd)) {
      setQuietError(t('notifPrefs.quietEndError'));
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
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: TEXT }}>{t('notifPrefs.title')}</h2>
      </div>

      {!loaded ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
          <div style={{ width: 28, height: 28, border: `3px solid ${GOLD}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : (
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '16px 16px 48px' }}>

          {/* Timezone */}
          <Section title={t('notifPrefs.timezoneSection')} subtitle={t('notifPrefs.timezoneSubtitle')}>
            {!currentTimezone || currentTimezone === 'Asia/Kolkata' ? (
              <div style={{ padding: '8px 0', borderTop: `1px solid ${BORDER}` }}>
                <p style={{ margin: '0 0 10px', fontSize: 13, color: TEXT_SECONDARY }}>
                  {t('notifPrefs.timezonePrompt')}
                  {detectedTimezone ? ` ${t('notifPrefs.detectedTimezone').replace('{tz}', detectedTimezone)}` : ''}
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {detectedTimezone && (
                    <button
                      onClick={() => void handleSaveTimezone(detectedTimezone)}
                      disabled={savingTimezone}
                      style={{
                        backgroundColor: GOLD, color: '#fff', border: 'none', borderRadius: 8,
                        padding: '8px 14px', fontSize: 13, fontWeight: 600,
                        cursor: savingTimezone ? 'not-allowed' : 'pointer', opacity: savingTimezone ? 0.7 : 1,
                      }}
                    >
                      {t('notifPrefs.useThisTimezone')}
                    </button>
                  )}
                  <button
                    onClick={() => setShowTimezoneSelector(true)}
                    style={{
                      backgroundColor: '#fff', color: GOLD, border: `1px solid ${GOLD}`, borderRadius: 8,
                      padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {t('notifPrefs.chooseManually')}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: `1px solid ${BORDER}` }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: TEXT }}>{currentTimezone}</div>
                  {timezoneSaved && <div style={{ fontSize: 12, color: GOLD, marginTop: 2 }}>{t('notifPrefs.saved')}</div>}
                </div>
                <button
                  onClick={() => setShowTimezoneSelector((v) => !v)}
                  style={{
                    backgroundColor: '#fff', color: GOLD, border: `1px solid ${GOLD}`, borderRadius: 8,
                    padding: '6px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {t('notifPrefs.change')}
                </button>
              </div>
            )}
            {showTimezoneSelector && (
              <div style={{ marginTop: 10 }}>
                <select
                  value={selectedTimezone}
                  onChange={(e) => setSelectedTimezone(e.target.value)}
                  style={{
                    width: '100%', height: 44, borderRadius: 8, border: `1px solid ${BORDER}`,
                    padding: '0 12px', fontSize: 14, color: TEXT, outline: 'none',
                    backgroundColor: '#fff',
                  }}
                >
                  <option value="">{t('notifPrefs.selectTimezone')}</option>
                  {TIMEZONE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => void handleSaveTimezone(selectedTimezone)}
                    disabled={savingTimezone || !selectedTimezone}
                    style={{
                      backgroundColor: GOLD, color: '#fff', border: 'none', borderRadius: 8,
                      padding: '8px 16px', fontSize: 13, fontWeight: 600,
                      cursor: (savingTimezone || !selectedTimezone) ? 'not-allowed' : 'pointer',
                      opacity: (savingTimezone || !selectedTimezone) ? 0.7 : 1,
                    }}
                  >
                    {savingTimezone ? t('notifPrefs.saving') : t('notifPrefs.save')}
                  </button>
                  <button
                    onClick={() => { setShowTimezoneSelector(false); setSelectedTimezone(currentTimezone); }}
                    style={{
                      backgroundColor: '#fff', color: TEXT_SECONDARY, border: `1px solid ${BORDER}`,
                      borderRadius: 8, padding: '8px 16px', fontSize: 13, cursor: 'pointer',
                    }}
                  >
                    {t('notifPrefs.cancel')}
                  </button>
                </div>
              </div>
            )}
          </Section>

          {/* Global consent */}
          <Section title={t('notifPrefs.consentSection')} subtitle={t('notifPrefs.consentSubtitle')}>
            <CategoryRow
              label={t('notifPrefs.pushLabel')}
              description={t('notifPrefs.pushDesc')}
              value={globalConsent.receive_push_notifications}
              onToggle={(v) => handleGlobalConsentToggle('receive_push_notifications', v)}
            />
            <CategoryRow
              label={t('notifPrefs.emailLabel')}
              description={t('notifPrefs.emailDesc')}
              value={globalConsent.receive_emails}
              onToggle={(v) => handleGlobalConsentToggle('receive_emails', v)}
            />
          </Section>

          {/* Browser notifications (web push) */}
          <Section
            title={t('notifPrefs.browserSection')}
            subtitle={t('notifPrefs.browserSubtitle')}
          >
            <BrowserPushRow webPush={webPush} t={t} />
          </Section>

          {/* Core companion rhythm */}
          <Section title={t('notifPrefs.companionSection')} subtitle={t('notifPrefs.companionSubtitle')}>
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

          {/* Companion guidance */}
          <Section
            title={t('notifPrefs.guidanceSection')}
            subtitle={t('notifPrefs.guidanceSubtitle')}
          >
            {COMPANION_GUIDANCE_CATEGORIES.map((cat) => (
              <CategoryRow
                key={cat.key}
                label={cat.label}
                description={cat.description}
                value={notifications[cat.key] ?? cat.defaultOn}
                onToggle={(v) => handleToggle(cat.key, v)}
              />
            ))}
          </Section>

          {/* Deeply personal */}
          <Section
            title={t('notifPrefs.personalSection')}
            subtitle={t('notifPrefs.personalSubtitle')}
          >
            {SENSITIVE_CATEGORIES.map((cat) => (
              <CategoryRow
                key={cat.key}
                label={cat.label}
                description={cat.description}
                value={notifications[cat.key] ?? cat.defaultOn}
                onToggle={(v) => handleToggle(cat.key, v)}
              />
            ))}
          </Section>

          {/* Rhythm & Practice */}
          <Section
            title={t('notifPrefs.rhythmSection')}
            subtitle={t('notifPrefs.rhythmSubtitle')}
          >
            {RHYTHM_CATEGORIES.map((cat) => (
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
          <Section title={t('notifPrefs.quietSection')} subtitle={t('notifPrefs.quietSubtitle')}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap', marginTop: 4 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, color: TEXT_SECONDARY }}>{t('notifPrefs.from')}</label>
                <input
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  placeholder="23:00"
                  maxLength={5}
                  style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 10px', fontSize: 15, color: TEXT, width: 80, outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, color: TEXT_SECONDARY }}>{t('notifPrefs.until')}</label>
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
                {savingQuiet ? t('notifPrefs.saving') : quietSaved ? t('notifPrefs.saved') : t('notifPrefs.save')}
              </button>
            </div>
            {quietError && <p style={{ color: '#c0392b', fontSize: 12, marginTop: 6 }}>{quietError}</p>}
          </Section>

          {/* Frequency */}
          <Section title={t('notifPrefs.frequencySection')} subtitle={t('notifPrefs.frequencySubtitle')}>
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
            {t('notifPrefs.footerNote')}
          </p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function BrowserPushRow({ webPush, t }: { webPush: ReturnType<typeof useWebPush>; t: (key: string) => string }) {
  const { state, error, subscribe, unsubscribe } = webPush;

  if (state === 'unsupported') {
    return (
      <div style={{ padding: '10px 0', borderTop: `1px solid ${BORDER}` }}>
        <p style={{ margin: 0, fontSize: 13, color: TEXT_SECONDARY }}>
          {t('notifPrefs.browserUnsupported')}
        </p>
      </div>
    );
  }

  if (state === 'denied') {
    return (
      <div style={{ padding: '10px 0', borderTop: `1px solid ${BORDER}` }}>
        <p style={{ margin: 0, fontSize: 13, color: TEXT_SECONDARY }}>
          {t('notifPrefs.browserDenied')}
        </p>
      </div>
    );
  }

  const isSubscribed = state === 'subscribed';
  const isLoading = state === 'checking' || state === 'subscribing';

  return (
    <div style={{ padding: '10px 0', borderTop: `1px solid ${BORDER}` }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, paddingRight: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: TEXT }}>
            {isSubscribed ? t('notifPrefs.browserOn') : t('notifPrefs.browserOff')}
          </div>
          <div style={{ fontSize: 12, color: TEXT_SECONDARY, marginTop: 2 }}>
            {isSubscribed
              ? t('notifPrefs.browserOnDesc')
              : t('notifPrefs.browserOffDesc')}
          </div>
        </div>
        <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, flexShrink: 0 }}>
          <input
            type="checkbox"
            checked={isSubscribed}
            disabled={isLoading}
            onChange={(e) => { void (e.target.checked ? subscribe() : unsubscribe()); }}
            style={{ opacity: 0, width: 0, height: 0 }}
          />
          <span style={{
            position: 'absolute', cursor: isLoading ? 'not-allowed' : 'pointer', inset: 0,
            borderRadius: 24, backgroundColor: isSubscribed ? GOLD : '#e0d8cc',
            transition: 'background-color 0.2s', opacity: isLoading ? 0.5 : 1,
          }}>
            <span style={{
              position: 'absolute', height: 18, width: 18,
              left: isSubscribed ? 22 : 3, bottom: 3,
              backgroundColor: '#fff', borderRadius: '50%', transition: 'left 0.2s',
            }} />
          </span>
        </label>
      </div>
      {state === 'subscribing' && (
        <p style={{ margin: '6px 0 0', fontSize: 12, color: GOLD }}>{t('notifPrefs.enabling')}</p>
      )}
      {error && (
        <p style={{ margin: '6px 0 0', fontSize: 12, color: '#c0392b' }}>{error}</p>
      )}
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
