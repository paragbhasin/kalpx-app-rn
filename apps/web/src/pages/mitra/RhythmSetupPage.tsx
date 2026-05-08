import { RHYTHM_BAND_LABELS, RHYTHM_BAND_SUBTITLES } from "@kalpx/contracts";
import type { RhythmTimeBand } from "@kalpx/types";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RhythmLibraryPickerModal } from "../../components/mitra/RhythmLibraryPickerModal";
import { getMitraHomeV3, postRhythmSetup } from "../../engine/mitraApi";
import type { AppDispatch, RootState } from "../../store";
import { clearDoorState, setHomeData } from "../../store/doorSlice";

type LocalItem = {
  slot: RhythmTimeBand;
  item_type: "mantra" | "sankalp" | "practice" | "reflection" | "library";
  item_id: string;
  title_snapshot: string;
  description_snapshot: string | null;
  source: "mitra_suggested" | "user_chosen" | "library";
  sort_order: number;
  reminder_enabled: boolean;
  reminder_time?: string | null;
};

const BANDS: RhythmTimeBand[] = ["morning", "afternoon", "night"];

function seedFromHomeData(homeData: any): LocalItem[] {
  const items: LocalItem[] = [];
  if (!homeData?.companion_rhythm?.has_rhythm) return items;
  const rhythm = homeData.companion_rhythm;
  for (const band of BANDS) {
    const slot = rhythm[band];
    if (!slot?.items) continue;
    for (const item of slot.items) {
      items.push({
        slot: band,
        item_type: item.item_type,
        item_id: item.item_id,
        title_snapshot: item.title_snapshot,
        description_snapshot: item.description_snapshot ?? null,
        source: item.source,
        sort_order: item.sort_order,
        reminder_enabled: item.reminder_enabled ?? false,
        reminder_time: item.reminder_time ?? null,
      });
    }
  }
  return items;
}

export function RhythmSetupPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const homeData = useSelector((s: RootState) => s.door.homeData);

  const [items, setItems] = useState<LocalItem[]>(() => seedFromHomeData(homeData));
  const [openBand, setOpenBand] = useState<RhythmTimeBand | null>("morning");
  const [pickerBand, setPickerBand] = useState<RhythmTimeBand | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reminderPref, setReminderPref] = useState<"yes" | "no" | "later">("later");
  const [bandTimes, setBandTimes] = useState<Partial<Record<RhythmTimeBand, string>>>({});

  function addItem(item: LocalItem) {
    setItems((prev) => [...prev, item]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function bandItems(band: RhythmTimeBand) {
    return items.filter((it) => it.slot === band);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const mappedItems = items.map((it) => {
        const t = bandTimes[it.slot];
        return { ...it, reminder_enabled: !!t, reminder_time: t ?? null };
      });
      await postRhythmSetup({ items: mappedItems, reminder_preference: reminderPref });
      const homeData = await getMitraHomeV3();
      dispatch(setHomeData(homeData));
      dispatch(clearDoorState());
      navigate("/en/mitra/rhythm");
    } catch {
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#FFF8EF", display: "flex", flexDirection: "column" }}>
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px calc(92px + env(safe-area-inset-bottom))" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <button
            onClick={() => navigate("/en/mitra/rhythm")}
            style={{ background: "none", border: "none", color: "#C99317", fontSize: 14, cursor: "pointer", marginBottom: 16, padding: 0 }}
          >
            ← Back
          </button>
          <h2 style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 24, color: "#432104", margin: "0 0 20px" }}>
            Set Up My Rhythm
          </h2>

          {BANDS.map((band) => (
            <div key={band} style={{ marginBottom: 12 }}>
              <button
                onClick={() => setOpenBand(openBand === band ? null : band)}
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 18px",
                  borderRadius: 14,
                  border: "1px solid rgba(201,168,76,0.3)",
                  background: openBand === band ? "rgba(201,168,76,0.1)" : "rgba(250,245,240,0.92)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div>
                  <div style={{ fontFamily: "var(--kalpx-font-serif)", fontWeight: 700, fontSize: 16, color: "#432104" }}>
                    {RHYTHM_BAND_LABELS[band]}
                  </div>
                  <div style={{ fontSize: 13, color: "#7B6550" }}>{RHYTHM_BAND_SUBTITLES[band]}</div>
                </div>
                <span style={{ color: "#C99317" }}>{openBand === band ? "▲" : "▼"}</span>
              </button>

              {openBand === band && (
                <div style={{ padding: "10px 4px 4px" }}>
                  {bandItems(band).map((item, idx) => (
                    <div
                      key={`${item.item_id}-${idx}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "1px solid rgba(201,168,76,0.2)",
                        background: "rgba(255,252,248,0.9)",
                        marginBottom: 8,
                      }}
                    >
                      <div>
                        <div style={{ fontFamily: "var(--kalpx-font-serif)", fontSize: 14, fontWeight: 600, color: "#432104" }}>
                          {item.title_snapshot}
                        </div>
                        <div style={{ fontSize: 12, color: "#A08060" }}>{item.item_type}</div>
                      </div>
                      <button
                        onClick={() => removeItem(items.indexOf(item))}
                        style={{ background: "none", border: "none", color: "#A08060", cursor: "pointer", fontSize: 16 }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setPickerBand(band)}
                    style={{
                      width: "100%",
                      padding: "10px 0",
                      borderRadius: 10,
                      border: "1px dashed rgba(201,168,76,0.4)",
                      background: "transparent",
                      color: "#C99317",
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    + Add from library
                  </button>
                  {reminderPref === "yes" && bandItems(band).length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, padding: "8px 14px", background: "rgba(201,168,76,0.06)", borderRadius: 10, border: "1px solid rgba(201,168,76,0.2)" }}>
                      <span style={{ fontSize: 13, color: "#7B6550", flex: 1 }}>Reminder time</span>
                      <input
                        type="time"
                        value={bandTimes[band] ?? ""}
                        onChange={(e) => setBandTimes((prev) => ({ ...prev, [band]: e.target.value || undefined }))}
                        style={{ border: "1px solid rgba(201,168,76,0.3)", borderRadius: 8, padding: "4px 8px", fontSize: 13, color: "#432104", background: "#fff", outline: "none" }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 14, color: "#7B6550", marginBottom: 10 }}>Reminder preference</div>
            <div style={{ display: "flex", gap: 8 }}>
              {(
                [
                  { label: "Yes please", value: "yes" },
                  { label: "No thanks", value: "no" },
                  { label: "Remind me later", value: "later" },
                ] as { label: string; value: "yes" | "no" | "later" }[]
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setReminderPref(opt.value)}
                  style={{
                    flex: 1,
                    padding: "8px 4px",
                    borderRadius: 20,
                    border: reminderPref === opt.value ? "1px solid #C99317" : "1px solid rgba(201,168,76,0.4)",
                    background: reminderPref === opt.value ? "#C99317" : "transparent",
                    color: reminderPref === opt.value ? "#fff" : "#7B6550",
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "var(--kalpx-font-serif)",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p style={{ color: "#e06060", textAlign: "center", fontSize: 14 }}>{error}</p>}

          <button
            onClick={() => void save()}
            disabled={saving}
            style={{
              width: "100%",
              marginTop: 20,
              padding: "14px 0",
              borderRadius: 14,
              border: "none",
              background: saving
                ? "rgba(201,147,23,0.5)"
                : "linear-gradient(90deg, #C99317 0%, #E0AE21 50%, #C99317 100%)",
              color: "#fff",
              fontFamily: "var(--kalpx-font-serif)",
              fontSize: 16,
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving…" : "Save My Rhythm"}
          </button>
        </div>
      </main>

      {pickerBand && (
        <RhythmLibraryPickerModal
          band={pickerBand}
          onPick={addItem}
          onClose={() => setPickerBand(null)}
          nextSortOrder={bandItems(pickerBand).length}
        />
      )}
    </div>
  );
}
