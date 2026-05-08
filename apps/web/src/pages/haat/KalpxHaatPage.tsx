import {
  Heart,
  Check,
  Clock3,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Star,
  Store,
  X,
  Wrench,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  haatProducts,
  haatServices,
  trustedProductStores,
  trustedServiceStores,
  type HaatProduct,
  type HaatService,
  type HaatStore,
} from "./haatData";
import {
  addProductToCart,
  getCartCount,
  isWishlisted,
  removeFromCart,
  setCartQuantity,
  toggleWishlist,
  useHaatState,
} from "./haatState";
import { useAppDispatch } from "../../store/hooks";
import { showSnackBar } from "../../store/snackBarSlice";

type HaatTab = "product" | "service";

type CategoryItem = {
  name: string;
  image: string;
};

const productCategories: CategoryItem[] = [
  { name: "Pooja Item", image: "/haat-assets/image-227.png" },
  { name: "Oil & Essential", image: "/haat-assets/image-228.png" },
  { name: "Diyas", image: "/haat-assets/image-229.png" },
  { name: "Pooja Kit", image: "/haat-assets/image-230.png" },
];

const serviceCategories: CategoryItem[] = [
  { name: "Pandit Booking", image: "/haat-assets/image-221.png" },
  { name: "Festival Decoration", image: "/haat-assets/image-224.png" },
  { name: "Temple Offering", image: "/haat-assets/image-225.png" },
];

function getTabFromQuery(value: string | null): HaatTab {
  return value === "service" ? "service" : "product";
}

export function KalpxHaatPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState("");
  const haatState = useHaatState();
  const activeType = getTabFromQuery(searchParams.get("type"));
  const cartCount = getCartCount(haatState);

  const heroBackground = useMemo<CSSProperties>(
    () => ({
      background:
        "radial-gradient(circle at top left, rgba(255,233,184,0.72), transparent 38%), linear-gradient(180deg, #f8ece2 0%, #fdf8f2 100%)",
      borderBottom: "1px solid rgba(212, 160, 23, 0.12)",
    }),
    [],
  );

  function switchTab(type: HaatTab) {
    setSearchParams({ type });
  }

  function goToCart() {
    navigate("/en/haat/cart");
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "#fff",
        paddingBottom: 40,
      }}
    >
      <section style={heroBackground}>
        <div
          style={{
            maxWidth: 1120,
            margin: "0 auto",
            padding: "12px 8px 20px",
          }}
        >
          <div
            className="kalpx-mobile-only"
            style={{
              flexDirection: "column",
              gap: 0,
            }}
          >
            <LandingHeaderRow onCartClick={goToCart} cartCount={cartCount} />
            <SearchControls
              value={searchValue}
              onChange={setSearchValue}
              compact
            />
            <TypeSwitcher activeType={activeType} onChange={switchTab} />
          </div>

          <div
            className="kalpx-desktop-only"
            style={{
              flexDirection: "column",
              padding: "12px 16px 18px",
            }}
          >
            <div
              style={{
                maxWidth: 760,
                margin: "20px auto 0",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <h1
                  style={{
                    margin: 0,
                    whiteSpace: "nowrap",
                    fontSize: 34,
                    fontWeight: 700,
                    lineHeight: 1.1,
                    color: "#2f261d",
                    fontFamily: "var(--kalpx-font-serif)",
                  }}
                >
                  KalpX Haat
                </h1>
                <div style={{ flex: 1 }}>
                  <SearchControls
                    value={searchValue}
                    onChange={setSearchValue}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={goToCart}
                style={{
                  position: "absolute",
                  top: 4,
                  right: -76,
                }}
                aria-label="Open cart"
              >
                <CartButton count={cartCount} />
              </button>
            </div>
            <div
              style={{
                maxWidth: 540,
                width: "100%",
                margin: "40px auto 0",
              }}
            >
              <TypeSwitcher activeType={activeType} onChange={switchTab} />
            </div>
          </div>
        </div>
      </section>

      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
        }}
      >
        {activeType === "product" ? (
          <SelectProductView onAddToCart={(name) => dispatch(showSnackBar(`${name} added to cart`))} />
        ) : (
          <SelectServiceView />
        )}
      </div>
    </div>
  );
}

function LandingHeaderRow({
  onCartClick,
  cartCount,
}: {
  onCartClick: () => void;
  cartCount: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: 30,
          fontWeight: 700,
          lineHeight: 1.1,
          color: "#2f261d",
          fontFamily: "var(--kalpx-font-serif)",
        }}
      >
        KalpX Haat
      </h1>
      <button type="button" onClick={onCartClick} aria-label="Open cart">
        <CartButton count={cartCount} />
      </button>
    </div>
  );
}

function SearchControls({
  value,
  onChange,
  compact = false,
}: {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        marginBottom: compact ? 12 : 0,
      }}
    >
      <div style={{ position: "relative", flex: 1 }}>
        <Search
          size={18}
          strokeWidth={2}
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9a948c",
          }}
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search by product, shop or service"
          style={{
            width: "100%",
            borderRadius: 14,
            border: "1px solid transparent",
            background: "#f9f7f4",
            padding: "14px 16px 14px 46px",
            fontSize: 12,
            color: "#4a4037",
            outline: "none",
            transition: "all 0.2s ease",
          }}
        />
      </div>
      <button
        type="button"
        aria-label="Open filters"
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: "#f9f7f4",
          border: "1px solid #f0e6d6",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#5c5348",
          flexShrink: 0,
        }}
      >
        <SlidersHorizontal size={18} strokeWidth={2} />
      </button>
    </div>
  );
}

function TypeSwitcher({
  activeType,
  onChange,
}: {
  activeType: HaatTab;
  onChange: (type: HaatTab) => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 8,
        padding: 4,
        background: "rgba(255,255,255,0.45)",
        borderRadius: 14,
      }}
    >
      <TabButton
        active={activeType === "product"}
        label="Product"
        icon={<Package size={18} strokeWidth={2} />}
        onClick={() => onChange("product")}
      />
      <TabButton
        active={activeType === "service"}
        label="Service"
        icon={<Wrench size={18} strokeWidth={2} />}
        onClick={() => onChange("service")}
      />
    </div>
  );
}

function TabButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "14px 12px",
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 700,
        color: active ? "#2f261d" : "#7b6b57",
        background: active ? "#fff" : "transparent",
        boxShadow: active ? "0 8px 24px rgba(67, 33, 4, 0.08)" : "none",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function SelectProductView({
  onAddToCart,
}: {
  onAddToCart: (name: string) => void;
}) {
  return (
    <main>
      <CategorySection title="Categories" categories={productCategories} />
      <TrustedStores title="Trusted store near you" trustedStores={trustedProductStores} />
      <ProductSection
        title="New Arrivals on Kalpx Haat"
        items={haatProducts}
        onAddToCart={onAddToCart}
      />
      <ProductSection title="Top product near you" items={haatProducts} onAddToCart={onAddToCart} />
    </main>
  );
}

function SelectServiceView() {
  return (
    <main>
      <CategorySection title="Categories" categories={serviceCategories} />
      <TrustedStores
        title="Kalpx Trusted Service Provider"
        trustedStores={trustedServiceStores}
      />
      <ServiceSection title="Our Popular Service" items={haatServices} />
      <ServiceSection title="What's New" items={haatServices} />
    </main>
  );
}

function CategorySection({
  title,
  categories,
}: {
  title: string;
  categories: CategoryItem[];
}) {
  return (
    <section style={sectionStyle(0.1)}>
      <SectionHeader title={title} />
      <div style={scrollRowStyle}>
        {categories.map((category) => (
          <div
            key={`${title}-${category.name}`}
            style={{
              flex: "0 0 auto",
              width: "clamp(80px, 18vw, 160px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: "clamp(80px, 18vw, 160px)",
                height: "clamp(80px, 18vw, 160px)",
                borderRadius: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fff9eb",
                border: "1px solid rgba(255, 228, 176, 0.72)",
                overflow: "hidden",
              }}
            >
              <img
                src={category.image}
                alt={category.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#51463d",
                textAlign: "center",
                lineHeight: 1.25,
              }}
            >
              {category.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function TrustedStores({
  title,
  trustedStores,
}: {
  title: string;
  trustedStores: HaatStore[];
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") === "service" ? "service" : "product";

  return (
    <section style={sectionStyle(0.2)}>
      <SectionHeader title={title} />
      <div style={scrollRowStyle}>
        {trustedStores.map((store) => (
          <article
            key={store.id}
            onClick={() => navigate(`/en/haat/store/${store.id}?type=${type}`)}
            style={{
              ...trustedStoreCardStyle,
              cursor: "pointer",
            }}
          >
            <div style={{ position: "relative" }}>
              <img
                src="/haat-assets/default-store.png"
                alt={store.store_name}
                style={{
                  width: "100%",
                  height: 128,
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 12,
                  left: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  borderRadius: 6,
                  background: "#15803d",
                  color: "#fff",
                  padding: "3px 6px",
                  fontSize: 10,
                  fontWeight: 700,
                }}
              >
                <Star size={10} fill="currentColor" strokeWidth={2} />
                {store.rating}
              </div>
            </div>
            <div style={{ padding: 16 }}>
              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: 16,
                  fontWeight: 700,
                  lineHeight: 1.25,
                  color: "#2d261f",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {store.store_name}
              </h3>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11,
                  color: "#73675d",
                }}
              >
                <Clock3 size={12} />
                <span>{store.time}</span>
                <span style={{ color: "#16a34a", fontWeight: 700 }}>• Open</span>
              </div>
              <p style={{ margin: "6px 0 0", fontSize: 11, color: "#9ca3af" }}>
                {store.distance}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProductSection({
  title,
  items,
  onAddToCart,
}: {
  title: string;
  items: HaatProduct[];
  onAddToCart: (name: string) => void;
}) {
  const navigate = useNavigate();

  return (
    <section style={sectionStyle(0.3)}>
      <SectionHeader
        title={title}
        actionLabel="View all"
        onAction={() => navigate("/en/haat/browse?type=product")}
      />
      <ProductCard products={items} onAddToCart={onAddToCart} />
    </section>
  );
}

function ServiceSection({
  title,
  items,
}: {
  title: string;
  items: HaatService[];
}) {
  const navigate = useNavigate();

  return (
    <section style={sectionStyle(0.4)}>
      <SectionHeader
        title={title}
        actionLabel="View all"
        onAction={() => navigate("/en/haat/browse?type=service")}
      />
      <div style={cardGridStyle}>
        {items.map((item) => (
          <article key={item.id} style={productCardStyle}>
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: "100%",
                height: 190,
                objectFit: "cover",
                display: "block",
              }}
            />
            <div style={{ padding: 16 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 8,
                  padding: "5px 10px",
                  borderRadius: 999,
                  background: "#fff6de",
                  color: "#8d6517",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <Store size={12} strokeWidth={2} />
                {item.provider}
              </div>
              <h3
                style={{
                  margin: "0 0 10px",
                  fontSize: 17,
                  fontWeight: 700,
                  lineHeight: 1.3,
                  color: "#2d261f",
                }}
              >
                {item.name}
              </h3>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#3f2b12",
                  }}
                >
                  {item.price}
                </span>
                <button
                  type="button"
                  style={actionButtonStyle}
                >
                  Book
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 16,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: 20,
          fontWeight: 700,
          color: "#2f261d",
        }}
      >
        {title}
      </h2>
      {actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#d4a017",
          }}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

function ProductCard({
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
  onAddToCart?: (name: string) => void;
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
        <SingleProductCard
          key={item.id}
          index={index}
          product={item}
          fromCart={fromCart}
          fromOrder={fromOrder}
          isWishlisted={isWishlisted(haatState, item.id)}
          onAddToCart={onAddToCart}
          onOpenDetails={() => navigate(`/en/haat/product/${item.id}?type=${type}`)}
        />
      ))}
    </div>
  );
}

function SingleProductCard({
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
  onAddToCart?: (name: string) => void;
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
                  addProductToCart(product.id);
                  onAddToCart?.(product.name);
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

function CartButton({ count }: { count: number }) {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        width: 42,
        height: 42,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 14,
        background: "rgba(255,255,255,0.78)",
        border: "1px solid rgba(212,160,23,0.18)",
        boxShadow: "0 8px 24px rgba(67, 33, 4, 0.08)",
        color: "#453425",
      }}
    >
      <ShoppingCart size={20} strokeWidth={2} />
      <span
        style={{
          position: "absolute",
          top: -3,
          right: -3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "#d4a017",
          color: "#fff",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 700,
        }}
      >
        {count}
      </span>
    </span>
  );
}

const scrollRowStyle: CSSProperties = {
  display: "flex",
  gap: 16,
  overflowX: "auto",
  paddingBottom: 4,
  scrollbarWidth: "none",
  msOverflowStyle: "none",
};

const cardGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 18,
};

const trustedStoreCardStyle: CSSProperties = {
  flex: "0 0 auto",
  width: 240,
  overflow: "hidden",
  borderRadius: 16,
  background: "#fff",
  border: "1px solid #f3f4f6",
  boxShadow: "0 8px 24px rgba(67, 33, 4, 0.06)",
};

const productCardStyle: CSSProperties = {
  overflow: "hidden",
  borderRadius: 22,
  background: "#fff",
  border: "1px solid rgba(237, 222, 180, 0.9)",
  boxShadow: "0 16px 40px rgba(67, 33, 4, 0.06)",
};

const actionButtonStyle: CSSProperties = {
  padding: "10px 16px",
  borderRadius: 999,
  background: "linear-gradient(135deg, #d8a93f, #bf8720)",
  color: "#fff",
  fontSize: 13,
  fontWeight: 700,
};

const miniAddButtonStyle: CSSProperties = {
  padding: "8px 12px",
  borderRadius: 999,
  background: "#fff6de",
  color: "#8d6517",
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

function sectionStyle(delay: number): CSSProperties {
  return {
    padding: "16px 16px 0",
    animation: `kalpx-fade-in 0.45s ease-out ${delay}s both`,
  };
}
