import React from 'react';
import type { RoomWhyThisState } from '@kalpx/contracts';

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
  screenData?: Record<string, any>;
  onAction?: (action: any) => void;
}

export function RoomPrincipleBanner({ banner, screenData, onAction }: Props) {
  if (!banner.principle_text && !banner.source_line) return null;

  const whyThisState = screenData?.room_why_this_state as RoomWhyThisState | undefined;
  const shouldSuppressTap = whyThisState?.shouldSuppressTap === true;
  const isCuratedSuccess = whyThisState?.mode === 'curated_success';
  const isTappable = !shouldSuppressTap && !!banner.principle_id && !!onAction;
  const cardLabel = isCuratedSuccess
    ? (whyThisState!.selectedItem?.short_label ?? 'A teaching')
    : 'A teaching';

  const handleTap = () => {
    if (!isTappable) return;
    if (isCuratedSuccess && whyThisState?.selectedItem) {
      onAction?.({
        type: 'open_why_this_l2',
        payload: { curated_content: whyThisState.selectedItem },
      });
    } else {
      onAction?.({ type: 'open_why_this_l2', principle_id: banner.principle_id });
    }
  };

  return (
    <div
      style={{
        margin: '0 20px 20px',
        padding: '20px 18px',
        borderRadius: 12,
        background: 'var(--kalpx-card-bg)',
        border: `1px solid var(--kalpx-cta)`,
        boxShadow: 'var(--kalpx-shadow-card)',
        cursor: isTappable ? 'pointer' : 'default',
        position: 'relative',
      }}
      data-testid="room-principle-banner"
      onClick={handleTap}
      role={isTappable ? 'button' : undefined}
      tabIndex={isTappable ? 0 : undefined}
      onKeyDown={(e) => isTappable && e.key === 'Enter' && handleTap()}
    >
      <p style={{ fontSize: 11, color: 'var(--kalpx-cta)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
        {cardLabel}
      </p>
      {banner.source_line && (
        <p style={{ fontSize: 11, color: 'var(--kalpx-cta)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
          {banner.source_line}
        </p>
      )}
      {banner.principle_text && (
        <p style={{ fontSize: 16, fontFamily: 'var(--kalpx-font-serif)', color: 'var(--kalpx-text)', lineHeight: 1.6, marginBottom: banner.helper_line ? 10 : 0 }}>
          "{banner.principle_text}"
        </p>
      )}
      {banner.helper_line && (
        <p style={{ fontSize: 13, color: 'var(--kalpx-text-soft)', lineHeight: 1.5 }}>
          {banner.helper_line}
        </p>
      )}
      {banner.tradition_tag && (
        <p style={{ fontSize: 11, color: 'var(--kalpx-text-muted)', marginTop: 8 }}>
          — {banner.tradition_tag}
        </p>
      )}
      {isTappable && (
        <span
          style={{
            position: 'absolute',
            bottom: 12,
            right: 14,
            fontSize: 16,
            color: 'var(--kalpx-gold)',
          }}
          data-testid="room-principle-banner-chevron"
        >
          ›
        </span>
      )}
    </div>
  );
}
