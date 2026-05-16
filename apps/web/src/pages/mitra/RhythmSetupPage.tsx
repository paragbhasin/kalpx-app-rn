import { RHYTHM_BAND_LABELS, RHYTHM_BAND_SUBTITLES } from "@kalpx/contracts";
import { Fonts } from "@kalpx/design-tokens/src/fonts";
import type { RhythmTimeBand } from "@kalpx/types";
import { ChevronDown, ChevronUp, Plus, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MitraMobileShell } from "../../components/layout/MitraMobileShell";
import { RhythmLibraryPickerModal } from "../../components/mitra/RhythmLibraryPickerModal";
import {
  deleteRhythmItem,
  getMitraHomeV3,
  patchRhythmItem,
  patchRhythmSettings,
  postRhythmItemAdd,
  postRhythmSetup,
} from "../../engine/mitraApi";
import type { AppDispatch, RootState } from "../../store";
import { setHomeData } from "../../store/doorSlice";

type LocalItem = {
  rhythm_item_id?: number;
  slot: RhythmTimeBand;
  item_type: "mantra" | "sankalp" | "practice" | "reflection" | "library";
  item_id: string;
  title_snapshot: string;
  description_snapshot: string | null;
  source: "mitra_suggested" | "user_chosen" | "library";
  sort_order: number;
  reminder_enabled: boolean;
  reminder_time: string | null;
};

type TimeInputWithPicker = HTMLInputElement & {
  showPicker?: () => void;
};

const BANDS: RhythmTimeBand[] = ["morning", "afternoon", "night"];

const BAND_REMINDER_DEFAULTS: Record<RhythmTimeBand, string> = {
  morning: "06:00:00",
  afternoon: "13:00:00",
  night: "21:00:00",
};

const BAND_ART: Record<RhythmTimeBand, string> = {
  morning: "/morning.svg",
  afternoon: "/aft.svg",
  night: "/night1.svg",
};

function seedBandItems(homeData: any): Record<RhythmTimeBand, LocalItem[]> {
  const result: Record<RhythmTimeBand, LocalItem[]> = {
    morning: [],
    afternoon: [],
    night: [],
  };
  if (!homeData?.companion_rhythm?.has_rhythm) return result;
  const rhythm = homeData.companion_rhythm;
  for (const band of BANDS) {
    const slot = rhythm[band];
    if (!slot?.items) continue;
    result[band] = slot.items.map((item: any) => ({
      rhythm_item_id: item.rhythm_item_id,
      slot: band,
      item_type: item.item_type,
      item_id: item.item_id,
      title_snapshot: item.title_snapshot,
      description_snapshot: item.description_snapshot ?? null,
      source: item.source ?? "mitra_suggested",
      sort_order: item.sort_order,
      reminder_enabled: item.reminder_enabled ?? false,
      reminder_time: item.reminder_time ?? null,
    }));
  }
  return result;
}

export function RhythmSetupPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const homeData = useSelector((s: RootState) => s.door.homeData);

  const [bandItems, setBandItems] = useState<
    Record<RhythmTimeBand, LocalItem[]>
  >(() => seedBandItems(homeData));
  const [openBand, setOpenBand] = useState<RhythmTimeBand | null>("morning");
  const [pickerBand, setPickerBand] = useState<RhythmTimeBand | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reminderPref, setReminderPref] = useState<"yes" | "no" | "later">(
    (homeData?.companion_rhythm?.reminder_preference as
      | "yes"
      | "no"
      | "later") ?? "later",
  );

  // Frozen at mount — never recomputed during save
  const originalBandItems = useMemo(() => seedBandItems(homeData), []);
  const originalReminderPref = useMemo(
    () =>
      (homeData?.companion_rhythm?.reminder_preference as
        | "yes"
        | "no"
        | "later") ?? null,
    [],
  );

  function updateItemField(
    band: RhythmTimeBand,
    idx: number,
    patch: Partial<LocalItem>,
  ) {
    setBandItems((prev) => {
      const arr = [...prev[band]];
      arr[idx] = { ...arr[idx], ...patch };
      return { ...prev, [band]: arr };
    });
  }

  function moveItemUp(band: RhythmTimeBand, idx: number) {
    setBandItems((prev) => {
      const arr = [...prev[band]];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return { ...prev, [band]: arr };
    });
  }

  function moveItemDown(band: RhythmTimeBand, idx: number) {
    setBandItems((prev) => {
      const arr = [...prev[band]];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return { ...prev, [band]: arr };
    });
  }

  function moveItemToSlot(
    fromBand: RhythmTimeBand,
    idx: number,
    toSlot: RhythmTimeBand,
  ) {
    if (fromBand === toSlot) return;
    setBandItems((prev) => {
      const fromArr = [...prev[fromBand]];
      const [moved] = fromArr.splice(idx, 1);
      const toArr = [...prev[toSlot], { ...moved, slot: toSlot }];
      return { ...prev, [fromBand]: fromArr, [toSlot]: toArr };
    });
  }

  function removeItemAt(band: RhythmTimeBand, idx: number) {
    setBandItems((prev) => {
      const arr = [...prev[band]];
      arr.splice(idx, 1);
      return { ...prev, [band]: arr };
    });
  }

  function addPickedItem(picked: {
    slot: RhythmTimeBand;
    item_type: any;
    item_id: string;
    title_snapshot: string;
    description_snapshot: string | null;
    source: any;
    sort_order: number;
    reminder_enabled: boolean;
  }) {
    const band = picked.slot;
    setBandItems((prev) => {
      if (prev[band].some((i) => i.item_id === picked.item_id)) return prev;
      const newItem: LocalItem = {
        slot: band,
        item_type: picked.item_type,
        item_id: picked.item_id,
        title_snapshot: picked.title_snapshot,
        description_snapshot: picked.description_snapshot,
        source: picked.source,
        sort_order: prev[band].length + 1,
        reminder_enabled: false,
        reminder_time: null,
      };
      return { ...prev, [band]: [...prev[band], newItem] };
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const hasExistingRhythm = BANDS.some((b) =>
        originalBandItems[b].some((i) => i.rhythm_item_id != null),
      );

      if (!hasExistingRhythm) {
        // First-time setup: full-replace via postRhythmSetup
        const allItems = BANDS.flatMap((band) =>
          bandItems[band].map((item, idx) => ({
            slot: band,
            item_type: item.item_type,
            item_id: item.item_id,
            title_snapshot: item.title_snapshot,
            description_snapshot: item.description_snapshot,
            source: item.source,
            sort_order: idx + 1,
            reminder_enabled: item.reminder_enabled,
            reminder_time: item.reminder_time,
          })),
        );
        await postRhythmSetup({
          items: allItems,
          reminder_preference: reminderPref,
        });
      } else {
        // Edit mode: global delta-save
        const originalAllItems = BANDS.flatMap((b) => originalBandItems[b]);
        if (BANDS.some((b) => originalBandItems[b] == null)) {
          console.error(
            "[RhythmSetup] originalBandItems missing — aborting delta",
          );
          return;
        }

        const currentAllItems = BANDS.flatMap((band) =>
          bandItems[band].map((item, idx) => ({
            ...item,
            slot: band, // current band = current slot (source of truth)
            currentSortOrder: idx + 1,
          })),
        );
        const currentExistingIds = new Set(
          currentAllItems
            .filter((i) => i.rhythm_item_id != null)
            .map((i) => i.rhythm_item_id!),
        );

        // Step 1: DELETE — only items absent from ALL current slots
        for (const orig of originalAllItems) {
          if (
            orig.rhythm_item_id &&
            !currentExistingIds.has(orig.rhythm_item_id)
          ) {
            await deleteRhythmItem(orig.rhythm_item_id);
          }
        }

        // Step 2: POST — new items (no rhythm_item_id) in their final slot
        for (const item of currentAllItems) {
          if (!item.rhythm_item_id) {
            await postRhythmItemAdd({
              slot: item.slot,
              item_type: item.item_type,
              item_id: item.item_id,
              title_snapshot: item.title_snapshot,
              description_snapshot: item.description_snapshot,
              source: item.source,
              sort_order: item.currentSortOrder,
              reminder_enabled: item.reminder_enabled,
              reminder_time: item.reminder_time,
            });
          }
        }

        // Step 3: PATCH — only changed fields; skip if nothing changed
        for (const item of currentAllItems) {
          if (!item.rhythm_item_id) continue;
          const orig = originalAllItems.find(
            (o) => o.rhythm_item_id === item.rhythm_item_id,
          );
          if (!orig) continue;
          const patch: Record<string, unknown> = {};
          if (orig.reminder_enabled !== item.reminder_enabled)
            patch.reminder_enabled = item.reminder_enabled;
          if (orig.reminder_time !== item.reminder_time)
            patch.reminder_time = item.reminder_time;
          if (orig.slot !== item.slot) patch.slot = item.slot;
          if (orig.sort_order !== item.currentSortOrder)
            patch.sort_order = item.currentSortOrder;
          if (Object.keys(patch).length === 0) continue;
          await patchRhythmItem(item.rhythm_item_id, patch);
        }

        // Step 4: PATCH reminder_preference only if changed
        if (reminderPref !== originalReminderPref) {
          await patchRhythmSettings({ reminder_preference: reminderPref });
        }
      }

      const fresh = await getMitraHomeV3({ forceFresh: true });
      dispatch(setHomeData(fresh));
      navigate("/en/mitra/rhythm");
    } catch {
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <MitraMobileShell backgroundImage="/beige_bg.png">
      <main
        style={{
          minHeight: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 16px calc(45px + env(safe-area-inset-bottom))",
        }}
      >
        <div style={{ width: "100%", maxWidth: 420, position: "relative" }}>
          <img
            src="/leaves-bird.png"
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              top: -180,
              right: -22,
              width: 245,
              pointerEvents: "none",
              userSelect: "none",
              opacity: 0.5,
            }}
          />
          {/* <button
            onClick={() => navigate("/en/mitra/rhythm")}
            style={{
              background: "none",
              border: "none",
              color: "#C99317",
              fontSize: 14,
              cursor: "pointer",
              marginBottom: 26,
              padding: 0,
            }}
          >
            ← Back
          </button> */}
          <h2
            style={{
              fontFamily: "var(--kalpx-font-serif)",
              fontWeight: 700,
              fontSize: 26,
              color: "#432104",
              margin: "0 0 26px",
            }}
          >
            Set Up My Rhythm
          </h2>

          {BANDS.map((band) => (
            <div key={band} style={{ marginBottom: 18 }}>
              <button
                onClick={() => setOpenBand(openBand === band ? null : band)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "10px",
                  borderRadius: 24,
                  border: "1px solid rgba(201,168,76,0.24)",
                  background:
                    openBand === band
                      ? "rgba(255,250,242,0.96)"
                      : "rgba(250,245,240,0.92)",
                  boxShadow: "0 10px 24px rgba(67,33,4,0.05)",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle at 30% 30%, rgba(255,251,243,0.98), rgba(245,232,202,0.8))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    boxShadow: "inset 0 0 18px rgba(231,206,149,0.18)",
                  }}
                >
                  <img
                    src={BAND_ART[band]}
                    alt=""
                    aria-hidden="true"
                    style={{ width: 50, height: 50, objectFit: "contain" }}
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "var(--kalpx-font-serif)",
                      fontWeight: 700,
                      fontSize: 18,
                      color: "#432104",
                      marginBottom: 4,
                    }}
                  >
                    {RHYTHM_BAND_LABELS[band]}
                  </div>
                  <div style={{ fontSize: 14, color: "#7B6550" }}>
                    {RHYTHM_BAND_SUBTITLES[band]}
                  </div>
                </div>
                <span
                  style={{
                    color: "#C99317",
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {openBand === band ? (
                    <ChevronUp size={28} strokeWidth={2} />
                  ) : (
                    <ChevronDown size={28} strokeWidth={2} />
                  )}
                </span>
              </button>

              {openBand === band && (
                <div style={{ padding: "12px 2px 0" }}>
                  {bandItems[band].map((item, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === bandItems[band].length - 1;
                    return (
                      <div
                        key={item.rhythm_item_id ?? `${item.item_id}-${idx}`}
                        style={{
                          padding: "12px 14px",
                          borderRadius: 14,
                          border: "1px solid rgba(201,168,76,0.2)",
                          background: "rgba(255,252,248,0.9)",
                          marginBottom: 10,
                        }}
                      >
                        {/* Item info */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 8,
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontFamily: "var(--kalpx-font-serif)",
                                fontSize: 17,
                                fontWeight: 700,
                                color: "#432104",
                              }}
                            >
                              {item.title_snapshot}
                            </div>
                            <div style={{ fontSize: 12, color: "#432104" }}>
                              {item.item_type}
                            </div>
                          </div>
                          <button
                            onClick={() => removeItemAt(band, idx)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#DC2626",
                              cursor: "pointer",
                              fontSize: 16,
                            }}
                          >
                            ✕
                          </button>
                        </div>

                        {/* Gentle reminder toggle */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            marginBottom: 6,
                          }}
                        >
                          <button
                            type="button"
                            role="switch"
                            aria-checked={item.reminder_enabled}
                            onClick={() => {
                              const enabled = !item.reminder_enabled;
                              updateItemField(band, idx, {
                                reminder_enabled: enabled,
                                ...(enabled && item.reminder_time == null
                                  ? {
                                      reminder_time:
                                        BAND_REMINDER_DEFAULTS[band],
                                    }
                                  : {}),
                              });
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              borderRadius: 999,
                              border: item.reminder_enabled
                                ? "1px solid rgba(201,147,23,0.5)"
                                : "1px solid rgba(201,168,76,0.28)",
                              background: item.reminder_enabled
                                ? "rgba(201,147,23,0.14)"
                                : "rgba(255,251,244,0.82)",
                              padding: "5px 10px 5px 6px",
                              fontSize: 12,
                              fontWeight: 700,
                              color: item.reminder_enabled
                                ? "#9A6A0B"
                                : "#7B6550",
                              cursor: "pointer",
                              boxShadow: item.reminder_enabled
                                ? "0 6px 14px rgba(201,147,23,0.10)"
                                : "none",
                            }}
                          >
                            <span
                              aria-hidden="true"
                              style={{
                                width: 22,
                                height: 14,
                                borderRadius: 999,
                                background: item.reminder_enabled
                                  ? "#C99317"
                                  : "rgba(123,101,80,0.24)",
                                display: "flex",
                                alignItems: "center",
                                padding: 2,
                                boxSizing: "border-box",
                                transition: "background 0.16s ease",
                              }}
                            >
                              <span
                                style={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: "50%",
                                  background: "#fff",
                                  transform: item.reminder_enabled
                                    ? "translateX(8px)"
                                    : "translateX(0)",
                                  transition: "transform 0.16s ease",
                                  boxShadow: "0 1px 3px rgba(67,33,4,0.18)",
                                }}
                              />
                            </span>
                            <span>Gentle reminder</span>
                          </button>
                          {item.reminder_enabled && (
                            <input
                              type="time"
                              value={item.reminder_time?.slice(0, 5) ?? ""}
                              onClick={(e) => {
                                (e.currentTarget as TimeInputWithPicker)
                                  .showPicker?.();
                              }}
                              onFocus={(e) => {
                                (e.currentTarget as TimeInputWithPicker)
                                  .showPicker?.();
                              }}
                              onChange={(e) =>
                                updateItemField(band, idx, {
                                  reminder_time: e.target.value
                                    ? e.target.value + ":00"
                                    : null,
                                })
                              }
                              style={{
                                border: "1px solid rgba(201,168,76,0.3)",
                                borderRadius: 8,
                                padding: "3px 6px",
                                fontSize: 12,
                                color: "#432104",
                                background: "#fff",
                                outline: "none",
                              }}
                            />
                          )}
                        </div>

                        {/* Reorder within slot */}
                        {/* <div
                          style={{ display: "flex", gap: 6, marginBottom: 6 }}
                        >
                          <button
                            disabled={isFirst}
                            onClick={() => moveItemUp(band, idx)}
                            style={{
                              background: "none",
                              border: "1px solid rgba(201,168,76,0.3)",
                              borderRadius: 6,
                              padding: "2px 8px",
                              cursor: isFirst ? "default" : "pointer",
                              opacity: isFirst ? 0.35 : 1,
                              fontSize: 14,
                              color: "#7B6550",
                            }}
                          >
                            ↑
                          </button>
                          <button
                            disabled={isLast}
                            onClick={() => moveItemDown(band, idx)}
                            style={{
                              background: "none",
                              border: "1px solid rgba(201,168,76,0.3)",
                              borderRadius: 6,
                              padding: "2px 8px",
                              cursor: isLast ? "default" : "pointer",
                              opacity: isLast ? 0.35 : 1,
                              fontSize: 14,
                              color: "#7B6550",
                            }}
                          >
                            ↓
                          </button>
                        </div> */}

                        {/* Move to another slot */}
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            flexWrap: "wrap",
                            marginTop: 20,
                            justifyContent: "end",
                          }}
                        >
                          {(
                            [
                              "morning",
                              "afternoon",
                              "night",
                            ] as RhythmTimeBand[]
                          )
                            .filter((s) => s !== band)
                            .map((s) => (
                              <button
                                key={s}
                                onClick={() => moveItemToSlot(band, idx, s)}
                                style={{
                                  background: "none",
                                  border: "1px solid #d4a017",
                                  borderRadius: 999,
                                  padding: "2px 10px",
                                  cursor: "pointer",
                                  fontSize: 14,
                                  color: "#432104",
                                  fontFamily: Fonts.sans.medium,
                                }}
                              >
                                Move to {s}
                              </button>
                            ))}
                        </div>
                      </div>
                    );
                  })}
                  <button
                    onClick={() => setPickerBand(band)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: 20,
                      border: "1px dashed rgba(201,168,76,0.4)",
                      background: "transparent",
                      color: "#d4a017",
                      fontSize: 16,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                      fontFamily: "700",
                    }}
                  >
                    <Plus size={22} strokeWidth={2} />
                    Add from library
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* <div style={{ marginTop: 26 }}>
            <div
              style={{
                fontFamily: "var(--kalpx-font-serif)",
                fontSize: 18,
                color: "#432104",
                marginBottom: 14,
              }}
            >
              Gentle reminder preference for your rhythm
            </div>
            <div style={{ display: "flex", gap: 10 }}>
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
                    padding: "10px",
                    borderRadius: 999,
                    border:
                      reminderPref === opt.value
                        ? "1px solid #C99317"
                        : "1px solid rgba(201,168,76,0.4)",
                    background:
                      reminderPref === opt.value
                        ? "linear-gradient(90deg, #C99317 0%, #E0AE21 50%, #C99317 100%)"
                        : "rgba(255,251,244,0.74)",
                    color: reminderPref === opt.value ? "#fff" : "#7B6550",
                    fontSize: 14,
                    cursor: "pointer",
                    fontFamily: "var(--kalpx-font-serif)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {reminderPref === opt.value && (
                    <Check size={16} strokeWidth={2.2} />
                  )}
                  {opt.label}
                </button>
              ))}
            </div>
          </div> */}

          {error && (
            <p style={{ color: "#e06060", textAlign: "center", fontSize: 14 }}>
              {error}
            </p>
          )}

          <button
            onClick={() => void handleSave()}
            disabled={saving}
            style={{
              width: "100%",
              marginTop: 28,
              padding: "10px",
              borderRadius: 11,
              border: "none",
              background: saving
                ? "rgba(201,147,23,0.5)"
                : "linear-gradient(90deg, #C99317 0%, #E0AE21 50%, #C99317 100%)",
              color: "#fff",
              fontFamily: "var(--kalpx-font-serif)",
              fontSize: 18,
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 14,
              boxShadow: "0 16px 34px rgba(222,184,97,0.22)",
            }}
          >
            {saving ? (
              "Saving…"
            ) : (
              <>
                <Sparkles size={22} strokeWidth={2} />
                Save My Rhythm
                <span style={{ fontSize: 24, lineHeight: 1 }}>→</span>
              </>
            )}
          </button>
        </div>
      </main>

      {pickerBand && (
        <RhythmLibraryPickerModal
          band={pickerBand}
          onPick={addPickedItem}
          onClose={() => setPickerBand(null)}
          nextSortOrder={bandItems[pickerBand].length + 1}
        />
      )}
    </MitraMobileShell>
  );
}
