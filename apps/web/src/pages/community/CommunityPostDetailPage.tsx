import { isAuthenticated as checkAuth } from "@kalpx/auth";
import { useCommunityFeedController } from "@kalpx/feature-flows";
import type { CommunityComment } from "@kalpx/types";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { CommunityCommentComposer } from "../../components/community/CommunityCommentComposer";
import { CommunityCommentList } from "../../components/community/CommunityCommentList";
import { CommunityErrorState } from "../../components/community/CommunityErrorState";
import { CommunityPostCard } from "../../components/community/CommunityPostCard";
import { CommunityTopBar } from "../../components/community/CommunityTopBar";
import {
  createCommunityComment,
  createCommunityPost,
  deleteCommunityComment,
  getCommunityComments,
  getCommunityFeed,
  getCommunityPost,
  getCommunityProfileDetails,
  reportCommunityContent,
  updateCommunityComment,
  upvotePost,
} from "../../engine/communityApi";
import { webStorage } from "../../lib/webStorage";

const communityApi = {
  getFeed: getCommunityFeed,
  getPost: getCommunityPost,
  getComments: getCommunityComments,
  createComment: createCommunityComment,
  upvotePost,
  createPost: createCommunityPost,
};

export function CommunityPostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [authed, setAuthed] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | string | null>(
    null,
  );
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<CommunityComment | null>(null);
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentActionLoadingId, setCommentActionLoadingId] = useState<
    number | string | null
  >(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const ok = await checkAuth(webStorage);
      if (!mounted) return;
      setAuthed(ok);
      if (!ok) {
        setCurrentUserId(null);
        setCurrentUserEmail(null);
        setCurrentUsername(null);
        return;
      }
      const profile = await getCommunityProfileDetails();
      if (!mounted) return;
      const me =
        profile?.profile?.user ??
        profile?.data?.profile?.user ??
        profile?.user ??
        profile?.profile ??
        profile?.data?.user ??
        profile?.data ??
        profile ??
        null;
      setCurrentUserId(me?.id ?? null);
      setCurrentUserEmail(me?.email ?? null);
      setCurrentUsername(me?.username ?? null);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const ctrl = useCommunityFeedController({
    api: communityApi,
    isAuthenticated: () => checkAuth(webStorage),
    onRequireAuth: (returnPath) => {
      const to = encodeURIComponent(returnPath ?? `/en/community/${postId}`);
      navigate(`/login?returnTo=${to}`);
    },
  });
  const isQuestionMode = searchParams.get("mode") === "questions";

  useEffect(() => {
    if (!postId) return;
    void ctrl.loadPost(postId);
    void ctrl.loadComments(postId, { is_question: isQuestionMode });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, isQuestionMode]);

  const post = ctrl.post;
  const totalCommentCount = countComments(ctrl.comments);

  const requireAuth = () => {
    const to = encodeURIComponent(`/en/community/${postId}`);
    navigate(`/login?returnTo=${to}`);
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/en/community");
  };

  const openCommentMode = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("mode");
    setSearchParams(next, { replace: true });
    if (typeof window === "undefined") return;
    const composer = document.getElementById("community-comment-composer");
    composer?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const openQuestionMode = () => {
    const next = new URLSearchParams(searchParams);
    next.set("mode", "questions");
    setSearchParams(next, { replace: true });
    if (typeof window === "undefined") return;
    const composer = document.getElementById("community-comment-composer");
    composer?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const refreshComments = async () => {
    if (!postId) return;
    await ctrl.loadComments(postId, { is_question: isQuestionMode });
  };

  const handleSubmitComment = async (content: string) => {
    if (!post) return;
    setCommentSubmitting(true);
    setCommentError(null);
    try {
      await createCommunityComment({
        post: post.id,
        content,
        parent: replyingTo?.id,
        ...(isQuestionMode ? { is_question: true } : {}),
      });
      setReplyingTo(null);
      await refreshComments();
    } catch (err: any) {
      setCommentError(
        err?.response?.data?.detail ??
          err?.message ??
          "Failed to post comment.",
      );
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleEditComment = async (
    commentId: number | string,
    content: string,
  ) => {
    setCommentActionLoadingId(commentId);
    try {
      await updateCommunityComment(commentId, content);
      await refreshComments();
    } finally {
      setCommentActionLoadingId(null);
    }
  };

  const handleDeleteComment = async (commentId: number | string) => {
    setCommentActionLoadingId(commentId);
    try {
      await deleteCommunityComment(commentId);
      if (replyingTo?.id && String(replyingTo.id) === String(commentId)) {
        setReplyingTo(null);
      }
      await refreshComments();
    } finally {
      setCommentActionLoadingId(null);
    }
  };

  const handleReportComment = async (commentId: number | string) => {
    setCommentActionLoadingId(commentId);
    try {
      await reportCommunityContent(
        "comment",
        commentId,
        "spam",
        "Reported from web community comment menu",
      );
    } finally {
      setCommentActionLoadingId(null);
    }
  };

  if (ctrl.postLoading) {
    return (
      <div style={{ minHeight: "100dvh", background: "var(--kalpx-bg)" }}>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "28px 16px" }}>
          <div
            style={{
              width: 60,
              height: 14,
              borderRadius: 4,
              background: "var(--kalpx-chip-bg)",
              marginBottom: 24,
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              width: "85%",
              height: 22,
              borderRadius: 4,
              background: "var(--kalpx-chip-bg)",
              marginBottom: 10,
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              width: "70%",
              height: 14,
              borderRadius: 4,
              background: "var(--kalpx-chip-bg)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    );
  }

  if (ctrl.postError || !post) {
    return (
      <div style={{ minHeight: "100dvh", background: "var(--kalpx-bg)" }}>
        <CommunityTopBar />
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "28px 16px" }}>
          <CommunityErrorState message={ctrl.postError ?? "Post not found."} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: "var(--kalpx-bg)" }}>
      <CommunityTopBar />
      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ padding: 5 }}>
          <button
            onClick={handleBack}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              padding: "6px 8px 10px",
              color: "#2d1a0e",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={18} />
            Back
          </button>
          <CommunityPostCard
            post={post}
            commentCountOverride={totalCommentCount}
            detailMode
            isUpvoting={ctrl.upvotingId === post.id}
            onUpvote={() =>
              void ctrl.upvotePost(post.id, `/en/community/${post.id}`)
            }
            onCommentClick={() => {
              openCommentMode();
            }}
            onAskQuestionClick={() => {
              openQuestionMode();
            }}
          />

          <div style={{ padding: "8px 14px 0" }}>
            <div
              style={{ height: 1, background: "#efe7d8", marginBottom: 22 }}
            />
          </div>

          <div style={{ padding: "0 14px 24px" }}>
            <p
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--kalpx-text)",
                marginBottom: 18,
              }}
            >
              {isQuestionMode
                ? `Questions (${totalCommentCount})`
                : `Comments (${totalCommentCount})`}
            </p>

            <div id="community-comment-composer" style={{ marginBottom: 24 }}>
              <CommunityCommentComposer
                postId={post.id}
                isAuthenticated={authed}
                submitting={commentSubmitting}
                error={commentError}
                placeholder={
                  isQuestionMode
                    ? "Ask a question..."
                    : "Join the conversation here...."
                }
                submitLabel="Post"
                leadingAvatarLabel="K"
                onSubmit={(content) => {
                  void handleSubmitComment(content);
                }}
                onRequireAuth={requireAuth}
              />
            </div>

            <CommunityCommentList
              comments={ctrl.comments}
              loading={ctrl.commentsLoading}
              currentUserId={currentUserId}
              currentUserEmail={currentUserEmail}
              currentUsername={currentUsername}
              isAuthenticated={authed}
              actionLoadingId={commentActionLoadingId}
              onReply={(comment) => {
                setReplyingTo(comment);
                if (typeof window !== "undefined") {
                  const composer = document.getElementById(
                    "community-comment-composer",
                  );
                  composer?.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }
              }}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
              onReport={handleReportComment}
              onRequireAuth={requireAuth}
              replyingToId={replyingTo?.id ?? null}
              replySubmitting={commentSubmitting}
              replyError={commentError}
              onCancelReply={() => setReplyingTo(null)}
              onSubmitReply={(content) => {
                void handleSubmitComment(content);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function countComments(comments: CommunityComment[]): number {
  return comments.reduce(
    (total, comment) => total + 1 + countComments(comment.children ?? []),
    0,
  );
}
