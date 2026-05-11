import { RHYTHM_BAND_LABELS } from "@kalpx/contracts";
import type { RhythmItem, RhythmSlot, RhythmTimeBand } from "@kalpx/types";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { executeAction } from "../../engine/actionExecutor";
import { getMitraHomeV3 } from "../../engine/mitraApi";
import type { AppDispatch, RootState } from "../../store";
import { setHomeData } from "../../store/doorSlice";
import { useScreenState } from "../../store/screenSlice";

function actionLabel(itemType: string): string {
  if (itemType === "mantra") return "Chant";
  if (itemType === "sankalp") return "Embody";
  return "Practice";
}

function RhythmItemCard({ item, onAction }: { item: RhythmItem; onAction: () => void }) {
  return (
    <div
      style={{
        border: "1px solid rgba(228,197,145,0.8)",
        borderRadius: 20,
        background: "#ffffff",
        padding: 16,
        marginBottom: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 1.5,
            color: "#8B6914",
            textTransform: "uppercase",
            background: "#F5F0E0",
            borderRadius: 6,
            padding: "2px 8px",
            display: "inline-block",
          }}
        >
          {item.item_type}
        </span>
      </div>
      <p
        style={{
          fontFamily: "var(--kalpx-font-serif)",
          fontSize: 18,
          fontWeight: "700",
          color: "#432104",
          margin: "0 0 4px",
          lineHeight: 1.3,
        }}
      >
        {item.title_snapshot}
      </p>
      {item.description_snapshot && (
        <p
          style={{
            fontFamily: "var(--kalpx-font-sans, Inter, sans-serif)",
            fontSize: 13,
            color: "#7B6550",
            margin: "0 0 12px",
            lineHeight: 1.5,
          }}
        >
          {item.description_snapshot}
        </p>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={onAction}
          style={{
            padding: "7px 16px",
            borderRadius: 20,
            border: "none",
            background: "linear-gradient(135deg, #c9a84c, #a8873a)",
            color: "#fff",
            fontSize: 14,
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {actionLabel(item.item_type)}
        </button>
      </div>
    </div>
  );
}

function BandSection({
  band,
  slot,
  onItemAction,
}: {
  band: RhythmTimeBand;
  slot: RhythmSlot | null;
  onItemAction: (item: RhythmItem) => void;
}) {
  if (!slot || slot.items.length === 0) return null;
  return (
    <div style={{ marginBottom: 24 }}>
      <div
        style={{
          fontFamily: "var(--kalpx-font-serif)",
          fontWeight: 700,
          fontSize: 17,
          color: "#432104",
          marginBottom: 10,
        }}
      >
        {RHYTHM_BAND_LABELS[band]}
      </div>
      {slot.items.map((item) => (
        <RhythmItemCard key={item.id} item={item} onAction={() => onItemAction(item)} />
      ))}
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
  const screenState = useScreenState();
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

  const actionContext = {
    dispatch,
    screenData: screenState.screenData,
    currentStateId: "rhythm_daily",
  };

  function handleItemAction(item: RhythmItem, band: RhythmTimeBand) {
    void executeAction(
      {
        type: "start_runner",
        payload: {
          source: "rhythm_daily",
          variant: item.item_type,
          rhythm_slot: band,
          item: {
            item_id: item.item_id,
            title_snapshot: item.title_snapshot,
            description_snapshot: item.description_snapshot ?? "",
            item_type: item.item_type,
          },
        },
      },
      actionContext,
    );
  }

  return (
    <div style={SHELL_STYLE}>
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 16px calc(92px + env(safe-area-inset-bottom))",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420 }}>
          <button
            onClick={() => navigate("/en/mitra")}
            style={{
              background: "none",
              border: "none",
              color: "#C99317",
              fontSize: 14,
              cursor: "pointer",
              marginBottom: 16,
              padding: 0,
            }}
          >
            ← Back
          </button>
          <h2
            style={{
              fontFamily: "var(--kalpx-font-serif)",
              fontWeight: 700,
              fontSize: 24,
              color: "#432104",
              margin: "0 0 20px",
            }}
          >
            My Rhythm
          </h2>

          {loading && <p style={{ color: "#A08060", textAlign: "center" }}>Loading…</p>}
          {error && <p style={{ color: "#e06060", textAlign: "center" }}>{error}</p>}

          {!loading && rhythm && !rhythm.has_rhythm && (
            <div style={CARD_STYLE}>
              <p
                style={{
                  fontFamily: "var(--kalpx-font-serif)",
                  fontSize: 17,
                  color: "#432104",
                  marginBottom: 20,
                }}
              >
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
              <BandSection
                band="morning"
                slot={rhythm.morning}
                onItemAction={(item) => handleItemAction(item, "morning")}
              />
              <BandSection
                band="afternoon"
                slot={rhythm.afternoon}
                onItemAction={(item) => handleItemAction(item, "afternoon")}
              />
              <BandSection
                band="night"
                slot={rhythm.night}
                onItemAction={(item) => handleItemAction(item, "night")}
              />
              <button
                onClick={() => navigate("/en/mitra/rhythm/edit")}
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
    </div>
  );
}
