import type { RhythmTimeBand, RhythmItemType } from "@kalpx/types";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "../../lib/i18n";
import { searchLibraryItems } from "../../engine/mitraApi";

interface LibraryItem {
  itemId: string;
  item_id?: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  item_type?: string;
  // Rich fields returned by library/search
  devanagari?: string;
  iast?: string;
  meaning?: string;
  essence?: string | null;
  deity?: string;
  tradition?: string;
  tags?: string[];
  level?: string;
}

interface PickedItem {
  slot: RhythmTimeBand;
  item_type: RhythmItemType;
  item_id: string;
  title_snapshot: string;
  description_snapshot: string | null;
  source: "library";
  sort_order: number;
  reminder_enabled: boolean;
}

interface Props {
  band: RhythmTimeBand;
  onPick: (item: PickedItem) => void;
  onClose: () => void;
  nextSortOrder: number;
}

type FilterType = "all" | RhythmItemType;

const TAB_VALUES: FilterType[] = ["all", "mantra", "sankalp", "practice"];
// Types that "All" browses/searches across.
const ALL_TYPES: RhythmItemType[] = ["mantra", "sankalp", "practice"];

export function RhythmLibraryPickerModal({ band, onPick, onClose, nextSortOrder }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [results, setResults] = useState<LibraryItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [detailItem, setDetailItem] = useState<LibraryItem | null>(null);

  const runSearch = useCallback(async (q: string, type: FilterType) => {
    setSearching(true);
    try {
      if (type === "all") {
        const settled = await Promise.allSettled(
          ALL_TYPES.map((tp) => searchLibraryItems(q.trim(), tp)),
        );
        const merged: LibraryItem[] = settled.flatMap((r, i) =>
          r.status === "fulfilled" && Array.isArray(r.value.results)
            ? r.value.results.map((item: LibraryItem) => ({
                ...item,
                item_type: item.item_type ?? ALL_TYPES[i],
              }))
            : [],
        );
        setResults(merged);
      } else {
        const res = await searchLibraryItems(q.trim(), type);
        setResults(
          (Array.isArray(res.results) ? res.results : []).map((item: LibraryItem) => ({
            ...item,
            item_type: item.item_type ?? type,
          })),
        );
      }
    } finally {
      setSearching(false);
    }
  }, []);

  // Browse the default list on open AND whenever the tab changes — no need to
  // press Search first. Typing + Search filters within the selected type.
  useEffect(() => {
    setQuery("");
    setDetailItem(null);
    void runSearch("", typeFilter);
  }, [typeFilter, runSearch]);

  const search = useCallback(() => {
    void runSearch(query, typeFilter);
  }, [query, typeFilter, runSearch]);

  function pick(item: LibraryItem) {
    onPick({
      slot: band,
      item_type: (item.item_type as RhythmItemType) ?? (typeFilter === "all" ? "mantra" : typeFilter),
      item_id: item.itemId ?? (item.item_id as string),
      title_snapshot: item.title,
      description_snapshot: item.subtitle ?? item.description ?? null,
      source: "library",
      sort_order: nextSortOrder,
      reminder_enabled: false,
    });
    onClose();
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#A07C45",
    fontWeight: 700,
    marginBottom: 4,
  };
  const bodyStyle: React.CSSProperties = {
    fontSize: 15,
    color: "#544A40",
    lineHeight: 1.5,
    fontFamily: "var(--kalpx-font-serif)",
  };

  function renderDetailSection(label: string, value?: string | null) {
    if (!value) return null;
    return (
      <div style={{ marginTop: 16 }}>
        <div style={labelStyle}>{label}</div>
        <div style={bodyStyle}>{value}</div>
      </div>
    );
  }

  return (
    <div
      className="rhythm-library-picker-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        className="rhythm-library-picker-sheet"
        style={{
          background: "#FFF8EF",
          borderRadius: "18px 18px 0 0",
          padding: "24px 20px 40px",
          width: "100%",
          maxWidth: 480,
          maxHeight: "80dvh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          {detailItem ? (
            <button
              onClick={() => setDetailItem(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--kalpx-font-serif)",
                fontWeight: 700,
                fontSize: 16,
                color: "#7D5408",
                padding: 0,
              }}
            >
              ‹ {t("mitra.rhythmSetup.libraryModal.title")}
            </button>
          ) : (
            <span style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 18, color: "#432104" }}>
              {t("mitra.rhythmSetup.libraryModal.title")}
            </span>
          )}
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#7B6550" }}>✕</button>
        </div>

        {detailItem ? (
          <div>
            {(detailItem.item_type || detailItem.level) && (
              <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                {detailItem.item_type && (
                  <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#8b6838", background: "#f4ecdf", padding: "4px 10px", borderRadius: 999, fontWeight: 700 }}>
                    {t(`mitra.rhythmSetup.libraryModal.type_${detailItem.item_type}`)}
                  </span>
                )}
                {detailItem.level && (
                  <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#3f7a67", background: "rgba(115,171,147,0.14)", padding: "4px 10px", borderRadius: 999, fontWeight: 700 }}>
                    {detailItem.level}
                  </span>
                )}
              </div>
            )}

            <div style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 22, color: "#4b260a", lineHeight: 1.25 }}>
              {detailItem.title}
            </div>

            {detailItem.devanagari && (
              <div style={{ fontFamily: "var(--kalpx-font-serif)", fontSize: 20, color: "#6b3d12", lineHeight: 1.6, marginTop: 12 }}>
                {detailItem.devanagari}
              </div>
            )}
            {renderDetailSection(t("mitra.rhythmSetup.libraryModal.pronunciation"), detailItem.iast)}
            {renderDetailSection(t("mitra.rhythmSetup.libraryModal.meaning"), detailItem.meaning)}
            {renderDetailSection(t("mitra.rhythmSetup.libraryModal.essence"), detailItem.essence)}
            {renderDetailSection(t("mitra.rhythmSetup.libraryModal.about"), detailItem.subtitle ?? detailItem.description)}
            {(detailItem.deity || detailItem.tradition) && (
              <div style={{ display: "flex", gap: 28, marginTop: 18, flexWrap: "wrap" }}>
                {renderDetailSection(t("mitra.rhythmSetup.libraryModal.deity"), detailItem.deity)}
                {renderDetailSection(t("mitra.rhythmSetup.libraryModal.tradition"), detailItem.tradition)}
              </div>
            )}
            {detailItem.tags && detailItem.tags.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
                {detailItem.tags.map((tag) => (
                  <span key={tag} style={{ fontSize: 11, color: "#84766a", background: "rgba(232,225,217,0.7)", padding: "5px 12px", borderRadius: 999 }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() => pick(detailItem)}
              style={{
                marginTop: 26,
                width: "100%",
                padding: "14px 16px",
                borderRadius: 12,
                border: "none",
                background: "linear-gradient(90deg, #C99317 0%, #E0AE21 100%)",
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {t("mitra.rhythmSetup.libraryModal.select")}
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
              {TAB_VALUES.map((val) => (
                <button
                  key={val}
                  onClick={() => setTypeFilter(val)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 20,
                    border: "1px solid rgba(201,168,76,0.4)",
                    background: typeFilter === val ? "rgba(201,168,76,0.2)" : "transparent",
                    color: "#432104",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {t(`mitra.rhythmSetup.libraryModal.type_${val}`)}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") search(); }}
                placeholder={t("mitra.rhythmSetup.libraryModal.searchPlaceholder")}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid rgba(201,168,76,0.3)",
                  fontSize: 15,
                  fontFamily: "var(--kalpx-font-serif)",
                  color: "#432104",
                  background: "rgba(255,252,248,0.9)",
                  outline: "none",
                }}
              />
              <button
                onClick={search}
                disabled={searching}
                style={{
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(90deg, #C99317 0%, #E0AE21 100%)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {searching ? "…" : t("mitra.rhythmSetup.libraryModal.searchBtn")}
              </button>
            </div>

            {results.length === 0 && !searching && (
              <p style={{ color: "#A08060", textAlign: "center", fontSize: 14 }}>
                {query.trim()
                  ? t("mitra.rhythmSetup.libraryModal.noResults")
                  : t("mitra.rhythmSetup.libraryModal.browseHint")}
              </p>
            )}

            {results.map((item) => (
              <div
                key={item.itemId ?? item.item_id}
                onClick={() => setDetailItem(item)}
                style={{
                  border: "1px solid rgba(201,168,76,0.2)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  marginBottom: 8,
                  cursor: "pointer",
                  background: "rgba(255,252,248,0.9)",
                }}
              >
                <div style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 15, color: "#432104" }}>
                  {item.title}
                </div>
                {(item.subtitle || item.description) && (
                  <div style={{ fontSize: 13, color: "#7B6550", marginTop: 4 }}>{item.subtitle ?? item.description}</div>
                )}
                <div style={{ fontSize: 12, color: "#b08a3e", fontWeight: 600, marginTop: 8 }}>
                  {t("mitra.rhythmSetup.libraryModal.viewDetails")} ›
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
