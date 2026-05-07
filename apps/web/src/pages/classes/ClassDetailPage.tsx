import type { ClassDetail } from "@kalpx/types";
import { Share2 } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClassCard } from "../../components/classes/ClassCard";
import {
  ClassCardSkeleton,
  ClassDetailSkeleton,
} from "../../components/classes/ClassLoadingSkeleton";
import { getClassDetail, getClasses } from "../../engine/classApi";
import { WEB_ENV } from "../../lib/env";

function resolveMediaUrl(media?: { url?: string; key?: string } | null) {
  if (!media) return null;
  if (media.url) return media.url;
  if (media.key) return `${WEB_ENV.imageBaseUrl}/${media.key}`;
  return null;
}

function getPriceBits(cls: ClassDetail | null) {
  const cur = cls?.pricing?.currency || "INR";
  const typ = cls?.pricing?.type || "per_person";
  const amount =
    typ === "per_group"
      ? cls?.pricing?.per_group?.amount?.web
      : cls?.pricing?.per_person?.amount?.web;
  const time =
    typ === "per_group"
      ? (cls?.pricing?.per_group as any)?.session_length_min
      : (cls?.pricing?.per_person as any)?.session_length_min;

  const fmt = (n?: number | null) => {
    if (n == null) return "";
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: cur,
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return `${cur} ${n}`;
    }
  };

  return {
    amount: fmt(amount),
    type: typ === "per_group" ? "group" : "person",
    time: `${time ?? cls?.duration_minutes ?? 0}m`,
  };
}

export function ClassDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [cls, setCls] = useState<ClassDetail | null>(null);
  const [relatedClasses, setRelatedClasses] = useState<ClassDetail[]>([]);
  const [relatedPage, setRelatedPage] = useState(1);
  const [relatedHasMore, setRelatedHasMore] = useState(false);
  const [relatedLoadingMore, setRelatedLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const [tutorDescExpanded, setTutorDescExpanded] = useState(false);

  async function loadTutorClasses(
    creatorId: number,
    currentSlug: string,
    page: number,
    mode: "replace" | "append" = "replace",
  ) {
    if (mode === "append") setRelatedLoadingMore(true);
    try {
      const siblingData = await getClasses({
        status: "published",
        ordering: "-updated_at",
        page,
        page_size: 10,
      });

      const nextRelated = (siblingData?.results ?? []).filter(
        (item) =>
          !!item && item.slug !== currentSlug && item.creator_id === creatorId,
      ) as ClassDetail[];

      setRelatedClasses((prev) =>
        mode === "append"
          ? [
              ...prev,
              ...nextRelated.filter(
                (item) => !prev.some((p) => p.id === item.id),
              ),
            ]
          : nextRelated,
      );
      setRelatedPage(page);
      setRelatedHasMore(!!siblingData?.next);
    } finally {
      setRelatedLoadingMore(false);
    }
  }

  useEffect(() => {
    if (!slug) return;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getClassDetail(slug);
        if (!data) {
          setError("Class not found.");
          return;
        }
        setCls(data);
        setRelatedClasses([]);
        setRelatedPage(1);
        setRelatedHasMore(false);
        await loadTutorClasses(
          data.creator_id as number,
          data.slug,
          1,
          "replace",
        );
      } catch (err: any) {
        if (WEB_ENV.isDev) console.error("[ClassDetailPage] load error:", err);
        setError("Could not load class.");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  useEffect(() => {
    if (!cls || !loadMoreRef.current || !relatedHasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !relatedLoadingMore) {
          void loadTutorClasses(
            cls.creator_id as number,
            cls.slug,
            relatedPage + 1,
            "append",
          );
        }
      },
      { root: null, rootMargin: "160px", threshold: 0.01 },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [cls, relatedHasMore, relatedLoadingMore, relatedPage]);

  const priceBits = useMemo(() => getPriceBits(cls), [cls]);
  const description = cls?.long_description || cls?.description || "";
  const tutorDescription =
    ((cls?.tutor as any)?.description as string | undefined) ||
    cls?.tutor?.bio ||
    cls?.tutor_bio ||
    "";
  const canBook = cls?.status !== "inactive" && cls?.status !== "draft";
  const classIntroVideo = resolveMediaUrl((cls as any)?.intro_media);
  const classCoverImage = resolveMediaUrl((cls?.cover_media as any) ?? null);
  const tutorIntroVideo = resolveMediaUrl((cls?.tutor as any)?.intro_video);
  const tutorAvatar =
    resolveMediaUrl((cls?.tutor as any)?.avatar) ||
    cls?.tutor?.avatar_url ||
    null;

  async function handleShareTutorProfile() {
    const shareUrl = window.location.href;
    const tutorName = cls?.tutor?.profile_name || cls?.tutor?.name || "Tutor";
    const shareText = `Learn with ${tutorName} on KalpX`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: tutorName,
          text: shareText,
          url: shareUrl,
        });
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setShareFeedback("Link copied");
        window.setTimeout(() => setShareFeedback(null), 1800);
        return;
      }
    } catch {
      return;
    }
  }

  if (loading) {
    return (
      <div
        style={{ minHeight: "100dvh", background: "var(--kalpx-parchment)" }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <ClassDetailSkeleton />
        </div>
      </div>
    );
  }

  if (error || !cls) {
    return (
      <div
        style={{ minHeight: "100dvh", background: "var(--kalpx-parchment)" }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "10px" }}>
          <button onClick={() => navigate("/en/classes")} style={backBtn}>
            ← Back to Classes
          </button>
          <p style={{ color: "#b91c1c", fontSize: 14 }}>
            {error ?? "Class not found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: "var(--kalpx-parchment)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "10px" }}>
        <button onClick={() => navigate("/en/classes")} style={backBtn}>
          ← Back
        </button>

        <div style={{ display: "grid", gap: 24, marginTop: 18 }}>
          <section
            style={{
              display: "grid",
              gap: 24,
              padding: 5,
            }}
          >
            <style>{`
              @media (min-width: 1024px) {
                .kalpx-class-detail-top {
                  grid-template-columns: minmax(320px, 40%) minmax(0, 1fr);
                }
                .kalpx-class-detail-grid {
                  grid-template-columns: minmax(0, 1fr) minmax(340px, 30vw);
                  align-items: start;
                }
                .kalpx-detail-aside {
                  position: sticky;
                  top: 88px;
                }
              }
            `}</style>

            <div
              className="kalpx-class-detail-grid"
              style={{ display: "grid", gap: 24 }}
            >
              <div>
                <div
                  className="kalpx-class-detail-top"
                  style={{ display: "grid", gap: 24 }}
                >
                  <div
                    style={{
                      background: "#000",
                      borderRadius: 16,
                      overflow: "hidden",
                      minHeight: 220,
                    }}
                  >
                    {classIntroVideo ? (
                      <video
                        src={classIntroVideo}
                        controls
                        playsInline
                        style={{
                          width: "100%",
                          height: "100%",
                          minHeight: 220,
                          objectFit: "contain",
                          background: "#000",
                          display: "block",
                        }}
                      />
                    ) : classCoverImage ? (
                      <img
                        src={classCoverImage}
                        alt={cls.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          minHeight: 220,
                          objectFit: "contain",
                          background: "#000",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          minHeight: 220,
                          display: "grid",
                          placeItems: "center",
                          background: "#f8fafc",
                          color: "#94a3b8",
                          fontSize: 14,
                        }}
                      >
                        No media
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      minHeight: 220,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 28,
                          fontWeight: 700,
                          color: "#0f172a",
                          wordBreak: "break-word",
                        }}
                      >
                        {cls.title}
                      </div>
                      {!!(cls as any).subtitle && (
                        <p
                          style={{
                            margin: "8px 0 0",
                            fontSize: 16,
                            color: "#475569",
                          }}
                        >
                          {(cls as any).subtitle}
                        </p>
                      )}

                      <section
                        style={{
                          marginTop: 14,
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          <span style={{ color: "#6b7280", fontWeight: 500 }}>
                            Duration :
                          </span>
                          <span style={{ color: "#111", fontWeight: 600 }}>
                            {priceBits.time}
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            flexWrap: "wrap",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "baseline",
                              gap: 4,
                            }}
                          >
                            <span
                              style={{
                                color: "var(--kalpx-cta)",
                                fontSize: 24,
                                fontWeight: 800,
                              }}
                            >
                              {priceBits.amount} /
                            </span>
                            <span style={{ fontWeight: 600 }}>
                              {priceBits.type}
                            </span>
                          </div>
                          {canBook && (
                            <button
                              onClick={() =>
                                navigate(`/en/classes/${cls.slug}/book`)
                              }
                              style={bookNowBtnMobile}
                            >
                              Book Now →
                            </button>
                          )}
                        </div>
                      </section>

                      {!!description && (
                        <section style={{ marginTop: 16 }}>
                          <div
                            style={{
                              fontSize: 16,
                              color: "#303030",
                              fontWeight: 500,
                              lineHeight: 1.6,
                              display: descExpanded ? "block" : "-webkit-box",
                              WebkitLineClamp: descExpanded ? "unset" : 4,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {description}
                          </div>
                          {description.length > 240 && (
                            <button
                              onClick={() => setDescExpanded((v) => !v)}
                              style={toggleBtn}
                            >
                              {descExpanded ? "Show less" : "Show more"}
                            </button>
                          )}
                        </section>
                      )}
                    </div>
                  </div>
                </div>

                <section
                  style={{
                    marginTop: 24,

                    padding: 6,
                  }}
                >
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#4b5563",
                      marginBottom: 12,
                    }}
                  >
                    About Tutor
                  </div>

                  <div
                    className="kalpx-class-detail-top"
                    style={{ display: "grid", gap: 24 }}
                  >
                    <div
                      style={{
                        background: "#000",
                        borderRadius: 16,
                        overflow: "hidden",
                        minHeight: 220,
                      }}
                    >
                      {tutorIntroVideo ? (
                        <video
                          src={tutorIntroVideo}
                          controls
                          playsInline
                          style={{
                            width: "100%",
                            height: "100%",
                            minHeight: 220,
                            objectFit: "contain",
                            background: "#000",
                            display: "block",
                          }}
                        />
                      ) : tutorAvatar ? (
                        <img
                          src={tutorAvatar}
                          alt={cls.tutor.name || "Tutor"}
                          style={{
                            width: "100%",
                            height: "100%",
                            minHeight: 220,
                            objectFit: "contain",
                            background: "#000",
                            display: "block",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            minHeight: 220,
                            display: "grid",
                            placeItems: "center",
                            background: "#f8fafc",
                            color: "#94a3b8",
                            fontSize: 14,
                          }}
                        >
                          No tutor video available
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            fontSize: 24,
                            fontWeight: 700,
                            color: "#0f172a",
                          }}
                        >
                          {cls.tutor?.profile_name || "Tutor"}
                        </h3>
                        <button
                          type="button"
                          onClick={handleShareTutorProfile}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 10,
                            borderRadius: 14,
                            border: "1px solid #707070",
                            background: "#fff",
                            padding: "6px 20px",
                            color: "#2b2b2b",
                            fontSize: 16,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          Share
                          <Share2 size={22} />
                        </button>
                      </div>

                      {shareFeedback && (
                        <div
                          style={{
                            fontSize: 13,
                            color: "var(--kalpx-cta)",
                            fontWeight: 600,
                          }}
                        >
                          {shareFeedback}
                        </div>
                      )}

                      {!!tutorDescription && (
                        <section>
                          <div
                            style={{
                              fontSize: 16,
                              color: "#303030",
                              fontWeight: 500,
                              lineHeight: 1.6,
                              display: tutorDescExpanded
                                ? "block"
                                : "-webkit-box",
                              WebkitLineClamp: tutorDescExpanded ? "unset" : 4,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {tutorDescription}
                          </div>
                          {tutorDescription.length > 240 && (
                            <button
                              onClick={() => setTutorDescExpanded((v) => !v)}
                              style={toggleBtn}
                            >
                              {tutorDescExpanded ? "Show less" : "Show more"}
                            </button>
                          )}
                        </section>
                      )}
                    </div>
                  </div>
                </section>

                <div style={{ marginTop: 24 }}>
                  <div
                    style={{
                      marginBottom: 12,
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Classes by this tutor
                  </div>
                  {relatedClasses.length > 0 ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(280px, 1fr))",

                        marginBottom: 40,
                      }}
                    >
                      {relatedClasses.map((item) => (
                        <ClassCard key={item.id} cls={item} />
                      ))}
                      {relatedLoadingMore && (
                        <>
                          <ClassCardSkeleton />
                          <ClassCardSkeleton />
                        </>
                      )}
                      {relatedHasMore && (
                        <div
                          ref={loadMoreRef}
                          style={{
                            height: 32,
                            width: "100%",
                            gridColumn: "1 / -1",
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: 20,
                      }}
                    >
                      <ClassDetailSkeleton />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

const backBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "var(--kalpx-cta)",
  fontSize: 14,
  cursor: "pointer",
  padding: 0,
};

const toggleBtn: React.CSSProperties = {
  marginTop: 6,
  color: "var(--kalpx-cta)",
  fontSize: 16,
  fontWeight: 500,
  background: "none",
  border: "none",
  padding: 0,
  cursor: "pointer",
};

const bookNowBtnDesktop: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  borderRadius: 10,
  background: "var(--kalpx-cta)",
  padding: "10px 16px",
  fontSize: 16,
  fontWeight: 700,
  color: "#111",
};

const bookNowBtnMobile: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  borderRadius: 10,
  background: "var(--kalpx-cta)",
  padding: "10px 16px",
  fontSize: 14,
  fontWeight: 700,
  color: "#111",
};
