import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "../../components/layout/Footer";
import { Header } from "../../components/layout/Header";
import { MobileBottomNav } from "../../components/layout/MobileBottomNav";

const DURATIONS = [
  { label: "1 min", seconds: 60 },
  { label: "3 min", seconds: 180 },
  { label: "5 min", seconds: 300 },
];

const COMPLETION_OPTIONS = [
  { id: "steady", label: "More steady", action: "home" },
  { id: "restless", label: "Still restless", action: "tell_mitra" },
  { id: "lighter", label: "Lighter", action: "home" },
  { id: "tell_mitra", label: "I want to tell Mitra", action: "tell_mitra" },
];

type Phase = "select" | "running" | "done";

export function QuickResetPage() {
  const navigate = useNavigate();
  const [durIdx, setDurIdx] = useState(1);
  const [phase, setPhase] = useState<Phase>("select");
  const [remaining, setRemaining] = useState(0);
  const [breaths, setBreaths] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function start() {
    setRemaining(DURATIONS[durIdx].seconds);
    setBreaths(0);
    setPhase("running");
  }

  useEffect(() => {
    if (phase !== "running") return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current!);
          setPhase("done");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  function handleCompletion(opt: typeof COMPLETION_OPTIONS[0]) {
    if (opt.action === "tell_mitra") {
      navigate("/en/mitra/tell-mitra");
    } else {
      navigate("/en/mitra");
    }
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#FFF8EF", display: "flex", flexDirection: "column" }}>
      <Header transparent />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px calc(92px + env(safe-area-inset-bottom))" }}>
        <div style={{ width: "100%", maxWidth: 360, textAlign: "center" }}>

          {phase === "select" && (
            <>
              <button
                onClick={() => navigate("/en/mitra")}
                style={{ background: "none", border: "none", color: "#C99317", fontSize: 14, cursor: "pointer", marginBottom: 24, padding: 0 }}
              >
                ← Back
              </button>
              <h2 style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 26, color: "#432104", marginBottom: 8 }}>
                Quick Reset
              </h2>
              <p style={{ color: "#7B6550", fontSize: 16, marginBottom: 32 }}>
                Pause and breathe. Tap the bead with each breath.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 32 }}>
                {DURATIONS.map((d, i) => (
                  <button
                    key={d.label}
                    onClick={() => setDurIdx(i)}
                    style={{
                      padding: "10px 20px",
                      borderRadius: 20,
                      border: "1px solid rgba(201,168,76,0.5)",
                      background: durIdx === i ? "rgba(201,168,76,0.18)" : "transparent",
                      color: "#432104",
                      fontSize: 15,
                      cursor: "pointer",
                      fontFamily: "var(--kalpx-font-serif)",
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
              <button
                onClick={start}
                style={{
                  width: "100%",
                  padding: "16px 0",
                  borderRadius: 14,
                  border: "none",
                  background: "linear-gradient(90deg, #C99317 0%, #E0AE21 50%, #C99317 100%)",
                  color: "#fff",
                  fontFamily: "var(--kalpx-font-serif)",
                  fontSize: 17,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Begin
              </button>
            </>
          )}

          {phase === "running" && (
            <>
              <div style={{ marginBottom: 12, color: "#A08060", fontSize: 15 }}>
                {formatTime(remaining)} remaining
              </div>
              <button
                onClick={() => setBreaths((b) => b + 1)}
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: "50%",
                  border: "3px solid rgba(201,168,76,0.5)",
                  background: "rgba(201,168,76,0.08)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}
              >
                <div style={{ fontFamily: "var(--kalpx-font-serif)", fontSize: 32, color: "#C99317", fontWeight: 700 }}>
                  {breaths}
                </div>
                <div style={{ fontSize: 12, color: "#7B6550", marginTop: 4 }}>breaths</div>
              </button>
              <p style={{ color: "#7B6550", fontSize: 15 }}>
                Tap after each breath
              </p>
              <button
                onClick={() => { clearInterval(intervalRef.current!); setPhase("done"); }}
                style={{ marginTop: 24, background: "none", border: "none", color: "#A08060", fontSize: 13, cursor: "pointer" }}
              >
                End early
              </button>
            </>
          )}

          {phase === "done" && (
            <>
              <h2 style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 24, color: "#432104", marginBottom: 8 }}>
                How do you feel?
              </h2>
              <p style={{ color: "#7B6550", fontSize: 15, marginBottom: 24 }}>
                {breaths} breath{breaths !== 1 ? "s" : ""}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {COMPLETION_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleCompletion(opt)}
                    style={{
                      width: "100%",
                      padding: "14px 20px",
                      borderRadius: 14,
                      border: "1px solid rgba(201,168,76,0.3)",
                      background: "rgba(250,245,240,0.92)",
                      color: "#432104",
                      fontFamily: "var(--kalpx-font-serif)",
                      fontSize: 16,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer transparent />
      <MobileBottomNav transparent />
    </div>
  );
}
