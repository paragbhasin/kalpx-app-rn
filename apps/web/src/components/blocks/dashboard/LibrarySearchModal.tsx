import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { searchLibraryItems, addAdditionalItem } from '../../../engine/mitraApi';

interface Props {
  onClose: () => void;
  onItemAdded?: () => void;
  existingItemIds?: string[];
  // select mode
  isVisible?: boolean;
  mode?: 'add' | 'select';
  onItemSelected?: (item: any) => void;
  lockedItemType?: 'mantra' | 'sankalp' | 'practice';
  selectLabel?: string;
  headerTitle?: string;
}

const TYPE_LABELS: Record<string, string> = {
  mantra: 'MANTRA',
  sankalp: 'INTENTION',
  sankalpa: 'INTENTION',
  practice: 'PRACTICE',
};

const LEVEL_STYLES: Record<string, React.CSSProperties> = {
  beginner:     { color: '#3f7a67', background: 'rgba(115,171,147,0.14)' },
  intermediate: { color: '#8a5a1d', background: 'rgba(212,168,76,0.16)' },
  advanced:     { color: '#7a3358', background: 'rgba(164,97,137,0.14)' },
};

function getLevelLabel(item: any): string {
  const lv = String(item.level || '').trim().toLowerCase();
  if (lv === 'beginner' || item.beginnerSafe) return 'BEGINNER';
  if (lv === 'intermediate') return 'INTERMEDIATE';
  if (lv === 'advanced') return 'ADVANCED';
  return '';
}

export function LibrarySearchModal({
  onClose,
  onItemAdded,
  existingItemIds = [],
  isVisible,
  mode = 'add',
  onItemSelected,
  lockedItemType,
  selectLabel = 'Use this mantra',
  headerTitle,
}: Props) {
  if (isVisible === false) return null;

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set(existingItemIds));
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Auto-focus on desktop
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const prefersTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!prefersTouch && !lockedItemType) {
      inputRef.current?.focus();
    }
  }, [lockedItemType]);

  useEffect(() => {
    setAddedIds(new Set(existingItemIds));
  }, [existingItemIds]);

  // Browse-on-open when locked to a type
  useEffect(() => {
    if (!lockedItemType) return;
    setSearching(true);
    searchLibraryItems('', lockedItemType)
      .then((res) => setResults(res.results || []))
      .catch(() => setResults([]))
      .finally(() => setSearching(false));
  }, [lockedItemType]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      if (!lockedItemType) setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        if (lockedItemType) {
          const res = await searchLibraryItems(query.trim(), lockedItemType);
          setResults(res.results || []);
        } else {
          const types = ['mantra', 'sankalp', 'practice'];
          const responses = await Promise.all(
            types.map((type) => searchLibraryItems(query.trim(), type)),
          );
          setResults(
            responses.flatMap((data, i) =>
              (data.results || []).map((item: any) => ({ ...item, _type: types[i] })),
            ),
          );
        }
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, lockedItemType]);

  const handleAction = useCallback(async (item: any) => {
    if (mode === 'select' && onItemSelected) {
      onItemSelected(item);
      return;
    }
    const id = item.itemId || item.item_id || item.id;
    if (!id || item.alreadyInCore || item.alreadyAdded || addingId || addedIds.has(String(id))) return;
    setAddingId(String(id));
    try {
      await addAdditionalItem(
        String(id),
        item._type || item.itemType || item.item_type || item.type || 'practice',
      );
      setResults((prev) =>
        prev.map((r) =>
          String(r.itemId || r.item_id || r.id || '') === String(id)
            ? { ...r, alreadyAdded: true }
            : r,
        ),
      );
      setAddedIds((prev) => new Set([...prev, String(id)]));
      onItemAdded?.();
    } catch {
      // best-effort
    } finally {
      setAddingId(null);
    }
  }, [mode, onItemSelected, addingId, addedIds, onItemAdded]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  const typeLabel = (item: any) =>
    TYPE_LABELS[(item._type || item.itemType || item.item_type || item.type || '').toLowerCase()] ||
    (item._type || item.itemType || item.item_type || item.type || '').toUpperCase();

  const resultsList = (
    <div style={{ overflowY: 'auto', flex: 1 }}>
      {searching && (
        <p style={{ fontSize: 13, color: '#C99317', textAlign: 'center', marginTop: 24 }}>Loading…</p>
      )}
      {!searching && query.trim().length < 2 && !lockedItemType && (
        <p style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', textAlign: 'center', marginTop: 24 }}>
          Type at least 2 characters to search
        </p>
      )}
      {!searching && results.length === 0 && (query.trim().length >= 2 || lockedItemType) && (
        <p style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', textAlign: 'center', marginTop: 24 }}>
          No results found
        </p>
      )}
      {results.map((item) => {
        const id = String(item.itemId || item.item_id || item.id || '');
        const isInCore = Boolean(item.alreadyInCore);
        const isAdded = Boolean(item.alreadyAdded) || addedIds.has(id);
        const isAdding = addingId === id;
        const levelLabel = getLevelLabel(item);
        const levelStyle = LEVEL_STYLES[String(item.level || '').toLowerCase()] ?? LEVEL_STYLES.beginner;
        const tags: string[] = item.tags || [];

        return (
          <div
            key={id || item.title}
            style={{
              padding: '15px',
              borderRadius: 16,
              border: '1px solid rgba(218,194,142,0.55)',
              background: 'rgba(255,255,255,0.72)',
              boxShadow: '0 4px 16px rgba(201,168,76,0.07)',
              marginBottom: 12,
              opacity: mode !== 'select' && (isInCore || isAdded) ? 0.5 : 1,
            }}
          >
            <div style={{ display: 'flex', gap: 6, marginBottom: 7, flexWrap: 'wrap' }}>
              {typeLabel(item) && (
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: '#8a7a5a', textTransform: 'uppercase', background: '#F5F0E0', borderRadius: 6, padding: '2px 6px' }}>
                  {typeLabel(item)}
                </span>
              )}
              {levelLabel && (
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', borderRadius: 6, padding: '2px 7px', ...levelStyle }}>
                  {levelLabel}
                </span>
              )}
            </div>

            <p style={{ fontFamily: 'var(--kalpx-font-serif)', fontWeight: 700, fontSize: 15, color: '#432104', margin: '0 0 3px', lineHeight: 1.45 }}>
              {item.title}
            </p>

            {item.devanagari && (
              <p style={{ fontSize: 13, color: '#8B6914', margin: '0 0 6px', lineHeight: 1.5 }}>
                {item.devanagari}
              </p>
            )}

            {(item.subtitle || item.description) && !item.devanagari && (
              <p style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', margin: '0 0 6px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
                {item.subtitle || item.description}
              </p>
            )}

            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10, marginTop: 6 }}>
                {tags.map((tag) => (
                  <span key={tag} style={{ fontSize: 11, color: '#7B6550', background: 'rgba(199,160,72,0.12)', borderRadius: 20, padding: '2px 9px', border: '1px solid rgba(199,160,72,0.22)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              {mode !== 'select' && (isInCore || isAdded) ? (
                <span style={{ fontSize: 13, color: 'var(--kalpx-text-muted)', fontWeight: 600 }}>
                  {isInCore ? 'In core' : 'Added'}
                </span>
              ) : (
                <button
                  disabled={mode !== 'select' && !!addingId}
                  onClick={() => handleAction(item)}
                  style={{ padding: '6px 16px', borderRadius: 20, border: '1px solid rgba(199,160,72,0.6)', background: 'none', color: '#C99317', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  {mode === 'select' ? selectLabel : (isAdding ? '…' : 'Add')}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const panelContent = (padding: string) => (
    <div
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding, boxSizing: 'border-box' }}
      onKeyDown={handleKey}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p style={{ fontFamily: 'var(--kalpx-font-serif)', fontWeight: 700, fontSize: 20, color: '#4a2508', margin: 0 }}>
          {headerTitle ?? 'Browse Library'}
        </p>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a7a5a', padding: '0 4px' }}>
          <X size={22} />
        </button>
      </div>

      <div style={{ position: 'relative', marginBottom: 14 }}>
        <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#a39b93', pointerEvents: 'none' }} />
        <input
          ref={inputRef}
          type="text"
          placeholder={lockedItemType === 'mantra' ? 'Search mantras…' : 'Search…'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 10, border: '1px solid rgba(218,194,142,0.65)', background: '#FFFDF9', color: '#432104', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      {resultsList}
    </div>
  );

  if (isDesktop) {
    return (
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(67,33,4,0.14)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)', display: 'flex', justifyContent: 'flex-end' }}
        onClick={onClose}
      >
        <div
          style={{ width: 'min(460px, 100vw)', height: '100vh', background: 'linear-gradient(180deg,rgba(255,250,244,0.99) 0%,rgba(255,247,239,0.99) 100%)', borderLeft: '1px solid rgba(218,194,142,0.42)', boxShadow: '-24px 0 64px rgba(67,33,4,0.12)', display: 'flex', flexDirection: 'column' }}
          onClick={(e) => e.stopPropagation()}
        >
          {panelContent('24px 24px 24px')}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ width: '100%', maxWidth: 480, background: '#FFF8EF', borderRadius: '20px 20px 0 0', maxHeight: '88dvh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(149,139,128,0.35)' }} />
        </div>
        {panelContent('8px 18px 32px')}
      </div>
    </div>
  );
}
