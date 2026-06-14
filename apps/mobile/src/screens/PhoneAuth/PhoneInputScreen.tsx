import React, { useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "@reduxjs/toolkit";
import TextComponent from "../../components/TextComponent";
import LoadingButton from "../../components/LoadingButton";
import { PHONE_AUTH_COUNTRIES, DEFAULT_PHONE_COUNTRY } from "@kalpx/types";
import type { PhoneCountryCode } from "@kalpx/types";
import { RootState } from "../../store";
import { requestPhoneOtp } from "./phoneAuthActions";
import type { PhoneAuthResult } from "./phoneAuthActions";
import type { PhoneOtpRequestResponse } from "@kalpx/types";

const COUNTRY_OPTIONS = [...PHONE_AUTH_COUNTRIES];

export default function PhoneInputScreen({ navigation, route }) {
  const purpose = route?.params?.purpose ?? "auth";
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  const [country, setCountry] = useState<PhoneCountryCode>(DEFAULT_PHONE_COUNTRY);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedCountry = COUNTRY_OPTIONS.find((c) => c.code === country)!;
  const dialCode = selectedCountry.dialCode;
  const placeholder = selectedCountry.placeholder;

  const handleSendOtp = () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7) {
      setError("Please enter a valid phone number.");
      return;
    }
    setLoading(true);
    setError("");
    dispatch(
      requestPhoneOtp({ phone: digits, country, purpose }, (result: PhoneAuthResult<PhoneOtpRequestResponse>) => {
        setLoading(false);
        if (!result.success) {
          const { code, error } = result as { success: false; error: string; code?: string };
          if (code === "phone_auth_disabled") {
            setError("Phone login is not available yet. Please use email to sign in.");
          } else {
            setError(error || "Failed to send OTP. Please try again.");
          }
          return;
        }
        navigation.navigate("PhoneOtpVerify" as any, {
          sessionToken: result.data.session_token,
          maskedPhone: result.data.masked_phone,
          cooldownSeconds: result.data.cooldown_seconds,
          otpExpirySeconds: result.data.otp_expiry_seconds,
          purpose,
        });
      }),
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ImageBackground
          source={require("../../../assets/hoomepagebg.webp")}
          style={styles.bg}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            {navigation.canGoBack() && (
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
                <TextComponent type="cardText" style={{ color: "#432104", fontSize: 22 }}>‹</TextComponent>
              </TouchableOpacity>
            )}
            <TextComponent type="headerBigText" style={styles.brand}>KalpX</TextComponent>

            <View style={styles.card}>
              <TextComponent type="loginHeaderText" style={styles.cardTitle}>Sign in with Phone</TextComponent>
              <TextComponent type="cardText" style={styles.hint}>
                We'll send a one-time code to verify your number.
              </TextComponent>

              {/* Country selector — 3 inline buttons */}
              <View style={styles.countryRow}>
                {COUNTRY_OPTIONS.map((c) => (
                  <TouchableOpacity
                    key={c.code}
                    onPress={() => setCountry(c.code)}
                    disabled={loading}
                    style={[styles.countryBtn, country === c.code && styles.countryBtnActive]}
                  >
                    <TextComponent
                      type="cardText"
                      style={[styles.countryBtnText, country === c.code && styles.countryBtnTextActive]}
                    >
                      {c.dialCode} {c.label}
                    </TextComponent>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.phoneRow}>
                <TextComponent type="cardText" style={styles.dialCode}>{dialCode}</TextComponent>
                <TextInput
                  style={styles.phoneInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={placeholder}
                  keyboardType="phone-pad"
                  editable={!loading}
                  autoFocus
                />
              </View>

              {!!error && (
                <TextComponent type="cardText" style={styles.error}>{error}</TextComponent>
              )}

              <LoadingButton
                text="Send OTP"
                onPress={handleSendOtp}
                loading={loading}
                disabled={loading || phone.replace(/\D/g, "").length < 7}
                style={styles.btn}
              />
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
  hint: { color: "#666", marginBottom: 16, fontSize: 13 },
  countryRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  countryBtn: { flex: 1, paddingVertical: 8, borderWidth: 1, borderColor: "#e0d5c0", borderRadius: 8, alignItems: "center" },
  countryBtnActive: { borderColor: "#c9a84c", backgroundColor: "#fdf3dc" },
  countryBtnText: { fontSize: 11, color: "#666" },
  countryBtnTextActive: { color: "#432104", fontWeight: "600" },
  phoneRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e0d5c0", borderRadius: 8, paddingHorizontal: 12, marginBottom: 12, height: 48 },
  dialCode: { color: "#432104", marginRight: 8, fontWeight: "600" },
  phoneInput: { flex: 1, fontSize: 16, color: "#1a1a1a" },
  error: { color: "#c0392b", marginBottom: 8, fontSize: 13 },
  btn: { marginTop: 8 },
});
