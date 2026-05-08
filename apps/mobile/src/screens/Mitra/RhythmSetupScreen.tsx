/**
 * RhythmSetupScreen — 3-band accordion for building My Rhythm.
 *
 * Per band: list of added items + "Add from library" → LibrarySearchModal
 * with mode="select_for_rhythm". Save calls postRhythmSetup, then navigates
 * to RhythmHome after clearing door state.
 */

import React, { useState } from 'react';
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
import { mitraJourneyHomeV3, postRhythmSetup } from '../../engine/mitraApi';
import { clearDoorState, setHomeData } from '../../store/doorSlice';
import { Fonts } from '../../theme/fonts';

interface BandItem {
  item_id: string;
  item_type: string;
  title: string;
  description?: string | null;
}

type BandItems = Record<RhythmTimeBand, BandItem[]>;

export default function RhythmSetupScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const homeData = useSelector((state: any) => state.door?.homeData);
  const existingRhythm = homeData?.companion_rhythm;

  // Seed from existing rhythm if present
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

  const openLibrary = (band: RhythmTimeBand) => setLibraryBand(band);
  const closeLibrary = () => setLibraryBand(null);

  const handleItemSelected = (item: LibrarySearchItem) => {
    if (!libraryBand) return;
    const itemId = item.itemId || (item as any).item_id || '';
    const itemType = (item as any)._type || item.itemType || (item as any).item_type || 'practice';
    setBandItems((prev) => {
      // avoid duplicates
      if (prev[libraryBand].some((i) => i.item_id === itemId)) return prev;
      return {
        ...prev,
        [libraryBand]: [
          ...prev[libraryBand],
          {
            item_id: itemId,
            item_type: itemType,
            title: item.title,
            description: item.description ?? null,
          },
        ],
      };
    });
    closeLibrary();
  };

  const removeItem = (band: RhythmTimeBand, itemId: string) => {
    setBandItems((prev) => ({
      ...prev,
      [band]: prev[band].filter((i) => i.item_id !== itemId),
    }));
  };

  const handleSave = async () => {
    const allItems = (['morning', 'afternoon', 'night'] as RhythmTimeBand[]).flatMap(
      (band, _) =>
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
      const homeData = await mitraJourneyHomeV3();
      dispatch(setHomeData(homeData));
      dispatch(clearDoorState());
      navigation.navigate('RhythmHome' as any);
    } catch {
      setErrorMsg('Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const bands: RhythmTimeBand[] = ['morning', 'afternoon', 'night'];

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set up My Rhythm</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {bands.map((band) => {
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
                    onPress={() => openLibrary(band)}
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
                style={[
                  styles.reminderPill,
                  reminderPref === opt.value && styles.reminderPillSelected,
                ]}
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
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save My Rhythm</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* LibrarySearchModal in select_for_rhythm mode */}
      <LibrarySearchModal
        isVisible={libraryBand !== null}
        onClose={closeLibrary}
        onItemAdded={() => {}}
        mode="select_for_rhythm"
        onItemSelected={handleItemSelected}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF8EF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DAC28E',
  },
  backBtnText: {
    fontSize: 16,
    color: '#C99317',
    fontFamily: Fonts.sans.medium,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },
  bandSection: {
    backgroundColor: '#FBF5F5',
    borderRadius: 15,
    borderWidth: 0.5,
    borderColor: '#DAC28E',
    overflow: 'hidden',
  },
  bandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  bandLabel: {
    fontSize: 18,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    fontWeight: '700',
  },
  bandSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.serif.regular,
    color: '#7B6550',
    marginTop: 2,
  },
  chevron: {
    fontSize: 14,
    color: '#7B6550',
  },
  bandBody: {
    padding: 16,
    paddingTop: 0,
    gap: 10,
  },
  addedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8EF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 0.5,
    borderColor: '#DAC28E',
  },
  addedItemInfo: {
    flex: 1,
    gap: 2,
  },
  addedItemType: {
    fontSize: 11,
    fontFamily: Fonts.sans.semiBold,
    color: '#8b6838',
    textTransform: 'uppercase',
  },
  addedItemTitle: {
    fontSize: 15,
    fontFamily: Fonts.serif.regular,
    color: '#432104',
  },
  removeBtn: {
    padding: 4,
  },
  removeBtnText: {
    fontSize: 13,
    color: '#c0392b',
    fontFamily: Fonts.sans.medium,
  },
  addFromLibraryBtn: {
    borderWidth: 1,
    borderColor: '#C99317',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(201, 147, 23, 0.05)',
  },
  addFromLibraryText: {
    fontSize: 15,
    color: '#C99317',
    fontFamily: Fonts.sans.semiBold,
  },
  errorText: {
    fontSize: 14,
    color: '#c0392b',
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: '#C99317',
    borderRadius: 15,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 17,
    fontFamily: Fonts.sans.semiBold,
    color: '#fff',
  },
  reminderSection: {
    marginTop: 8,
  },
  reminderLabel: {
    fontSize: 13,
    color: '#7B6550',
    fontFamily: Fonts.sans.medium,
    marginBottom: 8,
  },
  reminderPills: {
    flexDirection: 'row',
    gap: 8,
  },
  reminderPill: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#DAC28E',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FBF5F5',
  },
  reminderPillSelected: {
    backgroundColor: '#C99317',
    borderColor: '#C99317',
  },
  reminderPillText: {
    fontSize: 13,
    color: '#7B6550',
    fontFamily: Fonts.sans.medium,
    textAlign: 'center',
  },
  reminderPillTextSelected: {
    color: '#fff',
  },
});
