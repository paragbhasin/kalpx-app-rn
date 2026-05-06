import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Images,
  Pencil,
  Plus,
  PlusCircle,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";

const AUTH_SNAPSHOT_KEY = "kalpx_auth_snapshot";
const PAGE_SIZE = 12;

type CreatorAuthSnapshot = {
  role?: string;
  user?: {
    role?: string;
    [key: string]: unknown;
  };
  profile?: {
    creator_type?: string;
    user?: {
      role?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  creator_profile?: {
    creator_type?: string;
    user?: {
      role?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
};

type SlideBlock = {
  id?: string | number;
  text?: string;
  x?: number;
  y?: number;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  align?: string;
  opacity?: number;
  shadow?: number;
  stroke?: number;
  bg?: boolean;
};

type SlideItem = {
  id?: string | number;
  image_url?: string;
  layout?: {
    aspect_ratio?: string;
    blocks?: SlideBlock[];
  };
};

type CreatorPost = {
  id: number | string;
  title?: string;
  base_text?: string;
  is_published?: boolean;
  slides?: SlideItem[];
};

function readAuthSnapshot(): CreatorAuthSnapshot | null {
  try {
    const raw = localStorage.getItem(AUTH_SNAPSHOT_KEY);
    return raw ? (JSON.parse(raw) as CreatorAuthSnapshot) : null;
  } catch {
    return null;
  }
}

function getTextAlign(value?: string) {
  if (value === "left" || value === "right" || value === "center") return value;
  return "center";
}

function getFontFamily(value?: string) {
  return value || "inherit";
}

function getCardTextBlockStyle(block: SlideBlock): CSSProperties {
  const styles: CSSProperties = {
    position: "absolute",
    left: `${block.x ?? 50}%`,
    top: `${block.y ?? 50}%`,
    transform: "translate(-50%, -50%)",
    color: block.color || "#ffffff",
    fontSize: `${Math.max((block.fontSize || 16) * 0.6, 10)}px`,
    fontFamily: getFontFamily(block.fontFamily),
    textAlign: getTextAlign(block.align),
    opacity: (block.opacity || 100) / 100,
    zIndex: 10,
    pointerEvents: "none",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    maxWidth: "90%",
    lineHeight: 1.2,
  };

  if (block.shadow && block.shadow > 0) {
    styles.textShadow = `0 0 ${block.shadow * 2}px rgba(0, 0, 0, 0.8)`;
  }

  if (block.stroke && block.stroke > 0) {
    (styles as any).WebkitTextStroke = `${Math.max(block.stroke * 0.5, 0.5)}px rgba(0, 0, 0, 0.5)`;
  }

  if (block.bg) {
    styles.backgroundColor = "rgba(0, 0, 0, 0.5)";
    styles.padding = "4px 6px";
    styles.borderRadius = "2px";
  }

  return styles;
}

function isVideo(url?: string) {
  if (!url) return false;
  const cleanUrl = url.split("?")[0].toLowerCase();
  return (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".mov")
  );
}

function getAspectRatio(post: CreatorPost) {
  const ratio = post.slides?.[0]?.layout?.aspect_ratio;
  return ratio ? ratio.replace(":", "/") : "4 / 5";
}

function getSlideBlocks(slide?: SlideItem) {
  return slide?.layout?.blocks ?? [];
}

export function CreatorPostsPage() {
  const [authSnapshot, setAuthSnapshot] = useState<CreatorAuthSnapshot | null>(
    () => readAuthSnapshot(),
  );
  const [posts, setPosts] = useState<CreatorPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [carouselIndex, setCarouselIndex] = useState<Record<string, number>>({});

  useEffect(() => {
    setAuthSnapshot(readAuthSnapshot());
  }, []);

  const isAuthenticated = useMemo(() => Boolean(authSnapshot), [authSnapshot]);
  const userRole = useMemo(
    () =>
      authSnapshot?.role ||
      authSnapshot?.user?.role ||
      authSnapshot?.profile?.user?.role ||
      authSnapshot?.creator_profile?.user?.role ||
      "",
    [authSnapshot],
  );
  const creatorType = useMemo(
    () =>
      authSnapshot?.profile?.creator_type ||
      authSnapshot?.creator_profile?.creator_type ||
      "",
    [authSnapshot],
  );

  const isPostAdmin =
    isAuthenticated && userRole === "creator" && creatorType === "postadmin";

  const fetchPosts = useCallback(
    async (pageNum = 1, append = false, nextQuery = appliedQuery) => {
      if (pageNum === 1) {
        setLoading(true);
        setPosts([]);
        setHasMore(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      try {
        const res = await api.get("explore-posts/", {
          params: {
            paginate: true,
            page: pageNum,
            page_size: PAGE_SIZE,
            ...(nextQuery ? { q: nextQuery } : {}),
          },
        });

        const results = Array.isArray(res.data?.results)
          ? res.data.results
          : Array.isArray(res.data)
            ? res.data
            : [];

        setHasMore(results.length >= PAGE_SIZE);
        setPosts((prev) => (append ? [...prev, ...results] : results));
      } catch (error) {
        console.log("Failed to load posts:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [appliedQuery],
  );

  useEffect(() => {
    if (!isPostAdmin) return;
    void fetchPosts(1, false, appliedQuery);
  }, [appliedQuery, fetchPosts, isPostAdmin]);

  const nextSlide = (postId: number | string, total: number) => {
    setCarouselIndex((prev) => {
      const key = String(postId);
      const current = prev[key] || 0;
      return { ...prev, [key]: (current + 1) % total };
    });
  };

  const prevSlide = (postId: number | string, total: number) => {
    setCarouselIndex((prev) => {
      const key = String(postId);
      const current = prev[key] || 0;
      return { ...prev, [key]: current === 0 ? total - 1 : current - 1 };
    });
  };

  const loadMore = () => {
    if (loading || loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    void fetchPosts(nextPage, true, appliedQuery);
  };

  const handleSearch = () => {
    setAppliedQuery(query.trim());
    setPage(1);
  };

  return (
    <div style={layoutStyle}>
      <div style={contentWrapperStyle}>
        <div style={contentContainerStyle}>
          {!isAuthenticated || !isPostAdmin ? (
            <div style={unauthWrapStyle}>
              <h1 style={unauthTitleStyle}>Access Restricted</h1>
              <p style={unauthTextStyle}>
                You do not have permissions to manage KalpX Posts.
              </p>
            </div>
          ) : (
            <div style={dashboardWrapStyle}>
              <section style={heroCardStyle}>
                <div style={heroRowStyle}>
                  <div>
                    <h1 style={heroTitleStyle}>
                      <span style={heroTitleInnerStyle}>
                        <Images size={28} color="var(--accent, #d69e2e)" />
                        Posts Management
                      </span>
                    </h1>
                    <p style={heroSubtitleStyle}>
                      Create and manage KalpX Explore Posts.
                    </p>
                  </div>

                  <div style={heroActionsStyle}>
                    <Link to="/en/creator/posts/new" style={primaryActionStyle}>
                      <PlusCircle size={18} />
                      <span>Create New Post</span>
                    </Link>
                    <Link
                      to="/en/creator/posts/new-simple"
                      style={primaryActionStyle}
                    >
                      <Plus size={18} />
                      <span>Create Simple Post</span>
                    </Link>
                  </div>
                </div>
              </section>

              <section style={listCardStyle}>
                <div style={listHeaderStyle}>
                  <h2 style={listTitleStyle}>All Posts</h2>

                  <div style={searchRowStyle}>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch();
                      }}
                      type="search"
                      placeholder="Search posts..."
                      style={searchInputStyle}
                    />
                    <button onClick={handleSearch} style={searchButtonStyle}>
                      <Search size={16} />
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div style={statusCenterStyle}>Loading...</div>
                ) : !posts.length ? (
                  <div style={statusCenterStyle}>
                    No posts available. Create your first post!
                  </div>
                ) : (
                  <>
                    <div style={postsGridStyle}>
                      {posts.map((post) => (
                        <article key={String(post.id)} style={postCardStyle}>
                          <div
                            style={{
                              ...mediaWrapStyle,
                              aspectRatio: getAspectRatio(post),
                            }}
                          >
                            <div
                              style={{
                                ...slidesTrackStyle,
                                transform: `translateX(-${
                                  (carouselIndex[String(post.id)] || 0) * 100
                                }%)`,
                              }}
                            >
                              {(post.slides || []).map((slide, index) => (
                                <div
                                  key={String(slide.id || index)}
                                  style={slideItemStyle}
                                >
                                  {slide.image_url && isVideo(slide.image_url) ? (
                                    <video
                                      src={slide.image_url}
                                      style={slideMediaStyle}
                                      muted
                                      playsInline
                                      autoPlay
                                      loop
                                    />
                                  ) : (
                                    <img
                                      src={slide.image_url}
                                      alt={post.title || "Post"}
                                      style={slideMediaStyle}
                                    />
                                  )}

                                  {index ===
                                    (carouselIndex[String(post.id)] || 0) &&
                                  getSlideBlocks(slide).length > 0 ? (
                                    <div style={textOverlayStyle}>
                                      {getSlideBlocks(slide).map((block, blockIndex) => (
                                        <div
                                          key={String(block.id || blockIndex)}
                                          style={getCardTextBlockStyle(block)}
                                        >
                                          {block.text}
                                        </div>
                                      ))}
                                    </div>
                                  ) : null}
                                </div>
                              ))}
                            </div>

                            {(post.slides?.length || 0) > 1 ? (
                              <>
                                <button
                                  onClick={() =>
                                    prevSlide(post.id, post.slides?.length || 0)
                                  }
                                  style={{ ...carouselArrowStyle, left: 8 }}
                                >
                                  <ChevronLeft size={18} />
                                </button>
                                <button
                                  onClick={() =>
                                    nextSlide(post.id, post.slides?.length || 0)
                                  }
                                  style={{ ...carouselArrowStyle, right: 8 }}
                                >
                                  <ChevronRight size={18} />
                                </button>
                                <div style={dotsWrapStyle}>
                                  {post.slides?.map((_, dotIndex) => (
                                    <div
                                      key={dotIndex}
                                      style={{
                                        ...dotStyle,
                                        background:
                                          (carouselIndex[String(post.id)] || 0) ===
                                          dotIndex
                                            ? "#fff"
                                            : "rgba(255,255,255,0.4)",
                                      }}
                                    />
                                  ))}
                                </div>
                              </>
                            ) : null}
                          </div>

                          <div style={postBodyStyle}>
                            <h3 style={postTitleStyle}>{post.title}</h3>

                            <p style={postExcerptStyle}>
                              {`${post.base_text?.slice(0, 120) || ""}${
                                (post.base_text?.length || 0) > 120 ? "..." : ""
                              }`}
                            </p>

                            <div style={badgeRowStyle}>
                              {post.is_published ? (
                                <span style={publishedBadgeStyle}>
                                  <CheckCircle2 size={12} />
                                  Published
                                </span>
                              ) : (
                                <span style={draftBadgeStyle}>
                                  <Circle size={12} />
                                  Draft
                                </span>
                              )}
                            </div>

                            <div style={actionsRowStyle}>
                              <Link
                                to={`/en/creator/posts/${post.id}/edit-simple`}
                                style={secondaryActionStyle}
                              >
                                <Pencil size={14} />
                                Edit Simple
                              </Link>
                              <Link
                                to={`/en/creator/posts/${post.id}/edit`}
                                style={secondaryActionStyle}
                              >
                                <Pencil size={14} />
                                Edit
                              </Link>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>

                    {loadingMore ? (
                      <div style={loadingMoreStyle}>Loading more...</div>
                    ) : hasMore ? (
                      <div style={loadMoreWrapStyle}>
                        <button onClick={loadMore} style={loadMoreButtonStyle}>
                          Load More Posts
                        </button>
                      </div>
                    ) : (
                      <div style={endStateStyle}>No more posts to load</div>
                    )}
                  </>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const layoutStyle: CSSProperties = {
  minHeight: "100dvh",
  background: "var(--primary-color, #f6f1e8)",
  display: "flex",
  overflowX: "hidden",
};

const contentWrapperStyle: CSSProperties = {
  flex: 1,
  width: "100%",
  minHeight: "100vh",
  overflowY: "auto",
  overflowX: "hidden",
};

const contentContainerStyle: CSSProperties = {
  width: "100%",
  paddingTop: 20,
  paddingBottom: 32,
};

const unauthWrapStyle: CSSProperties = {
  textAlign: "center",
  margin: "0 auto",
  maxWidth: 896,
  padding: "80px 16px",
};

const unauthTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 30,
  fontWeight: 700,
  color: "var(--text-color, #1f2937)",
  fontFamily: "Cormorant Garamond, serif",
};

const unauthTextStyle: CSSProperties = {
  marginTop: 12,
  fontSize: 18,
  color: "#334155",
};

const dashboardWrapStyle: CSSProperties = {
  margin: "0 auto",
  width: "100%",
  maxWidth: 1152,
  padding: "0 16px",
};

const heroCardStyle: CSSProperties = {
  marginBottom: 32,
  borderRadius: 16,
  background:
    "linear-gradient(135deg, var(--secondary-bg, #f8ecd1), var(--secondary-hover, #f2dfb3))",
  padding: 24,
  boxShadow: "0 4px 20px var(--shadow-color, rgba(0,0,0,0.08))",
};

const heroRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
};

const heroTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 32,
  fontWeight: 700,
  color: "var(--text-color, #1f2937)",
  fontFamily: "Cormorant Garamond, serif",
};

const heroTitleInnerStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 12,
};

const heroSubtitleStyle: CSSProperties = {
  margin: "4px 0 0",
  fontSize: 18,
  color: "#334155",
};

const heroActionsStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
};

const primaryActionStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  borderRadius: 10,
  padding: "10px 14px",
  background: "var(--accent, #d69e2e)",
  color: "#111827",
  textDecoration: "none",
  fontWeight: 700,
};

const listCardStyle: CSSProperties = {
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  background: "#fff",
  padding: 16,
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
};

const listHeaderStyle: CSSProperties = {
  marginBottom: 16,
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const listTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 28,
  fontWeight: 700,
  color: "var(--text-color, #1f2937)",
  fontFamily: "Cormorant Garamond, serif",
};

const searchRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const searchInputStyle: CSSProperties = {
  width: 224,
  maxWidth: "100%",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  padding: "10px 12px",
  fontSize: 14,
};

const searchButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: 10,
  padding: "10px 12px",
  background: "var(--accent, #d69e2e)",
  color: "#0f172a",
  cursor: "pointer",
};

const statusCenterStyle: CSSProperties = {
  padding: "40px 0",
  textAlign: "center",
  fontSize: 14,
  color: "#475569",
};

const postsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 16,
};

const postCardStyle: CSSProperties = {
  overflow: "hidden",
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  background: "#fff",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
};

const mediaWrapStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  overflow: "hidden",
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  background: "#000",
};

const slidesTrackStyle: CSSProperties = {
  display: "flex",
  height: "100%",
  transition: "transform 0.3s ease",
};

const slideItemStyle: CSSProperties = {
  minWidth: "100%",
  height: "100%",
  position: "relative",
};

const slideMediaStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const textOverlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
};

const carouselArrowStyle: CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  border: "none",
  borderRadius: 999,
  background: "rgba(255,255,255,0.7)",
  color: "#000",
  padding: 8,
  cursor: "pointer",
  boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
};

const dotsWrapStyle: CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 8,
  display: "flex",
  justifyContent: "center",
  gap: 4,
};

const dotStyle: CSSProperties = {
  width: 8,
  height: 8,
  borderRadius: 999,
  transition: "background 0.2s ease",
};

const postBodyStyle: CSSProperties = {
  padding: 16,
};

const postTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 24,
  fontWeight: 700,
  fontFamily: "Cormorant Garamond, serif",
  color: "#0f172a",
};

const postExcerptStyle: CSSProperties = {
  margin: "8px 0 0",
  fontSize: 14,
  color: "#475569",
  lineHeight: 1.5,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const badgeRowStyle: CSSProperties = {
  marginTop: 12,
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const publishedBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  borderRadius: 999,
  background: "#dcfce7",
  color: "#15803d",
  padding: "4px 8px",
  fontSize: 12,
  fontWeight: 700,
};

const draftBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  borderRadius: 999,
  background: "#fef3c7",
  color: "#b45309",
  padding: "4px 8px",
  fontSize: 12,
  fontWeight: 700,
};

const actionsRowStyle: CSSProperties = {
  marginTop: 16,
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const secondaryActionStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#1e293b",
  padding: "8px 12px",
  textDecoration: "none",
  fontSize: 12,
  fontWeight: 700,
};

const loadingMoreStyle: CSSProperties = {
  padding: "16px 0",
  display: "flex",
  justifyContent: "center",
  color: "#475569",
  fontSize: 14,
};

const loadMoreWrapStyle: CSSProperties = {
  padding: "16px 0",
  display: "flex",
  justifyContent: "center",
};

const loadMoreButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: 10,
  padding: "10px 24px",
  background: "var(--accent, #d69e2e)",
  color: "#0f172a",
  fontWeight: 700,
  cursor: "pointer",
};

const endStateStyle: CSSProperties = {
  padding: "16px 0",
  textAlign: "center",
  fontSize: 14,
  color: "#64748b",
};
