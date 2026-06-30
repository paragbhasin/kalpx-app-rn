import type { RhythmTimeBand, RhythmItemType } from "@kalpx/types";
import React, { useCallback, useEffect, useState } from "react";
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
  summary?: string;
  // Sankalp / Practice fields
  line?: string;
  insight?: string;
  how_to_live?: string[];
  benefits?: string[];
  steps?: string[];
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

  function truncate(text: string | null | undefined, max = 110): string {
    if (!text) return "";
    if (text.length <= max) return text;
    return text.slice(0, max).trimEnd() + "…";
  }

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
          padding: "24px 20px 0",
          width: "100%",
          maxWidth: 480,
          height: "80dvh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: back arrow | title (centered) | close — never scrolls */}
        <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 40px", alignItems: "center", marginBottom: 16, flexShrink: 0 }}>
          <div>
            {detailItem && (
              <button
                onClick={() => setDetailItem(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  color: "#7D5408",
                  fontSize: 26,
                  lineHeight: 1,
                  fontWeight: 700,
                }}
              >
                ‹
              </button>
            )}
          </div>
          <div style={{ textAlign: "center", fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 17, color: "#432104" }}>
            {t("mitra.rhythmSetup.libraryModal.title")}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#7B6550", padding: 0 }}>✕</button>
          </div>
        </div>

        {detailItem ? (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            {/* ── Sticky top: badges+button row, then title ── */}
            <div style={{ paddingBottom: 14, borderBottom: "1px solid rgba(201,168,76,0.18)", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
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
                <button
                  onClick={() => pick(detailItem)}
                  style={{
                    marginLeft: "auto",
                    flexShrink: 0,
                    padding: "6px 18px",
                    borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(90deg, #C99317 0%, #E0AE21 100%)",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {t("mitra.rhythmSetup.libraryModal.select")}
                </button>
              </div>
              <div style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 20, color: "#4b260a", lineHeight: 1.3 }}>
                {detailItem.title}
              </div>
            </div>

            {/* ── Scrollable details below ── */}
            <div style={{ overflowY: "auto", flex: 1, paddingTop: 14, paddingBottom: 40 }}>
              {(() => {
                const BenefitPills = ({ items }: { items: string[] }) => (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {items.map((b, i) => (
                      <span key={i} style={{ fontSize: 12, color: "#7B6550", background: "rgba(201,168,76,0.1)", padding: "4px 12px", borderRadius: 999 }}>{b}</span>
                    ))}
                  </div>
                );
                const BulletList = ({ items }: { items: string[] }) => (
                  <>
                    {items.map((s, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <span style={{ color: "#C99317", fontSize: 16, lineHeight: "1.5" }}>•</span>
                        <div style={{ ...bodyStyle, fontSize: 14 }}>{s}</div>
                      </div>
                    ))}
                  </>
                );
                const TagRow = () => detailItem.tags && detailItem.tags.length > 0 ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
                    {detailItem.tags!.map((tag) => (
                      <span key={tag} style={{ fontSize: 11, color: "#84766a", background: "rgba(232,225,217,0.7)", padding: "5px 12px", borderRadius: 999 }}>{tag}</span>
                    ))}
                  </div>
                ) : null;

                if (detailItem.item_type === "mantra") {
                  return <>
                    {detailItem.devanagari && (
                      <div style={{ fontFamily: "var(--kalpx-font-serif)", fontSize: 20, color: "#6b3d12", lineHeight: 1.6, marginBottom: 4 }}>
                        {detailItem.devanagari}
                      </div>
                    )}
                    {renderDetailSection(t("mitra.rhythmSetup.libraryModal.pronunciation"), detailItem.iast)}
                    {renderDetailSection(t("mitra.rhythmSetup.libraryModal.meaning"), detailItem.meaning || detailItem.summary)}
                    {(detailItem.essence || detailItem.insight) && renderDetailSection(t("mitra.rhythmSetup.libraryModal.essence"), detailItem.essence || detailItem.insight)}
                    {(detailItem.deity || detailItem.tradition) && (
                      <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
                        {detailItem.deity && renderDetailSection(t("mitra.rhythmSetup.libraryModal.deity"), detailItem.deity)}
                        {detailItem.tradition && renderDetailSection(t("mitra.rhythmSetup.libraryModal.tradition"), detailItem.tradition)}
                      </div>
                    )}
                    <TagRow />
                  </>;
                }

                if (detailItem.item_type === "sankalp") {
                  return <>
                    {(detailItem.insight || detailItem.essence) && (
                      <div style={{ marginTop: 16 }}>
                        <div style={labelStyle}>{t("mitra.rhythmSetup.libraryModal.essence")}</div>
                        <div style={{ ...bodyStyle, fontStyle: "italic" }}>{detailItem.insight || detailItem.essence}</div>
                      </div>
                    )}
                    {detailItem.benefits && detailItem.benefits.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <div style={labelStyle}>BENEFITS</div>
                        <BenefitPills items={detailItem.benefits} />
                      </div>
                    )}
                    {detailItem.how_to_live && detailItem.how_to_live.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <div style={labelStyle}>{t("mitra.rhythmSetup.libraryModal.howToLive")}</div>
                        <BulletList items={detailItem.how_to_live} />
                      </div>
                    )}
                    <TagRow />
                  </>;
                }

                // practice
                return <>
                  {(detailItem.essence || detailItem.insight) && renderDetailSection(t("mitra.rhythmSetup.libraryModal.essence"), detailItem.essence || detailItem.insight)}
                  {detailItem.benefits && detailItem.benefits.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <div style={labelStyle}>BENEFITS</div>
                      <BenefitPills items={detailItem.benefits} />
                    </div>
                  )}
                  {detailItem.steps && detailItem.steps.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <div style={labelStyle}>STEPS</div>
                      {detailItem.steps.map((step, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, marginTop: 8 }}>
                          <span style={{ color: "#C99317", fontSize: 13, fontWeight: 600, minWidth: 20 }}>{i + 1}.</span>
                          <div style={{ ...bodyStyle, fontSize: 14 }}>{step}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <TagRow />
                </>;
              })()}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap", flexShrink: 0 }}>
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

            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexShrink: 0 }}>
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

            <div style={{ flex: 1, overflowY: "auto", paddingBottom: 40 }}>
            {searching && (
              <div style={{ display: "flex", justifyContent: "center", padding: "36px 0" }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    border: "3px solid rgba(201,168,76,0.25)",
                    borderTopColor: "#C99317",
                    borderRadius: "50%",
                    animation: "kalpx-spin 0.8s linear infinite",
                  }}
                />
              </div>
            )}

            {results.length === 0 && !searching && (
              <p style={{ color: "#A08060", textAlign: "center", fontSize: 14 }}>
                {query.trim()
                  ? t("mitra.rhythmSetup.libraryModal.noResults")
                  : t("mitra.rhythmSetup.libraryModal.browseHint")}
              </p>
            )}

            {!searching && results.map((item) => (
              <div
                key={item.itemId ?? item.item_id}
                style={{
                  border: "1px solid rgba(201,168,76,0.2)",
                  borderRadius: 14,
                  padding: "14px 16px",
                  marginBottom: 10,
                  background: "#fff",
                  boxShadow: "0 1px 4px rgba(67,33,4,0.06)",
                }}
              >
                {/* Badges row */}
                {(item.item_type || item.level) && (
                  <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                    {item.item_type && (
                      <span style={{
                        fontSize: 10,
                        textTransform: "uppercase" as const,
                        letterSpacing: 1,
                        color: "#8b6838",
                        background: "#f4ecdf",
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontWeight: 700,
                      }}>
                        {t(`mitra.rhythmSetup.libraryModal.type_${item.item_type}`)}
                      </span>
                    )}
                    {item.level && (
                      <span style={{
                        fontSize: 10,
                        textTransform: "uppercase" as const,
                        letterSpacing: 1,
                        color: item.level.toLowerCase() === "beginner" ? "#3f7a67"
                          : item.level.toLowerCase() === "advanced" ? "#8b3fa0"
                          : "#6b5a3e",
                        background: item.level.toLowerCase() === "beginner" ? "rgba(115,171,147,0.14)"
                          : item.level.toLowerCase() === "advanced" ? "rgba(139,63,160,0.12)"
                          : "rgba(201,168,76,0.12)",
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontWeight: 700,
                      }}>
                        {item.level}
                      </span>
                    )}
                  </div>
                )}

                {/* Title */}
                <div style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 16, color: "#3B2A1A", lineHeight: 1.3 }}>
                  {item.title}
                </div>

                {/* Description — JS truncation for guaranteed "…" on every card */}
                {(item.subtitle || item.description) && (
                  <div style={{ fontSize: 13, color: "#7B6550", marginTop: 5 }}>
                    {truncate(item.subtitle ?? item.description)}
                  </div>
                )}

                {/* Tags */}
                {item.tags && item.tags.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                    {item.tags.map((tag) => (
                      <span key={tag} style={{
                        fontSize: 11,
                        color: "#84766a",
                        background: "rgba(232,225,217,0.7)",
                        padding: "3px 10px",
                        borderRadius: 999,
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer row: View details + Select */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                  <button
                    onClick={() => setDetailItem(item)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      fontSize: 13,
                      color: "#b08a3e",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {t("mitra.rhythmSetup.libraryModal.viewDetails")} ›
                  </button>
                  <button
                    onClick={() => pick(item)}
                    style={{
                      border: "1.5px solid #C99317",
                      borderRadius: 999,
                      background: "transparent",
                      color: "#C99317",
                      fontSize: 13,
                      fontWeight: 700,
                      padding: "5px 18px",
                      cursor: "pointer",
                    }}
                  >
                    {t("mitra.rhythmSetup.libraryModal.select")}
                  </button>
                </div>
              </div>
            ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
