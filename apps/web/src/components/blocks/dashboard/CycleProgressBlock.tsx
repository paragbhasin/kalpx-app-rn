import React from 'react';

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
  const metrics = sd.today?.cycle_metrics || sd.cycle_metrics;
  const dayNumber: number = sd.identity?.day_number ?? sd.day_number ?? 0;
  const totalDays: number = sd.identity?.total_days ?? sd.total_days ?? 14;

  if (!metrics && !dayNumber) return null;

  const rhythm: DayDot[] = metrics?.daily_rhythm || [];
  const daysEngaged: number = metrics?.days_engaged ?? 0;
  const daysComplete: number = metrics?.days_fully_completed ?? 0;
  const triggerSessions: number = metrics?.trigger_sessions ?? 0;
  const summaryLabel: string = metrics?.summary_label || '';
  const rhythmHeader: string = metrics?.rhythm_header_label || 'Your Rhythm';

  const showMetrics = daysEngaged > 0 || daysComplete > 0;
  const showRhythm = rhythm.length > 0;

  if (!showMetrics && !showRhythm && !dayNumber) return null;

  return (
    <div
      data-testid="cycle-progress-block"
      style={{
        marginBottom: 24,
        padding: '16px',
        borderRadius: 12,
        background: '#fff',
        border: '1px solid #f0e8d0',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#b08840', textTransform: 'uppercase', margin: 0 }}>
          {rhythmHeader}
        </p>
        {dayNumber > 0 && (
          <span style={{ fontSize: 12, color: '#888' }}>Day {dayNumber}/{totalDays}</span>
        )}
      </div>

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
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: bg,
                  flexShrink: 0,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Metrics row */}
      {showMetrics && (
        <div style={{ display: 'flex', gap: 16 }}>
          <MetricItem
            label={metrics?.days_engaged_label || 'Engaged'}
            value={daysEngaged}
          />
          <MetricItem
            label={metrics?.days_complete_label || 'Completed'}
            value={daysComplete}
          />
          {triggerSessions > 0 && (
            <MetricItem
              label={metrics?.trigger_sessions_label || 'Support'}
              value={triggerSessions}
            />
          )}
        </div>
      )}

      {summaryLabel && (
        <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>{summaryLabel}</p>
      )}
    </div>
  );
}

function MetricItem({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontSize: 20, fontWeight: 700, color: '#1a1a0a' }}>{value}</span>
      <span style={{ fontSize: 11, color: '#888', textAlign: 'center' }}>{label}</span>
    </div>
  );
}
