import { ArrowLeft, Heart, Pencil, Star } from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  getHaatServiceById,
  getHaatServicePackageById,
} from "./haatData";
import { getSelectedAddress, useHaatState } from "./haatState";

export function KalpxHaatServiceCheckoutPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isDesktop =
    typeof window === "undefined" ? true : window.innerWidth >= 1024;
  const service = useMemo(() => getHaatServiceById(Number(id)), [id]);
  const packageId = Number(searchParams.get("package")) || 1;
  const pkg = useMemo(() => getHaatServicePackageById(packageId), [packageId]);
  const state = useHaatState();
  const selectedAddress = getSelectedAddress(state);
  const [selectedPlan, setSelectedPlan] = useState<"deposit" | "full">("deposit");

  const payableNow = selectedPlan === "deposit" ? pkg.deposit : pkg.price;

  return (
    <main style={{ minHeight: "100dvh", background: "#fff" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: isDesktop ? "18px 14px 96px" : "18px 14px 110px" }}>
        <header style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button type="button" onClick={() => navigate(-1)} style={plainIconButtonStyle}>
              <ArrowLeft size={20} />
            </button>
            <h1 style={headerTitleStyle}>Your Cart</h1>
          </div>
          <button type="button" style={wishlistButtonStyle}>
            <Heart size={18} />
          </button>
        </header>

        <div style={tabRowStyle}>
          <button type="button" style={activeTabStyle}>My Cart</button>
          <button type="button" style={tabStyle}>My Orders</button>
        </div>

        <div
          style={{
            ...layoutStyle,
            gridTemplateColumns: isDesktop ? "minmax(0, 1.2fr) minmax(280px, 0.8fr)" : "1fr",
            gap: isDesktop ? 24 : 18,
          }}
        >
          <div style={{ display: "grid", gap: 22 }}>
            <article style={{ ...serviceCardStyle, flexDirection: isDesktop ? "row" : "column" }}>
              <img
                src={service.image}
                alt={service.name}
                style={{
                  ...serviceImageStyle,
                  width: isDesktop ? 170 : "100%",
                  height: isDesktop ? 110 : 180,
                }}
              />
              <div style={{ flex: 1 }}>
                <h3 style={serviceTitleStyle}>{service.name}</h3>
                <div style={ratingRowStyle}>
                  <Star size={12} fill="#D4A017" color="#D4A017" />
                  <span>4.5</span>
                  <span style={reviewMetaStyle}>(132 reviews)</span>
                </div>
                <p style={serviceMetaStyle}>Date: 23 Nov 2025</p>
                <p style={serviceMetaStyle}>Time: 8.00 AM - 5 PM</p>
                <button
                  type="button"
                  onClick={() => navigate(`/en/haat/service/${service.id}/package/${pkg.id}`)}
                  style={viewDetailsButtonStyle}
                >
                  View Details
                </button>
              </div>
            </article>

            <section>
              <h2 style={sectionTitleStyle}>All Coupons</h2>
              <div style={couponCardStyle}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={couponIconStyle}>%</div>
                  <div>
                    <p style={couponTitleStyle}>Extra 100off</p>
                    <p style={couponDescStyle}>On HDFC credit card. T & C</p>
                  </div>
                </div>
                <span style={appliedTextStyle}>Applied</span>
              </div>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>Address</h2>
              <button
                type="button"
                onClick={() => navigate("/en/haat/addresses")}
                style={addressCardStyle}
              >
                <span style={editIconWrapStyle}>
                  <Pencil size={14} />
                </span>
                <p style={addressTitleStyle}>Address</p>
                <p style={addressNameStyle}>{selectedAddress?.name ?? "Banu Elson"}</p>
                <p style={addressTextStyle}>{selectedAddress?.area ?? "Flat 302, Shanti Apartments, Lajpat Nagar, New Delhi - 110024"}</p>
                <p style={addressTextStyle}>Mobile: {selectedAddress?.mobile ?? "9823456367"}</p>
              </button>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>Payment Option</h2>
              <button
                type="button"
                onClick={() => setSelectedPlan("deposit")}
                style={selectedPlan === "deposit" ? activePlanStyle : planStyle}
              >
                <div style={planHeaderStyle}>
                  <div style={radioRowStyle}>
                    <span style={selectedPlan === "deposit" ? activeRadioStyle : radioStyle}>
                      {selectedPlan === "deposit" ? <span style={radioInnerStyle} /> : null}
                    </span>
                    <span style={planLabelStyle}>Pay Deposit</span>
                  </div>
                  <span style={planPriceStyle}>{pkg.deposit.toLocaleString()}/-</span>
                </div>
                <p style={planDescStyle}>
                  Secure by paying deposit and pay after full amount at the event
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan("full")}
                style={selectedPlan === "full" ? activePlanStyle : planStyle}
              >
                <div style={planHeaderStyle}>
                  <div style={radioRowStyle}>
                    <span style={selectedPlan === "full" ? activeRadioStyle : radioStyle}>
                      {selectedPlan === "full" ? <span style={radioInnerStyle} /> : null}
                    </span>
                    <span style={planLabelStyle}>Pay full amount now</span>
                  </div>
                  <span style={planPriceStyle}>₹{pkg.price.toLocaleString()}/-</span>
                </div>
                <p style={planDescStyle}>
                  Pay all amount today you will all set! No additional payment required
                </p>
              </button>
            </section>

            <section>
              <h2 style={sectionTitleStyle}>Make Payment</h2>
              <div style={{ display: "grid", gap: 14 }}>
                <InputGroup label="Card No." placeholder="Card number" />
                <InputGroup label="Expiration Date" placeholder="MM/YY" />
                <InputGroup label="Security Date" placeholder="CVC" />
                <InputGroup label="Country" placeholder="India" />
              </div>
            </section>
          </div>

          <aside style={isDesktop ? undefined : { order: -1 }}>
            <h2 style={sectionTitleStyle}>Price Details</h2>
            <div style={priceBoxStyle}>
              <PriceRow label="Total Price" value={`₹${pkg.price.toLocaleString()}/-`} />
              <PriceRow label="Discount" value="-₹100/-" />
              <PriceRow label="Delivery Charge" value="Free" />
              <div style={dividerStyle} />
              <PriceRow label="Total Amount" value={`₹${(pkg.price - 100).toLocaleString()}/-`} strong />
            </div>
          </aside>
        </div>
      </div>

      <div
        style={{
          ...bottomBarStyle,
          padding: isDesktop ? "14px 20px" : "12px 16px",
        }}
      >
        <div>
          <p style={bottomLabelStyle}>Total Price</p>
          <p style={{ ...bottomPriceStyle, fontSize: isDesktop ? 32 : 24 }}>
            ₹{payableNow.toLocaleString()}
          </p>
        </div>
        <button type="button" style={{ ...payButtonStyle, padding: isDesktop ? "14px 24px" : "12px 18px" }}>
          Pay Now
        </button>
      </div>
    </main>
  );
}

function InputGroup({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <p style={inputLabelStyle}>{label}</p>
      <input placeholder={placeholder} style={inputStyle} />
    </div>
  );
}

function PriceRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
      <span style={{ fontWeight: strong ? 700 : 400, color: "#2f2f2f" }}>{label}</span>
      <span style={{ fontWeight: 700, color: "#2f2f2f" }}>{value}</span>
    </div>
  );
}

const headerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
};
const plainIconButtonStyle: CSSProperties = {
  width: 34,
  height: 34,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#2f2f2f",
};
const headerTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 24,
  fontWeight: 700,
  color: "#2f2f2f",
};
const wishlistButtonStyle: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 10,
  background: "#FBF6E9",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};
const tabRowStyle: CSSProperties = {
  display: "flex",
  gap: 18,
  borderBottom: "1px solid #e5e7eb",
  marginBottom: 22,
};
const activeTabStyle: CSSProperties = {
  padding: "14px 0",
  borderBottom: "2px solid #e0aa10",
  color: "#d49c07",
  fontWeight: 600,
};
const tabStyle: CSSProperties = {
  padding: "14px 0",
  color: "#4b5563",
  fontWeight: 600,
};
const layoutStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)",
  gap: 24,
  alignItems: "start",
};
const serviceCardStyle: CSSProperties = {
  display: "flex",
  gap: 16,
  border: "1px solid #ececec",
  borderRadius: 12,
  padding: 14,
};
const serviceImageStyle: CSSProperties = {
  width: 170,
  height: 110,
  borderRadius: 10,
  objectFit: "cover",
  flexShrink: 0,
};
const serviceTitleStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: 18,
  fontWeight: 700,
  color: "#2f2f2f",
};
const ratingRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 13,
  color: "#2f2f2f",
};
const reviewMetaStyle: CSSProperties = {
  color: "#94a3b8",
};
const serviceMetaStyle: CSSProperties = {
  margin: "8px 0 0",
  fontSize: 13,
  color: "#6b7280",
};
const viewDetailsButtonStyle: CSSProperties = {
  marginTop: 10,
  color: "#d4a017",
  fontWeight: 700,
};
const sectionTitleStyle: CSSProperties = {
  margin: "0 0 12px",
  fontSize: 18,
  fontWeight: 700,
  color: "#2f2f2f",
};
const couponCardStyle: CSSProperties = {
  border: "1px solid #ececec",
  borderRadius: 8,
  padding: 16,
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
};
const couponIconStyle: CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: "50%",
  background: "#eaf1ff",
  color: "#2563eb",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
};
const couponTitleStyle: CSSProperties = {
  margin: 0,
  fontWeight: 700,
  color: "#2f2f2f",
};
const couponDescStyle: CSSProperties = {
  margin: "6px 0 0",
  fontSize: 13,
  color: "#6b7280",
};
const appliedTextStyle: CSSProperties = {
  color: "#2563eb",
  fontWeight: 700,
};
const addressCardStyle: CSSProperties = {
  width: "100%",
  position: "relative",
  borderRadius: 8,
  background: "#fafafa",
  border: "1px solid #f1f1f1",
  padding: 16,
  textAlign: "left",
};
const editIconWrapStyle: CSSProperties = {
  position: "absolute",
  top: 14,
  right: 14,
};
const addressTitleStyle: CSSProperties = {
  margin: "0 0 8px",
  fontWeight: 700,
  color: "#2f2f2f",
};
const addressNameStyle: CSSProperties = {
  margin: "0 0 6px",
  fontWeight: 700,
  color: "#2f2f2f",
};
const addressTextStyle: CSSProperties = {
  margin: "4px 0 0",
  color: "#4b5563",
  lineHeight: 1.5,
};
const planStyle: CSSProperties = {
  width: "100%",
  border: "1px solid #ececec",
  borderRadius: 8,
  padding: 16,
  marginBottom: 12,
  textAlign: "left",
};
const activePlanStyle: CSSProperties = {
  ...planStyle,
  borderColor: "#e0aa10",
  background: "#fffdf7",
};
const planHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "center",
};
const radioRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};
const radioStyle: CSSProperties = {
  width: 16,
  height: 16,
  borderRadius: "50%",
  border: "1px solid #d1d5db",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};
const activeRadioStyle: CSSProperties = {
  ...radioStyle,
  borderColor: "#16a34a",
};
const radioInnerStyle: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: "50%",
  background: "#16a34a",
};
const planLabelStyle: CSSProperties = {
  fontWeight: 700,
  color: "#2f2f2f",
};
const planPriceStyle: CSSProperties = {
  color: "#d49c07",
  fontWeight: 700,
};
const planDescStyle: CSSProperties = {
  margin: "10px 0 0 26px",
  fontSize: 13,
  color: "#6b7280",
};
const inputLabelStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: 14,
  color: "#2f2f2f",
};
const inputStyle: CSSProperties = {
  width: "100%",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  padding: "12px 14px",
};
const priceBoxStyle: CSSProperties = {
  borderRadius: 8,
  padding: 16,
  background: "#fafafa",
  border: "1px solid #f1f1f1",
};
const dividerStyle: CSSProperties = {
  height: 1,
  background: "#e5e7eb",
  margin: "14px 0",
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
const bottomLabelStyle: CSSProperties = {
  margin: 0,
  fontSize: 12,
  color: "#6b7280",
};
const bottomPriceStyle: CSSProperties = {
  margin: "4px 0 0",
  fontSize: 32,
  fontWeight: 800,
  color: "#1f2937",
};
const payButtonStyle: CSSProperties = {
  borderRadius: 8,
  background: "#D4A017",
  color: "#fff",
  padding: "14px 24px",
  fontSize: 16,
  fontWeight: 700,
};
