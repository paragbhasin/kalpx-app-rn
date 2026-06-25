import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchMyTemplate,
  GuideTemplate,
  LibraryMantra,
  LibraryPractice,
  LibrarySankalp,
  submitTemplateForReview,
  TemplateDay,
  updateTemplateDay,
} from "../../engine/liveSessionApi";
import { GuideLibraryPickerModal, LibrarySlot, PickerItem } from "./GuideLibraryPickerModal";

interface DayState extends TemplateDay {
  saving: boolean;
}

type PickerTarget = { dayNumber: number; slot: LibrarySlot } | null;

export function GuideTemplateDayEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const templateId = parseInt(id ?? "0", 10);

  const [template, setTemplate] = useState<GuideTemplate | null>(null);
  const [days, setDays] = useState<DayState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget>(null);
  // slotSelections stores the full display data for each selected library item.
  // Key: "${dayNumber}-${slot}" e.g. "1-mantra". Lost on page refresh (ephemeral).
  const [slotSelections, setPickerItems] = useState<Record<string, PickerItem>>({});
  const [activeDay, setActiveDay] = useState(1);
  const dayRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!templateId) return;
    fetchMyTemplate(templateId)
      .then((tmpl) => {
        setTemplate(tmpl);
        setDays((tmpl.days ?? []).map((d) => ({ ...d, saving: false })));
      })
      .catch(() => setError("Could not load template."))
      .finally(() => setLoading(false));
  }, [templateId]);

  const saveDay = useCallback(
    async (dayNumber: number, patch: Partial<TemplateDay>) => {
      // Optimistic update — apply patch immediately so UI is instant.
      // On success we only clear `saving`; we do NOT spread the API response
      // back onto state, because concurrent saves (e.g. theme blur + mantra pick)
      // would overwrite each other's results with stale field values.
      setDays((prev) =>
        prev.map((d) => (d.day_number === dayNumber ? { ...d, ...patch, saving: true } : d)),
      );
      try {
        await updateTemplateDay(templateId, dayNumber, patch);
        setDays((prev) =>
          prev.map((d) => (d.day_number === dayNumber ? { ...d, saving: false } : d)),
        );
      } catch {
        setDays((prev) =>
          prev.map((d) => (d.day_number === dayNumber ? { ...d, saving: false } : d)),
        );
      }
    },
    [templateId],
  );

  function updateDayLocal(dayNumber: number, patch: Partial<TemplateDay>) {
    setDays((prev) =>
      prev.map((d) => (d.day_number === dayNumber ? { ...d, ...patch } : d)),
    );
  }

  function storePickerItem(dayNumber: number, slot: LibrarySlot, sel: PickerItem) {
    setPickerItems((prev) => ({ ...prev, [`${dayNumber}-${slot}`]: sel }));
  }

  function applyToAllDays(slot: LibrarySlot, item_id: string, title: string) {
    const patch =
      slot === "mantra"
        ? { mantra_ref: item_id, custom_mantra_title: "", custom_mantra_body: "" }
        : slot === "sankalp"
        ? { sankalp_ref: item_id, custom_sankalp_title: "", custom_sankalp_body: "" }
        : slot === "wisdom"
        ? { wisdom_ref: item_id, custom_wisdom_body: "" }
        : { practice_ref: item_id, custom_practice_title: "", custom_practice_body: "" };

    days.forEach((d) => {
      saveDay(d.day_number, patch);
      // Propagate selection label to all days
      setPickerItems((prev) => {
        const src = prev[`${days[0]?.day_number}-${slot}`];
        return src ? { ...prev, [`${d.day_number}-${slot}`]: src } : prev;
      });
    });
    setPickerTarget(null);
  }

  function handleLibrarySelect(item: PickerItem) {
    if (!pickerTarget) return;
    const { dayNumber, slot } = pickerTarget;
    const patch =
      slot === "mantra"
        ? { mantra_ref: item.item_id, custom_mantra_title: "", custom_mantra_body: "" }
        : slot === "sankalp"
        ? { sankalp_ref: item.item_id, custom_sankalp_title: "", custom_sankalp_body: "" }
        : slot === "wisdom"
        ? { wisdom_ref: item.item_id, custom_wisdom_body: "" }
        : { practice_ref: item.item_id, custom_practice_title: "", custom_practice_body: "" };
    saveDay(dayNumber, patch);
    storePickerItem(dayNumber, slot, item);
    setPickerTarget(null);
  }

  async function handleSubmit() {
    // Validate: every day must have at least one slot filled
    const emptyDays = days.filter((d) => {
      const hasRef = d.mantra_ref || d.sankalp_ref || d.practice_ref || d.wisdom_ref;
      const hasCustom = d.custom_mantra_body || d.custom_sankalp_body ||
        d.custom_practice_body || d.custom_wisdom_body;
      return !hasRef && !hasCustom;
    });
    if (emptyDays.length > 0) {
      const nums = emptyDays.map((d) => `Day ${d.day_number}`).join(", ");
      setError(`Each day needs at least one content slot (Mantra, Sankalp, Practice, or Wisdom). Missing: ${nums}`);
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await submitTemplateForReview(templateId);
      setSubmitted(true);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Could not submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p style={hint}>Loading editor…</p>;
  if (error && !template) return <p style={errorText}>{error}</p>;
  if (submitted) {
    return (
      <div style={page}>
        <div style={inner}>
          <div style={successBox}>
            <h2 style={{ color: "#432104", margin: "0 0 8px" }}>Submitted for Review 🙏</h2>
            <p style={{ color: "#7A6652", margin: "0 0 20px", fontSize: 14 }}>
              KalpX will review your program within 3–5 business days. You'll be notified once approved.
            </p>
            <button style={primaryBtn} onClick={() => navigate("/guide/dashboard")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const locked = !!template?.locked_at;
  const canSubmit =
    template?.review_status === "draft" || template?.review_status === "changes_requested";

  const navBarHeight = days.length > 1 ? 56 : 0;

  return (
    <div style={page}>
      {/* Fixed day navigator — always visible at top when template has multiple days */}
      {days.length > 1 && (
        <div style={dayNavBar}>
          <div style={dayNavScroll}>
            {days.map((day) => {
              const hasContent = day.mantra_ref || day.sankalp_ref || day.practice_ref || day.wisdom_ref ||
                day.custom_mantra_body || day.custom_sankalp_body || day.custom_practice_body || day.custom_wisdom_body;
              const isActive = activeDay === day.day_number;
              return (
                <button
                  key={day.day_number}
                  onClick={() => {
                    setActiveDay(day.day_number);
                    const el = dayRefs.current[day.day_number];
                    if (el) {
                      const top = el.getBoundingClientRect().top + window.scrollY - navBarHeight - 8;
                      window.scrollTo({ top, behavior: "smooth" });
                    }
                  }}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 20,
                    border: isActive ? "2px solid #C99317" : "2px solid #E8DECE",
                    background: isActive ? "#C99317" : hasContent ? "#FFF8EC" : "#fff",
                    color: isActive ? "#fff" : hasContent ? "#7A5C00" : "#B5A08A",
                    fontSize: 12,
                    fontWeight: isActive ? 700 : 500,
                    cursor: "pointer",
                    whiteSpace: "nowrap" as const,
                    flexShrink: 0,
                    position: "relative" as const,
                  }}
                >
                  Day {day.day_number}
                  {hasContent && !isActive && (
                    <span style={{
                      position: "absolute" as const, top: -3, right: -3,
                      width: 7, height: 7, borderRadius: "50%",
                      background: "#C99317", border: "1.5px solid #fff",
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ ...inner, paddingTop: navBarHeight + 24 }}>
        <button onClick={() => navigate("/guide/templates")} style={backBtn}>← Back to templates</button>

        <div style={headerRow}>
          <div>
            <p style={eyebrow}>GUIDE TOOLS · TEMPLATE BUILDER</p>
            <h1 style={heading}>{template?.title ?? "Edit Program"}</h1>
            <p style={reviewBadge(template?.review_status ?? "")}>
              {STATUS_LABEL[template?.review_status ?? ""] ?? template?.review_status}
            </p>
          </div>
          {!locked && canSubmit && (
            <button style={submitBtn} onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit for Review"}
            </button>
          )}
        </div>

        {pickerTarget && (
          <GuideLibraryPickerModal
            slot={pickerTarget.slot}
            onSelect={handleLibrarySelect}
            onClose={() => setPickerTarget(null)}
          />
        )}

        {locked && (
          <div style={lockBanner}>
            This template is locked — a campaign is already running from it. Create a new version to make changes.
          </div>
        )}

        {error && <p style={errorText}>{error}</p>}

        {/* Repeat Day 1 shortcut */}
        {!locked && days.length > 1 && (
          <div style={repeatBanner}>
            <span style={{ fontSize: 13, color: "#7A6652" }}>
              Set Day 1 first, then repeat it across all days in one click.
            </span>
            <button
              style={repeatBtn}
              onClick={() => {
                const day1 = days[0];
                if (!day1) return;
                const patch: Partial<TemplateDay> = {
                  mantra_ref: day1.mantra_ref,
                  custom_mantra_title: day1.custom_mantra_title,
                  custom_mantra_body: day1.custom_mantra_body,
                  sankalp_ref: day1.sankalp_ref,
                  custom_sankalp_title: day1.custom_sankalp_title,
                  custom_sankalp_body: day1.custom_sankalp_body,
                  practice_ref: day1.practice_ref,
                  custom_practice_title: day1.custom_practice_title,
                  custom_practice_body: day1.custom_practice_body,
                  wisdom_ref: day1.wisdom_ref,
                  custom_wisdom_body: day1.custom_wisdom_body,
                  day_join_url: day1.day_join_url,
                  day_session_time: day1.day_session_time,
                  day_session_timezone: day1.day_session_timezone,
                };
                days.slice(1).forEach((d) => saveDay(d.day_number, patch));
                // Copy slot selection labels/details from Day 1 to all other days
                const slots: LibrarySlot[] = ["mantra", "sankalp", "practice", "wisdom"];
                setPickerItems((prev) => {
                  const next = { ...prev };
                  slots.forEach((slot) => {
                    const src = prev[`${day1.day_number}-${slot}`];
                    if (src) {
                      days.slice(1).forEach((d) => { next[`${d.day_number}-${slot}`] = src; });
                    }
                  });
                  return next;
                });
              }}
            >
              Repeat Day 1 for all days →
            </button>
          </div>
        )}

        {/* Day rows */}
        <div style={dayGrid}>
          {days.map((day) => (
            <div
              key={day.day_number}
              ref={(el) => { dayRefs.current[day.day_number] = el; }}
            >
              <DayRow
                day={day}
                locked={locked}
                slotSelections={slotSelections}
                onOpenPicker={(slot) =>
                  setPickerTarget({ dayNumber: day.day_number, slot })
                }
                onApplyToAll={(slot, item_id, title) => applyToAllDays(slot, item_id, title)}
                onBlurSave={(patch) => saveDay(day.day_number, patch)}
                onLocalChange={(patch) => updateDayLocal(day.day_number, patch)}
              />
            </div>
          ))}
        </div>

        {!locked && canSubmit && (
          <div style={{ textAlign: "center" as const, marginTop: 32 }}>
            <button style={submitBtn} onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting…" : "Submit for Review"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft — not submitted",
  submitted: "Submitted — awaiting KalpX review",
  under_review: "Under review",
  changes_requested: "Changes requested",
  approved: "Approved",
  active: "Active",
  rejected: "Rejected",
};

// ── DayRow ────────────────────────────────────────────────────────────────────

interface DayRowProps {
  day: DayState;
  locked: boolean;
  slotSelections: Record<string, PickerItem>;
  onOpenPicker: (slot: LibrarySlot) => void;
  onApplyToAll: (slot: LibrarySlot, item_id: string, title: string) => void;
  onBlurSave: (patch: Partial<TemplateDay>) => void;
  onLocalChange: (patch: Partial<TemplateDay>) => void;
}

function DayRow({ day, locked, slotSelections, onOpenPicker, onApplyToAll, onBlurSave, onLocalChange }: DayRowProps) {
  const sel = (slot: LibrarySlot) => slotSelections[`${day.day_number}-${slot}`] ?? null;

  return (
    <div style={dayCard}>
      <div style={dayHeader}>
        <span style={dayNumber}>Day {day.day_number}</span>
        {day.saving && <span style={savingDot}>saving…</span>}
      </div>

      {/* Theme */}
      <FieldRow label="Theme / Title">
        <input
          style={fieldInput}
          value={day.theme}
          disabled={locked}
          onChange={(e) => onLocalChange({ theme: e.target.value })}
          onBlur={() => onBlurSave({ theme: day.theme })}
          placeholder="e.g. Surrender & Trust"
        />
      </FieldRow>

      {/* Mantra */}
      <SlotRow
        label="Mantra"
        refValue={day.mantra_ref}
        selection={sel("mantra")}
        customTitle={day.custom_mantra_title}
        customBody={day.custom_mantra_body}
        locked={locked}
        onOpenPicker={() => onOpenPicker("mantra")}
        onApplyToAll={(id, title) => onApplyToAll("mantra", id, title)}
        onClearRef={() => onBlurSave({ mantra_ref: "" })}
        onCustomChange={(title, body) => {
          onLocalChange({ custom_mantra_title: title, custom_mantra_body: body });
        }}
        onCustomBlur={(title, body) =>
          onBlurSave({ custom_mantra_title: title, custom_mantra_body: body, mantra_ref: "" })
        }
      />

      {/* Sankalp */}
      <SlotRow
        label="Sankalp"
        refValue={day.sankalp_ref}
        selection={sel("sankalp")}
        customTitle={day.custom_sankalp_title}
        customBody={day.custom_sankalp_body}
        locked={locked}
        onOpenPicker={() => onOpenPicker("sankalp")}
        onApplyToAll={(id, title) => onApplyToAll("sankalp", id, title)}
        onClearRef={() => onBlurSave({ sankalp_ref: "" })}
        onCustomChange={(title, body) => {
          onLocalChange({ custom_sankalp_title: title, custom_sankalp_body: body });
        }}
        onCustomBlur={(title, body) =>
          onBlurSave({ custom_sankalp_title: title, custom_sankalp_body: body, sankalp_ref: "" })
        }
      />

      {/* Practice */}
      <SlotRow
        label="Practice"
        refValue={day.practice_ref}
        selection={sel("practice")}
        customTitle={day.custom_practice_title}
        customBody={day.custom_practice_body}
        locked={locked}
        onOpenPicker={() => onOpenPicker("practice")}
        onApplyToAll={(id, title) => onApplyToAll("practice", id, title)}
        onClearRef={() => onBlurSave({ practice_ref: "" })}
        onCustomChange={(title, body) => {
          onLocalChange({ custom_practice_title: title, custom_practice_body: body });
        }}
        onCustomBlur={(title, body) =>
          onBlurSave({ custom_practice_title: title, custom_practice_body: body, practice_ref: "" })
        }
      />

      {/* Wisdom */}
      <SlotRow
        label="Wisdom"
        refValue={day.wisdom_ref}
        selection={sel("wisdom")}
        customTitle=""
        customBody={day.custom_wisdom_body}
        locked={locked}
        onOpenPicker={() => onOpenPicker("wisdom")}
        onApplyToAll={(id, title) => onApplyToAll("wisdom", id, title)}
        onClearRef={() => onBlurSave({ wisdom_ref: "" })}
        onCustomChange={(_title, body) => {
          onLocalChange({ custom_wisdom_body: body });
        }}
        onCustomBlur={(_title, body) =>
          onBlurSave({ custom_wisdom_body: body, wisdom_ref: "" })
        }
      />

      {/* Join URL + Time */}
      <FieldRow label="Live session link for this day (optional)">
        <input
          style={fieldInput}
          value={day.day_join_url}
          disabled={locked}
          onChange={(e) => onLocalChange({ day_join_url: e.target.value })}
          onBlur={() => onBlurSave({ day_join_url: day.day_join_url })}
          placeholder="https://meet.google.com/… or Zoom link"
        />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, flexWrap: "wrap" as const }}>
          <label style={timeLabel}>Session time</label>
          <input
            type="time"
            style={timeInput}
            value={day.day_session_time}
            disabled={locked}
            onChange={(e) => onLocalChange({ day_session_time: e.target.value })}
            onBlur={() => onBlurSave({ day_session_time: day.day_session_time })}
          />
          <select
            style={tzSelect}
            value={day.day_session_timezone || "IST"}
            disabled={locked}
            onChange={(e) => {
              onLocalChange({ day_session_timezone: e.target.value });
              onBlurSave({ day_session_timezone: e.target.value });
            }}
          >
            <option value="IST">IST (UTC+5:30)</option>
            <option value="UTC">UTC</option>
            <option value="GMT">GMT (UTC+0)</option>
            <option value="EST">EST (UTC-5)</option>
            <option value="EDT">EDT (UTC-4)</option>
            <option value="CST">CST (UTC-6)</option>
            <option value="CDT">CDT (UTC-5)</option>
            <option value="MST">MST (UTC-7)</option>
            <option value="PST">PST (UTC-8)</option>
            <option value="PDT">PDT (UTC-7)</option>
            <option value="CET">CET (UTC+1)</option>
            <option value="CEST">CEST (UTC+2)</option>
            <option value="GST">GST (UTC+4)</option>
            <option value="SGT">SGT (UTC+8)</option>
            <option value="JST">JST (UTC+9)</option>
            <option value="AEST">AEST (UTC+10)</option>
            <option value="AEDT">AEDT (UTC+11)</option>
          </select>
          <span style={urlHint}>Leave blank if no specific time.</span>
        </div>
      </FieldRow>

      {/* Reflection prompt */}
      <FieldRow label="Reflection prompt (optional)">
        <input
          style={fieldInput}
          value={day.reflection_prompt}
          disabled={locked}
          onChange={(e) => onLocalChange({ reflection_prompt: e.target.value })}
          onBlur={() => onBlurSave({ reflection_prompt: day.reflection_prompt })}
          placeholder="What are you grateful for today?"
        />
      </FieldRow>
    </div>
  );
}

// ── SlotRow ───────────────────────────────────────────────────────────────────

interface SlotRowProps {
  label: string;
  refValue: string;
  selection: PickerItem | null;
  customTitle: string;
  customBody: string;
  locked: boolean;
  onOpenPicker: () => void;
  onApplyToAll: (item_id: string, title: string) => void;
  onClearRef: () => void;
  onCustomChange: (title: string, body: string) => void;
  onCustomBlur: (title: string, body: string) => void;
}

function SlotRow({
  label, refValue, selection, customTitle, customBody, locked,
  onOpenPicker, onApplyToAll, onClearRef, onCustomChange, onCustomBlur,
}: SlotRowProps) {
  const [mode, setMode] = useState<"library" | "custom">(
    customBody ? "custom" : "library",
  );
  const [localTitle, setLocalTitle] = useState(customTitle);
  const [localBody, setLocalBody] = useState(customBody);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setLocalTitle(customTitle);
    setLocalBody(customBody);
    if (customBody) setMode("custom");
  }, [customTitle, customBody]);

  function switchToCustom() {
    setMode("custom");
    onClearRef();
  }

  const displayTitle = selection?.title || refValue;
  const displaySubtitle = selection?.subtitle || "";
  const displayMeta = selection?.meta || "";

  return (
    <FieldRow label={label}>
      {/* Mode toggle */}
      {!locked && (
        <div style={modeToggle}>
          <button
            style={modeBtn(mode === "library")}
            onClick={() => setMode("library")}
          >
            From library
          </button>
          <button
            style={modeBtn(mode === "custom")}
            onClick={switchToCustom}
          >
            Write my own
          </button>
        </div>
      )}

      {mode === "library" ? (
        <div style={libRow}>
          {refValue ? (
            <div style={selectedCard}>
              <div style={selectedCardTop}>
                <span style={selectedCardTitle}>{displayTitle}</span>
                <div style={selectedCardActions}>
                  <button style={detailsBtn} onClick={() => setShowDetails((v) => !v)}>
                    {showDetails ? "Hide details" : "View details"}
                  </button>
                  {!locked && (
                    <>
                      <button style={changeBtn} onClick={onOpenPicker}>Change</button>
                      <button style={changeBtn} onClick={onClearRef}>✕</button>
                    </>
                  )}
                </div>
              </div>
              {showDetails && (
                <div style={detailsPanel}>
                  {(selection?.details ?? []).map((d) => (
                    <div key={d.label} style={detailFieldRow}>
                      <span style={detailFieldLabel}>{d.label}</span>
                      {Array.isArray(d.value) ? (
                        <ul style={detailList}>
                          {(d.value as string[]).map((v, i) => (
                            <li key={i} style={detailListItem}>{v}</li>
                          ))}
                        </ul>
                      ) : (
                        <p style={detailFieldValue}>{d.value as string}</p>
                      )}
                    </div>
                  ))}
                  {(!selection?.details || selection.details.length === 0) && displaySubtitle && (
                    <p style={detailFieldValue}>{displaySubtitle}</p>
                  )}
                </div>
              )}
              {!locked && (
                <button style={applyAllBtn} onClick={() => onApplyToAll(refValue, displayTitle)}>
                  Apply to all days
                </button>
              )}
            </div>
          ) : (
            !locked && (
              <button style={pickBtn} onClick={onOpenPicker}>
                + Pick from library
              </button>
            )
          )}
        </div>
      ) : (
        <div>
          <input
            style={{ ...fieldInput, marginBottom: 4 }}
            placeholder={`${label} title`}
            value={localTitle}
            disabled={locked}
            onChange={(e) => {
              setLocalTitle(e.target.value);
              onCustomChange(e.target.value, localBody);
            }}
            onBlur={() => onCustomBlur(localTitle, localBody)}
          />
          <textarea
            style={textArea}
            placeholder={`${label} text / description…`}
            value={localBody}
            disabled={locked}
            onChange={(e) => {
              setLocalBody(e.target.value);
              onCustomChange(localTitle, e.target.value);
            }}
            onBlur={() => onCustomBlur(localTitle, localBody)}
          />
          <p style={reviewNote}>
            Your custom content will be reviewed by KalpX before the program goes live.
          </p>
        </div>
      )}
    </FieldRow>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={fieldRow}>
      <p style={fieldLabel}>{label}</p>
      {children}
    </div>
  );
}

function reviewBadge(status: string): React.CSSProperties {
  const color =
    status === "approved" || status === "active" ? "#22863a"
    : status === "submitted" || status === "under_review" ? "#0969da"
    : status === "changes_requested" ? "#d97706"
    : status === "rejected" ? "#C0392B"
    : "#8B6F4E";
  return { display: "inline-block" as const, fontSize: 12, fontWeight: 600, color, marginTop: 4 };
}

function modeBtn(active: boolean): React.CSSProperties {
  return {
    padding: "4px 12px", fontSize: 12, borderRadius: 20, cursor: "pointer",
    background: active ? "#C99317" : "none",
    color: active ? "#fff" : "#8B6F4E",
    border: active ? "none" : "1px solid #DDD3C0",
    fontWeight: active ? 700 : 400,
  };
}

const page: React.CSSProperties = { minHeight: "100vh", background: "#FAF7F2", padding: "0 16px 80px" };
const inner: React.CSSProperties = { maxWidth: 720, margin: "0 auto", paddingTop: 24 };
const backBtn: React.CSSProperties = { background: "none", border: "none", cursor: "pointer", color: "#8B6F4E", fontSize: 13, padding: 0, marginBottom: 20 };
const headerRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap" as const, gap: 12 };
const eyebrow: React.CSSProperties = { fontSize: 10, letterSpacing: "1.2px", color: "#8B6F4E", textTransform: "uppercase" as const, marginBottom: 4 };
const heading: React.CSSProperties = { fontSize: 22, fontWeight: 800, color: "#432104", margin: "0 0 4px" };
const submitBtn: React.CSSProperties = { padding: "10px 22px", background: "#432104", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 };
const lockBanner: React.CSSProperties = { background: "#FEF3D0", border: "1px solid #C99317", borderRadius: 8, padding: "10px 16px", fontSize: 13, color: "#7A4E00", marginBottom: 20 };
const errorText: React.CSSProperties = { color: "#C0392B", fontSize: 13, marginBottom: 16 };
const dayGrid: React.CSSProperties = { display: "flex", flexDirection: "column" as const, gap: 20 };
const dayNavBar: React.CSSProperties = {
  position: "fixed" as const, top: 0, left: 0, right: 0, zIndex: 100,
  background: "#FAF7F2", borderBottom: "1px solid #E8DECE",
  padding: "8px 16px",
};
const dayNavScroll: React.CSSProperties = {
  display: "flex", gap: 8, overflowX: "auto" as const,
  maxWidth: 720, margin: "0 auto",
  scrollbarWidth: "none" as const,
  msOverflowStyle: "none" as const,
};
const dayCard: React.CSSProperties = { background: "#fff", border: "1px solid #E8DECE", borderRadius: 12, padding: "18px 22px" };
const dayHeader: React.CSSProperties = { display: "flex", alignItems: "center", gap: 10, marginBottom: 14 };
const dayNumber: React.CSSProperties = { fontSize: 14, fontWeight: 800, color: "#432104" };
const savingDot: React.CSSProperties = { fontSize: 11, color: "#B5A08A" };
const fieldRow: React.CSSProperties = { marginBottom: 14 };
const fieldLabel: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: "#8B6F4E", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: 6 };
const fieldInput: React.CSSProperties = { width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #DDD3C0", fontSize: 13, color: "#432104", boxSizing: "border-box" as const };
const textArea: React.CSSProperties = { ...fieldInput, minHeight: 72, resize: "vertical" as const, fontFamily: "inherit" };
const urlHint: React.CSSProperties = { fontSize: 11, color: "#B5A08A", marginTop: 3 };
const modeToggle: React.CSSProperties = { display: "flex", gap: 6, marginBottom: 8 };
const libRow: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const };
const selectedItem: React.CSSProperties = { fontSize: 12, color: "#432104", background: "#F5EFE5", padding: "4px 10px", borderRadius: 6 };
const changeBtn: React.CSSProperties = { background: "none", border: "1px solid #DDD3C0", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", color: "#8B6F4E" };
const detailsBtn: React.CSSProperties = { background: "none", border: "1px solid #C99317", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", color: "#C99317", fontWeight: 600 };
const pickBtn: React.CSSProperties = { background: "#FEF3D0", border: "1px solid #C99317", borderRadius: 8, padding: "7px 14px", fontSize: 12, cursor: "pointer", color: "#7A4E00", fontWeight: 600 };
const applyAllBtn: React.CSSProperties = { background: "none", border: "none", fontSize: 11, color: "#C99317", cursor: "pointer", textDecoration: "underline", marginTop: 6 };
const selectedCard: React.CSSProperties = { background: "#F5EFE5", border: "1px solid #DDD3C0", borderRadius: 8, padding: "10px 12px", width: "100%" };
const selectedCardTop: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" as const };
const selectedCardTitle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "#432104", flex: 1, lineHeight: 1.4 };
const selectedCardActions: React.CSSProperties = { display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" as const };
const detailsPanel: React.CSSProperties = { marginTop: 10, paddingTop: 10, borderTop: "1px solid #DDD3C0", display: "flex", flexDirection: "column" as const, gap: 10 };
const detailFieldRow: React.CSSProperties = {};
const detailFieldLabel: React.CSSProperties = { display: "block", fontSize: 10, fontWeight: 700, color: "#B5A08A", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 3 };
const detailFieldValue: React.CSSProperties = { fontSize: 13, color: "#432104", margin: 0, lineHeight: 1.5 };
const detailList: React.CSSProperties = { margin: "0", paddingLeft: 18, display: "flex", flexDirection: "column" as const, gap: 4 };
const detailListItem: React.CSSProperties = { fontSize: 13, color: "#432104", lineHeight: 1.5 };
const reviewNote: React.CSSProperties = { fontSize: 11, color: "#B5A08A", marginTop: 4 };
const successBox: React.CSSProperties = { background: "#fff", border: "1px solid #DDD3C0", borderRadius: 12, padding: "40px 32px", textAlign: "center" as const, maxWidth: 480, margin: "80px auto" };
const primaryBtn: React.CSSProperties = { padding: "10px 22px", background: "#C99317", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 };
const hint: React.CSSProperties = { textAlign: "center" as const, color: "#B5A08A", padding: "60px 0", fontSize: 14 };
const repeatBanner: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 10, background: "#FEF9ED", border: "1px solid #E8D9A0", borderRadius: 10, padding: "12px 18px", marginBottom: 20 };
const repeatBtn: React.CSSProperties = { padding: "8px 16px", background: "#432104", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" as const };
const timeLabel: React.CSSProperties = { fontSize: 12, color: "#7A6652", fontWeight: 600, whiteSpace: "nowrap" as const };
const timeInput: React.CSSProperties = { padding: "6px 10px", borderRadius: 8, border: "1px solid #DDD3C0", fontSize: 13, color: "#432104" };
const tzSelect: React.CSSProperties = { padding: "6px 10px", borderRadius: 8, border: "1px solid #DDD3C0", fontSize: 13, color: "#432104", background: "#fff", cursor: "pointer" };
