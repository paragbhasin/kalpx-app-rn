import AsyncStorage from "@react-native-async-storage/async-storage";
import { AnyAction } from "@reduxjs/toolkit";
import { Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const PHONE_AUTH_ENABLED = process.env.EXPO_PUBLIC_PHONE_AUTH_ENABLED === '1';
import {
  Dimensions,
  ImageBackground,
  LayoutAnimation,
  Linking,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import * as Yup from "yup";
import LoadingButton from "../../components/LoadingButton";
import TextComponent from "../../components/TextComponent";
import { RootState } from "../../store";
import ReCaptchaRuntime from "../Login/ReCaptchaRuntime";
import { generateOtp, signupUser, verifyOtp } from "./actions";
import { requestPhoneOtp } from "../PhoneAuth/phoneAuthActions";
import type { PhoneAuthResult } from "../PhoneAuth/phoneAuthActions";
import { PHONE_AUTH_COUNTRIES, DEFAULT_PHONE_COUNTRY } from "@kalpx/types";
import type { PhoneCountryCode, PhoneOtpRequestResponse } from "@kalpx/types";
import { useToast } from "../../context/ToastContext";
import { logEvent } from "../../utils/initAnalytics";
import styles from "./styles";

const PHONE_COUNTRY_OPTIONS = [...PHONE_AUTH_COUNTRIES];
const COUNTRY_SHORT: Record<string, string> = { IN: "India", US: "USA", GB: "UK" };

const screenWidth = Dimensions.get("window").width;

// Validation Schema
const SignupSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  username: Yup.string().min(3, "Too Short!").required("Required"),
  password: Yup.string().min(6, "Min 6 chars").required("Required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Required"),
  otp: Yup.string(), // OTP not required until used
});

export default function SignupScreen({ navigation }) {
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [timer, setTimer] = useState(0);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [signupTimer, setSignupTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountryCode>(DEFAULT_PHONE_COUNTRY);
  const [phoneNum, setPhoneNum] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const { t } = useTranslation();
  const { showToast } = useToast();
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();
  const recaptchaRef = useRef(null);

  const formikValuesRef = useRef(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loadingType, setLoadingType] = useState<string | null>(null); // 'requestOtp' | 'verifyOtp' | 'resendOtp' | 'signUp' | null

  // 👇 New: guard to know if signup countdown is active (prevents instant reset)
  const signupStartedRef = useRef(false);

  // Request reCAPTCHA + API
  const handleRecaptchaAndApi = (actionType) => {
    setLoginError(null);
    setLoadingType(actionType);
    recaptchaRef.current?.requestNewToken();
    if (!formikValuesRef.current) formikValuesRef.current = {};
    formikValuesRef.current.actionType = actionType;
  };

  useEffect(() => {
    logEvent("signup_started", { method: "email" }).catch(() => {});
  }, []);

  // OTP Timer
  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpSent && timer === 0) {
      setResendEnabled(true);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  // ✅ Signup countdown (split: countdown and reset)
  // Countdown only
  useEffect(() => {
    if (!otpVerified || !signupStartedRef.current) return;
    if (signupTimer <= 0) return;

    const id = setInterval(() => {
      setSignupTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(id);
  }, [otpVerified, signupTimer]);

  // Reset after countdown reaches 0 (only if countdown had started)
  useEffect(() => {
    if (!otpVerified) return;
    if (!signupStartedRef.current) return;

    if (signupTimer === 0) {
      console.log("⏳ Signup window expired → resetting OTP state");
      setOtpVerified(false);
      setOtpSent(false);
      setTimer(0);
      setResendEnabled(false);
      signupStartedRef.current = false; // disarm for next cycle
    }
  }, [signupTimer, otpVerified]);

  const resumePendingIfAny = async () => {
    try {
      console.log("🔎 Checking for pending protected actions after login...");

      const pendingKeys = [
        "pending_pooja_data",
        "pending_retreat_data",
        "pending_travel_data",
        "pending_astrology_data",
        "pending_daily_practice_data"
      ];

      for (const key of pendingKeys) {
        const pending = await AsyncStorage.getItem(key);
        console.log(`📦 Checking key: ${key} →`, pending ? "Found data" : "No data");

        if (pending) {
          const data = JSON.parse(pending);
          await AsyncStorage.removeItem(key);
          console.log(`🧹 Cleared ${key} from AsyncStorage.`);

          const targetScreenMap= {
            pending_pooja_data: "Pooja",
            pending_retreat_data: "Retreat",
            pending_travel_data: "Travel",
            pending_astrology_data: "Astrology",
            pending_daily_practice_data:"DailyPracticeSelectList"
          };

          const targetScreen = targetScreenMap[key];
          console.log("🎯 Target screen identified:", targetScreen);

          // ✅ Step 1️⃣ Mount AppDrawer (this ensures drawer exists)
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "AppDrawer",
                state: {
                  routes: [
                    {
                      name: "HomePage", // bottom tab
                      state: {
                        routes: [
                          {
                            name: "HomePage", // tab screen containing HomeStack
                            state: {
                              routes: [
                                {
                                  name: targetScreen,
                                  params: { resumeData: data },
                                },
                              ],
                            },
                          },
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          });

          console.log("✅ Drawer + BottomTab + TargetScreen mounted →", targetScreen);
          return;
        }
      }

      console.log("🚫 No pending data found → Navigating to AppDrawer");
      navigation.reset({
        index: 0,
        routes: [{ name: "AppDrawer" }],
      });
    } catch (err) {
      console.error("❌ Error resuming pending action:", err);
      navigation.reset({
        index: 0,
        routes: [{ name: "AppDrawer" }],
      });
    }
  };

  // reCAPTCHA callback
  const handleRecaptchaToken = (token) => {
    setLoginError(null);
    const values = formikValuesRef.current;
    const actionType = values.actionType;
    let payload= {};

    console.log("🔹 handleRecaptchaToken called for action:", actionType);

    if (actionType === "requestOtp" || actionType === "resendOtp") {
      payload = {
        email: values.email,
        recaptcha_token: token,
        recaptcha_action: "request_otp",
        context: "registration",
      };
      console.log("📤 Sending OTP request payload:", payload);
      dispatch(
        generateOtp(payload, (result) => {
          console.log("📩 OTP Request Response:", result);
          setLoadingType(null);
          if (result.success) {
            console.log("✅ OTP sent successfully");
            setOtpSent(true);
            setTimer(60);
            setResendEnabled(false);
          } else {
            console.log("❌ OTP request failed:", result.error);
            setLoginError(result.error || "OTP request failed");
          }
        }) 
      );
    }
    else if (actionType === "verifyOtp") {
      payload = {
        email: values.email,
        otp: values.otp,
        recaptcha_token: token,
        recaptcha_action: "verify_otp",
      };
      console.log("📤 Sending OTP verification payload:", payload);
      dispatch(
        verifyOtp(payload, (result) => {
          console.log("📩 OTP Verify Response:", result);
          setLoadingType(null);
          if (result.success) {
            console.log("✅ OTP verification successful → Updating state...");
            // ✅ Start timer first, arm the flag, then set verified
            setSignupTimer(120);
            signupStartedRef.current = true;
            setOtpVerified(true);
            setOtpSent(false);
            console.log("🟢 State set → otpVerified:", true, "| signupTimer:", 120);
          } else {
            console.log("❌ OTP verification failed:", result.error);
            setLoginError(result.error || "OTP verification failed");
          }
        })
      );
    }
    else if (actionType === "register") {
      payload = {
        email: values.email,
        username: values.username,
        password1: values.password,
        password2: values.confirmPassword,
        role: "user",
        profile_name: values.username,
        age_group_id: null,
        language_ids: [],
        country_ids: [],
        culture_ids: [],
        recaptcha_token: token,
        recaptcha_action: "register",
      };
      console.log("📤 Sending Signup Payload:", payload);
      dispatch(
        signupUser(payload, async (result) => {
          console.log("📩 Signup Response:", result);
          setLoadingType(null);
          if (result.success) {
            console.log("✅ Signup successful, saving data...");
            await AsyncStorage.setItem("isLoggedIn", "true");
            await AsyncStorage.setItem("user_id", result.user_id?.toString() || "");
            await AsyncStorage.setItem("showLocationConfirm", "true");
            await resumePendingIfAny();
          } else {
            console.log("❌ Signup failed:", result.error);
            setLoginError(result.error || "Signup failed");
          }
        })
      );
    }
  };

  const selectedPhoneCountry = PHONE_COUNTRY_OPTIONS.find((c) => c.code === phoneCountry)!;

  const handleSendPhoneOtp = () => {
    const digits = phoneNum.replace(/\D/g, "");
    if (digits.length < 7) { setPhoneError("Please enter a valid phone number."); return; }
    setPhoneLoading(true);
    setPhoneError("");
    dispatch(
      requestPhoneOtp({ phone: digits, country: phoneCountry, purpose: "signup" }, (result: PhoneAuthResult<PhoneOtpRequestResponse>) => {
        setPhoneLoading(false);
        if (!result.success) {
          const { code, error } = result as { success: false; error: string; code?: string };
          if (code === "phone_already_registered") {
            showToast("This number already has an account. Please sign in.", 4000, "error");
          } else {
            setPhoneError(error || "Failed to send OTP. Please try again.");
          }
          return;
        }
        navigation.navigate("PhoneOtpVerify" as any, {
          sessionToken: result.data.session_token,
          maskedPhone: result.data.masked_phone,
          cooldownSeconds: result.data.cooldown_seconds,
          otpExpirySeconds: result.data.otp_expiry_seconds,
          purpose: "signup",
        });
      }),
    );
  };

  const fieldLabel = { fontSize: 13, fontWeight: "600" as const, color: "#432104", marginBottom: 6 };
  const fieldRow = {
    flexDirection: "row" as const, alignItems: "center" as const,
    borderWidth: 1, borderColor: "#e0d5c0", borderRadius: 10,
    paddingHorizontal: 12, height: 50, backgroundColor: "#fefaf2", marginBottom: 12,
  };
  const fieldInput = { flex: 1, fontSize: 14, color: "#1a1a1a" };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fefaf2" translucent={false} />
      <ImageBackground source={require("../../../assets/hoomepagebg.webp")} style={styles.background}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          {navigation.canGoBack() && (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ alignSelf: "flex-start", padding: 8, marginLeft: 4, marginTop: 4 }}
              activeOpacity={0.7}
            >
              <Icon name="chevron-back" size={26} color="#432104" />
            </TouchableOpacity>
          )}
          <TextComponent type="headerBigText" style={styles.brand}>{t("login.brand")}</TextComponent>

          <View style={styles.card}>
            <TextComponent type="loginHeaderText" style={{ fontSize: 20, fontWeight: "700", color: "#432104", marginBottom: 20 }}>
              Create Your Account
            </TextComponent>

            {/* ── Email | Phone pill tabs ── */}
            {PHONE_AUTH_ENABLED && (
              <View style={{ flexDirection: "row", backgroundColor: "#f0e8d6", borderRadius: 10, padding: 3, marginBottom: 20 }}>
                <TouchableOpacity
                  style={{ flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center", backgroundColor: authMethod === "email" ? "#c9a84c" : "transparent" }}
                  onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setAuthMethod("email"); }}
                >
                  <TextComponent type="semiBoldText" style={{ color: authMethod === "email" ? "#fff" : "#9e9b97", fontWeight: "600" }}>
                    Email
                  </TextComponent>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center", backgroundColor: authMethod === "phone" ? "#c9a84c" : "transparent" }}
                  onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setAuthMethod("phone"); setPhoneError(""); }}
                >
                  <TextComponent type="semiBoldText" style={{ color: authMethod === "phone" ? "#fff" : "#9e9b97", fontWeight: "600" }}>
                    Phone
                  </TextComponent>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Phone signup form (inline) ── */}
            {authMethod === "phone" && PHONE_AUTH_ENABLED ? (
              <>
                <TextComponent type="semiBoldText" style={fieldLabel}>Country</TextComponent>
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
                  {PHONE_COUNTRY_OPTIONS.map((c) => (
                    <TouchableOpacity
                      key={c.code}
                      onPress={() => setPhoneCountry(c.code)}
                      disabled={phoneLoading}
                      style={{ flex: 1, paddingVertical: 10, borderWidth: 1, borderColor: phoneCountry === c.code ? "#c9a84c" : "#e0d5c0", borderRadius: 10, alignItems: "center", backgroundColor: phoneCountry === c.code ? "#fdf3dc" : "transparent" }}
                    >
                      <TextComponent type="cardText" style={{ fontSize: 13, color: "#432104", fontWeight: "600" }}>{c.dialCode}</TextComponent>
                      <TextComponent type="cardText" style={{ fontSize: 10, color: phoneCountry === c.code ? "#432104" : "#888", marginTop: 2 }}>{COUNTRY_SHORT[c.code] ?? c.code}</TextComponent>
                    </TouchableOpacity>
                  ))}
                </View>

                <TextComponent type="semiBoldText" style={fieldLabel}>Phone number</TextComponent>
                <View style={[fieldRow, { marginBottom: 14 }]}>
                  <Icon name="call-outline" size={18} color="#9e9b97" style={{ marginRight: 10 }} />
                  <TextComponent type="cardText" style={{ color: "#432104", fontWeight: "600", marginRight: 8 }}>
                    {selectedPhoneCountry.dialCode}
                  </TextComponent>
                  <TextInput
                    style={fieldInput}
                    value={phoneNum}
                    onChangeText={setPhoneNum}
                    placeholder={selectedPhoneCountry.placeholder}
                    keyboardType="phone-pad"
                    editable={!phoneLoading}
                    placeholderTextColor="#9e9b97"
                    allowFontScaling={false}
                  />
                </View>

                {!!phoneError && (
                  <TextComponent type="mediumText" style={styles.error}>{phoneError}</TextComponent>
                )}

                <LoadingButton
                  text="Send OTP"
                  onPress={handleSendPhoneOtp}
                  loading={phoneLoading}
                  disabled={phoneLoading || phoneNum.replace(/\D/g, "").length < 7}
                  style={[styles.button, { backgroundColor: "#CA8A04" }]}
                  textStyle={styles.buttonText}
                  loaderColor="#fff"
                />

                <View style={styles.footerContainer}>
                  <TextComponent type="cardText" style={styles.footer}>{t("signup.alreadyMember")}{" "}</TextComponent>
                  <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                    <TextComponent type="cardText" style={styles.login}>{t("signup.loginHere")}</TextComponent>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
            <ReCaptchaRuntime ref={recaptchaRef} onToken={handleRecaptchaToken} />

            <Formik
              initialValues={{ email: "", username: "", password: "", confirmPassword: "", otp: "" }}
              validationSchema={SignupSchema}
              onSubmit={() => {}}
            >
              {({ handleChange, handleBlur, values, errors, touched }) => {
                const isRequestOtpEnabled = (vals) =>
                  vals.email && vals.username && vals.password && vals.confirmPassword &&
                  !errors.email && !errors.username && !errors.password && !errors.confirmPassword;

                const pwRules = [
                  { label: "At least 8 characters", met: values.password.length >= 8 },
                  { label: "At least a number", met: /\d/.test(values.password) },
                  { label: "At least a letter", met: /[a-zA-Z]/.test(values.password) },
                  { label: "Not Your username/email", met: !!values.password && values.password !== values.username && values.password !== values.email },
                ];

                return (
                  <>
                    {/* Email */}
                    <TextComponent type="semiBoldText" style={fieldLabel}>Email</TextComponent>
                    <View style={fieldRow}>
                      <Icon name="mail-outline" size={18} color="#9e9b97" style={{ marginRight: 10 }} />
                      <TextInput
                        allowFontScaling={false}
                        style={fieldInput}
                        placeholder="Enter your email"
                        placeholderTextColor="#9e9b97"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={values.email}
                        onChangeText={handleChange("email")}
                        onBlur={handleBlur("email")}
                      />
                    </View>
                    {errors.email && touched.email && (
                      <TextComponent type="mediumText" style={styles.error}>{errors.email}</TextComponent>
                    )}

                    {/* Username */}
                    <TextComponent type="semiBoldText" style={fieldLabel}>Username</TextComponent>
                    <View style={fieldRow}>
                      <Icon name="person-outline" size={18} color="#9e9b97" style={{ marginRight: 10 }} />
                      <TextInput
                        allowFontScaling={false}
                        style={fieldInput}
                        placeholder="Choose a username"
                        placeholderTextColor="#9e9b97"
                        autoCapitalize="none"
                        value={values.username}
                        onChangeText={handleChange("username")}
                        onBlur={handleBlur("username")}
                      />
                    </View>
                    {errors.username && touched.username && (
                      <TextComponent type="mediumText" style={styles.error}>{errors.username}</TextComponent>
                    )}

                    {/* Password */}
                    <TextComponent type="semiBoldText" style={fieldLabel}>Password</TextComponent>
                    <View style={fieldRow}>
                      <Icon name="lock-closed-outline" size={18} color="#9e9b97" style={{ marginRight: 10 }} />
                      <TextInput
                        allowFontScaling={false}
                        style={fieldInput}
                        placeholder="Enter your password"
                        placeholderTextColor="#9e9b97"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="off"
                        textContentType="none"
                        value={values.password}
                        onChangeText={handleChange("password")}
                        onBlur={handleBlur("password")}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ paddingLeft: 8 }}>
                        <Icon name={showPassword ? "eye" : "eye-off"} size={18} color="#9e9b97" />
                      </TouchableOpacity>
                    </View>

                    {/* Password rules */}
                    {values.password.length > 0 && (
                      <View style={{ marginBottom: 12 }}>
                        {pwRules.map((r) => (
                          <View key={r.label} style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                            <TextComponent type="mediumText" style={{ color: r.met ? "#27ae60" : "#e74c3c", fontSize: 14, marginRight: 8, width: 14 }}>
                              {r.met ? "✓" : "✗"}
                            </TextComponent>
                            <TextComponent type="mediumText" style={{ fontSize: 12, color: r.met ? "#27ae60" : "#e74c3c" }}>
                              {r.label}
                            </TextComponent>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Divider */}
                    <View style={{ borderBottomWidth: 1, borderBottomColor: "#e0d5c0", marginBottom: 16 }} />

                    {/* Confirm Password */}
                    <TextComponent type="semiBoldText" style={fieldLabel}>Confirm Password</TextComponent>
                    <View style={fieldRow}>
                      <Icon name="shield-checkmark-outline" size={18} color="#9e9b97" style={{ marginRight: 10 }} />
                      <TextInput
                        allowFontScaling={false}
                        style={fieldInput}
                        placeholder="Re-enter your password"
                        placeholderTextColor="#9e9b97"
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="off"
                        textContentType="none"
                        value={values.confirmPassword}
                        onChangeText={handleChange("confirmPassword")}
                        onBlur={handleBlur("confirmPassword")}
                      />
                      <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ paddingLeft: 8 }}>
                        <Icon name={showConfirmPassword ? "eye" : "eye-off"} size={18} color="#9e9b97" />
                      </TouchableOpacity>
                    </View>
                    {errors.confirmPassword && touched.confirmPassword && (
                      <TextComponent type="mediumText" style={styles.error}>{errors.confirmPassword}</TextComponent>
                    )}

                    {/* Verification Code row */}
                    <TextComponent type="semiBoldText" style={fieldLabel}>Verification Code</TextComponent>
                    <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
                      <View style={[fieldRow, { flex: 1, marginBottom: 0 }]}>
                        <TextInput
                          allowFontScaling={false}
                          style={fieldInput}
                          placeholder="Enter OTP"
                          placeholderTextColor="#9e9b97"
                          keyboardType="number-pad"
                          value={values.otp}
                          onChangeText={handleChange("otp")}
                          onBlur={handleBlur("otp")}
                        />
                      </View>
                      <TouchableOpacity
                        onPress={() => {
                          formikValuesRef.current = values;
                          if (otpSent && resendEnabled) {
                            handleRecaptchaAndApi("resendOtp");
                            setResendEnabled(false);
                            setTimer(60);
                          } else if (!otpSent) {
                            handleRecaptchaAndApi("requestOtp");
                          }
                        }}
                        disabled={
                          loadingType === "requestOtp" || loadingType === "resendOtp" ||
                          !isRequestOtpEnabled(values) ||
                          (otpSent && !resendEnabled)
                        }
                        style={{
                          borderWidth: 1.5,
                          borderColor: "#c9a84c",
                          borderRadius: 10,
                          paddingHorizontal: 14,
                          height: 50,
                          justifyContent: "center",
                          opacity: (!isRequestOtpEnabled(values) || (otpSent && !resendEnabled)) ? 0.5 : 1,
                        }}
                      >
                        <TextComponent type="semiBoldText" style={{ color: "#c9a84c", fontSize: 13 }}>
                          {loadingType === "requestOtp" || loadingType === "resendOtp"
                            ? "..."
                            : otpSent && !resendEnabled
                            ? `${timer}s`
                            : otpSent && resendEnabled
                            ? "Resend"
                            : "Get Code"}
                        </TextComponent>
                      </TouchableOpacity>
                    </View>

                    {/* Verify OTP button — only visible after Get Code pressed and not yet verified */}
                    {otpSent && !otpVerified && (
                      <LoadingButton
                        loading={loadingType === "verifyOtp"}
                        text="Verify Code"
                        onPress={() => {
                          formikValuesRef.current = values;
                          handleRecaptchaAndApi("verifyOtp");
                        }}
                        disabled={!values.otp || loadingType === "verifyOtp"}
                        style={[styles.verifyButton, { marginBottom: 12 }, values.otp ? { backgroundColor: "#CA8A04" } : { backgroundColor: "#ccc" }]}
                        textStyle={styles.buttonText}
                      />
                    )}

                    {otpVerified && (
                      <TextComponent type="mediumText" style={{ color: "#27ae60", marginBottom: 8, fontSize: 13 }}>
                        ✓ Email verified
                      </TextComponent>
                    )}

                    {loginError && (
                      <TextComponent type="mediumText" style={styles.error}>{loginError}</TextComponent>
                    )}

                    {/* Register button */}
                    <LoadingButton
                      loading={loadingType === "register"}
                      text={signupTimer > 0 ? `Register (${signupTimer}s)` : "Register"}
                      onPress={() => {
                        formikValuesRef.current = values;
                        handleRecaptchaAndApi("register");
                      }}
                      disabled={!otpVerified || signupTimer === 0 || loadingType === "register"}
                      style={[styles.button, otpVerified && signupTimer > 0 ? { backgroundColor: "#CA8A04" } : { backgroundColor: "#ccc" }]}
                      textStyle={styles.buttonText}
                    />

                    {/* Consent */}
                    <Text style={{ fontSize: 11, color: "#888", textAlign: "center", lineHeight: 16, marginTop: 10 }}>
                      {"By creating an account, you agree to KalpX's "}
                      <Text style={{ color: "#b8864b", fontWeight: "600" }} onPress={() => Linking.openURL("https://kalpx.com/en/terms")}>
                        Terms of Service
                      </Text>
                      {" and acknowledge our "}
                      <Text style={{ color: "#b8864b", fontWeight: "600" }} onPress={() => Linking.openURL("https://kalpx.com/en/privacy")}>
                        Privacy Policy
                      </Text>
                      .
                    </Text>

                    {/* Footer */}
                    <View style={styles.footerContainer}>
                      <TextComponent type="cardText" style={styles.footer}>
                        {t("signup.alreadyMember")}{" "}
                      </TextComponent>
                      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                        <TextComponent type="cardText" style={styles.login}>
                          {t("signup.loginHere")}
                        </TextComponent>
                      </TouchableOpacity>
                    </View>
                  </>
                );
              }}
            </Formik>
              </>
            )}
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}
