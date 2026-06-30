import { Plus, Search, XCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "../../lib/i18n";
import {
  getCommunityGlobalSearch,
  getTopCommunities,
  type CommunityGlobalSearchResult,
  type CommunityListItem,
} from "../../engine/communityApi";
import { CommunityTopBar } from "./CommunityTopBar";

type CommunityLayoutLabel =
  | "Home"
  | "Top"
  | "Popular"
  | "Explore"
  | "Your Activity"
  | "Communities"
  | "Privacy Policy"
  | "User Agreements"
  | "KalpX Rules"
  | "About KalpX";

interface CommunityWebLayoutProps {
  activeLabel?: CommunityLayoutLabel;
  children: ReactNode;
  centerWidth?: number;
  topBarRightSlot?: ReactNode;
  rightRailSlot?: ReactNode;
  hideRightRail?: boolean;
  hideDesktopTopBar?: boolean;
  showCreateButton?: boolean;
}

const primaryItems: Array<{ label: CommunityLayoutLabel; to: string }> = [
  { label: "Home", to: "/en/community" },
  { label: "Top", to: "/en/community/top" },
  { label: "Popular", to: "/en/community/popular" },
  { label: "Explore", to: "/en/community/explore" },
];

const recentCommunities = [
  { label: "k/Meditation & Mindfulness", slug: "meditation-mindfulness" },
  { label: "k/Ramayana Insights", slug: "ramayana-insights" },
  { label: "k/Bhakti & Devotion", slug: "bhakti-devotion" },
];

const resources: Array<{ label: CommunityLayoutLabel; to: string }> = [
  { label: "Communities", to: "/en/community/communities" },
  { label: "KalpX Rules", to: "/en/community/kalpx-rules" },
  { label: "Privacy Policy", to: "/en/community/privacy-policy" },
  { label: "User Agreements", to: "/en/community/user-agreements" },
  { label: "About KalpX", to: "/en/community/about-kalpx" },
];

function getLangFromPath() {
  if (typeof window === "undefined") return "en";
  return window.location.pathname.split("/")[1] || "en";
}

export function CommunityWebLayout({
  activeLabel = "Home",
  children,
  centerWidth = 920,
  topBarRightSlot,
  rightRailSlot,
  hideRightRail = false,
  hideDesktopTopBar = false,
  showCreateButton = true,
}: CommunityWebLayoutProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDesktop, setIsDesktop] = useState(false);
  const [popularCommunities, setPopularCommunities] = useState<
    CommunityListItem[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] =
    useState<CommunityGlobalSearchResult>({
      communities: [],
      posts: [],
      users: [],
    });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lang = getLangFromPath();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(min-width: 1280px)");
    const sync = () => setIsDesktop(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;
    let mounted = true;
    void getTopCommunities({ page: 1, page_size: 6, lang }).then((data) => {
      if (!mounted) return;
      setPopularCommunities((data.results ?? []) as CommunityListItem[]);
    });
    return () => {
      mounted = false;
    };
  }, [isDesktop, lang]);

  useEffect(() => {
    setIsSearching(false);
    setSearchQuery("");
    setSearchLoading(false);
    setSearchError(null);
    setSearchResults({ communities: [], posts: [], users: [] });
    abortRef.current?.abort();
  }, [location.pathname]);

  useEffect(() => {
    if (!isSearching) return;
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => window.clearTimeout(timer);
  }, [isSearching]);

  useEffect(() => {
    if (!isDesktop || !isSearching) return;
    if (!searchQuery.trim()) {
      abortRef.current?.abort();
      setSearchResults({ communities: [], posts: [], users: [] });
      setSearchLoading(false);
      setSearchError(null);
      return;
    }

    const debounce = window.setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setSearchLoading(true);
      setSearchError(null);

      try {
        const results = await getCommunityGlobalSearch(searchQuery, {
          signal: controller.signal,
        });
        setSearchResults(results);
      } catch (err: any) {
        if (err?.name === "CanceledError" || err?.name === "AbortError") return;
        setSearchError("Failed to perform search");
        setSearchResults({ communities: [], posts: [], users: [] });
      } finally {
        if (abortRef.current === controller) {
          setSearchLoading(false);
        }
      }
    }, 500);

    return () => window.clearTimeout(debounce);
  }, [isDesktop, isSearching, searchQuery]);

  const combinedResults = useMemo(() => {
    return [
      ...(searchResults.communities.length > 0
        ? [
            { type: "header", title: "Communities", id: "h-comm" },
            ...searchResults.communities.map((item, index) => ({
              ...item,
              type: "community",
              id: item.id || item.slug || `community-${index}`,
            })),
          ]
        : []),
      ...(searchResults.posts.length > 0
        ? [
            { type: "header", title: "Posts", id: "h-posts" },
            ...searchResults.posts.map((item, index) => ({
              ...item,
              type: "post",
              id: item.id || `post-${index}`,
            })),
          ]
        : []),
      ...(searchResults.users.length > 0
        ? [
            { type: "header", title: "Users", id: "h-users" },
            ...searchResults.users.map((item, index) => ({
              ...item,
              type: "user",
              id: item.id || item.username || `user-${index}`,
            })),
          ]
        : []),
    ];
  }, [searchResults]);

  const closeSearch = () => {
    abortRef.current?.abort();
    setIsSearching(false);
    setSearchQuery("");
    setSearchLoading(false);
    setSearchError(null);
    setSearchResults({ communities: [], posts: [], users: [] });
  };

  const handleResultClick = (item: any) => {
    closeSearch();
    if (item.type === "post" && item.id) {
      navigate(`/en/community/${item.id}`);
      return;
    }
    if (item.type === "community") {
      const communitySlug = item.slug || item.community_slug;
      if (communitySlug) {
        navigate(`/en/community/communities/${communitySlug}`);
        return;
      }
      navigate("/en/community/communities");
    }
  };

  const leftRail = useMemo(
    () => (
      <aside style={leftRailStyle}>
        <nav style={{ display: "grid", gap: 4 }}>
          {primaryItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.to)}
              style={primaryNavItemStyle(activeLabel === item.label)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* <div style={dividerStyle} /> */}

        {/* <div>
          <SectionLabel title="RECENT" />
          <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
            {recentCommunities.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(`/en/community/communities/${item.slug}`)}
                style={recentItemStyle}
              >
                <div style={recentAvatarStyle}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                    {item.label.charAt(2)}
                  </span>
                </div>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div> */}

        <div style={dividerStyle} />

        <button
          type="button"
          onClick={() => navigate("/en/community/activity")}
          style={activityButtonStyle}
        >
          Your Activity
        </button>

        <div style={dividerStyle} />

        <div>
          <SectionLabel title="RESOURCES" />
          <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
            {resources.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.to)}
                style={resourceItemStyle(activeLabel === item.label)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </aside>
    ),
    [activeLabel, navigate],
  );

  const rightRail = useMemo(() => {
    if (rightRailSlot) {
      return <aside style={rightRailStyle}>{rightRailSlot}</aside>;
    }

    return (
      <aside style={rightRailStyle}>
        <h2
          style={{
            margin: 0,
            color: "#111",
            fontSize: 22,
            lineHeight: 1.15,
            fontWeight: 800,
          }}
        >
          Popular Communities
        </h2>
        <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
          {popularCommunities.map((community) => (
            <button
              key={String(community.id || community.slug)}
              type="button"
              onClick={() => {
                if (!community.slug) return;
                navigate(`/en/community/communities/${community.slug}`);
              }}
              style={popularCardStyle}
            >
              <div
                style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
              >
                {/* <img
                  src={resolveCommunityImage(community)}
                  alt={community.name || "Community"}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    objectFit: "cover",
                    flexShrink: 0,
                  }}
                /> */}
                <div style={{ minWidth: 0 }}>
                  <div style={popularTitleStyle}>
                    {community.name || "Community"}
                  </div>
                  <div style={popularMetaStyle}>
                    {Number(community.follower_count ?? 0)} followers •{" "}
                    {Number(community.post_count ?? 0)} posts
                  </div>
                  <div style={popularDescriptionStyle}>
                    {community.description ||
                      "Share reflections, practice, and meaningful conversation."}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>
    );
  }, [navigate, popularCommunities, rightRailSlot]);

  if (!isDesktop) {
    return (
      <div style={{ minHeight: "100dvh", background: "var(--kalpx-bg)" }}>
        <CommunityTopBar
          activeLabel={activeLabel}
          rightSlot={topBarRightSlot}
        />
        <div
          style={{
            width: "100%",
            maxWidth: centerWidth,
            margin: "0 auto",
            paddingBottom: 40,
          }}
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: "var(--kalpx-bg)" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 1840,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: hideRightRail
            ? "200px minmax(0, 1fr)"
            : "200px minmax(0, 1fr) 340px",
          gap: 0,
          alignItems: "start",
        }}
      >
        <div style={railWrapperStyle}>{leftRail}</div>

        <main
          style={{
            minWidth: 0,
            borderLeft: "1px solid #d8d3c9",
            borderRight: "1px solid #d8d3c9",
          }}
        >
          <div style={{ padding: "10px 20px ", position: "relative" }}>
            {!hideDesktopTopBar ? (
              <div style={centerTopBarStyle}>
                {isSearching ? (
                  <div style={desktopSearchInputWrapStyle}>
                    <Search size={20} color="#6b7280" />
                    <input
                      ref={inputRef}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search communities, posts, users..."
                      style={desktopSearchInputStyle}
                    />
                    {searchQuery.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        aria-label="Clear search"
                        style={desktopSearchIconButtonStyle}
                      >
                        <XCircle size={18} color="#6b7280" />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={closeSearch}
                      style={desktopSearchCloseButtonStyle}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSearching(true)}
                    style={searchButtonStyle}
                  >
                    <Search size={18} color="#25211b" />
                    <span>{t('communityWebLayout.searchPlaceholder')}</span>
                  </button>
                )}
                {showCreateButton ? (
                  <button
                    type="button"
                    onClick={() => navigate("/en/community/new")}
                    style={createButtonStyle}
                  >
                    <div style={createIconBoxStyle}>
                      <Plus size={18} />
                    </div>
                    <span>{t('communityWebLayout.createButton')}</span>
                  </button>
                ) : null}
                {topBarRightSlot}
              </div>
            ) : null}

            {!hideDesktopTopBar && isSearching ? (
              <div style={desktopSearchResultsPanelStyle}>
                {searchLoading && searchQuery.length > 0 ? (
                  <div style={desktopSearchStatusStyle}>
                    Loading search results...
                  </div>
                ) : null}

                {!searchLoading && searchError ? (
                  <div
                    style={{ ...desktopSearchStatusStyle, color: "#9f3a2f" }}
                  >
                    {searchError}
                  </div>
                ) : null}

                {!searchLoading && !searchError && searchQuery.length === 0 ? (
                  <div style={desktopSearchEmptyStateStyle}>
                    <Search size={44} strokeWidth={1.4} />
                    <div>Type to search communities, posts, and users</div>
                  </div>
                ) : null}

                {!searchLoading &&
                !searchError &&
                searchQuery.length > 0 &&
                combinedResults.length === 0 ? (
                  <div style={desktopSearchEmptyStateStyle}>
                    <div>No results found for "{searchQuery}"</div>
                  </div>
                ) : null}

                {!searchLoading &&
                !searchError &&
                combinedResults.length > 0 ? (
                  <div style={{ paddingBottom: 10 }}>
                    {combinedResults.map((item) =>
                      item.type === "header" ? (
                        <div key={item.id} style={desktopSearchHeaderStyle}>
                          {item.title}
                        </div>
                      ) : (
                        <button
                          key={`${item.type}-${item.id}`}
                          type="button"
                          onClick={() => handleResultClick(item)}
                          style={desktopSearchResultButtonStyle}
                        >
                          <div style={desktopSearchResultIconStyle}>
                            <span style={{ fontSize: 18 }}>
                              {item.type === "community"
                                ? "👥"
                                : item.type === "post"
                                  ? "📄"
                                  : "👤"}
                            </span>
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={desktopSearchResultTitleStyle}>
                              {item.name ||
                                item.title ||
                                item.content ||
                                item.username ||
                                item.display_name ||
                                "Result"}
                            </div>
                            <div style={desktopSearchResultMetaStyle}>
                              {item.type === "community"
                                ? `${item.member_count || 0} members`
                                : item.type === "post"
                                  ? `in ${item.community_name || "Community"}`
                                  : "User"}
                            </div>
                          </div>
                        </button>
                      ),
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div
              style={{ width: "100%", maxWidth: centerWidth, margin: "0 auto" }}
            >
              {children}
            </div>
          </div>
        </main>

        {!hideRightRail ? (
          <div style={railWrapperStyle}>{rightRail}</div>
        ) : null}
      </div>
    </div>
  );
}

function SectionLabel({ title }: { title: string }) {
  return (
    <div
      style={{
        color: "#9ba2ae",
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: "0.06em",
      }}
    >
      {title}
    </div>
  );
}

const railWrapperStyle = {
  position: "sticky",
  top: 80,
  alignSelf: "start",
  height: "calc(100vh - 88px)",
  overflow: "auto",
} as const;

const leftRailStyle = {
  padding: "10px 20px",
} as const;

const rightRailStyle = {
  padding: "10px 10px",
} as const;

const centerTopBarStyle = {
  display: "flex",
  alignItems: "center",
  gap: 18,
  marginBottom: 8,
} as const;

const searchButtonStyle = {
  flex: 1,
  minHeight: 40,
  border: "none",
  borderRadius: 12,
  background: "#f2f2f4",
  padding: "0 18px",
  display: "flex",
  alignItems: "center",
  gap: 14,
  color: "#9aa0aa",
  fontSize: 17,
  fontWeight: 600,
  cursor: "pointer",
  textAlign: "left",
} as const;

const desktopSearchInputWrapStyle = {
  flex: 1,
  minHeight: 54,
  borderRadius: 14,
  background: "#f2f2f4",
  padding: "0 12px 0 18px",
  display: "flex",
  alignItems: "center",
  gap: 12,
} as const;

const desktopSearchInputStyle = {
  flex: 1,
  minWidth: 0,
  border: "none",
  outline: "none",
  background: "transparent",
  color: "#25211b",
  fontSize: 16,
  fontWeight: 500,
} as const;

const desktopSearchIconButtonStyle = {
  border: "none",
  background: "transparent",
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
} as const;

const desktopSearchCloseButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#4b5563",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  padding: 0,
} as const;

const desktopSearchResultsPanelStyle = {
  position: "absolute",
  top: 78,
  left: 22,
  right: 22,
  zIndex: 220,
  background: "#fff",
  border: "1px solid #e9e5de",
  borderRadius: 18,
  boxShadow: "0 16px 32px rgba(0,0,0,0.08)",
  overflow: "hidden",
  maxHeight: "min(70vh, calc(100dvh - 132px))",
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
} as const;

const desktopSearchStatusStyle = {
  padding: "20px 18px",
  color: "#7b7468",
} as const;

const desktopSearchEmptyStateStyle = {
  padding: "36px 18px",
  textAlign: "center",
  color: "#999",
  fontSize: 15,
  display: "grid",
  gap: 10,
  justifyItems: "center",
} as const;

const desktopSearchHeaderStyle = {
  background: "#f8f8f8",
  padding: "8px 16px",
  borderBottom: "1px solid #eee",
  fontSize: 12,
  fontWeight: 700,
  color: "#666",
  textTransform: "uppercase",
} as const;

const desktopSearchResultButtonStyle = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: 15,
  padding: 15,
  border: "none",
  borderBottom: "1px solid #f0f0f0",
  background: "#fff",
  textAlign: "left",
  cursor: "pointer",
} as const;

const desktopSearchResultIconStyle = {
  width: 36,
  height: 36,
  borderRadius: 18,
  background: "#f9f9f9",
  border: "1px solid #eee",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#D69E2E",
  flexShrink: 0,
} as const;

const desktopSearchResultTitleStyle = {
  fontSize: 16,
  fontWeight: 500,
  color: "#333",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
} as const;

const desktopSearchResultMetaStyle = {
  fontSize: 13,
  color: "#888",
  marginTop: 2,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
} as const;

const createButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#2b241d",
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
  padding: 0,
} as const;

const createIconBoxStyle = {
  width: 28,
  height: 28,
  borderRadius: 4,
  border: "1px solid #2b241d",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
} as const;

function primaryNavItemStyle(active: boolean) {
  return {
    width: "100%",
    border: "none",
    borderRadius: 14,
    background: active ? "rgb(255, 249, 236)" : "transparent",
    color: "#1d1b17",
    textAlign: "left",
    padding: "14px 22px",
    fontSize: 17,
    fontWeight: active ? 800 : 500,
    cursor: "pointer",
  } as const;
}

const dividerStyle = {
  borderTop: "1px solid #1d1b17",
  margin: "24px 0",
  opacity: 0.8,
} as const;

const recentItemStyle = {
  width: "100%",
  border: "none",
  background: "transparent",
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: 0,
  color: "#24211d",
  fontSize: 14,
  cursor: "pointer",
  textAlign: "left",
} as const;

const recentAvatarStyle = {
  width: 34,
  height: 34,
  borderRadius: 17,
  background: "linear-gradient(180deg, #d9aa57, #7a3d12)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
} as const;

const activityButtonStyle = {
  width: "100%",
  border: "none",
  background: "transparent",
  color: "#1d1b17",
  fontSize: 18,
  fontWeight: 700,
  textAlign: "center",
  cursor: "pointer",
} as const;

function resourceItemStyle(active: boolean) {
  return {
    width: "100%",
    border: "none",
    background: "transparent",
    color: active ? "#111" : "#24211d",
    textAlign: "left",
    padding: 0,
    fontSize: 16,
    fontWeight: active ? 700 : 500,
    cursor: "pointer",
  } as const;
}

const popularCardStyle = {
  width: "100%",
  borderRadius: 18,
  border: "1px solid #d9a321",
  background: "#fff",
  padding: "16px 14px",
  textAlign: "left",
  cursor: "pointer",
} as const;

const popularTitleStyle = {
  color: "#24211d",
  fontSize: 17,
  fontWeight: 800,
  lineHeight: 1.15,
} as const;

const popularMetaStyle = {
  marginTop: 6,
  color: "#6f7481",
  fontSize: 14,
  fontWeight: 700,
  lineHeight: 1.2,
} as const;

const popularDescriptionStyle = {
  marginTop: 8,
  color: "#465062",
  fontSize: 15,
  lineHeight: 1.35,
} as const;
