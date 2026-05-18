import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../Networks/axios';
import TextComponent from '../../components/TextComponent';
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

const GOLD = '#b8864b';
const BORDER = 'rgba(184, 134, 75, 0.22)';
const BG = '#fffaf5';
const SECTION_BG = '#fff8f0';
const TEXT_SECONDARY = '#7a6a58';

const TZ_DISMISS_KEY = 'kalpx:tz_prompt_dismissed_at';

const TIMEZONES = [
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
  {
    key: 'milestone_reflections',
    label: 'Journey Milestones',
    description: 'Day 7 and Day 14 checkpoints, and weekly reflections.',
    defaultOn: true,
  },
  {
    key: 'morning_briefing',
    label: 'Morning Briefing',
    description: 'A daily reflection and practice to begin your day with Mitra.',
    defaultOn: true,
  },
];

const COMPANION_GUIDANCE_CATEGORIES: CategoryConfig[] = [
  {
    key: 'predictive_suggestions',
    label: 'Mitra Suggestions',
    description: 'Gentle suggestions when Mitra finds a practice that may help today.',
    defaultOn: true,
  },
  {
    key: 'festival_ritucharya',
    label: 'Festival & Season Rhythms',
    description: 'Cultural and seasonal reflections woven into your practice.',
    defaultOn: true,
  },
  {
    key: 'gentle_reengagement',
    label: 'Gentle Return',
    description: "A quiet reminder when you've been away for a few days.",
    defaultOn: true,
  },
  {
    key: 'post_conflict_follow',
    label: 'Quiet Reset',
    description: 'A soft reminder to pause and return to your practice.',
    defaultOn: true,
  },
  {
    key: 'community_updates',
    label: 'Community Updates',
    description: 'Updates from KalpX spaces and reflections.',
    defaultOn: true,
  },
  {
    key: 'post_room_continuity',
    label: 'After Room Sessions',
    description: 'A gentle follow-up to help you carry practice forward.',
    defaultOn: true,
  },
];

const SENSITIVE_CATEGORIES: CategoryConfig[] = [
  {
    key: 'grief_follow',
    label: 'Grief Companionship',
    description: 'Very gentle support during tender times.',
    defaultOn: false,
  },
];

const RHYTHM_AND_CHECKIN_CATEGORIES: CategoryConfig[] = [
  {
    key: 'notif_rhythm_reminders',
    label: 'Daily Rhythm Reminders',
    description: 'A soft call to your rhythm at the time you set.',
    defaultOn: true,
  },
  {
    key: 'notif_checkin_companion_nudge',
    label: 'Check-in Companion',
    description: 'A quiet follow-up when Mitra can offer a gentle anchor.',
    defaultOn: true,
  },
  {
    key: 'notif_quick_chant_reminders',
    label: 'Mantra Reminders',
    description: 'An occasional return to your chosen sound. Off by default — you choose.',
    defaultOn: false,
  },
];

const FREQUENCY_OPTIONS: { label: string; value: string; description: string }[] = [
  { label: 'Normal', value: 'normal', description: 'Full companion rhythm' },
  { label: 'Reduced', value: 'reduced', description: 'Fewer, more spaced' },
  { label: 'Off', value: 'off', description: 'Pause all notifications' },
];

function isValidHHMM(val: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(val);
}

const NotificationPreferences = () => {
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector((s: RootState) => s.preferences.notifications);
  const quietHours = useSelector((s: RootState) => s.preferences.quiet_hours);
  const frequency = useSelector((s: RootState) => s.preferences.recommended_frequency);
  const globalConsent = useSelector((s: RootState) => s.preferences.global_consent);
  const loaded = useSelector((s: RootState) => s.preferences.loaded);

  const [quietStart, setQuietStart] = useState(quietHours.start);
  const [quietEnd, setQuietEnd] = useState(quietHours.end);
  const [quietError, setQuietError] = useState('');
  const [savingQuiet, setSavingQuiet] = useState(false);
  const [quietSaved, setQuietSaved] = useState(false);

  // Timezone state
  const [selectedTimezone, setSelectedTimezone] = useState('Asia/Kolkata');
  const [savingTz, setSavingTz] = useState(false);
  const [tzSaved, setTzSaved] = useState(false);
  const [showTzPicker, setShowTzPicker] = useState(false);
  // Device timezone detection prompt: 'device' | 'readiness' | null
  const [tzPrompt, setTzPrompt] = useState<'device' | 'readiness' | null>(null);
  const [detectedTz, setDetectedTz] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchPreferences());
    dispatch(fetchNotificationPrefs());
    dispatch(fetchGlobalConsent());
  }, [dispatch]);

  useEffect(() => {
    setQuietStart(quietHours.start);
    setQuietEnd(quietHours.end);
  }, [quietHours.start, quietHours.end]);

  // Device timezone detection on mount
  useEffect(() => {
    (async () => {
      try {
        const dismissed = await AsyncStorage.getItem(TZ_DISMISS_KEY);
        if (dismissed) {
          const ts = Number(dismissed);
          if (Date.now() - ts < 24 * 60 * 60 * 1000) return; // dismissed within 24h
        }
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz && tz !== 'UTC') {
          setDetectedTz(tz);
          setTzPrompt('device');
        } else {
          setTzPrompt('readiness');
        }
      } catch {
        // best-effort
      }
    })();
  }, []);

  const handleSaveTimezone = useCallback(async (tz: string, fromDevice?: boolean) => {
    setSavingTz(true);
    try {
      const payload: Record<string, any> = { timezone: tz };
      if (fromDevice) payload.timezone_confirmed_from_device = true;
      await api.patch('users/profile/update_profile/', payload);
      setSelectedTimezone(tz);
      setTzSaved(true);
      setTzPrompt(null);
      setTimeout(() => setTzSaved(false), 2000);
    } catch {
      // best-effort
    } finally {
      setSavingTz(false);
    }
  }, []);

  const handleDismissTzPrompt = useCallback(async () => {
    try {
      await AsyncStorage.setItem(TZ_DISMISS_KEY, String(Date.now()));
    } catch {
      // best-effort
    }
    setTzPrompt(null);
  }, []);

  const handleGlobalConsentToggle = useCallback(
    (key: keyof GlobalConsent, value: boolean) => {
      dispatch(updateGlobalConsent({ [key]: value }));
    },
    [dispatch],
  );

  const handleToggle = useCallback(
    (key: keyof NotificationPrefs, value: boolean) => {
      dispatch(updateNotificationPref({ key, value }));
    },
    [dispatch],
  );

  const handleFrequency = useCallback(
    (value: string) => {
      dispatch(updatePreference({ key: 'recommended_frequency', value }));
    },
    [dispatch],
  );

  const handleSaveQuietHours = async () => {
    if (!isValidHHMM(quietStart)) {
      setQuietError('Start time must be HH:MM (e.g. 23:00)');
      return;
    }
    if (!isValidHHMM(quietEnd)) {
      setQuietError('End time must be HH:MM (e.g. 05:00)');
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

  if (!loaded) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={GOLD} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 22 }} />
        <TextComponent type="headerText" style={styles.headerText}>
          Notification Preferences
        </TextComponent>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Global consent */}
        <Section title="Notification Consent" subtitle="Master switches for all Mitra notifications.">
          <CategoryRow
            label="Push Notifications"
            description="Receive notifications on this device."
            value={globalConsent.receive_push_notifications}
            onToggle={(v) => handleGlobalConsentToggle('receive_push_notifications', v)}
          />
          <CategoryRow
            label="Email Notifications"
            description="Receive companion emails."
            value={globalConsent.receive_emails}
            onToggle={(v) => handleGlobalConsentToggle('receive_emails', v)}
          />
        </Section>

        {/* Timezone */}
        <Section title="Timezone" subtitle="Mitra uses your timezone to remind you at the right time.">
          {tzPrompt === 'device' && detectedTz ? (
            <View style={styles.tzPromptBox}>
              <TextComponent style={styles.tzPromptText}>
                We detected your timezone as {detectedTz}.
              </TextComponent>
              <View style={styles.tzPromptActions}>
                <TouchableOpacity
                  style={[styles.saveBtn, savingTz && styles.saveBtnDisabled]}
                  onPress={() => handleSaveTimezone(detectedTz, true)}
                  disabled={savingTz}
                >
                  {savingTz ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <TextComponent style={styles.saveBtnText}>Use this timezone</TextComponent>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.tzSecondaryBtn}
                  onPress={() => { setTzPrompt(null); setShowTzPicker(true); }}
                >
                  <TextComponent style={styles.tzSecondaryText}>Choose manually</TextComponent>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tzDismissBtn} onPress={handleDismissTzPrompt}>
                  <TextComponent style={styles.tzDismissText}>Not now</TextComponent>
                </TouchableOpacity>
              </View>
            </View>
          ) : tzPrompt === 'readiness' ? (
            <View style={styles.tzPromptBox}>
              <TextComponent style={styles.tzPromptText}>
                To remind you at the right time, Mitra needs your timezone.
              </TextComponent>
              <View style={styles.tzPromptActions}>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={() => { setTzPrompt(null); setShowTzPicker(true); }}
                >
                  <TextComponent style={styles.saveBtnText}>Set timezone</TextComponent>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tzDismissBtn} onPress={handleDismissTzPrompt}>
                  <TextComponent style={styles.tzDismissText}>Not now</TextComponent>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
          <View style={styles.tzPickerRow}>
            <Dropdown
              style={styles.tzDropdown}
              placeholderStyle={styles.tzDropdownText}
              selectedTextStyle={styles.tzDropdownText}
              itemTextStyle={styles.tzDropdownItem}
              containerStyle={styles.tzDropdownContainer}
              data={TIMEZONES}
              labelField="label"
              valueField="value"
              placeholder="Select timezone"
              value={selectedTimezone}
              onChange={(item) => {
                setSelectedTimezone(item.value);
                setShowTzPicker(false);
              }}
            />
            <TouchableOpacity
              style={[styles.saveBtn, (savingTz || tzSaved) && styles.saveBtnDisabled]}
              onPress={() => handleSaveTimezone(selectedTimezone)}
              disabled={savingTz || tzSaved}
            >
              {savingTz ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <TextComponent style={styles.saveBtnText}>{tzSaved ? 'Saved' : 'Save'}</TextComponent>
              )}
            </TouchableOpacity>
          </View>
        </Section>

        {/* Core companion rhythm */}
        <Section title="Companion Rhythm" subtitle="Core companion notifications.">
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
          title="Companion Guidance"
          subtitle="Helpful touchpoints from Mitra to support your practice, rhythm, and connection."
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
          title="Deeply Personal Support"
          subtitle="These are deeply personal. Turn them on only if you want Mitra to support you in these moments."
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

        {/* Rhythm, Check-in & Mantra */}
        <Section
          title="Rhythm & Practice"
          subtitle="Gentle nudges tied to your daily rhythm and chosen practices."
        >
          {RHYTHM_AND_CHECKIN_CATEGORIES.map((cat) => (
            <CategoryRow
              key={cat.key}
              label={cat.label}
              description={cat.description}
              value={(notifications as any)[cat.key] ?? cat.defaultOn}
              onToggle={(v) => handleToggle(cat.key as keyof NotificationPrefs, v)}
            />
          ))}
        </Section>

        {/* Quiet hours */}
        <Section title="Quiet Hours" subtitle="No notifications will be sent during this window. Default: 11 PM to 5 AM.">
          <View style={styles.quietRow}>
            <View style={styles.quietField}>
              <TextComponent style={styles.quietLabel}>From</TextComponent>
              <TextInput
                style={styles.timeInput}
                value={quietStart}
                onChangeText={setQuietStart}
                placeholder="23:00"
                placeholderTextColor="#b0a090"
                maxLength={5}
                keyboardType="numbers-and-punctuation"
                autoCorrect={false}
              />
            </View>
            <View style={styles.quietField}>
              <TextComponent style={styles.quietLabel}>Until</TextComponent>
              <TextInput
                style={styles.timeInput}
                value={quietEnd}
                onChangeText={setQuietEnd}
                placeholder="05:00"
                placeholderTextColor="#b0a090"
                maxLength={5}
                keyboardType="numbers-and-punctuation"
                autoCorrect={false}
              />
            </View>
            <TouchableOpacity
              style={[styles.saveBtn, savingQuiet && styles.saveBtnDisabled]}
              onPress={handleSaveQuietHours}
              disabled={savingQuiet}
            >
              {savingQuiet ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <TextComponent style={styles.saveBtnText}>
                  {quietSaved ? 'Saved' : 'Save'}
                </TextComponent>
              )}
            </TouchableOpacity>
          </View>
          {quietError ? (
            <TextComponent style={styles.errorText}>{quietError}</TextComponent>
          ) : null}
        </Section>

        {/* Frequency */}
        <Section title="Frequency" subtitle="How often Mitra reaches out across all categories.">
          <View style={styles.frequencyRow}>
            {FREQUENCY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.freqOption, frequency === opt.value && styles.freqOptionSelected]}
                onPress={() => handleFrequency(opt.value)}
              >
                <TextComponent
                  style={[styles.freqLabel, frequency === opt.value && styles.freqLabelSelected]}
                >
                  {opt.label}
                </TextComponent>
                <TextComponent style={styles.freqDesc}>{opt.description}</TextComponent>
              </TouchableOpacity>
            ))}
          </View>
        </Section>

        <View style={styles.footer}>
          <TextComponent style={styles.footerNote}>
            Push consent above overrides all category settings. Device-level permission can be managed in system settings.
          </TextComponent>
        </View>
      </ScrollView>
    </View>
  );
};

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <TextComponent type="headerText" style={styles.sectionTitle}>{title}</TextComponent>
      <TextComponent style={styles.sectionSubtitle}>{subtitle}</TextComponent>
      {children}
    </View>
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
    <View style={styles.categoryRow}>
      <View style={styles.categoryText}>
        <TextComponent style={styles.categoryLabel}>{label}</TextComponent>
        <TextComponent style={styles.categoryDesc}>{description}</TextComponent>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#e0d8cc', true: GOLD }}
        thumbColor="#fff"
        ios_backgroundColor="#e0d8cc"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: BG,
  },
  headerText: { fontSize: 17, color: '#3a2e24' },
  scroll: { paddingBottom: 40 },
  section: {
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: SECTION_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
  },
  sectionTitle: { fontSize: 13, color: GOLD, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 2 },
  sectionSubtitle: { fontSize: 12, color: TEXT_SECONDARY, marginBottom: 14 },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  categoryText: { flex: 1, paddingRight: 12 },
  categoryLabel: { fontSize: 14, color: '#3a2e24', fontWeight: '500' },
  categoryDesc: { fontSize: 12, color: TEXT_SECONDARY, marginTop: 2 },
  quietRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 4 },
  quietField: { flex: 1 },
  quietLabel: { fontSize: 12, color: TEXT_SECONDARY, marginBottom: 4 },
  timeInput: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    color: '#3a2e24',
    backgroundColor: '#fff',
  },
  saveBtn: {
    backgroundColor: GOLD,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  errorText: { color: '#c0392b', fontSize: 12, marginTop: 6 },
  frequencyRow: { flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  freqOption: {
    flex: 1,
    minWidth: 90,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  freqOptionSelected: { backgroundColor: '#fff5e8', borderColor: GOLD },
  freqLabel: { fontSize: 13, fontWeight: '600', color: '#3a2e24', marginBottom: 2 },
  freqLabelSelected: { color: GOLD },
  freqDesc: { fontSize: 11, color: TEXT_SECONDARY, textAlign: 'center' },
  footer: { marginHorizontal: 16, marginTop: 24 },
  footerNote: { fontSize: 12, color: TEXT_SECONDARY, textAlign: 'center' },
  // Timezone
  tzPromptBox: {
    backgroundColor: '#fff5e8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  tzPromptText: { fontSize: 13, color: '#3a2e24', marginBottom: 10 },
  tzPromptActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tzSecondaryBtn: {
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tzSecondaryText: { color: GOLD, fontSize: 13 },
  tzDismissBtn: { paddingHorizontal: 8, paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
  tzDismissText: { color: TEXT_SECONDARY, fontSize: 12 },
  tzPickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  tzDropdown: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  tzDropdownText: { fontSize: 13, color: '#3a2e24' },
  tzDropdownItem: { fontSize: 13, color: '#3a2e24' },
  tzDropdownContainer: { borderRadius: 8, borderColor: BORDER },
});

export default NotificationPreferences;
