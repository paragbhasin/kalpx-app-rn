import { Formik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import LoadingButton from "../../components/LoadingButton";
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

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const recaptchaRef = useRef(null);

  const formikValuesRef = useRef(null);
  const [loginError, setLoginError] = useState(null);
  const [loadingType, setLoadingType] = useState(null); // 'requestOtp' | 'verifyOtp' | 'resendOtp' | 'signUp' | null

  // Request reCAPTCHA + API
  const handleRecaptchaAndApi = (actionType) => {
    setLoginError(null);
    setLoadingType(actionType);
    recaptchaRef.current?.requestNewToken();
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

  // Signup Timer
  useEffect(() => {
    let interval;
    if (otpVerified && signupTimer > 0) {
      interval = setInterval(() => {
        setSignupTimer((prev) => prev - 1);
      }, 1000);
    }
    if (signupTimer === 0 && otpVerified) {
      setOtpVerified(false);
      setOtpSent(false);
      setTimer(0);
      setResendEnabled(false);
    }
    return () => clearInterval(interval);
  }, [otpVerified, signupTimer]);

  // reCAPTCHA callback
  const handleRecaptchaToken = (token) => {
    setLoginError(null);
    const values = formikValuesRef.current;
    const actionType = values.actionType;
    let payload = {};

    if (actionType === "requestOtp" || actionType === "resendOtp") {
      payload = {
        email: values.email,
        recaptcha_token: token,
        recaptcha_action: "request_otp",
        context: "registration",
      };
      dispatch(
        generateOtp(payload, (result) => {
          setLoadingType(null);
          if (result.success) {
            setOtpSent(true);
            setTimer(60);
            setResendEnabled(false);
          } else {
            setLoginError(result.error || "OTP request failed");
          }
        }) as any
      );
    } else if (actionType === "verifyOtp") {
      payload = {
        email: values.email,
        otp: values.otp,
        recaptcha_token: token,
        recaptcha_action: "verify_otp",
      };
      dispatch(
        verifyOtp(payload, (result) => {
          setLoadingType(null);
          if (result.success) {
            setOtpVerified(true);
            setOtpSent(false);
            setSignupTimer(120);
          } else {
            setLoginError(result.error || "OTP verification failed");
          }
        }) as any
      );
    } else if (actionType === "register") {
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
      dispatch(
        signupUser(payload, (result) => {
          setLoadingType(null);
          console.log("Signup Result:", result);
          if (result.success) {
            navigation.navigate("HomePage");
          } else {
            setLoginError(result.error || "Signup failed");
          }
        }) as any
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
          <Text style={styles.brand}>KalpX</Text>
          <Text style={styles.heading}>{t("signup.getStarted")}</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitleLine1}>{t("signup.createYour")}</Text>
            <Text style={styles.cardTitleLine2}>{t("signup.account")}</Text>
            <Text style={styles.subTitle}>{t("signup.connectWith")}</Text>

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
                      style={styles.input}
                      placeholder={t("signup.email")}
                      placeholderTextColor="#9e9b97"
                      value={values.email}
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                    />
                    {errors.email && touched.email && (
                      <Text style={styles.error}>{errors.email}</Text>
                    )}

                    {/* Username */}
                    <TextInput
                      style={styles.input}
                      placeholder={t("signup.username")}
                      placeholderTextColor="#9e9b97"
                      value={values.username}
                      onChangeText={handleChange("username")}
                      onBlur={handleBlur("username")}
                    />
                    {errors.username && touched.username && (
                      <Text style={styles.error}>{errors.username}</Text>
                    )}

                    {/* Password */}
                    <TextInput
                      style={styles.input}
                      placeholder={t("signup.password")}
                      placeholderTextColor="#9e9b97"
                      secureTextEntry
                      value={values.password}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                    />
                    {errors.password && touched.password && (
                      <Text style={styles.error}>{errors.password}</Text>
                    )}

                    {/* Confirm Password */}
                    <TextInput
                      style={styles.input}
                      placeholder={t("signup.confirmPassword")}
                      placeholderTextColor="#9e9b97"
                      secureTextEntry
                      value={values.confirmPassword}
                      onChangeText={handleChange("confirmPassword")}
                      onBlur={handleBlur("confirmPassword")}
                    />
                    {errors.confirmPassword && touched.confirmPassword && (
                      <Text style={styles.error}>{errors.confirmPassword}</Text>
                    )}

                    {/* OTP Field - always visible */}
                    <TextInput
                      style={styles.input}
                      placeholder={t("signup.otp")}
                      placeholderTextColor="#9e9b97"
                      value={values.otp}
                      onChangeText={handleChange("otp")}
                      onBlur={handleBlur("otp")}
                    />
                    {errors.otp && touched.otp && (
                      <Text style={styles.error}>{errors.otp}</Text>
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
                                ? { backgroundColor: "#FFD600" }
                                : { backgroundColor: "#ccc" },
                            ]}
                            textStyle={styles.buttonText}
                            width={120}
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
                                  ? { backgroundColor: "#FFD600" }
                                  : { backgroundColor: "#ccc" },
                              ]}
                              textStyle={styles.buttonText}
                              width={120}
                            />

                            {/* Timer */}
                            <Text style={{ marginHorizontal: 10 }}>
                              {timer > 0 ? `${timer}s` : ""}
                            </Text>

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
                                  ? { backgroundColor: "#FFD600" }
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
                    {otpVerified && (
                      <Text
                        style={{ color: "green", marginVertical: 10 }}
                      >
                        OTP Verified
                      </Text>
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
                          ? { backgroundColor: "#FFD600" }
                          : { backgroundColor: "#ccc" },
                      ]}
                      textStyle={styles.buttonText}
                      width={"100%"}
                    />

                    {/* Footer */}
                    <View style={styles.footerContainer}>
                      <Text style={styles.footer}>
                        {t("signup.alreadyMember")}{" "}
                      </Text>
                      <TouchableOpacity
                        onPress={() => navigation.navigate("Login")}
                      >
                        <Text style={styles.login}>
                          {t("signup.loginHere")}
                        </Text>
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