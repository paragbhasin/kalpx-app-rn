import {
  ArrowLeft,
  ArrowRight,
  Check,
  Heart,
  ShoppingCart,
  X,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getHaatServiceById, getHaatServicePackageById } from "./haatData";

export function KalpxHaatPackageDetailPage() {
  const navigate = useNavigate();
  const { id, packageId } = useParams();
  const isDesktop =
    typeof window === "undefined" ? true : window.innerWidth >= 1024;
  const service = getHaatServiceById(Number(id));
  const pkg = getHaatServicePackageById(Number(packageId));
  const [selectedSlot, setSelectedSlot] = useState(
    pkg.slots[2] ?? pkg.slots[0] ?? "",
  );

  return (
    <main style={{ minHeight: "100dvh", background: "#fff" }}>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: isDesktop ? "0 0 96px" : "0 0 110px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop
              ? "repeat(auto-fit, minmax(320px, 1fr))"
              : "1fr",
            gap: isDesktop ? 28 : 20,
          }}
        >
          <div>
            <header style={headerStyle}>
              <img
                src={service.image}
                alt={service.name}
                style={{ ...headerImageStyle, height: isDesktop ? 260 : 220 }}
              />

              <div style={topActionRowStyle}>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  style={overlaySquareButton}
                >
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
            </header>

            <div
              style={{
                ...contentWrapStyle,
                padding: isDesktop ? "18px 0 0" : "18px 16px 0",
              }}
            >
              <div style={titleRowStyle}>
                <h1 style={{ ...titleStyle, fontSize: isDesktop ? 28 : 24 }}>
                  {pkg.name}
                </h1>
                {pkg.badge ? <span style={badgeStyle}>{pkg.badge}</span> : null}
              </div>

              <div style={priceCardStyle}>
                <p style={totalPriceStyle}>
                  Total Price: ₹{pkg.price.toLocaleString()}/-
                </p>
                <p style={depositStyle}>
                  Deposit : ₹{pkg.deposit.toLocaleString()}
                </p>
              </div>

              <section style={sectionStyle}>
                <h3 style={sectionHeadingStyle}>Reserve your bookings</h3>
                <div
                  style={{
                    ...dateGridStyle,
                    gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
                  }}
                >
                  <Field label="From" value="10/12/2021" />
                  <Field label="To" value="10/12/2021" />
                </div>
              </section>

              <section style={sectionStyle}>
                <h3 style={sectionHeadingStyle}>Available Slots</h3>
                <div
                  style={{
                    ...slotGridStyle,
                    gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr 1fr",
                  }}
                >
                  {pkg.slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      style={
                        selectedSlot === slot ? activeSlotStyle : slotStyle
                      }
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <aside
            style={{
              ...contentWrapStyle,
              padding: isDesktop ? "18px 0 0" : "0 16px",
            }}
          >
            <div style={columnSectionStyle}>
              <h3 style={sideHeadingStyle}>What is Included</h3>
              {pkg.included.map((item) => (
                <div key={item} style={listRowStyle}>
                  <Check size={14} color="#22c55e" />
                  <span style={listTextStyle}>{item}</span>
                </div>
              ))}
            </div>

            <div style={sideDividerStyle} />

            <div style={columnSectionStyle}>
              <h3 style={sideHeadingStyle}>What is Excluded</h3>
              {pkg.excluded.map((item) => (
                <div key={item} style={listRowStyle}>
                  <X size={14} color="#ef4444" />
                  <span style={listTextStyle}>{item}</span>
                </div>
              ))}
            </div>

            <div style={sideDividerStyle} />

            <div style={columnSectionStyle}>
              <h3 style={sideHeadingStyle}>Add Ons</h3>
              <div style={{ display: "grid", gap: 10 }}>
                {pkg.addOns.map((addon) => (
                  <div key={addon.name} style={addonCardStyle}>
                    <div
                      style={{ display: "flex", gap: 12, alignItems: "center" }}
                    >
                      <div style={addonIconStyle}>
                        {addon.selected ? <Check size={14} /> : "+"}
                      </div>
                      <div>
                        <p style={addonTitleStyle}>{addon.name}</p>
                        <p style={addonDescStyle}>{addon.desc}</p>
                      </div>
                    </div>
                    <span style={addonPriceStyle}>₹{addon.price}/-</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={columnSectionStyle}>
              <h3 style={sideHeadingStyle}>Highlights of Package</h3>
              <div style={{ display: "grid", gap: 6 }}>
                {pkg.highlights.map((item) => (
                  <div key={item} style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: "#6b7280" }}>•</span>
                    <span style={listTextStyle}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div
        style={{
          ...bottomBarStyle,
          padding: isDesktop ? "14px 20px" : "12px 16px",
          alignItems: isDesktop ? "center" : "flex-end",
          bottom: isDesktop ? 0 : "50px",
        }}
      >
        <div>
          <p style={bottomMetaStyle}>Total Price</p>
          <p style={{ ...bottomPriceStyle, fontSize: isDesktop ? 28 : 22 }}>
            ₹{pkg.price.toLocaleString()}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            navigate(
              `/en/haat/service/${service.id}/checkout?package=${pkg.id}`,
            )
          }
          style={{
            ...bottomButtonStyle,
            padding: isDesktop ? "14px 22px" : "12px 16px",
          }}
        >
          Book Now
          <ArrowRight size={16} />
        </button>
      </div>
    </main>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={fieldLabelStyle}>{label}</p>
      <div style={fieldBoxStyle}>
        <span>{value}</span>
      </div>
    </div>
  );
}

const headerStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  borderRadius: 24,
};
const headerImageStyle: CSSProperties = {
  width: "100%",
  height: 260,
  objectFit: "cover",
  display: "block",
};
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
const contentWrapStyle: CSSProperties = {
  padding: "18px 0 0",
};
const titleRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  marginBottom: 18,
};
const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 28,
  fontWeight: 800,
  color: "#1f2937",
};
const badgeStyle: CSSProperties = {
  background: "#E9F0FF",
  color: "#1E56A0",
  borderRadius: 999,
  padding: "6px 12px",
  fontSize: 12,
  fontWeight: 700,
};
const priceCardStyle: CSSProperties = {
  background: "#FBF6E9",
  borderRadius: 16,
  padding: 16,
  marginBottom: 28,
};
const totalPriceStyle: CSSProperties = {
  margin: 0,
  fontSize: 28,
  fontWeight: 800,
  color: "#1f2937",
};
const depositStyle: CSSProperties = {
  margin: "8px 0 0",
  fontSize: 18,
  fontWeight: 700,
  color: "#4b5563",
};
const sectionStyle: CSSProperties = { marginBottom: 28 };
const sectionHeadingStyle: CSSProperties = {
  margin: "0 0 14px",
  fontSize: 18,
  fontWeight: 700,
  color: "#111827",
};
const dateGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 16,
};
const fieldLabelStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: 14,
  color: "#6b7280",
};
const fieldBoxStyle: CSSProperties = {
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  padding: "14px 16px",
  color: "#4b5563",
};
const slotGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};
const slotStyle: CSSProperties = {
  borderRadius: 6,
  background: "#FBF6E9",
  color: "#4b5563",
  padding: "12px 14px",
  fontSize: 14,
  fontWeight: 600,
};
const activeSlotStyle: CSSProperties = {
  ...slotStyle,
  background: "#D4A017",
  color: "#fff",
};
const columnSectionStyle: CSSProperties = { marginBottom: 24 };
const sideHeadingStyle: CSSProperties = {
  margin: "0 0 14px",
  fontSize: 18,
  fontWeight: 700,
  color: "#111827",
};
const listRowStyle: CSSProperties = {
  display: "flex",
  gap: 10,
  alignItems: "flex-start",
  marginBottom: 10,
};
const listTextStyle: CSSProperties = {
  fontSize: 15,
  color: "#4b5563",
  lineHeight: 1.5,
};
const sideDividerStyle: CSSProperties = {
  height: 1,
  background: "#e5e7eb",
  marginBottom: 24,
};
const addonCardStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 14,
  alignItems: "center",
  borderRadius: 10,
  background: "#fafafa",
  border: "1px solid #ececec",
  padding: 12,
};
const addonIconStyle: CSSProperties = {
  width: 24,
  height: 24,
  borderRadius: 6,
  background: "#FBF6E9",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};
const addonTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 15,
  fontWeight: 700,
  color: "#111827",
};
const addonDescStyle: CSSProperties = {
  margin: "4px 0 0",
  fontSize: 13,
  color: "#6b7280",
};
const addonPriceStyle: CSSProperties = {
  borderRadius: 999,
  border: "1px solid #f0c048",
  color: "#d4a017",
  padding: "4px 10px",
  fontSize: 13,
  fontWeight: 700,
};
const bottomBarStyle: CSSProperties = {
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 0,
  background: "#fff",
  borderTop: "1px solid #ececec",
  padding: "14px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};
const bottomMetaStyle: CSSProperties = {
  margin: 0,
  fontSize: 12,
  color: "#6b7280",
  textTransform: "uppercase",
};
const bottomPriceStyle: CSSProperties = {
  margin: "4px 0 0",
  fontSize: 28,
  fontWeight: 800,
  color: "#1f2937",
};
const bottomButtonStyle: CSSProperties = {
  borderRadius: 8,
  background: "#D4A017",
  color: "#fff",
  padding: "14px 22px",
  fontSize: 16,
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
};
