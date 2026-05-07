import { Elements } from "@stripe/react-stripe-js";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { StripePaymentForm } from "../../components/classes/StripePaymentForm";
import { createPaymentIntent, getClassDetail } from "../../engine/classApi";
import { WEB_ENV } from "../../lib/env";
import { stripePromise } from "../../lib/stripe";

function formatCountdown(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${`${mins}`.padStart(2, "0")}:${`${secs}`.padStart(2, "0")}`;
}

function formatScheduleRange(
  startUtc: string | null,
  durationText: string | null,
) {
  if (!startUtc) return "Not available";
  try {
    const start = new Date(startUtc);
    const minutes =
      Number.parseInt((durationText || "").replace(/\D/g, ""), 10) || 0;
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

function extractAmount(amountText: string | null) {
  if (!amountText) return "0.00";
  const parsed = amountText.replace(/[^\d.]/g, "");
  return parsed || "0.00";
}

export function ClassPaymentPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const bookingId = Number(searchParams.get("booking_id"));
  const clientSecretFromQuery = searchParams.get("cs");
  const scheduledAt = searchParams.get("scheduled_at");
  const duration = searchParams.get("duration");
  const amount = searchParams.get("amount");
  const classTitleFromQuery = searchParams.get("title");

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classTitle, setClassTitle] = useState(classTitleFromQuery || "Class");
  const [remainingSeconds, setRemainingSeconds] = useState(590);
  const [classSubtitle, setClassSubtitle] = useState("");
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 1024 : false,
  );

  useEffect(() => {
    if (!bookingId) {
      setError("Invalid booking. Please start over.");
      setLoading(false);
      return;
    }

    void (async () => {
      try {
        setLoading(true);
        setError(null);
        setClientSecret(clientSecretFromQuery ?? null);
        const [paymentResult, classResult] = await Promise.all([
          clientSecretFromQuery
            ? Promise.resolve({ client_secret: clientSecretFromQuery })
            : createPaymentIntent({ booking_id: bookingId }),
          slug ? getClassDetail(slug) : Promise.resolve(null),
        ]);

        if (classResult?.title) {
          setClassTitle(classResult.title);
        }
        setClassSubtitle(
          ((classResult as any)?.subtitle as string | undefined) || "",
        );

        if (!paymentResult?.client_secret) {
          setError("Could not start payment. Please try again.");
          return;
        }
        setClientSecret(paymentResult.client_secret);
      } catch (err: any) {
        if (WEB_ENV.isDev)
          console.error("[ClassPaymentPage] intent error:", err);
        setError(err?.message ?? "Payment setup failed.");
      } finally {
        setLoading(false);
      }
    })();
  }, [bookingId, slug, clientSecretFromQuery]);

  useEffect(() => {
    function onResize() {
      setIsDesktop(window.innerWidth >= 1024);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (loading || error) return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [loading, error]);

  const returnUrl = `${window.location.origin}/en/classes/success?slug=${slug}&booking_id=${bookingId}`;
  const countdown = useMemo(
    () => formatCountdown(remainingSeconds),
    [remainingSeconds],
  );
  const progress = useMemo(
    () => (remainingSeconds / 590) * 100,
    [remainingSeconds],
  );
  const summaryAmount = amount || "₹0.00";
  const numericAmount = extractAmount(amount);
  const scheduleText = useMemo(
    () => formatScheduleRange(scheduledAt, duration),
    [scheduledAt, duration],
  );

  function handleSuccess() {
    navigate(`/en/classes/success?slug=${slug}&booking_id=${bookingId}`);
  }

  function handleError(msg: string) {
    setError(msg);
  }

  if (!stripePromise) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "var(--kalpx-parchment)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "#b91c1c", fontSize: 14 }}>
          Stripe is not configured. Please contact support.
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh" }}>
      {isDesktop ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "380px minmax(0, 1fr)",
            minHeight: "calc(100dvh - 72px)",
          }}
        >
          <aside
            style={{
              padding: "25px",
              borderRight: "1px solid #d7d7d7",
              display: "flex",
              flexDirection: "column",
              gap: 34,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 14,
                alignItems: "center",
              }}
            >
              <div style={stepDoneStyle}>1</div>
              <div
                style={{ ...stepLineStyle, background: "var(--kalpx-cta)" }}
              />
              <div style={stepDoneStyle}>2</div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: -14,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700, color: "#2f2f2f" }}>
                Slot Booking
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#2f2f2f" }}>
                Payment
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#1f2a44" }}>
                {classTitle}
              </div>
              {classSubtitle ? (
                <div style={{ fontSize: 16, color: "#6b7280" }}>
                  {classSubtitle}
                </div>
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
                  {duration || "—"}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    color: "var(--kalpx-cta)",
                    fontSize: 28,
                    fontWeight: 800,
                  }}
                >
                  {summaryAmount}
                </span>
                <span style={{ color: "#111", fontSize: 16, fontWeight: 500 }}>
                  / person
                </span>
                <button
                  type="button"
                  onClick={() => navigate(`/en/classes/${slug}`)}
                  style={{
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
            </div>
          </aside>

          <section style={{ padding: "46px 52px 40px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 20,
                marginBottom: 22,
              }}
            >
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#1f2a44",
                  margin: 0,
                }}
              >
                Payment
              </h1>

              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <button
                  type="button"
                  onClick={() => navigate(`/en/classes/${slug}/book`)}
                  style={desktopHeaderBtn}
                >
                  Back
                </button>
                {/* <button
                  type="button"
                  style={{
                    ...desktopHeaderBtn,
                    border: "none",
                    background: "var(--kalpx-cta)",
                    color: "#fff",
                  }}
                >
                  Make Payment
                </button> */}
              </div>
            </div>

            {loading && (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <p style={{ color: "#6b7280", fontSize: 14 }}>
                  Setting up payment…
                </p>
              </div>
            )}

            {!loading && error && (
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  background: "#fff1f0",
                  border: "1px solid #fca5a5",
                  marginBottom: 20,
                }}
              >
                <p style={{ color: "#b91c1c", fontSize: 13, marginBottom: 8 }}>
                  {error}
                </p>
                <button
                  onClick={() => navigate(`/en/classes/${slug}/book`)}
                  style={{
                    fontSize: 13,
                    color: "#b91c1c",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  Try booking again
                </button>
              </div>
            )}

            {!loading && !error && clientSecret && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 22 }}
              >
                <section
                  style={{
                    background: "#fff8f0",
                    border: "2px solid #f3c892",
                    borderRadius: 24,
                    padding: "24px 26px",
                    boxShadow: "0 14px 32px rgba(0,0,0,0.07)",
                  }}
                >
                  <div
                    style={{ display: "flex", gap: 26, alignItems: "center" }}
                  >
                    <div
                      style={{
                        width: 66,
                        height: 66,
                        borderRadius: "50%",
                        background: "#22c55e",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {countdown}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{ fontSize: 18, fontWeight: 800, color: "#111" }}
                      >
                        Complete Your Payment
                      </div>
                      <div
                        style={{
                          fontSize: 16,
                          lineHeight: 1.6,
                          color: "#475569",
                        }}
                      >
                        Please complete your payment within{" "}
                        <span style={{ color: "#ea580c", fontWeight: 800 }}>
                          {countdown}
                        </span>{" "}
                        or your slot will be released.
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 22,
                      height: 14,
                      borderRadius: 999,
                      background: "#dbe2ea",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${progress}%`,
                        height: "100%",
                        borderRadius: 999,
                        background: "#22c55e",
                        transition: "width 1s linear",
                      }}
                    />
                  </div>
                </section>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) 560px",
                    gap: 18,
                    alignItems: "start",
                  }}
                >
                  <section
                    style={{
                      background: "#fff",
                      border: "1px solid rgba(112,112,112,0.18)",
                      borderRadius: 24,
                      padding: 18,
                    }}
                  >
                    <div
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        padding: 16,
                        background: "#fff",
                      }}
                    >
                      <Elements
                        key={clientSecret}
                        stripe={stripePromise}
                        options={{
                          clientSecret,
                          appearance: {
                            theme: "stripe",
                            variables: {
                              colorPrimary: "#e0a90c",
                              colorBackground: "#ffffff",
                              colorText: "#1f2937",
                              borderRadius: "10px",
                              fontFamily: "system-ui, sans-serif",
                            },
                          },
                        }}
                      >
                        <StripePaymentForm
                          onSuccess={handleSuccess}
                          onError={handleError}
                          returnUrl={returnUrl}
                          submitLabel="Make Payment"
                        />
                      </Elements>
                    </div>
                  </section>

                  <section
                    style={{
                      background: "#fff",
                      border: "1px solid rgba(112,112,112,0.18)",
                      borderRadius: 24,
                      padding: 22,
                    }}
                  >
                    <h2
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        color: "#111",
                        margin: "0 0 24px",
                      }}
                    >
                      Summary
                    </h2>

                    <div style={{ display: "grid", gap: 26 }}>
                      <div style={summaryRow}>
                        <span style={summaryKey}>Class Name</span>
                        <span style={summaryValue}>{classTitle}</span>
                      </div>
                      <div style={summaryRow}>
                        <span style={summaryKey}>Scheduled</span>
                        <span style={summaryValue}>{scheduleText}</span>
                      </div>
                      <div style={summaryRow}>
                        <span style={summaryKey}>Price</span>
                        <span style={summaryValue}>{summaryAmount}</span>
                      </div>
                      <div style={summaryRow}>
                        <span style={summaryKey}>Total</span>
                        <span
                          style={{
                            ...summaryValue,
                            color: "#d79a07",
                            fontSize: 20,
                            fontWeight: 800,
                          }}
                        >
                          ₹{numericAmount}
                        </span>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            )}
          </section>
        </div>
      ) : (
        <div
          style={{ maxWidth: 560, margin: "0 auto", padding: "28px 16px 60px" }}
        >
          <button
            onClick={() => navigate(`/en/classes/${slug}/book`)}
            style={{
              background: "none",
              border: "none",
              color: "var(--kalpx-cta)",
              fontSize: 14,
              cursor: "pointer",
              padding: 0,
              marginBottom: 16,
            }}
          >
            ← Back
          </button>

          <h1
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#1f2a44",
              margin: "0 0 18px",
            }}
          >
            Payment
          </h1>

          {loading && (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ color: "#6b7280", fontSize: 14 }}>
                Setting up payment…
              </p>
            </div>
          )}

          {!loading && error && (
            <div
              style={{
                padding: "14px 16px",
                borderRadius: 10,
                background: "#fff1f0",
                border: "1px solid #fca5a5",
                marginBottom: 20,
              }}
            >
              <p style={{ color: "#b91c1c", fontSize: 13, marginBottom: 8 }}>
                {error}
              </p>
              <button
                onClick={() => navigate(`/en/classes/${slug}/book`)}
                style={{
                  fontSize: 13,
                  color: "#b91c1c",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                }}
              >
                Try booking again
              </button>
            </div>
          )}

          {!loading && !error && clientSecret && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <section
                style={{
                  background: "#fff8f0",
                  border: "2px solid #f3c892",
                  borderRadius: 24,
                  padding: 10,
                  boxShadow: "0 14px 32px rgba(0,0,0,0.07)",
                }}
              >
                <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      background: "#22c55e",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {countdown}
                  </div>
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 6 }}
                  >
                    <div
                      style={{ fontSize: 18, fontWeight: 800, color: "#111" }}
                    >
                      Complete Your Payment
                    </div>
                    <div
                      style={{
                        fontSize: 16,
                        lineHeight: 1.6,
                        color: "#475569",
                      }}
                    >
                      Please complete your payment within{" "}
                      <span style={{ color: "#ea580c", fontWeight: 800 }}>
                        {countdown}
                      </span>{" "}
                      or your slot will be released.
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 24,
                    height: 14,
                    borderRadius: 999,
                    background: "#dbe2ea",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: "#22c55e",
                      transition: "width 1s linear",
                    }}
                  />
                </div>
              </section>

              <section
                style={{
                  background: "#fff",
                  border: "1px solid rgba(112,112,112,0.18)",
                  borderRadius: 24,
                  padding: 22,
                }}
              >
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#111",
                    margin: "0 0 24px",
                  }}
                >
                  Summary
                </h2>

                <div style={{ display: "grid", gap: 26 }}>
                  <div style={summaryRow}>
                    <span style={summaryKey}>Class Name</span>
                    <span style={summaryValue}>{classTitle}</span>
                  </div>
                  <div style={summaryRow}>
                    <span style={summaryKey}>Scheduled</span>
                    <span style={summaryValue}>{scheduleText}</span>
                  </div>
                  <div style={summaryRow}>
                    <span style={summaryKey}>Price</span>
                    <span style={summaryValue}>{summaryAmount}</span>
                  </div>
                  <div style={summaryRow}>
                    <span style={summaryKey}>Total</span>
                    <span
                      style={{
                        ...summaryValue,
                        color: "#d79a07",
                        fontSize: 20,
                        fontWeight: 800,
                      }}
                    >
                      ₹{numericAmount}
                    </span>
                  </div>
                </div>
              </section>

              <section
                style={{
                  background: "#fff",
                  border: "1px solid rgba(112,112,112,0.18)",
                  borderRadius: 24,
                  padding: 22,
                }}
              >
                <div style={{ padding: 16 }}>
                  <Elements
                    key={clientSecret}
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: "stripe",
                        variables: {
                          colorPrimary: "#e0a90c",
                          colorBackground: "#ffffff",
                          colorText: "#1f2937",
                          borderRadius: "10px",
                          fontFamily: "system-ui, sans-serif",
                        },
                      },
                    }}
                  >
                    <StripePaymentForm
                      onSuccess={handleSuccess}
                      onError={handleError}
                      returnUrl={returnUrl}
                      submitLabel="Make Payment"
                    />
                  </Elements>
                </div>
              </section>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const summaryRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(120px, 1fr) minmax(0, 1fr)",
  gap: 18,
  alignItems: "start",
};

const summaryKey: React.CSSProperties = {
  color: "#111",
  fontSize: 16,
  fontWeight: 500,
};

const summaryValue: React.CSSProperties = {
  color: "#111",
  fontSize: 16,
  fontWeight: 500,
  lineHeight: 1.45,
};

const stepDoneStyle: React.CSSProperties = {
  width: 50,
  height: 50,
  minWidth: 50,
  borderRadius: "50%",
  background: "var(--kalpx-cta)",
  color: "#2f2f2f",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 28,
  fontWeight: 800,
};

const stepLineStyle: React.CSSProperties = {
  height: 3,
  borderRadius: 999,
  flex: 1,
  minWidth: 80,
};

const desktopHeaderBtn: React.CSSProperties = {
  borderRadius: 14,
  border: "1px solid #2f2f2f",
  background: "#fff",
  color: "#2f2f2f",
  padding: "14px 28px",
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
};
