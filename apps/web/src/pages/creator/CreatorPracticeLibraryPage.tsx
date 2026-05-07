import { ArrowLeft, Search } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { Chip } from "../../components/ui/Chip";
import {
  CREATOR_PRACTICE_CATEGORIES,
  CREATOR_PRACTICE_ITEMS,
  formatPracticeTypeLabel,
  getAvailablePracticeTypes,
  type CreatorPracticeFilter,
} from "../../data/creatorPracticeCatalog";

type StoredEditorState = {
  returnToPath?: string;
};

function readStoredEditorState(): StoredEditorState | null {
  try {
    const raw = sessionStorage.getItem("postEditor.tempData");
    return raw ? (JSON.parse(raw) as StoredEditorState) : null;
  } catch {
    return null;
  }
}

export function CreatorPracticeLibraryPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState(
    CREATOR_PRACTICE_CATEGORIES[0]?.id || "peace-calm",
  );
  const [activeType, setActiveType] = useState<CreatorPracticeFilter>("all");

  const storedEditorState = useMemo(() => readStoredEditorState(), []);
  const returnPath = storedEditorState?.returnToPath || "/en/creator/posts";
  const activeCategory =
    CREATOR_PRACTICE_CATEGORIES.find(
      (category) => category.id === activeCategoryId,
    ) || CREATOR_PRACTICE_CATEGORIES[0];
  const availableTypes = useMemo(
    () => getAvailablePracticeTypes(activeCategoryId),
    [activeCategoryId],
  );

  const visibleItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return CREATOR_PRACTICE_ITEMS.filter((item) => {
      if (!query && item.categoryId !== activeCategoryId) return false;
      if (activeType !== "all" && item.type !== activeType) return false;
      if (!query) return true;
      return item.searchText.includes(query);
    });
  }, [activeCategoryId, activeType, searchQuery]);

  const handleBack = () => {
    navigate(returnPath);
  };

  const handleSelect = (item: (typeof CREATOR_PRACTICE_ITEMS)[number]) => {
    sessionStorage.setItem(
      "selectedPractice",
      JSON.stringify({
        id: item.id,
        name: item.title,
        title: item.title,
        type: item.type,
        category: item.categoryLabel,
      }),
    );
    navigate(returnPath);
  };

  return (
    <div style={pageStyle}>
      <button type="button" onClick={handleBack} style={backButtonStyle}>
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>

      <main style={contentStyle}>
        <header style={headerStyle}>
          <h1 style={titleStyle}>Add To Post</h1>
          <p style={subtitleStyle}>
            Select mantra, practice, or sankalp to add to your routine post.
          </p>
        </header>

        <div style={searchShellStyle}>
          <Search size={22} color="#6b7280" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search practices..."
            style={searchInputStyle}
          />
        </div>

        <section style={sectionStyle}>
          <p style={sectionCopyStyle}>
            {searchQuery.trim()
              ? "Search results from all categories."
              : activeCategory?.description}
          </p>
          <div style={pillRowStyle}>
            {CREATOR_PRACTICE_CATEGORIES.map((category) => (
              <Chip
                key={category.id}
                label={category.label}
                selected={activeCategoryId === category.id}
                onToggle={() => {
                  setActiveCategoryId(category.id);
                  setActiveType("all");
                }}
                style={chipStyle}
              />
            ))}
          </div>
        </section>

        <section style={sectionStyle}>
          <div style={typeHeaderRowStyle}>
            <h2 style={sectionTitleStyle}>Select an item below to continue</h2>
            <div style={typePillRowStyle}>
              {availableTypes.map((option) => (
                <Chip
                  key={option.id}
                  label={option.label}
                  selected={activeType === option.id}
                  onToggle={() => setActiveType(option.id)}
                  size="sm"
                  style={typeFilterChipStyle}
                />
              ))}
            </div>
          </div>
          {visibleItems.length ? (
            <div style={gridStyle}>
              {visibleItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  style={cardStyle}
                >
                  <div style={cardTitleStyle}>{item.title}</div>
                  <div style={cardSummaryStyle}>{item.summary}</div>
                  <div style={cardFooterStyle}>
                    <span style={typePillStyle}>
                      {formatPracticeTypeLabel(item.type)}
                    </span>
                    <span style={categoryStyle}>{item.categoryLabel}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div style={emptyStateStyle}>
              No matches found
              {!searchQuery.trim() ? ` in ${activeCategory?.label}` : ""}
              {activeType !== "all"
                ? ` for ${formatPracticeTypeLabel(activeType)}`
                : ""}
              .
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",

  padding: "10px",
};

const contentStyle: CSSProperties = {
  maxWidth: 1400,
  margin: "0 auto",
};

const backButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  border: "none",
  borderRadius: 10,
  background: "#e7ebf0",
  color: "#1f2937",
  padding: 10,
  fontSize: 18,
  fontWeight: 700,
  cursor: "pointer",
  marginBottom: 32,
};

const headerStyle: CSSProperties = {
  textAlign: "center",
  marginBottom: 28,
};

const eyebrowStyle: CSSProperties = {
  margin: 0,
  fontSize: 12,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "#a16207",
  fontWeight: 700,
};

const titleStyle: CSSProperties = {
  margin: "12px 0 6px",
  fontSize: "clamp(2rem, 4vw, 3rem)",
  lineHeight: 1.05,
  color: "#2c2214",
};

const subtitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  color: "#4b5563",
};

const searchShellStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  maxWidth: 1080,
  margin: "0 auto 28px",
  border: "1px solid #e0a11b",
  borderRadius: 18,
  background:
    "linear-gradient(90deg, rgba(255, 250, 240, 0.98) 0%, rgba(252, 241, 214, 0.9) 100%)",
  padding: "16px 18px",
  boxShadow: "0 14px 34px rgba(182, 133, 40, 0.08)",
};

const searchInputStyle: CSSProperties = {
  flex: 1,
  border: "none",
  outline: "none",
  background: "transparent",
  fontSize: 18,
  color: "#1f2937",
};

const sectionStyle: CSSProperties = {
  marginBottom: 26,
};

const sectionCopyStyle: CSSProperties = {
  margin: "0 0 18px",
  fontSize: 18,
  color: "#3f3f46",
};

const pillRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 14,
};

const chipStyle: CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
};

const sectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  lineHeight: 1.1,
  color: "#2c2214",
};

const typeHeaderRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  marginBottom: 20,
};

const typePillRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
};

const typeFilterChipStyle: CSSProperties = {
  fontWeight: 700,
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: 26,
};

const cardStyle: CSSProperties = {
  textAlign: "left",
  borderRadius: 24,
  border: "1px solid #e0a11b",
  background:
    "linear-gradient(135deg, rgba(255, 252, 246, 0.98) 0%, rgba(251, 241, 212, 0.96) 100%)",
  padding: "26px 26px 20px",
  cursor: "pointer",
  boxShadow: "0 18px 38px rgba(173, 123, 31, 0.08)",
  minHeight: 208,
  display: "flex",
  flexDirection: "column",
  marginBottom: 10,
};

const cardTitleStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#2f2416",
  marginBottom: 14,
};

const cardSummaryStyle: CSSProperties = {
  fontSize: 14,
  lineHeight: 1.6,
  color: "#475569",
  flex: 1,
};

const cardFooterStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  marginTop: 20,
};

const typePillStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 999,
  padding: "8px 14px",
  background: "#f3f4f6",
  color: "#475569",
  fontSize: 14,
  fontWeight: 600,
};

const categoryStyle: CSSProperties = {
  color: "#d18800",
  fontSize: 15,
  fontWeight: 600,
};

const emptyStateStyle: CSSProperties = {
  borderRadius: 24,
  border: "1px dashed #d6b467",
  background: "rgba(255, 249, 235, 0.8)",
  padding: "32px 24px",
  color: "#6b7280",
  fontSize: 16,
  textAlign: "center",
};
