import { isAuthenticated } from "@kalpx/auth";
import { useCommunityFeedController } from "@kalpx/feature-flows";
import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CommunityEmptyState } from "../../components/community/CommunityEmptyState";
import { CommunityErrorState } from "../../components/community/CommunityErrorState";
import { CommunityFeedSkeleton } from "../../components/community/CommunityFeedSkeleton";
import { CommunityPostCard } from "../../components/community/CommunityPostCard";
import { CommunityWebLayout } from "../../components/community/CommunityWebLayout";
import {
  createCommunityComment,
  createCommunityPost,
  getCommunityComments,
  getCommunityPost,
  getPopularPosts,
  upvotePost,
} from "../../engine/communityApi";
import { webStorage } from "../../lib/webStorage";

export function CommunityPopularPage() {
  const navigate = useNavigate();
  const didInitialLoadRef = useRef(false);
  const lang =
    typeof window !== "undefined"
      ? window.location.pathname.split("/")[1] || "en"
      : "en";

  const communityApi = useMemo(
    () => ({
      getFeed: (params?: Record<string, any>) =>
        getPopularPosts({ ...params, lang, sort: "top" }),
      getPost: getCommunityPost,
      getComments: (postId: number | string, params?: Record<string, any>) =>
        getCommunityComments(postId, { ...params, lang }),
      createComment: createCommunityComment,
      upvotePost,
      createPost: createCommunityPost,
    }),
    [lang],
  );

  const ctrl = useCommunityFeedController({
    api: communityApi,
    isAuthenticated: () => isAuthenticated(webStorage),
    onRequireAuth: (returnPath) => {
      const to = encodeURIComponent(returnPath ?? "/en/community/popular");
      navigate(`/login?returnTo=${to}`);
    },
  });

  useEffect(() => {
    if (didInitialLoadRef.current) return;
    didInitialLoadRef.current = true;
    void ctrl.loadFeed(true);
  }, [ctrl, lang]);

  return (
    <CommunityWebLayout activeLabel="Popular" centerWidth={920}>
      <div style={{ padding: "5px" }}>
          {ctrl.feedLoading && <CommunityFeedSkeleton />}

          {!ctrl.feedLoading && ctrl.feedError && (
            <CommunityErrorState
              message={ctrl.feedError}
              onRetry={() => void ctrl.loadFeed(true)}
            />
          )}

          {!ctrl.feedLoading && !ctrl.feedError && ctrl.posts.length === 0 && (
            <CommunityEmptyState showCreateCta />
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
            {ctrl.posts.map((post) => (
              <CommunityPostCard
                key={post.id}
                post={post}
                onUpvote={(id) =>
                  void ctrl.upvotePost(id, `/en/community/${id}`)
                }
                isUpvoting={ctrl.upvotingId === post.id}
              />
            ))}
          </div>

          {ctrl.hasMore && !ctrl.feedLoading && (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <button
                onClick={() => void ctrl.loadMore()}
                style={{
                  padding: "10px 28px",
                  borderRadius: 10,
                  color: "var(--kalpx-text)",
                  border: "none",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Load more
              </button>
            </div>
          )}
      </div>
    </CommunityWebLayout>
  );
}
