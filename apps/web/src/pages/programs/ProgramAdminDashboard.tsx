import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../components/ui/AppShell";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../lib/api";

// ── Invite a Leader ────────────────────────────────────────────────────────────

function InviteLeaderSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    msg: string;
    inviteUrl?: string;
  } | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post<{ invite_url: string }>("ops/guide-invites/", {
        email: email.trim().toLowerCase(),
      });
      setResult({
        ok: true,
        msg: `Invite sent to ${email}`,
        inviteUrl: res.data.invite_url,
      });
      setEmail("");
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.email?.[0] ||
        "Failed to send invite.";
      setResult({ ok: false, msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={sectionCard}>
      <h3
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "var(--kalpx-text)",
          margin: "0 0 4px",
        }}
      >
        Invite a Leader
      </h3>
      <p
        style={{
          fontSize: 13,
          color: "var(--kalpx-text-soft)",
          margin: "0 0 14px",
        }}
      >
        Leaders receive an email with a link to create their account and access
        the Leader Portal.
      </p>
      <form
        onSubmit={handleInvite}
        style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="leader@example.com"
          required
          style={inputStyle}
        />
        <button type="submit" disabled={loading} style={ctaBtn}>
          {loading ? "Sending…" : "Send Invite"}
        </button>
      </form>
      {result && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            borderRadius: 8,
            background: result.ok ? "#f0fdf4" : "#fee2e2",
            color: result.ok ? "#166534" : "#991b1b",
            fontSize: 13,
          }}
        >
          {result.msg}
          {result.ok && result.inviteUrl && (
            <div style={{ marginTop: 6 }}>
              <span style={{ fontWeight: 600 }}>Invite URL (dev only): </span>
              <a
                href={result.inviteUrl}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#1d4ed8", wordBreak: "break-all" }}
              >
                {result.inviteUrl}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Program Review Queue with tabs ─────────────────────────────────────────────

interface ReviewTemplate {
  id: number;
  title: string;
  duration_days: number;
  language: string;
  review_status: string;
  submitted_at: string | null;
  guide_name: string;
  guide_email: string;
  desired_start_date: string | null;
  max_participants: number | null;
}

const TAB_STATUSES: Record<string, string[]> = {
  pending: ["submitted", "under_review"],
  approved: ["approved"],
  rejected: ["rejected", "changes_requested"],
};

const TAB_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_BADGE: Record<
  string,
  { color: string; bg: string; label: string }
> = {
  submitted: { color: "#0969da", bg: "#dbeafe", label: "In Review" },
  under_review: { color: "#0969da", bg: "#dbeafe", label: "Under Review" },
  approved: { color: "#16a34a", bg: "#dcfce7", label: "Approved" },
  rejected: { color: "#dc2626", bg: "#fee2e2", label: "Rejected" },
  changes_requested: {
    color: "#d97706",
    bg: "#fef3c7",
    label: "Changes Requested",
  },
};

function ProgramReviewQueue() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "pending" | "approved" | "rejected"
  >("pending");
  const [allTemplates, setAllTemplates] = useState<ReviewTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejectOpen, setRejectOpen] = useState<Record<number, boolean>>({});
  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    // Fetch all non-draft templates in one call
    api
      .get(
        "ops/pending-templates/?status=submitted&status=under_review&status=approved&status=rejected&status=changes_requested",
      )
      .then((res) => setAllTemplates(res.data?.templates ?? []))
      .catch(() => setError("Failed to load programs."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const doAction = async (
    id: number,
    action: "approve" | "request_changes" | "reject",
  ) => {
    setActionLoading(id);
    try {
      await api.post(`ops/pending-templates/${id}/`, {
        action,
        notes: remarks[id] ?? "",
      });
      // Refresh full list so tabs stay accurate
      const res = await api.get(
        "ops/pending-templates/?status=submitted&status=under_review&status=approved&status=rejected&status=changes_requested",
      );
      setAllTemplates(res.data?.templates ?? []);
      setRejectOpen((r) => {
        const n = { ...r };
        delete n[id];
        return n;
      });
    } catch {
      alert("Action failed. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const visibleTemplates = allTemplates.filter((t) =>
    TAB_STATUSES[activeTab].includes(t.review_status),
  );

  const countFor = (tab: string) =>
    allTemplates.filter((t) => TAB_STATUSES[tab].includes(t.review_status))
      .length;

  return (
    <>
      {/* Tab bar */}
      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 20,
          borderBottom: "2px solid var(--kalpx-border)",
        }}
      >
        {(["pending", "approved", "rejected"] as const).map((tab) => {
          const count = countFor(tab);
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "8px 16px",
                background: "none",
                border: "none",
                borderBottom: isActive
                  ? "2px solid #C99317"
                  : "2px solid transparent",
                marginBottom: -2,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "#C99317" : "var(--kalpx-text-muted)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {TAB_LABELS[tab]}
              {count > 0 && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    background:
                      tab === "pending"
                        ? "#fee2e2"
                        : tab === "approved"
                          ? "#dcfce7"
                          : "#f3f4f6",
                    color:
                      tab === "pending"
                        ? "#991b1b"
                        : tab === "approved"
                          ? "#166534"
                          : "#6b7280",
                    padding: "1px 6px",
                    borderRadius: 10,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div
          style={{
            padding: "40px 0",
            textAlign: "center",
            color: "var(--kalpx-text-muted)",
          }}
        >
          Loading…
        </div>
      ) : error ? (
        <div
          style={{
            padding: "14px 16px",
            background: "#fee2e2",
            borderRadius: 8,
            color: "#991b1b",
            fontSize: 13,
          }}
        >
          {error}
        </div>
      ) : visibleTemplates.length === 0 ? (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            border: "1px dashed var(--kalpx-border)",
            borderRadius: 12,
            color: "var(--kalpx-text-muted)",
            fontSize: 14,
          }}
        >
          No {TAB_LABELS[activeTab].toLowerCase()} programs.
        </div>
      ) : (
        <div
          style={{ display: "flex", flexDirection: "column" as const, gap: 14 }}
        >
          {visibleTemplates.map((t) => {
            const badge = STATUS_BADGE[t.review_status] ?? {
              color: "#8B6F4E",
              bg: "#f5f0e8",
              label: t.review_status,
            };
            const submittedAt = t.submitted_at
              ? new Date(t.submitted_at).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—";
            const isRejecting = !!rejectOpen[t.id];
            const busy = actionLoading === t.id;

            return (
              <div
                key={t.id}
                style={{
                  ...reviewCard,
                  borderColor:
                    activeTab === "approved"
                      ? "#bbf7d0"
                      : activeTab === "rejected"
                        ? "#fecaca"
                        : "#FDE68A",
                }}
              >
                {/* Info row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "var(--kalpx-text)",
                        margin: "0 0 4px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.title || "Untitled Program"}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--kalpx-text-soft)",
                        margin: "0 0 2px",
                      }}
                    >
                      {t.guide_name}
                      {t.guide_email ? ` · ${t.guide_email}` : ""}
                    </p>
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--kalpx-text-muted)",
                        margin: 0,
                      }}
                    >
                      {/* {t.duration_days} days · {t.language.toUpperCase()} · Submitted {submittedAt} */}
                      {t.desired_start_date && (
                        <>
                          {" "}
                          Start Date:{" "}
                          {new Date(t.desired_start_date).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </>
                      )}
                      {t.max_participants && (
                        <> ·Maximum Participants: {t.max_participants} people</>
                      )}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: badge.color,
                      background: badge.bg,
                      padding: "3px 10px",
                      borderRadius: 12,
                      flexShrink: 0,
                    }}
                  >
                    {badge.label.toUpperCase()}
                  </span>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 14,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    onClick={() => navigate(`/ops/templates/${t.id}/review`)}
                    style={outlineBtn}
                  >
                    View Details
                  </button>
                  {activeTab === "pending" && (
                    <>
                      <button
                        disabled={busy || isRejecting}
                        onClick={() => doAction(t.id, "approve")}
                        style={{
                          ...actionBtn,
                          background: "#16a34a",
                          opacity: busy || isRejecting ? 0.5 : 1,
                        }}
                      >
                        {busy && !isRejecting ? "Approving…" : "Approve"}
                      </button>
                      <button
                        disabled={busy}
                        onClick={() =>
                          setRejectOpen((r) => ({ ...r, [t.id]: !r[t.id] }))
                        }
                        style={{
                          ...actionBtn,
                          background: isRejecting ? "#6b7280" : "#dc2626",
                          opacity: busy ? 0.5 : 1,
                        }}
                      >
                        {isRejecting ? "Cancel" : "Reject"}
                      </button>
                    </>
                  )}
                  {/* {activeTab === 'approved' && (
                    <button
                      disabled={busy}
                      onClick={() => doAction(t.id, 'request_changes')}
                      style={{ ...actionBtn, background: '#d97706', opacity: busy ? 0.5 : 1 }}>
                      Request Changes
                    </button>
                  )} */}
                  {activeTab === "rejected" && (
                    <button
                      disabled={busy}
                      onClick={() => doAction(t.id, "approve")}
                      style={{
                        ...actionBtn,
                        background: "#16a34a",
                        opacity: busy ? 0.5 : 1,
                      }}
                    >
                      Approve
                    </button>
                  )}
                </div>

                {/* Reject remarks */}
                {isRejecting && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: "12px 14px",
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: 8,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#991b1b",
                        margin: "0 0 8px",
                      }}
                    >
                      Rejection remarks (required — shown to leader):
                    </p>
                    <textarea
                      rows={3}
                      value={remarks[t.id] ?? ""}
                      onChange={(e) =>
                        setRemarks((r) => ({ ...r, [t.id]: e.target.value }))
                      }
                      placeholder="Explain what needs to be changed or why this is being rejected…"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        border: "1px solid #fca5a5",
                        borderRadius: 7,
                        fontSize: 13,
                        resize: "vertical" as const,
                        fontFamily: "inherit",
                        background: "#fff",
                        boxSizing: "border-box" as const,
                        color: "#1f2937",
                        outline: "none",
                      }}
                    />
                    <button
                      disabled={busy || !(remarks[t.id] ?? "").trim()}
                      onClick={() => doAction(t.id, "reject")}
                      style={{
                        ...actionBtn,
                        background: "#dc2626",
                        marginTop: 8,
                        opacity:
                          busy || !(remarks[t.id] ?? "").trim() ? 0.5 : 1,
                      }}
                    >
                      {busy ? "Rejecting…" : "Confirm Reject"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export function ProgramAdminDashboard() {
  const { logout } = useAuth();

  return (
    <AppShell>
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
        style={{ maxWidth: 780, margin: "0 auto", padding: "32px 20px 80px" }}
      >
        <header style={{ marginBottom: 28 }}>
          <p
            style={{
              fontSize: 11,
              color: "var(--kalpx-text-muted)",
              letterSpacing: "0.05em",
              marginBottom: 4,
              fontWeight: 600,
            }}
          >
            OPS DASHBOARD
          </p>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--kalpx-text)",
              margin: 0,
            }}
          >
            Program Review Queue
          </h1>
        </header>

        <InviteLeaderSection />

        <ProgramReviewQueue />
      </main>
    </AppShell>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const sectionCard: React.CSSProperties = {
  background: "var(--kalpx-card-bg)",
  border: "1px solid var(--kalpx-border)",
  borderRadius: 10,
  padding: "18px 20px",
  marginBottom: 28,
};
const inputStyle: React.CSSProperties = {
  flex: "1 1 240px",
  padding: "9px 14px",
  border: "1px solid var(--kalpx-border)",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  background: "var(--kalpx-bg)",
  color: "var(--kalpx-text)",
};
const ctaBtn: React.CSSProperties = {
  padding: "9px 20px",
  background: "var(--kalpx-cta)",
  color: "var(--kalpx-cta-text)",
  border: "none",
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 14,
  cursor: "pointer",
};
const reviewCard: React.CSSProperties = {
  background: "var(--kalpx-card-bg)",
  border: "1px solid #FDE68A",
  borderRadius: 10,
  padding: "16px 18px",
};
const outlineBtn: React.CSSProperties = {
  padding: "7px 16px",
  border: "1px solid var(--kalpx-border)",
  background: "none",
  color: "var(--kalpx-text-soft)",
  borderRadius: 7,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};
const actionBtn: React.CSSProperties = {
  padding: "7px 16px",
  border: "none",
  color: "#fff",
  borderRadius: 7,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};
