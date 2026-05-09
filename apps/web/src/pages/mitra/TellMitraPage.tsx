import { CHIP_SUBMIT_TEXT, getDoorLabel, getRoomLabel, isValidRoomId } from "@kalpx/contracts";
import type { TellMitraConversationItem, TellMitraFollowupMeta, TellMitraFollowupOption, TellMitraNextOption, TellMitraRoomEntryContext, TellMitraV3Response } from "@kalpx/types";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { TellMitraThreadView } from "../../components/mitra/TellMitraThreadView";
import { executeAction } from "../../engine/actionExecutor";
import { postTellMitraV3 } from "../../engine/mitraApi";
import { WEB_ENV } from "../../lib/env";
import type { AppDispatch } from "../../store";
import { useScreenState } from "../../store/screenSlice";

const THREAD_UI_ENABLED = WEB_ENV.tellMitraThreadUi === "1";

const THREAD_STORAGE_KEY = "tell_mitra_thread_v1";
const RETURN_ROOM_KEY    = "tell_mitra_return_room_v1";

const DOOR_ROUTES: Record<string, string> = {
  my_rhythm: "/en/mitra/rhythm",
  inner_path: "/en/mitra/inner-path",
  quick_reset: "/en/mitra/quick-reset",
  tell_mitra: "/en/mitra/tell-mitra",
};

type ResultScreen = "none" | "navigate_to_room" | "navigate_to_door" | "provide_wisdom_inline" | "fallback" | "safety" | "ask_followup";

function _id() { return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

export function TellMitraPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const screenState = useScreenState();

  // ── Shared state (used by both flag-off and flag-on paths) ────────────────
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Flag-off state ────────────────────────────────────────────────────────
  const [result, setResult] = useState<TellMitraV3Response | null>(null);
  const [screen, setScreen] = useState<ResultScreen>("none");

  // ── Flag-on state ─────────────────────────────────────────────────────────
  const [conversation, setConversation] = useState<TellMitraConversationItem[]>([]);
  const [composerPlaceholder, setComposerPlaceholder] = useState("What's on your mind…");
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const threadBottomRef = useRef<HTMLDivElement>(null);
  const freshResetPendingRef = useRef(false);
  const activeContextRef = useRef<{
    parentEventId: string | number | null;
    parentIntentType: string | null;
    lifeContext: string | null;
    supportNeed: string | null;
    patternKey: string | null;
    roomEntryContext: TellMitraRoomEntryContext | null;
  }>({ parentEventId: null, parentIntentType: null, lifeContext: null, supportNeed: null, patternKey: null, roomEntryContext: null });

  // ── Session restore + return-from-room detection (flag-on only, single call) ─
  useEffect(() => {
    if (!THREAD_UI_ENABLED) return;
    let restored: TellMitraConversationItem[] = [];
    try {
      const raw = sessionStorage.getItem(THREAD_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as TellMitraConversationItem[];
        if (Array.isArray(parsed)) restored = parsed;
      }
    } catch {}
    try {
      const returnRaw = sessionStorage.getItem(RETURN_ROOM_KEY);
      if (returnRaw) {
        const pending = JSON.parse(returnRaw) as {
          room_id: string; room_label: string;
          return_key?: string;
          tell_mitra_event_id?: string | number | null;
          room_entry_context?: TellMitraRoomEntryContext | null;
        };
        sessionStorage.removeItem(RETURN_ROOM_KEY);
        const alreadyHasReturn = restored.some(
          item => item.type === "return_card" &&
            (item.return_key ? item.return_key === pending.return_key : item.room_id === pending.room_id)
        );
        if (!alreadyHasReturn) {
          restored.push({
            id: _id(), type: "return_card",
            room_id: pending.room_id, room_label: pending.room_label,
            return_key: pending.return_key,
            tell_mitra_event_id: pending.tell_mitra_event_id,
            room_entry_context: pending.room_entry_context,
          });
        }
      }
    } catch {}
    if (restored.length > 0) {
      setConversation(restored);
      setTimeout(() => threadBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 150);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist thread to sessionStorage ─────────────────────────────────────
  useEffect(() => {
    if (!THREAD_UI_ENABLED) return;
    try { sessionStorage.setItem(THREAD_STORAGE_KEY, JSON.stringify(conversation)); } catch {}
  }, [conversation]);

  // ── Flag-off: original submit ─────────────────────────────────────────────
  async function submit(override?: {
    text?: string;
    sourceSurface?: string;
    followup?: TellMitraFollowupMeta;
  }) {
    const inputText = (override?.text ?? text).trim();
    const inputSource = override?.sourceSurface ?? "tell_mitra_page_web";
    if (!inputText) { setError("Please share what's on your mind"); return; }
    if (inputText.length > 1000) { setError("Please keep it under 1000 characters"); return; }
    setError(null);
    setSubmitting(true);
    try {
      const resp = await postTellMitraV3({
        text: inputText,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        source_surface: inputSource,
        ...(override?.followup ? { followup: override.followup } : {}),
      });
      setResult(resp);
      if (resp.safety_flag === true) {
        setScreen("safety");
      } else if (resp.suggested_action === "navigate_to_room" && isValidRoomId(resp.suggested_room_id)) {
        setScreen("navigate_to_room");
      } else if (resp.suggested_action === "navigate_to_door" && resp.door) {
        setScreen("navigate_to_door");
      } else if (resp.suggested_action === "provide_wisdom_inline") {
        setScreen("provide_wisdom_inline");
      } else if (resp.suggested_action === "ask_followup") {
        setScreen("ask_followup");
      } else {
        setScreen("fallback");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Flag-off: original chip click ─────────────────────────────────────────
  function handleChipClick(opt: TellMitraFollowupOption) {
    if (opt.value === "let_me_tell") {
      setScreen("none");
      setText("");
      return;
    }
    if (opt.value === "calm_now") {
      void submit({
        text: "Just help me calm down",
        sourceSurface: "tell_mitra_followup_calm_now",
        followup: {
          prompt_id: null,
          selected_value: "calm_now",
          selected_label: opt.label,
          parent_tell_mitra_event_id: result?.tell_mitra_event_id ?? null,
          parent_intent_type: result?.intent_type ?? null,
        },
      });
      return;
    }
    const submitText = CHIP_SUBMIT_TEXT[opt.value] ?? opt.label;
    void submit({
      text: submitText,
      sourceSurface: "tell_mitra_followup_chip",
      followup: {
        prompt_id: null,
        selected_value: opt.value,
        selected_label: opt.label,
        parent_tell_mitra_event_id: result?.tell_mitra_event_id ?? null,
        parent_intent_type: result?.intent_type ?? null,
      },
    });
  }

  // ── Flag-on: thread submit ────────────────────────────────────────────────
  async function submitThread(
    inputText: string,
    sourceSurface: string,
    followupMeta?: TellMitraFollowupMeta,
  ) {
    const effectiveSource = freshResetPendingRef.current ? "tell_mitra_start_fresh" : sourceSurface;
    const isReset = freshResetPendingRef.current;
    freshResetPendingRef.current = false;
    const loadingId = _id();
    const now = new Date().toISOString();
    setConversation(prev => [...prev, { id: loadingId, type: "loading" }]);
    setSubmitting(true);
    setTimeout(() => threadBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    try {
      if (WEB_ENV.isDev) console.log('[S17-D4B] chip payload', {
        text: inputText.trim(),
        source_surface: effectiveSource,
        reset_context: isReset,
        followup: followupMeta,
      });
      const resp = await postTellMitraV3({
        text: inputText.trim(),
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        source_surface: effectiveSource,
        ...(followupMeta ? { followup: followupMeta } : {}),
        ...(isReset ? { reset_context: true } : {}),
      });
      if (WEB_ENV.isDev) console.log('[S17-D4B] tell_mitra response', {
        suggested_action: resp.suggested_action,
        suggested_room_id: resp.suggested_room_id,
        followup_question_prompt: resp.followup_question?.prompt,
        tell_mitra_event_id: resp.tell_mitra_event_id,
        room_entry_context: resp.room_entry_context,
      });
      // Update active context from response
      activeContextRef.current = {
        parentEventId: resp.tell_mitra_event_id ?? activeContextRef.current.parentEventId,
        parentIntentType: resp.intent_type ?? activeContextRef.current.parentIntentType,
        lifeContext:
          resp.room_entry_context?.situation?.life_context ??
          resp.conversation_context?.current_life_context ??
          activeContextRef.current.lifeContext,
        supportNeed: resp.support_need || activeContextRef.current.supportNeed,
        patternKey: resp.pattern_key ?? activeContextRef.current.patternKey,
        roomEntryContext: resp.room_entry_context ?? activeContextRef.current.roomEntryContext,
      };
      const newItems: TellMitraConversationItem[] = [];
      if (resp.safety_flag) {
        newItems.push({
          id: _id(), type: "safety",
          response_copy: resp.response_copy || "You are not alone. Please speak to someone you trust right now.",
        });
      } else {
        newItems.push({
          id: _id(), type: "mitra_response",
          response_copy: resp.response_copy,
          prior_context_summary: resp.prior_context_summary,
          conversation_stage: resp.conversation_stage,
          support_depth: resp.support_depth,
          created_at: now,
        });
        if (resp.followup_question) {
          newItems.push({
            id: _id(), type: "followup_chips",
            prompt: resp.followup_question.prompt,
            options: resp.followup_question.options,
            parent_tell_mitra_event_id: resp.tell_mitra_event_id,
            parent_intent_type: resp.intent_type,
            disabled: false,
          });
        } else if (resp.suggested_action === "navigate_to_room" && isValidRoomId(resp.suggested_room_id)) {
          newItems.push({
            id: _id(), type: "room_recommendation",
            room_id: resp.suggested_room_id,
            room_label: resp.suggested_room_label ?? getRoomLabel(resp.suggested_room_id),
            room_description: resp.suggested_room_description,
            secondary_room_id: resp.secondary_room_id,
            tell_mitra_event_id: resp.tell_mitra_event_id,
            room_entry_context: resp.room_entry_context,
            response_copy: resp.response_copy,
          });
        } else if (resp.next_options.length > 0) {
          newItems.push({ id: _id(), type: "wisdom_options", next_options: resp.next_options });
        }
      }
      setConversation(prev => [...prev.filter(i => i.id !== loadingId), ...newItems]);
    } catch {
      setConversation(prev => [
        ...prev.filter(i => i.id !== loadingId),
        { id: _id(), type: "error", message: "Something went wrong. Please try again." },
      ]);
    } finally {
      setSubmitting(false);
      setTimeout(() => threadBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }

  // ── Flag-on: chip click ───────────────────────────────────────────────────
  function handleChipClickThread(opt: TellMitraFollowupOption, chipGroupId: string) {
    const isReturnCard = chipGroupId.startsWith("return_card_");
    const chipGroup = conversation.find(
      (item): item is Extract<TellMitraConversationItem, { type: "followup_chips" }> =>
        item.id === chipGroupId && item.type === "followup_chips"
    );
    let returnCardItem: Extract<TellMitraConversationItem, { type: "return_card" }> | undefined;
    if (isReturnCard) {
      const rcId = chipGroupId.replace("return_card_", "");
      returnCardItem = conversation.find(
        (i): i is Extract<TellMitraConversationItem, { type: "return_card" }> =>
          i.id === rcId && i.type === "return_card"
      );
    }
    if (opt.value === "let_me_tell") {
      setConversation(prev =>
        prev.map(item => item.id === chipGroupId ? { ...item, disabled: true } as TellMitraConversationItem : item)
      );
      setComposerPlaceholder("What would you like Mitra to know?");
      setTimeout(() => composerRef.current?.focus(), 50);
      return;
    }
    if (opt.value === "tell_mitra_more") {
      handleTellMitraMoreThread();
      return;
    }
    // Disable chip group or return card
    if (isReturnCard) {
      const rcId = chipGroupId.replace("return_card_", "");
      setConversation(prev =>
        prev.map(item => item.id === rcId ? { ...item, disabled: true } as TellMitraConversationItem : item)
      );
    } else {
      setConversation(prev =>
        prev.map(item => item.id === chipGroupId ? { ...item, disabled: true } as TellMitraConversationItem : item)
      );
    }
    const userChip: TellMitraConversationItem = {
      id: _id(), type: "user_chip",
      label: opt.label, value: opt.value,
      created_at: new Date().toISOString(),
    };
    setConversation(prev => [...prev, userChip]);
    const mappedText = CHIP_SUBMIT_TEXT[opt.value];
    const sourceSurface = isReturnCard ? "room_return_chip" : "tell_mitra_followup_chip";
    const followupMeta: TellMitraFollowupMeta = {
      prompt_id: null,
      selected_value: opt.value,
      selected_label: opt.label,
      parent_tell_mitra_event_id:
        returnCardItem?.tell_mitra_event_id ??
        chipGroup?.parent_tell_mitra_event_id ??
        activeContextRef.current.parentEventId ?? null,
      parent_intent_type:
        chipGroup?.parent_intent_type ??
        activeContextRef.current.parentIntentType ?? null,
      life_context:
        returnCardItem?.room_entry_context?.situation?.life_context ??
        activeContextRef.current.lifeContext ?? null,
    };
    if (opt.value === "calm_now") {
      void submitThread("Just help me calm down", "tell_mitra_followup_calm_now", followupMeta);
    } else {
      void submitThread(mappedText ?? opt.label, sourceSurface, followupMeta);
    }
  }

  function handleTellMitraMoreThread() {
    setComposerPlaceholder("Add anything else Mitra should understand…");
    setTimeout(() => composerRef.current?.focus(), 50);
  }

  function handleQuickStartChip(value: string, label: string) {
    const apiText = value === "calm_now"
      ? "Just help me calm down"
      : (CHIP_SUBMIT_TEXT[value] ?? label);
    setConversation(prev => [...prev, {
      id: _id(), type: "user_message", text: label, created_at: new Date().toISOString()
    }]);
    void submitThread(apiText, "tell_mitra_quick_start");
  }

  function handleStartFresh() {
    setConversation([]);
    setText("");
    setComposerPlaceholder("What's on your mind…");
    freshResetPendingRef.current = true;
    activeContextRef.current = { parentEventId: null, parentIntentType: null, lifeContext: null, supportNeed: null, patternKey: null, roomEntryContext: null };
    try { sessionStorage.removeItem(THREAD_STORAGE_KEY); } catch {}
    try { sessionStorage.removeItem(RETURN_ROOM_KEY); } catch {}
  }

  function handleEnterRoom(item: Extract<TellMitraConversationItem, { type: "room_recommendation" }>) {
    const returnKey = `return_card:${item.room_id}:${item.tell_mitra_event_id ?? Math.floor(Date.now() / 60000)}`;
    try {
      if (WEB_ENV.isDev) console.log('[S17-D4B] enter_room payload', {
        room_id: item.room_id,
        tell_mitra_event_id: item.tell_mitra_event_id,
        room_entry_context: item.room_entry_context,
      });
      sessionStorage.setItem(RETURN_ROOM_KEY, JSON.stringify({
        room_id: item.room_id,
        room_label: item.room_label,
        tell_mitra_event_id: item.tell_mitra_event_id,
        room_entry_context: item.room_entry_context,
        timestamp: Date.now(),
        return_key: returnKey,
      }));
    } catch {}
    void executeAction(
      {
        type: "enter_room",
        payload: {
          room_id: item.room_id,
          source: "tell_mitra",
          tell_mitra_event_id: item.tell_mitra_event_id,
          room_entry_context: item.room_entry_context,
        },
      },
      { dispatch, screenData: screenState.screenData, currentStateId: "tell_mitra" }
    );
  }

  // ── Styles (shared between both paths) ───────────────────────────────────
  const CARD: React.CSSProperties = {
    border: "1px solid rgba(201,168,76,0.22)",
    borderRadius: 18,
    background: "rgba(250,245,240,0.92)",
    padding: "20px 20px",
    boxShadow: "0 8px 20px rgba(67,33,4,0.08)",
    marginBottom: 14,
  };

  const GOLD_BTN: React.CSSProperties = {
    width: "100%",
    padding: "14px 0",
    borderRadius: 14,
    border: "none",
    background: "linear-gradient(90deg, #C99317 0%, #E0AE21 50%, #C99317 100%)",
    color: "#fff",
    fontFamily: "var(--kalpx-font-serif)",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  };

  const GHOST_BTN: React.CSSProperties = {
    width: "100%",
    padding: "12px 0",
    borderRadius: 12,
    border: "1px solid rgba(201,168,76,0.35)",
    background: "transparent",
    color: "#7B6550",
    fontSize: 14,
    cursor: "pointer",
  };

  const PRIOR_CONTEXT_CARD: React.CSSProperties = {
    background: "rgba(201,168,76,0.06)",
    border: "1px solid rgba(201,168,76,0.18)",
    borderRadius: 10,
    padding: "10px 14px",
    marginBottom: 14,
    fontSize: 13,
    color: "#7B6550",
    fontStyle: "italic",
  };

  // ── Flag-off sub-components ───────────────────────────────────────────────
  function PriorContextCard() {
    if (!result?.prior_context_used || !result?.prior_context_summary) return null;
    return (
      <div style={PRIOR_CONTEXT_CARD}>
        {result.prior_context_summary}
        {result.prior_suggested_room_label && (
          <div style={{ marginTop: 4, fontWeight: 600, color: "#432104", fontStyle: "normal" }}>
            {result.prior_suggested_room_label}
          </div>
        )}
      </div>
    );
  }

  function ConversationSummary() {
    if (!result?.conversation_context?.summary) return null;
    return (
      <div style={{ fontSize: 13, color: "#7B6550", fontStyle: "italic", marginBottom: 12 }}>
        {result.conversation_context.summary}
      </div>
    );
  }

  function FollowupChips() {
    if (!result?.followup_question) return null;
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: "#7B6550", marginBottom: 8 }}>
          {result.followup_question.prompt}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {result.followup_question.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleChipClick(opt)}
              disabled={submitting}
              style={{
                padding: "7px 14px",
                borderRadius: 20,
                border: "1px solid rgba(201,168,76,0.35)",
                background: "transparent",
                color: "#7B6550",
                fontSize: 13,
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  function NextOptionsTiles() {
    if (!result?.next_options?.length) return null;
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: "#A08060", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 2 }}>
          Or try
        </div>
        {result.next_options.map((opt: TellMitraNextOption, i: number) => (
          <button
            key={i}
            onClick={() => {
              if (opt.action_type === "navigate_to_room" && opt.room_id) {
                void executeAction(
                  { type: "enter_room", payload: { room_id: opt.room_id, source: "tell_mitra_next_option" } },
                  { dispatch, screenData: screenState.screenData, currentStateId: "tell_mitra" }
                );
              } else if (opt.action_type === "navigate_to_door" && opt.door) {
                navigate(DOOR_ROUTES[opt.door] ?? "/en/mitra");
              }
            }}
            style={{ ...GHOST_BTN, textAlign: "left" as const, padding: "10px 14px" }}
          >
            {opt.label} — {opt.description}
          </button>
        ))}
      </div>
    );
  }

  // ── Flag-on: thread UI ────────────────────────────────────────────────────
  if (THREAD_UI_ENABLED) {
    return (
      <div style={{ minHeight: "100dvh", background: "#FFF8EF", display: "flex", flexDirection: "column" }}>
        <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px 0" }}>
          <div style={{ width: "100%", maxWidth: 740 }}>
            <button
              onClick={() => navigate("/en/mitra")}
              style={{ background: "none", border: "none", color: "#C99317", fontSize: 14, cursor: "pointer", marginBottom: 16, padding: 0 }}
            >
              ← Back
            </button>
          </div>
          <div style={{
            width: "100%", maxWidth: 740, flex: 1,
            display: "flex", flexDirection: "column",
            background: "#FAF7F2",
            borderRadius: "20px 20px 0 0",
            border: "1px solid rgba(201,168,76,0.15)",
            borderBottom: "none",
            boxShadow: "0 -4px 24px rgba(67,33,4,0.06)",
            overflow: "hidden",
            minHeight: "calc(100dvh - 100px)",
          }}>
            <TellMitraThreadView
              conversation={conversation}
              submitting={submitting}
              composerValue={text}
              composerPlaceholder={composerPlaceholder}
              composerRef={composerRef}
              threadBottomRef={threadBottomRef}
              onComposerChange={val => { setText(val); if (error) setError(null); }}
              onSubmit={input => {
                setText("");
                setConversation(prev => [...prev, { id: _id(), type: "user_message", text: input, created_at: new Date().toISOString() }]);
                void submitThread(input, "tell_mitra_page_web");
              }}
              onChipClick={handleChipClickThread}
              onEnterRoom={handleEnterRoom}
              onTellMitraMore={handleTellMitraMoreThread}
              onStartFresh={handleStartFresh}
              onQuickStartChip={handleQuickStartChip}
              onWisdomOptionPress={opt => {
                if (opt.action_type === "navigate_to_room" && opt.room_id) {
                  void executeAction(
                    { type: "enter_room", payload: { room_id: opt.room_id, source: "tell_mitra_next_option" } },
                    { dispatch, screenData: screenState.screenData, currentStateId: "tell_mitra" }
                  );
                } else if (opt.action_type === "navigate_to_door" && opt.door) {
                  navigate(DOOR_ROUTES[opt.door] ?? "/en/mitra");
                }
              }}
              error={error}
            />
          </div>
        </main>
      </div>
    );
  }

  // ── Flag-off: original UI (completely unchanged) ──────────────────────────
  return (
    <div style={{ minHeight: "100dvh", background: "#FFF8EF", display: "flex", flexDirection: "column" }}>
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px calc(92px + env(safe-area-inset-bottom))" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <button
            onClick={() => navigate("/en/mitra")}
            style={{ background: "none", border: "none", color: "#C99317", fontSize: 14, cursor: "pointer", marginBottom: 16, padding: 0 }}
          >
            ← Back
          </button>

          {/* Input section — always visible unless a result screen is shown */}
          {screen === "none" && (
            <div style={CARD}>
              <div style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 20, color: "#432104", marginBottom: 4 }}>
                Tell Mitra
              </div>
              <div style={{ fontSize: 14, color: "#7B6550", marginBottom: 14 }}>
                Share what you're carrying right now.
              </div>
              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); if (error) setError(null); }}
                maxLength={1000}
                rows={5}
                placeholder="What's on your mind…"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  border: "1px solid rgba(201,168,76,0.3)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  fontSize: 15,
                  fontFamily: "var(--kalpx-font-serif)",
                  color: "#432104",
                  background: "rgba(255,252,248,0.9)",
                  resize: "vertical",
                  outline: "none",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: "#A08060" }}>{text.length} / 1000</span>
                {error && <span style={{ fontSize: 13, color: "#e06060" }}>{error}</span>}
              </div>
              <button
                onClick={() => void submit()}
                disabled={submitting || !text.trim()}
                style={{ ...GOLD_BTN, opacity: (submitting || !text.trim()) ? 0.5 : 1, cursor: (submitting || !text.trim()) ? "not-allowed" : "pointer" }}
              >
                {submitting ? "Sending…" : "Tell Mitra"}
              </button>
              <button
                onClick={() => navigate("/en/mitra/checkin-quick")}
                style={{ ...GHOST_BTN, marginTop: 10 }}
              >
                Quick Check-in instead
              </button>
            </div>
          )}

          {/* navigate_to_room */}
          {screen === "navigate_to_room" && result && (
            <div style={CARD}>
              <div style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 18, color: "#C99317", marginBottom: 16 }}>
                Mitra heard you.
              </div>
              <ConversationSummary />
              <PriorContextCard />
              {result.response_copy && (
                <div style={{
                  background: "rgba(255,253,250,0.96)",
                  borderLeft: "3px solid rgba(201,168,76,0.6)",
                  borderRadius: "0 12px 12px 0",
                  padding: "20px 24px",
                  marginBottom: 24,
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 20,
                  lineHeight: 1.7,
                  color: "#432104",
                  fontStyle: "italic",
                }}>
                  {result.response_copy}
                </div>
              )}
              <FollowupChips />
              <div style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
                <div style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 16, color: "#432104" }}>
                  {result.suggested_room_label}
                </div>
                {result.suggested_room_description && (
                  <div style={{ fontSize: 14, color: "#7B6550", marginTop: 4 }}>{result.suggested_room_description}</div>
                )}
              </div>
              <button
                onClick={() => void executeAction(
                  { type: 'enter_room', payload: { room_id: result.suggested_room_id, source: 'tell_mitra', room_entry_context: result.room_entry_context } },
                  { dispatch, screenData: screenState.screenData, currentStateId: 'tell_mitra' }
                )}
                style={{ ...GOLD_BTN, opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? "Sending…" : `Go to ${result.suggested_room_label || "Room"}`}
              </button>
              {result.secondary_room_id && result.secondary_room_id !== result.suggested_room_id && (
                <button
                  onClick={() => void executeAction(
                    { type: 'enter_room', payload: { room_id: result.secondary_room_id!, source: 'tell_mitra_secondary' } },
                    { dispatch, screenData: screenState.screenData, currentStateId: 'tell_mitra' }
                  )}
                  style={{ ...GHOST_BTN, marginTop: 6 }}
                >
                  Or try {getRoomLabel(result.secondary_room_id as any)} →
                </button>
              )}
              <button onClick={() => { setScreen("none"); setText(""); }} style={{ ...GHOST_BTN, marginTop: 10 }}>
                Tell Mitra more
              </button>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button onClick={() => navigate("/en/mitra/checkin-quick")} style={{ ...GHOST_BTN, fontSize: 13 }}>
                  Quick Check-in
                </button>
                <button onClick={() => navigate("/en/mitra/quick-reset")} style={{ ...GHOST_BTN, fontSize: 13 }}>
                  Quick Reset
                </button>
              </div>
              <button onClick={() => navigate("/en/mitra")} style={{ background: "none", border: "none", color: "#A08060", fontSize: 13, cursor: "pointer", marginTop: 10, width: "100%" }}>
                Return Home
              </button>
            </div>
          )}

          {/* navigate_to_door */}
          {screen === "navigate_to_door" && result && (
            <div style={CARD}>
              <div style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 18, color: "#C99317", marginBottom: 16 }}>
                Mitra heard you.
              </div>
              <ConversationSummary />
              <PriorContextCard />
              {result.response_copy && (
                <div style={{
                  background: "rgba(255,253,250,0.96)",
                  borderLeft: "3px solid rgba(201,168,76,0.6)",
                  borderRadius: "0 12px 12px 0",
                  padding: "20px 24px",
                  marginBottom: 24,
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 20,
                  lineHeight: 1.7,
                  color: "#432104",
                  fontStyle: "italic",
                }}>
                  {result.response_copy}
                </div>
              )}
              <button
                onClick={() => { if (result.door) navigate(DOOR_ROUTES[result.door] ?? "/en/mitra"); }}
                style={GOLD_BTN}
              >
                Open {result.door ? getDoorLabel(result.door) : "Door"}
              </button>
              <button onClick={() => { setScreen("none"); setText(""); }} style={{ ...GHOST_BTN, marginTop: 10 }}>
                Tell Mitra more
              </button>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button onClick={() => navigate("/en/mitra/checkin-quick")} style={{ ...GHOST_BTN, fontSize: 13 }}>
                  Quick Check-in
                </button>
                <button onClick={() => navigate("/en/mitra/quick-reset")} style={{ ...GHOST_BTN, fontSize: 13 }}>
                  Quick Reset
                </button>
              </div>
              <button onClick={() => navigate("/en/mitra")} style={{ background: "none", border: "none", color: "#A08060", fontSize: 13, cursor: "pointer", marginTop: 10, width: "100%" }}>
                Return Home
              </button>
            </div>
          )}

          {/* provide_wisdom_inline */}
          {screen === "provide_wisdom_inline" && result && (
            <div style={CARD}>
              <div style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 18, color: "#C99317", marginBottom: 16 }}>
                Mitra heard you.
              </div>
              <ConversationSummary />
              <PriorContextCard />
              <div style={{
                background: "rgba(255,253,250,0.96)",
                borderLeft: "3px solid rgba(201,168,76,0.6)",
                borderRadius: "0 12px 12px 0",
                padding: "20px 24px",
                marginBottom: 20,
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 20,
                lineHeight: 1.7,
                color: "#432104",
                fontStyle: "italic",
              }}>
                {result.response_copy}
              </div>
              <NextOptionsTiles />
              <button onClick={() => { setScreen("none"); setText(""); }} style={GOLD_BTN}>
                Tell Mitra more
              </button>
              <button onClick={() => navigate("/en/mitra")} style={{ ...GHOST_BTN, marginTop: 8 }}>
                Return Home
              </button>
            </div>
          )}

          {/* ask_followup — listening mode, no room CTA */}
          {screen === "ask_followup" && result && (
            <div style={CARD}>
              <div style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 18, color: "#C99317", marginBottom: 16 }}>
                Mitra is listening.
              </div>
              <ConversationSummary />
              {result.response_copy && (
                <div style={{
                  background: "rgba(255,253,250,0.96)",
                  borderLeft: "3px solid rgba(201,168,76,0.6)",
                  borderRadius: "0 12px 12px 0",
                  padding: "20px 24px",
                  marginBottom: 24,
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 20,
                  lineHeight: 1.7,
                  color: "#432104",
                  fontStyle: "italic",
                }}>
                  {result.response_copy}
                </div>
              )}
              <FollowupChips />
              <button onClick={() => { setScreen("none"); setText(""); }} style={GOLD_BTN}>
                Tell Mitra more
              </button>
              <button onClick={() => navigate("/en/mitra")} style={{ ...GHOST_BTN, marginTop: 10 }}>
                Return Home
              </button>
            </div>
          )}

          {/* safety */}
          {screen === "safety" && result && (
            <div style={CARD}>
              <div style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 18, color: "#432104", marginBottom: 16 }}>
                Mitra hears you.
              </div>
              <div style={{ fontSize: 16, lineHeight: 1.8, color: "#432104", marginBottom: 24 }}>
                {result.response_copy || "You are not alone. Please speak to someone you trust right now."}
              </div>
              <button onClick={() => { setScreen("none"); setText(""); }} style={GOLD_BTN}>
                Tell Mitra more
              </button>
              <button onClick={() => navigate("/en/mitra")} style={{ ...GHOST_BTN, marginTop: 10 }}>
                Return Home
              </button>
            </div>
          )}

          {/* fallback */}
          {screen === "fallback" && result && (
            <div style={CARD}>
              <div style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 18, color: "#C99317", marginBottom: 16 }}>
                Mitra heard you.
              </div>
              <ConversationSummary />
              <PriorContextCard />
              {result.response_copy ? (
                <div style={{
                  background: "rgba(255,253,250,0.96)",
                  borderLeft: "3px solid rgba(201,168,76,0.6)",
                  borderRadius: "0 12px 12px 0",
                  padding: "20px 24px",
                  marginBottom: 20,
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 20,
                  lineHeight: 1.7,
                  color: "#432104",
                  fontStyle: "italic",
                }}>
                  {result.response_copy}
                </div>
              ) : (
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: "#432104", fontStyle: "italic", marginBottom: 20, lineHeight: 1.7 }}>
                  I'm here with you. Let me help you find where to go next.
                </p>
              )}
              <NextOptionsTiles />
              <button onClick={() => { setScreen("none"); setText(""); }} style={GOLD_BTN}>
                Tell Mitra more
              </button>
              <button onClick={() => navigate("/en/mitra")} style={{ ...GHOST_BTN, marginTop: 8 }}>
                Return Home
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
