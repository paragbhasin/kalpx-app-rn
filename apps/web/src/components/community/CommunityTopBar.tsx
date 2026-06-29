import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Search,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getCommunityGlobalSearch,
  type CommunityGlobalSearchResult,
} from "../../engine/communityApi";
import { useTranslation } from "../../lib/i18n";

interface CommunityTopBarProps {
  activeLabel?:
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
  rightSlot?: ReactNode;
}

export function CommunityTopBar({
  activeLabel = "Home",
  rightSlot,
}: CommunityTopBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const navLabelMap: Record<string, string> = {
    'Home': t('communityTopBar.navHome'),
    'Top': t('communityTopBar.navTop'),
    'Popular': t('communityTopBar.navPopular'),
    'Explore': t('communityTopBar.navExplore'),
    'Your Activity': t('communityTopBar.yourActivity'),
    'Communities': t('communityTopBar.menuCommunities'),
    'Privacy Policy': t('communityTopBar.menuPrivacyPolicy'),
    'User Agreements': t('communityTopBar.menuUserAgreements'),
    'KalpX Rules': t('communityTopBar.menuKalpxRules'),
    'About KalpX': t('communityTopBar.menuAboutKalpx'),
  };
  const [menuOpen, setMenuOpen] = useState(false);
  const [recentOpen, setRecentOpen] = useState(true);
  const [resourcesOpen, setResourcesOpen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
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

  const recentCommunities = [
    {
      label: "k/Meditation & Mindfulness",
      color: "#d4a373",
    },
    {
      label: "k/Ramayana Insights",
      color: "#bc6c25",
    },
    {
      label: "k/Yoga Practice",
      color: "#8338ec",
    },
    {
      label: "k/Ayurveda Life",
      color: "#fb5607",
    },
    {
      label: "k/Vedic Wisdom",
      color: "#ff006e",
    },
  ];

  const resources = [
    "Communities",
    "Privacy Policy",
    "User Agreements",
    "KalpX Rules",
    "About KalpX",
  ];

  const resourceRoutes: Partial<Record<(typeof resources)[number], string>> = {
    Communities: "/en/community/communities",
    "Privacy Policy": "/en/community/privacy-policy",
    "User Agreements": "/en/community/user-agreements",
    "KalpX Rules": "/en/community/kalpx-rules",
    "About KalpX": "/en/community/about-kalpx",
  };

  const primaryItems: Array<{
    label: "Home" | "Top" | "Popular" | "Explore";
    to: string;
  }> = [
    { label: "Home", to: "/en/community" },
    { label: "Top", to: "/en/community/top" },
    { label: "Popular", to: "/en/community/popular" },
    { label: "Explore", to: "/en/community/explore" },
  ];

  const resolvedActiveLabel = useMemo(() => {
    const matchedResource = Object.entries(resourceRoutes).find(
      ([, route]) => route === location.pathname,
    )?.[0] as CommunityTopBarProps["activeLabel"] | undefined;

    if (matchedResource) return matchedResource;
    return activeLabel;
  }, [activeLabel, location.pathname]);

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
    if (!isSearching) return;
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
        setSearchError(t('communityTopBar.searchFailed'));
        setSearchResults({ communities: [], posts: [], users: [] });
      } finally {
        if (abortRef.current === controller) {
          setSearchLoading(false);
        }
      }
    }, 500);

    return () => window.clearTimeout(debounce);
  }, [isSearching, searchQuery]);

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
      return;
    }
  };

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "#fff",
        borderBottom: "1px solid #e9e5de",
      }}
    >
      <div
        style={{
          maxWidth: 620,
          margin: "0 auto",
          height: 48,
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        {isSearching ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeSearch();
              }}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#000",
              }}
              aria-label="Back"
            >
              <ArrowLeft size={22} />
            </button>
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                background: "#f0f0f0",
                borderRadius: 20,
                padding: "0 12px",
                height: 40,
              }}
            >
              <input
                ref={inputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('communityTopBar.searchPlaceholder')}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  fontSize: 15,
                  color: "#000",
                }}
              />
              {searchQuery.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#999",
                  }}
                  aria-label="Clear search"
                >
                  <XCircle size={18} fill="currentColor" strokeWidth={0} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/en/community");
                }}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  cursor: "pointer",
                  color: "#2a241e",
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: "Georgia, serif",
                  lineHeight: 1,
                }}
              >
                {t('communityTopBar.communityHeading')}
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((value) => !value);
                }}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                  color: "#2f2a25",
                  fontSize: 18,
                  fontWeight: 500,
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                }}
              >
                <span>{navLabelMap[resolvedActiveLabel] ?? resolvedActiveLabel}</span>
                {menuOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button
                aria-label="Search community"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  setIsSearching(true);
                }}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#2f2a25",
                }}
              >
                <Search size={19} strokeWidth={1.9} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/en/community/new");
                }}
                aria-label="Create post"
                style={{
                  width: 23,
                  height: 23,
                  borderRadius: 4,
                  background: "#fff",
                  border: "1px solid #2f2a25",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#2f2a25",
                }}
              >
                <Plus size={16} strokeWidth={1.9} />
              </button>

              {rightSlot}
            </div>
          </>
        )}
      </div>

      {isSearching && (
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 0,
            right: 0,
            background: "#fff",
            borderBottom: "1px solid #e9e5de",
            boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ maxWidth: 620, margin: "0 auto", minHeight: 120 }}>
            {searchLoading && searchQuery.length > 0 && (
              <div style={{ padding: "20px 16px", color: "#7b7468" }}>
                {t('communityTopBar.searchLoading')}
              </div>
            )}

            {!searchLoading && searchError && (
              <div style={{ padding: "20px 16px", color: "#9f3a2f" }}>
                {searchError}
              </div>
            )}

            {!searchLoading && !searchError && searchQuery.length === 0 && (
              <div
                style={{
                  padding: "36px 16px",
                  textAlign: "center",
                  color: "#999",
                }}
              >
                <Search
                  size={48}
                  strokeWidth={1.4}
                  style={{ margin: "0 auto 10px" }}
                />
                <div style={{ fontSize: 15 }}>
                  {t('communityTopBar.searchEmptyPrompt')}
                </div>
              </div>
            )}

            {!searchLoading &&
              !searchError &&
              searchQuery.length > 0 &&
              combinedResults.length === 0 && (
                <div
                  style={{
                    padding: "36px 16px",
                    textAlign: "center",
                    color: "#999",
                    fontSize: 15,
                  }}
                >
                  {t('communityTopBar.searchNoResults').replace('{searchQuery}', searchQuery)}
                </div>
              )}

            {!searchLoading && !searchError && combinedResults.length > 0 && (
              <div style={{ paddingBottom: 10 }}>
                {combinedResults.map((item) =>
                  item.type === "header" ? (
                    <div
                      key={item.id}
                      style={{
                        background: "#f8f8f8",
                        padding: "8px 16px",
                        borderBottom: "1px solid #eee",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#666",
                        textTransform: "uppercase",
                      }}
                    >
                      {item.title}
                    </div>
                  ) : (
                    <button
                      key={`${item.type}-${item.id}`}
                      onClick={() => handleResultClick(item)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 15,
                        padding: 15,
                        border: "none",
                        borderBottom: "1px solid #f0f0f0",
                        background: "#fff",
                        textAlign: "left",
                        cursor: item.type === "user" ? "default" : "pointer",
                      }}
                    >
                      <div
                        style={{
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
                        }}
                      >
                        {item.type === "community" ? (
                          <span style={{ fontSize: 18 }}>👥</span>
                        ) : item.type === "post" ? (
                          <span style={{ fontSize: 18 }}>📄</span>
                        ) : (
                          <span style={{ fontSize: 18 }}>👤</span>
                        )}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 500,
                            color: "#333",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.name ||
                            item.title ||
                            item.content ||
                            item.username ||
                            item.display_name ||
                            t('communityTopBar.searchResultFallback')}
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#888",
                            marginTop: 2,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.type === "community"
                            ? t('communityTopBar.searchResultMemberCount').replace('{count}', String(item.member_count || 0))
                            : item.type === "post"
                              ? t('communityTopBar.searchResultInCommunity').replace('{communityName}', item.community_name || 'Community')
                              : t('communityTopBar.searchResultUserLabel')}
                        </div>
                      </div>
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {menuOpen && (
        <>
          <button
            aria-label="Close community menu"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(false);
            }}
            style={{
              position: "fixed",
              inset: 0,
              background: "transparent",
              border: "none",
              padding: 0,
              margin: 0,
              zIndex: 19,
              cursor: "default",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 36,
              left: "50%",
              transform: "translateX(-50%)",
              width: 245,
              zIndex: 21,
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                border: "1px solid #f3f4f6",
                maxHeight: "480px",
                overflowY: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: "#e5e7eb transparent",
              }}
            >
              <div style={{ padding: "8px 0" }}>
                {primaryItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      navigate(item.to);
                    }}
                    onMouseEnter={() => setHoveredItem(item.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                    style={{
                      width: "100%",
                      background:
                        hoveredItem === item.label ? "#f9fafb" : "none",
                      border: "none",
                      textAlign: "left",
                      padding: "12px 24px",
                      fontSize: 16,
                      fontWeight: 500,
                      color: "#111827",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                  >
                    {navLabelMap[item.label] ?? item.label}
                  </button>
                ))}
              </div>

              <SectionDivider />

              {/* <div style={{ padding: "16px 0 8px" }}>
                <SectionHeader
                  title="RECENT"
                  open={recentOpen}
                  onClick={() => setRecentOpen((value) => !value)}
                />
                {recentOpen && (
                  <div style={{ padding: "8px 0" }}>
                    {recentCommunities.map((item) => (
                      <button
                        key={item.label}
                        onMouseEnter={() => setHoveredItem(item.label)}
                        onMouseLeave={() => setHoveredItem(null)}
                        style={{
                          ...communityRowStyle,
                          background:
                            hoveredItem === item.label ? "#f9fafb" : "none",
                          padding: "8px 24px",
                          transition: "background-color 0.2s",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: item.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              color: "#fff",
                              fontSize: 10,
                              fontWeight: 700,
                            }}
                          >
                            {item.label.split("/")[1]?.charAt(0)}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: 14,
                            color: "#111827",
                            fontWeight: 500,
                          }}
                        >
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div> */}

              <SectionDivider />

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  navigate("/en/community/activity");
                }}
                onMouseEnter={() => setHoveredItem("activity")}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  width: "100%",
                  background: hoveredItem === "activity" ? "#f9fafb" : "none",
                  border: "none",
                  padding: "16px 24px",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#111827",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "background-color 0.2s",
                }}
              >
                {t('communityTopBar.yourActivity')}
              </button>

              <SectionDivider />

              <div style={{ padding: "16px 0 16px" }}>
                <SectionHeader
                  title={t('communityTopBar.resourcesSection')}
                  open={resourcesOpen}
                  onClick={() => setResourcesOpen((value) => !value)}
                />
                {resourcesOpen && (
                  <div style={{ padding: "8px 0" }}>
                    {resources.map((item) => (
                      <button
                        key={item}
                        onClick={(e) => {
                          e.stopPropagation();
                          const route = resourceRoutes[item];
                          if (route) {
                            setMenuOpen(false);
                            navigate(route);
                          }
                        }}
                        onMouseEnter={() => setHoveredItem(item)}
                        onMouseLeave={() => setHoveredItem(null)}
                        style={{
                          width: "100%",
                          background: hoveredItem === item ? "#f9fafb" : "none",
                          border: "none",
                          textAlign: "left",
                          padding: "12px 24px",
                          fontSize: 16,
                          fontWeight: 500,
                          color: "#111827",
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                        }}
                      >
                        {navLabelMap[item] ?? item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SectionDivider() {
  return <div style={{ borderTop: "1px solid #f3f4f6" }} />;
}

function SectionHeader({
  title,
  open,
  onClick,
}: {
  title: string;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        background: "none",
        border: "none",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.05em",
          color: "#94a3b8",
        }}
      >
        {title}
      </span>
      {open ? (
        <ChevronUp size={18} color="#9ca3af" />
      ) : (
        <ChevronDown size={18} color="#9ca3af" />
      )}
    </button>
  );
}

const communityRowStyle: React.CSSProperties = {
  width: "100%",
  background: "none",
  border: "none",
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: "10px 0",
  fontSize: 14,
  color: "#1f1b17",
  cursor: "pointer",
  textAlign: "left",
};
