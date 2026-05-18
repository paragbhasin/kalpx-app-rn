import { ChevronLeft } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../components/ui";

export function DataDeletionPage() {
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
            Data Deletion
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
            KalpX respects your privacy and gives you full control over your
            data. If you'd like to delete your account and remove your personal
            information from our platform, please follow the steps below.
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
              How to Delete Your KalpX Account
            </h2>
            <ol style={{ paddingLeft: "20px", marginBottom: "16px" }}>
              <li style={{ marginBottom: "12px" }}>
                Log in to your KalpX account.
              </li>
              <li style={{ marginBottom: "12px" }}>
                Go to <strong>Profile</strong>.
              </li>
              <li style={{ marginBottom: "12px" }}>
                Click on <strong>Delete Account</strong>.
              </li>
            </ol>
            <p>
              {" "}
              Alternatively, you can email us directly to request data deletion.
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
              Email Request
            </h2>
            <p style={{ marginBottom: "12px" }}>
              Send an email to{" "}
              <a
                href="mailto:privacy@kalpx.com"
                style={{ color: "#b8864b", textDecoration: "none", fontWeight: 600 }}
              >
                privacy@kalpx.com
              </a>{" "}
              with the subject line: <strong>“Delete My KalpX Account”</strong>.
            </p>
            <p>
              We will process your request and permanently delete your data
              generally within 30 days of a verified request. Backup copies may
              persist for 30&ndash;90 days through normal backup rotation. Some
              data may remain in anonymized or aggregated form.
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
              What Gets Deleted
            </h2>
            <ul style={{ paddingLeft: "20px", listStyleType: "disc" }}>
              <li style={{ marginBottom: "12px" }}>
                Your account and login credentials
              </li>
              <li style={{ marginBottom: "12px" }}>
                Personal profile data (age group, preferences)
              </li>
              <li style={{ marginBottom: "12px" }}>
                Viewing history and engagement logs
              </li>
              <li style={{ marginBottom: "12px" }}>
                All associated analytics data tied to your user ID
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
              Questions?
            </h2>
            <p>
              If you have any questions or concerns about your data or this
              process, please contact us at{" "}
              <a
                href="mailto:privacy@kalpx.com"
                style={{ color: "#b8864b", textDecoration: "none", fontWeight: 600 }}
              >
                privacy@kalpx.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
