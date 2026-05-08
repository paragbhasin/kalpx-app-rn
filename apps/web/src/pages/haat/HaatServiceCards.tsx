import { Star } from "lucide-react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import type { HaatService, HaatStore } from "./haatData";

export function HaatServiceGrid({
  services,
  stores,
}: {
  services: HaatService[];
  stores: HaatStore[];
}) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 16,
      }}
    >
      {services.map((service) => {
        const store = stores.find(
          (item) => item.store_name === service.provider,
        );
        return (
          <article
            key={service.id}
            style={serviceCardStyle}
            onClick={() =>
              navigate(`/en/haat/store/${store?.id ?? 4}?type=service`)
            }
          >
            <div style={serviceImageWrapStyle}>
              <img
                src={service.image}
                alt={service.name}
                style={serviceImageStyle}
              />
            </div>

            <div style={serviceContentStyle}>
              <h3 style={serviceTitleStyle}>{service.name}</h3>

              <div style={ratingRowStyle}>
                <Star size={14} fill="#eab308" color="#eab308" />
                <span style={{ color: "#1f2937", fontWeight: 600 }}>4.5</span>
                <span style={reviewTextStyle}>(132 reviews)</span>
              </div>

              <p style={servicePriceStyle}>{service.price}</p>

              <div style={{ marginTop: 10 }}>
                <span style={discountChipStyle}>62% off</span>
              </div>

              <div style={serviceActionRowStyle}>
                {/* <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate(`/en/haat/store/${store?.id ?? 4}?type=service`);
                  }}
                  style={viewDetailsButtonStyle}
                >
                  View Details
                </button> */}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate(`/en/haat/store/${store?.id ?? 4}?type=service`);
                  }}
                  style={bookNowButtonStyle}
                >
                  Book Now
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

const serviceCardStyle: CSSProperties = {
  display: "flex",
  gap: 16,
  borderRadius: 20,
  border: "1px solid rgba(233, 201, 128, 0.52)",
  background: "#fff",
  padding: 14,
  boxShadow: "0 8px 24px rgba(67, 33, 4, 0.08)",
  cursor: "pointer",
};

const serviceImageWrapStyle: CSSProperties = {
  width: 128,
  height: 128,
  borderRadius: 18,
  overflow: "hidden",
  flexShrink: 0,
};

const serviceImageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const serviceContentStyle: CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const serviceTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 800,
  lineHeight: 1.3,
  color: "#1f2937",
};

const ratingRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginTop: 8,
};

const reviewTextStyle: CSSProperties = {
  fontSize: 12,
  color: "#94a3b8",
  fontWeight: 600,
};

const servicePriceStyle: CSSProperties = {
  margin: "12px 0 0",
  fontSize: 16,
  fontWeight: 800,
  color: "#1f2937",
};

const discountChipStyle: CSSProperties = {
  display: "inline-block",
  borderRadius: 6,
  background: "#15803d",
  color: "#fff",
  padding: "2px 8px",
  fontSize: 12,
  fontWeight: 800,
};

const serviceActionRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  marginTop: 14,
  flexWrap: "wrap",
};

const viewDetailsButtonStyle: CSSProperties = {
  padding: 0,
  color: "#d4a017",
  fontSize: 14,
  fontWeight: 800,
};

const bookNowButtonStyle: CSSProperties = {
  borderRadius: 11,
  background: "#dfa50b",
  color: "#fff",
  padding: "5px 15px",
  fontSize: 14,
  fontWeight: 800,
};
