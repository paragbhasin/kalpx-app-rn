import { isAuthenticated } from "@kalpx/auth";
import type { BookingListItem, ClassListing } from "@kalpx/types";
import {
  Check,
  ChevronDown,
  EllipsisVertical,
  Filter,
  Search,
  X,
} from "lucide-react";
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
const BOOKING_PAGE_SIZE = 10;

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
  { value: "price_asc", label: "Low to High" },
  { value: "price_desc", label: "High to Low" },
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
  { value: "course", label: "Course" },
  { value: "package", label: "Package" },
] as const;

const SCHEDULE_OPTIONS = [
  { value: "", label: "Select" },
  { value: "rolling", label: "Rolling" },
  { value: "fixed", label: "Fixed" },
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

const BOOKING_STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "requested", label: "Requested" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "pending", label: "Pending" },
] as const;

const BOOKING_STATUS_CHIPS = BOOKING_STATUS_OPTIONS.filter(
  (option) => option.value,
);

const BOOKING_WHEN_OPTIONS = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
] as const;

const BOOKING_SORT_OPTIONS = [
  { value: "-updated_at", label: "Most recent" },
  { value: "start_asc", label: "Start time ↑" },
  { value: "start_desc", label: "Start time ↓" },
] as const;

const DEFAULT_BOOKING_STATUSES = ["requested", "confirmed"] as const;

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

function formatPrice(booking: BookingListItem): string {
  const amount = (booking as any).amount;
  const currency = (booking as any).currency || "INR";
  if (amount == null) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount));
  } catch {
    return `${currency} ${amount}`;
  }
}

function formatBookingDateTime(value?: string | null): string {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function resolveBookingThumb(booking: BookingListItem): string | null {
  const thumb =
    (booking as any)?.thumbnail_url ||
    (booking as any)?.offering?.thumbnail_url ||
    (booking as any)?.offering?.cover_media?.url ||
    (booking as any)?.offering?.cover_media?.key ||
    null;

  if (!thumb) return null;
  if (thumb.startsWith("http://") || thumb.startsWith("https://")) return thumb;
  return `${WEB_ENV.imageBaseUrl}${thumb.startsWith("/") ? "" : "/"}${thumb}`;
}

function formatScheduleSummary(booking: BookingListItem): string {
  const start =
    (booking as any)?.start ||
    booking.start_utc ||
    booking.scheduled_at ||
    (booking as any)?.when?.start_iso ||
    (booking as any)?.when?.session?.start_iso ||
    null;
  const end =
    (booking as any)?.end ||
    (booking as any)?.when?.end_iso ||
    (booking as any)?.when?.session?.end_iso ||
    null;

  if (start && end) {
    return `${formatDateTime(start)} -> ${formatDateTime(end)}`;
  }
  if (start) return formatDateTime(start);
  return "—";
}

function canJoinBooking(booking: BookingListItem): boolean {
  const start =
    (booking as any)?.start ||
    booking.start_utc ||
    booking.scheduled_at ||
    (booking as any)?.when?.start_iso ||
    (booking as any)?.when?.session?.start_iso ||
    null;
  const end =
    (booking as any)?.end ||
    (booking as any)?.when?.end_iso ||
    (booking as any)?.when?.session?.end_iso ||
    null;
  if (!start || !end) return false;

  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);
  const joinStart = new Date(startDate.getTime() - 15 * 60 * 1000);
  const joinEnd = new Date(endDate.getTime() + 15 * 60 * 1000);
  return now >= joinStart && now <= joinEnd;
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
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLLabelElement | null>(null);
  const selectedLabel =
    options.find((option) => option.value === value)?.label ??
    options[0]?.label ??
    "Select";

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <label
      ref={wrapRef}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 500, color: "#303030" }}>
        {label}
      </span>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: "100%",
          borderRadius: 10,
          border: "1px solid #d9d6cf",
          padding: "12px 14px",
          background: "#fff",
          color: "var(--kalpx-text)",
          fontSize: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <span>{selectedLabel}</span>
        <ChevronDown
          size={18}
          style={{
            color: "#5b3716",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 120ms ease",
            flexShrink: 0,
          }}
        />
      </button>

      {open && (
        <div
          style={{
            marginTop: 6,
            borderRadius: 14,
            border: "1px solid #e5dccf",
            background: "#fffdfa",
            boxShadow: "0 14px 28px rgba(0,0,0,0.12)",
            overflow: "hidden",
            maxHeight: 240,
            overflowY: "auto",
          }}
        >
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  border: "none",
                  background: selected ? "rgba(212,160,23,0.12)" : "#fffdfa",
                  color: "#2f2418",
                  padding: "12px 14px",
                  fontSize: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span>{option.label}</span>
                {selected ? (
                  <Check size={16} style={{ color: "#c58c18" }} />
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </label>
  );
}

function BookingCard({
  booking,
  onNavigate,
  openMenuId,
  onToggleMenu,
  onOpenDetails,
}: {
  booking: BookingListItem;
  onNavigate: (slug: string) => void;
  openMenuId: number | null;
  onToggleMenu: (id: number) => void;
  onOpenDetails: (booking: BookingListItem) => void;
}) {
  const offering = booking.offering;
  const badge = STATUS_LABEL[booking.status] ?? {
    label: booking.status,
    color: "var(--kalpx-text-muted)",
    bg: "var(--kalpx-chip-bg)",
  };
  const thumb = resolveBookingThumb(booking);
  const scheduleSummary = formatScheduleSummary(booking);
  const canJoin = canJoinBooking(booking);
  const joinUrl = (booking as any)?.join_url;
  const isMenuOpen = openMenuId === booking.id;

  return (
    <div
      style={{
        boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div
          style={{
            width: 99,
            minWidth: 99,
            height: 99,
            borderRadius: 8,
            overflow: "hidden",
            background: "#f1eadf",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {thumb ? (
            <img
              src={thumb}
              alt={`${offering?.title ?? "Session"} cover`}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              loading="lazy"
            />
          ) : (
            <span style={{ fontSize: 12, color: "#7c6f60" }}>No image</span>
          )}
        </div>

        <div
          style={{
            minWidth: 0,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div
            style={{
              fontSize: 18,
              lineHeight: 1.25,
              fontWeight: 700,
              color: "#1f2937",
            }}
          >
            {offering?.title ?? "Session"}
          </div>
          <div style={{ fontSize: 15, color: "#4b5563", lineHeight: 1.45 }}>
            {scheduleSummary}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 10, fontSize: 15, color: "#111827" }}>
        Join link shared 15 minutes before class
      </div>
      {joinUrl && (
        <a
          href={canJoin ? joinUrl : undefined}
          target={canJoin ? "_blank" : undefined}
          rel={canJoin ? "noreferrer" : undefined}
          onClick={(e) => {
            if (!canJoin) e.preventDefault();
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 4,
            color: "#1877F2",
            fontSize: 12,
            fontWeight: 700,
            opacity: canJoin ? 1 : 0.5,
            textDecoration: "none",
          }}
        >
          <span style={{ fontSize: 14 }}>🔗</span>
          Link
        </a>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          marginTop: 12,
        }}
      >
        <div style={{ fontSize: 15 }}>
          <span style={{ fontWeight: 700 }}>Price:</span>{" "}
          <span style={{ color: "var(--kalpx-cta)" }}>
            {formatPrice(booking)}
          </span>
        </div>
        <div
          style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}
        >
          <span style={{ fontSize: 15, fontWeight: 700 }}>Status:</span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: badge.color,
              background: badge.bg,
              borderRadius: 999,
              padding: "4px 10px",
              whiteSpace: "nowrap",
            }}
          >
            {badge.label}
          </span>
        </div>
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => onToggleMenu(booking.id)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              width: 20,
              height: 20,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#4b5563",
            }}
          >
            <EllipsisVertical size={18} />
          </button>
          {isMenuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 24,
                minWidth: 120,
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
                zIndex: 5,
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                onClick={() => onOpenDetails(booking)}
                style={bookingMenuItemStyle}
              >
                Details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingDesktopRow({
  booking,
  onNavigate,
  openMenuId,
  onToggleMenu,
  onOpenDetails,
}: {
  booking: BookingListItem;
  onNavigate: (slug: string) => void;
  openMenuId: number | null;
  onToggleMenu: (id: number) => void;
  onOpenDetails: (booking: BookingListItem) => void;
}) {
  const offering = booking.offering;
  const badge = STATUS_LABEL[booking.status] ?? {
    label: booking.status,
    color: "var(--kalpx-text-muted)",
    bg: "var(--kalpx-chip-bg)",
  };
  const thumb = resolveBookingThumb(booking);
  const scheduleSummary = formatScheduleSummary(booking);
  const joinUrl = (booking as any)?.join_url;
  const canJoin = canJoinBooking(booking);
  const isMenuOpen = openMenuId === booking.id;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: "rgba(247, 240, 221, 0.65)",
        boxShadow: "0 4px 4px 1px rgba(0,0,0,0.12)",
        borderRadius: 10,
        padding: "14px 16px",
        gap: 12,
      }}
    >
      <div style={{ flexBasis: "40%", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 60,
              height: 60,
              minWidth: 60,
              borderRadius: 8,
              overflow: "hidden",
              background: "#f1eadf",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {thumb ? (
              <img
                src={thumb}
                alt={`${offering?.title ?? "Session"} cover`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                loading="lazy"
              />
            ) : (
              <span style={{ fontSize: 11, color: "#7c6f60" }}>No image</span>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
              {offering?.title ?? "Session"}
            </div>
            <div style={{ marginTop: 4, fontSize: 13, color: "#6b7280" }}>
              {scheduleSummary}
            </div>
          </div>
        </div>
      </div>
      <div style={{ flexBasis: "26%", minWidth: 0 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 14, color: "#111827", lineHeight: 1.35 }}>
            <div>Join link shared 15 minutes</div>
            <div style={{ marginLeft: 32 }}>before class</div>
          </div>
          {joinUrl ? (
            <a
              href={canJoin ? joinUrl : undefined}
              target={canJoin ? "_blank" : undefined}
              rel={canJoin ? "noreferrer" : undefined}
              onClick={(e) => {
                if (!canJoin) e.preventDefault();
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginLeft: 32,
                color: "#1877F2",
                fontSize: 12,
                fontWeight: 700,
                opacity: canJoin ? 1 : 0.5,
                textDecoration: "none",
              }}
            >
              <span style={{ fontSize: 14 }}>🔗</span>
              Link
            </a>
          ) : (
            <span style={{ fontSize: 14, color: "#6b7280" }}>—</span>
          )}
        </div>
      </div>
      <div style={{ flexBasis: "16%", fontSize: 14, color: "#111827" }}>
        {formatPrice(booking)}
      </div>
      <div style={{ flexBasis: "12%" }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: badge.color,
            background: badge.bg,
            borderRadius: 999,
            padding: "4px 10px",
            display: "inline-flex",
          }}
        >
          {badge.label}
        </span>
      </div>
      <div style={{ flexBasis: "18%", fontSize: 13, color: "#6b7280" }}>
        {(booking as any)?.updated_at
          ? formatDateTime((booking as any).updated_at)
          : "—"}
      </div>
      <div style={{ flexBasis: "14%" }}>
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => onToggleMenu(booking.id)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              width: 20,
              height: 20,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#4b5563",
            }}
          >
            <EllipsisVertical size={18} />
          </button>
          {isMenuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 24,
                minWidth: 120,
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                boxShadow: "0 10px 24px rgba(0,0,0,0.14)",
                zIndex: 5,
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                onClick={() => onOpenDetails(booking)}
                style={bookingMenuItemStyle}
              >
                Details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ClassListingPage() {
  const navigate = useNavigate();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const bookingsLoadMoreRef = useRef<HTMLDivElement | null>(null);
  const searchTimerRef = useRef<number | null>(null);
  const bookingsSearchTimerRef = useRef<number | null>(null);
  const didMountSearchRef = useRef(false);
  const didMountBookingsSearchRef = useRef(false);
  const didInitialLoadRef = useRef(false);
  const requestInFlightRef = useRef<string | null>(null);
  const classesLoadingRef = useRef(true);
  const loadingMoreRef = useRef(false);
  const bookingsLoadingMoreRef = useRef(false);
  const [tab, setTab] = useState<Tab>("explore");
  const [authed, setAuthed] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [bookingsFilterOpen, setBookingsFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 768 : true,
  );

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
  const [bookingsQuery, setBookingsQuery] = useState("");
  const [bookingsStatus, setBookingsStatus] = useState("");
  const [bookingsSelectedStatuses, setBookingsSelectedStatuses] = useState<
    string[]
  >([...DEFAULT_BOOKING_STATUSES]);
  const [bookingsWhen, setBookingsWhen] = useState("all");
  const [bookingsSort, setBookingsSort] = useState("-updated_at");
  const [bookingsCount, setBookingsCount] = useState(0);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsLoadingMore, setBookingsLoadingMore] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [openBookingMenuId, setOpenBookingMenuId] = useState<number | null>(
    null,
  );
  const [detailBooking, setDetailBooking] = useState<BookingListItem | null>(
    null,
  );

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

  function resetBookingFilters() {
    setBookingsQuery("");
    setBookingsStatus("");
    setBookingsSelectedStatuses([...DEFAULT_BOOKING_STATUSES]);
    setBookingsWhen("all");
    setBookingsSort("-updated_at");
    setBookingsPage(1);
  }

  async function fetchBookingsForStatus(
    statusValue: string,
    overrides?: Partial<{
      q: string;
      when: string;
      sort: string;
    }>,
  ) {
    const data = await getMyBookings({
      q: (overrides?.q ?? bookingsQuery).trim() || undefined,
      status: statusValue || undefined,
      when: overrides?.when ?? bookingsWhen,
      ordering: overrides?.sort ?? bookingsSort,
      page: 1,
      page_size: BOOKING_PAGE_SIZE,
    });
    return data?.results ?? [];
  }

  async function loadBookings(
    page: number,
    mode: "replace" | "append" = "replace",
    overrides?: Partial<{
      q: string;
      status: string;
      when: string;
      sort: string;
    }>,
  ) {
    if (!authed) return;

    if (mode === "replace") {
      setBookingsLoading(true);
      setBookingsError(null);
    } else {
      bookingsLoadingMoreRef.current = true;
      setBookingsLoadingMore(true);
    }

    try {
      const nextQuery = overrides?.q ?? bookingsQuery;
      const nextStatus = overrides?.status ?? bookingsStatus;
      const nextWhen = overrides?.when ?? bookingsWhen;
      const nextSort = overrides?.sort ?? bookingsSort;
      const nextSelectedStatuses =
        overrides?.status !== undefined
          ? overrides.status
            ? [overrides.status]
            : bookingsSelectedStatuses
          : bookingsSelectedStatuses;

      if (
        mode === "replace" &&
        !nextStatus &&
        nextSelectedStatuses.length > 1
      ) {
        const resultsByStatus = await Promise.all(
          nextSelectedStatuses.map((statusValue) =>
            fetchBookingsForStatus(statusValue, {
              q: nextQuery,
              when: nextWhen,
              sort: nextSort,
            }),
          ),
        );
        const merged = resultsByStatus
          .flat()
          .filter(
            (item, index, arr) =>
              arr.findIndex((candidate) => candidate.id === item.id) === index,
          );
        setBookingsCount(merged.length);
        setBookingsPage(1);
        setBookings(merged);
      } else {
        const data = await getMyBookings({
          q: nextQuery.trim() || undefined,
          status: nextStatus || undefined,
          when: nextWhen,
          ordering: nextSort || undefined,
          page,
          page_size: BOOKING_PAGE_SIZE,
        });
        if (!data) throw new Error("bookings_unavailable");

        setBookingsCount(data.count ?? 0);
        setBookingsPage(page);
        setBookings((prev) => {
          if (mode === "append") {
            const merged = [...prev, ...(data.results ?? [])];
            return merged.filter(
              (item, index, arr) =>
                arr.findIndex((candidate) => candidate.id === item.id) ===
                index,
            );
          }
          return data.results ?? [];
        });
      }
    } catch (err: any) {
      if (WEB_ENV.isDev) {
        console.error("[ClassListingPage] bookings error:", err);
      }
      setBookingsError("Could not load bookings.");
    } finally {
      setOpenBookingMenuId(null);
      bookingsLoadingMoreRef.current = false;
      setBookingsLoading(false);
      setBookingsLoadingMore(false);
    }
  }

  function openBookingDetails(booking: BookingListItem) {
    setDetailBooking(booking);
    setOpenBookingMenuId(null);
  }

  function closeBookingDetails() {
    setDetailBooking(null);
  }

  useEffect(() => {
    void isAuthenticated(webStorage).then(setAuthed);
  }, []);

  useEffect(() => {
    function onResize() {
      setIsMobile(window.innerWidth < 768);
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
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
    if (!authed) return;
    void loadBookings(1, "replace");
  }, [tab, authed]);

  useEffect(() => {
    if (tab !== "bookings") return;
    if (!didMountBookingsSearchRef.current) {
      didMountBookingsSearchRef.current = true;
      return;
    }

    if (bookingsSearchTimerRef.current) {
      window.clearTimeout(bookingsSearchTimerRef.current);
    }
    bookingsSearchTimerRef.current = window.setTimeout(() => {
      void loadBookings(1, "replace");
    }, 350);

    return () => {
      if (bookingsSearchTimerRef.current) {
        window.clearTimeout(bookingsSearchTimerRef.current);
      }
    };
  }, [bookingsQuery]);

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

  useEffect(() => {
    if (tab !== "bookings") return;
    if (!bookingsLoadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          !bookingsLoading &&
          !bookingsLoadingMoreRef.current &&
          bookings.length < bookingsCount
        ) {
          bookingsLoadingMoreRef.current = true;
          void loadBookings(bookingsPage + 1, "append");
        }
      },
      { root: null, rootMargin: "180px", threshold: 0.01 },
    );

    observer.observe(bookingsLoadMoreRef.current);
    return () => observer.disconnect();
  }, [
    tab,
    bookingsPage,
    bookings.length,
    bookingsCount,
    bookingsLoading,
    bookingsQuery,
    bookingsStatus,
    bookingsWhen,
    bookingsSort,
  ]);

  return (
    <AppShell>
      <div
        style={{
          width: "100%",
          maxWidth: isMobile ? 960 : 1920,
          margin: "0 auto",
          padding: isMobile ? "5px" : "10px",
          paddingRight: !isMobile ? 20 : "",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              borderBottom: isMobile
                ? "1px solid var(--kalpx-border-gold)"
                : "none",
              margin: isMobile ? "0 18px" : "0 0 22px",
              width: isMobile ? undefined : "fit-content",
              background: isMobile ? "transparent" : "#f1f2f5",
              borderRadius: isMobile ? 0 : 8,
              padding: isMobile ? 0 : 5,
              gap: isMobile ? 0 : "",
            }}
          >
            <button
              style={
                isMobile
                  ? tabStyle(tab === "explore")
                  : {
                      padding: "8px",
                      borderRadius: 8,
                      border: "none",
                      background:
                        tab === "explore" ? "var(--kalpx-cta)" : "transparent",
                      color: tab === "explore" ? "#fff" : "#2f2f2f",
                      fontSize: isMobile ? 20 : 16,
                      fontWeight: 700,
                    }
              }
              onClick={() => setTab("explore")}
            >
              {isMobile ? "Explore" : "Explore Classes"}
            </button>
            {authed && (
              <button
                style={
                  isMobile
                    ? tabStyle(tab === "bookings")
                    : {
                        padding: "8px",
                        borderRadius: 8,
                        border: "none",
                        background:
                          tab === "bookings"
                            ? "var(--kalpx-cta)"
                            : "transparent",
                        color: tab === "bookings" ? "#fff" : "#2f2f2f",
                        fontSize: isMobile ? 20 : 16,
                        fontWeight: 700,
                      }
                }
                onClick={() => setTab("bookings")}
              >
                {isMobile ? "My Bookings" : "My bookings"}
              </button>
            )}
          </div>

          {tab === "explore" && (
            <div style={{ padding: "0 0 20px" }}>
              {isMobile ? (
                <>
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
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
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
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#6b7280",
                        }}
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
                </>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "450px minmax(0, 1fr)",
                    gap: 5,
                    alignItems: "start",
                    height: "calc(100dvh - 135px)",
                    overflow: "hidden",
                  }}
                >
                  <aside
                    style={{
                      background: "#f5f6f8",
                      borderRadius: 0,
                      padding: "15px",
                      height: "100%",
                      overflowY: "auto",
                      overflowX: "hidden",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        marginBottom: 34,
                        overflowX: "auto",
                        overflowY: "hidden",
                        scrollbarWidth: "none",
                        whiteSpace: "nowrap",
                        paddingBottom: 4,
                      }}
                    >
                      {SUBJECT_OPTIONS.map((option) => (
                        <Chip
                          key={option.value || "all-desktop"}
                          label={option.label}
                          selected={subject === option.value}
                          size="sm"
                          onToggle={() => setSubject(option.value)}
                          style={{
                            flexShrink: 0,
                            whiteSpace: "nowrap",
                            fontSize: 14,
                            padding: option.value ? "5px 20px" : "5px 20px",
                            color:
                              subject === option.value && option.value
                                ? "#263248"
                                : undefined,
                          }}
                        />
                      ))}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 10,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#475569",
                        }}
                      >
                        Filters
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setQuery("");
                            setSubject("");
                            resetFilters();
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--kalpx-cta)",
                            fontSize: 16,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Clear All
                        </button>
                        <button
                          type="button"
                          onClick={() => void loadClasses(1, "replace")}
                          style={{
                            borderRadius: 9,
                            border: "none",
                            background: "var(--kalpx-cta)",
                            color: "#fff",
                            padding: "5px 10px",
                            fontSize: 16,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    <div style={{ position: "relative", marginBottom: 34 }}>
                      <Search
                        size={15}
                        style={{
                          position: "absolute",
                          left: 18,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "#666",
                        }}
                      />
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by tag, title, Tutor.."
                        style={{
                          width: "100%",
                          borderRadius: 9,
                          border: "1px solid #cad0d8",
                          background: "#fff",
                          padding: "10px 50px",
                          fontSize: 16,
                          color: "#334155",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 28,
                      }}
                    >
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
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 16,
                        }}
                      >
                        <label
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 500,
                              color: "#303030",
                            }}
                          >
                            Min Price
                          </span>
                          <input
                            value={priceMin}
                            onChange={(e) => setPriceMin(e.target.value)}
                            type="number"
                            placeholder="Min"
                            style={desktopTextInputStyle}
                          />
                        </label>
                        <label
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 500,
                              color: "#303030",
                            }}
                          >
                            Max Price
                          </span>
                          <input
                            value={priceMax}
                            onChange={(e) => setPriceMax(e.target.value)}
                            type="number"
                            placeholder="Max"
                            style={desktopTextInputStyle}
                          />
                        </label>
                      </div>
                      <SelectField
                        label="Sort"
                        value={sort}
                        onChange={setSort}
                        options={SORT_OPTIONS}
                      />
                    </div>
                  </aside>

                  <div
                    style={{
                      height: "100%",
                      overflowY: "auto",
                      overflowX: "hidden",
                      paddingRight: 8,
                    }}
                  >
                    {classesLoading ? (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 26,
                        }}
                      >
                        <ClassCardSkeleton />
                        <ClassCardSkeleton />
                        <ClassCardSkeleton />
                        <ClassCardSkeleton />
                      </div>
                    ) : classesError ? (
                      <EmptyState icon="⚠️" message={classesError} />
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
                          style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: "#6b7280",
                          }}
                        >
                          Oops! No classes found.
                        </div>
                        <div
                          style={{
                            fontSize: 14,
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
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                          alignItems: "start",
                        }}
                      >
                        {visibleClasses.map((cls) => (
                          <ClassCard key={cls.id} cls={cls} />
                        ))}
                        {loadingMore && (
                          <>
                            <ClassCardSkeleton />
                            <ClassCardSkeleton />
                          </>
                        )}
                      </div>
                    )}
                    <div
                      ref={loadMoreRef}
                      style={{ height: 48, width: "100%" }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "bookings" && (
            <div style={{ padding: isMobile ? "0 0 24px" : "18px 18px 24px" }}>
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
              {authed && (
                <>
                  {!isMobile && (
                    <div
                      style={{
                        marginBottom: 16,
                        display: "flex",
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 20,
                          whiteSpace: "nowrap",
                          minWidth: 140,
                        }}
                      >
                        My bookings
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          flexWrap: "wrap",
                          justifyContent: "flex-end",
                        }}
                      >
                        <div style={{ width: 320 }}>
                          <input
                            value={bookingsQuery}
                            onChange={(e) => setBookingsQuery(e.target.value)}
                            placeholder="Search by class or tutor…"
                            style={{
                              background: "#F3F3F3",
                              width: "100%",
                              borderRadius: 10,

                              border: "1px solid #ddd6c8",
                              padding: "10px 12px",
                            }}
                          />
                        </div>
                        <div style={{ width: 140 }}>
                          <select
                            value={bookingsWhen}
                            onChange={(e) => {
                              setBookingsWhen(e.target.value);
                              void loadBookings(1, "replace", {
                                when: e.target.value,
                              });
                            }}
                            style={bookingSelectStyle}
                          >
                            {BOOKING_WHEN_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div style={{ width: 160 }}>
                          <select
                            value={bookingsSort}
                            onChange={(e) => {
                              setBookingsSort(e.target.value);
                              void loadBookings(1, "replace", {
                                sort: e.target.value,
                              });
                            }}
                            style={bookingSelectStyle}
                          >
                            {BOOKING_SORT_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            resetBookingFilters();
                            void loadBookings(1, "replace", {
                              q: "",
                              status: "",
                              when: "all",
                              sort: "-updated_at",
                            });
                          }}
                          style={{
                            border: "1px solid var(--kalpx-cta)",
                            borderRadius: 10,
                            color: "var(--kalpx-cta)",
                            padding: "10px 14px",
                            fontSize: 16,
                            whiteSpace: "nowrap",
                          }}
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  )}

                  {isMobile && (
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
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
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
                            value={bookingsQuery}
                            onChange={(e) => setBookingsQuery(e.target.value)}
                            placeholder="Search by class or tutor…"
                            style={{
                              width: "100%",
                              borderRadius: 10,
                              background: "#f3f4f6",
                              padding: "10px 12px 10px 40px",
                              fontSize: 14,
                              border: "none",
                              outline: "none",
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => setBookingsFilterOpen(true)}
                          aria-label="Open booking filters"
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
                          overflowX: "auto",
                          scrollbarWidth: "none",
                        }}
                      >
                        {BOOKING_STATUS_CHIPS.map((option) => (
                          <Chip
                            key={option.value}
                            label={option.label}
                            selected={bookingsSelectedStatuses.includes(
                              option.value,
                            )}
                            size="sm"
                            onToggle={() => {
                              const nextSelected =
                                bookingsSelectedStatuses.includes(option.value)
                                  ? bookingsSelectedStatuses.filter(
                                      (value) => value !== option.value,
                                    )
                                  : [...bookingsSelectedStatuses, option.value];

                              setBookingsSelectedStatuses(nextSelected);
                              if (nextSelected.length === 1) {
                                setBookingsStatus(nextSelected[0]);
                                void loadBookings(1, "replace", {
                                  status: nextSelected[0],
                                });
                              } else if (nextSelected.length === 0) {
                                setBookingsStatus("");
                                void loadBookings(1, "replace", { status: "" });
                              } else {
                                setBookingsStatus("");
                                void loadBookings(1, "replace", { status: "" });
                              }
                            }}
                            style={{ flexShrink: 0, whiteSpace: "nowrap" }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {bookingsLoading && !bookingsLoadingMore && (
                    <div style={{ padding: isMobile ? "8px 10px 0" : 0 }}>
                      <ClassCardSkeleton />
                      <ClassCardSkeleton />
                      <ClassCardSkeleton />
                    </div>
                  )}

                  {!bookingsLoading && bookingsError && (
                    <div style={{ paddingTop: isMobile ? 20 : 0 }}>
                      <EmptyState icon="⚠️" message={bookingsError} />
                    </div>
                  )}

                  {!bookingsLoading &&
                    !bookingsError &&
                    bookings.length === 0 && (
                      <div style={{ paddingTop: isMobile ? 20 : 0 }}>
                        <EmptyState
                          icon="🗓️"
                          message="You have no bookings yet."
                        />
                      </div>
                    )}

                  {!bookingsLoading &&
                    !bookingsError &&
                    bookings.length > 0 &&
                    !isMobile && (
                      <div style={{ overflow: "hidden" }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              background: "#D4A017",
                              textAlign: "left",
                              fontSize: 14,
                              color: "#475569",
                              fontWeight: 700,
                              borderRadius: 10,
                            }}
                          >
                            <div style={{ flexBasis: "40%", padding: 12 }}>
                              Class Name
                            </div>
                            <div style={{ flexBasis: "26%", padding: 12 }}>
                              Class URL
                            </div>
                            <div style={{ flexBasis: "16%", padding: 12 }}>
                              Price
                            </div>
                            <div style={{ flexBasis: "12%", padding: 12 }}>
                              Status
                            </div>
                            <div style={{ flexBasis: "18%", padding: 12 }}>
                              Last Updated
                            </div>
                            <div style={{ flexBasis: "14%", padding: 12 }}>
                              Actions
                            </div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 8,
                            }}
                          >
                            {bookings.map((booking) => (
                              <BookingDesktopRow
                                key={booking.id}
                                booking={booking}
                                onNavigate={(slug) =>
                                  navigate(`/en/classes/${slug}`)
                                }
                                openMenuId={openBookingMenuId}
                                onToggleMenu={(id) =>
                                  setOpenBookingMenuId((prev) =>
                                    prev === id ? null : id,
                                  )
                                }
                                onOpenDetails={openBookingDetails}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  {!bookingsLoading &&
                    !bookingsError &&
                    bookings.length > 0 &&
                    isMobile && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                          padding: "8px 10px 0",
                        }}
                      >
                        {bookings.map((booking) => (
                          <BookingCard
                            key={booking.id}
                            booking={booking}
                            onNavigate={(slug) =>
                              navigate(`/en/classes/${slug}`)
                            }
                            openMenuId={openBookingMenuId}
                            onToggleMenu={(id) =>
                              setOpenBookingMenuId((prev) =>
                                prev === id ? null : id,
                              )
                            }
                            onOpenDetails={openBookingDetails}
                          />
                        ))}
                      </div>
                    )}

                  {bookingsLoadingMore && (
                    <div
                      style={{ padding: isMobile ? "4px 10px 0" : "12px 0 0" }}
                    >
                      <ClassCardSkeleton />
                      <ClassCardSkeleton />
                      <ClassCardSkeleton />
                    </div>
                  )}

                  <div
                    ref={bookingsLoadMoreRef}
                    style={{ height: 32, width: "100%" }}
                  />
                </>
              )}
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

      <ModalSheet
        isOpen={bookingsFilterOpen}
        onClose={() => setBookingsFilterOpen(false)}
        title="Filters"
        height="full"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <SelectField
            label="Status"
            value={bookingsStatus}
            onChange={(value) => {
              setBookingsStatus(value);
              setBookingsSelectedStatuses(
                value ? [value] : [...DEFAULT_BOOKING_STATUSES],
              );
            }}
            options={BOOKING_STATUS_OPTIONS}
          />
          <SelectField
            label="When"
            value={bookingsWhen}
            onChange={setBookingsWhen}
            options={BOOKING_WHEN_OPTIONS}
          />
          <SelectField
            label="Sort"
            value={bookingsSort}
            onChange={setBookingsSort}
            options={BOOKING_SORT_OPTIONS}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button
              type="button"
              onClick={() => {
                resetBookingFilters();
                setBookingsFilterOpen(false);
                void loadBookings(1, "replace", {
                  q: "",
                  status: "",
                  when: "all",
                  sort: "-updated_at",
                });
              }}
              style={{
                background: "none",
                border: "none",
                color: "var(--kalpx-cta)",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={() => {
                setBookingsFilterOpen(false);
                void loadBookings(1, "replace");
              }}
              style={{
                borderRadius: 10,
                background: "var(--kalpx-cta)",
                color: "#111",
                padding: "10px 14px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </ModalSheet>

      {detailBooking && (
        <div
          onClick={closeBookingDetails}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.45)",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 530,
              borderRadius: 24,
              background: "#fff",
              padding: 28,
              boxShadow: "0 24px 48px rgba(0,0,0,0.18)",
            }}
          >
            <div
              style={{
                marginBottom: 18,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#2f2f2f",
                }}
              >
                Booking #{detailBooking.booking_id || detailBooking.id}
              </h2>
              <button
                type="button"
                onClick={closeBookingDetails}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  border: "none",
                  background: "#d4a017",
                  color: "#111",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 18px rgba(212,160,23,0.35)",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "140px minmax(0, 1fr)",
                gap: "18px 18px",
                fontSize: 16,
                lineHeight: 1.45,
              }}
            >
              <div style={detailLabelStyle}>Class</div>
              <div style={detailValueStyle}>
                {detailBooking.offering?.title || "—"}
              </div>

              <div style={detailLabelStyle}>Status</div>
              <div style={detailValueStyle}>
                {STATUS_LABEL[detailBooking.status]?.label ||
                  detailBooking.status}
              </div>

              <div style={detailLabelStyle}>Start</div>
              <div style={detailValueStyle}>
                {formatBookingDateTime(
                  (detailBooking as any)?.start ||
                    detailBooking.start_utc ||
                    detailBooking.scheduled_at,
                )}
              </div>

              <div style={detailLabelStyle}>End</div>
              <div style={detailValueStyle}>
                {formatBookingDateTime(
                  (detailBooking as any)?.end ||
                    (detailBooking as any)?.when?.end_iso ||
                    (detailBooking as any)?.when?.session?.end_iso,
                )}
              </div>

              <div style={detailLabelStyle}>Price</div>
              <div style={detailValueStyle}>
                {(detailBooking as any)?.amount != null
                  ? `${(detailBooking as any).amount} ${
                      (detailBooking as any).currency || "INR"
                    }`
                  : "—"}
              </div>

              <div style={detailLabelStyle}>Trial</div>
              <div style={detailValueStyle}>
                {(detailBooking as any)?.trial_selected ? "Yes" : "No"}
              </div>

              <div style={detailLabelStyle}>Group size</div>
              <div style={detailValueStyle}>
                {(detailBooking as any)?.group_size || 1}
              </div>

              <div style={detailLabelStyle}>Notes</div>
              <div style={detailValueStyle}>
                {(detailBooking as any)?.note || "—"}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

const bookingSelectStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 10,
  border: "1px solid #d9d6cf",
  padding: "10px 12px",
  background: "#fff",
  color: "var(--kalpx-text)",
  fontSize: 14,
};

const desktopTextInputStyle: React.CSSProperties = {
  width: "100%",
  borderRadius: 11,
  border: "1px solid #cad0d8",
  background: "#fff",
  padding: "10px",
  fontSize: 14,
  color: "#334155",
  outline: "none",
  boxSizing: "border-box",
};

const bookingMenuItemStyle: React.CSSProperties = {
  width: "100%",
  background: "none",
  border: "none",
  textAlign: "left",
  padding: "14px 18px",
  fontSize: 16,
  cursor: "pointer",
};

const detailLabelStyle: React.CSSProperties = {
  color: "#475569",
  fontWeight: 500,
};

const detailValueStyle: React.CSSProperties = {
  color: "#2f2f2f",
  fontWeight: 500,
};
