import { CalendarDays, LocationEdit, Star } from "lucide-react";
import type { CSSProperties } from "react";
const retreatImage = "/mobile-assets/retreat/retreat1.webp";
const facilitatorImage = "/mobile-assets/retreat/retreat2.webp";
type RetreatBadgeType = "offer" | "urgency" | string;

type Retreat = {
  slug?: string;
  title?: string;
  tagline?: string;
  description?: string;
  cheapest_price_minor?: number;
  location?: { city?: string; name?: string };
  rating_avg?: number;
  rating_count?: number;
  spots_left?: number;
  formatted_date_range?: string;
  cover_image?: { url?: string };
  facilitator?: { avatar?: string; name?: string; exp?: string };
  badge?: { text: string; type?: RetreatBadgeType };
};

export function RetreatCard({
  retreat,
  onOpen,
}: {
  retreat?: Retreat;
  onOpen?: () => void;
}) {
  const card = retreat ?? {
    title: "Rejuvenating yoga & Ayurvedic Retreat",
    description:
      "A gentle 7-day wellness journey to help you to the pause, reset your mind that mindful....",
    cheapest_price_minor: 1000000,
    location: { city: "Aluva, Kerala" },
    rating_avg: 4.9,
    rating_count: 223,
    spots_left: 10,
    formatted_date_range: "22 Dec - 27 Dec 2025",
  };

  const badgeClass = getBadgeStyle(card.badge?.type);
  const imageSrc = card.cover_image?.url || retreatImage;
  const facilitatorSrc = card.facilitator?.avatar || facilitatorImage;

  return (
    <article style={cardStyle} onClick={onOpen}>
      <div style={imageWrapStyle}>
        <img src={imageSrc} alt={card.title} style={heroImageStyle} />

        {card.badge ? (
          <div style={{ ...badgeStyle, ...badgeClass }}>{card.badge.text}</div>
        ) : card.spots_left !== undefined ? (
          <div style={{ ...badgeStyle, background: "#748DCE" }}>
            Only {card.spots_left} spot left. Hurry!
          </div>
        ) : null}

        <div style={facilitatorOverlayStyle}>
          <div style={facilitatorAvatarWrapStyle}>
            <img
              src={facilitatorSrc}
              style={facilitatorAvatarStyle}
              alt="Facilitator"
            />
          </div>
          <div style={{ marginLeft: 10, overflow: "hidden" }}>
            <p style={facilitatorNameStyle}>
              {card.facilitator?.name || "Riya Dyne"}
              <span style={facilitatorExpStyle}>
                ({card.facilitator?.exp || "10+Exp"})
              </span>
            </p>
            <p style={facilitatorRoleStyle}>Facilitator</p>
          </div>
        </div>
      </div>

      <div style={contentStyle}>
        <h3 style={titleStyle}>{card.title}</h3>

        <p style={bodyStyle}>
          {card.tagline || card.description}
          <span style={moreStyle}>More</span>
        </p>

        <div style={datePillStyle}>
          <div style={dateIconWrapStyle}>
            <CalendarDays size={18} color="#2b2b2b" strokeWidth={1.9} />
          </div>
          <span style={dateTextStyle}>
            {card.formatted_date_range || "22 Dec - 27 Dec 2025"}
          </span>
        </div>

        <div style={metaStackStyle}>
          <div style={metaRowStyle}>
            <div style={metaIconStyle}>
              <LocationEdit size={18} color="#D4A017" strokeWidth={2.1} />
            </div>
            <span style={metaTextStyle}>
              {card.location?.city || card.location?.name || "Aluva, Kerala"}
            </span>
          </div>

          <div style={metaRowStyle}>
            <div style={metaIconStyle}>
              <Star
                size={18}
                color="#D4A017"
                fill="#D4A017"
                strokeWidth={1.8}
              />
            </div>
            <span style={metaTextStyle}>
              {card.rating_avg || "4.9"}
              <span style={metaMutedTextStyle}>
                ({card.rating_count || "223"})
              </span>
            </span>
          </div>
        </div>
      </div>

      <div style={dividerStyle} />

      <div style={footerStyle}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={footerLabelStyle}>Starting From</span>
          <span style={footerPriceStyle}>
            ₹{formatPrice(card.cheapest_price_minor)}
          </span>
        </div>

        <button type="button" style={ctaStyle}>
          View Details
        </button>
      </div>
    </article>
  );
}

function formatPrice(minor?: number) {
  if (!minor) return "10,000";
  return (minor / 100).toLocaleString("en-IN");
}

function getBadgeStyle(type?: RetreatBadgeType): CSSProperties {
  switch (type) {
    case "offer":
      return { background: "#43BC6C" };
    case "urgency":
      return { background: "#748DCE" };
    default:
      return { background: "#748DCE" };
  }
}

const cardStyle: CSSProperties = {
  maxWidth: 420,
  background: "#fff",
  borderRadius: 24,
  border: "1px solid #EEEEEE",
  overflow: "hidden",
  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  transition: "all 0.3s ease",
  cursor: "pointer",
  width: "100%",
};

const imageWrapStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  overflow: "hidden",
};

const heroImageStyle: CSSProperties = {
  width: "100%",
  height: 240,
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
  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.12)",
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

const contentStyle: CSSProperties = {
  padding: "8px 8px 16px",
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
  color: "#000",
  lineHeight: 1.35,
};

const bodyStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  color: "#707070",
  fontWeight: 500,
  lineHeight: 1.5,
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

const datePillStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  background: "#FCF8F0",
  padding: 4,
  borderRadius: 12,
  border: "1px solid #F1EAD9",
};

const dateIconWrapStyle: CSSProperties = {
  width: 32,
  height: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#2b2b2b",
  flexShrink: 0,
};

const dateTextStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: "#2b2b2b",
  letterSpacing: "-0.01em",
};

const metaStackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
  paddingTop: 4,
};

const metaRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const metaIconStyle: CSSProperties = {
  width: 20,
  display: "flex",
  justifyContent: "center",
  flexShrink: 0,
};

const metaTextStyle: CSSProperties = {
  fontSize: 15,
  color: "#2b2b2b",
  fontWeight: 600,
};

const metaMutedTextStyle: CSSProperties = {
  color: "#707070",
  fontWeight: 500,
  marginLeft: 2,
};

const dividerStyle: CSSProperties = {
  margin: "0 20px",
  borderTop: "1px solid #F0F0F0",
};

const footerStyle: CSSProperties = {
  padding: "20px 20px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
};

const footerLabelStyle: CSSProperties = {
  fontSize: 13,
  color: "#707070",
  fontWeight: 600,
  marginBottom: 2,
};

const footerPriceStyle: CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: "#000",
  letterSpacing: "-0.02em",
};

const ctaStyle: CSSProperties = {
  background: "#D4A017",
  color: "#fff",
  padding: "8px 12px",
  borderRadius: 12,
  fontSize: 15,
  fontWeight: 700,
  boxShadow: "0 8px 18px rgba(212,160,23,0.24)",
  border: "none",
  cursor: "pointer",
  flexShrink: 0,
};
