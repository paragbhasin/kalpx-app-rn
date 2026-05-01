import { ChevronLeft } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../components/ui";

export function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <AppShell bg="cream">
      <div
        style={{
          minHeight: "100dvh",
          background: "#fffaf5",
          paddingBottom: "calc(40px + env(safe-area-inset-bottom))",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "26px 20px 18px",
            background: "#fffaf5",
            borderBottom: "1px solid rgba(184, 134, 75, 0.14)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              width: 32,
              height: 32,
              border: "none",
              background: "none",
              color: "#000",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              padding: 0,
            }}
          >
            <ChevronLeft size={28} strokeWidth={2.2} />
          </button>
          <h1
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 700,
              color: "#000",
              fontFamily: "var(--kalpx-font-sans)",
            }}
          >
            Privacy Policy
          </h1>
          <div style={{ width: 32 }} />
        </div>

        {/* Content */}
        <div
          className="fade-in"
          style={{
            maxWidth: 700,
            margin: "0 auto",
            padding: "40px 24px",
            lineHeight: "1.7",
            color: "#373737",
            fontFamily: "var(--kalpx-font-sans)",
          }}
        >
          <p style={{ marginBottom: "24px", color: "#b8864b", fontWeight: 600 }}>
            Effective Date: May 5, 2025
          </p>

          <p style={{ fontSize: "17px", marginBottom: "32px" }}>
            KalpX ("we", "our", or "us") values your privacy. This Privacy
            Policy explains how we collect, use, store, and protect your
            information when you access or use the KalpX platform, including
            through our website or mobile applications.
          </p>

          <section style={{ marginBottom: "32px" }}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#000",
                marginBottom: "16px",
              }}
            >
              1. Information We Collect
            </h2>
            <ul style={{ paddingLeft: "20px", listStyleType: "disc" }}>
              <li style={{ marginBottom: "12px" }}>
                <strong>Information You Provide:</strong> Name, email, optional
                profile info
              </li>
              <li style={{ marginBottom: "12px" }}>
                <strong>Automatically Collected:</strong> UUID, video events,
                IP, browser, etc.
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#000",
                marginBottom: "16px",
              }}
            >
              2. How We Use Your Information
            </h2>
            <p>
              To authenticate users, personalize content, track engagement,
              improve KalpX, and comply with legal obligations.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#000",
                marginBottom: "16px",
              }}
            >
              3. Data Sharing and Third Parties
            </h2>
            <p>
              We do <strong>not sell</strong> your data. We may share it with
              hosting, analytics, or legal entities as needed.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#000",
                marginBottom: "16px",
              }}
            >
              4. Cookies and Tracking
            </h2>
            <p>
              Used to remember your preferences, track engagement anonymously,
              and improve recommendations.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#000",
                marginBottom: "16px",
              }}
            >
              5. How We Protect Your Data
            </h2>
            <p>
              SSL, authentication controls, and limited access are used to keep
              your data safe.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#000",
                marginBottom: "16px",
              }}
            >
              6. Your Rights
            </h2>
            <p>
              You can access, update, or delete your data. Contact us any time.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#000",
                marginBottom: "16px",
              }}
            >
              7. Data Deletion
            </h2>
            <p>
              To delete your KalpX account and data, email us at{" "}
              <a
                href="mailto:support@kalpx.com"
                style={{ color: "#b8864b", textDecoration: "none", fontWeight: 600 }}
              >
                support@kalpx.com
              </a>{" "}
              with subject line: <strong>"Delete My KalpX Account"</strong>.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 700,
                color: "#000",
                marginBottom: "16px",
              }}
            >
              8. Contact Us
            </h2>
            <p>
              Email:{" "}
              <a
                href="mailto:support@kalpx.com"
                style={{ color: "#b8864b", textDecoration: "none", fontWeight: 600 }}
              >
                support@kalpx.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
