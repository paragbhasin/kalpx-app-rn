import { ChevronLeft } from "lucide-react";
import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppShell } from "../../components/ui";

export function TermsPage() {
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
            Terms of Service
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
            Welcome to KalpX ("we", "our", or "us"). By accessing KalpX via our
            website or mobile platform, you agree to the following Terms of
            Service.
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
              1. Use of KalpX
            </h2>
            <p style={{ marginBottom: "12px" }}>
              KalpX provides cultural and educational video content rooted in
              Sanatan Dharma and Indian traditions. You may browse as a guest or
              register an account.
            </p>
            <ul style={{ paddingLeft: "20px", listStyleType: "disc" }}>
              <li style={{ marginBottom: "12px" }}>Use KalpX lawfully</li>
              <li style={{ marginBottom: "12px" }}>
                Don’t copy or misuse platform content
              </li>
              <li style={{ marginBottom: "12px" }}>
                Do not upload harmful or illegal content
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
              2. User Accounts
            </h2>
            <p>
              You may register using email or supported social login. You're
              responsible for account security and activities under your login.
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
              3. Content and Intellectual Property
            </h2>
            <p>
              All KalpX content is protected. You may not reproduce or
              distribute content without permission.
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
              4. Age and Eligibility
            </h2>
            <p>
              KalpX is for all age groups. Children under 13 must use it with
              parental consent.
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
              5. Privacy
            </h2>
            <p>
              Your use of KalpX is governed by our{" "}
              <Link
                to="/en/privacy"
                style={{
                  color: "#b8864b",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Privacy Policy
              </Link>
              .
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
              6. Termination
            </h2>
            <p style={{ marginBottom: "12px" }}>
              You may delete your account anytime. KalpX may suspend accounts
              that violate our terms.
            </p>
            <p>
              To request data deletion, email{" "}
              <a
                href="mailto:support@kalpx.com"
                style={{
                  color: "#b8864b",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                support@kalpx.com
              </a>{" "}
              with the subject: <strong>"Delete My KalpX Account"</strong>.
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
              7. Disclaimers
            </h2>
            <p>
              KalpX content is for educational and entertainment purposes. We do
              not guarantee accuracy or uninterrupted access.
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
              8. Limitation of Liability
            </h2>
            <p>
              KalpX is not liable for indirect damages, data loss, or service
              interruptions.
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
              9. Governing Law
            </h2>
            <p>
              These terms are governed by California law. Disputes will be
              resolved in Los Angeles County.
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
              10. Contact Us
            </h2>
            <p>
              Email:{" "}
              <a
                href="mailto:support@kalpx.com"
                style={{
                  color: "#b8864b",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
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
