/**
 * RhythmHomeScreen — My Rhythm door destination.
 *
 * Reads companion_rhythm from Redux doorSlice.homeData.companion_rhythm.
 * If has_rhythm === false: empty state + "Set up My Rhythm" button.
 * If has_rhythm === true: morning/afternoon/night band cards.
 */

import React, { useCallback, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RHYTHM_BAND_LABELS, RHYTHM_BAND_SUBTITLES } from '@kalpx/contracts';
import type { RhythmTimeBand, RhythmItem } from '@kalpx/types';
import { Fonts } from '../../theme/fonts';
import { executeAction } from '../../engine/actionExecutor';
import { useScreenStore } from '../../engine/useScreenBridge';
import { screenActions, loadScreenWithData, goBackWithData } from '../../store/screenSlice';

function actionLabel(itemType: string): string {
  if (itemType === 'mantra') return 'Chant';
  if (itemType === 'sankalp') return 'Embody';
  return 'Practice';
}

function RhythmItemCard({ item, onAction }: { item: RhythmItem; onAction: () => void }) {
  return (
    <View style={styles.itemCard}>
      <View style={styles.badgeRow}>
        <Text style={styles.itemTypeBadge}>{item.item_type.toUpperCase()}</Text>
      </View>
      <Text style={styles.itemTitle}>{item.title_snapshot}</Text>
      {item.description_snapshot ? (
        <Text style={styles.itemDescription}>{item.description_snapshot}</Text>
      ) : null}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={onAction} activeOpacity={0.8}>
          <Text style={styles.actionBtnText}>{actionLabel(item.item_type)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function RhythmBand({
  band,
  items,
  onItemAction,
}: {
  band: RhythmTimeBand;
  items: RhythmItem[];
  onItemAction: (item: RhythmItem) => void;
}) {
  return (
    <View style={styles.band}>
      <Text style={styles.bandLabel}>{RHYTHM_BAND_LABELS[band]}</Text>
      <Text style={styles.bandSubtitle}>{RHYTHM_BAND_SUBTITLES[band]}</Text>
      {items.map((item) => (
        <RhythmItemCard key={item.id} item={item} onAction={() => onItemAction(item)} />
      ))}
      {items.length === 0 && (
        <Text style={styles.emptyBand}>No items in this band yet.</Text>
      )}
    </View>
  );
}

export default function RhythmHomeScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const homeData = useSelector((state: any) => state.door?.homeData);
  const rhythm = homeData?.companion_rhythm;

  const hasRhythm = rhythm?.has_rhythm === true;

  const screenBridge = useScreenStore();
  const screenBridgeRef = useRef(screenBridge);
  useEffect(() => {
    screenBridgeRef.current = screenBridge;
  });

  const buildActionContext = useCallback(() => {
    return {
      screenState: screenBridgeRef.current.screenData || {},
      setScreenValue: (value: any, key: string) => {
        dispatch(screenActions.setScreenValue({ key, value }));
      },
      loadScreen: (target: any) => {
        const containerId =
          typeof target === 'string'
            ? 'generic'
            : target?.container_id || target?.containerId || 'generic';
        const stateId =
          typeof target === 'string'
            ? target
            : target?.state_id || target?.stateId || '';
        dispatch(loadScreenWithData({ containerId, stateId }) as any);
        navigation.navigate('DynamicEngine');
      },
      goBack: () => {
        dispatch(goBackWithData() as any);
      },
      currentScreen: screenBridgeRef.current.currentScreen,
    };
  }, [dispatch, navigation]);

  function handleItemAction(item: RhythmItem, band: RhythmTimeBand) {
    void executeAction(
      {
        type: 'start_runner',
        payload: {
          source: 'rhythm_daily',
          variant: item.item_type,
          rhythm_slot: band,
          item: {
            item_id: item.item_id,
            title_snapshot: item.title_snapshot,
            description_snapshot: item.description_snapshot ?? '',
            item_type: item.item_type,
          },
        },
      } as any,
      buildActionContext() as any,
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backBtn}>
          <Text style={styles.backBtnText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Rhythm</Text>
        {hasRhythm && (
          <TouchableOpacity
            onPress={() => navigation.navigate('RhythmEdit' as any)}
            activeOpacity={0.7}
            style={styles.editBtn}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        )}
        {!hasRhythm && <View style={styles.editBtn} />}
      </View>

      {!hasRhythm ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Your rhythm begins here.</Text>
          <Text style={styles.emptyBody}>
            A daily rhythm gives your practice a shape — morning intention, afternoon steadiness, night closure.
          </Text>
          <TouchableOpacity
            style={styles.setupBtn}
            onPress={() => navigation.navigate('RhythmSetup' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.setupBtnText}>Set up My Rhythm</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {(['morning', 'afternoon', 'night'] as RhythmTimeBand[]).map((band) => (
            <RhythmBand
              key={band}
              band={band}
              items={rhythm?.[band]?.items ?? []}
              onItemAction={(item) => handleItemAction(item, band)}
            />
          ))}
        </ScrollView>
      )}
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
  backBtn: {
    minWidth: 60,
  },
  backBtnText: {
    fontSize: 16,
    color: '#C99317',
    fontFamily: Fonts.sans.medium,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    fontWeight: '700',
  },
  editBtn: {
    minWidth: 40,
    alignItems: 'flex-end',
  },
  editBtnText: {
    fontSize: 15,
    color: '#C99317',
    fontFamily: Fonts.sans.medium,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '700',
  },
  emptyBody: {
    fontSize: 16,
    fontFamily: Fonts.serif.regular,
    color: '#7B6550',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  setupBtn: {
    backgroundColor: '#C99317',
    borderRadius: 15,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  setupBtnText: {
    fontSize: 17,
    fontFamily: Fonts.sans.semiBold,
    color: '#fff',
  },
  scrollContent: {
    padding: 16,
    gap: 20,
    paddingBottom: 40,
  },
  band: {
    gap: 10,
    marginBottom: 8,
  },
  bandLabel: {
    fontSize: 20,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    fontWeight: '700',
    marginBottom: 2,
  },
  bandSubtitle: {
    fontSize: 14,
    fontFamily: Fonts.serif.regular,
    color: '#7B6550',
    marginBottom: 6,
  },
  emptyBand: {
    fontSize: 14,
    color: '#9b8b77',
    fontFamily: Fonts.sans.regular,
    fontStyle: 'italic',
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(228,197,145,0.8)',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  itemTypeBadge: {
    fontSize: 10,
    fontFamily: Fonts.sans.semiBold,
    color: '#8B6914',
    backgroundColor: '#F5F0E0',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
    letterSpacing: 1.5,
  },
  itemTitle: {
    fontSize: 18,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    fontWeight: '700',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 13,
    fontFamily: Fonts.sans.regular,
    color: '#7B6550',
    lineHeight: 19,
    marginBottom: 8,
  },
  actionRow: {
    alignItems: 'flex-end',
  },
  actionBtn: {
    backgroundColor: '#C99317',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionBtnText: {
    fontSize: 14,
    fontFamily: Fonts.sans.semiBold,
    color: '#fff',
    fontWeight: '600',
  },
});
