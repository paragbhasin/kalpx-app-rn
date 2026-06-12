import { isAuthenticated } from "@kalpx/auth";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommunityWebLayout } from "../../components/community/CommunityWebLayout";
import {
  followCommunity,
  getFollowedCommunities,
  getCommunities,
  unfollowCommunity,
  type CommunityListItem,
} from "../../engine/communityApi";
import { webStorage } from "../../lib/webStorage";
type ExploreTab = "all" | "followed";

export function CommunityExplorePage() {
  const navigate = useNavigate();
  const didInitialLoadRef = useRef(false);
  const [activeTab, setActiveTab] = useState<ExploreTab>("all");
  const [communities, setCommunities] = useState<CommunityListItem[]>([]);
  const [followedCommunities, setFollowedCommunities] = useState<CommunityListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [pendingJoinId, setPendingJoinId] = useState<number | string | null>(
    null,
  );

  const lang =
    typeof window !== "undefined"
      ? window.location.pathname.split("/")[1] || "en"
      : "en";

  const loadCommunities = async (pageNumber: number, reset = false) => {
    try {
      reset ? setLoading(true) : setLoadingMore(true);
      setError(null);
      const data = await getCommunities({
        page: pageNumber,
        page_size: 12,
        lang,
      });
      const incoming = (data.results ?? []) as CommunityListItem[];
      setCommunities((prev) => (reset ? incoming : [...prev, ...incoming]));
      setHasMore(!!data.next);
      setPage(pageNumber);
    } catch {
      setError("Could not load communities. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (didInitialLoadRef.current) return;
    didInitialLoadRef.current = true;
    void loadCommunities(1, true);
  }, [lang]);

  const loadFollowedCommunities = async () => {
    if (!(await isAuthenticated(webStorage))) {
      setFollowedCommunities([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getFollowedCommunities();
      setFollowedCommunities(data);
    } catch {
      setError("Could not load followed communities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: ExploreTab) => {
    setActiveTab(tab);
    if (tab === "followed") {
      void loadFollowedCommunities();
    }
  };

  const visibleCommunities = useMemo(() => {
    if (activeTab === "followed") {
      return followedCommunities;
    }
    return communities;
  }, [activeTab, communities, followedCommunities]);

  const handleJoinToggle = async (community: CommunityListItem) => {
    const idOrSlug = community.slug || community.id;
    if (!idOrSlug) return;

    if (!(await isAuthenticated(webStorage))) {
      const to = encodeURIComponent("/en/community/explore");
      navigate(`/login?returnTo=${to}`);
      return;
    }

    setPendingJoinId(community.id);
    const success = community.is_followed
      ? await unfollowCommunity(idOrSlug)
      : await followCommunity(idOrSlug);

    if (success) {
      setCommunities((prev) =>
        prev.map((item) =>
          String(item.id) === String(community.id)
            ? { ...item, is_followed: !community.is_followed }
            : item,
        ),
      );
      setFollowedCommunities((prev) => {
        if (community.is_followed) {
          return prev.filter((item) => String(item.id) !== String(community.id));
        }
        return [
          {
            ...community,
            is_followed: true,
          },
          ...prev.filter((item) => String(item.id) !== String(community.id)),
        ];
      });
    }
    setPendingJoinId(null);
  };

  return (
    <CommunityWebLayout activeLabel="Explore" centerWidth={920}>
      <div style={{ padding: "10px" }}>
          <h1
            style={{
              margin: 0,
              color: "#2a241e",
              fontSize: 18,
              lineHeight: 1.2,
              fontWeight: 700,
              fontFamily: "Georgia, serif",
            }}
          >
            Explore Communities
          </h1>

          <div
            style={{
              display: "flex",
              gap: 14,
              marginTop: 15,
              marginBottom: 15,
            }}
          >
            <button
              onClick={() => handleTabChange("all")}
              style={tabStyle(activeTab === "all")}
            >
              All
            </button>
            <button
              onClick={() => handleTabChange("followed")}
              style={tabStyle(activeTab === "followed")}
            >
              Followed by me
            </button>
          </div>

          <h2
            style={{
              margin: 0,
              color: "#2a241e",
              fontSize: 18,
              lineHeight: 1.2,
              fontWeight: 700,
              fontFamily: "Georgia, serif",
            }}
          >
            {activeTab === "all"
              ? "Recommended for you"
              : "Communities you follow"}
          </h2>

          {loading && (
            <div style={{ padding: "20px 0", color: "#7b7468" }}>
              Loading communities...
            </div>
          )}

          {!loading && error && (
            <div style={{ padding: "20px 0", color: "#9f3a2f" }}>{error}</div>
          )}

          {!loading && !error && visibleCommunities.length === 0 && (
            <div style={{ padding: "20px 0", color: "#7b7468" }}>
              {activeTab === "followed"
                ? "You are not following any communities yet."
                : "No communities found."}
            </div>
          )}

          {!loading && !error && visibleCommunities.length > 0 && (
            <div style={{ display: "grid", gap: 22, marginTop: 15 }}>
              {visibleCommunities.map((community) => (
                <article
                  key={String(community.id)}
                  style={{
                    border: "1px solid #edd3a2",
                    borderRadius: 10,
                    background: "#fff",
                    padding: "12px",
                    boxShadow: "0 2px 10px rgba(169, 132, 67, 0.08)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 16,
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          color: "#23211d",
                          fontSize: 15,

                          fontWeight: 700,
                          fontFamily: "Georgia, serif",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            if (!community.slug) return;
                            navigate(`/en/community/communities/${community.slug}`);
                          }}
                          style={{
                            border: "none",
                            background: "transparent",
                            padding: 0,
                            margin: 0,
                            color: "inherit",
                            font: "inherit",
                            cursor: community.slug ? "pointer" : "default",
                            textAlign: "left",
                          }}
                        >
                          {community.name || "Community"}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => void handleJoinToggle(community)}
                      disabled={pendingJoinId === community.id}
                      style={{
                        padding: "8px 25px",
                        borderRadius: 12,
                        border: "none",
                        background: community.is_followed
                          ? "#efe7d8"
                          : "#dda80d",
                        color: community.is_followed ? "#6b5a3b" : "#fff",
                        fontSize: 16,
                        fontWeight: 700,
                        cursor:
                          pendingJoinId === community.id
                            ? "default"
                            : "pointer",
                        opacity: pendingJoinId === community.id ? 0.75 : 1,
                        flexShrink: 0,
                      }}
                    >
                      {community.is_followed ? "Joined" : "Join"}
                    </button>
                  </div>

                  <p
                    style={{
                      margin: "15px 0 0",
                      color: "#44403c",
                      fontSize: 16,
                      lineHeight: 1.55,
                      maxWidth: 460,
                    }}
                  >
                    {community.description ||
                      "Share reflections, questions, and practices with people walking a similar path."}
                  </p>
                </article>
              ))}
            </div>
          )}

          {!loading && !error && activeTab === "all" && hasMore && (
            <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
              <button
                onClick={() => void loadCommunities(page + 1)}
                disabled={loadingMore}
                style={{
                  fontWeight: 600,
                  cursor: loadingMore ? "default" : "pointer",
                  opacity: loadingMore ? 0.7 : 1,
                }}
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
      </div>
    </CommunityWebLayout>
  );
}

function tabStyle(active: boolean) {
  return {
    padding: "5px 25px",
    borderRadius: 999,
    border: active ? "1.5px solid #d69e2e" : "1.5px solid #e1e4ea",
    background: active ? "#f8edc8" : "#fff",
    color: active ? "#111827" : "#6b7280",
    fontSize: 16,
    fontWeight: 700,

    cursor: "pointer",
    transition: "all 0.18s ease",
  } as const;
}
