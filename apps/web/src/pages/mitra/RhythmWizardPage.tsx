import type { RhythmTimeBand } from "@kalpx/types";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RhythmLibraryPickerModal } from "../../components/mitra/RhythmLibraryPickerModal";
import { executeAction } from "../../engine/actionExecutor";
import { getMitraHomeV3, postRhythmSetup } from "../../engine/mitraApi";
import type { AppDispatch, RootState } from "../../store";
import { clearDoorState, setHomeData } from "../../store/doorSlice";
import { useScreenState } from "../../store/screenSlice";

// ─── Types ───────────────────────────────────────────────────────────────────

type WizardStep = "moments" | "purpose" | "suggestion" | "reminders" | "confirmation";

type LocalItem = {
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

type SuggestionSeed = Pick<LocalItem, "item_id" | "item_type" | "title_snapshot" | "description_snapshot" | "source">;

// ─── Content maps ─────────────────────────────────────────────────────────────

const BANDS: RhythmTimeBand[] = ["morning", "afternoon", "night"];

const MOMENT_COPY: Record<RhythmTimeBand, { label: string; desc: string }> = {
  morning:   { label: "Morning",   desc: "Begin the day with steadiness and intention." },
  afternoon: { label: "Afternoon", desc: "Pause, reset, and return to yourself." },
  night:     { label: "Night",     desc: "Reflect, release, and close gently." },
};

const PURPOSE_OPTIONS: Record<RhythmTimeBand, { value: string; label: string; desc: string }[]> = {
  morning: [
    { value: "calm_start", label: "Calm Start",  desc: "Begin without rushing inside." },
    { value: "focus",      label: "Focus",        desc: "Gather the mind before action." },
    { value: "devotion",   label: "Devotion",     desc: "Begin the day with reverence." },
    { value: "discipline", label: "Discipline",   desc: "Start with one sincere commitment." },
    { value: "gratitude",  label: "Gratitude",    desc: "Remember what supports you." },
    { value: "clarity",    label: "Clarity",      desc: "See the day with steadiness." },
  ],
  afternoon: [
    { value: "reset",             label: "Reset",             desc: "Clear the midday weight." },
    { value: "patience",          label: "Patience",          desc: "Steady the response to friction." },
    { value: "sankalp_reminder",  label: "Sankalp Reminder",  desc: "Return to the quality you are practicing." },
    { value: "energy_check",      label: "Energy Check",      desc: "Restore prana for the second half." },
    { value: "mindful_action",    label: "Mindful Action",    desc: "Act from intention, not reaction." },
    { value: "emotional_balance", label: "Emotional Balance", desc: "Settle what is stirred." },
  ],
  night: [
    { value: "release",     label: "Release",     desc: "Let go of what the day placed on you." },
    { value: "gratitude",   label: "Gratitude",   desc: "Close with what was given." },
    { value: "reflection",  label: "Reflection",  desc: "See the day clearly before rest." },
    { value: "forgiveness", label: "Forgiveness", desc: "Dissolve what you are still carrying." },
    { value: "sleep_calm",  label: "Sleep Calm",  desc: "Steady the mind for deep rest." },
    { value: "self_review", label: "Self-Review", desc: "Study what the day is teaching." },
  ],
};

// All item IDs verified live against dev.kalpx.com library search (2026-05-08)
const SUGGESTION_MAP: Record<RhythmTimeBand, Record<string, SuggestionSeed>> = {
  morning: {
    calm_start:  { item_id: "mantra.soham",                        item_type: "mantra",   title_snapshot: "Soham",                           description_snapshot: "Breathe with this mantra.",              source: "mitra_suggested" },
    focus:       { item_id: "mantra.focus.2",                      item_type: "mantra",   title_snapshot: "Gayatri Mantra",                   description_snapshot: "Awaken the light of discernment.",       source: "mitra_suggested" },
    devotion:    { item_id: "mantra.peace_calm.om_namah_shivaya",  item_type: "mantra",   title_snapshot: "Om Namah Shivaya",                 description_snapshot: "Surrender to what is sacred within.",    source: "mitra_suggested" },
    discipline:  { item_id: "sankalp.focus.discipline",            item_type: "sankalp",  title_snapshot: "Discipline is My Strength.",       description_snapshot: "A sincere commitment to begin.",         source: "mitra_suggested" },
    gratitude:   { item_id: "sankalp.live_in_gratitude",           item_type: "sankalp",  title_snapshot: "Choose gratitude today",           description_snapshot: "Begin with what is already given.",      source: "mitra_suggested" },
    clarity:     { item_id: "mantra.asato_ma",                     item_type: "mantra",   title_snapshot: "Asato Ma Sadgamaya",               description_snapshot: "Lead me from confusion to clarity.",     source: "mitra_suggested" },
  },
  afternoon: {
    reset:             { item_id: "practice.belly_breathing",          item_type: "practice", title_snapshot: "Belly Breathing",                  description_snapshot: "Soften and return to the breath.",        source: "mitra_suggested" },
    patience:          { item_id: "choose_patience",                   item_type: "sankalp",  title_snapshot: "I will choose patience.",           description_snapshot: "Steady the response to friction.",       source: "mitra_suggested" },
    sankalp_reminder:  { item_id: "sankalp.choose_santosha",           item_type: "sankalp",  title_snapshot: "I choose Santosha.",                description_snapshot: "Return to sacred contentment.",          source: "mitra_suggested" },
    energy_check:      { item_id: "practice.anulom_vilom_basic",       item_type: "practice", title_snapshot: "Anulom Vilom",                     description_snapshot: "Restore prana for the second half.",     source: "mitra_suggested" },
    mindful_action:    { item_id: "sankalp.do_not_rush_the_ripening",  item_type: "sankalp",  title_snapshot: "I do not rush what must ripen.",   description_snapshot: "Act from intention, not reaction.",      source: "mitra_suggested" },
    emotional_balance: { item_id: "practice.shanti_breath_cycle",      item_type: "practice", title_snapshot: "Shanti Breath Cycle",              description_snapshot: "Settle what is stirred.",                source: "mitra_suggested" },
  },
  night: {
    release:     { item_id: "practice.shanti_shoulder_release",  item_type: "practice", title_snapshot: "Shoulder Release",                  description_snapshot: "Release what the day placed on you.",    source: "mitra_suggested" },
    gratitude:   { item_id: "evening_gratitude_reflection",       item_type: "practice", title_snapshot: "Evening Gratitude & Reflection",    description_snapshot: "Close with what was given.",             source: "mitra_suggested" },
    reflection:  { item_id: "practice.santosha_reflection",       item_type: "practice", title_snapshot: "Santosha Reflection",               description_snapshot: "See the day clearly before rest.",       source: "mitra_suggested" },
    forgiveness: { item_id: "kshama_practice",                    item_type: "practice", title_snapshot: "Practicing Kshama (Forgiveness)",   description_snapshot: "Dissolve what you are still carrying.",  source: "mitra_suggested" },
    sleep_calm:  { item_id: "practice.bhramari",                  item_type: "practice", title_snapshot: "Bhramari (Humming Breath)",          description_snapshot: "Steady the mind for deep rest.",         source: "mitra_suggested" },
    self_review: { item_id: "svadhyaya_daily",                    item_type: "practice", title_snapshot: "Svadhyaya (Self-Study)",             description_snapshot: "Study what the day is teaching.",        source: "mitra_suggested" },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRhythmTimeBand(): RhythmTimeBand {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  return "night";
}

function makeSuggestion(band: RhythmTimeBand, purpose: string, sortOrder: number): LocalItem {
  const seed = SUGGESTION_MAP[band][purpose] ?? SUGGESTION_MAP[band]["calm_start"];
  return { ...seed, slot: band, sort_order: sortOrder, reminder_enabled: false, reminder_time: null };
}

function itemTypeLabel(t: string): string {
  if (t === "mantra") return "Mantra";
  if (t === "sankalp") return "Sankalp";
  if (t === "practice") return "Practice";
  if (t === "reflection") return "Reflection";
  return "Library";
}

// ─── Shared style tokens ──────────────────────────────────────────────────────

const SERIF = "var(--kalpx-font-serif)";
const GOLD = "#C99317";
const DARK = "#432104";
const MID = "#7B6550";
const LIGHT = "#A08060";
const BG = "#FFF8EF";
const CARD_BG = "rgba(250,245,240,0.92)";
const BORDER = "rgba(201,168,76,0.22)";
const BORDER_ACTIVE = "#C99317";
const SELECTED_BG = "rgba(201,147,23,0.08)";
const GOLD_BTN = "linear-gradient(90deg, #C99317 0%, #E0AE21 50%, #C99317 100%)";

// ─── Step indicators ──────────────────────────────────────────────────────────

const STEP_ORDER: WizardStep[] = ["moments", "purpose", "suggestion", "reminders", "confirmation"];

function StepDots({ step }: { step: WizardStep }) {
  const idx = STEP_ORDER.indexOf(step);
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 28 }}>
      {STEP_ORDER.slice(0, 4).map((s, i) => (
        <div
          key={s}
          style={{
            width: i === idx ? 20 : 8,
            height: 8,
            borderRadius: 4,
            background: i <= idx ? GOLD : "rgba(201,168,76,0.25)",
            transition: "width 0.3s",
          }}
        />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function RhythmWizardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get("edit") === "1";

  const homeData = useSelector((s: RootState) => s.door.homeData);
  const screenState = useScreenState();

  const [step, setStep] = useState<WizardStep>(isEditMode ? "suggestion" : "moments");
  const [selectedMoments, setSelectedMoments] = useState<RhythmTimeBand[]>([]);
  const [purposes, setPurposes] = useState<Partial<Record<RhythmTimeBand, string>>>({});
  const [items, setItems] = useState<Partial<Record<RhythmTimeBand, LocalItem>>>({});
  const [reminderPref, setReminderPref] = useState<"yes" | "no" | "later">("later");
  const [bandTimes, setBandTimes] = useState<Partial<Record<RhythmTimeBand, string>>>({});
  const [pickerBand, setPickerBand] = useState<RhythmTimeBand | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-populate from existing rhythm when in edit mode
  useEffect(() => {
    if (!isEditMode) return;
    const cr = homeData?.companion_rhythm;
    if (!cr?.has_rhythm) return;
    const moments: RhythmTimeBand[] = [];
    const seedItems: Partial<Record<RhythmTimeBand, LocalItem>> = {};
    BANDS.forEach((band, idx) => {
      const slot = cr[band];
      if (slot?.items?.length) {
        moments.push(band);
        const itm = slot.items[0];
        seedItems[band] = {
          slot: band,
          item_type: itm.item_type as LocalItem["item_type"],
          item_id: itm.item_id,
          title_snapshot: itm.title_snapshot,
          description_snapshot: itm.description_snapshot ?? null,
          source: (itm.source as LocalItem["source"]) ?? "user_chosen",
          sort_order: itm.sort_order ?? idx,
          reminder_enabled: itm.reminder_enabled ?? false,
          reminder_time: itm.reminder_time ?? null,
        };
      }
    });
    setSelectedMoments(moments);
    setItems(seedItems);
  }, [isEditMode, homeData]);

  // ── Navigation helpers ───────────────────────────────────────────────────────

  function toggleMoment(band: RhythmTimeBand) {
    setSelectedMoments(prev =>
      prev.includes(band) ? prev.filter(b => b !== band) : [...prev, band],
    );
  }

  function setPurpose(band: RhythmTimeBand, value: string) {
    setPurposes(prev => ({ ...prev, [band]: value }));
  }

  function advanceMomentsToPurpose() {
    setStep("purpose");
  }

  function advancePurposeToSuggestion() {
    const newItems: Partial<Record<RhythmTimeBand, LocalItem>> = {};
    selectedMoments.forEach((band, idx) => {
      const purpose = purposes[band];
      if (purpose) newItems[band] = makeSuggestion(band, purpose, idx);
    });
    setItems(newItems);
    setStep("suggestion");
  }

  function replaceItem(band: RhythmTimeBand, picked: LocalItem) {
    setItems(prev => ({ ...prev, [band]: { ...picked, slot: band } }));
  }

  async function saveAndConfirm() {
    setSaving(true);
    setError(null);
    try {
      const itemsArr = BANDS
        .filter(b => items[b])
        .map((b, idx) => {
          const item = items[b]!;
          const t = bandTimes[b];
          return {
            ...item,
            sort_order: idx,
            reminder_enabled: reminderPref === "yes" && !!t,
            reminder_time: reminderPref === "yes" ? (t ?? null) : null,
          };
        });
      await postRhythmSetup({ items: itemsArr, reminder_preference: reminderPref });
      const newHome = await getMitraHomeV3();
      dispatch(setHomeData(newHome));
      dispatch(clearDoorState());
      setStep("confirmation");
    } catch {
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function beginTodaysPractice() {
    const band = getRhythmTimeBand();
    const cr = homeData?.companion_rhythm;
    const slotItem = cr?.[band]?.items?.[0]
      ?? cr?.[selectedMoments[0]]?.items?.[0];
    const runItem = slotItem ?? items[band] ?? items[selectedMoments[0]];
    if (!runItem) { navigate("/en/mitra/rhythm"); return; }
    void executeAction(
      {
        type: "start_runner",
        payload: {
          source: "rhythm_daily",
          variant: runItem.item_type,
          item: {
            item_id: runItem.item_id,
            title_snapshot: runItem.title_snapshot ?? runItem.title_snapshot,
            description_snapshot: runItem.description_snapshot ?? "",
            item_type: runItem.item_type,
          },
        },
      },
      { dispatch, screenData: screenState.screenData, currentStateId: "rhythm_wizard" },
    );
  }

  // ── Back logic ───────────────────────────────────────────────────────────────

  function handleBack() {
    if (step === "moments" || (isEditMode && step === "suggestion")) {
      navigate("/en/mitra/rhythm");
    } else if (step === "purpose") setStep("moments");
    else if (step === "suggestion") setStep(isEditMode ? "moments" : "purpose");
    else if (step === "reminders") setStep("suggestion");
    else if (step === "confirmation") navigate("/en/mitra/rhythm");
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const shell: React.CSSProperties = {
    minHeight: "100dvh",
    background: BG,
    display: "flex",
    flexDirection: "column",
  };
  const main: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px 16px calc(92px + env(safe-area-inset-bottom))",
  };
  const container: React.CSSProperties = { width: "100%", maxWidth: 420 };
  const backBtn: React.CSSProperties = {
    background: "none", border: "none", color: GOLD, fontSize: 14,
    cursor: "pointer", marginBottom: 20, padding: 0,
  };
  const goldBtn: React.CSSProperties = {
    width: "100%", padding: "14px 0", borderRadius: 14, border: "none",
    background: GOLD_BTN, color: "#fff", fontFamily: SERIF,
    fontSize: 16, fontWeight: 700, cursor: "pointer",
  };
  const ghostBtn: React.CSSProperties = {
    width: "100%", padding: "12px 0", marginTop: 10, borderRadius: 12,
    border: `1px solid rgba(201,168,76,0.35)`, background: "transparent",
    color: MID, fontSize: 14, cursor: "pointer",
  };

  return (
    <div style={shell}>
      <main style={main}>
        <div style={container}>
          <button onClick={handleBack} style={backBtn}>← Back</button>

          {step !== "confirmation" && <StepDots step={step} />}

          {/* ── Step 1: Choose Moments ─────────────────────────────────── */}
          {step === "moments" && (
            <>
              <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 26, color: DARK, margin: "0 0 8px" }}>
                Build Your Daily Rhythm
              </h2>
              <p style={{ color: MID, fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
                When would you like Mitra to support you?
              </p>

              {BANDS.map(band => {
                const selected = selectedMoments.includes(band);
                return (
                  <button
                    key={band}
                    onClick={() => toggleMoment(band)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 16,
                      padding: "18px 20px", borderRadius: 16, marginBottom: 12,
                      border: `2px solid ${selected ? BORDER_ACTIVE : "rgba(201,168,76,0.3)"}`,
                      background: selected ? SELECTED_BG : CARD_BG,
                      cursor: "pointer", textAlign: "left",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 17, color: DARK, marginBottom: 3 }}>
                        {MOMENT_COPY[band].label}
                      </div>
                      <div style={{ fontSize: 14, color: MID, lineHeight: 1.5 }}>
                        {MOMENT_COPY[band].desc}
                      </div>
                    </div>
                    <div style={{
                      width: 22, height: 22, borderRadius: 11, flexShrink: 0,
                      border: `2px solid ${selected ? GOLD : "rgba(201,168,76,0.4)"}`,
                      background: selected ? GOLD : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {selected && <span style={{ color: "#fff", fontSize: 13, lineHeight: 1 }}>✓</span>}
                    </div>
                  </button>
                );
              })}

              <button
                onClick={advanceMomentsToPurpose}
                disabled={selectedMoments.length === 0}
                style={{
                  ...goldBtn,
                  marginTop: 8,
                  opacity: selectedMoments.length === 0 ? 0.45 : 1,
                  cursor: selectedMoments.length === 0 ? "not-allowed" : "pointer",
                }}
              >
                Continue →
              </button>
            </>
          )}

          {/* ── Step 2: Choose Purpose ─────────────────────────────────── */}
          {step === "purpose" && (
            <>
              <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 26, color: DARK, margin: "0 0 8px" }}>
                What should each moment give you?
              </h2>
              <p style={{ color: MID, fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
                Mitra will choose a practice that fits.
              </p>

              {selectedMoments.map(band => (
                <div key={band} style={{ marginBottom: 28 }}>
                  <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 16, color: DARK, marginBottom: 12 }}>
                    {MOMENT_COPY[band].label}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {PURPOSE_OPTIONS[band].map(opt => {
                      const sel = purposes[band] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setPurpose(band, opt.value)}
                          style={{
                            padding: "12px 10px", borderRadius: 12, textAlign: "left",
                            border: `2px solid ${sel ? BORDER_ACTIVE : "rgba(201,168,76,0.25)"}`,
                            background: sel ? SELECTED_BG : CARD_BG,
                            cursor: "pointer",
                          }}
                        >
                          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 14, color: DARK, marginBottom: 2 }}>
                            {opt.label}
                          </div>
                          <div style={{ fontSize: 12, color: LIGHT, lineHeight: 1.4 }}>{opt.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {(() => {
                const allSelected = selectedMoments.every(b => purposes[b]);
                return (
                  <button
                    onClick={advancePurposeToSuggestion}
                    disabled={!allSelected}
                    style={{
                      ...goldBtn,
                      opacity: allSelected ? 1 : 0.45,
                      cursor: allSelected ? "pointer" : "not-allowed",
                    }}
                  >
                    See Mitra's Suggestion →
                  </button>
                );
              })()}
            </>
          )}

          {/* ── Step 3: Mitra Suggests ─────────────────────────────────── */}
          {step === "suggestion" && (
            <>
              <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 26, color: DARK, margin: "0 0 8px" }}>
                {isEditMode ? "Your Rhythm" : "Mitra suggests this for you."}
              </h2>
              <p style={{ color: MID, fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
                {isEditMode
                  ? "Change any item or keep it as it is."
                  : "Each practice fits the purpose you chose. You can change any of them."}
              </p>

              {BANDS.filter(b => items[b]).map(band => {
                const item = items[band]!;
                return (
                  <div
                    key={band}
                    style={{
                      border: `1px solid ${BORDER}`, borderRadius: 16,
                      background: CARD_BG, padding: "16px 18px", marginBottom: 14,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1, marginRight: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: 1.4,
                            color: "#8B6914", textTransform: "uppercase",
                            background: "#F5F0E0", borderRadius: 6, padding: "2px 8px",
                          }}>
                            {itemTypeLabel(item.item_type)}
                          </span>
                          <span style={{ fontSize: 12, color: LIGHT }}>{MOMENT_COPY[band].label}</span>
                        </div>
                        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 16, color: DARK, marginBottom: 4 }}>
                          {item.title_snapshot}
                        </div>
                        {item.description_snapshot && (
                          <div style={{ fontSize: 13, color: MID, lineHeight: 1.5 }}>
                            {item.description_snapshot}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setPickerBand(band)}
                        style={{
                          background: "none", border: `1px solid rgba(201,168,76,0.4)`,
                          color: GOLD, borderRadius: 8, padding: "5px 10px",
                          fontSize: 13, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                        }}
                      >
                        Change
                      </button>
                    </div>
                  </div>
                );
              })}

              {error && <p style={{ color: "#e06060", fontSize: 14, textAlign: "center" }}>{error}</p>}

              <button onClick={() => setStep("reminders")} style={{ ...goldBtn, marginTop: 8 }}>
                Accept Rhythm →
              </button>
              {!isEditMode && (
                <button onClick={() => navigate("/en/mitra/rhythm/edit")} style={ghostBtn}>
                  Choose My Own
                </button>
              )}
            </>
          )}

          {/* ── Step 4: Reminders ──────────────────────────────────────── */}
          {step === "reminders" && (
            <>
              <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 26, color: DARK, margin: "0 0 8px" }}>
                Would you like a gentle reminder?
              </h2>
              <p style={{ color: MID, fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
                Mitra can remind you when each moment arrives.
              </p>

              <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                {([
                  { label: "Yes, gently remind me", value: "yes" as const },
                  { label: "No, I will come myself",  value: "no" as const },
                  { label: "Ask me later",             value: "later" as const },
                ] satisfies { label: string; value: "yes" | "no" | "later" }[]).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setReminderPref(opt.value)}
                    style={{
                      flex: 1, padding: "10px 4px", borderRadius: 20, fontSize: 13,
                      fontFamily: SERIF, cursor: "pointer",
                      border: `1px solid ${reminderPref === opt.value ? GOLD : "rgba(201,168,76,0.4)"}`,
                      background: reminderPref === opt.value ? GOLD : "transparent",
                      color: reminderPref === opt.value ? "#fff" : MID,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {reminderPref === "yes" && BANDS.filter(b => items[b]).map(band => (
                <div
                  key={band}
                  style={{
                    display: "flex", alignItems: "center", gap: 12, marginBottom: 12,
                    padding: "12px 16px", background: "rgba(201,168,76,0.06)",
                    borderRadius: 12, border: `1px solid rgba(201,168,76,0.2)`,
                  }}
                >
                  <span style={{ fontFamily: SERIF, fontSize: 14, color: DARK, flex: 1 }}>
                    {MOMENT_COPY[band].label}
                  </span>
                  <input
                    type="time"
                    value={bandTimes[band] ?? ""}
                    onChange={e => setBandTimes(prev => ({ ...prev, [band]: e.target.value || undefined }))}
                    style={{
                      border: `1px solid rgba(201,168,76,0.3)`, borderRadius: 8,
                      padding: "4px 8px", fontSize: 13, color: DARK,
                      background: "#fff", outline: "none",
                    }}
                  />
                </div>
              ))}

              {error && <p style={{ color: "#e06060", fontSize: 14, textAlign: "center" }}>{error}</p>}

              <button
                onClick={() => void saveAndConfirm()}
                disabled={saving}
                style={{
                  ...goldBtn,
                  marginTop: 8,
                  opacity: saving ? 0.5 : 1,
                  cursor: saving ? "not-allowed" : "pointer",
                  background: saving ? "rgba(201,147,23,0.5)" : GOLD_BTN,
                }}
              >
                {saving ? "Saving…" : "Save My Rhythm →"}
              </button>
            </>
          )}

          {/* ── Step 5: Confirmation ───────────────────────────────────── */}
          {step === "confirmation" && (
            <>
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>✦</div>
                <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 26, color: DARK, margin: "0 0 8px" }}>
                  Your Daily Companion is ready.
                </h2>
                <p style={{ color: MID, fontSize: 15, lineHeight: 1.6 }}>
                  Each moment has its practice. Return to it whenever you need.
                </p>
              </div>

              {BANDS.filter(b => items[b]).map(band => {
                const item = items[band]!;
                return (
                  <div
                    key={band}
                    style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "14px 18px", borderRadius: 14, marginBottom: 10,
                      border: `1px solid ${BORDER}`, background: CARD_BG,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: LIGHT, marginBottom: 2 }}>{MOMENT_COPY[band].label}</div>
                      <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 15, color: DARK }}>
                        {item.title_snapshot}
                      </div>
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: 1.2,
                      color: "#8B6914", textTransform: "uppercase",
                      background: "#F5F0E0", borderRadius: 6, padding: "2px 8px",
                    }}>
                      {itemTypeLabel(item.item_type)}
                    </span>
                  </div>
                );
              })}

              <button onClick={beginTodaysPractice} style={{ ...goldBtn, marginTop: 20 }}>
                Begin today's practice
              </button>
              <button onClick={() => navigate("/en/mitra")} style={ghostBtn}>
                Return Home
              </button>
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <button
                  onClick={() => navigate("/en/mitra/inner-path")}
                  style={{ background: "none", border: "none", color: LIGHT, fontSize: 13, cursor: "pointer" }}
                >
                  Add Inner Path →
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Library picker for item replacement */}
      {pickerBand && (
        <RhythmLibraryPickerModal
          band={pickerBand}
          onPick={picked => { replaceItem(pickerBand, picked as unknown as LocalItem); setPickerBand(null); }}
          onClose={() => setPickerBand(null)}
          nextSortOrder={0}
        />
      )}
    </div>
  );
}
