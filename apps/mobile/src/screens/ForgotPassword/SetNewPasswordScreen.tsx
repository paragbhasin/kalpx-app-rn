// VerificationScreen.tsx
import { Formik } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from "react-native-confirmation-code-field";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import LoadingButton from "../../components/LoadingButton";
import TextComponent from "../../components/TextComponent";
import ReCaptchaRuntime from "../Login/ReCaptchaRuntime";
import { generateOtp, verifyOtp } from "../Signup/actions"; // ensure path is correct
import styles from "./styles";

const screenWidth = Dimensions.get("window").width;
const CELL_COUNT = 4;

export default function SetNewPasswordScreen({ navigation, route }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const email = route?.params?.email || "";

  // Validation schema (includes code validation)
  const Schema = Yup.object().shape({
    code: Yup.string()
      .matches(/^\d{4}$/, t("forgotPassword.codeRequired"))
      .required(t("forgotPassword.codeRequired")),
  });

  const recaptchaRef = useRef(null);
  const formikRef = useRef(null);

  const [loginError, setLoginError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Resend cooldown timer
  const [timer, setTimer] = useState(0);
  useEffect(() => {
    let id: any = null;
    if (timer > 0) {
      id = setInterval(() => setTimer((s) => s - 1), 1000);
    }
    return () => clearInterval(id);
  }, [timer]);

  // This handler receives token from ReCaptchaRuntime.
  // We rely on `action` param when ReCaptchaRuntime provides it, otherwise we fallback to pendingAction state.
  const pendingActionRef = useRef<"reset"|"resend"|null>(null);

  const handleRecaptchaToken = (token: string, actionFromRecaptcha?: string) => {
    const action = (actionFromRecaptcha as any) || pendingActionRef.current;

    if (!action) {
      console.warn("No pending action for reCAPTCHA token");
      return;
    }

    if (action === "resend") {
      // Resend OTP flow
      setResendLoading(true);
      const payload = {
        email,
        recaptcha_token: token,
        context: "password_reset",
      };
      dispatch(generateOtp(payload, (result) => {
        setResendLoading(false);
        if (result && result.success) {
          // start cooldown
          setTimer(60);
        } else {
          setLoginError(result?.error || "Failed to resend OTP");
        }
        pendingActionRef.current = null;
      }) as any);
      return;
    }

    if (action === "reset") {
      // Reset password flow
      setLoading(true);
      const values = formikRef.current?.values || {};
      const payload = {
            email: route?.params?.email,
        otp: values.code,
        recaptcha_token: token,
        recaptcha_action: "verify_otp",
      };

      dispatch(verifyOtp(payload, (result) => {
        setLoading(false);
        if (result && result.success) {
          // success -> reset form + go to login
          formikRef.current?.resetForm();
           navigation.navigate("VerificationScreen", {
      email: route?.params?.email,
       OTP:values.code
    });
        } else {
          setLoginError(result?.error || "Reset failed");
        }
        pendingActionRef.current = null;
      }) as any);

      return;
    }
  };

  const startResendFlow = () => {
    if (timer > 0) return;
    pendingActionRef.current = "resend";
    // request token; presumes ReCaptchaRuntime's requestNewToken accepts optional action arg
    recaptchaRef.current?.requestNewToken?.("resend");
  };

  const startResetFlow = (resetForm: any) => {
    pendingActionRef.current = "reset";
    recaptchaRef.current?.requestNewToken?.("reset");
    // resetForm will be used after success in token handler via formikRef.resetForm()
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff2dd" translucent={false} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
        <ImageBackground source={require("../../../assets/hoomepagebg.jpg")} style={styles.background}>
          <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                        <TextComponent type="headerBigText"  style={styles.brand}>{t("login.brand")}</TextComponent>
            <TextComponent type="headerIncreaseText" style={styles.heading}>{t("login.heading")}</TextComponent>
            <View style={{...styles.card,height:"75%",}}>
<TextComponent type="loginHeaderText" style={styles.cardTitleLine1}>Verification</TextComponent>
              <Formik
                innerRef={formikRef}
                initialValues={{ code: "", password1: "", password2: "" }}
                validationSchema={Schema}
                onSubmit={(_values, formikHelpers) => {
                  // Keep resetForm available via formikRef; actual submit happens after recaptcha token
                  setLoginError(null);
                  pendingActionRef.current = "reset";
                  recaptchaRef.current?.requestNewToken?.("reset");
                }}
              >
                {({ handleSubmit, values, setFieldValue, errors, touched, handleChange, handleBlur, isValid }) => {
                  const ref = useBlurOnFulfill({ value: values.code, cellCount: CELL_COUNT });
                  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
                    value: values.code,
                    setValue: (val: string) => setFieldValue("code", val),
                  });

                  return (
                    <View style={{ flex: 1 }}>
                       <TextComponent type="headerText" style={{...styles.subTitle,marginBottom:15}}>{t("forgotPassword.enterVerificationCode")}</TextComponent>

                      {/* OTP CodeField */}
                      <CodeField
                        ref={ref}
                        {...props}
                        value={values.code}
                        onChangeText={(val) => setFieldValue("code", val)}
                        cellCount={CELL_COUNT}
                        rootStyle={otpStyles.codeFieldRoot}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        renderCell={({ index, symbol, isFocused }) => (
                          <View key={index} style={[otpStyles.cell, isFocused && otpStyles.focusCell]} onLayout={getCellOnLayoutHandler(index)}>
                             <TextComponent type="headerText" style={otpStyles.cellText}>
                              {symbol || (isFocused ? <Cursor /> : null)}
                            </TextComponent>
                          </View>
                        )}
                      />

                      {errors.code && touched.code && <TextComponent type="mediumText" style={styles.error}>{errors.code}</TextComponent>}
                      {loginError && <TextComponent type="mediumText" style={styles.error}>{loginError}</TextComponent>}

                      {/* Resend OTP */}
                      <TouchableOpacity disabled={timer > 0 || resendLoading} onPress={startResendFlow} style={{ alignSelf: "center",marginTop:15 }}>
                        <TextComponent type="cardText" style={{ ...styles.subTitle, color: timer > 0 ? "#aaa" : "#CA8A04", marginTop: 10 }}>
                           <TextComponent type="cardText" style={{ ...styles.subTitle, color: "#707070" }}>{t("forgotPassword.codeText")}</TextComponent>{timer > 0 ? `${t("forgotPassword.resend")} in ${timer}s` : t("forgotPassword.resend")}
                        </TextComponent>
                      </TouchableOpacity>
                      {/* ReCaptcha runtime — it will call handleRecaptchaToken(token, action) */}
                      <ReCaptchaRuntime ref={recaptchaRef} onToken={(token: string, action?: string) => handleRecaptchaToken(token, action)} />

                      {/* Submit using your LoadingButton */}
                      <LoadingButton
                        loading={loading}
                        text={t("forgotPassword.verify")}
                        onPress={handleSubmit}
                        disabled={!isValid || loading}
                        style={styles.button}
                        textStyle={styles.buttonText}
                      />
                    </View>
                  );
                }}
              </Formik>
            </View>
          </ScrollView>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const otpStyles = StyleSheet.create({
  codeFieldRoot: {
    marginVertical: 10,
    justifyContent: "flex-start",
  },
  cell: {
    width: 40,
    height: 40,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    backgroundColor: "transparent",
  },
  cellText: {
    fontSize: 20,
    color: "#000",
    textAlign: "center",
  },
  focusCell: {
    borderColor: "#CA8A04",
  },
});
