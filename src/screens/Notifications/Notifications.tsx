import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import moment from "moment";
import React, { useCallback } from "react";
import {
  FlatList,
  TouchableOpacity,
  View
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
import styles from "./styles";

export default function Notifications() {
  const navigation = useNavigation();
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

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

  // 📌 Mark single notification read
  const openNotification = (item) => {
    if (!item.read) {
      dispatch(markNotificationsRead([item.id]));
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.row, !item.read && styles.unread]}
      onPress={() => openNotification(item)}
    >
      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <TextComponent type="streakSadanaText" style={styles.title}>
            {item.title}
          </TextComponent>
          <TextComponent type="mediumText" style={styles.time}>
            {moment(item.timestamp).format("MMM D, YYYY")}
          </TextComponent>
        </View>
        <TextComponent type="mediumText" style={styles.message}>
          {item.message}
        </TextComponent>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
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
          refreshing={loading && page === 1}
          onRefresh={() => {
            dispatch({ type: "RESET_NOTIFICATIONS" });
            dispatch(fetchNotifications(1));
          }}
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
