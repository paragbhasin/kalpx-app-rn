/**
 * TellMitraThreadView — S17-D4B-FE
 * Pure rendering component for the Tell Mitra thread UI.
 * Contains all conversation item renderers, empty state, and composer layout.
 */

import { getRoomLabel, isValidRoomId } from "@kalpx/contracts";
import type {
  TellMitraConversationItem,
  TellMitraFollowupOption,
  TellMitraNextOption,
} from "@kalpx/types";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Fonts } from "../../theme/fonts";

// ── Constants ────────────────────────────────────────────────────────────────

const QUICK_START_CHIPS = [
  { value: "overwhelmed" },
  { value: "need_clarity" },
  { value: "disconnected" },
  { value: "calm_now" },
] as const;

const RETURN_CARD_CHIPS: TellMitraFollowupOption[] = [
  { label: "More steady", value: "more_steady" },
  { label: "Still heavy", value: "still_heavy" },
  { label: "I need clarity", value: "need_clarity" },
  { label: "Tell Mitra more", value: "tell_mitra_more" },
];

const ROBOTIC_PATTERNS =
  /scattered|agitated|drained|energized|balanced|state_tag|spl_pattern/i;

function shouldShowPriorContext(summary: string | null | undefined): boolean {
  if (!summary) return false;
  if (ROBOTIC_PATTERNS.test(summary)) return false;
  if (summary.trim().length < 10) return false;
  return true;
}

// ── Props ────────────────────────────────────────────────────────────────────

export interface TellMitraThreadViewProps {
  conversation: TellMitraConversationItem[];
  submitting: boolean;
  draft: string;
  composerPlaceholder: string;
  inputRef: React.RefObject<TextInput>;
  scrollRef: React.RefObject<ScrollView>;
  onDraftChange: (t: string) => void;
  onSubmit: (text: string) => void;
  onChipClick: (opt: TellMitraFollowupOption, chipGroupId: string) => void;
  onEnterRoom: (
    item: Extract<TellMitraConversationItem, { type: "room_recommendation" }>,
  ) => void;
  onTellMitraMore: () => void;
  onStartFresh: () => void;
  onQuickStartChip: (value: string, label: string) => void;
  onWisdomOptionPress: (opt: TellMitraNextOption) => void;
  buildActionContext: () => any;
  errorMsg?: string;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function TellMitraThreadView({
  conversation,
  submitting,
  draft,
  composerPlaceholder,
  inputRef,
  scrollRef,
  onDraftChange,
  onSubmit,
  onChipClick,
  onEnterRoom,
  onTellMitraMore,
  onStartFresh,
  onQuickStartChip,
  onWisdomOptionPress,
  errorMsg,
}: TellMitraThreadViewProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const androidKeyboardOffset =
    Platform.OS === "android" ? Math.max(0, keyboardHeight - insets.bottom) : 0;
  const footerClearance = Math.max(insets.bottom + 72, 88);

  React.useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates?.height || 0);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });
    });
    const onHide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, [scrollRef]);

  function renderItem(item: TellMitraConversationItem) {
    // ── user_message ─────────────────────────────────────────────────────────
    if (item.type === "user_message") {
      return (
        <View key={item.id} style={s.userRow}>
          <View style={s.userBubble}>
            <Text style={s.userBubbleText}>{item.text}</Text>
          </View>
        </View>
      );
    }

    // ── user_chip ────────────────────────────────────────────────────────────
    if (item.type === "user_chip") {
      return (
        <View key={item.id} style={s.userRow}>
          <View style={s.userChipBubble}>
            <Text style={s.userChipText}>{item.label}</Text>
          </View>
        </View>
      );
    }

    // ── mitra_response ───────────────────────────────────────────────────────
    if (item.type === "mitra_response") {
      return (
        <View key={item.id} style={s.mitraBlock}>
          <Text style={s.mitraLabel}>{t('tellMitraThread.mitraLabel')}</Text>
          {shouldShowPriorContext(item.prior_context_summary) ? (
            <Text style={s.priorContextText}>{item.prior_context_summary}</Text>
          ) : null}
          <Text style={s.mitraResponseText}>{item.response_copy}</Text>
        </View>
      );
    }

    // ── followup_chips ───────────────────────────────────────────────────────
    if (item.type === "followup_chips") {
      if (item.disabled) return null;
      return (
        <View key={item.id} style={s.chipsBlock}>
          <Text style={s.chipsPrompt}>{item.prompt}</Text>
          <View style={s.chipsWrap}>
            {item.options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  if (!item.disabled && !submitting) onChipClick(opt, item.id);
                }}
                disabled={item.disabled || submitting}
                style={[
                  s.chip,
                  (item.disabled || submitting) && s.chipDisabled,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    s.chipText,
                    item.disabled ? s.chipTextDisabled : undefined,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    // ── room_recommendation ──────────────────────────────────────────────────
    if (item.type === "room_recommendation") {
      return (
        <View key={item.id} style={s.roomCard}>
          <Text style={s.roomCardLabel}>{t('tellMitraThread.recommendedNext')}</Text>
          <Text style={s.roomCardTitle}>{item.room_label}</Text>
          {item.room_description ? (
            <Text style={s.roomCardDesc}>{item.room_description}</Text>
          ) : null}
          <TouchableOpacity
            style={s.goldBtn}
            onPress={() => onEnterRoom(item)}
            activeOpacity={0.8}
          >
            <Text style={s.goldBtnText}>{t('tellMitraThread.enterRoom', { room_label: item.room_label })}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.ghostLink}
            onPress={onTellMitraMore}
            activeOpacity={0.7}
          >
            <Text style={s.ghostLinkText}>{t('tellMitraThread.tellMitraMore')}</Text>
          </TouchableOpacity>
          {item.secondary_room_id &&
          isValidRoomId(item.secondary_room_id) &&
          item.secondary_room_id !== item.room_id ? (
            <TouchableOpacity
              style={[s.ghostLink, { marginTop: 2 }]}
              onPress={() =>
                onChipClick(
                  {
                    label: `Or try ${getRoomLabel(item.secondary_room_id as any)}`,
                    value: `secondary_room_${item.secondary_room_id}`,
                  },
                  item.id,
                )
              }
              activeOpacity={0.7}
            >
              <Text style={[s.ghostLinkText, { fontSize: 12 }]}>
                {t('tellMitraThread.orTryRoom', { room: getRoomLabel(item.secondary_room_id as any) })}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      );
    }

    // ── return_card ──────────────────────────────────────────────────────────
    if (item.type === "return_card") {
      return (
        <View key={item.id} style={s.returnCard}>
          <Text style={s.returnCardTitle}>
            {t('tellMitraThread.youreBack', { room_label: item.room_label })}
          </Text>
          <Text style={s.returnCardSubtitle}>{t('tellMitraThread.whatFeelsDifferent')}</Text>
          <View style={s.chipsWrap}>
            {RETURN_CARD_CHIPS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                onPress={() => {
                  if (opt.value === "tell_mitra_more") {
                    onTellMitraMore();
                    return;
                  }
                  onChipClick(opt, `return_card_${item.id}`);
                }}
                disabled={submitting}
                style={[s.chip, submitting && s.chipDisabled]}
                activeOpacity={0.7}
              >
                <Text style={s.chipText}>{t(`tellMitraThread.returnCard.${opt.value}`)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    // ── wisdom_options ───────────────────────────────────────────────────────
    if (item.type === "wisdom_options") {
      return (
        <View key={item.id} style={s.wisdomBlock}>
          <Text style={s.wisdomLabel}>{t('tellMitraThread.orTry')}</Text>
          {item.next_options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={s.ghostBtn}
              onPress={() => onWisdomOptionPress(opt)}
              activeOpacity={0.7}
            >
              <Text style={s.ghostBtnText}>
                {opt.label} — {opt.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }

    // ── safety ───────────────────────────────────────────────────────────────
    if (item.type === "safety") {
      return (
        <View key={item.id} style={s.safetyCard}>
          <Text style={s.safetyTitle}>{t('tellMitraThread.mitraHearsYou')}</Text>
          <Text style={s.safetyText}>{item.response_copy}</Text>
        </View>
      );
    }

    // ── loading ───────────────────────────────────────────────────────────────
    if (item.type === "loading") {
      return (
        <View key={item.id} style={s.mitraBlock}>
          <Text style={s.mitraLabel}>{t('tellMitraThread.mitraLabel')}</Text>
          <Text style={s.loadingDots}>· · ·</Text>
        </View>
      );
    }

    // ── error ─────────────────────────────────────────────────────────────────
    if (item.type === "error") {
      return (
        <View key={item.id} style={s.errorCard}>
          <Text style={s.errorCardText}>{item.message}</Text>
        </View>
      );
    }

    return null;
  }

  return (
    <View style={s.root}>
      {/* Start fresh button — only when thread has items */}
      {conversation.length > 0 && (
        <View style={s.startFreshRow}>
          <TouchableOpacity onPress={onStartFresh} activeOpacity={0.7}>
            <Text style={s.startFreshText}>{t('tellMitraThread.startFresh')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        style={s.scrollArea}
        contentContainerStyle={[
          s.scrollContent,
          conversation.length === 0 && s.scrollContentEmpty,
          { paddingBottom: footerClearance + 12 },
        ]}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
      >
        {/* Empty state */}
        {conversation.length === 0 && (
          <View style={s.emptyState}>
            <Text style={s.emptySubtext}>
              {t('tellMitraThread.emptySubtext')}
            </Text>
            <Text style={s.emptyHint}>
              {t('tellMitraThread.emptyHint')}
            </Text>
            <View style={[s.chipsWrap, { marginTop: 20 }]}>
              {QUICK_START_CHIPS.map((chip) => (
                <TouchableOpacity
                  key={chip.value}
                  onPress={() => onQuickStartChip(chip.value, t(`tellMitraThread.quickStart.${chip.value}`))}
                  disabled={submitting}
                  style={[s.chip, submitting && s.chipDisabled]}
                  activeOpacity={0.7}
                >
                  <Text style={s.chipText}>{t(`tellMitraThread.quickStart.${chip.value}`)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Conversation items */}
        {conversation.map((item) => renderItem(item))}
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {!!errorMsg && <Text style={s.errorText}>{errorMsg}</Text>}
        <View
          style={[
            s.footerWrap,
            Platform.OS === "android" && androidKeyboardOffset > 0
              ? { paddingBottom: androidKeyboardOffset }
              : null,
          ]}
        >
        <View style={s.composerRow}>
          <TextInput
            ref={inputRef}
            style={s.composerInput}
            value={draft}
            onChangeText={onDraftChange}
            multiline
            placeholder={composerPlaceholder}
            placeholderTextColor="#9b8b77"
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              s.sendBtn,
              (submitting || !draft.trim()) && s.sendBtnDisabled,
            ]}
            onPress={() => {
              if (submitting || !draft.trim()) return;
              onSubmit(draft.trim());
            }}
            disabled={submitting || !draft.trim()}
            activeOpacity={0.8}
          >
            <Text style={s.sendBtnText}>{submitting ? "…" : t('tellMitraThread.send')}</Text>
          </TouchableOpacity>
        </View>
        <Text
          style={[
            s.disclaimerText,
            { paddingBottom: Math.max(insets.bottom + 6, 8) },
          ]}
        >
          {t('tellMitraThread.disclaimer')}
        </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1 },
  startFreshRow: {
    paddingHorizontal: 16,
    paddingTop: 10,
    alignItems: "flex-end",
  },
  startFreshText: {
    fontSize: 12,
    color: "#A08060",
    fontFamily: Fonts.sans.regular,
  },
  scrollArea: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 12 },
  scrollContentEmpty: { paddingTop: 28 },

  // Empty state
  emptyState: { paddingBottom: 24 },
  emptyTitle: {
    fontFamily: Fonts.serif.regular,
    fontSize: 24,
    fontWeight: "700",
    color: "#3B2A1A",
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 15,
    color: "#7B6550",
    lineHeight: 22,
    marginBottom: 4,
  },
  emptyHint: { fontSize: 13, color: "#9B8B77", lineHeight: 20 },

  // User bubbles
  userRow: { alignItems: "flex-end", marginBottom: 12 },
  userBubble: {
    backgroundColor: "#F5E9C8",
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 16,
    maxWidth: "78%",
  },
  userBubbleText: { fontSize: 16, color: "#3B2A1A", lineHeight: 24 },
  userChipBubble: {
    backgroundColor: "rgba(201,168,76,0.12)",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.4)",
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    maxWidth: "65%",
  },
  userChipText: {
    fontSize: 14,
    color: "#7B6550",
    fontStyle: "italic",
    fontFamily: Fonts.sans.regular,
  },

  // Mitra response
  mitraBlock: { marginBottom: 18 },
  mitraLabel: {
    fontSize: 10,
    color: "#B8963E",
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 6,
    fontFamily: Fonts.sans.regular,
  },
  priorContextText: {
    fontSize: 12,
    color: "#9B8B77",
    fontStyle: "italic",
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "rgba(201,168,76,0.04)",
    borderRadius: 6,
  },
  mitraResponseText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    lineHeight: 30,
    color: "#3B2A1A",
  },
  loadingDots: { fontSize: 20, color: "#C9A84C", letterSpacing: 6 },

  // Chips
  chipsBlock: { marginBottom: 18 },
  chipsPrompt: {
    fontSize: 13,
    color: "#7B6550",
    marginBottom: 8,
    fontFamily: Fonts.sans.regular,
  },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.5)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,250,243,0.95)",
  },
  chipDisabled: { opacity: 0.4 },
  chipText: { fontSize: 14, color: "#5C4B35", fontFamily: Fonts.sans.regular },
  chipTextDisabled: { color: "#BBAA99" },

  // Room recommendation card
  roomCard: {
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.25)",
    borderRadius: 20,
    backgroundColor: "#FFFDF9",
    padding: 20,
    marginBottom: 18,
    shadowColor: "#432104",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  roomCardLabel: {
    fontSize: 10,
    color: "#B8963E",
    fontWeight: "700",
    letterSpacing: 0.9,
    marginBottom: 10,
    fontFamily: Fonts.sans.regular,
  },
  roomCardTitle: {
    fontFamily: Fonts.serif.regular,
    fontSize: 20,
    fontWeight: "700",
    color: "#3B2A1A",
    marginBottom: 6,
  },
  roomCardDesc: {
    fontSize: 14,
    color: "#7B6550",
    marginBottom: 16,
    lineHeight: 22,
  },
  goldBtn: {
    backgroundColor: "#C99317",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  goldBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  ghostLink: { paddingVertical: 8, alignItems: "center" },
  ghostLinkText: {
    fontSize: 13,
    color: "#9b8b77",
    fontFamily: Fonts.sans.regular,
    textDecorationLine: "underline",
  },

  // Return card
  returnCard: {
    backgroundColor: "rgba(245,240,233,0.85)",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.2)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },
  returnCardTitle: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    fontWeight: "600",
    color: "#3B2A1A",
    marginBottom: 4,
  },
  returnCardSubtitle: { fontSize: 13, color: "#7B6550", marginBottom: 14 },

  // Wisdom options
  wisdomBlock: { marginBottom: 18 },
  wisdomLabel: {
    fontSize: 10,
    color: "#B8963E",
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
    fontFamily: Fonts.sans.regular,
  },
  ghostBtn: {
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.3)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
  },
  ghostBtnText: {
    fontSize: 14,
    color: "#7B6550",
    fontFamily: Fonts.sans.regular,
  },

  // Safety
  safetyCard: {
    backgroundColor: "rgba(240,236,230,0.9)",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.2)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
  },
  safetyTitle: {
    fontFamily: Fonts.serif.regular,
    fontSize: 17,
    fontWeight: "700",
    color: "#3B2A1A",
    marginBottom: 8,
  },
  safetyText: { fontSize: 16, lineHeight: 28, color: "#3B2A1A" },

  // Error
  errorCard: {
    backgroundColor: "rgba(220,50,50,0.04)",
    borderWidth: 1,
    borderColor: "rgba(220,50,50,0.15)",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  errorCardText: { fontSize: 13, color: "#c0392b" },
  errorText: {
    fontSize: 13,
    color: "#c0392b",
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  footerWrap: {
    backgroundColor: "#FAF7F2",
  },

  // Composer
  composerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(201,168,76,0.18)",
    backgroundColor: "#FAF7F2",
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 16 : 10,
    paddingHorizontal: 12,
  },
  composerInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.35)",
    borderRadius: 14,
    padding: 10,
    fontSize: 15,
    color: "#3B2A1A",
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: "rgba(255,253,249,0.98)",
    textAlignVertical: "top",
  },
  sendBtn: {
    backgroundColor: "#C99317",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
  disclaimerText: {
    fontSize: 11,
    color: "#A08060",
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 20,
    paddingVertical: 6,
    fontFamily: Fonts.sans.regular,
  },
});
