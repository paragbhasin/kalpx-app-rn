/**
 * InquiryModal — web equivalent of RN InquiryModal (Phase 13.5).
 * Two-screen flow: category list → category detail with journal/practice actions.
 */
import { useEffect, useState } from "react";

interface InquiryCategory {
  id: string;
  label: string;
  anchor_line?: string | null;
  reflective_prompt?: string | null;
  prompt?: string | null;
  suggested_practice_template_id?: string | null;
  practice_label?: string | null;
}

interface InquiryPayload {
  categories?: InquiryCategory[];
  body?: string;
  description?: string;
  prompt?: string;
}

const MAX_TEXT = 1000;

interface Props {
  visible: boolean;
  label: string;
  inquiryPayload?: InquiryPayload | null;
  onCancel: () => void;
  onLaunchPractice: (category: InquiryCategory, templateId: string) => void;
  onSubmitJournal: (category: InquiryCategory, text: string) => void;
  onOpened?: () => void;
  onCategorySelected?: (category: InquiryCategory) => void;
  presentation?: "modal" | "screen";
  /** When true: enables room-guided UX (auto-select single category, optional journal, companion label). */
  isRoomGuided?: boolean;
}

export function InquiryModal({
  visible,
  label,
  inquiryPayload,
  onCancel,
  onLaunchPractice,
  onSubmitJournal,
  onOpened,
  onCategorySelected,
  presentation = "modal",
  isRoomGuided = false,
}: Props) {
  const [selected, setSelected] = useState<InquiryCategory | null>(null);
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalText, setJournalText] = useState("");
  const [openedFired, setOpenedFired] = useState(false);

  useEffect(() => {
    if (visible && !openedFired) {
      setOpenedFired(true);
      onOpened?.();
    }
    if (!visible) {
      setOpenedFired(false);
      setSelected(null);
      setJournalOpen(false);
      setJournalText("");
    }
  }, [visible, openedFired, onOpened]);

  // Auto-select single category in room context.
  useEffect(() => {
    if (isRoomGuided && visible && !selected) {
      const cats = inquiryPayload?.categories ?? [];
      if (cats.length === 1) {
        setSelected(cats[0]);
        onCategorySelected?.(cats[0]);
      }
    }
  }, [isRoomGuided, visible, inquiryPayload, selected, onCategorySelected]);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [visible, onCancel]);

  if (!visible) return null;

  const categories = inquiryPayload?.categories ?? [];
  const isScreen = presentation === "screen";

  const handleSelect = (cat: InquiryCategory) => {
    setSelected(cat);
    setJournalOpen(false);
    setJournalText("");
    onCategorySelected?.(cat);
  };

  const handleBack = () => {
    setSelected(null);
    setJournalOpen(false);
    setJournalText("");
  };

  const handleJournalDone = () => {
    if (!selected) return;
    const trimmed = journalText.trim();
    if (!isRoomGuided && trimmed.length < 1) return;
    onSubmitJournal(selected, trimmed);
  };

  const handlePractice = () => {
    if (!selected) return;
    const tid = selected.suggested_practice_template_id;
    if (!tid) return;
    onLaunchPractice(selected, tid);
  };

  const currentTitle = selected ? selected.label : label;
  const showImmersiveJournal = isScreen && !!selected && journalOpen;
  const showImmersiveList = isScreen && !selected;
  const showImmersiveDetail = isScreen && !!selected && !journalOpen;

  return (
    <div
      style={{
        position: isScreen ? "relative" : "fixed",
        inset: isScreen ? undefined : 0,
        background: isScreen ? "transparent" : "rgba(0,0,0,0.35)",
        zIndex: isScreen ? undefined : 300,
        display: "flex",
        alignItems: isScreen ? "stretch" : "flex-end",
        justifyContent: "center",
        minHeight: isScreen ? "100%" : undefined,
      }}
      onClick={(e) => !isScreen && e.target === e.currentTarget && onCancel()}
      data-testid="inquiry-modal-backdrop"
    >
      <div
        data-testid="inquiry-modal"
        style={{
          width: "100%",
          maxWidth: isScreen ? 780 : 480,
          background: isScreen ? "transparent" : "#fdf8ef",
          borderRadius: isScreen ? 0 : "24px 24px 0 0",
          padding: "25px 0 32px",
          minHeight: isScreen ? "100%" : undefined,
          maxHeight: isScreen ? "100dvh" : "90dvh",
          overflowY: "auto",
        }}
      >
        {!isScreen && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "12px 0 4px",
            }}
          >
            <div
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                background: "#E0E0E2",
              }}
            />
          </div>
        )}

        {/* Header row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: isScreen ? "0px 24px 10px" : "14px 16px",
            gap: 8,
            justifyContent:
              showImmersiveJournal || showImmersiveDetail
                ? "space-between"
                : undefined,
          }}
        >
          {selected ? (
            <button
              data-testid="inquiry-modal-back"
              onClick={handleBack}
              style={
                showImmersiveJournal || showImmersiveDetail
                  ? {
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      border: "1px solid rgba(212, 166, 74, 0.85)",
                      background: "rgba(255,255,255,0.42)",
                      fontSize: 24,
                      color: "#A57A2B",
                      cursor: "pointer",
                      padding: 0,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                    }
                  : {
                      background: "none",
                      border: "none",
                      fontSize: 15,
                      color: "#6E6E73",
                      cursor: "pointer",
                      padding: 0,
                      flexShrink: 0,
                    }
              }
            >
              {showImmersiveJournal || showImmersiveDetail ? "‹" : "Back"}
            </button>
          ) : (
            <button
              data-testid="inquiry-modal-cancel"
              onClick={onCancel}
              style={{
                background: "none",
                border: "none",
                fontSize: 15,
                color: "#6E6E73",
                cursor: "pointer",
                padding: 0,
                flexShrink: 0,
              }}
            >
              Cancel
            </button>
          )}
          <p
            style={{
              flex: 1,
              fontSize:
                showImmersiveJournal || showImmersiveDetail || showImmersiveList
                  ? 15
                  : 16,
              fontWeight: 600,
              color: "#432104",
              textAlign: "center",
              margin: 0,
              opacity:
                showImmersiveJournal || showImmersiveDetail || showImmersiveList
                  ? 0
                  : 1,
              pointerEvents:
                showImmersiveJournal || showImmersiveDetail || showImmersiveList
                  ? "none"
                  : undefined,
            }}
          >
            {showImmersiveJournal || showImmersiveDetail || showImmersiveList
              ? ""
              : currentTitle}
          </p>
          {/* Spacer to balance the left button */}
          <div
            style={
              showImmersiveJournal || showImmersiveDetail || showImmersiveList
                ? {
                    width: 52,
                    flexShrink: 0,
                    display: "flex",
                    justifyContent: "flex-end",
                  }
                : { width: 50, flexShrink: 0 }
            }
          >
            {showImmersiveJournal ||
            showImmersiveDetail ||
            showImmersiveList ? (
              <button
                data-testid="inquiry-modal-cancel"
                onClick={onCancel}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 15,
                  color: "#4F4B46",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: isScreen ? "12px 24px 24px" : "12px 24px 0" }}>
          {!selected ? (
            /* Category list */
            <div data-testid="inquiry-modal-category-list">
              {categories.length === 0 ? (
                <p
                  style={{
                    fontSize: 14,
                    color: "#8E8E93",
                    textAlign: "center",
                    padding: "40px 0",
                  }}
                >
                  No categories.
                </p>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {showImmersiveList && (
                    <div style={{ textAlign: "center", marginBottom: 10 }}>
                      <img
                        src="/lotus_icon.png"
                        alt=""
                        style={{
                          width: 34,
                          height: 28,
                          opacity: 0.9,
                          margin: "0 auto 14px",
                          display: "block",
                        }}
                      />
                      <p
                        style={{
                          margin: "0 0 14px",
                          fontFamily: "var(--kalpx-font-serif)",
                          fontSize: "clamp(28px, 7vw, 40px)",
                          lineHeight: 1.12,
                          color: "#432104",
                          fontWeight: 700,
                          textWrap: "balance",
                        }}
                      >
                        {label}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 14,
                          color: "#D4A64A",
                          marginBottom: 18,
                        }}
                      >
                        <div
                          style={{
                            width: 60,
                            height: 1,
                            background: "rgba(212,166,74,0.42)",
                          }}
                        />
                        <span style={{ fontSize: 16, lineHeight: 1 }}>◇</span>
                        <div
                          style={{
                            width: 60,
                            height: 1,
                            background: "rgba(212,166,74,0.42)",
                          }}
                        />
                      </div>
                      {!!(
                        inquiryPayload?.body ||
                        inquiryPayload?.description ||
                        inquiryPayload?.prompt
                      ) && (
                        <p
                          style={{
                            margin: "0 auto 24px",
                            fontSize: 18,
                            lineHeight: 1.7,
                            color: "#5D5348",
                            maxWidth: 560,
                            textWrap: "balance",
                          }}
                        >
                          {inquiryPayload?.body ||
                            inquiryPayload?.description ||
                            inquiryPayload?.prompt}
                        </p>
                      )}
                    </div>
                  )}
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      data-testid={`inquiry-modal-category-${cat.id}`}
                      onClick={() => handleSelect(cat)}
                      style={{
                        padding: showImmersiveList ? "16px" : "16px",
                        borderRadius: 999,
                        border: "1px solid rgba(214, 183, 130, 0.72)",
                        background: showImmersiveList
                          ? "linear-gradient(180deg, rgba(255,251,245,0.78), rgba(255,247,236,0.58))"
                          : "none",
                        cursor: "pointer",
                        textAlign: "center",
                        boxShadow: showImmersiveList
                          ? "0 12px 28px rgba(166,125,54,0.07), inset 0 1px 0 rgba(255,255,255,0.65)"
                          : "none",
                      }}
                    >
                      <span
                        style={{
                          fontSize: showImmersiveList ? 17 : 15,
                          fontWeight: 600,
                          color: "#432104",
                          lineHeight: 1.35,
                        }}
                      >
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Category detail */
            <div data-testid="inquiry-modal-category-detail">
              {showImmersiveDetail && (
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                  <img
                    src="/lotus_icon.png"
                    alt=""
                    style={{
                      width: 34,
                      height: 28,
                      opacity: 0.9,
                      margin: "0 auto 14px",
                      display: "block",
                    }}
                  />
                  <p
                    style={{
                      margin: "0 0 14px",
                      fontFamily: "var(--kalpx-font-serif)",
                      fontSize: "clamp(28px, 7vw, 40px)",
                      lineHeight: 1.12,
                      color: "#432104",
                      fontWeight: 700,
                      textWrap: "balance",
                    }}
                  >
                    {selected.label}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 14,
                      color: "#D4A64A",
                      marginBottom: 18,
                    }}
                  >
                    <div
                      style={{
                        width: 60,
                        height: 1,
                        background: "rgba(212,166,74,0.42)",
                      }}
                    />
                    <span style={{ fontSize: 16, lineHeight: 1 }}>◇</span>
                    <div
                      style={{
                        width: 60,
                        height: 1,
                        background: "rgba(212,166,74,0.42)",
                      }}
                    />
                  </div>
                  {!!selected.anchor_line && (
                    <p
                      style={{
                        margin: "0 0 18px",
                        fontSize: 15,
                        lineHeight: 1.6,
                        color: "#B67912",
                        fontStyle: "italic",
                        maxWidth: 540,
                        marginInline: "auto",
                      }}
                    >
                      {selected.anchor_line}
                    </p>
                  )}
                  <p
                    style={{
                      margin: 0,
                      fontSize: 18,
                      lineHeight: 1.65,
                      color: "#432104",
                      maxWidth: 560,
                      marginInline: "auto",
                      textWrap: "balance",
                    }}
                  >
                    {selected.reflective_prompt || selected.prompt || ""}
                  </p>
                </div>
              )}
              {!showImmersiveJournal &&
                !showImmersiveDetail &&
                selected.anchor_line && (
                  <p
                    style={{
                      fontSize: 16,
                      color: "#432104",
                      textAlign: "center",
                      lineHeight: 1.75,
                      marginBottom: 16,
                      fontWeight: 300,
                    }}
                  >
                    {selected.anchor_line}
                  </p>
                )}
              {!showImmersiveJournal && !showImmersiveDetail && (
                <p
                  style={{
                    fontSize: 15,
                    color: "#432104",
                    textAlign: "center",
                    lineHeight: 1.5,
                    marginBottom: 24,
                  }}
                >
                  {selected.reflective_prompt || selected.prompt || ""}
                </p>
              )}

              {!journalOpen ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: showImmersiveDetail ? 18 : 10,
                  }}
                >
                  {selected.suggested_practice_template_id && (
                    <button
                      data-testid="inquiry-modal-try-practice"
                      onClick={handlePractice}
                      style={{
                        padding: showImmersiveDetail ? 15 : 15,
                        borderRadius: showImmersiveDetail ? 28 : 15,
                        border: showImmersiveDetail
                          ? "1px solid rgba(212, 183, 132, 0.48)"
                          : "0.3px solid #9f9f9f",
                        background: showImmersiveDetail
                          ? "linear-gradient(180deg, rgba(255,251,245,0.82), rgba(255,247,236,0.62))"
                          : "#FBF5F5",
                        fontSize: showImmersiveDetail ? 18 : 17,
                        fontWeight: 600,
                        color: "#432104",
                        cursor: "pointer",
                        boxShadow: showImmersiveDetail
                          ? "0 14px 30px rgba(166,125,54,0.08), inset 0 1px 0 rgba(255,255,255,0.72)"
                          : "0 3px 8px rgba(0,0,0,0.1)",
                      }}
                    >
                      {selected.practice_label || "Try a practice"}
                    </button>
                  )}
                  <button
                    data-testid="inquiry-modal-open-journal"
                    onClick={() => setJournalOpen(true)}
                    style={{
                      padding: showImmersiveDetail ? 15 : 15,
                      borderRadius: showImmersiveDetail ? 28 : 15,
                      border: showImmersiveDetail
                        ? "1px solid rgba(212, 183, 132, 0.48)"
                        : "0.3px solid #9f9f9f",
                      background: showImmersiveDetail
                        ? "linear-gradient(180deg, rgba(255,251,245,0.82), rgba(255,247,236,0.62))"
                        : "#FBF5F5",
                      fontSize: showImmersiveDetail ? 18 : 17,
                      fontWeight: 600,
                      color: "#432104",
                      cursor: "pointer",
                      boxShadow: showImmersiveDetail
                        ? "0 14px 30px rgba(166,125,54,0.08), inset 0 1px 0 rgba(255,255,255,0.72)"
                        : "0 3px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    {isRoomGuided ? "Write a few words" : "Journal on this"}
                  </button>
                </div>
              ) : (
                <div data-testid="inquiry-modal-journal-block">
                  {showImmersiveJournal && (
                    <div style={{ textAlign: "center", marginBottom: 26 }}>
                      <img
                        src="/lotus_icon.png"
                        alt=""
                        style={{
                          width: 34,
                          height: 28,
                          opacity: 0.9,
                          margin: "0 auto 14px",
                          display: "block",
                        }}
                      />
                      <p
                        style={{
                          margin: "0 0 14px",
                          fontFamily: "var(--kalpx-font-serif)",
                          fontSize: "clamp(28px, 7vw, 40px)",
                          lineHeight: 1.12,
                          color: "#432104",
                          fontWeight: 700,
                          textWrap: "balance",
                        }}
                      >
                        {selected.label}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 14,
                          color: "#D4A64A",
                          marginBottom: 18,
                        }}
                      >
                        <div
                          style={{
                            width: 60,
                            height: 1,
                            background: "rgba(212,166,74,0.42)",
                          }}
                        />
                        <span style={{ fontSize: 16, lineHeight: 1 }}>◇</span>
                        <div
                          style={{
                            width: 60,
                            height: 1,
                            background: "rgba(212,166,74,0.42)",
                          }}
                        />
                      </div>
                      {!!selected.anchor_line && (
                        <p
                          style={{
                            margin: "0 0 18px",
                            fontSize: 15,
                            lineHeight: 1.6,
                            color: "#B67912",
                            fontStyle: "italic",
                            maxWidth: 540,
                            marginInline: "auto",
                          }}
                        >
                          {selected.anchor_line}
                        </p>
                      )}
                      <p
                        style={{
                          margin: 0,
                          fontSize: 18,
                          lineHeight: 1.65,
                          color: "#432104",
                          maxWidth: 560,
                          marginInline: "auto",
                          textWrap: "balance",
                        }}
                      >
                        {selected.reflective_prompt || selected.prompt || ""}
                      </p>
                    </div>
                  )}
                  <div
                    style={{
                      position: "relative",
                      marginBottom: showImmersiveJournal ? 18 : 8,
                    }}
                  >
                    <textarea
                      value={journalText}
                      onChange={(e) =>
                        setJournalText(e.target.value.slice(0, MAX_TEXT))
                      }
                      placeholder="Write what comes..."
                      data-testid="inquiry-modal-journal-input"
                      maxLength={MAX_TEXT}
                      style={{
                        width: "100%",
                        minHeight: showImmersiveJournal ? 260 : 160,
                        border: showImmersiveJournal
                          ? "1px solid rgba(214, 183, 130, 0.7)"
                          : "1px solid #D8D8D8",
                        borderRadius: showImmersiveJournal ? 32 : 12,
                        padding: showImmersiveJournal
                          ? "28px 28px 42px"
                          : "12px 12px 28px",
                        fontSize: showImmersiveJournal ? 16 : 15,
                        color: "#432104",
                        background: showImmersiveJournal
                          ? "rgba(255,255,255,0.56)"
                          : "rgba(255,255,255,0.5)",
                        resize: showImmersiveJournal ? "none" : "vertical",
                        boxSizing: "border-box",
                        lineHeight: 1.6,
                        outline: "none",
                      }}
                    />
                    <p
                      style={{
                        position: "absolute",
                        right: showImmersiveJournal ? 18 : 12,
                        bottom: showImmersiveJournal ? 14 : 8,
                        fontSize: 12,
                        color: "#8E8E93",
                        margin: 0,
                        pointerEvents: "none",
                      }}
                    >
                      {journalText.length} / {MAX_TEXT}
                    </p>
                  </div>
                  <button
                    data-testid="inquiry-modal-journal-done"
                    disabled={!isRoomGuided && journalText.trim().length < 1}
                    onClick={handleJournalDone}
                    style={{
                      width: "100%",
                      padding: showImmersiveJournal ? 10 : 15,
                      borderRadius: 999,
                      border: showImmersiveJournal
                        ? "1px solid rgba(212, 183, 132, 0.28)"
                        : "0.3px solid #9f9f9f",
                      background:
                        "linear-gradient(180deg, #6D3A10 0%, #4D2408 100%)",
                      fontSize: showImmersiveJournal ? 18 : 17,
                      fontWeight: 600,
                      color: showImmersiveJournal ? "#FFF8EF" : "#432104",
                      cursor:
                        (isRoomGuided || journalText.trim().length >= 1) ? "pointer" : "default",
                      opacity: (isRoomGuided || journalText.trim().length >= 1) ? 1 : 0.45,
                      boxShadow: showImmersiveJournal
                        ? "0 14px 30px rgba(140, 103, 63, 0.16)"
                        : undefined,
                    }}
                  >
                    Done
                  </button>
                  {showImmersiveJournal && (
                    <button
                      type="button"
                      onClick={onCancel}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: 16,
                        color: "#4F4B46",
                        cursor: "pointer",
                        display: "block",
                        margin: "18px auto 0",
                        textDecoration: "underline",
                        textUnderlineOffset: 6,
                      }}
                    >
                      I'll go now
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
