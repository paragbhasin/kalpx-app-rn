import AsyncStorage from "@react-native-async-storage/async-storage";
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
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import uuid from "react-native-uuid";
import { useDispatch } from 'react-redux';
import * as Yup from "yup";
import { loginUser } from './actions';
import ReCaptchaRuntime from "./ReCaptchaRuntime";
import styles from './styles';

const screenWidth = Dimensions.get("window").width;

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const [otpSent, setOtpSent] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [initialEmail, setInitialEmail] = useState("");
  const [initialPassword, setInitialPassword] = useState("");
  const dispatch = useDispatch();
  // Fetch credentials from AsyncStorage on mount
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

  // ✅ Validation with i18n error messages
  const LoginSchema = Yup.object().shape({
    username: Yup.string().required(t("login.errors.usernameRequired")),
    password: Yup.string()
      .min(6, t("login.errors.passwordMin"))
      .required(t("login.errors.passwordRequired")),
  });

  const recaptchaRef = useRef(null);

  // Store Formik values temporarily
  const formikValuesRef = useRef(null);

  // Called when reCAPTCHA returns a token
  const [loginError, setLoginError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRecaptchaToken = (token) => {
    setLoading(true);
    setLoginError(null);
    const credentials = {
      email: formikValuesRef.current.username,
      password: formikValuesRef.current.password,
      recaptcha_token: token,
      recaptcha_action: "login"
    };
    dispatch(loginUser(credentials, async (result) => {
      setLoading(false);
      if (result && result.success) {
        if (keepLoggedIn) {
          await AsyncStorage.setItem("userEmail", credentials.email);
          await AsyncStorage.setItem("userPassword", credentials.password);
        } else {
          await AsyncStorage.removeItem("userEmail");
          await AsyncStorage.removeItem("userPassword");
        }
        navigation.navigate("HomePage");
      } else {
        setLoginError(result?.error || "Login failed");
      }
    }) as any);
  };

  const handleSendOtp = (username) => {
    if (username) {
      // console.log("OTP sent to:", username);
      setOtpSent(true);
    } else {
      console.log("Please enter username/email first!");
    }
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

            {/* Google Login Button */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={async () => {
                try {
                  let userId = await AsyncStorage.getItem("userId");
            
                  if (!userId) {
                    userId = uuid.v4();
                    await AsyncStorage.setItem("uuid", userId);
                    // console.log("New UUID stored:", userId);
                  } else {
                    console.log("Existing UUID:", userId);
                  }
            
                  navigation.navigate("HomePage");
                } catch (error) {
                  console.error("Error handling UUID:", error);
                }
              }}
            >
              <Image
                source={require("../../../assets/devicon_google.png")}
                style={styles.googleIcon}
              />
              <Text style={styles.googleText}>{t("login.google")}</Text>
            </TouchableOpacity>

            <View style={styles.card}>
              <Text style={styles.cardTitleLine1}>
                {t("login.cardTitleLine1")}
              </Text>
              <Text style={styles.cardTitleLine2}>
                {t("login.cardTitleLine2")}
              </Text>
              <Text style={styles.subTitle}>{t("login.subTitle")}</Text>

              <Formik
                enableReinitialize
                initialValues={{ username: initialEmail, password: initialPassword }}
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
                 <ReCaptchaRuntime ref={recaptchaRef} onToken={handleRecaptchaToken} />
                    <TextInput
                      style={styles.input}
                      placeholder={t("login.username")}
                      placeholderTextColor="#9e9b97"
                      value={values.username}
                      onChangeText={handleChange("username")}
                      onBlur={handleBlur("username")}
                    />
                    {errors.username && touched.username && (
                      <Text style={styles.error}>{errors.username}</Text>
                    )}

                    {otpSent && (
                      <Text style={styles.success}>{t("login.otpSent")}</Text>
                    )}

                    <TextInput
                      style={styles.input}
                      placeholder={t("login.password")}
                      placeholderTextColor="#9e9b97"
                      secureTextEntry
                      value={values.password}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                    />
                    {errors.password && touched.password && (
                      <Text style={styles.error}>{errors.password}</Text>
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
                            <Text style={styles.checkmark}>✓</Text>
                          )}
                        </View>
                        <Text style={styles.checkboxLabel}>
                          {t("login.keepLoggedIn")}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
                        <Text style={styles.forgot}>
                          {t("login.forgotPassword")}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {loginError && (
                      <Text style={styles.error}>{loginError}</Text>
                    )}
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => handleSubmit()}
                      disabled={loading}
                    >
                      <Text style={styles.buttonText}>
                        {loading ? t("login.loggingIn") : t("login.loginBtn")}
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.footerContainer}>
                      <Text style={styles.footer}>{t("login.footer")} </Text>
                      <TouchableOpacity
                        onPress={() => navigation.navigate("Signup")}
                      >
                        <Text style={styles.login}>{t("login.register")}</Text>
                      </TouchableOpacity>
                    </View>
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