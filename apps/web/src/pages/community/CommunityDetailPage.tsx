import { isAuthenticated } from "@kalpx/auth";
import type { CommunityPost } from "@kalpx/types";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  FilePlus2,
  Globe,
  Plus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CommunityEmptyState } from "../../components/community/CommunityEmptyState";
import { CommunityErrorState } from "../../components/community/CommunityErrorState";
import { CommunityFeedSkeleton } from "../../components/community/CommunityFeedSkeleton";
import { CommunityPostCard } from "../../components/community/CommunityPostCard";
import { CommunityWebLayout } from "../../components/community/CommunityWebLayout";
import {
  downvotePost,
  followCommunity,
  getCommunityDetail,
  getCommunityPosts,
  getFollowedCommunities,
  unfollowCommunity,
  upvotePost,
  type CommunityListItem,
} from "../../engine/communityApi";
import { webStorage } from "../../lib/webStorage";
import {
  getConsistentCommunityStats,
  resolveCommunityImage,
} from "./communityVisuals";

type CommunityTab = "Feed" | "About";
type SortOption = "new" | "top" | "hot";

const PAGE_SIZE = 10;
const ABOUT_RULES = [
  {
    title: "No Spam",
    content: "Do not post spam or self-promotional content.",
  },
  {
    title: "No Politically Based Comments",
    content:
      "Keep the discussion focused on the community's theme and avoid political debate.",
  },
  {
    title: "No Personal Attacks",
    content:
      "Be respectful. Personal attacks and harassment will not be tolerated.",
  },
];

function getLangFromPath() {
  if (typeof window === "undefined") return "en";
  return window.location.pathname.split("/")[1] || "en";
}

function getCommunityCreatedLabel(value: unknown) {
  if (!value) return "Recently";
  const createdAt = new Date(String(value));
  if (Number.isNaN(createdAt.getTime())) return "Recently";

  const diffMs = Date.now() - createdAt.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / 86400000));
  if (diffDays < 30) return `${Math.max(1, diffDays)} d ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} mo ago`;

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} yr ago`;
}

function applyVoteChange<T extends { user_vote?: number | null; upvote_count?: number | null }>(
  target: T,
  voteType: "upvote" | "downvote",
): T {
  const currentVote = target.user_vote ?? 0;
  let nextVote: -1 | 0 | 1 = 0;
  let countChange = 0;

  if (voteType === "upvote") {
    if (currentVote === 1) {
      nextVote = 0;
      countChange = -1;
    } else if (currentVote === -1) {
      nextVote = 1;
      countChange = 2;
    } else {
      nextVote = 1;
      countChange = 1;
    }
  } else if (currentVote === -1) {
    nextVote = 0;
    countChange = 1;
  } else if (currentVote === 1) {
    nextVote = -1;
    countChange = -2;
  } else {
    nextVote = -1;
    countChange = -1;
  }

  return {
    ...target,
    user_vote: nextVote,
    upvote_count: Math.max(0, Number(target.upvote_count ?? 0) + countChange),
  };
}

export function CommunityDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const lang = getLangFromPath();

  const [community, setCommunity] = useState<CommunityListItem | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [activeTab, setActiveTab] = useState<CommunityTab>("Feed");
  const [sortBy, setSortBy] = useState<SortOption>("new");
  const [loadingCommunity, setLoadingCommunity] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [communityError, setCommunityError] = useState<string | null>(null);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [postsReloadKey, setPostsReloadKey] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [expandedRules, setExpandedRules] = useState<number[]>([]);
  const [upvotingId, setUpvotingId] = useState<number | string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(min-width: 1280px)");
    const sync = () => setIsDesktop(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!slug) return;

    const loadCommunity = async () => {
      setLoadingCommunity(true);
      setCommunityError(null);
      try {
        const [communityData, authed] = await Promise.all([
          getCommunityDetail(slug, { lang }),
          isAuthenticated(webStorage),
        ]);

        if (!mounted) return;
        if (!communityData) {
          setCommunityError("Community not found.");
          setCommunity(null);
          return;
        }

        setCommunity(communityData);
        if (!authed) {
          setJoined(false);
          return;
        }

        const followedCommunities = await getFollowedCommunities();
        if (!mounted) return;
        const joinedMatch = followedCommunities.some((item) => {
          const communitySlug = item.slug?.toLowerCase();
          const followedId = item.id?.toString();
          return (
            communitySlug === slug.toLowerCase() ||
            (!!communityData.id && followedId === String(communityData.id))
          );
        });
        setJoined(joinedMatch);
      } catch {
        if (!mounted) return;
        setCommunityError(
          "Could not load community details. Please try again.",
        );
      } finally {
        if (mounted) setLoadingCommunity(false);
      }
    };

    void loadCommunity();
    return () => {
      mounted = false;
    };
  }, [lang, slug]);

  useEffect(() => {
    let mounted = true;
    if (!slug) return;

    const loadPosts = async () => {
      setLoadingPosts(true);
      setPostsError(null);
      setPage(1);
      try {
        const response = await getCommunityPosts({
          community: slug,
          page: 1,
          page_size: PAGE_SIZE,
          sort: sortBy,
          lang,
        });
        if (!mounted) return;
        setPosts((response.results ?? []) as CommunityPost[]);
        setHasMore(!!response.next);
      } catch {
        if (!mounted) return;
        setPostsError("Could not load community posts. Please try again.");
      } finally {
        if (mounted) setLoadingPosts(false);
      }
    };

    void loadPosts();
    return () => {
      mounted = false;
    };
  }, [lang, postsReloadKey, slug, sortBy]);

  const stableStats = useMemo(
    () => getConsistentCommunityStats(slug || community?.id || "community"),
    [community?.id, slug],
  );

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/en/community/communities");
  };

  const handleJoinToggle = async () => {
    if (!slug || joinLoading) return;

    if (!(await isAuthenticated(webStorage))) {
      const to = encodeURIComponent(`/en/community/communities/${slug}`);
      navigate(`/login?returnTo=${to}`);
      return;
    }

    setJoinLoading(true);
    try {
      const success = joined
        ? await unfollowCommunity(slug)
        : await followCommunity(slug);

      if (success) {
        setJoined((value) => !value);
        setCommunity((current) =>
          current
            ? {
                ...current,
                follower_count: Math.max(
                  0,
                  Number(current.follower_count ?? 0) + (joined ? -1 : 1),
                ),
              }
            : current,
        );
      }
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!slug || loadingMore || loadingPosts || !hasMore) return;

    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const response = await getCommunityPosts({
        community: slug,
        page: nextPage,
        page_size: PAGE_SIZE,
        sort: sortBy,
        lang,
      });
      setPosts((current) => [
        ...current,
        ...((response.results ?? []) as CommunityPost[]),
      ]);
      setPage(nextPage);
      setHasMore(!!response.next);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCreatePost = async () => {
    if (!slug) return;
    if (!(await isAuthenticated(webStorage))) {
      const to = encodeURIComponent(`/en/community/communities/${slug}`);
      navigate(`/login?returnTo=${to}`);
      return;
    }
    navigate(`/en/community/new?communitySlug=${encodeURIComponent(slug)}`);
  };

  const handleUpvote = async (postId: number | string) => {
    if (!slug) return;
    if (!(await isAuthenticated(webStorage))) {
      const to = encodeURIComponent(`/en/community/communities/${slug}`);
      navigate(`/login?returnTo=${to}`);
      return;
    }

    setUpvotingId(postId);
    try {
      await upvotePost(postId);
      setPosts((current) =>
        current.map((post) =>
          String(post.id) === String(postId)
            ? applyVoteChange(
                {
                  ...post,
                  upvote_count: Number(post.upvote_count ?? post.likes_count ?? 0),
                },
                "upvote",
              )
            : post,
        ),
      );
    } finally {
      setUpvotingId(null);
    }
  };

  const handleDownvote = async (postId: number | string) => {
    if (!slug) return;
    if (!(await isAuthenticated(webStorage))) {
      const to = encodeURIComponent(`/en/community/communities/${slug}`);
      navigate(`/login?returnTo=${to}`);
      return;
    }

    setUpvotingId(postId);
    try {
      await downvotePost(postId);
      setPosts((current) =>
        current.map((post) =>
          String(post.id) === String(postId)
            ? applyVoteChange(
                {
                  ...post,
                  upvote_count: Number(post.upvote_count ?? post.likes_count ?? 0),
                },
                "downvote",
              )
            : post,
        ),
      );
    } finally {
      setUpvotingId(null);
    }
  };

  const toggleRule = (index: number) => {
    setExpandedRules((current) =>
      current.includes(index)
        ? current.filter((value) => value !== index)
        : [...current, index],
    );
  };

  if (loadingCommunity && !community) {
    return (
      <CommunityWebLayout activeLabel="Communities" centerWidth={920}>
        <div style={{ padding: "16px 12px 40px" }}>
          <CommunityFeedSkeleton />
        </div>
      </CommunityWebLayout>
    );
  }

  if (communityError || !community) {
    return (
      <CommunityWebLayout activeLabel="Communities" centerWidth={920}>
        <div style={{ padding: "20px 12px 40px" }}>
          <CommunityErrorState
            message={communityError ?? "Community not found."}
          />
        </div>
      </CommunityWebLayout>
    );
  }

  const desktopRightRail = isDesktop ? (
    <div style={{ display: "grid", gap: 26 }}>
      <section style={desktopSideCardStyle}>
        <h2 style={desktopSideTitleStyle}>About Community</h2>
        <div
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            marginTop: 10,
          }}
        >
          <img
            src={resolveCommunityImage(community)}
            alt={community.name || "Community"}
            style={desktopSideAvatarStyle}
          />
          <div style={{ minWidth: 0 }}>
            <div style={desktopSideCommunityNameStyle}>
              {community.name || "Community"}
            </div>
          </div>
        </div>

        <p style={desktopSideDescriptionStyle}>
          {community.description ||
            "Methods, challenges, and small wins in stillness and awareness."}
        </p>

        <div style={desktopSideMetaWrapStyle}>
          <div style={desktopSideMetaRowStyle}>
            <FilePlus2 size={20} />
            <span>
              Created {getCommunityCreatedLabel(community.created_at)}
            </span>
          </div>
          <div style={desktopSideMetaRowStyle}>
            <Globe size={20} />
            <span>Public</span>
          </div>
        </div>

        <div style={desktopStatsGridStyle}>
          <div>
            <div style={desktopStatValueStyle}>
              {stableStats.weeklyVisitors}
            </div>
            <div style={desktopStatLabelStyle}>Weekly Visitors</div>
          </div>
          <div>
            <div style={desktopStatValueStyle}>
              {stableStats.weeklyContribution}
            </div>
            <div style={desktopStatLabelStyle}>Contributions</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleJoinToggle()}
          disabled={joinLoading}
          style={desktopSideJoinButtonStyle(joined, joinLoading)}
        >
          {joined ? "Joined" : "Join"}
        </button>
      </section>

      <section style={desktopSideCardStyle}>
        <h3 style={desktopRulesTitleStyle}>
          {(community.name || "Community") + " Rules"}
        </h3>
        <div style={{ display: "grid", gap: 18 }}>
          {ABOUT_RULES.map((rule, index) => (
            <div key={rule.title}>
              <div style={desktopRuleHeadingStyle}>
                {index + 1}. {rule.title}
              </div>
              <div style={desktopRuleContentStyle}>{rule.content}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  ) : null;

  return (
    <CommunityWebLayout
      activeLabel="Communities"
      centerWidth={isDesktop ? 1120 : 920}
      rightRailSlot={desktopRightRail}
      showCreateButton={!isDesktop}
    >
      <div style={{ padding: "8px 10px 40px" }}>
        {!isDesktop ? (
          <button type="button" onClick={handleBack} style={backButtonStyle}>
            <ChevronLeft size={18} />
          </button>
        ) : null}

        <section style={isDesktop ? desktopHeaderSectionStyle : undefined}>
          <div
            style={{
              display: "flex",
              gap: isDesktop ? 18 : 14,
              alignItems: "center",
            }}
          >
            <img
              src={resolveCommunityImage(community)}
              alt={community.name || "Community"}
              style={{
                width: isDesktop ? 88 : 92,
                height: isDesktop ? 88 : 92,
                borderRadius: 999,
                objectFit: "cover",
                flexShrink: 0,
                boxShadow: "0 10px 28px rgba(61, 44, 18, 0.12)",
              }}
            />

            <div style={{ minWidth: 0, flex: 1 }}>
              <h1
                style={{
                  margin: 0,
                  color: "#2b241d",
                  fontSize: isDesktop ? 20 : 16,

                  fontWeight: 800,
                  fontFamily: "Georgia, serif",
                }}
              >
                {community.name || "Community"}
              </h1>

              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  gap: isDesktop ? 18 : 16,
                  flexWrap: "wrap",
                  color: "#6e7482",
                  fontSize: isDesktop ? 15 : 14,
                  fontWeight: 700,
                }}
              >
                <span>
                  Followers : {Number(community.follower_count ?? 0)}{" "}
                </span>
                <span> Posts : {Number(community.post_count ?? 0)} </span>
              </div>

              <button
                type="button"
                onClick={() => void handleJoinToggle()}
                disabled={joinLoading}
                style={{
                  marginTop: 14,
                  border: "none",
                  borderRadius: 10,
                  background: joined ? "#e3e5ea" : "#d69e2e",
                  color: joined ? "#495366" : "#fff",
                  padding: "6px 20px",
                  minWidth: isDesktop ? 204 : undefined,
                  fontSize: isDesktop ? 17 : 14,
                  fontWeight: 700,
                  cursor: joinLoading ? "default" : "pointer",
                  opacity: joinLoading ? 0.7 : 1,
                }}
              >
                {joined ? "Joined" : "Join"}
              </button>
            </div>
          </div>

          {isDesktop ? (
            <button
              type="button"
              onClick={() => void handleCreatePost()}
              style={desktopCreatePostButtonStyle}
            >
              <Plus size={18} />
              <span>Create post</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => void handleCreatePost()}
                style={createPostButtonStyle}
              >
                + Create post
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginTop: 18,
                  borderTop: "1px solid rgba(176, 146, 103, 0.22)",
                  paddingTop: 14,
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveTab("Feed")}
                  style={tabButtonStyle(activeTab === "Feed")}
                >
                  Feed
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("About")}
                  style={tabButtonStyle(activeTab === "About")}
                >
                  About
                </button>
              </div>
            </>
          )}
        </section>

        {!isDesktop && activeTab === "About" ? (
          <section style={aboutCardStyle}>
            <h2
              style={{
                margin: 0,
                fontSize: 24,
                color: "#2b241d",
                lineHeight: 1.1,
                fontWeight: 700,
                fontFamily: "Georgia, serif",
              }}
            >
              {community.name || "Community"}
            </h2>

            <p
              style={{
                margin: "12px 0 0",
                color: "#4f463c",
                fontSize: 15,
                lineHeight: 1.7,
              }}
            >
              {community.description || "No description available."}
            </p>

            <div
              style={{
                marginTop: 20,
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              <div style={metricCardStyle}>
                <div style={metricValueStyle}>{stableStats.weeklyVisitors}</div>
                <div style={metricLabelStyle}>Weekly Visitors</div>
              </div>
              <div style={metricCardStyle}>
                <div style={metricValueStyle}>
                  {stableStats.weeklyContribution}
                </div>
                <div style={metricLabelStyle}>Weekly Contribution</div>
              </div>
            </div>

            <div style={{ marginTop: 28 }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#2b241d",
                  fontFamily: "Georgia, serif",
                }}
              >
                {(community.name || "Community") + " Rules"}
              </h3>

              <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                {ABOUT_RULES.map((rule, index) => {
                  const expanded = expandedRules.includes(index);
                  return (
                    <div key={rule.title} style={ruleCardStyle}>
                      <button
                        type="button"
                        onClick={() => toggleRule(index)}
                        style={ruleHeaderStyle}
                      >
                        <span style={{ fontWeight: 700, color: "#32291f" }}>
                          {index + 1}. {rule.title}
                        </span>
                        {expanded ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </button>
                      {expanded && (
                        <p
                          style={{
                            margin: "10px 0 0",
                            color: "#5d5247",
                            fontSize: 14,
                            lineHeight: 1.6,
                          }}
                        >
                          {rule.content}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ) : (
          <>
            {loadingPosts && <CommunityFeedSkeleton />}

            {!loadingPosts && postsError && (
              <CommunityErrorState
                message={postsError}
                onRetry={() => setPostsReloadKey((value) => value + 1)}
              />
            )}

            {!loadingPosts && !postsError && posts.length === 0 && (
              <CommunityEmptyState showCreateCta />
            )}

            <div
              style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}
            >
              {posts.map((post) => (
                <CommunityPostCard
                  key={post.id}
                  post={post}
                  onUpvote={(id) => void handleUpvote(id)}
                  onDownvote={(id) => void handleDownvote(id)}
                  isUpvoting={upvotingId === post.id}
                />
              ))}
            </div>

            {hasMore && !loadingPosts && !postsError && (
              <div style={{ textAlign: "center", padding: "14px 0 0" }}>
                <button
                  type="button"
                  onClick={() => void handleLoadMore()}
                  disabled={loadingMore}
                  style={{
                    border: "none",
                    borderRadius: 12,
                    background: "#efe7d8",
                    color: "#3f3425",
                    padding: "10px 22px",
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: loadingMore ? "default" : "pointer",
                    opacity: loadingMore ? 0.75 : 1,
                  }}
                >
                  {loadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </CommunityWebLayout>
  );
}

const backButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#1f1b16",
  padding: "6px 2px",
  marginBottom: 8,
  display: "inline-flex",
  cursor: "pointer",
} as const;

const desktopHeaderSectionStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 24,
  padding: "8px 4px 30px",
  borderBottom: "1px solid rgba(176, 146, 103, 0.22)",
} as const;

const createPostButtonStyle = {
  marginTop: 18,
  width: "100%",

  borderRadius: 16,
  border: "1px solid #d59d19",

  color: "#2b241d",
  padding: "10px",
  fontSize: 15,
  fontWeight: 700,

  cursor: "pointer",
} as const;

const desktopCreatePostButtonStyle = {
  border: "1px solid #d59d19",
  borderRadius: 999,
  background: "#fff",
  color: "#1d1b17",
  padding: "12px 24px",
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
} as const;

const aboutCardStyle = {
  marginTop: 16,
  background: "#fff",
  border: "1px solid #efe4cf",
  borderRadius: 22,
  padding: 18,
  boxShadow: "0 10px 26px rgba(123, 93, 45, 0.06)",
} as const;

const metricCardStyle = {
  borderRadius: 16,
  background: "#fbf4e5",
  padding: "16px 14px",
} as const;

const metricValueStyle = {
  color: "#2f271e",
  fontSize: 22,
  fontWeight: 700,
  lineHeight: 1.1,
  fontFamily: "Georgia, serif",
} as const;

const metricLabelStyle = {
  marginTop: 6,
  color: "#736657",
  fontSize: 13,
  fontWeight: 600,
} as const;

const ruleCardStyle = {
  border: "1px solid #eee2cd",
  borderRadius: 14,
  background: "#fffdf9",
  padding: 14,
} as const;

const ruleHeaderStyle = {
  width: "100%",
  border: "none",
  background: "transparent",
  padding: 0,
  margin: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  color: "#5d5247",
  textAlign: "left",
} as const;

function tabButtonStyle(active: boolean) {
  return {
    border: active ? " 2px solid #f7e7bc" : "transparent",

    color: active ? "#2b241d" : "#7d725f",
    borderRadius: 20,
    padding: "5px 25px",
    fontSize: 14,
    fontWeight: active ? 700 : 600,
    cursor: "pointer",
  } as const;
}

const desktopSideCardStyle = {
  border: "1px solid #e3e0da",
  borderRadius: 22,
  background: "#fff",
  padding: 15,
  boxShadow: "0 8px 22px rgba(41, 33, 20, 0.04)",
} as const;

const desktopSideTitleStyle = {
  margin: 0,
  color: "#2d261f",
  fontSize: 20,
  lineHeight: 1.1,
  fontWeight: 700,
  fontFamily: "Georgia, serif",
} as const;

const desktopSideAvatarStyle = {
  width: 55,
  height: 55,
  borderRadius: 999,
  objectFit: "cover",
  flexShrink: 0,
} as const;

const desktopSideCommunityNameStyle = {
  color: "#2f2c2b",
  fontSize: 18,

  fontWeight: 800,
} as const;

const desktopSideDescriptionStyle = {
  paddingTop: 10,
  color: "#4f5b6c",
  fontSize: 14,
  lineHeight: 1.55,
} as const;

const desktopSideMetaWrapStyle = {
  marginTop: 24,
  paddingTop: 24,
  borderTop: "1px solid #ece8e0",
  display: "grid",
  gap: 18,
} as const;

const desktopSideMetaRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  color: "#4f5b6c",
  fontSize: 16,
  fontWeight: 500,
} as const;

const desktopStatsGridStyle = {
  marginTop: 28,
  paddingTop: 28,
  borderTop: "1px solid #ece8e0",
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 16,
} as const;

const desktopStatValueStyle = {
  color: "#2a2a30",
  fontSize: 16,
  lineHeight: 1.05,
  fontWeight: 800,
} as const;

const desktopStatLabelStyle = {
  marginTop: 6,
  color: "#98a0ad",
  fontSize: 14,
  lineHeight: 1.25,
  fontWeight: 500,
} as const;

function desktopSideJoinButtonStyle(joined: boolean, loading: boolean) {
  return {
    width: "100%",
    marginTop: 28,
    border: "none",
    borderRadius: 16,
    background: joined ? "#e3e5ea" : "#d69e2e",
    color: joined ? "#4a5568" : "#fff",
    padding: "10px",
    fontSize: 14,
    fontWeight: 800,
    cursor: loading ? "default" : "pointer",
    opacity: loading ? 0.7 : 1,
  } as const;
}

const desktopRulesTitleStyle = {
  color: "#2d261f",
  fontSize: 16,
  lineHeight: 1.2,
  fontWeight: 700,
  paddingBottom: 10,
  fontFamily: "Georgia, serif",
} as const;

const desktopRuleHeadingStyle = {
  color: "#30323a",
  fontSize: 14,
  lineHeight: 1.35,
  fontWeight: 700,
} as const;

const desktopRuleContentStyle = {
  marginTop: 8,
  color: "#5b6574",
  fontSize: 15,
  lineHeight: 1.6,
} as const;
