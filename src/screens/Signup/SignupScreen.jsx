import AsyncStorage from "@react-native-async-storage/async-storage";
import { Formik } from "formik";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import LoadingButton from "../../components/LoadingButton";
import TextComponent from "../../components/TextComponent";
import ReCaptchaRuntime from "../Login/ReCaptchaRuntime";
import { generateOtp, signupUser, verifyOtp } from "./actions";
import styles from "./styles";

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

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const recaptchaRef = useRef(null);

  const formikValuesRef = useRef<any>(null);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fefaf2"
        translucent={false}
      />
      <ImageBackground
        source={require("../../../assets/hoomepagebg.jpg")}
        style={styles.background}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TextComponent type="headerBigText" style={styles.brand}>{t("login.brand")}</TextComponent>
          <TextComponent type="headerIncreaseText" style={styles.heading}>{t("signup.getStarted")}</TextComponent>

          <View style={styles.card}>
            <TextComponent type="loginHeaderText" style={styles.cardTitleLine1}>{t("signup.createYour")}</TextComponent>
            <TextComponent type="loginHeaderText" style={styles.cardTitleLine2}>{t("signup.account")}</TextComponent>
            <TextComponent type="streakSubText" style={styles.subTitle}>{t("signup.connectWith")}</TextComponent>
            <Formik
              initialValues={{
                email: "",
                username: "",
                password: "",
                confirmPassword: "",
                otp: "",
              }}
              validationSchema={SignupSchema}
              onSubmit={() => {}}
            >
              {({
                handleChange,
                handleBlur,
                values,
                errors,
                touched,
              }) => {
                const isRequestOtpEnabled = (vals) => {
                  return (
                    vals.email &&
                    vals.username &&
                    vals.password &&
                    vals.confirmPassword &&
                    !errors.email &&
                    !errors.username &&
                    !errors.password &&
                    !errors.confirmPassword
                  );
                };

                return (
                  <>
                    <ReCaptchaRuntime
                      ref={recaptchaRef}
                      onToken={handleRecaptchaToken}
                    />

                    {/* Email */}
                    <TextInput
                    allowFontScaling={false}
                      style={styles.input}
                      placeholder={t("signup.email")}
                      placeholderTextColor="#9e9b97"
                      value={values.email}
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                    />
                    {errors.email && touched.email && (
                      <TextComponent type="mediumText" style={styles.error}>{errors.email}</TextComponent>
                    )}

                    {/* Username */}
                    <TextInput
                    allowFontScaling={false}
                      style={styles.input}
                      placeholder={t("signup.username")}
                      placeholderTextColor="#9e9b97"
                      value={values.username}
                      onChangeText={handleChange("username")}
                      onBlur={handleBlur("username")}
                    />
                    {errors.username && touched.username && (
                      <TextComponent type="mediumText" style={styles.error}>{errors.username}</TextComponent>
                    )}

                    <View style={styles.passwordContainer}>
                      <TextInput
                    allowFontScaling={false}
                        style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0, marginLeft: -10 }]}
                        placeholder={t("signup.password")}
                        placeholderTextColor="#9e9b97"
                        secureTextEntry={!showPassword}
                        value={values.password}
                        onChangeText={handleChange("password")}
                        onBlur={handleBlur("password")}
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Icon
                          name={showPassword ? "eye" : "eye-off"}
                          size={20}
                          color="#6c4b2f"
                          style={{ paddingHorizontal: 6 }}
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.password && touched.password && (
                      <TextComponent type="mediumText" style={styles.error}>{errors.password}</TextComponent>
                    )}

                    <View style={styles.passwordContainer}>
                      <TextInput
                    allowFontScaling={false}
                        style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0, marginLeft: -10 }]}
                        placeholder={t("signup.confirmPassword")}
                        placeholderTextColor="#9e9b97"
                        secureTextEntry={!showConfirmPassword}
                        value={values.confirmPassword}
                        onChangeText={handleChange("confirmPassword")}
                        onBlur={handleBlur("confirmPassword")}
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <Icon
                          name={showConfirmPassword ? "eye" : "eye-off"}
                          size={20}
                          color="#6c4b2f"
                          style={{ paddingHorizontal: 6 }}
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.confirmPassword && touched.confirmPassword && (
                      <TextComponent type="mediumText" style={styles.error}>{errors.confirmPassword}</TextComponent>
                    )}

                    {/* OTP Field - always visible */}
                    <TextInput
                    allowFontScaling={false}
                      style={styles.input}
                      placeholder={t("signup.otp")}
                      placeholderTextColor="#9e9b97"
                      value={values.otp}
                      onChangeText={handleChange("otp")}
                      onBlur={handleBlur("otp")}
                    />
                    {errors.otp && touched.otp && (
                      <TextComponent type="mediumText" style={styles.error}>{errors.otp}</TextComponent>
                    )}

                    {/* OTP Section */}
                    {!otpVerified && (
                      <View style={styles.verifyOtpContainer}>
                        {!otpSent && (
                          <LoadingButton
                            loading={loadingType === "requestOtp"}
                            text={t("signup.requestOtp")}
                            onPress={() => {
                              formikValuesRef.current = values;
                              handleRecaptchaAndApi("requestOtp");
                            }}
                            disabled={!isRequestOtpEnabled(values) || loadingType === "requestOtp"}
                            style={[
                              styles.verifyButton,
                              isRequestOtpEnabled(values)
                                ? { backgroundColor: "#CA8A04" }
                                : { backgroundColor: "#ccc" },
                            ]}
                            textStyle={styles.buttonText}
                            width={170}
                          />
                        )}

                        {otpSent && (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            {/* Verify OTP */}
                            <LoadingButton
                              loading={loadingType === "verifyOtp"}
                              text={t("signup.verifyOtp")}
                              onPress={() => {
                                formikValuesRef.current = values;
                                handleRecaptchaAndApi("verifyOtp");
                              }}
                              disabled={!values.otp || loadingType === "verifyOtp"}
                              style={[
                                styles.verifyButton,
                                values.otp
                                  ? { backgroundColor: "#CA8A04" }
                                  : { backgroundColor: "#ccc" },
                              ]}
                              textStyle={styles.buttonText}
                              width={170}
                            />

                            {/* Timer */}
                            <TextComponent type="headerText" style={{ marginHorizontal: 10 }}>
                              {timer > 0 ? `${timer}s` : ""}
                            </TextComponent>

                            {/* Resend OTP */}
                            <LoadingButton
                              loading={loadingType === "resendOtp"}
                              text={t("signup.resendOtp")}
                              onPress={() => {
                                formikValuesRef.current = values;
                                handleRecaptchaAndApi("resendOtp");
                                setResendEnabled(false);
                                setTimer(60);
                              }}
                              disabled={!resendEnabled || loadingType === "resendOtp"}
                              style={[
                                styles.verifyButton,
                                resendEnabled
                                  ? { backgroundColor: "#CA8A04" }
                                  : { backgroundColor: "#ccc" },
                              ]}
                              textStyle={styles.buttonText}
                              width={120}
                            />
                          </View>
                        )}
                      </View>
                    )}

                    {/* OTP Verified */}
                    {otpVerified && console.log("💚 Render → OTP Verified text visible on screen")}
                    {otpVerified && (
                      <TextComponent
                        type="headerText"
                        style={{ color: "green", marginVertical: 10 }}
                      >
                        OTP Verified
                      </TextComponent>
                    )}

                    {console.log(
                      "🟨 Signup Button Render:",
                      "otpVerified =", otpVerified,
                      "| signupTimer =", signupTimer,
                      "| loadingType =", loadingType
                    )}

                    {/* Signup Button */}
                    <LoadingButton
                      loading={loadingType === "register"}
                      text={
                        signupTimer > 0
                          ? `${t("signup.signUp")} (${signupTimer}s)`
                          : t("signup.signUp")
                      }
                      onPress={() => {
                        formikValuesRef.current = values;
                        handleRecaptchaAndApi("register");
                      }}
                      disabled={!otpVerified || signupTimer === 0 || loadingType === "register"}
                      style={[
                        styles.button,
                        otpVerified && signupTimer > 0
                          ? { backgroundColor: "#CA8A04" }
                          : { backgroundColor: "#ccc" },
                      ]}
                      textStyle={styles.buttonText}
                      width={"100%"}
                    />

                    {/* Footer */}
                    <View style={styles.footerContainer}>
                      <TextComponent type="cardText" style={styles.footer}>
                        {t("signup.alreadyMember")}{" "}
                      </TextComponent>
                      <TouchableOpacity
                        onPress={() => navigation.navigate("Login")}
                      >
                        <TextComponent type="cardText" style={styles.login}>
                          {t("signup.loginHere")}
                        </TextComponent>
                      </TouchableOpacity>
                    </View>
                  </>
                );
              }}
            </Formik>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}






// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Formik } from "formik";
// import React, { useEffect, useRef, useState } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   Dimensions,
//   ImageBackground,
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   TextInput,
//   TouchableOpacity,
//   View
// } from "react-native";
// import Icon from "react-native-vector-icons/Ionicons";
// import { useDispatch } from "react-redux";
// import * as Yup from "yup";
// import LoadingButton from "../../components/LoadingButton";
// import TextComponent from "../../components/TextComponent";
// import ReCaptchaRuntime from "../Login/ReCaptchaRuntime";
// import { generateOtp, signupUser, verifyOtp } from "./actions";
// import styles from "./styles";


// const screenWidth = Dimensions.get("window").width;

// // Validation Schema
// const SignupSchema = Yup.object().shape({
//   email: Yup.string().email("Invalid email").required("Required"),
//   username: Yup.string().min(3, "Too Short!").required("Required"),
//   password: Yup.string().min(6, "Min 6 chars").required("Required"),
//   confirmPassword: Yup.string()
//     .oneOf([Yup.ref("password"), null], "Passwords must match")
//     .required("Required"),
//   otp: Yup.string(), // OTP not required until used
// });

// export default function SignupScreen({ navigation }) {
//   const [otpSent, setOtpSent] = useState(false);
//   const [otpVerified, setOtpVerified] = useState(false);
//   const [timer, setTimer] = useState(0);
//   const [resendEnabled, setResendEnabled] = useState(false);
//   const [signupTimer, setSignupTimer] = useState(0);
// const [showPassword, setShowPassword] = useState(false);
// const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const { t } = useTranslation();
//   const dispatch = useDispatch();
//   const recaptchaRef = useRef(null);

//   const formikValuesRef = useRef(null);
//   const [loginError, setLoginError] = useState(null);
//   const [loadingType, setLoadingType] = useState(null); // 'requestOtp' | 'verifyOtp' | 'resendOtp' | 'signUp' | null

//   // Request reCAPTCHA + API
//   const handleRecaptchaAndApi = (actionType) => {
//     setLoginError(null);
//     setLoadingType(actionType);
//     recaptchaRef.current?.requestNewToken();
//     formikValuesRef.current.actionType = actionType;
//   };

//   // OTP Timer
//   useEffect(() => {
//     let interval;
//     if (otpSent && timer > 0) {
//       interval = setInterval(() => {
//         setTimer((prev) => prev - 1);
//       }, 1000);
//     } else if (otpSent && timer === 0) {
//       setResendEnabled(true);
//     }
//     return () => clearInterval(interval);
//   }, [otpSent, timer]);

//   // Signup Timer
//   useEffect(() => {
//     let interval;
//     if (otpVerified && signupTimer > 0) {
//       interval = setInterval(() => {
//         setSignupTimer((prev) => prev - 1);
//       }, 1000);
//     }
//     if (signupTimer === 0 && otpVerified) {
//       setOtpVerified(false);
//       setOtpSent(false);
//       setTimer(0);
//       setResendEnabled(false);
//     }
//     return () => clearInterval(interval);
//   }, [otpVerified, signupTimer]);


//   const resumePendingIfAny = async () => {
//   try {
//     console.log("🔎 Checking for pending protected actions after login...");

//     const pendingKeys = [
//       "pending_pooja_data",
//       "pending_retreat_data",
//       "pending_travel_data",
//       "pending_astrology_data",
//     ];

//     for (const key of pendingKeys) {
//       const pending = await AsyncStorage.getItem(key);
//       console.log(`📦 Checking key: ${key} →`, pending ? "Found data" : "No data");

//       if (pending) {
//         const data = JSON.parse(pending);
//         await AsyncStorage.removeItem(key);
//         console.log(`🧹 Cleared ${key} from AsyncStorage.`);

//         const targetScreenMap = {
//           pending_pooja_data: "Pooja",
//           pending_retreat_data: "Retreat",
//           pending_travel_data: "Travel",
//           pending_astrology_data: "Astrology",
//         };

//         const targetScreen = targetScreenMap[key];
//         console.log("🎯 Target screen identified:", targetScreen);

//         // ✅ Step 1️⃣ Mount AppDrawer (this ensures drawer exists)
//         navigation.reset({
//           index: 0,
//           routes: [
//             {
//               name: "AppDrawer",
//               state: {
//                 routes: [
//                   {
//                     name: "HomePage", // bottom tab
//                     state: {
//                       routes: [
//                         {
//                           name: "HomePage", // tab screen containing HomeStack
//                           state: {
//                             routes: [
//                               {
//                                 name: targetScreen,
//                                 params: { resumeData: data },
//                               },
//                             ],
//                           },
//                         },
//                       ],
//                     },
//                   },
//                 ],
//               },
//             },
//           ],
//         });

//         console.log("✅ Drawer + BottomTab + TargetScreen mounted →", targetScreen);
//         return;
//       }
//     }

//     console.log("🚫 No pending data found → Navigating to AppDrawer");
//     navigation.reset({
//       index: 0,
//       routes: [{ name: "AppDrawer" }],
//     });
//   } catch (err) {
//     console.error("❌ Error resuming pending action:", err);
//     navigation.reset({
//       index: 0,
//       routes: [{ name: "AppDrawer" }],
//     });
//   }
// };

//   // reCAPTCHA callback
// // reCAPTCHA callback
// const handleRecaptchaToken = (token) => {
//   setLoginError(null);
//   const values = formikValuesRef.current;
//   const actionType = values.actionType;
//   let payload = {};

//   console.log("🔹 handleRecaptchaToken called for action:", actionType);

//   if (actionType === "requestOtp" || actionType === "resendOtp") {
//     payload = {
//       email: values.email,
//       recaptcha_token: token,
//       recaptcha_action: "request_otp",
//       context: "registration",
//     };
//     console.log("📤 Sending OTP request payload:", payload);
//     dispatch(
//       generateOtp(payload, (result) => {
//         console.log("📩 OTP Request Response:", result);
//         setLoadingType(null);
//         if (result.success) {
//           console.log("✅ OTP sent successfully");
//           setOtpSent(true);
//           setTimer(60);
//           setResendEnabled(false);
//         } else {
//           console.log("❌ OTP request failed:", result.error);
//           setLoginError(result.error || "OTP request failed");
//         }
//       }) as any
//     );
//   } 
//   else if (actionType === "verifyOtp") {
//     payload = {
//       email: values.email,
//       otp: values.otp,
//       recaptcha_token: token,
//       recaptcha_action: "verify_otp",
//     };
//     console.log("📤 Sending OTP verification payload:", payload);
//     dispatch(
//       verifyOtp(payload, (result) => {
//         console.log("📩 OTP Verify Response:", result);
//         setLoadingType(null);
//         if (result.success) {
//           console.log("✅ OTP verification successful → Updating state...");
//           setOtpVerified(true);
//           setOtpSent(false);
//           setSignupTimer(120);
//           console.log("🟢 State set → otpVerified:", true, "| signupTimer:", 120);
//         } else {
//           console.log("❌ OTP verification failed:", result.error);
//           setLoginError(result.error || "OTP verification failed");
//         }
//       }) as any
//     );
//   } 
//   else if (actionType === "register") {
//     payload = {
//       email: values.email,
//       username: values.username,
//       password1: values.password,
//       password2: values.confirmPassword,
//       role: "user",
//       profile_name: values.username,
//       age_group_id: null,
//       language_ids: [],
//       country_ids: [],
//       culture_ids: [],
//       recaptcha_token: token,
//       recaptcha_action: "register",
//     };
//     console.log("📤 Sending Signup Payload:", payload);
//     dispatch(
//       signupUser(payload, async (result) => {
//         console.log("📩 Signup Response:", result);
//         setLoadingType(null);
//         if (result.success) {
//           console.log("✅ Signup successful, saving data...");
//           await AsyncStorage.setItem("isLoggedIn", "true");
//           await AsyncStorage.setItem("user_id", result.user_id?.toString() || "");
//           await AsyncStorage.setItem("showLocationConfirm", "true");
//           await resumePendingIfAny();
//         } else {
//           console.log("❌ Signup failed:", result.error);
//           setLoginError(result.error || "Signup failed");
//         }
//       }) as any
//     );
//   }
// };


//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <StatusBar
//         barStyle="dark-content"
//         backgroundColor="#fefaf2"
//         translucent={false}
//       />
//       <ImageBackground
//         source={require("../../../assets/hoomepagebg.jpg")}
//         style={styles.background}
//       >
//         <ScrollView contentContainerStyle={styles.scrollContainer}>
//                       <TextComponent type="headerBigText"  style={styles.brand}>{t("login.brand")}</TextComponent>
//             <TextComponent type="headerText" style={styles.heading}>{t("signup.getStarted")}</TextComponent>


//           <View style={styles.card}>
//                           <TextComponent type="cardText" style={styles.cardTitleLine1}>{t("signup.createYour")}</TextComponent>
//               <TextComponent type="cardText" style={styles.cardTitleLine2}>{t("signup.account")}</TextComponent>
//               <TextComponent  type="mediumText" style={styles.subTitle}>{t("signup.connectWith")}</TextComponent>
//             <Formik
//               initialValues={{
//                 email: "",
//                 username: "",
//                 password: "",
//                 confirmPassword: "",
//                 otp: "",
//               }}
//               validationSchema={SignupSchema}
//               onSubmit={() => {}}
//             >
//               {({
//                 handleChange,
//                 handleBlur,
//                 values,
//                 errors,
//                 touched,
//               }) => {
//                 const isRequestOtpEnabled = (vals) => {
//                   return (
//                     vals.email &&
//                     vals.username &&
//                     vals.password &&
//                     vals.confirmPassword &&
//                     !errors.email &&
//                     !errors.username &&
//                     !errors.password &&
//                     !errors.confirmPassword
//                   );
//                 };

//                 return (
//                   <>
//                     <ReCaptchaRuntime
//                       ref={recaptchaRef}
//                       onToken={handleRecaptchaToken}
//                     />

//                     {/* Email */}
//                     <TextInput
//                       style={styles.input}
//                       placeholder={t("signup.email")}
//                       placeholderTextColor="#9e9b97"
//                       value={values.email}
//                       onChangeText={handleChange("email")}
//                       onBlur={handleBlur("email")}
//                     />
//                     {errors.email && touched.email && (
//                       <TextComponent type="mediumText" style={styles.error}>{errors.email}</TextComponent>
//                     )}

//                     {/* Username */}
//                     <TextInput
//                       style={styles.input}
//                       placeholder={t("signup.username")}
//                       placeholderTextColor="#9e9b97"
//                       value={values.username}
//                       onChangeText={handleChange("username")}
//                       onBlur={handleBlur("username")}
//                     />
//                     {errors.username && touched.username && (
//                       <TextComponent type="mediumText" style={styles.error}>{errors.username}</TextComponent>
//                     )}
// <View style={styles.passwordContainer}>
//   <TextInput
//     style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0 ,marginLeft:-10}]}
//     placeholder={t("signup.password")}
//     placeholderTextColor="#9e9b97"
//     secureTextEntry={!showPassword}
//     value={values.password}
//     onChangeText={handleChange("password")}
//     onBlur={handleBlur("password")}
//   />
//   <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
//     <Icon
//       name={showPassword ? "eye" : "eye-off"}
//       size={20}
//       color="#6c4b2f"
//       style={{ paddingHorizontal: 6 }}
//     />
//   </TouchableOpacity>
// </View>
// {errors.password && touched.password && (
//   <TextComponent type="mediumText" style={styles.error}>{errors.password}</TextComponent>
// )}

//                    <View style={styles.passwordContainer}>
//   <TextInput
//     style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0 ,marginLeft:-10}]}
//     placeholder={t("signup.confirmPassword")}
//     placeholderTextColor="#9e9b97"
//     secureTextEntry={!showConfirmPassword}
//     value={values.confirmPassword}
//     onChangeText={handleChange("confirmPassword")}
//     onBlur={handleBlur("confirmPassword")}
//   />
//   <TouchableOpacity
//     onPress={() => setShowConfirmPassword(!showConfirmPassword)}
//   >
//     <Icon
//       name={showConfirmPassword ? "eye" : "eye-off"}
//       size={20}
//       color="#6c4b2f"
//       style={{ paddingHorizontal: 6 }}
//     />
//   </TouchableOpacity>
// </View>
// {errors.confirmPassword && touched.confirmPassword && (
//   <TextComponent type="mediumText" style={styles.error}>{errors.confirmPassword}</TextComponent>
// )}



//                     {/* OTP Field - always visible */}
//                     <TextInput
//                       style={styles.input}
//                       placeholder={t("signup.otp")}
//                       placeholderTextColor="#9e9b97"
//                       value={values.otp}
//                       onChangeText={handleChange("otp")}
//                       onBlur={handleBlur("otp")}
//                     />
//                     {errors.otp && touched.otp && (
//                       <TextComponent type="mediumText" style={styles.error}>{errors.otp}</TextComponent>
//                     )}

//                     {/* OTP Section */}
//                     {!otpVerified && (
//                       <View style={styles.verifyOtpContainer}>
//                         {!otpSent && (
//                           <LoadingButton
//                             loading={loadingType === "requestOtp"}
//                             text={t("signup.requestOtp")}
//                             onPress={() => {
//                               formikValuesRef.current = values;
//                               handleRecaptchaAndApi("requestOtp");
//                             }}
//                             disabled={!isRequestOtpEnabled(values) || loadingType === "requestOtp"}
//                             style={[
//                               styles.verifyButton,
//                               isRequestOtpEnabled(values)
//                                 ? { backgroundColor: "#CA8A04" }
//                                 : { backgroundColor: "#ccc" },
//                             ]}
//                             textStyle={styles.buttonText}
//                             width={120}
//                           />
//                         )}

//                         {otpSent && (
//                           <View
//                             style={{
//                               flexDirection: "row",
//                               alignItems: "center",
//                               justifyContent: "space-between",
//                             }}
//                           >
//                             {/* Verify OTP */}
//                             <LoadingButton
//                               loading={loadingType === "verifyOtp"}
//                               text={t("signup.verifyOtp")}
//                               onPress={() => {
//                                 formikValuesRef.current = values;
//                                 handleRecaptchaAndApi("verifyOtp");
//                               }}
//                               disabled={!values.otp || loadingType === "verifyOtp"}
//                               style={[
//                                 styles.verifyButton,
//                                 values.otp
//                                   ? { backgroundColor: "#CA8A04" }
//                                   : { backgroundColor: "#ccc" },
//                               ]}
//                               textStyle={styles.buttonText}
//                               width={120}
//                             />

//                             {/* Timer */}
//                             <TextComponent type="headerText" style={{ marginHorizontal: 10 }}>
//                               {timer > 0 ? `${timer}s` : ""}
//                             </TextComponent>

//                             {/* Resend OTP */}
//                             <LoadingButton
//                               loading={loadingType === "resendOtp"}
//                               text={t("signup.resendOtp")}
//                               onPress={() => {
//                                 formikValuesRef.current = values;
//                                 handleRecaptchaAndApi("resendOtp");
//                                 setResendEnabled(false);
//                                 setTimer(60);
//                               }}
//                               disabled={!resendEnabled || loadingType === "resendOtp"}
//                               style={[
//                                 styles.verifyButton,
//                                 resendEnabled
//                                   ? { backgroundColor: "#CA8A04" }
//                                   : { backgroundColor: "#ccc" },
//                               ]}
//                               textStyle={styles.buttonText}
//                               width={120}
//                             />
//                           </View>
//                         )}
//                       </View>
//                     )}

//                     {/* OTP Verified */}
//                     {otpVerified && console.log("💚 Render → OTP Verified text visible on screen")}
//                     {otpVerified && (
//                       <TextComponent type="headerText"
//                         style={{ color: "green", marginVertical: 10 }}
//                       >
//                         OTP Verified
//                       </TextComponent>
//                     )}
// {console.log(
//   "🟨 Signup Button Render:",
//   "otpVerified =", otpVerified,
//   "| signupTimer =", signupTimer,
//   "| loadingType =", loadingType
// )}
//                     {/* Signup Button */}
//                     <LoadingButton
//                       loading={loadingType === "register"}
//                       text={
//                         signupTimer > 0
//                           ? `${t("signup.signUp")} (${signupTimer}s)`
//                           : t("signup.signUp")
//                       }
//                       onPress={() => {
//                         formikValuesRef.current = values;
//                         handleRecaptchaAndApi("register");
//                       }}
//                       disabled={!otpVerified || signupTimer === 0 || loadingType === "register"}
//                       style={[
//                         styles.button,
//                         otpVerified && signupTimer > 0
//                           ? { backgroundColor: "#CA8A04" }
//                           : { backgroundColor: "#ccc" },
//                       ]}
//                       textStyle={styles.buttonText}
//                       width={"100%"}
//                     />

//                     {/* Footer */}
//                     <View style={styles.footerContainer}>
//                       <TextComponent type="headerText" style={styles.footer}>
//                         {t("signup.alreadyMember")}{" "}
//                       </TextComponent>
//                       <TouchableOpacity
//                         onPress={() => navigation.navigate("Login")}
//                       >
//                         <TextComponent style={styles.login}>
//                           {t("signup.loginHere")}
//                         </TextComponent>
//                       </TouchableOpacity>
//                     </View>
//                   </>
//                 );
//               }}
//             </Formik>
//           </View>
//         </ScrollView>
//       </ImageBackground>
//     </SafeAreaView>
//   );
// }