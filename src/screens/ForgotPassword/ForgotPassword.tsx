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
  View
} from "react-native";
import { useDispatch } from 'react-redux';
import * as Yup from "yup";
import LoadingButton from "../../components/LoadingButton";
import ReCaptchaRuntime from "../Login/ReCaptchaRuntime";
import { generateOtp } from "../Signup/actions";
import styles from './styles';

const screenWidth = Dimensions.get("window").width;

export default function ForgotPassword({ navigation }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // ✅ Validation with i18n error messages
  const LoginSchema = Yup.object().shape({
     username: Yup.string().required(t("login.errors.usernameRequired")),
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
    console.log("reCAPTCHA token:", token);
    const credentials = {
      email : formikValuesRef.current.username,
      recaptcha_token: token,
    context:"password_reset"
    };
    dispatch(generateOtp(credentials, (result) => {
      setLoading(false);
      if (result && result.success) {
    //       navigation.navigate("VerificationScreen", {
    //   email: formikValuesRef.current.username, // pass email here
    // });
      navigation.navigate("SetNewPasswordScreen", {
      email: formikValuesRef.current.username, // pass email here
    });
      } else {
        setLoginError(result?.error || "Login failed");
      }
    }) as any);
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
                {t("forgotPassword.forgotPassword")}
              </Text>
              <Formik
                initialValues={{ username: "" }}
                validationSchema={LoginSchema}
                onSubmit={(values) => {
                  console.log("Login Data:", values);
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
                    <Text style={styles.subTitle}>{t("forgotPassword.enterEmail")}</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Example@gmail.com"
                      placeholderTextColor="#9e9b97"
                      value={values.username}
                      onChangeText={handleChange("username")}
                      onBlur={handleBlur("username")}
                    />
                    {errors.username && touched.username && (
                      <Text style={styles.error}>{errors.username}</Text>
                    )}
                    {loginError && (
                      <Text style={styles.error}>{loginError}</Text>
                    )}
                 <ReCaptchaRuntime ref={recaptchaRef} onToken={handleRecaptchaToken} />
                    <LoadingButton
                      loading={loading}
                      text={t("forgotPassword.send")}
                      onPress={handleSubmit}
                      disabled={loading}
                      style={styles.button}
                      textStyle={styles.buttonText}
                    />
                     <View style={{ flexDirection: "row", alignSelf: "center", marginTop: 10 }}>
                          <Text style={{ ...styles.subTitle, color: "#707070" }}>
                            {t("forgotPassword.backTo")}
                          </Text>
                          <TouchableOpacity   onPress={() => navigation.navigate("Login")}>
                          <Text style={{ ...styles.subTitle, color: "#CA8A04" }}>
                            {t("forgotPassword.login")}
                          </Text>
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


