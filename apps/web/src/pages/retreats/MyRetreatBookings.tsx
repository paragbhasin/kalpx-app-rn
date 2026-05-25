import {
  CalendarDays,
  ChevronDown,
  Clock3,
  Globe,
  LocationEdit,
  Search,
  Star,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import retreatImg from "../../../../mobile/assets/retreat/retreat1.webp";
import facImg from "../../../../mobile/assets/retreat/retreat2.webp";

const categories = [
  "All Retreats",
  "Yoga",
  "Ayurveda",
  "Bhakti & Stastang",
  "Meditation",
];

const filterGroups = [
  { name: "Category", options: categories },
  { name: "Language", options: ["Hindi", "English", "Urdu"] },
  { name: "Diet", options: ["Gluten Free", "Ayurvedic", "Vegetarian"] },
  { name: "Amenities", options: ["Spa", "Mountain View", "Fitness Center"] },
];

const bookings = [
  {
    id: 1,
    title: "Rejuvenating yoga & Ayurvedic Retreat",
    description:
      "A gentle 7-day wellness journey to help you to the pause, reset your mind that mindful....",
    location: "Kerala",
    dates: "26-28 Dec 2025",
    status: "Confirmed",
    image: retreatImg,
    facilitator: { name: "Riya Dyne", avatar: facImg },
  },
  {
    id: 2,
    title: "Rejuvenating yoga & Ayurvedic Retreat",
    description:
      "A gentle 7-day wellness journey to help you to the pause, reset your mind that mindful....",
    location: "Kerala",
    dates: "26-28 Dec 2025",
    status: "Payment Due",
    image: retreatImg,
    facilitator: { name: "Riya Dyne", avatar: facImg },
  },
  {
    id: 3,
    title: "Rejuvenating yoga & Ayurvedic Retreat",
    description:
      "A gentle 7-day wellness journey to help you to the pause, reset your mind that mindful....",
    location: "Kerala",
    dates: "26-28 Dec 2025",
    status: "Requested",
    image: retreatImg,
    facilitator: { name: "Riya Dyne", avatar: facImg },
  },
  {
    id: 4,
    title: "Rejuvenating yoga & Ayurvedic Retreat",
    description:
      "A gentle 7-day wellness journey to help you to the pause, reset your mind that mindful....",
    location: "Kerala",
    dates: "26-28 Dec 2025",
    status: "Cancelled",
    image: retreatImg,
    facilitator: { name: "Riya Dyne", avatar: facImg },
  },
] as const;

export function MyRetreatBookings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All Retreats");
  const isDesktop =
    typeof window === "undefined" ? true : window.innerWidth >= 1024;

  const filteredBookings = useMemo(() => {
    if (activeTab === "All Retreats") return bookings;
    return bookings.filter((booking) => booking.status === activeTab);
  }, [activeTab]);

  function viewDetails(bookingId: number) {
    navigate(`/en/retreats/bookings/${bookingId}`);
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
              <h3 style={desktopCapsHeadingStyle}>Availability</h3>
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
              <h3 style={desktopCapsHeadingStyle}>Price Range</h3>
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
                  <h3 style={desktopCapsHeadingStyle}>{group.name}</h3>
                  <ChevronDown size={12} color="#9ca3af" />
                </div>
                <div style={filterOptionsStyle}>
                  {group.options.map((option) => (
                    <label key={option} style={optionRowStyle}>
                      <span style={optionTextStyle}>{option}</span>
                      <input type="checkbox" style={checkboxStyle} />
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </aside>

          <div style={desktopGridAreaStyle}>
            <div style={desktopCardsGridStyle}>
              {filteredBookings.map((booking, idx) => (
                <div key={booking.id} style={desktopCardStyle}>
                  <div style={desktopImageWrapStyle}>
                    <img
                      src={booking.image}
                      style={desktopImageStyle}
                      alt={booking.title}
                    />

                    {idx === 0 ? (
                      <div style={{ ...badgeStyle, background: "#748DCE" }}>
                        Only 10 spot left. Hurry!
                      </div>
                    ) : null}
                    {idx === 1 ? (
                      <div style={{ ...badgeStyle, background: "#43BC6C" }}>
                        20% off for first time user
                      </div>
                    ) : null}

                    <div style={facilitatorOverlayStyle}>
                      <div style={facilitatorAvatarWrapStyle}>
                        <img
                          src={booking.facilitator.avatar}
                          style={facilitatorAvatarStyle}
                          alt=""
                        />
                      </div>
                      <div style={{ marginLeft: 10, overflow: "hidden" }}>
                        <p style={facilitatorNameStyle}>
                          {booking.facilitator.name}
                          <span style={facilitatorExpStyle}>(10+Exp)</span>
                        </p>
                        <p style={facilitatorRoleStyle}>Facilitator</p>
                      </div>
                    </div>
                  </div>

                  <div style={desktopContentStyle}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <h3 style={desktopTitleStyle}>{booking.title}</h3>
                      <p style={desktopBodyStyle}>
                        {booking.description}
                        <span style={moreStyle}>More</span>
                      </p>
                    </div>

                    <div style={desktopMetaGridStyle}>
                      <MetaRow
                        icon={
                          <LocationEdit
                            size={14}
                            color="#D4A017"
                            strokeWidth={2.1}
                          />
                        }
                        text={booking.location}
                      />
                      <MetaRow
                        icon={
                          <Star
                            size={13}
                            color="#D4A017"
                            fill="#D4A017"
                            strokeWidth={1.8}
                          />
                        }
                        text="4.9(223)"
                      />
                      <MetaRow
                        icon={
                          <Globe size={14} color="#D4A017" strokeWidth={2} />
                        }
                        text="English, Hindi"
                      />
                      <MetaRow
                        icon={
                          <CalendarDays
                            size={14}
                            color="#D4A017"
                            strokeWidth={2}
                          />
                        }
                        text={booking.dates}
                      />
                    </div>

                    <div style={desktopFooterStyle}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span
                          style={{
                            ...statusTextStyle,
                            color: getStatusColor(booking.status),
                          }}
                        >
                          {booking.status}
                        </span>
                        {booking.status === "Payment Due" ? (
                          <span style={dueTextStyle}>7 days left only</span>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => viewDetails(booking.id)}
                        style={viewButtonStyle}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div style={mobileWrapStyle}>
      <div style={mobileTabsRowStyle}>
        {["All Retreats", "Confirmed", "Requested"].map((tab) => {
          const selected = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                ...mobileTabStyle,
                ...(selected ? activeMobileTabStyle : inactiveMobileTabStyle),
              }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <h2 style={mobileTitleStyle}>Upcoming Retreats</h2>

      <div style={mobileListStyle}>
        {filteredBookings.map((booking) => (
          <div key={booking.id} style={mobileCardStyle}>
            <div style={mobileImageWrapStyle}>
              <img
                src={booking.image}
                style={mobileImageStyle}
                alt={booking.title}
              />

              <div style={mobileFacilitatorOverlayStyle}>
                <div style={facilitatorAvatarWrapStyle}>
                  <img
                    src={booking.facilitator.avatar}
                    style={facilitatorAvatarStyle}
                    alt=""
                  />
                </div>
                <div style={{ marginLeft: 10 }}>
                  <p style={mobileFacilitatorNameStyle}>
                    {booking.facilitator.name}
                    <span style={facilitatorExpStyle}>(10+Exp)</span>
                  </p>
                  <p style={facilitatorRoleStyle}>Facilitator</p>
                </div>
              </div>
            </div>

            <div style={mobileContentStyle}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <h3 style={mobileCardTitleStyle}>{booking.title}</h3>
                <p style={mobileBodyStyle}>
                  {booking.description}
                  <span style={moreStyle}>More</span>
                </p>
              </div>

              <div style={mobileMetaGridStyle}>
                <MetaRow
                  icon={
                    <LocationEdit size={14} color="#D4A017" strokeWidth={2.1} />
                  }
                  text={booking.location}
                  compact
                />
                <MetaRow
                  icon={
                    <Star
                      size={13}
                      color="#D4A017"
                      fill="#D4A017"
                      strokeWidth={1.8}
                    />
                  }
                  text="4.9(223)"
                  compact
                />
                <MetaRow
                  icon={<Globe size={14} color="#D4A017" strokeWidth={2} />}
                  text="English, Hindi"
                  compact
                />
                <MetaRow
                  icon={<Clock3 size={14} color="#D4A017" strokeWidth={2} />}
                  text={booking.dates}
                  compact
                />
              </div>

              <div style={mobileFooterStyle}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      ...statusTextStyle,
                      color: getStatusColor(booking.status),
                    }}
                  >
                    {booking.status}
                  </span>
                  {booking.status === "Payment Due" ? (
                    <span style={dueTextStyle}>7 days left only</span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => viewDetails(booking.id)}
                  style={viewButtonStyle}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetaRow({
  icon,
  text,
  compact = false,
}: {
  icon: React.ReactNode;
  text: string;
  compact?: boolean;
}) {
  return (
    <div style={{ ...metaRowStyle, gap: compact ? 8 : 12 }}>
      <div style={compact ? compactMetaIconStyle : metaIconStyle}>{icon}</div>
      <span style={compact ? compactMetaTextStyle : metaTextStyle}>{text}</span>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "Confirmed":
      return "#43BC6C";
    case "Payment Due":
      return "#1877F2";
    case "Requested":
      return "#D4A017";
    case "Cancelled":
      return "#FF4D4D";
    default:
      return "#707070";
  }
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

const desktopCapsHeadingStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  fontWeight: 700,
  color: "#000",
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

const desktopGridAreaStyle: CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 24,
};

const desktopCardsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 24,
};

const desktopCardStyle: CSSProperties = {
  background: "#fff",
  borderRadius: 24,
  border: "1px solid #EEEEEE",
  overflow: "hidden",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  transition: "all 0.3s ease",
};

const desktopImageWrapStyle: CSSProperties = {
  position: "relative",
  height: 220,
  overflow: "hidden",
};

const desktopImageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const badgeStyle: CSSProperties = {
  position: "absolute",
  top: 16,
  left: 16,
  color: "#fff",
  padding: "8px 16px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
  zIndex: 10,
};

const facilitatorOverlayStyle: CSSProperties = {
  position: "absolute",
  left: 16,
  bottom: 16,
  display: "flex",
  alignItems: "center",
  background: "rgba(255,255,255,0.95)",
  backdropFilter: "blur(6px)",
  padding: "4px 16px 4px 4px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.5)",
  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
  maxWidth: "85%",
  zIndex: 10,
};

const facilitatorAvatarWrapStyle: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 10,
  overflow: "hidden",
  flexShrink: 0,
  background: "#e5e7eb",
};

const facilitatorAvatarStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const facilitatorNameStyle: CSSProperties = {
  margin: 0,
  fontSize: 13,
  fontWeight: 700,
  color: "#000",
  lineHeight: 1.2,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const facilitatorExpStyle: CSSProperties = {
  fontSize: 10,
  color: "#6b7280",
  fontWeight: 500,
  marginLeft: 2,
};

const facilitatorRoleStyle: CSSProperties = {
  margin: "2px 0 0",
  fontSize: 10,
  color: "#707070",
  fontWeight: 600,
};

const desktopContentStyle: CSSProperties = {
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const desktopTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
  color: "#000",
  lineHeight: 1.35,
};

const desktopBodyStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: "#707070",
  fontWeight: 500,
  lineHeight: 1.55,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const moreStyle: CSSProperties = {
  color: "#D4A017",
  fontWeight: 700,
  marginLeft: 4,
};

const desktopMetaGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 12,
  paddingTop: 4,
};

const metaRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
};

const metaIconStyle: CSSProperties = {
  width: 20,
  display: "flex",
  justifyContent: "center",
  flexShrink: 0,
};

const compactMetaIconStyle: CSSProperties = {
  width: "auto",
  display: "flex",
  justifyContent: "center",
  flexShrink: 0,
};

const metaTextStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "#2b2b2b",
};

const compactMetaTextStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 700,
  color: "#2b2b2b",
};

const desktopFooterStyle: CSSProperties = {
  paddingTop: 16,
  borderTop: "1px solid #f3f4f6",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
};

const statusTextStyle: CSSProperties = {
  fontSize: 16,
  fontWeight: 700,
};

const dueTextStyle: CSSProperties = {
  fontSize: 12,
  color: "#707070",
  fontWeight: 500,
};

const viewButtonStyle: CSSProperties = {
  background: "#D4A017",
  color: "#fff",
  padding: "10px 24px",
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 14,
  boxShadow: "0 12px 24px rgba(212,160,23,0.2)",
  border: "none",
  cursor: "pointer",
  flexShrink: 0,
};

const mobileWrapStyle: CSSProperties = {
  maxWidth: 672,
  margin: "12px auto 0",
  padding: "0 16px",
  position: "relative",
  zIndex: 10,
  boxSizing: "border-box",
};

const mobileTabsRowStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  marginBottom: 32,
  overflowX: "auto",
  paddingBottom: 8,
  scrollbarWidth: "none",
};

const mobileTabStyle: CSSProperties = {
  padding: "10px 24px",
  borderRadius: 12,
  fontWeight: 700,
  fontSize: 14,
  whiteSpace: "nowrap",
  transition: "all 0.2s ease",
  border: "1px solid",
  cursor: "pointer",
};

const activeMobileTabStyle: CSSProperties = {
  background: "#FCF8F0",
  borderColor: "#D4A017",
  color: "#D4A017",
};

const inactiveMobileTabStyle: CSSProperties = {
  background: "#fff",
  borderColor: "#f3f4f6",
  color: "#707070",
};

const mobileTitleStyle: CSSProperties = {
  margin: "0 0 24px",
  fontSize: 18,
  fontWeight: 700,
  color: "#000",
};

const mobileListStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 24,
  paddingBottom: 40,
};

const mobileCardStyle: CSSProperties = {
  background: "#fff",
  borderRadius: 28,
  border: "1px solid #f3f4f6",
  overflow: "hidden",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
};

const mobileImageWrapStyle: CSSProperties = {
  position: "relative",
  height: 200,
};

const mobileImageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const mobileFacilitatorOverlayStyle: CSSProperties = {
  position: "absolute",
  left: 16,
  bottom: 16,
  display: "flex",
  alignItems: "center",
  background: "#fff",
  padding: "4px 16px 4px 4px",
  borderRadius: 12,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  border: "1px solid #f9fafb",
  transform: "scale(0.9)",
  transformOrigin: "left bottom",
};

const mobileFacilitatorNameStyle: CSSProperties = {
  margin: 0,
  fontSize: 12,
  fontWeight: 700,
  color: "#000",
};

const mobileContentStyle: CSSProperties = {
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const mobileCardTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
  color: "#000",
};

const mobileBodyStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: "#707070",
  fontWeight: 500,
  lineHeight: 1.55,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const mobileMetaGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  rowGap: 12,
  columnGap: 16,
};

const mobileFooterStyle: CSSProperties = {
  paddingTop: 16,
  borderTop: "1px solid #f9fafb",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
};
