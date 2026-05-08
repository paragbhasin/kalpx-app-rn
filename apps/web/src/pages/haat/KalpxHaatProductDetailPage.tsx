import {
  ArrowLeft,
  ArrowRight,
  Heart,
  ShoppingCart,
  Star,
} from "lucide-react";
import { useMemo } from "react";
import type { CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getHaatProductById } from "./haatData";
import { useAppDispatch } from "../../store/hooks";
import { showSnackBar } from "../../store/snackBarSlice";
import {
  addProductToCart,
  getCartCount,
  isWishlisted,
  toggleWishlist,
  useHaatState,
} from "./haatState";

const ratingBreakdown = [
  { star: 5, percent: 85 },
  { star: 4, percent: 65 },
  { star: 3, percent: 40 },
  { star: 2, percent: 15 },
  { star: 1, percent: 5 },
];

const reviews = [
  {
    id: 1,
    name: "Courtney Henry",
    date: "11 Dec 2025",
    rating: 5,
    text: "The decoration was clean, well-arranged, and used good-quality materials. The...",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    image:
      "https://images.unsplash.com/photo-1602928321679-560bb453f190?q=80&w=300",
  },
  {
    id: 2,
    name: "Courtney Henry",
    date: "11 Dec 2025",
    rating: 5,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt .",
    avatar: "https://randomuser.me/api/portraits/women/45.jpg",
    image:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=300",
  },
];

export function KalpxHaatProductDetailPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const haatState = useHaatState();

  const product = useMemo(() => getHaatProductById(Number(id)), [id]);
  const wishlisted = isWishlisted(haatState, product.id);
  const cartCount = getCartCount(haatState);

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#fff",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 0 32px",
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
                overflow: "hidden",
                borderRadius: 24,
                boxShadow: "0 12px 30px rgba(67, 33, 4, 0.08)",
              }}
            >
              <img
                src={product.images[0]?.url}
                alt={product.name}
                style={{
                  width: "100%",
                  height: 450,
                  objectFit: "cover",
                  display: "block",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  bottom: 16,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: 6,
                }}
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: index === 0 ? "#fff" : "rgba(255,255,255,0.5)",
                      border: index === 0 ? "none" : "1px solid rgba(255,255,255,0.3)",
                    }}
                  />
                ))}
              </div>

              <button type="button" onClick={() => navigate(-1)} style={overlayIconButton("left")}>
                <ArrowLeft size={18} color="#1f2937" />
              </button>

              <div
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  display: "flex",
                  gap: 12,
                }}
              >
                <button
                  type="button"
                  onClick={() => navigate("/en/haat/cart")}
                  style={overlaySquareButton}
                >
                  <ShoppingCart size={18} color="#1f2937" />
                  {cartCount ? (
                    <span style={headerBadgeStyle}>{cartCount}</span>
                  ) : null}
                </button>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  style={{
                    ...overlaySquareButton,
                    color: wishlisted ? "#e11d48" : "#1f2937",
                  }}
                >
                  <Heart
                    size={18}
                    color="currentColor"
                    fill={wishlisted ? "currentColor" : "none"}
                  />
                </button>
              </div>
            </header>

            <section style={{ padding: "24px 16px 0" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 16,
                }}
              >
                <div>
                  <h1
                    style={{
                      margin: 0,
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#111827",
                    }}
                  >
                    {product.name}
                  </h1>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      marginTop: 6,
                    }}
                  >
                    <span style={{ color: "#d4a017", fontWeight: 700, fontSize: 18 }}>
                      {product.rating}+
                    </span>
                    <Star size={14} fill="#d4a017" color="#d4a017" />
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  ₹{product.price_minor}/-
                </div>
              </div>

              <div style={{ marginTop: 32 }}>
                <h3 style={sectionTitleStyle}>Description :</h3>
                <p style={sectionBodyStyle}>{product.description}</p>
              </div>

              <div
                style={{
                  marginTop: 32,
                  borderTop: "1px solid #e5e7eb",
                  paddingTop: 24,
                }}
              >
                <h3 style={sectionTitleStyle}>Additional Details</h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: 24,
                  }}
                >
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <div key={key}>
                      <p
                        style={{
                          margin: "0 0 4px",
                          fontSize: 14,
                          color: "#6b7280",
                          textTransform: "capitalize",
                        }}
                      >
                        {key}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#111827",
                        }}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  marginTop: 40,
                  display: "flex",
                  gap: 16,
                  paddingBottom: 32,
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  style={outlineCtaStyle}
                  onClick={() => {
                    addProductToCart(product.id);
                    dispatch(showSnackBar(`${product.name} added to cart`));
                  }}
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>
                <button
                  type="button"
                  style={primaryCtaStyle}
                  onClick={() => {
                    addProductToCart(product.id);
                    navigate("/en/haat/cart?panel=cart");
                  }}
                >
                  Buy Now
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="kalpx-mobile-only">
                <ReviewRatings />
              </div>
            </section>
          </div>

          <aside
            className="kalpx-desktop-only"
            style={{
              paddingTop: 16,
            }}
          >
            <div
              style={{
                position: "sticky",
                top: 24,
              }}
            >
              <ReviewRatings />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function ReviewRatings() {
  return (
    <section style={{ padding: "16px 0" }}>
      <h2
        style={{
          margin: "0 0 24px",
          fontSize: 28,
          fontWeight: 700,
          color: "#111827",
        }}
      >
        Review & Ratings
      </h2>

      <div
        style={{
          background: "#FCF9F1",
          borderRadius: 24,
          padding: 24,
          display: "flex",
          flexDirection: "column",
          gap: 32,
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1, width: "100%", display: "grid", gap: 12 }}>
          {ratingBreakdown.map((item) => (
            <div
              key={item.star}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span
                style={{
                  width: 12,
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#111827",
                }}
              >
                {item.star}
              </span>
              <Star size={12} fill="#D4A017" color="#D4A017" />
              <div
                style={{
                  flex: 1,
                  height: 8,
                  background: "#E5E5E5",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${item.percent}%`,
                    height: "100%",
                    background: "#D4A017",
                    borderRadius: 999,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            width: "100%",
            maxWidth: 180,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderLeft: "1px solid #e5e7eb",
            paddingLeft: 32,
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: "#111827",
            }}
          >
            4.0
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={14}
                fill={index < 4 ? "#D4A017" : "#d1d5db"}
                color={index < 4 ? "#D4A017" : "#d1d5db"}
              />
            ))}
          </div>
          <p
            style={{
              margin: "8px 0 0",
              fontSize: 14,
              fontWeight: 600,
              color: "#4b5563",
            }}
          >
            52 Reviews
          </p>
        </div>
      </div>

      <div style={{ marginTop: 32, display: "grid", gap: 24 }}>
        {reviews.map((review) => (
          <article
            key={review.id}
            style={{
              border: "1px solid #f3f4f6",
              borderRadius: 24,
              padding: 16,
              transition: "box-shadow 0.2s ease",
              background: "#fff",
              boxShadow: "0 8px 24px rgba(67, 33, 4, 0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <img
                  src={review.avatar}
                  alt={review.name}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #fff",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                  }}
                />
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      fontSize: 16,
                      color: "#111827",
                    }}
                  >
                    {review.name}
                  </p>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#6b7280",
                    }}
                  >
                    Posted on {review.date}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 2 }}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={12}
                    fill={index < review.rating ? "#D4A017" : "#e5e7eb"}
                    color={index < review.rating ? "#D4A017" : "#e5e7eb"}
                  />
                ))}
              </div>
            </div>

            <p
              style={{
                margin: "16px 0 0",
                color: "#374151",
                fontSize: 15,
                lineHeight: 1.7,
              }}
            >
              {review.text}
              {review.text.length > 50 ? (
                <span
                  style={{
                    color: "#111827",
                    fontWeight: 700,
                    marginLeft: 4,
                    cursor: "pointer",
                  }}
                >
                  More
                </span>
              ) : null}
            </p>

            {review.image ? (
              <div style={{ marginTop: 16 }}>
                <img
                  src={review.image}
                  alt=""
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 12,
                    objectFit: "cover",
                    cursor: "pointer",
                  }}
                />
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function overlayIconButton(side: "left") {
  return {
    position: "absolute" as const,
    top: 16,
    [side]: 16,
    ...overlaySquareButton,
  };
}

const overlaySquareButton: CSSProperties = {
  position: "relative",
  width: 40,
  height: 40,
  borderRadius: 10,
  background: "rgba(255,255,255,0.8)",
  backdropFilter: "blur(10px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const headerBadgeStyle: CSSProperties = {
  position: "absolute",
  top: -4,
  right: -4,
  minWidth: 18,
  height: 18,
  padding: "0 4px",
  borderRadius: 999,
  background: "#d4a017",
  color: "#fff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 10,
  fontWeight: 700,
};

const sectionTitleStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: 20,
  fontWeight: 600,
  color: "#111827",
};

const sectionBodyStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  lineHeight: 1.75,
  color: "#4b5563",
};

const outlineCtaStyle: CSSProperties = {
  flex: 1,
  minWidth: 220,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  border: "2px solid #d4a017",
  color: "#d4a017",
  background: "#fff",
  padding: "14px 18px",
  borderRadius: 14,
  fontWeight: 700,
};

const primaryCtaStyle: CSSProperties = {
  flex: 1,
  minWidth: 220,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  background: "#d4a017",
  color: "#fff",
  padding: "14px 18px",
  borderRadius: 14,
  fontWeight: 700,
  boxShadow: "0 10px 24px rgba(212, 160, 23, 0.26)",
};
