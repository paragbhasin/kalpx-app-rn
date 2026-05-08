/**
 * FourDoorHomeContainer — S04 Phase 2 FourDoor home surface.
 *
 * Registered in ScreenRenderer as container_type "four_door_home".
 *
 * Fetches GET /api/mitra/v3/journey/home/ on first mount (skips if already
 * hydrated in store). Renders four door panels using DOOR_LABELS from
 * @kalpx/contracts. quick_reset taps navigate to room_stillness via the
 * canonical enter_room action.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { DOOR_LABELS } from '@kalpx/contracts';
import { mitraJourneyHomeV3 } from '../engine/mitraApi';
import { executeAction } from '../engine/actionExecutor';
import { useScreenStore } from '../engine/useScreenBridge';
import { setHomeData } from '../store/doorSlice';
import { screenActions, loadScreenWithData, goBackWithData } from '../store/screenSlice';
import TellMitraContainer from './TellMitraContainer';

export default function FourDoorHomeContainer() {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const homeData = useSelector((state: any) => state.door?.homeData);
  const [loading, setLoading] = useState(!homeData);
  const [error, setError] = useState(false);

  // Mirror the buildActionContext pattern from ContinueJourney.tsx so
  // enter_room can resolve screenState, setScreenValue, loadScreen, goBack.
  const screenBridge = useScreenStore();
  const screenBridgeRef = React.useRef(screenBridge);
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

  const handleQuickResetTap = useCallback(async () => {
    try {
      await executeAction(
        {
          type: 'enter_room',
          payload: { room_id: 'room_stillness', source: 'quick_reset_door' },
        } as any,
        buildActionContext() as any,
      );
    } catch (err: any) {
      console.warn('[FourDoorHomeContainer] quick_reset room entry failed:', err?.message);
    }
  }, [buildActionContext]);

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

  return (
    <View style={styles.root}>
      {/* my_rhythm door */}
      <TouchableOpacity
        style={styles.doorCard}
        activeOpacity={0.8}
        onPress={() => Alert.alert('Coming in next phase')}
      >
        <Text style={styles.doorLabel}>{DOOR_LABELS.my_rhythm}</Text>
        <Text style={styles.doorSubtitle}>{ds.my_rhythm?.cta ?? ''}</Text>
      </TouchableOpacity>

      {/* inner_path door */}
      <TouchableOpacity
        style={styles.doorCard}
        activeOpacity={0.8}
        onPress={() => Alert.alert('Coming in next phase')}
      >
        <Text style={styles.doorLabel}>{DOOR_LABELS.inner_path}</Text>
        <Text style={styles.doorSubtitle}>
          {ips?.has_active_path
            ? (ips.path_title ?? '')
            : (ds.inner_path?.subtitle ?? '')}
        </Text>
      </TouchableOpacity>

      {/* quick_reset door — navigates to room_stillness */}
      <TouchableOpacity
        style={styles.doorCard}
        activeOpacity={0.8}
        onPress={handleQuickResetTap}
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
