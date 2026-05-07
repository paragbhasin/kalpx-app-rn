import { isAuthenticated } from "@kalpx/auth";
import { ArrowDown, ArrowLeft, ArrowUp, X } from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatPracticeTypeLabel } from "../../data/creatorPracticeCatalog";
import {
  getCommunities,
  uploadCommunityMedia,
  type CommunityListItem,
} from "../../engine/communityApi";
import { api } from "../../lib/api";
import { webStorage } from "../../lib/webStorage";

const AUTH_SNAPSHOT_KEY = "kalpx_auth_snapshot";

type CreatorAuthSnapshot = {
  role?: string;
  user?: {
    role?: string;
    [key: string]: unknown;
  };
  profile?: {
    creator_type?: string;
    user?: {
      role?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  creator_profile?: {
    creator_type?: string;
    user?: {
      role?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
};

type SelectedPractice = {
  id: string | number;
  name?: string;
  title?: string;
  type?: string;
  category?: string;
};

type SimpleSlide = {
  local_id: string;
  image_url: string;
  thumbnail_url?: string;
  s3_key: string;
  layout?: {
    aspect_ratio?: string;
    [key: string]: unknown;
  };
};

function readAuthSnapshot(): CreatorAuthSnapshot | null {
  try {
    const raw = localStorage.getItem(AUTH_SNAPSHOT_KEY);
    return raw ? (JSON.parse(raw) as CreatorAuthSnapshot) : null;
  } catch {
    return null;
  }
}

function makeId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isVideo(url?: string) {
  if (!url) return false;
  const cleanUrl = url.split("?")[0].toLowerCase();
  return (
    cleanUrl.endsWith(".mp4") ||
    cleanUrl.endsWith(".webm") ||
    cleanUrl.endsWith(".mov")
  );
}

function slugify(text: unknown) {
  return String(text || "general")
    .toLowerCase()
    .trim()
    .replace(/\s*&\s*/g, "-")
    .replace(/\s+/g, "-");
}

function buildLinkedItemType(category: unknown, type: unknown) {
  if (!type) return "";
  const cleanCategory = slugify(category);
  const cleanType = String(type).toLowerCase().trim();
  const finalType = cleanType.includes(":")
    ? cleanType.split(":").pop()
    : cleanType;
  return `${cleanCategory}:${finalType}`;
}

function readCategoryFromLinkedType(type: unknown) {
  const value = String(type || "").trim();
  if (!value.includes(":")) return undefined;
  return value.split(":")[0];
}

function toMaybePostId(id?: string) {
  return id || null;
}

function defaultSlide(): SimpleSlide {
  return {
    local_id: makeId(),
    image_url: "",
    thumbnail_url: "",
    s3_key: "",
  };
}

function getAspectRatioCss(aspectRatio: string) {
  if (aspectRatio === "4:5") return "4 / 5";
  if (aspectRatio === "3:2") return "3 / 2";
  if (aspectRatio === "1:1") return "1 / 1";
  return "9 / 16";
}

export function CreatorSimplePostEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [authSnapshot, setAuthSnapshot] = useState<CreatorAuthSnapshot | null>(
    () => readAuthSnapshot(),
  );
  const [postLanguage, setPostLanguage] = useState("en");
  const [baseText, setBaseText] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [aspectRatio, setAspectRatio] = useState("4:5");
  const [slides, setSlides] = useState<SimpleSlide[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [selectedPractice, setSelectedPractice] =
    useState<SelectedPractice | null>(null);
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [communities, setCommunities] = useState<CommunityListItem[]>([]);
  const [bootstrapping, setBootstrapping] = useState(true);

  const userRole = useMemo(
    () =>
      authSnapshot?.role ||
      authSnapshot?.user?.role ||
      authSnapshot?.profile?.user?.role ||
      authSnapshot?.creator_profile?.user?.role ||
      "",
    [authSnapshot],
  );
  const creatorType = useMemo(
    () =>
      authSnapshot?.profile?.creator_type ||
      authSnapshot?.creator_profile?.creator_type ||
      "",
    [authSnapshot],
  );
  const isPostAdmin = userRole === "creator" && creatorType === "postadmin";

  useEffect(() => {
    isAuthenticated(webStorage).then((ok) => {
      if (!ok) {
        navigate("/login?returnTo=/en/creator/posts", { replace: true });
        return;
      }
      setAuthSnapshot(readAuthSnapshot());
    });
  }, [navigate]);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      setBootstrapping(true);
      try {
        const communityRes = await getCommunities({ page: 1, page_size: 100 });
        if (!mounted) return;
        setCommunities(communityRes.results || []);

        const tempDataRaw = sessionStorage.getItem("postEditor.tempData");
        const returnedPracticeRaw = sessionStorage.getItem("selectedPractice");
        const returnedPractice = returnedPracticeRaw
          ? (JSON.parse(returnedPracticeRaw) as SelectedPractice)
          : null;

        if (returnedPracticeRaw) {
          sessionStorage.removeItem("selectedPractice");
        }

        if (tempDataRaw) {
          const tempData = JSON.parse(tempDataRaw) as {
            postId: string | null;
            postTitle?: string;
            postLanguage?: string;
            aspectRatio?: string;
            baseText?: string;
            slides?: SimpleSlide[];
            selectedCommunity?: string;
            selectedPractice?: SelectedPractice | null;
          };

          if (tempData.postId === toMaybePostId(id)) {
            setPostTitle(tempData.postTitle || "");
            setPostLanguage(tempData.postLanguage || "en");
            setAspectRatio(tempData.aspectRatio || "4:5");
            setBaseText(tempData.baseText || "");
            setSlides(
              tempData.slides?.length ? tempData.slides : [defaultSlide()],
            );
            setSelectedCommunity(tempData.selectedCommunity || "");
            setSelectedPractice(
              returnedPractice || tempData.selectedPractice || null,
            );
            sessionStorage.removeItem("postEditor.tempData");
            setBootstrapping(false);
            return;
          }

          sessionStorage.removeItem("postEditor.tempData");
        }

        if (isEdit) {
          const res = await api.get(`explore-posts/${id}/`);
          if (!mounted) return;
          const post = res.data;
          setPostLanguage(post.base_language || "en");
          setPostTitle(post.title || "");
          setAspectRatio(post.aspect_ratio || "4:5");
          setBaseText(post.base_text || "");
          setIsPublished(Boolean(post.is_published));
          setSelectedCommunity(
            post.community_slug ||
              post.community?.slug ||
              post.community?.id ||
              "",
          );

          if (post.community_post?.linked_item) {
            setSelectedPractice({
              name: post.community_post.linked_item.name,
              type: post.community_post.linked_item.type,
              id: post.community_post.linked_item.id,
              category: readCategoryFromLinkedType(
                post.community_post.linked_item.type,
              ),
            });
          } else if (post.associated_practice) {
            setSelectedPractice(post.associated_practice);
          } else if (returnedPractice) {
            setSelectedPractice(returnedPractice);
          }

          setSlides(
            (post.slides || []).map((slide: any) => ({
              ...slide,
              local_id: makeId(),
              thumbnail_url: slide.thumbnail_url || "",
            })),
          );
        } else {
          setSlides([defaultSlide()]);
          if (returnedPractice) setSelectedPractice(returnedPractice);
        }
      } catch (error) {
        console.error("Failed to bootstrap simple creator editor:", error);
        setSlides([defaultSlide()]);
      } finally {
        if (mounted) setBootstrapping(false);
      }
    }

    void bootstrap();
    return () => {
      mounted = false;
    };
  }, [id, isEdit]);

  const addSlide = () => {
    setSlides((current) => [...current, defaultSlide()]);
    setActiveSlide(slides.length);
  };

  const removeSlide = (index: number) => {
    setSlides((current) => current.filter((_, i) => i !== index));
    setActiveSlide((prev) => Math.max(0, Math.min(prev, slides.length - 2)));
  };

  const moveSlide = (index: number, direction: -1 | 1) => {
    setSlides((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
    setActiveSlide((prev) =>
      Math.max(0, Math.min(slides.length - 1, prev + direction)),
    );
  };

  const uploadSlideImage = async (
    event: ChangeEvent<HTMLInputElement>,
    slide: SimpleSlide,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (!allowedTypes.includes(file.type)) {
      window.alert("Only images or videos are allowed");
      event.target.value = "";
      return;
    }

    try {
      const uploadResult = await uploadCommunityMedia({
        name: file.name,
        type: file.type,
        size: file.size,
        blob: file,
      });

      setSlides((current) =>
        current.map((item) =>
          item.local_id === slide.local_id
            ? {
                ...item,
                image_url: uploadResult.publicUrl,
                s3_key: uploadResult.key,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Slide upload failed:", error);
      window.alert("Failed to upload media.");
    } finally {
      event.target.value = "";
    }
  };

  const uploadSlideThumbnail = async (
    event: ChangeEvent<HTMLInputElement>,
    slide: SimpleSlide,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      window.alert("Only images are allowed for thumbnails");
      event.target.value = "";
      return;
    }

    try {
      const uploadResult = await uploadCommunityMedia({
        name: file.name,
        type: file.type,
        size: file.size,
        blob: file,
      });

      setSlides((current) =>
        current.map((item) =>
          item.local_id === slide.local_id
            ? {
                ...item,
                thumbnail_url: uploadResult.publicUrl,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error("Thumbnail upload failed:", error);
      window.alert("Failed to upload thumbnail.");
    } finally {
      event.target.value = "";
    }
  };

  const goToPracticeSelection = () => {
    sessionStorage.setItem(
      "postEditor.tempData",
      JSON.stringify({
        postId: toMaybePostId(id),
        postTitle,
        postLanguage,
        aspectRatio,
        baseText,
        slides,
        selectedCommunity,
        selectedPractice,
        isEdit,
        returnToPath: window.location.pathname,
      }),
    );
    navigate("/en/creator/posts/select-practice");
  };

  const savePost = async (publish = false) => {
    setSaving(true);
    try {
      const payload = {
        title: postTitle,
        base_text: baseText,
        base_language: postLanguage,
        seo_title: "",
        seo_description: "",
        is_published: publish,
        community_slug: selectedCommunity || null,
        linked_item: selectedPractice
          ? {
              id: selectedPractice.id,
              type: buildLinkedItemType(
                selectedPractice.category,
                selectedPractice.type,
              ),
              name: selectedPractice.title || selectedPractice.name || "",
            }
          : null,
        slides: slides.map((slide, index) => ({
          order: index,
          image_url: slide.image_url,
          thumbnail_url: slide.thumbnail_url || null,
          s3_key: slide.s3_key,
          layout: {
            ...(slide.layout || {}),
            aspect_ratio: aspectRatio,
          },
        })),
      };

      if (isEdit) {
        await api.put(`explore-posts/${id}/`, payload);
      } else {
        await api.post("explore-posts/", payload);
      }

      setIsPublished(publish);
      window.dispatchEvent(
        new CustomEvent("toast", {
          detail: publish ? "Post published!" : "Draft saved!",
        }),
      );
    } catch (error) {
      console.error("Save post failed:", error);
      window.alert("Failed to save post.");
    } finally {
      setSaving(false);
    }
  };

  if (bootstrapping) {
    return <div style={loadingStateStyle}>Loading editor...</div>;
  }

  if (!isPostAdmin) {
    return (
      <div style={restrictedWrapStyle}>
        <h1 style={restrictedTitleStyle}>Access Restricted</h1>
        <p style={restrictedTextStyle}>
          You do not have permissions to manage KalpX Posts.
        </p>
      </div>
    );
  }

  const currentSlide = slides[activeSlide];

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <button
          type="button"
          style={backButtonStyle}
          onClick={() => navigate("/en/creator/posts")}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <h1 style={pageTitleStyle}>
          {isEdit ? "Edit Post" : "Create New Post"}
        </h1>

        <span
          style={{
            ...statusBadgeStyle,
            ...(isPublished ? publishedBadgeStyle : draftBadgeStyle),
          }}
        >
          {isPublished ? "Published" : "Draft"}
        </span>

        <div style={headerActionsStyle}>
          <button
            type="button"
            style={draftButtonStyle}
            disabled={saving}
            onClick={() => void savePost(false)}
          >
            {saving ? "Saving..." : "Save Draft"}
          </button>
          <button
            type="button"
            style={publishButtonStyle}
            disabled={saving}
            onClick={() => void savePost(true)}
          >
            {saving ? "Publishing..." : "Publish Post"}
          </button>
        </div>
      </div>

      <div style={settingsCardStyle}>
        <div>
          <label style={labelStyle}>Post Title</label>
          <input
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            type="text"
            style={inputStyle}
            placeholder="Enter post title..."
          />
        </div>

        <div>
          <label style={labelStyle}>Post Language</label>
          <select
            value={postLanguage}
            onChange={(e) => setPostLanguage(e.target.value)}
            style={inputStyle}
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="ta">Tamil</option>
            <option value="mr">Marathi</option>
            <option value="bn">Bengali</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Aspect Ratio</label>
          <select
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
            style={inputStyle}
          >
            <option value="4:5">4:5 (Default)</option>
            <option value="3:2">3:2</option>
            <option value="1:1">1:1</option>
            <option value="9:16">9:16</option>
          </select>
        </div>

        <div>
          <label style={labelStyle}>Caption</label>
          <textarea
            value={baseText}
            onChange={(e) => setBaseText(e.target.value)}
            rows={4}
            style={{ ...inputStyle, minHeight: 110 }}
            placeholder="Enter base text..."
          />
        </div>

        <div>
          <label style={labelStyle}>Community (Optional)</label>
          <select
            value={selectedCommunity}
            onChange={(e) => setSelectedCommunity(e.target.value)}
            style={inputStyle}
          >
            <option value="">Select a Community</option>
            {communities.map((community) => (
              <option
                key={String(community.id)}
                value={community.slug || String(community.id)}
              >
                {community.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelStyle}>Associated Practice (Optional)</label>
          {selectedPractice ? (
            <div style={practiceSelectedStyle}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: "#166534" }}>
                    {selectedPractice.name || selectedPractice.title}
                  </div>
                  <div style={{ fontSize: 13, color: "#059669" }}>
                    {formatPracticeTypeLabel(selectedPractice.type)}
                  </div>
                </div>
              <button
                type="button"
                style={clearPracticeButtonStyle}
                onClick={() => setSelectedPractice(null)}
              >
                x
              </button>
            </div>
          ) : (
            <button
              type="button"
              style={practicePickerButtonStyle}
              onClick={goToPracticeSelection}
            >
              + Select a practice, mantra, or sankalp
            </button>
          )}
        </div>
      </div>

      <div style={tabsRowStyle}>
        {slides.map((slide, index) => (
          <button
            key={slide.local_id}
            type="button"
            onClick={() => setActiveSlide(index)}
            style={{
              ...tabButtonStyle,
              ...(activeSlide === index
                ? activeTabButtonStyle
                : inactiveTabButtonStyle),
            }}
          >
            Slide {index + 1}
          </button>
        ))}
        <button type="button" onClick={addSlide} style={addTabButtonStyle}>
          + Add Slide
        </button>
      </div>

      {slides.length === 0 ? (
        <div style={emptyStateStyle}>Add slides to begin editing.</div>
      ) : currentSlide ? (
        <div style={slideCardStyle}>
          <div style={slideHeaderStyle}>
            <h2 style={slideTitleStyle}>Slide {activeSlide + 1}</h2>
            <button
              type="button"
              style={deleteTextButtonStyle}
              onClick={() => removeSlide(activeSlide)}
            >
              Delete
            </button>
          </div>

          <label style={labelStyle}>Slide Image</label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => void uploadSlideImage(e, currentSlide)}
          />

          {currentSlide.image_url && isVideo(currentSlide.image_url) ? (
            <div style={thumbUploadCardStyle}>
              <label style={{ ...labelStyle, marginBottom: 6 }}>
                Video Thumbnail
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => void uploadSlideThumbnail(e, currentSlide)}
              />
              {currentSlide.thumbnail_url ? (
                <img src={currentSlide.thumbnail_url} style={thumbnailStyle} />
              ) : null}
            </div>
          ) : null}

          <div
            style={{
              ...slidePreviewBoxStyle,
              aspectRatio: getAspectRatioCss(aspectRatio),
            }}
          >
            {currentSlide.image_url ? (
              isVideo(currentSlide.image_url) ? (
                <video
                  src={currentSlide.image_url}
                  style={slidePreviewMediaStyle}
                  controls
                  playsInline
                />
              ) : (
                <img
                  src={currentSlide.image_url}
                  style={slidePreviewMediaStyle}
                />
              )
            ) : (
              <div style={slidePreviewEmptyStyle}>No Image</div>
            )}
          </div>
        </div>
      ) : null}

      {slides.length ? (
        <div style={previewSectionStyle}>
          <h2 style={previewTitleStyle}>Carousel Preview</h2>
          <div style={previewRailStyle}>
            {slides.map((slide, index) => (
              <div
                key={slide.local_id}
                style={{
                  ...previewCardStyle,
                  aspectRatio: getAspectRatioCss(aspectRatio),
                }}
              >
                <button
                  type="button"
                  style={previewDeleteStyle}
                  onClick={() => removeSlide(index)}
                >
                  <X size={12} />
                </button>
                <div style={previewMoveStyle}>
                  <button
                    type="button"
                    style={previewMoveButtonStyle}
                    onClick={() => moveSlide(index, -1)}
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    style={previewMoveButtonStyle}
                    onClick={() => moveSlide(index, 1)}
                  >
                    <ArrowDown size={12} />
                  </button>
                </div>
                {slide.image_url ? (
                  isVideo(slide.image_url) ? (
                    <video
                      src={slide.image_url}
                      style={previewCardMediaStyle}
                      muted
                      playsInline
                    />
                  ) : (
                    <img src={slide.image_url} style={previewCardMediaStyle} />
                  )
                ) : (
                  <div style={previewEmptyStyle}>No Image</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const pageStyle: CSSProperties = {
  margin: "0 auto",
  width: "100%",
  maxWidth: 1152,
  padding: "32px 24px",
};

const loadingStateStyle: CSSProperties = {
  minHeight: "100dvh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#475569",
  fontSize: 16,
};

const headerStyle: CSSProperties = {
  marginBottom: 24,
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
};

const backButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  borderRadius: 10,
  border: "none",
  background: "#d1d5db",
  padding: "10px 16px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

const pageTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 32,
  fontWeight: 700,
  fontFamily: "Cormorant Garamond, serif",
};

const statusBadgeStyle: CSSProperties = {
  marginLeft: 12,
  borderRadius: 999,
  padding: "6px 12px",
  fontSize: 14,
};

const publishedBadgeStyle: CSSProperties = {
  background: "#d1fae5",
  color: "#047857",
};

const draftBadgeStyle: CSSProperties = {
  background: "#e5e7eb",
  color: "#4b5563",
};

const headerActionsStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
};

const draftButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: 10,
  background: "#4b5563",
  color: "#fff",
  padding: "10px 20px",
  fontWeight: 600,
  cursor: "pointer",
};

const publishButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: 10,
  background: "#059669",
  color: "#fff",
  padding: "10px 20px",
  fontWeight: 600,
  cursor: "pointer",
};

const settingsCardStyle: CSSProperties = {
  marginBottom: 32,
  borderRadius: 16,
  background: "#fff",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
  padding: 24,
  display: "grid",
  gap: 24,
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 4,
};

const inputStyle: CSSProperties = {
  width: "100%",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  padding: "8px 10px",
  fontSize: 14,
  boxSizing: "border-box",
};

const practiceSelectedStyle: CSSProperties = {
  marginTop: 4,
  padding: 12,
  background: "#ecfdf5",
  border: "1px solid #a7f3d0",
  borderRadius: 10,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
};

const clearPracticeButtonStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#059669",
  cursor: "pointer",
};

const practicePickerButtonStyle: CSSProperties = {
  width: "100%",
  marginTop: 4,
  border: "1px solid #d1d5db",
  borderRadius: 8,
  background: "#fff",
  padding: "10px 14px",
  textAlign: "left",
  color: "#4b5563",
  cursor: "pointer",
};

const tabsRowStyle: CSSProperties = {
  marginBottom: 16,
  borderBottom: "1px solid #e5e7eb",
  display: "flex",
  gap: 8,
  overflowX: "auto",
};

const tabButtonStyle: CSSProperties = {
  padding: "8px 16px",
  fontSize: 14,
  borderRadius: "10px 10px 0 0",
  border: "1px solid transparent",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const activeTabButtonStyle: CSSProperties = {
  background: "#fff",
  borderLeftColor: "#d1d5db",
  borderRightColor: "#d1d5db",
  borderTopColor: "#d1d5db",
  fontWeight: 600,
  color: "#111827",
};

const inactiveTabButtonStyle: CSSProperties = {
  background: "#f3f4f6",
  color: "#4b5563",
};

const addTabButtonStyle: CSSProperties = {
  padding: "8px 16px",
  fontSize: 14,
  background: "#eff6ff",
  color: "#2563eb",
  borderRadius: "10px 10px 0 0",
  border: "1px solid #bfdbfe",
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const emptyStateStyle: CSSProperties = {
  color: "#475569",
  fontSize: 14,
};

const slideCardStyle: CSSProperties = {
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  background: "#fff",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
  padding: 24,
};

const slideHeaderStyle: CSSProperties = {
  marginBottom: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
};

const slideTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 28,
  fontWeight: 700,
  fontFamily: "Cormorant Garamond, serif",
};

const deleteTextButtonStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#dc2626",
  fontSize: 14,
  cursor: "pointer",
};

const thumbUploadCardStyle: CSSProperties = {
  marginTop: 12,
  padding: 12,
  background: "#f9fafb",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
};

const thumbnailStyle: CSSProperties = {
  marginTop: 8,
  width: 80,
  height: 80,
  objectFit: "cover",
  borderRadius: 8,
  border: "1px solid #d1d5db",
};

const slidePreviewBoxStyle: CSSProperties = {
  marginTop: 12,
  borderRadius: 8,
  border: "1px solid #d1d5db",
  width: 160,
  overflow: "hidden",
};

const slidePreviewMediaStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const slidePreviewEmptyStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  minHeight: 180,
  background: "#e2e8f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
};

const previewSectionStyle: CSSProperties = {
  marginTop: 48,
};

const previewTitleStyle: CSSProperties = {
  margin: "0 0 12px",
  fontSize: 28,
  fontWeight: 700,
  fontFamily: "Cormorant Garamond, serif",
};

const previewRailStyle: CSSProperties = {
  display: "flex",
  gap: 16,
  overflowX: "auto",
  padding: "12px 0",
};

const previewCardStyle: CSSProperties = {
  position: "relative",
  width: 96,
  borderRadius: 12,
  overflow: "hidden",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
  border: "1px solid #d1d5db",
  flexShrink: 0,
};

const previewDeleteStyle: CSSProperties = {
  position: "absolute",
  top: 4,
  right: 4,
  zIndex: 2,
  border: "none",
  borderRadius: 6,
  background: "rgba(0,0,0,0.6)",
  color: "#fff",
  padding: "4px 6px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const previewMoveStyle: CSSProperties = {
  position: "absolute",
  top: 4,
  left: 4,
  zIndex: 2,
  display: "flex",
  flexDirection: "column",
  gap: 4,
};

const previewMoveButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: 6,
  background: "rgba(0,0,0,0.6)",
  color: "#fff",
  padding: "4px 6px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const previewCardMediaStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const previewEmptyStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  minHeight: 120,
  background: "#e2e8f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12,
};

const restrictedWrapStyle: CSSProperties = {
  minHeight: "100dvh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "32px 16px",
  textAlign: "center",
};

const restrictedTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 36,
  fontWeight: 700,
  fontFamily: "Cormorant Garamond, serif",
  color: "#0f172a",
};

const restrictedTextStyle: CSSProperties = {
  marginTop: 12,
  fontSize: 18,
  color: "#334155",
};
