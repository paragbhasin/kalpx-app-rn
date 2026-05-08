/**
 * RhythmSetupScreen — 5-step guided wizard for first-time My Rhythm setup.
 *
 * When editMode===false (default): shows guided wizard (moments → purpose →
 * suggestion → reminders → confirmation). When editMode===true: shows the
 * accordion editor directly (used by RhythmEditScreen wrapper).
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import {
  RHYTHM_BAND_LABELS,
  RHYTHM_BAND_SUBTITLES,
} from '@kalpx/contracts';
import type { RhythmTimeBand } from '@kalpx/types';
import LibrarySearchModal, { LibrarySearchItem } from '../../components/LibrarySearchModal';
import { executeAction } from '../../engine/actionExecutor';
import { useScreenStore } from '../../engine/useScreenBridge';
import { mitraJourneyHomeV3, postRhythmSetup } from '../../engine/mitraApi';
import { clearDoorState, setHomeData } from '../../store/doorSlice';
import { screenActions, loadScreenWithData, goBackWithData } from '../../store/screenSlice';
import { Fonts } from '../../theme/fonts';

// ─── Types ────────────────────────────────────────────────────────────────────

type WizardStep = 'moments' | 'purpose' | 'suggestion' | 'reminders' | 'confirmation';

interface LocalItem {
  slot: RhythmTimeBand;
  item_type: string;
  item_id: string;
  title_snapshot: string;
  description_snapshot: string | null;
  source: 'mitra_suggested' | 'user_chosen' | 'library';
  sort_order: number;
  reminder_enabled: boolean;
  reminder_time: string | null;
}

interface BandItem {
  item_id: string;
  item_type: string;
  title: string;
  description?: string | null;
}

type BandItems = Record<RhythmTimeBand, BandItem[]>;

// ─── Content maps ──────────────────────────────────────────────────────────────

const BANDS: RhythmTimeBand[] = ['morning', 'afternoon', 'night'];

const MOMENT_COPY: Record<RhythmTimeBand, { label: string; desc: string }> = {
  morning:   { label: 'Morning',   desc: 'Begin the day with steadiness and intention.' },
  afternoon: { label: 'Afternoon', desc: 'Pause, reset, and return to yourself.' },
  night:     { label: 'Night',     desc: 'Reflect, release, and close gently.' },
};

const PURPOSE_OPTIONS: Record<RhythmTimeBand, { value: string; label: string; desc: string }[]> = {
  morning: [
    { value: 'calm_start', label: 'Calm Start',  desc: 'Begin without rushing inside.' },
    { value: 'focus',      label: 'Focus',        desc: 'Gather the mind before action.' },
    { value: 'devotion',   label: 'Devotion',     desc: 'Begin the day with reverence.' },
    { value: 'discipline', label: 'Discipline',   desc: 'Start with one sincere commitment.' },
    { value: 'gratitude',  label: 'Gratitude',    desc: 'Remember what supports you.' },
    { value: 'clarity',    label: 'Clarity',      desc: 'See the day with steadiness.' },
  ],
  afternoon: [
    { value: 'reset',             label: 'Reset',             desc: 'Clear the midday weight.' },
    { value: 'patience',          label: 'Patience',          desc: 'Steady the response to friction.' },
    { value: 'sankalp_reminder',  label: 'Sankalp Reminder',  desc: 'Return to the quality you are practicing.' },
    { value: 'energy_check',      label: 'Energy Check',      desc: 'Restore prana for the second half.' },
    { value: 'mindful_action',    label: 'Mindful Action',    desc: 'Act from intention, not reaction.' },
    { value: 'emotional_balance', label: 'Emotional Balance', desc: 'Settle what is stirred.' },
  ],
  night: [
    { value: 'release',     label: 'Release',     desc: 'Let go of what the day placed on you.' },
    { value: 'gratitude',   label: 'Gratitude',   desc: 'Close with what was given.' },
    { value: 'reflection',  label: 'Reflection',  desc: 'See the day clearly before rest.' },
    { value: 'forgiveness', label: 'Forgiveness', desc: 'Dissolve what you are still carrying.' },
    { value: 'sleep_calm',  label: 'Sleep Calm',  desc: 'Steady the mind for deep rest.' },
    { value: 'self_review', label: 'Self-Review', desc: 'Study what the day is teaching.' },
  ],
};

type SuggestionSeed = Omit<LocalItem, 'slot' | 'sort_order'>;

const SUGGESTION_MAP: Record<RhythmTimeBand, Record<string, SuggestionSeed>> = {
  morning: {
    calm_start:  { item_id: 'mantra.soham',                      item_type: 'mantra',   title_snapshot: 'Soham',                          description_snapshot: 'Breathe with this mantra.',           source: 'mitra_suggested', reminder_enabled: false, reminder_time: null },
    focus:       { item_id: 'mantra.focus.2',                    item_type: 'mantra',   title_snapshot: 'Gayatri Mantra',                  description_snapshot: 'Awaken the light of discernment.',    source: 'mitra_suggested', reminder_enabled: false, reminder_time: null },
    devotion:    { item_id: 'mantra.peace_calm.om_namah_shivaya', item_type: 'mantra',  title_snapshot: 'Om Namah Shivaya',                description_snapshot: 'Surrender to what is sacred within.', source: 'mitra_suggested', reminder_enabled: false, reminder_time: null },
    discipline:  { item_id: 'sankalp.focus.discipline',          item_type: 'sankalp',  title_snapshot: 'Discipline is My Strength.',      description_snapshot: 'A sincere commitment to begin.',      source: 'mitra_suggested', reminder_enabled: false, reminder_time: null },
    gratitude:   { item_id: 'sankalp.live_in_gratitude',         item_type: 'sankalp',  title_snapshot: 'Choose gratitude today',          description_snapshot: 'Begin with what is already given.',   source: 'mitra_suggested', reminder_enabled: false, reminder_time: null },
    clarity:     { item_id: 'mantra.asato_ma',                   item_type: 'mantra',   title_snapshot: 'Asato Ma Sadgamaya',              description_snapshot: 'Lead me from confusion to clarity.',  source: 'mitra_suggested', reminder_enabled: false, reminder_time: null },
  },
  afternoon: {
    reset:             { item_id: 'practice.belly_breathing',         item_type: 'practice', title_snapshot: 'Belly Breathing',               description_snapshot: 'Soften and return to the breath.',     source: 'mitra_suggested', reminder_enabled: false, reminder_time: null },
    patience:          { item_id: 'choose_patience',                  item_type: 'sankalp',  title_snapshot: 'I will choose patience.',         description_snapshot: 'Steady the response to friction.',    source: 'mitra_suggested', reminder_enabled: false, reminder_time: null },
    sankalp_reminder:  { item_id: 'sankalp.choose_santosha',          item_type: 'sankalp',  title_snapshot: 'I choose Santosha.',              description_snapshot: 'Return to sacred contentment.',       source: 'mitra_suggested', reminder_enabled: false, reminder_time: null },
    energy_check:      { item_id: 'practice.anulom_vilom_basic',      item_type: 'practice', title_snapshot: 'Anulom Vilom',                    description_snapshot: 'Restore prana for the second half.',  source: 'mitra_suggested', reminder_enabled: false, reminder_time: null },
    mindful_action:    { item_id: 'sankalp.do_not_rush_the_ripening', item_type: 'sankalp',  title_snapshot: 'I do not rush what must ripen.',  description_snapshot: 'Act from intention, not reaction.',   source: 'mitra_suggested', reminder_enabled: false, reminder_time: null },
    emotional_balance: { item_id: 'practice.shanti_breath_cycle',     item_type: 'practice', title_snapshot: 'Shanti Breath Cycle',             description_snapshot: 'Settle what is stirred.',             source: 'mitra_suggested', reminder_enabled: false, reminder_time: null },
  },
  night: {
    release:     { item_id: 'practice.shanti_shoulder_release', item_type: 'practice', title_snapshot: 'Shoulder Release',                description_snapshot: 'Release what the day placed on you.', source: 'mitra_suggested', reminder_enabled: false, reminder_time: null },
    gratitude:   { item_id: 'evening_gratitude_reflection',     item_type: 'practice', title_snapshot: 'Evening Gratitude & Reflection',  description_snapshot: 'Close with what was given.',           source: 'mitra_suggested', reminder_enabled: false, reminder_time: null },
    reflection:  { item_id: 'practice.santosha_reflection',     item_type: 'practice', title_snapshot: 'Santosha Reflection',             description_snapshot: 'See the day clearly before rest.',    source: 'mitra_suggested', reminder_enabled: false, reminder_time: null },
    forgiveness: { item_id: 'kshama_practice',                  item_type: 'practice', title_snapshot: 'Practicing Kshama (Forgiveness)', description_snapshot: 'Dissolve what you are still carrying.', source: 'mitra_suggested', reminder_enabled: false, reminder_time: null },
    sleep_calm:  { item_id: 'practice.bhramari',                item_type: 'practice', title_snapshot: 'Bhramari (Humming Breath)',       description_snapshot: 'Steady the mind for deep rest.',      source: 'mitra_suggested', reminder_enabled: false, reminder_time: null },
    self_review: { item_id: 'svadhyaya_daily',                  item_type: 'practice', title_snapshot: 'Svadhyaya (Self-Study)',           description_snapshot: 'Study what the day is teaching.',     source: 'mitra_suggested', reminder_enabled: false, reminder_time: null },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function RhythmSetupScreen({ editMode = false }: { editMode?: boolean }) {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const homeData = useSelector((state: any) => state.door?.homeData);
  const existingRhythm = homeData?.companion_rhythm;

  // ── Screen bridge (needed for executeAction in wizard confirmation) ──────────
  const screenBridge = useScreenStore();
  const screenBridgeRef = useRef(screenBridge);
  useEffect(() => { screenBridgeRef.current = screenBridge; });

  const buildActionContext = useCallback(() => ({
    screenState: screenBridgeRef.current.screenData || {},
    setScreenValue: (value: any, key: string) => {
      dispatch(screenActions.setScreenValue({ key, value }));
    },
    loadScreen: (target: any) => {
      const containerId =
        typeof target === 'string' ? 'generic' : target?.container_id || target?.containerId || 'generic';
      const stateId =
        typeof target === 'string' ? target : target?.state_id || target?.stateId || '';
      dispatch(loadScreenWithData({ containerId, stateId }) as any);
      navigation.navigate('DynamicEngine');
    },
    goBack: () => { dispatch(goBackWithData() as any); },
    currentScreen: screenBridgeRef.current.currentScreen,
  }), [dispatch, navigation]);

  // ── Wizard state ─────────────────────────────────────────────────────────────
  const [wizardStep, setWizardStep] = useState<WizardStep | null>(editMode ? null : 'moments');
  const [selectedMoments, setSelectedMoments] = useState<RhythmTimeBand[]>([]);
  const [purposes, setPurposes] = useState<Partial<Record<RhythmTimeBand, string>>>({});
  const [wizardItems, setWizardItems] = useState<Partial<Record<RhythmTimeBand, LocalItem>>>({});
  const [wizardReminderPref, setWizardReminderPref] = useState<'yes' | 'no' | 'later'>('later');
  const [wizardPickerBand, setWizardPickerBand] = useState<RhythmTimeBand | null>(null);
  const [wizardSaving, setWizardSaving] = useState(false);
  const [wizardError, setWizardError] = useState('');

  // ── Accordion state (edit mode) ───────────────────────────────────────────────
  const seedBand = (band: RhythmTimeBand): BandItem[] => {
    const slot = existingRhythm?.[band];
    if (!slot?.items?.length) return [];
    return slot.items.map((item: any) => ({
      item_id: item.item_id,
      item_type: item.item_type,
      title: item.title_snapshot,
      description: item.description_snapshot ?? null,
    }));
  };

  const [bandItems, setBandItems] = useState<BandItems>({
    morning: seedBand('morning'),
    afternoon: seedBand('afternoon'),
    night: seedBand('night'),
  });
  const [expandedBand, setExpandedBand] = useState<RhythmTimeBand | null>('morning');
  const [libraryBand, setLibraryBand] = useState<RhythmTimeBand | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [reminderPref, setReminderPref] = useState<'yes' | 'no' | 'later'>('later');

  // ── Wizard methods ────────────────────────────────────────────────────────────

  const toggleMoment = (band: RhythmTimeBand) => {
    setSelectedMoments((prev) =>
      prev.includes(band) ? prev.filter((b) => b !== band) : [...prev, band],
    );
  };

  const advanceToSuggestion = () => {
    const newItems: Partial<Record<RhythmTimeBand, LocalItem>> = {};
    selectedMoments.forEach((band, idx) => {
      const purpose = purposes[band];
      if (purpose && SUGGESTION_MAP[band][purpose]) {
        newItems[band] = { ...SUGGESTION_MAP[band][purpose], slot: band, sort_order: idx };
      }
    });
    setWizardItems(newItems);
    setWizardStep('suggestion');
  };

  const handleWizardPickerSelect = (item: LibrarySearchItem) => {
    if (!wizardPickerBand) return;
    const itemId = item.itemId || (item as any).item_id || '';
    const itemType = (item as any)._type || item.itemType || (item as any).item_type || 'practice';
    setWizardItems((prev) => ({
      ...prev,
      [wizardPickerBand]: {
        slot: wizardPickerBand,
        item_id: itemId,
        item_type: itemType,
        title_snapshot: item.title,
        description_snapshot: item.description ?? null,
        source: 'user_chosen' as const,
        sort_order: selectedMoments.indexOf(wizardPickerBand),
        reminder_enabled: false,
        reminder_time: null,
      },
    }));
    setWizardPickerBand(null);
  };

  const saveWizard = async () => {
    setWizardSaving(true);
    setWizardError('');
    try {
      const items = Object.values(wizardItems).map((item) => ({
        slot: item!.slot,
        item_type: item!.item_type as any,
        item_id: item!.item_id,
        title_snapshot: item!.title_snapshot,
        description_snapshot: item!.description_snapshot,
        source: item!.source,
        sort_order: item!.sort_order,
        reminder_enabled: false,
        reminder_time: null,
      }));
      await postRhythmSetup({ items, reminder_preference: wizardReminderPref });
      const newHomeData = await mitraJourneyHomeV3();
      dispatch(setHomeData(newHomeData));
      dispatch(clearDoorState());
      setWizardStep('confirmation');
    } catch {
      setWizardError('Could not save. Please try again.');
    } finally {
      setWizardSaving(false);
    }
  };

  const beginTodaysPractice = () => {
    const hour = new Date().getHours();
    const band: RhythmTimeBand = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'night';
    const rhythm = homeData?.companion_rhythm;
    const practiceItem = rhythm?.[band]?.items?.[0];
    if (!practiceItem) {
      navigation.navigate('RhythmHome' as any);
      return;
    }
    void executeAction(
      {
        type: 'start_runner',
        payload: {
          source: 'rhythm_daily',
          variant: practiceItem.item_type,
          item: {
            item_id: practiceItem.item_id,
            title_snapshot: practiceItem.title_snapshot,
            description_snapshot: practiceItem.description_snapshot ?? '',
            item_type: practiceItem.item_type,
          },
        },
      } as any,
      buildActionContext() as any,
    );
  };

  // ── Accordion methods ─────────────────────────────────────────────────────────

  const handleItemSelected = (item: LibrarySearchItem) => {
    if (!libraryBand) return;
    const itemId = item.itemId || (item as any).item_id || '';
    const itemType = (item as any)._type || item.itemType || (item as any).item_type || 'practice';
    setBandItems((prev) => {
      if (prev[libraryBand].some((i) => i.item_id === itemId)) return prev;
      return {
        ...prev,
        [libraryBand]: [
          ...prev[libraryBand],
          { item_id: itemId, item_type: itemType, title: item.title, description: item.description ?? null },
        ],
      };
    });
    setLibraryBand(null);
  };

  const removeItem = (band: RhythmTimeBand, itemId: string) => {
    setBandItems((prev) => ({ ...prev, [band]: prev[band].filter((i) => i.item_id !== itemId) }));
  };

  const handleSave = async () => {
    const allItems = BANDS.flatMap((band, _) =>
      bandItems[band].map((item, idx) => ({
        slot: band,
        item_type: item.item_type as any,
        item_id: item.item_id,
        title_snapshot: item.title,
        description_snapshot: item.description ?? null,
        source: 'user_chosen' as const,
        sort_order: idx,
        reminder_enabled: false,
      })),
    );
    setSaving(true);
    setErrorMsg('');
    try {
      await postRhythmSetup({ items: allItems, reminder_preference: reminderPref });
      const newHomeData = await mitraJourneyHomeV3();
      dispatch(setHomeData(newHomeData));
      dispatch(clearDoorState());
      navigation.navigate('RhythmHome' as any);
    } catch {
      setErrorMsg('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Wizard step renderers ──────────────────────────────────────────────────────

  const STEP_LABELS: WizardStep[] = ['moments', 'purpose', 'suggestion', 'reminders'];

  const renderStepDots = (current: WizardStep) => {
    const idx = STEP_LABELS.indexOf(current);
    return (
      <View style={wStyles.dots}>
        {STEP_LABELS.map((_, i) => (
          <View key={i} style={[wStyles.dot, i === idx && wStyles.dotActive]} />
        ))}
      </View>
    );
  };

  const renderMomentsStep = () => (
    <SafeAreaView style={wStyles.safe}>
      <ScrollView contentContainerStyle={wStyles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={wStyles.backRow}>
          <Text style={wStyles.backText}>{'< Back'}</Text>
        </TouchableOpacity>
        {renderStepDots('moments')}
        <Text style={wStyles.heading}>Build Your Daily Rhythm</Text>
        <Text style={wStyles.subheading}>When would you like Mitra to support you?</Text>
        {BANDS.map((band) => {
          const selected = selectedMoments.includes(band);
          return (
            <TouchableOpacity
              key={band}
              style={[wStyles.momentCard, selected && wStyles.momentCardSelected]}
              onPress={() => toggleMoment(band)}
              activeOpacity={0.7}
            >
              <View style={wStyles.momentCardInner}>
                <Text style={wStyles.momentLabel}>{MOMENT_COPY[band].label}</Text>
                <Text style={wStyles.momentDesc}>{MOMENT_COPY[band].desc}</Text>
              </View>
              <View style={[wStyles.check, selected && wStyles.checkSelected]}>
                {selected && <Text style={wStyles.checkMark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={[wStyles.primaryBtn, selectedMoments.length === 0 && wStyles.primaryBtnDisabled]}
          onPress={() => setWizardStep('purpose')}
          disabled={selectedMoments.length === 0}
          activeOpacity={0.8}
        >
          <Text style={wStyles.primaryBtnText}>Continue →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );

  const renderPurposeStep = () => (
    <SafeAreaView style={wStyles.safe}>
      <ScrollView contentContainerStyle={wStyles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => setWizardStep('moments')} style={wStyles.backRow}>
          <Text style={wStyles.backText}>{'< Back'}</Text>
        </TouchableOpacity>
        {renderStepDots('purpose')}
        <Text style={wStyles.heading}>Choose Your Purpose</Text>
        <Text style={wStyles.subheading}>What do you need from each moment?</Text>

        {selectedMoments.map((band) => (
          <View key={band} style={wStyles.purposeSection}>
            <Text style={wStyles.purposeBandLabel}>{MOMENT_COPY[band].label}</Text>
            <View style={wStyles.purposeGrid}>
              {PURPOSE_OPTIONS[band].map((opt) => {
                const active = purposes[band] === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[wStyles.purposeChip, active && wStyles.purposeChipActive]}
                    onPress={() => setPurposes((prev) => ({ ...prev, [band]: opt.value }))}
                    activeOpacity={0.7}
                  >
                    <Text style={[wStyles.purposeChipLabel, active && wStyles.purposeChipLabelActive]}>
                      {opt.label}
                    </Text>
                    <Text style={[wStyles.purposeChipDesc, active && wStyles.purposeChipDescActive]}>
                      {opt.desc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[
            wStyles.primaryBtn,
            selectedMoments.some((b) => !purposes[b]) && wStyles.primaryBtnDisabled,
          ]}
          onPress={advanceToSuggestion}
          disabled={selectedMoments.some((b) => !purposes[b])}
          activeOpacity={0.8}
        >
          <Text style={wStyles.primaryBtnText}>Continue →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );

  const renderSuggestionStep = () => (
    <SafeAreaView style={wStyles.safe}>
      <ScrollView contentContainerStyle={wStyles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => setWizardStep('purpose')} style={wStyles.backRow}>
          <Text style={wStyles.backText}>{'< Back'}</Text>
        </TouchableOpacity>
        {renderStepDots('suggestion')}
        <Text style={wStyles.heading}>Mitra Suggests</Text>
        <Text style={wStyles.subheading}>These practices match your intentions.</Text>

        {selectedMoments.map((band) => {
          const item = wizardItems[band];
          if (!item) return null;
          return (
            <View key={band} style={wStyles.suggestionCard}>
              <View style={wStyles.suggestionCardHeader}>
                <Text style={wStyles.suggestionBandLabel}>{MOMENT_COPY[band].label}</Text>
                <Text style={wStyles.suggestionTypeBadge}>{item.item_type}</Text>
              </View>
              <Text style={wStyles.suggestionTitle}>{item.title_snapshot}</Text>
              {!!item.description_snapshot && (
                <Text style={wStyles.suggestionDesc}>{item.description_snapshot}</Text>
              )}
              <TouchableOpacity
                style={wStyles.changeBtn}
                onPress={() => setWizardPickerBand(band)}
                activeOpacity={0.7}
              >
                <Text style={wStyles.changeBtnText}>Change</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <TouchableOpacity
          style={wStyles.primaryBtn}
          onPress={() => setWizardStep('reminders')}
          activeOpacity={0.8}
        >
          <Text style={wStyles.primaryBtnText}>Accept Rhythm →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => { setWizardStep(null); }}
          activeOpacity={0.7}
          style={wStyles.secondaryLinkRow}
        >
          <Text style={wStyles.secondaryLink}>Choose My Own</Text>
        </TouchableOpacity>
      </ScrollView>

      <LibrarySearchModal
        isVisible={wizardPickerBand !== null}
        onClose={() => setWizardPickerBand(null)}
        onItemAdded={() => {}}
        mode="select_for_rhythm"
        onItemSelected={handleWizardPickerSelect}
      />
    </SafeAreaView>
  );

  const renderRemindersStep = () => (
    <SafeAreaView style={wStyles.safe}>
      <ScrollView contentContainerStyle={wStyles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity onPress={() => setWizardStep('suggestion')} style={wStyles.backRow}>
          <Text style={wStyles.backText}>{'< Back'}</Text>
        </TouchableOpacity>
        {renderStepDots('reminders')}
        <Text style={wStyles.heading}>Gentle Reminders</Text>
        <Text style={wStyles.subheading}>Would you like Mitra to remind you?</Text>

        <View style={wStyles.pillRow}>
          {(
            [
              { label: 'Yes, gently', value: 'yes' },
              { label: 'I will come', value: 'no' },
              { label: 'Ask me later', value: 'later' },
            ] as { label: string; value: 'yes' | 'no' | 'later' }[]
          ).map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[wStyles.pill, wizardReminderPref === opt.value && wStyles.pillActive]}
              onPress={() => setWizardReminderPref(opt.value)}
              activeOpacity={0.7}
            >
              <Text style={[wStyles.pillText, wizardReminderPref === opt.value && wStyles.pillTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {!!wizardError && <Text style={wStyles.errorText}>{wizardError}</Text>}

        <TouchableOpacity
          style={[wStyles.primaryBtn, wizardSaving && wStyles.primaryBtnDisabled]}
          onPress={() => void saveWizard()}
          disabled={wizardSaving}
          activeOpacity={0.8}
        >
          {wizardSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={wStyles.primaryBtnText}>Continue →</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );

  const renderConfirmationStep = () => (
    <SafeAreaView style={wStyles.safe}>
      <ScrollView contentContainerStyle={wStyles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={[wStyles.heading, { marginTop: 48 }]}>Your Daily Companion{'\n'}is ready.</Text>
        <Text style={wStyles.subheading}>A practice waits for you each day.</Text>

        <View style={wStyles.confirmList}>
          {selectedMoments.map((band) => {
            const item = wizardItems[band];
            if (!item) return null;
            return (
              <View key={band} style={wStyles.confirmRow}>
                <Text style={wStyles.confirmBand}>{MOMENT_COPY[band].label}</Text>
                <Text style={wStyles.confirmTitle}>{item.title_snapshot}</Text>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={wStyles.primaryBtn}
          onPress={beginTodaysPractice}
          activeOpacity={0.8}
        >
          <Text style={wStyles.primaryBtnText}>Begin today's practice</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[wStyles.primaryBtn, wStyles.secondaryBtn]}
          onPress={() => navigation.navigate('RhythmHome' as any)}
          activeOpacity={0.8}
        >
          <Text style={[wStyles.primaryBtnText, { color: '#7B6550' }]}>Return Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('InnerPath' as any)}
          activeOpacity={0.7}
          style={wStyles.secondaryLinkRow}
        >
          <Text style={wStyles.secondaryLink}>Add Inner Path</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );

  // ── Render ────────────────────────────────────────────────────────────────────

  if (wizardStep === 'moments') return renderMomentsStep();
  if (wizardStep === 'purpose') return renderPurposeStep();
  if (wizardStep === 'suggestion') return renderSuggestionStep();
  if (wizardStep === 'reminders') return renderRemindersStep();
  if (wizardStep === 'confirmation') return renderConfirmationStep();

  // ── Edit mode: accordion ──────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit My Rhythm</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {BANDS.map((band) => {
          const isExpanded = expandedBand === band;
          return (
            <View key={band} style={styles.bandSection}>
              <TouchableOpacity
                style={styles.bandHeader}
                onPress={() => setExpandedBand(isExpanded ? null : band)}
                activeOpacity={0.7}
              >
                <View>
                  <Text style={styles.bandLabel}>{RHYTHM_BAND_LABELS[band]}</Text>
                  <Text style={styles.bandSubtitle}>{RHYTHM_BAND_SUBTITLES[band]}</Text>
                </View>
                <Text style={styles.chevron}>{isExpanded ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.bandBody}>
                  {bandItems[band].map((item) => (
                    <View key={item.item_id} style={styles.addedItem}>
                      <View style={styles.addedItemInfo}>
                        <Text style={styles.addedItemType}>{item.item_type}</Text>
                        <Text style={styles.addedItemTitle}>{item.title}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => removeItem(band, item.item_id)}
                        activeOpacity={0.7}
                        style={styles.removeBtn}
                      >
                        <Text style={styles.removeBtnText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  <TouchableOpacity
                    style={styles.addFromLibraryBtn}
                    onPress={() => setLibraryBand(band)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addFromLibraryText}>+ Add from library</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.reminderSection}>
          <Text style={styles.reminderLabel}>Reminder preference</Text>
          <View style={styles.reminderPills}>
            {(
              [
                { label: 'Yes please', value: 'yes' },
                { label: 'No thanks', value: 'no' },
                { label: 'Remind me later', value: 'later' },
              ] as { label: string; value: 'yes' | 'no' | 'later' }[]
            ).map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setReminderPref(opt.value)}
                activeOpacity={0.7}
                style={[styles.reminderPill, reminderPref === opt.value && styles.reminderPillSelected]}
              >
                <Text
                  style={[
                    styles.reminderPillText,
                    reminderPref === opt.value && styles.reminderPillTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save My Rhythm</Text>}
        </TouchableOpacity>
      </ScrollView>

      <LibrarySearchModal
        isVisible={libraryBand !== null}
        onClose={() => setLibraryBand(null)}
        onItemAdded={() => {}}
        mode="select_for_rhythm"
        onItemSelected={handleItemSelected}
      />
    </SafeAreaView>
  );
}

// ─── Wizard styles ─────────────────────────────────────────────────────────────

const wStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8EF' },
  scroll: { padding: 20, paddingBottom: 48 },
  backRow: { marginBottom: 16 },
  backText: { fontSize: 15, color: '#C99317', fontFamily: Fonts.sans.medium },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(201,147,23,0.25)' },
  dotActive: { backgroundColor: '#C99317' },
  heading: { fontFamily: Fonts.serif.bold, fontSize: 26, color: '#432104', fontWeight: '700', marginBottom: 8 },
  subheading: { fontSize: 15, color: '#7B6550', fontFamily: Fonts.sans.regular, marginBottom: 24, lineHeight: 22 },
  momentCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 18, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(201,168,76,0.25)',
    backgroundColor: 'rgba(250,245,240,0.92)', marginBottom: 12,
  },
  momentCardSelected: { borderColor: '#C99317', backgroundColor: 'rgba(201,147,23,0.08)' },
  momentCardInner: { flex: 1, marginRight: 12 },
  momentLabel: { fontFamily: Fonts.serif.bold, fontSize: 17, color: '#432104', fontWeight: '700', marginBottom: 4 },
  momentDesc: { fontSize: 13, color: '#7B6550', fontFamily: Fonts.sans.regular },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(201,168,76,0.4)', alignItems: 'center', justifyContent: 'center' },
  checkSelected: { backgroundColor: '#C99317', borderColor: '#C99317' },
  checkMark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  purposeSection: { marginBottom: 20 },
  purposeBandLabel: { fontFamily: Fonts.serif.bold, fontSize: 16, color: '#432104', fontWeight: '700', marginBottom: 10 },
  purposeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  purposeChip: {
    width: '47%', padding: 12, borderRadius: 12, borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)', backgroundColor: 'rgba(250,245,240,0.92)',
  },
  purposeChipActive: { borderColor: '#C99317', backgroundColor: 'rgba(201,147,23,0.1)' },
  purposeChipLabel: { fontFamily: Fonts.serif.bold, fontSize: 14, color: '#432104', fontWeight: '600', marginBottom: 2 },
  purposeChipLabelActive: { color: '#8B5E00' },
  purposeChipDesc: { fontSize: 11, color: '#A08060', fontFamily: Fonts.sans.regular },
  purposeChipDescActive: { color: '#7B5500' },
  suggestionCard: {
    padding: 16, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(201,168,76,0.25)',
    backgroundColor: 'rgba(255,252,248,0.95)', marginBottom: 14,
  },
  suggestionCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  suggestionBandLabel: { fontFamily: Fonts.serif.bold, fontSize: 13, color: '#7B6550', fontWeight: '700' },
  suggestionTypeBadge: { fontSize: 11, color: '#8b6838', fontFamily: Fonts.sans.semiBold, textTransform: 'uppercase' },
  suggestionTitle: { fontFamily: Fonts.serif.bold, fontSize: 17, color: '#432104', fontWeight: '600', marginBottom: 4 },
  suggestionDesc: { fontSize: 13, color: '#7B6550', fontFamily: Fonts.sans.regular, marginBottom: 10 },
  changeBtn: { alignSelf: 'flex-start', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(201,168,76,0.4)' },
  changeBtnText: { fontSize: 13, color: '#C99317', fontFamily: Fonts.sans.medium },
  pillRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  pill: { flex: 1, paddingVertical: 12, borderRadius: 20, borderWidth: 1.5, borderColor: '#DAC28E', alignItems: 'center', backgroundColor: '#FBF5F5' },
  pillActive: { backgroundColor: '#C99317', borderColor: '#C99317' },
  pillText: { fontSize: 13, color: '#7B6550', fontFamily: Fonts.sans.medium, textAlign: 'center' },
  pillTextActive: { color: '#fff' },
  confirmList: { marginVertical: 24 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: 'rgba(201,168,76,0.25)' },
  confirmBand: { fontFamily: Fonts.serif.bold, fontSize: 15, color: '#7B6550', fontWeight: '600' },
  confirmTitle: { fontFamily: Fonts.serif.regular, fontSize: 15, color: '#432104', flex: 1, textAlign: 'right' },
  primaryBtn: { backgroundColor: '#C99317', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
  primaryBtnDisabled: { opacity: 0.45 },
  primaryBtnText: { fontSize: 16, fontFamily: Fonts.sans.semiBold, color: '#fff' },
  secondaryBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(201,168,76,0.4)' },
  secondaryLinkRow: { alignItems: 'center', paddingTop: 12 },
  secondaryLink: { fontSize: 13, color: '#C99317', fontFamily: Fonts.sans.medium },
  errorText: { fontSize: 13, color: '#c0392b', textAlign: 'center', marginBottom: 10 },
});

// ─── Accordion styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF8EF' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
    borderBottomWidth: 0.5, borderBottomColor: '#DAC28E',
  },
  backBtnText: { fontSize: 16, color: '#C99317', fontFamily: Fonts.sans.medium },
  headerTitle: { fontSize: 20, fontFamily: Fonts.serif.bold, color: '#432104', fontWeight: '700' },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 40 },
  bandSection: { backgroundColor: '#FBF5F5', borderRadius: 15, borderWidth: 0.5, borderColor: '#DAC28E', overflow: 'hidden' },
  bandHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  bandLabel: { fontSize: 18, fontFamily: Fonts.serif.bold, color: '#432104', fontWeight: '700' },
  bandSubtitle: { fontSize: 13, fontFamily: Fonts.serif.regular, color: '#7B6550', marginTop: 2 },
  chevron: { fontSize: 14, color: '#7B6550' },
  bandBody: { padding: 16, paddingTop: 0, gap: 10 },
  addedItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8EF', borderRadius: 10, padding: 12, borderWidth: 0.5, borderColor: '#DAC28E' },
  addedItemInfo: { flex: 1, gap: 2 },
  addedItemType: { fontSize: 11, fontFamily: Fonts.sans.semiBold, color: '#8b6838', textTransform: 'uppercase' },
  addedItemTitle: { fontSize: 15, fontFamily: Fonts.serif.regular, color: '#432104' },
  removeBtn: { padding: 4 },
  removeBtnText: { fontSize: 13, color: '#c0392b', fontFamily: Fonts.sans.medium },
  addFromLibraryBtn: { borderWidth: 1, borderColor: '#C99317', borderRadius: 10, paddingVertical: 10, alignItems: 'center', backgroundColor: 'rgba(201, 147, 23, 0.05)' },
  addFromLibraryText: { fontSize: 15, color: '#C99317', fontFamily: Fonts.sans.semiBold },
  errorText: { fontSize: 14, color: '#c0392b', textAlign: 'center' },
  saveBtn: { backgroundColor: '#C99317', borderRadius: 15, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 17, fontFamily: Fonts.sans.semiBold, color: '#fff' },
  reminderSection: { marginTop: 8 },
  reminderLabel: { fontSize: 13, color: '#7B6550', fontFamily: Fonts.sans.medium, marginBottom: 8 },
  reminderPills: { flexDirection: 'row', gap: 8 },
  reminderPill: { flex: 1, borderWidth: 1.5, borderColor: '#DAC28E', borderRadius: 15, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center', backgroundColor: '#FBF5F5' },
  reminderPillSelected: { backgroundColor: '#C99317', borderColor: '#C99317' },
  reminderPillText: { fontSize: 13, color: '#7B6550', fontFamily: Fonts.sans.medium, textAlign: 'center' },
  reminderPillTextSelected: { color: '#fff' },
});
