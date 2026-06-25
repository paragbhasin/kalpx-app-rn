import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  cloneOfficialTemplate,
  createBlankTemplate,
  fetchOfficialTemplates,
  OfficialTemplate,
} from "../../engine/liveSessionApi";

export function GuideTemplateBrowserPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<OfficialTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState<string | null>(null);
  const [showBlank, setShowBlank] = useState(false);
  const [blankTitle, setBlankTitle] = useState("");
  const [blankDays, setBlankDays] = useState("7");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOfficialTemplates()
      .then((res) => setTemplates(res.templates))
      .catch(() => setError("Could not load templates. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  async function handleClone(slug: string) {
    setCloning(slug);
    setError("");
    try {
      const tmpl = await cloneOfficialTemplate(slug);
      navigate(`/guide/templates/${tmpl.id}/edit`);
    } catch {
      setError("Could not start template. Please try again.");
    } finally {
      setCloning(null);
    }
  }

  async function handleCreateBlank() {
    if (!blankTitle.trim()) return;
    setCreating(true);
    setError("");
    try {
      const tmpl = await createBlankTemplate({
        title: blankTitle.trim(),
        duration_days: parseInt(blankDays, 10) || 7,
      });
      navigate(`/guide/templates/${tmpl.id}/edit`);
    } catch {
      setError("Could not create template. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div style={page}>
      <div style={inner}>
        {/* Back */}
        <button onClick={() => navigate("/guide/dashboard")} style={backBtn}>← Guide Dashboard</button>

        {/* Header */}
        <div style={headerBlock}>
          <p style={eyebrow}>GUIDE TOOLS</p>
          <h1 style={heading}>Build a Program</h1>
          <p style={sub}>
            Start from a KalpX template and customise every day — or build your own from scratch.
            Your program goes through a short review before going live.
          </p>
        </div>

        {error && <p style={errorText}>{error}</p>}

        {/* Start from scratch card */}
        <div style={sectionLabel}>Start from scratch</div>
        {!showBlank ? (
          <button style={blankCard} onClick={() => setShowBlank(true)}>
            <span style={blankPlus}>＋</span>
            <span style={blankCardTitle}>Create my own program</span>
            <span style={blankCardSub}>Choose your own title, duration, mantra, sankalp and practice for each day.</span>
          </button>
        ) : (
          <div style={blankForm}>
            <label style={label}>Program title *</label>
            <input
              style={input}
              value={blankTitle}
              onChange={(e) => setBlankTitle(e.target.value)}
              placeholder="e.g. 21-Day Hanuman Bhakti"
            />
            <label style={label}>Number of days</label>
            <select style={input} value={blankDays} onChange={(e) => setBlankDays(e.target.value)}>
              {[7, 9, 11, 14, 21, 30, 40].map((d) => (
                <option key={d} value={String(d)}>{d} days</option>
              ))}
            </select>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                style={primaryBtn}
                onClick={handleCreateBlank}
                disabled={creating || !blankTitle.trim()}
              >
                {creating ? "Creating…" : "Start Building"}
              </button>
              <button style={ghostBtn} onClick={() => setShowBlank(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Official templates */}
        <div style={{ ...sectionLabel, marginTop: 32 }}>Or start from a KalpX template</div>
        {loading ? (
          <p style={hint}>Loading templates…</p>
        ) : templates.length === 0 ? (
          <p style={hint}>No official templates available yet.</p>
        ) : (
          <div style={grid}>
            {templates.map((t) => (
              <div key={t.slug} style={card}>
                <div style={cardHeader}>
                  <span style={cardDuration}>{t.duration_days} days</span>
                  {t.audience_tags.slice(0, 2).map((tag) => (
                    <span key={tag} style={audienceTag}>{tag}</span>
                  ))}
                </div>
                <h2 style={cardTitle}>{t.title}</h2>
                {t.subtitle && <p style={cardSub}>{t.subtitle}</p>}
                {t.program_promise && <p style={promise}>{t.program_promise}</p>}
                {t.day_themes.length > 0 && (
                  <div style={dayList}>
                    {t.day_themes.slice(0, 3).map((theme, i) => (
                      <span key={i} style={dayPill}>Day {i + 1}: {theme}</span>
                    ))}
                    {t.day_themes.length > 3 && (
                      <span style={dayPill}>+{t.day_themes.length - 3} more</span>
                    )}
                  </div>
                )}
                <button
                  style={cloneBtn}
                  onClick={() => handleClone(t.slug)}
                  disabled={cloning === t.slug}
                >
                  {cloning === t.slug ? "Starting…" : "Use this template →"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", background: "#FAF7F2", padding: "0 16px 60px" };
const inner: React.CSSProperties = { maxWidth: 780, margin: "0 auto", paddingTop: 24 };
const backBtn: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer", color: "#8B6F4E",
  fontSize: 13, padding: 0, marginBottom: 20,
};
const headerBlock: React.CSSProperties = { marginBottom: 28 };
const eyebrow: React.CSSProperties = {
  fontSize: 10, letterSpacing: "1.2px", color: "#8B6F4E", textTransform: "uppercase" as const, marginBottom: 6,
};
const heading: React.CSSProperties = { fontSize: 26, fontWeight: 800, color: "#432104", margin: "0 0 8px" };
const sub: React.CSSProperties = { fontSize: 14, color: "#7A6652", lineHeight: 1.6, maxWidth: 540 };
const sectionLabel: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "#B5A08A", textTransform: "uppercase" as const,
  letterSpacing: "0.1em", marginBottom: 12,
};
const blankCard: React.CSSProperties = {
  display: "flex", flexDirection: "column" as const, alignItems: "flex-start",
  gap: 6, background: "#fff", border: "2px dashed #DDD3C0", borderRadius: 12,
  padding: "20px 24px", cursor: "pointer", width: "100%", textAlign: "left" as const,
  marginBottom: 8,
};
const blankPlus: React.CSSProperties = { fontSize: 22, color: "#C99317" };
const blankCardTitle: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: "#432104" };
const blankCardSub: React.CSSProperties = { fontSize: 13, color: "#7A6652" };
const blankForm: React.CSSProperties = {
  background: "#fff", border: "1px solid #DDD3C0", borderRadius: 12,
  padding: "20px 24px", marginBottom: 8,
};
const label: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: "#432104", display: "block" as const, marginBottom: 4, marginTop: 12 };
const input: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #DDD3C0",
  fontSize: 14, color: "#432104", boxSizing: "border-box" as const,
};
const primaryBtn: React.CSSProperties = {
  padding: "10px 20px", background: "#C99317", color: "#fff", border: "none",
  borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13,
};
const ghostBtn: React.CSSProperties = {
  padding: "10px 16px", background: "none", color: "#8B6F4E",
  border: "1px solid #DDD3C0", borderRadius: 8, cursor: "pointer", fontSize: 13,
};
const grid: React.CSSProperties = { display: "flex", flexDirection: "column" as const, gap: 16 };
const card: React.CSSProperties = {
  background: "#fff", border: "1px solid #E8DECE", borderRadius: 12, padding: "20px 24px",
};
const cardHeader: React.CSSProperties = { display: "flex", gap: 8, alignItems: "center", marginBottom: 10 };
const cardDuration: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, background: "#FEF3D0", color: "#7A4E00",
  padding: "2px 10px", borderRadius: 20,
};
const audienceTag: React.CSSProperties = {
  fontSize: 11, background: "#F5EFE5", color: "#8B6F4E", padding: "2px 8px", borderRadius: 20,
};
const cardTitle: React.CSSProperties = { fontSize: 17, fontWeight: 700, color: "#432104", margin: "0 0 4px" };
const cardSub: React.CSSProperties = { fontSize: 13, color: "#7A6652", margin: "0 0 6px" };
const promise: React.CSSProperties = {
  fontSize: 12, color: "#8B6F4E", fontStyle: "italic" as const, margin: "0 0 10px",
};
const dayList: React.CSSProperties = { display: "flex", flexWrap: "wrap" as const, gap: 6, marginBottom: 16 };
const dayPill: React.CSSProperties = {
  fontSize: 11, background: "#F5EFE5", color: "#7A6652", padding: "3px 10px", borderRadius: 20,
};
const cloneBtn: React.CSSProperties = {
  padding: "10px 20px", background: "#432104", color: "#fff", border: "none",
  borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13,
};
const errorText: React.CSSProperties = { color: "#C0392B", fontSize: 13, marginBottom: 16 };
const hint: React.CSSProperties = { color: "#B5A08A", fontSize: 14, padding: "20px 0" };
