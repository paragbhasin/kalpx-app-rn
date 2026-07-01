import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "../../components/ui/AppShell";
import {
  fetchGuideDashboard,
  type GuideDashboard,
  type GuideDashboardTemplate,
  type GuideProgram,
  type GuideSession,
} from "../../engine/liveSessionApi";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../lib/api";

type LoadState =
  | { kind: "loading" }
  | { kind: "loaded"; data: GuideDashboard }
  | { kind: "auth_required" }
  | { kind: "error" };

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div
      style={{
        padding: "16px",
        background: "var(--kalpx-surface)",
        border: "1px solid var(--kalpx-border)",
        borderRadius: 10,
        flex: "1 1 0",
        minWidth: 100,
      }}
    >
      <p
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "var(--kalpx-text)",
          margin: "0 0 4px",
        }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: 11,
          color: "var(--kalpx-text-muted)",
          margin: 0,
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </p>
    </div>
  );
}

function ImpactCard({
  icon,
  iconBg,
  value,
  label,
  sublabel,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: number | string;
  label: string;
  sublabel: string;
}) {
  return (
    <div
      style={{
        padding: "16px",
        background: "var(--kalpx-surface)",
        border: "1px solid var(--kalpx-border)",
        borderRadius: 12,
        flex: "1 1 100px",
        minWidth: 100,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--kalpx-text)",
            margin: "0 0 2px",
          }}
        >
          {value}
        </p>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--kalpx-text)",
            margin: "0 0 2px",
          }}
        >
          {label}
        </p>
        <p
          style={{ fontSize: 11, color: "var(--kalpx-text-muted)", margin: 0 }}
        >
          {sublabel}
        </p>
      </div>
    </div>
  );
}

const CARD_GRADIENTS = [
  "linear-gradient(135deg, #F7C97E 0%, #E8956A 100%)",
  "linear-gradient(135deg, #4A7B9D 0%, #1A3E5A 100%)",
  "linear-gradient(135deg, #7B9D7B 0%, #3A5A3A 100%)",
  "linear-gradient(135deg, #9D7B4A 0%, #5A3A1A 100%)",
  "linear-gradient(135deg, #7B6A9D 0%, #3A2A5A 100%)",
];

function ProgramRow({
  program,
  index,
}: {
  program: GuideProgram;
  index: number;
}) {
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);

  const _origin =
    window.location.hostname === "localhost"
      ? "https://dev.kalpx.com"
      : window.location.origin;
  const joinUrl = program.join_url
    ? program.join_url.replace("https://kalpx.com", _origin)
    : null;

  const handleCopy = () => {
    if (!joinUrl) return;
    navigator.clipboard.writeText(joinUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      style={{
        background: "var(--kalpx-surface)",
        border: "1px solid var(--kalpx-border)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* Top row: title/meta + metrics + view */}
      <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
        {/* Content */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {/* Title + View button */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--kalpx-text)",
                margin: 0,
                flex: 1,
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {program.title}
            </p>
            {program.template_id && (
              <button
                onClick={() =>
                  navigate(`/guide/templates/${program.template_id}/review`)
                }
                style={{
                  padding: "4px 12px",
                  border: "1px solid var(--kalpx-border)",
                  background: "none",
                  color: "var(--kalpx-text-muted)",
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                View
              </button>
            )}
          </div>

          {/* Status + start date + max */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              flexWrap: "wrap" as const,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: "#22863a" }}>
              •{" "}
              {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
            </span>
            <span style={{ fontSize: 11, color: "var(--kalpx-text-muted)" }}>
              · Start Date:{" "}
              {program.start_date
                ? new Date(program.start_date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Not set"}
            </span>
            <span style={{ fontSize: 11, color: "var(--kalpx-text-muted)" }}>
              · Maximum Participants:{" "}
              {program.max_participants
                ? `${program.max_participants} people`
                : "Unlimited"}
            </span>
          </div>

          {/* Joined / Active / Completed metrics */}
          <div
            style={{
              display: "flex",
              gap: 20,
              flexWrap: "wrap" as const,
              marginTop: 2,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8B6F4E"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--kalpx-text)",
                }}
              >
                {program.joined_count}
              </span>
              <span style={{ fontSize: 11, color: "var(--kalpx-text-muted)" }}>
                Joined
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0969da"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--kalpx-text)",
                }}
              >
                {program.active_count ?? 0}
              </span>
              <span style={{ fontSize: 11, color: "var(--kalpx-text-muted)" }}>
                Active
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#22863a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--kalpx-text)",
                }}
              >
                {program.completed_count ?? 0}
              </span>
              <span style={{ fontSize: 11, color: "var(--kalpx-text-muted)" }}>
                Completed
              </span>
            </div>
            {program.testimonials_count > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#d97706"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--kalpx-text)",
                  }}
                >
                  {program.testimonials_count}
                </span>
                <span
                  style={{ fontSize: 11, color: "var(--kalpx-text-muted)" }}
                >
                  Testimonials
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Join URL row */}
      {joinUrl && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#F7F3ED",
            borderTop: "1px solid var(--kalpx-border)",
            padding: "8px 14px",
          }}
        >
          <p
            style={{
              flex: 1,
              fontSize: 12,
              color: "#1d4ed8",
              margin: 0,
              wordBreak: "break-all",
              lineHeight: 1.4,
            }}
          >
            {joinUrl}
          </p>
          <button
            onClick={handleCopy}
            style={{
              flexShrink: 0,
              padding: "4px 12px",
              background: copied ? "#22863a" : "var(--kalpx-gold)",
              border: "none",
              color: "#fff",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}

function SessionRow({ session }: { session: GuideSession }) {
  const date = (() => {
    try {
      return new Date(session.scheduled_at).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return session.scheduled_at;
    }
  })();

  return (
    <div
      style={{
        padding: "14px 16px",
        background: "var(--kalpx-surface)",
        border: "1px solid var(--kalpx-border)",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--kalpx-text)",
            margin: "0 0 2px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {session.title}
        </p>
        <p
          style={{ fontSize: 12, color: "var(--kalpx-text-muted)", margin: 0 }}
        >
          {date} · {session.status}
        </p>
      </div>
      <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
        <div style={{ textAlign: "right" }}>
          <p
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--kalpx-text)",
              margin: 0,
            }}
          >
            {session.registered_count > 0 ? session.registered_count : "—"}
          </p>
          <p
            style={{
              fontSize: 10,
              color: "var(--kalpx-text-muted)",
              margin: 0,
            }}
          >
            registered
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "var(--kalpx-text)",
              margin: 0,
            }}
          >
            {session.reflection_count}
          </p>
          <p
            style={{
              fontSize: 10,
              color: "var(--kalpx-text-muted)",
              margin: 0,
            }}
          >
            reflected
          </p>
        </div>
      </div>
    </div>
  );
}

const STATUS_COLOR: Record<string, string> = {
  draft: "#8B6F4E",
  submitted: "#0969da",
  under_review: "#0969da",
  changes_requested: "#d97706",
  approved: "#22863a",
  rejected: "#C0392B",
  active: "#22863a",
};

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  submitted: "In Review",
  under_review: "Under Review",
  changes_requested: "Changes Requested",
  approved: "Approved",
  rejected: "Rejected",
  active: "Active",
};

function TemplateRow({
  tmpl,
  onEdit,
  onView,
  onLaunched,
}: {
  tmpl: GuideDashboardTemplate;
  onEdit: (id: number) => void;
  onView: (id: number) => void;
  onLaunched: (joinUrl: string, code: string) => void;
}) {
  const color = STATUS_COLOR[tmpl.review_status] ?? "#8B6F4E";
  const label = STATUS_LABEL[tmpl.review_status] ?? tmpl.review_status;
  const [launching, setLaunching] = React.useState(false);
  const [launchError, setLaunchError] = React.useState("");

  const withinGrace = (() => {
    if (!tmpl.submitted_at) return false;
    const diffMs = Date.now() - new Date(tmpl.submitted_at).getTime();
    return diffMs < 60 * 60 * 1000;
  })();

  const handleLaunch = async () => {
    setLaunching(true);
    setLaunchError("");
    try {
      const res = await api.post<{ code: string; join_url: string }>(
        `guide/my-templates/${tmpl.id}/launch/`,
      );
      onLaunched(res.data.join_url, res.data.code);
    } catch (err: any) {
      setLaunchError(
        err?.response?.data?.detail || "Launch failed. Please try again.",
      );
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div
      style={{
        padding: "14px 16px",
        background: "var(--kalpx-surface)",
        border: "1px solid var(--kalpx-border)",
        borderRadius: 10,
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
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--kalpx-text)",
              margin: "0 0 4px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {tmpl.title || "Untitled Program"}
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap" as const,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color,
                textTransform: "uppercase" as const,
                letterSpacing: "0.06em",
              }}
            >
              {label}
            </span>
            <span style={{ fontSize: 11, color: "var(--kalpx-text-muted)" }}>
              · {tmpl.duration_days} days
            </span>
            <button
              onClick={() => onView(tmpl.id)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: 11,
                color: tmpl.desired_start_date
                  ? "var(--kalpx-text-muted)"
                  : "var(--kalpx-gold)",
                fontWeight: tmpl.desired_start_date ? 400 : 600,
                textDecoration: tmpl.desired_start_date ? "none" : "underline",
              }}
            >
              · Start Date:{" "}
              {tmpl.desired_start_date
                ? new Date(tmpl.desired_start_date).toLocaleDateString(
                    "en-IN",
                    { day: "numeric", month: "short", year: "numeric" },
                  )
                : "Set date →"}
            </button>
            <button
              onClick={() => onView(tmpl.id)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: 11,
                color: tmpl.max_participants
                  ? "var(--kalpx-text-muted)"
                  : "var(--kalpx-gold)",
                fontWeight: tmpl.max_participants ? 400 : 600,
                textDecoration: tmpl.max_participants ? "none" : "underline",
              }}
            >
              · Maximum Participants:{" "}
              {tmpl.max_participants
                ? `${tmpl.max_participants} people`
                : "Set limit →"}
            </button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {withinGrace && (
            <button
              onClick={() => onEdit(tmpl.id)}
              style={{
                padding: "6px 14px",
                border: "1px solid var(--kalpx-gold)",
                background: "none",
                color: "var(--kalpx-gold)",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Edit
            </button>
          )}
          {tmpl.review_status === "approved" && (
            <button
              onClick={handleLaunch}
              disabled={launching}
              style={{
                padding: "6px 18px",
                background: "var(--kalpx-gold)",
                border: "none",
                color: "#fff",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                cursor: launching ? "default" : "pointer",
                opacity: launching ? 0.7 : 1,
              }}
            >
              {launching ? "Launching…" : "🚀 Launch"}
            </button>
          )}
          <button
            onClick={() => onView(tmpl.id)}
            style={{
              padding: "6px 14px",
              border: "1px solid var(--kalpx-border)",
              background: "none",
              color: "var(--kalpx-text-muted)",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            View Details
          </button>
        </div>
      </div>
      {launchError && (
        <p style={{ fontSize: 12, color: "#C0392B", margin: "8px 0 0" }}>
          {launchError}
        </p>
      )}
    </div>
  );
}

export function GuideDashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [launchResult, setLaunchResult] = useState<{
    joinUrl: string;
    code: string;
  } | null>(null);

  useEffect(() => {
    document.title = "Guide Dashboard — KalpX";
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchGuideDashboard();
        if (cancelled) return;
        if (!data?.summary) {
          setState({ kind: "error" });
          return;
        }
        setState({ kind: "loaded", data });
      } catch (e: any) {
        if (!cancelled) {
          setState(
            e?.response?.status === 403
              ? { kind: "auth_required" }
              : { kind: "error" },
          );
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell>
      {/* Portal top bar */}
      <div
        style={{
          height: 56,
          borderBottom: "1px solid var(--kalpx-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          background: "var(--kalpx-bg)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <img
          src="/kalpx-logo.png"
          alt="KalpX"
          style={{ height: 30, width: "auto", marginTop: 8 }}
        />
        <button
          onClick={logout}
          style={{
            background: "none",
            border: "1px solid var(--kalpx-border)",
            borderRadius: 8,
            padding: "6px 14px",
            fontSize: 13,
            color: "var(--kalpx-text-muted)",
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>
      <main
        style={{
          maxWidth: 1500,
          margin: "5px 250px",
          padding: "32px 20px 80px",
        }}
      >
        <header style={{ marginBottom: 28 }}>
          <p
            style={{
              fontSize: 11,
              color: "var(--kalpx-text-muted)",
              letterSpacing: "0.05em",
              marginBottom: 6,
              fontWeight: 600,
            }}
          >
            GUIDE DASHBOARD
          </p>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--kalpx-text)",
              margin: "0 0 4px",
            }}
          >
            Your Impact at a Glance
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--kalpx-text-muted)",
              margin: 0,
            }}
          >
            Here's how your programs are transforming lives.
          </p>
        </header>

        {state.kind === "loading" && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "var(--kalpx-text-muted)",
            }}
          >
            Loading…
          </div>
        )}

        {state.kind === "auth_required" && (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <p style={{ color: "var(--kalpx-text-muted)", marginBottom: 16 }}>
              You need to be a verified guide to view this dashboard.
            </p>
            <Link
              to="/guide/login"
              style={{ color: "var(--kalpx-gold)", fontSize: 14 }}
            >
              Sign in →
            </Link>
          </div>
        )}

        {state.kind === "error" && (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "var(--kalpx-text-muted)",
            }}
          >
            Could not load dashboard. Please try again.
          </div>
        )}

        {state.kind === "loaded" &&
          (() => {
            const { data } = state;
            const { summary } = data;
            return (
              <>
                {/* Summary impact cards */}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginBottom: 32,
                  }}
                >
                  <ImpactCard
                    iconBg="#FEF3C7"
                    icon={
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#D97706"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                      </svg>
                    }
                    value={summary.programs_count}
                    label="Programs"
                    sublabel="Live programs"
                  />
                  <ImpactCard
                    iconBg="#D1FAE5"
                    icon={
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#059669"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    }
                    value={summary.total_joined}
                    label="Total Participants"
                    sublabel="Across all programs"
                  />
                  <ImpactCard
                    iconBg="#DBEAFE"
                    icon={
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                    }
                    value={summary.active_count_total ?? 0}
                    label="Active"
                    sublabel="Started the program"
                  />
                  <ImpactCard
                    iconBg="#EDE9FE"
                    icon={
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#7C3AED"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="9 12 11 14 15 10" />
                      </svg>
                    }
                    value={`${summary.completion_rate ?? 0}%`}
                    label="Completion Rate"
                    sublabel="Overall"
                  />
                  <ImpactCard
                    iconBg="#FFE4E6"
                    icon={
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#E11D48"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    }
                    value={summary.testimonials_count}
                    label="Testimonials"
                    sublabel="Received"
                  />
                </div>
                {/* {data.programs.length > 0 &&
                  (() => {
                    const totalJoined = summary.total_joined;
                    const totalActive = summary.active_count_total ?? 0;
                    const totalCompleted = summary.completed_count_total ?? 0;
                    const inProgress = Math.max(
                      0,
                      totalActive - totalCompleted,
                    );
                    const notStarted = Math.max(0, totalJoined - totalActive);
                    return (
                      <section style={{ marginBottom: 32 }}>
                        <div
                          style={{
                            padding: "16px 20px",
                            background: "var(--kalpx-surface)",
                            border: "1px solid var(--kalpx-border)",
                            borderRadius: 12,
                            display: "flex",
                            flexWrap: "wrap" as const,
                            gap: 20,
                            alignItems: "center",
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 160 }}>
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "var(--kalpx-text)",
                                margin: "0 0 2px",
                              }}
                            >
                              Participation Overview
                            </p>
                            <p
                              style={{
                                fontSize: 11,
                                color: "var(--kalpx-text-muted)",
                                margin: 0,
                              }}
                            >
                              Activity across all your programs
                            </p>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              gap: 28,
                              flexWrap: "wrap" as const,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  background: "#D1FAE5",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#059669"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="9 12 11 14 15 10" />
                                </svg>
                              </div>
                              <div>
                                <p
                                  style={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    color: "var(--kalpx-text)",
                                    margin: 0,
                                  }}
                                >
                                  {totalCompleted}
                                </p>
                                <p
                                  style={{
                                    fontSize: 10,
                                    color: "var(--kalpx-text-muted)",
                                    margin: 0,
                                  }}
                                >
                                  Completed
                                </p>
                              </div>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  background: "#FEF3C7",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#D97706"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                </svg>
                              </div>
                              <div>
                                <p
                                  style={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    color: "var(--kalpx-text)",
                                    margin: 0,
                                  }}
                                >
                                  {inProgress}
                                </p>
                                <p
                                  style={{
                                    fontSize: 10,
                                    color: "var(--kalpx-text-muted)",
                                    margin: 0,
                                  }}
                                >
                                  In Progress
                                </p>
                              </div>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  background: "#F3F4F6",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#9CA3AF"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                  <circle cx="9" cy="7" r="4" />
                                </svg>
                              </div>
                              <div>
                                <p
                                  style={{
                                    fontSize: 18,
                                    fontWeight: 700,
                                    color: "var(--kalpx-text)",
                                    margin: 0,
                                  }}
                                >
                                  {notStarted}
                                </p>
                                <p
                                  style={{
                                    fontSize: 10,
                                    color: "var(--kalpx-text-muted)",
                                    margin: 0,
                                  }}
                                >
                                  Not Started
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                    );
                  })()} */}

                {/* CTA row */}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginBottom: 32,
                    flexWrap: "wrap",
                  }}
                >
                  <Link
                    to="/guide/templates"
                    style={{
                      padding: "10px 18px",
                      background: "var(--kalpx-gold)",
                      color: "#fff",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    + Build a Program
                  </Link>
                  <Link
                    to="/guide/sessions/draft"
                    style={{
                      padding: "10px 18px",
                      border: "1px solid var(--kalpx-gold)",
                      color: "var(--kalpx-gold)",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    + Schedule Session
                  </Link>
                  {/* <Link to="/guide/programs/draft"
                  style={{ padding: '10px 18px', border: '1px solid #DDD3C0',
                    color: '#8B6F4E', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    textDecoration: 'none' }}>
                  Submit Free-form Draft
                </Link> */}
                </div>

                {/* My Programs in review pipeline (submitted / under_review / approved / changes_requested) */}
                {(() => {
                  const pipeline = (data.my_templates ?? []).filter((t) =>
                    [
                      "submitted",
                      "under_review",
                      "approved",
                      "changes_requested",
                    ].includes(t.review_status),
                  );
                  if (!pipeline.length) return null;
                  return (
                    <section style={{ marginBottom: 32 }}>
                      <p
                        style={{
                          fontSize: 11,
                          letterSpacing: "0.05em",
                          color: "var(--kalpx-text-muted)",
                          marginBottom: 12,
                          fontWeight: 600,
                        }}
                      >
                        MY PROGRAMS
                      </p>
                      {launchResult && (
                        <div
                          style={{
                            marginBottom: 12,
                            padding: "14px 16px",
                            background: "#f0fdf4",
                            border: "1px solid #86efac",
                            borderRadius: 10,
                          }}
                        >
                          <p
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#166534",
                              margin: "0 0 6px",
                            }}
                          >
                            Program launched! Share this link with your
                            community:
                          </p>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              flexWrap: "wrap",
                            }}
                          >
                            <a
                              href={launchResult.joinUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                fontSize: 13,
                                color: "#1d4ed8",
                                wordBreak: "break-all",
                              }}
                            >
                              {launchResult.joinUrl}
                            </a>
                            <button
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  launchResult.joinUrl,
                                )
                              }
                              style={{
                                padding: "4px 12px",
                                background: "var(--kalpx-gold)",
                                border: "none",
                                color: "#fff",
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: "pointer",
                                flexShrink: 0,
                              }}
                            >
                              Copy link
                            </button>
                          </div>
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        {pipeline.map((t) => (
                          <TemplateRow
                            key={t.id}
                            tmpl={t}
                            onEdit={(id) =>
                              navigate(`/guide/templates/${id}/edit`)
                            }
                            onView={(id) =>
                              navigate(`/guide/templates/${id}/review`)
                            }
                            onLaunched={(joinUrl, code) =>
                              setLaunchResult({ joinUrl, code })
                            }
                          />
                        ))}
                      </div>
                    </section>
                  );
                })()}

                {/* Live Programs (campaigns) */}
                {data.programs.length > 0 && (
                  <section style={{ marginBottom: 32 }}>
                    <p
                      style={{
                        fontSize: 11,
                        letterSpacing: "0.05em",
                        color: "var(--kalpx-text-muted)",
                        marginBottom: 12,
                        fontWeight: 600,
                      }}
                    >
                      LIVE PROGRAMS
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {data.programs.map((p, i) => (
                        <ProgramRow key={p.code} program={p} index={i} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Today at a Glance */}

                {/* Upcoming sessions */}
                {data.upcoming_sessions.length > 0 && (
                  <section>
                    <p
                      style={{
                        fontSize: 11,
                        letterSpacing: "0.05em",
                        color: "var(--kalpx-text-muted)",
                        marginBottom: 12,
                        fontWeight: 600,
                      }}
                    >
                      UPCOMING SESSIONS
                    </p>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      {data.upcoming_sessions.map((s) => (
                        <SessionRow key={s.code} session={s} />
                      ))}
                    </div>
                  </section>
                )}

                {data.programs.length === 0 &&
                  data.upcoming_sessions.length === 0 &&
                  (data.my_templates ?? []).filter((t) =>
                    [
                      "submitted",
                      "under_review",
                      "approved",
                      "changes_requested",
                    ].includes(t.review_status),
                  ).length === 0 && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px 0",
                        border: "1px dashed var(--kalpx-border)",
                        borderRadius: 12,
                      }}
                    >
                      <p
                        style={{
                          color: "var(--kalpx-text-muted)",
                          fontSize: 14,
                          marginBottom: 12,
                        }}
                      >
                        No programs or sessions yet.
                      </p>
                      <Link
                        to="/guide/programs/draft"
                        style={{
                          color: "var(--kalpx-gold)",
                          fontSize: 14,
                          fontWeight: 600,
                        }}
                      >
                        Submit your first program →
                      </Link>
                    </div>
                  )}
              </>
            );
          })()}
      </main>
    </AppShell>
  );
}
