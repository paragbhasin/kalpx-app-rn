import { isAuthenticated } from "@kalpx/auth";
import type { CommunityPost } from "@kalpx/types";
import { Image as ImageIcon, LayoutGrid, List } from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import { CommunityPostCard } from "../../components/community/CommunityPostCard";
import { CommunityTopBar } from "../../components/community/CommunityTopBar";
import { getExplorePosts, upvotePost } from "../../engine/communityApi";
import { WEB_ENV } from "../../lib/env";
import { webStorage } from "../../lib/webStorage";

type ViewMode = "grid" | "list";

interface ExploreItem {
  id: number | string;
  hook_image?: string;
  base_text?: string;
  summary?: string;
  layout?: { aspect_ratio?: string };
  slides?: Array<{ image_url?: string; layout?: { aspect_ratio?: string } }>;
  slide_layouts?: Array<{
    image_url?: string;
    video_url?: string;
    layout?: { aspect_ratio?: string };
  }>;
  community_name?: string;
  community_slug?: string;
  community_post?: Partial<CommunityPost> & { id?: number | string };
  [key: string]: any;
}

function resolveMediaUrl(value?: string | null): string {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  return `${WEB_ENV.imageBaseUrl}${value.startsWith("/") ? "" : "/"}${value}`;
}

function getAspectRatioValue(item: ExploreItem): number {
  const ratioString =
    item.layout?.aspect_ratio ||
    item.slides?.[0]?.layout?.aspect_ratio ||
    item.slide_layouts?.[0]?.layout?.aspect_ratio ||
    "4:5";
  const [w, h] = String(ratioString).split(":").map(Number);
  if (!w || !h) return 4 / 5;
  return w / h;
}

function mapExploreItemToPost(item: ExploreItem): CommunityPost {
  const merged = {
    ...item,
    ...(item.community_post || {}),
  } as any;

  return {
    ...merged,
    id: merged.id,
    content: merged.content || item.base_text || item.summary,
    community_name: merged.community_name || item.community_name || "Community",
    community_slug: merged.community_slug || item.community_slug,
    slide_layouts:
      merged.slide_layouts ||
      item.slide_layouts ||
      item.slides?.map((slide, index) => ({
        id: `${merged.id}-slide-${index}`,
        order: index,
        image_url: slide.image_url,
        layout: slide.layout,
      })),
    media_url: merged.media_url || item.hook_image || merged.hook_image,
  };
}

function isVideoAsset(value?: string | null): boolean {
  return !!value && /\.(mp4|mov|webm|m4v)$/i.test(value);
}

function ExploreTile({
  item,
  aspectRatio,
  onClick,
}: {
  item: ExploreItem;
  aspectRatio: number;
  onClick: () => void;
}) {
  const mediaUrl =
    resolveMediaUrl(item.hook_image) ||
    resolveMediaUrl(item.slide_layouts?.[0]?.image_url) ||
    resolveMediaUrl(item.community_post?.media_url);
  const videoAsset = isVideoAsset(mediaUrl);

  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        aspectRatio,
        border: "none",
        padding: 0,
        margin: 0,
        background: "#efe7d8",
        borderRadius: 18,
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
        display: "block",
      }}
    >
      {mediaUrl ? (
        videoAsset ? (
          <video
            src={mediaUrl}
            muted
            playsInline
            autoPlay
            loop
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <img
            src={mediaUrl}
            alt={item.summary || item.base_text || "Community explore post"}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        )
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(180deg, rgba(43,36,29,0.12), rgba(208,174,116,0.16))",
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "rgba(12, 22, 39, 0.72)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
        }}
      >
        <ImageIcon size={17} />
      </div>
    </button>
  );
}

export function CommunityTopPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedPostId, setSelectedPostId] = useState<number | string | null>(
    null,
  );
  const [items, setItems] = useState<ExploreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [upvotingId, setUpvotingId] = useState<number | string | null>(null);

  const lang =
    typeof window !== "undefined"
      ? window.location.pathname.split("/")[1] || "en"
      : "en";

  const fetchPage = async (pageNumber: number, reset = false) => {
    try {
      reset ? setLoading(true) : setLoadingMore(true);
      setError(null);
      const data = await getExplorePosts({
        paginate: true,
        page: pageNumber,
        page_size: 10,
        lang,
      });
      const incoming = (data.results ?? []) as ExploreItem[];
      setItems((prev) => (reset ? incoming : [...prev, ...incoming]));
      setHasMore(!!data.next);
      setPage(pageNumber);
    } catch {
      setError("Could not load top posts. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    void fetchPage(1, true);
  }, [lang]);

  useEffect(() => {
    if (viewMode !== "list" || selectedPostId == null || loading || !!error)
      return;

    const frame = window.requestAnimationFrame(() => {
      const element = document.getElementById(
        `community-top-post-${String(selectedPostId)}`,
      );
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [error, loading, selectedPostId, viewMode]);

  const gridColumns = useMemo(() => {
    const left: Array<ExploreItem & { tileAspectRatio: number }> = [];
    const right: Array<ExploreItem & { tileAspectRatio: number }> = [];
    let leftHeight = 0;
    let rightHeight = 0;

    items.forEach((item) => {
      const aspect = getAspectRatioValue(item) || 4 / 5;
      const payload = { ...item, tileAspectRatio: aspect };
      if (leftHeight <= rightHeight) {
        left.push(payload);
        leftHeight += 1 / aspect;
      } else {
        right.push(payload);
        rightHeight += 1 / aspect;
      }
    });

    return { left, right };
  }, [items]);

  const posts = useMemo(() => items.map(mapExploreItemToPost), [items]);

  const handleGridPostClick = (postId: number | string) => {
    setSelectedPostId(postId);
    setViewMode("list");
  };

  const handleUpvote = async (postId: number | string) => {
    if (!(await isAuthenticated(webStorage))) {
      const to = encodeURIComponent(`/en/community/top`);
      navigate(`/login?returnTo=${to}`);
      return;
    }
    setUpvotingId(postId);
    try {
      await upvotePost(postId);
      setItems((prev) =>
        prev.map((item) => {
          const post = mapExploreItemToPost(item);
          if (String(post.id) !== String(postId)) return item;
          return {
            ...item,
            community_post: {
              ...(item.community_post || {}),
              ...post,
              upvote_count: (post.upvote_count ?? post.likes_count ?? 0) + 1,
            },
          };
        }),
      );
    } finally {
      setUpvotingId(null);
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--kalpx-bg)",
        overflowX: "hidden",
      }}
    >
      <CommunityTopBar
        activeLabel="Top"
        rightSlot={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,

              borderRadius: 6,
              background: "#F7F0DD",
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewMode("grid");
              }}
              aria-label="Grid view"
              style={toggleButtonStyle(viewMode === "grid")}
            >
              <LayoutGrid size={19} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewMode("list");
              }}
              aria-label="List view"
              style={toggleButtonStyle(viewMode === "list")}
            >
              <List size={24} />
            </button>
          </div>
        }
      />

      <div style={{ maxWidth: 620, margin: "0 auto", paddingBottom: 40 }}>
        <div style={{ padding: "12px 10px 0" }}>
          {loading && (
            <div style={{ padding: "24px 8px", color: "#6f655a" }}>
              Loading top posts...
            </div>
          )}

          {!loading && error && (
            <div style={{ padding: "24px 8px", color: "#9f3a2f" }}>{error}</div>
          )}

          {!loading && !error && viewMode === "grid" && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 6,
                width: "100%",
                overflow: "hidden",
              }}
            >
              <div style={{ width: `calc(50% - 3px)` }}>
                {gridColumns.left.map((item) => (
                  <div key={String(item.id)} style={{ marginBottom: 12 }}>
                    <ExploreTile
                      item={item}
                      aspectRatio={item.tileAspectRatio}
                      onClick={() => handleGridPostClick(item.id)}
                    />
                  </div>
                ))}
              </div>
              <div style={{ width: `calc(50% - 3px)` }}>
                {gridColumns.right.map((item) => (
                  <div key={String(item.id)} style={{ marginBottom: 12 }}>
                    <ExploreTile
                      item={item}
                      aspectRatio={item.tileAspectRatio}
                      onClick={() => handleGridPostClick(item.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && !error && viewMode === "list" && (
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }}
            >
              {posts.map((post) => (
                <div id={`community-top-post-${String(post.id)}`} key={post.id}>
                  <CommunityPostCard
                    post={post}
                    onUpvote={(id) => void handleUpvote(id)}
                    isUpvoting={upvotingId === post.id}
                  />
                </div>
              ))}
            </div>
          )}

          {!loading && hasMore && (
            <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
              <button
                onClick={() => void fetchPage(page + 1)}
                disabled={loadingMore}
                style={{
                  padding: "10px 22px",

                  color: "#3a2c19",
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
      </div>
    </div>
  );
}

function toggleButtonStyle(active: boolean): CSSProperties {
  return {
    width: 28,
    height: 28,
    border: "none",
    borderRadius: 6,
    background: active ? "#f3e3b3" : "transparent",
    color: "#2e2a25",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    padding: 0,
  };
}
