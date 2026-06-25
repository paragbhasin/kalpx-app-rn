import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch } from "react-redux";
import { fetchGuideInviteInfo, acceptGuideInvite } from "../../engine/liveSessionApi";
import { registerDeviceToBackend, resetDeviceRegistrationGuard } from "../../utils/registerDevice";

export default function GuideInviteAcceptScreen({ route, navigation }) {
  const { token } = route.params as { token: string };
  const dispatch = useDispatch();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [loadingInvite, setLoadingInvite] = useState(true);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!token) {
      setInviteError("Invalid invite link.");
      setLoadingInvite(false);
      return;
    }
    fetchGuideInviteInfo(token)
      .then((info) => {
        if (!info.email) {
          setInviteError("This invite link has expired or already been used.");
        } else {
          setInviteEmail(info.email);
        }
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 410) {
          setInviteError("This invite link has expired or already been used.");
        } else {
          setInviteError("This invite link is invalid or has expired.");
        }
      })
      .finally(() => setLoadingInvite(false));
  }, [token]);

  const handleSubmit = async () => {
    setFormError("");
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await acceptGuideInvite(token, password);
      await AsyncStorage.setItem("access_token", data.access_token);
      await AsyncStorage.setItem("refresh_token", data.refresh_token);
      await AsyncStorage.setItem("user_id", `${data.user.id}`);
      await AsyncStorage.setItem("kalpx_is_guide", "1");
      resetDeviceRegistrationGuard();
      await registerDeviceToBackend();
      dispatch({ type: "LOGIN_SUCCESS", payload: data.user });
      navigation.reset({ index: 0, routes: [{ name: "GuideHome" }] });
    } catch (err: any) {
      const d = err?.response?.data;
      setFormError(d?.detail || d?.error || d?.password?.[0] || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInvite) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#c9a84c" />
      </SafeAreaView>
    );
  }

  if (inviteError) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.errorBox}>{inviteError}</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.linkBtn}>
          <Text style={styles.linkText}>Sign in if you already have an account →</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>KalpX</Text>
        <Text style={styles.title}>Leader Portal</Text>
        <Text style={styles.subtitle}>Accept your invitation</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Set your password</Text>

          <View style={styles.emailBadge}>
            <Text style={styles.emailBadgeText}>
              Invite for <Text style={{ fontWeight: "700" }}>{inviteEmail}</Text>
            </Text>
          </View>

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Min. 8 characters"
            placeholderTextColor="#9e9b97"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoFocus
          />

          <Text style={styles.label}>Confirm password</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter your password"
            placeholderTextColor="#9e9b97"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          {!!formError && <Text style={styles.errorText}>{formError}</Text>}

          <TouchableOpacity
            style={[styles.btn, submitting && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}>Create account & sign in</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff2dd" },
  centered: { flex: 1, backgroundColor: "#fff2dd", alignItems: "center", justifyContent: "center", padding: 24 },
  scroll: { padding: 24, paddingTop: 48 },
  brand: { fontSize: 28, fontWeight: "800", color: "#432104", textAlign: "center", marginBottom: 4 },
  title: { fontSize: 20, fontWeight: "700", color: "#432104", textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#8B6F4E", textAlign: "center", marginBottom: 32 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: "700", color: "#432104", marginBottom: 16 },
  emailBadge: {
    backgroundColor: "rgba(201,168,76,0.1)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  emailBadgeText: { fontSize: 14, color: "#432104" },
  label: { fontSize: 13, fontWeight: "600", color: "#432104", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#e0d5c0",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1a1a1a",
    marginBottom: 16,
  },
  errorText: { fontSize: 13, color: "#c0392b", marginBottom: 12 },
  errorBox: {
    fontSize: 14,
    color: "#c0392b",
    textAlign: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  btn: {
    backgroundColor: "#c9a84c",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  linkBtn: { marginTop: 16 },
  linkText: { fontSize: 14, color: "#c9a84c", textDecorationLine: "underline", textAlign: "center" },
});
