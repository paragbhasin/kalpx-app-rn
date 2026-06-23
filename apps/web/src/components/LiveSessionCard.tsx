import React from 'react';
import { GuideChip } from './GuideChip';

export interface LiveSessionCardGuide {
  displayName: string;
  photoUrl?: string | null;
}

export interface LiveSessionCardProps {
  code: string;
  title: string;
  sessionType: string;
  guide?: LiveSessionCardGuide | null;
  scheduledAt: string;
  timezone: string;
  durationMinutes: number;
  language: string;
  recurrenceType: string;
  isUserRegistered: boolean;
  status: string;
  onRegister?: (code: string) => void;
}

const SESSION_TYPE_LABELS: Record<string, string> = {
  jaap: 'Jaap',
  dhyaan: 'Dhyaan',
  satsang: 'Satsang',
  yoga: 'Yoga',
  katha: 'Katha',
  pravachan: 'Pravachan',
  workshop: 'Workshop',
  qa: 'Q&A',
};

function sessionTypeLabel(type: string): string {
  return SESSION_TYPE_LABELS[type.toLowerCase()] ?? type;
}

function formatLocalTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    // Use browser locale + timezone for display
    const datePart = new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(d);
    const timePart = new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
    // Append browser timezone abbreviation
    const tzAbbr = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' })
      .formatToParts(d)
      .find((p) => p.type === 'timeZoneName')?.value ?? '';
    return `${datePart} · ${timePart}${tzAbbr ? ` ${tzAbbr}` : ''}`;
  } catch {
    return dateStr;
  }
}

function StatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    approved: 'Approved',
    scheduled: 'Scheduled',
    live: 'Live',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  const isLive = status === 'live';
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 11,
        fontWeight: isLive ? 700 : 400,
        letterSpacing: '0.05em',
        padding: '2px 8px',
        borderRadius: 4,
        border: isLive ? 'none' : '1px solid var(--kalpx-border)',
        background: isLive ? '#e53935' : 'transparent',
        color: isLive ? '#fff' : 'var(--kalpx-text-muted)',
      }}
    >
      {isLive ? 'LIVE' : (labels[status.toLowerCase()] ?? status)}
    </span>
  );
}

export function LiveSessionCard({
  code,
  title,
  sessionType,
  guide,
  scheduledAt,
  durationMinutes,
  language,
  recurrenceType,
  isUserRegistered,
  status,
  onRegister,
}: LiveSessionCardProps) {
  const isRecurring = recurrenceType !== 'none' && recurrenceType !== 'one_time';
  const isLive = status === 'live';
  const isCancelled = status === 'cancelled';
  const isCompleted = status === 'completed';
  const canRegister = !isUserRegistered && !isCancelled && !isCompleted;

  return (
    <article
      role="article"
      style={{
        background: 'var(--kalpx-card-bg)',
        border: `1px solid ${isLive ? 'var(--kalpx-gold)' : 'var(--kalpx-border)'}`,
        borderRadius: 'var(--kalpx-r-lg)',
        padding: '18px 20px',
        opacity: isCancelled ? 0.6 : 1,
      }}
    >
      {/* Badge row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.05em',
            color: 'var(--kalpx-gold)',
            background: 'var(--kalpx-chip-bg)',
            border: '1px solid var(--kalpx-border-gold)',
            borderRadius: 4,
            padding: '2px 8px',
          }}
        >
          {sessionTypeLabel(sessionType)}
        </span>
        <StatusBadge status={status} />
        {isRecurring && (
          <span
            style={{
              fontSize: 11,
              color: 'var(--kalpx-text-muted)',
              border: '1px solid var(--kalpx-border)',
              borderRadius: 4,
              padding: '2px 8px',
            }}
          >
            Recurring
          </span>
        )}
        <span
          style={{
            fontSize: 11,
            color: 'var(--kalpx-text-muted)',
            border: '1px solid var(--kalpx-border)',
            borderRadius: 4,
            padding: '2px 8px',
            marginLeft: 'auto',
          }}
        >
          {language}
        </span>
      </div>

      {/* Title */}
      <h2
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: 'var(--kalpx-text)',
          marginBottom: 8,
          lineHeight: 1.4,
        }}
      >
        {title}
      </h2>

      {/* Guide chip */}
      {guide && (
        <div style={{ marginBottom: 8 }}>
          <GuideChip displayName={guide.displayName} photoUrl={guide.photoUrl} />
        </div>
      )}

      {/* Time + duration */}
      <p style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', marginBottom: 14 }}>
        {formatLocalTime(scheduledAt)}
        {' · '}
        {durationMinutes} min
      </p>

      {/* CTA */}
      {isCancelled ? (
        <p style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', fontStyle: 'italic' }}>
          This session has been cancelled
        </p>
      ) : isUserRegistered ? (
        <button
          disabled
          aria-label={`Registered for ${title}`}
          style={{
            padding: '9px 20px',
            background: 'transparent',
            color: 'var(--kalpx-text-muted)',
            border: '1px solid var(--kalpx-border)',
            borderRadius: 'var(--kalpx-r-md)',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'default',
          }}
        >
          Registered
        </button>
      ) : canRegister && onRegister ? (
        <button
          onClick={() => onRegister(code)}
          aria-label={`Register for ${title}`}
          style={{
            padding: '9px 20px',
            background: isLive ? 'var(--kalpx-gold)' : 'transparent',
            color: isLive ? '#fff' : 'var(--kalpx-gold)',
            border: '1px solid var(--kalpx-gold)',
            borderRadius: 'var(--kalpx-r-md)',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          {isLive ? 'Join Now →' : 'Register →'}
        </button>
      ) : null}
    </article>
  );
}
