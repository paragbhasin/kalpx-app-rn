import { RHYTHM_BAND_LABELS, RHYTHM_ITEM_TYPE_LABELS } from "@kalpx/contracts";
import type { RhythmItem, RhythmSlot, RhythmTimeBand } from "@kalpx/types";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Footer } from "../../components/layout/Footer";
import { Header } from "../../components/layout/Header";
import { MobileBottomNav } from "../../components/layout/MobileBottomNav";
import { getMitraHomeV3 } from "../../engine/mitraApi";
import type { AppDispatch, RootState } from "../../store";
import { setHomeData } from "../../store/doorSlice";

const MANTRA_COUNT_OPTIONS = [9, 27, 54, 108];

function MantraRunner({ item }: { item: RhythmItem }) {
  const [selected, setSelected] = useState(9);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  function tap() {
    if (done) return;
    const next = count + 1;
    setCount(next);
    if (next >= selected) setDone(true);
  }

  return (
    <div style={{ marginTop: 10 }}>
      {!done ? (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {MANTRA_COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => { setSelected(n); setCount(0); setDone(false); }}
                style={{
                  padding: "4px 10px",
                  borderRadius: 20,
                  border: "1px solid rgba(201,168,76,0.5)",
                  background: selected === n ? "rgba(201,168,76,0.18)" : "transparent",
                  color: "#432104",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            onClick={tap}
            style={{
              width: "100%",
              padding: "12px 0",
              borderRadius: 12,
              border: "1px solid rgba(201,168,76,0.4)",
              background: "rgba(201,168,76,0.08)",
              color: "#432104",
              fontFamily: "var(--kalpx-font-serif)",
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Tap — {count} / {selected}
          </button>
        </>
      ) : (
        <div style={{ color: "#7B6550", fontSize: 14, textAlign: "center", paddingTop: 6 }}>
          ✓ Complete — {selected} repetitions
        </div>
      )}
    </div>
  );
}

function SankalpRunner() {
  const DURATION = 30;
  const [active, setActive] = useState(false);
  const [remaining, setRemaining] = useState(DURATION);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active || done) return;
    if (remaining <= 0) { setDone(true); setActive(false); return; }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [active, remaining, done]);

  return (
    <div style={{ marginTop: 10 }}>
      {done ? (
        <div style={{ color: "#7B6550", fontSize: 14, textAlign: "center" }}>✓ 30-second hold complete</div>
      ) : (
        <button
          onClick={() => setActive(true)}
          disabled={active}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 12,
            border: "1px solid rgba(201,168,76,0.4)",
            background: active ? "rgba(201,168,76,0.15)" : "rgba(201,168,76,0.08)",
            color: "#432104",
            fontFamily: "var(--kalpx-font-serif)",
            fontSize: 15,
            cursor: active ? "default" : "pointer",
          }}
        >
          {active ? `Hold… ${remaining}s` : "Begin 30-second hold"}
        </button>
      )}
    </div>
  );
}

function GenericRunner({ item }: { item: RhythmItem }) {
  const [done, setDone] = useState(false);
  return (
    <div style={{ marginTop: 10 }}>
      {item.description_snapshot && (
        <p style={{ color: "#7B6550", fontSize: 14, margin: "0 0 8px", lineHeight: 1.5 }}>
          {item.description_snapshot}
        </p>
      )}
      {done ? (
        <div style={{ color: "#7B6550", fontSize: 14 }}>✓ Marked complete</div>
      ) : (
        <button
          onClick={() => setDone(true)}
          style={{
            padding: "8px 20px",
            borderRadius: 10,
            border: "1px solid rgba(201,168,76,0.4)",
            background: "rgba(201,168,76,0.08)",
            color: "#432104",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Mark Complete
        </button>
      )}
    </div>
  );
}

function ItemCard({ item }: { item: RhythmItem }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      style={{
        border: "1px solid rgba(201,168,76,0.2)",
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 10,
        background: "rgba(255,252,248,0.9)",
      }}
    >
      <button
        onClick={() => setExpanded((e) => !e)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          padding: 0,
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 15, color: "#432104" }}>
              {item.title_snapshot}
            </div>
            <div style={{ fontSize: 12, color: "#A08060", marginTop: 2 }}>
              {RHYTHM_ITEM_TYPE_LABELS[item.item_type] ?? item.item_type}
            </div>
          </div>
          <span style={{ color: "#C99317", fontSize: 16 }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </button>
      {expanded && (
        item.item_type === "mantra" ? <MantraRunner item={item} /> :
        item.item_type === "sankalp" ? <SankalpRunner /> :
        <GenericRunner item={item} />
      )}
    </div>
  );
}

function BandSection({ band, slot }: { band: RhythmTimeBand; slot: RhythmSlot | null }) {
  if (!slot || slot.items.length === 0) return null;
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 17, color: "#432104", marginBottom: 10 }}>
        {RHYTHM_BAND_LABELS[band]}
      </div>
      {slot.items.map((item) => <ItemCard key={item.id} item={item} />)}
    </div>
  );
}

const SHELL_STYLE: React.CSSProperties = {
  minHeight: "100dvh",
  background: "#FFF8EF",
  display: "flex",
  flexDirection: "column",
};
const CARD_STYLE: React.CSSProperties = {
  background: "rgba(250,245,240,0.95)",
  border: "1px solid rgba(201,168,76,0.25)",
  borderRadius: 18,
  padding: "32px 20px",
  textAlign: "center",
};

export function RhythmHomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const homeData = useSelector((s: RootState) => s.door.homeData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (homeData) return;
    setLoading(true);
    void getMitraHomeV3()
      .then((d) => dispatch(setHomeData(d)))
      .catch(() => setError("Could not load your rhythm."))
      .finally(() => setLoading(false));
  }, [homeData, dispatch]);

  const rhythm = homeData?.companion_rhythm;

  return (
    <div style={SHELL_STYLE}>
      <Header transparent />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px calc(92px + env(safe-area-inset-bottom))" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <button
            onClick={() => navigate("/en/mitra")}
            style={{ background: "none", border: "none", color: "#C99317", fontSize: 14, cursor: "pointer", marginBottom: 16, padding: 0 }}
          >
            ← Back
          </button>
          <h2 style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 24, color: "#432104", margin: "0 0 20px" }}>
            My Rhythm
          </h2>

          {loading && <p style={{ color: "#A08060", textAlign: "center" }}>Loading…</p>}
          {error && <p style={{ color: "#e06060", textAlign: "center" }}>{error}</p>}

          {!loading && rhythm && !rhythm.has_rhythm && (
            <div style={CARD_STYLE}>
              <p style={{ fontFamily: "var(--kalpx-font-serif)", fontSize: 17, color: "#432104", marginBottom: 20 }}>
                You haven't set up your rhythm yet.
              </p>
              <button
                onClick={() => navigate("/en/mitra/rhythm/setup")}
                style={{
                  padding: "14px 28px",
                  borderRadius: 14,
                  border: "none",
                  background: "linear-gradient(90deg, #C99317 0%, #E0AE21 50%, #C99317 100%)",
                  color: "#fff",
                  fontFamily: "var(--kalpx-font-serif)",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Set up My Rhythm
              </button>
            </div>
          )}

          {!loading && rhythm && rhythm.has_rhythm && (
            <>
              <BandSection band="morning" slot={rhythm.morning} />
              <BandSection band="afternoon" slot={rhythm.afternoon} />
              <BandSection band="night" slot={rhythm.night} />
              <button
                onClick={() => navigate("/en/mitra/rhythm/setup")}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 12,
                  border: "1px solid rgba(201,168,76,0.35)",
                  background: "transparent",
                  color: "#7B6550",
                  fontSize: 14,
                  cursor: "pointer",
                  marginTop: 4,
                }}
              >
                Edit My Rhythm
              </button>
            </>
          )}
        </div>
      </main>
      <Footer transparent />
      <MobileBottomNav transparent />
    </div>
  );
}
