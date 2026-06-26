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

function ProgramRow({ program }: { program: GuideProgram }) {
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);

  const _origin = window.location.hostname === 'localhost' ? 'https://dev.kalpx.com' : window.location.origin;
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
        padding: "14px 16px",
        background: "var(--kalpx-surface)",
        border: "1px solid var(--kalpx-border)",
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
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
            {program.title}
          </p>
          <p
            style={{ fontSize: 12, color: "var(--kalpx-text-muted)", margin: 0 }}
          >
            {program.status}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexShrink: 0 }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--kalpx-text)", margin: 0 }}>
              {program.joined_count}
            </p>
            <p style={{ fontSize: 10, color: "var(--kalpx-text-muted)", margin: 0 }}>joined</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--kalpx-text)", margin: 0 }}>
              {program.testimonials_count}
            </p>
            <p style={{ fontSize: 10, color: "var(--kalpx-text-muted)", margin: 0 }}>testimonials</p>
          </div>
          {program.template_id && (
            <button
              onClick={() => navigate(`/guide/templates/${program.template_id}/review`)}
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
              View
            </button>
          )}
        </div>
      </div>

      {joinUrl && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "#F7F3ED",
            border: "1px solid var(--kalpx-border)",
            borderRadius: 8,
            padding: "8px 12px",
          }}
        >
          <p style={{ flex: 1, fontSize: 12, color: "#1d4ed8", margin: 0, wordBreak: "break-all", lineHeight: 1.4 }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
        if (!cancelled) setState({ kind: "loaded", data });
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
        style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px 80px" }}
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
              margin: 0,
            }}
          >
            Your Impact
          </h1>
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
                {/* Summary stats */}
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginBottom: 32,
                  }}
                >
                  <StatCard label="PROGRAMS" value={summary.programs_count} />
                  <StatCard
                    label="TOTAL JOINED"
                    value={summary.total_joined}
                  />
                  <StatCard label="SESSIONS" value={summary.sessions_count} />
                  <StatCard
                    label="TESTIMONIALS"
                    value={summary.testimonials_count}
                  />
                </div>

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
                      {data.programs.map((p) => (
                        <ProgramRow key={p.code} program={p} />
                      ))}
                    </div>
                  </section>
                )}

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
