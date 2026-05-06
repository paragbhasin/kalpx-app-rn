import { isAuthenticated } from "@kalpx/auth";
import type { CommunityPost } from "@kalpx/types";
import { communityPostSchema } from "@kalpx/validation";
import {
  ChevronDown,
  Image,
  Mic,
  Play,
  UploadCloud,
  Video,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { CommunityWebLayout } from "../../components/community/CommunityWebLayout";
import {
  createCommunityPost,
  getCommunities,
  getCommunityPost,
  updateCommunityPost,
  uploadCommunityMedia,
  type CommunityListItem,
} from "../../engine/communityApi";
import { WEB_ENV } from "../../lib/env";
import { webStorage } from "../../lib/webStorage";

type MediaItem = {
  id: string;
  uri: string;
  publicUrl?: string;
  status: "uploading" | "success" | "error";
  type: string;
  name?: string;
  fileSize?: number;
};

function ensureAbsoluteUrl(url: unknown) {
  if (!url || typeof url !== "string") return "";
  if (
    url.startsWith("http") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  return `${WEB_ENV.imageBaseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}

function extractImageUrl(img: any) {
  if (!img) return "";
  if (typeof img === "string") return img;
  return img.image_url || img.image || img.uri || img.url || "";
}

function mapImages(images: any[], mediaUrl?: string | null): MediaItem[] {
  const mapped = (images || [])
    .map((img: any, idx: number) => {
      const imgUrl = ensureAbsoluteUrl(extractImageUrl(img));
      return imgUrl
        ? {
            id: `existing_${idx}`,
            uri: imgUrl,
            publicUrl: imgUrl,
            status: "success" as const,
            type: "image/jpeg",
          }
        : null;
    })
    .filter(Boolean) as MediaItem[];

  if (mediaUrl) {
    const videoUrl = ensureAbsoluteUrl(mediaUrl);
    if (videoUrl) {
      mapped.push({
        id: "existing_video",
        uri: videoUrl,
        publicUrl: videoUrl,
        status: "success",
        type: "video/mp4",
      });
    }
  }

  return mapped;
}

export function CreateCommunityPostPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);

  const editPostState = (location.state as any)?.post as
    | CommunityPost
    | undefined;
  const editPostId =
    searchParams.get("postId") || String(editPostState?.id || "");
  const communitySlugParam =
    searchParams.get("communitySlug") ||
    (location.state as any)?.communitySlug ||
    "";

  const [communities, setCommunities] = useState<CommunityListItem[]>([]);
  const [communitySearch, setCommunitySearch] = useState("");
  const [communityMenuOpen, setCommunityMenuOpen] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(
    editPostState?.community_slug ||
      (editPostState as any)?.community?.slug ||
      communitySlugParam,
  );
  const [title, setTitle] = useState(editPostState?.title || "");
  const [body, setBody] = useState(editPostState?.content || "");
  const [mediaFiles, setMediaFiles] = useState<MediaItem[]>(() =>
    editPostState
      ? mapImages(editPostState.images || [], editPostState.media_url)
      : [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [composeTab, setComposeTab] = useState<"text" | "media">("text");

  const isEditing = Boolean(editPostId);

  useEffect(() => {
    isAuthenticated(webStorage).then((ok) => {
      if (!ok) {
        const returnTo = encodeURIComponent(
          location.pathname + location.search,
        );
        navigate(`/login?returnTo=${returnTo}`, { replace: true });
      }
    });
  }, [location.pathname, location.search, navigate]);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      setIsBootstrapping(true);
      try {
        const [communityRes, postRes] = await Promise.all([
          getCommunities({ page: 1, page_size: 100 }),
          isEditing && !editPostState
            ? getCommunityPost(editPostId)
            : Promise.resolve(null),
        ]);

        if (!mounted) return;
        setCommunities(communityRes.results || []);

        const fullPost = postRes || editPostState;
        if (fullPost) {
          setTitle(fullPost.title || "");
          setBody(fullPost.content || "");
          setSelectedCommunity(
            fullPost.community_slug ||
              (fullPost as any)?.community?.slug ||
              communitySlugParam,
          );
          setMediaFiles(mapImages(fullPost.images || [], fullPost.media_url));
        }
      } finally {
        if (mounted) setIsBootstrapping(false);
      }
    }

    void bootstrap();
    return () => {
      mounted = false;
    };
  }, [communitySlugParam, editPostId, editPostState, isEditing]);

  const filteredCommunities = useMemo(() => {
    if (!communitySearch.trim()) return communities;
    const q = communitySearch.toLowerCase();
    return communities.filter((community) =>
      String(community.name || community.slug || "")
        .toLowerCase()
        .includes(q),
    );
  }, [communities, communitySearch]);

  const selectedCommunityLabel =
    communities.find((community) => community.slug === selectedCommunity)
      ?.name || "Select a community";

  const isPostDisabled =
    !selectedCommunity ||
    !title.trim() ||
    isLoading ||
    mediaFiles.some((item) => item.status === "uploading");

  const handlePost = async () => {
    if (isPostDisabled) return;

    setFieldErrors({});
    setPostError(null);

    const payload = {
      title: title.trim(),
      content: body.trim() || "",
      community: selectedCommunity,
      images: [] as string[],
      media_url: "",
      tags: [] as string[],
    };

    const validation = communityPostSchema.safeParse({
      title: payload.title,
      content: payload.content || "placeholder",
      community: payload.community,
      tags: payload.tags,
    });

    if (!validation.success) {
      const nextErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] && err.path[0] !== "content") {
          nextErrors[String(err.path[0])] = err.message;
        }
      });
      if (Object.keys(nextErrors).length > 0) {
        setFieldErrors(nextErrors);
        return;
      }
    }

    setIsLoading(true);
    try {
      const successfulMedia = mediaFiles.filter(
        (item) => item.status === "success",
      );
      const videoFile = successfulMedia.find((item) =>
        item.type.startsWith("video/"),
      );
      const audioFile = successfulMedia.find((item) =>
        item.type.startsWith("audio/"),
      );

      if (videoFile) {
        payload.media_url = videoFile.publicUrl || videoFile.uri;
      } else if (audioFile) {
        payload.media_url = audioFile.publicUrl || audioFile.uri;
      } else if (successfulMedia.length > 0) {
        payload.images = successfulMedia
          .map((item) =>
            item.type.startsWith("image/") ? item.publicUrl || item.uri : "",
          )
          .filter(Boolean);
      }

      const post = isEditing
        ? await updateCommunityPost(editPostId, payload)
        : await createCommunityPost(payload);

      if (post?.id) {
        navigate(`/en/community/${post.id}`);
      } else {
        navigate(-1);
      }
    } catch (err: any) {
      setPostError(
        err?.response?.data?.detail ?? err?.message ?? "Failed to save post",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const removeMedia = (id: string) => {
    setMediaFiles((current) => current.filter((item) => item.id !== id));
  };

  const handlePickMedia = async (
    event: ChangeEvent<HTMLInputElement>,
    mode: "image" | "video" | "audio",
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const filteredFiles =
      mode === "image"
        ? files.filter((file) => file.type.startsWith("image/"))
        : files.filter((file) => file.type.startsWith(`${mode}/`));

    if (filteredFiles.length === 0) {
      event.target.value = "";
      return;
    }

    const selectedFiles =
      mode === "image" ? filteredFiles : filteredFiles.slice(0, 1);

    const newItems = selectedFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      uri: URL.createObjectURL(file),
      status: "uploading" as const,
      type:
        file.type ||
        (mode === "audio"
          ? "audio/mpeg"
          : mode === "video"
            ? "video/mp4"
            : "image/jpeg"),
      name: file.name,
      fileSize: file.size,
    }));

    setMediaFiles((prev) => {
      if (mode === "image") return [...prev, ...newItems];
      const imageItems = prev.filter((item) => item.type.startsWith("image/"));
      return [...imageItems, ...newItems];
    });

    for (const item of newItems) {
      const sourceFile = selectedFiles.find(
        (file) => file.name === item.name && file.size === item.fileSize,
      );
      if (!sourceFile) continue;

      try {
        const uploadResult = await uploadCommunityMedia({
          blob: sourceFile,
          name: sourceFile.name,
          type: sourceFile.type || "image/jpeg",
          size: sourceFile.size,
        });

        setMediaFiles((current) =>
          current.map((media) =>
            media.id === item.id
              ? {
                  ...media,
                  status: "success",
                  publicUrl: uploadResult.publicUrl,
                }
              : media,
          ),
        );
      } catch {
        setMediaFiles((current) =>
          current.map((media) =>
            media.id === item.id ? { ...media, status: "error" } : media,
          ),
        );
      }
    }

    event.target.value = "";
  };

  return (
    <CommunityWebLayout activeLabel="Home" centerWidth={1280}>
      <div style={{ padding: "28px 28px 44px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            paddingBottom: 18,
            borderBottom: "1px solid #e6e8ed",
            marginBottom: 26,
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "#2a241e",
              fontSize: 24,
              lineHeight: 1.1,
              fontWeight: 700,
              fontFamily: "Georgia, serif",
            }}
          >
            {isEditing ? "Edit Post" : "Create Post"}
          </h1>
          <div
            style={{
              color: "#7b8090",
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: "0.03em",
            }}
          >
            DRAFT
          </div>
        </div>

        {isBootstrapping ? (
          <div style={{ padding: "24px 0", color: "#666" }}>Loading...</div>
        ) : (
          <>
            <div style={{ position: "relative", marginBottom: 22, maxWidth: 292 }}>
              <button
                onClick={() => setCommunityMenuOpen((value) => !value)}
                style={{
                  width: "100%",
                  height: 56,
                  background: "#e8edf3",
                  borderRadius: 999,
                  padding: "0 24px",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 18,
                  fontWeight: 500,
                  color: "#1a1a1b",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {selectedCommunityLabel}
                </span>
                <ChevronDown size={26} color="#2f3440" />
              </button>

              {communityMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: 62,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    background: "#fff",
                    border: "1px solid #EEE",
                    borderRadius: 12,
                    boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ padding: 10, borderBottom: "1px solid #EEE" }}>
                    <input
                      value={communitySearch}
                      onChange={(e) => setCommunitySearch(e.target.value)}
                      placeholder="Search communities..."
                      style={{
                        width: "100%",
                        height: 42,
                        borderRadius: 10,
                        border: "1px solid #EEE",
                        padding: "0 12px",
                        fontSize: 14,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div style={{ maxHeight: 300, overflowY: "auto" }}>
                    {filteredCommunities.map((community) => (
                      <button
                        key={String(community.id)}
                        onClick={() => {
                          setSelectedCommunity(String(community.slug || ""));
                          setCommunityMenuOpen(false);
                          setCommunitySearch("");
                        }}
                        style={{
                          width: "100%",
                          border: "none",
                          background: "#fff",
                          padding: "12px 14px",
                          textAlign: "left",
                          cursor: "pointer",
                          fontSize: 14,
                          color: "#1a1a1b",
                        }}
                      >
                        {community.name || community.slug}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                borderBottom: "1px solid #e4e7ec",
                marginBottom: 14,
              }}
            >
              <button
                type="button"
                onClick={() => setComposeTab("text")}
                style={composeTabStyle(composeTab === "text")}
              >
                Text
              </button>
              <button
                type="button"
                onClick={() => setComposeTab("media")}
                style={composeTabStyle(composeTab === "media")}
              >
                Images & Video
              </button>
            </div>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title*"
              style={{
                width: "100%",
                height: 60,
                borderRadius: 10,
                border: "1px solid #e0e4ea",
                padding: "0 16px",
                marginBottom: 18,
                fontSize: 18,
                fontWeight: 500,
                color: "#1a1a1b",
                fontFamily: "inherit",
                boxSizing: "border-box",
                outline: "none",
              }}
            />

            {composeTab === "text" ? (
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Body Text (optional)"
                rows={10}
                style={{
                  width: "100%",
                  minHeight: 340,
                  borderRadius: 12,
                  border: "1px solid #e0e4ea",
                  outline: "none",
                  resize: "vertical",
                  padding: "18px 20px",
                  fontSize: 16,
                  color: "#1a1a1b",
                  lineHeight: 1.6,
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            ) : (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                style={{
                  width: "100%",
                  minHeight: 156,
                  borderRadius: 14,
                  border: "2px dashed #d9dee7",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  color: "#7b8496",
                  fontSize: 18,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                <span>Drag and drop or upload media</span>
                <UploadCloud size={36} color="#b8b0b0" />
              </button>
            )}

            {mediaFiles.length > 0 && (
              <div style={{ marginTop: 18, paddingBottom: 8, overflowX: "auto" }}>
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    minWidth: "max-content",
                  }}
                >
                  {mediaFiles.map((item) => (
                    <div key={item.id} style={{ position: "relative" }}>
                      {item.type.startsWith("video/") ? (
                        <div
                          style={{
                            width: 120,
                            height: 120,
                            borderRadius: 8,
                            background: "#111",
                            position: "relative",
                            overflow: "hidden",
                          }}
                        >
                          <video
                            src={item.uri}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <div
                            style={{
                              position: "absolute",
                              inset: 0,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: "rgba(0,0,0,0.2)",
                            }}
                          >
                            <Play size={40} color="#FFF" />
                          </div>
                        </div>
                      ) : item.type.startsWith("audio/") ? (
                        <div
                          style={{
                            width: 120,
                            height: 120,
                            borderRadius: 8,
                            background: "#F6F7F8",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 10,
                            boxSizing: "border-box",
                          }}
                        >
                          <Mic size={30} color="#007AFF" />
                          <div
                            style={{
                              marginTop: 8,
                              fontSize: 11,
                              color: "#555",
                              textAlign: "center",
                              width: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.name || "Audio"}
                          </div>
                          <audio
                            controls
                            src={item.uri}
                            style={{
                              width: "100%",
                              marginTop: 8,
                              height: 30,
                            }}
                          />
                        </div>
                      ) : (
                        <img
                          src={item.uri}
                          alt="Selected media"
                          style={{
                            width: 120,
                            height: 120,
                            borderRadius: 8,
                            objectFit: "cover",
                            background: "#F0F0F0",
                            display: "block",
                          }}
                        />
                      )}

                      {item.status === "uploading" && (
                        <div
                          style={mediaOverlayStyle("rgba(0,0,0,0.3)")}
                        >
                          Uploading...
                        </div>
                      )}

                      {item.status === "error" && (
                        <div
                          style={mediaOverlayStyle("rgba(255,0,0,0.35)")}
                        >
                          Failed
                        </div>
                      )}

                      <button
                        onClick={() => removeMedia(item.id)}
                        style={{
                          position: "absolute",
                          top: -8,
                          right: -8,
                          background: "#FFF",
                          borderRadius: 999,
                          border: "none",
                          padding: 0,
                          display: "flex",
                          cursor: "pointer",
                          color: "rgba(0,0,0,0.6)",
                        }}
                        aria-label="Remove media"
                      >
                        <XCircle size={24} fill="currentColor" strokeWidth={0} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {fieldErrors.content && (
              <div
                style={{
                  color: "#FF3B30",
                  fontSize: 12,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                {fieldErrors.content}
              </div>
            )}

            {postError && (
              <div
                style={{
                  color: "#FF3B30",
                  fontSize: 12,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                {postError}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 18,
                marginTop: 28,
              }}
            >
              <button
                type="button"
                style={{
                  minWidth: 184,
                  height: 46,
                  borderRadius: 14,
                  border: "1px solid #d0a12f",
                  background: "#fff",
                  color: "#111",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Save Draft
              </button>
              <button
                onClick={() => void handlePost()}
                disabled={isPostDisabled}
                style={{
                  minWidth: 126,
                  height: 46,
                  borderRadius: 14,
                  border: "none",
                  background: isPostDisabled ? "#ecd297" : "#e2bf6f",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 800,
                  cursor: isPostDisabled ? "not-allowed" : "pointer",
                  opacity: isPostDisabled ? 0.7 : 1,
                }}
              >
                {isLoading ? "..." : "Post"}
              </button>
            </div>
          </>
        )}

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => void handlePickMedia(event, "image")}
          style={{ display: "none" }}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={(event) => void handlePickMedia(event, "video")}
          style={{ display: "none" }}
        />
        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          onChange={(event) => void handlePickMedia(event, "audio")}
          style={{ display: "none" }}
        />
      </div>
    </CommunityWebLayout>
  );
}

function composeTabStyle(active: boolean) {
  return {
    border: "none",
    background: "transparent",
    color: active ? "#d1a02d" : "#111",
    borderBottom: active ? "3px solid #d1a02d" : "3px solid transparent",
    padding: "12px 18px 18px",
    marginBottom: -1,
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
  } as const;
}

function mediaOverlayStyle(background: string) {
  return {
    position: "absolute",
    inset: 0,
    borderRadius: 8,
    background,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFF",
    fontSize: 12,
    fontWeight: 600,
  } as const;
}
