import React from 'react';

const SLOT_LABELS: Record<string, string> = {
  mantra: 'MANTRA',
  sankalp: 'SANKALP',
  practice: 'PRACTICE',
};

const SLOT_TITLE_KEY: Record<string, string> = {
  mantra: 'card_mantra_title',
  sankalp: 'card_sankalpa_title',
  practice: 'card_ritual_title',
};

const SLOT_DESC_KEY: Record<string, string> = {
  mantra: 'card_mantra_description',
  sankalp: 'card_sankalpa_description',
  practice: 'card_ritual_description',
};

const SLOT_MASTER_KEY: Record<string, string> = {
  mantra: 'master_mantra',
  sankalp: 'master_sankalp',
  practice: 'master_practice',
};

// Unicode icons for each slot (gold, no external lib)
const SLOT_ICONS: Record<string, string> = {
  mantra: '♪',
  sankalp: '❧',
  practice: '✿',
};

interface Props {
  sd: Record<string, any>;
  onAction?: (action: any) => void;
}

interface TriadItem {
  slot: string;
  item_id: string;
  title: string;
  subtitle: string;
  completed: boolean;
  master: any;
}

export function TriadCardsRow({ sd, onAction }: Props) {
  const triadArr: any[] = Array.isArray(sd.today?.triad) ? sd.today.triad : [];
  const completed: string[] = Array.isArray(sd.completed_today) ? sd.completed_today : [];

  const items: TriadItem[] = ['mantra', 'sankalp', 'practice'].map((slot) => {
    const raw = triadArr.find((t: any) => t?.slot === slot);
    return {
      slot,
      item_id: raw?.item_id || '',
      title: raw?.title || sd[SLOT_TITLE_KEY[slot]] || '',
      subtitle: raw?.subtitle || sd[SLOT_DESC_KEY[slot]] || '',
      completed: completed.includes(slot),
      master: sd[SLOT_MASTER_KEY[slot]] || raw || null,
    };
  });

  const visible = items.filter((i) => !!i.title);

  // RN sovereignty: return null when no triad data (not an empty state message)
  if (!visible.length) {
    return null;
  }

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Horizontal 3-card row — matches RN layout */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 4,
        }}
      >
        {visible.map((item) => (
          <div
            key={item.slot}
            data-testid={`triad-card-${item.slot}`}
            style={{
              flex: 1,
              minWidth: 100,
              minHeight: 160,
              background: 'var(--kalpx-card-bg)',
              borderRadius: 14,
              border: '1px solid var(--kalpx-border-gold)',
              boxShadow: 'var(--kalpx-shadow-card)',
              padding: 12,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
            onClick={() => {
              if (!onAction) return;
              void onAction({
                type: 'start_runner',
                payload: {
                  source: 'core',
                  variant: item.slot,
                  item: item.master,
                },
              });
            }}
          >
            {/* Icon circle */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                background: 'rgba(201,168,76,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
                fontSize: 16,
                color: '#C9A84C',
                flexShrink: 0,
              }}
            >
              {SLOT_ICONS[item.slot] || '·'}
            </div>

            {/* Info button — top-right */}
            <button
              data-testid={`triad-info-${item.slot}`}
              onClick={(e) => {
                e.stopPropagation();
                onAction?.({
                  type: 'view_info',
                  payload: {
                    type: item.slot,
                    manualData: item.master,
                  },
                });
              }}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'none',
                border: 'none',
                fontSize: 14,
                color: '#C9A84C',
                cursor: 'pointer',
                lineHeight: 1,
                padding: 2,
              }}
              aria-label="More info"
            >
              ⓘ
            </button>

            {/* UPPERCASE micro label */}
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1.2,
                color: item.completed ? 'var(--kalpx-gold)' : 'var(--kalpx-gold)',
                textTransform: 'uppercase',
                margin: '0 0 4px',
                lineHeight: 1.2,
              }}
            >
              {SLOT_LABELS[item.slot]}
            </p>

            {/* Serif bold title */}
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                fontFamily: 'var(--kalpx-font-serif)',
                color: 'var(--kalpx-text)',
                lineHeight: 1.3,
                margin: '0 0 4px',
                flex: 1,
              }}
            >
              {item.title}
            </p>

            {/* Sub */}
            {item.subtitle && (
              <p
                style={{
                  fontSize: 11,
                  color: 'var(--kalpx-text-soft)',
                  lineHeight: 1.4,
                  margin: '0 0 8px',
                }}
              >
                {item.subtitle}
              </p>
            )}

            {/* Completion indicator — bottom right */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
              {item.completed ? (
                /* Green circle with checkmark */
                <div
                  data-testid={`triad-complete-${item.slot}`}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    background: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    color: '#fff',
                    flexShrink: 0,
                  }}
                >
                  ✓
                </div>
              ) : (
                /* Tan ring */
                <div
                  data-testid={`triad-incomplete-${item.slot}`}
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    border: '1.5px solid var(--kalpx-gold)',
                    background: 'transparent',
                    flexShrink: 0,
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
