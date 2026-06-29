import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import api from '../../Networks/axios';
import { AppDispatch, RootState } from '../../store';
import {
  fetchGlobalConsent,
  fetchNotificationPrefs,
  fetchPreferences,
  type GlobalConsent,
  type NotificationPrefs,
  updateGlobalConsent,
  updateNotificationPref,
  updatePreference,
} from '../../store/preferencesSlice';
import { Colors } from '../../theme/colors';
import { Fonts } from '../../theme/fonts';

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

type NotifLevel = 'normal' | 'reduced' | 'off';

const LEVELS: { value: NotifLevel; icon: string; label: string; sub: string }[] = [
  {
    value: 'off',
    icon: 'moon-outline',
    label: 'Silent',
    sub: 'In-app only\nNo push',
  },
  {
    value: 'reduced',
    icon: 'leaf-outline',
    label: 'Gentle',
    sub: 'Morning &\nSacred time',
  },
  {
    value: 'normal',
    icon: 'infinite-outline',
    label: 'Full',
    sub: 'Complete\ncompanion',
  },
];

type CategoryConfig = {
  key: keyof NotificationPrefs;
  icon: string;
  label: string;
  description: string;
};

const DAILY_RHYTHM: CategoryConfig[] = [
  {
    key: 'morning_presence',
    icon: 'sunny-outline',
    label: 'Morning companion',
    description: 'A gentle start before your day opens.',
  },
  {
    key: 'morning_briefing',
    icon: 'partly-sunny-outline',
    label: 'Morning briefing',
    description: 'A daily reflection and practice to begin your day with Mitra.',
  },
  {
    key: 'prep_heads_up',
    icon: 'time-outline',
    label: 'Practice nudge',
    description: 'A soft return to your Sankalp or Mantra.',
  },
  {
    key: 'evening_reflection',
    icon: 'moon-outline',
    label: 'Evening reflection',
    description: 'A quiet close for the day.',
  },
];

const SACRED_TIME: CategoryConfig[] = [
  {
    key: 'festival_ritucharya',
    icon: 'flame-outline',
    label: 'Ekadashi & Purnima',
    description: 'Gentle reminders on sacred moon days and fasting days.',
  },
];

const JAPA_MANTRA: CategoryConfig[] = [
  {
    key: 'notif_quick_chant_reminders',
    icon: 'radio-button-on-outline',
    label: 'Japa reminders',
    description: 'An occasional return to your chosen sound.',
  },
  {
    key: 'milestone_reflections',
    icon: 'sparkles-outline',
    label: 'Weekly chanting summary',
    description: 'How many times you chanted this week, your most active mantra.',
  },
];

const INNER_PATH: CategoryConfig[] = [
  {
    key: 'notif_rhythm_reminders',
    icon: 'footsteps-outline',
    label: 'Daily rhythm reminders',
    description: 'A soft call to your rhythm at the time you set.',
  },
  {
    key: 'notif_checkin_companion_nudge',
    icon: 'heart-outline',
    label: 'Check-in anchor',
    description: 'A quiet follow-up when Mitra can offer support.',
  },
];

const COMPANION_SUPPORT: CategoryConfig[] = [
  {
    key: 'predictive_suggestions',
    icon: 'bulb-outline',
    label: 'Mitra suggestions',
    description: 'Gentle suggestions when Mitra finds a practice that may help today.',
  },
  {
    key: 'gentle_reengagement',
    icon: 'refresh-outline',
    label: 'Gentle return',
    description: 'A quiet reminder when you have been away for a few days.',
  },
  {
    key: 'post_conflict_follow',
    icon: 'water-outline',
    label: 'Quiet reset',
    description: 'A soft reminder to pause and return to your practice.',
  },
  {
    key: 'post_room_continuity',
    icon: 'arrow-forward-outline',
    label: 'After room sessions',
    description: 'A gentle follow-up to help you carry practice forward.',
  },
  {
    key: 'community_updates',
    icon: 'people-outline',
    label: 'Community',
    description: 'Updates from KalpX spaces and reflections.',
  },
];

const DEEPLY_PERSONAL: CategoryConfig[] = [
  {
    key: 'grief_follow',
    icon: 'heart-outline',
    label: 'Grief companionship',
    description: 'Very gentle support during tender times. Only if you want this.',
  },
];

function isValidHHMM(val: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(val);
}

/** Normalize legacy IANA aliases so comparisons are reliable. */
function normalizeTz(tz: string | undefined | null): string {
  if (!tz) return '';
  // Asia/Calcutta is a deprecated alias for Asia/Kolkata
  if (tz === 'Asia/Calcutta') return 'Asia/Kolkata';
  return tz;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function NotificationPreferences() {
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector((s: RootState) => s.preferences.notifications);
  const quietHours = useSelector((s: RootState) => s.preferences.quiet_hours);
  const frequency = useSelector((s: RootState) => s.preferences.recommended_frequency) as NotifLevel;
  const globalConsent = useSelector((s: RootState) => s.preferences.global_consent);
  const loaded = useSelector((s: RootState) => s.preferences.loaded);

  const [quietStart, setQuietStart] = useState(quietHours.start);
  const [quietEnd, setQuietEnd] = useState(quietHours.end);
  const [quietError, setQuietError] = useState('');
  const [savingQuiet, setSavingQuiet] = useState(false);
  const [quietSaved, setQuietSaved] = useState(false);

  const [selectedTimezone, setSelectedTimezone] = useState('Asia/Kolkata');
  const [savingTz, setSavingTz] = useState(false);
  const [tzSaved, setTzSaved] = useState(false);
  const [tzPrompt, setTzPrompt] = useState<'device' | 'readiness' | null>(null);
  const [detectedTz, setDetectedTz] = useState<string | null>(null);
  const [storedTz, setStoredTz] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchPreferences());
    dispatch(fetchNotificationPrefs());
    dispatch(fetchGlobalConsent());
  }, [dispatch]);

  useEffect(() => {
    setQuietStart(quietHours.start);
    setQuietEnd(quietHours.end);
  }, [quietHours.start, quietHours.end]);

  useEffect(() => {
    (async () => {
      try {
        const dismissed = await AsyncStorage.getItem(TZ_DISMISS_KEY);
        if (dismissed) {
          if (Date.now() - Number(dismissed) < 24 * 60 * 60 * 1000) return;
        }
        // Fetch stored timezone from backend profile
        let stored: string | null = null;
        try {
          const res = await api.get('users/profile/profile_details/');
          const raw = res?.data;
          const profileData = raw?.profile ?? raw;
          const tz = profileData?.timezone as string | undefined;
          if (tz) {
            stored = normalizeTz(tz);
            setStoredTz(stored);
            setSelectedTimezone(stored);
          }
        } catch {
          // best-effort — proceed without stored tz
        }
        const detected = normalizeTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
        if (detected && detected !== 'UTC') {
          setDetectedTz(detected);
          // Only prompt if stored tz is missing or differs from detected tz
          if (!stored || stored !== detected) {
            setTzPrompt('device');
          }
          // else: stored === detected — no prompt needed
        } else {
          if (!stored) {
            setTzPrompt('readiness');
          }
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

  const handleLevelChange = useCallback(
    (level: NotifLevel) => {
      dispatch(updatePreference({ key: 'recommended_frequency', value: level }));
      if (level === 'off') {
        dispatch(updateGlobalConsent({ receive_push_notifications: false }));
      } else if (!globalConsent.receive_push_notifications) {
        dispatch(updateGlobalConsent({ receive_push_notifications: true }));
      }
    },
    [dispatch, globalConsent.receive_push_notifications],
  );

  const handleToggle = useCallback(
    (key: keyof NotificationPrefs, value: boolean) => {
      dispatch(updateNotificationPref({ key, value }));
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
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator color={Colors.goldBright} size="large" />
      </View>
    );
  }

  const muted = frequency === 'off';

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Text style={styles.headerSub}>How Mitra reaches you through the day</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Companion Level ──────────────────────────────────────────── */}
        <View style={styles.levelCard}>
          <Text style={styles.levelHeading}>Companion presence</Text>
          <Text style={styles.levelSub}>
            Choose how gently Mitra accompanies you.
          </Text>
          <View style={styles.levelRow}>
            {LEVELS.map((lvl) => {
              const active = frequency === lvl.value;
              return (
                <TouchableOpacity
                  key={lvl.value}
                  style={[styles.levelOption, active && styles.levelOptionActive]}
                  onPress={() => handleLevelChange(lvl.value)}
                  activeOpacity={0.78}
                >
                  <Ionicons
                    name={lvl.icon}
                    size={20}
                    color={active ? Colors.goldBright : Colors.brownMuted}
                    style={styles.levelIcon}
                  />
                  <Text style={[styles.levelLabel, active && styles.levelLabelActive]}>
                    {lvl.label}
                  </Text>
                  <Text style={styles.levelOptionSub}>{lvl.sub}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {muted && (
            <View style={styles.mutedNote}>
              <Ionicons name="information-circle-outline" size={13} color={Colors.brownMuted} />
              <Text style={styles.mutedNoteText}>
                Push notifications are paused. You will still receive in-app reminders.
              </Text>
            </View>
          )}
        </View>

        {/* ── Daily Rhythm ─────────────────────────────────────────────── */}
        <SectionBlock
          icon="sunny-outline"
          title="Daily rhythm"
          subtitle="Morning, midday, and night companions."
          muted={muted}
        >
          {DAILY_RHYTHM.map((cat) => (
            <CategoryRow
              key={cat.key}
              icon={cat.icon}
              label={cat.label}
              description={cat.description}
              value={notifications[cat.key] ?? true}
              onToggle={(v) => handleToggle(cat.key, v)}
              disabled={muted}
            />
          ))}
        </SectionBlock>

        {/* ── Sacred Time ──────────────────────────────────────────────── */}
        <SectionBlock
          icon="radio-button-on-outline"
          title="Sacred time"
          subtitle="Ekadashi, Purnima, and seasonal rhythms of Sanatan living."
          muted={muted}
          accent
        >
          {SACRED_TIME.map((cat) => (
            <CategoryRow
              key={cat.key}
              icon={cat.icon}
              label={cat.label}
              description={cat.description}
              value={notifications[cat.key] ?? true}
              onToggle={(v) => handleToggle(cat.key, v)}
              disabled={muted}
            />
          ))}
          <View style={styles.sacredNote}>
            <Text style={styles.sacredNoteText}>
              "Tonight's moon is traditionally used for reflection."
            </Text>
          </View>
        </SectionBlock>

        {/* ── Japa & Mantra ────────────────────────────────────────────── */}
        <SectionBlock
          icon="ellipse-outline"
          title="Japa & mantra"
          subtitle="Your mala, your count, your continuity."
          muted={muted}
        >
          {JAPA_MANTRA.map((cat) => (
            <CategoryRow
              key={cat.key}
              icon={cat.icon}
              label={cat.label}
              description={cat.description}
              value={notifications[cat.key] ?? true}
              onToggle={(v) => handleToggle(cat.key, v)}
              disabled={muted}
            />
          ))}
        </SectionBlock>

        {/* ── Inner Path ───────────────────────────────────────────────── */}
        <SectionBlock
          icon="compass-outline"
          title="Inner path"
          subtitle="Journey continuity and check-in anchors."
          muted={muted}
        >
          {INNER_PATH.map((cat) => (
            <CategoryRow
              key={cat.key}
              icon={cat.icon}
              label={cat.label}
              description={cat.description}
              value={(notifications as any)[cat.key] ?? true}
              onToggle={(v) => handleToggle(cat.key as keyof NotificationPrefs, v)}
              disabled={muted}
            />
          ))}
        </SectionBlock>

        {/* ── Companion Support ────────────────────────────────────────── */}
        <SectionBlock
          icon="leaf-outline"
          title="Companion support"
          subtitle="Mitra guidance, gentle returns, and community touchpoints."
          muted={muted}
        >
          {COMPANION_SUPPORT.map((cat) => (
            <CategoryRow
              key={cat.key}
              icon={cat.icon}
              label={cat.label}
              description={cat.description}
              value={notifications[cat.key] ?? true}
              onToggle={(v) => handleToggle(cat.key, v)}
              disabled={muted}
            />
          ))}
        </SectionBlock>

        {/* ── Deeply Personal ──────────────────────────────────────────── */}
        <SectionBlock
          icon="heart-outline"
          title="Deeply personal"
          subtitle="These are tender. Turn on only if you want Mitra with you in those moments."
          muted={muted}
          sensitive
        >
          {DEEPLY_PERSONAL.map((cat) => (
            <CategoryRow
              key={cat.key}
              icon={cat.icon}
              label={cat.label}
              description={cat.description}
              value={notifications[cat.key] ?? true}
              onToggle={(v) => handleToggle(cat.key, v)}
              disabled={muted}
            />
          ))}
        </SectionBlock>

        {/* ── Quiet Hours ──────────────────────────────────────────────── */}
        <SectionBlock
          icon="moon-outline"
          title="Quiet hours"
          subtitle="No push during this window. Mitra will wait."
        >
          <View style={styles.quietRow}>
            <View style={styles.quietField}>
              <Text style={styles.quietLabel}>From</Text>
              <TextInput
                style={styles.timeInput}
                value={quietStart}
                onChangeText={setQuietStart}
                placeholder="23:00"
                placeholderTextColor={Colors.textFaint}
                maxLength={5}
                keyboardType="numbers-and-punctuation"
                autoCorrect={false}
              />
            </View>
            <Text style={styles.quietSep}>–</Text>
            <View style={styles.quietField}>
              <Text style={styles.quietLabel}>Until</Text>
              <TextInput
                style={styles.timeInput}
                value={quietEnd}
                onChangeText={setQuietEnd}
                placeholder="05:00"
                placeholderTextColor={Colors.textFaint}
                maxLength={5}
                keyboardType="numbers-and-punctuation"
                autoCorrect={false}
              />
            </View>
            <TouchableOpacity
              style={[styles.saveBtn, (savingQuiet || quietSaved) && styles.saveBtnMuted]}
              onPress={handleSaveQuietHours}
              disabled={savingQuiet}
            >
              {savingQuiet ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>{quietSaved ? 'Saved' : 'Save'}</Text>
              )}
            </TouchableOpacity>
          </View>
          {quietError ? <Text style={styles.errorText}>{quietError}</Text> : null}
        </SectionBlock>

        {/* ── Timezone ─────────────────────────────────────────────────── */}
        <SectionBlock
          icon="earth-outline"
          title="Timezone"
          subtitle="Mitra uses your timezone to remind you at the right moment."
        >
          {tzPrompt === 'device' && detectedTz ? (
            <View style={styles.tzPromptBox}>
              <Text style={styles.tzPromptText}>
                Detected: {detectedTz}
              </Text>
              <View style={styles.tzPromptActions}>
                <TouchableOpacity
                  style={[styles.saveBtn, savingTz && styles.saveBtnMuted]}
                  onPress={() => handleSaveTimezone(detectedTz, true)}
                  disabled={savingTz}
                >
                  {savingTz ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveBtnText}>Use this</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.tzOutlineBtn}
                  onPress={() => { setTzPrompt(null); }}
                >
                  <Text style={styles.tzOutlineBtnText}>Choose manually</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDismissTzPrompt}>
                  <Text style={styles.tzDismissText}>Not now</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : tzPrompt === 'readiness' ? (
            <View style={styles.tzPromptBox}>
              <Text style={styles.tzPromptText}>
                Set your timezone so reminders arrive at the right time.
              </Text>
              <View style={styles.tzPromptActions}>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={() => setTzPrompt(null)}
                >
                  <Text style={styles.saveBtnText}>Set timezone</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDismissTzPrompt}>
                  <Text style={styles.tzDismissText}>Not now</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : storedTz ? (
            <Text style={styles.tzConfirmedText}>
              {storedTz} ✓
            </Text>
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
              onChange={(item) => setSelectedTimezone(item.value)}
            />
            <TouchableOpacity
              style={[styles.saveBtn, (savingTz || tzSaved) && styles.saveBtnMuted]}
              onPress={() => handleSaveTimezone(selectedTimezone)}
              disabled={savingTz || tzSaved}
            >
              {savingTz ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>{tzSaved ? 'Saved' : 'Save'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </SectionBlock>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Notifications serve your rhythm, not our engagement.{'\n'}
            You are always in control.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function SectionBlock({
  icon,
  title,
  subtitle,
  muted = false,
  accent = false,
  sensitive = false,
  children,
}: {
  icon: string;
  title: string;
  subtitle: string;
  muted?: boolean;
  accent?: boolean;
  sensitive?: boolean;
  children: React.ReactNode;
}) {
  const bg = sensitive
    ? 'rgba(245, 237, 234, 0.6)'
    : accent
    ? 'rgba(201, 168, 76, 0.06)'
    : Colors.cream;

  return (
    <View style={[styles.section, { backgroundColor: bg }, muted && styles.sectionMuted]}>
      <View style={styles.sectionHead}>
        <View style={styles.sectionIconWrap}>
          <Ionicons name={icon} size={14} color={accent || sensitive ? Colors.goldBright : Colors.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionTitle, sensitive && styles.sectionTitleSensitive]}>
            {title}
          </Text>
          <Text style={styles.sectionSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

function CategoryRow({
  icon,
  label,
  description,
  value,
  onToggle,
  disabled = false,
}: {
  icon: string;
  label: string;
  description: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={[styles.categoryRow, disabled && styles.categoryRowDisabled]}>
      <Ionicons
        name={icon}
        size={15}
        color={disabled ? Colors.textFaint : value ? Colors.goldBright : Colors.brownMuted}
        style={styles.categoryIcon}
      />
      <View style={styles.categoryText}>
        <Text style={[styles.categoryLabel, disabled && styles.categoryLabelMuted]}>{label}</Text>
        <Text style={styles.categoryDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: Colors.borderCream, true: Colors.goldBright }}
        thumbColor="#fff"
        ios_backgroundColor={Colors.borderCream}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.parchment,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.goldHairline,
    backgroundColor: Colors.parchment,
  },
  headerTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 26,
    color: Colors.brownDeep,
    marginBottom: 2,
  },
  headerSub: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: Colors.brownMuted,
    fontStyle: 'italic',
  },
  scroll: {
    paddingBottom: 48,
  },

  // Level card
  levelCard: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: Colors.cream,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.goldHairline,
    padding: 18,
  },
  levelHeading: {
    fontFamily: Fonts.serif.bold,
    fontSize: 17,
    color: Colors.brownDeep,
    marginBottom: 4,
  },
  levelSub: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: Colors.brownMuted,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  levelRow: {
    flexDirection: 'row',
    gap: 8,
  },
  levelOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderCream,
    backgroundColor: '#fff',
  },
  levelOptionActive: {
    borderColor: Colors.goldBright,
    backgroundColor: 'rgba(212,160,23,0.08)',
  },
  levelIcon: {
    marginBottom: 6,
  },
  levelLabel: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 13,
    color: Colors.brownMuted,
    marginBottom: 4,
  },
  levelLabelActive: {
    color: Colors.brownDeep,
  },
  levelOptionSub: {
    fontFamily: Fonts.sans.regular,
    fontSize: 10,
    color: Colors.textFaint,
    textAlign: 'center',
    lineHeight: 14,
  },
  mutedNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.goldHairline,
  },
  mutedNoteText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: Colors.brownMuted,
    flex: 1,
    lineHeight: 17,
  },

  // Section
  section: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.goldHairline,
    padding: 16,
  },
  sectionMuted: {
    opacity: 0.55,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(201,168,76,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  sectionTitle: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 13,
    color: Colors.brownDeep,
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    marginBottom: 2,
  },
  sectionTitleSensitive: {
    color: Colors.ringTan,
  },
  sectionSubtitle: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: Colors.brownMuted,
    lineHeight: 17,
  },

  // Category row
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: Colors.goldHairline,
    gap: 10,
  },
  categoryRowDisabled: {
    opacity: 0.5,
  },
  categoryIcon: {
    width: 18,
    textAlign: 'center',
  },
  categoryText: {
    flex: 1,
  },
  categoryLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: Colors.brownDeep,
    marginBottom: 2,
  },
  categoryLabelMuted: {
    color: Colors.brownMuted,
  },
  categoryDesc: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: Colors.brownMuted,
    lineHeight: 17,
  },

  // Sacred note
  sacredNote: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.goldHairline,
  },
  sacredNoteText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 13,
    color: Colors.brownMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Quiet hours
  quietRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  quietField: {
    flex: 1,
  },
  quietLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 11,
    color: Colors.brownMuted,
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  quietSep: {
    fontFamily: Fonts.sans.regular,
    fontSize: 18,
    color: Colors.brownMuted,
    paddingBottom: 10,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: Colors.borderCream,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 9 : 7,
    fontSize: 15,
    fontFamily: Fonts.sans.regular,
    color: Colors.brownDeep,
    backgroundColor: '#fff',
  },
  errorText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: '#c0392b',
    marginTop: 6,
  },

  // Shared save button
  saveBtn: {
    backgroundColor: Colors.goldBright,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnMuted: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 13,
    color: '#fff',
  },

  // Timezone
  tzPromptBox: {
    backgroundColor: 'rgba(212,160,23,0.07)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.goldHairline,
  },
  tzPromptText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: Colors.brownDeep,
    marginBottom: 10,
  },
  tzPromptActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  tzOutlineBtn: {
    borderWidth: 1,
    borderColor: Colors.gold,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  tzOutlineBtnText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 13,
    color: Colors.gold,
  },
  tzDismissText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: Colors.brownMuted,
    paddingHorizontal: 4,
    paddingVertical: 9,
  },
  tzConfirmedText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: Colors.brownDeep,
    marginBottom: 10,
  },
  tzPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  tzDropdown: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.borderCream,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 9 : 7,
    backgroundColor: '#fff',
  },
  tzDropdownText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: Colors.brownDeep,
  },
  tzDropdownItem: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: Colors.brownDeep,
  },
  tzDropdownContainer: {
    borderRadius: 8,
    borderColor: Colors.borderCream,
  },

  // Footer
  footer: {
    marginHorizontal: 16,
    marginTop: 28,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.goldHairline,
  },
  footerText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 13,
    color: Colors.brownMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
