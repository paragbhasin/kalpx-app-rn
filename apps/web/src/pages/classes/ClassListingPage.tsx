import { isAuthenticated } from "@kalpx/auth";
import type { BookingListItem, ClassListing } from "@kalpx/types";
import { Filter, Search } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClassCard } from "../../components/classes/ClassCard";
import { ClassCardSkeleton } from "../../components/classes/ClassLoadingSkeleton";
import { AppShell, Chip, EmptyState, ModalSheet } from "../../components/ui";
import { getClasses, getMyBookings } from "../../engine/classApi";
import { WEB_ENV } from "../../lib/env";
import { webStorage } from "../../lib/webStorage";

type Tab = "explore" | "bookings";
const EXPLORE_REQUEST_DEDUPE_MS = 800;
let lastExploreRequest: { key: string; at: number } | null = null;

const SUBJECT_OPTIONS = [
  { value: "", label: "All" },
  { value: "Mantra Chanting", label: "Mantra Chanting" },
  { value: "Sanatan Teachings", label: "Sanatan Teachings" },
  { value: "Everyday Vedanta", label: "Everyday Vedanta" },
  { value: "Yoga", label: "Yoga" },
  { value: "Indian Classical Dance", label: "Indian Classical Dance" },
  { value: "Indian Classical Music", label: "Indian Classical Music" },
  { value: "Vedas & Upanishads", label: "Vedas & Upanishads" },
] as const;

const SORT_OPTIONS = [
  { value: "-updated_at", label: "Newest" },
  { value: "updated_at", label: "Oldest" },
] as const;

const SKILL_OPTIONS = [
  { value: "", label: "Select" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

const TYPE_OPTIONS = [
  { value: "", label: "Select" },
  { value: "per_person", label: "Per Person" },
  { value: "per_group", label: "Per Group" },
] as const;

const SCHEDULE_OPTIONS = [
  { value: "", label: "Select" },
  { value: "one_time", label: "One Time" },
  { value: "recurring", label: "Recurring" },
] as const;

const LANGUAGE_OPTIONS = [
  { value: "", label: "Select" },
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "telugu", label: "Telugu" },
  { value: "tamil", label: "Tamil" },
] as const;

const STATUS_LABEL: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  confirmed: { label: "Confirmed", color: "#166534", bg: "#dcfce7" },
  pending: { label: "Pending", color: "#92400e", bg: "#fef3c7" },
  cancelled: { label: "Cancelled", color: "#991b1b", bg: "#fee2e2" },
  completed: { label: "Completed", color: "#1e40af", bg: "#dbeafe" },
  rescheduled: { label: "Rescheduled", color: "#6b21a8", bg: "#f3e8ff" },
  requested: { label: "Requested", color: "#1d4ed8", bg: "#dbeafe" },
};

function formatDateTime(utc: string): string {
  try {
    return new Date(utc).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return utc;
  }
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ fontSize: 14, fontWeight: 500, color: "#303030" }}>
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          borderRadius: 10,
          border: "1px solid #d9d6cf",
          padding: "12px 14px",
          background: "#fff",
          color: "var(--kalpx-text)",
          fontSize: 14,
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function BookingCard({
  booking,
  onNavigate,
}: {
  booking: BookingListItem;
  onNavigate: (slug: string) => void;
}) {
  const offering = booking.offering;
  const time = booking.start_utc || booking.scheduled_at;
  const badge = STATUS_LABEL[booking.status] ?? {
    label: booking.status,
    color: "var(--kalpx-text-muted)",
    bg: "var(--kalpx-chip-bg)",
  };

  return (
    <div
      onClick={() => offering?.slug && onNavigate(offering.slug)}
      style={{
        background: "#fff",
        border: "1px solid #E1E1E1",
        borderRadius: 16,
        padding: "18px 18px",
        marginBottom: 16,
        cursor: offering?.slug ? "pointer" : "default",
        boxShadow: "0 4px 35px rgba(0, 0, 0, 0.12)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <p
            style={{
              margin: 0,
              fontSize: 17,
              lineHeight: 1.25,
              fontWeight: 700,
              color: "var(--kalpx-text)",
            }}
          >
            {offering?.title ?? "Session"}
          </p>
          {offering?.tutor?.name && (
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13,
                color: "var(--kalpx-text-soft)",
              }}
            >
              with {offering.tutor.name}
            </p>
          )}
          {time && (
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 12,
                color: "var(--kalpx-text-muted)",
              }}
            >
              {formatDateTime(time)}
            </p>
          )}
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: badge.color,
            background: badge.bg,
            borderRadius: 999,
            padding: "4px 10px",
            flexShrink: 0,
          }}
        >
          {badge.label}
        </span>
      </div>
    </div>
  );
}

export function ClassListingPage() {
  const navigate = useNavigate();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const searchTimerRef = useRef<number | null>(null);
  const didMountSearchRef = useRef(false);
  const didInitialLoadRef = useRef(false);
  const requestInFlightRef = useRef<string | null>(null);
  const classesLoadingRef = useRef(true);
  const loadingMoreRef = useRef(false);
  const [tab, setTab] = useState<Tab>("explore");
  const [authed, setAuthed] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");
  const [language, setLanguage] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [classType, setClassType] = useState("");
  const [scheduleType, setScheduleType] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sort, setSort] = useState("-updated_at");

  const [classes, setClasses] = useState<ClassListing[]>([]);
  const [classesCount, setClassesCount] = useState(0);
  const [classesPage, setClassesPage] = useState(1);
  const [classesLoading, setClassesLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [classesError, setClassesError] = useState<string | null>(null);

  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  const hasMore = classes.length < classesCount;

  const visibleClasses = classes.filter((item) =>
    Array.isArray((item as any).available_slots)
      ? (item as any).available_slots.length > 0
      : true,
  );

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "10px 0",
    fontSize: 14,
    fontWeight: active ? 700 : 400,
    color: active ? "var(--kalpx-cta)" : "var(--kalpx-text-muted)",
    background: "none",
    border: "none",
    borderBottom: active
      ? "2px solid var(--kalpx-cta)"
      : "2px solid transparent",
    touchAction: "manipulation",
    transition: "color 0.15s",
  });

  async function loadClasses(
    page: number,
    mode: "replace" | "append" = "replace",
    overrides?: Partial<{
      q: string;
      subject: string;
      language: string;
      skillLevel: string;
      classType: string;
      scheduleType: string;
      priceMin: string;
      priceMax: string;
      sort: string;
    }>,
  ) {
    const nextQuery = overrides?.q ?? query;
    const nextSubject = overrides?.subject ?? subject;
    const nextLanguage = overrides?.language ?? language;
    const nextSkillLevel = overrides?.skillLevel ?? skillLevel;
    const nextClassType = overrides?.classType ?? classType;
    const nextScheduleType = overrides?.scheduleType ?? scheduleType;
    const nextPriceMin = overrides?.priceMin ?? priceMin;
    const nextPriceMax = overrides?.priceMax ?? priceMax;
    const nextSort = overrides?.sort ?? sort;
    const requestKey = JSON.stringify({
      page,
      mode,
      q: nextQuery.trim(),
      subject: nextSubject,
      language: nextLanguage,
      skillLevel: nextSkillLevel,
      classType: nextClassType,
      scheduleType: nextScheduleType,
      priceMin: nextPriceMin,
      priceMax: nextPriceMax,
      sort: nextSort,
    });
    const now = Date.now();

    if (requestInFlightRef.current === requestKey) return;
    if (
      mode === "replace" &&
      lastExploreRequest?.key === requestKey &&
      now - lastExploreRequest.at < EXPLORE_REQUEST_DEDUPE_MS
    ) {
      return;
    }
    requestInFlightRef.current = requestKey;
    lastExploreRequest = { key: requestKey, at: now };

    if (mode === "replace") {
      classesLoadingRef.current = true;
      setClassesLoading(true);
      setClassesError(null);
    } else {
      loadingMoreRef.current = true;
      setLoadingMore(true);
    }

    try {
      const data = await getClasses({
        status: "published",
        ordering: nextSort,
        page,
        page_size: 10,
        q: nextQuery.trim() || undefined,
        subject: nextSubject || undefined,
        language: nextLanguage || undefined,
        skill_level: nextSkillLevel || undefined,
        type: nextClassType || undefined,
        schedule_type: nextScheduleType || undefined,
        price_min: nextPriceMin || undefined,
        price_max: nextPriceMax || undefined,
      });

      if (!data) throw new Error("classes_unavailable");

      setClassesCount(data.count ?? 0);
      setClassesPage(page);
      setClasses((prev) =>
        mode === "append" ? [...prev, ...data.results] : data.results,
      );
    } catch (err: any) {
      if (WEB_ENV.isDev) console.error("[ClassListingPage] load error:", err);
      setClassesError("Could not load classes. Please try again.");
    } finally {
      requestInFlightRef.current = null;
      classesLoadingRef.current = false;
      loadingMoreRef.current = false;
      setClassesLoading(false);
      setLoadingMore(false);
    }
  }

  function resetFilters() {
    setLanguage("");
    setSkillLevel("");
    setClassType("");
    setScheduleType("");
    setPriceMin("");
    setPriceMax("");
    setSort("-updated_at");
  }

  function applyFilters() {
    setFilterOpen(false);
    void loadClasses(1, "replace");
  }

  useEffect(() => {
    void isAuthenticated(webStorage).then(setAuthed);
  }, []);

  useEffect(() => {
    if (didInitialLoadRef.current) return;
    didInitialLoadRef.current = true;
    void loadClasses(1, "replace");
  }, []);

  useEffect(() => {
    if (!didMountSearchRef.current) {
      didMountSearchRef.current = true;
      return;
    }

    if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current);
    searchTimerRef.current = window.setTimeout(() => {
      void loadClasses(1, "replace");
    }, 500);

    return () => {
      if (searchTimerRef.current) window.clearTimeout(searchTimerRef.current);
    };
  }, [query]);

  useEffect(() => {
    if (tab !== "bookings") return;

    void (async () => {
      setBookingsLoading(true);
      setBookingsError(null);
      try {
        const data = await getMyBookings({
          when: "all",
          ordering: "-updated_at",
          page: 1,
          page_size: 10,
        });
        if (!data) throw new Error("bookings_unavailable");
        setBookings(data.results ?? []);
      } catch (err: any) {
        if (WEB_ENV.isDev)
          console.error("[ClassListingPage] bookings error:", err);
        setBookingsError("Could not load bookings.");
      } finally {
        setBookingsLoading(false);
      }
    })();
  }, [tab]);

  useEffect(() => {
    if (tab !== "explore") return;
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          !classesLoadingRef.current &&
          !loadingMoreRef.current &&
          hasMore
        ) {
          loadingMoreRef.current = true;
          void loadClasses(classesPage + 1, "append");
        }
      },
      { root: null, rootMargin: "220px", threshold: 0.01 },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [
    tab,
    classesPage,
    classesLoading,
    loadingMore,
    hasMore,
    query,
    subject,
    language,
    skillLevel,
    classType,
    scheduleType,
    priceMin,
    priceMax,
    sort,
  ]);

  return (
    <AppShell>
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          margin: "0 auto",
          padding: "5px",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid var(--kalpx-border-gold)",
              margin: "0 18px",
            }}
          >
            <button
              style={tabStyle(tab === "explore")}
              onClick={() => setTab("explore")}
            >
              Explore
            </button>
            {authed && (
              <button
                style={tabStyle(tab === "bookings")}
                onClick={() => setTab("bookings")}
              >
                My Bookings
              </button>
            )}
          </div>

          {tab === "explore" && (
            <div style={{ padding: "0 0 20px" }}>
              <div
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 20,
                  background: "#fff",
                  padding: "10px",
                  borderBottom: "1px solid rgba(67, 33, 4, 0.06)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <Search
                      size={18}
                      style={{
                        position: "absolute",
                        left: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#9ca3af",
                      }}
                    />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by tag, title, Tutor.."
                      style={{
                        width: "100%",
                        borderRadius: 10,
                        background: "#f3f4f6",
                        padding: "10px 12px 10px 40px",
                        fontSize: 16,
                        border: "none",
                        outline: "none",
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setFilterOpen(true)}
                    aria-label="Open filters"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 24,
                      height: 24,
                    }}
                  >
                    <Filter size={22} />
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 12,
                    paddingBottom: 8,
                    overflowX: "auto",
                    scrollbarWidth: "none",
                  }}
                >
                  {SUBJECT_OPTIONS.map((option) => (
                    <Chip
                      key={option.value || "all"}
                      label={option.label}
                      selected={subject === option.value}
                      size="sm"
                      onToggle={() => {
                        setSubject(option.value);
                        void loadClasses(1, "replace", {
                          subject: option.value,
                        });
                      }}
                      style={{
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                        color:
                          subject === option.value && option.value
                            ? "#000"
                            : undefined,
                      }}
                    />
                  ))}
                </div>
              </div>

              {visibleClasses.length > 0 && (
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#111827",
                    padding: "12px 18px 6px",
                  }}
                >
                  Explore Classes
                </div>
              )}

              {classesLoading ? (
                <div style={{ padding: "0 18px" }}>
                  <ClassCardSkeleton />
                  <ClassCardSkeleton />
                  <ClassCardSkeleton />
                </div>
              ) : classesError ? (
                <div style={{ padding: "24px 18px 0" }}>
                  <EmptyState icon="⚠️" message={classesError} />
                </div>
              ) : visibleClasses.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    padding: "48px 18px",
                    color: "#64748b",
                  }}
                >
                  <div
                    style={{ fontSize: 16, fontWeight: 700, color: "#6b7280" }}
                  >
                    Oops! No classes found.
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6b7280",
                      fontWeight: 500,
                      marginTop: 8,
                    }}
                  >
                    No classes were found based on the selected filters.
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",

                    padding: "5px",
                  }}
                >
                  {visibleClasses.map((cls) => (
                    <ClassCard key={cls.id} cls={cls} />
                  ))}
                  {loadingMore && (
                    <div style={{ paddingTop: 4 }}>
                      <ClassCardSkeleton />
                      <ClassCardSkeleton />
                      <ClassCardSkeleton />
                    </div>
                  )}
                  <div
                    ref={loadMoreRef}
                    style={{ height: 48, width: "100%" }}
                  />
                </div>
              )}
            </div>
          )}

          {tab === "bookings" && (
            <div style={{ padding: "18px 18px 24px" }}>
              {!authed && (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <p
                    style={{
                      color: "var(--kalpx-text-soft)",
                      marginBottom: 16,
                    }}
                  >
                    Sign in to view your bookings.
                  </p>
                  <button
                    onClick={() => navigate("/login?returnTo=/en/classes")}
                    style={{
                      padding: "12px 24px",
                      borderRadius: 12,
                      background: "var(--kalpx-cta)",
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    Sign in
                  </button>
                </div>
              )}
              {authed && bookingsLoading && (
                <>
                  <ClassCardSkeleton />
                  <ClassCardSkeleton />
                </>
              )}
              {authed && !bookingsLoading && bookingsError && (
                <EmptyState icon="⚠️" message={bookingsError} />
              )}
              {authed &&
                !bookingsLoading &&
                !bookingsError &&
                bookings.length === 0 && (
                  <EmptyState icon="🗓️" message="You have no bookings yet." />
                )}
              {authed &&
                !bookingsLoading &&
                !bookingsError &&
                bookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onNavigate={(slug) => navigate(`/en/classes/${slug}`)}
                  />
                ))}
            </div>
          )}
        </div>
      </div>

      <ModalSheet
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filters"
        height="full"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <SelectField
            label="Select Language"
            value={language}
            onChange={setLanguage}
            options={LANGUAGE_OPTIONS}
          />
          <SelectField
            label="Skill Level"
            value={skillLevel}
            onChange={setSkillLevel}
            options={SKILL_OPTIONS}
          />
          <SelectField
            label="Class Type"
            value={classType}
            onChange={setClassType}
            options={TYPE_OPTIONS}
          />
          <SelectField
            label="Select Schedule"
            value={scheduleType}
            onChange={setScheduleType}
            options={SCHEDULE_OPTIONS}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: "#303030" }}>
              Price
            </span>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <input
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                type="number"
                placeholder="Min"
                style={{
                  width: "100%",
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                  padding: "12px 14px",
                  fontSize: 14,
                }}
              />
              <input
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                type="number"
                placeholder="Max"
                style={{
                  width: "100%",
                  borderRadius: 10,
                  border: "1px solid #d1d5db",
                  padding: "12px 14px",
                  fontSize: 14,
                }}
              />
            </div>
          </div>

          <SelectField
            label="Sort"
            value={sort}
            onChange={setSort}
            options={SORT_OPTIONS}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button
              type="button"
              onClick={() => {
                resetFilters();
                void loadClasses(1, "replace", {
                  language: "",
                  skillLevel: "",
                  classType: "",
                  scheduleType: "",
                  priceMin: "",
                  priceMax: "",
                  sort: "-updated_at",
                });
              }}
              style={{
                fontSize: 16,
                color: "var(--kalpx-cta)",
                fontWeight: 700,
              }}
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={applyFilters}
              style={{
                borderRadius: 10,
                background: "var(--kalpx-cta)",
                padding: "8px 14px",
                fontSize: 16,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </ModalSheet>
    </AppShell>
  );
}
