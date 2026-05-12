import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  ENTRY_INTENTION_HEADING,
  ENTRY_INTENTION_OPTIONS,
  ENTRY_INTENTION_SUBTEXT,
} from "@kalpx/contracts";
import React, { useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import store from "../../store";
import { loadScreenWithData, screenActions } from "../../store/screenSlice";

const PENDING_KEY = "mitra_intention_pending";

export default function MitraIntentionScreen() {
  const navigation = useNavigation<any>();
  const isLoggedIn = useSelector(
    (state: any) => !!(state.login?.user || state.socialLoginReducer?.user),
  );

  // After returning from Login, pick up the door the guest originally selected.
  useFocusEffect(
    useCallback(() => {
      if (!isLoggedIn) return;
      (async () => {
        const pending = await AsyncStorage.getItem(PENDING_KEY);
        if (!pending) return;
        await AsyncStorage.removeItem(PENDING_KEY);
        await executeDoor(pending);
      })();
    }, [isLoggedIn]), // eslint-disable-line react-hooks/exhaustive-deps
  );

  async function executeDoor(optionId: string) {
    switch (optionId) {
      case "daily_rhythm":
        navigation.navigate("RhythmSetup");
        break;
      case "inner_path":
        await AsyncStorage.setItem("mitra_entry_intention", "inner_path");
        store.dispatch(
          screenActions.setScreenValue({ key: "onboarding_turn", value: 1 }),
        );
        store.dispatch(
          screenActions.setScreenValue({
            key: "onboarding_draft_state",
            value: { started_at: Date.now() },
          }),
        );
        store.dispatch(
          loadScreenWithData({
            containerId: "welcome_onboarding",
            stateId: "turn_1",
          }),
        );
        navigation.navigate("DynamicEngine");
        break;
      case "quick_chant":
        navigation.navigate("QuickReset");
        break;
      case "tell_mitra":
        navigation.navigate("TellMitra");
        break;
    }
  }

  async function handleSelect(optionId: string) {
    if (!isLoggedIn) {
      await AsyncStorage.setItem(PENDING_KEY, optionId);
      navigation.navigate("Login" as any);
      return;
    }
    await executeDoor(optionId);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>{ENTRY_INTENTION_HEADING}</Text>
        {ENTRY_INTENTION_SUBTEXT.split("\n\n").map((para, i) => (
          <Text key={i} style={[styles.subtext, i > 0 && styles.subtextSpacing]}>
            {para}
          </Text>
        ))}

        <View style={styles.options}>
          {ENTRY_INTENTION_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              activeOpacity={0.85}
              onPress={() => void handleSelect(opt.id)}
              style={styles.card}
            >
              <Text style={styles.cardTitle}>{opt.title}</Text>
              <Text style={styles.cardBody}>{opt.body}</Text>
              <Text style={styles.cardCta}>{opt.cta} →</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFF8EF",
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 48,
  },
  heading: {
    fontFamily: "Cormorant-Bold",
    fontSize: 26,
    color: "#432104",
    marginBottom: 10,
  },
  subtext: {
    fontFamily: "Cormorant-Regular",
    fontSize: 16,
    color: "rgba(67, 33, 4, 0.72)",
    lineHeight: 24,
    marginBottom: 10,
  },
  subtextSpacing: {
    marginTop: 0,
    marginBottom: 28,
  },
  options: {
    gap: 14,
  },
  card: {
    backgroundColor: "#F5EDEA",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(199,162,88,0.3)",
    shadowColor: "#432104",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  cardTitle: {
    fontFamily: "Cormorant-Bold",
    fontSize: 17,
    color: "#432104",
    marginBottom: 6,
  },
  cardBody: {
    fontFamily: "Cormorant-Regular",
    fontSize: 14,
    color: "rgba(67, 33, 4, 0.65)",
    lineHeight: 20,
    marginBottom: 12,
  },
  cardCta: {
    fontFamily: "Cormorant-SemiBold",
    fontSize: 14,
    color: "#C9A84C",
  },
});
