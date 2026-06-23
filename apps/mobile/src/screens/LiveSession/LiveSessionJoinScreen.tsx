/**
 * LiveSessionJoinScreen — TLP Phase 1.
 *
 * Displays session info and a "Join on [Platform]" CTA.
 * Opens the external_join_url via WebBrowser.openBrowserAsync (NEVER embedded).
 * No time-gating: button is always enabled.
 *
 * SECURITY: No in-app video player, no WebRTC, no native streaming.
 */
import { useNavigation, useRoute } from "@react-navigation/native";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Fonts } from "../../theme/fonts";
import { recordJoinClick } from "../../engine/liveSessionApi";

function formatScheduledAt(iso: string): string {
  try {
    const d = new Date(iso);
    const dayName = d.toLocaleDateString("en-GB", { weekday: "long" });
    const day = d.getDate();
    const month = d.toLocaleDateString("en-GB", { month: "long" });
    const year = d.getFullYear();
    const time = d
      .toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true })
      .toUpperCase();
    return `${dayName}, ${day} ${month} ${year} · ${time}`;
  } catch {
    return iso;
  }
}

function platformLabel(platform: string): string {
  switch (platform.toLowerCase()) {
    case "zoom":
      return "Zoom";
    case "google_meet":
    case "google meet":
      return "Google Meet";
    case "youtube_live":
    case "youtube live":
      return "YouTube Live";
    case "teams":
    case "ms_teams":
      return "Microsoft Teams";
    default:
      return platform.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

export default function LiveSessionJoinScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { sessionCode, title, scheduledAt, externalPlatform, externalJoinUrl } =
    route.params ?? {};

  const platLabel = platformLabel(externalPlatform ?? "");

  const handleJoin = async () => {
    // Fire-and-forget join click tracking
    recordJoinClick(sessionCode).catch(() => {});
    try {
      await WebBrowser.openBrowserAsync(externalJoinUrl);
    } catch {
      Linking.openURL(externalJoinUrl).catch(() => {
        Alert.alert("Could not open session link", "Please try again.");
      });
    }
  };

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

        {/* Session info */}
        <Text style={styles.sessionTitle}>{title}</Text>
        <Text style={styles.scheduledAt}>{formatScheduledAt(scheduledAt)}</Text>

        {/* Platform badge */}
        <View style={styles.platformBadgeWrap}>
          <View style={styles.platformBadge}>
            <Text style={styles.platformBadgeText}>{platLabel}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Join CTA */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleJoin}
          style={styles.joinBtn}
          accessibilityLabel={`Join on ${platLabel}`}
        >
          <Text style={styles.joinBtnText}>Join on {platLabel} →</Text>
        </TouchableOpacity>

        <Text style={styles.noteText}>
          Note: This will open {platLabel} in your browser.
        </Text>

        {/* Reflect link */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("LiveSessionReflect", { sessionCode })
          }
          style={styles.reflectLink}
          accessibilityLabel="Reflect after your session"
        >
          <Text style={styles.reflectLinkText}>Reflect after your session →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FAF7F2" },
  scroll: { paddingBottom: 60, paddingHorizontal: 24 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingBottom: 12,
  },
  backIcon: { width: 40, alignItems: "flex-start" },
  backIconText: { fontSize: 32, color: "#432104", lineHeight: 36 },

  sessionTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 24,
    color: "#432104",
    marginBottom: 8,
    lineHeight: 30,
  },
  scheduledAt: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: "#7B6545",
    marginBottom: 20,
  },

  platformBadgeWrap: {
    flexDirection: "row",
    marginBottom: 24,
  },
  platformBadge: {
    backgroundColor: "#F0EAD8",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  platformBadgeText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 13,
    color: "#432104",
  },

  divider: {
    height: 1,
    backgroundColor: "#E8D9B5",
    marginBottom: 28,
  },

  joinBtn: {
    backgroundColor: "#C99317",
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#C99317",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  joinBtnText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 17,
    color: "#fff",
  },

  noteText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: "#9A7548",
    textAlign: "center",
    marginBottom: 32,
  },

  reflectLink: {
    alignItems: "center",
    paddingVertical: 12,
  },
  reflectLinkText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: "#C99317",
    textDecorationLine: "underline",
  },
});
