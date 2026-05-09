import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  ShoppingCart,
  Star,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getHaatServiceById,
  getHaatServicePackages,
  type HaatServicePackage,
} from "./haatData";

export function KalpxHaatServiceDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isDesktop =
    typeof window === "undefined" ? true : window.innerWidth >= 1024;
  const service = useMemo(() => getHaatServiceById(Number(id)), [id]);
  const packages = useMemo(() => getHaatServicePackages(service.id), [service.id]);
  const [selectedPackageId, setSelectedPackageId] = useState(packages[0]?.id ?? 0);

  return (
    <main style={{ minHeight: "100dvh", background: "#fff" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: isDesktop ? "0 0 32px" : "0 0 24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "repeat(auto-fit, minmax(320px, 1fr))" : "1fr",
            gap: isDesktop ? 32 : 20,
          }}
        >
          <div>
            <header
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 24,
                boxShadow: "0 12px 30px rgba(67, 33, 4, 0.08)",
              }}
            >
              <img
                src={service.image}
                alt={service.name}
                style={{
                  width: "100%",
                  height: isDesktop ? 360 : 240,
                  objectFit: "cover",
                  display: "block",
                }}
              />

              <div style={topActionRowStyle}>
                <button type="button" onClick={() => navigate(-1)} style={overlaySquareButton}>
                  <ArrowLeft size={18} color="#1f2937" />
                </button>
                <div style={{ display: "flex", gap: 12 }}>
                  <button type="button" style={overlaySquareButton}>
                    <ShoppingCart size={18} color="#1f2937" />
                  </button>
                  <button type="button" style={overlaySquareButton}>
                    <Heart size={18} color="#1f2937" />
                  </button>
                </div>
              </div>

              <div style={carouselDotsStyle}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <span key={index} style={index === 0 ? activeDotStyle : dotStyle} />
                ))}
              </div>
            </header>

            <section style={{ padding: isDesktop ? "24px 0 0" : "18px 16px 0" }}>
              <div style={titleRowStyle}>
                <h1 style={{ ...serviceTitleStyle, fontSize: isDesktop ? 26 : 24 }}>{service.name}</h1>
                <div style={ratingBadgeStyle}>
                  <Star size={12} fill="#fff" color="#fff" />
                  <span>{service.rating?.toFixed(1) ?? "4.0"}+</span>
                </div>
              </div>

              <div style={sectionStyle}>
                <h3 style={sectionHeadingStyle}>Description :</h3>
                <p style={sectionBodyStyle}>{service.description}</p>
              </div>

              <div style={dividerStyle} />

              <div style={sectionStyle}>
                <h3 style={sectionHeadingStyle}>Additional Details</h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: 24,
                  }}
                >
                  {Object.entries(service.details ?? {}).map(([key, value]) => (
                    <div key={key}>
                      <p style={detailLabelStyle}>{key}</p>
                      <p style={detailValueStyle}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={dividerStyle} />

              <ReviewRatingsCompact />
            </section>
          </div>

          <aside style={isDesktop ? undefined : { paddingInline: 16 }}>
            <h2 style={packageHeadingStyle}>Package Details</h2>
            <div style={{ display: "grid", gap: 18 }}>
              {packages.map((pkg) => (
                <PackageCard
                  key={pkg.id}
                  serviceId={service.id}
                  pkg={pkg}
                  selected={selectedPackageId === pkg.id}
                  onSelect={() => setSelectedPackageId(pkg.id)}
                />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function PackageCard({
  serviceId,
  pkg,
  selected,
  onSelect,
}: {
  serviceId: number;
  pkg: HaatServicePackage;
  selected: boolean;
  onSelect: () => void;
}) {
  const navigate = useNavigate();

  return (
    <article style={packageCardStyle}>
      <div style={packageHeaderStyle}>
        <TextBlock label={pkg.name} />
        <div style={{ textAlign: "right" }}>
          <p style={packagePriceLabelStyle}>Price</p>
          <p style={packagePriceStyle}>₹{pkg.price.toLocaleString()}</p>
        </div>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {pkg.features.map((feature) => (
          <div key={feature} style={featureRowStyle}>
            <Check size={14} color="#2563eb" />
            <span style={featureTextStyle}>{feature}</span>
          </div>
        ))}
      </div>

      <div style={packageActionsStyle}>
        <button
          type="button"
          onClick={onSelect}
          style={selected ? selectedPackageButtonStyle : packageButtonStyle}
        >
          {selected ? "Selected" : "Select Package"}
          {selected ? <Check size={16} color="#fff" /> : null}
        </button>
        <button
          type="button"
          onClick={() =>
            navigate(`/en/haat/service/${serviceId}/package/${pkg.id}`)
          }
          style={viewPackageButtonStyle}
        >
          View Details
        </button>
      </div>
    </article>
  );
}

function TextBlock({ label }: { label: string }) {
  return <h3 style={packageTitleStyle}>{label}</h3>;
}

function ReviewRatingsCompact() {
  return (
    <section style={{ display: "grid", gap: 18 }}>
      <h2 style={sectionHeadingStyle}>Review & Ratings</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            typeof window !== "undefined" && window.innerWidth < 768
              ? "1fr"
              : "minmax(240px, 0.9fr) minmax(260px, 1fr)",
          gap: 22,
        }}
      >
        <div style={ratingsSummaryCardStyle}>
          {[5, 4, 3, 2, 1].map((star, index) => (
            <div key={star} style={ratingLineStyle}>
              <span style={ratingNumberStyle}>{star}</span>
              <Star size={12} fill="#D4A017" color="#D4A017" />
              <div style={ratingTrackStyle}>
                <div
                  style={{
                    ...ratingFillStyle,
                    width: ["85%", "65%", "40%", "15%", "5%"][index],
                  }}
                />
              </div>
            </div>
          ))}
          <div style={ratingsTotalWrapStyle}>
            <div style={ratingsDividerStyle} />
            <div>
              <div style={ratingsBigStyle}>4.0</div>
              <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={14}
                    fill={index < 4 ? "#D4A017" : "#d1d5db"}
                    color={index < 4 ? "#D4A017" : "#d1d5db"}
                  />
                ))}
              </div>
              <p style={ratingsMetaStyle}>52 Reviews</p>
            </div>
          </div>
        </div>

        <article style={reviewCardStyle}>
          <div style={reviewHeaderStyle}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <img
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt="Courtney Henry"
                style={reviewAvatarStyle}
              />
              <div>
                <p style={reviewAuthorStyle}>Courtney Henry</p>
                <p style={reviewDateStyle}>Posted on 11 Dec 2025</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 2 }}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} size={12} fill="#D4A017" color="#D4A017" />
              ))}
            </div>
          </div>
          <p style={reviewTextStyle}>
            The decoration was clean, well-arranged, and used good-quality materials.
            The...
            <span style={{ color: "#111827", fontWeight: 700 }}> More</span>
          </p>
          <img
            src="/haat-assets/service-card.png"
            alt=""
            style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover" }}
          />
        </article>
      </div>
    </section>
  );
}

const topActionRowStyle: CSSProperties = {
  position: "absolute",
  top: 18,
  left: 18,
  right: 18,
  display: "flex",
  justifyContent: "space-between",
};

const overlaySquareButton: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 10,
  background: "rgba(255,255,255,0.88)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const carouselDotsStyle: CSSProperties = {
  position: "absolute",
  bottom: 12,
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: 6,
};

const dotStyle: CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: 999,
  background: "rgba(255,255,255,0.55)",
};

const activeDotStyle: CSSProperties = {
  width: 36,
  height: 10,
  borderRadius: 999,
  background: "#fff",
};

const titleRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 16,
};

const serviceTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 26,
  fontWeight: 800,
  color: "#1f2937",
};

const ratingBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  background: "#387F31",
  color: "#fff",
  borderRadius: 8,
  padding: "6px 10px",
  fontWeight: 700,
};

const sectionStyle: CSSProperties = { marginBottom: 24 };
const sectionHeadingStyle: CSSProperties = {
  margin: "0 0 12px",
  fontSize: 20,
  fontWeight: 700,
  color: "#111827",
};
const sectionBodyStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  color: "#6b7280",
  lineHeight: 1.7,
};
const dividerStyle: CSSProperties = {
  height: 1,
  background: "#e5e7eb",
  margin: "24px 0",
};
const detailLabelStyle: CSSProperties = {
  margin: "0 0 6px",
  fontSize: 14,
  color: "#6b7280",
};
const detailValueStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: "#111827",
};
const packageHeadingStyle: CSSProperties = {
  margin: "0 0 20px",
  fontSize: 22,
  fontWeight: 800,
  color: "#111827",
};
const packageCardStyle: CSSProperties = {
  borderRadius: 16,
  border: "1px solid #ece5d8",
  background: "#fff",
  boxShadow: "0 8px 24px rgba(67, 33, 4, 0.06)",
  overflow: "hidden",
};
const packageHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  padding: "14px 16px",
  background: "#FBF6E9",
};
const packageTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
  color: "#2f2f2f",
};
const packagePriceLabelStyle: CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: "#8d8378",
};
const packagePriceStyle: CSSProperties = {
  margin: "4px 0 0",
  fontSize: 18,
  fontWeight: 800,
  color: "#2f2f2f",
};
const featureRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "flex-start",
  paddingInline: 16,
};
const featureTextStyle: CSSProperties = {
  fontSize: 15,
  color: "#4b5563",
  lineHeight: 1.5,
};
const packageActionsStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
  padding: 16,
};
const packageButtonStyle: CSSProperties = {
  borderRadius: 8,
  background: "#D4A017",
  color: "#fff",
  padding: "12px 14px",
  fontSize: 15,
  fontWeight: 700,
};
const selectedPackageButtonStyle: CSSProperties = {
  ...packageButtonStyle,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};
const viewPackageButtonStyle: CSSProperties = {
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  color: "#374151",
  padding: "12px 14px",
  fontSize: 15,
  fontWeight: 600,
};
const ratingsSummaryCardStyle: CSSProperties = {
  border: "1px solid #f0efe9",
  borderRadius: 16,
  padding: 16,
  background: "#fff",
};
const ratingLineStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginBottom: 10,
};
const ratingNumberStyle: CSSProperties = {
  width: 12,
  fontSize: 14,
  color: "#111827",
};
const ratingTrackStyle: CSSProperties = {
  flex: 1,
  height: 6,
  background: "#e5e7eb",
  borderRadius: 999,
  overflow: "hidden",
};
const ratingFillStyle: CSSProperties = {
  height: "100%",
  background: "#D4A017",
  borderRadius: 999,
};
const ratingsTotalWrapStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1px 1fr",
  gap: 20,
  alignItems: "center",
  marginTop: 14,
};
const ratingsDividerStyle: CSSProperties = {
  width: 1,
  height: 120,
  background: "#e5e7eb",
};
const ratingsBigStyle: CSSProperties = {
  fontSize: 54,
  fontWeight: 800,
  color: "#111827",
};
const ratingsMetaStyle: CSSProperties = {
  margin: "8px 0 0",
  fontSize: 14,
  fontWeight: 600,
  color: "#4b5563",
};
const reviewCardStyle: CSSProperties = {
  border: "1px solid #f3f4f6",
  borderRadius: 16,
  padding: 16,
  background: "#fff",
};
const reviewHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
};
const reviewAvatarStyle: CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  objectFit: "cover",
};
const reviewAuthorStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
  color: "#111827",
};
const reviewDateStyle: CSSProperties = {
  margin: "4px 0 0",
  fontSize: 13,
  color: "#6b7280",
};
const reviewTextStyle: CSSProperties = {
  margin: "14px 0 16px",
  fontSize: 15,
  color: "#4b5563",
  lineHeight: 1.7,
};
