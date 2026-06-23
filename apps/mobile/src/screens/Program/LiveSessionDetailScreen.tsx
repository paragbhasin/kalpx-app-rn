/**
 * LiveSessionDetailScreen — TLP Phase 1.
 *
 * Shows full session detail from GET /api/live-sessions/{code}/.
 * Handles 5 status states: draft/submitted, approved/scheduled, live,
 * completed, cancelled.
 *
 * "Join" → recordJoinClick (fire-and-forget) → WebBrowser.openAsync.
 * NO video embed, NO native streaming, NO media permissions.
 */
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Fonts } from "../../theme/fonts";
import {
  fetchLiveSessionDetail,
  recordJoinClick,
  registerForSession,
  type TLPLiveSessionDetail,
} from "../../engine/liveSessionApi";

const SESSION_TYPE_LABELS: Record<string, string> = {
  jaap: "Jaap",
  dhyaan: "Dhyaan",
  satsang: "Satsang",
  gita_class: "Gita Class",
  yoga: "Yoga",
};

const PLATFORM_LABELS: Record<string, string> = {
  zoom: "Zoom",
  google_meet: "Google Meet",
  youtube_live: "YouTube Live",
  instagram_live: "Instagram Live",
  whatsapp: "WhatsApp",
  other: "External Link",
};

const REMINDER_OPTIONS: Array<{ value: "all" | "day_of" | "none"; label: string }> = [
  { value: "all", label: "All reminders" },
  { value: "day_of", label: "Day of only" },
  { value: "none", label: "No reminders" },
];

function formatScheduledAt(iso: string, timezone: string): string {
  try {
    const d = new Date(iso);
    const dayName = d.toLocaleDateString("en-GB", { weekday: "long" });
    const day = d.getDate();
    const month = d.toLocaleDateString("en-GB", { month: "long" });
    const year = d.getFullYear();
    const time = d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();
    return `${dayName}, ${day} ${month} ${year} · ${time} (${timezone})`;
  } catch {
    return iso;
  }
}

export default function LiveSessionDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { code } = route.params ?? {};

  const [session, setSession] = useState<TLPLiveSessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Registration state
  const [registered, setRegistered] = useState(false);
  const [reminderPref, setReminderPref] = useState<"all" | "day_of" | "none">("all");
  const [registering, setRegistering] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          setLoading(true);
          const data = await fetchLiveSessionDetail(code);
          if (!cancelled) {
            setSession(data);
            setRegistered(data.is_user_registered || false);
          }
        } catch (err: any) {
          if (cancelled) return;
          const status = err?.response?.status;
          if (status === 404) setError("Session not found.");
          else setError("Couldn't load session details. Please try again.");
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }, [code]),
  );

  const handleRegister = async () => {
    if (!session) return;
    try {
      setRegistering(true);
      const result = await registerForSession(session.code, reminderPref);
      if (result.ok || result.already_registered) {
        setRegistered(true);
      }
    } catch {
      Alert.alert("Registration failed", "Please try again or contact support.");
    } finally {
      setRegistering(false);
    }
  };

  const handleJoin = async () => {
    if (!session) return;
    // Fire-and-forget join click tracking
    recordJoinClick(session.code).catch(() => {});
    try {
      await WebBrowser.openBrowserAsync(session.external_join_url);
    } catch {
      // Fallback to Linking if WebBrowser fails
      Linking.openURL(session.external_join_url).catch(() => {
        Alert.alert("Could not open session link", "Please try again.");
      });
    }
  };

  const handleWatchRecording = async () => {
    if (!session?.recording_url) return;
    try {
      await WebBrowser.openBrowserAsync(session.recording_url);
    } catch {
      Linking.openURL(session.recording_url).catch(() => {});
    }
  };

  const handleSupport = () => {
    if (!session?.support_contact_url) return;
    Alert.alert(
      "Need help?",
      "Open our support page for assistance with this session.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Get Support",
          onPress: () => Linking.openURL(session.support_contact_url).catch(() => {}),
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#C99317" />
      </SafeAreaView>
    );
  }

  if (error || !session) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error ?? "Something went wrong."}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const typeLabel =
    SESSION_TYPE_LABELS[session.session_type] ??
    session.session_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const isPending = session.status === "draft" || session.status === "submitted";
  const isRegisterable = session.status === "approved" || session.status === "scheduled";
  const isLive = session.status === "live";
  const isCompleted = session.status === "completed";
  const isCancelled = session.status === "cancelled";

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
            <Text style={styles.backIconText}>‹</Text>
          </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>

        {/* Session type label */}
        <Text style={styles.typeLabel}>{typeLabel.toUpperCase()}</Text>

        {/* Title */}
        <Text style={styles.title}>{session.title}</Text>

        {/* Guide */}
        <View style={styles.guideCard}>
          <View style={styles.guideRow}>
            {session.guide_photo_url ? (
              <Image source={{ uri: session.guide_photo_url }} style={styles.guidePhoto} />
            ) : (
              <View style={styles.guideAvatarFallback}>
                <Text style={styles.guideAvatarInitial}>
                  {session.guide_name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.guideTextBlock}>
              <Text style={styles.guideName}>{session.guide_name}</Text>
              {session.guide_bio ? (
                <Text style={styles.guideBio}>{session.guide_bio}</Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* Meta info */}
        <View style={styles.metaCard}>
          <MetaRow label="When" value={formatScheduledAt(session.scheduled_at, session.timezone)} />
          <MetaRow label="Duration" value={`${session.duration_minutes} minutes`} />
          <MetaRow label="Language" value={session.language} />
          <MetaRow label="Platform" value={PLATFORM_LABELS[session.external_platform] || session.external_platform} />
          {session.recurrence_type && session.recurrence_type !== "none" ? (
            <MetaRow
              label="Recurrence"
              value={session.recurrence_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            />
          ) : null}
          {session.capacity ? (
            <MetaRow label="Capacity" value={`${session.capacity} seats`} />
          ) : null}
        </View>

        {/* Description */}
        {session.description ? (
          <View style={styles.descriptionCard}>
            <Text style={styles.sectionLabel}>ABOUT THIS SESSION</Text>
            <Text style={styles.descriptionText}>{session.description}</Text>
          </View>
        ) : null}

        {/* Status-based CTA */}
        {isPending ? (
          <View style={styles.pendingBanner}>
            <Text style={styles.pendingText}>Session pending approval</Text>
          </View>
        ) : null}

        {isRegisterable && session.registration_enabled ? (
          registered ? (
            <View style={styles.registeredBlock}>
              <View style={styles.registeredBanner}>
                <Text style={styles.registeredText}>Registered ✓</Text>
              </View>
              <Text style={styles.reminderTitle}>Reminder preference</Text>
              <View style={styles.reminderOptions}>
                {REMINDER_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.reminderBtn,
                      reminderPref === opt.value && styles.reminderBtnActive,
                    ]}
                    onPress={async () => {
                      setReminderPref(opt.value);
                      registerForSession(session.code, opt.value).catch(() => {});
                    }}
                    accessibilityLabel={opt.label}
                  >
                    <Text
                      style={[
                        styles.reminderBtnText,
                        reminderPref === opt.value && styles.reminderBtnTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleRegister}
              disabled={registering}
              style={styles.registerBtn}
              accessibilityLabel="Register for this session"
            >
              {registering ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.registerBtnText}>Register →</Text>
              )}
            </TouchableOpacity>
          )
        ) : null}

        {isLive ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleJoin}
            style={styles.joinBtn}
            accessibilityLabel="Join live session"
          >
            <Text style={styles.joinBtnText}>Join Session →</Text>
          </TouchableOpacity>
        ) : null}

        {isCompleted ? (
          <View style={styles.completedBlock}>
            <View style={styles.completedBanner}>
              <Text style={styles.completedText}>Session complete</Text>
            </View>
            {session.recording_url ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleWatchRecording}
                style={styles.recordingBtn}
                accessibilityLabel="Watch session recording"
              >
                <Text style={styles.recordingBtnText}>Watch Recording →</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {isCancelled ? (
          <View style={styles.cancelledBanner}>
            <Text style={styles.cancelledText}>This session has been cancelled</Text>
          </View>
        ) : null}

        {/* Support link */}
        {session.support_contact_url ? (
          <TouchableOpacity
            style={styles.supportLink}
            onPress={handleSupport}
            accessibilityLabel="Get support for this session"
          >
            <Text style={styles.supportLinkText}>Need help? Get support →</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={metaStyles.row}>
      <Text style={metaStyles.label}>{label}</Text>
      <Text style={metaStyles.value}>{value}</Text>
    </View>
  );
}

const metaStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E8D9B5",
  },
  label: {
    fontFamily: Fonts.sans.medium,
    fontSize: 12,
    color: "#9A7548",
    width: 90,
  },
  value: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#432104",
    flex: 1,
  },
});

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FAF7F2" },
  center: { flex: 1, backgroundColor: "#FAF7F2", justifyContent: "center", alignItems: "center", padding: 24 },
  scroll: { paddingBottom: 60, paddingHorizontal: 20 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingBottom: 12,
  },
  backIcon: { width: 40, alignItems: "flex-start" },
  backIconText: { fontSize: 32, color: "#432104", lineHeight: 36 },

  typeLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    color: "#9A7548",
    letterSpacing: 0.06,
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.serif.bold,
    fontSize: 26,
    color: "#432104",
    marginBottom: 16,
    lineHeight: 32,
  },

  guideCard: {
    backgroundColor: "#FFF8EE",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    padding: 16,
    marginBottom: 16,
  },
  guideRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  guidePhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  guideAvatarFallback: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#7B6545",
    alignItems: "center",
    justifyContent: "center",
  },
  guideAvatarInitial: {
    color: "#FAF7F2",
    fontSize: 24,
    fontWeight: "600",
  },
  guideTextBlock: {
    flex: 1,
  },
  guideName: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 15,
    color: "#432104",
    marginBottom: 6,
  },
  guideBio: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#7B6545",
    lineHeight: 20,
  },

  metaCard: {
    backgroundColor: "#FFF8EE",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 4,
    marginBottom: 16,
  },

  descriptionCard: {
    backgroundColor: "#FFF8EE",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    padding: 16,
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 10,
    color: "#9A7548",
    letterSpacing: 0.06,
    marginBottom: 8,
  },
  descriptionText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#432104",
    lineHeight: 21,
  },

  // Pending
  pendingBanner: {
    backgroundColor: "#F0EAD8",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  pendingText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: "#9A7548",
  },

  // Register
  registerBtn: {
    backgroundColor: "#432104",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 16,
  },
  registerBtnText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 16,
    color: "#fff",
  },

  // Registered
  registeredBlock: { marginBottom: 20 },
  registeredBanner: {
    backgroundColor: "#F0EAD8",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#C99317",
  },
  registeredText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 15,
    color: "#432104",
  },
  reminderTitle: {
    fontFamily: Fonts.sans.medium,
    fontSize: 12,
    color: "#9A7548",
    marginBottom: 10,
    textAlign: "center",
  },
  reminderOptions: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  reminderBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#FFF8EE",
  },
  reminderBtnActive: {
    borderColor: "#C99317",
    backgroundColor: "#FFF8EE",
  },
  reminderBtnText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    color: "#9A7548",
  },
  reminderBtnTextActive: {
    color: "#432104",
    fontFamily: Fonts.sans.semiBold,
  },

  // Live / Join
  joinBtn: {
    backgroundColor: "#C99317",
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#C99317",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  joinBtnText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 18,
    color: "#fff",
  },

  // Completed
  completedBlock: { marginBottom: 20 },
  completedBanner: {
    backgroundColor: "#F0EAD8",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  completedText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: "#7B6545",
  },
  recordingBtn: {
    borderWidth: 1,
    borderColor: "#432104",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  recordingBtnText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 15,
    color: "#432104",
  },

  // Cancelled
  cancelledBanner: {
    backgroundColor: "#FDE8E8",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F0BABA",
  },
  cancelledText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: "#B04040",
  },

  // Support
  supportLink: { alignItems: "center", paddingVertical: 12 },
  supportLinkText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 13,
    color: "#9A7548",
    textDecorationLine: "underline",
  },

  errorText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: "#432104",
    textAlign: "center",
    marginBottom: 20,
  },
  backBtn: { paddingVertical: 12, paddingHorizontal: 24 },
  backBtnText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 15,
    color: "#C99317",
  },
});
