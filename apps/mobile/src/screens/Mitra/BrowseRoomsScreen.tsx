/**
 * BrowseRoomsScreen — 6 rooms in 3 groups (Settle/Understand/Grow).
 *
 * Room tap loads room via executeAction enter_room then navigates to DynamicEngine.
 */

import React, { useCallback, useEffect } from 'react';
import { useTranslation } from "react-i18next";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ROOM_LABELS, ROOM_DESCRIPTIONS } from '@kalpx/contracts';
import type { VerifiedRoomId } from '@kalpx/types';
import { executeAction } from '../../engine/actionExecutor';
import { useScreenStore } from '../../engine/useScreenBridge';
import { screenActions, loadScreenWithData, goBackWithData } from '../../store/screenSlice';
import { Fonts } from '../../theme/fonts';
import { platformShadow } from "../../theme/shadows";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface RoomGroup {
  label: string;
  rooms: VerifiedRoomId[];
}

const ROOM_GROUPS: RoomGroup[] = [
  {
    label: 'Settle',
    rooms: ['room_stillness', 'room_release'],
  },
  {
    label: 'Understand',
    rooms: ['room_clarity', 'room_connection'],
  },
  {
    label: 'Grow',
    rooms: ['room_growth', 'room_joy'],
  },
];

export default function BrowseRoomsScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const screenBridge = useScreenStore();
  const screenBridgeRef = React.useRef(screenBridge);
  useEffect(() => {
    screenBridgeRef.current = screenBridge;
  });

  const updateBackground = useScreenStore((state) => state.updateBackground);

  useFocusEffect(
    useCallback(() => {
      updateBackground(require('../../../assets/beige_bg.webp'));
      return () => updateBackground(null);
    }, [updateBackground]),
  );

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

  const handleRoomTap = useCallback(async (roomId: VerifiedRoomId) => {
    try {
      await executeAction(
        {
          type: 'enter_room',
          payload: { room_id: roomId, source: 'browse_rooms' },
        } as any,
        buildActionContext() as any,
      );
    } catch (err: any) {
      console.warn('[BrowseRoomsScreen] room entry failed:', err?.message);
      navigation.navigate('DynamicEngine' as any);
    }
  }, [buildActionContext, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("browseRooms.title")}</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + insets.bottom + 16 }]} showsVerticalScrollIndicator={false}>
        {ROOM_GROUPS.map((group) => (
          <View key={group.label} style={styles.group}>
            <Text style={styles.groupLabel}>{t(`browseRooms.group.${group.label.toLowerCase()}`, { defaultValue: group.label })}</Text>
            {group.rooms.map((roomId) => (
              <TouchableOpacity
                key={roomId}
                style={styles.roomCard}
                onPress={() => handleRoomTap(roomId)}
                activeOpacity={0.8}
              >
                <Text style={styles.roomLabel}>{ROOM_LABELS[roomId]}</Text>
                <Text style={styles.roomDescription}>{ROOM_DESCRIPTIONS[roomId]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
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
  headerTitle: {
    fontSize: 22,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    gap: 20,
    paddingBottom: 40,
  },
  group: {
    gap: 10,
  },
  groupLabel: {
    fontSize: 13,
    fontFamily: Fonts.sans.semiBold,
    color: '#7B6550',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  roomCard: {
    backgroundColor: '#FBF5F5',
    borderRadius: 15,
    padding: 16,
    borderWidth: 0.5,
    borderColor: '#DAC28E',
    elevation: 2,
    ...platformShadow("#000", 1, 0.08, 3, 2),gap: 4,
  },
  roomLabel: {
    fontSize: 18,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    fontWeight: '700',
  },
  roomDescription: {
    fontSize: 14,
    fontFamily: Fonts.serif.regular,
    color: '#7B6550',
    lineHeight: 20,
  },
});
