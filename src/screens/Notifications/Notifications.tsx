import { useNavigation } from "@react-navigation/native";
import { AnyAction } from "@reduxjs/toolkit";
import moment from "moment";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
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


  useEffect(() => {
    dispatch(fetchNotifications(1));
  }, []);

  // console.log("Notifiaction data >>>>>>>",JSON.stringify(data));


  const loadMore = () => {
    if (!loading && hasMore) {
      dispatch(fetchNotifications(page + 1));
    }
  };

  const openNotification = (item) => {
    if (!item.read) {
      dispatch(markNotificationsRead([item.id]));
    }


    // Navigate based on type
    // if (item.type === "class") navigation.navigate("ClassBookingScreen");
    // if (item.type === "practice") navigation.navigate("DailyPracticeScreen");
    // if (item.type === "pooja") navigation.navigate("Pooja");

    // Add others as needed
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.row, !item.read && styles.unread]}
      onPress={() => openNotification(item)}
    >
      {/* <Image source={require("../../assets/not.png")} style={styles.icon} /> */}

      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <TextComponent type="streakSadanaText" style={styles.title}>{item.title}</TextComponent>
          <TextComponent type="mediumText" style={styles.time}>
  {moment(item.timestamp).format("MMM D, YYYY")}
</TextComponent>

          {/* <TextComponent type="mediumText" style={styles.time}>{new Date(item.timestamp).toLocaleDateString()}</TextComponent> */}
        </View>
        <TextComponent type="mediumText" style={styles.message}>{item.message}</TextComponent>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
                <TextComponent type="headerText" style={styles.headerText}>Notifications</TextComponent>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        // keyExtractor={(item) => item.id.toString()}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loading ? <ActivityIndicator style={{ margin: 20 }} /> : null
        }
      />
    </View>
  );
}
