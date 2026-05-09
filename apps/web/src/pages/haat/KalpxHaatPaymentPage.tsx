import {
  ArrowLeft,
  CreditCard,
  Edit3,
  Heart,
  Landmark,
} from "lucide-react";
import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { getSelectedAddress, useHaatState } from "./haatState";

type PaymentMethod = "cod" | "card";

export function KalpxHaatPaymentPage() {
  const navigate = useNavigate();
  const haatState = useHaatState();
  const address = getSelectedAddress(haatState);
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [country, setCountry] = useState(address?.country ?? "India");

  return (
    <main style={{ minHeight: "100dvh", background: "#fff" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "18px 20px 40px" }}>
        <header style={headerStyle}>
          <button type="button" onClick={() => navigate(-1)} style={backButtonStyle}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={headerTitleStyle}>Payment Details</h1>
          <button
            type="button"
            onClick={() => navigate("/en/haat/cart?tab=wishlist")}
            style={wishlistButtonStyle}
          >
            <Heart size={18} />
          </button>
        </header>

        <section style={{ marginTop: 20 }}>
          <h2 style={sectionTitleStyle}>Address</h2>
          <div style={addressCardStyle}>
            <button
              type="button"
              onClick={() => navigate("/en/haat/addresses")}
              style={addressEditButtonStyle}
            >
              <Edit3 size={16} />
            </button>
            <p style={addressNameStyle}>{address?.name ?? "Select address"}</p>
            <p style={addressLineStyle}>{address?.area ?? "No address selected"}</p>
            <p style={addressMobileStyle}>Mobile: {address?.mobile ?? "—"}</p>
          </div>
        </section>

        <section style={{ marginTop: 18 }}>
          <h2 style={sectionTitleStyle}>Payment Method</h2>
          <div style={paymentMethodRowStyle}>
            <button
              type="button"
              onClick={() => setMethod("cod")}
              style={{
                ...paymentMethodCardStyle,
                ...(method === "cod" ? activePaymentMethodStyle : null),
              }}
            >
              <Landmark size={18} color={method === "cod" ? "#dfa50b" : "#6b7280"} />
              Cash on Delivery
            </button>
            <button
              type="button"
              onClick={() => setMethod("card")}
              style={{
                ...paymentMethodCardStyle,
                ...(method === "card" ? activePaymentMethodStyle : null),
              }}
            >
              <CreditCard size={18} color={method === "card" ? "#dfa50b" : "#6b7280"} />
              Card Payment
            </button>
          </div>
        </section>

        <section style={{ marginTop: 28 }}>
          <h2 style={sectionTitleStyle}>Make Payment</h2>
          <div style={{ display: "grid", gap: 12 }}>
            <Field label="Card No.">
              <div style={fieldWithIconWrapStyle}>
                <input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="Card number"
                  style={inputStyle}
                />
                <CreditCard size={18} color="#6b7280" style={fieldTrailingIconStyle} />
              </div>
            </Field>
            <Field label="Expiration Date">
              <input
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/YY"
                style={inputStyle}
              />
            </Field>
            <Field label="Security Date">
              <input
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="CVC"
                style={inputStyle}
              />
            </Field>
            <Field label="Country">
              <select value={country} onChange={(e) => setCountry(e.target.value)} style={inputStyle}>
                <option>India</option>
              </select>
            </Field>
          </div>
        </section>

        <div style={paymentFooterStyle}>
          <button type="button" style={primaryButtonStyle}>
            Buy Now
          </button>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 14, color: "#2f2f2f" }}>{label}</span>
      {children}
    </label>
  );
}

const headerStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "32px 1fr 32px",
  alignItems: "center",
};

const backButtonStyle: CSSProperties = {
  width: 32,
  height: 32,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
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
  color: "#4b5563",
  justifySelf: "end",
};

const headerTitleStyle: CSSProperties = {
  margin: 0,
  textAlign: "center",
  fontSize: 24,
  fontWeight: 700,
  color: "#2f2f2f",
};

const sectionTitleStyle: CSSProperties = {
  margin: "0 0 10px",
  fontSize: 16,
  fontWeight: 700,
  color: "#2f2f2f",
};

const addressCardStyle: CSSProperties = {
  position: "relative",
  background: "#f7f7f7",
  borderRadius: 4,
  padding: "14px 14px 18px",
};

const addressEditButtonStyle: CSSProperties = {
  position: "absolute",
  top: 14,
  right: 14,
  color: "#2f2f2f",
};

const addressNameStyle: CSSProperties = {
  margin: "0 0 8px",
  fontWeight: 700,
  color: "#2f2f2f",
};

const addressLineStyle: CSSProperties = {
  margin: "0 0 8px",
  color: "#2f2f2f",
};

const addressMobileStyle: CSSProperties = {
  margin: 0,
  color: "#4b5563",
};

const paymentMethodRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 22,
};

const paymentMethodCardStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  border: "1px solid #eadfc2",
  background: "#fff",
  borderRadius: 6,
  padding: "12px 14px",
  color: "#2f2f2f",
};

const activePaymentMethodStyle: CSSProperties = {
  background: "#FBF6E9",
};

const fieldWithIconWrapStyle: CSSProperties = {
  position: "relative",
};

const inputStyle: CSSProperties = {
  width: "100%",
  height: 42,
  border: "1px solid #e5e7eb",
  borderRadius: 4,
  padding: "0 14px",
  fontSize: 14,
  color: "#2f2f2f",
  background: "#fff",
};

const fieldTrailingIconStyle: CSSProperties = {
  position: "absolute",
  right: 12,
  top: "50%",
  transform: "translateY(-50%)",
};

const paymentFooterStyle: CSSProperties = {
  marginTop: 60,
  borderRadius: 12,
  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  border: "1px solid #f1f1f1",
  padding: "18px 16px",
  display: "flex",
  justifyContent: "center",
};

const primaryButtonStyle: CSSProperties = {
  minWidth: 266,
  padding: "12px 18px",
  background: "#dfa50b",
  color: "#fff",
  fontWeight: 700,
};
