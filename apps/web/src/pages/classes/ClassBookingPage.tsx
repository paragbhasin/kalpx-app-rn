import { isAuthenticated } from "@kalpx/auth";
import type { ClassDaySlots, ClassDetail, ClassSlot } from "@kalpx/types";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createBooking,
  createPaymentIntent,
  getClassDetail,
  getClassSlots,
} from "../../engine/classApi";
import { WEB_ENV } from "../../lib/env";
import { webStorage } from "../../lib/webStorage";

function getTz(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameDate(a: Date | null, b: Date | null) {
  return !!a && !!b && a.toDateString() === b.toDateString();
}

function isSameMinute(a?: string | null, b?: string | null) {
  return !!a && !!b && new Date(a).getTime() === new Date(b).getTime();
}

function formatDateLocal(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatCurrency(code: string, amount: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${code} ${amount}`;
  }
}

function formatTimeLabel(slot: ClassSlot) {
  try {
    const src = slot.start_user || slot.start_utc;
    const date = new Date(src);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    return `${h12}:${`${minutes}`.padStart(2, "0")} ${ampm}`;
  } catch {
    return slot.start_utc;
  }
}

function formatDateRange(startUtc: string, durationText: string) {
  try {
    const start = new Date(startUtc);
    const minutes = Number.parseInt(durationText.replace(/\D/g, ""), 10) || 0;
    const end = new Date(start.getTime() + minutes * 60_000);
    const dateOpts: Intl.DateTimeFormatOptions = {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    };
    const timeOpts: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };
    return `${start.toLocaleDateString("en-GB", dateOpts)}, ${start.toLocaleTimeString(
      "en-GB",
      timeOpts,
    )} - ${end.toLocaleDateString("en-GB", dateOpts)}, ${end.toLocaleTimeString(
      "en-GB",
      timeOpts,
    )}`;
  } catch {
    return startUtc;
  }
}

function buildMonthGrid(month: Date, availableSlots: ClassDaySlots[]) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days: Array<null | {
    date: Date;
    hasSlots: boolean;
    selectable: boolean;
  }> = [];

  for (let i = 0; i < firstDay.getDay(); i += 1) {
    days.push(null);
  }

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

function getPriceLabel(cls: ClassDetail | null, trialSelected: boolean) {
  const currency = cls?.pricing?.currency || "INR";

  if (trialSelected && cls?.pricing?.trial?.enabled) {
    return {
      amount: formatCurrency(currency, cls.pricing.trial.amount || 0),
      type: "trial",
      time: `${cls.pricing.trial.session_length_min || 0}m`,
    };
  }

  const pricingType = cls?.pricing?.type || "per_person";
  if (pricingType === "per_group") {
    const amount = (cls?.pricing?.per_group as any)?.amount?.web ?? 0;
    const length = (cls?.pricing?.per_group as any)?.session_length_min ?? 0;
    return {
      amount: formatCurrency(currency, amount),
      type: "group",
      time: `${length}m`,
    };
  }

  if (pricingType === "course") {
    const amount = (cls?.pricing?.course as any)?.amount?.web ?? 0;
    const total = (cls?.pricing?.course as any)?.total_sessions ?? 0;
    return {
      amount: formatCurrency(currency, amount),
      type: "course",
      time: `${total} sessions`,
    };
  }

  const amount = (cls?.pricing?.per_person as any)?.amount?.web ?? 0;
  const length = (cls?.pricing?.per_person as any)?.session_length_min ?? 0;
  return {
    amount: formatCurrency(currency, amount),
    type: "person",
    time: `${length}m`,
  };
}

function firstSelectableDate(days: ReturnType<typeof buildMonthGrid>) {
  return days.find((day) => day?.selectable)?.date ?? null;
}

export function ClassBookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [cls, setCls] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [trialSelected, setTrialSelected] = useState(false);

  const [monthCursor, setMonthCursor] = useState(startOfMonth(new Date()));
  const [pickedDate, setPickedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<ClassSlot | null>(null);
  const [slotTimes, setSlotTimes] = useState<ClassSlot[]>([]);

  const userTz = useMemo(() => getTz(), []);
  const tutorTz = useMemo(
    () =>
      cls?.class_availability?.timezone ||
      cls?.tutor?.timezone ||
      "Asia/Kolkata",
    [cls],
  );
  const availableSlots = useMemo(() => cls?.available_slots ?? [], [cls]);
  const priceLabel = useMemo(
    () => getPriceLabel(cls, trialSelected),
    [cls, trialSelected],
  );
  const hasTrial =
    cls?.pricing?.trial?.enabled && cls.pricing.trial.amount != null;

  const monthDays = useMemo(
    () => buildMonthGrid(monthCursor, availableSlots),
    [monthCursor, availableSlots],
  );

  useEffect(() => {
    isAuthenticated(webStorage).then((ok) => {
      if (!ok) {
        const returnTo = encodeURIComponent(`/en/classes/${slug}/book`);
        navigate(`/login?returnTo=${returnTo}`, { replace: true });
      }
    });
  }, [navigate, slug]);

  useEffect(() => {
    if (!slug) return;
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const detail = await getClassDetail(slug);
        if (!detail) {
          setError("Class not found.");
          setCls(null);
          return;
        }

        setCls(detail);

        const firstDate = detail.available_slots?.[0]?.date
          ? new Date(detail.available_slots[0].date)
          : new Date();
        firstDate.setHours(0, 0, 0, 0);
        setMonthCursor(startOfMonth(firstDate));
        setPickedDate(firstDate);
        setSelectedSlot(null);
      } catch (err: any) {
        if (WEB_ENV.isDev) console.error("[ClassBookingPage] load error:", err);
        setError("Could not load booking details.");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  useEffect(() => {
    if (!pickedDate) {
      setSlotTimes([]);
      setLoadingSlots(false);
      return;
    }

    setLoadingSlots(true);
    const dateStr = formatDateLocal(pickedDate);
    const timer = window.setTimeout(() => {
      const slots =
        availableSlots.find((slot) => slot.date === dateStr)?.slots ?? [];
      setSlotTimes(slots);
      setLoadingSlots(false);
    }, 120);

    return () => window.clearTimeout(timer);
  }, [availableSlots, pickedDate]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  function shiftMonth(delta: number) {
    setSelectedSlot(null);
    setSlotTimes([]);
    const nextMonth = new Date(monthCursor);
    nextMonth.setMonth(nextMonth.getMonth() + delta, 1);
    const nextCursor = startOfMonth(nextMonth);
    setMonthCursor(nextCursor);

    const nextDays = buildMonthGrid(nextCursor, availableSlots);
    const nextDate = firstSelectableDate(nextDays);
    setPickedDate(nextDate);
  }

  async function handleBook() {
    if (!cls || !selectedSlot) return;

    setSubmitting(true);
    setError(null);

    try {
      const selectedDate = pickedDate
        ? formatDateLocal(pickedDate)
        : formatDateLocal(new Date(selectedSlot.start_utc));
      const slotsResponse = await getClassSlots({
        offering_id: cls.id,
        date: selectedDate,
        user_timezone: userTz,
        tutor_timezone: tutorTz,
      });

      const liveSlots = slotsResponse?.slots ?? [];
      const slotStillAvailable = liveSlots.some(
        (slot) =>
          slot.start_utc === selectedSlot.start_utc ||
          slot.start_user === selectedSlot.start_utc,
      );

      if (!slotStillAvailable) {
        setSelectedSlot(null);
        setSlotTimes(liveSlots);
        setToastMessage(
          "Selected slot is no longer available. Please choose another slot.",
        );
        setError(null);
        return;
      }

      const result = await createBooking({
        offering_id: cls.id,
        scheduled_at: selectedSlot.start_utc,
        user_timezone: userTz,
        tutor_timezone: tutorTz,
        note: note.trim() || undefined,
        trial_selected: trialSelected || undefined,
      });

      const bookingId = result?.data?.booking_id ?? result?.booking_id;
      if (!bookingId) {
        setToastMessage("Booking failed. Please try again.");
        return;
      }

      const requiresPayment =
        (result as any)?.data?.requires_payment ??
        (result as any)?.requires_payment ??
        true;

      if (!requiresPayment) {
        navigate(`/en/classes/success?slug=${slug}&booking_id=${bookingId}`);
        return;
      }

      const paymentIntent = await createPaymentIntent({
        booking_id: bookingId,
      });
      const clientSecret = paymentIntent?.client_secret;
      if (!clientSecret) {
        setToastMessage("Could not start payment. Please try again.");
        return;
      }

      const paymentParams = new URLSearchParams({
        booking_id: String(bookingId),
        scheduled_at: selectedSlot.start_utc,
        duration: priceLabel.time,
        amount: priceLabel.amount,
        title: cls.title || "Class",
        type: priceLabel.type,
        cs: clientSecret,
      });
      navigate(`/en/classes/${slug}/pay?${paymentParams.toString()}`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.message ||
        "Booking failed.";
      setError(null);
      setToastMessage(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100dvh",

          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "var(--kalpx-text-soft)" }}>Loading…</p>
      </div>
    );
  }

  if (error && !cls) {
    return (
      <div style={{ minHeight: "100dvh", background: "#fffff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 16px" }}>
          <button
            onClick={() => navigate(`/en/classes/${slug}`)}
            style={backBtn}
          >
            ← Back
          </button>
          <p style={{ color: "#b91c1c", fontSize: 14 }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#fffff" }}>
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            bottom: 24,
            transform: "translateX(-50%)",
            zIndex: 1200,
            background: "#2f2418",
            color: "#fff",
            borderRadius: 12,
            padding: "12px 16px",
            fontSize: 14,
            fontWeight: 600,
            boxShadow: "0 12px 28px rgba(0,0,0,0.24)",
            maxWidth: "calc(100vw - 32px)",
            textAlign: "center",
          }}
        >
          {toastMessage}
        </div>
      )}
      <style>{`
        @media (min-width: 1024px) {
          .kalpx-booking-shell {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(320px, 360px);
            gap: 32px;
            align-items: start;
          }
          .kalpx-booking-sidebar {
            position: sticky;
            top: 88px;
            display: flex !important;
          }
          .kalpx-booking-mobile-cta {
            display: none !important;
          }
          .kalpx-booking-main-grid {
            flex-direction: row !important;
            align-items: flex-start;
          }
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "10px" }}>
        <button onClick={() => navigate(`/en/classes/${slug}`)} style={backBtn}>
          ← Back
        </button>

        <div
          className="kalpx-booking-shell"
          style={{ display: "grid", gap: 24 }}
        >
          <div
            style={{
              padding: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                marginBottom: 18,
              }}
            >
              <h1
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#1f2a44",
                }}
              >
                Book a session
              </h1>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 24,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#1f2a44",
                }}
              >
                {cls?.title || "Untitled Class"}
              </h2>
              {cls?.subtitle ? (
                <p
                  style={{
                    margin: 0,
                    fontSize: 16,
                    color: "#6b7280",
                  }}
                >
                  {cls.subtitle}
                </p>
              ) : null}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 16,
                }}
              >
                <span style={{ color: "#6b7280", fontWeight: 500 }}>
                  Duration :
                </span>
                <span style={{ color: "#111", fontWeight: 700 }}>
                  {priceLabel.time}
                </span>
              </div>

              <div>
                <span
                  style={{
                    color: "var(--kalpx-cta)",
                    fontSize: 28,
                    fontWeight: 800,
                  }}
                >
                  {priceLabel.amount}
                </span>
                <span style={{ color: "#111", fontSize: 16, fontWeight: 500 }}>
                  {" "}
                  / {priceLabel.type}
                </span>
              </div>

              <button
                type="button"
                onClick={() => navigate(`/en/classes/${slug}`)}
                style={{
                  alignSelf: "flex-start",
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "var(--kalpx-cta)",
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                View more details
              </button>
            </div>

            <div
              className="kalpx-booking-main-grid"
              style={{ display: "flex", flexDirection: "column", gap: 24 }}
            >
              <div
                style={{
                  border: "1px solid #d9d9d9",
                  background: "#f0f0f0",
                  borderRadius: 25,
                  padding: 14,
                  width: "100%",

                  flexShrink: 0,
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
                    style={monthArrowBtn}
                  >
                    ‹
                  </button>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>
                    {monthCursor.toLocaleString([], {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => shiftMonth(1)}
                    style={monthArrowBtn}
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
                    color: "#222",
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
                          disabled={!day.selectable || !day.hasSlots}
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
                                : "#94a3b8",
                            borderRadius: isSameDate(day.date, pickedDate)
                              ? 14
                              : 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                            fontWeight: 700,
                            cursor:
                              day.selectable && day.hasSlots
                                ? "pointer"
                                : "not-allowed",
                            opacity: day.selectable && day.hasSlots ? 1 : 0.4,
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
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                  flex: 1,
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#111",
                  }}
                >
                  Available Slots
                </h4>

                {pickedDate ? (
                  loadingSlots ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, minmax(0, 110px))",
                        gap: 12,
                      }}
                    >
                      {Array.from({ length: 6 }).map((_, idx) => (
                        <div
                          key={idx}
                          style={{
                            width: 110,
                            height: 31,
                            borderRadius: 6,
                            background: "#d1d5db",
                            opacity: 0.75,
                          }}
                        />
                      ))}
                    </div>
                  ) : slotTimes.length ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(110px, 110px))",
                        gap: 16,
                      }}
                    >
                      {slotTimes.map((slot, idx) => (
                        <button
                          key={`${slot.start_utc}-${idx}`}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          style={{
                            width: 110,
                            height: 31,
                            border: "none",
                            borderRadius: 6,
                            background: isSameMinute(
                              selectedSlot?.start_utc,
                              slot.start_utc,
                            )
                              ? "var(--kalpx-cta)"
                              : "#f3f3f4",
                            color: isSameMinute(
                              selectedSlot?.start_utc,
                              slot.start_utc,
                            )
                              ? "#fff"
                              : "#111",
                            fontSize: 16,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {formatTimeLabel(slot)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: 16, color: "#64748b" }}>
                      No times on this day.
                    </div>
                  )
                ) : (
                  <div style={{ fontSize: 16, color: "#64748b" }}>
                    Select a date.
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 16,
                    fontSize: 14,
                  }}
                >
                  <div>
                    <span style={{ color: "#6b7280", fontWeight: 500 }}>
                      Tutor TZ :{" "}
                    </span>
                    <span style={{ color: "#111", fontWeight: 700 }}>
                      {tutorTz}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#6b7280", fontWeight: 500 }}>
                      Your TZ :{" "}
                    </span>
                    <span style={{ color: "#111", fontWeight: 700 }}>
                      {userTz}
                    </span>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: 8,
                  }}
                >
                  {hasTrial && (
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
                          {formatCurrency(
                            cls?.pricing?.currency || "INR",
                            cls?.pricing?.trial?.amount || 0,
                          )}
                        </strong>
                      </span>
                    </label>
                  )}
                  <button
                    className="kalpx-booking-mobile-cta"
                    onClick={handleBook}
                    disabled={!selectedSlot || submitting}
                    style={{
                      marginLeft: "auto",
                      borderRadius: 10,
                      background: "var(--kalpx-cta)",
                      color: selectedSlot ? "#fff" : "#111",
                      padding: "10px 25px",
                      fontSize: 15,
                      fontWeight: 700,
                      opacity: !selectedSlot || submitting ? 0.5 : 1,
                      cursor:
                        !selectedSlot || submitting ? "not-allowed" : "pointer",
                    }}
                  >
                    {submitting ? "Requesting..." : "Next"}
                  </button>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <label
                    htmlFor="booking-note"
                    style={{ fontSize: 16, fontWeight: 700, color: "#111" }}
                  >
                    Note to tutor{" "}
                    <span style={{ color: "#6b7280", fontWeight: 500 }}>
                      (Optional)
                    </span>
                  </label>
                  <textarea
                    id="booking-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Enter comment"
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      padding: "12px 14px",
                      resize: "vertical",
                      border: "1.5px solid #111",
                      fontSize: 14,
                      outline: "none",
                      boxSizing: "border-box",
                      marginBottom: 70,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <aside
            className="kalpx-booking-sidebar"
            style={{
              display: "none",
              flexDirection: "column",
              gap: 16,
              background: "#fff",
              border: "1px solid rgba(112,112,112,0.18)",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 8px 28px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>
              Tutor Availability
            </div>

            {hasTrial && (
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
                    {formatCurrency(
                      cls?.pricing?.currency || "INR",
                      cls?.pricing?.trial?.amount || 0,
                    )}
                  </strong>
                </span>
              </label>
            )}

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
              <span style={{ color: "#111", fontWeight: 600 }}>
                {priceLabel.time}
              </span>
            </div>

            <div>
              <span
                style={{
                  color: "var(--kalpx-cta)",
                  fontSize: 18,
                  fontWeight: 800,
                }}
              >
                {priceLabel.amount}
              </span>
              <span style={{ color: "#111", fontSize: 16, fontWeight: 500 }}>
                {" "}
                / {priceLabel.type}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                fontSize: 14,
              }}
            >
              <div>
                <span style={{ color: "#6b7280", fontWeight: 500 }}>
                  Tutor TZ :{" "}
                </span>
                <span style={{ color: "#111", fontWeight: 700 }}>
                  {tutorTz}
                </span>
              </div>
              <div>
                <span style={{ color: "#6b7280", fontWeight: 500 }}>
                  Your TZ :{" "}
                </span>
                <span style={{ color: "#111", fontWeight: 700 }}>{userTz}</span>
              </div>
            </div>

            <button
              onClick={handleBook}
              disabled={!selectedSlot || submitting}
              style={{
                borderRadius: 10,
                background: "var(--kalpx-cta)",
                color: "#111",
                padding: "14px 18px",
                fontSize: 15,
                fontWeight: 700,
                opacity: !selectedSlot || submitting ? 0.5 : 1,
                cursor: !selectedSlot || submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Requesting..." : "Book Now"}
            </button>
          </aside>
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

const monthArrowBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: 24,
  fontWeight: 700,
  lineHeight: 1,
  padding: 0,
  color: "#111",
  cursor: "pointer",
};
