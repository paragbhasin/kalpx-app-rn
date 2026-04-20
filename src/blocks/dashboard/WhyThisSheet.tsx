/**
 * WhyThisSheet — bottom sheet that reveals the L2 "why this" interpretation
 * for a single triad item.
 *
 * Flow:
 *   1. User taps a chip on WhyThisL1Strip → opens this sheet
 *   2. Sheet resolves M36_why_this_l2 on mount and shows the L2 body
 *   3. "Go deeper" CTA closes the sheet and dispatches `view_info` for
 *      the linked item type — user lands on the real info screen (the
 *      canonical understanding surface, not an in-sheet body swap).
 *
 * Contract (locked 2026-04-19): sheet = interpretation, info screen =
 * understanding. The sheet is a doorway, not a mini-content-system.
 * "Go deeper" is HIDDEN ENTIRELY when there is no resolvable linked
 * item in screenData — no no-op CTAs (founder adjustment #1).
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
import { executeAction } from "../../engine/actionExecutor";
import { useScreenStore } from "../../engine/useScreenBridge";
import store from "../../store";
import { screenActions } from "../../store/screenSlice";
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

const VALID_INFO_TYPES = ["mantra", "sankalp", "practice"] as const;

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
  const keys = [
    "body",
    "body_line",
    "body_lines",
    "explanation",
    "deeper_explanation",
    "l2_body",
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

const WhyThisSheet: React.FC<Props> = ({
  visible,
  onClose,
  triggerLabel,
  itemType,
  screenData,
}) => {
  const sd = screenData ?? {};
  const { loadScreen, goBack } = useScreenStore();
  const [l2, setL2] = useState<MomentPayloadShape | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset state every time the sheet opens so the previous chip's
  // content doesn't flash through.
  useEffect(() => {
    if (!visible) return;
    setL2(null);
    setLoading(true);
    const ctx = buildCtx(sd, itemType);
    mitraResolveMoment(L2_MOMENT_ID, ctx)
      .then((p) => setL2(p))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, itemType]);

  const body = pickBody(l2);
  const goDeeperLabel = pickCta(l2, "Go deeper");

  // Guard (founder adjustment #1, 2026-04-19): the Go-deeper CTA is only
  // visible when a linked item type + data is actually resolvable. No
  // no-op CTAs. view_info reads master_<type> from screenState when
  // manualData is absent, so this guard mirrors that resolution.
  const canGoDeeper =
    !loading &&
    (VALID_INFO_TYPES as readonly string[]).includes(itemType) &&
    !!sd[`master_${itemType}`];

  const handleGoDeeper = () => {
    const type = itemType;
    onClose();
    executeAction(
      {
        type: "view_info",
        payload: { type },
      },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: store.getState().screen.screenData,
      },
    );
  };

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
            </ScrollView>
          )}

          {canGoDeeper && (
            <TouchableOpacity
              style={styles.goDeeperBtn}
              activeOpacity={0.85}
              onPress={handleGoDeeper}
              testID="why_this_go_deeper"
              accessibilityLabel="why_this_go_deeper"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
