/**
 * OnboardingReminderStep — turn_9_reminders (local step, no backend schema).
 * Shown after triad reveal (turn_8). User can optionally set gentle reminders
 * for each triad item before Mitra navigates them to the dashboard.
 */
import { useState } from "react";
import { webNavigate } from "../../lib/webRouter";
import { useTranslation } from "../../lib/i18n";
import type { JourneyTriadRemindersPatch } from "@kalpx/types";

const SERIF = "var(--kalpx-font-serif)";
const GOLD = "#C99317";
const DARK = "#432104";
const MID = "#7B6545";

type TriadKey = "mantra" | "sankalp" | "practice";

interface ReminderState {
  enabled: boolean;
  time: string;
}

interface Props {
  destination: string;
  patchReminders: (patch: JourneyTriadRemindersPatch) => Promise<unknown>;
}

export function OnboardingReminderStep({ destination, patchReminders }: Props) {
  const { t } = useTranslation();

  const TRIAD_ITEMS: { key: TriadKey; labelKey: string; defaultTime: string }[] = [
    { key: "mantra", labelKey: "onboarding.remindForMantra", defaultTime: "07:00" },
    { key: "sankalp", labelKey: "onboarding.remindForSankalp", defaultTime: "08:00" },
    { key: "practice", labelKey: "onboarding.remindForPractice", defaultTime: "18:00" },
  ];

  const [reminders, setReminders] = useState<Record<TriadKey, ReminderState>>(
    () => Object.fromEntries(
      TRIAD_ITEMS.map((item) => [item.key, { enabled: false, time: item.defaultTime }])
    ) as Record<TriadKey, ReminderState>
  );
  const [saving, setSaving] = useState(false);

  function toggle(key: TriadKey) {
    setReminders((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
  }

  function setTime(key: TriadKey, time: string) {
    setReminders((prev) => ({
      ...prev,
      [key]: { ...prev[key], time },
    }));
  }

  async function handleSetReminders() {
    setSaving(true);
    try {
      const patch: JourneyTriadRemindersPatch = {};
      for (const item of TRIAD_ITEMS) {
        const r = reminders[item.key];
        (patch as any)[`${item.key}_reminder_enabled`] = r.enabled;
        if (r.enabled) (patch as any)[`${item.key}_reminder_time`] = r.time;
      }
      await patchReminders(patch);
    } catch {
      // non-fatal — navigate regardless
    } finally {
      setSaving(false);
      webNavigate(destination);
    }
  }

  function handleSkip() {
    webNavigate(destination);
  }

  return (
    <div style={{ padding: "40px 24px 80px" }}>
      <h2
        style={{
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 26,
          color: DARK,
          margin: "0 0 8px",
          lineHeight: 1.3,
        }}
      >
        {t("onboarding.reminderTitle")}
      </h2>
      <p
        style={{
          color: MID,
          fontSize: 15,
          marginBottom: 32,
          lineHeight: 1.6,
        }}
      >
        {t("onboarding.reminderSubtitle")}
      </p>

      {TRIAD_ITEMS.map((item) => {
        const r = reminders[item.key];
        return (
          <div
            key={item.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
              padding: "14px 16px",
              background: r.enabled ? "rgba(201,168,76,0.08)" : "rgba(0,0,0,0.02)",
              borderRadius: 12,
              border: `1px solid ${r.enabled ? "rgba(201,168,76,0.3)" : "rgba(0,0,0,0.06)"}`,
              transition: "all 0.2s",
            }}
          >
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 15,
                color: DARK,
                flex: 1,
                fontWeight: 600,
              }}
            >
              {t(item.labelKey)}
            </span>
            {r.enabled && (
              <input
                type="time"
                value={r.time}
                onChange={(e) => setTime(item.key, e.target.value || item.defaultTime)}
                style={{
                  border: `1px solid rgba(201,168,76,0.3)`,
                  borderRadius: 8,
                  padding: "4px 8px",
                  fontSize: 13,
                  color: DARK,
                  background: "#fff",
                  outline: "none",
                }}
              />
            )}
            <button
              onClick={() => toggle(item.key)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                border: "none",
                background: r.enabled ? GOLD : "rgba(0,0,0,0.15)",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 2,
                  left: r.enabled ? 22 : 2,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left 0.2s",
                }}
              />
            </button>
          </div>
        );
      })}

      <button
        onClick={handleSetReminders}
        disabled={saving}
        style={{
          width: "100%",
          padding: "16px",
          marginTop: 24,
          borderRadius: 12,
          border: "none",
          background: GOLD,
          color: "#fff",
          fontFamily: SERIF,
          fontWeight: 700,
          fontSize: 16,
          cursor: saving ? "not-allowed" : "pointer",
          opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? t("onboarding.setting") : t("onboarding.setReminders")}
      </button>

      <button
        onClick={handleSkip}
        disabled={saving}
        style={{
          width: "100%",
          padding: "14px",
          marginTop: 10,
          borderRadius: 12,
          border: "none",
          background: "transparent",
          color: MID,
          fontFamily: SERIF,
          fontWeight: 600,
          fontSize: 15,
          cursor: saving ? "not-allowed" : "pointer",
        }}
      >
        {t("onboarding.skipForNow")}
      </button>
    </div>
  );
}
