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
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { executeAction } from "../../engine/actionExecutor";
import {
  followCommunity,
  getFollowedCommunities,
  hideCommunityPost,
  reportCommunityContent,
  saveCommunityPost,
  unfollowCommunity,
  unhideCommunityPost,
  unsaveCommunityPost,
} from "../../engine/communityApi";
import { fetchLibraryItem } from "../../engine/mitraApi";
import { WEB_ENV } from "../../lib/env";
import { webStorage } from "../../lib/webStorage";
import { store } from "../../store";
import { CommunityReactionBar } from "./CommunityReactionBar";
import { CommunityReportModal } from "./CommunityReportModal";

const COMMUNITY_BACKGROUNDS: Record<string, string> = {
  "daily-dharma-reflections": new URL(
    "../../../../mobile/assets/community-bg/daily-dharma-reflections.jpeg",
    import.meta.url,
  ).href,
  "festivals-rituals": new URL(
    "../../../../mobile/assets/community-bg/festival.jpeg",
    import.meta.url,
  ).href,
  "mantra-chanting-circle": new URL(
    "../../../../mobile/assets/community-bg/mantraandchanting.jpeg",
    import.meta.url,
  ).href,
  "yoga-pranayama": new URL(
    "../../../../mobile/assets/community-bg/yoga-pranaya.jpeg",
    import.meta.url,
  ).href,
  "meditation-mindfulness": new URL(
    "../../../../mobile/assets/community-bg/meditationanmindfulness.jpeg",
    import.meta.url,
  ).href,
  "ayurveda-healing": new URL(
    "../../../../mobile/assets/community-bg/ayurveda-healing.jpeg",
    import.meta.url,
  ).href,
  "dance-as-devotion": new URL(
    "../../../../mobile/assets/community-bg/dance-devotion.jpeg",
    import.meta.url,
  ).href,
  "music-bhajans": new URL(
    "../../../../mobile/assets/community-bg/music-bhajans.jpeg",
    import.meta.url,
  ).href,
  "ramayana-insights": new URL(
    "../../../../mobile/assets/community-bg/ramayana-insights.jpeg",
    import.meta.url,
  ).href,
  "mahabharata-dialogues": new URL(
    "../../../../mobile/assets/community-bg/mahabharatadialogues.jpeg",
    import.meta.url,
  ).href,
  "bhakti-devotion": new URL(
    "../../../../mobile/assets/community-bg/bhakthianddevotion.jpeg",
    import.meta.url,
  ).href,
  "children-dharma": new URL(
    "../../../../mobile/assets/community-bg/children-dharma.jpeg",
    import.meta.url,
  ).href,
  "sacred-stories": new URL(
    "../../../../mobile/assets/community-bg/sacred-stories.jpeg",
    import.meta.url,
  ).href,
  "sanatan-modern-life": new URL(
    "../../../../mobile/assets/community-bg/sanatan-modernlife.jpeg",
    import.meta.url,
  ).href,
  "sanatan-science-philosophy": new URL(
    "../../../../mobile/assets/community-bg/sanatan-science-philosophy.jpeg",
    import.meta.url,
  ).href,
  "spiritual-travel": new URL(
    "../../../../mobile/assets/community-bg/spiritual-travel.jpeg",
    import.meta.url,
  ).href,
  "temple-experiences": new URL(
    "../../../../mobile/assets/community-bg/temple-experiences.jpeg",
    import.meta.url,
  ).href,
  "women-in-sanatan-dharma": new URL(
    "../../../../mobile/assets/community-bg/women-in-santandharma.jpeg",
    import.meta.url,
  ).href,
  "yoga-pranaya": new URL(
    "../../../../mobile/assets/community-bg/yoga-pranaya.jpeg",
    import.meta.url,
  ).href,
  "bhakthi-devotion": new URL(
    "../../../../mobile/assets/community-bg/bhakthianddevotion.jpeg",
    import.meta.url,
  ).href,
  festival: new URL(
    "../../../../mobile/assets/community-bg/festival.jpeg",
    import.meta.url,
  ).href,
  "mantra-chanting": new URL(
    "../../../../mobile/assets/community-bg/mantraandchanting.jpeg",
    import.meta.url,
  ).href,
  "sanatan-modernlife": new URL(
    "../../../../mobile/assets/community-bg/sanatan-modernlife.jpeg",
    import.meta.url,
  ).href,
  "mahabharata-dialog": new URL(
    "../../../../mobile/assets/community-bg/mahabharatadialogues.jpeg",
    import.meta.url,
  ).href,
  "meditation-and-mindfulness": new URL(
    "../../../../mobile/assets/community-bg/meditationanmindfulness.jpeg",
    import.meta.url,
  ).href,
  "1": new URL(
    "../../../../mobile/assets/community-bg/daily-dharma-reflections.jpeg",
    import.meta.url,
  ).href,
  "2": new URL(
    "../../../../mobile/assets/community-bg/festival.jpeg",
    import.meta.url,
  ).href,
  "3": new URL(
    "../../../../mobile/assets/community-bg/mantraandchanting.jpeg",
    import.meta.url,
  ).href,
  "4": new URL(
    "../../../../mobile/assets/community-bg/yoga-pranaya.jpeg",
    import.meta.url,
  ).href,
  "5": new URL(
    "../../../../mobile/assets/community-bg/meditationanmindfulness.jpeg",
    import.meta.url,
  ).href,
  "6": new URL(
    "../../../../mobile/assets/community-bg/ayurveda-healing.jpeg",
    import.meta.url,
  ).href,
  "7": new URL(
    "../../../../mobile/assets/community-bg/dance-devotion.jpeg",
    import.meta.url,
  ).href,
  "8": new URL(
    "../../../../mobile/assets/community-bg/music-bhajans.jpeg",
    import.meta.url,
  ).href,
  "9": new URL(
    "../../../../mobile/assets/community-bg/ramayana-insights.jpeg",
    import.meta.url,
  ).href,
  "10": new URL(
    "../../../../mobile/assets/community-bg/mahabharatadialogues.jpeg",
    import.meta.url,
  ).href,
  "11": new URL(
    "../../../../mobile/assets/community-bg/bhakthianddevotion.jpeg",
    import.meta.url,
  ).href,
  "12": new URL(
    "../../../../mobile/assets/community-bg/children-dharma.jpeg",
    import.meta.url,
  ).href,
};

const DEFAULT_COMMUNITY_IMAGE = new URL(
  "../../../../mobile/assets/community-bg/daily-dharma-reflections.jpeg",
  import.meta.url,
).href;

let followedCommunitiesCache: any[] | null = null;
let followedCommunitiesRequest: Promise<any[]> | null = null;

async function loadFollowedCommunitiesCached(): Promise<any[]> {
  if (followedCommunitiesCache) return followedCommunitiesCache;
  if (!followedCommunitiesRequest) {
    followedCommunitiesRequest = getFollowedCommunities()
      .then((data) => {
        followedCommunitiesCache = data;
        return data;
      })
      .finally(() => {
        followedCommunitiesRequest = null;
      });
  }
  return followedCommunitiesRequest;
}

interface CommunityPostCardProps {
  post: CommunityPost;
  onUpvote?: (postId: number | string) => void;
  isUpvoting?: boolean;
  commentCountOverride?: number;
  detailMode?: boolean;
  onCommentClick?: () => void;
  onAskQuestionClick?: () => void;
  showHiddenPost?: boolean;
  onVisibilityChange?: (postId: number | string, isHidden: boolean) => void;
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
  const linkedItemId = String(linkedItem.id);
  if (linkedItemId.startsWith("mantra.")) return "mantra";
  if (linkedItemId.startsWith("sankalp.")) return "sankalp";
  if (linkedItemId.startsWith("practice.")) return "practice";

  const rawType = String(linkedItem.type || "")
    .split(":")[1]
    ?.trim()
    .toLowerCase();
  if (rawType === "mantra" || rawType === "sankalp" || rawType === "practice") {
    return rawType;
  }
  return null;
}

function normalizeLinkedItemType(
  rawType?: string | null,
  itemId?: string | null,
): "mantra" | "sankalp" | "practice" | null {
  const normalized = String(rawType || "")
    .split(":")
    .pop()
    ?.trim()
    .toLowerCase();

  if (normalized === "sankalp" || normalized === "sankalpa") return "sankalp";
  if (normalized === "mantra") return "mantra";
  if (normalized === "practice") return "practice";

  const id = String(itemId || "");
  if (id.startsWith("sankalp.")) return "sankalp";
  if (id.startsWith("mantra.")) return "mantra";
  if (id.startsWith("practice.")) return "practice";
  return null;
}

function mapRunnerItem(
  item: any,
  itemType: "mantra" | "sankalp" | "practice",
  fallbackTitle: string,
) {
  if (itemType === "mantra") {
    return {
      ...item,
      id: item.itemId || item.item_id || item.id,
      item_id: item.itemId || item.item_id || item.id,
      item_type: "mantra",
      title: item.title || item.name || fallbackTitle,
      devanagari: item.devanagari || item.text || "",
      source: item.source || item.tradition || "",
    };
  }

  if (itemType === "sankalp") {
    return {
      ...item,
      id: item.itemId || item.item_id || item.id,
      item_id: item.itemId || item.item_id || item.id,
      item_type: "sankalp",
      title: item.short_text || item.title || item.name || fallbackTitle,
      insight: item.insight || "",
      how_to_live: item.how_to_live || [],
    };
  }

  return {
    ...item,
    id: item.itemId || item.item_id || item.id,
    item_id: item.itemId || item.item_id || item.id,
    item_type: "practice",
    title: item.title || item.name || fallbackTitle,
    summary: item.summary || item.description || "",
    steps: Array.isArray(item.steps) ? item.steps : [],
    benefits: Array.isArray(item.benefits) ? item.benefits : [],
  };
}

export function CommunityPostCard({
  post,
  onUpvote,
  isUpvoting = false,
  commentCountOverride,
  detailMode = false,
  onCommentClick,
  onAskQuestionClick,
  showHiddenPost = false,
  onVisibilityChange,
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
  const [reportOpen, setReportOpen] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isLaunchingLinkedItem, setIsLaunchingLinkedItem] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const communityJoinKey = useMemo(
    () => ({
      slug: String(
        post.community_slug || (post as any).community?.slug || "",
      ).toLowerCase(),
      id: String(
        (post as any).community_id || (post as any).community?.id || "",
      ),
    }),
    [post],
  );

  const resolveMediaUrl = (value?: string | null) => {
    if (!value) return "";
    if (/^https?:\/\//i.test(value)) return value;
    if (value.startsWith("//")) return `https:${value}`;
    return `${WEB_ENV.imageBaseUrl}${value.startsWith("/") ? "" : "/"}${value}`;
  };

  const resolveCommunityImage = () => {
    const community = (post as any).community ?? {};
    const remoteImage =
      resolveMediaUrl((post as any).community_media_url) ||
      resolveMediaUrl(community.media_url) ||
      resolveMediaUrl(community.image_url) ||
      resolveMediaUrl(community.icon);

    if (remoteImage) return remoteImage;

    return (
      COMMUNITY_BACKGROUNDS[
        String(post.community_slug || community.slug || "")
      ] ||
      COMMUNITY_BACKGROUNDS[
        String((post as any).community_id || community.id || "")
      ] ||
      DEFAULT_COMMUNITY_IMAGE
    );
  };

  const communityAvatar =
    resolveCommunityImage() ||
    author?.avatar_url ||
    author?.profile_pic ||
    "/lotus_icon.png";
  const communityDetailPath = communityJoinKey.slug
    ? `/en/community/communities/${communityJoinKey.slug}`
    : null;

  useEffect(() => {
    setIsJoined(!!(post as any).is_joined);
  }, [post]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const applyViewport = () => setIsDesktopViewport(mediaQuery.matches);
    applyViewport();

    mediaQuery.addEventListener("change", applyViewport);
    return () => mediaQuery.removeEventListener("change", applyViewport);
  }, []);

  useEffect(() => {
    let mounted = true;

    const syncJoinedState = async () => {
      const ok = await isAuthenticated(webStorage);
      if (!ok || (!communityJoinKey.slug && !communityJoinKey.id)) return;

      const followed = await loadFollowedCommunitiesCached();
      if (!mounted) return;

      const matched = followed.some((community: any) => {
        const slug = String(
          community.slug || community.community_slug || "",
        ).toLowerCase();
        const id = String(
          community.id || community.community_id || community.community || "",
        );
        return (
          (!!communityJoinKey.slug && slug === communityJoinKey.slug) ||
          (!!communityJoinKey.id && id === communityJoinKey.id)
        );
      });

      if (matched) {
        setIsJoined(true);
      }
    };

    void syncJoinedState();
    return () => {
      mounted = false;
    };
  }, [communityJoinKey.id, communityJoinKey.slug]);
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
  const mediaBackdropUrl = activeSlide?.thumbnail || activeSlide?.src || "";
  const mediaStageAspectRatio = isDesktopViewport ? "16 / 10" : activeAspectRatio;
  const shouldTruncate = text.length > 180;
  const previewText =
    !shouldTruncate || isExpanded ? text : `${text.slice(0, 180).trimEnd()}...`;
  const linkedItemTitle = post.linked_item?.name?.trim() || "";
  const linkedItemSubtitle = getLinkedItemSubtitle(post.linked_item);
  const linkedItemType = normalizeLinkedItemType(
    post.linked_item?.type,
    String(post.linked_item?.id || ""),
  );
  const handleCardNavigate = () => {
    if (detailMode) return;
    navigate(`/en/community/${post.id}`);
  };

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((idx) => Math.max(0, idx - 1));
  };

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((idx) => Math.min(slides.length - 1, idx + 1));
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
      onVisibilityChange?.(post.id, true);
    }
  };

  const handleUnhide = async () => {
    const ok = await ensureAuthed();
    if (!ok) return;
    const success = await unhideCommunityPost(post.id);
    if (success) {
      setIsHidden(false);
      setMenuOpen(false);
      onVisibilityChange?.(post.id, false);
    }
  };

  const handleJoinToggle = async () => {
    const ok = await ensureAuthed();
    if (!ok || joinLoading) return;

    const communityIdOrSlug =
      post.community_slug ||
      (post as any).community?.slug ||
      (post as any).community_id ||
      (post as any).community?.id;

    if (!communityIdOrSlug) return;

    setJoinLoading(true);
    try {
      const success = isJoined
        ? await unfollowCommunity(communityIdOrSlug)
        : await followCommunity(communityIdOrSlug);

      if (success) {
        setIsJoined((value) => !value);
        if (followedCommunitiesCache) {
          if (isJoined) {
            followedCommunitiesCache = followedCommunitiesCache.filter(
              (community: any) => {
                const slug = String(
                  community.slug || community.community_slug || "",
                ).toLowerCase();
                const id = String(
                  community.id ||
                    community.community_id ||
                    community.community ||
                    "",
                );
                return (
                  slug !== communityJoinKey.slug && id !== communityJoinKey.id
                );
              },
            );
          } else {
            followedCommunitiesCache = [
              ...followedCommunitiesCache,
              {
                slug: communityJoinKey.slug || undefined,
                id: communityJoinKey.id || communityJoinKey.slug,
              },
            ];
          }
        }
      }
    } finally {
      setJoinLoading(false);
    }
  };

  const handleReport = async (reason: string, details: string) => {
    const ok = await ensureAuthed();
    if (!ok) return;
    const success = await reportCommunityContent(
      "post",
      post.id,
      reason,
      details,
    );
    if (success) {
      setMenuOpen(false);
      setReportOpen(false);
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
      const shouldHydrate =
        String(linkedItemId).startsWith("mantra.") ||
        String(linkedItemId).startsWith("sankalp.") ||
        String(linkedItemId).startsWith("practice.");

      const fetched = shouldHydrate
        ? await fetchLibraryItem(linkedItemType, String(linkedItemId))
        : null;

      const item = mapRunnerItem(
        fetched || post.linked_item || {},
        linkedItemType,
        linkedItemTitle,
      );

      const state = store.getState();
      await executeAction(
        {
          type: "start_runner",
          payload: {
            source: "community",
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

  if (isHidden && !showHiddenPost) return null;

  return (
    <div
      style={{
        position: "relative",
        marginBottom: isDesktopViewport ? 8 : 0,
        cursor: detailMode ? "default" : "pointer",
        touchAction: "manipulation",
        overflow: "hidden",

        borderBottom: isDesktopViewport
          ? "1px solid #e8e0d2"
          : detailMode
            ? "none"
            : "1px solid #F0F2F5",
        borderRadius: isDesktopViewport ? 18 : 0,

        paddingBottom: detailMode ? 0 : isDesktopViewport ? 10 : 4,
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
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (communityDetailPath) navigate(communityDetailPath);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            minWidth: 0,
            border: "none",
            background: "transparent",
            padding: 0,
            margin: 0,
            textAlign: "left",
            cursor: communityDetailPath ? "pointer" : "default",
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
                width: 32,
                height: 32,
                borderRadius: 12,
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
          <div
            style={{
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: isDesktopViewport ? 0 : 4,
            }}
          >
            {isDesktopViewport && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontSize: 17,
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
                <span style={{ color: "#7c7c7c", fontSize: 14 }}>•</span>
                <div
                  style={{
                    fontSize: 13,
                    color: "#7c7c7c",
                    lineHeight: 1.2,
                    fontWeight: 500,
                  }}
                >
                  {timeAgo}
                </div>
              </div>
            )}
            {!isDesktopViewport && (
              <>
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
                  }}
                >
                  {timeAgo}
                </div>
              </>
            )}
          </div>
        </button>

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
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void handleJoinToggle();
            }}
            style={{
              background: isJoined ? "#EDEFF1" : "#D69E2E",
              padding: isDesktopViewport ? "6px 20px" : "4px 16px",
              borderRadius: isDesktopViewport ? 8 : 20,
              marginRight: 8,
              border: "none",
              cursor: "pointer",
              color: isJoined ? "#1c1c1c" : "#fff",
              fontWeight: 700,
              fontSize: 14,
              lineHeight: 1.4,
              opacity: joinLoading ? 0.7 : 1,
            }}
            disabled={joinLoading}
          >
            {joinLoading ? "..." : isJoined ? "Joined" : "Join"}
          </button>
          <button
            type="button"
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
            type="button"
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
              type="button"
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
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void (showHiddenPost ? handleUnhide() : handleHide());
              }}
              style={{ ...menuItemStyle, borderTop: "1px solid #f2f2f2" }}
            >
              <EyeOff size={21} color="#333" />
              <span>{showHiddenPost ? "Unhide" : "Hide"}</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
                setReportOpen(true);
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

      <CommunityReportModal
        open={reportOpen}
        title="Report Post"
        onClose={() => setReportOpen(false)}
        onSubmit={async (reason, details) => {
          await handleReport(reason, details);
        }}
      />

      {post.title && (
        <h2
          style={{
            fontSize: isDesktopViewport ? 20 : 15,
            fontWeight: 800,
            color: "#1c1c1c",
            marginTop: isDesktopViewport ? 16 : 12,
            marginBottom: isDesktopViewport ? 12 : 0,
            marginLeft: 12,
            marginRight: 12,
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
          }}
        >
          {post.title}
        </h2>
      )}

      {activeSlide && (
        <div
          style={{
            position: "relative",
            width: isDesktopViewport ? "calc(100% - 24px)" : "100%",
            margin: isDesktopViewport ? "0 auto" : "0",
          }}
        >
          <div
            style={{
              position: "relative",
              marginTop: 5,
              borderRadius: isDesktopViewport ? 18 : 10,
              overflow: "hidden",
              background: "#000000",
              aspectRatio: mediaStageAspectRatio,
              minHeight: isDesktopViewport ? 520 : undefined,
              maxHeight: isDesktopViewport ? "78vh" : undefined,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {mediaBackdropUrl && (
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${mediaBackdropUrl})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  filter: "blur(28px)",
                  transform: "scale(1.08)",
                  opacity: 0.34,
                }}
              />
            )}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(10,12,16,0.18), rgba(10,12,16,0.52))",
              }}
            />
            {activeSlide.type === "video" ? (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  zIndex: 1,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
                    maxWidth: "100%",
                    maxHeight: "100%",
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    display: "block",
                    background: "#0f1115",
                  }}
                />
                <button
                  type="button"
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
                    type="button"
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
                  position: "relative",
                  zIndex: 1,
                  maxWidth: "100%",
                  maxHeight: "100%",
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  display: "block",
                  background: "#0f1115",
                }}
              />
            )}
            {slides.length > 1 && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  zIndex: 100,
                }}
              >
                {activeIndex > 0 && (
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Previous slide"
                    style={{
                      position: "absolute",
                      left: isDesktopViewport ? 14 : 20,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: isDesktopViewport ? 40 : 48,
                      height: isDesktopViewport ? 40 : 48,
                      borderRadius: "50%",

                      background: isDesktopViewport
                        ? "rgba(24, 24, 27, 0.72)"
                        : "rgba(0, 0, 0, 0.7)",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      pointerEvents: "auto",
                      transition: "all 0.2s ease",
                      padding: 0,
                      boxShadow: "0 4px 15px rgba(0,0,0,0.28)",
                    }}
                  >
                    <ChevronLeft
                      size={isDesktopViewport ? 24 : 32}
                      color="#ffffff"
                      strokeWidth={2.5}
                    />
                  </button>
                )}
                {activeIndex < slides.length - 1 && (
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next slide"
                    style={{
                      position: "absolute",
                      right: isDesktopViewport ? 14 : 20,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: isDesktopViewport ? 40 : 48,
                      height: isDesktopViewport ? 40 : 48,

                      background: isDesktopViewport
                        ? "rgba(24, 24, 27, 0.72)"
                        : "rgba(0, 0, 0, 0.7)",
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      pointerEvents: "auto",
                      transition: "all 0.2s ease",
                      padding: 0,
                      boxShadow: "0 4px 15px rgba(0,0,0,0.28)",
                    }}
                  >
                    <ChevronRight
                      size={isDesktopViewport ? 24 : 32}
                      color="#ffffff"
                      strokeWidth={2.5}
                    />
                  </button>
                )}

                <div
                  style={{
                    position: "absolute",
                    top: isDesktopViewport ? 14 : undefined,
                    bottom: isDesktopViewport ? undefined : 20,
                    right: isDesktopViewport ? 14 : 20,
                    background: "rgba(24, 24, 27, 0.82)",
                    color: "#ffffff",
                    padding: isDesktopViewport ? "7px 11px" : "6px 14px",
                    borderRadius: 999,
                    fontSize: isDesktopViewport ? 12 : 13,
                    fontWeight: 800,
                    pointerEvents: "none",
                    letterSpacing: "0.02em",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.24)",
                  }}
                >
                  {activeIndex + 1}/{slides.length}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {slides.length > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            marginTop: 12,
            marginBottom: 4,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {slides.map((slide, index) => (
            <button
              type="button"
              key={slide.id}
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(index);
              }}
              aria-label={`Go to slide ${index + 1}`}
              style={{
                width: index === activeIndex ? 8 : 6,
                height: index === activeIndex ? 8 : 6,
                borderRadius: "50%",
                border: "none",
                background:
                  index === activeIndex ? "#3B82F6" : "rgba(0, 0, 0, 0.15)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                padding: 0,
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
              type="button"
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
        commentCount={commentCountOverride ?? post.comment_count}
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
        onAskQuestion={() =>
          detailMode
            ? onAskQuestionClick?.()
            : navigate(`/en/community/${post.id}?mode=questions`)
        }
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
