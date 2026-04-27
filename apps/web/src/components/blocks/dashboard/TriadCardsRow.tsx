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
  if (!visible.length) {
    return (
      <div
        style={{
          padding: 24,
          borderRadius: 12,
          border: '1px dashed #e0d4b8',
          textAlign: 'center',
          color: '#aaa',
          fontSize: 14,
          marginBottom: 20,
        }}
      >
        Your path is preparing…
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <p
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 2,
          color: '#b08840',
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        Today's Practice
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {visible.map((item) => (
          <button
            key={item.slot}
            data-testid={`triad-card-${item.slot}`}
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
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '14px 16px',
              borderRadius: 12,
              border: `1px solid ${item.completed ? '#86efac' : '#e0d4b8'}`,
              background: item.completed ? '#f0fdf4' : '#fdf8ef',
              cursor: 'pointer',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.5,
                color: item.completed ? '#15803d' : '#b08840',
                textTransform: 'uppercase',
                marginBottom: 4,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>{SLOT_LABELS[item.slot]}</span>
              {item.completed && <span>✓</span>}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1a0a', lineHeight: 1.3 }}>
              {item.title}
            </div>
            {item.subtitle && (
              <div style={{ fontSize: 13, color: '#6b4c1a', marginTop: 4, lineHeight: 1.4 }}>
                {item.subtitle}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
