import React, { useEffect, useRef, useState } from "react";
import {
  fetchLibraryMantras,
  fetchLibraryPractices,
  fetchLibrarySankalps,
  fetchLibraryWisdoms,
  LibraryMantra,
  LibraryPractice,
  LibrarySankalp,
  LibraryWisdom,
} from "../../engine/liveSessionApi";

export type LibrarySlot = "mantra" | "sankalp" | "practice" | "wisdom";

export interface DetailField {
  label: string;
  value: string | string[];
}

export interface PickerItem {
  item_id: string;
  title: string;
  subtitle: string;
  meta: string;
  details: DetailField[];
}

interface Props {
  slot: LibrarySlot;
  onSelect: (item: PickerItem) => void;
  onClose: () => void;
}

function hasValue(v: string | string[]): boolean {
  return Array.isArray(v) ? v.length > 0 : !!v;
}

export function toPickerItem(slot: LibrarySlot, raw: LibraryMantra | LibrarySankalp | LibraryPractice | LibraryWisdom): PickerItem {
  if (slot === "mantra") {
    const m = raw as LibraryMantra;
    return {
      item_id: m.item_id,
      title: m.title,
      subtitle: m.devanagari || m.meaning || "",
      meta: [m.deity, m.category_label].filter(Boolean).join(" · "),
      details: [
        { label: "Meaning", value: m.meaning },
        { label: "Essence", value: m.essence },
        { label: "Devanagari", value: m.devanagari },
        { label: "IAST", value: m.iast },
      ].filter(d => hasValue(d.value)),
    };
  }
  if (slot === "sankalp") {
    const s = raw as LibrarySankalp;
    return {
      item_id: s.item_id,
      title: s.title,
      subtitle: s.line || s.insight || "",
      meta: s.category_label,
      details: [
        { label: "Essence / Insight", value: s.insight },
        { label: "How to Live", value: s.how_to_live },
        { label: "Benefits", value: s.benefits },
      ].filter(d => hasValue(d.value)),
    };
  }
  if (slot === "wisdom") {
    const w = raw as LibraryWisdom;
    return {
      item_id: w.item_id,
      title: w.text,
      subtitle: w.explanation[0] || "",
      meta: [w.mood, ...w.tags.slice(0, 2)].filter(Boolean).join(" · "),
      details: [
        { label: "Explanation", value: w.explanation },
        { label: "Source", value: w.source_title },
      ].filter(d => hasValue(d.value)),
    };
  }
  const p = raw as LibraryPractice;
  return {
    item_id: p.item_id,
    title: p.title,
    subtitle: p.summary || "",
    meta: [p.category_label, p.duration].filter(Boolean).join(" · "),
    details: [
      { label: "Steps", value: p.steps },
      { label: "Essence", value: p.essence },
      { label: "Benefits", value: p.benefits },
    ].filter(d => hasValue(d.value)),
  };
}

const LABEL: Record<LibrarySlot, string> = {
  mantra: "Mantra",
  sankalp: "Sankalp",
  practice: "Practice",
  wisdom: "Wisdom",
};

export function GuideLibraryPickerModal({ slot, onSelect, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<PickerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    load("");
  }, [slot]);

  async function load(q: string) {
    setLoading(true);
    try {
      let raw: PickerItem[] = [];
      if (slot === "mantra") {
        const res = await fetchLibraryMantras({ q });
        raw = res.items.map((i) => toPickerItem("mantra", i));
      } else if (slot === "sankalp") {
        const res = await fetchLibrarySankalps({ q });
        raw = res.items.map((i) => toPickerItem("sankalp", i));
      } else if (slot === "wisdom") {
        const res = await fetchLibraryWisdoms({ q });
        raw = res.items.map((i) => toPickerItem("wisdom", i));
      } else {
        const res = await fetchLibraryPractices({ q });
        raw = res.items.map((i) => toPickerItem("practice", i));
      }
      setItems(raw);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    load(query);
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={header}>
          <span style={headerTitle}>Choose {LABEL[slot]}</span>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={searchRow}>
          <input
            ref={inputRef}
            value={query}
            onChange={handleSearch}
            placeholder={`Search ${LABEL[slot].toLowerCase()}s…`}
            style={searchInput}
          />
          <button type="submit" style={searchBtn}>Search</button>
        </form>

        {/* Items */}
        <div style={listWrapper}>
          {loading ? (
            <p style={hint}>Loading…</p>
          ) : items.length === 0 ? (
            <p style={hint}>No results.</p>
          ) : (
            items.map((item) => (
              <button
                key={item.item_id}
                style={itemRow}
                onClick={() => onSelect(item)}
              >
                <span style={itemTitle}>{item.title}</span>
                {item.subtitle ? <span style={itemSub}>{item.subtitle.slice(0, 80)}</span> : null}
                {item.meta ? <span style={itemMeta}>{item.meta}</span> : null}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
  zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
};
const modal: React.CSSProperties = {
  background: "#fff", borderRadius: 12, width: "min(92vw, 560px)",
  maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden",
  boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
};
const header: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "16px 20px 12px", borderBottom: "1px solid #EEE8DC",
};
const headerTitle: React.CSSProperties = { fontSize: 16, fontWeight: 700, color: "#432104" };
const closeBtn: React.CSSProperties = {
  background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#8B6F4E",
};
const searchRow: React.CSSProperties = {
  display: "flex", gap: 8, padding: "12px 20px",
  borderBottom: "1px solid #EEE8DC",
};
const searchInput: React.CSSProperties = {
  flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid #DDD3C0",
  fontSize: 14, outline: "none",
};
const searchBtn: React.CSSProperties = {
  padding: "8px 16px", background: "#C99317", color: "#fff", border: "none",
  borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13,
};
const listWrapper: React.CSSProperties = {
  overflowY: "auto", flex: 1, padding: "8px 0",
};
const itemRow: React.CSSProperties = {
  width: "100%", textAlign: "left", background: "none", border: "none",
  padding: "10px 20px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 2,
  borderBottom: "1px solid #F5EFE5",
};
const itemTitle: React.CSSProperties = { fontSize: 14, color: "#432104", fontWeight: 600 };
const itemSub: React.CSSProperties = { fontSize: 12, color: "#7A6652" };
const itemMeta: React.CSSProperties = {
  fontSize: 11, color: "#B5A08A", textTransform: "uppercase", letterSpacing: "0.06em",
};
const hint: React.CSSProperties = { textAlign: "center", color: "#B5A08A", padding: "24px 0", fontSize: 14 };
