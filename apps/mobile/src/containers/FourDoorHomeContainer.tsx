/**
 * FourDoorHomeContainer — S04 Phase 2 FourDoor home surface.
 *
 * Registered in ScreenRenderer as container_type "four_door_home".
 *
 * Fetches GET /api/mitra/v3/journey/home/ on first mount (skips if already
 * hydrated in store). Renders four door panels using DOOR_LABELS from
 * @kalpx/contracts. my_rhythm→RhythmHome, inner_path→InnerPath,
 * quick_reset→QuickReset screen, tell_mitra inline.
 */

import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { DOOR_LABELS } from '@kalpx/contracts';
import { mitraJourneyHomeV3 } from '../engine/mitraApi';
import { setHomeData } from '../store/doorSlice';
import TellMitraContainer from './TellMitraContainer';

function getRhythmTimeBand(): 'morning' | 'afternoon' | 'night' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'night';
}

export default function FourDoorHomeContainer() {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const homeData = useSelector((state: any) => state.door?.homeData);
  const [loading, setLoading] = useState(!homeData);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (homeData) return; // already hydrated
    setLoading(true);
    mitraJourneyHomeV3()
      .then((data) => {
        dispatch(setHomeData(data));
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <View style={styles.centeredWrap}>
        <ActivityIndicator size="small" color="#b8922a" />
      </View>
    );
  }

  if (error || !homeData) {
    return (
      <View style={styles.centeredWrap}>
        <Text style={styles.errorText}>Unable to load. Please try again.</Text>
      </View>
    );
  }

  const ds = homeData.door_states;
  const ips = homeData.inner_path_summary;
  const greeting = homeData.greeting;

  // My Rhythm: prefer backend summary label, then first item in current time-band slot, then door state
  const rhythmBand = getRhythmTimeBand();
  const rhythmSlot = homeData.companion_rhythm?.[rhythmBand];
  const rhythmSubtitle =
    homeData.my_rhythm_summary?.next_practice_label ??
    rhythmSlot?.items?.[0]?.title_snapshot ??
    ds.my_rhythm?.subtitle ??
    ds.my_rhythm?.cta ??
    '';

  // Inner Path: prefer Day X of Y when path is active, fallback to path_title or door subtitle
  const innerPathSubtitle = ips?.has_active_path
    ? `Day ${ips.day_number} of ${ips.total_days}`
    : (ips?.path_title ?? ds.inner_path?.subtitle ?? '');

  return (
    <View style={styles.root}>
      {/* Greeting */}
      {(greeting?.headline || greeting?.subtext) && (
        <View style={styles.greetingBlock}>
          {!!greeting.headline && (
            <Text style={styles.greetingHeadline}>{greeting.headline}</Text>
          )}
          {!!greeting.subtext && (
            <Text style={styles.greetingSubtext}>{greeting.subtext}</Text>
          )}
        </View>
      )}

      {/* my_rhythm door */}
      <TouchableOpacity
        style={styles.doorCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("RhythmHome" as any)}
      >
        <Text style={styles.doorLabel}>{DOOR_LABELS.my_rhythm}</Text>
        <Text style={styles.doorSubtitle}>{rhythmSubtitle}</Text>
      </TouchableOpacity>

      {/* inner_path door */}
      <TouchableOpacity
        style={styles.doorCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("InnerPath" as any)}
      >
        <Text style={styles.doorLabel}>{DOOR_LABELS.inner_path}</Text>
        <Text style={styles.doorSubtitle}>
          {innerPathSubtitle}
        </Text>
      </TouchableOpacity>

      {/* quick_reset door */}
      <TouchableOpacity
        style={styles.doorCard}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("QuickReset" as any)}
      >
        <Text style={styles.doorLabel}>{DOOR_LABELS.quick_reset}</Text>
        <Text style={styles.doorSubtitle}>{ds.quick_reset?.subtitle ?? ''}</Text>
      </TouchableOpacity>

      {/* tell_mitra door — inline TellMitraContainer */}
      <View style={styles.tellMitraWrap}>
        <Text style={styles.doorLabel}>{DOOR_LABELS.tell_mitra}</Text>
        <TellMitraContainer />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  centeredWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6b5a45',
    textAlign: 'center',
  },
  doorCard: {
    backgroundColor: '#FBF5F5',
    borderColor: '#9f9f9f',
    borderWidth: 0.3,
    borderRadius: 15,
    padding: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  doorLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#432104',
    marginBottom: 4,
  },
  doorSubtitle: {
    fontSize: 14,
    color: '#6b5a45',
  },
  greetingBlock: {
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  greetingHeadline: {
    fontFamily: 'serif',
    fontSize: 22,
    fontWeight: '700',
    color: '#432104',
    marginBottom: 4,
  },
  greetingSubtext: {
    fontFamily: 'serif',
    fontSize: 15,
    color: '#7B6550',
    lineHeight: 22,
  },
  tellMitraWrap: {
    backgroundColor: '#FBF5F5',
    borderColor: '#9f9f9f',
    borderWidth: 0.3,
    borderRadius: 15,
    padding: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
});
