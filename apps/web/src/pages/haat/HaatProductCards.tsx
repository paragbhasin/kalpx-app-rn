import { Check, Heart, Minus, Plus, Star, Store, X } from "lucide-react";
import type { CSSProperties } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { HaatProduct } from "./haatData";
import {
  isWishlisted,
  removeFromCart,
  setCartQuantity,
  toggleWishlist,
  useHaatState,
} from "./haatState";

export function HaatProductGrid({
  products,
  fromCart = false,
  fromOrder = false,
  isSidebar = false,
  onAddToCart,
}: {
  products: HaatProduct[];
  fromCart?: boolean;
  fromOrder?: boolean;
  isSidebar?: boolean;
  onAddToCart?: (name: string, productId: number) => void;
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const haatState = useHaatState();
  const type = searchParams.get("type") === "service" ? "service" : "product";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          !fromOrder && !isSidebar
            ? "repeat(auto-fit, minmax(300px, 1fr))"
            : "1fr",
        gap: fromOrder ? 24 : 16,
      }}
    >
      {products.map((item, index) => (
        <HaatSingleProductCard
          key={item.id}
          index={index}
          product={item}
          fromCart={fromCart}
          fromOrder={fromOrder}
          isWishlisted={isWishlisted(haatState, item.id)}
          onAddToCart={onAddToCart}
          onOpenDetails={() =>
            navigate(`/en/haat/product/${item.id}?type=${type}`)
          }
        />
      ))}
    </div>
  );
}

function HaatSingleProductCard({
  product,
  index,
  fromCart,
  fromOrder,
  isWishlisted,
  onAddToCart,
  onOpenDetails,
}: {
  product: HaatProduct;
  index: number;
  fromCart: boolean;
  fromOrder: boolean;
  isWishlisted: boolean;
  onAddToCart?: (name: string, productId: number) => void;
  onOpenDetails: () => void;
}) {
  const haatState = useHaatState();
  const cartEntry = haatState.cart.find((item) => item.productId === product.id);
  const itemQuantity = cartEntry?.quantity ?? 1;

  return (
    <article
      onClick={() => !fromCart && onOpenDetails()}
      style={{
        ...productCardStyle,
        cursor: !fromCart ? "pointer" : "default",
        padding: fromOrder ? 0 : 12,
      }}
    >
      {fromOrder ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 24px",
            background: index === 0 ? "#F2FAF3" : "#F0F4FE",
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: index === 0 ? "#16a34a" : "#2563eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            {index === 0 ? <Check size={12} /> : <Store size={12} />}
          </div>
          <span
            style={{
              fontSize: 14,
              fontWeight: 900,
              color: index === 0 ? "#15803d" : "#1d4ed8",
            }}
          >
            {index === 0 ? "Order Delivered" : "Inprogress"}
          </span>
        </div>
      ) : null}

      <div
        style={{
          display: "flex",
          gap: fromOrder ? 32 : 16,
          padding: fromOrder ? 24 : 0,
        }}
      >
        <div
          onClick={(event) => {
            event.stopPropagation();
            if (fromCart) onOpenDetails();
          }}
          style={{
            width: fromOrder ? 192 : 128,
            height: 128,
            borderRadius: fromOrder ? 16 : 12,
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <img
            src={product.images[0]?.url}
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>

        <div
          style={{
            flex: 1,
            paddingTop: 4,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: fromOrder ? 20 : 14,
                fontWeight: fromOrder ? 900 : 700,
                color: "#1f2937",
              }}
            >
              {product.name}
            </h3>
            {fromCart && !fromOrder ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  removeFromCart(product.id);
                }}
                aria-label="Remove item"
                style={{ color: "#374151" }}
              >
                <X size={14} />
              </button>
            ) : null}
          </div>

          {fromCart ? (
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 12,
                color: "#6b7280",
              }}
            >
              By {product.store.store_name}
            </p>
          ) : null}

          {fromOrder ? (
            <div
              style={{
                marginTop: 4,
                fontSize: 12,
                color: "#6b7280",
                fontWeight: 700,
              }}
            >
              Quantity: 2
            </div>
          ) : null}

          {fromCart && !fromOrder ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: 8,
                marginBottom: 8,
              }}
            >
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setCartQuantity(product.id, itemQuantity - 1);
                }}
                style={qtyButtonStyle}
              >
                <Minus size={12} />
              </button>
              <span style={{ padding: "0 12px", fontSize: 14 }}>{itemQuantity}</span>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setCartQuantity(product.id, itemQuantity + 1);
                }}
                style={qtyButtonStyle}
              >
                <Plus size={12} />
              </button>
            </div>
          ) : null}

          {!fromCart ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginTop: 8,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  color: "#eab308",
                  fontSize: 12,
                }}
              >
                <Star size={12} fill="currentColor" strokeWidth={2} />
                <span style={{ color: "#1f2937" }}>4.5</span>
              </div>
              <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 600 }}>
                (132 reviews)
              </span>
            </div>
          ) : null}

          {!fromOrder ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <span
                style={{
                  background: "#15803d",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 4,
                }}
              >
                62% off
              </span>
            </div>
          ) : null}

          <p
            style={{
              margin: "0 0 8px",
              fontSize: fromOrder ? 24 : 18,
              fontWeight: fromOrder ? 900 : 700,
              color: "#111827",
            }}
          >
            ₹{product.price_minor}/-
          </p>

          {!fromCart ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpenDetails();
                }}
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#d4a017",
                }}
              >
                View Details
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleWishlist(product.id);
                }}
                aria-label="Toggle wishlist"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  background: isWishlisted ? "#fff1f2" : "#f9fafb",
                  color: isWishlisted ? "#e11d48" : "#6b7280",
                }}
              >
                <Heart
                  size={16}
                  fill={isWishlisted ? "currentColor" : "none"}
                  strokeWidth={2}
                />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onAddToCart?.(product.name, product.id);
                }}
                style={miniAddButtonStyle}
              >
                Add
              </button>
            </div>
          ) : null}

          {fromCart && !fromOrder ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: "#111827",
              }}
            >
              <Check size={14} color="#16a34a" />
              7 days return available
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

const productCardStyle: CSSProperties = {
  overflow: "hidden",
  borderRadius: 22,
  background: "#fff",
  border: "1px solid rgba(237, 222, 180, 0.9)",
  boxShadow: "0 16px 40px rgba(67, 33, 4, 0.06)",
};

const miniAddButtonStyle: CSSProperties = {
  padding: "5px 10px",
  borderRadius: 10,
  background: "#d4a017",
  color: "#ffff",
  fontSize: 12,
  fontWeight: 700,
};

const qtyButtonStyle: CSSProperties = {
  background: "#e5e7eb",
  width: 28,
  height: 28,
  borderRadius: 6,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};
