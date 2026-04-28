import { AUTH_KEYS } from "@kalpx/api-client";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Footer } from "../../components/layout/Footer";
import { Header } from "../../components/layout/Header";
import { MobileBottomNav } from "../../components/layout/MobileBottomNav";
import { useGuestIdentity } from "../../hooks/useGuestIdentity";
import { useJourneyStatus } from "../../hooks/useJourneyStatus";
import { WEB_ENV } from "../../lib/env";

export function MitraHomePage() {
  useGuestIdentity();
  const navigate = useNavigate();
  const { loading, error, hasActiveJourney, refetch } = useJourneyStatus();

  useEffect(() => {
    if (loading) return;
    if (hasActiveJourney === true) {
      navigate("/en/mitra/dashboard", { replace: true });
      return;
    }
    if (
      hasActiveJourney === false &&
      typeof localStorage !== "undefined" &&
      !!localStorage.getItem(AUTH_KEYS.accessToken)
    ) {
      navigate("/en/mitra/welcome-back", { replace: true });
    }
  }, [loading, hasActiveJourney, navigate]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          background: "#FFF8EF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            border: "2px solid var(--kalpx-cta)",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        backgroundImage: "url(/14day_updated.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header transparent />
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 24px calc(72px + env(safe-area-inset-bottom))",
        }}
      >
        <div
          style={{
            color: "#432104",
            fontSize: 20,
            fontWeight: 300,
            fontFamily: "var(--kalpx-font-serif)",
            marginTop: 30,
          }}
        >
          "In this path, no effort is ever lost."
        </div>
        <div
          style={{
            color: "#432104",
            fontSize: 16,
            fontWeight: 300,
            fontFamily: "var(--kalpx-font-serif)",
            marginBottom: 15,
          }}
        >
          — Bhagavad Gita 6.5
        </div>
        <div
          style={{
            textAlign: "center",
            marginBottom: 32,
            width: "100%",
            maxWidth: 360,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background: "rgba(199,162,88,0.4)",
                maxWidth: 60,
              }}
            />
            <span style={{ fontSize: 16, color: "#c7a258" }}>◆</span>
            <div
              style={{
                flex: 1,
                height: 1,
                background: "rgba(199,162,88,0.4)",
                maxWidth: 60,
              }}
            />
          </div>

          <h1
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: "#432104",
              marginBottom: 8,
              marginTop: 50,
              fontFamily: "var(--kalpx-font-serif)",
            }}
          >
            KalpX Mitra
          </h1>
          <p
            style={{
              color: "#432104",
              marginBottom: 8,
              lineHeight: 1,
              fontWeight: 500,
              fontSize: 20,
            }}
          >
            Your daily companion for life
          </p>
          <p
            style={{
              color: "#432104",
              fontSize: 18,
              lineHeight: 1.6,
            }}
          >
            Grounded in timeless Sanatan wisdom.
          </p>
          <p
            style={{
              color: "#432104",
              fontSize: 18,
              lineHeight: 1.6,
              marginTop: 12,
            }}
          >
            A calmer, clearer way to navigate life - one day at a time.
          </p>

          {error && (
            <p
              style={{
                color: "#e06060",
                fontSize: 15,
                marginBottom: 16,
                marginTop: 12,
              }}
            >
              Could not check status.{" "}
              <button
                onClick={refetch}
                style={{
                  background: "none",
                  color: "#e06060",
                  cursor: "pointer",
                  fontSize: 15,
                }}
              >
                Retry
              </button>
            </p>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            width: "100%",
            maxWidth: 360,
            marginTop: "auto",
            marginBottom: 70,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Link
            to="/en/mitra/start"
            style={{
              display: "block",
              padding: "16px 32px",
              background: "linear-gradient(to right, #E5D4CA, #F5EDEA)",
              color: "#432104",
              borderRadius: 28,
              fontWeight: 600,
              width: "70%",
              fontSize: 16,
              textAlign: "center",
              textDecoration: "none",

              border: "1px solid rgba(199,162,88,0.3)",
            }}
            className="shadow-2xl flex justify-center align"
          >
            Begin your journey →
          </Link>

          {/* <Link
            to="/login"
            style={{
              display: "block",
              padding: "14px 32px",
              border: "1px solid rgba(199,162,88,0.4)",
              borderRadius: 28,
              color: "#432104",
              textAlign: "center",
              textDecoration: "none",
              fontSize: 14,
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
          >
            Sign in
          </Link> */}
        </div>

        {WEB_ENV.isDev &&
          typeof window !== "undefined" &&
          window.location.search.includes("debug") && (
            <div
              style={{
                margin: "16px 0",
                padding: "12px 16px",
                background: "rgba(0,0,0,0.5)",
                borderRadius: 8,
                fontSize: 11,
                fontFamily: "monospace",
                color: "#aaa",
                textAlign: "left",
                width: "100%",
                maxWidth: 360,
              }}
            >
              <div>API: {WEB_ENV.apiBaseUrl}</div>
              <div>
                guestUUID: {localStorage.getItem(AUTH_KEYS.guestUUID) ?? "none"}
              </div>
              <div>
                access_token:{" "}
                {localStorage.getItem(AUTH_KEYS.accessToken)
                  ? "present"
                  : "none"}
              </div>
            </div>
          )}
      </main>
      <Footer transparent />
      <MobileBottomNav transparent />
    </div>
  );
}
