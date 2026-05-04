import { isAuthenticated } from "@kalpx/auth";
import type { CommunityPost } from "@kalpx/types";
import { getPostAuthor, getPostText } from "@kalpx/types";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  EyeOff,
  Flag,
  Play,
} from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  hideCommunityPost,
  reportCommunityContent,
  saveCommunityPost,
  unsaveCommunityPost,
} from "../../engine/communityApi";
import { executeAction } from "../../engine/actionExecutor";
import { addAdditionalItem } from "../../engine/mitraApi";
import { WEB_ENV } from "../../lib/env";
import { store } from "../../store";
import { webStorage } from "../../lib/webStorage";
import { CommunityReactionBar } from "./CommunityReactionBar";

interface CommunityPostCardProps {
  post: CommunityPost;
  onUpvote?: (postId: number | string) => void;
  isUpvoting?: boolean;
  detailMode?: boolean;
  onCommentClick?: () => void;
}

function getLinkedItemSubtitle(
  linkedItem?: CommunityPost["linked_item"],
): string {
  if (!linkedItem?.type) return "";
  const [categoryRaw, itemTypeRaw] = linkedItem.type.split(":");
  const category = categoryRaw?.trim().toLowerCase();
  const itemType = itemTypeRaw?.trim().toLowerCase();
  const isGeneral = category === "general";

  if (itemType === "mantra") {
    return isGeneral
      ? "Add this mantra to your daily rhythm."
      : "Add this to your daily practice - progress happens gently";
  }

  if (itemType === "sankalp") {
    return isGeneral
      ? "Carry this sankalp with you through the day."
      : "Add this to your daily practice - progress happens gently";
  }

  if (itemType === "practice") {
    return isGeneral
      ? "Bring this practice into your day."
      : "Add this to your daily practice - progress happens gently";
  }

  return "Add this to your daily practice - progress happens gently";
}

function inferMediaType(value?: string | null): "image" | "video" {
  if (!value) return "image";
  return /\.(mp4|mov|webm|m4v)$/i.test(value) ? "video" : "image";
}

function resolveLinkedItemType(
  linkedItem?: CommunityPost["linked_item"],
): "mantra" | "sankalp" | "practice" | null {
  if (!linkedItem?.id) return null;
  if (linkedItem.id.startsWith("mantra.")) return "mantra";
  if (linkedItem.id.startsWith("sankalp.")) return "sankalp";
  if (linkedItem.id.startsWith("practice.")) return "practice";

  const rawType = String(linkedItem.type || "").split(":")[1]?.trim().toLowerCase();
  if (rawType === "mantra" || rawType === "sankalp" || rawType === "practice") {
    return rawType;
  }
  return null;
}

export function CommunityPostCard({
  post,
  onUpvote,
  isUpvoting = false,
  detailMode = false,
  onCommentClick,
}: CommunityPostCardProps) {
  const navigate = useNavigate();
  const text = getPostText(post);
  const author = getPostAuthor(post);
  const [isExpanded, setIsExpanded] = useState(detailMode);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isJoined, setIsJoined] = useState(!!(post as any).is_joined);
  const [isSaved, setIsSaved] = useState(!!post.is_saved);
  const [isHidden, setIsHidden] = useState(!!post.is_hidden);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isLaunchingLinkedItem, setIsLaunchingLinkedItem] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const resolveMediaUrl = (value?: string | null) => {
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith("//")) return `https:${value}`;
    return `${WEB_ENV.imageBaseUrl}${value.startsWith("/") ? "" : "/"}${value}`;
  };

  const communityAvatar =
    (post as any).community?.icon ||
    author?.avatar_url ||
    author?.profile_pic ||
    "/lotus_icon.png";
  const timeAgo = useMemo(() => {
    if (!post.created_at) return "";
    try {
      const diff = Date.now() - new Date(post.created_at).getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) return "just now";
      if (mins < 60) return `${mins}m ago`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      if (days < 30) return `${days}d ago`;
      const months = Math.floor(days / 30);
      if (months < 12) return `${months} mo ago`;
      const years = Math.floor(months / 12);
      return `${years} yr ago`;
    } catch {
      return "";
    }
  }, [post.created_at]);

  const slides = useMemo(() => {
    if (post.slide_layouts?.length) {
      return post.slide_layouts
        .map((slide, index) => {
          const rawSrc =
            (slide as any).video_url ||
            (slide as any).video ||
            (slide as any).image_url ||
            (slide as any).image ||
            (slide as any).url ||
            (slide as any).media_url ||
            "";
          const inferredType = inferMediaType(rawSrc);

          return {
            id: String((slide as any).id ?? `${post.id}-slide-${index}`),
            order: (slide as any).order ?? index,
            type: slide.type ?? inferredType,
            src: resolveMediaUrl(rawSrc),
            thumbnail:
              resolveMediaUrl(
                (slide as any).thumbnail_url ||
                  (slide as any).thumbnail ||
                  (inferredType === "image"
                    ? (slide as any).image_url || (slide as any).image
                    : "") ||
                  "",
              ) || undefined,
            aspectRatio:
              (slide as any).layout?.aspect_ratio ||
              (slide as any).aspect_ratio ||
              "4:5",
          };
        })
        .sort((a, b) => a.order - b.order);
    }
    if (post.media?.length) {
      return post.media.map((item, index) => ({
        id: `${post.id}-media-${index}`,
        order: index,
        type: item.type === "video" ? "video" : "image",
        src: resolveMediaUrl(item.url),
        thumbnail:
          resolveMediaUrl(item.thumbnail_url || undefined) || undefined,
        aspectRatio: "4:5",
      }));
    }
    if (post.images?.length) {
      return post.images.map((url, index) => ({
        id: `${post.id}-image-${index}`,
        order: index,
        type: "image" as const,
        src: resolveMediaUrl(url),
        thumbnail: undefined,
        aspectRatio: "4:5",
      }));
    }
    if (post.media_url) {
      return [
        {
          id: `${post.id}-hero`,
          order: 0,
          type: resolveMediaUrl(post.media_url).match(/\.(mp4|mov|webm)$/i)
            ? ("video" as const)
            : ("image" as const),
          src: resolveMediaUrl(post.media_url),
          thumbnail: undefined,
          aspectRatio: "4:5",
        },
      ];
    }
    return [];
  }, [post]);

  const activeSlide = slides[activeIndex] ?? null;
  const activeAspectRatio = useMemo(() => {
    const raw = String(activeSlide?.aspectRatio || "4:5");
    const [w, h] = raw.split(":").map(Number);
    if (!w || !h) return "4 / 5";
    return `${w} / ${h}`;
  }, [activeSlide]);
  const shouldTruncate = text.length > 180;
  const previewText =
    !shouldTruncate || isExpanded ? text : `${text.slice(0, 180).trimEnd()}...`;
  const linkedItemTitle = post.linked_item?.name?.trim() || "";
  const linkedItemSubtitle = getLinkedItemSubtitle(post.linked_item);
  const linkedItemType = resolveLinkedItemType(post.linked_item);
  const handleCardNavigate = () => {
    if (detailMode) return;
    navigate(`/en/community/${post.id}`);
  };

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((idx) => (idx === 0 ? slides.length - 1 : idx - 1));
  };

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((idx) => (idx === slides.length - 1 ? 0 : idx + 1));
  };

  const toggleVideoPlayback = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  };

  const ensureAuthed = async () => {
    const ok = await isAuthenticated(webStorage);
    if (ok) return true;
    navigate(
      `/login?returnTo=${encodeURIComponent(`/en/community/${post.id}`)}`,
    );
    return false;
  };

  const handleSaveToggle = async () => {
    const ok = await ensureAuthed();
    if (!ok) return;
    const success = isSaved
      ? await unsaveCommunityPost(post.id)
      : await saveCommunityPost(post.id);
    if (success) {
      setIsSaved((value) => !value);
      setMenuOpen(false);
    }
  };

  const handleHide = async () => {
    const ok = await ensureAuthed();
    if (!ok) return;
    const success = await hideCommunityPost(post.id);
    if (success) {
      setIsHidden(true);
      setMenuOpen(false);
    }
  };

  const handleReport = async () => {
    const ok = await ensureAuthed();
    if (!ok) return;
    const success = await reportCommunityContent(
      "post",
      post.id,
      "inappropriate",
      "Reported from web community card menu",
    );
    if (success) {
      setMenuOpen(false);
      if (typeof window !== "undefined") {
        window.alert("Reported. Thank you for flagging this post.");
      }
    }
  };

  const handleLinkedItemClick = async () => {
    const linkedItemId = post.linked_item?.id;
    if (!linkedItemId || !linkedItemType || isLaunchingLinkedItem) return;

    const ok = await ensureAuthed();
    if (!ok) return;

    setIsLaunchingLinkedItem(true);
    try {
      await addAdditionalItem(linkedItemId, linkedItemType);

      const item = {
        id: linkedItemId,
        item_id: linkedItemId,
        item_type: linkedItemType,
        itemType: linkedItemType,
        source: "additional_library",
        title: linkedItemTitle,
        name: linkedItemTitle,
      };

      const state = store.getState();
      await executeAction(
        {
          type: "start_runner",
          payload: {
            source: "additional_library",
            variant: linkedItemType,
            item,
          },
        },
        {
          dispatch: store.dispatch,
          screenData: state.screen.screenData,
          currentStateId: state.screen.currentStateId,
        },
      );
    } finally {
      setIsLaunchingLinkedItem(false);
    }
  };

  if (isHidden) return null;

  return (
    <div
      style={{
        position: "relative",
        marginBottom: 0,
        cursor: detailMode ? "default" : "pointer",
        touchAction: "manipulation",
        overflow: "hidden",
        borderBottom: detailMode ? "none" : "1px solid #F0F2F5",
        paddingBottom: detailMode ? 0 : 4,
      }}
      onClick={handleCardNavigate}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 12px 0",
          marginBottom: 4,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              marginRight: 8,
              borderRadius: 16,
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(180deg, rgba(224,213,194,1) 0%, rgba(197,166,120,1) 100%)",
              flexShrink: 0,
            }}
          >
            <img
              src={communityAvatar}
              alt={post.community_name ?? "Community"}
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#1c1c1c",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {post.community_name || "Community"}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#7c7c7c",
                lineHeight: 1.2,
                marginTop: 2,
              }}
            >
              {timeAgo}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginLeft: 12,
            flexShrink: 0,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsJoined((value) => !value);
            }}
            style={{
              background: isJoined ? "#EDEFF1" : "#D69E2E",
              padding: "4px 16px",
              borderRadius: 20,
              marginRight: 8,
              border: "none",
              cursor: "pointer",
              color: isJoined ? "#1c1c1c" : "#fff",
              fontWeight: 700,
              fontSize: 14,
              lineHeight: 1.4,
            }}
          >
            {isJoined ? "Joined" : "Join"}
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
              color: "#333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label="More options"
          >
            <Ellipsis size={22} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <>
          <button
            aria-label="Close menu"
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
              zIndex: 40,
              cursor: "default",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 52,
              right: 3,
              background: "#fff",
              borderRadius: 10,
              padding: "6px 0",
              minWidth: 143,
              boxShadow: "0 16px 34px rgba(0,0,0,0.12)",
              border: "1px solid #f0f0f0",
              zIndex: 50,
              overflow: "hidden",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                void handleSaveToggle();
              }}
              style={menuItemStyle}
            >
              <Bookmark size={21} color="#333" />
              <span>{isSaved ? "Unsave" : "Save"}</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                void handleHide();
              }}
              style={{ ...menuItemStyle, borderTop: "1px solid #f2f2f2" }}
            >
              <EyeOff size={21} color="#333" />
              <span>Hide</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                void handleReport();
              }}
              style={{
                ...menuItemStyle,
                borderTop: "1px solid #f2f2f2",
                color: "#ff3b30",
              }}
            >
              <Flag size={21} color="#ff3b30" />
              <span>Report</span>
            </button>
          </div>
        </>
      )}

      {post.title && (
        <p
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#4a280d",
            marginTop: 12,
            marginBottom: 0,

            marginLeft: 12,
            marginRight: 12,
          }}
        >
          {post.title}
        </p>
      )}

      {activeSlide && (
        <div
          style={{
            position: "relative",
            marginTop: 5,
            borderRadius: 10,
            overflow: "hidden",
            background: "#f4eadb",
            aspectRatio: activeAspectRatio,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {activeSlide.type === "video" ? (
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                cursor: "pointer",
              }}
              onClick={toggleVideoPlayback}
            >
              <video
                ref={videoRef}
                src={activeSlide.src}
                poster={activeSlide.thumbnail}
                controls
                playsInline
                preload="metadata"
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
                onEnded={() => setIsVideoPlaying(false)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <button
                onClick={toggleVideoPlayback}
                aria-label={isVideoPlaying ? "Pause video" : "Play video"}
                style={{
                  position: "absolute",
                  inset: 0,
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  margin: 0,
                  cursor: "pointer",
                }}
              />
              {!isVideoPlaying && (
                <button
                  onClick={toggleVideoPlayback}
                  aria-label="Play video"
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(71, 48, 18, 0.72)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
                  }}
                >
                  <Play size={28} fill="currentColor" />
                </button>
              )}
            </div>
          ) : (
            <img
              src={activeSlide.src}
              alt={post.title ?? "Community post"}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          )}

          {slides.length > 1 && (
            <>
              <button
                onClick={goPrev}
                aria-label="Previous slide"
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 25,
                  height: 25,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgb(0 0 0 / 0.5)",
                  color: "#4a280d",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <ChevronLeft size={20} color="#fff" />
              </button>
              <button
                onClick={goNext}
                aria-label="Next slide"
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 25,
                  height: 25,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgb(0 0 0 / 0.5)",
                  color: "#4a280d",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <ChevronRight size={20} color="#fff" />
              </button>
            </>
          )}
        </div>
      )}
      {slides.length > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            marginTop: 10,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(index);
              }}
              aria-label={`Go to slide ${index + 1}`}
              style={{
                width: index === activeIndex ? 22 : 8,
                height: 8,
                borderRadius: 999,
                border: "none",
                background:
                  index === activeIndex
                    ? "var(--kalpx-cta)"
                    : "rgba(201, 168, 76, 0.28)",
                cursor: "pointer",
                transition: "all 0.18s ease",
              }}
            />
          ))}
        </div>
      )}
      {text && (
        <div style={{ marginTop: 10, marginLeft: 12, marginRight: 12 }}>
          <p
            style={{
              fontSize: 15,
              color: "rgba(67, 33, 4, 0.8)",
              margin: 0,
              lineHeight: 1.65,
            }}
          >
            {previewText}
          </p>
          {shouldTruncate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded((value) => !value);
              }}
              style={{
                marginTop: 6,
                padding: 0,
                border: "none",
                background: "none",
                color: "var(--kalpx-cta)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {isExpanded ? "Read less" : "Read more"}
            </button>
          )}
        </div>
      )}

      <CommunityReactionBar
        upvoteCount={post.upvote_count ?? post.likes_count}
        commentCount={post.comment_count}
        shareCount={post.share_count}
        userVote={post.user_vote}
        isUpvoting={isUpvoting}
        onUpvote={(e?: any) => {
          e?.stopPropagation?.();
          onUpvote?.(post.id);
        }}
        onComment={() =>
          detailMode ? onCommentClick?.() : navigate(`/en/community/${post.id}`)
        }
        onShare={() => {}}
        onAskQuestion={() => {}}
      />

      {linkedItemTitle && (
        <div
          style={{
            marginTop: 14,
            marginLeft: 5,
            marginRight: 5,
            marginBottom: detailMode ? 12 : 8,
            padding: "14px 16px",
            borderRadius: 10,
            border: "1.5px solid #d9a32d",
            background: "#fff9ec",
            cursor: linkedItemType ? "pointer" : "default",
            opacity: isLaunchingLinkedItem ? 0.75 : 1,
          }}
          onClick={(e) => {
            e.stopPropagation();
            void handleLinkedItemClick();
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            {/* <span
              style={{
                color: "#d19a2b",
                fontSize: 18,
                lineHeight: 1,
                marginTop: 1,
                flexShrink: 0,
              }}
            >
              ↪
            </span> */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#1f1207",
                  lineHeight: 1.35,
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                }}
              >
                {linkedItemTitle}
              </div>
              {linkedItemSubtitle && (
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 13,
                    color: "#2f2216",
                    lineHeight: 1.5,
                    fontWeight: 500,
                  }}
                >
                  {linkedItemSubtitle}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const menuItemStyle: React.CSSProperties = {
  width: "100%",
  background: "none",
  border: "none",
  padding: "10px",
  display: "flex",
  alignItems: "center",
  gap: 16,
  fontSize: 17,
  fontWeight: 500,
  color: "#333",
  cursor: "pointer",
  justifyContent: "center",
};
