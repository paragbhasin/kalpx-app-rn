import { Bell, ChevronLeft } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RhythmItem, RhythmTimeBand, JourneyTriadReminders, JourneyTriadRemindersPatch } from "@kalpx/types";
import {
  apiGetJourneyReminders,
  apiPatchJourneyReminders,
  getMitraHomeV3,
  patchRhythmItem,
} from "../../engine/mitraApi";
import type { AppDispatch, RootState } from "../../store";
import { setHomeData } from "../../store/doorSlice";

const BG = "#FAF7F2";
const GOLD = "#C9A84C";
const GOLD_LIGHT = "rgba(201,168,76,0.18)";
const TEXT = "#432104";
const TEXT_MUTED = "#8A7D6B";
const BORDER = "rgba(201,168,76,0.25)";
const FONT_SERIF = "var(--kalpx-font-serif, 'Cormorant Garamond', Georgia, serif)";
const FONT_SANS = "var(--kalpx-font-sans, 'Inter', sans-serif)";

const TRIAD_DEFAULTS: Record<string, string> = {
  mantra: "07:00:00",
  sankalp: "08:00:00",
  practice: "18:00:00",
};

const TRIAD_LABELS: Record<string, string> = {
  mantra: "Mantra",
  sankalp: "Sankalp",
  practice: "Practice",
};

const BAND_LABELS: Record<RhythmTimeBand, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  night: "Night",
};

function formatTime(hms: string | null): string {
  if (!hms) return "";
  const [h, m] = hms.split(":").map(Number);
  const suffix = h < 12 ? "AM" : "PM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

function toHHMM(hms: string): string {
  return hms.slice(0, 5);
}

function toHHMMSS(hhmm: string): string {
  return hhmm.length === 5 ? hhmm + ":00" : hhmm;
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      aria-pressed={enabled}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        border: "none",
        background: enabled ? GOLD : "rgba(0,0,0,0.12)",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: enabled ? 22 : 2,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}

// ── Section header ─────────────────────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "28px 0 14px" }}>
      <div style={{ flex: 1, height: 1, background: BORDER }} />
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Bell size={13} color={GOLD} strokeWidth={1.8} />
        <span
          style={{
            fontFamily: FONT_SANS,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.6,
            color: GOLD,
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>
      <div style={{ flex: 1, height: 1, background: BORDER }} />
    </div>
  );
}

// ── Reminder row ──────────────────────────────────────────────────────────────
function ReminderRow({
  label,
  enabled,
  time,
  saving,
  onToggle,
  onTimeChange,
}: {
  label: string;
  enabled: boolean;
  time: string | null;
  saving: boolean;
  onToggle: () => void;
  onTimeChange: (hhmm: string) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 16px",
        background: "#FFFDF7",
        borderRadius: 12,
        border: `1px solid ${BORDER}`,
        marginBottom: 8,
        opacity: saving ? 0.7 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <span
        style={{
          fontFamily: FONT_SERIF,
          fontSize: 17,
          fontWeight: 700,
          color: TEXT,
          flex: 1,
        }}
      >
        {label}
      </span>
      {enabled && (
        <input
          type="time"
          value={time ? toHHMM(time) : ""}
          onChange={(e) => onTimeChange(e.target.value)}
          style={{
            fontFamily: FONT_SANS,
            fontSize: 13,
            color: TEXT,
            background: GOLD_LIGHT,
            border: `1px solid ${BORDER}`,
            borderRadius: 20,
            padding: "4px 10px",
            cursor: "pointer",
            outline: "none",
            width: 100,
          }}
        />
      )}
      {!enabled && time && (
        <span
          style={{
            fontFamily: FONT_SANS,
            fontSize: 13,
            color: TEXT_MUTED,
            background: "rgba(0,0,0,0.04)",
            borderRadius: 20,
            padding: "4px 10px",
          }}
        >
          {formatTime(time)}
        </span>
      )}
      <Toggle enabled={enabled} onChange={onToggle} />
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function RemindersPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const homeData = useSelector((s: RootState) => s.door.homeData);

  const [reminders, setReminders] = useState<JourneyTriadReminders | null>(null);
  const [remindersLoading, setRemindersLoading] = useState(true);
  const [rhythmSavingId, setRhythmSavingId] = useState<number | null>(null);
  const [triadSavingKey, setTriadSavingKey] = useState<string | null>(null);

  // Load Inner Path reminders
  useEffect(() => {
    apiGetJourneyReminders()
      .then(setReminders)
      .catch(() => setReminders(null))
      .finally(() => setRemindersLoading(false));
  }, []);

  // Load home data if not in Redux yet (for rhythm items)
  useEffect(() => {
    if (homeData) return;
    getMitraHomeV3()
      .then((d) => dispatch(setHomeData(d)))
      .catch(() => {});
  }, [homeData, dispatch]);

  // ── Triad handlers ────────────────────────────────────────────────────────
  async function handleTriadToggle(key: "mantra" | "sankalp" | "practice") {
    if (!reminders) return;
    const enabledKey = `${key}_reminder_enabled` as keyof JourneyTriadReminders;
    const timeKey = `${key}_reminder_time` as keyof JourneyTriadReminders;
    const isEnabled = reminders[enabledKey] as boolean;
    const currentTime = reminders[timeKey] as string | null;

    const patch: JourneyTriadRemindersPatch = {
      [`${key}_reminder_enabled`]: !isEnabled,
      [`${key}_reminder_time`]: currentTime ?? TRIAD_DEFAULTS[key],
    };
    setTriadSavingKey(key);
    const optimistic = { ...reminders, ...patch };
    setReminders(optimistic);
    try {
      const updated = await apiPatchJourneyReminders(patch);
      setReminders(updated);
    } catch {
      setReminders(reminders);
    } finally {
      setTriadSavingKey(null);
    }
  }

  async function handleTriadTime(key: "mantra" | "sankalp" | "practice", hhmm: string) {
    if (!reminders || !hhmm) return;
    const patch: JourneyTriadRemindersPatch = {
      [`${key}_reminder_time`]: toHHMMSS(hhmm),
    };
    setTriadSavingKey(key);
    const optimistic = { ...reminders, ...patch };
    setReminders(optimistic);
    try {
      const updated = await apiPatchJourneyReminders(patch);
      setReminders(updated);
    } catch {
      setReminders(reminders);
    } finally {
      setTriadSavingKey(null);
    }
  }

  // ── Rhythm handlers ───────────────────────────────────────────────────────
  async function handleRhythmToggle(item: RhythmItem) {
    setRhythmSavingId(item.rhythm_item_id);
    const newEnabled = !item.reminder_enabled;
    const newTime = item.reminder_time ?? "07:00:00";
    try {
      await patchRhythmItem(item.rhythm_item_id, {
        reminder_enabled: newEnabled,
        reminder_time: newTime,
      });
      const fresh = await getMitraHomeV3({ forceFresh: true });
      dispatch(setHomeData(fresh));
    } catch {
      // revert is implicit — homeData unchanged
    } finally {
      setRhythmSavingId(null);
    }
  }

  async function handleRhythmTime(item: RhythmItem, hhmm: string) {
    if (!hhmm) return;
    setRhythmSavingId(item.rhythm_item_id);
    try {
      await patchRhythmItem(item.rhythm_item_id, {
        reminder_time: toHHMMSS(hhmm),
      });
      const fresh = await getMitraHomeV3({ forceFresh: true });
      dispatch(setHomeData(fresh));
    } catch {
    } finally {
      setRhythmSavingId(null);
    }
  }

  const hasJourney = reminders?.has_journey ?? false;
  const hasRhythm = homeData?.companion_rhythm?.has_rhythm ?? false;

  const rhythmBands: RhythmTimeBand[] = ["morning", "afternoon", "night"];
  const allRhythmItems: RhythmItem[] = rhythmBands.flatMap((band) => {
    const slot = homeData?.companion_rhythm?.[band];
    return slot?.items ?? [];
  });

  const neitherSetUp = !remindersLoading && !hasJourney && !hasRhythm;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        backgroundImage: 'url("/beige_bg.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: "32px 20px 80px",
        }}
      >
        {/* Back */}
        <button
          onClick={() => navigate("/en/profile")}
          style={{
            background: "none",
            border: "none",
            display: "flex",
            alignItems: "center",
            gap: 4,
            color: GOLD,
            fontFamily: FONT_SANS,
            fontSize: 14,
            cursor: "pointer",
            padding: 0,
            marginBottom: 24,
          }}
        >
          <ChevronLeft size={16} strokeWidth={2} />
          Profile
        </button>

        {/* Title */}
        <h1
          style={{
            fontFamily: FONT_SERIF,
            fontSize: 38,
            fontWeight: 700,
            color: TEXT,
            margin: "0 0 6px",
            lineHeight: 1.15,
          }}
        >
          Reminders
        </h1>
        <p
          style={{
            fontFamily: FONT_SANS,
            fontSize: 15,
            color: TEXT_MUTED,
            margin: "0 0 8px",
            fontStyle: "italic",
          }}
        >
          Mitra will gently remind you at your chosen times.
        </p>

        {/* ── Inner Path section ── */}
        {!remindersLoading && hasJourney && (
          <>
            <SectionHeader label="Inner Path" />
            {(["mantra", "sankalp", "practice"] as const).map((key) => (
              <ReminderRow
                key={key}
                label={TRIAD_LABELS[key]}
                enabled={(reminders?.[`${key}_reminder_enabled`] as boolean) ?? false}
                time={(reminders?.[`${key}_reminder_time`] as string | null) ?? null}
                saving={triadSavingKey === key}
                onToggle={() => void handleTriadToggle(key)}
                onTimeChange={(hhmm) => void handleTriadTime(key, hhmm)}
              />
            ))}
          </>
        )}

        {/* ── Daily Rhythm section ── */}
        {hasRhythm && allRhythmItems.length > 0 && (
          <>
            <SectionHeader label="Daily Rhythm" />
            {rhythmBands.map((band) => {
              const items = homeData?.companion_rhythm?.[band]?.items ?? [];
              if (items.length === 0) return null;
              return (
                <div key={band} style={{ marginBottom: 6 }}>
                  <p
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: 1.2,
                      color: TEXT_MUTED,
                      textTransform: "uppercase",
                      margin: "12px 0 8px 4px",
                    }}
                  >
                    {BAND_LABELS[band]}
                  </p>
                  {items.map((item) => (
                    <ReminderRow
                      key={item.rhythm_item_id}
                      label={item.title_snapshot}
                      enabled={item.reminder_enabled}
                      time={item.reminder_time}
                      saving={rhythmSavingId === item.rhythm_item_id}
                      onToggle={() => void handleRhythmToggle(item)}
                      onTimeChange={(hhmm) => void handleRhythmTime(item, hhmm)}
                    />
                  ))}
                </div>
              );
            })}
          </>
        )}

        {/* ── Empty state ── */}
        {neitherSetUp && (
          <div
            style={{
              marginTop: 48,
              textAlign: "center",
              padding: "40px 24px",
              background: "#FFFDF7",
              borderRadius: 16,
              border: `1px solid ${BORDER}`,
            }}
          >
            <Bell size={32} color={GOLD} strokeWidth={1.4} style={{ marginBottom: 12 }} />
            <p
              style={{
                fontFamily: FONT_SERIF,
                fontSize: 20,
                fontWeight: 700,
                color: TEXT,
                margin: "0 0 8px",
              }}
            >
              Your practice awaits
            </p>
            <p
              style={{
                fontFamily: FONT_SANS,
                fontSize: 14,
                color: TEXT_MUTED,
                lineHeight: 1.6,
              }}
            >
              Set up your Inner Path or Daily Rhythm to enable gentle reminders.
            </p>
          </div>
        )}

        {/* ── No journey, has rhythm ── */}
        {!remindersLoading && !hasJourney && hasRhythm && (
          <div
            style={{
              marginTop: 16,
              padding: "12px 16px",
              background: GOLD_LIGHT,
              borderRadius: 10,
              border: `1px solid ${BORDER}`,
            }}
          >
            <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: TEXT_MUTED, margin: 0 }}>
              Begin your Inner Path to also set gentle reminders for your mantra, sankalp, and practice.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
