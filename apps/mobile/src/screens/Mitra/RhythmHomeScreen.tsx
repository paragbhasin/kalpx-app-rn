/**
 * RhythmHomeScreen — My Rhythm door destination.
 *
 * Reads companion_rhythm from Redux doorSlice.homeData.companion_rhythm.
 * If has_rhythm === false: empty state + "Set up My Rhythm" button.
 * If has_rhythm === true: morning/afternoon/night band cards.
 */

import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RHYTHM_BAND_LABELS, RHYTHM_BAND_SUBTITLES } from '@kalpx/contracts';
import type { RhythmTimeBand, RhythmItem } from '@kalpx/types';
import { Fonts } from '../../theme/fonts';

const MANTRA_COUNT_OPTIONS = [9, 27, 54, 108];

function MantraItem({ item }: { item: RhythmItem }) {
  const [selectedCount, setSelectedCount] = useState(9);
  const [done, setDone] = useState(false);

  return (
    <View style={styles.itemCard}>
      <Text style={styles.itemTypeBadge}>Mantra</Text>
      <Text style={styles.itemTitle}>{item.title_snapshot}</Text>
      {item.description_snapshot ? (
        <Text style={styles.itemDescription}>{item.description_snapshot}</Text>
      ) : null}
      {!done ? (
        <>
          <View style={styles.countRow}>
            {MANTRA_COUNT_OPTIONS.map((count) => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.countOption,
                  selectedCount === count && styles.countOptionSelected,
                ]}
                onPress={() => setSelectedCount(count)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.countOptionText,
                    selectedCount === count && styles.countOptionTextSelected,
                  ]}
                >
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setDone(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnText}>
              Begin — {selectedCount} repetitions
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.doneRow}>
          <Text style={styles.doneText}>Completed {selectedCount} times</Text>
        </View>
      )}
    </View>
  );
}

function SankalpItem({ item }: { item: RhythmItem }) {
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'done'>('idle');
  const [secondsLeft, setSecondsLeft] = useState(30);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    setTimerState('running');
    setSecondsLeft(30);
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          setTimerState('done');
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <View style={styles.itemCard}>
      <Text style={styles.itemTypeBadge}>Sankalp</Text>
      <Text style={styles.itemTitle}>{item.title_snapshot}</Text>
      {item.description_snapshot ? (
        <Text style={styles.itemDescription}>{item.description_snapshot}</Text>
      ) : null}
      {timerState === 'idle' && (
        <TouchableOpacity style={styles.actionBtn} onPress={startTimer} activeOpacity={0.8}>
          <Text style={styles.actionBtnText}>Hold for 30 seconds</Text>
        </TouchableOpacity>
      )}
      {timerState === 'running' && (
        <View style={styles.doneRow}>
          <Text style={styles.timerText}>{secondsLeft}s remaining</Text>
        </View>
      )}
      {timerState === 'done' && (
        <View style={styles.doneRow}>
          <Text style={styles.doneText}>Done</Text>
        </View>
      )}
    </View>
  );
}

function GenericItem({ item }: { item: RhythmItem }) {
  const [done, setDone] = useState(false);
  const label =
    item.item_type === 'practice'
      ? 'Practice'
      : item.item_type === 'reflection'
        ? 'Reflection'
        : 'Library';

  return (
    <View style={styles.itemCard}>
      <Text style={styles.itemTypeBadge}>{label}</Text>
      <Text style={styles.itemTitle}>{item.title_snapshot}</Text>
      {item.description_snapshot ? (
        <Text style={styles.itemDescription}>{item.description_snapshot}</Text>
      ) : null}
      {!done ? (
        <TouchableOpacity style={styles.actionBtn} onPress={() => setDone(true)} activeOpacity={0.8}>
          <Text style={styles.actionBtnText}>Mark Complete</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.doneRow}>
          <Text style={styles.doneText}>Complete</Text>
        </View>
      )}
    </View>
  );
}

function RhythmBand({ band, items }: { band: RhythmTimeBand; items: RhythmItem[] }) {
  return (
    <View style={styles.band}>
      <Text style={styles.bandLabel}>{RHYTHM_BAND_LABELS[band]}</Text>
      <Text style={styles.bandSubtitle}>{RHYTHM_BAND_SUBTITLES[band]}</Text>
      {items.map((item) => {
        if (item.item_type === 'mantra') return <MantraItem key={item.id} item={item} />;
        if (item.item_type === 'sankalp') return <SankalpItem key={item.id} item={item} />;
        return <GenericItem key={item.id} item={item} />;
      })}
      {items.length === 0 && (
        <Text style={styles.emptyBand}>No items in this band yet.</Text>
      )}
    </View>
  );
}

export default function RhythmHomeScreen() {
  const navigation = useNavigation<any>();
  const homeData = useSelector((state: any) => state.door?.homeData);
  const rhythm = homeData?.companion_rhythm;

  const hasRhythm = rhythm?.has_rhythm === true;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7} style={styles.backBtn}>
          <Text style={styles.backBtnText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Rhythm</Text>
        {hasRhythm && (
          <TouchableOpacity
            onPress={() => navigation.navigate('RhythmSetup' as any)}
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
    backgroundColor: '#FBF5F5',
    borderRadius: 15,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#DAC28E',
    gap: 8,
  },
  itemTypeBadge: {
    fontSize: 11,
    fontFamily: Fonts.sans.semiBold,
    color: '#8b6838',
    backgroundColor: '#f4ecdf',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  itemTitle: {
    fontSize: 18,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    fontWeight: '700',
  },
  itemDescription: {
    fontSize: 14,
    fontFamily: Fonts.serif.regular,
    color: '#7B6550',
    lineHeight: 20,
  },
  countRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  countOption: {
    borderWidth: 1,
    borderColor: '#DAC28E',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#FFF8EF',
  },
  countOptionSelected: {
    backgroundColor: '#C99317',
    borderColor: '#C99317',
  },
  countOptionText: {
    fontSize: 15,
    fontFamily: Fonts.sans.medium,
    color: '#7B6550',
  },
  countOptionTextSelected: {
    color: '#fff',
  },
  actionBtn: {
    backgroundColor: '#C99317',
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  actionBtnText: {
    fontSize: 15,
    fontFamily: Fonts.sans.semiBold,
    color: '#fff',
  },
  doneRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  doneText: {
    fontSize: 15,
    fontFamily: Fonts.sans.semiBold,
    color: '#C99317',
  },
  timerText: {
    fontSize: 22,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    fontWeight: '700',
  },
});
