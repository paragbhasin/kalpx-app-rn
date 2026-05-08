import { ArrowLeft, Check, Heart, Minus, Plus, Star, Truck, X } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { haatOrders } from "./haatData";
import {
  addProductToCart,
  getCartItemsDetailed,
  getWishlistProducts,
  removeFromCart,
  setCartQuantity,
  toggleWishlist,
  useHaatState,
} from "./haatState";

type Tab = "cart" | "orders" | "wishlist";
type OrderFilter = "all" | "delivered" | "in_progress" | "packaging" | "cancelled";

function getTab(value: string | null): Tab {
  if (value === "orders" || value === "wishlist") return value;
  return "cart";
}

const ORDER_FILTERS: { key: OrderFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "delivered", label: "Delivered" },
  { key: "in_progress", label: "In progress" },
  { key: "packaging", label: "Packaging" },
  { key: "cancelled", label: "Cancelled" },
];

function sameIds(left: number[], right: number[]) {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

export function KalpxHaatCartPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isDesktop =
    typeof window === "undefined" ? true : window.innerWidth >= 1024;
  const tab = getTab(searchParams.get("tab"));
  const [orderFilter, setOrderFilter] = useState<OrderFilter>("all");
  const haatState = useHaatState();

  const cartItems = getCartItemsDetailed(haatState);
  const cartIds = useMemo(() => cartItems.map((item) => item.product.id), [cartItems]);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const previousCartIdsRef = useRef<number[]>([]);
  const wishlistItems = getWishlistProducts(haatState);
  const filteredOrders = useMemo(
    () =>
      orderFilter === "all"
        ? haatOrders
        : haatOrders.filter((item) => item.status === orderFilter),
    [orderFilter],
  );

  useEffect(() => {
    setSelectedProductIds((current) => {
      if (!cartIds.length) return [];
      const previousCartIds = previousCartIdsRef.current;
      const retained = current.filter((id) => cartIds.includes(id));
      const newCartIds = cartIds.filter((id) => !previousCartIds.includes(id));
      const next =
        !previousCartIds.length && !current.length
          ? cartIds
          : [...retained, ...newCartIds.filter((id) => !retained.includes(id))];
      previousCartIdsRef.current = cartIds;
      return sameIds(current, next) ? current : next;
    });
  }, [cartIds]);

  const selectedCartItems = cartItems.filter((item) =>
    selectedProductIds.includes(item.product.id),
  );
  const allSelected = cartItems.length > 0 && selectedCartItems.length === cartItems.length;

  const total = selectedCartItems.reduce(
    (sum, item) => sum + item.product.price_minor * item.quantity,
    0,
  );
  const discount = selectedCartItems.length ? 10 : 0;
  const final = Math.max(total - discount, 0);

  return (
    <main style={{ minHeight: "100dvh", background: "#fff" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "18px 14px 40px" }}>
        <header style={headerStyle}>
          <button type="button" onClick={() => navigate(-1)} style={plainIconButtonStyle}>
            <ArrowLeft size={20} />
          </button>
          <h1 style={headerTitleStyle}>Your Cart</h1>
          <button
            type="button"
            onClick={() => setSearchParams({ tab: "wishlist" })}
            style={wishlistHeaderButtonStyle}
          >
            <Heart size={18} />
          </button>
        </header>

        <div style={tabRowStyle}>
          <TopTab
            active={tab === "cart"}
            label="My Cart"
            onClick={() => setSearchParams({ tab: "cart" })}
          />
          <TopTab
            active={tab === "orders"}
            label="My Orders"
            onClick={() => setSearchParams({ tab: "orders" })}
          />
        </div>

        {tab === "cart" && (
          <div
            style={{
              ...twoColumnLayoutStyle,
              gridTemplateColumns: isDesktop ? "minmax(0, 1.45fr) minmax(300px, 1fr)" : "1fr",
              gap: isDesktop ? 18 : 14,
            }}
          >
            <div>
              {cartItems.length ? (
                <>
                  <div
                    style={{
                      ...selectionBarStyle,
                      flexWrap: isDesktop ? "nowrap" : "wrap",
                      alignItems: isDesktop ? "center" : "flex-start",
                    }}
                  >
                    <label
                      style={{
                        ...selectionToggleStyle,
                        width: isDesktop ? "auto" : "100%",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={(event) =>
                          setSelectedProductIds(
                            event.target.checked ? cartItems.map((item) => item.product.id) : [],
                          )
                        }
                        style={nativeCheckboxStyle}
                      />
                      <span style={selectionLabelStyle}>
                        {allSelected ? "Unselect all" : "Select all"}
                      </span>
                    </label>
                    <span
                      style={{
                        ...selectionCountStyle,
                        width: isDesktop ? "auto" : "100%",
                        paddingLeft: isDesktop ? 0 : 28,
                      }}
                    >
                      {selectedCartItems.length} of {cartItems.length} selected
                    </span>
                  </div>

                  <div style={{ display: "grid", gap: 18 }}>
                    {cartItems.map(({ product, quantity }) => (
                      <article
                        key={product.id}
                        style={{
                          ...cartCardStyle,
                          flexDirection: isDesktop ? "row" : "column",
                          gap: isDesktop ? 18 : 14,
                          position: "relative",
                          paddingLeft: isDesktop ? 14 : 46,
                        }}
                      >
                        <label
                          style={{
                            ...checkboxWrapperStyle,
                            position: isDesktop ? "static" : "absolute",
                            top: isDesktop ? undefined : 14,
                            left: isDesktop ? undefined : 14,
                            marginTop: 0,
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedProductIds.includes(product.id)}
                            onChange={() =>
                              setSelectedProductIds((current) =>
                                current.includes(product.id)
                                  ? current.filter((id) => id !== product.id)
                                  : [...current, product.id],
                              )
                            }
                            aria-label={
                              selectedProductIds.includes(product.id)
                                ? `Unselect ${product.name}`
                                : `Select ${product.name}`
                            }
                            style={nativeCheckboxStyle}
                          />
                        </label>
                        <img
                          src={product.images[0]?.url}
                          alt={product.name}
                          style={{
                            ...cartImageStyle,
                            width: isDesktop ? 240 : "100%",
                            height: isDesktop ? 146 : 180,
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={cartCardTopRowStyle}>
                            <div>
                              <h3 style={productTitleStyle}>{product.name}</h3>
                              <p style={sellerTextStyle}>Sold by {product.store.store_name}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFromCart(product.id)}
                              style={ghostIconButtonStyle}
                            >
                              <X size={16} />
                            </button>
                          </div>

                          <div style={qtyRowStyle}>
                            <button
                              type="button"
                              onClick={() => setCartQuantity(product.id, quantity - 1)}
                              style={qtyButtonStyle}
                            >
                              <Minus size={12} />
                            </button>
                            <span style={qtyValueStyle}>{String(quantity).padStart(2, "0")}</span>
                            <button
                              type="button"
                              onClick={() => setCartQuantity(product.id, quantity + 1)}
                              style={qtyButtonStyle}
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <div style={{ marginTop: 10 }}>
                            <span style={discountPillStyle}>62% off</span>
                          </div>
                          <p style={priceTextStyle}>₹{product.price_minor}/-</p>
                          <p style={returnTextStyle}>
                            <Check size={14} color="#22c55e" />
                            7 Day return Available
                          </p>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div style={buyBarStyle}>
                    <button
                      type="button"
                      onClick={() => navigate("/en/haat/payment")}
                      style={{
                        ...primaryCtaStyle,
                        width: isDesktop ? "auto" : "100%",
                        minWidth: isDesktop ? 340 : 0,
                        opacity: selectedCartItems.length ? 1 : 0.55,
                        cursor: selectedCartItems.length ? "pointer" : "not-allowed",
                      }}
                      disabled={!selectedCartItems.length}
                    >
                      Buy Now
                    </button>
                  </div>
                </>
              ) : (
                <EmptyCard
                  title="Your cart is empty"
                  description="Add products from KalpX Haat to continue."
                  ctaLabel="Browse Products"
                  onClick={() => navigate("/en/haat")}
                />
              )}
            </div>

            <aside
              style={{
                display: "grid",
                gap: 18,
                order: isDesktop ? 0 : -1,
              }}
            >
              <div>
                <div style={sideSectionHeaderStyle}>
                  <h2 style={sideSectionTitleStyle}>Coupon & bank offer</h2>
                  <button type="button" style={sideLinkStyle}>
                    View all
                  </button>
                </div>
                <div style={couponCardStyle}>
                  <div style={couponTopRowStyle}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={couponBadgeStyle}>%</div>
                      <div>
                        <p style={couponTitleStyle}>Extra 91.65 off</p>
                        <p style={couponSubTextStyle}>On minimum spend of 100. T & C</p>
                      </div>
                    </div>
                    <span style={appliedTextStyle}>Applied</span>
                  </div>
                </div>
              </div>

              <div>
                <h2 style={sideSectionTitleStyle}>Price Details</h2>
                <div style={priceBoxStyle}>
                  <PriceRow label="Total Price" value={`₹${total}/-`} />
                  <PriceRow label="Discount" value={`-₹${discount}/-`} />
                  <div style={dividerStyle} />
                  <PriceRow label="Total Amount" value={`₹${final}/-`} strong />
                </div>
              </div>
            </aside>
          </div>
        )}

        {tab === "orders" && (
          <div>
            <div style={filterChipRowStyle}>
              {ORDER_FILTERS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setOrderFilter(item.key)}
                  style={{
                    ...filterChipStyle,
                    background: orderFilter === item.key ? "#e5e7eb" : "#f9fafb",
                  }}
                >
                  {item.label}
                  {item.key === "all" ? <span style={{ marginLeft: 6 }}>×</span> : null}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gap: 28, marginTop: 18 }}>
              {filteredOrders.map((order) => (
                <article key={order.id} style={orderCardStyle}>
                  <div
                    style={{
                      ...orderBannerStyle,
                      color: order.status === "delivered" ? "#2f8b37" : "#2656ff",
                    }}
                  >
                    {order.status === "delivered" ? (
                      <Check size={18} color="#2f8b37" />
                    ) : (
                      <Truck size={18} color="#2656ff" />
                    )}
                    {order.status === "delivered" ? "Order Delivered" : "Inprogress"}
                  </div>

                  <div style={orderBodyStyle}>
                    <img src={order.image} alt={order.title} style={orderImageStyle} />
                    <div style={{ flex: 1 }}>
                      <h3 style={orderTitleStyle}>{order.title}</h3>
                      <p style={sellerTextStyle}>Sold by {order.seller}</p>
                      {order.quantity ? (
                        <p style={orderMetaStyle}>Qnt: {order.quantity}</p>
                      ) : null}
                      {order.bookingDate ? (
                        <p style={orderMetaStyle}>Date of Booking : {order.bookingDate}</p>
                      ) : null}
                      {order.slot ? <p style={orderMetaStyle}>Time Slot: {order.slot}</p> : null}
                      <p style={orderPriceStyle}>{order.priceLabel}</p>
                    </div>
                    <div style={orderActionsStyle}>
                      {order.status === "delivered" ? (
                        <>
                          <button type="button" style={reviewButtonStyle}>
                            <span style={{ color: "#d1d5db", display: "inline-flex", gap: 3 }}>
                              {Array.from({ length: 5 }).map((_, index) => (
                                <Star key={index} size={12} />
                              ))}
                            </span>
                            Write Review
                          </button>
                          <button type="button" style={outlineGoldButtonStyle}>
                            Rebook
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" style={outlineGoldButtonStyle}>
                            Reschedule
                          </button>
                          <button type="button" style={outlineNeutralButtonStyle}>
                            Cancel Booking
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {tab === "wishlist" && (
          <div style={{ marginTop: 24 }}>
            {wishlistItems.length ? (
              <div style={wishlistGridStyle}>
                {wishlistItems.map((product) => (
                  <article key={product.id} style={wishlistCardStyle}>
                    <img src={product.images[0]?.url} alt={product.name} style={wishlistImageStyle} />
                    <div style={{ padding: 16 }}>
                      <div style={wishlistTitleRowStyle}>
                        <div>
                          <h3 style={productTitleStyle}>{product.name}</h3>
                          <p style={sellerTextStyle}>Sold by {product.store.store_name}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleWishlist(product.id)}
                          style={ghostIconButtonStyle}
                        >
                          <Heart size={16} fill="currentColor" color="#e11d48" />
                        </button>
                      </div>
                      <p style={priceTextStyle}>₹{product.price_minor}/-</p>
                      <div style={{ display: "flex", gap: 12 }}>
                        <button
                          type="button"
                          onClick={() => {
                            addProductToCart(product.id);
                            setSearchParams({ tab: "cart" });
                          }}
                          style={primarySmallButtonStyle}
                        >
                          Add to Cart
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/en/haat/product/${product.id}?type=product`)}
                          style={secondarySmallButtonStyle}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyCard
                title="Your wishlist is empty"
                description="Tap the heart on products to save them here."
                ctaLabel="Explore Products"
                onClick={() => navigate("/en/haat")}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function TopTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "14px 16px",
        borderBottom: active ? "2px solid #e0aa10" : "2px solid transparent",
        color: active ? "#d49c07" : "#4b5563",
        fontWeight: 600,
        fontSize: 15,
      }}
    >
      {label}
    </button>
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
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
      <span style={{ fontSize: 14, fontWeight: strong ? 700 : 400, color: "#2f2f2f" }}>
        {label}
      </span>
      <span style={{ fontSize: 14, fontWeight: 700, color: "#2f2f2f" }}>{value}</span>
    </div>
  );
}

function EmptyCard({
  title,
  description,
  ctaLabel,
  onClick,
}: {
  title: string;
  description: string;
  ctaLabel: string;
  onClick: () => void;
}) {
  return (
    <div style={emptyCardStyle}>
      <h2 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 700 }}>{title}</h2>
      <p style={{ margin: "0 0 20px", color: "#6b7280", lineHeight: 1.6 }}>{description}</p>
      <button type="button" onClick={onClick} style={primaryCtaStyle}>
        {ctaLabel}
      </button>
    </div>
  );
}

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 14,
};

const headerTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 24,
  fontWeight: 700,
  color: "#2f2f2f",
};

const plainIconButtonStyle: CSSProperties = {
  width: 34,
  height: 34,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#2f2f2f",
};

const wishlistHeaderButtonStyle: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 10,
  background: "#FBF6E9",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#4b5563",
};

const tabRowStyle: CSSProperties = {
  display: "flex",
  gap: 18,
  borderBottom: "1px solid #e5e7eb",
  marginBottom: 20,
};

const twoColumnLayoutStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.45fr) minmax(300px, 1fr)",
  gap: 18,
  alignItems: "start",
};

const cartCardStyle: CSSProperties = {
  display: "flex",
  gap: 18,
  border: "1px solid #ececec",
  borderRadius: 12,
  padding: 14,
  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
};

const selectionBarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 14,
};

const selectionToggleStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  color: "#2f2f2f",
  fontSize: 14,
  fontWeight: 600,
};

const selectionLabelStyle: CSSProperties = {
  userSelect: "none",
};

const selectionCountStyle: CSSProperties = {
  color: "#6b7280",
  fontSize: 13,
  fontWeight: 500,
};

const checkboxWrapperStyle: CSSProperties = {
  width: 24,
  height: 24,
  marginTop: 4,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const nativeCheckboxStyle: CSSProperties = {
  width: 18,
  height: 18,
  accentColor: "#3b3b3b",
  cursor: "pointer",
};

const cartImageStyle: CSSProperties = {
  width: 240,
  height: 146,
  borderRadius: 10,
  objectFit: "cover",
  flexShrink: 0,
};

const cartCardTopRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
};

const productTitleStyle: CSSProperties = {
  margin: "0 0 4px",
  fontSize: 18,
  fontWeight: 700,
  color: "#2f2f2f",
};

const sellerTextStyle: CSSProperties = {
  margin: 0,
  fontSize: 12,
  color: "#6b7280",
};

const ghostIconButtonStyle: CSSProperties = {
  color: "#6b7280",
  width: 24,
  height: 24,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const qtyRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginTop: 12,
};

const qtyButtonStyle: CSSProperties = {
  width: 22,
  height: 22,
  borderRadius: 2,
  background: "#efefef",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#444",
};

const qtyValueStyle: CSSProperties = {
  minWidth: 24,
  textAlign: "center",
  fontSize: 16,
  color: "#2f2f2f",
};

const discountPillStyle: CSSProperties = {
  display: "inline-block",
  background: "#3e8a39",
  color: "#fff",
  borderRadius: 4,
  padding: "4px 8px",
  fontSize: 12,
  fontWeight: 700,
};

const priceTextStyle: CSSProperties = {
  margin: "10px 0 6px",
  fontSize: 18,
  fontWeight: 800,
  color: "#2f2f2f",
};

const returnTextStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  margin: 0,
  fontSize: 14,
  color: "#6b7280",
};

const buyBarStyle: CSSProperties = {
  marginTop: 16,
  borderRadius: 14,
  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  border: "1px solid #f1f1f1",
  padding: "18px 16px",
  display: "flex",
  justifyContent: "center",
};

const primaryCtaStyle: CSSProperties = {
  minWidth: 340,
  padding: "14px 24px",
  borderRadius: 2,
  background: "#dfa50b",
  color: "#fff",
  fontWeight: 700,
  fontSize: 16,
  opacity: 1,
};

const sideSectionHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 12,
};

const sideSectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
  color: "#2f2f2f",
};

const sideLinkStyle: CSSProperties = {
  color: "#6b7280",
  fontSize: 14,
};

const couponCardStyle: CSSProperties = {
  border: "1px solid #dddddd",
  borderRadius: 8,
  padding: 16,
  background: "#fafafa",
};

const couponTopRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
};

const couponBadgeStyle: CSSProperties = {
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
  fontSize: 15,
  fontWeight: 700,
  color: "#2f2f2f",
};

const couponSubTextStyle: CSSProperties = {
  margin: "6px 0 0",
  fontSize: 13,
  color: "#6b7280",
};

const appliedTextStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: 14,
  fontWeight: 700,
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
  margin: "8px 0 12px",
};

const filterChipRowStyle: CSSProperties = {
  display: "flex",
  gap: 18,
  flexWrap: "wrap",
};

const filterChipStyle: CSSProperties = {
  padding: "12px 12px",
  borderRadius: 6,
  color: "#2f2f2f",
  fontSize: 14,
};

const orderCardStyle: CSSProperties = {
  border: "1px solid #ececec",
  borderRadius: 12,
  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  overflow: "hidden",
};

const orderBannerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 14px",
  background: "#f9fafb",
  fontSize: 15,
  fontWeight: 600,
};

const orderBodyStyle: CSSProperties = {
  display: "flex",
  gap: 18,
  padding: 14,
  alignItems: "flex-start",
};

const orderImageStyle: CSSProperties = {
  width: 232,
  height: 132,
  borderRadius: 8,
  objectFit: "cover",
  flexShrink: 0,
};

const orderTitleStyle: CSSProperties = {
  margin: "0 0 6px",
  fontSize: 17,
  fontWeight: 700,
  color: "#2f2f2f",
};

const orderMetaStyle: CSSProperties = {
  margin: "4px 0 0",
  color: "#6b7280",
  fontSize: 14,
};

const orderPriceStyle: CSSProperties = {
  margin: "10px 0 0",
  fontSize: 18,
  fontWeight: 800,
  color: "#2f2f2f",
};

const orderActionsStyle: CSSProperties = {
  display: "flex",
  gap: 14,
  marginLeft: "auto",
  alignItems: "flex-start",
};

const reviewButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  padding: "10px 16px",
  color: "#d49c07",
  fontWeight: 600,
};

const outlineGoldButtonStyle: CSSProperties = {
  border: "1px solid #dfa50b",
  color: "#dfa50b",
  borderRadius: 8,
  padding: "10px 20px",
  fontWeight: 600,
  background: "#fff",
};

const outlineNeutralButtonStyle: CSSProperties = {
  border: "1px solid #d1d5db",
  color: "#2f2f2f",
  borderRadius: 8,
  padding: "10px 20px",
  fontWeight: 500,
  background: "#fff",
};

const wishlistGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 18,
};

const wishlistCardStyle: CSSProperties = {
  border: "1px solid #ececec",
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
};

const wishlistImageStyle: CSSProperties = {
  width: "100%",
  height: 180,
  objectFit: "cover",
  display: "block",
};

const wishlistTitleRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
};

const primarySmallButtonStyle: CSSProperties = {
  flex: 1,
  borderRadius: 8,
  padding: "10px 12px",
  background: "#dfa50b",
  color: "#fff",
  fontWeight: 700,
};

const secondarySmallButtonStyle: CSSProperties = {
  flex: 1,
  borderRadius: 8,
  padding: "10px 12px",
  border: "1px solid #dfa50b",
  color: "#dfa50b",
  fontWeight: 700,
  background: "#fff",
};

const emptyCardStyle: CSSProperties = {
  border: "1px solid #ececec",
  borderRadius: 16,
  padding: 28,
  textAlign: "center",
};
