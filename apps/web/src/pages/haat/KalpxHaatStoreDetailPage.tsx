import {
  ArrowLeft,
  Clock3,
  MapPin,
  Phone,
  Search,
  ShoppingCart,
  Star,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { haatServices } from "./haatData";
import { useHaatCatalog, useHaatStoreDetail } from "./haatCatalog";

export function KalpxHaatStoreDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState("");
  const { products } = useHaatCatalog();
  const type = searchParams.get("type") === "service" ? "service" : "product";
  const store = useHaatStoreDetail(id ?? "");
  const filteredProducts = useMemo(
    () =>
      products.filter((item) => {
        const matchesStore = !store.id || item.store.id === store.id;
        const query = searchValue.trim().toLowerCase();
        const matchesSearch =
          !query ||
          item.name.toLowerCase().includes(query) ||
          item.store.store_name.toLowerCase().includes(query);
        return matchesStore && matchesSearch;
      }),
    [products, searchValue, store.id],
  );
  const filteredServices = useMemo(
    () =>
      haatServices.filter((item) => {
        const query = searchValue.trim().toLowerCase();
        return (
          !query ||
          item.name.toLowerCase().includes(query) ||
          item.provider.toLowerCase().includes(query)
        );
      }),
    [searchValue],
  );

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#fff",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "8px 8px 32px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 32,
          }}
        >
          <div>
            <header
              style={{
                position: "relative",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 12px 30px rgba(67, 33, 4, 0.08)",
              }}
            >
              <img
                src={store.image || "/haat-assets/default-store.png"}
                alt={store.store_name}
                style={{
                  width: "100%",
                  height: 400,
                  objectFit: "cover",
                  display: "block",
                }}
              />

              <button
                type="button"
                onClick={() => navigate(-1)}
                style={overlayButtonStyle("left")}
              >
                <ArrowLeft size={18} color="#1f2937" />
              </button>

              <button
                type="button"
                onClick={() => navigate("/en/haat/cart")}
                style={overlayButtonStyle("right")}
              >
                <ShoppingCart size={18} color="#1f2937" />
              </button>

              <div
                style={{
                  position: "absolute",
                  right: 16,
                  bottom: 16,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  borderRadius: 10,
                  background: "#15803d",
                  color: "#fff",
                  padding: "8px 12px",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.16)",
                }}
              >
                <Star size={12} fill="currentColor" strokeWidth={2} />
                <span style={{ fontSize: 16, fontWeight: 700 }}>
                  {String(store.rating)}
                  {String(store.rating).includes("+") ? "" : "+"}
                </span>
              </div>
            </header>

            <section style={{ marginTop: 24 }}>
              <h1
                style={{
                  margin: "0 0 24px",
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#111827",
                }}
              >
                {store.store_name}
              </h1>

              <div style={{ display: "grid", gap: 16 }}>
                <StoreMetaRow
                  icon={<MapPin size={16} color="#6b7280" />}
                  primary={store.location || "New Delhi"}
                />
                <StoreMetaRow
                  icon={<Phone size={16} color="#6b7280" />}
                  primary={store.phoenNumber ? `+91 ${store.phoenNumber}` : "Not available"}
                />
                <StoreMetaRow
                  icon={<Clock3 size={16} color="#6b7280" />}
                  primary="Open"
                  primaryColor="#15803d"
                  secondary={`Mon to Fri - ${store.open} to ${store.close}`}
                />
                <StoreMetaRow
                  icon={<User size={16} color="#6b7280" />}
                  primary="Sandip Mishra"
                  secondary="Owner"
                />
              </div>

              <p
                style={{
                  marginTop: 32,
                  color: "#4b5563",
                  fontSize: 16,
                  lineHeight: 1.75,
                }}
              >
                {store.description}
              </p>
            </section>
          </div>

          <div>
            <h2
              style={{
                margin: "0 0 16px",
                fontSize: 28,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              {type === "product" ? "Product List" : "Service List"}
            </h2>

            <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
              <div style={{ position: "relative" }}>
                <Search
                  size={18}
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: 16,
                    transform: "translateY(-50%)",
                    color: "#9ca3af",
                  }}
                />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search by product, shop or service"
                  style={sidebarInputStyle}
                />
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <select style={filterSelectStyle}>
                  <option>Ratings: All</option>
                  <option>4.0+</option>
                  <option>3.0+</option>
                </select>
                <select style={filterSelectStyle}>
                  <option>Price: All</option>
                  <option>Low to High</option>
                  <option>High to Low</option>
                </select>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gap: 16,
                maxHeight: 800,
                overflowY: "auto",
                paddingRight: 8,
              }}
            >
              {type === "product"
                ? filteredProducts.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        navigate(`/en/haat/product/${item.id}?type=product`)
                      }
                      style={sidebarCardStyle}
                    >
                      <img
                        src={item.images[0]?.url}
                        alt={item.name}
                        style={sidebarImageStyle}
                      />
                      <div style={{ textAlign: "left" }}>
                        <h3 style={sidebarCardTitleStyle}>{item.name}</h3>
                        <div style={ratingRowStyle}>
                          <Star size={12} fill="#eab308" color="#eab308" />
                          <span style={{ color: "#1f2937" }}>
                            {item.rating.toFixed(1)}
                          </span>
                          <span style={reviewTextStyle}>(132 reviews)</span>
                        </div>
                        <span style={offerChipStyle}>62% off</span>
                        <p style={sidebarPriceStyle}>₹{item.price_minor}/-</p>
                        <span style={viewDetailsStyle}>View Details</span>
                      </div>
                    </button>
                  ))
                : filteredServices.map((item) => (
                    <div key={item.id} style={sidebarCardStyle}>
                      <img src={item.image} alt={item.name} style={sidebarImageStyle} />
                      <div style={{ textAlign: "left" }}>
                        <h3 style={sidebarCardTitleStyle}>{item.name}</h3>
                        <div style={ratingRowStyle}>
                          <Star size={12} fill="#eab308" color="#eab308" />
                          <span style={{ color: "#1f2937" }}>4.5</span>
                          <span style={reviewTextStyle}>(132 reviews)</span>
                        </div>
                        <p style={{ margin: "10px 0 0", fontSize: 12, color: "#6b7280" }}>
                          Starting from
                        </p>
                        <p style={sidebarPriceStyle}>{item.price}</p>
                        <span style={viewDetailsStyle}>View Details</span>
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StoreMetaRow({
  icon,
  primary,
  secondary,
  primaryColor,
}: {
  icon: ReactNode;
  primary: string;
  secondary?: string;
  primaryColor?: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
      <div
        style={{
          background: "#f3f4f6",
          padding: 10,
          borderRadius: 10,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ paddingTop: 4 }}>
        <p
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 600,
            color: primaryColor ?? "#374151",
          }}
        >
          {primary}
        </p>
        {secondary ? (
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#6b7280" }}>
            {secondary}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function overlayButtonStyle(side: "left" | "right") {
  return {
    position: "absolute" as const,
    top: 16,
    [side]: 16,
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "rgba(255,255,255,0.8)",
    backdropFilter: "blur(10px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}

const sidebarInputStyle: CSSProperties = {
  width: "100%",
  borderRadius: 14,
  border: "1px solid transparent",
  background: "#f9fafb",
  padding: "14px 16px 14px 46px",
  fontSize: 15,
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  outline: "none",
};

const filterSelectStyle: CSSProperties = {
  background: "#f3f4f6",
  border: "none",
  borderRadius: 10,
  padding: "10px 16px",
  fontSize: 14,
  fontWeight: 600,
  color: "#374151",
};

const sidebarCardStyle: CSSProperties = {
  display: "flex",
  gap: 16,
  width: "100%",
  padding: 12,
  background: "#fff",
  borderRadius: 14,
  boxShadow: "0 8px 24px rgba(67, 33, 4, 0.06)",
  border: "1px solid #f1f5f9",
  cursor: "pointer",
};

const sidebarImageStyle: CSSProperties = {
  width: 128,
  height: 128,
  borderRadius: 12,
  objectFit: "cover",
  flexShrink: 0,
};

const sidebarCardTitleStyle: CSSProperties = {
  margin: "0 0 6px",
  fontSize: 14,
  fontWeight: 700,
  color: "#1f2937",
};

const ratingRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginBottom: 10,
  fontSize: 12,
};

const reviewTextStyle: CSSProperties = {
  fontSize: 10,
  color: "#9ca3af",
  fontWeight: 600,
};

const offerChipStyle: CSSProperties = {
  display: "inline-block",
  background: "#15803d",
  color: "#fff",
  fontSize: 10,
  fontWeight: 700,
  padding: "2px 8px",
  borderRadius: 4,
};

const sidebarPriceStyle: CSSProperties = {
  margin: "10px 0 8px",
  fontSize: 18,
  fontWeight: 700,
  color: "#111827",
};

const viewDetailsStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#d4a017",
};
