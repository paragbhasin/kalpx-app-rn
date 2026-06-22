import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import moment from "moment";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import FontSize from "../../components/FontSize";
import LoadingOverlay from "../../components/LoadingOverlay";
import TextComponent from "../../components/TextComponent";
import { RootState } from "../../store";
import {
  fetchNotifications,
  markNotificationsRead,
} from "./actions";
import { mitraTrackEvent } from "../../engine/mitraApi";
import styles from "./styles";
import { useScrollContext } from "../../context/ScrollContext";

// Maps a notification event_type/category to the screen to navigate to inside the Home tab stack.
// Returns null for event_types that have no meaningful destination.
function getNotificationRoute(eventType: string): { screen: string; params?: object } | null {
  const base = eventType.split(":")[0]; // strip colon suffix e.g. "dharma_trigger_headsup:japa_krishna"

  // Rhythm reminders — slots are morning / afternoon / night
  if (base === "mitra_rhythm_morning")   return { screen: "RhythmHome", params: { slot: "morning" } };
  if (base === "mitra_rhythm_afternoon") return { screen: "RhythmHome", params: { slot: "afternoon" } };
  if (base === "mitra_rhythm_night")     return { screen: "RhythmHome", params: { slot: "night" } };

  // Inner path reminders — mantra / sankalp / practice / return
  if (base.startsWith("mitra_inner_path_")) return { screen: "InnerPath" };

  // Mitra conversation triggers
  if (
    base === "mitra_post_conflict_follow" ||
    base === "mitra_grief_follow"         ||
    base === "mitra_predictive_alert"     ||
    base === "mitra_checkin_followup"     ||
    base === "mitra_midday_midday_checkin"
  ) return { screen: "TellMitra" };

  // Community
  if (base === "mitra_community_digest") return { screen: "CommunityLanding" };

  // Daily Dharma
  if (base.startsWith("dharma_")) return { screen: "Dharma" };

  // Quick Chant / Japa
  if (base === "mitra_quick_chant_reminder") return { screen: "QuickReset" };

  // Everything else lands on Home (morning presence, practice nudges, streaks, re-engagement, etc.)
  if (
    base === "morning_presence"              ||
    base === "morning_briefing"              ||
    base === "morning_practice_ready"        ||
    base === "mitra_morning"                 ||
    base === "mitra_morning_briefing"        ||
    base === "mitra_gentle_reengagement"     ||
    base === "mitra_post_room_continuity"    ||
    base === "mitra_midday_midday_practice"  ||
    base === "mitra_evening_nudge"           ||
    base === "mitra_evening_done"            ||
    base === "mitra_day7_checkpoint"         ||
    base === "mitra_day14_checkpoint"        ||
    base === "mitra_weekly_reflection"       ||
    base === "mitra_festival"                ||
    base.startsWith("practice_")             ||
    base.startsWith("streak_")               ||
    base.startsWith("reactivation")          ||
    base === "weekly_recap"
  ) return { screen: "Home" };

  return null;
}

export default function Notifications() {
  const { i18n } = useTranslation();
  const { handleScroll } = useScrollContext();
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const navigation = useNavigation<any>();

  const { data, loading, page, hasMore } = useSelector(
    (state: RootState) => state.notificationsReducer
  );

  const listRef = React.useRef<FlatList>(null);

  // 📌 Load fresh page 1 every time screen becomes active
  useFocusEffect(
    useCallback(() => {
      dispatch({ type: "RESET_NOTIFICATIONS" });
      dispatch(fetchNotifications(1));
      listRef.current?.scrollToOffset({ offset: 0, animated: false });
    }, [])
  );

  // 📌 Pagination
  const loadMore = () => {
    if (!loading && hasMore) {
      dispatch(fetchNotifications(page + 1));
    }
  };

  // 📌 Mark read + navigate to the relevant screen
  const openNotification = (item) => {
    if (!item.read) {
      dispatch(markNotificationsRead([item.id]));
      mitraTrackEvent('notification_marked_read', {
        meta: { notification_id: item.id, event_type: item.event_type },
      });
    }
    const route = getNotificationRoute(item.event_type || "");
    if (route) {
      navigation.navigate("HomePage", { screen: route.screen, params: route.params });
    }
  };

  const renderItem = ({ item }) => {
    const route = getNotificationRoute(item.event_type || "");
    return (
      <TouchableOpacity
        style={[styles.row, !item.read && styles.unread]}
        onPress={() => openNotification(item)}
        activeOpacity={0.7}
      >
        <View style={styles.dotWrapper}>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <TextComponent
              type="streakSadanaText"
              style={item.read ? styles.titleRead : styles.title}
            >
              {item.title}
            </TextComponent>
            <TextComponent
              type="mediumText"
              style={item.read ? styles.time : styles.timeUnread}
            >
              {moment(item.timestamp).locale(i18n.language.split('-')[0]).format("MMM D, YYYY")}
            </TextComponent>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <TextComponent
              type="mediumText"
              style={[item.read ? styles.message : styles.messageUnread, { flex: 1 }]}
            >
              {item.message}
            </TextComponent>
            {route && (
              <Ionicons
                name="chevron-forward"
                size={14}
                color={item.read ? "#bbb" : "#CA8A04"}
                style={{ marginLeft: 6 }}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Standard header can stay if you want, or you can hide it with the global one */}
      {/* If you want it to hide with global one, wrap it in Animated.View or just remove it if redundant */}
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <TextComponent type="headerText" style={styles.headerText}>
          Notifications
        </TextComponent>
        <View style={{ width: 24 }} />
      </View>
      {loading && data.length === 0 ? (
        // <ActivityIndicator style={{ marginTop: 40 }} />
        <LoadingOverlay visible={loading} text="Fetching Data..." />
      ) : data.length === 0 ? (
        <View style={{
          marginTop: FontSize.CONSTS.DEVICE_HEIGHT * 0.25,
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Ionicons name="notifications-off-outline" size={50} color="#999" />
          <TextComponent style={{ marginTop: 10 }} type="streakSadanaText">
            No Notification
          </TextComponent>
          <TextComponent
            type="mediumText"
            style={{
              marginTop: 10,
              color: "#999",
              textAlign: "center",
              marginHorizontal: 30,
            }}
          >
            We’ll let you know when there will be something to update you.
          </TextComponent>
        </View>

      ) : (
        // Main list
        <FlatList
          ref={listRef}
          data={data}
          renderItem={renderItem}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshing={loading && page === 1}
          onRefresh={() => {
            dispatch({ type: "RESET_NOTIFICATIONS" });
            dispatch(fetchNotifications(1));
          }}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 20 }}
          ListFooterComponent={
            loading && page > 1 ? (
              <LoadingOverlay visible={loading} text="Fetching Data..." />
              // <ActivityIndicator style={{ margin: 20 }} />
            ) : null
          }
        />
      )}
    </View>
  );
}
