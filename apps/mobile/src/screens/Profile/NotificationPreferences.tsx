import { useNavigation } from '@react-navigation/native';
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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
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
];

const SENSITIVE_CATEGORIES: CategoryConfig[] = [
  {
    key: 'grief_follow',
    label: 'Grief Companionship',
    description: 'Very gentle support during tender times.',
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
  const navigation: any = useNavigation();
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

  useEffect(() => {
    dispatch(fetchPreferences());
    dispatch(fetchNotificationPrefs());
    dispatch(fetchGlobalConsent());
  }, [dispatch]);

  useEffect(() => {
    setQuietStart(quietHours.start);
    setQuietEnd(quietHours.end);
  }, [quietHours.start, quietHours.end]);

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
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={22} color="#3a2e24" />
        </TouchableOpacity>
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
});

export default NotificationPreferences;
