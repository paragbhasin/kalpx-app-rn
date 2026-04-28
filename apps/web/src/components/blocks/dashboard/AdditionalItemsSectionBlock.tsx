import React, { useState, useEffect, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { fetchAdditionalItems, removeAdditionalItem } from '../../../engine/mitraApi';
import { LibrarySearchModal } from './LibrarySearchModal';

interface AdditionalItem {
  id?: string | number;
  item_id?: string;
  title?: string;
  subtitle?: string;
  item_type?: string;
  slot?: string;
  source?: string;
  completedToday?: boolean;
  sessionsCount?: number;
  [key: string]: any;
}

interface Props {
  sd: Record<string, any>;
  onAction?: (action: any) => void;
}

function actionLabel(itemType?: string): string {
  if (itemType === 'mantra') return 'Chant';
  if (itemType === 'sankalp' || itemType === 'sankalpa') return 'Embody';
  return 'Practice';
}

export function AdditionalItemsSectionBlock({ sd, onAction }: Props) {
  const [items, setItems] = useState<AdditionalItem[]>(
    Array.isArray(sd.additional_items) ? sd.additional_items : [],
  );
  const [collapsed, setCollapsed] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchAdditionalItems().then((data) => {
      if (cancelled) return;
      if (data.items.length > 0 || Array.isArray(sd.additional_items)) {
        setItems(data.items.length > 0 ? data.items : (sd.additional_items ?? []));
      }
      if (data.uiHints?.shouldCollapse === true) setCollapsed(true);
      else setCollapsed(false);
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshItems = useCallback(() => {
    fetchAdditionalItems().then((data) => setItems(data.items));
  }, []);

  const handleRemove = useCallback(async (item: AdditionalItem) => {
    const id = item.id ?? item.item_id;
    if (!id || removingId) return;
    setRemovingId(String(id));
    try {
      await removeAdditionalItem(id);
      setItems((prev) => prev.filter((i) => (i.id ?? i.item_id) !== id));
    } catch {
      // best-effort
    } finally {
      setRemovingId(null);
    }
  }, [removingId]);

  const handleLaunch = useCallback((item: AdditionalItem) => {
    if (!onAction) return;
    onAction({
      type: 'start_runner',
      payload: {
        source: item.source || `additional_${item.item_type || 'recommended'}`,
        variant: item.item_type || 'mantra',
        item,
      },
    });
  }, [onAction]);

  if (!items.length && !showLibrary) {
    // Still render the section header + add button even when empty
  }

  const hasMore = items.length > 2;
  const visibleItems = collapsed ? items.slice(0, 2) : items;
  const existingItemIds = items.map((i) => String(i.id ?? i.item_id ?? ''));

  return (
    <>
      <div
        data-testid="additional-items-section"
        style={{
          marginBottom: 24,
          borderRadius: 15,
          border: '1px solid rgba(192,145,61,0.4)',
          boxShadow: '0 4px 20px rgba(127,90,34,0.10)',
          padding: '16px 16px 12px',
        }}
      >
        {/* Section header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--kalpx-text-muted)', textTransform: 'uppercase', margin: 0 }}>
            {sd.additional_items_label || 'Additional Practices'}
          </p>
          <button
            data-testid="additional-items-add-library"
            onClick={() => setShowLibrary(true)}
            style={{ background: 'none', border: 'none', fontFamily: 'var(--kalpx-font-serif)', fontWeight: 700, fontSize: 13, color: 'var(--kalpx-gold)', cursor: 'pointer', padding: '0 2px' }}
          >
            + Add
          </button>
        </div>

        {/* Item list */}
        {items.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {visibleItems.map((item, i) => {
              const id = String(item.id ?? item.item_id ?? i);
              const isRemoving = removingId === id;
              return (
                <div
                  key={id}
                  data-testid={`additional-item-${item.item_id ?? i}`}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 20,
                    border: item.completedToday
                      ? '1px solid rgba(16,185,129,0.15)'
                      : '1px solid rgba(228,197,145,0.8)',
                    background: item.completedToday ? 'rgba(16,185,129,0.02)' : '#ffffff',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: 10,
                  }}
                >
                  {/* Info column */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                      {item.item_type && (
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: 'var(--kalpx-text-muted)', textTransform: 'uppercase', background: '#F5F0E0', borderRadius: 6, padding: '3px 8px', display: 'inline-block' }}>
                          {item.item_type}
                        </span>
                      )}
                      {item.completedToday && (
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#10b981', textTransform: 'uppercase', background: 'rgba(16,185,129,0.1)', borderRadius: 6, padding: '3px 8px', display: 'inline-block' }}>
                          Done
                        </span>
                      )}
                    </div>
                    <p style={{ fontFamily: 'var(--kalpx-font-serif)', fontSize: 17, fontWeight: 700, color: 'var(--kalpx-text)', margin: '0 0 2px', lineHeight: 1.3 }}>
                      {item.title || item.item_id || 'Practice item'}
                    </p>
                    {item.subtitle && (
                      <p style={{ fontFamily: 'var(--kalpx-font-serif)', fontSize: 14, color: 'var(--kalpx-text-soft)', margin: '0 0 2px', lineHeight: 1.4 }}>
                        {item.subtitle}
                      </p>
                    )}
                    {!!item.sessionsCount && (
                      <p style={{ fontSize: 11, color: 'var(--kalpx-text-muted)', margin: 0 }}>
                        {item.sessionsCount} {item.sessionsCount === 1 ? 'session' : 'sessions'}
                      </p>
                    )}
                  </div>

                  {/* Action column */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    {!item.completedToday && (
                      <button
                        data-testid={`additional-item-launch-${id}`}
                        onClick={() => handleLaunch(item)}
                        style={{
                          padding: '7px 16px',
                          borderRadius: 20,
                          border: 'none',
                          background: 'linear-gradient(135deg, #c9a84c, #a8873a)',
                          color: '#fff',
                          fontFamily: 'var(--kalpx-font-serif)',
                          fontWeight: 700,
                          fontSize: 14,
                          cursor: 'pointer',
                          minWidth: 72,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {actionLabel(item.item_type)}
                      </button>
                    )}
                    <button
                      data-testid={`additional-item-remove-${id}`}
                      disabled={!!removingId}
                      onClick={() => handleRemove(item)}
                      style={{ background: 'none', border: 'none', cursor: removingId ? 'default' : 'pointer', padding: 4, color: isRemoving ? 'var(--kalpx-gold)' : 'var(--kalpx-text-muted)', opacity: isRemoving ? 0.5 : 1 }}
                    >
                      <Trash2 size={16} strokeWidth={1.6} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Collapse toggle */}
        {hasMore && (
          <button
            data-testid="additional-items-toggle"
            onClick={() => setCollapsed((c) => !c)}
            style={{ background: 'none', border: 'none', fontSize: 13, color: 'var(--kalpx-gold)', cursor: 'pointer', marginTop: 8, padding: '4px 0', width: '100%', textAlign: 'center' }}
          >
            {collapsed ? `See all (${items.length})` : 'Show less'}
          </button>
        )}
      </div>

      {showLibrary && (
        <LibrarySearchModal
          onClose={() => setShowLibrary(false)}
          onItemAdded={refreshItems}
          existingItemIds={existingItemIds}
        />
      )}
    </>
  );
}
