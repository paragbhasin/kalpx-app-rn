import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { registerDeviceToBackend } from "../../utils/registerDevice";
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
      const password = await AsyncStorage.getItem("userPassword");
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
    const pendingKeys = [
      "pending_pooja_data",
      "pending_retreat_data",
      "pending_travel_data",
      "pending_astrology_data",
      "pending_classes_data",
      "pending_daily_practice_data",
    ];

    for (const key of pendingKeys) {
      const pending = await AsyncStorage.getItem(key);

      if (pending) {
        const data = JSON.parse(pending);
        await AsyncStorage.removeItem(key);

        const targetScreenMap = {
          pending_pooja_data: "Pooja",
          pending_retreat_data: "Retreat",
          pending_travel_data: "Travel",
          pending_astrology_data: "Astrology",
          pending_classes_data: "ClassBookingScreen",
          pending_daily_practice_data: "DailyPracticeSelectList",
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

      console.log("🍎 Apple Credential:", credential);

      // 1️⃣ Extract JWT identity token
      const id_token = credential.identityToken;

      if (!id_token) {
        throw new Error("Missing Apple identity token");
      }

      console.log("🍏 Apple ID Token (JWT):", id_token);
  setLoading(true);
      // 2️⃣ Send ONLY the JWT to backend
      dispatch(
        socialLoginUser(
          {
            provider: "apple",
            id_token: id_token,
            user_type: "user",
          },
          async (res) => {
            if (res.success) {
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
          if (keepLoggedIn) {
            await AsyncStorage.setItem("userEmail", credentials.email);
            await AsyncStorage.setItem("userPassword", credentials.password);
          } else {
            await AsyncStorage.removeItem("userEmail");
            await AsyncStorage.removeItem("userPassword");
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
          source={require("../../../assets/hoomepagebg.jpg")}
          style={styles.background}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
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
                  recaptchaRef.current?.requestNewToken();
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
