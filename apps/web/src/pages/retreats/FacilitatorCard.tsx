import { Award, Briefcase, Globe, MessageCircle, Star } from "lucide-react";
import type { CSSProperties } from "react";
import retreatHostImage from "../../../../mobile/assets/retreat/retreat2.webp";

export function FacilitatorCard() {
  return (
    <main style={mainStyle}>
      <section id="facilitator" style={sectionStyle}>
        <div style={cardStyle}>
          <div style={topRowStyle}>
            <div style={leftColStyle}>
              <img
                src={retreatHostImage}
                style={avatarStyle}
                alt="Facilitator"
              />

              <div style={nameWrapStyle}>
                <h3 style={nameStyle}>Riya Dyne</h3>
                <p style={roleStyle}>Meditation Teacher</p>
              </div>
            </div>

            <div style={statsColStyle}>
              <div style={statRowStyle}>
                <Star size={12} color="#9ca3af" fill="#9ca3af" />
                <span style={statStrongStyle}>4.9</span>
              </div>
              <hr style={hrStyle} />

              <div style={statRowStyle}>
                <MessageCircle size={12} color="#9ca3af" />
                <span style={statTextStyle}>76 Reviews</span>
              </div>
              <hr style={hrStyle} />

              <div style={statRowStyle}>
                <Briefcase size={12} color="#9ca3af" />
                <span style={statTextStyle}>10+ Exp</span>
              </div>
            </div>
          </div>

          <div style={tagsRowStyle}>
            <Award size={14} color="#facc15" />
            {["Ayurveda", "Meditation", "Yoga"].map((tag) => (
              <span key={tag} style={tagStyle}>
                {tag}
              </span>
            ))}
          </div>

          <div style={languagesRowStyle}>
            <Globe size={14} color="#60a5fa" />
            <span style={languagesTextStyle}>English, Hindi</span>
          </div>

          <p style={descriptionStyle}>
            Retreats are curated by certified wellness specialists....
            <span style={viewMoreStyle}>View more</span>
          </p>
        </div>
      </section>
    </main>
  );
}

const mainStyle: CSSProperties = {
  background: "#fff",
};

const sectionStyle: CSSProperties = {
  scrollMarginTop: 128,
};

const cardStyle: CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  border: "1px solid #e5e7eb",
  padding: 8,
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
};

const topRowStyle: CSSProperties = {
  display: "flex",
  gap: 16,
};

const leftColStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const avatarStyle: CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: "50%",
  objectFit: "cover",
};

const nameWrapStyle: CSSProperties = {
  flex: 1,
  marginTop: 8,
};

const nameStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: "#111827",
  lineHeight: 1.2,
};

const roleStyle: CSSProperties = {
  margin: "4px 0 0",
  fontSize: 16,
  color: "#6b7280",
  fontWeight: 500,
};

const statsColStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  fontSize: 14,
  color: "#4b5563",
};

const statRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const statStrongStyle: CSSProperties = {
  fontWeight: 600,
  color: "#374151",
};

const statTextStyle: CSSProperties = {
  color: "#4b5563",
};

const hrStyle: CSSProperties = {
  width: "100%",
  border: "none",
  borderTop: "1px solid #e5e7eb",
  margin: 0,
};

const tagsRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginTop: 16,
  flexWrap: "wrap",
};

const tagStyle: CSSProperties = {
  padding: "4px 16px",
  borderRadius: 999,
  background: "#FFF6E5",
  fontSize: 16,
  fontWeight: 500,
  color: "#1f2937",
};

const languagesRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginTop: 12,
  fontSize: 14,
  color: "#4b5563",
};

const languagesTextStyle: CSSProperties = {
  color: "#4b5563",
};

const descriptionStyle: CSSProperties = {
  margin: "12px 0 0",
  fontSize: 14,
  color: "#4b5563",
  lineHeight: 1.6,
};

const viewMoreStyle: CSSProperties = {
  color: "#1f2937",
  fontWeight: 600,
  cursor: "pointer",
  marginLeft: 4,
};
