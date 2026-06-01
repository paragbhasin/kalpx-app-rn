import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { AnyAction } from "@reduxjs/toolkit";
import * as AppleAuthentication from "expo-apple-authentication";
import { Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "redux-thunk";
import * as Yup from "yup";
import LoadingButton from "../../components/LoadingButton"; // ✅ import LoadingButton
import LoadingOverlay from "../../components/LoadingOverlay";
import TextComponent from "../../components/TextComponent";
import { RootState } from "../../store";
import { trackPixelEvent } from "../../utils/facebookEvents";
import { registerDeviceToBackend } from "../../utils/registerDevice";
import { setSkipMitraStart } from "../../utils/postLoginGuard";
import store from "../../store";
import { loadScreenWithData, screenActions } from "../../store/screenSlice";
import { navigate as rootNavigate } from "../../Shared/Routes/NavigationService";
import { mitraJourneyHomeV3 } from "../../engine/mitraApi";
import { ENV } from "../../Networks/baseURL";
import { loginUser, socialLoginUser } from "./actions";
import ReCaptchaRuntime from "./ReCaptchaRuntime";
import styles from "./styles";

const screenWidth = Dimensions.get("window").width;

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const [otpSent, setOtpSent] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [initialEmail, setInitialEmail] = useState("");
  const [initialPassword, setInitialPassword] = useState("");
  const dispatch: ThunkDispatch<RootState, void, AnyAction> = useDispatch();

  // fetch stored credentials
  useEffect(() => {
    const fetchCredentials = async () => {
      const email = await AsyncStorage.getItem("userEmail");
      const password = await SecureStore.getItemAsync("userPassword");
      setInitialEmail(email || "");
      setInitialPassword(password || "");
      if (email && password) {
        setKeepLoggedIn(true);
      }
    };
    fetchCredentials();
  }, []);

  // validation schema
  const LoginSchema = Yup.object().shape({
    username: Yup.string().required(t("login.errors.usernameRequired")),
    password: Yup.string()
      .min(6, t("login.errors.passwordMin"))
      .required(t("login.errors.passwordRequired")),
  });

  const recaptchaRef = useRef(null);
  const formikValuesRef = useRef(null);

  const [loginError, setLoginError] = useState(null);
  const [loading, setLoading] = useState(false);

const resumePendingIfAny = async () => {
  try {
    // MitraIntentionScreen ("What feels needed today?") stores this key when
    // an unauthenticated user taps a door. Navigate directly to the target
    // screen via the root navigation ref so we bypass Home's checkJourney
    // (which would redirect new users to MitraStart instead).
    const mitraIntentionPending = await AsyncStorage.getItem("mitra_intention_pending");
    if (mitraIntentionPending) {
      // Map door id → HomeStack screen name. For inner_path we keep the key
      // and route through MitraIntention so executeDoor() runs from within
      // HomeStack where DynamicEngine is reachable — and Home never becomes
      // focused, so checkJourney never fires and MitraStart is never shown.
      await AsyncStorage.removeItem("mitra_intention_pending");

      // Determine if this is a returning user (has any companion state —
      // rhythm, inner path, chant history, etc.) or a brand-new user.
      // journey/status only covers inner-path journeys, so we use the full
      // home endpoint which covers rhythm, chant, tell-mitra history, etc.
      let isReturningUser = false;
      try {
        const homeResp = await mitraJourneyHomeV3({ forceFresh: true });
        const ss = homeResp?.user_surface_state;
        isReturningUser =
          ss?.has_rhythm === true ||
          ss?.has_inner_path === true ||
          ss?.has_quick_chant_mantra === true ||
          ss?.has_quick_chant_history === true ||
          ss?.has_tell_mitra_history === true ||
          ss?.has_quick_checkin_history === true ||
          homeResp?.companion_rhythm?.has_rhythm === true ||
          homeResp?.inner_path_summary?.has_active_path === true;
      } catch { }

      if (isReturningUser) {
        // Returning user → go straight to FourDoor.
        // checkJourney will find their journey/state and render FourDoorHomeContainer.
        navigation.navigate("AppDrawer" as any);
        return;
      }

      // New user (no journey) — set guard so checkJourney skips MitraStart,
      // then navigate to the screen matching the card they tapped.
      setSkipMitraStart();

      if (mitraIntentionPending === "inner_path") {
        store.dispatch(screenActions.setScreenValue({ key: "onboarding_turn", value: "turn_2" }));
        store.dispatch(screenActions.setScreenValue({ key: "onboarding_draft_state", value: { started_at: Date.now(), entry_intention: "inner_path" } }));
        store.dispatch(loadScreenWithData({ containerId: "welcome_onboarding", stateId: "turn_2", replace: true }) as any);
        navigation.navigate("AppDrawer" as any);
        setTimeout(() => rootNavigate("DynamicEngine"), 400);
        return;
      }

      const screenMap: Record<string, string> = {
        daily_rhythm: "RhythmSetup",
        quick_chant: "QuickReset",
        tell_mitra: "TellMitra",
      };
      const targetScreen = screenMap[mitraIntentionPending];
      if (targetScreen) {
        navigation.navigate("AppDrawer" as any, {
          screen: "HomePage",
          params: {
            screen: "HomePage",
            params: { screen: targetScreen },
          },
        });
        return;
      }
    }

    const pendingKeys = [
      "pending_pooja_data",
      "pending_retreat_data",
      "pending_travel_data",
      "pending_astrology_data",
      "pending_classes_data",
      "pending_daily_practice_data",
      "pending_tracker_edit_data"
    ];

    for (const key of pendingKeys) {
      const pending = await AsyncStorage.getItem(key);

      if (pending) {
        const data = JSON.parse(pending);
        await AsyncStorage.removeItem(key);

     if (key === "pending_tracker_edit_data") {
  navigation.navigate("AppDrawer", {
    screen: "HomePage",
    params: {
      screen: "HomePage", 
      params: {
        screen: "TrackerTabs",
        params: {
          screen: "History",
          resumeData: data,
        },
      },
    },
  });
  return;
}

if (key === "pending_classes_data") {
  navigation.navigate("AppDrawer", {
    screen: "HomePage",
    params: {
      screen: "HomePage",
      params: {
        screen: "ClassBookingScreen",
        params: {
          resumeData: data,
          data: data.classData,          // ⭐ supply full classInfo again
          reschedule: false,
        },
      },
    },
  });
  return;
}


        const targetScreenMap = {
          pending_pooja_data: "Pooja",
          pending_retreat_data: "Retreat",
          pending_travel_data: "Travel",
          pending_astrology_data: "Astrology",
          // pending_classes_data: "ClassBookingScreen",
          pending_daily_practice_data: "DailyPracticeSelectList",
          // pending_tracker_edit_data:"TrackerTabs"
        };

        const targetScreen = targetScreenMap[key];

        navigation.navigate("AppDrawer", {
          screen: "HomePage",
          params: {
            screen: "HomePage",
            params: {
              screen: targetScreen,
              params: { resumeData: data },
            },
          },
        });

        return;
      }
    }

    navigation.navigate("AppDrawer");
  } catch (err) {
    console.error("Error:", err);
    navigation.navigate("AppDrawer");
  }
};


  // const resumePendingIfAny = async () => {
  //       setLoading(true);
  //   try {
  //     const pendingKeys = [
  //       "pending_pooja_data",
  //       "pending_retreat_data",
  //       "pending_travel_data",
  //       "pending_astrology_data",
  //       "pending_classes_data",
  //       "pending_daily_practice_data",
  //     ];

  //     for (const key of pendingKeys) {
  //       const pending = await AsyncStorage.getItem(key);

  //       if (pending) {
  //         const data = JSON.parse(pending);
  //         await AsyncStorage.removeItem(key);

  //         const targetScreenMap = {
  //           pending_pooja_data: "Pooja",
  //           pending_retreat_data: "Retreat",
  //           pending_travel_data: "Travel",
  //           pending_astrology_data: "Astrology",
  //           pending_classes_data: "ClassBookingScreen",
  //           pending_daily_practice_data: "DailyPracticeSelectList",
  //         };

  //         const targetScreen = targetScreenMap[key];

  //         // ⭐ ONLY navigate — NO reset, NO nested states
  //         navigation.navigate("AppDrawer", {
  //           screen: "HomePage", // bottom tab
  //           params: {
  //             screen: "HomePage", // tab screen containing HomeStack
  //             params: {
  //               screen: targetScreen,
  //               params: { resumeData: data },
  //             },
  //           },
  //         });

  //         return;
  //       }
  //     }

  //     // No pending → go home normally
  //     navigation.navigate("AppDrawer");
  //   } catch (err) {
  //     console.error("Error:", err);
  //     navigation.navigate("AppDrawer");
  //   }
  //       setLoading(false);
  // };

  const signInWithGoogle = async () => {
    try {
      setLoginError(null);

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      await GoogleSignin.signOut(); // optional to force popup

      const result = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      console.log("✅ Google Sign-In result:", result);
      console.log("🎟️ Google Tokens:", tokens);

      const access_token = tokens.accessToken;
      if (!access_token) {
        throw new Error("Missing Google access token");
      }
        setLoading(true);
      dispatch(
        socialLoginUser({ provider: "google", access_token }, async (res) => {
          setLoading(false);
          if (res.success) {
                  await registerDeviceToBackend();
              trackPixelEvent("GoogleLoginSuccess", {
  user_id: res.data?.user?.id,
  email: res.data?.user?.email,
});
            console.log("🎉 Google login success:", res.data);
            if (keepLoggedIn) {
              await AsyncStorage.setItem("userEmail", result.data.user.email);
              await AsyncStorage.setItem(
                "googleUser",
                JSON.stringify(result.data.user)
              );
            }
            await AsyncStorage.setItem("showLocationConfirm", "true");
            await resumePendingIfAny();
          } else {
            setLoginError(res.error || "Google login failed");
          }
          setLoading(false);
        })
      );
    } catch (error) {
      console.error("❌ Google Sign-In Error:", error);
      setLoginError(error.message || "Google Sign-In failed");
      setLoading(false);
    }
  };

  const handleSignInApple = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log("🍎 Apple Credential:", {
        user: credential.user,
        email: credential.email,
        realUserStatus: credential.realUserStatus,
        identityToken: credential.identityToken
          ? `${credential.identityToken.substring(0, 60)}... (len=${credential.identityToken.length})`
          : "NULL/EMPTY",
        authorizationCode: credential.authorizationCode ? "PRESENT" : "NULL",
        fullName: credential.fullName,
      });

      // 1️⃣ Extract JWT identity token
      const id_token = credential.identityToken;

      if (!id_token) {
        throw new Error("Missing Apple identity token");
      }

      console.log("🍏 Apple ID Token (JWT):", id_token);
  setLoading(true);
      const applePayload: Record<string, any> = {
        provider: "apple",
        id_token: id_token,
        authorization_code: credential.authorizationCode,
        user_type: "user",
      };
      if (credential.email) applePayload.email = credential.email;
      if (credential.fullName) {
        const { givenName, familyName } = credential.fullName;
        const name = [givenName, familyName].filter(Boolean).join(" ");
        if (name) applePayload.full_name = name;
      }
      console.log("📤 Apple payload being sent:", JSON.stringify(applePayload));
      dispatch(
        socialLoginUser(
          applePayload,
          async (res) => {
            if (res.success) {
               trackPixelEvent("AppleLoginSuccess", {
    user_id: res.data?.user?.id,
    email: res.data?.user?.email,
  });
              await AsyncStorage.setItem("showLocationConfirm", "true");
              await resumePendingIfAny();
            } else {
              setLoginError(res.error || "Apple login failed");
            }
             setLoading(false);
          }
        )
      );
    } catch (e) {
      console.log("🛑 Apple login error:", e);
      setLoginError("Apple login failed");
       setLoading(false);
    }
  };

  // const handleSignInApple = async () => {
  //   try {
  //     const credential = await AppleAuthentication.signInAsync({
  //       requestedScopes: [
  //         AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
  //         AppleAuthentication.AppleAuthenticationScope.EMAIL,
  //       ],
  //     });

  //     console.log("🍎 Apple Credential:", credential);

  //     dispatch(
  //       socialLoginUser(
  //         {
  //           provider: "apple",
  //           apple_user_id: credential.user,
  //           identity_token: credential.identityToken,
  //           authorization_code: credential.authorizationCode,
  //           email: credential.email,
  //           name: credential.fullName,
  //         },
  //         async (res) => {
  //           if (res.success) {
  //             await AsyncStorage.setItem("showLocationConfirm", "true");
  //             await resumePendingIfAny();
  //           } else {
  //             setLoginError(res.error || "Apple login failed");
  //           }
  //         }
  //       )
  //     );

  //   } catch (e) {
  //     console.log("🛑 Apple login error:", e);
  //   }
  // };

  //  const handleSignInApple = async () => {
  //     try {
  //       const credential = await AppleAuthentication.signInAsync({
  //         requestedScopes: [
  //           AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
  //           AppleAuthentication.AppleAuthenticationScope.EMAIL,
  //         ],
  //       });
  //       // signed in
  //       console.log(credential);
  //       // sample response provided below
  //     } catch (e) {
  //       if (e.code === 'ERR_REQUEST_CANCELED') {
  //         // handle that the user canceled the sign-in flow
  //       } else {
  //         // handle other errors
  //       }
  //     }
  //   };

  const handleRecaptchaToken = (token) => {
    setLoading(true);
    setLoginError(null);
    const credentials = {
      email: formikValuesRef.current.username,
      password: formikValuesRef.current.password,
      recaptcha_token: token,
      recaptcha_action: "login",
    };
    dispatch(
      loginUser(credentials, async (result) => {
        setLoading(false);
        if (result && result.success) {
            trackPixelEvent("LoginSuccess", {
    user_id: result.data?.user?.id,
    email: result.data?.user?.email,
  });
          if (keepLoggedIn) {
            await AsyncStorage.setItem("userEmail", credentials.email);
            await SecureStore.setItemAsync("userPassword", credentials.password);
          } else {
            await AsyncStorage.removeItem("userEmail");
            await SecureStore.deleteItemAsync("userPassword");
          }
          await AsyncStorage.setItem("showLocationConfirm", "true");
          await resumePendingIfAny();
          // navigation.navigate('HomePage', { screen: 'Home'});
          // navigation.navigate('HomePage', { screen: 'Home'});
          // navigation.navigate("AppDrawer");
        } else {
          setLoginError(result?.error || "Login failed");
        }
      }) as any
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff2dd"
        translucent={false}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ImageBackground
          source={require("../../../assets/hoomepagebg.webp")}
          style={styles.background}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            {navigation.canGoBack() && (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ alignSelf: "flex-start", padding: 8, marginLeft: 4, marginTop: 4 }}
                activeOpacity={0.7}
              >
                <Icon name="chevron-back" size={26} color="#432104" />
              </TouchableOpacity>
            )}
            <TextComponent type="headerBigText" style={styles.brand}>
              {t("login.brand")}
            </TextComponent>
            <TextComponent type="cardText" style={styles.heading}>
              {t("login.heading")}
            </TextComponent>

            {/* Google Login Button */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={() => {
                signInWithGoogle();
              }}
            >
              <Image
                source={require("../../../assets/devicon_google.png")}
                style={styles.googleIcon}
              />
              <TextComponent type="headerText" style={styles.googleText}>
                {t("login.google")}
              </TextComponent>
            </TouchableOpacity>
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={
                AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
              }
              buttonStyle={
                AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
              }
              cornerRadius={8}
              style={{
                width: "98%",
                height: 40,
                marginVertical: 12,
                marginHorizontal: 12,
              }}
              onPress={handleSignInApple}
            />

            {/* <TouchableOpacity
              style={styles.googleButton}
              onPress={() => {handleSignInApple()}}
            >
              <Image source={require("../../../assets/devicon_apple.png")} style={styles.appleIcon} resizeMode="contain"/>
               <TextComponent type="headerText" style={styles.googleText}>{t("login.apple")}</TextComponent>
            </TouchableOpacity> */}

            <View style={styles.card}>
              <TextComponent
                type="loginHeaderText"
                style={styles.cardTitleLine1}
              >
                {t("login.cardTitleLine1")}
              </TextComponent>
              <TextComponent
                type="loginHeaderText"
                style={styles.cardTitleLine2}
              >
                {t("login.cardTitleLine2")}
              </TextComponent>
              <TextComponent type="streakSubText" style={styles.subTitle}>
                {t("login.subTitle")}
              </TextComponent>

              <Formik
                enableReinitialize
                initialValues={{
                  username: initialEmail,
                  password: initialPassword,
                }}
                validationSchema={LoginSchema}
                onSubmit={(values) => {
                  formikValuesRef.current = values;
                  // Dev API accepts bypass tokens; production API requires a real token.
                  if (ENV === "dev") {
                    handleRecaptchaToken("dev-bypass-token");
                  } else {
                    recaptchaRef.current?.requestNewToken();
                  }
                }}
              >
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                }) => (
                  <>
                    <ReCaptchaRuntime
                      ref={recaptchaRef}
                      onToken={handleRecaptchaToken}
                    />

                    <TextInput
                      keyboardType="email-address"
                      textContentType="emailAddress"
                      autoCapitalize="none"
                      autoCorrect={false}
                      allowFontScaling={false}
                      style={styles.input}
                      placeholder={t("login.username")}
                      placeholderTextColor="#9e9b97"
                      value={values.username.normalize("NFC")} // ✅ normalize Unicode rendering
                      onChangeText={handleChange("username")}
                      onBlur={handleBlur("username")}
                      testID="login_email_input"
                    />
                    {errors.username && touched.username && (
                      <TextComponent type="mediumText" style={styles.error}>
                        {errors.username}
                      </TextComponent>
                    )}

                    {otpSent && (
                      <TextComponent type="mediumText" style={styles.success}>
                        {t("login.otpSent")}
                      </TextComponent>
                    )}

                    <View style={styles.passwordContainer}>
                      <TextInput
                        keyboardType="default"
                        textContentType="password"
                        autoCapitalize="none"
                        autoCorrect={false}
                        allowFontScaling={false}
                        style={[
                          styles.input,
                          {
                            flex: 1,
                            borderWidth: 0,
                            marginBottom: 0,
                            marginLeft: -10,
                          },
                        ]}
                        placeholder={t("login.password")}
                        placeholderTextColor="#9e9b97"
                        secureTextEntry={!showPassword}
                        value={values.password.normalize("NFC")}
                        onChangeText={handleChange("password")}
                        onBlur={handleBlur("password")}
                        testID="login_password_input"
                      />

                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Icon
                          name={showPassword ? "eye" : "eye-off"}
                          size={20}
                          color="#6c4b2f"
                          style={{ paddingHorizontal: 6 }}
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.password && touched.password && (
                      <TextComponent type="mediumText" style={styles.error}>
                        {errors.password}
                      </TextComponent>
                    )}

                    <View style={styles.row}>
                      <TouchableOpacity
                        style={styles.checkboxContainer}
                        onPress={() => setKeepLoggedIn(!keepLoggedIn)}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            keepLoggedIn && styles.checked,
                          ]}
                        >
                          {keepLoggedIn && (
                            <TextComponent
                              type="headerText"
                              style={styles.checkmark}
                            >
                              ✓
                            </TextComponent>
                          )}
                        </View>
                        <TextComponent
                          type="semiBoldText"
                          style={styles.checkboxLabel}
                        >
                          {t("login.keepLoggedIn")}
                        </TextComponent>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => navigation.navigate("ForgotPassword")}
                      >
                        <TextComponent
                          type="semiBoldText"
                          style={styles.forgot}
                        >
                          {t("login.forgotPassword")}
                        </TextComponent>
                      </TouchableOpacity>
                    </View>

                    {loginError && (
                      <TextComponent type="mediumText" style={styles.error}>
                        {loginError}
                      </TextComponent>
                    )}

                    {/* ✅ Replaced TouchableOpacity with LoadingButton */}
                    <LoadingButton
                      loading={loading}
                      text={t("login.loginBtn")}
                      onPress={handleSubmit}
                      disabled={loading}
                      style={styles.button}
                      textStyle={styles.buttonText}
                      showGlobalLoader={true}
                    />
                    <LoadingOverlay visible={loading} text="Signing in..." />
                    <View style={styles.footerContainer}>
                      <TextComponent type="cardText" style={styles.footer}>
                        {t("login.footer")}{" "}
                      </TextComponent>
                      <TouchableOpacity
                        onPress={() => navigation.navigate("Signup")}
                      >
                        <TextComponent type="cardText" style={styles.login}>
                          {t("login.register")}
                        </TextComponent>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </Formik>
            </View>
            <View style={styles.skipContainer}>
              <TouchableOpacity
                onPress={async () => {
                  //  await AsyncStorage.setItem("showLocationConfirm", "true");
                  //  await unregisterDeviceFromBackend();
                  await registerDeviceToBackend();
                  navigation.navigate("AppDrawer");
                }}
              >
                <TextComponent type="headerText" style={styles.skipText}>
                  {t("welcome.skip")}
                </TextComponent>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
