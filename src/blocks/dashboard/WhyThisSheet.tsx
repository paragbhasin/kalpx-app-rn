/**
 * WhyThisSheet — bottom sheet that reveals the L2 / L3 "why this"
 * explanation for a single triad item.
 *
 * Flow:
 *   1. User taps a chip on WhyThisL1Strip → opens this sheet
 *   2. Sheet resolves M36_why_this_l2 on mount and shows the L2 body
 *   3. "Go deeper" CTA resolves M37_why_this_l3 and swaps body to L3
 *      (L3 is where explicit source naming lives — Gita / Yoga Sutras /
 *      Sankhya etc. per SOURCE_VISIBILITY_POLICY_V1 §2)
 *
 * Sovereignty: NO English fallbacks for the body. If the resolver
 * returns null the sheet shows the chip's label as a minimal title and
 * leaves the body empty (per CONTENT_CONTRACT_V1 §2).
 */

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  mitraResolveMoment,
  type MomentContextShape,
  type MomentPayloadShape,
} from "../../engine/mitraApi";
import { Colors } from "../../theme/colors";
import { Fonts } from "../../theme/fonts";

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Chip label from WhyThisL1Strip — used as the sheet title. */
  triggerLabel: string;
  /** Triad item type, informs ctx + the "why this sankalp/mantra/practice" framing. */
  itemType: "mantra" | "sankalp" | "practice" | string;
  /** Caller's screenData — used to build the resolver ctx. */
  screenData?: Record<string, any>;
};

const L2_MOMENT_ID = "M36_why_this_l2";
const L3_MOMENT_ID = "M37_why_this_l3";

const buildCtx = (
  sd: Record<string, any>,
  itemType: string,
): MomentContextShape => {
  const path =
    sd.journey_path === "support" || sd.journey_path === "growth"
      ? (sd.journey_path as "support" | "growth")
      : "support";
  const guidance_mode =
    sd.guidance_mode === "universal" ||
    sd.guidance_mode === "hybrid" ||
    sd.guidance_mode === "rooted"
      ? sd.guidance_mode
      : "hybrid";
  return {
    path,
    guidance_mode,
    locale: sd.locale || "en",
    user_attention_state: "reflective_exposed",
    emotional_weight: "light",
    cycle_day: Number(sd.day_number) || Number(sd.cycle_day) || 1,
    entered_via: "why_this_chip_tap",
    stage_signals: { item_type: itemType },
    today_layer: {},
    life_layer: {
      cycle_id: sd.journey_id || sd.cycle_id || "",
      life_kosha: sd.life_kosha || sd.scan_focus || "",
      scan_focus: sd.scan_focus || "",
    },
  };
};

const pickBody = (payload: MomentPayloadShape | null): string => {
  if (!payload || !payload.slots) return "";
  // Both L2 + L3 use a handful of conventional slot names; pick the
  // first non-empty one so we work with either M36 or M37 shape.
  const keys = [
    "body",
    "body_line",
    "body_lines",
    "explanation",
    "deeper_explanation",
    "l2_body",
    "l3_body",
  ];
  for (const k of keys) {
    const v = payload.slots[k];
    if (typeof v === "string" && v.trim()) return v;
    if (Array.isArray(v) && v.length) {
      return v.filter((x) => typeof x === "string" && x.trim()).join("\n\n");
    }
  }
  return "";
};

const pickCta = (
  payload: MomentPayloadShape | null,
  fallback: string,
): string => {
  if (!payload || !payload.slots) return fallback;
  const k = payload.slots.go_deeper_cta || payload.slots.deeper_cta;
  return typeof k === "string" && k.trim() ? k : fallback;
};

const pickSource = (payload: MomentPayloadShape | null): string => {
  if (!payload || !payload.slots) return "";
  const s =
    payload.slots.source_line ||
    payload.slots.tradition_line ||
    payload.slots.lineage_line;
  return typeof s === "string" ? s : "";
};

const WhyThisSheet: React.FC<Props> = ({
  visible,
  onClose,
  triggerLabel,
  itemType,
  screenData,
}) => {
  const sd = screenData ?? {};
  const [depth, setDepth] = useState<"l2" | "l3">("l2");
  const [l2, setL2] = useState<MomentPayloadShape | null>(null);
  const [l3, setL3] = useState<MomentPayloadShape | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset state every time the sheet opens so the previous chip's
  // content doesn't flash through.
  useEffect(() => {
    if (!visible) return;
    setDepth("l2");
    setL2(null);
    setL3(null);
    setLoading(true);
    const ctx = buildCtx(sd, itemType);
    mitraResolveMoment(L2_MOMENT_ID, ctx)
      .then((p) => setL2(p))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, itemType]);

  const showL3 = async () => {
    if (l3) {
      setDepth("l3");
      return;
    }
    setLoading(true);
    const ctx = buildCtx(sd, itemType);
    const p = await mitraResolveMoment(L3_MOMENT_ID, ctx);
    setL3(p);
    setDepth("l3");
    setLoading(false);
  };

  const body = depth === "l2" ? pickBody(l2) : pickBody(l3);
  const sourceLine = depth === "l3" ? pickSource(l3) : "";
  const goDeeperLabel = pickCta(l2, "Go deeper");
  const showGoDeeper = depth === "l2" && !loading;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handleWrap}>
            <View style={styles.handle} />
          </View>

          <View style={styles.headerRow}>
            <Text style={styles.eyebrow}>WHY THIS</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={Colors.brownMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title} numberOfLines={2}>
            {triggerLabel}
          </Text>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={Colors.gold} />
            </View>
          ) : (
            <ScrollView
              style={styles.bodyScroll}
              contentContainerStyle={styles.bodyContent}
            >
              {!!body && <Text style={styles.body}>{body}</Text>}
              {!!sourceLine && (
                <Text style={styles.source}>{sourceLine}</Text>
              )}
            </ScrollView>
          )}

          {showGoDeeper && (
            <TouchableOpacity
              style={styles.goDeeperBtn}
              activeOpacity={0.85}
              onPress={showL3}
            >
              <Text style={styles.goDeeperText}>{goDeeperLabel}</Text>
              <Ionicons
                name="arrow-forward"
                size={14}
                color={Colors.brownDeep}
              />
            </TouchableOpacity>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    maxHeight: "72%",
  },
  handleWrap: {
    alignItems: "center",
    marginBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderCream,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  eyebrow: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    letterSpacing: 1.3,
    color: Colors.gold,
  },
  title: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: Colors.brownDeep,
    marginBottom: 14,
  },
  loadingWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  bodyScroll: {
    maxHeight: 360,
  },
  bodyContent: {
    paddingVertical: 4,
  },
  body: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.textSoft,
  },
  source: {
    fontFamily: Fonts.sans.regular,
    fontStyle: "italic",
    fontSize: 12,
    color: Colors.brownMuted,
    marginTop: 14,
    lineHeight: 18,
  },
  goDeeperBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.goldHairline,
    backgroundColor: Colors.creamWarm,
    gap: 6,
  },
  goDeeperText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 13,
    color: Colors.brownDeep,
  },
});

export default WhyThisSheet;
