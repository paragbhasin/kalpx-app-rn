import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommunityWebLayout } from "../../components/community/CommunityWebLayout";
import {
  getTopCommunities,
  type CommunityListItem,
} from "../../engine/communityApi";
import { resolveCommunityImage } from "./communityVisuals";

const PAGE_SIZE = 12;

export function CommunityTopCommunitiesPage() {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<CommunityListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  });

  const lang =
    typeof window !== "undefined"
      ? window.location.pathname.split("/")[1] || "en"
      : "en";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const loadTopCommunities = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTopCommunities({
          page,
          page_size: PAGE_SIZE,
          lang,
        });
        setCommunities(data.results ?? []);
        const count = Number(data.count ?? 0);
        setTotalPages(Math.max(1, Math.ceil(count / PAGE_SIZE)));
      } catch {
        setError("Could not load top communities. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    void loadTopCommunities();
  }, [lang, page]);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages],
  );

  return (
    <CommunityWebLayout
      activeLabel="Communities"
      centerWidth={1400}
      hideRightRail
    >
      <div style={isMobile ? mobilePageWrapStyle : pageWrapStyle}>
        <header style={headerStyle}>
          <h1 style={titleStyle}>Top Communities</h1>
          <p style={subtitleStyle}>Browse KalpX largest communities</p>
        </header>

        {loading && communities.length === 0 ? (
          <div style={statusStyle}>Loading communities...</div>
        ) : null}

        {!loading && error ? (
          <div style={{ ...statusStyle, color: "#9f3a2f" }}>{error}</div>
        ) : null}

        {!error ? (
          <>
            <div style={isMobile ? mobileGridStyle : gridStyle}>
              {communities.map((community) => (
                <button
                  key={String(community.id || community.slug)}
                  type="button"
                  onClick={() => {
                    if (!community.slug) return;
                    navigate(`/en/community/communities/${community.slug}`);
                  }}
                  style={communityRowStyle(Boolean(community.slug))}
                >
                  <div style={rankStyle}>{community.rank || "-"}</div>
                  <img
                    src={resolveCommunityImage(community)}
                    alt={community.name || "Community"}
                    style={avatarStyle}
                  />
                  <div style={communityNameStyle}>
                    {community.name || "Community"}
                  </div>
                </button>
              ))}
            </div>

            {totalPages > 1 ? (
              <div style={paginationWrapStyle}>
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  style={navButtonStyle(page === 1)}
                >
                  <ChevronLeft size={20} />
                </button>

                {pageNumbers.map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    style={pageNumberStyle(page === pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={page === totalPages}
                  style={navButtonStyle(page === totalPages)}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </CommunityWebLayout>
  );
}

const pageWrapStyle = {} as const;

const mobilePageWrapStyle = {
  paddingLeft: 12,
  paddingRight: 12,
} as const;

const headerStyle = {
  padding: "14px 0 16px",
  borderBottom: "1px solid #ece8de",
  marginBottom: 28,
} as const;

const titleStyle = {
  margin: 0,
  fontSize: 18,
  lineHeight: 1.15,
  fontWeight: 800,
  color: "#2f3133",
} as const;

const subtitleStyle = {
  margin: "8px 0 0",
  fontSize: 16,
  color: "#6f7680",
} as const;

const statusStyle = {
  minHeight: 260,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#d69e2e",
  fontWeight: 600,
} as const;

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  columnGap: 56,
  rowGap: 34,
} as const;

const mobileGridStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  rowGap: 22,
} as const;

function communityRowStyle(clickable: boolean) {
  return {
    width: "100%",
    border: "none",
    background: "transparent",
    display: "grid",
    gridTemplateColumns: "28px 72px minmax(0, 1fr)",
    alignItems: "center",
    columnGap: 10,
    padding: 0,
    textAlign: "left",
    cursor: clickable ? "pointer" : "default",
  } as const;
}

const rankStyle = {
  color: "#6b6b6b",
  fontSize: 16,
  lineHeight: 1,
  fontWeight: 500,
} as const;

const avatarStyle = {
  borderRadius: 999,
  background: "#f0f0f0",
  objectFit: "cover",
  flexShrink: 0,
} as const;

const communityNameStyle = {
  color: "#2f3133",
  fontSize: 14,
  lineHeight: 1.2,
  fontWeight: 800,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
} as const;

const paginationWrapStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 4,
  padding: "36px 0 0",
} as const;

function navButtonStyle(disabled: boolean) {
  return {
    border: "none",
    background: "transparent",
    color: "#888",
    opacity: disabled ? 0.3 : 1,
    cursor: disabled ? "default" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  } as const;
}

function pageNumberStyle(active: boolean) {
  return {
    border: "none",
    background: "transparent",
    padding: "0 8px",
    fontSize: 18,
    color: active ? "#D69E2E" : "#888",
    fontWeight: active ? 700 : 400,
    cursor: "pointer",
  } as const;
}
