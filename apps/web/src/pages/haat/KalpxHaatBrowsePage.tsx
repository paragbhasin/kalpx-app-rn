import {
  ArrowLeft,
  Check,
  ChevronDown,
  Search,
  ShoppingCart,
  SlidersHorizontal,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks";
import { showSnackBar } from "../../store/snackBarSlice";
import { HaatProductGrid } from "./HaatProductCards";
import { HaatServiceGrid } from "./HaatServiceCards";
import { useHaatCatalog } from "./haatCatalog";
import { haatServices, trustedServiceStores } from "./haatData";
import { addProductToCart, getCartCount, useHaatState } from "./haatState";

type BrowseType = "product" | "service";
type ProductSort = "featured" | "low_to_high" | "high_to_low" | "rating";
type ServiceSort = "featured" | "provider" | "price";

function getBrowseType(value: string | null): BrowseType {
  return value === "service" ? "service" : "product";
}

export function KalpxHaatBrowsePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const isDesktop =
    typeof window === "undefined" ? true : window.innerWidth >= 1024;
  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") ?? "",
  );
  const [productSort, setProductSort] = useState<ProductSort>("featured");
  const [serviceSort, setServiceSort] = useState<ServiceSort>("featured");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const haatState = useHaatState();
  const { products } = useHaatCatalog();

  const type = getBrowseType(searchParams.get("type"));
  const cartCount = getCartCount(haatState);
  const currentSort = type === "product" ? productSort : serviceSort;
  const sortOptions =
    type === "product"
      ? [
          { value: "featured", label: "Featured" },
          { value: "rating", label: "Top Rated" },
          { value: "low_to_high", label: "Price: Low to High" },
          { value: "high_to_low", label: "Price: High to Low" },
        ]
      : [
          { value: "featured", label: "Featured" },
          { value: "provider", label: "Provider A-Z" },
          { value: "price", label: "Price Label" },
        ];
  const filteredProducts = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    const base = products.filter(
      (item) =>
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.store.store_name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query),
    );

    if (productSort === "low_to_high") {
      return [...base].sort(
        (left, right) => left.price_minor - right.price_minor,
      );
    }
    if (productSort === "high_to_low") {
      return [...base].sort(
        (left, right) => right.price_minor - left.price_minor,
      );
    }
    if (productSort === "rating") {
      return [...base].sort((left, right) => right.rating - left.rating);
    }
    return base;
  }, [productSort, products, searchValue]);

  const filteredServices = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    const base = haatServices.filter(
      (item) =>
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.provider.toLowerCase().includes(query) ||
        item.price.toLowerCase().includes(query),
    );

    if (serviceSort === "provider") {
      return [...base].sort((left, right) =>
        left.provider.localeCompare(right.provider),
      );
    }
    if (serviceSort === "price") {
      return [...base].sort((left, right) =>
        left.price.localeCompare(right.price),
      );
    }
    return base;
  }, [searchValue, serviceSort]);

  return (
    <main style={{ minHeight: "100dvh" }}>
      <div style={{ margin: "0 auto", padding: "18px 14px 40px" }}>
        <header style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              style={iconButtonStyle}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={titleStyle}>
                {type === "product" ? "All Products" : "All Services"}
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/en/haat/cart")}
            style={cartButtonStyle}
          >
            <ShoppingCart size={18} />
            <span style={cartCountStyle}>{cartCount}</span>
          </button>
        </header>

        <div style={heroCardStyle}>
          <div
            style={{
              ...toolbarStyle,
              flexWrap: isDesktop ? "nowrap" : "wrap",
              alignItems: isDesktop ? "center" : "stretch",
            }}
          >
            <div
              style={{
                ...searchBarStyle,
                flexBasis: isDesktop ? "auto" : "100%",
              }}
            >
              <Search size={18} style={{ color: "#8d8378" }} />
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder={
                  type === "product"
                    ? "Search by product or store"
                    : "Search by service or provider"
                }
                style={searchInputStyle}
              />
            </div>
            <div style={filterHeaderStyle}>
              <SlidersHorizontal size={16} />
              Filters
            </div>
            <div
              style={{
                position: "relative",
                width: isDesktop ? 220 : "100%",
                minWidth: isDesktop ? 220 : 0,
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={() => setSortMenuOpen((current) => !current)}
                style={{
                  ...selectStyle,
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  {sortOptions.find((option) => option.value === currentSort)?.label}
                </span>
                <ChevronDown size={18} />
              </button>

              {sortMenuOpen ? (
                <div style={sortMenuStyle}>
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        if (type === "product") {
                          setProductSort(option.value as ProductSort);
                        } else {
                          setServiceSort(option.value as ServiceSort);
                        }
                        setSortMenuOpen(false);
                      }}
                      style={{
                        ...sortOptionStyle,
                        background:
                          currentSort === option.value ? "#f7f2e8" : "transparent",
                      }}
                    >
                      <span>{option.label}</span>
                      {currentSort === option.value ? <Check size={16} /> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <section>
          {type === "product" ? (
            <HaatProductGrid
              products={filteredProducts}
              onAddToCart={(name, productId) => {
                addProductToCart(productId);
                dispatch(showSnackBar(`${name} added to cart`));
              }}
            />
          ) : (
            <HaatServiceGrid services={filteredServices} stores={trustedServiceStores} />
          )}
        </section>
      </div>
    </main>
  );
}

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 20,
};

const eyebrowStyle: CSSProperties = {
  margin: "0 0 4px",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#a77a20",
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 800,
  color: "#2f261d",
};

const iconButtonStyle: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 12,

  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#2f261d",
  boxShadow: "0 8px 20px rgba(55, 37, 12, 0.05)",
};

const cartButtonStyle: CSSProperties = {
  position: "relative",
  width: 44,
  height: 44,
  borderRadius: 14,
  background: "#fff",
  border: "1px solid #eee4d6",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#2f261d",
  boxShadow: "0 8px 20px rgba(55, 37, 12, 0.05)",
};

const cartCountStyle: CSSProperties = {
  position: "absolute",
  top: -4,
  right: -4,
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
};

const heroCardStyle: CSSProperties = {
  padding: 18,
  borderRadius: 24,
};

const searchBarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "14px 16px",
  borderRadius: 18,
  background: "#fff",
  border: "1px solid #eee4d6",
  flex: 1,
  minWidth: 0,
};

const searchInputStyle: CSSProperties = {
  width: "100%",
  fontSize: 14,
  color: "#2f261d",
  background: "transparent",
  outline: "none",
};

const toolbarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  flexWrap: "nowrap",
};

const filterHeaderStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontSize: 14,
  fontWeight: 700,
  color: "#5f5140",
  whiteSpace: "nowrap",
  flexShrink: 0,
};

const selectStyle: CSSProperties = {
  borderRadius: 12,
  border: "1px solid #e7dbc9",
  background: "#fff",
  padding: "10px 12px",
  fontSize: 13,
  color: "#3f3528",
  minWidth: 190,
  flexShrink: 0,
};

const sortMenuStyle: CSSProperties = {
  position: "absolute",
  top: "calc(100% + 8px)",
  right: 0,
  zIndex: 20,
  width: "100%",
  borderRadius: 14,
  border: "1px solid #e7dbc9",
  background: "#fff",
  boxShadow: "0 16px 36px rgba(55, 37, 12, 0.14)",
  overflow: "hidden",
};

const sortOptionStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 14px",
  fontSize: 14,
  color: "#3f3528",
  textAlign: "left",
};

const resultHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 18,
};

const resultTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 800,
  color: "#2f261d",
};

const resultMetaStyle: CSSProperties = {
  margin: "4px 0 0",
  fontSize: 13,
  color: "#7a6d5d",
};

const listStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 18,
};

const compactCardStyle: CSSProperties = {
  position: "relative",
  borderRadius: 22,
  background: "#fff",
  border: "1px solid #eee4d6",
  boxShadow: "0 12px 28px rgba(55, 37, 12, 0.06)",
  display: "flex",
  gap: 18,
  padding: 16,
  alignItems: "center",
};

const compactMediaWrapStyle: CSSProperties = {
  cursor: "pointer",
  flexShrink: 0,
};

const compactImageStyle: CSSProperties = {
  width: 148,
  height: 148,
  objectFit: "cover",
  display: "block",
  borderRadius: 18,
  flexShrink: 0,
};

const compactWishlistButtonStyle: CSSProperties = {
  position: "absolute",
  top: 16,
  right: 16,
  width: 34,
  height: 34,
  borderRadius: "50%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 8px 18px rgba(0,0,0,0.08)",
};

const compactContentStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  paddingRight: 64,
};

const ratingPillStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  borderRadius: 999,
  background: "#fff5d8",
  color: "#9d6b10",
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 800,
  marginBottom: 10,
};

const serviceProviderBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  borderRadius: 999,
  background: "#fff5d8",
  color: "#9d6b10",
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 800,
  marginBottom: 10,
};

const listingTitleStyle: CSSProperties = {
  margin: "0 0 6px",
  fontSize: 18,
  fontWeight: 800,
  lineHeight: 1.3,
  color: "#2f261d",
};

const listingStoreStyle: CSSProperties = {
  margin: "0 0 14px",
  fontSize: 13,
  color: "#7a6d5d",
};

const listingPriceStyle: CSSProperties = {
  margin: "0 0 16px",
  fontSize: 22,
  fontWeight: 900,
  color: "#23180e",
};

const compactActionsStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  maxWidth: 320,
};

const primaryButtonStyle: CSSProperties = {
  borderRadius: 12,
  padding: "12px 14px",
  background: "#d4a017",
  color: "#fff",
  fontSize: 14,
  fontWeight: 800,
};

const secondaryButtonStyle: CSSProperties = {
  borderRadius: 12,
  padding: "12px 14px",
  background: "#fff",
  border: "1px solid #e7dbc9",
  color: "#3f3528",
  fontSize: 14,
  fontWeight: 800,
};
