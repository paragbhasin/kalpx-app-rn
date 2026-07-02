/**
 * ProgramInviteClaimScreen — Gate 3 MOB-3.
 *
 * Auto-attempts claim if code is passed via nav params (Universal Link / deep link).
 * Manual entry always visible.
 * Switch dialog fires when API returns conflict (Decision 7).
 * Support link visible without scrolling (Decision 2).
 */
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Fonts } from "../../theme/fonts";
import { claimProgram, fetchActiveProgram, type ProgramClaimConflict } from "../../engine/programApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setSkipMitraStart, setForceFourDoorHome } from "../../utils/postLoginGuard";

export default function ProgramInviteClaimScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { code: paramCode, source } = route.params ?? {};

  const [code, setCode] = useState<string>(paramCode ?? "");
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successName, setSuccessName] = useState<string | null>(null);
  const [isUpcoming, setIsUpcoming] = useState(false);
  const [daysUntilStart, setDaysUntilStart] = useState<number | null>(null);

  const autoClaimedRef = useRef(false);

  // Auto-claim on mount if code came from deep link or Universal Link
  useEffect(() => {
    if (paramCode && !autoClaimedRef.current) {
      autoClaimedRef.current = true;
      handleClaim(paramCode);
    }
  }, [paramCode]);

  const handleClaim = async (codeToUse: string = code, switchFromCode?: string) => {
    const trimmed = codeToUse.trim().toUpperCase();
    if (!trimmed) {
      setError("Enter an invite code.");
      return;
    }
    Keyboard.dismiss();
    setClaiming(true);
    setError(null);
    try {
      const result = await claimProgram(trimmed, switchFromCode);

      if ((result as ProgramClaimConflict).conflict) {
        const conflict = result as ProgramClaimConflict;
        setClaiming(false);

        // Decision 7: mandatory switch dialog
        Alert.alert(
          "You're already in a program",
          `You're on Day ${conflict.current_program.current_day} of "${conflict.current_program.name}". Switch to this new program?`,
          [
            {
              text: "Keep current",
              style: "cancel",
              onPress: async () => {
                // Clear pending code so login/logout doesn't loop back here.
                await AsyncStorage.removeItem("pending_program_code");
                await AsyncStorage.removeItem("pending_program_source");
                navigation.goBack();
              },
            },
            {
              text: "Switch to new program",
              style: "destructive",
              onPress: () => handleClaim(trimmed, conflict.current_program.code),
            },
          ],
        );
        return;
      }

      // Success — check if program is upcoming (future start date)
      await AsyncStorage.removeItem("pending_program_code");
      await AsyncStorage.removeItem("pending_program_source");
      const programName = (result as any).program_name ?? "your program";
      try {
        const active = await fetchActiveProgram();
        if (active?.status === "upcoming") {
          setIsUpcoming(true);
          setDaysUntilStart(active.days_until_start ?? null);
        }
      } catch (_) {}
      setSuccessName(programName);
      setClaiming(false);
    } catch (err: any) {
      setClaiming(false);
      const status = err?.response?.status;
      if (status === 401) {
        // Not logged in — save code and go to login; resumePendingIfAny will claim after auth
        await AsyncStorage.setItem("pending_program_code", trimmed);
        if (source) await AsyncStorage.setItem("pending_program_source", source ?? "deep_link");
        navigation.navigate("Login" as any);
        return;
      }
      // Permanent failures — clear pending so login/logout doesn't loop here.
      if (status === 404 || status === 410 || status === 403) {
        await AsyncStorage.removeItem("pending_program_code");
        await AsyncStorage.removeItem("pending_program_source");
      }
      if (status === 404) setError("That code wasn't found. Check the code and try again.");
      else if (status === 410) setError("This program has ended.");
      else if (status === 403) setError("This program is no longer accepting new members.");
      else setError("Something went wrong. Please try again.");
    }
  };

  if (successName) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.successWrap}>
          <Text style={styles.successEmoji}>🙏</Text>
          <Text style={styles.successTitle}>You've joined!</Text>
          <Text style={styles.successSubtext}>
            {isUpcoming
              ? `${successName} starts in ${daysUntilStart ?? "a few"} day${daysUntilStart === 1 ? "" : "s"}. We'll notify you when it begins.`
              : `Welcome to ${successName}. Your Day 1 is ready.`}
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              setSkipMitraStart();
              if (isUpcoming) {
                navigation.reset({ index: 0, routes: [{ name: "Home" }] });
              } else {
                navigation.reset({
                  index: 1,
                  routes: [
                    { name: "Home" },
                    { name: "ProgramDayScreen", params: { dayNumber: 1, completedItems: [] } },
                  ],
                });
              }
            }}
            style={styles.successBtn}
            accessibilityLabel={isUpcoming ? "Go to Home" : "Start Day 1"}
          >
            <Text style={styles.successBtnText}>{isUpcoming ? "Go to Home →" : "Start Day 1 →"}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Enter invite code</Text>
          <Text style={styles.subtitle}>
            Your invite code is on the link shared with you. It looks like BAYSHIV1.
          </Text>
        </View>

        {/* Code input */}
        <View style={styles.inputSection}>
          <TextInput
            style={styles.codeInput}
            value={code}
            onChangeText={(t) => setCode(t.toUpperCase())}
            placeholder="e.g. BAYSHIV1"
            placeholderTextColor="#9A7548"
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={() => handleClaim()}
            accessibilityLabel="Invite code input"
            editable={!claiming}
          />
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleClaim()}
            disabled={claiming || !code.trim()}
            style={[
              styles.claimBtn,
              (claiming || !code.trim()) && styles.claimBtnDisabled,
            ]}
            accessibilityLabel="Join with this code"
          >
            {claiming ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.claimBtnText}>Join →</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Support link — always visible */}
        <TouchableOpacity
          style={styles.supportLink}
          onPress={() =>
            Alert.alert(
              "Need help?",
              "Visit kalpx.com/programs/support for common issues: can't find the code, app not opening, OTP issues.",
              [{ text: "OK" }],
            )
          }
          accessibilityLabel="Get support"
        >
          <Text style={styles.supportLinkText}>Having trouble? Get support →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FAF7F2" },
  scroll: { padding: 24, paddingBottom: 60 },

  header: { marginBottom: 32 },
  backBtn: { marginBottom: 20 },
  backBtnText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 15,
    color: "#C99317",
  },
  title: {
    fontFamily: Fonts.serif.bold,
    fontSize: 26,
    color: "#432104",
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#7B6545",
    lineHeight: 21,
  },

  inputSection: { gap: 12, marginBottom: 32 },
  codeInput: {
    fontFamily: Fonts.sans.medium,
    fontSize: 24,
    letterSpacing: 0.1,
    color: "#432104",
    backgroundColor: "#FFF8EE",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    padding: 18,
    textAlign: "center",
  },
  errorText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#C05B3A",
    textAlign: "center",
  },
  claimBtn: {
    backgroundColor: "#C99317",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },
  claimBtnDisabled: { opacity: 0.5 },
  claimBtnText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 16,
    color: "#fff",
  },

  supportLink: { alignItems: "center", paddingVertical: 14 },
  supportLinkText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 13,
    color: "#9A7548",
    textDecorationLine: "underline",
  },

  // Success state
  successWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#FAF7F2",
  },
  successEmoji: { fontSize: 56, marginBottom: 20 },
  successTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 28,
    color: "#432104",
    marginBottom: 12,
    textAlign: "center",
  },
  successSubtext: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: "#7B6545",
    textAlign: "center",
    lineHeight: 23,
    marginBottom: 32,
  },
  successBtn: {
    backgroundColor: "#C99317",
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 48,
    alignItems: "center",
  },
  successBtnText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 16,
    color: "#fff",
  },
});
