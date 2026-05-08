import {
  ArrowLeft,
  Heart,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Star,
  Store,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  haatProducts,
  haatServices,
  trustedProductStores,
  trustedServiceStores,
} from "./haatData";
import {
  addProductToCart,
  getCartCount,
  isWishlisted,
  toggleWishlist,
  useHaatState,
} from "./haatState";
import { useAppDispatch } from "../../store/hooks";
import { showSnackBar } from "../../store/snackBarSlice";

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
  const [searchValue, setSearchValue] = useState(searchParams.get("search") ?? "");
  const [productSort, setProductSort] = useState<ProductSort>("featured");
  const [serviceSort, setServiceSort] = useState<ServiceSort>("featured");
  const haatState = useHaatState();

  const type = getBrowseType(searchParams.get("type"));
  const cartCount = getCartCount(haatState);
  const productStores = trustedProductStores.map((item) => item.store_name);
  const serviceProviders = trustedServiceStores.map((item) => item.store_name);
  const [selectedProductStore, setSelectedProductStore] = useState<string>("All");
  const [selectedServiceProvider, setSelectedServiceProvider] = useState<string>("All");

  const filteredProducts = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    const base = haatProducts.filter((item) => {
      const matchesStore =
        selectedProductStore === "All" || item.store.store_name === selectedProductStore;
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.store.store_name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);
      return matchesStore && matchesQuery;
    });

    if (productSort === "low_to_high") {
      return [...base].sort((left, right) => left.price_minor - right.price_minor);
    }
    if (productSort === "high_to_low") {
      return [...base].sort((left, right) => right.price_minor - left.price_minor);
    }
    if (productSort === "rating") {
      return [...base].sort((left, right) => right.rating - left.rating);
    }
    return base;
  }, [productSort, searchValue, selectedProductStore]);

  const filteredServices = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    const base = haatServices.filter((item) => {
      const matchesProvider =
        selectedServiceProvider === "All" || item.provider === selectedServiceProvider;
      const matchesQuery =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.provider.toLowerCase().includes(query) ||
        item.price.toLowerCase().includes(query);
      return matchesProvider && matchesQuery;
    });

    if (serviceSort === "provider") {
      return [...base].sort((left, right) => left.provider.localeCompare(right.provider));
    }
    if (serviceSort === "price") {
      return [...base].sort((left, right) => left.price.localeCompare(right.price));
    }
    return base;
  }, [searchValue, selectedServiceProvider, serviceSort]);

  return (
    <main style={{ minHeight: "100dvh", background: "#fcfaf6" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "18px 14px 40px" }}>
        <header style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button type="button" onClick={() => navigate(-1)} style={iconButtonStyle}>
              <ArrowLeft size={20} />
            </button>
            <div>
              <p style={eyebrowStyle}>KalpX Haat</p>
              <h1 style={titleStyle}>
                {type === "product" ? "All Products" : "All Services"}
              </h1>
            </div>
          </div>
          <button type="button" onClick={() => navigate("/en/haat/cart")} style={cartButtonStyle}>
            <ShoppingCart size={18} />
            <span style={cartCountStyle}>{cartCount}</span>
          </button>
        </header>

        <div style={heroCardStyle}>
          <div style={searchBarStyle}>
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
          <div style={toolbarStyle}>
            <div style={filterHeaderStyle}>
              <SlidersHorizontal size={16} />
              Filters
            </div>
            <select
              value={type === "product" ? productSort : serviceSort}
              onChange={(event) =>
                type === "product"
                  ? setProductSort(event.target.value as ProductSort)
                  : setServiceSort(event.target.value as ServiceSort)
              }
              style={selectStyle}
            >
              {type === "product" ? (
                <>
                  <option value="featured">Featured</option>
                  <option value="rating">Top Rated</option>
                  <option value="low_to_high">Price: Low to High</option>
                  <option value="high_to_low">Price: High to Low</option>
                </>
              ) : (
                <>
                  <option value="featured">Featured</option>
                  <option value="provider">Provider A-Z</option>
                  <option value="price">Price Label</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div style={layoutStyle}>
          <aside style={sidebarStyle}>
            <div style={sidebarCardStyle}>
              <h2 style={sidebarTitleStyle}>{type === "product" ? "Stores" : "Providers"}</h2>
              <div style={chipListStyle}>
                <FilterChip
                  active={
                    type === "product"
                      ? selectedProductStore === "All"
                      : selectedServiceProvider === "All"
                  }
                  label="All"
                  onClick={() =>
                    type === "product"
                      ? setSelectedProductStore("All")
                      : setSelectedServiceProvider("All")
                  }
                />
                {(type === "product" ? productStores : serviceProviders).map((item) => (
                  <FilterChip
                    key={item}
                    active={
                      type === "product"
                        ? selectedProductStore === item
                        : selectedServiceProvider === item
                    }
                    label={item}
                    onClick={() =>
                      type === "product"
                        ? setSelectedProductStore(item)
                        : setSelectedServiceProvider(item)
                    }
                  />
                ))}
              </div>
            </div>
          </aside>

          <section>
            <div style={resultHeaderStyle}>
              <div>
                <h2 style={resultTitleStyle}>
                  {type === "product" ? "Marketplace products" : "Marketplace services"}
                </h2>
                <p style={resultMetaStyle}>
                  {type === "product" ? filteredProducts.length : filteredServices.length} items
                </p>
              </div>
            </div>

            {type === "product" ? (
              <div style={gridStyle}>
                {filteredProducts.map((product) => (
                  <article key={product.id} style={listingCardStyle}>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      style={{
                        ...wishlistButtonStyle,
                        color: isWishlisted(haatState, product.id) ? "#e11d48" : "#6b7280",
                        background: isWishlisted(haatState, product.id) ? "#fff1f2" : "#fff",
                      }}
                    >
                      <Heart
                        size={16}
                        fill={isWishlisted(haatState, product.id) ? "currentColor" : "none"}
                      />
                    </button>
                    <div
                      onClick={() => navigate(`/en/haat/product/${product.id}?type=product`)}
                      style={{ cursor: "pointer" }}
                    >
                      <img src={product.images[0]?.url} alt={product.name} style={listingImageStyle} />
                    </div>
                    <div style={{ padding: 18 }}>
                      <div style={ratingPillStyle}>
                        <Star size={12} fill="currentColor" />
                        {product.rating.toFixed(1)}
                      </div>
                      <h3 style={listingTitleStyle}>{product.name}</h3>
                      <p style={listingStoreStyle}>{product.store.store_name}</p>
                      <p style={listingPriceStyle}>₹{product.price_minor}/-</p>
                      <div style={listingActionsStyle}>
                        <button
                          type="button"
                          onClick={() => navigate(`/en/haat/product/${product.id}?type=product`)}
                          style={secondaryButtonStyle}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            addProductToCart(product.id);
                            dispatch(showSnackBar(`${product.name} added to cart`));
                          }}
                          style={primaryButtonStyle}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div style={gridStyle}>
                {filteredServices.map((service) => {
                  const store = trustedServiceStores.find(
                    (item) => item.store_name === service.provider,
                  );
                  return (
                    <article key={service.id} style={listingCardStyle}>
                      <img src={service.image} alt={service.name} style={listingImageStyle} />
                      <div style={{ padding: 18 }}>
                        <div style={serviceProviderBadgeStyle}>
                          <Store size={12} />
                          {service.provider}
                        </div>
                        <h3 style={listingTitleStyle}>{service.name}</h3>
                        <p style={listingStoreStyle}>Trusted ritual support and doorstep help</p>
                        <p style={listingPriceStyle}>{service.price}</p>
                        <div style={listingActionsStyle}>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/en/haat/store/${store?.id ?? 4}?type=service`)
                            }
                            style={secondaryButtonStyle}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/en/haat/store/${store?.id ?? 4}?type=service`)
                            }
                            style={primaryButtonStyle}
                          >
                            Book Now
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function FilterChip({
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
        borderRadius: 999,
        padding: "10px 14px",
        textAlign: "left",
        background: active ? "#2f261d" : "#f5efe6",
        color: active ? "#fff" : "#4b5563",
        fontSize: 13,
        fontWeight: 700,
      }}
    >
      {label}
    </button>
  );
}

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 20,
  marginBottom: 20,
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
  fontSize: 30,
  fontWeight: 800,
  color: "#2f261d",
};

const iconButtonStyle: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 12,
  background: "#fff",
  border: "1px solid #eee4d6",
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
  display: "grid",
  gap: 14,
  padding: 18,
  borderRadius: 24,
  background: "linear-gradient(135deg, #fbf5ea 0%, #fff 100%)",
  border: "1px solid #efe3d1",
  marginBottom: 20,
};

const searchBarStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "14px 16px",
  borderRadius: 18,
  background: "#fff",
  border: "1px solid #eee4d6",
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
  flexWrap: "wrap",
};

const filterHeaderStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontSize: 14,
  fontWeight: 700,
  color: "#5f5140",
};

const selectStyle: CSSProperties = {
  borderRadius: 12,
  border: "1px solid #e7dbc9",
  background: "#fff",
  padding: "10px 12px",
  fontSize: 13,
  color: "#3f3528",
  minWidth: 190,
};

const layoutStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "280px minmax(0, 1fr)",
  gap: 20,
  alignItems: "start",
};

const sidebarStyle: CSSProperties = {
  position: "sticky",
  top: 16,
};

const sidebarCardStyle: CSSProperties = {
  borderRadius: 20,
  background: "#fff",
  border: "1px solid #eee4d6",
  padding: 18,
};

const sidebarTitleStyle: CSSProperties = {
  margin: "0 0 14px",
  fontSize: 18,
  fontWeight: 800,
  color: "#2f261d",
};

const chipListStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
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

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: 18,
};

const listingCardStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  borderRadius: 22,
  background: "#fff",
  border: "1px solid #eee4d6",
  boxShadow: "0 12px 28px rgba(55, 37, 12, 0.06)",
};

const listingImageStyle: CSSProperties = {
  width: "100%",
  aspectRatio: "1 / 1",
  objectFit: "cover",
  display: "block",
};

const wishlistButtonStyle: CSSProperties = {
  position: "absolute",
  top: 14,
  right: 14,
  zIndex: 1,
  width: 34,
  height: 34,
  borderRadius: "50%",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 8px 18px rgba(0,0,0,0.08)",
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

const listingActionsStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
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
