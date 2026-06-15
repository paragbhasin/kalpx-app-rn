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
import Icon from "react-native-vector-icons/Ionicons";
import TextComponent from "../../components/TextComponent";
import LoadingButton from "../../components/LoadingButton";
import { PHONE_AUTH_COUNTRIES, DEFAULT_PHONE_COUNTRY } from "@kalpx/types";
import type { PhoneCountryCode, PhoneOtpVerifyResponse } from "@kalpx/types";
import { RootState } from "../../store";
import { loginWithPhone } from "./phoneAuthActions";
import type { PhoneAuthResult } from "./phoneAuthActions";
import { resumePendingIfAny } from "../../utils/resumePending";
import { useToast } from "../../context/ToastContext";

const COUNTRY_OPTIONS = [...PHONE_AUTH_COUNTRIES];
const COUNTRY_SHORT: Record<string, string> = { IN: "India", US: "USA", GB: "UK" };

const NO_ACCOUNT_CODES = new Set(["phone_not_registered", "account_not_found", "user_not_found", "no_account"]);

export default function PhonePasswordLoginScreen({ navigation }) {
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const { showToast } = useToast();

  const [country, setCountry] = useState<PhoneCountryCode>(DEFAULT_PHONE_COUNTRY);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedCountry = COUNTRY_OPTIONS.find((c) => c.code === country)!;

  const handleLogin = () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7) {
      setError("Please enter a valid phone number.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setLoading(true);
    setError("");
    dispatch(
      loginWithPhone({ phone: digits, country, password }, (result: PhoneAuthResult<PhoneOtpVerifyResponse>) => {
        setLoading(false);
        if (!result.success) {
          const { error, code } = result as { success: false; error: string; code?: string };
          if (NO_ACCOUNT_CODES.has(code ?? "")) {
            showToast("No account found for this number. Please sign up first.", 4000, "error");
          } else if (code === "Invalid credentials" || error?.toLowerCase().includes("invalid")) {
            setError("Incorrect phone number or password. Please try again.");
          } else {
            setError(error || "Login failed. Please try again.");
          }
          return;
        }
        resumePendingIfAny(navigation);
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
                <Icon name="chevron-back" size={26} color="#432104" />
              </TouchableOpacity>
            )}
            <TextComponent type="headerBigText" style={styles.brand}>KalpX</TextComponent>

            <View style={styles.card}>
              <TextComponent type="loginHeaderText" style={styles.cardTitle}>Sign in with Phone</TextComponent>

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
                      {c.dialCode}
                    </TextComponent>
                    <TextComponent
                      type="cardText"
                      style={[styles.countryBtnSub, country === c.code && styles.countryBtnTextActive]}
                    >
                      {COUNTRY_SHORT[c.code] ?? c.code}
                    </TextComponent>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputRow}>
                <TextComponent type="cardText" style={styles.dialCode}>{selectedCountry.dialCode}</TextComponent>
                <TextInput
                  style={styles.textInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={selectedCountry.placeholder}
                  keyboardType="phone-pad"
                  editable={!loading}
                  autoFocus
                />
              </View>

              <View style={[styles.inputRow, { marginTop: 12 }]}>
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Password"
                  placeholderTextColor="#9e9b97"
                  secureTextEntry={!showPassword}
                  autoComplete="current-password"
                  editable={!loading}
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ paddingHorizontal: 8 }}>
                  <Icon name={showPassword ? "eye" : "eye-off"} size={20} color="#6c4b2f" />
                </TouchableOpacity>
              </View>

              {!!error && (
                <TextComponent type="cardText" style={styles.error}>{error}</TextComponent>
              )}

              <LoadingButton
                text="Sign in"
                onPress={handleLogin}
                loading={loading}
                disabled={loading || phone.replace(/\D/g, "").length < 7 || !password}
                style={styles.btn}
                textStyle={styles.btnText}
                loaderColor="#fff"
              />

              <TouchableOpacity
                onPress={() => navigation.navigate("PhoneInput" as any, { purpose: "otp_login" })}
                style={styles.otpLink}
                disabled={loading}
              >
                <TextComponent type="cardText" style={styles.otpLinkText}>Login with OTP instead</TextComponent>
              </TouchableOpacity>
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
  cardTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16, color: "#432104" },
  countryRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  countryBtn: { flex: 1, paddingVertical: 10, borderWidth: 1, borderColor: "#e0d5c0", borderRadius: 8, alignItems: "center", justifyContent: "center" },
  countryBtnActive: { borderColor: "#c9a84c", backgroundColor: "#fdf3dc" },
  countryBtnText: { fontSize: 13, color: "#432104", fontWeight: "600" },
  countryBtnSub: { fontSize: 10, color: "#888", marginTop: 2 },
  countryBtnTextActive: { color: "#432104", fontWeight: "600" },
  inputRow: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#e0d5c0", borderRadius: 8, paddingHorizontal: 12, height: 48 },
  dialCode: { color: "#432104", marginRight: 8, fontWeight: "600" },
  textInput: { flex: 1, fontSize: 15, color: "#1a1a1a" },
  error: { color: "#c0392b", marginTop: 8, fontSize: 13 },
  btn: { marginTop: 16, backgroundColor: "#c9a84c", borderRadius: 10 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  otpLink: { marginTop: 14, alignItems: "center" },
  otpLinkText: { color: "#c9a84c", fontSize: 13, textDecorationLine: "underline" },
});
