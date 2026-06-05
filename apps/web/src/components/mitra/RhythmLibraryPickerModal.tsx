import type { RhythmTimeBand, RhythmItemType } from "@kalpx/types";
import { useCallback, useState } from "react";
import { useTranslation } from "../../lib/i18n";
import { searchLibraryItems } from "../../engine/mitraApi";

interface LibraryItem {
  itemId: string;
  title: string;
  subtitle?: string | null;
  item_type?: string;
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

const ITEM_TYPE_VALUES: RhythmItemType[] = ["mantra", "sankalp", "practice", "reflection", "library"];

export function RhythmLibraryPickerModal({ band, onPick, onClose, nextSortOrder }: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<RhythmItemType>("mantra");
  const [results, setResults] = useState<LibraryItem[]>([]);
  const [searching, setSearching] = useState(false);

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await searchLibraryItems(query.trim(), typeFilter);
      setResults(Array.isArray(res.results) ? res.results : []);
    } finally {
      setSearching(false);
    }
  }, [query, typeFilter]);

  function pick(item: LibraryItem) {
    onPick({
      slot: band,
      item_type: typeFilter,
      item_id: item.itemId,
      title_snapshot: item.title,
      description_snapshot: item.subtitle ?? null,
      source: "library",
      sort_order: nextSortOrder,
      reminder_enabled: false,
    });
    onClose();
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
          <span style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 18, color: "#432104" }}>
            {t("mitra.rhythmSetup.libraryModal.title")}
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#7B6550" }}>✕</button>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {ITEM_TYPE_VALUES.map((val) => (
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
            onKeyDown={(e) => { if (e.key === "Enter") void search(); }}
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
            onClick={() => void search()}
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

        {results.length === 0 && !searching && query && (
          <p style={{ color: "#A08060", textAlign: "center", fontSize: 14 }}>{t("mitra.rhythmSetup.libraryModal.noResults")}</p>
        )}

        {results.map((item) => (
          <div
            key={item.itemId}
            onClick={() => pick(item)}
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
            {item.subtitle && (
              <div style={{ fontSize: 13, color: "#7B6550", marginTop: 4 }}>{item.subtitle}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
