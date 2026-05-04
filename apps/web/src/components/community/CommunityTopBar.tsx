import { ChevronDown, ChevronUp, Plus, Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function CommunityTopBar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [recentOpen, setRecentOpen] = useState(true);
  const [resourcesOpen, setResourcesOpen] = useState(true);

  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const recentCommunities = [
    {
      label: "k/Meditation & Mindfulness",
      color: "#d4a373",
    },
    {
      label: "k/Ramayana Insights",
      color: "#bc6c25",
    },
    {
      label: "k/Yoga Practice",
      color: "#8338ec",
    },
    {
      label: "k/Ayurveda Life",
      color: "#fb5607",
    },
    {
      label: "k/Vedic Wisdom",
      color: "#ff006e",
    },
  ];

  const resources = [
    "Communities",
    "KalpX Rules",
    "Privacy Policy",
    "User Agreements",
    "Content Policy",
    "About Us",
  ];

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "#fff",
        borderBottom: "1px solid #e9e5de",
      }}
    >
      <div
        style={{
          maxWidth: 620,
          margin: "0 auto",
          height: 48,
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/en/community");
            }}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              margin: 0,
              cursor: "pointer",
              color: "#2a241e",
              fontSize: 18,
              fontWeight: 700,
              fontFamily: "Georgia, serif",
              lineHeight: 1,
            }}
          >
            Community
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((value) => !value);
            }}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: 4,
              cursor: "pointer",
              color: "#2f2a25",
              fontSize: 18,
              fontWeight: 500,
              textDecoration: "underline",
              textUnderlineOffset: 2,
            }}
          >
            <span>Home</span>
            {menuOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <button
            aria-label="Search community"
            onClick={(e) => {
              e.stopPropagation();
            }}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#2f2a25",
            }}
          >
            <Search size={28} strokeWidth={1.9} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/en/community/new");
            }}
            aria-label="Create post"
            style={{
              width: 31,
              height: 31,
              borderRadius: 4,
              background: "#fff",
              border: "1px solid #2f2a25",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#2f2a25",
            }}
          >
            <Plus size={24} strokeWidth={1.9} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <button
            aria-label="Close community menu"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
            }}
            style={{
              position: "fixed",
              inset: 0,
              background: "transparent",
              border: "none",
              padding: 0,
              margin: 0,
              zIndex: 19,
              cursor: "default",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 36,
              left: "50%",
              transform: "translateX(-50%)",
              width: 245,
              zIndex: 21,
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                border: "1px solid #f3f4f6",
                maxHeight: "480px",
                overflowY: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: "#e5e7eb transparent",
              }}
            >
              <div style={{ padding: "8px 0" }}>
                {["Home", "Top", "Popular", "Explore"].map((item) => (
                  <button
                    key={item}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      navigate("/en/community");
                    }}
                    onMouseEnter={() => setHoveredItem(item)}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                      width: "100%",
                      background: hoveredItem === item ? "#f9fafb" : "none",
                      border: "none",
                      textAlign: "left",
                      padding: "12px 24px",
                      fontSize: 16,
                      fontWeight: 500,
                      color: "#111827",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <SectionDivider />

              <div style={{ padding: "16px 0 8px" }}>
                <SectionHeader
                  title="RECENT"
                  open={recentOpen}
                  onClick={() => setRecentOpen((value) => !value)}
                />
                {recentOpen && (
                  <div style={{ padding: "8px 0" }}>
                    {recentCommunities.map((item) => (
                      <button
                        key={item.label}
                        onMouseEnter={() => setHoveredItem(item.label)}
                        onMouseLeave={() => setHoveredItem(null)}
                        style={{
                          ...communityRowStyle,
                          background:
                            hoveredItem === item.label ? "#f9fafb" : "none",
                          padding: "8px 24px",
                          transition: "background-color 0.2s",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: item.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              color: "#fff",
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            {item.label.split("/")[1]?.charAt(0)}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 14,
                            color: "#111827",
                            fontWeight: 500,
                          }}
                        >
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <SectionDivider />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                onMouseEnter={() => setHoveredItem("activity")}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  width: "100%",
                  background: hoveredItem === "activity" ? "#f9fafb" : "none",
                  border: "none",
                  padding: "16px 24px",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#111827",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "background-color 0.2s",
                }}
              >
                Your Activity
              </button>

              <SectionDivider />

              <div style={{ padding: "16px 0 16px" }}>
                <SectionHeader
                  title="RESOURCES"
                  open={resourcesOpen}
                  onClick={() => setResourcesOpen((value) => !value)}
                />
                {resourcesOpen && (
                  <div style={{ padding: "8px 0" }}>
                    {resources.map((item) => (
                      <button
                        key={item}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        onMouseEnter={() => setHoveredItem(item)}
                        onMouseLeave={() => setHoveredItem(null)}
                        style={{
                          width: "100%",
                          background: hoveredItem === item ? "#f9fafb" : "none",
                          border: "none",
                          textAlign: "left",
                          padding: "12px 24px",
                          fontSize: 16,
                          fontWeight: 500,
                          color: "#111827",
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                        }}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SectionDivider() {
  return <div style={{ borderTop: "1px solid #f3f4f6" }} />;
}

function SectionHeader({
  title,
  open,
  onClick,
}: {
  title: string;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        background: "none",
        border: "none",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.05em",
          color: "#94a3b8",
        }}
      >
        {title}
      </span>
      {open ? (
        <ChevronUp size={18} color="#9ca3af" />
      ) : (
        <ChevronDown size={18} color="#9ca3af" />
      )}
    </button>
  );
}

const communityRowStyle: React.CSSProperties = {
  width: "100%",
  background: "none",
  border: "none",
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: "10px 0",
  fontSize: 14,
  color: "#1f1b17",
  cursor: "pointer",
  textAlign: "left",
};
