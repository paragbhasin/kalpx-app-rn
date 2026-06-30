import { useMemo, useState } from "react";
import { useTranslation } from "../../../lib/i18n";

type DayState = "done" | "missed" | "pending" | string;

interface DayDot {
  day?: number;
  day_number?: number;
  state?: DayState;
}

interface Props {
  sd: Record<string, any>;
  expanded?: boolean;
  onToggle?: () => void;
  hideHeader?: boolean;
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "var(--kalpx-font-serif)",
          fontSize: 26,
          fontWeight: 700,
          color: "#432104",
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "#746657",
          lineHeight: 1.3,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function dotStyles(state?: string) {
  if (state === "done") {
    return {
      background: "#1DBA7A",
      border: "1.5px solid #1DBA7A",
    };
  }
  if (state === "missed") {
    return {
      background: "transparent",
      border: "1.5px solid #C8A57C",
    };
  }
  return {
    background: "transparent",
    border: "1.5px solid rgba(226, 209, 186, 0.95)",
  };
}

export function CycleProgressBlock({ sd, expanded: expandedProp, onToggle, hideHeader = false }: Props) {
  const { t } = useTranslation();
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState(false);
  const expanded = expandedProp ?? uncontrolledExpanded;
  const toggleExpanded = onToggle ?? (() => setUncontrolledExpanded((value) => !value));

  const metrics = sd.today?.cycle_metrics || sd.cycle_metrics || {};
  const dayNumber: number = sd.identity?.day_number ?? sd.day_number ?? 1;
  const totalDays: number = sd.identity?.total_days ?? sd.total_days ?? 14;

  const daysEngaged: number =
    typeof metrics.days_engaged === "number" ? metrics.days_engaged : 0;
  const daysComplete: number =
    typeof metrics.days_fully_completed === "number"
      ? metrics.days_fully_completed
      : 0;
  const rhythm: DayDot[] = Array.isArray(metrics.daily_rhythm)
    ? metrics.daily_rhythm
    : [];

  const summaryLine =
    metrics.summary_label || `Day ${dayNumber} of ${totalDays}`;
  const rhythmHeader = t('progressSection.dailyRhythm');

  const visibleRhythm = useMemo(() => {
    if (rhythm.length > 0) return rhythm;
    return Array.from(
      { length: totalDays },
      (_, index): DayDot => ({
        day_number: index + 1,
        state: index + 1 < dayNumber ? "missed" : "pending",
      }),
    );
  }, [rhythm, totalDays, dayNumber]);

  if (!summaryLine && visibleRhythm.length === 0) return null;

  return (
    <div
      data-testid="cycle-progress-block"
      style={{
        marginBottom: 24,
        background: "rgba(255, 252, 246, 0.94)",
        borderRadius: 12,
        border: "1px solid rgba(223, 205, 181, 0.95)",
        boxShadow: "0 10px 24px rgba(127,90,34,0.06)",
        padding: "10px",
      }}
    >
      {!hideHeader && (
        <button
          onClick={toggleExpanded}
          aria-expanded={expanded}
          data-testid="cycle-progress-header"
          style={{
            width: "100%",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            textAlign: "left",
          }}
        >
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#432104",
            }}
          >
            {summaryLine}
          </span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
            style={{
              transform: expanded ? "rotate(180deg)" : "none",
              transition: "transform 180ms ease",
              flexShrink: 0,
            }}
          >
            <path
              d="M4.5 7l4.5 4.5L13.5 7"
              stroke="#8B7864"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {expanded && (
        <div style={{ marginTop: hideHeader ? 0 : 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 10,
              marginBottom: 24,
            }}
          >
            <Metric
              value={daysEngaged}
              label={t('progressSection.daysEngaged')}
            />
            <Metric
              value={daysComplete}
              label={t('progressSection.fullyCompleted')}
            />
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#8B7864",
              marginBottom: 16,
            }}
          >
            {rhythmHeader}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 6,
            }}
          >
            {visibleRhythm.map((dot, index) => {
              const day = dot.day_number ?? dot.day ?? index + 1;
              const isCheckpoint = day === 7 || day === 14;
              const styles = dotStyles(dot.state);

              return (
                <div
                  key={`rhythm-${day}-${index}`}
                  title={`Day ${day}: ${dot.state || "pending"}`}
                  style={{
                    width: isCheckpoint ? 18 : 13,
                    height: isCheckpoint ? 18 : 13,
                    minWidth: isCheckpoint ? 18 : 13,
                    borderRadius: 999,
                    ...styles,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxSizing: "border-box",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#7A5A37",
                  }}
                >
                  {isCheckpoint ? day : null}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
