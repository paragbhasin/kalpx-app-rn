import React from 'react';

function safePhotoUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('https://') || url.startsWith('http://')) return url;
  return null;
}

function initials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return displayName.charAt(0).toUpperCase();
}

export interface GuideChipProps {
  displayName: string;
  photoUrl?: string | null;
  guideType?: string;
}

/**
 * GuideChip — compact inline guide attribution.
 * Shows 32 px circle avatar (photo or initials fallback), display name, and
 * optional guide_type label.  Intentionally exposes NO contact information.
 */
export function GuideChip({ displayName, photoUrl, guideType }: GuideChipProps) {
  const photo = safePhotoUrl(photoUrl);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 10px 4px 4px',
        background: 'var(--kalpx-chip-bg)',
        border: '1px solid var(--kalpx-border)',
        borderRadius: 20,
      }}
    >
      {/* Avatar */}
      {photo ? (
        <img
          src={photo}
          alt={`${displayName} photo`}
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            objectFit: 'cover',
            flexShrink: 0,
            border: '1px solid var(--kalpx-border-gold)',
          }}
        />
      ) : (
        <div
          aria-hidden="true"
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'var(--kalpx-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 10,
            fontWeight: 700,
            color: '#fff',
            letterSpacing: '0.02em',
          }}
        >
          {initials(displayName)}
        </div>
      )}

      {/* Name */}
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--kalpx-text)' }}>
        {displayName}
      </span>

      {/* Guide type label */}
      {guideType && (
        <span
          style={{
            fontSize: 10,
            color: 'var(--kalpx-text-muted)',
            letterSpacing: '0.04em',
          }}
        >
          · {guideType}
        </span>
      )}
    </div>
  );
}
