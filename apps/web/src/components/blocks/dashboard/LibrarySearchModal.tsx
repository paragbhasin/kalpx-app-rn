import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { searchLibraryItems, addAdditionalItem } from '../../../engine/mitraApi';

interface Props {
  onClose: () => void;
  onItemAdded: () => void;
  existingItemIds: string[];
}

const TYPE_LABELS: Record<string, string> = {
  mantra: 'MANTRA',
  sankalp: 'INTENTION',
  sankalpa: 'INTENTION',
  practice: 'PRACTICE',
};

export function LibrarySearchModal({ onClose, onItemAdded, existingItemIds }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set(existingItemIds));
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const data = await searchLibraryItems(query.trim());
      setResults(data.results || []);
      setSearching(false);
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const handleAdd = useCallback(async (item: any) => {
    const id = item.item_id || item.id;
    if (!id || addingId || addedIds.has(String(id))) return;
    setAddingId(String(id));
    try {
      await addAdditionalItem(String(id), item.item_type || item.type || 'practice');
      setAddedIds((prev) => new Set([...prev, String(id)]));
      onItemAdded();
    } catch {
      // best-effort
    } finally {
      setAddingId(null);
    }
  }, [addingId, addedIds, onItemAdded]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  const typeLabel = (item: any) =>
    TYPE_LABELS[(item.item_type || item.type || '').toLowerCase()] || (item.item_type || item.type || '').toUpperCase();

  return (
    <div
      data-testid="library-search-modal-backdrop"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        data-testid="library-search-modal"
        style={{ width: '100%', maxWidth: 480, background: 'var(--kalpx-card-bg)', borderRadius: '20px 20px 0 0', padding: '12px 18px 32px', maxHeight: '88dvh', display: 'flex', flexDirection: 'column' }}
        onKeyDown={handleKey}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--kalpx-chip-bg)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p style={{ fontFamily: 'var(--kalpx-font-serif)', fontWeight: 700, fontSize: 18, color: 'var(--kalpx-text)', margin: 0 }}>
            Browse Library
          </p>
          <button
            data-testid="library-search-close"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--kalpx-text-muted)', padding: '0 4px', fontSize: 22, lineHeight: 1 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--kalpx-text-muted)', pointerEvents: 'none' }} />
          <input
            ref={inputRef}
            data-testid="library-search-input"
            type="text"
            placeholder="Search mantras, intentions, practices…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              borderRadius: 10,
              border: '1px solid var(--kalpx-border-gold)',
              background: 'var(--kalpx-bg)',
              color: 'var(--kalpx-text)',
              fontSize: 14,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Results */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {query.trim().length < 2 && (
            <p style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', textAlign: 'center', marginTop: 24 }}>
              Type at least 2 characters to search
            </p>
          )}

          {query.trim().length >= 2 && !searching && results.length === 0 && (
            <p style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', textAlign: 'center', marginTop: 24 }}>
              No results found
            </p>
          )}

          {results.map((item) => {
            const id = String(item.item_id || item.id || '');
            const isAdded = addedIds.has(id);
            const isAdding = addingId === id;
            return (
              <div
                key={id || item.title}
                data-testid={`library-result-${id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 0',
                  borderBottom: '1px solid var(--kalpx-gold-hairline)',
                  opacity: isAdded ? 0.5 : 1,
                }}
              >
                <div style={{ flex: 1 }}>
                  {item.item_type && (
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: 'var(--kalpx-text-muted)', textTransform: 'uppercase', background: '#F5F0E0', borderRadius: 6, padding: '2px 6px', display: 'inline-block', marginBottom: 4 }}>
                      {typeLabel(item)}
                    </span>
                  )}
                  <p style={{ fontFamily: 'var(--kalpx-font-serif)', fontWeight: 700, fontSize: 15, color: 'var(--kalpx-text)', margin: '0 0 2px' }}>
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', margin: 0 }}>
                      {item.subtitle}
                    </p>
                  )}
                </div>
                <button
                  data-testid={`library-add-${id}`}
                  disabled={isAdded || !!addingId}
                  onClick={() => handleAdd(item)}
                  style={{
                    marginLeft: 12,
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: 'none',
                    background: isAdded ? 'rgba(16,185,129,0.1)' : 'var(--kalpx-gold)',
                    color: isAdded ? '#10b981' : '#fff',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: isAdded || addingId ? 'default' : 'pointer',
                    minWidth: 60,
                    flexShrink: 0,
                  }}
                >
                  {isAdding ? '…' : isAdded ? 'Added' : 'Add'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
