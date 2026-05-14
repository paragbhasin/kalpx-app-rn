/**
 * RoomGuidedSection — mobile guided room surface aligned to the web layout.
 */
import { ROOM_GUIDED_COPY } from "@kalpx/contracts";
import React, { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { executeAction } from "../../engine/actionExecutor";
import { trackRoomTelemetry } from "../../engine/mitraApi";
import { useScreenStore } from "../../engine/useScreenBridge";
import { Fonts } from "../../theme/fonts";
import { buildActionCtx } from "./actions/actionContextHelper";
import InquiryModal from "./actions/InquiryModal";
import StepModal, { type StepModalResult } from "./actions/StepModal";
import { LIFE_CONTEXT_LABELS, ROOM_DISPLAY_NAMES } from "./roomConstants";
import type { InquiryCategory, RoomRenderV1, StepPayload } from "./types";

const BEIGE_BG = require("../../../assets/beige_bg.png");
const LOTUS_ICON = require("../../../assets/lotus_icon.png");
const KALPX_LOGO = require("../../../assets/KalpXlogo.png");

interface Props {
  envelope: RoomRenderV1;
}

function normalizeWhyThisRoomLine(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const compact = value.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
  if (/^because you shared\s*:/i.test(compact)) return null;
  return value;
}

function extractBecauseYouSharedLabel(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const lines = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  const firstLine = lines[0] ?? "";
  if (!/^because you shared\s*:/i.test(firstLine)) {
    const compact = value.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
    const match = compact.match(/^because you shared\s*:\s*[·•-]?\s*(.+)$/i);
    return match?.[1]?.trim() || null;
  }

  const inlineRemainder = firstLine
    .replace(/^because you shared\s*:/i, "")
    .trim()
    .replace(/^[·•-]\s*/, "");

  const bulletLines = lines
    .slice(1)
    .map((line) => line.replace(/^[·•-]\s*/, "").trim())
    .filter(Boolean);

  const parts = [inlineRemainder, ...bulletLines].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

const RoomGuidedSection: React.FC<Props> = ({ envelope }) => {
  const insets = useSafeAreaInsets();
  const { loadScreen, goBack } = useScreenStore();
  const actionCtx = buildActionCtx({ loadScreen, goBack });

  const ctx = (envelope as any).room_context?.entry_context ?? {};
  const roomCtx = (envelope as any).room_context ?? {};
  const recId: string | null = ctx.recommended_first_action_id ?? null;
  const recDesc: string = ctx.recommended_first_action_description ?? "";
  const roomId: string = envelope.room_id;
  const renderId: string = (envelope as any).provenance?.render_id ?? "";
  const roomDisplayName =
    ROOM_DISPLAY_NAMES[envelope.room_id] ||
    (envelope as any).room_display_name ||
    "";

  const recAction = recId
    ? (envelope.actions.find((a: any) => a.action_id === recId) ?? null)
    : null;
  const nonExitActions = envelope.actions.filter(
    (a: any) => a.action_type !== "exit",
  );

  const situationAck =
    roomCtx.situation_acknowledgement_line ??
    ctx.situation_acknowledgement_line ??
    null;
  const roomPurposeLine =
    roomCtx.room_purpose_line ?? ctx.room_purpose_line ?? null;
  const rawWhyThisRoomLine =
    roomCtx.why_this_room_line ?? ctx.why_this_room_line ?? null;
  const whyThisRoomLine = normalizeWhyThisRoomLine(rawWhyThisRoomLine);
  const derivedLifeContextLabel =
    (envelope.life_context
      ? LIFE_CONTEXT_LABELS[envelope.life_context]
      : null) || extractBecauseYouSharedLabel(rawWhyThisRoomLine);
  const sanatanInsightLine =
    roomCtx.sanatan_insight_line ?? ctx.sanatan_insight_line ?? null;
  const principleBanner = envelope.principle_banner ?? null;
  const memoryEchoLine = envelope.memory_echo_line ?? null;

  const [whyExpanded, setWhyExpanded] = useState(false);
  const [recommendedExpanded, setRecommendedExpanded] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);
  const [inquiryAction, setInquiryAction] = useState<any | null>(null);
  const [stepAction, setStepAction] = useState<any | null>(null);
  const [stepPayload, setStepPayload] = useState<StepPayload | null>(null);
  const [stepLabel, setStepLabel] = useState("");
  const [pendingCategory, setPendingCategory] =
    useState<InquiryCategory | null>(null);

  function triggerRoomReflection() {
    actionCtx.setScreenValue(true, "show_room_reflection");
    loadScreen({ container_id: "room", state_id: "render" } as any);
  }

  function handleBegin() {
    if (!recAction) return;
    if (envelope.room_id) {
      actionCtx.setScreenValue(envelope.room_id, "room_id");
    }
    void (trackRoomTelemetry as any)({
      event_type: "recommended_action_started",
      room_id: roomId,
      render_id: renderId,
      action_id: recAction.action_id,
      surface: "room",
    });
    launchAction(recAction);
  }

  function handleExit() {
    void trackRoomTelemetry({
      event_type: "room_exited" as any,
      room_id: roomId,
      surface: "room",
    });
    void executeAction(
      { type: "exit_tapped", payload: { room_id: roomId } } as any,
      actionCtx,
    );
  }

  function dispatchInquiryOpened(action: any) {
    void executeAction(
      {
        type: "room_inquiry_opened",
        payload: {
          room_id: envelope?.room_id ?? null,
          action_id: action.action_id,
          analytics_key: action.analytics_key,
          category_count: action.inquiry_payload?.categories?.length ?? 0,
        },
      } as any,
      actionCtx,
    );
  }

  function dispatchInquiryCategorySelected(
    action: any,
    category: InquiryCategory,
  ) {
    void executeAction(
      {
        type: "room_inquiry_category_selected",
        payload: {
          room_id: envelope?.room_id ?? null,
          category_id: category.id,
          action_id: action.action_id,
          analytics_key: action.analytics_key,
        },
      } as any,
      actionCtx,
    );
  }

  function dispatchStepCompleted(
    action: any,
    templateId: string,
    extra: Record<string, unknown> = {},
  ) {
    void executeAction(
      {
        type: "room_step_completed",
        payload: {
          room_id: envelope?.room_id ?? null,
          template_id: templateId,
          action_id: action.action_id,
          analytics_key: action.analytics_key,
          writes_event: action.persistence?.writes_event ?? null,
          ...extra,
        },
      } as any,
      actionCtx,
    );
  }

  function launchAction(action: any) {
    const actionType: string = action?.action_type ?? "";
    setStepsOpen(false);

    if (
      actionType === "inquiry" &&
      action?.inquiry_payload?.categories?.length
    ) {
      setInquiryAction(action);
      return;
    }

    if (actionType === "in_room_step" && action?.step_payload) {
      setStepAction(action);
      setStepPayload(action.step_payload);
      setStepLabel(action.label || "Step");
      return;
    }

    if (actionType.startsWith("runner_")) {
      const rp = action?.runner_payload;
      if (!rp) return;
      if (envelope.room_id) {
        actionCtx.setScreenValue(envelope.room_id, "room_id");
      }
      void executeAction(
        {
          type: "start_runner",
          payload: {
            source: rp.runner_source ?? "support_room",
            variant:
              (rp.runner_kind ?? actionType.replace("runner_", "")) || "mantra",
            item: rp,
            action_id: action.action_id,
          },
        } as any,
        actionCtx,
      );
    }
  }

  function handleLaunchPractice(category: InquiryCategory, templateId: string) {
    if (!inquiryAction) return;
    const action = inquiryAction;
    setInquiryAction(null);
    setPendingCategory(category);
    const durationMatch = templateId.match(/_(\d+)min$/);
    const durationSec = durationMatch
      ? parseInt(durationMatch[1], 10) * 60
      : null;
    const practicePrompt =
      category.reflective_prompt || category.prompt || null;
    setStepAction(action);
    setStepPayload({
      template_id: templateId,
      step_config: {},
      input_slots: [],
      duration_sec: durationSec,
      memory_modal: practicePrompt
        ? {
            title:
              category.suggested_practice_label ||
              category.practice_label ||
              undefined,
            prompt: practicePrompt,
            placeholder: "Write what comes...",
            primary_label: "Done",
          }
        : null,
    });
    setStepLabel(
      category.suggested_practice_label ||
        category.practice_label ||
        category.label ||
        templateId,
    );
  }

  function handleSubmitJournal(category: InquiryCategory, text: string) {
    if (!inquiryAction) return;
    const action = inquiryAction;
    setInquiryAction(null);
    dispatchStepCompleted(action, "step_journal_inquiry", {
      text,
      category_id: category.id,
      source: "inquiry",
    });
    triggerRoomReflection();
  }

  function handleStepDone(extra: StepModalResult) {
    if (!stepAction || !stepPayload?.template_id) {
      setStepAction(null);
      setStepPayload(null);
      setPendingCategory(null);
      return;
    }

    dispatchStepCompleted(stepAction, String(stepPayload.template_id), {
      ...(extra.text ? { text: extra.text } : {}),
      ...(extra.grounding ? { grounding: extra.grounding } : {}),
      ...(pendingCategory
        ? { category_id: pendingCategory.id, source: "inquiry" }
        : {}),
    });

    if (pendingCategory) triggerRoomReflection();
    setStepAction(null);
    setStepPayload(null);
    setStepLabel("");
    setPendingCategory(null);
  }

  return (
    <View>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: 30,
            paddingBottom: Math.max(40, insets.bottom + 20),
          },
        ]}
        showsVerticalScrollIndicator={false}
        testID="room_guided_section"
      >
        <View style={styles.heroBlock}>
          <Image
            source={LOTUS_ICON}
            resizeMode="contain"
            style={styles.heroLotus}
          />
          <Text style={styles.roomTitle}>{roomDisplayName}</Text>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerDiamond}>◇</Text>
            <View style={styles.dividerLine} />
          </View>

          {situationAck ? (
            <Text style={styles.situationAck}>{situationAck}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.beginBtn}
          onPress={handleBegin}
          activeOpacity={0.9}
          testID="room_guided_begin"
        >
          <Text style={styles.beginBtnText}>{ROOM_GUIDED_COPY.begin}</Text>
          <Text style={styles.beginArrow}>→</Text>
        </TouchableOpacity>

        {recDesc ? (
          <View style={styles.recommendedEchoWrap}>
            <Image
              source={LOTUS_ICON}
              resizeMode="contain"
              style={styles.echoLotus}
            />
            <TouchableOpacity
              onPress={() => setRecommendedExpanded((value) => !value)}
              activeOpacity={0.8}
              testID="room-guided-recommended-description"
            >
              <Text
                style={styles.recommendedEcho}
                numberOfLines={recommendedExpanded ? undefined : 1}
              >
                {recDesc}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {((principleBanner ||
          sanatanInsightLine ||
          roomPurposeLine) as unknown) ? (
          <View style={styles.whyCard}>
            <TouchableOpacity
              onPress={() => {
                if (whyThisRoomLine) {
                  void trackRoomTelemetry({
                    event_type: "why_this_viewed" as any,
                    room_id: roomId,
                    surface: "room",
                  });
                }
                setWhyExpanded((value) => !value);
              }}
              activeOpacity={0.86}
              style={styles.whyTrigger}
              testID="room_guided_why_this"
            >
              <View style={styles.whyIconWrap}>
                <Image
                  source={LOTUS_ICON}
                  resizeMode="contain"
                  style={styles.whyIcon}
                />
              </View>
              <View style={styles.whyHeaderText}>
                {whyExpanded ? (
                  <Text style={styles.whyHeaderTitle}>
                    {principleBanner?.source_line || "Sanatan wisdom says"}
                  </Text>
                ) : (
                  <Text style={styles.whyPreview} numberOfLines={2}>
                    {sanatanInsightLine ||
                      principleBanner?.wisdom_anchor_line ||
                      roomPurposeLine}
                  </Text>
                )}
              </View>
              <Text style={styles.chevron}>{whyExpanded ? "⌃" : "⌄"}</Text>
            </TouchableOpacity>

            {whyExpanded ? (
              <View style={styles.whyExpanded} testID="room_why_expanded">
                {sanatanInsightLine ? (
                  <Text style={styles.whyExpandedText}>
                    {sanatanInsightLine}
                  </Text>
                ) : null}
                {roomPurposeLine ? (
                  <Text style={styles.whyExpandedText}>{roomPurposeLine}</Text>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}

        {memoryEchoLine ? (
          <Text style={styles.memoryEcho}>{memoryEchoLine}</Text>
        ) : null}

        <View style={styles.footerBlock}>
          {derivedLifeContextLabel ? (
            <View style={styles.sharedPill}>
              <Text style={styles.sharedLead}>Because you shared ·</Text>
              <Text style={styles.sharedValue}>{derivedLifeContextLabel}</Text>
            </View>
          ) : null}

          {/* <TouchableOpacity
            onPress={() => setStepsOpen(true)}
            testID="room_guided_view_all_steps"
          >
            <Text style={styles.viewStepsLink}>
              {ROOM_GUIDED_COPY.viewAllSteps}
            </Text>
          </TouchableOpacity> */}

          <TouchableOpacity onPress={handleExit} testID="room_guided_exit">
            <Text style={styles.exitText}>{ROOM_GUIDED_COPY.exitLabel}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={stepsOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setStepsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setStepsOpen(false)}
          />
          <View style={styles.stepsSheet}>
            <Text style={styles.stepsTitle}>Steps in this space</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {nonExitActions.map((action: any, index: number) => (
                <TouchableOpacity
                  key={action.action_id}
                  activeOpacity={0.84}
                  onPress={() => launchAction(action)}
                  style={[
                    styles.stepRow,
                    action.action_id === recId && styles.stepRowHighlight,
                  ]}
                  testID={`room_step_${action.action_id}`}
                >
                  <Text style={styles.stepNum}>{index + 1}</Text>
                  <Text style={styles.stepLabel}>{action.label}</Text>
                  {action.action_id === recId ? (
                    <Text style={styles.stepSuggested}>suggested</Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <InquiryModal
        visible={!!inquiryAction}
        label={inquiryAction?.label || "Inquiry"}
        inquiryPayload={inquiryAction?.inquiry_payload}
        onCancel={() => setInquiryAction(null)}
        onOpened={() => inquiryAction && dispatchInquiryOpened(inquiryAction)}
        onCategorySelected={(category) =>
          inquiryAction &&
          dispatchInquiryCategorySelected(inquiryAction, category)
        }
        onLaunchPractice={handleLaunchPractice}
        onSubmitJournal={handleSubmitJournal}
      />

      <StepModal
        visible={!!stepAction}
        stepPayload={stepPayload}
        label={stepLabel}
        onCancel={() => {
          setStepAction(null);
          setStepPayload(null);
          setStepLabel("");
          setPendingCategory(null);
        }}
        onDone={handleStepDone}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: "#FBF6EF",
  },
  backgroundImage: {
    resizeMode: "cover",
    opacity: 0.98,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 26,
  },
  logo: {
    width: 96,
    height: 40,
    marginBottom: 34,
  },
  heroBlock: {
    alignItems: "center",
    marginBottom: 28,
  },
  heroLotus: {
    width: 35,
    height: 34,
    marginBottom: 16,
    tintColor: "#E0AF2F",
  },
  roomTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 30,

    color: "#432104",
    textAlign: "center",
    marginBottom: 18,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    marginBottom: 10,
  },
  dividerLine: {
    width: 110,
    height: 1,
    backgroundColor: "rgba(212,166,74,0.42)",
  },
  dividerDiamond: {
    fontSize: 16,
    lineHeight: 16,
    color: "#D4A64A",
  },
  situationAck: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    lineHeight: 25,
    color: "#7A6A58",
    fontStyle: "italic",
    textAlign: "center",
    paddingHorizontal: 18,
  },
  beginBtn: {
    width: "60%",
    maxWidth: 330,
    alignSelf: "center",
    marginBottom: 10,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#5A2C00",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#6E451D",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  beginBtnText: {
    fontFamily: Fonts.sans.bold,
    fontSize: 20,
    lineHeight: 24,
    color: "#FFF8EF",
  },
  beginArrow: {
    marginLeft: 16,
    fontSize: 28,
    lineHeight: 28,
    color: "#FFF8EF",
  },
  recommendedEchoWrap: {
    alignItems: "center",
    marginBottom: 22,
  },
  echoLotus: {
    width: 26,
    height: 20,
    marginBottom: 8,
    opacity: 0.72,
    tintColor: "#D8AB46",
  },
  recommendedEcho: {
    maxWidth: 320,
    textAlign: "center",
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    lineHeight: 22,
    color: "#6E6357",
    fontStyle: "italic",
  },
  whyCard: {
    backgroundColor: "rgba(255, 250, 243, 0.9)",
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "rgba(214,183,130,0.22)",
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: "#8D6A3D",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  whyTrigger: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  whyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(247, 238, 225, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  whyIcon: {
    width: 22,
    height: 18,
    tintColor: "#D7A63E",
  },
  whyHeaderText: {
    flex: 1,
    paddingTop: 2,
  },
  whyHeaderTitle: {
    fontFamily: Fonts.sans.bold,
    fontSize: 15,
    lineHeight: 20,
    color: "#432104",
  },
  whyPreview: {
    fontFamily: Fonts.sans.medium,
    fontSize: 15,
    lineHeight: 24,
    color: "#3F352B",
  },
  chevron: {
    fontSize: 24,
    lineHeight: 24,
    color: "#C89B39",
    marginTop: -2,
    marginLeft: 10,
  },
  whyExpanded: {
    paddingLeft: 60,
    paddingRight: 10,
    paddingTop: 18,
    gap: 14,
  },
  whyExpandedText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    lineHeight: 30,
    color: "#3F352B",
  },
  memoryEcho: {
    marginTop: 18,
    textAlign: "center",
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    lineHeight: 21,
    color: "#8F8273",
    fontStyle: "italic",
  },
  footerBlock: {
    marginTop: "auto",
    alignItems: "center",
    paddingTop: 60,
    gap: 14,
  },
  sharedPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    paddingHorizontal: 5,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,250,245,0.88)",
    borderWidth: 1,
    borderColor: "rgba(214,183,130,0.22)",
  },
  sharedLead: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    lineHeight: 20,
    color: "#5E5449",
    marginRight: 6,
  },
  sharedValue: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: "#3E2A15",
  },
  viewStepsLink: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    lineHeight: 20,
    color: "#8A7968",
    textDecorationLine: "underline",
  },
  exitText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    lineHeight: 18,
    color: "#B0A090",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(30,20,10,0.45)",
    justifyContent: "flex-end",
  },
  stepsSheet: {
    backgroundColor: "#FFF8EF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "70%",
  },
  stepsTitle: {
    fontFamily: Fonts.sans.bold,
    fontSize: 15,
    lineHeight: 20,
    color: "#432104",
    textAlign: "center",
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(200,180,154,0.2)",
  },
  stepRowHighlight: {
    backgroundColor: "rgba(201,168,76,0.08)",
  },
  stepNum: {
    minWidth: 24,
    textAlign: "right",
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    lineHeight: 18,
    color: "#9F9F9F",
  },
  stepLabel: {
    flex: 1,
    marginLeft: 12,
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    lineHeight: 20,
    color: "#432104",
  },
  stepSuggested: {
    fontFamily: Fonts.sans.regular,
    fontSize: 11,
    lineHeight: 16,
    color: "#8B6914",
    fontStyle: "italic",
  },
});

export default RoomGuidedSection;
