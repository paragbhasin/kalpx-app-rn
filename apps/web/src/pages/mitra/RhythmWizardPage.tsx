import {
  getMissingSuggestionSlots,
  RHYTHM_SUGGEST_COPY,
  rhythmSuggestItemToLocalItem,
  toRhythmSetupPayloadItems,
} from "@kalpx/contracts";
import type { RhythmTimeBand, RhythmWizardLocalItem } from "@kalpx/types";
import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MitraMobileShell } from "../../components/layout/MitraMobileShell";
import { RhythmLibraryPickerModal } from "../../components/mitra/RhythmLibraryPickerModal";
import { executeAction } from "../../engine/actionExecutor";
import {
  getMitraHomeV3,
  postRhythmSetup,
  postRhythmSuggest,
} from "../../engine/mitraApi";
import { useTranslation } from '../../lib/i18n';
import { getActiveLocale } from '../../lib/locale';
import type { AppDispatch, RootState } from "../../store";
import { setHomeData } from "../../store/doorSlice";
import { useScreenState } from "../../store/screenSlice";

// ─── Types ───────────────────────────────────────────────────────────────────

type WizardStep =
  | "moments"
  | "purpose"
  | "suggestion"
  | "reminders"
  | "confirmation";

// ─── Content maps ─────────────────────────────────────────────────────────────

const BANDS: RhythmTimeBand[] = ["morning", "afternoon", "night"];

const MOMENT_COPY: Record<RhythmTimeBand, { label: string; desc: string }> = {
  morning: {
    label: "Morning",
    desc: "Begin the day with steadiness and intention.",
  },
  afternoon: {
    label: "Afternoon",
    desc: "Pause, reset, and return to yourself.",
  },
  night: { label: "Night", desc: "Reflect, release, and close gently." },
};

const MOMENT_ART: Record<RhythmTimeBand, string> = {
  morning: "/morning.png",
  afternoon: "/aft.png",
  night: "/night.png",
};

const PURPOSE_ART: Record<RhythmTimeBand, string[]> = {
  morning: ["/m3.svg", "/m5.svg", "/m1.svg", "/m4.svg", "/m2.svg", "/m6.svg"],
  afternoon: ["/a5.svg", "/a1.svg", "/a4.svg", "/a2.svg", "/a6.svg", "/a3.svg"],
  night: ["/n4.svg", "/n2.svg", "/n5.svg", "/n1.svg", "/n6.svg", "/n3.svg"],
};

const PURPOSE_OPTIONS: Record<
  RhythmTimeBand,
  { value: string; label: string; desc: string }[]
> = {
  morning: [
    {
      value: "calm_start",
      label: "Calm Start",
      desc: "Begin without rushing inside.",
    },
    { value: "focus", label: "Focus", desc: "Gather the mind before action." },
    {
      value: "devotion",
      label: "Devotion",
      desc: "Begin the day with reverence.",
    },
    {
      value: "discipline",
      label: "Discipline",
      desc: "Start with one sincere commitment.",
    },
    {
      value: "gratitude",
      label: "Gratitude",
      desc: "Remember what supports you.",
    },
    {
      value: "clarity",
      label: "Clarity",
      desc: "See the day with steadiness.",
    },
  ],
  afternoon: [
    { value: "reset", label: "Reset", desc: "Clear the midday weight." },
    {
      value: "patience",
      label: "Patience",
      desc: "Steady the response to friction.",
    },
    {
      value: "sankalp_reminder",
      label: "Sankalp Reminder",
      desc: "Return to the quality you are practicing.",
    },
    {
      value: "energy_check",
      label: "Energy Check",
      desc: "Restore prana for the second half.",
    },
    {
      value: "mindful_action",
      label: "Mindful Action",
      desc: "Act from intention, not reaction.",
    },
    {
      value: "emotional_balance",
      label: "Emotional Balance",
      desc: "Settle what is stirred.",
    },
  ],
  night: [
    {
      value: "release",
      label: "Release",
      desc: "Let go of what the day placed on you.",
    },
    {
      value: "gratitude",
      label: "Gratitude",
      desc: "Close with what was given.",
    },
    {
      value: "reflection",
      label: "Reflection",
      desc: "See the day clearly before rest.",
    },
    {
      value: "forgiveness",
      label: "Forgiveness",
      desc: "Dissolve what you are still carrying.",
    },
    {
      value: "sleep_calm",
      label: "Sleep Calm",
      desc: "Steady the mind for deep rest.",
    },
    {
      value: "self_review",
      label: "Self-Review",
      desc: "Study what the day is teaching.",
    },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRhythmTimeBand(): RhythmTimeBand {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  return "night";
}

function sortBands(bands: RhythmTimeBand[]): RhythmTimeBand[] {
  return BANDS.filter((band) => bands.includes(band));
}

// ─── Reminder defaults (morning 6 AM, afternoon 1 PM, night 9 PM) ────────────

const BAND_REMINDER_DEFAULTS: Record<RhythmTimeBand, string> = {
  morning: "06:00",
  afternoon: "13:00",
  night: "21:00",
};

// ─── Shared style tokens ──────────────────────────────────────────────────────

const SERIF = "var(--kalpx-font-serif)";
const GOLD = "#C99317";
const DARK = "#432104";
const MID = "#7B6545";
const LIGHT = "#A08060";
const CARD_BG = "rgba(245,245,240,0.45)";
const BORDER = "rgba(201,168,76,0.22)";
const BORDER_ACTIVE = "#C99317";
const SELECTED_BG = "rgba(201,147,23,0.08)";
const GOLD_BTN =
  "linear-gradient(90deg, #C99317 0%, #E0AE21 45%, #C99317 100%)";

// ─── Step indicators ──────────────────────────────────────────────────────────

const STEP_ORDER: WizardStep[] = [
  "moments",
  "purpose",
  "suggestion",
  "reminders",
  "confirmation",
];

function StepDots({ step }: { step: WizardStep }) {
  const idx = STEP_ORDER.indexOf(step);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 6,
        marginBottom: 28,
      }}
    >
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
  const { t, locale } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isDesktop =
    typeof window === "undefined" ? true : window.innerWidth >= 1024;
  const isEditMode = searchParams.get("edit") === "1";

  const homeData = useSelector((s: RootState) => s.door.homeData);
  const screenState = useScreenState();
  const hasExistingRhythm = homeData?.companion_rhythm?.has_rhythm === true;
  const hasActiveInnerPath =
    homeData?.inner_path_summary?.has_active_path === true ||
    homeData?.user_surface_state?.has_inner_path === true;
  const wizardBackTarget =
    isEditMode || hasExistingRhythm ? "/en/mitra/rhythm" : "/en/mitra";

  function itemTypeLabel(type: string): string {
    if (type === "mantra") return t('mitra.innerPath.mantra');
    if (type === "sankalp") return t('mitra.innerPath.sankalp');
    if (type === "practice") return t('mitra.innerPath.practice');
    if (type === "reflection") return t('mitra.rhythmWizard.purposeReflection');
    return type;
  }

  function beginLabel(itemType: string): string {
    if (itemType === "mantra") return t('mitra.rhythmHome.beginChanting');
    if (itemType === "sankalp") return t('mitra.rhythmHome.beginEmbodying');
    return t('mitra.rhythmHome.beginPractice');
  }

  const MOMENT_LABEL: Record<RhythmTimeBand, string> = {
    morning: t('mitra.rhythmWizard.morning'),
    afternoon: t('mitra.rhythmWizard.afternoon'),
    night: t('mitra.rhythmWizard.night'),
  };

  const MOMENT_DESC: Record<RhythmTimeBand, string> = {
    morning: t('mitra.rhythmWizard.morningDesc'),
    afternoon: t('mitra.rhythmWizard.afternoonDesc'),
    night: t('mitra.rhythmWizard.nightDesc'),
  };

  const PURPOSE_OPTIONS_T: Record<
    RhythmTimeBand,
    { value: string; label: string; desc: string }[]
  > = {
    morning: [
      { value: "calm_start", label: t('mitra.rhythmWizard.purposeCalmStart'), desc: t('mitra.rhythmWizard.purposeCalmStartDesc') },
      { value: "focus", label: t('mitra.rhythmWizard.purposeFocus'), desc: t('mitra.rhythmWizard.purposeFocusDesc') },
      { value: "devotion", label: t('mitra.rhythmWizard.purposeDevotion'), desc: t('mitra.rhythmWizard.purposeDevotionDesc') },
      { value: "discipline", label: t('mitra.rhythmWizard.purposeDiscipline'), desc: t('mitra.rhythmWizard.purposeDisciplineDesc') },
      { value: "gratitude", label: t('mitra.rhythmWizard.purposeGratitude'), desc: t('mitra.rhythmWizard.purposeGratitudeDesc') },
      { value: "clarity", label: t('mitra.rhythmWizard.purposeClarity'), desc: t('mitra.rhythmWizard.purposeClarityDesc') },
    ],
    afternoon: [
      { value: "reset", label: t('mitra.rhythmWizard.purposeReset'), desc: t('mitra.rhythmWizard.purposeResetDesc') },
      { value: "patience", label: t('mitra.rhythmWizard.purposePatience'), desc: t('mitra.rhythmWizard.purposePatienceDesc') },
      { value: "sankalp_reminder", label: t('mitra.rhythmWizard.purposeSankalp'), desc: t('mitra.rhythmWizard.purposeSankalpDesc') },
      { value: "energy_check", label: t('mitra.rhythmWizard.purposeEnergy'), desc: t('mitra.rhythmWizard.purposeEnergyDesc') },
      { value: "mindful_action", label: t('mitra.rhythmWizard.purposeMindful'), desc: t('mitra.rhythmWizard.purposeMindfulDesc') },
      { value: "emotional_balance", label: t('mitra.rhythmWizard.purposeEmotional'), desc: t('mitra.rhythmWizard.purposeEmotionalDesc') },
    ],
    night: [
      { value: "release", label: t('mitra.rhythmWizard.purposeRelease'), desc: t('mitra.rhythmWizard.purposeReleaseDesc') },
      { value: "gratitude", label: t('mitra.rhythmWizard.purposeGratitudeNight'), desc: t('mitra.rhythmWizard.purposeGratitudeNightDesc') },
      { value: "reflection", label: t('mitra.rhythmWizard.purposeReflection'), desc: t('mitra.rhythmWizard.purposeReflectionDesc') },
      { value: "forgiveness", label: t('mitra.rhythmWizard.purposeForgiveness'), desc: t('mitra.rhythmWizard.purposeForgivenessDesc') },
      { value: "sleep_calm", label: t('mitra.rhythmWizard.purposeSleepCalm'), desc: t('mitra.rhythmWizard.purposeSleepCalmDesc') },
      { value: "self_review", label: t('mitra.rhythmWizard.purposeSelfReview'), desc: t('mitra.rhythmWizard.purposeSelfReviewDesc') },
    ],
  };

  const [step, setStep] = useState<WizardStep>(
    isEditMode ? "suggestion" : "moments",
  );
  const [selectedMoments, setSelectedMoments] = useState<RhythmTimeBand[]>([]);
  const [purposes, setPurposes] = useState<
    Partial<Record<RhythmTimeBand, string>>
  >({});
  const [items, setItems] = useState<
    Partial<Record<RhythmTimeBand, RhythmWizardLocalItem>>
  >({});
  const [reminderPref, setReminderPref] = useState<"yes" | "no" | "later">(
    "later",
  );
  const [bandTimes, setBandTimes] = useState<
    Partial<Record<RhythmTimeBand, string>>
  >({});
  const [pickerBand, setPickerBand] = useState<RhythmTimeBand | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [suggestionsLoaded, setSuggestionsLoaded] = useState(false);

  // On mount: refresh homeData so edit mode seeds from current locale.
  // Cache returns instantly for same locale; different locale triggers a fresh fetch.
  useEffect(() => {
    getMitraHomeV3().then((d) => { if (d) dispatch(setHomeData(d)); }).catch(() => {});
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pre-populate from existing rhythm when in edit mode
  useEffect(() => {
    if (!isEditMode) return;
    const cr = homeData?.companion_rhythm;
    if (!cr?.has_rhythm) return;
    const moments: RhythmTimeBand[] = [];
    const seedItems: Partial<Record<RhythmTimeBand, RhythmWizardLocalItem>> =
      {};
    BANDS.forEach((band, idx) => {
      const slot = cr[band];
      if (slot?.items?.length) {
        moments.push(band);
        const itm = slot.items[0];
        seedItems[band] = {
          slot: band,
          item_type: itm.item_type as RhythmWizardLocalItem["item_type"],
          item_id: itm.item_id,
          title_snapshot: itm.title_snapshot,
          description_snapshot: itm.description_snapshot ?? null,
          source:
            (itm.source as RhythmWizardLocalItem["source"]) ?? "user_chosen",
          sort_order: itm.sort_order ?? idx,
          reminder_enabled: itm.reminder_enabled ?? false,
          reminder_time: itm.reminder_time ?? null,
        };
      }
    });
    setSelectedMoments(moments);
    setItems(seedItems);
  }, [isEditMode, homeData]);

  // Reload guard: reset stale suggestions when moments or purposes change
  useEffect(() => {
    if (isEditMode) return;
    setItems({});
    setSuggestError(null);
    setSuggestionsLoaded(false);
  }, [selectedMoments, purposes]);

  // Load suggestions once when entering suggestion step
  useEffect(() => {
    if (step === "suggestion" && !isEditMode && !suggestionsLoaded) {
      void loadSuggestions();
    }
  }, [step, suggestionsLoaded]);

  // Re-fetch suggestions with pinned_items when locale changes mid-session,
  // so the backend returns the SAME items translated, not freshly selected ones.
  const localeRef = useRef(locale);
  useEffect(() => {
    const prev = localeRef.current;
    localeRef.current = locale;
    if (prev === locale) return;

    if (step === "confirmation") {
      getMitraHomeV3({ forceFresh: true }).then((fresh) => {
        if (!fresh) return;
        dispatch(setHomeData(fresh));
        const cr = fresh.companion_rhythm;
        if (!cr?.has_rhythm) return;
        const newItems: Partial<Record<RhythmTimeBand, RhythmWizardLocalItem>> = {};
        BANDS.forEach((band, idx) => {
          const slot = cr[band];
          if (slot?.items?.length) {
            const itm = slot.items[0];
            newItems[band] = {
              slot: band,
              item_type: itm.item_type as RhythmWizardLocalItem["item_type"],
              item_id: itm.item_id,
              title_snapshot: itm.title_snapshot,
              description_snapshot: itm.description_snapshot ?? null,
              source: (itm.source as RhythmWizardLocalItem["source"]) ?? "user_chosen",
              sort_order: itm.sort_order ?? idx,
              reminder_enabled: itm.reminder_enabled ?? false,
              reminder_time: itm.reminder_time ?? null,
            };
          }
        });
        if (Object.keys(newItems).length) setItems(newItems);
      }).catch(() => {});
      return;
    }

    if (step !== "suggestion" || isEditMode || !suggestionsLoaded) return;
    const pinned = (Object.entries(items) as [RhythmTimeBand, RhythmWizardLocalItem | undefined][])
      .filter(([, it]) => it)
      .map(([slot, it]) => ({ slot, item_id: it!.item_id, item_type: it!.item_type }));
    if (!pinned.length) { setSuggestionsLoaded(false); return; }
    setSuggestLoading(true);
    setSuggestError(null);
    postRhythmSuggest({
      selected_moments: selectedMoments,
      purposes,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale,
      source_surface: "rhythm_wizard",
      pinned_items: pinned as any,
    }).then((resp) => {
      const newItems: Partial<Record<RhythmTimeBand, RhythmWizardLocalItem>> = {};
      resp.items.forEach((it, idx) => {
        newItems[it.slot] = { ...rhythmSuggestItemToLocalItem(it), sort_order: idx };
      });
      if (Object.keys(newItems).length) setItems(newItems);
    }).catch(() => {}).finally(() => setSuggestLoading(false));
  }, [locale]);

  // ── Navigation helpers ───────────────────────────────────────────────────────

  function toggleMoment(band: RhythmTimeBand) {
    setSelectedMoments((prev) =>
      prev.includes(band)
        ? sortBands(prev.filter((b) => b !== band))
        : sortBands([...prev, band]),
    );
  }

  function setPurpose(band: RhythmTimeBand, value: string) {
    setPurposes((prev) => ({ ...prev, [band]: value }));
  }

  function advanceMomentsToPurpose() {
    setStep("purpose");
  }

  async function loadSuggestions() {
    setSuggestLoading(true);
    setSuggestError(null);
    try {
      const resp = await postRhythmSuggest({
        selected_moments: selectedMoments,
        purposes,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale,
        source_surface: "rhythm_wizard",
      });
      const newItems: Partial<Record<RhythmTimeBand, RhythmWizardLocalItem>> =
        {};
      resp.items.forEach((it, idx) => {
        newItems[it.slot] = {
          ...rhythmSuggestItemToLocalItem(it),
          sort_order: idx,
        };
      });
      setItems(newItems);
      setSuggestionsLoaded(true);
      if (resp.status === "partial" && resp.missing_slots?.length) {
        setSuggestError(
          `Mitra could not suggest a practice for: ${resp.missing_slots.join(", ")}.`,
        );
      }
    } catch {
      setSuggestError(RHYTHM_SUGGEST_COPY.error);
    } finally {
      setSuggestLoading(false);
    }
  }

  function advancePurposeToSuggestion() {
    setStep("suggestion");
  }

  function replaceItem(band: RhythmTimeBand, picked: RhythmWizardLocalItem) {
    setItems((prev) => ({ ...prev, [band]: { ...picked, slot: band } }));
  }

  async function saveAndConfirm() {
    setSaving(true);
    setError(null);
    try {
      const localItems = BANDS.filter((b) => items[b]).map((b, idx) => ({
        ...items[b]!,
        sort_order: idx,
        reminder_enabled: reminderPref === "yes" && !!bandTimes[b],
        reminder_time: reminderPref === "yes" ? (bandTimes[b] ?? null) : null,
      }));
      const itemsArr = toRhythmSetupPayloadItems(localItems);
      await postRhythmSetup({
        items: itemsArr as any[],
        reminder_preference: reminderPref,
      });
      const newHome = await getMitraHomeV3({ forceFresh: true });
      dispatch(setHomeData(newHome));
      setStep("confirmation");
    } catch {
      setError("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function beginRhythmItem(
    band: RhythmTimeBand,
    runItem:
      | {
          item_id: string;
          item_type: string;
          title_snapshot?: string | null;
          description_snapshot?: string | null;
        }
      | undefined
      | null,
  ) {
    if (!runItem) {
      navigate("/en/mitra/rhythm");
      return;
    }
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
      {
        dispatch,
        screenData: screenState.screenData,
        currentStateId: "rhythm_wizard",
      },
    );
  }

  // ── Back logic ───────────────────────────────────────────────────────────────

  function handleBack() {
    if (step === "moments" || (isEditMode && step === "suggestion")) {
      navigate(wizardBackTarget);
    } else if (step === "purpose") setStep("moments");
    else if (step === "suggestion") setStep(isEditMode ? "moments" : "purpose");
    else if (step === "reminders") setStep("suggestion");
    else if (step === "confirmation") navigate("/en/mitra");
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const main: React.CSSProperties = {
    minHeight: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: isDesktop
      ? "42px 32px calc(56px + env(safe-area-inset-bottom))"
      : "10px 16px calc(45px + env(safe-area-inset-bottom))",
  };
  const container: React.CSSProperties = {
    width: "100%",
    maxWidth:
      isDesktop &&
      (step === "moments" || step === "purpose" || step === "suggestion")
        ? 1280
        : 420,
    position: "relative",
  };
  const goldBtn: React.CSSProperties = {
    width: "100%",
    padding: "10px",
    borderRadius: 11,
    border: "none",
    background: GOLD_BTN,
    color: "#fff",
    fontFamily: SERIF,
    fontSize: 22,
    fontWeight: 700,
    cursor: "pointer",
  };
  const ghostBtn: React.CSSProperties = {
    width: "100%",
    padding: "12px 0",
    marginTop: 10,
    borderRadius: 12,
    border: `1px solid rgba(201,168,76,0.35)`,
    background: "transparent",
    color: MID,
    fontSize: 14,
    cursor: "pointer",
  };

  return (
    <MitraMobileShell
      backgroundImage="/beige_bg.png"
      backTo={wizardBackTarget}
      onBack={step !== "confirmation" ? handleBack : undefined}
      showBack={step !== "confirmation"}
      wideDesktop={
        isDesktop &&
        (step === "moments" || step === "purpose" || step === "suggestion")
      }
    >
      <main style={main}>
        <div style={container}>
          {/* {step !== "confirmation" && <StepDots step={step} />} */}

          {/* ── Step 1: Choose Moments ─────────────────────────────────── */}
          {step === "moments" && (
            <>
              <img
                src="/leaves-bird.png"
                alt=""
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: isDesktop ? -120 : -180,
                  right: isDesktop ? 80 : -22,
                  width: isDesktop ? 320 : 245,
                  pointerEvents: "none",
                  userSelect: "none",
                  opacity: isDesktop ? 0.32 : 0.5,
                }}
              />
              <h2
                style={{
                  fontFamily: SERIF,
                  fontWeight: 700,
                  fontSize: isDesktop ? 54 : 26,
                  color: DARK,
                  margin: isDesktop ? "0 0 14px" : "0 0 8px",
                  textAlign: "center",
                }}
              >
                {t('mitra.rhythmWizard.buildTitle')}
              </h2>
              <p
                style={{
                  color: MID,
                  fontSize: isDesktop ? 22 : 15,
                  marginBottom: isDesktop ? 16 : 10,
                  lineHeight: 1.6,
                  textAlign: "center",
                }}
              >
                {t('mitra.rhythmWizard.whenSupport')}
              </p>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginBottom: isDesktop ? 18 : 10,
                  color: "#E4B44F",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: isDesktop ? 180 : 100,
                    height: 1,
                    background: "rgba(228,180,79,0.4)",
                  }}
                />

                <span
                  style={{
                    fontSize: 13,
                    lineHeight: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✦
                </span>

                <div
                  style={{
                    width: isDesktop ? 180 : 100,
                    height: 1,
                    background: "rgba(228,180,79,0.4)",
                  }}
                />
              </div>

              <div style={{ marginBottom: 24, textAlign: "center" }}>
                <div
                  style={{
                    color: "#8E5D99",
                    fontSize: isDesktop ? 18 : 13,
                    fontWeight: 700,
                    marginBottom: isDesktop ? 8 : 4,
                  }}
                >
                  {t('mitra.rhythmWizard.selectMore')}
                </div>
                <div
                  style={{
                    color: MID,
                    fontSize: isDesktop ? 18 : 13,
                    lineHeight: 1.5,
                  }}
                >
                  {t('mitra.rhythmWizard.chooseMoments')}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isDesktop
                    ? "repeat(3, minmax(0, 1fr))"
                    : "minmax(0, 1fr)",
                  gap: isDesktop ? 24 : 0,
                  alignItems: "stretch",
                  marginBottom: isDesktop ? 18 : 0,
                }}
              >
                {BANDS.map((band) => {
                  const selected = selectedMoments.includes(band);
                  return (
                    <button
                      key={band}
                      onClick={() => toggleMoment(band)}
                      style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: isDesktop ? "column" : "row",
                        alignItems: isDesktop ? "flex-start" : "center",
                        gap: isDesktop ? 18 : 18,
                        padding: isDesktop ? "28px 26px 24px" : "10px",
                        borderRadius: isDesktop ? 30 : 28,
                        marginBottom: isDesktop ? 0 : 16,
                        minHeight: isDesktop ? 320 : undefined,
                        border: `1.5px solid ${selected ? BORDER_ACTIVE : "rgba(201,168,76,0.26)"}`,
                        background: selected ? "rgba(255,251,244,0.98)" : CARD_BG,
                        boxShadow: selected
                          ? "0 22px 42px rgba(222,184,97,0.16)"
                          : "0 12px 28px rgba(67,33,4,0.08)",
                        cursor: "pointer",
                        textAlign: "left",
                        position: "relative",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: isDesktop ? 84 : 45,
                          height: isDesktop ? 84 : 45,
                          borderRadius: "45%",
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
                          src={MOMENT_ART[band]}
                          alt=""
                          aria-hidden="true"
                          style={{
                            width: isDesktop ? 96 : 66,
                            height: isDesktop ? 96 : 66,
                            objectFit: "contain",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          width: "100%",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 16,
                              marginBottom: isDesktop ? 14 : 8,
                            }}
                          >
                            <div
                              style={{
                                fontFamily: SERIF,
                                fontWeight: 700,
                                fontSize: isDesktop ? 28 : 19,
                                color: DARK,
                              }}
                            >
                              {MOMENT_LABEL[band]}
                            </div>
                            {isDesktop && (
                              <div
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 999,
                                  flexShrink: 0,
                                  border: `2px solid ${selected ? GOLD : "rgba(201,168,76,0.4)"}`,
                                  background: "transparent",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {selected && (
                                  <div
                                    style={{
                                      width: 14,
                                      height: 14,
                                      borderRadius: 999,
                                      background: GOLD,
                                    }}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: isDesktop ? 18 : 12,
                              color: "#E4B44F",
                            }}
                          >
                            <div
                              style={{
                                width: isDesktop ? 78 : 56,
                                height: 1,
                                background: "rgba(228,180,79,0.4)",
                              }}
                            />
                            <span style={{ fontSize: 13, lineHeight: 1 }}>✦</span>
                            <div
                              style={{
                                width: isDesktop ? 78 : 56,
                                height: 1,
                                background: "rgba(228,180,79,0.4)",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              fontSize: isDesktop ? 18 : 15,
                              color: MID,
                              lineHeight: 1.5,
                              maxWidth: isDesktop ? 290 : 220,
                            }}
                          >
                            {MOMENT_DESC[band]}
                          </div>
                        </div>
                        {!isDesktop && (
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 999,
                              marginLeft: "auto",
                              flexShrink: 0,
                              border: `2px solid ${selected ? GOLD : "rgba(201,168,76,0.4)"}`,
                              background: "transparent",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {selected && (
                              <div
                                style={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: 999,
                                  background: GOLD,
                                }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={advanceMomentsToPurpose}
                disabled={selectedMoments.length === 0}
                style={{
                  ...goldBtn,
                  marginTop: isDesktop ? 8 : 20,
                  width: isDesktop ? 320 : "100%",
                  alignSelf: "center",
                  display: "block",
                  marginLeft: "auto",
                  marginRight: "auto",
                  opacity: selectedMoments.length === 0 ? 0.45 : 1,
                  cursor:
                    selectedMoments.length === 0 ? "not-allowed" : "pointer",
                  borderRadius: isDesktop ? 16 : 12,
                  boxShadow: "0 16px 34px rgba(222,184,97,0.22)",
                }}
              >
                {t('mitra.rhythmWizard.continueCta')}
              </button>
              <button
                onClick={() => navigate("/en/mitra/rhythm/edit")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#432104",
                  fontSize: 16,
                  cursor: "pointer",
                  marginTop: 14,
                  width: "100%",
                  padding: "8px 0",
                  fontFamily: SERIF,
                  letterSpacing: 0.3,
                }}
              >
                {t('mitra.rhythmWizard.setupMyself')}
              </button>
            </>
          )}

          {/* ── Step 2: Choose Purpose ─────────────────────────────────── */}
          {step === "purpose" && (
            <>
              <img
                src="/leaves-bird.png"
                alt=""
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: isDesktop ? -118 : -168,
                  right: isDesktop ? 72 : -22,
                  width: isDesktop ? 320 : 245,
                  pointerEvents: "none",
                  userSelect: "none",
                  opacity: isDesktop ? 0.32 : 0.5,
                }}
              />
              <h2
                style={{
                  fontFamily: SERIF,
                  fontWeight: 700,
                  fontSize: isDesktop ? 50 : 26,
                  color: DARK,
                  margin: isDesktop ? "0 0 14px" : "0 0 8px",
                  maxWidth: isDesktop ? 640 : 200,
                  textAlign: isDesktop ? "center" : "left",
                  lineHeight: isDesktop ? 1.15 : undefined,
                  marginLeft: isDesktop ? "auto" : undefined,
                  marginRight: isDesktop ? "auto" : undefined,
                }}
              >
                {t('mitra.rhythmWizard.whatGive')}
              </h2>
              <p
                style={{
                  color: MID,
                  fontSize: isDesktop ? 22 : 15,
                  marginBottom: isDesktop ? 42 : 28,
                  lineHeight: 1.6,
                  textAlign: isDesktop ? "center" : "left",
                  maxWidth: isDesktop ? 680 : undefined,
                  marginLeft: isDesktop ? "auto" : undefined,
                  marginRight: isDesktop ? "auto" : undefined,
                }}
              >
                {t('mitra.rhythmWizard.mitraChoose')}
              </p>

              {selectedMoments.map((band) => (
                <div
                  key={band}
                  style={{
                    marginBottom: isDesktop ? 42 : 28,
                    maxWidth: isDesktop ? 1120 : undefined,
                    marginLeft: isDesktop ? "auto" : undefined,
                    marginRight: isDesktop ? "auto" : undefined,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: isDesktop ? 14 : 8,
                      marginBottom: isDesktop ? 20 : 12,
                    }}
                  >
                    <img
                      src={MOMENT_ART[band]}
                      alt=""
                      aria-hidden="true"
                      style={{
                        width: isDesktop ? 76 : 60,
                        height: isDesktop ? 76 : 60,
                        objectFit: "contain",
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        fontFamily: SERIF,
                        fontWeight: 700,
                        fontSize: isDesktop ? 28 : 16,
                        color: DARK,
                      }}
                    >
                      {MOMENT_LABEL[band]}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: 1,
                        background: "rgba(201,168,76,0.22)",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isDesktop
                        ? "repeat(3, minmax(0, 1fr))"
                        : "1fr 1fr",
                      gap: isDesktop ? 16 : 8,
                    }}
                  >
                    {PURPOSE_OPTIONS_T[band].map((opt, idx) => {
                      const sel = purposes[band] === opt.value;
                      const purposeIcon =
                        PURPOSE_ART[band][idx] ?? MOMENT_ART[band];
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setPurpose(band, opt.value)}
                          style={{
                            padding: isDesktop ? "16px 18px" : "14px 12px",
                            borderRadius: isDesktop ? 22 : 16,
                            textAlign: "left",
                            border: `1.5px solid ${sel ? BORDER_ACTIVE : "rgba(201,168,76,0.22)"}`,
                            background: sel
                              ? "rgba(255,251,244,0.98)"
                              : CARD_BG,
                            cursor: "pointer",
                            minHeight: isDesktop ? 112 : 92,
                            boxShadow: sel
                              ? "0 12px 24px rgba(222,184,97,0.14)"
                              : "0 6px 18px rgba(67,33,4,0.05)",
                            display: "flex",
                            alignItems: "flex-start",
                            gap: isDesktop ? 14 : 10,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={purposeIcon}
                              alt=""
                              aria-hidden="true"
                              style={{
                                width: isDesktop ? 54 : 42,
                                height: isDesktop ? 54 : 42,
                                objectFit: "contain",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              flex: 1,
                            }}
                          >
                            <div
                              style={{
                                fontFamily: SERIF,
                                fontWeight: 600,
                                fontSize: isDesktop ? 18 : 13,
                                color: DARK,
                                marginBottom: isDesktop ? 8 : 4,
                                lineHeight: 1.2,
                              }}
                            >
                              {opt.label}
                            </div>
                            <div
                              style={{
                                fontSize: isDesktop ? 15 : 12,
                                color: LIGHT,
                                fontWeight: 600,
                                lineHeight: isDesktop ? 1.45 : undefined,
                              }}
                            >
                              {opt.desc}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {(() => {
                const allSelected = selectedMoments.every((b) => purposes[b]);
                return (
                  <button
                    onClick={advancePurposeToSuggestion}
                    disabled={!allSelected}
                    style={{
                      ...goldBtn,
                      width: isDesktop ? 360 : "100%",
                      display: "block",
                      marginLeft: "auto",
                      marginRight: "auto",
                      borderRadius: isDesktop ? 16 : 11,
                      opacity: allSelected ? 1 : 0.45,
                      cursor: allSelected ? "pointer" : "not-allowed",
                    }}
                  >
                    {t('mitra.rhythmWizard.seeSuggestion')}
                  </button>
                );
              })()}
            </>
          )}

          {/* ── Step 3: Mitra Suggests ─────────────────────────────────── */}
          {step === "suggestion" &&
            (() => {
              const missingSlots = getMissingSuggestionSlots(
                selectedMoments,
                items,
              );
              const acceptDisabled =
                suggestLoading || saving || missingSlots.length > 0;
              return (
                <>
                  <img
                    src="/leaves-bird.png"
                    alt=""
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: isDesktop ? -120 : -180,
                      right: isDesktop ? 72 : -22,
                      width: isDesktop ? 320 : 245,
                      pointerEvents: "none",
                      userSelect: "none",
                      opacity: isDesktop ? 0.32 : 0.5,
                    }}
                  />
                  <h2
                    style={{
                      fontFamily: SERIF,
                      fontWeight: 700,
                      fontSize: isDesktop ? 50 : 26,
                      color: DARK,
                      margin: isDesktop ? "0 0 14px" : "0 0 8px",
                      textAlign: isDesktop ? "center" : "left",
                      maxWidth: isDesktop ? 720 : undefined,
                      marginLeft: isDesktop ? "auto" : undefined,
                      marginRight: isDesktop ? "auto" : undefined,
                    }}
                  >
                    {isEditMode
                      ? t('mitra.rhythmWizard.yourRhythm')
                      : t('mitra.rhythmWizard.mitraSuggests')}
                  </h2>
                  <p
                    style={{
                      color: MID,
                      fontSize: isDesktop ? 22 : 15,
                      marginBottom: isDesktop ? 40 : 28,
                      lineHeight: 1.6,
                      textAlign: isDesktop ? "center" : "left",
                      maxWidth: isDesktop ? 820 : undefined,
                      marginLeft: isDesktop ? "auto" : undefined,
                      marginRight: isDesktop ? "auto" : undefined,
                    }}
                  >
                    {isEditMode
                      ? t('mitra.rhythmWizard.changeAny')
                      : t('mitra.rhythmWizard.eachFits')}
                  </p>

                  {suggestLoading && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "32px 0",
                        color: MID,
                        fontSize: 15,
                      }}
                    >
                      {RHYTHM_SUGGEST_COPY.loading}
                    </div>
                  )}

                  {!suggestLoading && suggestError && (
                    <div style={{ textAlign: "center", padding: "16px 0" }}>
                      <p
                        style={{
                          color: "#c0345b",
                          fontSize: 14,
                          marginBottom: 12,
                        }}
                      >
                        {suggestError}
                      </p>
                      <button
                        onClick={() => {
                          setSuggestionsLoaded(false);
                          setItems({});
                        }}
                        style={{
                          ...goldBtn,
                          display: "inline-block",
                          width: "auto",
                          padding: "8px 20px",
                          marginBottom: 8,
                        }}
                      >
                        {RHYTHM_SUGGEST_COPY.tryAgain}
                      </button>
                      <button
                        onClick={() => navigate("/en/mitra/rhythm/edit")}
                        style={ghostBtn}
                      >
                        {RHYTHM_SUGGEST_COPY.chooseFromLibrary}
                      </button>
                    </div>
                  )}

                  {!suggestLoading &&
                    (isDesktop ? (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            selectedMoments.length === 1
                              ? "minmax(360px, 920px)"
                              : "repeat(auto-fit, minmax(360px, 520px))",
                          justifyContent: "center",
                          gap: 24,
                          maxWidth: 1180,
                          margin: "0 auto",
                        }}
                      >
                        {selectedMoments.map((band) => {
                          const item = items[band];
                          if (!item) {
                            return (
                              <div
                                key={band}
                                style={{
                                  border: "1px solid rgba(201,100,76,0.3)",
                                  borderRadius: 18,
                                  background: "rgba(255,245,245,0.9)",
                                  padding: "18px 22px",
                                }}
                              >
                                <p
                                  style={{
                                    color: "#9b4e4e",
                                    fontSize: 14,
                                    margin: "0 0 10px",
                                  }}
                                >
                                  Mitra could not suggest a{" "}
                                  {MOMENT_LABEL[band].toLowerCase()} practice.
                                </p>
                                <button
                                  onClick={() => setPickerBand(band)}
                                  style={{
                                    background: "none",
                                    border: `1px solid rgba(201,168,76,0.4)`,
                                    color: GOLD,
                                    borderRadius: 10,
                                    padding: "7px 12px",
                                    fontSize: 13,
                                    cursor: "pointer",
                                  }}
                                >
                                  {RHYTHM_SUGGEST_COPY.chooseFromLibrary}
                                </button>
                              </div>
                            );
                          }

                          const helperText = item.why_this || item.description_snapshot;

                          return (
                            <div
                              key={band}
                              style={{
                                width: "100%",
                                maxWidth:
                                  selectedMoments.length === 1 ? 920 : 520,
                                border: `1.5px solid ${BORDER}`,
                                borderRadius: 28,
                                background: "rgba(255,251,244,0.96)",
                                padding: "24px 24px 22px",
                                boxShadow: "0 18px 36px rgba(67,33,4,0.06)",
                                display: "grid",
                                gap: 18,
                                minHeight: 320,
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 12,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    letterSpacing: 2,
                                    color: "#8B6914",
                                    textTransform: "uppercase",
                                    background:
                                      "linear-gradient(180deg, #F8F0D8 0%, #FDF8EC 100%)",
                                    borderRadius: 999,
                                    padding: "8px 14px",
                                  }}
                                >
                                  {itemTypeLabel(item.item_type)}
                                </span>
                                <span style={{ fontSize: 16, color: LIGHT }}>
                                  {MOMENT_LABEL[band]}
                                </span>
                                <button
                                  onClick={() => setPickerBand(band)}
                                  style={{
                                    background: "none",
                                    border: `1px solid rgba(201,168,76,0.4)`,
                                    color: GOLD,
                                    borderRadius: 999,
                                    padding: "10px 16px",
                                    fontSize: 15,
                                    cursor: "pointer",
                                    whiteSpace: "nowrap",
                                    marginLeft: "auto",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                  }}
                                >
                                  <Pencil size={14} strokeWidth={1.8} />
                                  {t('mitra.rhythmWizard.change')}
                                </button>
                              </div>

                              <div
                                style={{
                                  fontFamily: SERIF,
                                  fontWeight: 700,
                                  fontSize: 22,
                                  color: DARK,
                                  lineHeight: 1.45,
                                }}
                              >
                                {item.title_snapshot}
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  color: "#E4B44F",
                                }}
                              >
                                <div
                                  style={{
                                    width: 96,
                                    height: 1,
                                    background: "rgba(228,180,79,0.4)",
                                  }}
                                />
                                <span style={{ fontSize: 13, lineHeight: 1 }}>✦</span>
                                <div
                                  style={{
                                    width: 96,
                                    height: 1,
                                    background: "rgba(228,180,79,0.4)",
                                  }}
                                />
                              </div>

                              {helperText && (
                                <div
                                  style={{
                                    fontSize: 17,
                                    color: "#8B6914",
                                    lineHeight: 1.6,
                                    fontStyle: "italic",
                                  }}
                                >
                                  {helperText}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      selectedMoments.map((band) => {
                        const item = items[band];
                        if (!item) {
                          return (
                            <div
                              key={band}
                              style={{
                                border: "1px solid rgba(201,100,76,0.3)",
                                borderRadius: 12,
                                background: "rgba(255,245,245,0.9)",
                                padding: "14px 18px",
                                marginBottom: 14,
                              }}
                            >
                              <p
                                style={{
                                  color: "#9b4e4e",
                                  fontSize: 14,
                                  margin: "0 0 10px",
                                }}
                              >
                                Mitra could not suggest a{" "}
                                {MOMENT_LABEL[band].toLowerCase()} practice.
                              </p>
                              <button
                                onClick={() => setPickerBand(band)}
                                style={{
                                  background: "none",
                                  border: `1px solid rgba(201,168,76,0.4)`,
                                  color: GOLD,
                                  borderRadius: 8,
                                  padding: "5px 10px",
                                  fontSize: 13,
                                  cursor: "pointer",
                                }}
                              >
                                {RHYTHM_SUGGEST_COPY.chooseFromLibrary}
                              </button>
                            </div>
                          );
                        }
                        return (
                          <div
                            key={band}
                            style={{
                              border: `1.5px solid ${BORDER}`,
                              borderRadius: 26,
                              background: "rgba(255,251,244,0.95)",
                              padding: "15px",
                              marginBottom: 18,
                              boxShadow: "0 14px 32px rgba(67,33,4,0.06)",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                marginBottom: 18,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  letterSpacing: 2,
                                  color: "#8B6914",
                                  textTransform: "uppercase",
                                  background:
                                    "linear-gradient(180deg, #F8F0D8 0%, #FDF8EC 100%)",
                                  borderRadius: 10,
                                  padding: "6px 12px",
                                }}
                              >
                                {itemTypeLabel(item.item_type)}
                              </span>
                              <span style={{ fontSize: 13, color: LIGHT }}>
                                {MOMENT_LABEL[band]}
                              </span>
                              <button
                                onClick={() => setPickerBand(band)}
                                style={{
                                  background: "none",
                                  border: `1px solid rgba(201,168,76,0.4)`,
                                  color: GOLD,
                                  borderRadius: 16,
                                  padding: "10px 18px",
                                  fontSize: 13,
                                  cursor: "pointer",
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                  minWidth: 106,
                                  marginLeft: "auto",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 8,
                                }}
                              >
                                <Pencil size={14} strokeWidth={1.8} />
                                {t('mitra.rhythmWizard.change')}
                              </button>
                            </div>
                            <div
                              style={{
                                fontFamily: SERIF,
                                fontWeight: 700,
                                fontSize: 18,
                                color: DARK,
                                marginBottom: 14,
                                lineHeight: 1.45,
                              }}
                            >
                              {item.title_snapshot}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 14,
                                color: "#E4B44F",
                              }}
                            >
                              <div
                                style={{
                                  width: 86,
                                  height: 1,
                                  background: "rgba(228,180,79,0.4)",
                                }}
                              />
                              <span style={{ fontSize: 13, lineHeight: 1 }}>
                                ✦
                              </span>
                              <div
                                style={{
                                  width: 118,
                                  height: 1,
                                  background: "rgba(228,180,79,0.4)",
                                }}
                              />
                            </div>
                            {item.why_this && (
                              <div
                                style={{
                                  fontSize: 14,
                                  color: "#8B6914",
                                  lineHeight: 1.6,
                                  fontStyle: "italic",
                                }}
                              >
                                {item.why_this}
                              </div>
                            )}
                            {!item.why_this && item.description_snapshot && (
                              <div
                                style={{
                                  fontSize: 14,
                                  color: "#8B6914",
                                  lineHeight: 1.6,
                                  fontStyle: "italic",
                                }}
                              >
                                {item.description_snapshot}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ))}

                  {error && (
                    <p
                      style={{
                        color: "#e06060",
                        fontSize: 14,
                        textAlign: "center",
                      }}
                    >
                      {error}
                    </p>
                  )}

                  <button
                    onClick={() => {
                      setBandTimes((prev) => {
                        const next = { ...prev };
                        selectedMoments.forEach((band) => {
                          if (!next[band])
                            next[band] = BAND_REMINDER_DEFAULTS[band];
                        });
                        return next;
                      });
                      setStep("reminders");
                    }}
                    style={{
                      ...goldBtn,
                      marginTop: isDesktop ? 10 : 20,
                      width: isDesktop ? 320 : "100%",
                      display: "block",
                      marginLeft: "auto",
                      marginRight: "auto",
                      opacity: acceptDisabled ? 0.45 : 1,
                      cursor: acceptDisabled ? "not-allowed" : "pointer",

                      borderRadius: isDesktop ? 16 : 11,
                      boxShadow: "0 16px 34px rgba(222,184,97,0.22)",
                    }}
                    disabled={acceptDisabled}
                  >
                    {t('mitra.rhythmWizard.acceptRhythm')}
                  </button>
                  {!isEditMode && (
                    <button
                      onClick={() => navigate("/en/mitra/rhythm/edit")}
                      style={{
                        ...ghostBtn,
                        width: isDesktop ? 320 : "100%",
                        display: "block",
                        marginLeft: "auto",
                        marginRight: "auto",
                        marginTop: 18,

                        borderRadius: 11,
                        border: "1.5px solid rgba(201,168,76,0.45)",
                        background: "rgba(255,251,244,0.72)",
                        fontFamily: SERIF,
                        fontSize: 18,
                        color: "#8B6914",
                      }}
                    >
                      {t('mitra.rhythmWizard.chooseOwn')}
                    </button>
                  )}
                </>
              );
            })()}

          {/* ── Step 4: Reminders ──────────────────────────────────────── */}
          {step === "reminders" && (
            <>
              <h2
                style={{
                  fontFamily: SERIF,
                  fontWeight: 700,
                  fontSize: 26,
                  color: DARK,
                  margin: "0 0 8px",
                }}
              >
                {t('mitra.rhythmWizard.gentleReminder')}
              </h2>
              <p
                style={{
                  color: MID,
                  fontSize: 15,
                  marginBottom: 28,
                  lineHeight: 1.6,
                }}
              >
                Mitra can remind you when each moment arrives.
              </p>

              <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                {(
                  [
                    { label: t('mitra.rhythmWizard.remindYes'), value: "yes" as const },
                    { label: t('mitra.rhythmWizard.remindNo'), value: "no" as const },
                    { label: t('mitra.rhythmWizard.remindLater'), value: "later" as const },
                  ] satisfies { label: string; value: "yes" | "no" | "later" }[]
                ).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setReminderPref(opt.value)}
                    style={{
                      flex: 1,
                      padding: "10px 4px",
                      borderRadius: 20,
                      fontSize: 13,
                      fontWeight: 900,
                      fontFamily: SERIF,
                      cursor: "pointer",
                      border: `1px solid ${reminderPref === opt.value ? GOLD : "rgba(201,168,76,0.4)"}`,
                      background:
                        reminderPref === opt.value ? GOLD : "transparent",
                      color: reminderPref === opt.value ? "#fff" : MID,
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {reminderPref === "yes" &&
                BANDS.filter((b) => items[b]).map((band) => (
                  <div
                    key={band}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 12,
                      padding: "12px 16px",
                      background: "rgba(201,168,76,0.06)",
                      borderRadius: 12,
                      border: `1px solid rgba(201,168,76,0.2)`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: SERIF,
                        fontSize: 14,
                        color: DARK,
                        flex: 1,
                      }}
                    >
                      {MOMENT_LABEL[band]}
                    </span>
                    <input
                      type="time"
                      value={bandTimes[band] ?? ""}
                      onChange={(e) =>
                        setBandTimes((prev) => ({
                          ...prev,
                          [band]: e.target.value || undefined,
                        }))
                      }
                      style={{
                        border: `1px solid rgba(201,168,76,0.3)`,
                        borderRadius: 8,
                        padding: "4px 8px",
                        fontSize: 13,
                        color: DARK,
                        background: "#fff",
                        outline: "none",
                      }}
                    />
                  </div>
                ))}

              {error && (
                <p
                  style={{
                    color: "#e06060",
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
                  {error}
                </p>
              )}

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
                {saving ? t('mitra.rhythmWizard.savingRhythm') : t('mitra.rhythmWizard.saveRhythm')}
              </button>
            </>
          )}

          {/* ── Step 5: Confirmation ───────────────────────────────────── */}
          {step === "confirmation" && (
            <>
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
              <div style={{ textAlign: "center", marginBottom: 32 }}>
                <div
                  style={{ fontSize: 36, marginBottom: 12, color: "#D4A017" }}
                >
                  ✦
                </div>
                <h2
                  style={{
                    fontFamily: SERIF,
                    fontWeight: 700,
                    fontSize: 26,
                    color: DARK,
                    margin: "0 0 8px",
                  }}
                >
                  {t('mitra.rhythmWizard.companionReady')}
                </h2>
                <p style={{ color: MID, fontSize: 15, lineHeight: 1.6 }}>
                  {t('mitra.rhythmWizard.eachMoment')}
                </p>
              </div>

              {BANDS.filter((b) => items[b]).map((band) => {
                const item = items[band]!;
                return (
                  <div
                    key={band}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "stretch",
                      gap: 16,
                      padding: "14px 18px",
                      borderRadius: 14,
                      marginBottom: 10,
                      border: `1px solid ${BORDER}`,
                      background: CARD_BG,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#D4A017",
                            marginBottom: 2,
                            textTransform: "uppercase",
                            fontWeight: 700,
                          }}
                        >
                          {MOMENT_LABEL[band]}
                        </div>
                        <div
                          style={{
                            fontFamily: SERIF,
                            fontWeight: 700,
                            fontSize: 15,
                            color: DARK,
                            lineHeight: 1.45,
                          }}
                        >
                          {item.title_snapshot}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: 1.2,
                          color: "#8B6914",
                          textTransform: "uppercase",
                          background: "#F5F0E0",
                          borderRadius: 6,
                          padding: "8px 8px",
                          flexShrink: 0,
                        }}
                      >
                        {itemTypeLabel(item.item_type)}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        beginRhythmItem(band, {
                          item_id: item.item_id,
                          item_type: item.item_type,
                          title_snapshot: item.title_snapshot,
                          description_snapshot: item.description_snapshot,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: 11,
                        border: "none",
                        background: GOLD_BTN,
                        color: "#fff",
                        fontFamily: SERIF,
                        fontSize: 18,
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {beginLabel(item.item_type)}
                    </button>
                  </div>
                );
              })}
              <button onClick={() => navigate("/en/mitra")} style={ghostBtn}>
                {t('mitra.rhythmWizard.returnHome')}
              </button>
              {!hasActiveInnerPath && (
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <button
                    onClick={() => navigate("/en/mitra/inner-path")}
                    style={{
                      background: "none",
                      border: "none",
                      color: LIGHT,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    {t('mitra.rhythmWizard.addInnerPath')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Library picker for item replacement */}
      {pickerBand && (
        <RhythmLibraryPickerModal
          band={pickerBand}
          onPick={(picked) => {
            replaceItem(pickerBand, { ...picked, reminder_time: null });
            setPickerBand(null);
          }}
          onClose={() => setPickerBand(null)}
          nextSortOrder={0}
        />
      )}
    </MitraMobileShell>
  );
}
