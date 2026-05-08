import { ArrowLeft } from "lucide-react";
import { useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAddresses, saveAddress, useHaatState } from "./haatState";

export function KalpxHaatAddressFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const haatState = useHaatState();
  const editing = useMemo(
    () => getAddresses(haatState).find((item) => item.id === Number(id)) ?? null,
    [haatState, id],
  );

  const [name, setName] = useState(editing?.name ?? "");
  const [mobile, setMobile] = useState(editing?.mobile ?? "");
  const [country, setCountry] = useState(editing?.country ?? "India");
  const [state, setState] = useState(editing?.state ?? "Delhi");
  const [city, setCity] = useState(editing?.city ?? "New Delhi");
  const [area, setArea] = useState(editing?.area ?? "");

  function handleSave() {
    saveAddress({ name, mobile, country, state, city, area }, editing?.id);
    navigate("/en/haat/addresses");
  }

  return (
    <main style={{ minHeight: "100dvh", background: "#fff" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "18px 20px 40px" }}>
        <button type="button" onClick={() => navigate(-1)} style={backButtonStyle}>
          <ArrowLeft size={20} />
        </button>

        <h1 style={titleStyle}>{editing ? "Edit Address" : "Add New Address"}</h1>

        <div style={{ display: "grid", gap: 12 }}>
          <Field label="Name">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name here" style={inputStyle} />
          </Field>
          <Field label="Mobile Number">
            <input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Enter your mobile number here" style={inputStyle} />
          </Field>
          <Field label="Country">
            <select value={country} onChange={(e) => setCountry(e.target.value)} style={inputStyle}>
              <option>India</option>
            </select>
          </Field>
          <Field label="State">
            <select value={state} onChange={(e) => setState(e.target.value)} style={inputStyle}>
              <option>Delhi</option>
              <option>Tamil Nadu</option>
            </select>
          </Field>
          <Field label="City">
            <select value={city} onChange={(e) => setCity(e.target.value)} style={inputStyle}>
              <option>New Delhi</option>
              <option>Chennai</option>
            </select>
          </Field>
          <Field label="Area">
            <input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Enter details here" style={inputStyle} />
          </Field>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 26 }}>
          <button type="button" onClick={handleSave} style={saveButtonStyle}>
            Save
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

const backButtonStyle: CSSProperties = {
  width: 32,
  height: 32,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#2f2f2f",
};

const titleStyle: CSSProperties = {
  margin: "18px 0 16px",
  fontSize: 32,
  fontWeight: 700,
  color: "#2f2f2f",
};

const inputStyle: CSSProperties = {
  width: "100%",
  height: 48,
  borderRadius: 6,
  border: "1px solid #e5e7eb",
  padding: "0 12px",
  fontSize: 14,
  color: "#2f2f2f",
  background: "#fff",
};

const saveButtonStyle: CSSProperties = {
  minWidth: 268,
  padding: "12px 18px",
  background: "#dfa50b",
  color: "#fff",
  fontWeight: 700,
};
