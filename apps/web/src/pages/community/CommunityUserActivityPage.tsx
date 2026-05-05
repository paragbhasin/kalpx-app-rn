import { isAuthenticated } from "@kalpx/auth";
import type { CommunityPost } from "@kalpx/types";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommunityPostCard } from "../../components/community/CommunityPostCard";
import { CommunityTopBar } from "../../components/community/CommunityTopBar";
import {
  getCommunityActivity,
  getCommunityProfileDetails,
  getFollowedCommunities,
  upvotePost,
  type CommunityActivityType,
} from "../../engine/communityApi";
import { webStorage } from "../../lib/webStorage";

const TAB_TO_TYPE: Record<string, CommunityActivityType> = {
  overview: "my_posts",
  post: "my_posts",
  questions: "my_questions",
  comments: "my_comments",
  useful: "useful_marks",
  saved: "saved_posts",
  hidden: "hidden_posts",
  upvoted: "upvotes",
  downvoted: "downvotes",
};

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "post", label: "Post" },
  { id: "questions", label: "Questions" },
  { id: "comments", label: "Comments" },
  { id: "useful", label: "Useful" },
  { id: "saved", label: "Saved" },
  { id: "hidden", label: "Hidden" },
  { id: "upvoted", label: "Upvoted" },
  { id: "downvoted", label: "Downvoted" },
] as const;

type ActivityState = {
  loading: boolean;
  data: any[];
};

type ActivityCache = Partial<Record<CommunityActivityType, ActivityState>>;

export function CommunityUserActivityPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [profileDetails, setProfileDetails] = useState<any | null>(null);
  const [stats, setStats] = useState<any>({});
  const [followedCommunities, setFollowedCommunities] = useState<any[]>([]);
  const [activity, setActivity] = useState<ActivityCache>({});
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      setPageLoading(true);
      const authed = await isAuthenticated(webStorage);
      if (!authed) {
        navigate("/login?returnTo=%2Fen%2Fcommunity%2Factivity", {
          replace: true,
        });
        return;
      }

      const [profile, statsData, communities] = await Promise.all([
        getCommunityProfileDetails(),
        getCommunityActivity("stats"),
        getFollowedCommunities(),
      ]);

      if (!mounted) return;
      setProfileDetails(profile);
      setStats(statsData[0] || {});
      setFollowedCommunities(communities);
      setPageLoading(false);
    }

    void bootstrap();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    const type = TAB_TO_TYPE[activeTab];
    if (!type || activity[type]?.data) return;

    let mounted = true;
    setActivity((prev) => ({
      ...prev,
      [type]: { loading: true, data: prev[type]?.data || [] },
    }));

    void getCommunityActivity(type).then((data) => {
      if (!mounted) return;
      setActivity((prev) => ({
        ...prev,
        [type]: { loading: false, data },
      }));
    });

    return () => {
      mounted = false;
    };
  }, [activeTab, activity]);

  const activeType = TAB_TO_TYPE[activeTab];
  const activeState = activity[activeType];
  const data = activeState?.data || [];
  const loading = pageLoading || activeState?.loading;
  const userProfile = profileDetails?.profile || {};

  const mergedData = useMemo(
    () =>
      data.map((item) => {
        const isJoined =
          item.is_joined ||
          followedCommunities.some((community: any) => {
            const communitySlug = community.slug?.toLowerCase();
            const itemSlug = (
              item.community_slug ||
              item.community?.slug ||
              item.slug
            )?.toLowerCase();
            const communityId = community.id?.toString();
            const itemId = (
              item.community_id ||
              item.community?.id ||
              item.community
            )?.toString();
            return (
              (communitySlug && itemSlug && communitySlug === itemSlug) ||
              (communityId && itemId && communityId === itemId)
            );
          });

        return { ...item, is_joined: isJoined };
      }),
    [data, followedCommunities],
  );

  return (
    <div style={{ minHeight: "100dvh", background: "#fff" }}>
      <CommunityTopBar activeLabel="Your Activity" />
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "10px 0 24px" }}>
        <div style={{ padding: "0 16px", marginBottom: 8 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img
                src={
                  userProfile.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    userProfile.profile_name || "User",
                  )}`
                }
                alt={userProfile.profile_name || "User"}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  background: "#eee",
                  border: "2px solid #fff",
                  objectFit: "cover",
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#111",
                    lineHeight: 1.2,
                  }}
                >
                  {userProfile.profile_name || "User"}
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "#999",
                    lineHeight: 1.3,
                  }}
                >
                  {userProfile.user?.username || "user"}
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              background: "#f8f1e7",
              padding: 12,
              borderRadius: 8,
              marginBottom: 24,
            }}
          >
            <StatItem value={stats.karma || 1} label="Karma" />
            <StatItem
              value={
                (stats.posts_count || 0) + (stats.comments_count || 0) || 1
              }
              label="Contribution"
            />
            <StatItem value={`${stats.days_active ?? 0} d`} label="On Kalpx" />
            <StatItem
              value={stats.communities_active || 0}
              label="Active In >"
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: 20,
              overflowX: "auto",
              scrollbarWidth: "none",
              marginBottom: 8,
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: "none",
                  border: "none",
                  padding: "8px 0",
                  fontSize: 14,
                  fontWeight: 700,
                  color: activeTab === tab.id ? "#D69E2E" : "#8E8D8D",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
            Loading activity…
          </div>
        ) : mergedData.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#111",
                  marginBottom: 8,
                }}
              >
                Nothing here yet
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: "#999",
                  lineHeight: "20px",
                  maxWidth: 280,
                }}
              >
                Your community activity will appear here once you start posting,
                commenting, saving, or voting.
              </div>
            </div>
          </div>
        ) : (
          mergedData.map((item, index) => (
            <div
              key={`${item._activity_id || item.id || "activity"}-${index}`}
              style={{ marginBottom: 16 }}
            >
              {item.is_useful_mark && (
                <div
                  style={{
                    background: "#FFF9E6",
                    margin: "0 16px -12px",
                    padding: 12,
                    borderRadius: 8,
                    border: "1px solid #FFE082",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 4,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: "#B8860B",
                        letterSpacing: 0.5,
                      }}
                    >
                      MARKED USEFUL
                    </span>
                    <span style={{ color: "#ccc" }}>•</span>
                    <span style={{ fontSize: 11, color: "#999" }}>
                      {formatRelativeTime(item.marked_useful_at)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#444",
                      fontStyle: "italic",
                    }}
                  >
                    "{item.comment?.content}"
                  </div>
                </div>
              )}

              <CommunityPostCard
                post={item as CommunityPost}
                onUpvote={() => {
                  void upvotePost(item.id);
                }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatItem({ value, label }: { value: string | number; label: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>
        {value}
      </div>
      <div
        style={{ fontSize: 12, color: "#999", fontWeight: 500, marginTop: 2 }}
      >
        {label}
      </div>
    </div>
  );
}

function formatRelativeTime(value?: string) {
  if (!value) return "";
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "";

  const diffMs = timestamp - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, "minute");
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return rtf.format(diffHours, "hour");
  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) return rtf.format(diffDays, "day");
  const diffMonths = Math.round(diffDays / 30);
  if (Math.abs(diffMonths) < 12) return rtf.format(diffMonths, "month");
  const diffYears = Math.round(diffMonths / 12);
  return rtf.format(diffYears, "year");
}
