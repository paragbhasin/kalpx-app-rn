import { ArrowLeft, Circle, CirclePlus, Edit3 } from "lucide-react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { getAddresses, selectAddress, useHaatState } from "./haatState";

export function KalpxHaatAddressListPage() {
  const navigate = useNavigate();
  const haatState = useHaatState();
  const addresses = getAddresses(haatState);

  return (
    <main style={{ minHeight: "100dvh", background: "#fff" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "18px 20px 40px" }}>
        <button type="button" onClick={() => navigate(-1)} style={backButtonStyle}>
          <ArrowLeft size={20} />
        </button>

        <div style={{ display: "grid", gap: 22, marginTop: 18 }}>
          {addresses.map((address) => (
            <div key={address.id} style={rowStyle}>
              <button
                type="button"
                onClick={() => selectAddress(address.id)}
                style={radioWrapStyle}
              >
                <Circle
                  size={18}
                  color={haatState.selectedAddressId === address.id ? "#3b873e" : "#d1d5db"}
                  fill={haatState.selectedAddressId === address.id ? "#3b873e" : "none"}
                />
              </button>

              <div style={addressCardStyle}>
                <button
                  type="button"
                  onClick={() => navigate(`/en/haat/addresses/${address.id}/edit`)}
                  style={editButtonStyle}
                >
                  <Edit3 size={16} />
                </button>
                <h3 style={nameStyle}>{address.name}</h3>
                <p style={addressLineStyle}>{address.area}</p>
                <p style={mobileStyle}>Mobile: {address.mobile}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={bottomActionRowStyle}>
          <button
            type="button"
            onClick={() => navigate("/en/haat/addresses/new")}
            style={secondaryActionStyle}
          >
            <CirclePlus size={18} />
            Add New Address
          </button>
          <button
            type="button"
            onClick={() => navigate("/en/haat/payment")}
            style={primaryActionStyle}
          >
            Save
          </button>
        </div>
      </div>
    </main>
  );
}

const backButtonStyle: CSSProperties = {
  width: 32,
  height: 32,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#2f2f2f",
};

const rowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "28px 1fr",
  gap: 18,
  alignItems: "center",
};

const radioWrapStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const addressCardStyle: CSSProperties = {
  position: "relative",
  background: "#f7f7f7",
  borderRadius: 4,
  padding: "14px 18px",
};

const editButtonStyle: CSSProperties = {
  position: "absolute",
  top: 14,
  right: 18,
  color: "#2f2f2f",
};

const nameStyle: CSSProperties = {
  margin: "0 0 10px",
  fontSize: 16,
  fontWeight: 700,
  color: "#2f2f2f",
};

const addressLineStyle: CSSProperties = {
  margin: "0 0 10px",
  fontSize: 15,
  color: "#2f2f2f",
};

const mobileStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  color: "#4b5563",
};

const bottomActionRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: 42,
  marginTop: 34,
  flexWrap: "wrap",
};

const secondaryActionStyle: CSSProperties = {
  minWidth: 266,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  border: "1px solid #d1d5db",
  background: "#fff",
  color: "#2f2f2f",
  padding: "12px 18px",
};

const primaryActionStyle: CSSProperties = {
  minWidth: 266,
  background: "#dfa50b",
  color: "#fff",
  padding: "12px 18px",
  fontWeight: 700,
};
