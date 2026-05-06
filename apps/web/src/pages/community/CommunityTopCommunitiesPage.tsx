import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommunityTopBar } from "../../components/community/CommunityTopBar";
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

  const lang =
    typeof window !== "undefined"
      ? window.location.pathname.split("/")[1] || "en"
      : "en";

  useEffect(() => {
    const loadTopCommunities = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTopCommunities({ page, page_size: PAGE_SIZE, lang });
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
    <div style={{ minHeight: "100dvh", background: "var(--kalpx-bg)" }}>
      <CommunityTopBar activeLabel="Explore" />

      <div style={{ maxWidth: 620, margin: "0 auto", paddingBottom: 40 }}>
        <div style={{ padding: "12px 20px 40px" }}>
          {loading && communities.length === 0 && (
            <div
              style={{
                minHeight: 260,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#d69e2e",
                fontWeight: 600,
              }}
            >
              Loading communities...
            </div>
          )}

          {!loading && error && (
            <div style={{ padding: "20px 0", color: "#9f3a2f" }}>{error}</div>
          )}

          {!error && (
            <div style={{ paddingTop: 16 }}>
              {communities.map((community) => (
                <button
                  key={String(community.id || community.slug)}
                  type="button"
                  onClick={() => {
                    if (!community.slug) return;
                    navigate(`/en/community/communities/${community.slug}`);
                  }}
                  style={{
                    width: "100%",
                    border: "none",
                    background: "transparent",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: 0,
                    margin: "0 0 25px",
                    textAlign: "left",
                    cursor: community.slug ? "pointer" : "default",
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      color: "#666",
                      fontSize: 18,
                      textAlign: "left",
                      flexShrink: 0,
                    }}
                  >
                    {community.rank || "-"}
                  </div>
                  <img
                    src={resolveCommunityImage(community)}
                    alt={community.name || "Community"}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 30,
                      background: "#f0f0f0",
                      objectFit: "cover",
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      color: "#1a1a1a",
                      fontSize: 18,
                      fontWeight: 600,
                      lineHeight: 1.2,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      flex: 1,
                    }}
                  >
                    {community.name || "Community"}
                  </div>
                </button>
              ))}

              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 2,
                    paddingBottom: 40,
                  }}
                >
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
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: "0 8px",
                        fontSize: 18,
                        color: page === pageNumber ? "#D69E2E" : "#888",
                        fontWeight: page === pageNumber ? 700 : 400,
                        cursor: "pointer",
                      }}
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
