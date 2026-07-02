import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  fetchMyTemplate,
  GuideTemplate,
  LibraryMantra,
  LibraryPractice,
  LibrarySankalp,
  LibraryWisdom,
  TemplateDay,
} from "../../engine/liveSessionApi";
import { api } from "../../lib/api";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  submitted: "In Review",
  under_review: "Under Review",
  changes_requested: "Changes Requested",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_COLOR: Record<string, string> = {
  submitted: "#0969da",
  under_review: "#0969da",
  changes_requested: "#d97706",
  approved: "#22863a",
  rejected: "#C0392B",
};

export function GuideTemplateReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const templateId = parseInt(id ?? "0", 10);
  const isOpsView = location.pathname.startsWith("/ops/");

  const [template, setTemplate] = useState<GuideTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Launch settings
  const [startDate, setStartDate] = useState("");
  const [maxParticipants, setMaxParticipants] = useState("");
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [editingSettings, setEditingSettings] = useState(false);

  useEffect(() => {
    if (!templateId) return;
    const fetch = isOpsView
      ? api.get(`ops/pending-templates/${templateId}/`).then((r) => r.data)
      : fetchMyTemplate(templateId);
    fetch
      .then((t) => {
        setTemplate(t);
        setStartDate((t as any).desired_start_date ?? "");
        setMaxParticipants(
          (t as any).max_participants != null
            ? String((t as any).max_participants)
            : "",
        );
      })
      .catch(() => setError("Could not load program."))
      .finally(() => setLoading(false));
  }, [templateId, isOpsView]);

  async function handleSaveSettings() {
    if (!templateId || isOpsView) return;
    setSettingsSaving(true);
    setSettingsSaved(false);
    try {
      await api.patch(`guide/my-templates/${templateId}/`, {
        desired_start_date: startDate || null,
        max_participants: maxParticipants
          ? parseInt(maxParticipants, 10)
          : null,
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } finally {
      setSettingsSaving(false);
    }
  }

  if (loading) return <p style={hint}>Loading…</p>;
  if (error) return <p style={{ color: "#C0392B", padding: 24 }}>{error}</p>;
  if (!template) return null;

  const statusColor = STATUS_COLOR[template.review_status] ?? "#8B6F4E";
  const statusLabel =
    STATUS_LABEL[template.review_status] ?? template.review_status;
  const days = template.days ?? [];

  return (
    <div style={page}>
      <div style={inner}>
        <button
          onClick={() =>
            navigate(isOpsView ? "/programs/admin/" : "/guide/dashboard")
          }
          style={backBtn}
        >
          ← {isOpsView ? "Back to Review Queue" : "Back to Dashboard"}
        </button>

        <div style={headerRow}>
          <div>
            <p style={eyebrow}>PROGRAM REVIEW</p>
            <h1 style={heading}>{template.title || "Untitled Program"}</h1>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: statusColor,
                background: `${statusColor}18`,
                padding: "3px 10px",
                borderRadius: 20,
              }}
            >
              {statusLabel}
            </span>
          </div>
          {!isOpsView && template.review_status !== "approved" && template.review_status !== "rejected" && (
            <button
              style={editBtn}
              onClick={() => navigate(`/guide/templates/${templateId}/edit`)}
            >
              Edit Program
            </button>
          )}
        </div>

        {(template.review_status === "submitted" ||
          template.review_status === "under_review") && (
          <div style={infoBanner}>
            Your program is with the KalpX team for review. You'll be notified
            once it's approved.
          </div>
        )}

        {template.review_status === "changes_requested" && (
          <div style={warnBanner}>
            Changes have been requested. Please edit and resubmit.
          </div>
        )}

        {/* Program-level meta */}
        <div style={metaCard}>
          <FieldRow label="Duration" value={`${template.duration_days} days`} />
          <FieldRow label="Language" value={template.language || "en"} />
          {template.subtitle && (
            <FieldRow label="Subtitle" value={template.subtitle} />
          )}
          {template.program_promise && (
            <FieldRow
              label="Program Promise"
              value={template.program_promise}
            />
          )}
          {template.description && (
            <FieldRow
              label="Description"
              value={template.description}
              multiline
            />
          )}
          {/* Ops: show leader's launch preferences as read-only */}
          {isOpsView && (template as any).desired_start_date && (
            <FieldRow
              label="Desired Start Date"
              value={new Date(
                (template as any).desired_start_date,
              ).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            />
          )}
          {isOpsView && (template as any).max_participants && (
            <FieldRow
              label="Maximum Participants"
              value={`${(template as any).max_participants} people`}
            />
          )}
        </div>

        {/* Launch settings — leader only, hidden after approval */}
        {!isOpsView && template.review_status !== "approved" && (
          <div style={{ ...metaCard, marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#B5A08A", textTransform: "uppercase" as const, letterSpacing: "0.08em", margin: 0 }}>
                Program Settings
              </p>
              {!editingSettings ? (
                <button
                  onClick={() => setEditingSettings(true)}
                  style={{ fontSize: 12, fontWeight: 600, color: "var(--kalpx-gold)", background: "none", border: "1px solid var(--kalpx-gold)", borderRadius: 6, padding: "3px 12px", cursor: "pointer" }}
                >
                  Edit
                </button>
              ) : (
                <button
                  onClick={() => { setEditingSettings(false); }}
                  style={{ fontSize: 12, color: "var(--kalpx-text-muted)", background: "none", border: "1px solid var(--kalpx-border)", borderRadius: 6, padding: "3px 12px", cursor: "pointer" }}
                >
                  Cancel
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const, marginBottom: 12 }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#B5A08A", margin: "0 0 4px" }}>Start Date</p>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={!editingSettings}
                  style={{
                    width: "100%", padding: "9px 12px",
                    border: "1px solid #E8DECE", borderRadius: 8, fontSize: 13,
                    color: editingSettings ? "#432104" : "#8B6F4E",
                    background: editingSettings ? "#fff" : "#F7F3ED",
                    boxSizing: "border-box" as const,
                    cursor: editingSettings ? "text" : "not-allowed",
                  }}
                />
                <p style={{ fontSize: 11, color: "#C5B69A", margin: "3px 0 0" }}>Leave blank for rolling start</p>
              </div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#B5A08A", margin: "0 0 4px" }}>Max People Allowed</p>
                <input
                  type="number"
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  placeholder="e.g. 50"
                  min={1}
                  disabled={!editingSettings}
                  style={{
                    width: "100%", padding: "9px 12px",
                    border: "1px solid #E8DECE", borderRadius: 8, fontSize: 13,
                    color: editingSettings ? "#432104" : "#8B6F4E",
                    background: editingSettings ? "#fff" : "#F7F3ED",
                    boxSizing: "border-box" as const,
                    cursor: editingSettings ? "text" : "not-allowed",
                  }}
                />
                <p style={{ fontSize: 11, color: "#C5B69A", margin: "3px 0 0" }}>Leave blank for unlimited</p>
              </div>
            </div>
            {editingSettings && (
              <button
                onClick={async () => { await handleSaveSettings(); setEditingSettings(false); }}
                disabled={settingsSaving}
                style={{ padding: "8px 20px", background: "#432104", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: settingsSaving ? "default" : "pointer", opacity: settingsSaving ? 0.7 : 1 }}
              >
                {settingsSaving ? "Saving…" : settingsSaved ? "Saved ✓" : "Save Settings"}
              </button>
            )}
          </div>
        )}

        {/* Days */}
        <div
          style={{
            display: "flex",
            flexDirection: "column" as const,
            gap: 16,
            marginTop: 20,
          }}
        >
          {days.map((day) => (
            <DayReviewCard key={day.day_number} day={day} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DayReviewCard({ day }: { day: TemplateDay }) {
  const [open, setOpen] = useState(day.day_number === 1);

  return (
    <div style={card}>
      {/* Day header — collapsible */}
      <button onClick={() => setOpen((o) => !o)} style={dayHeaderBtn}>
        <span style={dayNumLabel}>
          Day {day.day_number}
          {day.theme ? ` — ${day.theme}` : ""}
        </span>
        <span style={{ fontSize: 14, color: "#B5A08A" }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div style={{ marginTop: 16 }}>
          {/* Theme */}
          <SectionLabel>Theme</SectionLabel>
          <input
            disabled
            value={day.theme || ""}
            placeholder="No theme set"
            style={disabledInput}
          />

          {/* Mantra */}
          <SlotReview
            label="Mantra"
            card={day.mantra_card}
            customTitle={day.custom_mantra_title}
            customBody={day.custom_mantra_body}
            renderCard={(c) => <MantraCard card={c as LibraryMantra} />}
          />
          {(day.mantra_ref || day.mantra_card || day.custom_mantra_body) &&
            (day.mantra_count != null || !!day.mantra_reminder_time) && (
              <div style={slotMetaRow}>
                {day.mantra_count != null && (
                  <span style={slotMetaChip}>
                    Chant count: <b>{day.mantra_count}×</b>
                  </span>
                )}
                {!!day.mantra_reminder_time && (
                  <span style={slotMetaChip}>
                    Reminder: <b>{fmt12h(day.mantra_reminder_time!)}</b>
                  </span>
                )}
              </div>
            )}

          {/* Sankalp */}
          <SlotReview
            label="Sankalp"
            card={day.sankalp_card}
            customTitle={day.custom_sankalp_title}
            customBody={day.custom_sankalp_body}
            renderCard={(c) => <SankalpCard card={c as LibrarySankalp} />}
          />
          {(day.sankalp_ref || day.sankalp_card || day.custom_sankalp_body) &&
            !!day.sankalp_reminder_time && (
              <div style={slotMetaRow}>
                <span style={slotMetaChip}>
                  Reminder: <b>{fmt12h(day.sankalp_reminder_time!)}</b>
                </span>
              </div>
            )}

          {/* Practice */}
          <SlotReview
            label="Practice"
            card={day.practice_card}
            customTitle={day.custom_practice_title}
            customBody={day.custom_practice_body}
            renderCard={(c) => <PracticeCard card={c as LibraryPractice} />}
          />
          {(day.practice_ref ||
            day.practice_card ||
            day.custom_practice_body) &&
            (day.practice_duration_minutes != null ||
              !!day.practice_reminder_time) && (
              <div style={slotMetaRow}>
                {day.practice_duration_minutes != null && (
                  <span style={slotMetaChip}>
                    Duration: <b>{day.practice_duration_minutes} min</b>
                  </span>
                )}
                {!!day.practice_reminder_time && (
                  <span style={slotMetaChip}>
                    Reminder: <b>{fmt12h(day.practice_reminder_time!)}</b>
                  </span>
                )}
              </div>
            )}

          {/* Wisdom */}
          <SlotReview
            label="Wisdom"
            card={day.wisdom_card}
            customBody={day.custom_wisdom_body}
            renderCard={(c) => <WisdomCard card={c as LibraryWisdom} />}
          />

          {/* Live Session */}
          <SectionLabel>Live Session</SectionLabel>
          <div style={twoCol}>
            <div style={{ flex: 1 }}>
              <p style={fieldLabel}>Session Time</p>
              <input
                disabled
                value={day.day_session_time || ""}
                placeholder="Not set"
                style={disabledInput}
              />
            </div>
            <div style={{ flex: 1 }}>
              <p style={fieldLabel}>Timezone</p>
              <input
                disabled
                value={day.day_session_timezone || "IST"}
                style={disabledInput}
              />
            </div>
          </div>
          <p style={fieldLabel}>Google Meet / Join Link</p>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              disabled
              value={day.day_join_url || ""}
              placeholder="Not set"
              style={{ ...disabledInput, flex: 1 }}
            />
            {day.day_join_url && <CopyButton text={day.day_join_url} />}
          </div>

          {/* Reflection */}
          {day.reflection_prompt !== undefined && (
            <>
              <SectionLabel>Reflection Prompt</SectionLabel>
              <textarea
                disabled
                value={day.reflection_prompt || ""}
                placeholder="No reflection prompt"
                rows={2}
                style={{
                  ...disabledInput,
                  resize: "none",
                  fontFamily: "inherit",
                }}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SlotReview({
  label,
  card,
  customTitle,
  customBody,
  renderCard,
}: {
  label: string;
  card?:
    | LibraryMantra
    | LibrarySankalp
    | LibraryPractice
    | LibraryWisdom
    | null;
  customTitle?: string;
  customBody?: string;
  renderCard: (c: any) => React.ReactNode;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const hasLibraryCard = !!card;
  const hasCustom = !!(customTitle || customBody);

  if (!hasLibraryCard && !hasCustom) {
    return (
      <div style={{ marginBottom: 14 }}>
        <SectionLabel>{label}</SectionLabel>
        <div style={emptySlot}>No {label.toLowerCase()} selected</div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <SectionLabel>{label}</SectionLabel>
      {hasLibraryCard ? (
        <div style={selectedCard}>
          <div style={selectedCardTop}>
            <div>
              <p style={selectedCardTitle}>
                {(card as any).title ||
                  (card as any).text ||
                  (card as any).item_id}
              </p>
              {(card as any).category_label && (
                <p
                  style={{ fontSize: 11, color: "#B5A08A", margin: "2px 0 0" }}
                >
                  {(card as any).category_label}
                </p>
              )}
            </div>
            <button
              onClick={() => setShowDetails((v) => !v)}
              style={detailToggleBtn}
            >
              {showDetails ? "Hide Details" : "View Details"}
            </button>
          </div>
          {showDetails && <div style={detailsPanel}>{renderCard(card)}</div>}
        </div>
      ) : (
        <div style={customContentBox}>
          {customTitle && <p style={customTitleStyle}>{customTitle}</p>}
          {customBody && <p style={customBodyStyle}>{customBody}</p>}
        </div>
      )}
    </div>
  );
}

function MantraCard({ card }: { card: LibraryMantra }) {
  return (
    <>
      {card.devanagari && (
        <DetailRow label="Devanagari" value={card.devanagari} />
      )}
      {card.iast && <DetailRow label="IAST" value={card.iast} />}
      {card.meaning && <DetailRow label="Meaning" value={card.meaning} />}
      {card.essence && <DetailRow label="Essence" value={card.essence} />}
      {card.deity && <DetailRow label="Deity" value={card.deity} />}
      {card.source && <DetailRow label="Source" value={card.source} />}
    </>
  );
}

function SankalpCard({ card }: { card: LibrarySankalp }) {
  return (
    <>
      {card.line && <DetailRow label="Sankalp Line" value={card.line} />}
      {card.insight && (
        <DetailRow label="Essence / Insight" value={card.insight} />
      )}
      {card.how_to_live?.length > 0 && (
        <DetailRow label="How to Live" value={card.how_to_live} />
      )}
      {card.benefits?.length > 0 && (
        <DetailRow label="Benefits" value={card.benefits} />
      )}
    </>
  );
}

function PracticeCard({ card }: { card: LibraryPractice }) {
  return (
    <>
      {card.summary && <DetailRow label="Summary" value={card.summary} />}
      {card.steps?.length > 0 && <DetailRow label="Steps" value={card.steps} />}
      {card.essence && <DetailRow label="Essence" value={card.essence} />}
      {card.benefits?.length > 0 && (
        <DetailRow label="Benefits" value={card.benefits} />
      )}
      {card.duration && <DetailRow label="Duration" value={card.duration} />}
    </>
  );
}

function WisdomCard({ card }: { card: LibraryWisdom }) {
  return (
    <>
      {card.text && <DetailRow label="Wisdom" value={card.text} />}
      {card.explanation && (
        <DetailRow label="Explanation" value={card.explanation} />
      )}
      {card.source_title && (
        <DetailRow
          label="Source"
          value={
            card.source_title + (card.source_ref ? ` (${card.source_ref})` : "")
          }
        />
      )}
    </>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | string[];
}) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div style={detailRowStyle}>
      <span style={detailLabelStyle}>{label}</span>
      {Array.isArray(value) ? (
        <ul style={detailListStyle}>
          {value.map((v, i) => (
            <li key={i} style={detailListItem}>
              {v}
            </li>
          ))}
        </ul>
      ) : (
        <span style={detailValueStyle}>{value}</span>
      )}
    </div>
  );
}

function FieldRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={fieldLabel}>{label}</p>
      {multiline ? (
        <textarea
          disabled
          value={value}
          rows={3}
          style={{ ...disabledInput, resize: "none", fontFamily: "inherit" }}
        />
      ) : (
        <input disabled value={value} style={disabledInput} />
      )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p style={sectionLabelStyle}>{children}</p>;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <button
      onClick={() =>
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
      }
      style={{
        flexShrink: 0,
        padding: "8px 14px",
        background: copied ? "#22863a" : "#C99317",
        border: "none",
        color: "#fff",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        transition: "background 0.2s",
      }}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#FAF7F2",
  padding: "0 16px 80px",
};
const inner: React.CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  paddingTop: 24,
};
const backBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#8B6F4E",
  fontSize: 13,
  padding: 0,
  marginBottom: 20,
};
const headerRow: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 20,
};
const eyebrow: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "1.2px",
  color: "#8B6F4E",
  textTransform: "uppercase" as const,
  marginBottom: 4,
  margin: "0 0 4px",
};
const heading: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 800,
  color: "#432104",
  margin: "0 0 8px",
};
const infoBanner: React.CSSProperties = {
  background: "#EFF6FF",
  border: "1px solid #BFDBFE",
  borderRadius: 8,
  padding: "10px 16px",
  fontSize: 13,
  color: "#1d4ed8",
  marginBottom: 20,
};
const warnBanner: React.CSSProperties = {
  background: "#FFFBEB",
  border: "1px solid #FDE68A",
  borderRadius: 8,
  padding: "10px 16px",
  fontSize: 13,
  color: "#92400e",
  marginBottom: 20,
};
const editBtn: React.CSSProperties = {
  padding: "8px 18px",
  background: "#C99317",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 13,
  flexShrink: 0,
};
const metaCard: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E8DECE",
  borderRadius: 12,
  padding: "16px 20px",
  marginBottom: 8,
};
const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E8DECE",
  borderRadius: 12,
  padding: "16px 20px",
};
const dayHeaderBtn: React.CSSProperties = {
  width: "100%",
  background: "none",
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: 0,
};
const dayNumLabel: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 800,
  color: "#432104",
};
const sectionLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "#B5A08A",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  margin: "14px 0 4px",
};
const fieldLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "#B5A08A",
  margin: "0 0 4px",
};
const disabledInput: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid #E8DECE",
  borderRadius: 8,
  fontSize: 13,
  color: "#432104",
  background: "#F7F3ED",
  cursor: "not-allowed",
  boxSizing: "border-box" as const,
};
const twoCol: React.CSSProperties = {
  display: "flex",
  gap: 12,
  marginBottom: 8,
};
const emptySlot: React.CSSProperties = {
  padding: "10px 14px",
  border: "1px dashed #E8DECE",
  borderRadius: 8,
  fontSize: 13,
  color: "#C5B69A",
  background: "#FDFAF6",
};
const selectedCard: React.CSSProperties = {
  border: "1px solid #C99317",
  borderRadius: 10,
  padding: "10px 14px",
  background: "#FFFDF6",
};
const selectedCardTop: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
};
const selectedCardTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#432104",
  margin: 0,
};
const detailToggleBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "#C99317",
  fontSize: 12,
  fontWeight: 600,
  padding: 0,
  flexShrink: 0,
};
const detailsPanel: React.CSSProperties = {
  marginTop: 10,
  paddingTop: 10,
  borderTop: "1px solid #F0E8D8",
};
const detailRowStyle: React.CSSProperties = {
  display: "flex",
  gap: 10,
  marginBottom: 8,
  alignItems: "flex-start",
};
const detailLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "#B5A08A",
  textTransform: "uppercase" as const,
  letterSpacing: "0.06em",
  minWidth: 80,
  paddingTop: 1,
};
const detailValueStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#432104",
  flex: 1,
  lineHeight: 1.5,
};
const detailListStyle: React.CSSProperties = {
  margin: "0",
  padding: "0 0 0 16px",
  flex: 1,
};
const detailListItem: React.CSSProperties = {
  fontSize: 13,
  color: "#432104",
  lineHeight: 1.5,
  marginBottom: 2,
};
const customContentBox: React.CSSProperties = {
  border: "1px solid #E8DECE",
  borderRadius: 8,
  padding: "10px 14px",
  background: "#FDFAF6",
};
const customTitleStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "#432104",
  margin: "0 0 4px",
};
const customBodyStyle: React.CSSProperties = {
  fontSize: 13,
  color: "#5C4033",
  margin: 0,
  lineHeight: 1.6,
};
const hint: React.CSSProperties = {
  textAlign: "center" as const,
  color: "#B5A08A",
  padding: "60px 0",
};
const slotMetaRow: React.CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap" as const,
  marginBottom: 12,
  marginTop: -4,
};
const slotMetaChip: React.CSSProperties = {
  fontSize: 12,
  color: "#7B6545",
  background: "#FFF8EC",
  border: "1px solid #E8D9B5",
  borderRadius: 20,
  padding: "3px 10px",
};

function fmt12h(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}
