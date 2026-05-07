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

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameDate(a: Date | null, b: Date | null) {
  return !!a && !!b && a.toDateString() === b.toDateString();
}

function formatDateLocal(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTimeLabel(slot: any) {
  try {
    const src = slot.start_user || slot.start_utc;
    const date = new Date(src);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    return `${h12}:${`${minutes}`.padStart(2, "0")} ${ampm}`;
  } catch {
    return slot.start_utc || "";
  }
}

function buildMonthGrid(month: Date, availableSlots: any[]) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: Array<null | {
    date: Date;
    hasSlots: boolean;
    selectable: boolean;
  }> = [];

  for (let i = 0; i < firstDay.getDay(); i += 1) days.push(null);

  for (let d = 1; d <= lastDay.getDate(); d += 1) {
    const date = new Date(month.getFullYear(), month.getMonth(), d);
    date.setHours(0, 0, 0, 0);
    const dateStr = formatDateLocal(date);
    const daySlots = availableSlots.find((slot) => slot.date === dateStr);
    const hasSlots = Boolean(daySlots?.slots?.length);
    days.push({
      date,
      hasSlots,
      selectable: hasSlots && date >= today,
    });
  }

  return days;
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
  const [monthCursor, setMonthCursor] = useState(startOfMonth(new Date()));
  const [pickedDate, setPickedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [note, setNote] = useState("");
  const [trialSelected, setTrialSelected] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : true,
  );

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
    function onResize() {
      setIsMobile(window.innerWidth < 768);
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
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
        const firstDate = data.available_slots?.[0]?.date
          ? new Date(data.available_slots[0].date)
          : new Date();
        firstDate.setHours(0, 0, 0, 0);
        setMonthCursor(startOfMonth(firstDate));
        setPickedDate(firstDate);
        setSelectedSlot(null);
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
  const availableSlots = cls?.available_slots ?? [];
  const monthDays = useMemo(
    () => buildMonthGrid(monthCursor, availableSlots),
    [monthCursor, availableSlots],
  );
  const slotTimes = useMemo(() => {
    if (!pickedDate) return [];
    const daySlots = availableSlots.find(
      (slot) => slot.date === formatDateLocal(pickedDate),
    );
    return daySlots?.slots ?? [];
  }, [availableSlots, pickedDate]);
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

  function shiftMonth(delta: number) {
    setSelectedSlot(null);
    const next = new Date(monthCursor);
    next.setMonth(next.getMonth() + delta, 1);
    const nextCursor = startOfMonth(next);
    setMonthCursor(nextCursor);
    const nextDays = buildMonthGrid(nextCursor, availableSlots);
    const nextSelectable =
      nextDays.find((day) => day?.selectable)?.date ?? null;
    setPickedDate(nextSelectable);
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
    <div style={{ minHeight: "100dvh" }}>
      <div
        className="kalpx-detail-page"
        style={{ maxWidth: 1700, margin: "0 auto", padding: "10px" }}
      >
        {isMobile && (
          <button onClick={() => navigate("/en/classes")} style={backBtn}>
            ← Back
          </button>
        )}

        <div
          className="kalpx-detail-page-body"
          style={{ display: "grid", gap: 24, marginTop: 18 }}
        >
          <section
            className="kalpx-detail-page-section"
            style={{
              display: "grid",
              gap: 24,
              padding: 5,
            }}
          >
            <style>{`
              @media (min-width: 1024px) {
                .kalpx-detail-page {
                  height: 100dvh;
                  overflow: hidden;
                  display: flex;
                  flex-direction: column;
                }
                .kalpx-detail-page-body {
                  flex: 1;
                  min-height: 0;
                }
                .kalpx-detail-page-section {
                  height: 100%;
                  min-height: 0;
                }
                .kalpx-class-detail-top {
                  grid-template-columns: minmax(320px, 40%) minmax(0, 1fr);
                }
                .kalpx-related-classes-grid {
                  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                  gap: 20px !important;
                }
                .kalpx-detail-shell {
                  height: 100%;
                  min-height: 0;
                  overflow: hidden;
                }
                .kalpx-class-detail-grid {
                  grid-template-columns: 415px minmax(0, 1fr);
                  align-items: start;
                  height: 100%;
                  min-height: 0;
                }
                .kalpx-detail-aside {
                  display: flex !important;
                  flex-direction: column;
                  height: 100%;
                  min-height: 0;
                  overflow-y: auto;
                }
                .kalpx-detail-main {
                  order: 2;
                  height: 100%;
                  min-height: 0;
                  overflow-y: auto;
                  padding-right: 8px;
                }
                .kalpx-detail-sidebar {
                  order: 1;
                  padding-right: 28px;
                  border-right: 1px solid #d9d9d9;
                  min-height: 0;
                }
              }
            `}</style>

            <div
              className="kalpx-detail-shell kalpx-class-detail-grid"
              style={{ display: "grid", gap: 24 }}
            >
              <aside
                className="kalpx-detail-aside kalpx-detail-sidebar"
                style={{ display: "none", gap: 22 }}
              >
                <button
                  onClick={() => navigate("/en/classes")}
                  style={desktopBackBtn}
                >
                  ↩
                </button>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#2f2f2f",
                  }}
                >
                  Tutor Availability
                </div>

                <div
                  style={{
                    border: "1px solid #d9d9d9",
                    background: "#f0f0f0",
                    borderRadius: 25,
                    padding: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => shiftMonth(-1)}
                      style={calendarArrowBtn}
                    >
                      ‹
                    </button>
                    <div
                      style={{ fontSize: 16, fontWeight: 700, color: "#111" }}
                    >
                      {monthCursor.toLocaleString([], {
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={() => shiftMonth(1)}
                      style={calendarArrowBtn}
                    >
                      ›
                    </button>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      textAlign: "center",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#2f2f2f",
                    }}
                  >
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                      <div key={day}>{day}</div>
                    ))}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      gap: 4,
                    }}
                  >
                    {monthDays.map((day, idx) => (
                      <div key={idx} style={{ aspectRatio: "1 / 1" }}>
                        {day ? (
                          <button
                            type="button"
                            disabled={!day.selectable}
                            onClick={() => {
                              setPickedDate(day.date);
                              setSelectedSlot(null);
                            }}
                            style={{
                              width: "100%",
                              height: "100%",
                              border: "none",
                              background: isSameDate(day.date, pickedDate)
                                ? "var(--kalpx-cta)"
                                : "transparent",
                              color: isSameDate(day.date, pickedDate)
                                ? "#fff"
                                : day.hasSlots
                                  ? "#111"
                                  : "#b8c0cf",
                              borderRadius: isSameDate(day.date, pickedDate)
                                ? 14
                                : 0,
                              fontSize: 15,
                              fontWeight: 700,
                              cursor: day.selectable
                                ? "pointer"
                                : "not-allowed",
                              opacity: day.selectable ? 1 : 0.4,
                            }}
                          >
                            {day.date.getDate()}
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#2f2f2f",
                    }}
                  >
                    Available Slots
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                      gap: 12,
                    }}
                  >
                    {slotTimes.map((slot, idx) => (
                      <button
                        key={`${slot.start_utc}-${idx}`}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        style={{
                          border: "none",
                          borderRadius: 8,
                          background:
                            selectedSlot?.start_utc === slot.start_utc
                              ? "var(--kalpx-cta)"
                              : "#f3f4f6",
                          color:
                            selectedSlot?.start_utc === slot.start_utc
                              ? "#fff"
                              : "#2f2f2f",
                          padding: "10px 12px",
                          fontSize: 16,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {formatTimeLabel(slot)}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/en/classes/${cls.slug}/book`)}
                  disabled={!canBook}
                  style={{
                    ...bookNowBtnDesktop,
                    opacity: canBook ? 1 : 0.5,
                    cursor: canBook ? "pointer" : "not-allowed",
                    justifyContent: "center",
                    width: "fit-content",
                  }}
                >
                  Book Now ↗
                </button>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                  }}
                >
                  <span style={{ color: "#6b7280", fontWeight: 500 }}>
                    Duration :
                  </span>
                  <span style={{ color: "#111", fontWeight: 700 }}>
                    {priceBits.time}
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      color: "var(--kalpx-cta)",
                      fontSize: 22,
                      fontWeight: 800,
                    }}
                  >
                    {priceBits.amount}
                  </span>
                  <span
                    style={{ color: "#111", fontSize: 14, fontWeight: 500 }}
                  >
                    {" "}
                    / {priceBits.type}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 14,
                    fontSize: 13,
                  }}
                >
                  <div>
                    <span style={{ color: "#6b7280", fontWeight: 500 }}>
                      Tutor TZ :{" "}
                    </span>
                    <span style={{ color: "#111", fontWeight: 700 }}>
                      {cls?.class_availability?.timezone ||
                        cls?.tutor?.timezone ||
                        "Asia/Kolkata"}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#6b7280", fontWeight: 500 }}>
                      Your TZ :{" "}
                    </span>
                    <span style={{ color: "#111", fontWeight: 700 }}>
                      {Intl.DateTimeFormat().resolvedOptions().timeZone ||
                        "Local"}
                    </span>
                  </div>
                </div>
                {cls?.pricing?.trial?.enabled && (
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={trialSelected}
                      onChange={(e) => setTrialSelected(e.target.checked)}
                      style={{ width: 16, height: 16 }}
                    />
                    <span style={{ fontSize: 14, color: "#475569" }}>
                      Trial at{" "}
                      <strong style={{ color: "#111" }}>
                        {new Intl.NumberFormat(undefined, {
                          style: "currency",
                          currency: cls?.pricing?.currency || "INR",
                          maximumFractionDigits: 2,
                        }).format(cls?.pricing?.trial?.amount || 0)}
                      </strong>
                    </span>
                  </label>
                )}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <label
                    htmlFor="desktop-note"
                    style={{ fontSize: 16, fontWeight: 700, color: "#111" }}
                  >
                    Note to tutor{" "}
                    <span style={{ color: "#6b7280", fontWeight: 500 }}>
                      (Optional)
                    </span>
                  </label>
                  <textarea
                    id="desktop-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={5}
                    placeholder="Enter a comment"
                    style={{
                      width: "100%",
                      borderRadius: 14,
                      border: "2px solid #111",
                      padding: "16px 18px",
                      resize: "vertical",
                      fontSize: 16,
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </aside>

              <div className="kalpx-detail-main">
                <div
                  className="kalpx-class-detail-top"
                  style={{
                    display: "grid",
                    gap: 24,
                    border: "1px solid #e1e5ee",
                    borderRadius: 24,
                    padding: 20,
                    background: "#fff",
                  }}
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

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginTop: 20,
                      }}
                    >
                      {canBook && (
                        <button
                          onClick={() => navigate(`/en/classes/${cls.slug}/book`)}
                          style={bookNowBtnDesktop}
                        >
                          Book Now →
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <section
                  style={{
                    marginTop: 24,
                    border: "1px solid #e1e5ee",
                    borderRadius: 24,
                    padding: 26,
                    background: "#fff",
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
                      fontSize: 24,
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    Classes by this tutor
                  </div>
                  {relatedClasses.length > 0 ? (
                    <div
                      className="kalpx-related-classes-grid"
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: 20,
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
                      className="kalpx-related-classes-grid"
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

const desktopBackBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#2f2f2f",
  fontSize: 28,
  cursor: "pointer",
  padding: 0,
  width: "fit-content",
};

const calendarArrowBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: 28,
  fontWeight: 700,
  lineHeight: 1,
  padding: 0,
  color: "#111",
  cursor: "pointer",
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
