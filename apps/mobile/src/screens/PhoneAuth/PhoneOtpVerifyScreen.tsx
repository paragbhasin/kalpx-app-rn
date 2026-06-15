import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "@reduxjs/toolkit";
import TextComponent from "../../components/TextComponent";
import LoadingButton from "../../components/LoadingButton";
import { RootState } from "../../store";
import { verifyPhoneOtp, resendPhoneOtp } from "./phoneAuthActions";
import type { PhoneAuthResult } from "./phoneAuthActions";
import type { PhoneOtpVerifyResponse, PhoneOtpResendResponse } from "@kalpx/types";
import { resumePendingIfAny } from "../../utils/resumePending";

const CELL_COUNT = 6;
const MAX_RESENDS = 3;

const ERROR_COPY: Record<string, string> = {
  invalid_otp: "Incorrect code.",
  too_many_attempts: "Too many incorrect attempts. Please try again later.",
  otp_expired: "This code has expired. Please go back and request a new one.",
  verification_unavailable: "Verification unavailable. Please try again.",
  session_invalid: "Session expired. Please go back and restart.",
  phone_auth_disabled: "Phone login is not available yet.",
};

export default function PhoneOtpVerifyScreen({ navigation, route }) {
  const { sessionToken, maskedPhone, cooldownSeconds, purpose } = route.params ?? {};
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const [value, setValue] = useState("");
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({ value, setValue });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(cooldownSeconds ?? 45);
  const [resendCount, setResendCount] = useState(0);
  const [currentSessionToken, setCurrentSessionToken] = useState<string>(sessionToken ?? "");
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = useCallback((seconds: number) => {
    setCooldown(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(cooldownRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    if (cooldownSeconds > 0) startCooldown(cooldownSeconds);
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, []);

  const handleVerify = () => {
    if (value.length < CELL_COUNT) { setError("Please enter the 6-digit code."); return; }
    setLoading(true);
    setError("");
    dispatch(
      verifyPhoneOtp({ session_token: currentSessionToken, otp: value }, (result: PhoneAuthResult<PhoneOtpVerifyResponse>) => {
        setLoading(false);
        if (!result.success) {
          const { code, error } = result as { success: false; error: string; code?: string };
          setError(ERROR_COPY[code ?? ""] || error || "Verification failed.");
          setValue("");
          return;
        }
        const isNewUser = result.data?.is_new_user;
        if (purpose === "link_phone") {
          navigation.goBack();
          return;
        }
        if (isNewUser) {
          navigation.navigate("AppDrawer" as any);
        } else {
          resumePendingIfAny(navigation);
        }
      }),
    );
  };

  const handleResend = () => {
    if (cooldown > 0 || resendCount >= MAX_RESENDS || loading) return;
    setLoading(true);
    setError("");
    dispatch(
      resendPhoneOtp({ session_token: currentSessionToken }, (result: PhoneAuthResult<PhoneOtpResendResponse>) => {
        setLoading(false);
        if (!result.success) {
          const { error } = result as { success: false; error: string; code?: string };
          setError(error || "Failed to resend. Please try again.");
          return;
        }
        setResendCount((c) => c + 1);
        setCurrentSessionToken(currentSessionToken); // stays same — resend updates the DB session
        startCooldown(result.data.cooldown_seconds);
        setValue("");
      }),
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ImageBackground source={require("../../../assets/hoomepagebg.webp")} style={styles.bg}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            {navigation.canGoBack() && (
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                <TextComponent type="cardText" style={{ color: "#432104", fontSize: 22 }}>‹</TextComponent>
              </TouchableOpacity>
            )}
            <TextComponent type="headerBigText" style={styles.brand}>KalpX</TextComponent>

            <View style={styles.card}>
              <TextComponent type="loginHeaderText" style={styles.cardTitle}>Enter Verification Code</TextComponent>
              <TextComponent type="cardText" style={styles.hint}>
                Code sent to {maskedPhone ?? "your phone"}.
              </TextComponent>

              <CodeField
                ref={ref}
                {...props}
                value={value}
                onChangeText={setValue}
                cellCount={CELL_COUNT}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="sms-otp"
                renderCell={({ index, symbol, isFocused }) => (
                  <View
                    key={index}
                    onLayout={getCellOnLayoutHandler(index)}
                    style={[styles.cell, isFocused && styles.cellFocused]}
                  >
                    <TextComponent type="loginHeaderText" style={styles.cellText}>
                      {symbol || (isFocused ? <Cursor /> : null)}
                    </TextComponent>
                  </View>
                )}
              />

              {!!error && (
                <TextComponent type="cardText" style={styles.error}>{error}</TextComponent>
              )}

              <LoadingButton
                text="Verify"
                onPress={handleVerify}
                loading={loading}
                disabled={loading || value.length < CELL_COUNT}
                style={styles.btn}
              />

              <View style={styles.resendRow}>
                {cooldown > 0 ? (
                  <TextComponent type="cardText" style={styles.resendHint}>Resend in {cooldown}s</TextComponent>
                ) : resendCount >= MAX_RESENDS ? (
                  <TextComponent type="cardText" style={styles.resendHint}>Try again later</TextComponent>
                ) : (
                  <TouchableOpacity onPress={handleResend} disabled={loading}>
                    <TextComponent type="cardText" style={styles.resendLink}>Resend code</TextComponent>
                  </TouchableOpacity>
                )}
                <TextComponent type="cardText" style={styles.sep}> · </TextComponent>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <TextComponent type="cardText" style={styles.resendLink}>Change number</TextComponent>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff2dd" },
  bg: { flex: 1 },
  scroll: { flexGrow: 1, padding: 20 },
  back: { padding: 8, alignSelf: "flex-start" },
  brand: { textAlign: "center", marginBottom: 20, color: "#432104" },
  card: { backgroundColor: "#fffdf7", borderRadius: 16, padding: 24, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  cardTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8, color: "#432104" },
  hint: { color: "#666", marginBottom: 20, fontSize: 13 },
  cell: { width: 44, height: 52, borderWidth: 1, borderColor: "#e0d5c0", borderRadius: 8, alignItems: "center", justifyContent: "center" },
  cellFocused: { borderColor: "#c9a84c", borderWidth: 2 },
  cellText: { fontSize: 22, fontWeight: "700", color: "#432104" },
  error: { color: "#c0392b", marginTop: 8, fontSize: 13 },
  btn: { marginTop: 16 },
  resendRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 16 },
  resendHint: { color: "#888", fontSize: 13 },
  resendLink: { color: "#c9a84c", fontSize: 13, textDecorationLine: "underline" },
  sep: { color: "#ccc", marginHorizontal: 4 },
});
