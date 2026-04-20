/**
 * TriadCardsRow — 3 horizontal "core triad" cards on the new dashboard:
 *   mantra / sankalp / practice (M16 + M35).
 *
 * Spec: docs/NEW_DASHBOARD_V1_SPEC.md §2 #5 + §4 (✓/○ cross-session persistence).
 *
 * Data:
 *   Per-card title/description slots:
 *     sd.card_mantra_title     / sd.card_mantra_description
 *     sd.card_sankalpa_title   / sd.card_sankalpa_description
 *     sd.card_ritual_title     / sd.card_ritual_description
 *   Per-card completion flags (Redux-driven, cross-session via sd.completed_today):
 *     sd.practice_chant  (mantra)
 *     sd.practice_embody (sankalp)
 *     sd.practice_act    (practice)
 *
 * Sovereignty: if a card has neither title nor description, the card
 * renders nothing (not even a placeholder). No English fallbacks.
 *
 * Cross-session hydration: on mount we read sd.completed_today[] and
 * flip the matching practice_* flag true via setScreenValue. This makes
 * the ✓ indicator survive app restarts.
 *
 * Tap behaviour: dispatches `view_info` with the card type, mirroring
 * the legacy CoreItemsList. Starting the runner is a separate CTA.
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { executeAction } from "../../engine/actionExecutor";
import { useScreenStore } from "../../engine/useScreenBridge";
import store, { RootState } from "../../store";
import { screenActions } from "../../store/screenSlice";
import { Colors } from "../../theme/colors";
import { Fonts } from "../../theme/fonts";

type CardType = "mantra" | "sankalp" | "practice";

interface TriadCard {
  type: CardType;
  labelKey: string; // screenData key for localized label
  labelFallback: string; // neutral token (UPPERCASE slug) if backend absent
  title: string;
  sub: string;
  done: boolean;
  iconName: keyof typeof Ionicons.glyphMap;
}

const TriadCardsRow: React.FC = () => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const sd = (screenData ?? {}) as Record<string, any>;

  // Subscribe to the completion flags directly via Redux selectors.
  // Without this the card doesn't always re-render when the runner
  // completes (useScreenStore returns an object snapshot that the
  // component was memoizing). Reading these booleans through
  // useSelector guarantees the ✓ indicator flips the instant the
  // runner dispatches setScreenValue on practice_chant/embody/act.
  const practiceChant = useSelector(
    (state: RootState) => !!(state as any).screen?.screenData?.practice_chant,
  );
  const practiceEmbody = useSelector(
    (state: RootState) => !!(state as any).screen?.screenData?.practice_embody,
  );
  const practiceAct = useSelector(
    (state: RootState) => !!(state as any).screen?.screenData?.practice_act,
  );

  // Cross-session ✓ hydration — reads completed_today[] and flips flags.
  useEffect(() => {
    const done: unknown = sd.completed_today;
    if (!Array.isArray(done)) return;
    const dispatch = store.dispatch;
    if (
      (done.includes("practice_chant") || done.includes("mantra")) &&
      !sd.practice_chant
    ) {
      dispatch(
        screenActions.setScreenValue({ key: "practice_chant", value: true }),
      );
    }
    if (
      (done.includes("practice_embody") || done.includes("sankalp")) &&
      !sd.practice_embody
    ) {
      dispatch(
        screenActions.setScreenValue({ key: "practice_embody", value: true }),
      );
    }
    if (
      (done.includes("practice_act") || done.includes("practice")) &&
      !sd.practice_act
    ) {
      dispatch(
        screenActions.setScreenValue({ key: "practice_act", value: true }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sd.completed_today]);

  const cards: TriadCard[] = [
    {
      type: "mantra",
      labelKey: "card_mantra_label",
      labelFallback: "MANTRA",
      title: sd.card_mantra_title ?? "",
      sub: sd.card_mantra_description ?? "",
      done: practiceChant,
      iconName: "musical-notes-outline",
    },
    {
      type: "sankalp",
      labelKey: "card_sankalpa_label",
      labelFallback: "SANKALP",
      title: sd.card_sankalpa_title ?? "",
      sub: sd.card_sankalpa_description ?? "",
      done: practiceEmbody,
      iconName: "leaf-outline",
    },
    {
      type: "practice",
      labelKey: "card_ritual_label",
      labelFallback: "PRACTICE",
      title: sd.card_ritual_title ?? "",
      sub: sd.card_ritual_description ?? "",
      done: practiceAct,
      iconName: "flower-outline",
    },
  ];

  // v3 Flow Contract §B: primary card tap dispatches start_runner directly.
  // The prior `view_info` intermediate surface has been moved to the secondary
  // info icon (ℹ︎). Runner source is always "core" for triad cards.
  const handleCardTap = (type: CardType) => {
    const masterKey =
      type === "sankalp"
        ? "master_sankalp"
        : type === "practice"
          ? "master_practice"
          : "master_mantra";
    const masterItem = (sd as any)[masterKey] || null;
    executeAction(
      {
        type: "start_runner",
        payload: {
          source: "core",
          variant: type,
          item: masterItem,
        },
      },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: store.getState().screen.screenData,
      },
    ).catch(() => {});
  };

  // Secondary affordance: info icon opens the metadata surface.
  const handleInfoTap = (type: CardType) => {
    executeAction(
      { type: "view_info", payload: { type } },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: store.getState().screen.screenData,
      },
    ).catch(() => {});
  };

  // Filter out fully-empty cards (sovereignty — no English placeholder).
  const rendered = cards.filter((c) => c.title || c.sub);
  if (rendered.length === 0) return null;

  return (
    <View style={styles.row} accessibilityLabel="triad_cards_row">
      {rendered.map((it) => {
        const label: string = (sd[it.labelKey] as string) || it.labelFallback;
        const testID =
          it.type === "sankalp"
            ? "core_item_sankalpa"
            : it.type === "practice"
              ? "core_item_ritual"
              : "core_item_mantra";
        return (
          <TouchableOpacity
            key={it.type}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => handleCardTap(it.type)}
            testID={testID}
            accessibilityLabel={testID}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={it.iconName} size={18} color={Colors.gold} />
            </View>
            <TouchableOpacity
              style={styles.infoBtn}
              hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
              activeOpacity={0.6}
              onPress={() => handleInfoTap(it.type)}
              testID={`${testID}_info`}
              accessibilityLabel={`${testID}_info`}
            >
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={Colors.brownMuted}
              />
            </TouchableOpacity>
            <Text style={styles.label}>{String(label).toUpperCase()}</Text>
            {!!it.title && (
              <Text style={styles.title} numberOfLines={2}>
                {it.title}
              </Text>
            )}
            {!!it.sub && (
              <Text style={styles.sub} numberOfLines={3}>
                {it.sub}
              </Text>
            )}
            <View style={styles.bottomRow}>
              {it.done ? (
                <View style={styles.doneDot}>
                  <Ionicons name="checkmark" size={12} color={Colors.cream} />
                </View>
              ) : (
                <View style={styles.openDot} />
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const CARD_GAP = 10;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: CARD_GAP,
    marginVertical: 12,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.cream,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderCream,
    padding: 12,
    minHeight: 160,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.goldPale,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  infoBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.7,
  },
  label: {
    fontFamily: Fonts.sans.medium,
    fontSize: 10,
    letterSpacing: 1.2,
    color: Colors.gold,
    marginBottom: 4,
  },
  title: {
    fontFamily: Fonts.serif.bold,
    fontSize: 14,
    color: Colors.brownDeep,
    marginBottom: 4,
  },
  sub: {
    fontFamily: Fonts.sans.regular,
    fontSize: 11,
    color: Colors.textSoft,
    lineHeight: 15,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: "auto",
    paddingTop: 8,
  },
  doneDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.successGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  openDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: Colors.ringTan,
    backgroundColor: "transparent",
  },
});

export default TriadCardsRow;
