import React from 'react';
import { Link } from 'react-router-dom';
import { GuideChip } from './GuideChip';
import { useTranslation } from '../lib/i18n';

export interface ProgramCardGuide {
  displayName: string;
  photoUrl?: string | null;
  guideType?: string;
}

export interface ProgramCardProps {
  code: string;
  slug: string;
  title: string;
  programType: string;
  category: string;
  language: string;
  durationDays: number;
  startMode?: string | null;
  guide?: ProgramCardGuide | null;
  joinedCount: number;
  programPromise?: string | null;
  featuredOrder?: number | null;
}

function Badge({
  label,
  gold,
}: {
  label: string;
  gold?: boolean;
}) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 11,
        fontWeight: gold ? 600 : 400,
        letterSpacing: '0.04em',
        padding: '2px 8px',
        borderRadius: 4,
        border: gold ? '1px solid var(--kalpx-border-gold)' : '1px solid var(--kalpx-border)',
        color: gold ? 'var(--kalpx-gold)' : 'var(--kalpx-text-muted)',
        background: gold ? 'var(--kalpx-chip-bg)' : 'transparent',
      }}
    >
      {label}
    </span>
  );
}

export function ProgramCard({
  code,
  slug,
  title,
  programType,
  category,
  language,
  durationDays,
  guide,
  joinedCount,
  programPromise,
}: ProgramCardProps) {
  const { t } = useTranslation();
  const detailUrl = `/programs/${slug}`;
  const joinUrl = `/p/${slug}`;

  return (
    <article
      role="article"
      style={{
        background: 'var(--kalpx-card-bg)',
        border: '1px solid var(--kalpx-border-gold)',
        borderRadius: 'var(--kalpx-r-lg)',
        padding: '20px 24px',
      }}
    >
      {/* Top badge row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {programType && <Badge label={programType} gold />}
        {category && <Badge label={category} />}
        {language && <Badge label={language} />}
        <Badge label={`${durationDays} day${durationDays !== 1 ? 's' : ''}`} />
      </div>

      {/* Program name */}
      <h2
        style={{
          fontSize: 17,
          fontWeight: 600,
          color: 'var(--kalpx-text)',
          marginBottom: 6,
          lineHeight: 1.4,
        }}
      >
        {title}
      </h2>

      {/* Guide chip */}
      {guide ? (
        <div style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--kalpx-text-muted)', marginRight: 6 }}>
            {t('programs.offeredBy')}
          </span>
          <GuideChip
            displayName={guide.displayName}
            photoUrl={guide.photoUrl}
            guideType={guide.guideType}
          />
        </div>
      ) : null}

      {/* Program promise snippet */}
      {programPromise && (
        <p
          style={{
            fontSize: 13,
            color: 'var(--kalpx-text-soft)',
            lineHeight: 1.6,
            marginBottom: 12,
            fontStyle: 'italic',
          }}
        >
          {programPromise.length > 120 ? `${programPromise.slice(0, 120)}…` : programPromise}
        </p>
      )}

      {/* Joined count — only shown when >= 5 */}
      {joinedCount >= 5 && (
        <p
          style={{
            fontSize: 12,
            color: 'var(--kalpx-text-muted)',
            marginBottom: 14,
          }}
        >
          {t('programs.joined').replace('{n}', joinedCount.toLocaleString())}
        </p>
      )}

      {/* CTA buttons */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: joinedCount >= 5 ? 0 : 14 }}>
        <Link
          to={detailUrl}
          aria-label={`Learn more about ${title}`}
          style={{
            display: 'inline-block',
            padding: '9px 18px',
            background: 'transparent',
            color: 'var(--kalpx-gold)',
            border: '1px solid var(--kalpx-gold)',
            borderRadius: 'var(--kalpx-r-md)',
            fontWeight: 600,
            fontSize: 13,
            textDecoration: 'none',
          }}
        >
          {t('programs.learnMore')}
        </Link>
        <Link
          to={joinUrl}
          aria-label={`Join program ${title}`}
          style={{
            display: 'inline-block',
            padding: '9px 18px',
            background: 'var(--kalpx-gold)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--kalpx-r-md)',
            fontWeight: 600,
            fontSize: 13,
            textDecoration: 'none',
          }}
        >
          {t('programs.joinProgram')}
        </Link>
      </div>

      {/* Hidden accessible code annotation (useful for screen-readers + testing) */}
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
        Program code: {code}
      </span>
    </article>
  );
}
