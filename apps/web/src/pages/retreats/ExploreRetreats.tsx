import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";
import type { CSSProperties } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RetreatCard } from "./RetreatCard";

const categories = [
  "All Retreats",
  "Yoga",
  "Ayurveda",
  "Bhakti & Stastang",
  "Meditation",
];

const filterGroups = [
  {
    name: "Category",
    options: categories,
  },
  {
    name: "Language",
    options: ["Hindi", "English", "Urdu"],
  },
  {
    name: "Diet",
    options: ["Gluten Free", "Ayurvedic", "Vegetarian"],
  },
  {
    name: "Amenities",
    options: ["Spa", "Mountain View", "Fitness Center"],
  },
];

const dummyRetreats = [
  {
    slug: "rejuvenating-yoga-ayurvedic-retreat",
    title: "Rejuvenating yoga & Ayurvedic Retreat",
  },
  {
    slug: "sattva-renewal-retreat",
    title: "Sattva Renewal Retreat",
  },
  {
    slug: "ayura-serenity-retreat",
    title: "Ayura Serenity Retreat",
  },
  {
    slug: "rejuvenating-yoga-ayurvedic-retreat-2",
    title: "Rejuvenating yoga & Ayurvedic Retreat",
  },
  {
    slug: "sattva-renewal-retreat-2",
    title: "Sattva Renewal Retreat",
  },
  {
    slug: "ayura-serenity-retreat-2",
    title: "Ayura Serenity Retreat",
  },
];

export function ExploreRetreats() {
  const [selectedCategory, setSelectedCategory] = useState("All Retreats");
  const navigate = useNavigate();
  const isDesktop =
    typeof window === "undefined" ? true : window.innerWidth >= 1024;

  function handleOpen(retreat: { slug?: string }) {
    const slug = retreat.slug || "rejuvenating-yoga-ayurvedic-retreat";
    navigate(`/en/retreats/${slug}`);
  }

  if (isDesktop) {
    return (
      <main style={desktopMainStyle}>
        <div style={desktopWrapStyle}>
          <aside style={sidebarStyle}>
            <div style={panelStyle}>
              <h3 style={panelHeadingStyle}>Search Your Retreats</h3>
              <div style={searchStackStyle}>
                <div style={searchInputWrapStyle}>
                  <Search size={16} color="#9ca3af" style={searchIconStyle} />
                  <input
                    type="text"
                    placeholder="Search retreats here....."
                    style={searchInputStyle}
                  />
                </div>
                <button type="button" style={availabilityButtonStyle}>
                  Check Availability
                </button>
              </div>
            </div>

            <div style={{ ...panelStyle, gap: 16 }}>
              <h3 style={capsHeadingStyle}>Availability</h3>
              <div style={dateStackStyle}>
                <div style={dateFieldStyle}>
                  <label style={dateLabelStyle}>From</label>
                  <input type="date" style={dateInputStyle} />
                </div>
                <div style={dateFieldStyle}>
                  <label style={dateLabelStyle}>To</label>
                  <input type="date" style={dateInputStyle} />
                </div>
              </div>
            </div>

            <div style={{ ...panelStyle, gap: 16 }}>
              <h3 style={capsHeadingStyle}>Price Range</h3>
              <div style={priceWrapStyle}>
                <input
                  type="range"
                  min="0"
                  max="40000"
                  style={rangeInputStyle}
                />
                <div style={rangeLabelsStyle}>
                  <span>₹0</span>
                  <span>₹40,000</span>
                </div>
              </div>
            </div>

            {filterGroups.map((group) => (
              <div key={group.name} style={{ ...panelStyle, gap: 16 }}>
                <div style={filterHeaderStyle}>
                  <h3 style={capsHeadingStyle}>{group.name}</h3>
                  <ChevronDown size={12} color="#9ca3af" />
                </div>
                <div style={filterOptionsStyle}>
                  {group.options.map((option) => (
                    <label key={option} style={optionRowStyle}>
                      <span style={optionTextStyle}>{option}</span>
                      <input type="checkbox" style={checkboxStyle} />
                    </label>
                  ))}
                  {group.name === "Category" ? (
                    <button type="button" style={showMoreStyle}>
                      Show More Destinations
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </aside>

          <div style={gridWrapStyle}>
            <div style={gridStyle}>
              {dummyRetreats.map((retreat) => (
                <RetreatCard
                  key={retreat.slug}
                  retreat={retreat}
                  onOpen={() => handleOpen(retreat)}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={mobileMainStyle}>
      <div style={mobileSearchRowStyle}>
        <div style={mobileSearchWrapStyle}>
          <div style={mobileSearchIconWrapStyle}>
            <Search size={16} color="#707070" />
          </div>
          <input
            type="text"
            placeholder="Search retreats here....."
            style={mobileSearchInputStyle}
          />
        </div>
        <button type="button" style={mobileFilterButtonStyle}>
          <SlidersHorizontal size={20} color="#707070" />
        </button>
      </div>

      <div style={mobileChipRowStyle}>
        {categories.map((cat) => {
          const selected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              style={{
                ...chipStyle,
                ...(selected ? activeChipStyle : inactiveChipStyle),
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <h2 style={mobileSectionTitleStyle}>Upcoming Retreats</h2>

      <div style={mobileGridStyle}>
        {dummyRetreats.map((retreat) => (
          <RetreatCard
            key={retreat.slug}
            retreat={retreat}
            onOpen={() => handleOpen(retreat)}
          />
        ))}
      </div>
    </main>
  );
}

const desktopMainStyle: CSSProperties = {
  margin: "0 auto",
  maxWidth: 1400,
  padding: "32px 16px",
  display: "block",
};

const desktopWrapStyle: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  gap: 32,
};

const sidebarStyle: CSSProperties = {
  width: 280,
  flexShrink: 0,
  display: "flex",
  flexDirection: "column",
  gap: 24,
};

const panelStyle: CSSProperties = {
  background: "#fff",
  borderRadius: 24,
  padding: 20,
  border: "1px solid #f3f4f6",
  boxShadow: "0 10px 24px rgba(0,0,0,0.05)",
  display: "flex",
  flexDirection: "column",
};

const panelHeadingStyle: CSSProperties = {
  margin: "0 0 16px",
  fontSize: 16,
  fontWeight: 700,
  color: "#000",
};

const searchStackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const searchInputWrapStyle: CSSProperties = {
  position: "relative",
};

const searchIconStyle: CSSProperties = {
  position: "absolute",
  left: 16,
  top: "50%",
  transform: "translateY(-50%)",
};

const searchInputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  borderRadius: 12,
  background: "#f9fafb",
  border: "none",
  padding: "12px 16px 12px 40px",
  fontSize: 14,
  outline: "none",
};

const availabilityButtonStyle: CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  background: "#D4A017",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 700,
  boxShadow: "0 12px 24px rgba(212,160,23,0.2)",
  cursor: "pointer",
};

const capsHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  fontWeight: 700,
  color: "#707070",
  textTransform: "uppercase",
};

const dateStackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const dateFieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const dateLabelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#707070",
};

const dateInputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  borderRadius: 12,
  background: "#f9fafb",
  border: "none",
  padding: "12px 16px",
  fontSize: 14,
  outline: "none",
};

const priceWrapStyle: CSSProperties = {
  padding: "8px 8px 0",
};

const rangeInputStyle: CSSProperties = {
  width: "100%",
  accentColor: "#D4A017",
};

const rangeLabelsStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 12,
  fontSize: 12,
  fontWeight: 700,
  color: "#4b5563",
};

const filterHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  cursor: "pointer",
};

const filterOptionsStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const optionRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
};

const optionTextStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: "#2b2b2b",
};

const checkboxStyle: CSSProperties = {
  width: 20,
  height: 20,
  accentColor: "#D4A017",
};

const showMoreStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  padding: 0,
  textAlign: "left",
  fontSize: 12,
  fontWeight: 700,
  color: "#D4A017",
  cursor: "pointer",
  marginTop: 8,
};

const gridWrapStyle: CSSProperties = {
  flex: 1,
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 24,
};

const mobileMainStyle: CSSProperties = {
  marginTop: 8,
  marginLeft: 8,
  marginRight: 8,
};

const mobileSearchRowStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  marginBottom: 24,
};

const mobileSearchWrapStyle: CSSProperties = {
  position: "relative",
  flex: 1,
};

const mobileSearchIconWrapStyle: CSSProperties = {
  position: "absolute",
  insetBlock: 0,
  left: 16,
  display: "flex",
  alignItems: "center",
  pointerEvents: "none",
};

const mobileSearchInputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  borderRadius: 8,
  background: "#F5F5F5",
  border: "none",
  padding: "12px 16px 12px 48px",
  fontSize: 15,
  fontWeight: 500,
  color: "#2b2b2b",
  outline: "none",
};

const mobileFilterButtonStyle: CSSProperties = {
  height: 49,
  width: 56,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 8,
  background: "#F5F5F5",
  color: "#707070",
  border: "none",
  cursor: "pointer",
  flexShrink: 0,
};

const mobileChipRowStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  overflowX: "auto",
  paddingBottom: 16,
  scrollbarWidth: "none",
};

const chipStyle: CSSProperties = {
  whiteSpace: "nowrap",
  borderRadius: 12,
  padding: "10px 24px",
  fontSize: 15,
  fontWeight: 700,
  border: "1px solid",
  transition: "all 0.2s ease",
  cursor: "pointer",
};

const activeChipStyle: CSSProperties = {
  background: "#F7F0DD",
  borderColor: "#F1EAD9",
  color: "#2b2b2b",
};

const inactiveChipStyle: CSSProperties = {
  background: "#fff",
  borderColor: "#EEEEEE",
  color: "#707070",
};

const mobileSectionTitleStyle: CSSProperties = {
  margin: "0 0 24px",
  fontSize: 20,
  fontWeight: 700,
  color: "#000",
};

const mobileGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 24,
};
