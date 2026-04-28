import React, { useState } from 'react';

type DayState = 'done' | 'missed' | 'pending' | string;

interface DayDot {
  day?: number;
  day_number?: number;
  state: DayState;
}

interface Props {
  sd: Record<string, any>;
}

export function CycleProgressBlock({ sd }: Props) {
  const [expanded, setExpanded] = useState(false);

  const metrics = sd.today?.cycle_metrics || sd.cycle_metrics;
  const dayNumber: number = sd.identity?.day_number ?? sd.day_number ?? 0;
  const totalDays: number = sd.identity?.total_days ?? sd.total_days ?? 14;

  if (!metrics && !dayNumber) return null;

  const rhythm: DayDot[] = metrics?.daily_rhythm || [];
  const daysEngaged: number = metrics?.days_engaged ?? 0;
  const daysComplete: number = metrics?.days_fully_completed ?? 0;
  const triggerSessions: number = metrics?.trigger_sessions ?? 0;
  const summaryLabel: string = metrics?.summary_label || '';
  const rhythmHeader: string = metrics?.rhythm_header_label || 'Daily Rhythm';

  const showMetrics = daysEngaged > 0 || daysComplete > 0;
  const showRhythm = rhythm.length > 0;

  if (!showMetrics && !showRhythm && !dayNumber) return null;

  const summaryLine = dayNumber > 0
    ? `Day ${dayNumber} of ${totalDays}`
    : summaryLabel || rhythmHeader;

  return (
    <div
      data-testid="cycle-progress-block"
      style={{
        marginBottom: 24,
        borderRadius: 12,
        background: 'var(--kalpx-card-bg)',
        border: '1px solid var(--kalpx-chip-bg)',
        overflow: 'hidden',
      }}
    >
      {/* Accordion header — always visible */}
      <button
        onClick={() => setExpanded(e => !e)}
        aria-expanded={expanded}
        aria-controls="cycle-progress-body"
        data-testid="cycle-progress-header"
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 16px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 14, color: 'var(--kalpx-text)', fontFamily: 'var(--kalpx-font-serif)' }}>
          {summaryLine}
        </span>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          style={{ transition: 'transform 200ms', transform: expanded ? 'rotate(180deg)' : 'none', flexShrink: 0 }}
          aria-hidden="true"
        >
          <path d="M4 6l4 4 4-4" stroke="var(--kalpx-text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Expandable body — dots + metrics */}
      {expanded && (
        <div id="cycle-progress-body" style={{ padding: '0 16px 16px' }}>
          {/* Daily rhythm dots */}
          {showRhythm && (
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
              {rhythm.map((dot, i) => {
                const day = dot.day_number ?? dot.day ?? i + 1;
                const s = dot.state;
                const bg = s === 'done' ? '#4ade80' : s === 'missed' ? '#fca5a5' : '#e5e7eb';
                return (
                  <div
                    key={i}
                    title={`Day ${day}: ${s}`}
                    style={{ width: 12, height: 12, borderRadius: '50%', background: bg, flexShrink: 0 }}
                  />
                );
              })}
            </div>
          )}

          {/* Metrics row */}
          {showMetrics && (
            <div style={{ display: 'flex', gap: 16 }}>
              <MetricItem label={metrics?.days_engaged_label || 'Days engaged'} value={daysEngaged} />
              <MetricItem label={metrics?.days_complete_label || 'Fully completed'} value={daysComplete} />
              {triggerSessions > 0 && (
                <MetricItem label={metrics?.trigger_sessions_label || 'Trigger sessions'} value={triggerSessions} />
              )}
            </div>
          )}

          {summaryLabel && (
            <p style={{ fontSize: 12, color: 'var(--kalpx-text-muted)', marginTop: 8 }}>{summaryLabel}</p>
          )}
        </div>
      )}
    </div>
  );
}

function MetricItem({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--kalpx-text)' }}>{value}</span>
      <span style={{ fontSize: 11, color: 'var(--kalpx-text-muted)', textAlign: 'center' }}>{label}</span>
    </div>
  );
}
