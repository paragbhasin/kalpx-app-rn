import { Formik } from "formik";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Dimensions,
    ImageBackground,
    KeyboardAvoidingView,
    Platform,
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
import ReCaptchaRuntime from "../Login/ReCaptchaRuntime";
import styles from "./styles";

const screenWidth = Dimensions.get("window").width;

export default function SetNewPasswordScreen({ navigation }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // ✅ Validation schema
  const PasswordSchema = Yup.object().shape({
    password1: Yup.string()
      .min(6, t("forgotPassword.passwordMin"))
      .required(t("forgotPassword.passwordRequired")),
    password2: Yup.string()
      .oneOf([Yup.ref("password1"), null], t("forgotPassword.passwordsMustMatch"))
      .required(t("forgotPassword.confirmPasswordRequired")),
  });

  const recaptchaRef = useRef(null);
  const formikRef = useRef(null);

  const [loginError, setLoginError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRecaptchaToken = (token) => {
    setLoading(true);
    setLoginError(null);
    console.log("reCAPTCHA token:", token);

    const credentials = {
      password: formikRef.current.values.password1,
      confirm_password: formikRef.current.values.password2,
      recaptcha_token: token,
      recaptcha_action: "set_new_password",
    };

    console.log("Final payload:", credentials);

    // Example API call
    // dispatch(setNewPassword(credentials, (result) => {
    //   setLoading(false);
    //   if (result && result.success) {
    //     formikRef.current.resetForm(); // ✅ clear both fields after success
    //     navigation.navigate("Login");
    //   } else {
    //     setLoginError(result?.error || "Password reset failed");
    //   }
    // }) as any);

    // For demo: clear form after "submit"
    setTimeout(() => {
      setLoading(false);
      formikRef.current?.resetForm();
    }, 1500);
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
            <Text style={styles.brand}>{t("login.brand")}</Text>
            <Text style={styles.heading}>{t("login.heading")}</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitleLine1}>
                {t("forgotPassword.newPassword")}
              </Text>
              <Formik
                innerRef={formikRef}
                initialValues={{ password1: "", password2: "" }}
                validationSchema={PasswordSchema}
                onSubmit={() => {
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
                    <Text style={styles.subTitle}>
                      {t("forgotPassword.enterNewPassword")}
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder={t("forgotPassword.enterNewPassword")}
                      placeholderTextColor="#9e9b97"
                      value={values.password1}
                      onChangeText={handleChange("password1")}
                      onBlur={handleBlur("password1")}
                      secureTextEntry
                    />
                    {errors.password1 && touched.password1 && (
                      <Text style={styles.error}>{errors.password1}</Text>
                    )}

                    <Text style={styles.subTitle}>
                      {t("forgotPassword.confirmPassword")}
                    </Text>
                    <TextInput
                      style={styles.input}
                      placeholder={t("forgotPassword.enterPassword")}
                      placeholderTextColor="#9e9b97"
                      value={values.password2}
                      onChangeText={handleChange("password2")}
                      onBlur={handleBlur("password2")}
                      secureTextEntry
                    />
                    {errors.password2 && touched.password2 && (
                      <Text style={styles.error}>{errors.password2}</Text>
                    )}

                    {loginError && (
                      <Text style={styles.error}>{loginError}</Text>
                    )}

                    <ReCaptchaRuntime
                      ref={recaptchaRef}
                      onToken={handleRecaptchaToken}
                    />

                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => handleSubmit()}
                      disabled={loading}
                    >
                      <Text style={styles.buttonText}>
                        {loading ? t("login.loggingIn") : t("login.loginBtn")}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </Formik>
            </View>
          </ScrollView>
        </ImageBackground>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
