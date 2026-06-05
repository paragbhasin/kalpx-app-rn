import { CHIP_SUBMIT_TEXT, getRoomLabel, isValidRoomId } from "@kalpx/contracts";
import type {
  TellMitraConversationItem,
  TellMitraFollowupOption,
  TellMitraNextOption,
} from "@kalpx/types";
import React from "react";
import { useTranslation } from "../../lib/i18n";

const ROBOTIC_PATTERNS = /scattered|agitated|drained|energized|balanced|state_tag|spl_pattern/i;

function shouldShowPriorContext(summary: string | null | undefined): boolean {
  if (!summary) return false;
  if (ROBOTIC_PATTERNS.test(summary)) return false;
  if (summary.trim().length < 10) return false;
  return true;
}

// ── Styles ───────────────────────────────────────────────────────────────────

const GOLD_BTN: React.CSSProperties = {
  width: "100%",
  padding: "14px 0",
  borderRadius: 14,
  border: "none",
  background: "linear-gradient(90deg, #C99317 0%, #E0AE21 50%, #C99317 100%)",
  color: "#fff",
  fontFamily: "var(--kalpx-font-serif, 'Cormorant Garamond', serif)",
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
  letterSpacing: 0.3,
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
  fontFamily: "inherit",
};

const CHIP_STYLE: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: 20,
  border: "1px solid rgba(201,168,76,0.5)",
  background: "rgba(255,250,243,0.95)",
  color: "#5C4B35",
  fontSize: 14,
  cursor: "pointer",
  fontFamily: "inherit",
  transition: "opacity 0.15s",
  whiteSpace: "nowrap" as const,
};

// ── Props ────────────────────────────────────────────────────────────────────

export interface TellMitraThreadViewProps {
  conversation: TellMitraConversationItem[];
  submitting: boolean;
  composerValue: string;
  composerPlaceholder: string;
  isDesktop?: boolean;
  composerRef: React.RefObject<HTMLTextAreaElement | null>;
  threadBottomRef: React.RefObject<HTMLDivElement | null>;
  onComposerChange: (val: string) => void;
  onSubmit: (text: string) => void;
  onChipClick: (opt: TellMitraFollowupOption, chipGroupId: string) => void;
  onEnterRoom: (item: Extract<TellMitraConversationItem, { type: "room_recommendation" }>) => void;
  onTellMitraMore: () => void;
  onStartFresh: () => void;
  onQuickStartChip: (value: string, label: string) => void;
  onWisdomOptionPress: (opt: TellMitraNextOption) => void;
  error?: string | null;
}

// ── Component ────────────────────────────────────────────────────────────────

export function TellMitraThreadView({
  conversation,
  submitting,
  composerValue,
  composerPlaceholder,
  isDesktop = false,
  composerRef,
  threadBottomRef,
  onComposerChange,
  onSubmit,
  onChipClick,
  onEnterRoom,
  onTellMitraMore,
  onStartFresh,
  onQuickStartChip,
  onWisdomOptionPress,
  error,
}: TellMitraThreadViewProps) {
  const { t } = useTranslation();
  const contentMaxWidth = isDesktop ? 760 : undefined;
  const bubbleMaxWidth = isDesktop ? "68%" : "75%";
  const chipMaxWidth = isDesktop ? "52%" : "60%";

  const QUICK_START_CHIPS = [
    { label: t("mitra.tellMitra.quickStart.overwhelmed"), value: "overwhelmed"  },
    { label: t("mitra.tellMitra.quickStart.needClarity"), value: "need_clarity" },
    { label: t("mitra.tellMitra.quickStart.disconnected"), value: "disconnected" },
    { label: t("mitra.tellMitra.quickStart.calmDown"),    value: "calm_now"     },
  ];

  const RETURN_CARD_CHIPS: TellMitraFollowupOption[] = [
    { label: t("mitra.tellMitra.returnCard.moreSteady"), value: "more_steady"    },
    { label: t("mitra.tellMitra.returnCard.stillHeavy"), value: "still_heavy"    },
    { label: t("mitra.tellMitra.returnCard.needClarity"), value: "need_clarity"  },
    { label: t("mitra.tellMitra.tellMitraMore"),         value: "tell_mitra_more" },
  ];

  function renderItem(item: TellMitraConversationItem) {
    // ── user_message ─────────────────────────────────────────────────────────
    if (item.type === "user_message") {
      return (
        <div key={item.id} style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <div style={{
            background: "#F5E9C8",
            borderRadius: isDesktop ? "20px 20px 6px 20px" : "18px 18px 4px 18px",
            padding: isDesktop ? "14px 20px" : "12px 18px",
            maxWidth: bubbleMaxWidth,
            fontSize: isDesktop ? 17 : 16,
            color: "#3B2A1A",
            lineHeight: 1.65,
            fontFamily: "inherit",
            boxShadow: isDesktop ? "0 10px 24px rgba(67,33,4,0.06)" : "none",
          }}>
            {item.text}
          </div>
        </div>
      );
    }

    // ── user_chip ────────────────────────────────────────────────────────────
    if (item.type === "user_chip") {
      return (
        <div key={item.id} style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <div style={{
            background: "rgba(201,168,76,0.12)",
            border: "1px solid rgba(201,168,76,0.4)",
            borderRadius: isDesktop ? "18px 18px 6px 18px" : "16px 16px 4px 16px",
            padding: isDesktop ? "9px 16px" : "7px 14px",
            maxWidth: chipMaxWidth,
            fontSize: 14,
            color: "#7B6550",
            fontStyle: "italic",
          }}>
            {item.label}
          </div>
        </div>
      );
    }

    // ── mitra_response ───────────────────────────────────────────────────────
    if (item.type === "mitra_response") {
      if (!item.response_copy) return null;
      return (
        <div key={item.id} style={{ marginBottom: isDesktop ? 24 : 20, maxWidth: isDesktop ? "80%" : "85%" }}>
          <div style={{ fontSize: 11, color: "#B8963E", marginBottom: 8, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" as const }}>
            Mitra
          </div>
          {shouldShowPriorContext(item.prior_context_summary) && (
            <div style={{ fontSize: 12, color: "#9B8B77", fontStyle: "italic", marginBottom: 8, padding: "4px 8px", background: "rgba(201,168,76,0.04)", borderRadius: 6 }}>
              {item.prior_context_summary}
            </div>
          )}
          <div style={{
            fontFamily: "var(--kalpx-font-serif, 'Cormorant Garamond', serif)",
            fontSize: isDesktop ? 20 : 18,
            lineHeight: isDesktop ? 1.9 : 1.85,
            color: "#3B2A1A",
          }}>
            {item.response_copy}
          </div>
        </div>
      );
    }

    // ── followup_chips ───────────────────────────────────────────────────────
    if (item.type === "followup_chips") {
      if (item.disabled) return null;
      return (
        <div key={item.id} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#7B6550", marginBottom: 10 }}>{item.prompt}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {item.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => { if (!item.disabled && !submitting) onChipClick(opt, item.id); }}
                disabled={item.disabled || submitting}
                style={{
                  ...CHIP_STYLE,
                  opacity: (item.disabled || submitting) ? 0.4 : 1,
                  cursor: (item.disabled || submitting) ? "not-allowed" : "pointer",
                  background: item.disabled ? "rgba(240,235,228,0.6)" : CHIP_STYLE.background,
                  color: item.disabled ? "#BBAA99" : "#5C4B35",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // ── room_recommendation ──────────────────────────────────────────────────
    if (item.type === "room_recommendation") {
      return (
        <div key={item.id} style={{ marginBottom: 24 }}>
          <div style={{
            border: "1px solid rgba(201,168,76,0.25)",
            borderRadius: isDesktop ? 24 : 20,
            background: "rgba(255,253,249,0.98)",
            padding: isDesktop ? "24px 26px" : "20px 22px",
            boxShadow: isDesktop
              ? "0 12px 28px rgba(67,33,4,0.08)"
              : "0 6px 24px rgba(67,33,4,0.07)",
          }}>
            <div style={{ fontSize: 11, color: "#B8963E", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 14 }}>
              {t('mitra.tellMitra.recommendedNext')}
            </div>
            <div style={{ fontFamily: "var(--kalpx-font-serif, 'Cormorant Garamond', serif)", fontWeight: 700, fontSize: isDesktop ? 22 : 20, color: "#3B2A1A", marginBottom: 6 }}>
              {item.room_label}
            </div>
            {item.room_description && (
              <div style={{ fontSize: isDesktop ? 15 : 14, color: "#7B6550", marginBottom: 18, lineHeight: 1.6 }}>{item.room_description}</div>
            )}
            <button onClick={() => onEnterRoom(item)} style={{ ...GOLD_BTN, marginBottom: 10 }}>
              {t('mitra.tellMitra.enterRoom').replace('{{roomLabel}}', item.room_label)}
            </button>
            <button onClick={onTellMitraMore} style={GHOST_BTN}>
              {t('mitra.tellMitra.tellMitraMore')}
            </button>
            {item.secondary_room_id && isValidRoomId(item.secondary_room_id) && item.secondary_room_id !== item.room_id && (
              <button
                onClick={() => onChipClick({ label: t('mitra.tellMitra.orTryRoom').replace('{{room}}', item.secondary_room_label || getRoomLabel(item.secondary_room_id as any)), value: `secondary_room_${item.secondary_room_id}` }, item.id)}
                style={{ background: "none", border: "none", color: "#9B7B55", fontSize: 13, cursor: "pointer", marginTop: 10, width: "100%", fontFamily: "inherit" }}
              >
                {t('mitra.tellMitra.orTryRoom').replace('{{room}}', item.secondary_room_label || getRoomLabel(item.secondary_room_id as any))}
              </button>
            )}
          </div>
        </div>
      );
    }

    // ── return_card ──────────────────────────────────────────────────────────
    if (item.type === "return_card") {
      return (
        <div key={item.id} style={{ marginBottom: 20 }}>
         <div style={{
            background: "rgba(245,240,233,0.85)",
            border: "1px solid rgba(201,168,76,0.2)",
            borderRadius: isDesktop ? 20 : 16,
            padding: isDesktop ? "20px 22px" : "18px 20px",
          }}>
            <div style={{ fontFamily: "var(--kalpx-font-serif, 'Cormorant Garamond', serif)", fontSize: 16, color: "#3B2A1A", fontWeight: 600, marginBottom: 4 }}>
              {t('mitra.tellMitra.returnCard.backFrom').replace('{{roomLabel}}', item.room_label)}
            </div>
            <div style={{ fontSize: 13, color: "#7B6550", marginBottom: 14 }}>
              {t('mitra.tellMitra.returnCard.prompt')}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {RETURN_CARD_CHIPS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    if (opt.value === "tell_mitra_more") { onTellMitraMore(); return; }
                    onChipClick(opt, `return_card_${item.id}`);
                  }}
                  disabled={submitting}
                  style={{ ...CHIP_STYLE, opacity: submitting ? 0.4 : 1 }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // ── wisdom_options ───────────────────────────────────────────────────────
    if (item.type === "wisdom_options") {
      return (
        <div key={item.id} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "#B8963E", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 10 }}>
            {t('mitra.tellMitra.orTry')}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {item.next_options.map((opt, i) => (
              <button
                key={i}
                onClick={() => onWisdomOptionPress(opt)}
                style={{ ...GHOST_BTN, textAlign: "left" as const, padding: "10px 14px", fontSize: 14 }}
              >
                {opt.label} — <span style={{ color: "#9B8B77" }}>{opt.description}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // ── safety ───────────────────────────────────────────────────────────────
    if (item.type === "safety") {
      return (
        <div key={item.id} style={{ marginBottom: 20, background: "rgba(240,236,230,0.9)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ fontFamily: "var(--kalpx-font-serif, 'Cormorant Garamond', serif)", fontWeight: 700, fontSize: 17, color: "#3B2A1A", marginBottom: 10 }}>
            {t('mitra.tellMitra.mitraHearsYou')}
          </div>
          <div style={{ fontSize: 16, lineHeight: 1.8, color: "#3B2A1A" }}>{item.response_copy}</div>
        </div>
      );
    }

    // ── loading ───────────────────────────────────────────────────────────────
    if (item.type === "loading") {
      return (
        <div key={item.id} style={{ marginBottom: 16, maxWidth: "85%" }}>
          <div style={{ fontSize: 11, color: "#B8963E", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 8 }}>
            Mitra
          </div>
          <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
            {[0, 1, 2].map(i => (
              <span key={i} style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#C9A84C",
                animation: "tmDotBlink 1.2s infinite",
                animationDelay: `${i * 200}ms`,
                opacity: 0.3,
              }} />
            ))}
          </div>
          <style>{`@keyframes tmDotBlink { 0%,100%{opacity:0.3} 50%{opacity:1} }`}</style>
        </div>
      );
    }

    // ── error ────────────────────────────────────────────────────────────────
    if (item.type === "error") {
      return (
        <div key={item.id} style={{ color: "#c0392b", fontSize: 13, marginBottom: 12, padding: "8px 10px", background: "rgba(220,50,50,0.04)", borderRadius: 8, border: "1px solid rgba(220,50,50,0.15)" }}>
          {item.message}
        </div>
      );
    }

    return null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header bar with Start fresh */}
      {conversation.length > 0 && (
        <div style={{ padding: isDesktop ? "16px 28px 0" : "12px 24px 0", display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onStartFresh}
            style={{ background: "none", border: "none", color: "#A08060", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
          >
            {t('mitra.tellMitra.startFresh')}
          </button>
        </div>
      )}

      {/* Scrollable thread area */}
      <div style={{ flex: 1, overflowY: "auto", padding: conversation.length === 0 ? (isDesktop ? "40px 40px 12px" : "32px 28px 8px") : (isDesktop ? "20px 40px 12px" : "16px 28px 8px") }}>
        <div style={{ width: "100%", maxWidth: contentMaxWidth, margin: "0 auto" }}>

        {/* Empty state */}
        {conversation.length === 0 && (
          <div>
            <div style={{ fontFamily: "var(--kalpx-font-serif, 'Cormorant Garamond', serif)", fontSize: isDesktop ? 34 : 26, fontWeight: 700, color: "#3B2A1A", marginBottom: 8, lineHeight: 1.15 }}>
              {t('mitra.tellMitra.tellMitraCta')}
            </div>
            <div style={{ fontSize: isDesktop ? 17 : 15, color: "#7B6550", marginBottom: 4, lineHeight: 1.6, maxWidth: isDesktop ? 620 : undefined }}>
              {t('mitra.tellMitra.threadSubtitle')}
            </div>
            <div style={{ fontSize: 13, color: "#9B8B77", marginBottom: 24 }}>
              {t('mitra.tellMitra.threadHint')}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {QUICK_START_CHIPS.map(chip => (
                <button
                  key={chip.value}
                  onClick={() => onQuickStartChip(chip.value, chip.label)}
                  disabled={submitting}
                  style={{ ...CHIP_STYLE, opacity: submitting ? 0.5 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation items */}
        {conversation.map(item => renderItem(item))}
        <div ref={threadBottomRef} style={{ height: 1 }} />
        </div>
      </div>

      {/* Sticky composer */}
      <div style={{
        borderTop: "1px solid rgba(201,168,76,0.18)",
        background: "#FAF7F2",
        padding: isDesktop
          ? "18px 28px calc(18px + env(safe-area-inset-bottom))"
          : "14px 20px calc(14px + env(safe-area-inset-bottom))",
        flexShrink: 0,
      }}>
        <div style={{ width: "100%", maxWidth: contentMaxWidth, margin: "0 auto" }}>
        {error && <div style={{ fontSize: 13, color: "#e06060", marginBottom: 6 }}>{error}</div>}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <textarea
            ref={composerRef}
            value={composerValue}
            onChange={e => onComposerChange(e.target.value)}
            placeholder={composerPlaceholder}
            maxLength={1000}
            rows={2}
            style={{
              flex: 1,
              boxSizing: "border-box" as const,
              border: "1px solid rgba(201,168,76,0.35)",
              borderRadius: isDesktop ? 16 : 14,
              padding: isDesktop ? "12px 16px" : "10px 14px",
              fontSize: isDesktop ? 16 : 15,
              fontFamily: "var(--kalpx-font-serif, 'Cormorant Garamond', serif)",
              color: "#3B2A1A",
              background: "rgba(255,253,249,0.98)",
              resize: "none" as const,
              outline: "none",
              lineHeight: 1.5,
            }}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey && !submitting && composerValue.trim()) {
                e.preventDefault();
                onSubmit(composerValue.trim());
              }
            }}
          />
          <button
            onClick={() => { if (!submitting && composerValue.trim()) onSubmit(composerValue.trim()); }}
            disabled={submitting || !composerValue.trim()}
            style={{
              ...GOLD_BTN,
              width: "auto",
              padding: isDesktop ? "12px 24px" : "10px 20px",
              fontSize: isDesktop ? 15 : 14,
              flexShrink: 0,
              opacity: (submitting || !composerValue.trim()) ? 0.5 : 1,
              cursor: (submitting || !composerValue.trim()) ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "…" : t('mitra.tellMitra.send')}
          </button>
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 11, color: "#A08060", lineHeight: 1.55, textAlign: "center", fontFamily: "var(--kalpx-font-sans)" }}>
          Mitra is here for reflection and Sanatan-rooted guidance. It is not a substitute for medical, legal, financial, therapy, crisis, or emergency support. Share only what you feel comfortable sharing.
        </p>
        </div>
      </div>
    </div>
  );
}
