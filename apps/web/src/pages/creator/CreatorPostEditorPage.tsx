import { isAuthenticated } from "@kalpx/auth";
import { ArrowDown, ArrowLeft, ArrowUp, Copy, Trash2 } from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
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

type SlideBlock = {
  id?: string;
  text?: string;
  lang?: string;
  x?: number;
  y?: number;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  align?: string;
  opacity?: number;
  shadow?: number;
  stroke?: number;
  bg?: boolean;
};

type SlideLayout = {
  aspect_ratio?: string;
  aspect?: string;
  blocks?: SlideBlock[];
  imageUrl?: string;
  [key: string]: unknown;
};

type EditorSlide = {
  local_id: string;
  image_url: string;
  s3_key: string;
  layout: SlideLayout;
  __dirty?: boolean;
};

type SelectedPractice = {
  id: string | number;
  name?: string;
  title?: string;
  type?: string;
  category?: string;
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

function defaultSlide(aspectRatio: string): EditorSlide {
  return {
    local_id: makeId(),
    image_url: "",
    s3_key: "",
    layout: {
      aspect_ratio: aspectRatio,
      aspect: aspectRatio,
      blocks: [],
    },
  };
}

function normalizeLayout(layout: any, aspectRatio: string): SlideLayout {
  const next = layout ? JSON.parse(JSON.stringify(layout)) : {};
  next.aspect_ratio = aspectRatio;
  next.aspect = aspectRatio;
  next.blocks = Array.isArray(next.blocks) ? next.blocks : [];
  return next;
}

function SlideLayoutEditor({
  slide,
  aspectRatio,
  onChange,
}: {
  slide: EditorSlide;
  aspectRatio: string;
  onChange: (layout: SlideLayout) => void;
}) {
  const tabs = [
    { id: "block1", label: "Block 1" },
    { id: "block2", label: "Block 2" },
    { id: "block3", label: "Block 3" },
    { id: "block4", label: "Block 4" },
    { id: "block5", label: "Block 5" },
  ] as const;
  const [activeTab, setActiveTab] =
    useState<(typeof tabs)[number]["id"]>("block1");
  const [blocks, setBlocks] = useState<SlideBlock[]>([]);
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    const nextLayout = slide.layout || {};
    setBlocks(
      Array.isArray(nextLayout.blocks)
        ? JSON.parse(JSON.stringify(nextLayout.blocks))
        : [],
    );
    setImageUrl(
      slide.image_url ||
        (typeof nextLayout.imageUrl === "string" ? nextLayout.imageUrl : "") ||
        "",
    );
  }, [slide.image_url, slide.layout]);

  const currentLayout = useMemo<SlideLayout>(
    () => ({
      ...slide.layout,
      aspect: aspectRatio,
      aspect_ratio: aspectRatio,
      image_url: imageUrl,
      imageUrl,
      blocks,
    }),
    [aspectRatio, blocks, imageUrl, slide.layout],
  );

  const canvasBox = useMemo(() => {
    const [wStr, hStr] = (aspectRatio || "1:1").split(":");
    const w = Number.parseFloat(wStr) || 1;
    const h = Number.parseFloat(hStr) || 1;
    const baseWidth = 420;
    return {
      width: `${baseWidth}px`,
      height: `${baseWidth * (h / w)}px`,
    };
  }, [aspectRatio]);

  const updateBlocks = (updater: (prev: SlideBlock[]) => SlideBlock[]) => {
    setBlocks((prev) => {
      const next = updater(prev);
      onChange({
        ...currentLayout,
        blocks: next,
      });
      return next;
    });
  };

  const addBlock = () => {
    updateBlocks((prev) => {
      if (prev.length >= 5) return prev;
      return [
        ...prev,
        {
          id: makeId(),
          text: "",
          lang: "en",
          fontSize: 26,
          fontFamily: "Cormorant",
          align: "center",
          x: 50,
          y: 50,
          opacity: 100,
          color: "#ffffff",
          shadow: 0.5,
          stroke: 1,
          bg: false,
        },
      ];
    });
  };

  const removeBlock = (index: number) => {
    updateBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const duplicateBlock = (index: number) => {
    updateBlocks((prev) => {
      const source = prev[index];
      if (!source) return prev;
      const copy = JSON.parse(JSON.stringify(source)) as SlideBlock;
      copy.id = makeId();
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next.slice(0, 5);
    });
  };

  const updateBlock = (
    index: number,
    patch: Partial<SlideBlock> | ((block: SlideBlock) => SlideBlock),
  ) => {
    updateBlocks((prev) =>
      prev.map((block, i) => {
        if (i !== index) return block;
        return typeof patch === "function"
          ? patch(block)
          : { ...block, ...patch };
      }),
    );
  };

  const emitLayout = () => {
    onChange(currentLayout);
  };

  const startDrag = (index: number, event: ReactMouseEvent<HTMLDivElement>) => {
    const preview = document.getElementById(
      `composer-preview-${slide.local_id}`,
    );
    if (!preview) return;

    const block = blocks[index];
    if (!block) return;

    const rect = preview.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const initialX = block.x ?? 50;
    const initialY = block.y ?? 50;

    const onMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      const percentX = (dx / rect.width) * 100;
      const percentY = (dy / rect.height) * 100;

      updateBlock(index, {
        x: Math.min(100, Math.max(0, initialX + percentX)),
        y: Math.min(100, Math.max(0, initialY + percentY)),
      });
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      emitLayout();
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const blockStyle = (block: SlideBlock): CSSProperties => ({
    position: "absolute",
    top: `${block.y ?? 50}%`,
    left: `${block.x ?? 50}%`,
    transform: "translate(-50%, -50%)",
    fontSize: `${block.fontSize ?? 26}px`,
    fontFamily: block.fontFamily || "Cormorant",
    color: block.color || "#ffffff",
    textAlign: (block.align as CSSProperties["textAlign"]) || "center",
    whiteSpace: "pre-line",
    zIndex: 5,
    filter: `drop-shadow(0 0 ${((block.shadow ?? 0) as number) * 6}px black)`,
    WebkitTextStroke: `${block.stroke ?? 0}px black`,
    pointerEvents: "auto",
    opacity: ((block.opacity ?? 100) as number) / 100,
    cursor: "move",
  });

  const blockIndex = Number(activeTab.replace("block", "")) - 1;
  const activeBlock = blocks[blockIndex];

  return (
    <div style={composerLayoutStyle}>
      <aside style={composerSidebarStyle}>
        <div style={composerTabsStyle}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...composerTabStyle,
                ...(activeTab === tab.id ? composerTabActiveStyle : {}),
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={composerPanelStyle}>
          {!activeBlock ? (
            <div style={composerEmptyStateStyle}>
              <h3 style={composerSectionTitleStyle}>Text {blockIndex + 1}</h3>
              <button
                type="button"
                onClick={addBlock}
                style={composerAddBlockStyle}
              >
                + Add Block
              </button>
            </div>
          ) : (
            <div style={composerFieldsStyle}>
              <h3 style={composerSectionTitleStyle}>
                Text Block {blockIndex + 1}
              </h3>

              <label style={smallLabelStyle}>Text</label>
              <textarea
                value={activeBlock.text || ""}
                onChange={(e) =>
                  updateBlock(blockIndex, { text: e.target.value })
                }
                style={textareaFieldStyle}
                rows={2}
              />

              <label style={smallLabelStyle}>Language</label>
              <select
                value={activeBlock.lang || "en"}
                onChange={(e) =>
                  updateBlock(blockIndex, { lang: e.target.value })
                }
                style={smallInputStyle}
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="mr">Marathi</option>
                <option value="bn">Bengali</option>
                <option value="gu">Gujarati</option>
                <option value="ta">Tamil</option>
              </select>

              <label style={smallLabelStyle}>Font Family</label>
              <select
                value={activeBlock.fontFamily || "Cormorant"}
                onChange={(e) =>
                  updateBlock(blockIndex, { fontFamily: e.target.value })
                }
                style={smallInputStyle}
              >
                <option value="Cormorant">Cormorant</option>
                <option value="Inter">Inter</option>
                <option value="Garamond">Garamond</option>
                <option value="Noto Devanagari">Noto Devanagari</option>
              </select>

              <label style={smallLabelStyle}>Font Size</label>
              <input
                type="range"
                min="14"
                max="60"
                value={activeBlock.fontSize ?? 26}
                onChange={(e) =>
                  updateBlock(blockIndex, {
                    fontSize: Number.parseInt(e.target.value, 10),
                  })
                }
              />

              <label style={smallLabelStyle}>Color</label>
              <input
                type="color"
                value={activeBlock.color || "#ffffff"}
                onChange={(e) =>
                  updateBlock(blockIndex, { color: e.target.value })
                }
              />

              <label style={smallLabelStyle}>Opacity (%)</label>
              <input
                type="range"
                min="10"
                max="100"
                value={activeBlock.opacity ?? 100}
                onChange={(e) =>
                  updateBlock(blockIndex, {
                    opacity: Number.parseInt(e.target.value, 10),
                  })
                }
              />

              <label style={checkboxRowStyle}>
                <span>Background Strip</span>
                <input
                  type="checkbox"
                  checked={Boolean(activeBlock.bg)}
                  onChange={(e) =>
                    updateBlock(blockIndex, { bg: e.target.checked })
                  }
                />
              </label>

              <label style={smallLabelStyle}>X Position (%)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={activeBlock.x ?? 50}
                onChange={(e) =>
                  updateBlock(blockIndex, {
                    x: Number.parseInt(e.target.value, 10),
                  })
                }
              />

              <label style={smallLabelStyle}>Y Position (%)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={activeBlock.y ?? 50}
                onChange={(e) =>
                  updateBlock(blockIndex, {
                    y: Number.parseInt(e.target.value, 10),
                  })
                }
              />

              <label style={smallLabelStyle}>Alignment</label>
              <select
                value={activeBlock.align || "center"}
                onChange={(e) =>
                  updateBlock(blockIndex, { align: e.target.value })
                }
                style={smallInputStyle}
              >
                <option value="left">left</option>
                <option value="center">center</option>
                <option value="right">right</option>
              </select>

              <label style={smallLabelStyle}>Shadow Strength</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={activeBlock.shadow ?? 0.5}
                onChange={(e) =>
                  updateBlock(blockIndex, {
                    shadow: Number.parseFloat(e.target.value),
                  })
                }
              />

              <label style={smallLabelStyle}>Stroke Width</label>
              <input
                type="range"
                min="0"
                max="4"
                value={activeBlock.stroke ?? 1}
                onChange={(e) =>
                  updateBlock(blockIndex, {
                    stroke: Number.parseInt(e.target.value, 10),
                  })
                }
              />

              <div style={composerActionsRowStyle}>
                <button
                  type="button"
                  onClick={() => removeBlock(blockIndex)}
                  style={dangerTextButtonStyle}
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => duplicateBlock(blockIndex)}
                  style={primaryTextButtonStyle}
                >
                  Duplicate
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={emitLayout}
          style={composerSaveButtonStyle}
        >
          Save Layout
        </button>
      </aside>

      <main style={composerPreviewWrapStyle}>
        <div
          id={`composer-preview-${slide.local_id}`}
          style={{
            ...composerPreviewStyle,
            width: canvasBox.width,
            height: canvasBox.height,
          }}
        >
          {imageUrl ? (
            isVideo(imageUrl) ? (
              <video
                src={imageUrl}
                style={composerPreviewMediaStyle}
                muted
                autoPlay
                loop
                playsInline
                controls
              />
            ) : (
              <img src={imageUrl} style={composerPreviewMediaStyle} />
            )
          ) : null}

          {blocks.map((block, index) => (
            <div
              key={block.id || `${index}`}
              style={blockStyle(block)}
              onMouseDown={(event) => startDrag(index, event)}
            >
              {block.bg ? (
                <span style={bgTextStyle}>
                  {block.text || "Your text here"}
                </span>
              ) : (
                <span>{block.text || "Your text here"}</span>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export function CreatorPostEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [authSnapshot, setAuthSnapshot] = useState<CreatorAuthSnapshot | null>(
    () => readAuthSnapshot(),
  );
  const [postTitle, setPostTitle] = useState("");
  const [baseLanguage, setBaseLanguage] = useState("en");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [communitySlug, setCommunitySlug] = useState("");
  const [baseCaption, setBaseCaption] = useState("");
  const [communities, setCommunities] = useState<CommunityListItem[]>([]);
  const [selectedPractice, setSelectedPractice] =
    useState<SelectedPractice | null>(null);
  const [slides, setSlides] = useState<EditorSlide[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [saving, setSaving] = useState(false);
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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!slides.length) return;
      if (e.key === "ArrowLeft") {
        setActiveSlide((prev) => Math.max(0, prev - 1));
      }
      if (e.key === "ArrowRight") {
        setActiveSlide((prev) => Math.min(slides.length - 1, prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  useEffect(() => {
    setSlides((current) =>
      current.map((slide) => ({
        ...slide,
        layout: normalizeLayout(slide.layout, aspectRatio),
      })),
    );
  }, [aspectRatio]);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      setBootstrapping(true);
      try {
        const [communityRes, postRes] = await Promise.all([
          getCommunities({ page: 1, page_size: 100 }),
          isEdit ? api.get(`explore-posts/${id}/`) : Promise.resolve(null),
        ]);

        if (!mounted) return;
        setCommunities(communityRes.results || []);

        const selectedPracticeData = sessionStorage.getItem("selectedPractice");
        if (selectedPracticeData) {
          setSelectedPractice(JSON.parse(selectedPracticeData));
          sessionStorage.removeItem("selectedPractice");
        }

        if (postRes?.data) {
          const post = postRes.data;
          setPostTitle(post.title || "");
          setBaseLanguage(post.base_language || "en");
          setBaseCaption(post.base_text || "");
          setAspectRatio(post.aspect_ratio || "1:1");
          setCommunitySlug(post.community?.slug || post.community_slug || "");
          setSlides(
            (post.slides || []).map((slide: any) => ({
              ...slide,
              local_id: makeId(),
              s3_key: slide.s3_key || "",
              layout: normalizeLayout(slide.layout, post.aspect_ratio || "1:1"),
            })),
          );

          if (post.community_post?.linked_item) {
            setSelectedPractice(post.community_post.linked_item);
          }
        } else {
          setSlides([defaultSlide("1:1")]);
        }
      } catch (error) {
        console.error("Failed to bootstrap creator post editor:", error);
        if (!isEdit) {
          setSlides([defaultSlide("1:1")]);
        }
      } finally {
        if (mounted) setBootstrapping(false);
      }
    }

    void bootstrap();
    return () => {
      mounted = false;
    };
  }, [id, isEdit]);

  const activeEditorSlide = slides[activeSlide] ?? null;

  const selectedCommunityLabel = useMemo(
    () =>
      communities.find((community) => community.slug === communitySlug)?.name ||
      "— None —",
    [communities, communitySlug],
  );

  const addSlide = () => {
    setSlides((current) => [...current, defaultSlide(aspectRatio)]);
    setActiveSlide(slides.length);
  };

  const duplicateSlide = (index: number) => {
    setSlides((current) => {
      const copy = JSON.parse(JSON.stringify(current[index])) as EditorSlide;
      copy.local_id = makeId();
      const next = [...current];
      next.splice(index + 1, 0, copy);
      return next;
    });
    setActiveSlide(index + 1);
  };

  const moveSlide = (index: number, direction: -1 | 1) => {
    setSlides((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
    setActiveSlide((prev) =>
      Math.max(0, Math.min(slides.length - 1, prev + direction)),
    );
  };

  const removeSlide = (index: number) => {
    setSlides((current) => current.filter((_, i) => i !== index));
    setActiveSlide((prev) => Math.max(0, Math.min(prev, slides.length - 2)));
  };

  const updateSlide = (index: number, patch: Partial<EditorSlide>) => {
    setSlides((current) =>
      current.map((slide, i) => (i === index ? { ...slide, ...patch } : slide)),
    );
  };

  const updateSlideLayout = (index: number, layout: SlideLayout) => {
    setSlides((current) =>
      current.map((slide, i) =>
        i === index
          ? {
              ...slide,
              image_url:
                typeof layout.imageUrl === "string" && layout.imageUrl
                  ? layout.imageUrl
                  : slide.image_url,
              layout: normalizeLayout(layout, aspectRatio),
              __dirty: true,
            }
          : slide,
      ),
    );
  };

  const uploadSlideImage = async (
    e: ChangeEvent<HTMLInputElement>,
    slide: EditorSlide,
  ) => {
    const file = e.target.files?.[0];
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
      e.target.value = "";
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
      e.target.value = "";
    }
  };

  const goToPracticeSelection = () => {
    sessionStorage.setItem(
      "postEditor.tempData",
      JSON.stringify({
        postId: id,
        slides,
        isEdit,
        returnTo: "postEditor",
      }),
    );
  };

  const savePost = async (publish = false) => {
    if (!postTitle.trim()) {
      window.alert("Post Title is required before saving.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: postTitle || "",
        base_language: baseLanguage,
        base_text: baseCaption || "",
        aspect_ratio: aspectRatio,
        community_slug: communitySlug || null,
        is_published: publish,
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
          image_url: slide.image_url || "",
          s3_key: slide.s3_key || "",
          layout: normalizeLayout(slide.layout, aspectRatio),
        })),
      };

      const res = isEdit
        ? await api.put(`explore-posts/${id}/`, payload)
        : await api.post("explore-posts/", payload);

      const savedId = res?.data?.id || id;

      if (publish && savedId) {
        await api.post(`explore-posts/${savedId}/publish/`, {});
      }

      if (!publish) return;
      navigate("/en/creator/posts");
    } catch (error) {
      console.error("Failed to save creator post:", error);
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

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={pageTitleStyle}>
          {isEdit ? "Edit Post" : "Create New Post"}
        </h1>

        <div style={headerActionsStyle}>
          <button
            type="button"
            style={backButtonStyle}
            onClick={() => navigate("/en/creator/posts")}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
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
            {saving
              ? "Saving..."
              : isEdit
                ? "Update & Publish"
                : "Publish Post"}
          </button>
        </div>
      </div>

      <div style={metaCardStyle}>
        <div style={metaGridStyle}>
          <div>
            <label style={labelStyle}>
              Post Title <span style={requiredStyle}>*</span>
            </label>
            <input
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              type="text"
              required
              style={inputStyle}
              placeholder="Title is required"
            />
          </div>

          <div>
            <label style={labelStyle}>Post Language</label>
            <select
              value={baseLanguage}
              onChange={(e) => setBaseLanguage(e.target.value)}
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
              <option value="4:5">4:5 (Portrait)</option>
              <option value="3:2">3:2 (Landscape)</option>
              <option value="1:1">1:1 (Square)</option>
              <option value="9:16">9:16 (Story / Reel)</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Community</label>
            <select
              value={communitySlug}
              onChange={(e) => setCommunitySlug(e.target.value)}
              style={inputStyle}
            >
              <option value="">— None —</option>
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
        </div>

        <div>
          <label style={labelStyle}>Caption (Base Text)</label>
          <textarea
            value={baseCaption}
            onChange={(e) => setBaseCaption(e.target.value)}
            rows={3}
            style={{ ...inputStyle, minHeight: 96 }}
            placeholder="Main caption / story text"
          />
        </div>

        <div style={practiceRowStyle}>
          <div style={{ fontSize: 14 }}>
            <span style={{ fontWeight: 600 }}>Associated Practice:</span>
            {selectedPractice ? (
              <div style={practiceSelectedStyle}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, color: "#166534" }}>
                    {selectedPractice.name || selectedPractice.title}
                  </div>
                  <div style={{ fontSize: 13, color: "#059669" }}>
                    {selectedPractice.type}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPractice(null)}
                  style={practiceClearStyle}
                >
                  x
                </button>
              </div>
            ) : (
              <div style={{ color: "#64748b", marginTop: 4 }}>
                None selected
              </div>
            )}
          </div>

          <button
            type="button"
            style={linkButtonStyle}
            onClick={goToPracticeSelection}
          >
            Select
          </button>
          {selectedPractice ? (
            <button
              type="button"
              style={{ ...linkButtonStyle, color: "#dc2626" }}
              onClick={() => setSelectedPractice(null)}
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>

      <div style={editorLayoutStyle}>
        <aside style={slidesRailStyle}>
          <h2 style={slidesHeadingStyle}>Slides</h2>

          <div style={slidesListStyle}>
            {slides.map((slide, index) => (
              <div
                key={slide.local_id}
                style={{
                  ...thumbCardStyle,
                  ...(activeSlide === index ? thumbCardActiveStyle : {}),
                }}
                onClick={() => setActiveSlide(index)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setActiveSlide(index);
                }}
                tabIndex={0}
              >
                {slide.image_url ? (
                  isVideo(slide.image_url) ? (
                    <video
                      src={slide.image_url}
                      style={thumbMediaStyle}
                      muted
                    />
                  ) : (
                    <img src={slide.image_url} style={thumbMediaStyle} />
                  )
                ) : (
                  <div style={thumbEmptyStyle}>No Image</div>
                )}

                <span style={thumbIndexStyle}>{index + 1}</span>
                <div style={thumbActionsStyle}>
                  <button
                    type="button"
                    style={thumbMiniButtonStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveSlide(index, -1);
                    }}
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    style={thumbMiniButtonStyle}
                    onClick={(e) => {
                      e.stopPropagation();
                      moveSlide(index, 1);
                    }}
                  >
                    <ArrowDown size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={addSlide} style={addSlideButtonStyle}>
            + Add Slide
          </button>
        </aside>

        <main style={editorMainStyle}>
          {slides.length ? (
            <>
              <div style={tabsRowStyle}>
                {slides.map((slide, index) => (
                  <button
                    key={`${slide.local_id}-tab`}
                    type="button"
                    onClick={() => setActiveSlide(index)}
                    style={{
                      ...tabButtonStyle,
                      ...(activeSlide === index ? tabButtonActiveStyle : {}),
                    }}
                  >
                    Slide {index + 1}
                  </button>
                ))}
              </div>

              {activeEditorSlide ? (
                <div style={slideEditorCardStyle}>
                  <div style={slideEditorHeaderStyle}>
                    <h2 style={slideTitleStyle}>Slide {activeSlide + 1}</h2>

                    <div style={slideHeaderButtonsStyle}>
                      <button
                        type="button"
                        style={linkButtonStyle}
                        onClick={() => duplicateSlide(activeSlide)}
                      >
                        <Copy size={14} />
                        Duplicate
                      </button>
                      <button
                        type="button"
                        style={{ ...linkButtonStyle, color: "#dc2626" }}
                        onClick={() => removeSlide(activeSlide)}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>Slide Image</label>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) =>
                        void uploadSlideImage(e, activeEditorSlide)
                      }
                    />
                    {activeEditorSlide.image_url ? (
                      isVideo(activeEditorSlide.image_url) ? (
                        <video
                          src={activeEditorSlide.image_url}
                          style={previewMediaStyle}
                          controls
                          playsInline
                        />
                      ) : (
                        <img
                          src={activeEditorSlide.image_url}
                          style={previewMediaStyle}
                        />
                      )
                    ) : null}
                  </div>

                  <SlideLayoutEditor
                    slide={activeEditorSlide}
                    aspectRatio={aspectRatio}
                    onChange={(layout) =>
                      updateSlideLayout(activeSlide, layout)
                    }
                  />
                </div>
              ) : null}
            </>
          ) : (
            <div style={{ color: "#475569", fontSize: 14 }}>
              Add slides to begin editing.
            </div>
          )}
        </main>
      </div>

      {slides.length ? (
        <div style={previewSectionStyle}>
          <h2 style={previewTitleStyle}>Full Carousel Preview</h2>

          <div style={previewRailStyle}>
            {slides.map((slide) => (
              <div key={slide.local_id} style={previewCardStyle}>
                {slide.image_url ? (
                  isVideo(slide.image_url) ? (
                    <video
                      src={slide.image_url}
                      style={previewCardMediaStyle}
                      muted
                      controls
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

      <div style={footerNoteStyle}>
        Selected community: {selectedCommunityLabel}
      </div>
    </div>
  );
}

const pageStyle: CSSProperties = {
  margin: "0 auto",
  width: "100%",
  maxWidth: 1280,
  padding: "32px 16px",
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

const pageTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 32,
  fontWeight: 700,
  fontFamily: "Cormorant Garamond, serif",
};

const headerActionsStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 12,
};

const backButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#fff",
  padding: "10px 16px",
  fontWeight: 600,
  cursor: "pointer",
};

const draftButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: 10,
  background: "#475569",
  color: "#fff",
  padding: "10px 16px",
  fontWeight: 600,
  cursor: "pointer",
};

const publishButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: 10,
  background: "#059669",
  color: "#fff",
  padding: "10px 16px",
  fontWeight: 600,
  cursor: "pointer",
};

const metaCardStyle: CSSProperties = {
  marginBottom: 24,
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  background: "#fff",
  padding: 24,
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
  display: "grid",
  gap: 16,
};

const metaGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
};

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 6,
};

const requiredStyle: CSSProperties = {
  color: "#dc2626",
};

const inputStyle: CSSProperties = {
  width: "100%",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  padding: "8px 10px",
  fontSize: 14,
  boxSizing: "border-box",
};

const practiceRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 12,
};

const practiceSelectedStyle: CSSProperties = {
  marginTop: 6,
  padding: 12,
  background: "#ecfdf5",
  border: "1px solid #a7f3d0",
  borderRadius: 10,
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 12,
};

const practiceClearStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#059669",
  cursor: "pointer",
};

const linkButtonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  border: "none",
  background: "transparent",
  color: "#2563eb",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  padding: 0,
};

const editorLayoutStyle: CSSProperties = {
  display: "flex",
  gap: 24,
  alignItems: "flex-start",
  flexWrap: "wrap",
};

const slidesRailStyle: CSSProperties = {
  width: 160,
  flexShrink: 0,
};

const slidesHeadingStyle: CSSProperties = {
  margin: "0 0 12px",
  fontSize: 14,
  fontWeight: 600,
};

const slidesListStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const thumbCardStyle: CSSProperties = {
  position: "relative",
  overflow: "hidden",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  cursor: "pointer",
};

const thumbCardActiveStyle: CSSProperties = {
  boxShadow: "0 0 0 2px #2563eb inset",
};

const thumbMediaStyle: CSSProperties = {
  width: "100%",
  height: 96,
  objectFit: "cover",
  display: "block",
};

const thumbEmptyStyle: CSSProperties = {
  height: 96,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#e2e8f0",
  fontSize: 12,
};

const thumbIndexStyle: CSSProperties = {
  position: "absolute",
  top: 4,
  left: 4,
  fontSize: 10,
  color: "#fff",
  background: "rgba(0,0,0,0.5)",
  padding: "2px 4px",
  borderRadius: 4,
};

const thumbActionsStyle: CSSProperties = {
  position: "absolute",
  top: 4,
  right: 4,
  display: "flex",
  gap: 4,
};

const thumbMiniButtonStyle: CSSProperties = {
  border: "none",
  background: "rgba(0,0,0,0.5)",
  color: "#fff",
  borderRadius: 4,
  padding: 2,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const addSlideButtonStyle: CSSProperties = {
  marginTop: 20,
  width: "100%",
  border: "none",
  borderRadius: 10,
  background: "#2563eb",
  color: "#fff",
  padding: "10px 12px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const editorMainStyle: CSSProperties = {
  flex: 1,
  minWidth: 320,
};

const tabsRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  marginBottom: 16,
  overflowX: "auto",
  paddingBottom: 4,
};

const tabButtonStyle: CSSProperties = {
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#fff",
  color: "#334155",
  padding: "8px 12px",
  fontSize: 14,
  fontWeight: 600,
  whiteSpace: "nowrap",
  cursor: "pointer",
};

const tabButtonActiveStyle: CSSProperties = {
  background: "#2563eb",
  color: "#fff",
  borderColor: "#1d4ed8",
};

const slideEditorCardStyle: CSSProperties = {
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  background: "#fff",
  padding: 24,
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
};

const slideEditorHeaderStyle: CSSProperties = {
  marginBottom: 16,
  display: "flex",
  flexWrap: "wrap",
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

const slideHeaderButtonsStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
};

const previewMediaStyle: CSSProperties = {
  marginTop: 8,
  maxHeight: 192,
  borderRadius: 8,
  maxWidth: "100%",
};

const composerLayoutStyle: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 24,
  width: "100%",
};

const composerSidebarStyle: CSSProperties = {
  width: "100%",
  maxWidth: 410,
  padding: 20,
  borderRadius: 16,
  background: "#fff",
  border: "1px solid #e2e8f0",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.10)",
  maxHeight: "92vh",
  overflowY: "auto",
  display: "grid",
  gap: 16,
};

const composerTabsStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  borderBottom: "1px solid #e2e8f0",
  paddingBottom: 8,
  marginBottom: 4,
  overflowX: "auto",
};

const composerTabStyle: CSSProperties = {
  padding: "8px 16px",
  borderRadius: "10px 10px 0 0",
  fontWeight: 600,
  border: "none",
  borderBottom: "2px solid transparent",
  color: "#475569",
  background: "#f1f5f9",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const composerTabActiveStyle: CSSProperties = {
  borderBottom: "2px solid var(--accent, #d4a017)",
  color: "#000",
  background: "#fff",
};

const composerPanelStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const composerEmptyStateStyle: CSSProperties = {
  display: "grid",
  gap: 12,
};

const composerFieldsStyle: CSSProperties = {
  padding: 12,
  border: "1px solid #cbd5e1",
  borderRadius: 12,
  background: "#f8fafc",
  display: "grid",
  gap: 10,
};

const composerSectionTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 600,
};

const composerAddBlockStyle: CSSProperties = {
  justifySelf: "start",
  border: "none",
  borderRadius: 8,
  background: "#059669",
  color: "#fff",
  padding: "6px 10px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

const smallLabelStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: "#0f172a",
};

const smallInputStyle: CSSProperties = {
  width: "100%",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  padding: "6px 8px",
  fontSize: 13,
  boxSizing: "border-box",
};

const textareaFieldStyle: CSSProperties = {
  ...smallInputStyle,
  minHeight: 70,
  resize: "vertical",
};

const checkboxRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontSize: 12,
  fontWeight: 600,
  color: "#0f172a",
};

const composerActionsRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  paddingTop: 8,
};

const primaryTextButtonStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#2563eb",
  fontSize: 12,
  cursor: "pointer",
  padding: 0,
};

const dangerTextButtonStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#dc2626",
  fontSize: 12,
  cursor: "pointer",
  padding: 0,
};

const composerSaveButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: 10,
  background: "var(--accent, #d4a017)",
  color: "#000",
  height: 50,
  fontWeight: 600,
  cursor: "pointer",
};

const composerPreviewWrapStyle: CSSProperties = {
  flex: 1,
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
};

const composerPreviewStyle: CSSProperties = {
  position: "relative",
  borderRadius: 16,
  overflow: "hidden",
  background: "rgba(15, 23, 42, 0.05)",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.10)",
};

const composerPreviewMediaStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  zIndex: 1,
};

const bgTextStyle: CSSProperties = {
  background: "rgba(0, 0, 0, 0.5)",
  padding: "4px 8px",
  borderRadius: 6,
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
  padding: "16px 0",
};

const previewCardStyle: CSSProperties = {
  width: 192,
  height: 288,
  overflow: "hidden",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.06)",
  flexShrink: 0,
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
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#e2e8f0",
  fontSize: 12,
};

const footerNoteStyle: CSSProperties = {
  marginTop: 16,
  fontSize: 13,
  color: "#64748b",
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
