import React from 'react';

interface PrincipleBanner {
  source_line?: string | null;
  principle_text?: string | null;
  tradition_tag?: string | null;
  helper_line?: string | null;
  principle_id?: string | number | null;
  [key: string]: any;
}

interface Props {
  banner: PrincipleBanner;
  onAction?: (action: any) => void;
}

export function RoomPrincipleBanner({ banner, onAction }: Props) {
  if (!banner.principle_text && !banner.source_line) return null;

  const isTappable = !!banner.principle_id && !!onAction;

  const handleTap = () => {
    if (isTappable) {
      onAction?.({ type: 'open_why_this_l2', principle_id: banner.principle_id });
    }
  };

  return (
    <div
      style={{
        margin: '0 20px 20px',
        padding: '20px 18px',
        borderRadius: 12,
        background: 'rgba(201,168,76,0.06)',
        border: '1px solid rgba(201,168,76,0.2)',
        cursor: isTappable ? 'pointer' : 'default',
        position: 'relative',
      }}
      data-testid="room-principle-banner"
      onClick={handleTap}
      role={isTappable ? 'button' : undefined}
      tabIndex={isTappable ? 0 : undefined}
      onKeyDown={(e) => isTappable && e.key === 'Enter' && handleTap()}
    >
      {banner.source_line && (
        <p style={{ fontSize: 11, color: '#C9A84C', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
          {banner.source_line}
        </p>
      )}
      {banner.principle_text && (
        <p style={{ fontSize: 16, color: '#2C2A26', lineHeight: 1.6, fontStyle: 'italic', marginBottom: banner.helper_line ? 10 : 0 }}>
          "{banner.principle_text}"
        </p>
      )}
      {banner.helper_line && (
        <p style={{ fontSize: 13, color: '#6B6356', lineHeight: 1.5 }}>
          {banner.helper_line}
        </p>
      )}
      {banner.tradition_tag && (
        <p style={{ fontSize: 11, color: '#9A8C78', marginTop: 8 }}>
          — {banner.tradition_tag}
        </p>
      )}
      {/* Chevron visible when principle_id is present */}
      {isTappable && (
        <span
          style={{
            position: 'absolute',
            bottom: 12,
            right: 14,
            fontSize: 16,
            color: '#C9A84C',
          }}
          data-testid="room-principle-banner-chevron"
        >
          ›
        </span>
      )}
    </div>
  );
}
